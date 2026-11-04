-- FinTrack Database Schema (MySQL)
-- Run this script in MySQL Workbench, phpMyAdmin, or via command line:
-- mysql -u root -p < Fintrack_db.sql

CREATE DATABASE IF NOT EXISTS fintrack_db;
USE fintrack_db;

-- 1. Users Table
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

-- 2. Accounts Table
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
    INDEX idx_account_number (account_number)
) ENGINE=InnoDB;

-- 3. Transactions Table
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
    CONSTRAINT chk_positive_amount CHECK (amount > 0.00)
) ENGINE=InnoDB;

-- 4. Loans Table
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
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Fraud Alerts Table
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NULL,
    user_id INT NULL,
    reason VARCHAR(255) NOT NULL,
    severity ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    status ENUM('flagged', 'reviewed', 'dismissed') NOT NULL DEFAULT 'flagged',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Trigger: High Value Fraud Detection
DELIMITER $$
DROP TRIGGER IF EXISTS trg_after_transaction_fraud_detection$$
CREATE TRIGGER trg_after_transaction_fraud_detection
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    DECLARE v_user_id INT;
    IF NEW.amount >= 10000.00 THEN
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
DELIMITER ;

