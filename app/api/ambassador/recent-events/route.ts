import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/ambassador/recent-events
// Get recent events for ambassador
// 获取大使的最近活动
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const ambassadorId = searchParams.get('ambassador_id'); // This should come from user context

    console.log('Ambassador: Fetching recent events with filter:', filter);
    console.log('大使: 获取最近活动，过滤器:', filter);

    // Build filter condition
    // 构建过滤条件
    let statusFilter = '';
    if (filter !== 'all') {
      statusFilter = `AND e.match_status = '${filter}'`;
    }

    const sqlQuery = `
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.description as event_description,
        e.event_date,
        e.status as match_status,
        e.pool_injected_chz,
        e.total_pool_amount,
        e.match_result,
        e.team_a_score,
        e.team_b_score,
        e.result_announced_at,
        ea.team_a_info,
        ea.team_b_info,
        ea.venue_name,
        ea.venue_capacity,
        u.wallet_address as ambassador_wallet,
        COUNT(DISTINCT ep.id) as total_participants,
        COUNT(DISTINCT usr.id) as total_stakes,
        SUM(usr.stake_amount) as total_stakes_amount,
        e.rewards_distributed,
        e.rewards_distributed_at,
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
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      LEFT JOIN user_stake_records usr ON e.id = usr.event_id
      WHERE e.ambassador_id = $1 
        AND e.status IN ('active', 'completed')
        -- Filter out events older than 30 days (configurable)
        -- 过滤掉超过30天的活动（可配置）
        AND e.event_date > (NOW() - INTERVAL '30 days')
        ${statusFilter}
      GROUP BY e.id, e.title, e.description, e.event_date, e.status, 
               e.pool_injected_chz, e.total_pool_amount, e.match_result,
               e.team_a_score, e.team_b_score, e.result_announced_at,
               ea.team_a_info, ea.team_b_info, ea.venue_name, ea.venue_capacity,
               u.wallet_address, e.rewards_distributed, e.rewards_distributed_at
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
    `;

    // Use the ambassador ID from the database that has real events
    // 使用数据库中有真实活动的大使ID
    const ambassadorIdToUse = ambassadorId || '1de6110a-f982-4f7f-979e-00e7f7d33bed';

    const result = await query(sqlQuery, [ambassadorIdToUse]);

    console.log(`Found ${result.rows.length} recent events for ambassador`);
    console.log(`为大使找到 ${result.rows.length} 个最近活动`);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching recent events:', error);
    console.error('获取最近活动时出错:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent events' },
      { status: 500 }
    );
  }
} 