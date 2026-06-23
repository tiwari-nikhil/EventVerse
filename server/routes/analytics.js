import express from 'express';
import { getEventAnalytics, getOrganizerSummary } from '../controllers/analyticsController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/organizer/summary', protect, requireRole('organizer', 'admin'), getOrganizerSummary);
router.get('/:eventId', protect, requireRole('organizer', 'admin'), getEventAnalytics);

export default router;
