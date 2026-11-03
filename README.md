# 🏦 FinTrack – Smart Digital Banking & Loan Management System

FinTrack is an enterprise-grade digital banking and loan management web application engineered with a strong foundation in **Database Management Systems (DBMS)** concepts. It demonstrates real-world financial architectures including **3NF relational database design**, **ACID-compliant fund transfers**, **automated fraud surveillance triggers**, and **role-based security**.

---

## 🌟 Key Highlights

- **Dual Persona Banking**:
  - **Customer Portal**: Account balance dashboard, instant peer-to-peer transfers, full transaction ledger, and interactive loan eligibility calculator.
  - **Bank Admin Portal**: Executive banking metrics, customer account freeze/unfreeze controls, loan application review & disbursement queue, automated fraud monitor, and security audit logs.
- **Relational DBMS & MySQL Focus**:
  - 6 Normalized tables (`users`, `accounts`, `transactions`, `loans`, `audit_logs`, `fraud_alerts`).
  - Row-Level Locks (`SELECT ... FOR UPDATE`) and ACID transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
  - Automated Database Triggers for high-value fraud detection and audit logging.
  - Resilience fallback: Can connect directly to local MySQL (`fintrack_db`), or run out-of-the-box with persistent demo simulation if MySQL is offline.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite 5, Tailwind CSS v4, Lucide React, Axios, React Router DOM 6 |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MySQL (`fintrack_db`) with `mysql2/promise` connection pool |
| **Security** | JWT Authentication, Bcrypt Password Hashing, RBAC |

---

## 📂 Project Architecture

```
FinTrack/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL Pool & Resilient Fallback
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, JWT Issuance
│   │   ├── accountController.js  # Account Details, Deposit, Lookup
│   │   ├── transactionController.js # ACID Fund Transfer Engine
│   │   ├── loanController.js     # Eligibility Calculation & Approvals
│   │   ├── fraudController.js    # Suspicious Activity Surveillance
│   │   ├── auditController.js    # Security & Activity Audit Trail
│   │   └── adminController.js    # Banking Metrics & Account Controls
│   ├── database/
│   │   ├── schema.sql            # MySQL DDL (6 Tables, Views, Triggers)
│   │   ├── seed.sql              # Mock banking data
│   │   ├── initDb.js             # Automated DB Setup Script
│   │   └── mockFallback.js       # In-memory simulator for offline DB
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT & Admin Verification
│   │   └── errorMiddleware.js    # Centralized Error Handlers
│   ├── routes/                   # Modular API Endpoints
│   ├── .env                      # Environment Variables
│   ├── package.json
│   └── server.js                 # Express Application Entrypoint
│
└── frontend/
    ├── src/
    │   ├── components/           # Navbar, Sidebar, ProtectedRoute, ReceiptModal
    │   ├── context/              # AuthContext (with 1-Click Persona Switcher)
    │   ├── pages/                # Customer Dashboard, Transfer, History, Loans
    │   │   └── admin/            # Executive Overview, Loans, Fraud, Audit
    │   ├── services/             # Axios instance & token interceptors
    │   ├── App.jsx               # Client Routing & Navigation
    │   ├── main.jsx
    │   └── index.css             # Tailwind v4 Styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Database Setup (MySQL)
Make sure your MySQL server is running (e.g. via MySQL Workbench, XAMPP, or command-line), then initialize `fintrack_db`:

```powershell
# From the project root:
cd FinTrack/backend
npm run db:init
```

> **Note**: If MySQL is not running on your computer, FinTrack's built-in **Resilient Engine** will automatically start in simulation mode so you can immediately test all features without interruption!

### 2. Start Backend Server
```powershell
cd FinTrack/backend
npm run dev
# Server will run at: http://localhost:5000
```

### 3. Start Frontend App
```powershell
cd FinTrack/frontend
npm run dev
# Frontend will run at: http://localhost:3000
```

---

## 🔑 Demo Login Credentials

The application includes instant **1-Click Demo Login** buttons on the sign-in screen and the top navbar:

| Role | Email | Password | Features Available |
|---|---|---|---|
| **Customer (John Doe)** | `john@example.com` | `Password@123` | Balance: $14,250.00, Account `FT100101`, Transfers, Loans |
| **Customer (Sarah Connor)** | `sarah@example.com` | `Password@123` | Balance: $8,700.00, Account `FT100103` |
| **Bank Admin** | `admin@fintrack.com` | `Admin@123` | Full Admin Console, Loan Approvals, Fraud Surveillance, Audit Logs |

---

## 📚 DBMS Documentation
- Detailed ER Diagram and Normalization: [ER_DIAGRAM.md](file:///c:/Users/pawan/OneDrive/Desktop/FinTrack%20%E2%80%93%20Smart%20Digital%20Banking%20%26%20Loan%20Management%20System/ER_DIAGRAM.md)
- Complete DBMS Concepts & ACID Analysis: [DBMS_CONCEPTS.md](file:///c:/Users/pawan/OneDrive/Desktop/FinTrack%20%E2%80%93%20Smart%20Digital%20Banking%20%26%20Loan%20Management%20System/DBMS_CONCEPTS.md)

