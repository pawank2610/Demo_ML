import { query } from '../config/db.js';

/**
 * @route   GET /api/fraud/alerts
 * @desc    (Admin) Get all fraud alerts and suspicious transactions
 */
export const getFraudAlerts = async (req, res, next) => {
  try {
    const [alerts] = await query(
      `SELECT fa.*, 
              u.full_name AS customer_name, 
              u.email AS customer_email,
              t.amount AS transaction_amount,
              t.transaction_type,
              t.created_at AS transaction_time
       FROM fraud_alerts fa
       LEFT JOIN users u ON fa.user_id = u.id
       LEFT JOIN transactions t ON fa.transaction_id = t.id
       ORDER BY fa.created_at DESC`
    );

    res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/fraud/alerts/:id/status
 * @desc    (Admin) Update fraud alert status (reviewed or dismissed)
 */
export const updateAlertStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be reviewed or dismissed.' });
    }

    await query('UPDATE fraud_alerts SET status = ? WHERE id = ?', [status, id]);

    // Audit log
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [req.user.id, 'FRAUD_ALERT_RESOLVED', clientIp, `Admin marked Fraud Alert #${id} as ${status}`]
    );

    res.status(200).json({ success: true, message: `Fraud alert marked as ${status}.` });
  } catch (error) {
    next(error);
  }
};

