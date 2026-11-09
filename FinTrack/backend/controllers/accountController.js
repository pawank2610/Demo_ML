import { query, getConnection } from '../config/db.js';

/**
 * @route   GET /api/accounts/my
 * @desc    Get all accounts belonging to the authenticated customer
 */
export const getMyAccounts = async (req, res, next) => {
  try {
    const [accounts] = await query('SELECT * FROM accounts WHERE user_id = ? ORDER BY id ASC', [req.user.id]);
    res.status(200).json({ success: true, count: accounts.length, accounts });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/accounts/lookup/:accountNumber
 * @desc    Verify if a recipient account number exists and return holder name
 */
export const lookupAccount = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;

    const [rows] = await query(
      `SELECT a.id, a.account_number, a.account_type, a.status, u.full_name AS holder_name 
       FROM accounts a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.account_number = ?`,
      [accountNumber.trim()]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Account number not found.' });
    }

    const account = rows[0];

    if (account.status !== 'active') {
      return res.status(400).json({ success: false, message: `Account is ${account.status}. Transfers not allowed.` });
    }

    res.status(200).json({
      success: true,
      account: {
        account_number: account.account_number,
        account_type: account.account_type,
        holder_name: account.holder_name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/accounts/deposit
 * @desc    Simulate adding funds to an account
 */
export const deposit = async (req, res, next) => {
  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    const { account_id, amount, description } = req.body;
    const depositAmount = parseFloat(amount);

    if (isNaN(depositAmount) || depositAmount <= 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'Valid deposit amount required (> 0).' });
    }

    // Verify account belongs to user or user is admin
    const [accRows] = await conn.execute('SELECT * FROM accounts WHERE id = ?', [account_id]);
    if (!accRows || accRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    const account = accRows[0];
    if (req.user.role !== 'admin' && account.user_id !== req.user.id) {
      await conn.rollback();
      conn.release();
      return res.status(403).json({ success: false, message: 'Unauthorized account access.' });
    }

    // Update balance
    const newBalance = Number(account.balance) + depositAmount;
    await conn.execute('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, account.id]);

    // Insert transaction
    const [txResult] = await conn.execute(
      `INSERT INTO transactions (from_account_id, to_account_id, transaction_type, amount, description, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [null, account.id, 'deposit', depositAmount, description || 'Funds Deposit', 'completed']
    );

    // Audit log
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await conn.execute(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [req.user.id, 'ACCOUNT_DEPOSIT', clientIp, `Deposited $${depositAmount.toFixed(2)} into account ${account.account_number}`]
    );

    await conn.commit();
    conn.release();

    res.status(200).json({
      success: true,
      message: 'Deposit successful!',
      new_balance: newBalance,
      transaction_id: txResult.insertId,
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    next(error);
  }
};

