"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaymentConfirmation = exports.sendWelcomeEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: parseInt(env_1.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: env_1.env.SMTP_USER,
        pass: env_1.env.SMTP_PASS,
    },
});
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: env_1.env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        const info = await transporter.sendMail(mailOptions);
        logger_1.logger.info(`📧 Email sent: ${info.messageId}`);
        return info;
    }
    catch (error) {
        logger_1.logger.error('❌ Error sending email', error);
        throw new Error('Failed to send email');
    }
};
exports.sendEmail = sendEmail;
const sendWelcomeEmail = async (email, name) => {
    await (0, exports.sendEmail)({
        to: email,
        subject: 'Welcome to Only Events!',
        text: `Hi ${name},\n\nWelcome to Only Events! We're thrilled to have you here.`,
        html: `<h1>Welcome to Only Events!</h1><p>Hi ${name},</p><p>We're thrilled to have you here.</p>`,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPaymentConfirmation = async (email, eventName, amount) => {
    await (0, exports.sendEmail)({
        to: email,
        subject: 'Payment Confirmation - Only Events',
        text: `Your payment of KES ${amount} for ${eventName} has been received.`,
    });
};
exports.sendPaymentConfirmation = sendPaymentConfirmation;
