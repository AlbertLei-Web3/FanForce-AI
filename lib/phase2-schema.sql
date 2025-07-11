-- Phase 2 Database Schema for Event Applications and QR Code System
-- 第二阶段数据库架构：活动申请和二维码系统
-- 
-- This file extends the admin schema with event application and QR code functionality
-- 此文件在管理员架构基础上扩展活动申请和二维码功能
--
-- Related files:
-- - lib/enhanced-admin-schema.sql: Phase 1 admin functionality
-- - app/api/ambassador/*: Ambassador APIs
-- - app/api/audience/*: Audience APIs
--
-- 相关文件：
-- - lib/enhanced-admin-schema.sql: 第一阶段管理员功能
-- - app/api/ambassador/*: 大使API
-- - app/api/audience/*: 观众API

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Event Applications Table
-- 活动申请表
-- Stores ambassador event applications with timing information
-- 存储大使的活动申请及时间信息
CREATE TABLE IF NOT EXISTS event_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID REFERENCES users(id) NOT NULL,
    
    -- Event Basic Information
    -- 活动基本信息
    event_title VARCHAR(200) NOT NULL,
    event_description TEXT,
    event_start_time TIMESTAMP NOT NULL,
    event_end_time TIMESTAMP,
    
    -- QR Code Timing (Automatically Calculated)
    -- QR码时效（自动计算）
    qr_valid_from TIMESTAMP, -- event_start_time - 3 hours
    qr_valid_until TIMESTAMP, -- event_start_time + 1 hour
    
    -- Venue Information
    -- 场馆信息
    venue_name VARCHAR(200) NOT NULL,
    venue_address TEXT,
    venue_capacity INTEGER NOT NULL,
    party_venue_capacity INTEGER DEFAULT 0,
    
    -- Team Information
    -- 队伍信息
    team_a_info JSONB DEFAULT '{}', -- {name, players, etc.}
    team_b_info JSONB DEFAULT '{}',
    
    -- Application Status
    -- 申请状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    priority_level INTEGER DEFAULT 1, -- 1=normal, 2=high, 3=urgent
    
    -- Admin Review
    -- 管理员审核
    admin_review JSONB DEFAULT '{}', -- {decision_reason, notes, suggestions}
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- QR Code Generation
    -- QR码生成
    qr_code_generated BOOLEAN DEFAULT FALSE,
    qr_generation_time TIMESTAMP,
    
    -- Metadata
    -- 元数据
    estimated_participants INTEGER DEFAULT 0,
    expected_revenue DECIMAL(18,8) DEFAULT 0.0,
    application_notes TEXT,
    external_sponsors JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Event QR Codes Table
-- 活动二维码表
-- Stores time-limited QR codes for events
-- 存储带时限的活动二维码
CREATE TABLE IF NOT EXISTS event_qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    application_id UUID REFERENCES event_applications(id),
    
    -- QR Code Content
    -- QR码内容
    qr_content TEXT NOT NULL, -- Full URL for QR code
    verification_code VARCHAR(50) NOT NULL UNIQUE,
    
    -- Time Limitations
    -- 时间限制
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Status Tracking
    -- 状态追踪
    current_status VARCHAR(20) DEFAULT 'pending' CHECK (current_status IN ('pending', 'active', 'expired', 'disabled')),
    
    -- Usage Statistics
    -- 使用统计
    scans_count INTEGER DEFAULT 0,
    successful_scans INTEGER DEFAULT 0,
    failed_scans INTEGER DEFAULT 0,
    last_scan_time TIMESTAMP,
    
    -- Security
    -- 安全性
    max_scans INTEGER DEFAULT 1000, -- Prevent abuse
    rate_limit_per_user INTEGER DEFAULT 5, -- Max 5 scans per user
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Event Participations Table
-- 活动参与表
-- Records audience participation choices from QR code scans
-- 记录观众通过QR码扫描的参与选择
CREATE TABLE IF NOT EXISTS event_participations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    event_id UUID REFERENCES events(id),
    application_id UUID REFERENCES event_applications(id),
    qr_code_id UUID REFERENCES event_qr_codes(id),
    
    -- Participation Choice
    -- 参与选择
    participation_type VARCHAR(30) NOT NULL CHECK (participation_type IN ('watch_only', 'watch_and_party')),
    reward_tier INTEGER NOT NULL CHECK (reward_tier IN (2, 3)), -- 2=70%, 3=100%
    
    -- Scan Information
    -- 扫描信息
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scan_location JSONB DEFAULT '{}', -- Optional GPS coordinates
    user_agent TEXT,
    ip_address INET,
    
    -- Verification Status
    -- 验证状态
    is_verified BOOLEAN DEFAULT TRUE,
    verification_method VARCHAR(20) DEFAULT 'qr_scan',
    
    -- Party Allocation (for watch_and_party participants)
    -- 聚会分配（针对观赛+聚会参与者）
    party_allocation_status VARCHAR(20) DEFAULT 'pending' CHECK (party_allocation_status IN ('pending', 'allocated', 'waitlist', 'declined')),
    party_allocation_result JSONB DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audience Stakes Extended Table
-- 观众质押扩展表
-- Enhanced staking with tier-based rewards
-- 基于等级的增强质押奖励
CREATE TABLE IF NOT EXISTS audience_stakes_extended (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    event_id UUID REFERENCES events(id),
    participation_id UUID REFERENCES event_participations(id), -- Link to participation choice
    
    -- Staking Information
    -- 质押信息
    stake_amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CHZ',
    team_choice VARCHAR(10) NOT NULL CHECK (team_choice IN ('team_a', 'team_b')),
    
    -- Reward Calculation
    -- 奖励计算
    base_reward_tier INTEGER DEFAULT 1 CHECK (base_reward_tier IN (1, 2, 3)), -- 1=30%, 2=70%, 3=100%
    participation_bonus_tier INTEGER DEFAULT 0, -- Additional tier from QR scan
    final_reward_tier INTEGER, -- Calculated final tier
    
    -- Multipliers
    -- 倍数
    base_multiplier DECIMAL(5,3) DEFAULT 0.30, -- 30% for stake-only
    participation_multiplier DECIMAL(5,3) DEFAULT 0.00, -- Additional from scan
    final_multiplier DECIMAL(5,3), -- Combined multiplier
    
    -- Results and Rewards
    -- 结果和奖励
    event_result VARCHAR(20), -- team_a_wins/team_b_wins/draw
    is_winner BOOLEAN,
    calculated_reward DECIMAL(18,8) DEFAULT 0.0,
    actual_payout DECIMAL(18,8) DEFAULT 0.0,
    
    -- Status
    -- 状态
    stake_status VARCHAR(20) DEFAULT 'active' CHECK (stake_status IN ('active', 'settled', 'refunded', 'cancelled')),
    settlement_status VARCHAR(20) DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'calculated', 'paid', 'failed')),
    
    -- Timestamps
    -- 时间戳
    stake_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settlement_time TIMESTAMP,
    payout_time TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. QR Code Scan Logs Table
-- QR码扫描日志表
-- Detailed logging of all QR code scan attempts
-- 详细记录所有QR码扫描尝试
CREATE TABLE IF NOT EXISTS qr_scan_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES event_qr_codes(id),
    user_id UUID REFERENCES users(id),
    
    -- Scan Details
    -- 扫描详情
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    scan_result VARCHAR(20) NOT NULL CHECK (scan_result IN ('success', 'expired', 'invalid', 'rate_limited', 'error')),
    error_message TEXT,
    
    -- Technical Information
    -- 技术信息
    user_agent TEXT,
    ip_address INET,
    geolocation JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    
    -- Security Tracking
    -- 安全追踪
    is_suspicious BOOLEAN DEFAULT FALSE,
    fraud_score INTEGER DEFAULT 0, -- 0-100 fraud likelihood
    rate_limit_triggered BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Party Allocations Table
-- 聚会分配表
-- Manages party attendance allocation with capacity limits
-- 管理带容量限制的聚会出席分配
CREATE TABLE IF NOT EXISTS party_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    application_id UUID REFERENCES event_applications(id),
    
    -- Capacity Management
    -- 容量管理
    total_capacity INTEGER NOT NULL,
    allocated_spots INTEGER DEFAULT 0,
    waitlist_count INTEGER DEFAULT 0,
    
    -- Allocation Algorithm Settings
    -- 分配算法设置
    allocation_method VARCHAR(20) DEFAULT 'first_come' CHECK (allocation_method IN ('first_come', 'lottery', 'priority')),
    allocation_start_time TIMESTAMP,
    allocation_end_time TIMESTAMP,
    
    -- Status
    -- 状态
    allocation_status VARCHAR(20) DEFAULT 'pending' CHECK (allocation_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
-- 创建性能索引
CREATE INDEX IF NOT EXISTS idx_event_applications_ambassador ON event_applications(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_event_applications_status ON event_applications(status);
CREATE INDEX IF NOT EXISTS idx_event_applications_start_time ON event_applications(event_start_time);
CREATE INDEX IF NOT EXISTS idx_event_qr_codes_event ON event_qr_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_qr_codes_verification ON event_qr_codes(verification_code);
CREATE INDEX IF NOT EXISTS idx_event_qr_codes_valid_time ON event_qr_codes(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_event_participations_user ON event_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participations_event ON event_participations(event_id);
CREATE INDEX IF NOT EXISTS idx_audience_stakes_extended_user ON audience_stakes_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_audience_stakes_extended_event ON audience_stakes_extended(event_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_qr_code ON qr_scan_logs(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_logs_timestamp ON qr_scan_logs(scan_timestamp);

-- Create functions for automatic QR timing calculation
-- 创建自动QR时效计算函数
CREATE OR REPLACE FUNCTION calculate_qr_timing()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate QR valid from: 3 hours before event start
    -- 计算QR生效时间：活动开始前3小时
    NEW.qr_valid_from = NEW.event_start_time - INTERVAL '3 hours';
    
    -- Calculate QR valid until: 1 hour after event start  
    -- 计算QR失效时间：活动开始后1小时
    NEW.qr_valid_until = NEW.event_start_time + INTERVAL '1 hour';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic QR timing calculation
-- 创建自动QR时效计算触发器
CREATE TRIGGER trigger_calculate_qr_timing
    BEFORE INSERT OR UPDATE OF event_start_time
    ON event_applications
    FOR EACH ROW
    EXECUTE FUNCTION calculate_qr_timing();

-- Create function to update QR code status based on time
-- 创建基于时间更新QR码状态的函数
CREATE OR REPLACE FUNCTION update_qr_code_status()
RETURNS VOID AS $$
BEGIN
    -- Update QR codes to active when they become valid
    -- 当QR码变为有效时更新为激活状态
    UPDATE event_qr_codes 
    SET current_status = 'active'
    WHERE current_status = 'pending' 
    AND NOW() >= valid_from 
    AND NOW() <= valid_until
    AND is_active = true;
    
    -- Update QR codes to expired when they expire
    -- 当QR码过期时更新为过期状态
    UPDATE event_qr_codes 
    SET current_status = 'expired'
    WHERE current_status = 'active' 
    AND NOW() > valid_until;
END;
$$ LANGUAGE plpgsql;

-- Create function for reward tier calculation
-- 创建奖励等级计算函数
CREATE OR REPLACE FUNCTION calculate_reward_tier(
    user_id_param UUID,
    event_id_param UUID
) RETURNS INTEGER AS $$
DECLARE
    has_stake BOOLEAN := FALSE;
    has_participation BOOLEAN := FALSE;
    participation_type_val VARCHAR(30);
    final_tier INTEGER := 0;
BEGIN
    -- Check if user has stake
    -- 检查用户是否有质押
    SELECT EXISTS(
        SELECT 1 FROM audience_stakes_extended 
        WHERE user_id = user_id_param 
        AND event_id = event_id_param 
        AND stake_status = 'active'
    ) INTO has_stake;
    
    -- Check if user has participation record
    -- 检查用户是否有参与记录
    SELECT EXISTS(
        SELECT 1 FROM event_participations 
        WHERE user_id = user_id_param 
        AND event_id = event_id_param
    ), participation_type 
    INTO has_participation, participation_type_val
    FROM event_participations 
    WHERE user_id = user_id_param 
    AND event_id = event_id_param
    LIMIT 1;
    
    -- Calculate tier
    -- 计算等级
    IF NOT has_stake THEN
        final_tier := 0; -- No stake, no reward
    ELSIF NOT has_participation THEN
        final_tier := 1; -- Stake only: 30%
    ELSIF participation_type_val = 'watch_only' THEN
        final_tier := 2; -- Stake + scan: 70%
    ELSIF participation_type_val = 'watch_and_party' THEN
        final_tier := 3; -- Stake + scan + party: 100%
    END IF;
    
    RETURN final_tier;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
-- 创建updated_at时间戳触发器
CREATE TRIGGER update_event_applications_updated_at 
    BEFORE UPDATE ON event_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_qr_codes_updated_at 
    BEFORE UPDATE ON event_qr_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_participations_updated_at 
    BEFORE UPDATE ON event_participations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audience_stakes_extended_updated_at 
    BEFORE UPDATE ON audience_stakes_extended 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_party_allocations_updated_at 
    BEFORE UPDATE ON party_allocations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- 插入测试数据（可选）
/*
INSERT INTO event_applications (
    ambassador_id, 
    event_title, 
    event_description,
    event_start_time,
    venue_name,
    venue_address,
    venue_capacity,
    party_venue_capacity,
    team_a_info,
    team_b_info,
    estimated_participants
) VALUES (
    (SELECT id FROM users WHERE role = 'ambassador' LIMIT 1),
    'Campus Basketball Championship',
    'Annual basketball tournament between Engineering and Business teams',
    '2025-07-15 18:00:00',
    'University Sports Center',
    '123 Campus Drive, University Town',
    200,
    50,
    '{"name": "Engineering Eagles", "players": ["John Doe", "Jane Smith"]}',
    '{"name": "Business Bears", "players": ["Mike Johnson", "Sarah Wilson"]}',
    150
);
*/ 