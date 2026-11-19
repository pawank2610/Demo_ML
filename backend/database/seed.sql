-- =====================================================================
-- FinTrack Seed Data
-- =====================================================================

USE fintrack_db;

-- Clear previous data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE fraud_alerts;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE transactions;
TRUNCATE TABLE loans;
TRUNCATE TABLE accounts;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Insert Users (Bcrypt hash for 'Password@123' and 'Admin@123')
-- Default admin: admin@fintrack.com / Admin@123
-- Default customer: john@example.com / Password@123
-- Default customer: sarah@example.com / Password@123
INSERT INTO users (id, full_name, email, password_hash, role, phone, address) VALUES
(1, 'FinTrack SuperAdmin', 'admin@fintrack.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6FeVEJyS9o5i79u/y', 'admin', '+1 800-555-0199', '100 Wall Street, New York, NY'),
(2, 'John Doe', 'john@example.com', '$2a$10$p03z6xeqgq1a9cOlnPjS/ec/e2qYFj97KkC7wZ73q1c8Jv3r7C2yq', 'customer', '+1 555-0144', '742 Evergreen Terrace, Springfield'),
(3, 'Sarah Connor', 'sarah@example.com', '$2a$10$p03z6xeqgq1a9cOlnPjS/ec/e2qYFj97KkC7wZ73q1c8Jv3r7C2yq', 'customer', '+1 555-0188', '404 Cyberdyne Way, Los Angeles, CA'),
(4, 'Robert Vance', 'robert@example.com', '$2a$10$p03z6xeqgq1a9cOlnPjS/ec/e2qYFj97KkC7wZ73q1c8Jv3r7C2yq', 'customer', '+1 555-0192', '12 Scranton Business Park, PA');

-- 2. Insert Accounts
INSERT INTO accounts (id, user_id, account_number, account_type, balance, status) VALUES
(1, 2, 'FT100101', 'savings', 14250.00, 'active'),
(2, 2, 'FT100102', 'checking', 3500.00, 'active'),
(3, 3, 'FT100103', 'savings', 8700.00, 'active'),
(4, 4, 'FT100104', 'savings', 25400.00, 'active');

-- 3. Insert Transactions
INSERT INTO transactions (id, from_account_id, to_account_id, transaction_type, amount, description, status, created_at) VALUES
(1, NULL, 1, 'deposit', 15000.00, 'Initial Account Opening Deposit', 'completed', NOW() - INTERVAL 10 DAY),
(2, NULL, 3, 'deposit', 10000.00, 'Direct Payroll Deposit', 'completed', NOW() - INTERVAL 8 DAY),
(3, 1, 3, 'transfer', 750.00, 'Apartment Maintenance Share', 'completed', NOW() - INTERVAL 5 DAY),
(4, 3, 1, 'transfer', 200.00, 'Dinner Bill Split', 'completed', NOW() - INTERVAL 3 DAY),
(5, 1, 4, 'transfer', 12500.00, 'Business Equipment Purchase - Flagged Threshold', 'flagged', NOW() - INTERVAL 1 DAY),
(6, 4, NULL, 'withdrawal', 1000.00, 'ATM Cash Withdrawal', 'completed', NOW() - INTERVAL 6 HOUR);

-- 4. Insert Loans
INSERT INTO loans (id, user_id, account_id, loan_type, amount, interest_rate, term_months, monthly_income, monthly_emi, status, remarks) VALUES
(1, 2, 1, 'Personal Loan', 15000.00, 8.50, 24, 6500.00, 681.87, 'approved', 'Verified employment & income documents. Credit score: 760.'),
(2, 3, 3, 'Home Renovation Loan', 40000.00, 7.25, 60, 8200.00, 796.86, 'pending', 'Submitted property valuation estimates, awaiting loan committee approval.'),
(3, 4, 4, 'Business Expansion Loan', 80000.00, 9.00, 48, 14000.00, 1991.65, 'pending', 'Commercial business plan attached.');

-- 5. Insert Fraud Alerts
INSERT INTO fraud_alerts (id, transaction_id, user_id, reason, severity, status, created_at) VALUES
(1, 5, 2, 'High-value transaction detected: $12,500.00 exceeds standard limit of $10,000.', 'high', 'flagged', NOW() - INTERVAL 1 DAY);

-- 6. Insert Audit Logs
INSERT INTO audit_logs (id, user_id, action, ip_address, details, created_at) VALUES
(1, 1, 'ADMIN_LOGIN', '192.168.1.10', 'Administrator logged into system.', NOW() - INTERVAL 2 DAY),
(2, 2, 'CUSTOMER_LOGIN', '192.168.1.45', 'Customer John Doe authenticated successfully.', NOW() - INTERVAL 1 DAY),
(3, 1, 'LOAN_APPROVED', '192.168.1.10', 'Approved Loan #1 for user John Doe ($15,000.00).', NOW() - INTERVAL 1 DAY),
(4, 2, 'FUND_TRANSFER', '192.168.1.45', 'Transferred $12,500.00 from FT100101 to FT100104.', NOW() - INTERVAL 1 DAY);

