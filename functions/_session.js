const toBase64Url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (value) => atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));

const sign = async (value, secret) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
  return { key, signature: toBase64Url(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))) };
};

export const readCookie = (request, name) => {
  const match = (request.headers.get('Cookie') || '').match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const createSession = async (token, secret) => {
  const payload = btoa(JSON.stringify({ token, exp: Date.now() + 86400000 }));
  const { signature } = await sign(payload, secret);
  return `${payload}.${signature}`;
};

export const readSession = async (request, secret) => {
  const value = readCookie(request, 'kvpll_session');
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  try {
    const { key } = await sign(payload, secret);
    const valid = await crypto.subtle.verify('HMAC', key, Uint8Array.from(fromBase64Url(signature), (char) => char.charCodeAt(0)), new TextEncoder().encode(payload));
    if (!valid) return null;
    const session = JSON.parse(atob(payload));
    return session.exp > Date.now() ? session : null;
  } catch {
    return null;
  }
};