import express from 'express';
import { getDashboardStats, getAllCustomers, toggleAccountStatus } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, adminOnly, getDashboardStats);
router.get('/customers', protect, adminOnly, getAllCustomers);
router.patch('/accounts/:id/toggle-status', protect, adminOnly, toggleAccountStatus);

export default router;

