const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const neonAuthBaseUrl = process.env.NEON_AUTH_BASE_URL || null;
const neonAuthJwksUrl = process.env.NEON_AUTH_JWKS_URL || null;

function getNeonAuthConfig() {
  return {
    baseUrl: neonAuthBaseUrl,
    jwksUrl: neonAuthJwksUrl,
    configured: Boolean(neonAuthBaseUrl && neonAuthJwksUrl),
  };
}

async function checkNeonAuthHealth() {
  const config = getNeonAuthConfig();
  if (!config.configured) {
    return { ok: false, error: 'NEON_AUTH_BASE_URL / NEON_AUTH_JWKS_URL not set' };
  }

  try {
    const response = await fetch(config.jwksUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      return { ok: false, status: response.status, error: `JWKS HTTP ${response.status}` };
    }
    const body = await response.json();
    const keyCount = Array.isArray(body.keys) ? body.keys.length : 0;
    return {
      ok: true,
      baseUrl: config.baseUrl,
      jwksUrl: config.jwksUrl,
      keyCount,
    };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

module.exports = {
  getNeonAuthConfig,
  checkNeonAuthHealth,
};
