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
const frontendRoot = path.resolve(__dirname, '../../');

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: true,
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
app.use(compression());

// Serve the workspace frontend from the repository root so the site can run locally
app.use(express.static(frontendRoot));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// API Routes
app.use('/api/v1', routes);

// Catch-all route to serve the SPA (skip API paths)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

// Error Handling
app.use(errorHandler);

// Export app (server.ts handles listen)
export { connectDB, logger };
export default app;
