import { z } from 'zod';

export const registerVendorSchema = z.object({
  body: z.object({
    businessName: z.string().min(2),
    category: z.string().min(2),
    description: z.string().min(10),
    location: z.string(),
    contactEmail: z.string().email(),
    contactPhone: z.string()
  })
});
