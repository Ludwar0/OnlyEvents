import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    // Accept both UPPERCASE (backend) and human-readable strings from the frontend
    eventType: z.string().min(1),
    customEventType: z.string().optional(),
    eventDate: z.string().min(1),  // accept any date string
    venue: z.string().min(1),
    package: z.string().min(1),    // BRONZE | SILVER | GOLD or display values
    guests: z.union([z.number(), z.string()]).transform(v => Number(v)).optional(),
    specialRequirements: z.string().optional(),
    // Guest info (for unauthenticated bookings)
    clientName: z.string().optional(),
    clientEmail: z.string().optional(),
    clientPhone: z.string().optional(),
    amount: z.number().optional(),
    paymentStatus: z.string().optional(),
    amountPaid: z.number().optional(),
    status: z.string().optional(),
  })
});

export const updateEventStatusSchema = z.object({
  body: z.object({
    status: z.string().min(1)
  })
});
