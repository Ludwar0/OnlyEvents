import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';
import Stripe from 'stripe';
import { env } from '../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_dummy', { apiVersion: '2023-10-16' as any });

const router = Router();

const recordPaymentSchema = z.object({
  body: z.object({
    eventId: z.string().uuid(),
    amount: z.number().min(1),
    method: z.string(),
    reference: z.string().optional()
  })
});

// Get all payments (Admin)
router.get('/', protect, restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { event: { include: { client: { select: { firstName: true, lastName: true } } } } }
    });
    res.json({ status: 'success', data: { payments } });
  } catch (error) { next(error); }
});

// Record manual payment
router.post('/record', protect, restrictTo('ADMIN'), validate(recordPaymentSchema), async (req, res, next) => {
  try {
    const { eventId, amount, method, reference } = req.body;
    
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new AppError('Event not found', 404);

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
  } catch (error) { next(error); }
});

// Stripe Checkout Session
router.post('/create-checkout-session', protect, async (req, res, next) => {
  try {
    const { eventId, paymentType } = req.body; // paymentType: 'DEPOSIT' | 'BALANCE' | 'FULL'
    
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Event not found', 404);

    const balanceDue = event.totalAmount - event.amountPaid;
    if (balanceDue <= 0) throw new AppError('Event is already fully paid', 400);

    let amountToPay = balanceDue;
    let description = `Full Payment for Event: ${event.eventType}`;

    if (paymentType === 'DEPOSIT') {
      // Deposit is 50% of the total amount
      const depositAmount = event.totalAmount * 0.5;
      if (event.amountPaid >= depositAmount) {
        throw new AppError('Deposit has already been paid. Please pay the remaining balance.', 400);
      }
      amountToPay = depositAmount - event.amountPaid;
      description = `Deposit (50%) for Event: ${event.eventType}`;
    } else if (paymentType === 'BALANCE') {
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
      success_url: `${env.FRONTEND_URL}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/?payment=cancel`,
      client_reference_id: eventId,
    });

    res.json({ status: 'success', data: { url: session.url } });
  } catch (error) { next(error); }
});

export default router;
