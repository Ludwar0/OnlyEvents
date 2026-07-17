import { Router } from 'express';
import * as vendorController from '../controllers/vendor.controller';
import { validate } from '../middleware/validate';
import { registerVendorSchema } from '../validators/vendor.validator';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', protect, validate(registerVendorSchema), vendorController.registerVendor);
router.get('/', vendorController.getAllVendors); // Public endpoint
router.get('/:id', vendorController.getVendorById);
router.patch('/:id/approve', protect, restrictTo('ADMIN'), vendorController.approveVendor);

export default router;
