import { createSession, readCookie } from '../../_session.js';

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const savedState = readCookie(request, 'kvpll_oauth_state');
  if (!code) return new Response('Missing OAuth code.', { status: 400 });
  if (!state || !savedState || state !== savedState) return new Response('Invalid OAuth state.', { status: 403 });

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code })
  });
  const token = await tokenResponse.json();
  if (!token.access_token) return new Response('GitHub login failed.', { status: 401 });

  const userResponse = await fetch('https://api.github.com/user', { headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.access_token}`, 'User-Agent': 'kvpll-profile' } });
  const user = await userResponse.json();
  if (user.login !== 'BreezyFN420') return new Response('This account is not authorized.', { status: 403 });

  const session = await createSession(token.access_token, env.SESSION_SECRET);
  const headers = new Headers({ Location: '/' });
  headers.append('Set-Cookie', `kvpll_session=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`);
  headers.append('Set-Cookie', 'kvpll_oauth_state=; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return new Response(null, { status: 302, headers });
}