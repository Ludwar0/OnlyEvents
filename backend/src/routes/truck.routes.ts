import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { prisma } from '../config/db';
import { AppError } from '../middleware/errorHandler';

const router = Router();

const createTruckSchema = z.object({
  body: z.object({
    plateNumber: z.string(),
    driverName: z.string(),
    driverPhone: z.string(),
    capacity: z.string()
  })
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['AVAILABLE', 'EN_ROUTE', 'AT_VENUE', 'RETURNING'])
  })
});

const assignEventSchema = z.object({
  body: z.object({
    eventId: z.string().uuid()
  })
});

// Get all trucks
router.get('/', protect, restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const trucks = await prisma.truck.findMany({
      include: { events: { where: { status: { in: ['UPCOMING', 'IN_PROGRESS'] } } } }
    });
    res.json({ status: 'success', data: { trucks } });
  } catch (error) { next(error); }
});

// Add truck
router.post('/', protect, restrictTo('ADMIN'), validate(createTruckSchema), async (req, res, next) => {
  try {
    const truck = await prisma.truck.create({ data: req.body });
    res.status(201).json({ status: 'success', data: { truck } });
  } catch (error) { next(error); }
});

// Update status
router.patch('/:id/status', protect, restrictTo('ADMIN'), validate(updateStatusSchema), async (req, res, next) => {
  try {
    const truck = await prisma.truck.update({
      where: { id: req.params.id },
      data: { status: req.body.status }
    });
    res.json({ status: 'success', data: { truck } });
  } catch (error) { next(error); }
});

// Assign event
router.post('/:id/assign', protect, restrictTo('ADMIN'), validate(assignEventSchema), async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const truck = await prisma.truck.update({
      where: { id: req.params.id },
      data: { events: { connect: { id: eventId } } }
    });
    res.json({ status: 'success', data: { truck } });
  } catch (error) { next(error); }
});

export default router;
