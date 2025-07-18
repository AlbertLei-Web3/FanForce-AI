import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection pool
// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
});

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

    const query = `
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.description as event_description,
        e.event_date,
        e.match_status,
        e.pool_injected_chz,
        e.total_pool_amount,
        e.match_result,
        ea.team_a_info,
        ea.team_b_info,
        ea.venue_name,
        ea.venue_capacity,
        u.wallet_address as ambassador_wallet,
        COUNT(DISTINCT ep.id) as total_participants,
        COUNT(DISTINCT assr.id) as total_supporters
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LEFT JOIN users u ON e.ambassador_id = u.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      LEFT JOIN audience_support_records assr ON e.id = assr.event_id
      WHERE e.ambassador_id = $1 
        AND e.match_status IN ('pre_match', 'active', 'completed')
        ${statusFilter}
      GROUP BY e.id, e.title, e.description, e.event_date, e.match_status, 
               e.pool_injected_chz, e.total_pool_amount, e.match_result,
               ea.team_a_info, ea.team_b_info, ea.venue_name, ea.venue_capacity,
               u.wallet_address
      ORDER BY e.event_date DESC
    `;

    // For demo purposes, use a default ambassador ID if not provided
    // 出于演示目的，如果未提供则使用默认大使ID
    const ambassadorIdToUse = ambassadorId || '1de6110a-f982-4f7f-979e-00e7f7d33bed';

    const result = await pool.query(query, [ambassadorIdToUse]);

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