import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import eventRoutes from './event.routes';
import vendorRoutes from './vendor.routes';
import equipmentRoutes from './equipment.routes';
import truckRoutes from './truck.routes';
import paymentRoutes from './payment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/vendors', vendorRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/trucks', truckRoutes);
router.use('/payments', paymentRoutes);

export default router;
