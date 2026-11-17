import express from 'express';
import { getFraudAlerts, updateAlertStatus } from '../controllers/fraudController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/alerts', protect, adminOnly, getFraudAlerts);
router.patch('/alerts/:id/status', protect, adminOnly, updateAlertStatus);

export default router;

