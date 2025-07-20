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

    // Query to get the event closest to start time from events table
    // 查询从events表获取离开始时间最近的赛事
    const query = `
      SELECT 
        e.id,
        e.title as event_title,
        e.description as event_description,
        e.event_date as event_start_time,
        e.venue_name,
        e.venue_capacity,
        e.party_venue_capacity,
        ea.team_a_info,
        ea.team_b_info,
        e.estimated_participants,
        e.expected_revenue,
        e.status,
        e.created_at,
        u.student_id as ambassador_student_id,
        u.profile_data as ambassador_profile,
        -- Calculate QR expiry time (4 hours before event)
        -- 计算QR码过期时间（赛事前4小时）
        (e.event_date - INTERVAL '4 hours') as qr_expiry_time,
        -- Get current stakers count from user_stake_records
        -- 从user_stake_records获取当前质押者数量
        COALESCE((
          SELECT COUNT(DISTINCT usr.user_id) 
          FROM user_stake_records usr
          WHERE usr.event_id = e.id AND usr.status = 'active'
        ), 0) as current_stakers,
        -- Get total pool amount from user_stake_records
        -- 从user_stake_records获取总奖池金额
        COALESCE((
          SELECT SUM(usr.stake_amount) 
          FROM user_stake_records usr
          WHERE usr.event_id = e.id AND usr.status = 'active'
        ), 0) as total_pool_amount,
        -- Get party applicants count (placeholder for now)
        -- 获取聚会申请者数量（暂时占位符）
        0 as party_applicants,
        -- Get the latest pool balance after from chz_pool_management
        -- 从chz_pool_management获取最新的pool_balance_after
        COALESCE((
          SELECT cpm.pool_balance_after 
          FROM chz_pool_management cpm
          WHERE cpm.event_id = e.id 
          ORDER BY cpm.created_at DESC 
          LIMIT 1
        ), 0) as pool_balance_after
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LEFT JOIN users u ON e.ambassador_id = u.id
      WHERE e.status = 'active' AND e.event_date IS NOT NULL
      ORDER BY ABS(EXTRACT(EPOCH FROM (e.event_date - NOW())))
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

    // Parse team info fields safely
    // 安全解析队伍信息字段
    const safeTeamInfoParse = (value: any, defaultValue: any) => {
      try {
        if (!value) return defaultValue;
        if (typeof value === 'object') {
          // If it's already an object, return it directly
          // 如果已经是对象，直接返回
          return value;
        }
        if (typeof value === 'string') {
          // Try to parse as JSON string
          // 尝试解析为JSON字符串
          return JSON.parse(value);
        }
        return defaultValue;
      } catch (error) {
        console.error('Team info parse error:', error, 'Value:', value);
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
        name: safeTeamInfoParse(event.ambassador_profile, {}).name || 'Ambassador',
        contact: `@${event.ambassador_student_id || 'ambassador'}`
      },
      // Extract real team information from JSON with gladiator helmet emojis
      // 从JSON中提取真实队伍信息，使用角斗士头盔emoji
      teamA: {
        name: safeTeamInfoParse(event.team_a_info, {}).name || 'Team A',
        icon: '🛡️', // Gladiator helmet emoji for team A
      },
      teamB: {
        name: safeTeamInfoParse(event.team_b_info, {}).name || 'Team B',
        icon: '⚔️', // Different gladiator helmet emoji for team B
      }
    };

    console.log(`Found featured event: ${formattedEvent.title}`);
    console.log(`找到焦点赛事: ${formattedEvent.title}`);
    console.log(`Pool balance after: ${formattedEvent.poolBalanceAfter} CHZ`);
    console.log(`奖池余额: ${formattedEvent.poolBalanceAfter} CHZ`);
    
    // Debug team information
    // 调试队伍信息
    console.log('Debug team information:');
    console.log('调试队伍信息:');
    console.log(`Raw team_a_info: ${event.team_a_info}`);
    console.log(`Raw team_b_info: ${event.team_b_info}`);
    console.log(`Parsed teamA: ${JSON.stringify(formattedEvent.teamA)}`);
    console.log(`Parsed teamB: ${JSON.stringify(formattedEvent.teamB)}`);

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