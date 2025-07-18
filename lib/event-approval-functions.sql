-- Event Approval Workflow Database Functions
-- 事件审批工作流数据库函数
-- This file contains all the necessary functions for the complete event approval process
-- 此文件包含完整事件审批流程所需的所有函数

-- Function to create event from approved application
-- 从已批准的申请创建事件的函数
CREATE OR REPLACE FUNCTION create_event_from_application(application_id UUID)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
    application_record RECORD;
BEGIN
    -- Get application details
    -- 获取申请详情
    SELECT * INTO application_record 
    FROM event_applications 
    WHERE id = application_id AND status = 'approved';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or not approved';
    END IF;
    
    -- Create event record
    -- 创建事件记录
    INSERT INTO events (
        title,
        description,
        sport_type,
        event_date,
        start_time,
        end_time,
        venue_name,
        venue_address,
        venue_capacity,
        party_venue_capacity,
        team_a_info,
        team_b_info,
        estimated_participants,
        expected_revenue,
        status,
        ambassador_id,
        application_id,
        created_at,
        updated_at
    ) VALUES (
        application_record.event_title,
        application_record.event_description,
        'soccer', -- Default sport type, can be enhanced
        application_record.event_start_time::date,
        application_record.event_start_time::time,
        application_record.event_end_time::time,
        application_record.venue_name,
        application_record.venue_address,
        application_record.venue_capacity,
        application_record.party_venue_capacity,
        application_record.team_a_info,
        application_record.team_b_info,
        application_record.estimated_participants,
        application_record.expected_revenue,
        'pre_match', -- Initial status
        application_record.ambassador_id,
        application_id,
        NOW(),
        NOW()
    ) RETURNING id INTO event_id;
    
    -- Log event creation
    -- 记录事件创建
    INSERT INTO event_creation_log (
        event_id,
        application_id,
        ambassador_id,
        created_at
    ) VALUES (
        event_id,
        application_id,
        application_record.ambassador_id,
        NOW()
    );
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to inject CHZ pool into event
-- 向事件注入CHZ奖池的函数
CREATE OR REPLACE FUNCTION inject_chz_pool(
    event_id UUID, 
    amount DECIMAL, 
    admin_id UUID,
    fee_rule_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    event_record RECORD;
    current_pool DECIMAL;
BEGIN
    -- Get event details
    -- 获取事件详情
    SELECT * INTO event_record 
    FROM events 
    WHERE id = event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
    
    -- Get current pool amount
    -- 获取当前奖池金额
    current_pool := COALESCE(event_record.pool_injected_chz, 0);
    
    -- Update event with injected CHZ
    -- 用注入的CHZ更新事件
    UPDATE events 
    SET 
        pool_injected_chz = current_pool + amount,
        total_pool_amount = current_pool + amount,
        fee_rule_id = COALESCE(fee_rule_id, event_record.fee_rule_id),
        updated_at = NOW()
    WHERE id = event_id;
    
    -- Log CHZ injection
    -- 记录CHZ注入
    INSERT INTO chz_pool_injection_log (
        event_id,
        admin_id,
        injected_amount,
        total_pool_amount,
        injection_date
    ) VALUES (
        event_id,
        admin_id,
        amount,
        current_pool + amount,
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to create support options for event
-- 为事件创建支持选项的函数
CREATE OR REPLACE FUNCTION create_event_support_options(
    event_id UUID,
    team_a_coefficient DECIMAL DEFAULT 1.0,
    team_b_coefficient DECIMAL DEFAULT 1.0
)
RETURNS BOOLEAN AS $$
DECLARE
    event_record RECORD;
BEGIN
    -- Get event details
    -- 获取事件详情
    SELECT * INTO event_record 
    FROM events 
    WHERE id = event_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Event not found';
    END IF;
    
    -- Create support option for Team A
    -- 为A队创建支持选项
    INSERT INTO support_options (
        event_id,
        option_name,
        option_description,
        coefficient,
        team_association,
        is_active,
        created_at
    ) VALUES (
        event_id,
        'Support Team A',
        'Support ' || (event_record.team_a_info->>'name') || ' with ' || team_a_coefficient || 'x coefficient',
        team_a_coefficient,
        'team_a',
        TRUE,
        NOW()
    );
    
    -- Create support option for Team B
    -- 为B队创建支持选项
    INSERT INTO support_options (
        event_id,
        option_name,
        option_description,
        coefficient,
        team_association,
        is_active,
        created_at
    ) VALUES (
        event_id,
        'Support Team B',
        'Support ' || (event_record.team_b_info->>'name') || ' with ' || team_b_coefficient || 'x coefficient',
        team_b_coefficient,
        'team_b',
        TRUE,
        NOW()
    );
    
    -- Update event with support options
    -- 用支持选项更新事件
    UPDATE events 
    SET 
        support_options = jsonb_build_object(
            'team_a_coefficient', team_a_coefficient,
            'team_b_coefficient', team_b_coefficient
        ),
        updated_at = NOW()
    WHERE id = event_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to complete event approval process
-- 完成事件审批流程的函数
CREATE OR REPLACE FUNCTION complete_event_approval(
    application_id UUID,
    admin_id UUID,
    injected_chz_amount DECIMAL DEFAULT 0,
    team_a_coefficient DECIMAL DEFAULT 1.0,
    team_b_coefficient DECIMAL DEFAULT 1.0,
    admin_notes TEXT DEFAULT ''
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
    application_record RECORD;
BEGIN
    -- Get application details
    -- 获取申请详情
    SELECT * INTO application_record 
    FROM event_applications 
    WHERE id = application_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or already processed';
    END IF;
    
    -- Update application status
    -- 更新申请状态
    UPDATE event_applications 
    SET 
        status = 'approved',
        reviewed_by = admin_id,
        reviewed_at = NOW(),
        admin_review = jsonb_build_object(
            'decision', 'approved',
            'admin_notes', admin_notes,
            'injected_chz_amount', injected_chz_amount,
            'team_a_coefficient', team_a_coefficient,
            'team_b_coefficient', team_b_coefficient
        )
    WHERE id = application_id;
    
    -- Create event
    -- 创建事件
    SELECT create_event_from_application(application_id) INTO event_id;
    
    -- Inject CHZ pool if amount specified
    -- 如果指定了金额则注入CHZ奖池
    IF injected_chz_amount > 0 THEN
        PERFORM inject_chz_pool(event_id, injected_chz_amount, admin_id);
    END IF;
    
    -- Create support options
    -- 创建支持选项
    PERFORM create_event_support_options(event_id, team_a_coefficient, team_b_coefficient);
    
    -- Log approval action
    -- 记录审批操作
    INSERT INTO event_approval_log (
        application_id,
        admin_id,
        action_type,
        decision,
        injected_chz_amount,
        support_options,
        admin_notes,
        created_at
    ) VALUES (
        application_id,
        admin_id,
        'approve',
        'approved',
        injected_chz_amount,
        jsonb_build_object(
            'team_a_coefficient', team_a_coefficient,
            'team_b_coefficient', team_b_coefficient
        ),
        admin_notes,
        NOW()
    );
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reject event application
-- 拒绝事件申请的函数
CREATE OR REPLACE FUNCTION reject_event_application(
    application_id UUID,
    admin_id UUID,
    admin_notes TEXT DEFAULT ''
)
RETURNS BOOLEAN AS $$
DECLARE
    application_record RECORD;
BEGIN
    -- Get application details
    -- 获取申请详情
    SELECT * INTO application_record 
    FROM event_applications 
    WHERE id = application_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Application not found or already processed';
    END IF;
    
    -- Update application status
    -- 更新申请状态
    UPDATE event_applications 
    SET 
        status = 'rejected',
        reviewed_by = admin_id,
        reviewed_at = NOW(),
        admin_review = jsonb_build_object(
            'decision', 'rejected',
            'admin_notes', admin_notes
        )
    WHERE id = application_id;
    
    -- Log rejection action
    -- 记录拒绝操作
    INSERT INTO event_approval_log (
        application_id,
        admin_id,
        action_type,
        decision,
        admin_notes,
        created_at
    ) VALUES (
        application_id,
        admin_id,
        'reject',
        'rejected',
        admin_notes,
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql; 