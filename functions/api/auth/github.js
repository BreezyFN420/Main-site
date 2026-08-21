export async function onRequestGet({ env }) {
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_REDIRECT_URI,
    scope: 'read:user repo',
    state
  });
  return new Response(null, { status: 302, headers: { Location: `https://github.com/login/oauth/authorize?${params}`, 'Set-Cookie': `kvpll_oauth_state=${state}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}