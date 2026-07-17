"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../middleware/validate");
const auth_middleware_1 = require("../middleware/auth.middleware");
const db_1 = require("../config/db");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const createEquipmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        category: zod_1.z.string(),
        totalQuantity: zod_1.z.number().min(1),
        condition: zod_1.z.string().optional()
    })
});
const allocateSchema = zod_1.z.object({
    body: zod_1.z.object({
        eventId: zod_1.z.string().uuid(),
        equipmentId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().min(1)
    })
});
// Get all equipment
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), async (req, res, next) => {
    try {
        const equipment = await db_1.prisma.equipment.findMany({
            orderBy: { category: 'asc' }
        });
        res.json({ status: 'success', data: { equipment } });
    }
    catch (error) {
        next(error);
    }
});
// Add equipment
router.post('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (0, validate_1.validate)(createEquipmentSchema), async (req, res, next) => {
    try {
        const eq = await db_1.prisma.equipment.create({
            data: {
                ...req.body,
                availableQuantity: req.body.totalQuantity
            }
        });
        res.status(201).json({ status: 'success', data: { equipment: eq } });
    }
    catch (error) {
        next(error);
    }
});
// Allocate equipment to event
router.post('/allocate', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('ADMIN'), (0, validate_1.validate)(allocateSchema), async (req, res, next) => {
    try {
        const { eventId, equipmentId, quantity } = req.body;
        // Use transaction to ensure consistency
        const result = await db_1.prisma.$transaction(async (tx) => {
            const eq = await tx.equipment.findUnique({ where: { id: equipmentId } });
            if (!eq)
                throw new errorHandler_1.AppError('Equipment not found', 404);
            if (eq.availableQuantity < quantity)
                throw new errorHandler_1.AppError('Not enough available quantity', 400);
            const allocation = await tx.equipmentAllocation.create({
                data: { eventId, equipmentId, quantity }
            });
            const updatedEq = await tx.equipment.update({
                where: { id: equipmentId },
                data: {
                    availableQuantity: eq.availableQuantity - quantity,
                    status: eq.availableQuantity - quantity === 0 ? 'ALLOCATED' : 'AVAILABLE'
                }
            });
            return { allocation, updatedEq };
        });
        res.json({ status: 'success', data: result });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
