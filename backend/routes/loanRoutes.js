import express from 'express';
import {
  checkEligibility,
  applyLoan,
  getMyLoans,
  getAllLoans,
  updateLoanStatus,
} from '../controllers/loanController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer Endpoints
router.post('/check-eligibility', checkEligibility);
router.post('/apply', protect, applyLoan);
router.get('/my', protect, getMyLoans);

// Admin Endpoints
router.get('/all', protect, adminOnly, getAllLoans);
router.patch('/:id/status', protect, adminOnly, updateLoanStatus);

export default router;

