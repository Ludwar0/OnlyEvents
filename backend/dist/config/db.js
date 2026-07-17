"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("./logger");
exports.prisma = new client_1.PrismaClient({
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
    ],
});
exports.prisma.$on('query', (e) => {
    if (process.env.NODE_ENV === 'development') {
        logger_1.logger.debug(`Query: ${e.query}`);
        logger_1.logger.debug(`Params: ${e.params}`);
        logger_1.logger.debug(`Duration: ${e.duration}ms`);
    }
});
const connectDB = async () => {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('📦 Connected to PostgreSQL database');
    }
    catch (error) {
        logger_1.logger.error('❌ Failed to connect to database', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
