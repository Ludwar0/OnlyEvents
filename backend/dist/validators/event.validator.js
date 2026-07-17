"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventStatusSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
exports.createEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventType: zod_1.z.enum(['WEDDING', 'FUNERAL', 'RURACIO', 'CORPORATE', 'BIRTHDAY', 'OTHER']),
        customEventType: zod_1.z.string().optional(),
        eventDate: zod_1.z.string().datetime(),
        venue: zod_1.z.string().min(2),
        package: zod_1.z.enum(['BRONZE', 'SILVER', 'GOLD']),
        guests: zod_1.z.number().min(1),
        specialRequirements: zod_1.z.string().optional()
    })
});
exports.updateEventStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    })
});
