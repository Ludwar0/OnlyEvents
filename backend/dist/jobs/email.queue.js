"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailWorker = exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const email_service_1 = require("../services/email.service");
const logger_1 = require("../config/logger");
const connection = env_1.env.REDIS_URL ? new ioredis_1.default(env_1.env.REDIS_URL, { maxRetriesPerRequest: null }) : null;
exports.emailQueue = connection ? new bullmq_1.Queue('email-queue', { connection: connection }) : null;
exports.emailWorker = connection ? new bullmq_1.Worker('email-queue', async (job) => {
    const { to, subject, text, html } = job.data;
    logger_1.logger.info(`Processing email job ${job.id} for ${to}`);
    await (0, email_service_1.sendEmail)({ to, subject, text, html });
}, { connection: connection }) : null;
if (exports.emailWorker) {
    exports.emailWorker.on('completed', job => {
        logger_1.logger.info(`Email job ${job.id} completed successfully`);
    });
    exports.emailWorker.on('failed', (job, err) => {
        logger_1.logger.error(`Email job ${job?.id} failed:`, err);
    });
}
