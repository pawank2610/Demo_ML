# 📊 FinTrack – Entity Relationship (ER) Diagram & Schema Design

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : "owns (1:N)"
    USERS ||--o{ LOANS : "applies_for (1:N)"
    USERS ||--o{ AUDIT_LOGS : "triggers (1:N)"
    USERS ||--o{ FRAUD_ALERTS : "associated_with (1:N)"

    ACCOUNTS ||--o{ TRANSACTIONS : "source_account (1:N)"
    ACCOUNTS ||--o{ TRANSACTIONS : "destination_account (1:N)"
    ACCOUNTS ||--o{ LOANS : "disbursement_account (1:N)"

    TRANSACTIONS ||--o| FRAUD_ALERTS : "flags (1:1)"

    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        enum role "customer | admin"
        string phone
        text address
        timestamp created_at
        timestamp updated_at
    }

    ACCOUNTS {
        int id PK
        int user_id FK
        string account_number UK
        enum account_type "savings | checking"
        decimal balance "CHECK >= 0"
        enum status "active | frozen | closed"
        timestamp created_at
        timestamp updated_at
    }

    TRANSACTIONS {
        int id PK
        int from_account_id FK
        int to_account_id FK
        enum transaction_type "transfer | deposit | withdrawal"
        decimal amount "CHECK > 0"
        string description
        enum status "completed | failed | flagged"
        timestamp created_at
    }

    LOANS {
        int id PK
        int user_id FK
        int account_id FK
        string loan_type
        decimal amount
        decimal interest_rate
        int term_months
        decimal monthly_income
        decimal monthly_emi
        enum status "pending | approved | rejected"
        text remarks
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string ip_address
        text details
        timestamp created_at
    }

    FRAUD_ALERTS {
        int id PK
        int transaction_id FK
        int user_id FK
        string reason
        enum severity "low | medium | high"
        enum status "flagged | reviewed | dismissed"
        timestamp created_at
    }
```

---

## 2. Relational Normalization (Up to 3NF)

### 1NF (First Normal Form)
- Every column contains **atomic (indivisible) values**.
- There are **no repeating groups** or arrays stored inside fields.
- Each table possesses a unique Primary Key (`id`).

### 2NF (Second Normal Form)
- Satisfies 1NF.
- There are **no partial dependencies**: every non-prime attribute is fully functionally dependent on the entire Primary Key.
- Composite relationships (e.g. Account-to-Account transactions) are normalized into a standalone `transactions` relation referencing foreign keys `from_account_id` and `to_account_id`.

### 3NF (Third Normal Form)
- Satisfies 2NF.
- There are **no transitive dependencies**: non-prime attributes do not depend on other non-prime attributes ($X \to Y \to Z$).
- User contact info (`phone`, `address`) lives in `users`, not duplicated inside `accounts` or `transactions`.
- Account balance and state reside strictly in `accounts`, avoiding redundant denormalized copies.

---

## 3. Integrity Constraints & Business Rules

1. **Domain Integrity**:
   - `accounts.balance >= 0.00` enforced by `chk_positive_balance`.
   - `transactions.amount > 0.00` enforced by `chk_positive_amount`.
2. **Referential Integrity**:
   - Foreign Keys with explicit `ON DELETE CASCADE` or `ON DELETE SET NULL`.
3. **Entity Integrity**:
   - Unique constraints on `users.email` and `accounts.account_number`.

