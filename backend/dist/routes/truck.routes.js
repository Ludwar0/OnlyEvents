"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const auth_middleware_1 = require("../middleware/auth.middleware");
const db_1 = require("../config/db");
const router = (0, express_1.Router)();
const createTruckSchema = zod_1.z.object({
    body: zod_1.z.object({
        plateNumber: zod_1.z.string(),
        driverName: zod_1.z.string(),
        driverPhone: zod_1.z.string(),
        capacity: zod_1.z.string()
    })
});
const updateStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['AVAILABLE', 'EN_ROUTE', 'AT_VENUE', 'RETURNING'])
    })
});
const assignEventSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string().uuid()
    })
});
// Get all trucks
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), async (req, res, next) => {
    try {
        const trucks = await db_1.prisma.truck.findMany({
            include: { events: { where: { status: { in: ['UPCOMING', 'IN_PROGRESS'] } } } }
        });
        res.json({ status: 'success', data: { trucks } });
    }
    catch (error) {
        next(error);
    }
});
// Add truck
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (0, validate_1.validate)(createTruckSchema), async (req, res, next) => {
    try {
        const truck = await db_1.prisma.truck.create({ data: req.body });
        res.status(201).json({ status: 'success', data: { truck } });
    }
    catch (error) {
        next(error);
    }
});
// Update status
router.patch('/:id/status', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (0, validate_1.validate)(updateStatusSchema), async (req, res, next) => {
    try {
        const truck = await db_1.prisma.truck.update({
            where: { id: req.params.id },
            data: { status: req.body.status }
        });
        res.json({ status: 'success', data: { truck } });
    }
    catch (error) {
        next(error);
    }
});
// Assign event
router.post('/:id/assign', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (0, validate_1.validate)(assignEventSchema), async (req, res, next) => {
    try {
        const { eventId } = req.body;
        const truck = await db_1.prisma.truck.update({
            where: { id: req.params.id },
            data: { events: { connect: { id: eventId } } }
        });
        res.json({ status: 'success', data: { truck } });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
