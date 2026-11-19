import { query } from '../config/db.js';

/**
 * @route   GET /api/admin/dashboard-stats
 * @desc    (Admin) Aggregate core banking indicators & metrics
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Customers
    const [customers] = await query("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'");

    // 2. Total Liquidity / Deposits
    const [deposits] = await query("SELECT COALESCE(SUM(balance), 0) AS total_deposits FROM accounts WHERE status = 'active'");

    // 3. Loans Overview
    const [loanStats] = await query(
      `SELECT 
         COUNT(*) AS total_loans,
         COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) AS pending_loans,
         COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS disbursed_loan_amount
       FROM loans`
    );

    // 4. Fraud Alerts count
    const [fraudStats] = await query(
      `SELECT 
         COUNT(*) AS total_alerts,
         COALESCE(SUM(CASE WHEN status = 'flagged' THEN 1 ELSE 0 END), 0) AS unreviewed_alerts
       FROM fraud_alerts`
    );

    // 5. Total Transactions Count & Volume
    const [txStats] = await query(
      `SELECT 
         COUNT(*) AS total_tx_count,
         COALESCE(SUM(amount), 0) AS total_tx_volume
       FROM transactions`
    );

    res.status(200).json({
      success: true,
      stats: {
        total_customers: customers[0]?.total_customers || 0,
        total_deposits: parseFloat(deposits[0]?.total_deposits || 0),
        total_loans: loanStats[0]?.total_loans || 0,
        pending_loans: loanStats[0]?.pending_loans || 0,
        disbursed_loan_amount: parseFloat(loanStats[0]?.disbursed_loan_amount || 0),
        unreviewed_alerts: fraudStats[0]?.unreviewed_alerts || 0,
        total_tx_volume: parseFloat(txStats[0]?.total_tx_volume || 0),
        total_tx_count: txStats[0]?.total_tx_count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/customers
 * @desc    (Admin) Retrieve all customers with their active accounts
 */
export const getAllCustomers = async (req, res, next) => {
  try {
    const [customers] = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.address, u.created_at,
              a.id AS account_id, a.account_number, a.account_type, a.balance, a.status AS account_status
       FROM users u
       LEFT JOIN accounts a ON u.id = a.user_id
       WHERE u.role = 'customer'
       ORDER BY u.created_at DESC`
    );

    res.status(200).json({ success: true, count: customers.length, customers });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/accounts/:id/toggle-status
 * @desc    (Admin) Freeze or activate an account
 */
export const toggleAccountStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'frozen', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await query('UPDATE accounts SET status = ? WHERE id = ?', [status, id]);

    // Audit log
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [req.user.id, 'ACCOUNT_STATUS_CHANGE', clientIp, `Admin changed Account #${id} status to ${status}`]
    );

    res.status(200).json({ success: true, message: `Account status successfully changed to ${status}.` });
  } catch (error) {
    next(error);
  }
};

