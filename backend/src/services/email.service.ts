import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async (options: { to: string; subject: string; text: string; html?: string }) => {
  try {
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('❌ Error sending email', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Only Events!',
    text: `Hi ${name},\n\nWelcome to Only Events! We're thrilled to have you here.`,
    html: `<h1>Welcome to Only Events!</h1><p>Hi ${name},</p><p>We're thrilled to have you here.</p>`,
  });
};

export const sendPaymentConfirmation = async (email: string, eventName: string, amount: number) => {
  await sendEmail({
    to: email,
    subject: 'Payment Confirmation - Only Events',
    text: `Your payment of KES ${amount} for ${eventName} has been received.`,
  });
};
