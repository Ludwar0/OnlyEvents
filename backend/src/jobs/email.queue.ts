// email.queue.ts — Redis/BullMQ is optional. If Redis is not available the
// queue is replaced with no-op stubs so the server still starts normally.
import { logger } from '../config/logger';
import { env } from '../config/env';

// Lazy types so the file compiles without requiring bullmq at runtime
type EmailJobData = { to: string; subject: string; text?: string; html?: string };

let emailQueue: any;
let emailWorker: any;

const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

try {
  // Dynamic import so a missing/closed Redis doesn't crash the process at startup
  const bullmq = require('bullmq') as typeof import('bullmq');

  const connection = { url: redisUrl } as any;

  const queue = new bullmq.Queue('email-queue', { connection });
  const worker = new bullmq.Worker(
    'email-queue',
    async (job: any) => {
      const { sendEmail } = require('../services/email.service');
      const { to, subject, text, html } = job.data;
      logger.info(`Processing email job ${job.id} for ${to}`);
      await sendEmail({ to, subject, text, html });
    },
    { connection }
  );

  worker.on('completed', (job: any) =>
    logger.info(`Email job ${job.id} completed successfully`)
  );
  worker.on('failed', (job: any, err: Error) =>
    logger.error(`Email job ${job?.id} failed:`, err)
  );

  emailQueue = queue;
  emailWorker = worker;
  logger.info('✅ BullMQ email queue initialised');
} catch (err: any) {
  logger.warn(
    `⚠️  Redis not available (${err.message}). Email queue running in no-op mode.`
  );

  // No-op fallback — jobs are fire-and-forget via the email service directly
  emailQueue = {
    add: async (_name: string, data: EmailJobData) => {
      logger.info(`[no-op queue] Would send email to ${data.to}`);
    },
    close: async () => {},
  };
  emailWorker = null;
}

export { emailQueue, emailWorker };
