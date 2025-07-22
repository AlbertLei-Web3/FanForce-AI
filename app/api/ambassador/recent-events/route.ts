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
        e.title as event_title,
        e.description as event_description,
        e.event_date,
        e.status as match_status,
        e.venue_name,
        e.venue_capacity,
        e.party_venue_capacity,
        ea.team_a_info,
        ea.team_b_info,
        ea.venue_name as application_venue_name,
        ea.venue_capacity as application_venue_capacity,
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
        -- Future events first (closest to current time)
        -- 未来活动优先（最接近当前时间）
        CASE WHEN e.event_date > NOW() THEN 0 ELSE 1 END,
        -- Then by time proximity (closest first)
        -- 然后按时间接近度排序（最近的优先）
        time_proximity_hours ASC,
        -- Finally by event date for events at same time
        -- 最后按活动日期排序（同一时间的活动）
        e.event_date DESC
      LIMIT 6
    `;

    // Use the ambassador ID from the database that has real events
    // 使用数据库中有真实活动的大使ID
    const ambassadorIdToUse = ambassadorId || '1de6110a-f982-4f7f-979e-00e7f7d33bed';

    const result = await query(sqlQuery, [ambassadorIdToUse]);

    console.log(`Found ${result.rows.length} recent approved events for ambassador`);
    console.log(`为大使找到 ${result.rows.length} 个最近已批准活动`);

    return NextResponse.json({
      success: true,
      data: result.rows
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