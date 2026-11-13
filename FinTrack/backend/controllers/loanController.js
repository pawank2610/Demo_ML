import { query, getConnection } from '../config/db.js';

// Helper to compute Equated Monthly Installment (EMI)
const calculateEMI = (principal, annualRate, months) => {
  const monthlyRate = annualRate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  return isNaN(emi) ? 0 : Math.round(emi * 100) / 100;
};

/**
 * @route   POST /api/loans/check-eligibility
 * @desc    Calculate loan eligibility using standard banking DTI rules
 */
export const checkEligibility = (req, res) => {
  const { amount, term_months, monthly_income, annual_rate = 8.5 } = req.body;

  const principal = parseFloat(amount);
  const months = parseInt(term_months, 10);
  const income = parseFloat(monthly_income);
  const rate = parseFloat(annual_rate);

  if (!principal || !months || !income || principal <= 0 || months <= 0 || income <= 0) {
    return res.status(400).json({ success: false, message: 'Please provide valid amount, term in months, and monthly income.' });
  }

  const emi = calculateEMI(principal, rate, months);
  const dtiRatio = (emi / income) * 100;

  // Max recommended loan (capped at 50% DTI)
  const monthlyRate = rate / (12 * 100);
  const maxAffordableEMI = income * 0.50;
  const maxEligibleAmount = Math.round(
    (maxAffordableEMI * (Math.pow(1 + monthlyRate, months) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, months))
  );

  let status = 'eligible';
  let riskLevel = 'low';
  let message = 'Congratulations! You meet all preliminary eligibility criteria for this loan amount.';

  if (dtiRatio > 55) {
    status = 'ineligible';
    riskLevel = 'high';
    message = `Monthly EMI ($${emi.toFixed(2)}) exceeds 55% of your declared monthly income ($${income.toFixed(2)}). Consider increasing term duration or lowering the amount.`;
  } else if (dtiRatio > 40) {
    status = 'conditional';
    riskLevel = 'medium';
    message = 'Moderate Debt-to-Income ratio. Approval may require additional income proof or a guarantor.';
  }

  return res.status(200).json({
    success: true,
    data: {
      requested_amount: principal,
      term_months: months,
      monthly_income: income,
      interest_rate: rate,
      estimated_emi: emi,
      total_repayment: Math.round(emi * months * 100) / 100,
      total_interest: Math.round((emi * months - principal) * 100) / 100,
      dti_ratio_percent: Math.round(dtiRatio * 10) / 10,
      max_eligible_amount: maxEligibleAmount,
      status,
      risk_level: riskLevel,
      message,
    },
  });
};

/**
 * @route   POST /api/loans/apply
 * @desc    Apply for a new loan
 */
export const applyLoan = async (req, res, next) => {
  try {
    let { account_id, loan_type, amount, term_months, monthly_income, annual_rate = 8.50 } = req.body;

    const principal = parseFloat(amount);
    const months = parseInt(term_months, 10);
    const income = parseFloat(monthly_income);

    // If account_id not supplied, auto-pick user's primary account
    if (!account_id) {
      const [userAccs] = await query('SELECT id, user_id FROM accounts WHERE user_id = ?', [req.user.id]);
      if (userAccs && userAccs.length > 0) {
        account_id = userAccs[0].id;
      }
    }

    if (!account_id || !loan_type || !principal || !months || !income) {
      return res.status(400).json({ success: false, message: 'All application fields are mandatory.' });
    }

    // Verify account belongs to user or user is admin
    const [accRows] = await query('SELECT id, user_id FROM accounts WHERE id = ?', [Number(account_id)]);
    if (!accRows || accRows.length === 0 || (accRows[0].user_id !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'Invalid or unauthorized disbursement account.' });
    }

    const emi = calculateEMI(principal, annual_rate, months);

    const [result] = await query(
      `INSERT INTO loans (user_id, account_id, loan_type, amount, interest_rate, term_months, monthly_income, monthly_emi, status, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [req.user.id, Number(account_id), loan_type, principal, annual_rate, months, income, emi, 'Application under review.']
    );

    // Audit log
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [req.user.id, 'LOAN_APPLICATION_SUBMITTED', clientIp, `Applied for ${loan_type} of $${principal.toFixed(2)} (Loan #${result.insertId})`]
    );

    res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully! It has been dispatched to the Bank Admin queue.',
      loan_id: result.insertId,
      monthly_emi: emi,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/loans/my
 * @desc    Get all loans applied by current user
 */
export const getMyLoans = async (req, res, next) => {
  try {
    const [loans] = await query(
      `SELECT l.*, a.account_number 
       FROM loans l 
       JOIN accounts a ON l.account_id = a.id 
       WHERE l.user_id = ? 
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ success: true, count: loans.length, loans });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/loans/all
 * @desc    (Admin) Get all customer loans
 */
export const getAllLoans = async (req, res, next) => {
  try {
    const [loans] = await query(
      `SELECT l.*, u.full_name AS applicant_name, u.email AS applicant_email, a.account_number 
       FROM loans l 
       JOIN users u ON l.user_id = u.id 
       JOIN accounts a ON l.account_id = a.id 
       ORDER BY l.created_at DESC`
    );

    res.status(200).json({ success: true, count: loans.length, loans });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/loans/:id/status
 * @desc    (Admin) Approve or Reject loan application
 */
export const updateLoanStatus = async (req, res, next) => {
  const conn = await getConnection();
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      conn.release();
      return res.status(400).json({ success: false, message: 'Status must be either approved or rejected.' });
    }

    await conn.beginTransaction();

    const [loanRows] = await conn.execute('SELECT * FROM loans WHERE id = ?', [Number(id)]);
    if (!loanRows || loanRows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Loan application not found.' });
    }

    const loan = loanRows[0];
    if (loan.status !== 'pending') {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ success: false, message: `Loan #${id} has already been marked as ${loan.status}.` });
    }

    // Update loan status
    await conn.execute('UPDATE loans SET status = ?, remarks = ? WHERE id = ?', [status, remarks || '', Number(id)]);

    // If approved, disburse funds directly to applicant account!
    if (status === 'approved') {
      const [accRows] = await conn.execute('SELECT id, balance FROM accounts WHERE id = ?', [loan.account_id]);
      if (accRows && accRows.length > 0) {
        const newBalance = Number(accRows[0].balance) + Number(loan.amount);
        await conn.execute('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, loan.account_id]);

        // Record loan disbursement transaction
        await conn.execute(
          `INSERT INTO transactions (from_account_id, to_account_id, transaction_type, amount, description, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [null, loan.account_id, 'deposit', Number(loan.amount), `Loan Disbursement: ${loan.loan_type} (#${loan.id})`, 'completed']
        );
      }
    }

    // Audit log
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await conn.execute(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [req.user.id, `ADMIN_LOAN_${status.toUpperCase()}`, clientIp, `Admin ${req.user.email} marked Loan #${id} as ${status.toUpperCase()}. Notes: ${remarks || 'None'}`]
    );

    await conn.commit();
    conn.release();

    res.status(200).json({
      success: true,
      message: `Loan #${id} has been successfully ${status}!`,
      status,
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    next(error);
  }
};
