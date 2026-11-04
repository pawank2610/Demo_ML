# 🔬 FinTrack – DBMS Concepts & Technical Implementation

This document serves as the academic and technical reference demonstrating the core Database Management Systems (DBMS) principles implemented in **FinTrack**.

---

## 1. ACID Transactions Implementation

Financial systems require strict adherence to **ACID** properties to prevent money loss, double-spending, or race conditions during concurrent transfers.

### Atomicity (All or Nothing)
Every fund transfer requires updating two distinct account records (debit sender, credit recipient) and creating a transaction record. If an error occurs midway, `ROLLBACK` is invoked:

```javascript
const conn = await pool.getConnection();
try {
  await conn.beginTransaction(); // START TRANSACTION

  // 1. Debit sender
  await conn.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, senderId]);

  // 2. Credit receiver
  await conn.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, recipientId]);

  // 3. Record ledger entry
  await conn.execute('INSERT INTO transactions (...) VALUES (...)');

  await conn.commit(); // COMMIT TRANSACTION
} catch (error) {
  await conn.rollback(); // ROLLBACK ON ANY ERROR
  throw error;
} finally {
  conn.release();
}
```

### Consistency (Preserving Invariants)
- The database schema enforces `CHECK (balance >= 0)`.
- The application executes a pre-flight balance check:
  $$\text{Current Balance} \ge \text{Transfer Amount}$$
- The sum of money in the system before and after a peer-to-peer transfer remains strictly identical ($\sum \text{Balances}_{\text{before}} = \sum \text{Balances}_{\text{after}}$).

### Isolation (Concurrency Control via Row Locks)
To prevent the "Lost Update" or "Dirty Read" problem when two transfers occur simultaneously from the same account:
```sql
SELECT balance, status FROM accounts WHERE id = ? FOR UPDATE;
```
The `FOR UPDATE` clause places an exclusive **pessimistic row-level lock** on the sender and recipient account rows until the transaction commits or rolls back.

### Durability (Permanent Persistence)
Once `conn.commit()` succeeds, the transaction is permanently written to the MySQL InnoDB Write-Ahead Log (WAL) and disk tables, ensuring data survives server crashes or restarts.

---

## 2. SQL Triggers

### Trigger 1: Automated Fraud Detection
**Objective:** Automatically flag transactions exceeding the bank's security threshold ($10,000.00) directly at the database engine level.

```sql
DELIMITER $$
CREATE TRIGGER trg_after_transaction_fraud_detection
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    IF NEW.amount >= 10000.00 THEN
        IF NEW.from_account_id IS NOT NULL THEN
            SELECT user_id INTO v_user_id FROM accounts WHERE id = NEW.from_account_id LIMIT 1;
        END IF;

        INSERT INTO fraud_alerts (transaction_id, user_id, reason, severity, status, created_at)
        VALUES (
            NEW.id,
            v_user_id,
            CONCAT('High-value transaction detected: $', FORMAT(NEW.amount, 2), ' exceeds threshold.'),
            'high',
            'flagged',
            NOW()
        );
    END IF;
END$$
DELIMITER ;
```

### Trigger 2: Loan Status Audit Trail
**Objective:** Maintain an unalterable audit log when an administrator changes a loan status.

```sql
DELIMITER $$
CREATE TRIGGER trg_after_loan_status_audit
AFTER UPDATE ON loans
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_logs (user_id, action, ip_address, details, created_at)
        VALUES (
            NEW.user_id,
            'LOAN_STATUS_UPDATE',
            '127.0.0.1',
            CONCAT('Loan #', NEW.id, ' status changed from ', UPPER(OLD.status), ' to ', UPPER(NEW.status)),
            NOW()
        );
    END IF;
END$$
DELIMITER ;
```

---

## 3. SQL Views & Aggregations

### View 1: Customer Account Summary
Demonstrates `LEFT JOIN`, `COALESCE`, and `GROUP BY` aggregate functions:

```sql
CREATE OR REPLACE VIEW view_customer_account_summary AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.email,
    a.account_number,
    a.balance,
    COALESCE(COUNT(DISTINCT l.id), 0) AS total_loans,
    COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.amount ELSE 0 END), 0) AS total_active_loans
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
LEFT JOIN loans l ON u.id = l.user_id
WHERE u.role = 'customer'
GROUP BY u.id, u.full_name, u.email, a.account_number, a.balance;
```

---

## 4. Database Security & Access Control

1. **Password Hashing**: Passwords are never stored in plaintext; salted and hashed using **Bcrypt** ($cost = 10$).
2. **Stateless JWT Authorization**: API requests are protected via JSON Web Tokens bearing encrypted user identifiers and role claims (`customer` vs `admin`).
3. **Role-Based Access Control (RBAC)**: Admin endpoints (`/api/admin/*`, `/api/fraud/*`, `/api/audit/*`) are protected by `adminOnly` middleware verifying credentials against the database.
4. **Prepared Statements**: All SQL queries utilize parameterized placeholders (`?`) preventing **SQL Injection (SQLi)** vulnerabilities.

