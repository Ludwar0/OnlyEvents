"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
const db_1 = require("../config/db");
const logger_1 = require("../config/logger");
const router = (0, express_1.Router)();
const stripe = new stripe_1.default(env_1.env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2023-10-16' });
// Stripe requires the raw body to construct the event
router.post('/stripe', express_2.default.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, env_1.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy');
    }
    catch (err) {
        logger_1.logger.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const eventId = session.client_reference_id;
        const amountPaid = (session.amount_total || 0) / 100; // Convert cents to KES
        if (eventId) {
            try {
                await db_1.prisma.$transaction(async (tx) => {
                    const dbEvent = await tx.event.findUnique({ where: { id: eventId } });
                    if (!dbEvent)
                        return;
                    // Record payment
                    await tx.payment.create({
                        data: {
                            eventId,
                            amount: amountPaid,
                            method: 'STRIPE',
                            reference: session.payment_intent,
                            status: 'PAID',
                            stripeIntentId: session.payment_intent,
                            paidAt: new Date()
                        }
                    });
                    // Update event totals
                    const newAmountPaid = dbEvent.amountPaid + amountPaid;
                    const paymentStatus = newAmountPaid >= dbEvent.totalAmount ? 'PAID' : 'PARTIAL';
                    await tx.event.update({
                        where: { id: eventId },
                        data: { amountPaid: newAmountPaid, paymentStatus }
                    });
                    logger_1.logger.info(`✅ Successfully processed Stripe payment of KES ${amountPaid} for Event ${eventId}`);
                });
            }
            catch (error) {
                logger_1.logger.error('Error processing stripe webhook transaction:', error);
            }
        }
    }
    res.json({ received: true });
});
exports.default = router;
