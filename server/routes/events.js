import express from 'express';
import {
  getEvents, getEvent, createEvent, updateEvent, publishEvent,
  deleteEvent, getOrganizerEvents, getEventParticipants, completeEvent
} from '../controllers/eventController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/organizer/my', protect, requireRole('organizer', 'admin'), getOrganizerEvents);
router.get('/:id', getEvent);
router.get('/:id/participants', protect, requireRole('organizer', 'admin'), getEventParticipants);
router.post('/', protect, requireRole('organizer', 'admin'), createEvent);
router.patch('/:id', protect, updateEvent);
router.patch('/:id/publish', protect, publishEvent);
router.patch('/:id/complete', protect, requireRole('organizer', 'admin'), completeEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
