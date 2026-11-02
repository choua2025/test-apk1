-- Tables the backend expects. member_name must be UNIQUE: register relies on
-- ER_DUP_ENTRY to reject duplicate usernames.

CREATE TABLE IF NOT EXISTS member (
    member_id       INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    member_name     VARCHAR(50)   NOT NULL,
    member_password CHAR(60)      NOT NULL, -- bcrypt hash
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_member_name (member_name)
);

CREATE TABLE IF NOT EXISTS customer (
    customer_id   INT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100)  NOT NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
