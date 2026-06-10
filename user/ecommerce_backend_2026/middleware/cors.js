const cors = require('cors');

const allowedOrigins = [process.env.CLIENT_URL, process.env.CORS_ORIGINS]
  .filter(Boolean)
  .join(',')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOriginSet = new Set(allowedOrigins);

const isPrivateIpv4 = (hostname) =>
  /^10\./.test(hostname) ||
  /^192\.168\./.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

const isDevHost = (hostname) =>
  hostname === 'localhost' || hostname === '127.0.0.1' || isPrivateIpv4(hostname);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOriginSet.has(origin)) return true;

  try {
    const url = new URL(origin);
    if (process.env.NODE_ENV !== 'production' && isDevHost(url.hostname)) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

const corsMiddleware = cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn('[CORS] Blocked origin:', origin);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

module.exports = { corsMiddleware, allowedOriginSet };
