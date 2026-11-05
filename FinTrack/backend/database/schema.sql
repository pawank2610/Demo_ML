-- =====================================================================
-- FinTrack – Smart Digital Banking & Loan Management System
-- Database Schema (MySQL)
-- Database Name: fintrack_db
-- Normalized to 3NF with ACID Transactions, Triggers, Views & Audit Logs
-- =====================================================================

CREATE DATABASE IF NOT EXISTS fintrack_db;
USE fintrack_db;

-- -----------------------------------------------------
-- 1. Table: users
-- Stores customer and administrator profile & auth credentials
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 2. Table: accounts
-- Stores bank accounts, balances, and account statuses
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type ENUM('savings', 'checking') NOT NULL DEFAULT 'savings',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'frozen', 'closed') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_positive_balance CHECK (balance >= 0.00),
    INDEX idx_account_number (account_number),
    INDEX idx_user_account (user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 3. Table: transactions
-- Stores deposits, withdrawals, and account-to-account transfers
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account_id INT NULL,
    to_account_id INT NULL,
    transaction_type ENUM('transfer', 'deposit', 'withdrawal') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    status ENUM('completed', 'failed', 'flagged') NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    CONSTRAINT chk_positive_amount CHECK (amount > 0.00),
    INDEX idx_tx_from (from_account_id),
    INDEX idx_tx_to (to_account_id),
    INDEX idx_tx_created (created_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 4. Table: loans
-- Stores customer loan applications, approval status & terms
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_id INT NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 8.50,
    term_months INT NOT NULL,
    monthly_income DECIMAL(15, 2) NOT NULL,
    monthly_emi DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    INDEX idx_loan_user (user_id),
    INDEX idx_loan_status (status)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 5. Table: audit_logs
-- Maintains system-wide audit records of logins & sensitive actions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 6. Table: fraud_alerts
-- Stores automated alerts for unusual or high-risk transactions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NULL,
    user_id INT NULL,
    reason VARCHAR(255) NOT NULL,
    severity ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    status ENUM('flagged', 'reviewed', 'dismissed') NOT NULL DEFAULT 'flagged',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_fraud_status (status)
) ENGINE=InnoDB;

-- =====================================================================
-- DATABASE VIEWS (SQL Views for Reporting & Aggregations)
-- =====================================================================

-- View 1: Customer Account Summary
CREATE OR REPLACE VIEW view_customer_account_summary AS
SELECT 
    u.id AS user_id,
    u.full_name,
    u.email,
    u.phone,
    a.id AS account_id,
    a.account_number,
    a.account_type,
    a.balance,
    a.status AS account_status,
    COALESCE(COUNT(DISTINCT l.id), 0) AS total_loans,
    COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.amount ELSE 0 END), 0) AS total_active_loan_amount
FROM users u
LEFT JOIN accounts a ON u.id = a.user_id
LEFT JOIN loans l ON u.id = l.user_id
WHERE u.role = 'customer'
GROUP BY u.id, u.full_name, u.email, u.phone, a.id, a.account_number, a.account_type, a.balance, a.status;

-- View 2: Suspicious Activity Monitor View
CREATE OR REPLACE VIEW view_suspicious_activity AS
SELECT 
    fa.id AS alert_id,
    fa.reason,
    fa.severity,
    fa.status AS alert_status,
    fa.created_at AS alert_time,
    t.id AS transaction_id,
    t.amount,
    t.transaction_type,
    u.full_name AS customer_name,
    u.email AS customer_email,
    a.account_number
FROM fraud_alerts fa
LEFT JOIN transactions t ON fa.transaction_id = t.id
LEFT JOIN accounts a ON t.from_account_id = a.id
LEFT JOIN users u ON a.user_id = u.id;

-- =====================================================================
-- TRIGGERS (Automated Fraud Detection & Audit Logging)
-- =====================================================================

DELIMITER $$

-- Trigger 1: Automatically flag transactions exceeding threshold (>= $10,000)
DROP TRIGGER IF EXISTS trg_after_transaction_fraud_detection$$
CREATE TRIGGER trg_after_transaction_fraud_detection
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    
    -- High value threshold check ($10,000 / standard banking high threshold)
    IF NEW.amount >= 10000.00 THEN
        -- Find user_id from sender account or receiver account
        IF NEW.from_account_id IS NOT NULL THEN
            SELECT user_id INTO v_user_id FROM accounts WHERE id = NEW.from_account_id LIMIT 1;
        ELSEIF NEW.to_account_id IS NOT NULL THEN
            SELECT user_id INTO v_user_id FROM accounts WHERE id = NEW.to_account_id LIMIT 1;
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

-- Trigger 2: Automatically audit loan status updates (Approve / Reject)
DROP TRIGGER IF EXISTS trg_after_loan_status_audit$$
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
            CONCAT('Loan #', NEW.id, ' status changed from ', UPPER(OLD.status), ' to ', UPPER(NEW.status), '. Remarks: ', COALESCE(NEW.remarks, 'None')),
            NOW()
        );
    END IF;
END$$

DELIMITER ;

