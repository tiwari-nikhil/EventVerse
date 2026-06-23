import express from 'express';
import { register, login, getMe, updateInterests, updateProfile, switchRole } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.patch('/interests', protect, updateInterests);
router.patch('/profile', protect, updateProfile);
router.patch('/switch-role', protect, switchRole);

export default router;
