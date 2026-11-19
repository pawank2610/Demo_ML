import bcrypt from 'bcryptjs';

// Pre-seeded mock data for resilient fallback
const defaultPasswordHash = bcrypt.hashSync('Password@123', 10);
const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

const dbState = {
  users: [
    {
      id: 1,
      full_name: 'FinTrack SuperAdmin',
      email: 'admin@fintrack.com',
      password_hash: adminPasswordHash,
      role: 'admin',
      phone: '+1 800-555-0199',
      address: '100 Wall Street, New York, NY',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 2,
      full_name: 'John Doe',
      email: 'john@example.com',
      password_hash: defaultPasswordHash,
      role: 'customer',
      phone: '+1 555-0144',
      address: '742 Evergreen Terrace, Springfield',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 3,
      full_name: 'Sarah Connor',
      email: 'sarah@example.com',
      password_hash: defaultPasswordHash,
      role: 'customer',
      phone: '+1 555-0188',
      address: '404 Cyberdyne Way, Los Angeles, CA',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 4,
      full_name: 'Robert Vance',
      email: 'robert@example.com',
      password_hash: defaultPasswordHash,
      role: 'customer',
      phone: '+1 555-0192',
      address: '12 Scranton Business Park, PA',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  accounts: [
    {
      id: 1,
      user_id: 2,
      account_number: 'FT100101',
      account_type: 'savings',
      balance: 14250.00,
      status: 'active',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 2,
      user_id: 2,
      account_number: 'FT100102',
      account_type: 'checking',
      balance: 3500.00,
      status: 'active',
      created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    },
    {
      id: 3,
      user_id: 3,
      account_number: 'FT100103',
      account_type: 'savings',
      balance: 8700.00,
      status: 'active',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 4,
      user_id: 4,
      account_number: 'FT100104',
      account_type: 'savings',
      balance: 25400.00,
      status: 'active',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
  transactions: [
    {
      id: 1,
      from_account_id: null,
      to_account_id: 1,
      transaction_type: 'deposit',
      amount: 15000.00,
      description: 'Initial Account Opening Deposit',
      status: 'completed',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 2,
      from_account_id: null,
      to_account_id: 3,
      transaction_type: 'deposit',
      amount: 10000.00,
      description: 'Direct Payroll Deposit',
      status: 'completed',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 3,
      from_account_id: 1,
      to_account_id: 3,
      transaction_type: 'transfer',
      amount: 750.00,
      description: 'Apartment Maintenance Share',
      status: 'completed',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 4,
      from_account_id: 3,
      to_account_id: 1,
      transaction_type: 'transfer',
      amount: 200.00,
      description: 'Dinner Bill Split',
      status: 'completed',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 5,
      from_account_id: 1,
      to_account_id: 4,
      transaction_type: 'transfer',
      amount: 12500.00,
      description: 'Business Equipment Purchase - High Value Flagged',
      status: 'flagged',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 6,
      from_account_id: 4,
      to_account_id: null,
      transaction_type: 'withdrawal',
      amount: 1000.00,
      description: 'ATM Cash Withdrawal',
      status: 'completed',
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    },
  ],
  loans: [
    {
      id: 1,
      user_id: 2,
      account_id: 1,
      loan_type: 'Personal Loan',
      amount: 15000.00,
      interest_rate: 8.50,
      term_months: 24,
      monthly_income: 6500.00,
      monthly_emi: 681.87,
      status: 'approved',
      remarks: 'Verified employment & income documents. Credit score: 760.',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: 2,
      user_id: 3,
      account_id: 3,
      loan_type: 'Home Renovation Loan',
      amount: 40000.00,
      interest_rate: 7.25,
      term_months: 60,
      monthly_income: 8200.00,
      monthly_emi: 796.86,
      status: 'pending',
      remarks: 'Property valuation estimates under review.',
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 3,
      user_id: 4,
      account_id: 4,
      loan_type: 'Business Expansion Loan',
      amount: 80000.00,
      interest_rate: 9.00,
      term_months: 48,
      monthly_income: 14000.00,
      monthly_emi: 1991.65,
      status: 'pending',
      remarks: 'Commercial business plan attached.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  audit_logs: [
    {
      id: 1,
      user_id: 1,
      action: 'ADMIN_LOGIN',
      ip_address: '192.168.1.10',
      details: 'Administrator logged into system.',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 2,
      user_id: 2,
      action: 'CUSTOMER_LOGIN',
      ip_address: '192.168.1.45',
      details: 'Customer John Doe authenticated successfully.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 3,
      user_id: 1,
      action: 'LOAN_APPROVED',
      ip_address: '192.168.1.10',
      details: 'Approved Loan #1 for user John Doe ($15,000.00).',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  fraud_alerts: [
    {
      id: 1,
      transaction_id: 5,
      user_id: 2,
      reason: 'High-value transaction detected: $12,500.00 exceeds standard limit of $10,000.',
      severity: 'high',
      status: 'flagged',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
};

let nextIds = {
  users: 5,
  accounts: 5,
  transactions: 7,
  loans: 4,
  audit_logs: 4,
  fraud_alerts: 2,
};

export const mockDb = {
  getState: () => dbState,

  query: async (sql, params = []) => {
    const s = sql.trim().toLowerCase();

    // 1. SELECT user by id (e.g. JWT auth verification)
    if (s.includes('from users') && (s.includes('where id =') || s.includes('where u.id =') || s.includes('id = ?'))) {
      const id = Number(params[0]);
      const user = dbState.users.find((u) => u.id === id);
      return [user ? [user] : []];
    }

    // 2. SELECT all customers (for Admin)
    if (s.includes('from users') && s.includes("role = 'customer'")) {
      const customers = dbState.users
        .filter((u) => u.role === 'customer')
        .map((u) => {
          const accs = dbState.accounts.filter((a) => a.user_id === u.id);
          const totalBalance = accs.reduce((sum, a) => sum + Number(a.balance), 0);
          return {
            ...u,
            accounts: accs,
            total_balance: totalBalance,
            account_id: accs[0]?.id || null,
            account_number: accs[0]?.account_number || 'N/A',
            account_type: accs[0]?.account_type || 'savings',
            balance: accs[0]?.balance || 0,
            account_status: accs[0]?.status || 'N/A',
          };
        });
      return [customers];
    }

    // 3. SELECT user by email or phone
    if (s.includes('from users') && (s.includes('email') || s.includes('phone'))) {
      const ident = params[0]?.toString().toLowerCase().trim();
      const user = dbState.users.find(
        (u) =>
          u.email.toLowerCase() === ident ||
          (u.phone && u.phone.replace(/[\s\-\(\)\+]/g, '') === ident.replace(/[\s\-\(\)\+]/g, ''))
      );
      return [user ? [user] : []];
    }

    // 5. SELECT single account by account ID: "SELECT ... FROM accounts WHERE id = ?"
    if (s.includes('from accounts') && (s.includes('where id =') || s.includes('where a.id =') || s.includes('id = ?'))) {
      const accId = Number(params[0]);
      const acc = dbState.accounts.find((a) => a.id === accId);
      return [acc ? [acc] : []];
    }

    // 6. SELECT accounts by user_id
    if (s.includes('from accounts') && s.includes('user_id =')) {
      const userId = Number(params[0]);
      const accs = dbState.accounts.filter((a) => a.user_id === userId);
      return [accs];
    }

    // 7. SELECT account by account_number
    if (s.includes('from accounts') && s.includes('account_number =')) {
      const accNum = params[0]?.trim();
      const acc = dbState.accounts.find((a) => a.account_number === accNum);
      if (acc) {
        const owner = dbState.users.find((u) => u.id === acc.user_id);
        return [[{ ...acc, holder_name: owner?.full_name || 'Account Holder', owner_name: owner?.full_name }]];
      }
      return [[]];
    }

    // 8. SELECT single loan by ID: "SELECT * FROM loans WHERE id = ?"
    if (s.includes('from loans') && s.includes('where id =')) {
      const loanId = Number(params[0]);
      const loan = dbState.loans.find((l) => l.id === loanId);
      return [loan ? [loan] : []];
    }

    // 9. SELECT loans by user_id: "SELECT ... FROM loans ... WHERE l.user_id = ?"
    if (s.includes('from loans') && (s.includes('where l.user_id =') || s.includes('where user_id =')) && params.length > 0) {
      const userId = Number(params[0]);
      const userLoans = dbState.loans
        .filter((l) => l.user_id === userId)
        .map((l) => {
          const acc = dbState.accounts.find((a) => a.id === l.account_id);
          return {
            ...l,
            account_number: acc?.account_number || 'N/A',
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [userLoans];
    }

    // 10. SELECT all loans (Admin)
    if (s.includes('from loans')) {
      const enriched = dbState.loans
        .map((l) => {
          const user = dbState.users.find((u) => u.id === l.user_id);
          const acc = dbState.accounts.find((a) => a.id === l.account_id);
          return {
            ...l,
            applicant_name: user?.full_name || 'N/A',
            applicant_email: user?.email || 'N/A',
            account_number: acc?.account_number || 'N/A',
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [enriched];
    }

    // 11. SELECT transactions
    if (s.includes('from transactions')) {
      const enriched = dbState.transactions
        .map((t) => {
          const fromAcc = dbState.accounts.find((a) => a.id === t.from_account_id);
          const toAcc = dbState.accounts.find((a) => a.id === t.to_account_id);
          const fromUser = fromAcc ? dbState.users.find((u) => u.id === fromAcc.user_id) : null;
          const toUser = toAcc ? dbState.users.find((u) => u.id === toAcc.user_id) : null;
          return {
            ...t,
            from_account_number: fromAcc?.account_number || null,
            to_account_number: toAcc?.account_number || null,
            sender_name: fromUser?.full_name || null,
            recipient_name: toUser?.full_name || null,
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [enriched];
    }

    // 12. SELECT fraud_alerts
    if (s.includes('from fraud_alerts')) {
      const enriched = dbState.fraud_alerts
        .map((fa) => {
          const user = dbState.users.find((u) => u.id === fa.user_id);
          const tx = dbState.transactions.find((t) => t.id === fa.transaction_id);
          return {
            ...fa,
            customer_name: user?.full_name || 'Unknown User',
            customer_email: user?.email || 'N/A',
            transaction_amount: tx?.amount || 0,
            transaction_type: tx?.transaction_type || 'N/A',
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [enriched];
    }

    // 13. SELECT audit_logs
    if (s.includes('from audit_logs')) {
      const enriched = dbState.audit_logs
        .map((al) => {
          const user = dbState.users.find((u) => u.id === al.user_id);
          return {
            ...al,
            user_name: user?.full_name || 'System / Guest',
            user_role: user?.role || 'system',
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [enriched];
    }

    // 14. Admin dashboard stats aggregations
    if (s.includes('count(*)') && s.includes('users') && s.includes("role = 'customer'")) {
      const custCount = dbState.users.filter((u) => u.role === 'customer').length;
      return [[{ total_customers: custCount }]];
    }
    if (s.includes('sum(balance)') && s.includes('accounts')) {
      const totalDep = dbState.accounts
        .filter((a) => a.status === 'active')
        .reduce((sum, a) => sum + Number(a.balance), 0);
      return [[{ total_deposits: totalDep }]];
    }
    if (s.includes('from loans') && s.includes('pending_loans')) {
      const totalLoans = dbState.loans.length;
      const pendingLoans = dbState.loans.filter((l) => l.status === 'pending').length;
      const disbursedAmount = dbState.loans
        .filter((l) => l.status === 'approved')
        .reduce((sum, l) => sum + Number(l.amount), 0);
      return [[{ total_loans: totalLoans, pending_loans: pendingLoans, disbursed_loan_amount: disbursedAmount }]];
    }
    if (s.includes('from fraud_alerts') && s.includes('unreviewed_alerts')) {
      const totalAlerts = dbState.fraud_alerts.length;
      const unreviewed = dbState.fraud_alerts.filter((fa) => fa.status === 'flagged').length;
      return [[{ total_alerts: totalAlerts, unreviewed_alerts: unreviewed }]];
    }
    if (s.includes('from transactions') && s.includes('total_tx_volume')) {
      const txCount = dbState.transactions.length;
      const txVol = dbState.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      return [[{ total_tx_count: txCount, total_tx_volume: txVol }]];
    }

    // ----------------------------------------------------
    // INSERTS
    // ----------------------------------------------------
    // 15. INSERT INTO users
    if (s.includes('insert into users')) {
      const newUser = {
        id: nextIds.users++,
        full_name: params[0],
        email: params[1],
        password_hash: params[2],
        role: params[3] || 'customer',
        phone: params[4] || '',
        address: params[5] || '',
        created_at: new Date().toISOString(),
      };
      dbState.users.push(newUser);
      return [{ insertId: newUser.id }];
    }

    // 16. INSERT INTO accounts
    if (s.includes('insert into accounts')) {
      const newAcc = {
        id: nextIds.accounts++,
        user_id: Number(params[0]),
        account_number: params[1],
        account_type: params[2] || 'savings',
        balance: Number(params[3]) || 0,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      dbState.accounts.push(newAcc);
      return [{ insertId: newAcc.id }];
    }

    // 17. INSERT INTO loans
    if (s.includes('insert into loans')) {
      const newLoan = {
        id: nextIds.loans++,
        user_id: Number(params[0]),
        account_id: Number(params[1]),
        loan_type: params[2],
        amount: Number(params[3]),
        interest_rate: Number(params[4]),
        term_months: Number(params[5]),
        monthly_income: Number(params[6]),
        monthly_emi: Number(params[7]),
        status: 'pending',
        remarks: params[8] || 'Application submitted for review.',
        created_at: new Date().toISOString(),
      };
      dbState.loans.push(newLoan);
      return [{ insertId: newLoan.id }];
    }

    // 18. INSERT INTO transactions
    if (s.includes('insert into transactions')) {
      const newTx = {
        id: nextIds.transactions++,
        from_account_id: params[0] ? Number(params[0]) : null,
        to_account_id: params[1] ? Number(params[1]) : null,
        transaction_type: params[2],
        amount: Number(params[3]),
        description: params[4] || '',
        status: params[5] || 'completed',
        created_at: new Date().toISOString(),
      };
      dbState.transactions.push(newTx);
      return [{ insertId: newTx.id }];
    }

    // 19. INSERT INTO audit_logs
    if (s.includes('insert into audit_logs')) {
      const newAudit = {
        id: nextIds.audit_logs++,
        user_id: params[0] ? Number(params[0]) : null,
        action: params[1],
        ip_address: params[2] || '127.0.0.1',
        details: params[3] || '',
        created_at: new Date().toISOString(),
      };
      dbState.audit_logs.push(newAudit);
      return [{ insertId: newAudit.id }];
    }

    // 20. INSERT INTO fraud_alerts
    if (s.includes('insert into fraud_alerts')) {
      const newAlert = {
        id: nextIds.fraud_alerts++,
        transaction_id: params[0] ? Number(params[0]) : null,
        user_id: params[1] ? Number(params[1]) : null,
        reason: params[2] || '',
        severity: params[3] || 'high',
        status: params[4] || 'flagged',
        created_at: new Date().toISOString(),
      };
      dbState.fraud_alerts.push(newAlert);
      return [{ insertId: newAlert.id }];
    }

    // ----------------------------------------------------
    // UPDATES
    // ----------------------------------------------------
    // 21. UPDATE accounts SET balance = ? WHERE id = ?
    if (s.includes('update accounts set balance =')) {
      const newBal = Number(params[0]);
      const accId = Number(params[1]);
      const acc = dbState.accounts.find((a) => a.id === accId);
      if (acc) {
        acc.balance = newBal;
      }
      return [{ affectedRows: 1 }];
    }

    // 22. UPDATE accounts SET status = ? WHERE id = ?
    if (s.includes('update accounts set status =')) {
      const newStatus = params[0];
      const accId = Number(params[1]);
      const acc = dbState.accounts.find((a) => a.id === accId);
      if (acc) {
        acc.status = newStatus;
      }
      return [{ affectedRows: 1 }];
    }

    // 23. UPDATE loans SET status = ?, remarks = ? WHERE id = ?
    if (s.includes('update loans set status =')) {
      const status = params[0];
      const remarks = params[1];
      const loanId = Number(params[2]);
      const loan = dbState.loans.find((l) => l.id === loanId);
      if (loan) {
        loan.status = status;
        loan.remarks = remarks;
      }
      return [{ affectedRows: 1 }];
    }

    // 24. UPDATE fraud_alerts SET status = ? WHERE id = ?
    if (s.includes('update fraud_alerts set status =')) {
      const status = params[0];
      const alertId = Number(params[1]);
      const alert = dbState.fraud_alerts.find((fa) => fa.id === alertId);
      if (alert) alert.status = status;
      return [{ affectedRows: 1 }];
    }

    return [[]];
  },

  getConnection: async () => {
    let inTransaction = false;
    let rollbackState = null;

    return {
      beginTransaction: async () => {
        inTransaction = true;
        rollbackState = {
          accounts: JSON.parse(JSON.stringify(dbState.accounts)),
          transactions: JSON.parse(JSON.stringify(dbState.transactions)),
          loans: JSON.parse(JSON.stringify(dbState.loans)),
          fraud_alerts: JSON.parse(JSON.stringify(dbState.fraud_alerts)),
        };
      },
      commit: async () => {
        inTransaction = false;
        rollbackState = null;
      },
      rollback: async () => {
        if (rollbackState) {
          dbState.accounts = rollbackState.accounts;
          dbState.transactions = rollbackState.transactions;
          dbState.loans = rollbackState.loans;
          dbState.fraud_alerts = rollbackState.fraud_alerts;
        }
        inTransaction = false;
      },
      release: () => {},
      execute: async (sql, params = []) => {
        return mockDb.query(sql, params);
      },
      query: async (sql, params = []) => {
        return mockDb.query(sql, params);
      },
    };
  },
};

export default mockDb;
