import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/logs', protect, adminOnly, getAuditLogs);

export default router;

