import { readSession } from '../_session.js';

const githubRequest = (path, session, init = {}) => fetch(`https://api.github.com${path}`, {
  ...init,
  headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${session.token}`, 'User-Agent': 'kvpll-profile', ...init.headers }
});

export async function onRequest({ request, env }) {
  const session = await readSession(request, env.SESSION_SECRET);
  if (!session) return new Response('Unauthorized.', { status: 401 });
  const repo = `${env.GITHUB_REPO_OWNER}/${env.GITHUB_REPO_NAME}`;
  const path = `repos/${repo}/contents/index.html`;
  if (request.method === 'GET') {
    const response = await githubRequest(`/${path}`, session);
    const file = await response.json();
    if (!file.content) return new Response('Could not load site source.', { status: 502 });
    return new Response(atob(file.content.replace(/\n/g, '')), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  if (request.method === 'PUT') {
    const existingResponse = await githubRequest(`/${path}`, session);
    const existing = await existingResponse.json();
    const content = btoa(unescape(encodeURIComponent(await request.text())));
    const updateResponse = await githubRequest(`/${path}`, session, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Update site from owner editor', content, sha: existing.sha }) });
    return new Response(updateResponse.ok ? 'Saved.' : 'GitHub update failed.', { status: updateResponse.ok ? 200 : 502 });
  }
  return new Response('Method not allowed.', { status: 405 });
}