-- FanForce AI Database Basic Schema
-- Core tables for Web2-first architecture
-- Encoding: UTF8 compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create core tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'ambassador', 'athlete', 'audience')),
    student_id VARCHAR(50),
    profile_data JSONB DEFAULT '{}',
    virtual_chz_balance DECIMAL(18,8) DEFAULT 0.0,
    real_chz_balance DECIMAL(18,8) DEFAULT 0.0,
    reliability_score INTEGER DEFAULT 100,
    emergency_contact VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    available_capacity INTEGER NOT NULL,
    facilities JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    emergency_info JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id),
    party_venue_id UUID REFERENCES venues(id),
    ambassador_id UUID REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    registration_deadline TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    entry_fee DECIMAL(18,8) DEFAULT 0.0,
    stake_amount DECIMAL(18,8) DEFAULT 0.0,
    max_participants INTEGER DEFAULT 100,
    current_participants INTEGER DEFAULT 0,
    weather_dependency VARCHAR(20) DEFAULT 'low' CHECK (weather_dependency IN ('low', 'medium', 'high')),
    contingency_plans JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    ranking INTEGER DEFAULT 1000,
    tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    status VARCHAR(20) DEFAULT 'resting' CHECK (status IN ('resting', 'active', 'competing')),
    season_earnings DECIMAL(18,8) DEFAULT 0.0,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    social_posts INTEGER DEFAULT 0,
    total_fees_earned DECIMAL(18,8) DEFAULT 0.0,
    performance_stats JSONB DEFAULT '{}',
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'injured')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    participation_type VARCHAR(20) NOT NULL CHECK (participation_type IN ('athlete', 'audience')),
    team_assignment VARCHAR(10) CHECK (team_assignment IN ('A', 'B', 'none')),
    tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'vip')),
    stake_amount DECIMAL(18,8) DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show')),
    qr_checked_in BOOLEAN DEFAULT FALSE,
    check_in_time TIMESTAMP,
    reward_earned DECIMAL(18,8) DEFAULT 0.0,
    participation_proof TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    code_type VARCHAR(20) NOT NULL CHECK (code_type IN ('check_in', 'party_access')),
    qr_data TEXT NOT NULL,
    jwt_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    max_usage INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS qr_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    qr_code_id UUID REFERENCES qr_codes(id),
    user_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    scan_type VARCHAR(20) NOT NULL CHECK (scan_type IN ('check_in', 'party_access')),
    scan_result VARCHAR(20) NOT NULL CHECK (scan_result IN ('success', 'failed', 'expired')),
    scan_metadata JSONB DEFAULT '{}',
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('stake', 'payout', 'fee', 'refund')),
    amount DECIMAL(18,8) NOT NULL,
    fee_amount DECIMAL(18,8) DEFAULT 0.0,
    currency VARCHAR(10) DEFAULT 'CHZ' CHECK (currency IN ('CHZ', 'Virtual_CHZ')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    blockchain_hash VARCHAR(66),
    payment_method VARCHAR(20) DEFAULT 'contract' CHECK (payment_method IN ('contract', 'virtual')),
    transaction_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('winner', 'participation', 'bonus')),
    base_amount DECIMAL(18,8) NOT NULL,
    multiplier DECIMAL(4,2) DEFAULT 1.0,
    final_amount DECIMAL(18,8) NOT NULL,
    tier VARCHAR(20) DEFAULT 'standard' CHECK (tier IN ('standard', 'premium', 'vip')),
    status VARCHAR(20) DEFAULT 'calculated' CHECK (status IN ('calculated', 'pending', 'distributed')),
    distribution_method VARCHAR(20) DEFAULT 'contract' CHECK (distribution_method IN ('contract', 'virtual')),
    reward_metadata JSONB DEFAULT '{}',
    distributed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id),
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('participation', 'revenue', 'engagement')),
    metric_data JSONB DEFAULT '{}',
    metric_value DECIMAL(18,8) NOT NULL,
    period VARCHAR(20) DEFAULT 'daily' CHECK (period IN ('daily', 'weekly', 'monthly')),
    analysis_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ambassador_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    usage_limit INTEGER DEFAULT 100,
    usage_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_event_id ON qr_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_event_id ON qr_scans(event_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_athletes_updated_at BEFORE UPDATE ON athletes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_participants_updated_at BEFORE UPDATE ON event_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invite_codes_updated_at BEFORE UPDATE ON invite_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (wallet_address, role, student_id) VALUES
('0x1234567890123456789012345678901234567890', 'admin', 'ADMIN001'),
('0x2345678901234567890123456789012345678901', 'ambassador', 'AMB001'),
('0x3456789012345678901234567890123456789012', 'athlete', 'ATH001'),
('0x4567890123456789012345678901234567890123', 'audience', 'AUD001');

INSERT INTO venues (name, address, capacity, available_capacity) VALUES
('Campus Sports Center', '123 University Ave', 500, 500),
('Student Union Hall', '456 College St', 200, 200);

-- Success message
SELECT 'Database schema created successfully!' as message; 