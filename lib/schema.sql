-- FanForce AI Database Schema
-- FanForce AI 数据库架构
-- 
-- This file contains the complete database schema for the FanForce AI platform.
-- It supports Web2-first architecture with minimal blockchain interaction.
-- 
-- 此文件包含FanForce AI平台的完整数据库架构。
-- 它支持Web2优先架构，最小化区块链交互。
-- 
-- Installation: Run this script in your PostgreSQL database
-- 安装：在您的PostgreSQL数据库中运行此脚本
-- 
-- Usage: psql -U username -d fanforce_ai -f lib/schema.sql
-- 使用：psql -U username -d fanforce_ai -f lib/schema.sql

-- Enable UUID extension for generating unique IDs
-- 启用UUID扩展以生成唯一ID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp functions
-- 启用时间戳函数
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- User roles enumeration
-- 用户角色枚举
CREATE TYPE user_role AS ENUM ('admin', 'ambassador', 'athlete', 'audience');

-- User status enumeration
-- 用户状态枚举
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- Event status enumeration
-- 活动状态枚举
CREATE TYPE event_status AS ENUM ('draft', 'published', 'active', 'completed', 'cancelled');

-- Athlete status enumeration
-- 运动员状态枚举
CREATE TYPE athlete_status AS ENUM ('resting', 'active', 'competing', 'injured');

-- Stake tier enumeration
-- 质押等级枚举
CREATE TYPE stake_tier AS ENUM ('tier1', 'tier2', 'tier3');

-- Transaction type enumeration
-- 交易类型枚举
CREATE TYPE transaction_type AS ENUM ('stake', 'reward', 'fee', 'withdraw', 'salary', 'penalty');

-- Transaction status enumeration
-- 交易状态枚举
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'cancelled');

-- ========================================
-- USERS TABLE - Central user management
-- 用户表 - 中央用户管理
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL, -- Ethereum wallet address - 以太坊钱包地址
    role user_role NOT NULL DEFAULT 'audience',
    status user_status NOT NULL DEFAULT 'pending',
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255),
    student_id VARCHAR(20), -- For student verification - 用于学生身份验证
    full_name VARCHAR(100),
    phone VARCHAR(20),
    profile_image_url TEXT,
    bio TEXT,
    university VARCHAR(100),
    major VARCHAR(100),
    graduation_year INTEGER,
    social_media_links JSONB, -- Store social media profiles - 存储社交媒体档案
    preferences JSONB, -- User preferences and settings - 用户偏好和设置
    virtual_balance DECIMAL(18, 8) DEFAULT 0, -- Virtual CHZ balance - 虚拟CHZ余额
    total_earned DECIMAL(18, 8) DEFAULT 0, -- Total CHZ earned - 总CHZ收入
    total_spent DECIMAL(18, 8) DEFAULT 0, -- Total CHZ spent - 总CHZ支出
    last_login TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for performance
    -- 性能索引
    CONSTRAINT users_wallet_address_check CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- ========================================
-- VENUES TABLE - Venue management
-- 场馆表 - 场馆管理
-- ========================================
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    venue_type VARCHAR(50) NOT NULL, -- 'match' or 'party' - 'match'或'party'
    address TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    facilities JSONB, -- Available facilities - 可用设施
    contact_info JSONB, -- Contact information - 联系信息
    images JSONB, -- Venue images - 场馆图片
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- EVENTS TABLE - Event management
-- 活动表 - 活动管理
-- ========================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sport_type VARCHAR(50) NOT NULL, -- Type of sport - 运动类型
    status event_status NOT NULL DEFAULT 'draft',
    match_venue_id UUID REFERENCES venues(id), -- Match venue - 比赛场馆
    party_venue_id UUID REFERENCES venues(id), -- After-party venue - 聚会场馆
    match_capacity INTEGER NOT NULL, -- Match venue capacity - 比赛场馆容量
    party_capacity INTEGER NOT NULL, -- Party venue capacity - 聚会场馆容量
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_fee DECIMAL(18, 8) DEFAULT 0, -- Entry fee for athletes - 运动员入场费
    stake_pool DECIMAL(18, 8) DEFAULT 0, -- Total stake pool - 总质押池
    fee_percentage DECIMAL(5, 2) DEFAULT 5.00, -- Fee percentage - 手续费百分比
    
    -- Team information
    -- 队伍信息
    team_a_name VARCHAR(100),
    team_b_name VARCHAR(100),
    team_a_score INTEGER DEFAULT 0,
    team_b_score INTEGER DEFAULT 0,
    winning_team VARCHAR(1), -- 'A' or 'B' - 'A'或'B'
    
    -- Event organizer
    -- 活动组织者
    created_by UUID REFERENCES users(id) NOT NULL,
    ambassador_id UUID REFERENCES users(id), -- Campus ambassador - 校园大使
    
    -- Event metadata
    -- 活动元数据
    rules JSONB, -- Event rules and regulations - 活动规则和条例
    sponsors JSONB, -- Sponsor information - 赞助商信息
    prizes JSONB, -- Prize information - 奖品信息
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ATHLETES TABLE - Athlete profiles and stats
-- 运动员表 - 运动员档案和统计
-- ========================================
CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    position VARCHAR(50), -- Playing position - 比赛位置
    status athlete_status NOT NULL DEFAULT 'resting',
    
    -- Performance metrics
    -- 表现指标
    skill_level INTEGER DEFAULT 1000, -- ELO-like rating - ELO类似评级
    ranking_points INTEGER DEFAULT 0, -- Ranking points - 排名积分
    total_matches INTEGER DEFAULT 0, -- Total matches played - 总比赛次数
    wins INTEGER DEFAULT 0, -- Total wins - 总胜利次数
    losses INTEGER DEFAULT 0, -- Total losses - 总失败次数
    draws INTEGER DEFAULT 0, -- Total draws - 总平局次数
    mvp_count INTEGER DEFAULT 0, -- MVP awards - MVP奖项
    
    -- Season stats
    -- 赛季统计
    season_matches INTEGER DEFAULT 0, -- Current season matches - 当前赛季比赛
    season_wins INTEGER DEFAULT 0, -- Current season wins - 当前赛季胜利
    season_salary DECIMAL(18, 8) DEFAULT 0, -- Current season salary - 当前赛季薪水
    season_posts INTEGER DEFAULT 0, -- Social media posts this season - 本赛季社交媒体发帖
    
    -- Physical attributes
    -- 身体属性
    height INTEGER, -- Height in cm - 身高（厘米）
    weight INTEGER, -- Weight in kg - 体重（公斤）
    dominant_hand VARCHAR(10), -- 'left' or 'right' - '左'或'右'
    
    -- Career information
    -- 职业信息
    years_playing INTEGER DEFAULT 0, -- Years playing the sport - 从事该运动的年数
    achievements JSONB, -- Achievements and awards - 成就和奖项
    injury_history JSONB, -- Injury history - 受伤历史
    
    -- Availability
    -- 可用性
    available_days JSONB, -- Available days of week - 每周可用天数
    preferred_time_slots JSONB, -- Preferred time slots - 首选时间段
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- EVENT_PARTICIPANTS TABLE - Event participation
-- 活动参与者表 - 活动参与
-- ========================================
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    participant_type VARCHAR(20) NOT NULL, -- 'athlete' or 'audience' - '运动员'或'观众'
    team VARCHAR(1), -- 'A' or 'B' for athletes - 运动员的'A'或'B'队
    stake_amount DECIMAL(18, 8) DEFAULT 0, -- Stake amount for audience - 观众的质押金额
    stake_tier stake_tier, -- Stake tier for audience - 观众的质押等级
    supported_team VARCHAR(1), -- 'A' or 'B' for audience - 观众支持的'A'或'B'队
    
    -- Participation status
    -- 参与状态
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in BOOLEAN DEFAULT false,
    check_in_time TIMESTAMP WITH TIME ZONE,
    party_eligible BOOLEAN DEFAULT false,
    party_attended BOOLEAN DEFAULT false,
    
    -- Rewards
    -- 奖励
    reward_amount DECIMAL(18, 8) DEFAULT 0,
    reward_multiplier DECIMAL(5, 2) DEFAULT 1.00,
    reward_distributed BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- ========================================
-- QR_CODES TABLE - QR code management
-- 二维码表 - 二维码管理
-- ========================================
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    code VARCHAR(255) UNIQUE NOT NULL, -- JWT token for QR code - 二维码的JWT令牌
    qr_type VARCHAR(50) NOT NULL, -- 'check_in', 'party_entry' - '签到'，'聚会入场'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_uses INTEGER DEFAULT 1000, -- Maximum number of uses - 最大使用次数
    current_uses INTEGER DEFAULT 0, -- Current number of uses - 当前使用次数
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- QR_SCANS TABLE - QR code scan history
-- 二维码扫描表 - 二维码扫描历史
-- ========================================
CREATE TABLE qr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES qr_codes(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_location JSONB, -- GPS coordinates if available - GPS坐标（如果可用）
    ip_address INET, -- IP address of scanner - 扫描者的IP地址
    user_agent TEXT, -- User agent of scanner - 扫描者的用户代理
    
    UNIQUE(qr_code_id, user_id)
);

-- ========================================
-- TRANSACTIONS TABLE - All financial transactions
-- 交易表 - 所有金融交易
-- ========================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    event_id UUID REFERENCES events(id), -- NULL for non-event transactions - 非活动交易为NULL
    transaction_type transaction_type NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    
    -- Amount details
    -- 金额详情
    amount DECIMAL(18, 8) NOT NULL,
    fee_amount DECIMAL(18, 8) DEFAULT 0,
    net_amount DECIMAL(18, 8) NOT NULL, -- Amount after fees - 扣除手续费后的金额
    
    -- Blockchain details
    -- 区块链详情
    blockchain_tx_hash VARCHAR(66), -- Transaction hash on blockchain - 区块链上的交易哈希
    blockchain_block_number BIGINT, -- Block number - 区块号
    blockchain_confirmed_at TIMESTAMP WITH TIME ZONE, -- Confirmation time - 确认时间
    
    -- Internal tracking
    -- 内部追踪
    reference_id VARCHAR(100), -- Reference ID for tracking - 追踪的参考ID
    description TEXT, -- Transaction description - 交易描述
    metadata JSONB, -- Additional transaction data - 额外的交易数据
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REWARDS TABLE - Reward calculations and distributions
-- 奖励表 - 奖励计算和分配
-- ========================================
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Reward calculation
    -- 奖励计算
    base_reward DECIMAL(18, 8) DEFAULT 0, -- Base reward amount - 基础奖励金额
    tier_multiplier DECIMAL(5, 2) DEFAULT 1.00, -- Tier multiplier - 等级乘数
    performance_bonus DECIMAL(18, 8) DEFAULT 0, -- Performance bonus - 表现奖金
    final_reward DECIMAL(18, 8) DEFAULT 0, -- Final reward amount - 最终奖励金额
    
    -- Distribution status
    -- 分配状态
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distributed BOOLEAN DEFAULT false,
    distributed_at TIMESTAMP WITH TIME ZONE,
    distribution_tx_hash VARCHAR(66), -- Blockchain transaction hash - 区块链交易哈希
    
    -- Reward metadata
    -- 奖励元数据
    reward_reason TEXT, -- Reason for reward - 奖励原因
    calculation_details JSONB, -- Calculation breakdown - 计算明细
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- ========================================
-- ANALYTICS TABLE - Platform analytics
-- 分析表 - 平台分析
-- ========================================
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_type VARCHAR(50) NOT NULL, -- Type of metric - 指标类型
    metric_value DECIMAL(18, 8) NOT NULL, -- Metric value - 指标值
    metric_data JSONB, -- Additional metric data - 额外的指标数据
    
    -- Dimensions
    -- 维度
    event_id UUID REFERENCES events(id), -- Event-specific metrics - 活动特定指标
    user_id UUID REFERENCES users(id), -- User-specific metrics - 用户特定指标
    category VARCHAR(50), -- Metric category - 指标类别
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date_recorded, metric_type, event_id, user_id)
);

-- ========================================
-- INVITE_CODES TABLE - Invitation code management
-- 邀请码表 - 邀请码管理
-- ========================================
CREATE TABLE invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL, -- Short invite code - 短邀请码
    created_by UUID REFERENCES users(id) NOT NULL, -- Creator (ambassador) - 创建者（大使）
    event_id UUID REFERENCES events(id), -- Associated event - 关联活动
    max_uses INTEGER DEFAULT 100, -- Maximum uses - 最大使用次数
    current_uses INTEGER DEFAULT 0, -- Current uses - 当前使用次数
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    -- Invite details
    -- 邀请详情
    invite_type VARCHAR(50) DEFAULT 'general', -- 'general', 'vip', 'student' - '一般'，'VIP'，'学生'
    benefits JSONB, -- Benefits for invited users - 被邀请用户的好处
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- 性能索引
-- ========================================

-- User indexes
-- 用户索引
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Event indexes
-- 活动索引
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_ambassador_id ON events(ambassador_id);

-- Athlete indexes
-- 运动员索引
CREATE INDEX idx_athletes_user_id ON athletes(user_id);
CREATE INDEX idx_athletes_sport_type ON athletes(sport_type);
CREATE INDEX idx_athletes_status ON athletes(status);
CREATE INDEX idx_athletes_skill_level ON athletes(skill_level);

-- Event participants indexes
-- 活动参与者索引
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX idx_event_participants_type ON event_participants(participant_type);

-- Transaction indexes
-- 交易索引
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_event_id ON transactions(event_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- QR code indexes
-- 二维码索引
CREATE INDEX idx_qr_codes_event_id ON qr_codes(event_id);
CREATE INDEX idx_qr_codes_expires_at ON qr_codes(expires_at);
CREATE INDEX idx_qr_codes_active ON qr_codes(is_active);

-- Analytics indexes
-- 分析索引
CREATE INDEX idx_analytics_date_recorded ON analytics(date_recorded);
CREATE INDEX idx_analytics_metric_type ON analytics(metric_type);
CREATE INDEX idx_analytics_event_id ON analytics(event_id);

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- 函数和触发器
-- ========================================

-- Function to update updated_at timestamp
-- 更新updated_at时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
-- updated_at触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_participants_updated_at BEFORE UPDATE ON event_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rewards_updated_at BEFORE UPDATE ON rewards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invite_codes_updated_at BEFORE UPDATE ON invite_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- INITIAL DATA SETUP
-- 初始数据设置
-- ========================================

-- Insert default admin user (update with your wallet address)
-- 插入默认管理员用户（使用您的钱包地址更新）
INSERT INTO users (wallet_address, role, status, username, full_name) 
VALUES ('0x0000000000000000000000000000000000000000', 'admin', 'active', 'admin', 'System Administrator')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert sample venue
-- 插入示例场馆
INSERT INTO venues (name, venue_type, address, capacity, description)
VALUES 
('Campus Sports Center', 'match', 'University Campus, Main Building', 500, 'Main sports center for campus matches'),
('Student Union Hall', 'party', 'Student Union Building, 2nd Floor', 200, 'After-party venue with music and refreshments')
ON CONFLICT DO NOTHING;

-- Insert sample analytics categories
-- 插入示例分析类别
INSERT INTO analytics (date_recorded, metric_type, metric_value, category)
VALUES 
(CURRENT_DATE, 'daily_active_users', 0, 'user_engagement'),
(CURRENT_DATE, 'total_stake_volume', 0, 'financial'),
(CURRENT_DATE, 'total_events', 0, 'platform_activity')
ON CONFLICT DO NOTHING;

-- ========================================
-- SCHEMA COMPLETE
-- 架构完成
-- ========================================

-- Schema creation completed successfully
-- 架构创建成功完成
-- 
-- Next steps:
-- 1. Create .env.local file with your database credentials
-- 2. Run database migrations if needed
-- 3. Test database connection with lib/database.ts
-- 
-- 下一步：
-- 1. 创建包含数据库凭据的.env.local文件
-- 2. 如需要，运行数据库迁移
-- 3. 使用lib/database.ts测试数据库连接 