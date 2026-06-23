import express from 'express';
import { getMyCertificates, verifyCertificate, getCertificate } from '../controllers/certificateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, getMyCertificates);
router.get('/verify/:code', verifyCertificate); // Public
router.get('/:id', protect, getCertificate);

export default router;
