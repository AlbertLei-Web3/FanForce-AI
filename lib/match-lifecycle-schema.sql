-- Match Lifecycle Management Schema
-- 比赛生命周期管理架构
-- 
-- This schema adds support for:
-- 此架构添加对以下功能的支持：
-- 1. Event Application approval workflow
--    活动申请审批工作流
-- 2. Match status transitions (draft -> pre-match -> active -> completed)
--    比赛状态转换（草稿 -> 赛前 -> 进行中 -> 已完成）
-- 3. Admin CHZ pool injection and management
--    管理员CHZ池注入和管理
-- 4. Fee rules application during approval
--    审批期间的手续费规则应用
-- 5. Recent Events display for ambassadors
--    大使的最近活动显示

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enhanced Events Table
-- 增强的活动表
-- Add missing fields for match lifecycle management
-- 添加比赛生命周期管理的缺失字段
ALTER TABLE events ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES event_applications(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_status VARCHAR(20) DEFAULT 'draft' CHECK (match_status IN ('draft', 'pre_match', 'active', 'completed', 'cancelled'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS pool_injected_chz DECIMAL(18,8) DEFAULT 0.0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS pool_injection_time TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS pool_injected_by UUID REFERENCES users(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS fee_rule_id UUID REFERENCES fee_rules(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS support_options JSONB DEFAULT '{}'; -- {team_a_coefficient: 1.5, team_b_coefficient: 1.2}
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_result VARCHAR(20) CHECK (match_result IN ('team_a_wins', 'team_b_wins', 'draw', 'cancelled'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS result_announced_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_pool_amount DECIMAL(18,8) DEFAULT 0.0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_stakes_amount DECIMAL(18,8) DEFAULT 0.0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_rewards_distributed DECIMAL(18,8) DEFAULT 0.0;

-- 2. Event Application Approval Log
-- 活动申请审批日志
-- Track approval process and admin actions
-- 跟踪审批过程和管理员操作
CREATE TABLE IF NOT EXISTS event_approval_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES event_applications(id) NOT NULL,
    event_id UUID REFERENCES events(id),
    admin_id UUID REFERENCES users(id) NOT NULL,
    
    -- Approval Details
    -- 审批详情
    action_type VARCHAR(30) NOT NULL CHECK (action_type IN ('review', 'approve', 'reject', 'request_changes', 'pool_injection', 'fee_rule_assignment')),
    decision VARCHAR(20) CHECK (decision IN ('approved', 'rejected', 'pending_changes')),
    
    -- Pool Injection Details
    -- 池注入详情
    injected_chz_amount DECIMAL(18,8) DEFAULT 0.0,
    fee_rule_applied UUID REFERENCES fee_rules(id),
    
    -- Support Options Configuration
    -- 支持选项配置
    support_options JSONB DEFAULT '{}', -- {team_a_coefficient: 1.5, team_b_coefficient: 1.2}
    
    -- Admin Notes
    -- 管理员备注
    admin_notes TEXT,
    approval_conditions JSONB DEFAULT '{}',
    
    -- Timestamps
    -- 时间戳
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Match Status Transitions
-- 比赛状态转换
-- Track all status changes for audit purposes
-- 跟踪所有状态变更用于审计目的
CREATE TABLE IF NOT EXISTS match_status_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    
    -- Status Change Details
    -- 状态变更详情
    from_status VARCHAR(20) NOT NULL,
    to_status VARCHAR(20) NOT NULL,
    transition_reason TEXT,
    
    -- Trigger Information
    -- 触发信息
    triggered_by UUID REFERENCES users(id),
    trigger_type VARCHAR(30) CHECK (trigger_type IN ('manual', 'automatic', 'time_based', 'condition_met')),
    
    -- Additional Context
    -- 额外上下文
    context_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CHZ Pool Management
-- CHZ池管理
-- Track pool injections and distributions
-- 跟踪池注入和分配
CREATE TABLE IF NOT EXISTS chz_pool_management (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    
    -- Pool Operation Details
    -- 池操作详情
    operation_type VARCHAR(30) NOT NULL CHECK (operation_type IN ('injection', 'distribution', 'refund', 'fee_collection')),
    amount DECIMAL(18,8) NOT NULL,
    
    -- Operation Context
    -- 操作上下文
    performed_by UUID REFERENCES users(id) NOT NULL,
    operation_reason TEXT,
    
    -- Balance Tracking
    -- 余额跟踪
    pool_balance_before DECIMAL(18,8) NOT NULL,
    pool_balance_after DECIMAL(18,8) NOT NULL,
    
    -- Fee Application
    -- 手续费应用
    fee_rule_id UUID REFERENCES fee_rules(id),
    fee_amount DECIMAL(18,8) DEFAULT 0.0,
    
    -- Transaction Details
    -- 交易详情
    transaction_hash VARCHAR(66), -- For blockchain transactions
    transaction_status VARCHAR(20) DEFAULT 'pending' CHECK (transaction_status IN ('pending', 'completed', 'failed')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Support Options Configuration
-- 支持选项配置
-- Define coefficient options for audience support
-- 定义观众支持的系数选项
CREATE TABLE IF NOT EXISTS support_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    
    -- Support Option Details
    -- 支持选项详情
    option_name VARCHAR(100) NOT NULL,
    option_description TEXT,
    coefficient DECIMAL(5,3) NOT NULL, -- e.g., 1.5 means 50% bonus
    max_supporters INTEGER DEFAULT 0, -- 0 means unlimited
    current_supporters INTEGER DEFAULT 0,
    
    -- Team Association
    -- 团队关联
    team_association VARCHAR(10) CHECK (team_association IN ('team_a', 'team_b', 'neutral')),
    
    -- Status
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audience Support Records
-- 观众支持记录
-- Track audience support choices and rewards
-- 跟踪观众支持选择和奖励
CREATE TABLE IF NOT EXISTS audience_support_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    support_option_id UUID REFERENCES support_options(id) NOT NULL,
    
    -- Support Details
    -- 支持详情
    support_amount DECIMAL(18,8) NOT NULL,
    support_coefficient DECIMAL(5,3) NOT NULL,
    support_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Reward Calculation
    -- 奖励计算
    potential_reward DECIMAL(18,8) DEFAULT 0.0,
    actual_reward DECIMAL(18,8) DEFAULT 0.0,
    reward_distributed BOOLEAN DEFAULT FALSE,
    reward_distribution_time TIMESTAMP,
    
    -- Status
    -- 状态
    support_status VARCHAR(20) DEFAULT 'active' CHECK (support_status IN ('active', 'cancelled', 'refunded')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
-- 创建性能索引
CREATE INDEX IF NOT EXISTS idx_events_application_id ON events(application_id);
CREATE INDEX IF NOT EXISTS idx_events_match_status ON events(match_status);
CREATE INDEX IF NOT EXISTS idx_events_pool_injected_by ON events(pool_injected_by);
CREATE INDEX IF NOT EXISTS idx_event_approval_log_application ON event_approval_log(application_id);
CREATE INDEX IF NOT EXISTS idx_event_approval_log_admin ON event_approval_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_event_approval_log_action_type ON event_approval_log(action_type);
CREATE INDEX IF NOT EXISTS idx_match_status_transitions_event ON match_status_transitions(event_id);
CREATE INDEX IF NOT EXISTS idx_match_status_transitions_status ON match_status_transitions(to_status);
CREATE INDEX IF NOT EXISTS idx_chz_pool_management_event ON chz_pool_management(event_id);
CREATE INDEX IF NOT EXISTS idx_chz_pool_management_operation ON chz_pool_management(operation_type);
CREATE INDEX IF NOT EXISTS idx_support_options_event ON support_options(event_id);
CREATE INDEX IF NOT EXISTS idx_support_options_active ON support_options(is_active);
CREATE INDEX IF NOT EXISTS idx_audience_support_records_event ON audience_support_records(event_id);
CREATE INDEX IF NOT EXISTS idx_audience_support_records_user ON audience_support_records(user_id);

-- Create triggers for updated_at timestamps
-- 创建updated_at时间戳触发器
CREATE TRIGGER update_chz_pool_management_updated_at 
    BEFORE UPDATE ON chz_pool_management 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_options_updated_at 
    BEFORE UPDATE ON support_options 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audience_support_records_updated_at 
    BEFORE UPDATE ON audience_support_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create event from approved application
-- 创建从已批准申请自动创建活动的函数
CREATE OR REPLACE FUNCTION create_event_from_application(application_id_param UUID)
RETURNS UUID AS $$
DECLARE
    new_event_id UUID;
    app_record RECORD;
BEGIN
    -- Get application details
    -- 获取申请详情
    SELECT * INTO app_record FROM event_applications WHERE id = application_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found: %', application_id_param;
    END IF;
    
    -- Create new event
    -- 创建新活动
    INSERT INTO events (
        application_id,
        ambassador_id,
        title,
        description,
        event_date,
        registration_deadline,
        status,
        match_status,
        created_at,
        updated_at
    ) VALUES (
        application_id_param,
        app_record.ambassador_id,
        app_record.event_title,
        app_record.event_description,
        app_record.event_start_time,
        app_record.event_start_time - INTERVAL '1 hour', -- Registration deadline 1 hour before event
        'active',
        'pre_match',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO new_event_id;
    
    -- Log the status transition
    -- 记录状态转换
    INSERT INTO match_status_transitions (
        event_id,
        from_status,
        to_status,
        transition_reason,
        triggered_by,
        trigger_type
    ) VALUES (
        new_event_id,
        'draft',
        'pre_match',
        'Event created from approved application',
        app_record.ambassador_id,
        'manual'
    );
    
    RETURN new_event_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update match status
-- 创建更新比赛状态的函数
CREATE OR REPLACE FUNCTION update_match_status(
    event_id_param UUID,
    new_status VARCHAR(20),
    admin_id_param UUID DEFAULT NULL,
    reason_param TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_status VARCHAR(20);
    transition_id UUID;
BEGIN
    -- Get current status
    -- 获取当前状态
    SELECT match_status INTO current_status FROM events WHERE id = event_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found: %', event_id_param;
    END IF;
    
    -- Update event status
    -- 更新活动状态
    UPDATE events 
    SET match_status = new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = event_id_param;
    
    -- Log the transition
    -- 记录转换
    INSERT INTO match_status_transitions (
        event_id,
        from_status,
        to_status,
        transition_reason,
        triggered_by,
        trigger_type
    ) VALUES (
        event_id_param,
        current_status,
        new_status,
        reason_param,
        admin_id_param,
        'manual'
    ) RETURNING id INTO transition_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to inject CHZ pool
-- 创建注入CHZ池的函数
CREATE OR REPLACE FUNCTION inject_chz_pool(
    event_id_param UUID,
    amount_param DECIMAL(18,8),
    admin_id_param UUID,
    fee_rule_id_param UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    current_balance DECIMAL(18,8);
    new_balance DECIMAL(18,8);
    pool_record_id UUID;
BEGIN
    -- Get current pool balance
    -- 获取当前池余额
    SELECT COALESCE(pool_injected_chz, 0) INTO current_balance 
    FROM events WHERE id = event_id_param;
    
    -- Calculate new balance
    -- 计算新余额
    new_balance := current_balance + amount_param;
    
    -- Update event pool
    -- 更新活动池
    UPDATE events 
    SET pool_injected_chz = new_balance,
        pool_injection_time = CURRENT_TIMESTAMP,
        pool_injected_by = admin_id_param,
        fee_rule_id = COALESCE(fee_rule_id_param, fee_rule_id),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = event_id_param;
    
    -- Record pool management transaction
    -- 记录池管理交易
    INSERT INTO chz_pool_management (
        event_id,
        operation_type,
        amount,
        performed_by,
        operation_reason,
        pool_balance_before,
        pool_balance_after,
        fee_rule_id,
        transaction_status
    ) VALUES (
        event_id_param,
        'injection',
        amount_param,
        admin_id_param,
        'Admin pool injection for event approval',
        current_balance,
        new_balance,
        fee_rule_id_param,
        'completed'
    ) RETURNING id INTO pool_record_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create view for ambassador recent events
-- 创建大使最近活动视图
CREATE OR REPLACE VIEW ambassador_recent_events AS
SELECT 
    e.id as event_id,
    e.title as event_title,
    e.description as event_description,
    e.event_date,
    e.match_status,
    e.pool_injected_chz,
    e.total_pool_amount,
    e.match_result,
    ea.team_a_info,
    ea.team_b_info,
    ea.venue_name,
    ea.venue_capacity,
    u.wallet_address as ambassador_wallet,
    COUNT(ep.id) as total_participants,
    COUNT(assr.id) as total_supporters
FROM events e
LEFT JOIN event_applications ea ON e.application_id = ea.id
LEFT JOIN users u ON e.ambassador_id = u.id
LEFT JOIN event_participants ep ON e.id = ep.event_id
LEFT JOIN audience_support_records assr ON e.id = assr.event_id
WHERE e.match_status IN ('pre_match', 'active', 'completed')
GROUP BY e.id, e.title, e.description, e.event_date, e.match_status, 
         e.pool_injected_chz, e.total_pool_amount, e.match_result,
         ea.team_a_info, ea.team_b_info, ea.venue_name, ea.venue_capacity,
         u.wallet_address;

-- Success message
SELECT 'Match lifecycle schema created successfully!' as message; 