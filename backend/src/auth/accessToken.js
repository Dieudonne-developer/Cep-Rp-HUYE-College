const crypto = require('crypto');

function secret() {
  return process.env.APP_SESSION_SECRET || process.env.DATABASE_URL || 'cep-huye-session';
}

function signAccessToken(email) {
  const body = Buffer.from(JSON.stringify({
    email: String(email || '').trim().toLowerCase(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function readAccessToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.email || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = { signAccessToken, readAccessToken };
