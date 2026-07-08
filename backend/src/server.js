const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./repositories/dbRepository');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const publicRoutes = require('./routes/publicRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Security hardening ---
// Trust the first proxy hop so req.ip / rate limiters read X-Forwarded-For
// correctly when deployed behind nginx/Heroku/AWS ALB. Set to the number of
// intermediary proxies in production (default 1 is correct for a single LB).
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));

// CORS origin allowlist. NEVER use a wide-open cors() in production: it would
// allow any website to issue authenticated cross-origin requests against the
// API. Allowed origins are configured via ALLOWED_ORIGINS (comma-separated).
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const corsOptions = {
  origin(origin, cb) {
    // Allow same-origin / server-to-server / curl (no Origin header) requests.
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  maxAge: 600
};
app.use(cors(corsOptions));

// Cap request body size to mitigate large-payload DoS. 1 MB is plenty for all
// current payloads (largest is the create-course body with a cert template).
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Basic security headers (manual minimal set; no helmet dependency).
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Force UTF-8 encoding header for all API responses except binary downloads
app.use((req, res, next) => {
  if (!req.path.includes('/certificate/download')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

// --- Register Routers ---
app.use('/api/auth', authRoutes);
app.use('/api', publicRoutes);     // Public routes FIRST (no auth middleware)
app.use('/api/admin', adminRoutes);
app.use('/api', studentRoutes);    // Authenticated routes after public

// Root Status check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

// 404 handler for unmatched routes (must be before the error handler).
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Ruta no encontrada: ${req.method} ${req.path}` } });
});

// --- Centralized Error Handler ---
app.use(errorHandler);

// Initialize database and start server
db.initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
