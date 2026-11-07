import express from 'express';
import { register, login, getMe, sendOtp, verifyOtp } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Password & Token auth
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// OTP & 2FA privacy auth
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
