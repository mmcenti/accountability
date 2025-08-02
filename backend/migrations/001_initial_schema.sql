-- ChainForge Initial Database Schema
-- SQLite with encryption support

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Subscriptions table
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'premium')),
    status TEXT NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'canceled', 'expired')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    trial_start_date DATETIME,
    trial_end_date DATETIME,
    current_period_start DATETIME,
    current_period_end DATETIME,
    canceled_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscriptions
CREATE UNIQUE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Goals table (personal goals)
CREATE TABLE goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount REAL NOT NULL CHECK (target_amount > 0),
    current_amount REAL NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    unit TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fitness', 'health', 'education', 'career', 'finance', 'hobbies', 'relationship', 'personal', 'other')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'canceled')),
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    punishment TEXT,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for goals
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_public ON goals(is_public);

-- Goal progress table
CREATE TABLE goal_progress (
    id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    amount REAL NOT NULL CHECK (amount >= 0),
    note TEXT,
    date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for goal_progress
CREATE INDEX idx_goal_progress_goal ON goal_progress(goal_id);
CREATE INDEX idx_goal_progress_date ON goal_progress(date);
CREATE INDEX idx_goal_progress_goal_date ON goal_progress(goal_id, date);

-- Groups table
CREATE TABLE groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    invite_code TEXT UNIQUE NOT NULL,
    max_members INTEGER NOT NULL CHECK (max_members >= 2 AND max_members <= 100),
    is_private BOOLEAN NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for groups
CREATE UNIQUE INDEX idx_groups_invite_code ON groups(invite_code);
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_status ON groups(status);

-- Group members table
CREATE TABLE group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for group_members
CREATE UNIQUE INDEX idx_group_members_user_group ON group_members(group_id, user_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_active ON group_members(is_active);

-- Group goals table
CREATE TABLE group_goals (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_by TEXT NOT NULL REFERENCES users(id),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for group_goals
CREATE INDEX idx_group_goals_group ON group_goals(group_id);
CREATE INDEX idx_group_goals_active ON group_goals(is_active);
CREATE INDEX idx_group_goals_created_by ON group_goals(created_by);

-- Group goal periods table
CREATE TABLE group_goal_periods (
    id TEXT PRIMARY KEY,
    group_goal_id TEXT NOT NULL REFERENCES group_goals(id) ON DELETE CASCADE,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for group_goal_periods
CREATE INDEX idx_group_goal_periods_goal ON group_goal_periods(group_goal_id);
CREATE INDEX idx_group_goal_periods_dates ON group_goal_periods(start_date, end_date);
CREATE INDEX idx_group_goal_periods_active ON group_goal_periods(is_active);

-- Group goal progress table (individual progress within periods)
CREATE TABLE group_goal_progress (
    id TEXT PRIMARY KEY,
    group_goal_period_id TEXT NOT NULL REFERENCES group_goal_periods(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_amount REAL NOT NULL CHECK (target_amount > 0),
    current_amount REAL NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    penalty_carry_over REAL NOT NULL DEFAULT 0 CHECK (penalty_carry_over >= 0),
    daily_entries TEXT NOT NULL DEFAULT '[]', -- JSON array of daily progress
    is_completed BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for group_goal_progress
CREATE UNIQUE INDEX idx_group_goal_progress_period_user ON group_goal_progress(group_goal_period_id, user_id);
CREATE INDEX idx_group_goal_progress_user ON group_goal_progress(user_id);
CREATE INDEX idx_group_goal_progress_period ON group_goal_progress(group_goal_period_id);
CREATE INDEX idx_group_goal_progress_completed ON group_goal_progress(is_completed);

-- Payment methods table
CREATE TABLE payment_methods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    brand TEXT,
    last4 TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for payment_methods
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default);
CREATE INDEX idx_payment_methods_stripe ON payment_methods(stripe_payment_method_id);

-- Invoices table
CREATE TABLE invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL,
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    paid_at DATETIME,
    due_date DATETIME NOT NULL,
    invoice_url TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for invoices
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_stripe ON invoices(stripe_invoice_id);

-- Subscription usage table
CREATE TABLE subscription_usage (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    personal_goals INTEGER NOT NULL DEFAULT 0,
    group_goals INTEGER NOT NULL DEFAULT 0,
    groups_joined INTEGER NOT NULL DEFAULT 0,
    api_requests INTEGER NOT NULL DEFAULT 0,
    storage_used INTEGER NOT NULL DEFAULT 0,
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for subscription_usage
CREATE INDEX idx_subscription_usage_user ON subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX idx_subscription_usage_period ON subscription_usage(period_start, period_end);

-- Audit log table for important actions
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    entity_type TEXT NOT NULL, -- 'user', 'goal', 'group', etc.
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'create', 'update', 'delete', etc.
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit_logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Triggers for updating timestamps
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_subscriptions_timestamp 
    AFTER UPDATE ON subscriptions
    FOR EACH ROW
BEGIN
    UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_goals_timestamp 
    AFTER UPDATE ON goals
    FOR EACH ROW
BEGIN
    UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_groups_timestamp 
    AFTER UPDATE ON groups
    FOR EACH ROW
BEGIN
    UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_group_members_timestamp 
    AFTER UPDATE ON group_members
    FOR EACH ROW
BEGIN
    UPDATE group_members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_group_goals_timestamp 
    AFTER UPDATE ON group_goals
    FOR EACH ROW
BEGIN
    UPDATE group_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_group_goal_progress_timestamp 
    AFTER UPDATE ON group_goal_progress
    FOR EACH ROW
BEGIN
    UPDATE group_goal_progress SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_payment_methods_timestamp 
    AFTER UPDATE ON payment_methods
    FOR EACH ROW
BEGIN
    UPDATE payment_methods SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger to update goal current_amount when progress is added
CREATE TRIGGER update_goal_progress_amount
    AFTER INSERT ON goal_progress
    FOR EACH ROW
BEGIN
    UPDATE goals 
    SET current_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM goal_progress 
        WHERE goal_id = NEW.goal_id
    )
    WHERE id = NEW.goal_id;
END;

-- Trigger to update goal current_amount when progress is updated
CREATE TRIGGER update_goal_progress_amount_update
    AFTER UPDATE ON goal_progress
    FOR EACH ROW
BEGIN
    UPDATE goals 
    SET current_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM goal_progress 
        WHERE goal_id = NEW.goal_id
    )
    WHERE id = NEW.goal_id;
END;

-- Trigger to update goal current_amount when progress is deleted
CREATE TRIGGER update_goal_progress_amount_delete
    AFTER DELETE ON goal_progress
    FOR EACH ROW
BEGIN
    UPDATE goals 
    SET current_amount = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM goal_progress 
        WHERE goal_id = OLD.goal_id
    )
    WHERE id = OLD.goal_id;
END;