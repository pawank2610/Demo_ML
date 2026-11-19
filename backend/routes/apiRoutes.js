import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'FinTrack API is operating normally',
    timestamp: new Date().toISOString(),
  });
});

export default router;

