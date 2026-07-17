"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importStar(require("./index"));
const http_1 = __importDefault(require("http"));
const sockets_1 = require("./sockets");
const env_1 = require("./config/env");
const jobs_1 = require("./jobs");
const server = http_1.default.createServer(index_1.default);
// Initialize WebSockets
const socketService = new sockets_1.SocketService(server);
// Make socketService available to controllers if needed via app locals
index_1.default.locals.socketService = socketService;
const PORT = env_1.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, index_1.connectDB)();
        (0, jobs_1.startCronJobs)();
        server.listen(PORT, () => {
            index_1.logger.info(`🚀 HTTP and WebSocket Server running in ${env_1.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    }
    catch (error) {
        index_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
process.on('unhandledRejection', (err) => {
    index_1.logger.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});
