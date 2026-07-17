import { z } from 'zod';

export const createEventSchema = z.object({
  body: z.object({
    eventType: z.enum(['WEDDING', 'FUNERAL', 'RURACIO', 'CORPORATE', 'BIRTHDAY', 'OTHER']),
    customEventType: z.string().optional(),
    eventDate: z.string().datetime(),
    venue: z.string().min(2),
    package: z.enum(['BRONZE', 'SILVER', 'GOLD']),
    guests: z.number().min(1),
    specialRequirements: z.string().optional()
  })
});

export const updateEventStatusSchema = z.object({
  body: z.object({
    status: z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  })
});
