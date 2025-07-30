-- OKX DEX Integration Database Schema
-- OKX DEX集成数据库架构
-- This file adds tables for athlete season progress, vault deposits, profit distribution, and rule engine logs
-- 此文件添加运动员赛季进度、金库托管、收益分配和规则引擎日志表
-- 
-- Related files:
-- - lib/basic-schema.sql: Core database schema
-- - lib/enhanced-admin-schema.sql: Admin functionality
-- - app/services/okxDexService.ts: OKX DEX service
-- - app/services/vaultService.ts: Vault service
-- 
-- 相关文件：
-- - lib/basic-schema.sql: 核心数据库架构
-- - lib/enhanced-admin-schema.sql: 管理员功能
-- - app/services/okxDexService.ts: OKX DEX服务
-- - app/services/vaultService.ts: 金库服务

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 运动员赛季进度表 / Athlete Season Progress Table
-- Tracks athlete progress towards vault deposit eligibility
-- 跟踪运动员达到金库托管资格的进度
CREATE TABLE IF NOT EXISTS athlete_season_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES users(id) NOT NULL,
    season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    season_quarter INTEGER NOT NULL DEFAULT EXTRACT(QUARTER FROM CURRENT_DATE),
    
    -- 赛季要求指标 / Season requirement metrics
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    social_posts_count INTEGER DEFAULT 0,
    virtual_chz_earned DECIMAL(18,8) DEFAULT 0.0,
    
    -- 赛季要求阈值 / Season requirement thresholds
    required_matches INTEGER DEFAULT 5,
    required_wins INTEGER DEFAULT 3,
    required_posts INTEGER DEFAULT 10,
    required_virtual_chz DECIMAL(18,8) DEFAULT 100.0,
    
    -- 进度状态 / Progress status
    is_eligible_for_vault BOOLEAN DEFAULT FALSE,
    vault_deposit_enabled BOOLEAN DEFAULT FALSE,
    season_completed BOOLEAN DEFAULT FALSE,
    
    -- 元数据 / Metadata
    progress_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 确保每个运动员每个赛季只有一条记录 / Ensure one record per athlete per season
    UNIQUE(athlete_id, season_year, season_quarter)
);

-- 2. 托管记录表 / Vault Deposit Records Table
-- Tracks all vault deposits from athletes
-- 跟踪所有运动员的金库托管记录
CREATE TABLE IF NOT EXISTS vault_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES users(id) NOT NULL,
    season_progress_id UUID REFERENCES athlete_season_progress(id),
    
    -- 托管详情 / Deposit details
    usdc_amount DECIMAL(18,6) NOT NULL, -- USDC has 6 decimals
    deposit_timestamp TIMESTAMP NOT NULL,
    blockchain_hash VARCHAR(66),
    
    -- 托管状态 / Deposit status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),
    
    -- 金库信息 / Vault information
    vault_contract_address VARCHAR(42),
    shares_received DECIMAL(18,8) DEFAULT 0.0,
    
    -- 元数据 / Metadata
    deposit_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 收益分配表 / Profit Distribution Table
-- Tracks profit distributions from rule engine trading
-- 跟踪规则引擎交易的收益分配
CREATE TABLE IF NOT EXISTS profit_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES users(id) NOT NULL,
    vault_deposit_id UUID REFERENCES vault_deposits(id),
    
    -- 收益详情 / Profit details
    total_profit_usdc DECIMAL(18,6) NOT NULL,
    athlete_share_usdc DECIMAL(18,6) NOT NULL, -- 80% for athlete
    foundation_share_usdc DECIMAL(18,6) NOT NULL, -- 20% for foundation
    
    -- 分配详情 / Distribution details
    distribution_period_start TIMESTAMP NOT NULL,
    distribution_period_end TIMESTAMP NOT NULL,
    distribution_timestamp TIMESTAMP NOT NULL,
    
    -- 交易信息 / Trading information
    trading_pairs JSONB DEFAULT '[]', -- Array of traded token pairs
    total_trades INTEGER DEFAULT 0,
    average_roi DECIMAL(8,4) DEFAULT 0.0, -- Return on investment percentage
    
    -- 分配状态 / Distribution status
    status VARCHAR(20) DEFAULT 'calculated' CHECK (status IN ('calculated', 'distributed', 'failed')),
    blockchain_hash VARCHAR(66),
    
    -- 元数据 / Metadata
    distribution_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 规则引擎日志表 / Rule Engine Logs Table
-- Tracks rule engine decisions and trading activities
-- 跟踪规则引擎决策和交易活动
CREATE TABLE IF NOT EXISTS rule_engine_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 日志类型 / Log type
    log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('market_analysis', 'strategy_execution', 'trade_execution', 'profit_calculation', 'distribution')),
    
    -- 市场数据 / Market data
    market_data_source VARCHAR(50) DEFAULT 'okx_dex',
    analyzed_tokens JSONB DEFAULT '[]',
    market_conditions JSONB DEFAULT '{}',
    
    -- 策略信息 / Strategy information
    strategy_name VARCHAR(100),
    strategy_parameters JSONB DEFAULT '{}',
    decision_reason TEXT,
    
    -- 交易信息 / Trading information
    trade_pairs JSONB DEFAULT '[]',
    trade_amounts JSONB DEFAULT '[]',
    trade_prices JSONB DEFAULT '[]',
    trade_timestamps JSONB DEFAULT '[]',
    
    -- 结果信息 / Result information
    execution_success BOOLEAN DEFAULT TRUE,
    profit_loss DECIMAL(18,6) DEFAULT 0.0,
    gas_used DECIMAL(18,6) DEFAULT 0.0,
    
    -- 错误信息 / Error information
    error_message TEXT,
    error_details JSONB DEFAULT '{}',
    
    -- 执行信息 / Execution information
    execution_duration_ms INTEGER DEFAULT 0,
    blockchain_hash VARCHAR(66),
    
    -- 元数据 / Metadata
    log_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
-- 创建性能索引
CREATE INDEX IF NOT EXISTS idx_athlete_season_progress_athlete_id ON athlete_season_progress(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_season_progress_eligible ON athlete_season_progress(is_eligible_for_vault);
CREATE INDEX IF NOT EXISTS idx_athlete_season_progress_season ON athlete_season_progress(season_year, season_quarter);

CREATE INDEX IF NOT EXISTS idx_vault_deposits_athlete_id ON vault_deposits(athlete_id);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_status ON vault_deposits(status);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_timestamp ON vault_deposits(deposit_timestamp);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_hash ON vault_deposits(blockchain_hash);

CREATE INDEX IF NOT EXISTS idx_profit_distributions_athlete_id ON profit_distributions(athlete_id);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_status ON profit_distributions(status);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_period ON profit_distributions(distribution_period_start, distribution_period_end);
CREATE INDEX IF NOT EXISTS idx_profit_distributions_timestamp ON profit_distributions(distribution_timestamp);

CREATE INDEX IF NOT EXISTS idx_rule_engine_logs_type ON rule_engine_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_rule_engine_logs_success ON rule_engine_logs(execution_success);
CREATE INDEX IF NOT EXISTS idx_rule_engine_logs_created ON rule_engine_logs(created_at);

-- Create triggers for updated_at timestamps
-- 创建updated_at时间戳的触发器
CREATE TRIGGER update_athlete_season_progress_updated_at BEFORE UPDATE ON athlete_season_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vault_deposits_updated_at BEFORE UPDATE ON vault_deposits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profit_distributions_updated_at BEFORE UPDATE ON profit_distributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for common operations
-- 创建常用操作函数

-- Function to check if athlete is eligible for vault deposit
-- 检查运动员是否有资格进行金库托管的函数
CREATE OR REPLACE FUNCTION check_athlete_vault_eligibility(p_athlete_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_progress RECORD;
BEGIN
    SELECT * INTO current_progress
    FROM athlete_season_progress
    WHERE athlete_id = p_athlete_id
    AND season_year = EXTRACT(YEAR FROM CURRENT_DATE)
    AND season_quarter = EXTRACT(QUARTER FROM CURRENT_DATE);
    
    IF current_progress IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN current_progress.is_eligible_for_vault;
END;
$$ LANGUAGE plpgsql;

-- Function to update athlete season progress
-- 更新运动员赛季进度的函数
CREATE OR REPLACE FUNCTION update_athlete_progress(
    p_athlete_id UUID,
    p_matches_played INTEGER DEFAULT 0,
    p_matches_won INTEGER DEFAULT 0,
    p_social_posts INTEGER DEFAULT 0,
    p_virtual_chz DECIMAL(18,8) DEFAULT 0.0
) RETURNS UUID AS $$
DECLARE
    progress_id UUID;
    current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
    current_quarter INTEGER := EXTRACT(QUARTER FROM CURRENT_DATE);
BEGIN
    -- Insert or update season progress
    INSERT INTO athlete_season_progress (
        athlete_id, season_year, season_quarter,
        matches_played, matches_won, social_posts_count, virtual_chz_earned,
        is_eligible_for_vault, vault_deposit_enabled
    ) VALUES (
        p_athlete_id, current_year, current_quarter,
        p_matches_played, p_matches_won, p_social_posts, p_virtual_chz,
        (p_matches_played >= 5 AND p_matches_won >= 3 AND p_social_posts >= 10 AND p_virtual_chz >= 100.0),
        (p_matches_played >= 5 AND p_matches_won >= 3 AND p_social_posts >= 10 AND p_virtual_chz >= 100.0)
    )
    ON CONFLICT (athlete_id, season_year, season_quarter)
    DO UPDATE SET
        matches_played = EXCLUDED.matches_played,
        matches_won = EXCLUDED.matches_won,
        social_posts_count = EXCLUDED.social_posts_count,
        virtual_chz_earned = EXCLUDED.virtual_chz_earned,
        is_eligible_for_vault = EXCLUDED.is_eligible_for_vault,
        vault_deposit_enabled = EXCLUDED.vault_deposit_enabled,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO progress_id;
    
    RETURN progress_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log rule engine activity
-- 记录规则引擎活动的函数
CREATE OR REPLACE FUNCTION log_rule_engine_activity(
    p_log_type VARCHAR(50),
    p_strategy_name VARCHAR(100) DEFAULT NULL,
    p_market_data JSONB DEFAULT '{}',
    p_trade_info JSONB DEFAULT '{}',
    p_result_info JSONB DEFAULT '{}',
    p_error_info TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO rule_engine_logs (
        log_type, strategy_name, market_conditions, trade_pairs, trade_amounts,
        execution_success, profit_loss, error_message, log_metadata
    ) VALUES (
        p_log_type, p_strategy_name, p_market_data, 
        COALESCE(p_trade_info->>'pairs', '[]'),
        COALESCE(p_trade_info->>'amounts', '[]'),
        COALESCE(p_result_info->>'success', 'true')::BOOLEAN,
        COALESCE(p_result_info->>'profit_loss', '0')::DECIMAL(18,6),
        p_error_info,
        p_result_info
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Create views for easy data access
-- 创建便于数据访问的视图

-- View for athlete vault status
-- 运动员金库状态视图
CREATE OR REPLACE VIEW athlete_vault_status AS
SELECT 
    u.id as athlete_id,
    u.wallet_address,
    asp.season_year,
    asp.season_quarter,
    asp.is_eligible_for_vault,
    asp.vault_deposit_enabled,
    COALESCE(SUM(vd.usdc_amount), 0) as total_deposited_usdc,
    COALESCE(SUM(pd.athlete_share_usdc), 0) as total_earnings_usdc,
    COUNT(vd.id) as deposit_count,
    COUNT(pd.id) as distribution_count
FROM users u
LEFT JOIN athlete_season_progress asp ON u.id = asp.athlete_id
LEFT JOIN vault_deposits vd ON u.id = vd.athlete_id AND vd.status = 'confirmed'
LEFT JOIN profit_distributions pd ON u.id = pd.athlete_id AND pd.status = 'distributed'
WHERE u.role = 'athlete'
GROUP BY u.id, u.wallet_address, asp.season_year, asp.season_quarter, asp.is_eligible_for_vault, asp.vault_deposit_enabled;

-- View for rule engine performance
-- 规则引擎性能视图
CREATE OR REPLACE VIEW rule_engine_performance AS
SELECT 
    DATE(created_at) as execution_date,
    log_type,
    COUNT(*) as execution_count,
    AVG(execution_duration_ms) as avg_duration_ms,
    SUM(CASE WHEN execution_success THEN 1 ELSE 0 END) as success_count,
    SUM(CASE WHEN NOT execution_success THEN 1 ELSE 0 END) as failure_count,
    SUM(profit_loss) as total_profit_loss,
    AVG(profit_loss) as avg_profit_loss
FROM rule_engine_logs
GROUP BY DATE(created_at), log_type
ORDER BY execution_date DESC, log_type;

-- Success message
SELECT 'OKX DEX integration schema created successfully!' as message; 