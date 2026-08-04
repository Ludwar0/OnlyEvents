import { Router } from 'express';
import * as eventController from '../controllers/event.controller';
import { validate } from '../middleware/validate';
import { createEventSchema, updateEventStatusSchema } from '../validators/event.validator';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Public: anyone can create a booking
router.post('/', validate(createEventSchema), eventController.createEvent);

// Protected: user sees their own events
router.get('/my-events', protect, eventController.getMyEvents);

// Admin only: see all events
router.get('/', protect, restrictTo('ADMIN'), eventController.getAllEvents);
router.get('/:id', protect, eventController.getEventById);
router.patch('/:id/status', protect, restrictTo('ADMIN'), validate(updateEventStatusSchema), eventController.updateEventStatus);

export default router;
