import express from 'express';
import { scanQR, getEventAttendance, manualAttendance } from '../controllers/attendanceController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/scan', protect, requireRole('organizer', 'admin'), scanQR);
router.post('/manual', protect, requireRole('organizer', 'admin'), manualAttendance);
router.get('/:eventId', protect, requireRole('organizer', 'admin'), getEventAttendance);

export default router;
