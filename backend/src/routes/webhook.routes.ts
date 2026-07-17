import { Router } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

const router = Router();
const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2023-10-16' as any });

// Stripe requires the raw body to construct the event
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy');
  } catch (err: any) {
    logger.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const eventId = session.client_reference_id;
    const amountPaid = (session.amount_total || 0) / 100; // Convert cents to KES

    if (eventId) {
      try {
        await prisma.$transaction(async (tx) => {
          const dbEvent = await tx.event.findUnique({ where: { id: eventId } });
          if (!dbEvent) return;

          // Record payment
          await tx.payment.create({
            data: {
              eventId,
              amount: amountPaid,
              method: 'STRIPE',
              reference: session.payment_intent as string,
              status: 'PAID',
              stripeIntentId: session.payment_intent as string,
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

          logger.info(`✅ Successfully processed Stripe payment of KES ${amountPaid} for Event ${eventId}`);
        });
      } catch (error) {
        logger.error('Error processing stripe webhook transaction:', error);
      }
    }
  }

  res.json({ received: true });
});

export default router;
