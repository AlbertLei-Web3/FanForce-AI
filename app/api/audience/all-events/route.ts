// Audience All Events API Route
// 观众所有赛事API路由
// This endpoint fetches all active events for the All Events section
// 此端点获取所有活跃赛事用于所有赛事部分

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

// GET /api/audience/all-events
// Get all active events for All Events section
// 获取所有活跃赛事用于所有赛事部分
export async function GET(request: NextRequest) {
  try {
    console.log('Audience: Fetching all events for display');
    console.log('观众: 获取所有赛事用于显示');

    // Query to get all active events with comprehensive information
    // 查询获取所有活跃赛事的综合信息
    const query = `
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.venue_name,
        e.venue_capacity,
        e.party_venue_capacity,
        ea.team_a_info,
        ea.team_b_info,
        e.status,
        e.created_at,
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
        ), 0) as pool_balance_after,
        -- Get ambassador information
        -- 获取大使信息
        u.student_id as ambassador_student_id,
        u.profile_data as ambassador_profile
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LEFT JOIN users u ON e.ambassador_id = u.id
      WHERE e.status = 'active' 
        AND e.event_date > NOW()
        -- Only show events that were created from approved applications
        -- 只显示从已批准申请创建的活动
        AND ea.status = 'approved'
      ORDER BY e.event_date ASC
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      console.log('No active events found');
      console.log('未找到活跃赛事');
      
      return NextResponse.json({
        success: true,
        events: [],
        message: 'No active events available',
        message_cn: '暂无活跃赛事'
      });
    }

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
    const formattedEvents = result.rows.map((event) => ({
      id: event.id,
      title: event.title,
      titleCn: event.title, // For now, same as English
      description: event.description,
      date: new Date(event.event_date).toISOString().split('T')[0],
      time: new Date(event.event_date).toTimeString().split(' ')[0].substring(0, 5),
      venue: event.venue_name,
      venueCn: event.venue_name, // For now, same as English
      capacity: event.venue_capacity,
      currentStakers: parseInt(event.current_stakers) || 0,
      totalPool: parseFloat(event.total_pool_amount) || 0,
      poolBalanceAfter: parseFloat(event.pool_balance_after) || 0,
      partyVenue: 'Student Center', // Default value
      partyVenueCn: '学生中心', // Default value
      partyCapacity: event.party_venue_capacity || 0,
      partyApplicants: parseInt(event.party_applicants) || 0,
      status: 'open', // Default status for active events
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
    }));

    console.log(`Found ${formattedEvents.length} active events`);
    console.log(`找到 ${formattedEvents.length} 个活跃赛事`);

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      message: 'All events retrieved successfully',
      message_cn: '所有赛事获取成功'
    });

  } catch (error) {
    console.error('Error fetching all events:', error);
    console.error('获取所有赛事时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch all events',
        error_cn: '获取所有赛事失败'
      },
      { status: 500 }
    );
  }
} 