import { getConnection, query } from '../config/db.js';

/**
 * @route   POST /api/transactions/transfer
 * @desc    Execute ACID-compliant Fund Transfer between two bank accounts
 * @concept ACID Transactions (Atomicity, Consistency, Isolation, Durability)
 */
export const transferFunds = async (req, res, next) => {
  const conn = await getConnection();

  try {
    const { from_account_id, to_account_number, amount, description } = req.body;
    const transferAmount = parseFloat(amount);

    // Basic Input Validation
    if (!from_account_id || !to_account_number || isNaN(transferAmount) || transferAmount <= 0) {
      conn.release();
      return res.status(400).json({
        success: false,
        message: 'Invalid transfer parameters. Amount must be greater than zero.',
      });
    }

    // =========================================================================
    // ACID TRANSACTION START
    // =========================================================================
    await conn.beginTransaction();

    // 1. ISOLATION & CONSISTENCY: Lock and fetch sender account (FOR UPDATE)
    const [senderRows] = await conn.execute(
      'SELECT id, user_id, account_number, balance, status FROM accounts WHERE id = ? FOR UPDATE',
      [from_account_id]
    );

    if (!senderRows || senderRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Sender account not found.' });
    }

    const sender = senderRows[0];

    // Authorization check
    if (sender.user_id !== req.user.id && req.user.role !== 'admin') {
      await conn.rollback();
      conn.release();
      return res.status(403).json({ success: false, message: 'Unauthorized transfer from this account.' });
    }

    if (sender.status !== 'active') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: `Sender account is ${sender.status}. Transfer halted.` });
    }

    // 2. CONSISTENCY: Validate sufficient balance
    if (Number(sender.balance) < transferAmount) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        success: false,
        message: `Insufficient funds. Current balance: $${Number(sender.balance).toFixed(2)}, required: $${transferAmount.toFixed(2)}.`,
      });
    }

    // 3. ISOLATION & CONSISTENCY: Lock and fetch recipient account (FOR UPDATE)
    const [recipientRows] = await conn.execute(
      'SELECT id, user_id, account_number, balance, status FROM accounts WHERE account_number = ? FOR UPDATE',
      [to_account_number.trim()]
    );

    if (!recipientRows || recipientRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Recipient account number does not exist.' });
    }

    const recipient = recipientRows[0];

    // Prevent transferring to the same account
    if (sender.id === recipient.id) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: 'Cannot transfer funds to the exact same account.' });
    }

    if (recipient.status !== 'active') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: `Recipient account is ${recipient.status}. Transfer halted.` });
    }

    // 4. ATOMICITY: Debit Sender Account
    const newSenderBalance = Number(sender.balance) - transferAmount;
    await conn.execute('UPDATE accounts SET balance = ? WHERE id = ?', [newSenderBalance, sender.id]);

    // 5. ATOMICITY: Credit Recipient Account
    const newRecipientBalance = Number(recipient.balance) + transferAmount;
    await conn.execute('UPDATE accounts SET balance = ? WHERE id = ?', [newRecipientBalance, recipient.id]);

    // 6. Check for Fraud Threshold (e.g. >= $10,000)
    let txStatus = 'completed';
    const isHighValue = transferAmount >= 10000.00;
    if (isHighValue) {
      txStatus = 'flagged';
    }

    // 7. Insert Transaction Record
    const [txResult] = await conn.execute(
      `INSERT INTO transactions (from_account_id, to_account_id, transaction_type, amount, description, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sender.id, recipient.id, 'transfer', transferAmount, description || 'Direct Peer Transfer', txStatus]
    );

    const transactionId = txResult.insertId;

    // 8. Fraud Monitoring (Trigger simulation in case SQL triggers aren't enabled in current mode)
    if (isHighValue) {
      await conn.execute(
        `INSERT INTO fraud_alerts (transaction_id, user_id, reason, severity, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          transactionId,
          sender.user_id,
          `High-value transfer alert: $${transferAmount.toFixed(2)} exceeds threshold of $10,000.00`,
          'high',
          'flagged',
        ]
      );
    }

    // 9. Audit Logging (ACID Durability audit trail)
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await conn.execute(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [
        req.user.id,
        'ACID_TRANSFER_SUCCESS',
        clientIp,
        `Transferred $${transferAmount.toFixed(2)} from ${sender.account_number} to ${recipient.account_number} (TxID: #${transactionId})`,
      ]
    );

    // 10. COMMIT TRANSACTION
    await conn.commit();
    conn.release();

    res.status(200).json({
      success: true,
      message: isHighValue 
        ? 'Transfer completed successfully. Note: Marked for standard high-value security review.'
        : 'Fund transfer completed successfully!',
      transaction: {
        id: transactionId,
        from_account: sender.account_number,
        to_account: recipient.account_number,
        amount: transferAmount,
        remaining_balance: newSenderBalance,
        status: txStatus,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    // If anything fails at any point, ROLLBACK ensures complete consistency!
    console.error('[ACID TRANSACTION ERROR - ROLLBACK TRIGGERED]', error.message);
    await conn.rollback();
    conn.release();
    next(error);
  }
};

/**
 * @route   GET /api/transactions/history
 * @desc    Get user's transactions with filtering & pagination
 */
export const getTransactionHistory = async (req, res, next) => {
  try {
    const { type, search } = req.query;

    // First find user accounts
    const [userAccounts] = await query('SELECT id, account_number FROM accounts WHERE user_id = ?', [req.user.id]);
    const accountIds = userAccounts.map((a) => a.id);

    if (accountIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, transactions: [] });
    }

    // Fetch transactions where user is sender or receiver
    const [allTx] = await query(
      `SELECT t.*, 
              fa.account_number AS from_account_number, 
              ta.account_number AS to_account_number
       FROM transactions t
       LEFT JOIN accounts fa ON t.from_account_id = fa.id
       LEFT JOIN accounts ta ON t.to_account_id = ta.id
       ORDER BY t.created_at DESC`
    );

    // Filter relevant to current user
    let userTx = allTx.filter((t) => accountIds.includes(t.from_account_id) || accountIds.includes(t.to_account_id));

    // Filter by type if provided
    if (type && type !== 'all') {
      userTx = userTx.filter((t) => t.transaction_type === type);
    }

    // Filter by search query if provided
    if (search) {
      const q = search.toLowerCase();
      userTx = userTx.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.from_account_number?.toLowerCase().includes(q) ||
          t.to_account_number?.toLowerCase().includes(q) ||
          t.amount?.toString().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: userTx.length,
      transactions: userTx,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transactions/:id
 * @desc    Get single transaction receipt details
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await query(
      `SELECT t.*, 
              fa.account_number AS from_account_number, 
              u1.full_name AS sender_name,
              ta.account_number AS to_account_number,
              u2.full_name AS recipient_name
       FROM transactions t
       LEFT JOIN accounts fa ON t.from_account_id = fa.id
       LEFT JOIN users u1 ON fa.user_id = u1.id
       LEFT JOIN accounts ta ON t.to_account_id = ta.id
       LEFT JOIN users u2 ON ta.user_id = u2.id
       WHERE t.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({ success: true, transaction: rows[0] });
  } catch (error) {
    next(error);
  }
};

