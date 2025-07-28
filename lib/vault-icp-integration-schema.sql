-- Vault and ICP Integration Database Schema
-- 金库和ICP集成数据库架构
-- 
-- This file contains the database tables for vault operations and ICP integration
-- 此文件包含金库操作和ICP集成的数据库表
--
-- Related files:
-- - lib/database.ts: Database connection utilities
-- - app/api/athlete/*: Athlete APIs
-- - app/dashboard/athlete/page.tsx: Athlete dashboard
-- - app/dashboard/vault/page.tsx: Vault dashboard
-- - contracts/FanForceVault.sol: Vault smart contract
--
-- 相关文件：
-- - lib/database.ts: 数据库连接工具
-- - app/api/athlete/*: 运动员API
-- - app/dashboard/athlete/page.tsx: 运动员仪表板
-- - app/dashboard/vault/page.tsx: 金库仪表板
-- - contracts/FanForceVault.sol: 金库智能合约

-- Enable UUID extension (if not already enabled)
-- 启用UUID扩展（如果尚未启用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========== 1. VAULT OPERATIONS TABLES / 金库操作表 ==========
-- 
-- Note: These tables are specific to vault operations and complement existing tables:
-- 注意：这些表专门用于金库操作，是对现有表的补充：
-- - vault_deposits: Specific to vault deposit transactions (complements basic-schema.sql transactions)
-- - vault_withdrawals: Specific to vault withdrawal transactions (complements basic-schema.sql transactions)  
-- - vault_shares: Tracks user vault share balances (new concept)
-- - vault_fees: Tracks vault-specific fees (complements basic-schema.sql transactions)

-- 1.1 Vault Deposits Table
-- 金库存款表
-- Records all vault deposit transactions
-- 记录所有金库存款交易
CREATE TABLE IF NOT EXISTS vault_deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Transaction Information
    -- 交易信息
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(18,8),
    
    -- Deposit Details
    -- 存款详情
    assets_amount DECIMAL(18,6) NOT NULL, -- USDC amount (6 decimals)
    shares_minted DECIMAL(18,18) NOT NULL, -- Vault shares (18 decimals)
    deposit_fee DECIMAL(18,6) DEFAULT 0.0,
    net_assets DECIMAL(18,6) NOT NULL,
    
    -- Vault State at Deposit
    -- 存款时的金库状态
    vault_total_assets DECIMAL(18,6) NOT NULL,
    vault_total_shares DECIMAL(18,18) NOT NULL,
    vault_price_per_share DECIMAL(18,18) NOT NULL,
    
    -- Status
    -- 状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmed_at TIMESTAMP,
    
    -- Metadata
    -- 元数据
    network VARCHAR(20) DEFAULT 'sepolia' CHECK (network IN ('sepolia', 'mainnet')),
    vault_contract_address VARCHAR(42) NOT NULL,
    usdc_contract_address VARCHAR(42) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 Vault Withdrawals Table
-- 金库提款表
-- Records all vault withdrawal transactions
-- 记录所有金库提款交易
CREATE TABLE IF NOT EXISTS vault_withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Transaction Information
    -- 交易信息
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(18,8),
    
    -- Withdrawal Details
    -- 提款详情
    assets_requested DECIMAL(18,6) NOT NULL, -- USDC amount requested
    shares_redeemed DECIMAL(18,18) NOT NULL, -- Vault shares redeemed
    withdrawal_fee DECIMAL(18,6) DEFAULT 0.0,
    net_assets_received DECIMAL(18,6) NOT NULL,
    
    -- Vault State at Withdrawal
    -- 提款时的金库状态
    vault_total_assets DECIMAL(18,6) NOT NULL,
    vault_total_shares DECIMAL(18,18) NOT NULL,
    vault_price_per_share DECIMAL(18,18) NOT NULL,
    
    -- Status
    -- 状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmed_at TIMESTAMP,
    
    -- Metadata
    -- 元数据
    network VARCHAR(20) DEFAULT 'sepolia' CHECK (network IN ('sepolia', 'mainnet')),
    vault_contract_address VARCHAR(42) NOT NULL,
    usdc_contract_address VARCHAR(42) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1.3 Vault Shares Table
-- 金库份额表
-- Tracks user vault share balances
-- 追踪用户金库份额余额
CREATE TABLE IF NOT EXISTS vault_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Share Information
    -- 份额信息
    total_shares DECIMAL(18,18) DEFAULT 0.0,
    total_assets_value DECIMAL(18,6) DEFAULT 0.0,
    average_price_per_share DECIMAL(18,18) DEFAULT 0.0,
    
    -- Vault State
    -- 金库状态
    vault_total_assets DECIMAL(18,6) DEFAULT 0.0,
    vault_total_shares DECIMAL(18,18) DEFAULT 0.0,
    vault_price_per_share DECIMAL(18,18) DEFAULT 0.0,
    
    -- Performance
    -- 表现
    total_deposits DECIMAL(18,6) DEFAULT 0.0,
    total_withdrawals DECIMAL(18,6) DEFAULT 0.0,
    unrealized_pnl DECIMAL(18,6) DEFAULT 0.0,
    realized_pnl DECIMAL(18,6) DEFAULT 0.0,
    
    -- Metadata
    -- 元数据
    network VARCHAR(20) DEFAULT 'sepolia' CHECK (network IN ('sepolia', 'mainnet')),
    vault_contract_address VARCHAR(42) NOT NULL,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one record per user per network
    -- 确保每个用户每个网络只有一条记录
    UNIQUE(user_id, network, vault_contract_address)
);

-- 1.4 Vault Fees Table
-- 金库费用表
-- Records vault fee collections
-- 记录金库费用收取
CREATE TABLE IF NOT EXISTS vault_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Fee Information
    -- 费用信息
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('deposit', 'withdrawal', 'performance', 'emergency')),
    fee_amount DECIMAL(18,6) NOT NULL,
    fee_percentage DECIMAL(5,3) NOT NULL,
    
    -- Transaction Reference
    -- 交易引用
    deposit_id UUID REFERENCES vault_deposits(id),
    withdrawal_id UUID REFERENCES vault_withdrawals(id),
    
    -- Vault State
    -- 金库状态
    vault_total_assets DECIMAL(18,6) NOT NULL,
    vault_total_shares DECIMAL(18,18) NOT NULL,
    
    -- Metadata
    -- 元数据
    network VARCHAR(20) DEFAULT 'sepolia' CHECK (network IN ('sepolia', 'mainnet')),
    vault_contract_address VARCHAR(42) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 2. SOCIAL MEDIA INTEGRATION TABLES / 社交媒体集成表 ==========
--
-- Note: This table extends the social_posts field in athletes table (basic-schema.sql)
-- 注意：此表扩展了athletes表中的social_posts字段（basic-schema.sql）
-- - social_media_posts: Detailed tracking of social media posts (extends athletes.social_posts)

-- 2.1 Social Media Posts Table
-- 社交媒体帖子表
-- Tracks user social media posts for season bonus requirements
-- 追踪用户社交媒体帖子以满足赛季奖金要求
CREATE TABLE IF NOT EXISTS social_media_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Post Information
    -- 帖子信息
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'twitter', 'facebook', 'tiktok', 'youtube')),
    post_id VARCHAR(200) NOT NULL,
    post_url TEXT,
    post_content TEXT,
    
    -- Engagement Metrics
    -- 参与度指标
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    
    -- Verification Status
    -- 验证状态
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    
    -- Post Metadata
    -- 帖子元数据
    posted_at TIMESTAMP NOT NULL,
    hashtags TEXT[],
    mentions TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique posts per user per platform
    -- 确保每个用户每个平台的帖子唯一
    UNIQUE(user_id, platform, post_id)
);

-- ========== 3. ICP INTEGRATION TABLES / ICP集成表 ==========
--
-- Note: These tables are specific to ICP blockchain integration and complement existing tables:
-- 注意：这些表专门用于ICP区块链集成，是对现有表的补充：
-- - icp_accounts: ICP account management (new concept)
-- - icp_season_bonuses: ICP season bonuses (complements basic-schema.sql rewards and match-results-schema.sql reward_distributions)
-- - icp_transactions: ICP blockchain transactions (complements basic-schema.sql transactions)

-- 3.1 ICP Accounts Table
-- ICP账户表
-- Stores ICP account information for users
-- 存储用户的ICP账户信息
CREATE TABLE IF NOT EXISTS icp_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- ICP Account Information
    -- ICP账户信息
    icp_principal VARCHAR(200) NOT NULL,
    icp_account_name VARCHAR(100),
    icp_wallet_address VARCHAR(200),
    
    -- Account Status
    -- 账户状态
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Balance Information
    -- 余额信息
    icp_balance DECIMAL(18,8) DEFAULT 0.0,
    last_balance_update TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one ICP account per user
    -- 确保每个用户只有一个ICP账户
    UNIQUE(user_id)
);

-- 2.2 ICP Season Bonuses Table
-- ICP赛季奖金表
-- Tracks ICP season bonus allocations and distributions
-- 追踪ICP赛季奖金分配和发放
CREATE TABLE IF NOT EXISTS icp_season_bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Season Information
    -- 赛季信息
    season_number INTEGER NOT NULL,
    season_year INTEGER NOT NULL,
    season_start_date DATE NOT NULL,
    season_end_date DATE NOT NULL,
    
    -- Bonus Calculation
    -- 奖金计算
    base_salary DECIMAL(18,8) NOT NULL,
    performance_bonus DECIMAL(18,8) DEFAULT 0.0,
    participation_bonus DECIMAL(18,8) DEFAULT 0.0,
    total_bonus DECIMAL(18,8) NOT NULL,
    
    -- Requirements Status
    -- 要求状态
    matches_required INTEGER DEFAULT 10,
    matches_completed INTEGER DEFAULT 0,
    social_posts_required INTEGER DEFAULT 5,
    social_posts_completed INTEGER DEFAULT 0,
    requirements_met BOOLEAN DEFAULT FALSE,
    
    -- Distribution Status
    -- 发放状态
    distribution_status VARCHAR(20) DEFAULT 'pending' CHECK (distribution_status IN ('pending', 'approved', 'distributed', 'cancelled')),
    distributed_amount DECIMAL(18,8) DEFAULT 0.0,
    distributed_at TIMESTAMP,
    distribution_transaction_hash VARCHAR(200),
    
    -- Metadata
    -- 元数据
    calculation_notes TEXT,
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one bonus record per user per season
    -- 确保每个用户每个赛季只有一条奖金记录
    UNIQUE(user_id, season_number, season_year)
);

-- 2.3 ICP Transactions Table
-- ICP交易表
-- Records all ICP transactions
-- 记录所有ICP交易
CREATE TABLE IF NOT EXISTS icp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Transaction Information
    -- 交易信息
    transaction_hash VARCHAR(200) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'bonus', 'reward', 'transfer')),
    
    -- Amount Information
    -- 金额信息
    amount DECIMAL(18,8) NOT NULL,
    fee DECIMAL(18,8) DEFAULT 0.0,
    net_amount DECIMAL(18,8) NOT NULL,
    
    -- Account Information
    -- 账户信息
    from_principal VARCHAR(200),
    to_principal VARCHAR(200),
    
    -- Status
    -- 状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmed_at TIMESTAMP,
    block_height BIGINT,
    
    -- Metadata
    -- 元数据
    memo TEXT,
    reference_id UUID, -- Reference to related record (bonus, reward, etc.)
    reference_type VARCHAR(50), -- Type of reference (season_bonus, match_reward, etc.)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 4. USDC INTEGRATION TABLES / USDC集成表 ==========
--
-- Note: These tables are specific to USDC token integration and complement existing tables:
-- 注意：这些表专门用于USDC代币集成，是对现有表的补充：
-- - usdc_balances: USDC balance tracking (complements users.virtual_chz_balance and users.real_chz_balance)
-- - usdc_transactions: USDC token transactions (complements basic-schema.sql transactions)
-- - usdc_approvals: USDC token approval tracking (new concept for ERC-20 approvals)

-- 3.1 USDC Balances Table
-- USDC余额表
-- Tracks user USDC balances across networks
-- 追踪用户跨网络的USDC余额
CREATE TABLE IF NOT EXISTS usdc_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Balance Information
    -- 余额信息
    balance DECIMAL(18,6) DEFAULT 0.0,
    locked_balance DECIMAL(18,6) DEFAULT 0.0, -- For pending transactions
    available_balance DECIMAL(18,6) DEFAULT 0.0,
    
    -- Network Information
    -- 网络信息
    network VARCHAR(20) NOT NULL CHECK (network IN ('sepolia', 'mainnet')),
    usdc_contract_address VARCHAR(42) NOT NULL,
    
    -- Status
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    last_balance_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one balance record per user per network
    -- 确保每个用户每个网络只有一条余额记录
    UNIQUE(user_id, network, usdc_contract_address)
);

-- 3.2 USDC Transactions Table
-- USDC交易表
-- Records all USDC transactions
-- 记录所有USDC交易
CREATE TABLE IF NOT EXISTS usdc_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Transaction Information
    -- 交易信息
    transaction_hash VARCHAR(66) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('transfer', 'approval', 'deposit', 'withdrawal')),
    
    -- Amount Information
    -- 金额信息
    amount DECIMAL(18,6) NOT NULL,
    gas_used BIGINT,
    gas_price DECIMAL(18,8),
    
    -- Account Information
    -- 账户信息
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    
    -- Status
    -- 状态
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    confirmed_at TIMESTAMP,
    block_number BIGINT,
    
    -- Metadata
    -- 元数据
    network VARCHAR(20) NOT NULL CHECK (network IN ('sepolia', 'mainnet')),
    usdc_contract_address VARCHAR(42) NOT NULL,
    reference_id UUID, -- Reference to related record
    reference_type VARCHAR(50), -- Type of reference
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3.3 USDC Approvals Table
-- USDC授权表
-- Tracks USDC token approvals
-- 追踪USDC代币授权
CREATE TABLE IF NOT EXISTS usdc_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Approval Information
    -- 授权信息
    spender_address VARCHAR(42) NOT NULL,
    approved_amount DECIMAL(18,6) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    
    -- Status
    -- 状态
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMP,
    revoked_transaction_hash VARCHAR(66),
    
    -- Metadata
    -- 元数据
    network VARCHAR(20) NOT NULL CHECK (network IN ('sepolia', 'mainnet')),
    usdc_contract_address VARCHAR(42) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 5. SYSTEM CONFIGURATION TABLE / 系统配置表 ==========

-- System configuration table for vault and ICP settings
-- 金库和ICP设置的系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration values
-- 插入默认配置值
INSERT INTO system_config (key, value, description) VALUES
('vault_contract_address', '0x0000000000000000000000000000000000000000', 'Default vault contract address'),
('usdc_contract_address', '0x0000000000000000000000000000000000000000', 'Default USDC contract address'),
('default_network', 'sepolia', 'Default blockchain network'),
('season_matches_required', '10', 'Required matches per season'),
('season_social_posts_required', '5', 'Required social posts per season'),
('vault_deposit_fee', '0', 'Vault deposit fee in basis points'),
('vault_withdrawal_fee', '0', 'Vault withdrawal fee in basis points'),
('vault_performance_fee', '200', 'Vault performance fee in basis points')
ON CONFLICT (key) DO NOTHING;

-- ========== 6. ENHANCED ATHLETES TABLE / 增强的运动员表 ==========

-- Add vault and ICP related fields to existing athletes table
-- 向现有运动员表添加金库和ICP相关字段
-- Note: Some fields like matches_won, social_posts, ranking already exist in basic-schema.sql
-- 注意：某些字段如matches_won, social_posts, ranking已在basic-schema.sql中存在
-- Note: current_ranking, win_rate already exist in match-results-schema.sql  
-- 注意：current_ranking, win_rate已在match-results-schema.sql中存在

-- Only add vault and ICP specific fields that don't exist elsewhere
-- 只添加在其他地方不存在的金库和ICP特定字段
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS usdc_balance DECIMAL(18,6) DEFAULT 0.0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS vault_shares DECIMAL(18,18) DEFAULT 0.0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS vault_total_deposits DECIMAL(18,6) DEFAULT 0.0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS vault_total_withdrawals DECIMAL(18,6) DEFAULT 0.0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS season_bonus_balance DECIMAL(18,8) DEFAULT 0.0;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS icp_principal VARCHAR(200);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS icp_account_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS last_vault_transaction TIMESTAMP;
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS vault_transfer_count INTEGER DEFAULT 0;

-- ========== 5. INDEXES / 索引 ==========

-- Vault Deposits Indexes
CREATE INDEX IF NOT EXISTS idx_vault_deposits_user_id ON vault_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_status ON vault_deposits(status);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_created_at ON vault_deposits(created_at);
CREATE INDEX IF NOT EXISTS idx_vault_deposits_transaction_hash ON vault_deposits(transaction_hash);

-- Vault Withdrawals Indexes
CREATE INDEX IF NOT EXISTS idx_vault_withdrawals_user_id ON vault_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_withdrawals_status ON vault_withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_vault_withdrawals_created_at ON vault_withdrawals(created_at);
CREATE INDEX IF NOT EXISTS idx_vault_withdrawals_transaction_hash ON vault_withdrawals(transaction_hash);

-- Vault Shares Indexes
CREATE INDEX IF NOT EXISTS idx_vault_shares_user_id ON vault_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_shares_network ON vault_shares(network);
CREATE INDEX IF NOT EXISTS idx_vault_shares_last_updated ON vault_shares(last_updated_at);

-- Vault Fees Indexes
CREATE INDEX IF NOT EXISTS idx_vault_fees_type ON vault_fees(fee_type);
CREATE INDEX IF NOT EXISTS idx_vault_fees_created_at ON vault_fees(created_at);

-- Social Media Posts Indexes
CREATE INDEX IF NOT EXISTS idx_social_media_posts_user_id ON social_media_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_verified ON social_media_posts(verified);
CREATE INDEX IF NOT EXISTS idx_social_media_posts_posted_at ON social_media_posts(posted_at);

-- ICP Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_icp_accounts_user_id ON icp_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_icp_accounts_principal ON icp_accounts(icp_principal);
CREATE INDEX IF NOT EXISTS idx_icp_accounts_verified ON icp_accounts(is_verified);

-- ICP Season Bonuses Indexes
CREATE INDEX IF NOT EXISTS idx_icp_season_bonuses_user_id ON icp_season_bonuses(user_id);
CREATE INDEX IF NOT EXISTS idx_icp_season_bonuses_season ON icp_season_bonuses(season_number, season_year);
CREATE INDEX IF NOT EXISTS idx_icp_season_bonuses_status ON icp_season_bonuses(distribution_status);
CREATE INDEX IF NOT EXISTS idx_icp_season_bonuses_requirements ON icp_season_bonuses(requirements_met);

-- ICP Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_icp_transactions_user_id ON icp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_icp_transactions_type ON icp_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_icp_transactions_status ON icp_transactions(status);
CREATE INDEX IF NOT EXISTS idx_icp_transactions_created_at ON icp_transactions(created_at);

-- USDC Balances Indexes
CREATE INDEX IF NOT EXISTS idx_usdc_balances_user_id ON usdc_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_usdc_balances_network ON usdc_balances(network);
CREATE INDEX IF NOT EXISTS idx_usdc_balances_last_update ON usdc_balances(last_balance_update);

-- USDC Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_user_id ON usdc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_type ON usdc_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_status ON usdc_transactions(status);
CREATE INDEX IF NOT EXISTS idx_usdc_transactions_created_at ON usdc_transactions(created_at);

-- USDC Approvals Indexes
CREATE INDEX IF NOT EXISTS idx_usdc_approvals_user_id ON usdc_approvals(user_id);
CREATE INDEX IF NOT EXISTS idx_usdc_approvals_spender ON usdc_approvals(spender_address);
CREATE INDEX IF NOT EXISTS idx_usdc_approvals_active ON usdc_approvals(is_active);

-- Enhanced Athletes Indexes
CREATE INDEX IF NOT EXISTS idx_athletes_usdc_balance ON athletes(usdc_balance);
CREATE INDEX IF NOT EXISTS idx_athletes_vault_shares ON athletes(vault_shares);
CREATE INDEX IF NOT EXISTS idx_athletes_season_bonus ON athletes(season_bonus_balance);
CREATE INDEX IF NOT EXISTS idx_athletes_icp_verified ON athletes(icp_account_verified);

-- System Config Indexes
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);
CREATE INDEX IF NOT EXISTS idx_system_config_active ON system_config(is_active);

-- ========== 6. TRIGGERS / 触发器 ==========

-- Create update_updated_at_column function if it doesn't exist
-- 如果不存在则创建update_updated_at_column函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp triggers
CREATE TRIGGER update_vault_deposits_updated_at 
    BEFORE UPDATE ON vault_deposits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_withdrawals_updated_at 
    BEFORE UPDATE ON vault_withdrawals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_shares_updated_at 
    BEFORE UPDATE ON vault_shares 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_fees_updated_at 
    BEFORE UPDATE ON vault_fees 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_media_posts_updated_at 
    BEFORE UPDATE ON social_media_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icp_accounts_updated_at 
    BEFORE UPDATE ON icp_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icp_season_bonuses_updated_at 
    BEFORE UPDATE ON icp_season_bonuses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_icp_transactions_updated_at 
    BEFORE UPDATE ON icp_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usdc_balances_updated_at 
    BEFORE UPDATE ON usdc_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usdc_transactions_updated_at 
    BEFORE UPDATE ON usdc_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usdc_approvals_updated_at 
    BEFORE UPDATE ON usdc_approvals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at 
    BEFORE UPDATE ON system_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== 7. FUNCTIONS / 函数 ==========

-- Function to update vault shares after deposit
-- 存款后更新金库份额的函数
CREATE OR REPLACE FUNCTION update_vault_shares_after_deposit()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert vault shares record
    INSERT INTO vault_shares (user_id, total_shares, total_assets_value, total_deposits, 
                             vault_total_assets, vault_total_shares, vault_price_per_share,
                             average_price_per_share, unrealized_pnl, realized_pnl,
                             network, vault_contract_address)
    VALUES (NEW.user_id, NEW.shares_minted, NEW.net_assets, NEW.net_assets,
            NEW.vault_total_assets, NEW.vault_total_shares, NEW.vault_price_per_share,
            NEW.vault_price_per_share, 0.0, 0.0,
            NEW.network, NEW.vault_contract_address)
    ON CONFLICT (user_id, network, vault_contract_address)
    DO UPDATE SET
        total_shares = vault_shares.total_shares + NEW.shares_minted,
        total_assets_value = vault_shares.total_assets_value + NEW.net_assets,
        total_deposits = vault_shares.total_deposits + NEW.net_assets,
        vault_total_assets = NEW.vault_total_assets,
        vault_total_shares = NEW.vault_total_shares,
        vault_price_per_share = NEW.vault_price_per_share,
        -- Calculate new average price per share
        average_price_per_share = CASE 
            WHEN vault_shares.total_shares + NEW.shares_minted > 0 
            THEN (vault_shares.total_assets_value + NEW.net_assets) / (vault_shares.total_shares + NEW.shares_minted)
            ELSE NEW.vault_price_per_share
        END,
        -- Calculate unrealized PnL
        unrealized_pnl = CASE 
            WHEN vault_shares.total_shares + NEW.shares_minted > 0 
            THEN (NEW.vault_price_per_share - 
                  (vault_shares.total_assets_value + NEW.net_assets) / (vault_shares.total_shares + NEW.shares_minted)) 
                 * (vault_shares.total_shares + NEW.shares_minted)
            ELSE 0.0
        END,
        last_updated_at = CURRENT_TIMESTAMP;
    
    -- Update athlete record
    UPDATE athletes 
    SET usdc_balance = usdc_balance - NEW.assets_amount,
        vault_shares = vault_shares + NEW.shares_minted,
        vault_total_deposits = vault_total_deposits + NEW.net_assets,
        last_vault_transaction = CURRENT_TIMESTAMP,
        vault_transfer_count = vault_transfer_count + 1
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return NEW to allow transaction to continue
        RAISE WARNING 'Error updating vault shares after deposit for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vault deposits
CREATE TRIGGER trigger_update_vault_shares_after_deposit
    AFTER INSERT ON vault_deposits
    FOR EACH ROW
    EXECUTE FUNCTION update_vault_shares_after_deposit();

-- Function to update vault shares after withdrawal
-- 提款后更新金库份额的函数
CREATE OR REPLACE FUNCTION update_vault_shares_after_withdrawal()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vault shares record
    UPDATE vault_shares 
    SET total_shares = total_shares - NEW.shares_redeemed,
        total_assets_value = total_assets_value - NEW.net_assets_received,
        total_withdrawals = total_withdrawals + NEW.net_assets_received,
        vault_total_assets = NEW.vault_total_assets,
        vault_total_shares = NEW.vault_total_shares,
        vault_price_per_share = NEW.vault_price_per_share,
        -- Calculate realized PnL for withdrawn shares
        realized_pnl = realized_pnl + (NEW.vault_price_per_share - average_price_per_share) * NEW.shares_redeemed,
        -- Recalculate unrealized PnL for remaining shares
        unrealized_pnl = CASE 
            WHEN total_shares - NEW.shares_redeemed > 0 
            THEN (NEW.vault_price_per_share - average_price_per_share) * (total_shares - NEW.shares_redeemed)
            ELSE 0.0
        END,
        last_updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id 
      AND network = NEW.network 
      AND vault_contract_address = NEW.vault_contract_address;
    
    -- Update athlete record
    UPDATE athletes 
    SET usdc_balance = usdc_balance + NEW.net_assets_received,
        vault_shares = vault_shares - NEW.shares_redeemed,
        vault_total_withdrawals = vault_total_withdrawals + NEW.net_assets_received,
        last_vault_transaction = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return NEW to allow transaction to continue
        RAISE WARNING 'Error updating vault shares after withdrawal for user %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vault withdrawals
CREATE TRIGGER trigger_update_vault_shares_after_withdrawal
    AFTER INSERT ON vault_withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION update_vault_shares_after_withdrawal();

-- Function to calculate season bonus requirements
-- 计算赛季奖金要求的函数
CREATE OR REPLACE FUNCTION calculate_season_bonus_requirements(
    p_user_id UUID,
    p_season_number INTEGER,
    p_season_year INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    matches_completed INTEGER;
    social_posts_completed INTEGER;
    requirements_met BOOLEAN;
    matches_required INTEGER;
    social_posts_required INTEGER;
BEGIN
    -- Get configuration values from system_config
    SELECT value::INTEGER INTO matches_required 
    FROM system_config 
    WHERE key = 'season_matches_required' 
    LIMIT 1;
    
    SELECT value::INTEGER INTO social_posts_required 
    FROM system_config 
    WHERE key = 'season_social_posts_required' 
    LIMIT 1;
    
    -- Use default values if not found in config
    IF matches_required IS NULL THEN
        matches_required := 10;
    END IF;
    
    IF social_posts_required IS NULL THEN
        social_posts_required := 5;
    END IF;
    
    -- Get matches completed this season
    SELECT COUNT(*) INTO matches_completed
    FROM match_results mr
    JOIN events e ON mr.event_id = e.id
    WHERE mr.athlete_id = (SELECT id FROM athletes WHERE user_id = p_user_id)
      AND EXTRACT(YEAR FROM e.event_date) = p_season_year
      AND e.status = 'completed';
    
    -- Get social posts completed this season
    SELECT COALESCE(COUNT(*), 0) INTO social_posts_completed
    FROM social_media_posts smp
    WHERE smp.user_id = p_user_id
      AND EXTRACT(YEAR FROM smp.posted_at) = p_season_year
      AND smp.verified = true;
    
    -- Check if requirements are met
    requirements_met := (matches_completed >= matches_required) AND (social_posts_completed >= social_posts_required);
    
    -- Update season bonus record
    UPDATE icp_season_bonuses 
    SET matches_completed = matches_completed,
        social_posts_completed = social_posts_completed,
        requirements_met = requirements_met,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id 
      AND season_number = p_season_number 
      AND season_year = p_season_year;
    
    RETURN requirements_met;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and return false
        RAISE WARNING 'Error calculating season bonus requirements for user %: %', p_user_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ========== 8. VIEWS / 视图 ==========

-- View for athlete vault summary
-- 运动员金库摘要视图
CREATE OR REPLACE VIEW athlete_vault_summary AS
SELECT 
    a.user_id,
    u.wallet_address,
    a.usdc_balance,
    a.vault_shares,
    a.vault_total_deposits,
    a.vault_total_withdrawals,
    a.season_bonus_balance,
    a.icp_principal,
    a.icp_account_verified,
    a.last_vault_transaction,
    a.vault_transfer_count,
    COALESCE(vs.total_assets_value, 0.0) as vault_assets_value,
    COALESCE(vs.unrealized_pnl, 0.0) as unrealized_pnl,
    COALESCE(vs.realized_pnl, 0.0) as realized_pnl,
    COALESCE(vs.vault_price_per_share, 0.0) as vault_price_per_share
FROM athletes a
JOIN users u ON a.user_id = u.id
LEFT JOIN vault_shares vs ON a.user_id = vs.user_id 
    AND vs.network = (SELECT value FROM system_config WHERE key = 'default_network' LIMIT 1)
    AND vs.vault_contract_address = (SELECT value FROM system_config WHERE key = 'vault_contract_address' LIMIT 1)
WHERE u.role = 'athlete';

-- View for vault transaction history
-- 金库交易历史视图
CREATE OR REPLACE VIEW vault_transaction_history AS
SELECT 
    'deposit' as transaction_type,
    user_id,
    transaction_hash,
    assets_amount as amount,
    shares_minted as shares,
    status,
    created_at,
    network
FROM vault_deposits
UNION ALL
SELECT 
    'withdrawal' as transaction_type,
    user_id,
    transaction_hash,
    assets_requested as amount,
    shares_redeemed as shares,
    status,
    created_at,
    network
FROM vault_withdrawals
ORDER BY created_at DESC;

-- ========== 9. COMMENTS / 注释 ==========

COMMENT ON TABLE vault_deposits IS 'Records all vault deposit transactions with detailed state information';
COMMENT ON TABLE vault_withdrawals IS 'Records all vault withdrawal transactions with detailed state information';
COMMENT ON TABLE vault_shares IS 'Tracks user vault share balances and performance metrics';
COMMENT ON TABLE vault_fees IS 'Records vault fee collections for different fee types';
COMMENT ON TABLE social_media_posts IS 'Tracks user social media posts for season bonus requirements';
COMMENT ON TABLE icp_accounts IS 'Stores ICP account information and verification status';
COMMENT ON TABLE icp_season_bonuses IS 'Tracks ICP season bonus allocations and requirements';
COMMENT ON TABLE icp_transactions IS 'Records all ICP blockchain transactions';
COMMENT ON TABLE usdc_balances IS 'Tracks user USDC balances across different networks';
COMMENT ON TABLE usdc_transactions IS 'Records all USDC token transactions';
COMMENT ON TABLE usdc_approvals IS 'Tracks USDC token approval states';
COMMENT ON TABLE system_config IS 'Stores system configuration for vault and ICP integration';

COMMENT ON VIEW athlete_vault_summary IS 'Comprehensive view of athlete vault and ICP integration data';
COMMENT ON VIEW vault_transaction_history IS 'Unified view of all vault transactions for history tracking'; 