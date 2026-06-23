import express from 'express';
import {
  getPlatformStats, getAllUsers, toggleUserStatus,
  getOrganizerRequests, submitOrganizerRequest,
  approveOrganizerRequest, rejectOrganizerRequest, getAllEvents
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Admin-only routes
router.get('/stats', protect, requireRole('admin'), getPlatformStats);
router.get('/users', protect, requireRole('admin'), getAllUsers);
router.patch('/users/:id/toggle', protect, requireRole('admin'), toggleUserStatus);
router.get('/organizer-requests', protect, requireRole('admin'), getOrganizerRequests);
router.patch('/organizer-requests/:id/approve', protect, requireRole('admin'), approveOrganizerRequest);
router.patch('/organizer-requests/:id/reject', protect, requireRole('admin'), rejectOrganizerRequest);
router.get('/events', protect, requireRole('admin'), getAllEvents);

// Student can submit organizer request
router.post('/organizer-requests', protect, submitOrganizerRequest);

export default router;
