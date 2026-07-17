"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../config/db");
const logger_1 = require("../config/logger");
const email_queue_1 = require("./email.queue");
const startCronJobs = () => {
    if (!email_queue_1.emailQueue) {
        logger_1.logger.info('Email queue disabled because Redis is not configured.');
        return;
    }
    // Run every day at 8 AM to send reminders for upcoming events
    node_cron_1.default.schedule('0 8 * * *', async () => {
        logger_1.logger.info('Running daily event reminder job...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const dayAfter = new Date(tomorrow);
            dayAfter.setDate(dayAfter.getDate() + 1);
            const upcomingEvents = await db_1.prisma.event.findMany({
                where: {
                    eventDate: {
                        gte: tomorrow,
                        lt: dayAfter
                    },
                    status: 'UPCOMING'
                },
                include: { client: true }
            });
            for (const event of upcomingEvents) {
                if (!email_queue_1.emailQueue)
                    continue;
                await email_queue_1.emailQueue.add('event-reminder', {
                    to: event.client.email,
                    subject: `Reminder: Your Event is Tomorrow!`,
                    text: `Hi ${event.client.firstName},\n\nThis is a gentle reminder that your ${event.eventType} event is scheduled for tomorrow at ${event.venue}.\n\nOur team will be there to ensure everything runs smoothly.\n\nBest,\nOnly Events Team`
                });
            }
            logger_1.logger.info(`Queued ${upcomingEvents.length} event reminders.`);
        }
        catch (error) {
            logger_1.logger.error('Error running daily reminder job:', error);
        }
    });
};
exports.startCronJobs = startCronJobs;
