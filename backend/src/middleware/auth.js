const jwt = require('jsonwebtoken');
require('dotenv').config();

// SECURITY: Never fall back to a hardcoded secret. A publicly-known secret would
// allow anyone to forge valid JWTs (full authentication bypass). Fail fast at
// startup instead of running in a degraded/insecure state.
const PLACEHOLDER_SECRETS = new Set([
  'fallback_secret_key_123',
  'your_jwt_secret_key_here',
  'change_me',
  'changeme',
  'secret',
  ''
]);

const _rawSecret = (process.env.JWT_SECRET || '').trim();
if (!process.env.JWT_SECRET || PLACEHOLDER_SECRETS.has(_rawSecret) || _rawSecret.length < 32) {
  throw new Error(
    'FATAL: JWT_SECRET is missing, is a known placeholder, or is shorter than 32 characters. ' +
    'Set a strong (>=64 char) random value in your .env before starting the server.'
  );
}
const JWT_SECRET = _rawSecret;

// Single source of truth for privileged roles accepted by admin endpoints.
const ADMIN_ROLES = Object.freeze(['administrador', 'ingeniero_software']);

// Safely normalize string to UTF-8 using Latin1 to UTF-8 decoding to fix Mojibake
function normalizeToUtf8(str) {
  if (!str || typeof str !== 'string') return str;
  try {
    const latin1Buffer = Buffer.from(str, 'latin1');
    const utf8Decoded = latin1Buffer.toString('utf8');
    if (!utf8Decoded.includes('\uFFFD') && utf8Decoded !== str) {
      return utf8Decoded;
    }
  } catch (e) {}
  return str;
}

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // Only accept the "Bearer <token>" scheme. Reject raw tokens or other schemes
  // to avoid auth-bypass tricks where a token is also mirrored in req.query.
  const token = authHeader && /^Bearer\s+.+$/i.test(authHeader) ? authHeader.split(/\s+/)[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Acceso denegado. Token no proporcionado.' } });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Use 401 for invalid/expired credentials (not 403) per RFC 7235.
      return res.status(401).json({ success: false, error: { code: 'AUTH_INVALID', message: 'Token inválido o expirado.' } });
    }
    if (user && user.nombre_completo) {
      user.nombre_completo = normalizeToUtf8(user.nombre_completo);
    }
    req.user = user;
    next();
  });
}

// Middleware to require an admin-level role (administrador or ingeniero_software)
function requireAdmin(req, res, next) {
  if (!req.user || !ADMIN_ROLES.includes(req.user.rol)) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado. Se requiere rol de Administrador.' } });
  }
  next();
}

// Generic role-gate middleware factory. Use: requireRole('administrador') or
// requireRole('administrador', 'ingeniero_software'). Consolidates the ad-hoc
// inline role checks that were previously duplicated across route files.
function requireRole(...roles) {
  const allowed = new Set(roles.flatMap((r) => (Array.isArray(r) ? r : [r])));
  return function (req, res, next) {
    if (!req.user || !allowed.has(req.user.rol)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Acceso denegado. Rol insuficiente.' } });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireRole,
  signToken,
  normalizeToUtf8,
  ADMIN_ROLES
  // NOTE: JWT_SECRET is intentionally NOT exported. Modules should never sign
  // tokens outside of authController; exposing the secret widens the attack
  // surface. Token issuance is centralized via signToken() below.
};

// Centralized token issuer. Keeps the secret private to this module.
function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h', ...options });
}
