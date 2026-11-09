import express from 'express';
import { getMyAccounts, lookupAccount, deposit } from '../controllers/accountController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyAccounts);
router.get('/lookup/:accountNumber', protect, lookupAccount);
router.post('/deposit', protect, deposit);

export default router;

