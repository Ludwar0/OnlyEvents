import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { prisma } from '../config/db';

const router = Router();

// Get user profile
router.get('/profile', protect, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { vendorProfile: true }
    });
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
});

// Update user profile
router.patch('/profile', protect, async (req: any, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone }
    });
    res.json({ status: 'success', data: { user } });
  } catch (error) { next(error); }
});

// Get all users (Admin)
router.get('/', protect, restrictTo('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });
    res.json({ status: 'success', data: { users } });
  } catch (error) { next(error); }
});

export default router;
