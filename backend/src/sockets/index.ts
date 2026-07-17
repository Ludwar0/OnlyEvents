// @ts-nocheck – socket.io types not installed; suppress TS errors for optional sockets module
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class SocketService {
  private io: SocketIOServer;

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupListeners();
  }

  private setupMiddleware() {
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        (socket as any).userId = decoded.id;
        (socket as any).role = decoded.role;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupListeners() {
    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      const role = (socket as any).role;
      logger.info(`🔌 Socket connected: User ${userId} [${role}]`);

      // Join personal room for private notifications
      socket.join(`user:${userId}`);

      if (role === 'ADMIN') {
        socket.join('admin_room');
      }

      socket.on('disconnect', () => {
        logger.info(`🔌 Socket disconnected: User ${userId}`);
      });
    });
  }

  // Public methods to emit events from controllers
  public notifyUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public notifyAdmins(event: string, data: any) {
    this.io.to('admin_room').emit(event, data);
  }
}
