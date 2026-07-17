import cron from 'node-cron';
import { prisma } from '../config/db';
import { logger } from '../config/logger';
import { emailQueue } from './email.queue';

export const startCronJobs = () => {
  if (!emailQueue) {
    logger.info('Email queue disabled because Redis is not configured.');
    return;
  }

  // Run every day at 8 AM to send reminders for upcoming events
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running daily event reminder job...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const upcomingEvents = await prisma.event.findMany({
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
        if (!emailQueue) continue;
        await emailQueue.add('event-reminder', {
          to: event.client.email,
          subject: `Reminder: Your Event is Tomorrow!`,
          text: `Hi ${event.client.firstName},\n\nThis is a gentle reminder that your ${event.eventType} event is scheduled for tomorrow at ${event.venue}.\n\nOur team will be there to ensure everything runs smoothly.\n\nBest,\nOnly Events Team`
        });
      }

      logger.info(`Queued ${upcomingEvents.length} event reminders.`);
    } catch (error) {
      logger.error('Error running daily reminder job:', error);
    }
  });
};
