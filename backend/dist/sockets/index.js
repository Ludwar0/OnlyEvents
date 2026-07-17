"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
// @ts-nocheck – socket.io types not installed; suppress TS errors for optional sockets module
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
class SocketService {
    io;
    constructor(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: env_1.env.FRONTEND_URL,
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        this.setupMiddleware();
        this.setupListeners();
    }
    setupMiddleware() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token)
                return next(new Error('Authentication error'));
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                socket.userId = decoded.id;
                socket.role = decoded.role;
                next();
            }
            catch (err) {
                next(new Error('Authentication error'));
            }
        });
    }
    setupListeners() {
        this.io.on('connection', (socket) => {
            const userId = socket.userId;
            const role = socket.role;
            logger_1.logger.info(`🔌 Socket connected: User ${userId} [${role}]`);
            // Join personal room for private notifications
            socket.join(`user:${userId}`);
            if (role === 'ADMIN') {
                socket.join('admin_room');
            }
            socket.on('disconnect', () => {
                logger_1.logger.info(`🔌 Socket disconnected: User ${userId}`);
            });
        });
    }
    // Public methods to emit events from controllers
    notifyUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    notifyAdmins(event, data) {
        this.io.to('admin_room').emit(event, data);
    }
}
exports.SocketService = SocketService;
