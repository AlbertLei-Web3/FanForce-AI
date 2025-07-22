// Ambassador All Events API Route
// 大使所有赛事API路由
// This endpoint fetches all events for a specific ambassador
// 此端点获取特定大使的所有赛事

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET /api/ambassador/all-events
// Get all events for a specific ambassador
// 获取特定大使的所有赛事
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ambassadorId = searchParams.get('ambassador_id');

    console.log('Ambassador: Fetching all events for ambassador:', ambassadorId);
    console.log('大使: 获取大使的所有赛事:', ambassadorId);

    if (!ambassadorId) {
      return NextResponse.json({
        success: false,
        error: 'Ambassador ID is required',
        error_cn: '需要大使ID'
      }, { status: 400 });
    }

    // Query to get all events for the ambassador with comprehensive information
    // 查询获取大使的所有赛事的综合信息
    const sqlQuery = `
      SELECT 
        e.id,
        COALESCE(e.title, ea.event_title) as title,
        COALESCE(e.description, ea.event_description) as description,
        e.event_date,
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
      WHERE e.ambassador_id = $1 
        AND e.status IN ('active', 'completed')
        -- Only show events that were created from approved applications
        -- 只显示从已批准申请创建的活动
        AND ea.status = 'approved'
      ORDER BY e.event_date DESC
    `;

    const result = await query(sqlQuery, [ambassadorId]);

    if (result.rows.length === 0) {
      console.log('No events found for ambassador');
      console.log('未找到大使的赛事');
      
      return NextResponse.json({
        success: true,
        events: [],
        message: 'No events found for this ambassador',
        message_cn: '未找到此大使的赛事'
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
      status: event.status,
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
      },
      // Add fields that frontend expects for Recent Events
      // 添加前端期望的Recent Events字段
      event_id: event.id,
      event_title: event.title,
      event_description: event.description,
      event_date: event.event_date,
      match_status: event.status,
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
      ambassador_wallet: event.ambassador_wallet,
      ambassador_student_id: event.ambassador_student_id,
      total_participants: event.current_stakers,
      total_stakes: event.current_stakers,
      total_stakes_amount: event.total_pool_amount,
      time_proximity_hours: 0 // Calculate if needed
    }));

    console.log(`Found ${formattedEvents.length} events for ambassador`);
    console.log(`为大使找到 ${formattedEvents.length} 个赛事`);

    return NextResponse.json({
      success: true,
      events: formattedEvents,
      message: 'All events retrieved successfully',
      message_cn: '所有赛事获取成功'
    });

  } catch (error) {
    console.error('Error fetching all events for ambassador:', error);
    console.error('获取大使所有赛事时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch all events for ambassador',
        error_cn: '获取大使所有赛事失败'
      },
      { status: 500 }
    );
  }
} 