import express from 'express';
import { transferFunds, getTransactionHistory, getTransactionById } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/transfer', protect, transferFunds);
router.get('/history', protect, getTransactionHistory);
router.get('/:id', protect, getTransactionById);

export default router;

