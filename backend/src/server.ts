import http from 'http';
import app from './index';
import { logger } from './config/logger';
import { env } from './config/env';

const server = http.createServer(app);

// Optional: WebSocket / Socket.IO (requires socket.io to be installed)
try {
  const { SocketService } = require('./sockets');
  const socketService = new SocketService(server);
  app.locals.socketService = socketService;
  logger.info('✅ WebSocket service initialised');
} catch (err: any) {
  logger.warn(`⚠️  WebSocket service skipped: ${err.message}`);
}

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`🌐 Frontend: http://localhost:${PORT}`);
  logger.info(`🔌 API:      http://localhost:${PORT}/api/v1`);
  logger.info(`❤️  Health:  http://localhost:${PORT}/health`);
});

process.on('unhandledRejection', (err: any) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});
