import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(rateLimiter);

// Stripe Webhook (must be before express.json)
app.use('/api/v1/webhooks', webhookRoutes);

// Core Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression() as any);

// Serve static frontend files — works for both ts-node (src/) and compiled (dist/)
const frontendPath = path.join(__dirname, '..', '..', '..'); // points to only-events root
app.use(express.static(frontendPath));

// Health Check Endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// API Routes
app.use('/api/v1', routes);

// Catch-all: serve index.html for non-API requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next(err);
  });
});

// Error Handling
app.use(errorHandler);

// Connect to database on startup (called by server.ts which handles listen)
connectDB().catch((err) => {
  logger.error('Failed to connect to database:', err);
  process.exit(1);
});

export default app;
