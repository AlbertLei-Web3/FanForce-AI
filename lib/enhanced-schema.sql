-- Enhanced FanForce AI Database Schema with Contingency Handling
-- 增强版FanForce AI数据库架构，包含突发情况处理
-- 
-- This enhanced schema handles real-world contingencies including:
-- - Substitute players and no-shows
-- - Event cancellations and weather delays
-- - Emergency situations and system failures
-- - Refund processing and compensation
-- 
-- 此增强版架构处理现实世界的突发情况，包括：
-- - 候补球员和缺席情况
-- - 活动取消和天气延误
-- - 紧急情况和系统故障
-- - 退款处理和赔偿

-- Enable UUID extension for generating unique IDs
-- 启用UUID扩展以生成唯一ID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced enumerations for contingency handling
-- 增强的枚举类型用于突发情况处理

-- Player participation status (enhanced)
-- 球员参与状态（增强版）
CREATE TYPE player_participation_status AS ENUM (
    'registered', 'confirmed', 'checked_in', 'no_show', 'late_arrival', 
    'injured', 'substituted', 'disqualified', 'cancelled'
);

-- Event status (enhanced with contingencies)
-- 活动状态（增强版，包含突发情况）
CREATE TYPE enhanced_event_status AS ENUM (
    'draft', 'published', 'active', 'delayed', 'postponed', 'cancelled_weather',
    'cancelled_venue', 'cancelled_insufficient_players', 'cancelled_emergency',
    'completed', 'disputed', 'refunded'
);

-- Refund status enumeration
-- 退款状态枚举
CREATE TYPE refund_status AS ENUM (
    'none', 'requested', 'approved', 'processing', 'completed', 'rejected'
);

-- Emergency type enumeration
-- 紧急情况类型枚举
CREATE TYPE emergency_type AS ENUM (
    'weather', 'venue_unavailable', 'insufficient_players', 'safety_concern',
    'technical_failure', 'security_issue', 'medical_emergency', 'force_majeure'
);

-- Substitute priority enumeration
-- 候补优先级枚举
CREATE TYPE substitute_priority AS ENUM (
    'primary', 'secondary', 'emergency', 'last_resort'
);

-- ========================================
-- ENHANCED ATHLETES TABLE with Availability
-- 增强运动员表，包含可用性信息
-- ========================================
CREATE TABLE enhanced_athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    position VARCHAR(50),
    status athlete_status NOT NULL DEFAULT 'resting',
    
    -- Enhanced availability tracking
    -- 增强的可用性追踪
    is_available BOOLEAN DEFAULT true,
    availability_notes TEXT,
    last_availability_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Reliability metrics (for substitute selection)
    -- 可靠性指标（用于候补选择）
    attendance_rate DECIMAL(5,2) DEFAULT 100.00, -- Percentage attendance - 出勤率
    no_show_count INTEGER DEFAULT 0, -- Number of no-shows - 缺席次数
    substitute_count INTEGER DEFAULT 0, -- Times served as substitute - 担任候补的次数
    reliability_score INTEGER DEFAULT 1000, -- Reliability rating - 可靠性评分
    
    -- Emergency contact information
    -- 紧急联系信息
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    -- Medical information
    -- 医疗信息
    medical_conditions JSONB, -- Known medical conditions - 已知医疗状况
    allergies JSONB, -- Known allergies - 已知过敏
    medical_clearance_date DATE, -- Last medical clearance - 最后医疗许可日期
    
    -- Performance metrics (from base athletes table)
    -- 表现指标（来自基础运动员表）
    skill_level INTEGER DEFAULT 1000,
    ranking_points INTEGER DEFAULT 0,
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    mvp_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SUBSTITUTE PLAYERS TABLE
-- 候补球员表
-- ========================================
CREATE TABLE substitute_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    athlete_id UUID REFERENCES enhanced_athletes(id) NOT NULL,
    team VARCHAR(1) NOT NULL, -- 'A' or 'B' - 'A'或'B'队
    substitute_priority substitute_priority NOT NULL DEFAULT 'primary',
    
    -- Substitute status tracking
    -- 候补状态追踪
    is_activated BOOLEAN DEFAULT false,
    activated_at TIMESTAMP WITH TIME ZONE,
    replaced_athlete_id UUID REFERENCES enhanced_athletes(id), -- Who they replaced - 替换的球员
    replacement_reason TEXT, -- Why substitution was needed - 替换原因
    
    -- Availability confirmation
    -- 可用性确认
    confirmed_available BOOLEAN DEFAULT false,
    confirmation_deadline TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Contact attempts
    -- 联系尝试
    contact_attempts INTEGER DEFAULT 0,
    last_contact_attempt TIMESTAMP WITH TIME ZONE,
    contact_method VARCHAR(50), -- 'phone', 'email', 'sms', 'app' - 联系方式
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, athlete_id)
);

-- ========================================
-- EVENT CONTINGENCIES TABLE
-- 活动突发情况表
-- ========================================
CREATE TABLE event_contingencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    contingency_type emergency_type NOT NULL,
    severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 5), -- 1=minor, 5=critical
    
    -- Contingency details
    -- 突发情况详情
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    reported_by UUID REFERENCES users(id), -- Who reported the issue - 报告人
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status tracking
    -- 状态追踪
    is_resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Impact assessment
    -- 影响评估
    affected_participants INTEGER DEFAULT 0,
    estimated_loss DECIMAL(18, 8) DEFAULT 0, -- Financial impact - 财务影响
    
    -- Actions taken
    -- 采取的行动
    actions_taken JSONB, -- List of actions taken - 采取的行动列表
    automatic_refund_triggered BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENHANCED EVENT PARTICIPANTS with Contingency Handling
-- 增强活动参与者表，包含突发情况处理
-- ========================================
CREATE TABLE enhanced_event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    participant_type VARCHAR(20) NOT NULL,
    
    -- Enhanced participation status
    -- 增强参与状态
    participation_status player_participation_status DEFAULT 'registered',
    status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_notes TEXT,
    
    -- Team assignment (for athletes)
    -- 队伍分配（运动员）
    team VARCHAR(1),
    is_substitute BOOLEAN DEFAULT false,
    substitute_for UUID REFERENCES users(id), -- If substituting someone - 如果替换某人
    
    -- Stake information (for audience)
    -- 质押信息（观众）
    stake_amount DECIMAL(18, 8) DEFAULT 0,
    stake_tier stake_tier,
    supported_team VARCHAR(1),
    
    -- Check-in information
    -- 签到信息
    check_in_required BOOLEAN DEFAULT true,
    checked_in BOOLEAN DEFAULT false,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_in_location JSONB, -- GPS coordinates - GPS坐标
    late_arrival BOOLEAN DEFAULT false,
    late_arrival_reason TEXT,
    
    -- Party and rewards
    -- 聚会和奖励
    party_eligible BOOLEAN DEFAULT false,
    party_attended BOOLEAN DEFAULT false,
    reward_amount DECIMAL(18, 8) DEFAULT 0,
    reward_calculated BOOLEAN DEFAULT false,
    
    -- Refund information
    -- 退款信息
    refund_status refund_status DEFAULT 'none',
    refund_amount DECIMAL(18, 8) DEFAULT 0,
    refund_reason TEXT,
    refund_processed_at TIMESTAMP WITH TIME ZONE,
    
    -- Emergency contact confirmation
    -- 紧急联系确认
    emergency_contact_confirmed BOOLEAN DEFAULT false,
    emergency_contact_info JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- ========================================
-- REFUND TRANSACTIONS TABLE
-- 退款交易表
-- ========================================
CREATE TABLE refund_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    original_transaction_id UUID REFERENCES transactions(id),
    
    -- Refund details
    -- 退款详情
    refund_amount DECIMAL(18, 8) NOT NULL,
    refund_percentage DECIMAL(5, 2) NOT NULL, -- What percentage was refunded - 退款百分比
    refund_reason TEXT NOT NULL,
    refund_type VARCHAR(50) NOT NULL, -- 'full', 'partial', 'emergency', 'weather' - 退款类型
    
    -- Processing information
    -- 处理信息
    status refund_status NOT NULL DEFAULT 'requested',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Blockchain transaction details
    -- 区块链交易详情
    blockchain_tx_hash VARCHAR(66),
    blockchain_confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- Admin notes
    -- 管理员备注
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- EMERGENCY NOTIFICATIONS TABLE
-- 紧急通知表
-- ========================================
CREATE TABLE emergency_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    contingency_id UUID REFERENCES event_contingencies(id),
    
    -- Notification details
    -- 通知详情
    notification_type VARCHAR(50) NOT NULL, -- 'sms', 'email', 'push', 'in_app' - 通知类型
    message_title VARCHAR(200) NOT NULL,
    message_content TEXT NOT NULL,
    urgency_level INTEGER NOT NULL CHECK (urgency_level BETWEEN 1 AND 5),
    
    -- Target audience
    -- 目标受众
    send_to_all BOOLEAN DEFAULT false,
    target_roles VARCHAR(100)[], -- Array of roles to notify - 要通知的角色数组
    target_users UUID[], -- Specific users to notify - 要通知的特定用户
    
    -- Delivery tracking
    -- 发送追踪
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_attempts INTEGER DEFAULT 0,
    successful_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    
    -- Response tracking
    -- 响应追踪
    responses_required BOOLEAN DEFAULT false,
    responses_received INTEGER DEFAULT 0,
    response_deadline TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- WEATHER CONDITIONS TABLE
-- 天气条件表
-- ========================================
CREATE TABLE weather_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    venue_id UUID REFERENCES venues(id) NOT NULL,
    
    -- Weather data
    -- 天气数据
    check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    temperature DECIMAL(5, 2), -- Temperature in Celsius - 摄氏度温度
    humidity DECIMAL(5, 2), -- Humidity percentage - 湿度百分比
    wind_speed DECIMAL(5, 2), -- Wind speed in km/h - 风速（公里/小时）
    precipitation DECIMAL(5, 2), -- Precipitation in mm - 降水量（毫米）
    weather_description TEXT,
    
    -- Safety assessment
    -- 安全评估
    is_safe_for_event BOOLEAN DEFAULT true,
    safety_notes TEXT,
    assessed_by UUID REFERENCES users(id),
    
    -- Data source
    -- 数据来源
    data_source VARCHAR(50), -- 'manual', 'weather_api', 'sensor' - 数据来源
    api_response JSONB, -- Raw API response - 原始API响应
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- VENUE AVAILABILITY TABLE
-- 场馆可用性表
-- ========================================
CREATE TABLE venue_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) NOT NULL,
    event_id UUID REFERENCES events(id),
    
    -- Availability period
    -- 可用时段
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    
    -- Unavailability details
    -- 不可用详情
    unavailability_reason TEXT,
    alternative_venue_id UUID REFERENCES venues(id),
    
    -- Booking information
    -- 预订信息
    booked_by UUID REFERENCES users(id),
    booking_confirmed BOOLEAN DEFAULT false,
    booking_notes TEXT,
    
    -- Capacity adjustments
    -- 容量调整
    adjusted_capacity INTEGER, -- If different from venue's normal capacity - 如果与场馆正常容量不同
    capacity_reduction_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SYSTEM ALERTS TABLE
-- 系统警报表
-- ========================================
CREATE TABLE system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL, -- 'low_balance', 'high_volume', 'system_error', etc.
    severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 5),
    
    -- Alert details
    -- 警报详情
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    affected_component VARCHAR(100), -- Which system component - 受影响的系统组件
    
    -- Status tracking
    -- 状态追踪
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'acknowledged', 'resolved' - 状态
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Auto-resolution
    -- 自动解决
    auto_resolve BOOLEAN DEFAULT false,
    resolution_script TEXT, -- Script to run for auto-resolution - 自动解决脚本
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- COMPENSATION RECORDS TABLE
-- 补偿记录表
-- ========================================
CREATE TABLE compensation_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    contingency_id UUID REFERENCES event_contingencies(id),
    
    -- Compensation details
    -- 补偿详情
    compensation_type VARCHAR(50) NOT NULL, -- 'refund', 'bonus', 'credit', 'voucher' - 补偿类型
    compensation_amount DECIMAL(18, 8) NOT NULL,
    compensation_reason TEXT NOT NULL,
    
    -- Processing status
    -- 处理状态
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'rejected' - 状态
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment details
    -- 支付详情
    payment_method VARCHAR(50), -- 'chz_transfer', 'credit_balance', 'voucher' - 支付方式
    blockchain_tx_hash VARCHAR(66),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ENHANCED INDEXES FOR PERFORMANCE
-- 增强性能索引
-- ========================================

-- Athlete availability indexes
-- 运动员可用性索引
CREATE INDEX idx_enhanced_athletes_availability ON enhanced_athletes(is_available, sport_type);
CREATE INDEX idx_enhanced_athletes_reliability ON enhanced_athletes(reliability_score DESC);
CREATE INDEX idx_enhanced_athletes_attendance ON enhanced_athletes(attendance_rate DESC);

-- Substitute player indexes
-- 候补球员索引
CREATE INDEX idx_substitute_players_event ON substitute_players(event_id);
CREATE INDEX idx_substitute_players_priority ON substitute_players(substitute_priority);
CREATE INDEX idx_substitute_players_activated ON substitute_players(is_activated);

-- Contingency handling indexes
-- 突发情况处理索引
CREATE INDEX idx_event_contingencies_type ON event_contingencies(contingency_type);
CREATE INDEX idx_event_contingencies_severity ON event_contingencies(severity_level);
CREATE INDEX idx_event_contingencies_unresolved ON event_contingencies(is_resolved) WHERE is_resolved = false;

-- Refund processing indexes
-- 退款处理索引
CREATE INDEX idx_refund_transactions_status ON refund_transactions(status);
CREATE INDEX idx_refund_transactions_event ON refund_transactions(event_id);
CREATE INDEX idx_refund_transactions_user ON refund_transactions(user_id);

-- Emergency notification indexes
-- 紧急通知索引
CREATE INDEX idx_emergency_notifications_event ON emergency_notifications(event_id);
CREATE INDEX idx_emergency_notifications_urgency ON emergency_notifications(urgency_level);

-- Weather monitoring indexes
-- 天气监控索引
CREATE INDEX idx_weather_conditions_event ON weather_conditions(event_id);
CREATE INDEX idx_weather_conditions_safe ON weather_conditions(is_safe_for_event);

-- System alert indexes
-- 系统警报索引
CREATE INDEX idx_system_alerts_severity ON system_alerts(severity_level);
CREATE INDEX idx_system_alerts_status ON system_alerts(status);
CREATE INDEX idx_system_alerts_unresolved ON system_alerts(status) WHERE status = 'active';

-- ========================================
-- ENHANCED FUNCTIONS AND TRIGGERS
-- 增强函数和触发器
-- ========================================

-- Function to automatically calculate reliability score
-- 自动计算可靠性评分的函数
CREATE OR REPLACE FUNCTION calculate_reliability_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate reliability based on attendance rate and no-show count
    -- 基于出勤率和缺席次数计算可靠性
    NEW.reliability_score := GREATEST(
        0, 
        1000 + (NEW.attendance_rate * 10) - (NEW.no_show_count * 50)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update reliability score
-- 更新可靠性评分的触发器
CREATE TRIGGER update_reliability_score 
    BEFORE UPDATE ON enhanced_athletes 
    FOR EACH ROW 
    WHEN (OLD.attendance_rate != NEW.attendance_rate OR OLD.no_show_count != NEW.no_show_count)
    EXECUTE FUNCTION calculate_reliability_score();

-- Function to handle emergency refunds
-- 处理紧急退款的函数
CREATE OR REPLACE FUNCTION process_emergency_refund(
    p_event_id UUID,
    p_refund_percentage DECIMAL(5,2) DEFAULT 100.00
)
RETURNS INTEGER AS $$
DECLARE
    refund_count INTEGER := 0;
    participant_record RECORD;
BEGIN
    -- Process refunds for all participants
    -- 为所有参与者处理退款
    FOR participant_record IN 
        SELECT * FROM enhanced_event_participants 
        WHERE event_id = p_event_id AND stake_amount > 0
    LOOP
        INSERT INTO refund_transactions (
            event_id, user_id, refund_amount, refund_percentage, 
            refund_reason, refund_type, status
        ) VALUES (
            p_event_id, participant_record.user_id, 
            participant_record.stake_amount * (p_refund_percentage / 100),
            p_refund_percentage, 
            'Emergency refund due to event cancellation',
            'emergency', 'approved'
        );
        
        -- Update participant refund status
        -- 更新参与者退款状态
        UPDATE enhanced_event_participants 
        SET refund_status = 'processing',
            refund_amount = participant_record.stake_amount * (p_refund_percentage / 100)
        WHERE id = participant_record.id;
        
        refund_count := refund_count + 1;
    END LOOP;
    
    RETURN refund_count;
END;
$$ LANGUAGE plpgsql;

-- Function to activate substitute players
-- 激活候补球员的函数
CREATE OR REPLACE FUNCTION activate_substitute_player(
    p_event_id UUID,
    p_original_athlete_id UUID,
    p_reason TEXT
)
RETURNS UUID AS $$
DECLARE
    substitute_id UUID;
    substitute_athlete_id UUID;
BEGIN
    -- Find the best available substitute
    -- 找到最好的可用候补
    SELECT sp.id, sp.athlete_id INTO substitute_id, substitute_athlete_id
    FROM substitute_players sp
    JOIN enhanced_athletes ea ON sp.athlete_id = ea.id
    WHERE sp.event_id = p_event_id 
        AND sp.is_activated = false
        AND ea.is_available = true
        AND sp.confirmed_available = true
    ORDER BY sp.substitute_priority, ea.reliability_score DESC
    LIMIT 1;
    
    IF substitute_id IS NOT NULL THEN
        -- Activate the substitute
        -- 激活候补
        UPDATE substitute_players 
        SET is_activated = true,
            activated_at = NOW(),
            replaced_athlete_id = p_original_athlete_id,
            replacement_reason = p_reason
        WHERE id = substitute_id;
        
        -- Update original athlete status
        -- 更新原球员状态
        UPDATE enhanced_event_participants 
        SET participation_status = 'no_show',
            status_notes = p_reason
        WHERE event_id = p_event_id AND user_id = p_original_athlete_id;
        
        -- Add substitute to participants
        -- 将候补添加到参与者
        INSERT INTO enhanced_event_participants (
            event_id, user_id, participant_type, team, is_substitute, substitute_for
        ) SELECT 
            p_event_id, 
            (SELECT user_id FROM enhanced_athletes WHERE id = substitute_athlete_id),
            'athlete',
            sp.team,
            true,
            p_original_athlete_id
        FROM substitute_players sp WHERE sp.id = substitute_id;
        
        RETURN substitute_athlete_id;
    ELSE
        -- No substitute available
        -- 没有可用候补
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ENHANCED INITIAL DATA SETUP
-- 增强初始数据设置
-- ========================================

-- Insert default emergency types for reference
-- 插入默认紧急情况类型供参考
INSERT INTO event_contingencies (event_id, contingency_type, severity_level, title, description, is_resolved) 
VALUES 
    (uuid_generate_v4(), 'weather', 1, 'Sample Weather Alert', 'This is a sample weather alert for testing', true),
    (uuid_generate_v4(), 'technical_failure', 1, 'Sample Technical Issue', 'This is a sample technical issue for testing', true)
ON CONFLICT DO NOTHING;

-- Insert system alert templates
-- 插入系统警报模板
INSERT INTO system_alerts (alert_type, severity_level, title, message, status, auto_resolve)
VALUES 
    ('low_balance', 3, 'Low CHZ Balance Warning', 'System CHZ balance is below minimum threshold', 'resolved', false),
    ('high_volume', 2, 'High Transaction Volume', 'Unusual high transaction volume detected', 'resolved', false)
ON CONFLICT DO NOTHING;

-- ========================================
-- ENHANCED SCHEMA COMPLETE
-- 增强架构完成
-- ========================================

-- Enhanced schema with comprehensive contingency handling is now complete
-- 包含全面突发情况处理的增强架构现已完成
--
-- Additional features added:
-- 1. Substitute player system with priority levels
-- 2. Emergency refund processing
-- 3. Weather monitoring and safety assessment
-- 4. Venue availability tracking
-- 5. System alert management
-- 6. Compensation processing
-- 7. Enhanced notification system
-- 8. Reliability scoring for athletes
-- 9. Automatic contingency handling functions
-- 10. Comprehensive status tracking
--
-- 新增功能：
-- 1. 具有优先级别的候补球员系统
-- 2. 紧急退款处理
-- 3. 天气监控和安全评估
-- 4. 场馆可用性追踪
-- 5. 系统警报管理
-- 6. 补偿处理
-- 7. 增强通知系统
-- 8. 运动员可靠性评分
-- 9. 自动突发情况处理函数
-- 10. 全面状态追踪 