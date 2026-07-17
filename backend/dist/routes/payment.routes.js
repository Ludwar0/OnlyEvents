"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const auth_middleware_1 = require("../middleware/auth.middleware");
const db_1 = require("../config/db");
const errorHandler_1 = require("../middleware/errorHandler");
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
const stripe = new stripe_1.default(env_1.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2023-10-16' });
const router = (0, express_1.Router)();
const recordPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string().uuid(),
        amount: zod_1.z.number().min(1),
        method: zod_1.z.string(),
        reference: zod_1.z.string().optional()
    })
});
// Get all payments (Admin)
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), async (req, res, next) => {
    try {
        const payments = await db_1.prisma.payment.findMany({
            orderBy: { createdAt: 'desc' },
            include: { event: { include: { client: { select: { firstName: true, lastName: true } } } } }
        });
        res.json({ status: 'success', data: { payments } });
    }
    catch (error) {
        next(error);
    }
});
// Record manual payment
router.post('/record', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (0, validate_1.validate)(recordPaymentSchema), async (req, res, next) => {
    try {
        const { eventId, amount, method, reference } = req.body;
        const result = await db_1.prisma.$transaction(async (tx) => {
            const event = await tx.event.findUnique({ where: { id: eventId } });
            if (!event)
                throw new errorHandler_1.AppError('Event not found', 404);
            const payment = await tx.payment.create({
                data: { eventId, amount, method, reference, status: 'PAID', paidAt: new Date() }
            });
            const newAmountPaid = event.amountPaid + amount;
            const paymentStatus = newAmountPaid >= event.totalAmount ? 'PAID' : 'PARTIAL';
            const updatedEvent = await tx.event.update({
                where: { id: eventId },
                data: { amountPaid: newAmountPaid, paymentStatus }
            });
            return { payment, event: updatedEvent };
        });
        res.json({ status: 'success', data: result });
    }
    catch (error) {
        next(error);
    }
});
// Stripe Checkout Session
router.post('/create-checkout-session', auth_middleware_1.protect, async (req, res, next) => {
    try {
        const { eventId, paymentType } = req.body; // paymentType: 'DEPOSIT' | 'BALANCE' | 'FULL'
        const event = await db_1.prisma.event.findUnique({ where: { id: eventId } });
        if (!event)
            throw new errorHandler_1.AppError('Event not found', 404);
        const balanceDue = event.totalAmount - event.amountPaid;
        if (balanceDue <= 0)
            throw new errorHandler_1.AppError('Event is already fully paid', 400);
        let amountToPay = balanceDue;
        let description = `Full Payment for Event: ${event.eventType}`;
        if (paymentType === 'DEPOSIT') {
            // Deposit is 50% of the total amount
            const depositAmount = event.totalAmount * 0.5;
            if (event.amountPaid >= depositAmount) {
                throw new errorHandler_1.AppError('Deposit has already been paid. Please pay the remaining balance.', 400);
            }
            amountToPay = depositAmount - event.amountPaid;
            description = `Deposit (50%) for Event: ${event.eventType}`;
        }
        else if (paymentType === 'BALANCE') {
            description = `Remaining Balance for Event: ${event.eventType}`;
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                    price_data: {
                        currency: 'kes',
                        product_data: { name: description },
                        unit_amount: amountToPay * 100, // in cents
                    },
                    quantity: 1,
                }],
            mode: 'payment',
            success_url: `${env_1.env.FRONTEND_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env_1.env.FRONTEND_URL}/?payment=cancel`,
            client_reference_id: eventId,
        });
        res.json({ status: 'success', data: { url: session.url } });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
