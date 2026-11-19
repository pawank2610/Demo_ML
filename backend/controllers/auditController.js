import { query } from '../config/db.js';

/**
 * @route   GET /api/audit/logs
 * @desc    (Admin) Retrieve system security and action audit logs
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const [logs] = await query(
      `SELECT al.*, u.full_name AS user_name, u.email AS user_email, u.role AS user_role 
       FROM audit_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ORDER BY al.created_at DESC 
       LIMIT 100`
    );

    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    next(error);
  }
};

