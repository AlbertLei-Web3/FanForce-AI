-- Enhanced Admin Database Schema
-- 增强的管理员数据库架构
-- This file extends the basic schema with admin-specific functionality
-- 此文件使用管理员特定功能扩展基本架构
-- 
-- Related files:
-- - lib/basic-schema.sql: Core database schema
-- - app/dashboard/admin/page.tsx: Admin dashboard interface
-- - app/api/admin/*: Admin API endpoints
-- 
-- 相关文件：
-- - lib/basic-schema.sql: 核心数据库架构
-- - app/dashboard/admin/page.tsx: 管理员仪表板界面
-- - app/api/admin/*: 管理员API端点

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- System Configuration Table
-- 系统配置表
-- Stores global system settings and fee rules
-- 存储全局系统设置和手续费规则
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fee Rules Configuration
-- 手续费规则配置
-- Stores fee percentages and distribution rules
-- 存储手续费百分比和分配规则
CREATE TABLE IF NOT EXISTS fee_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(100) NOT NULL,
    staking_fee_percent DECIMAL(5,2) DEFAULT 5.00,
    withdrawal_fee_percent DECIMAL(5,2) DEFAULT 2.00,
    distribution_fee_percent DECIMAL(5,2) DEFAULT 3.00,
    ambassador_share_percent DECIMAL(5,2) DEFAULT 1.00,
    athlete_share_percent DECIMAL(5,2) DEFAULT 1.00,
    community_fund_percent DECIMAL(5,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Management Log
-- 用户管理日志
-- Tracks user registration, approvals, and status changes
-- 跟踪用户注册、批准和状态变更
CREATE TABLE IF NOT EXISTS user_management_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('registration', 'approval', 'rejection', 'disable', 'enable', 'role_change')),
    action_details JSONB DEFAULT '{}',
    admin_id UUID REFERENCES users(id),
    auto_approved BOOLEAN DEFAULT TRUE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CHZ Pool Monitoring
-- CHZ池监控
-- Tracks staked test CHZ balances and pool status
-- 跟踪质押的测试CHZ余额和池状态
CREATE TABLE IF NOT EXISTS chz_pool_monitor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_address VARCHAR(42) NOT NULL,
    total_staked_chz DECIMAL(18,8) DEFAULT 0.0,
    total_fees_collected DECIMAL(18,8) DEFAULT 0.0,
    available_for_withdrawal DECIMAL(18,8) DEFAULT 0.0,
    total_rewards_distributed DECIMAL(18,8) DEFAULT 0.0,
    pool_health_score INTEGER DEFAULT 100,
    last_contract_sync TIMESTAMP,
    monitoring_status VARCHAR(20) DEFAULT 'active' CHECK (monitoring_status IN ('active', 'paused', 'maintenance')),
    alert_threshold DECIMAL(18,8) DEFAULT 1000.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Dashboard Stats
-- 管理员仪表板统计
-- Cached statistics for dashboard performance
-- 缓存的仪表板统计数据以提高性能
CREATE TABLE IF NOT EXISTS admin_dashboard_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_type VARCHAR(50) NOT NULL,
    stat_value DECIMAL(18,8) NOT NULL,
    stat_metadata JSONB DEFAULT '{}',
    period VARCHAR(20) DEFAULT 'daily' CHECK (period IN ('real_time', 'daily', 'weekly', 'monthly')),
    stat_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Registration Queue
-- 用户注册队列
-- Tracks pending user registrations for admin oversight
-- 跟踪待处理的用户注册以供管理员监督
CREATE TABLE IF NOT EXISTS user_registration_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    requested_role VARCHAR(20) NOT NULL CHECK (requested_role IN ('admin', 'ambassador', 'athlete', 'audience')),
    student_id VARCHAR(50),
    profile_data JSONB DEFAULT '{}',
    registration_status VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
    auto_approved BOOLEAN DEFAULT TRUE,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Activity Log
-- 管理员活动日志
-- Tracks all admin actions for audit purposes
-- 跟踪所有管理员操作用于审计目的
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    action_details JSONB DEFAULT '{}',
    affected_user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system configuration
-- 插入默认系统配置
INSERT INTO system_config (config_key, config_value, description, is_active) VALUES
('platform_name', '"FanForce AI"', 'Platform name configuration', TRUE),
('maintenance_mode', 'false', 'Global maintenance mode toggle', TRUE),
('max_concurrent_events', '10', 'Maximum concurrent events allowed', TRUE),
('default_event_capacity', '100', 'Default event capacity', TRUE),
('websocket_enabled', 'true', 'Enable WebSocket real-time features', TRUE)
ON CONFLICT (config_key) DO NOTHING;

-- Insert default fee rules
-- 插入默认手续费规则
INSERT INTO fee_rules (rule_name, staking_fee_percent, withdrawal_fee_percent, distribution_fee_percent, ambassador_share_percent, athlete_share_percent, community_fund_percent, is_active) VALUES
('Default Fee Structure', 5.00, 2.00, 3.00, 1.00, 1.00, 1.00, TRUE)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
-- 创建性能索引
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(config_key);
CREATE INDEX IF NOT EXISTS idx_system_config_active ON system_config(is_active);
CREATE INDEX IF NOT EXISTS idx_fee_rules_active ON fee_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_user_management_log_user_id ON user_management_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_management_log_action_type ON user_management_log(action_type);
CREATE INDEX IF NOT EXISTS idx_chz_pool_monitor_contract ON chz_pool_monitor(contract_address);
CREATE INDEX IF NOT EXISTS idx_chz_pool_monitor_status ON chz_pool_monitor(monitoring_status);
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_stats_type ON admin_dashboard_stats(stat_type);
CREATE INDEX IF NOT EXISTS idx_admin_dashboard_stats_date ON admin_dashboard_stats(stat_date);
CREATE INDEX IF NOT EXISTS idx_user_registration_queue_status ON user_registration_queue(registration_status);
CREATE INDEX IF NOT EXISTS idx_user_registration_queue_wallet ON user_registration_queue(wallet_address);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_type ON admin_activity_log(action_type);

-- Create triggers for updated_at timestamps
-- 创建updated_at时间戳的触发器
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fee_rules_updated_at BEFORE UPDATE ON fee_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chz_pool_monitor_updated_at BEFORE UPDATE ON chz_pool_monitor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_dashboard_stats_updated_at BEFORE UPDATE ON admin_dashboard_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_registration_queue_updated_at BEFORE UPDATE ON user_registration_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for easy admin statistics
-- 创建管理员统计的简化视图
CREATE OR REPLACE VIEW admin_stats_view AS
SELECT 
    'total_users' as stat_name,
    COUNT(*)::DECIMAL(18,8) as stat_value,
    'count' as stat_type,
    CURRENT_DATE as stat_date
FROM users
UNION ALL
SELECT 
    'active_events' as stat_name,
    COUNT(*)::DECIMAL(18,8) as stat_value,
    'count' as stat_type,
    CURRENT_DATE as stat_date
FROM events WHERE status = 'active'
UNION ALL
SELECT 
    'total_transactions' as stat_name,
    COUNT(*)::DECIMAL(18,8) as stat_value,
    'count' as stat_type,
    CURRENT_DATE as stat_date
FROM transactions
UNION ALL
SELECT 
    'total_chz_staked' as stat_name,
    COALESCE(SUM(amount), 0) as stat_value,
    'amount' as stat_type,
    CURRENT_DATE as stat_date
FROM transactions WHERE transaction_type = 'stake' AND status = 'completed';

-- Create function to get current CHZ pool status
-- 创建获取当前CHZ池状态的函数
CREATE OR REPLACE FUNCTION get_chz_pool_status()
RETURNS TABLE (
    total_staked DECIMAL(18,8),
    total_fees DECIMAL(18,8),
    available_withdrawal DECIMAL(18,8),
    pool_health INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(c.total_staked_chz), 0) as total_staked,
        COALESCE(SUM(c.total_fees_collected), 0) as total_fees,
        COALESCE(SUM(c.available_for_withdrawal), 0) as available_withdrawal,
        COALESCE(AVG(c.pool_health_score)::INTEGER, 100) as pool_health
    FROM chz_pool_monitor c
    WHERE c.monitoring_status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Create function to log admin actions
-- 创建记录管理员操作的函数
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action_type VARCHAR(100),
    p_action_details JSONB DEFAULT '{}',
    p_affected_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id VARCHAR(100) DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO admin_activity_log (
        admin_id, action_type, action_details, affected_user_id,
        ip_address, user_agent, session_id, success, error_message
    ) VALUES (
        p_admin_id, p_action_type, p_action_details, p_affected_user_id,
        p_ip_address, p_user_agent, p_session_id, p_success, p_error_message
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql; 