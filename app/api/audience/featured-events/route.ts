 // Audience Featured Events API Route
// 观众焦点赛事API路由
// This endpoint fetches the most recent approved event for the Featured Championship section
// 此端点获取最新的已批准赛事用于焦点锦标赛部分

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

// GET /api/audience/featured-events
// Get the most recent approved event for Featured Championship
// 获取最新的已批准赛事用于焦点锦标赛
export async function GET(request: NextRequest) {
  try {
    console.log('Audience: Fetching featured event for championship display');
    console.log('观众: 获取用于锦标赛显示的焦点赛事');

    // Fixed query to properly关联event_applications with chz_pool_management through events table
    // 修复查询以通过events表正确关联event_applications与chz_pool_management
    const query = `
      SELECT 
        ea.id,
        ea.event_title,
        ea.event_description,
        ea.event_start_time,
        ea.venue_name,
        ea.venue_capacity,
        ea.party_venue_capacity,
        ea.team_a_info,
        ea.team_b_info,
        ea.estimated_participants,
        ea.expected_revenue,
        ea.status,
        ea.created_at,
        u.student_id as ambassador_student_id,
        u.profile_data as ambassador_profile,
        -- Calculate QR expiry time (4 hours before event)
        -- 计算QR码过期时间（赛事前4小时）
        (ea.event_start_time - INTERVAL '4 hours') as qr_expiry_time,
        -- Get current stakers count from audience_stakes_extended
        -- 从audience_stakes_extended获取当前质押者数量
        COALESCE((
          SELECT COUNT(DISTINCT user_id) 
          FROM audience_stakes_extended 
          WHERE event_id = ea.id AND stake_status = 'active'
        ), 0) as current_stakers,
        -- Get total pool amount from audience_stakes_extended
        -- 从audience_stakes_extended获取总奖池金额
        COALESCE((
          SELECT SUM(stake_amount) 
          FROM audience_stakes_extended 
          WHERE event_id = ea.id AND stake_status = 'active'
        ), 0) as total_pool_amount,
        -- Get party applicants count from event_participations
        -- 从event_participations获取聚会申请者数量
        COALESCE((
          SELECT COUNT(*) 
          FROM event_participations 
          WHERE application_id = ea.id AND participation_type = 'watch_and_party'
        ), 0) as party_applicants,
        -- Fixed: Get the latest pool balance after from chz_pool_management through events table
        -- 修复: 通过events表从chz_pool_management获取最新的pool_balance_after
        COALESCE((
          SELECT cpm.pool_balance_after 
          FROM chz_pool_management cpm
          JOIN events e ON cpm.event_id = e.id
          WHERE e.application_id = ea.id 
          ORDER BY cpm.created_at DESC 
          LIMIT 1
        ), 0) as pool_balance_after
      FROM event_applications ea
      LEFT JOIN users u ON ea.ambassador_id = u.id
      WHERE ea.status = 'approved'
      ORDER BY ea.created_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      console.log('No approved events found for featured championship');
      console.log('未找到已批准的焦点锦标赛赛事');
      
      return NextResponse.json({
        success: false,
        error: 'No approved events available',
        error_cn: '暂无已批准的赛事'
      }, { status: 404 });
    }

    const event = result.rows[0];

    // Parse JSON fields safely
    // 安全解析JSON字段
    const safeJsonParse = (value: any, defaultValue: any) => {
      try {
        if (!value) return defaultValue;
        if (typeof value === 'object') return value;
        return JSON.parse(value);
      } catch (error) {
        console.error('JSON parse error:', error, 'Value:', value);
        return defaultValue;
      }
    };

    // Format the response for the frontend
    // 为前端格式化响应
    const formattedEvent = {
      id: event.id,
      title: event.event_title,
      titleCn: event.event_title, // For now, same as English
      description: event.event_description,
      date: new Date(event.event_start_time).toISOString().split('T')[0],
      time: new Date(event.event_start_time).toTimeString().split(' ')[0].substring(0, 5),
      venue: event.venue_name,
      venueCn: event.venue_name, // For now, same as English
      capacity: event.venue_capacity,
      currentStakers: parseInt(event.current_stakers) || 0,
      totalPool: parseFloat(event.total_pool_amount) || 0,
      // Add the pool balance after from chz_pool_management (now properly关联)
      // 添加来自chz_pool_management的pool_balance_after（现在正确关联）
      poolBalanceAfter: parseFloat(event.pool_balance_after) || 0,
      partyVenue: 'Student Center', // Default value
      partyVenueCn: '学生中心', // Default value
      partyCapacity: event.party_venue_capacity || 0,
      partyApplicants: parseInt(event.party_applicants) || 0,
      status: 'open', // Default status for approved events
      qrExpiry: event.qr_expiry_time,
      ambassadorInfo: {
        name: safeJsonParse(event.ambassador_profile, {}).name || 'Ambassador',
        contact: `@${event.ambassador_student_id || 'ambassador'}`
      },
      // Extract real team information from JSON with gladiator helmet emojis
      // 从JSON中提取真实队伍信息，使用角斗士头盔emoji
      teamA: {
        name: safeJsonParse(event.team_a_info, {}).name || 'Team A',
        icon: '🛡️', // Gladiator helmet emoji for team A
      },
      teamB: {
        name: safeJsonParse(event.team_b_info, {}).name || 'Team B',
        icon: '⚔️', // Different gladiator helmet emoji for team B
      }
    };

    console.log(`Found featured event: ${formattedEvent.title}`);
    console.log(`找到焦点赛事: ${formattedEvent.title}`);
    console.log(`Pool balance after: ${formattedEvent.poolBalanceAfter} CHZ`);
    console.log(`奖池余额: ${formattedEvent.poolBalanceAfter} CHZ`);

    return NextResponse.json({
      success: true,
      featuredEvent: formattedEvent,
      message: 'Featured event retrieved successfully',
      message_cn: '焦点赛事获取成功'
    });

  } catch (error) {
    console.error('Error fetching featured event:', error);
    console.error('获取焦点赛事时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch featured event',
        error_cn: '获取焦点赛事失败'
      },
      { status: 500 }
    );
  }
}