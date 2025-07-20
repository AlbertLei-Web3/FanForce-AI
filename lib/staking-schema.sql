-- User Staking System Database Schema
-- 用户质押系统数据库架构
-- 
-- This file contains the database tables for the user staking and reward system
-- 此文件包含用户质押和奖励系统的数据库表
--
-- Related files:
-- - lib/database.ts: Database connection utilities
-- - app/api/audience/stake: Staking API endpoints
-- - app/api/audience/user-stake-status: User stake status API
-- - app/api/audience/calculate-rewards: Reward calculation API
--
-- 相关文件：
-- - lib/database.ts: 数据库连接工具
-- - app/api/audience/stake: 质押API端点
-- - app/api/audience/user-stake-status: 用户质押状态API
-- - app/api/audience/calculate-rewards: 奖励计算API

-- Enable UUID extension (if not already enabled)
-- 启用UUID扩展（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User Stake Records Table
-- 用户质押记录表
-- Records user staking information with tier-based participation
-- 记录用户质押信息，基于档位的参与方式
CREATE TABLE IF NOT EXISTS user_stake_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    event_id UUID REFERENCES events(id) NOT NULL,
    
    -- Staking Information
    -- 质押信息
    stake_amount DECIMAL(18,8) NOT NULL CHECK (stake_amount > 0),
    currency VARCHAR(10) DEFAULT 'CHZ',
    
    -- Participation Tier (1=Full, 2=Stake+Match, 3=Stake Only)
    -- 参与档位 (1=完整体验, 2=质押+观赛, 3=仅质押)
    participation_tier INTEGER NOT NULL CHECK (participation_tier IN (1, 2, 3)),
    
    -- Team Selection
    -- 队伍选择
    team_choice VARCHAR(10) NOT NULL CHECK (team_choice IN ('team_a', 'team_b')),
    
    -- Status Tracking
    -- 状态追踪
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'settled', 'refunded', 'cancelled')),
    
    -- Timestamps
    -- 时间戳
    stake_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settlement_time TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Reward Calculations Table
-- 奖励计算表
-- Stores reward calculation results for each user stake
-- 存储每个用户质押的奖励计算结果
CREATE TABLE IF NOT EXISTS reward_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    stake_record_id UUID REFERENCES user_stake_records(id) NOT NULL,
    
    -- Admin Pool Information
    -- 管理员奖池信息
    admin_pool_amount DECIMAL(18,8) NOT NULL,
    total_participants INTEGER NOT NULL,
    
    -- User Tier Information
    -- 用户档位信息
    user_tier_coefficient DECIMAL(5,3) NOT NULL, -- 1.0, 0.7, or 0.3
    
    -- Calculation Results
    -- 计算结果
    calculated_reward DECIMAL(18,8) NOT NULL,
    platform_fee_percentage DECIMAL(5,3) NOT NULL DEFAULT 5.0,
    platform_fee_amount DECIMAL(18,8) NOT NULL,
    final_reward DECIMAL(18,8) NOT NULL,
    
    -- Calculation Metadata
    -- 计算元数据
    calculation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculation_status VARCHAR(20) DEFAULT 'calculated' CHECK (calculation_status IN ('pending', 'calculated', 'paid', 'failed')),
    
    -- Payment Information
    -- 支付信息
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
    payment_time TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Platform Fee Configuration Table
-- 平台手续费配置表
-- Stores platform fee configuration settings
-- 存储平台手续费配置设置
CREATE TABLE IF NOT EXISTS platform_fee_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Fee Configuration
    -- 手续费配置
    fee_percentage DECIMAL(5,3) NOT NULL DEFAULT 5.0 CHECK (fee_percentage >= 0 AND fee_percentage <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Configuration Metadata
    -- 配置元数据
    description TEXT,
    updated_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
-- 创建更新updated_at时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
-- 为updated_at创建触发器
CREATE TRIGGER update_user_stake_records_updated_at 
    BEFORE UPDATE ON user_stake_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reward_calculations_updated_at 
    BEFORE UPDATE ON reward_calculations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_fee_config_updated_at 
    BEFORE UPDATE ON platform_fee_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create unique constraints
-- 创建唯一约束
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_stake_records_user_event ON user_stake_records(user_id, event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_reward_calculations_stake_record ON reward_calculations(stake_record_id);

-- Create indexes for better performance
-- 创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_user_stake_records_user_id ON user_stake_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stake_records_event_id ON user_stake_records(event_id);
CREATE INDEX IF NOT EXISTS idx_user_stake_records_status ON user_stake_records(status);
CREATE INDEX IF NOT EXISTS idx_user_stake_records_stake_time ON user_stake_records(stake_time);

CREATE INDEX IF NOT EXISTS idx_reward_calculations_event_id ON reward_calculations(event_id);
CREATE INDEX IF NOT EXISTS idx_reward_calculations_user_id ON reward_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_calculations_stake_record_id ON reward_calculations(stake_record_id);
CREATE INDEX IF NOT EXISTS idx_reward_calculations_calculation_time ON reward_calculations(calculation_time);

CREATE INDEX IF NOT EXISTS idx_platform_fee_config_active ON platform_fee_config(is_active);

-- Insert default platform fee configuration
-- 插入默认平台手续费配置
INSERT INTO platform_fee_config (fee_percentage, description) 
VALUES (5.0, 'Default platform fee for reward calculations')
ON CONFLICT DO NOTHING;

-- Comments for table usage
-- 表使用说明
COMMENT ON TABLE user_stake_records IS 'Stores user staking records with tier-based participation levels';
COMMENT ON TABLE reward_calculations IS 'Stores calculated rewards for user stakes with platform fee deductions';
COMMENT ON TABLE platform_fee_config IS 'Stores platform fee configuration for reward calculations';

COMMENT ON COLUMN user_stake_records.participation_tier IS '1=Full Experience, 2=Stake+Match, 3=Stake Only';
COMMENT ON COLUMN user_stake_records.team_choice IS 'team_a or team_b selection';
COMMENT ON COLUMN reward_calculations.user_tier_coefficient IS 'Reward multiplier based on participation tier (1.0, 0.7, 0.3)';
COMMENT ON COLUMN platform_fee_config.fee_percentage IS 'Platform fee percentage (0-100) for reward calculations'; 