import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const createEquipmentSchema = z.object({
  body: z.object({
    name: z.string(),
    category: z.string(),
    totalQuantity: z.number().min(1),
    condition: z.string().optional()
  })
});

const allocateSchema = z.object({
  body: z.object({
    eventId: z.string().uuid(),
    equipmentId: z.string().uuid(),
    quantity: z.number().min(1)
  })
});

// Get all equipment
router.get('/', protect, restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const equipment = await prisma.equipment.findMany({
      orderBy: { category: 'asc' }
    });
    res.json({ status: 'success', data: { equipment } });
  } catch (error) { next(error); }
});

// Add equipment
router.post('/', protect, restrictTo('ADMIN'), validate(createEquipmentSchema), async (req, res, next) => {
  try {
    const eq = await prisma.equipment.create({
      data: {
        ...req.body,
        availableQuantity: req.body.totalQuantity
      }
    });
    res.status(201).json({ status: 'success', data: { equipment: eq } });
  } catch (error) { next(error); }
});

// Allocate equipment to event
router.post('/allocate', protect, restrictTo('ADMIN'), validate(allocateSchema), async (req, res, next) => {
  try {
    const { eventId, equipmentId, quantity } = req.body;
    
    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      const eq = await tx.equipment.findUnique({ where: { id: equipmentId } });
      if (!eq) throw new AppError('Equipment not found', 404);
      if (eq.availableQuantity < quantity) throw new AppError('Not enough available quantity', 400);

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
  } catch (error) { next(error); }
});

export default router;
