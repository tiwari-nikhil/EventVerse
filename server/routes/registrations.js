import express from 'express';
import { registerForEvent, getMyRegistrations, getRegistration, cancelRegistration } from '../controllers/registrationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', registerForEvent);
router.get('/my', getMyRegistrations);
router.get('/:id', getRegistration);
router.delete('/:id', cancelRegistration);

export default router;
