import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env';
import { sendEmail } from '../services/email.service';
import { logger } from '../config/logger';

const connection = env.REDIS_URL ? new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null }) : null;

export const emailQueue = connection ? new Queue('email-queue', { connection: connection as any }) : null;

export const emailWorker = connection ? new Worker('email-queue', async job => {
  const { to, subject, text, html } = job.data;
  logger.info(`Processing email job ${job.id} for ${to}`);
  await sendEmail({ to, subject, text, html });
}, { connection: connection as any }) : null;

if (emailWorker) {
  emailWorker.on('completed', job => {
    logger.info(`Email job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job?.id} failed:`, err);
  });
}
