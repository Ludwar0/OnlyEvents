import app, { connectDB, logger } from './index';
import http from 'http';
import { SocketService } from './sockets';
import { env } from './config/env';
import { startCronJobs } from './jobs';

const server = http.createServer(app);

// Initialize WebSockets
const socketService = new SocketService(server);

// Make socketService available to controllers if needed via app locals
app.locals.socketService = socketService;

const PORT = env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startCronJobs();
    
    server.listen(PORT, () => {
      logger.info(`🚀 HTTP and WebSocket Server running in ${env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (err: any) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

