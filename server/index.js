import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import urlRoutes from './routes/url.js';
import historyRoutes from './routes/history.js';
import redirectRoutes from './routes/redirect.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0'); // Use CSP instead
  next();
});

// CORS configuration
const parseOrigins = (...values) =>
  values
    .flatMap((value) => (value || '').split(','))
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([
    ...parseOrigins(process.env.CORS_ORIGIN, process.env.FRONTEND_URL),
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ])
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalized)) return callback(null, true);
      if (process.env.CORS_ORIGIN === '*') return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Lightweight health checks for Render/load balancers (no DB dependency)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Apply rate limiting
app.use(limiter);

// Body parser
app.use(express.json());

// API routes with stricter limit on shorten
app.use('/api', urlRoutes);
app.use('/api', historyRoutes);

// Short link redirect route
app.use('/', redirectRoutes);

// 404 for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
