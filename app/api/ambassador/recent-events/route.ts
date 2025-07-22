import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/ambassador/recent-events
// Get recent approved events for ambassador
// 获取大使的最近已批准活动
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const ambassadorId = searchParams.get('ambassador_id'); // This should come from user context

    console.log('Ambassador: Fetching recent approved events with filter:', filter);
    console.log('大使: 获取最近已批准活动，过滤器:', filter);

    // Build filter condition
    // 构建过滤条件
    let statusFilter = '';
    if (filter !== 'all') {
      statusFilter = `AND e.status = '${filter}'`;
    }

    const sqlQuery = `
      SELECT 
        e.id as event_id,
        COALESCE(e.title, ea.event_title) as event_title,
        COALESCE(e.description, ea.event_description) as event_description,
        e.event_date,
        e.status as match_status,
        COALESCE(e.venue_name, ea.venue_name) as venue_name,
        COALESCE(e.venue_capacity, ea.venue_capacity) as venue_capacity,
        e.party_venue_capacity,
        ea.team_a_info,
        ea.team_b_info,
        -- Match result information
        -- 比赛结果信息
        e.match_result,
        e.team_a_score,
        e.team_b_score,
        e.result_announced_at,
        e.match_completed_at,
        -- Get approval time from event_approval_log
        -- 从event_approval_log获取审批时间
        COALESCE((
          SELECT eal.created_at 
          FROM event_approval_log eal
          WHERE eal.application_id = ea.id 
            AND eal.action_type = 'approve'
            AND eal.decision = 'approved'
          ORDER BY eal.created_at DESC 
          LIMIT 1
        ), ea.created_at) as approval_time,
        u.wallet_address as ambassador_wallet,
        u.student_id as ambassador_student_id,
        -- Get participant count from event_participants
        -- 从event_participants获取参与者数量
        COALESCE((
          SELECT COUNT(DISTINCT ep.user_id) 
          FROM event_participants ep
          WHERE ep.event_id = e.id AND ep.status IN ('registered', 'confirmed', 'attended')
        ), 0) as total_participants,
        -- Get stakes count and amount from user_stake_records
        -- 从user_stake_records获取质押数量和金额
        COALESCE((
          SELECT COUNT(DISTINCT usr.user_id) 
          FROM user_stake_records usr
          WHERE usr.event_id = e.id AND usr.status = 'active'
        ), 0) as total_stakes,
        COALESCE((
          SELECT SUM(usr.stake_amount) 
          FROM user_stake_records usr
          WHERE usr.event_id = e.id AND usr.status = 'active'
        ), 0) as total_stakes_amount,
        -- Calculate time proximity to current time for better sorting
        -- 计算与当前时间的接近度以便更好地排序
        CASE 
          WHEN e.event_date > NOW() THEN 
            EXTRACT(EPOCH FROM (e.event_date - NOW())) / 3600 -- Hours until event
          ELSE 
            EXTRACT(EPOCH FROM (NOW() - e.event_date)) / 3600 -- Hours since event
        END as time_proximity_hours
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LEFT JOIN users u ON e.ambassador_id = u.id
      WHERE e.ambassador_id = $1 
        AND e.status IN ('active', 'completed')
        -- Only show events that were created from approved applications
        -- 只显示从已批准申请创建的活动
        AND ea.status = 'approved'
        -- Filter out events older than 30 days (configurable)
        -- 过滤掉超过30天的活动（可配置）
        AND e.event_date > (NOW() - INTERVAL '30 days')
        ${statusFilter}
      ORDER BY 
        -- Priority 1: Most recently approved events first
        -- 优先级1：最近审批的事件优先
        approval_time DESC,
        -- Priority 2: Future events before past events
        -- 优先级2：未来事件优先于过去事件
        CASE WHEN e.event_date > NOW() THEN 0 ELSE 1 END,
        -- Priority 3: By event date for events approved at same time
        -- 优先级3：对于同时审批的事件，按事件日期排序
        e.event_date DESC
      LIMIT 6
    `;

    // Use the ambassador ID from the database that has real events
    // 使用数据库中有真实活动的大使ID
    const ambassadorIdToUse = ambassadorId || '1de6110a-f982-4f7f-979e-00e7f7d33bed';

    const result = await query(sqlQuery, [ambassadorIdToUse]);

    console.log(`Found ${result.rows.length} recent approved events for ambassador`);
    console.log(`为大使找到 ${result.rows.length} 个最近已批准活动`);

    // Format the response to match frontend expectations
    // 格式化响应以匹配前端期望
    const formattedEvents = result.rows.map((event) => ({
      event_id: event.event_id,
      event_title: event.event_title,
      event_description: event.event_description,
      event_date: event.event_date,
      match_status: event.match_status,
      venue_name: event.venue_name,
      venue_capacity: event.venue_capacity,
      party_venue_capacity: event.party_venue_capacity,
      team_a_info: event.team_a_info,
      team_b_info: event.team_b_info,
      // Match result fields
      // 比赛结果字段
      match_result: event.match_result,
      team_a_score: event.team_a_score,
      team_b_score: event.team_b_score,
      result_announced_at: event.result_announced_at,
      match_completed_at: event.match_completed_at,
      approval_time: event.approval_time,
      ambassador_wallet: event.ambassador_wallet,
      ambassador_student_id: event.ambassador_student_id,
      total_participants: event.total_participants,
      total_stakes: event.total_stakes,
      total_stakes_amount: event.total_stakes_amount,
      time_proximity_hours: event.time_proximity_hours
    }));

    return NextResponse.json({
      success: true,
      data: formattedEvents
    });

  } catch (error) {
    console.error('Error fetching recent approved events:', error);
    console.error('获取最近已批准活动时出错:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent approved events' },
      { status: 500 }
    );
  }
} 