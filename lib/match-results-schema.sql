-- Match Results and Post-Match Database Schema
-- 比赛结果和赛后数据库架构
-- 
-- This file contains the database tables and functions for post-match functionality
-- 此文件包含赛后功能的数据库表和函数
--
-- Related files:
-- - lib/database.ts: Database connection utilities
-- - app/api/ambassador/manage-event: Match result management API
-- - app/api/admin/calculate-rewards: Reward calculation API
-- - app/api/audience/claimable-rewards: Claimable rewards API
--
-- 相关文件：
-- - lib/database.ts: 数据库连接工具
-- - app/api/ambassador/manage-event: 比赛结果管理API
-- - app/api/admin/calculate-rewards: 奖励计算API
-- - app/api/audience/claimable-rewards: 可领取奖励API

-- Enable UUID extension (if not already enabled)
-- 启用UUID扩展（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enhanced Events Table for Match Results
-- 增强的活动表用于比赛结果
-- Add match result fields to existing events table
-- 向现有events表添加比赛结果字段
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_result VARCHAR(20) CHECK (match_result IN ('team_a_wins', 'team_b_wins', 'draw', 'cancelled'));
ALTER TABLE events ADD COLUMN IF NOT EXISTS team_a_score INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS team_b_score INTEGER;
ALTER TABLE events ADD COLUMN IF NOT EXISTS result_announced_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS result_announced_by UUID REFERENCES users(id);
ALTER TABLE events ADD COLUMN IF NOT EXISTS match_completed_at TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_participants INTEGER DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS total_stakes_amount DECIMAL(18,8) DEFAULT 0.0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS rewards_distributed BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS rewards_distributed_at TIMESTAMP;

-- 2. Match Results Detail Table
-- 比赛结果详情表
-- Store detailed match results for individual athletes
-- 存储个别运动员的详细比赛结果
CREATE TABLE IF NOT EXISTS match_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    athlete_id UUID REFERENCES athletes(id) NOT NULL,
    
    -- Match Result Details
    -- 比赛结果详情
    team_assignment VARCHAR(10) NOT NULL CHECK (team_assignment IN ('team_a', 'team_b')),
    match_result VARCHAR(20) NOT NULL CHECK (match_result IN ('win', 'loss', 'draw')),
    
    -- Performance Metrics
    -- 表现指标
    performance_score INTEGER DEFAULT 0,
    ranking_points_earned INTEGER DEFAULT 0,
    ranking_points_lost INTEGER DEFAULT 0,
    
    -- Match Statistics
    -- 比赛统计
    goals_scored INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    
    -- Status
    -- 状态
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one result per athlete per event
    -- 确保每个运动员每个事件只有一个结果
    UNIQUE(event_id, athlete_id)
);

-- 3. Enhanced Athletes Table for Performance Tracking
-- 增强的运动员表用于表现追踪
-- Add performance tracking fields to existing athletes table
-- 向现有athletes表添加表现追踪字段
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS matches_won INTEGER DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS matches_lost INTEGER DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS matches_drawn INTEGER DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS current_ranking INTEGER DEFAULT 1000;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS ranking_points INTEGER DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS last_match_date DATE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS total_goals_scored INTEGER DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS total_assists INTEGER DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS total_yellow_cards INTEGER DEFAULT 0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS total_red_cards INTEGER DEFAULT 0;

-- 4. Reward Distribution Table
-- 奖励分配表
-- Track reward calculations and distributions
-- 追踪奖励计算和分配
CREATE TABLE IF NOT EXISTS reward_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Stake Information
    -- 质押信息
    stake_record_id UUID REFERENCES user_stake_records(id),
    original_stake_amount DECIMAL(18,8) NOT NULL,
    
    -- Calculation Details
    -- 计算详情
    admin_pool_amount DECIMAL(18,8) NOT NULL,
    total_participants INTEGER NOT NULL,
    user_tier_coefficient DECIMAL(5,3) NOT NULL,
    
    -- Reward Calculation
    -- 奖励计算
    base_reward DECIMAL(18,8) NOT NULL,
    platform_fee_percentage DECIMAL(5,3) NOT NULL DEFAULT 5.0,
    platform_fee_amount DECIMAL(18,8) NOT NULL,
    final_reward DECIMAL(18,8) NOT NULL,
    
    -- Distribution Status
    -- 分配状态
    distribution_status VARCHAR(20) DEFAULT 'calculated' CHECK (distribution_status IN ('calculated', 'pending', 'distributed', 'failed')),
    distributed_at TIMESTAMP,
    transaction_hash VARCHAR(66),
    
    -- Formula Display
    -- 公式显示
    calculation_formula TEXT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Match Result Announcement Log
-- 比赛结果公告日志
-- Track all match result announcements for audit
-- 追踪所有比赛结果公告用于审计
CREATE TABLE IF NOT EXISTS match_result_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) NOT NULL,
    announced_by UUID REFERENCES users(id) NOT NULL,
    
    -- Announcement Details
    -- 公告详情
    team_a_score INTEGER NOT NULL,
    team_b_score INTEGER NOT NULL,
    match_result VARCHAR(20) NOT NULL CHECK (match_result IN ('team_a_wins', 'team_b_wins', 'draw', 'cancelled')),
    
    -- Additional Information
    -- 额外信息
    announcement_notes TEXT,
    weather_conditions TEXT,
    special_events TEXT,
    
    -- Verification
    -- 验证
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
-- 创建性能索引
CREATE INDEX IF NOT EXISTS idx_events_match_result ON events(match_result);
CREATE INDEX IF NOT EXISTS idx_events_result_announced_at ON events(result_announced_at);
CREATE INDEX IF NOT EXISTS idx_match_results_event ON match_results(event_id);
CREATE INDEX IF NOT EXISTS idx_match_results_athlete ON match_results(athlete_id);
CREATE INDEX IF NOT EXISTS idx_match_results_result ON match_results(match_result);
CREATE INDEX IF NOT EXISTS idx_athletes_ranking ON athletes(current_ranking);
CREATE INDEX IF NOT EXISTS idx_athletes_win_rate ON athletes(win_rate);
CREATE INDEX IF NOT EXISTS idx_reward_distributions_event ON reward_distributions(event_id);
CREATE INDEX IF NOT EXISTS idx_reward_distributions_user ON reward_distributions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_distributions_status ON reward_distributions(distribution_status);
CREATE INDEX IF NOT EXISTS idx_match_result_announcements_event ON match_result_announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_match_result_announcements_announced_by ON match_result_announcements(announced_by);

-- Create triggers for updated_at timestamps
-- 创建updated_at时间戳触发器
CREATE TRIGGER update_match_results_updated_at 
    BEFORE UPDATE ON match_results 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reward_distributions_updated_at 
    BEFORE UPDATE ON reward_distributions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update athlete statistics after match result
-- 创建比赛结果后更新运动员统计的函数
CREATE OR REPLACE FUNCTION update_athlete_stats_after_match(
    event_id_param UUID,
    athlete_id_param UUID,
    match_result_param VARCHAR(20),
    performance_score_param INTEGER DEFAULT 0,
    goals_scored_param INTEGER DEFAULT 0,
    assists_param INTEGER DEFAULT 0,
    yellow_cards_param INTEGER DEFAULT 0,
    red_cards_param INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    ranking_points_change INTEGER;
    current_stats RECORD;
BEGIN
    -- Get current athlete statistics
    -- 获取当前运动员统计
    SELECT * INTO current_stats FROM athletes WHERE id = athlete_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Athlete not found: %', athlete_id_param;
    END IF;
    
    -- Calculate ranking points change based on match result
    -- 根据比赛结果计算排名积分变化
    CASE match_result_param
        WHEN 'win' THEN
            ranking_points_change := 30;
        WHEN 'draw' THEN
            ranking_points_change := 10;
        WHEN 'loss' THEN
            ranking_points_change := -20;
        ELSE
            ranking_points_change := 0;
    END CASE;
    
    -- Update athlete statistics
    -- 更新运动员统计
    UPDATE athletes SET
        matches_won = CASE WHEN match_result_param = 'win' THEN matches_won + 1 ELSE matches_won END,
        matches_lost = CASE WHEN match_result_param = 'loss' THEN matches_lost + 1 ELSE matches_lost END,
        matches_drawn = CASE WHEN match_result_param = 'draw' THEN matches_drawn + 1 ELSE matches_drawn END,
        ranking_points = ranking_points + ranking_points_change,
        current_ranking = GREATEST(1, current_ranking + ranking_points_change),
        last_match_date = CURRENT_DATE,
        total_goals_scored = total_goals_scored + goals_scored_param,
        total_assists = total_assists + assists_param,
        total_yellow_cards = total_yellow_cards + yellow_cards_param,
        total_red_cards = total_red_cards + red_cards_param,
        win_rate = CASE 
            WHEN (matches_won + matches_lost + matches_drawn) > 0 
            THEN ROUND((matches_won::DECIMAL / (matches_won + matches_lost + matches_drawn)) * 100, 2)
            ELSE 0.00
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = athlete_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate rewards for all participants
-- 创建为所有参与者计算奖励的函数
CREATE OR REPLACE FUNCTION calculate_event_rewards(event_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    event_record RECORD;
    stake_record RECORD;
    total_participants INTEGER;
    admin_pool DECIMAL(18,8);
    base_reward_per_participant DECIMAL(18,8);
    platform_fee_percentage DECIMAL(5,3);
BEGIN
    -- Get event details
    -- 获取活动详情
    SELECT * INTO event_record FROM events WHERE id = event_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found: %', event_id_param;
    END IF;
    
    -- Get platform fee percentage
    -- 获取平台手续费百分比
    SELECT fee_percentage INTO platform_fee_percentage 
    FROM platform_fee_config 
    WHERE is_active = TRUE 
    LIMIT 1;
    
    IF platform_fee_percentage IS NULL THEN
        platform_fee_percentage := 5.0; -- Default 5%
    END IF;
    
    -- Get total participants and admin pool
    -- 获取总参与者和管理员池
    SELECT COUNT(*), SUM(stake_amount) INTO total_participants, admin_pool
    FROM user_stake_records 
    WHERE event_id = event_id_param AND status = 'active';
    
    IF total_participants = 0 OR admin_pool = 0 THEN
        RAISE EXCEPTION 'No active stakes found for event: %', event_id_param;
    END IF;
    
    -- Calculate base reward per participant
    -- 计算每个参与者的基础奖励
    base_reward_per_participant := admin_pool / total_participants;
    
    -- Calculate rewards for each participant
    -- 为每个参与者计算奖励
    FOR stake_record IN 
        SELECT * FROM user_stake_records 
        WHERE event_id = event_id_param AND status = 'active'
    LOOP
        -- Calculate tier coefficient based on participation tier
        -- 根据参与档位计算系数
        DECLARE
            tier_coefficient DECIMAL(5,3);
            base_reward DECIMAL(18,8);
            platform_fee_amount DECIMAL(18,8);
            final_reward DECIMAL(18,8);
            calculation_formula TEXT;
        BEGIN
            -- Determine tier coefficient
            -- 确定档位系数
            CASE stake_record.participation_tier
                WHEN 1 THEN tier_coefficient := 1.0; -- Full Experience
                WHEN 2 THEN tier_coefficient := 0.7; -- Stake + Match
                WHEN 3 THEN tier_coefficient := 0.3; -- Stake Only
                ELSE tier_coefficient := 0.3;
            END CASE;
            
            -- Calculate rewards
            -- 计算奖励
            base_reward := base_reward_per_participant * tier_coefficient;
            platform_fee_amount := base_reward * (platform_fee_percentage / 100);
            final_reward := base_reward - platform_fee_amount;
            
            -- Create calculation formula for display
            -- 创建用于显示的计算公式
            calculation_formula := format(
                '个人获得奖励 = (管理员奖池 ÷ 总人数 × 档位系数) - 平台手续费 = (%s ÷ %s × %s) - %s%% = %s - %s = %s',
                admin_pool, total_participants, tier_coefficient, platform_fee_percentage, base_reward, platform_fee_amount, final_reward
            );
            
            -- Insert reward distribution record
            -- 插入奖励分配记录
            INSERT INTO reward_distributions (
                event_id,
                user_id,
                stake_record_id,
                original_stake_amount,
                admin_pool_amount,
                total_participants,
                user_tier_coefficient,
                base_reward,
                platform_fee_percentage,
                platform_fee_amount,
                final_reward,
                calculation_formula
            ) VALUES (
                event_id_param,
                stake_record.user_id,
                stake_record.id,
                stake_record.stake_amount,
                admin_pool,
                total_participants,
                tier_coefficient,
                base_reward,
                platform_fee_percentage,
                platform_fee_amount,
                final_reward,
                calculation_formula
            );
        END;
    END LOOP;
    
    -- Update event with reward calculation status
    -- 用奖励计算状态更新活动
    UPDATE events SET
        total_participants = total_participants,
        total_stakes_amount = admin_pool,
        rewards_distributed = TRUE,
        rewards_distributed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = event_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default platform fee configuration if not exists
-- 如果不存在则插入默认平台手续费配置
INSERT INTO platform_fee_config (fee_percentage, description) 
VALUES (5.0, 'Default platform fee for post-match reward calculations')
ON CONFLICT DO NOTHING;

-- Comments for table usage
-- 表使用说明
COMMENT ON TABLE match_results IS 'Stores detailed match results for individual athletes with performance metrics';
COMMENT ON TABLE reward_distributions IS 'Stores calculated rewards for all participants with detailed calculation formulas';
COMMENT ON TABLE match_result_announcements IS 'Tracks all match result announcements for audit and verification purposes';

COMMENT ON COLUMN match_results.team_assignment IS 'Which team the athlete was assigned to (team_a or team_b)';
COMMENT ON COLUMN match_results.match_result IS 'Individual result for this athlete (win, loss, draw)';
COMMENT ON COLUMN reward_distributions.calculation_formula IS 'Human-readable formula showing how the reward was calculated';
COMMENT ON COLUMN match_result_announcements.match_result IS 'Overall match result (team_a_wins, team_b_wins, draw, cancelled)'; 