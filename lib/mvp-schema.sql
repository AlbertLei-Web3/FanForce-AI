-- FanForce AI MVP Schema Extensions
-- MVP赛前流程所需的数据库架构扩展
-- Additional tables for pre-match flow MVP demo

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Team Drafts Table
-- 队伍草稿表
-- Stores ambassador's team selections for events
-- 存储大使为赛事选择的队伍
CREATE TABLE IF NOT EXISTS team_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID REFERENCES users(id) NOT NULL,
    draft_name VARCHAR(200) NOT NULL,
    sport_type VARCHAR(50) DEFAULT 'soccer',
    
    -- Team A Information / 队伍A信息
    team_a_name VARCHAR(100) NOT NULL,
    team_a_athletes JSONB DEFAULT '[]', -- Array of athlete IDs
    team_a_metadata JSONB DEFAULT '{}', -- Additional team info
    
    -- Team B Information / 队伍B信息  
    team_b_name VARCHAR(100) NOT NULL,
    team_b_athletes JSONB DEFAULT '[]', -- Array of athlete IDs
    team_b_metadata JSONB DEFAULT '{}', -- Additional team info
    
    -- Draft Status / 草稿状态
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'cancelled')),
    
    -- Metadata / 元数据
    estimated_duration INTEGER DEFAULT 90, -- minutes
    match_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Athlete Selections Table
-- 赛事运动员选择表
-- Tracks which athletes are selected for which events
-- 追踪哪些运动员被选中参加哪些赛事
CREATE TABLE IF NOT EXISTS event_athlete_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES event_applications(id) NOT NULL,
    athlete_id UUID REFERENCES users(id) NOT NULL,
    team_side VARCHAR(10) NOT NULL CHECK (team_side IN ('A', 'B')),
    
    -- Selection Status / 选择状态
    selection_status VARCHAR(20) DEFAULT 'selected' CHECK (selection_status IN ('selected', 'confirmed', 'declined', 'replaced')),
    
    -- Position and Role / 位置和角色
    position_on_team VARCHAR(50), -- e.g., 'striker', 'midfielder', 'defender'
    is_captain BOOLEAN DEFAULT FALSE,
    is_starter BOOLEAN DEFAULT TRUE,
    
    -- Notification Status / 通知状态
    athlete_notified BOOLEAN DEFAULT FALSE,
    athlete_response VARCHAR(20) CHECK (athlete_response IN ('pending', 'accepted', 'declined')),
    response_at TIMESTAMP,
    
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique athlete per application per team
    -- 确保每个申请每支队伍的运动员唯一性
    UNIQUE(application_id, athlete_id)
);

-- CHZ Pool Injections Table
-- CHZ奖池注入表
-- Tracks admin CHZ pool injections for events
-- 追踪管理员为赛事注入的CHZ奖池
CREATE TABLE IF NOT EXISTS chz_pool_injections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES event_applications(id) NOT NULL,
    admin_id UUID REFERENCES users(id) NOT NULL,
    
    -- Pool Information / 奖池信息
    injected_amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CHZ',
    
    -- Fee Rules / 手续费规则
    staking_fee_percent DECIMAL(5,2) DEFAULT 5.00,
    withdrawal_fee_percent DECIMAL(5,2) DEFAULT 2.00,
    distribution_fee_percent DECIMAL(5,2) DEFAULT 3.00,
    
    -- Distribution Rules / 分配规则
    tier_1_multiplier DECIMAL(5,3) DEFAULT 0.30, -- Stake only: 30%
    tier_2_multiplier DECIMAL(5,3) DEFAULT 0.70, -- Stake + Match: 70%
    tier_3_multiplier DECIMAL(5,3) DEFAULT 1.00, -- Full Experience: 100%
    
    -- Status / 状态
    injection_status VARCHAR(20) DEFAULT 'pending' CHECK (injection_status IN ('pending', 'completed', 'failed', 'cancelled')),
    contract_tx_hash VARCHAR(66), -- Blockchain transaction hash
    
    -- Metadata / 元数据
    injection_notes TEXT,
    admin_remarks TEXT,
    
    injected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audience Stakes Extended (Enhanced for MVP)
-- 观众质押扩展表（为MVP增强）
-- Enhanced audience staking with tier system
-- 带层级系统的增强观众质押
CREATE TABLE IF NOT EXISTS audience_stakes_mvp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    application_id UUID REFERENCES event_applications(id) NOT NULL,
    
    -- Staking Information / 质押信息
    stake_amount DECIMAL(18,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CHZ',
    team_choice VARCHAR(10) NOT NULL CHECK (team_choice IN ('team_a', 'team_b')),
    
    -- Participation Tier / 参与层级
    participation_tier INTEGER NOT NULL CHECK (participation_tier IN (1, 2, 3)),
    -- 1: Stake Only (30% multiplier)
    -- 2: Stake + Match (70% multiplier) 
    -- 3: Full Experience (100% multiplier)
    
    -- QR Check-in (for tiers 2 and 3) / 二维码签到（第2和第3层）
    qr_check_in_required BOOLEAN DEFAULT FALSE,
    qr_checked_in BOOLEAN DEFAULT FALSE,
    qr_check_in_time TIMESTAMP,
    
    -- Party Application (for tier 3) / 聚会申请（第3层）
    party_application BOOLEAN DEFAULT FALSE,
    party_approved BOOLEAN DEFAULT FALSE,
    party_attended BOOLEAN DEFAULT FALSE,
    
    -- Reward Calculation / 奖励计算
    base_multiplier DECIMAL(5,3),
    final_multiplier DECIMAL(5,3),
    calculated_reward DECIMAL(18,8) DEFAULT 0.0,
    actual_payout DECIMAL(18,8) DEFAULT 0.0,
    
    -- Results / 结果
    event_result VARCHAR(20), -- team_a_wins, team_b_wins, draw
    is_winner BOOLEAN,
    
    -- Status / 状态
    stake_status VARCHAR(20) DEFAULT 'active' CHECK (stake_status IN ('active', 'settled', 'refunded', 'cancelled')),
    payout_status VARCHAR(20) DEFAULT 'pending' CHECK (payout_status IN ('pending', 'calculated', 'paid', 'failed')),
    
    -- Timestamps / 时间戳
    stake_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settlement_time TIMESTAMP,
    payout_time TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique stake per user per event
    -- 确保每个用户每个赛事只能质押一次
    UNIQUE(user_id, application_id)
);

-- Add indexes for performance / 添加性能索引
CREATE INDEX IF NOT EXISTS idx_team_drafts_ambassador_id ON team_drafts(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_team_drafts_status ON team_drafts(status);
CREATE INDEX IF NOT EXISTS idx_event_athlete_selections_application_id ON event_athlete_selections(application_id);
CREATE INDEX IF NOT EXISTS idx_event_athlete_selections_athlete_id ON event_athlete_selections(athlete_id);
CREATE INDEX IF NOT EXISTS idx_chz_pool_injections_application_id ON chz_pool_injections(application_id);
CREATE INDEX IF NOT EXISTS idx_audience_stakes_mvp_application_id ON audience_stakes_mvp(application_id);
CREATE INDEX IF NOT EXISTS idx_audience_stakes_mvp_user_id ON audience_stakes_mvp(user_id);

-- Add triggers for updated_at / 添加updated_at触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_drafts_updated_at BEFORE UPDATE ON team_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_athlete_selections_updated_at BEFORE UPDATE ON event_athlete_selections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chz_pool_injections_updated_at BEFORE UPDATE ON chz_pool_injections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audience_stakes_mvp_updated_at BEFORE UPDATE ON audience_stakes_mvp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing / 插入测试样例数据
-- This will be useful for MVP demo / 这对MVP演示很有用

-- Sample team draft / 样例队伍草稿
INSERT INTO team_drafts (ambassador_id, draft_name, sport_type, team_a_name, team_b_name, team_a_athletes, team_b_athletes, status) 
SELECT 
    u.id,
    'Soccer Championship Draft',
    'soccer',
    'Thunder Wolves',
    'Lightning Hawks', 
    '[]'::jsonb,
    '[]'::jsonb,
    'draft'
FROM users u 
WHERE u.role = 'ambassador' 
LIMIT 1
ON CONFLICT DO NOTHING; 