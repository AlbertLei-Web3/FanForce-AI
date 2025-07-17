// Athlete Upcoming Matches API Route
// 运动员即将到来比赛API路由
// This endpoint retrieves upcoming matches for athletes who have been selected for events
// 此端点检索已被选择参加赛事的运动员的即将到来比赛

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// GET - Retrieve upcoming matches for an athlete
// GET - 获取运动员的即将到来比赛
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const athlete_id = searchParams.get('athlete_id')
    const include_past = searchParams.get('include_past') === 'true'

    console.log('Fetching upcoming matches for athlete...', { athlete_id, include_past })
    console.log('获取运动员即将到来比赛...', { athlete_id, include_past })

    // Validate required parameters
    // 验证必需参数
    if (!athlete_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: athlete_id',
        error_cn: '缺少必需参数：athlete_id'
      }, { status: 400 })
    }

    // Verify athlete exists and has correct role
    // 验证运动员存在且角色正确
    const athleteCheck = await query(`
      SELECT u.id, u.role, u.profile_data, a.status, a.availability_status
      FROM users u
      JOIN athletes a ON u.id = a.user_id
      WHERE u.id = $1 AND u.role = 'athlete'
    `, [athlete_id])

    if (athleteCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Athlete not found or invalid role',
        error_cn: '运动员未找到或角色无效'
      }, { status: 404 })
    }

    const athlete = athleteCheck.rows[0]

    // Get upcoming matches where this athlete is selected
    // 获取此运动员被选择的即将到来比赛
    const upcomingMatchesQuery = `
      SELECT DISTINCT
        ea.id as event_id,
        ea.event_title,
        ea.sport_type,
        ea.event_date,
        ea.event_time,
        ea.venue_name,
        ea.venue_capacity,
        ea.estimated_duration,
        ea.status as event_status,
        ea.created_at,
        ea.updated_at,
        
        -- Team Draft Information
        td.id as draft_id,
        td.draft_name,
        td.team_a_name,
        td.team_b_name,
        td.team_a_athletes,
        td.team_b_athletes,
        
        -- Check which team this athlete is on
        CASE 
          WHEN td.team_a_athletes::jsonb ? $1 THEN 'A'
          WHEN td.team_b_athletes::jsonb ? $1 THEN 'B'
          ELSE NULL
        END as athlete_team,
        
        -- CHZ Pool Information
        cpi.pool_amount,
        cpi.fee_percentage,
        cpi.injection_status,
        
        -- Ambassador Information
        amb.profile_data as ambassador_profile
        
      FROM event_applications ea
      LEFT JOIN team_drafts td ON td.id = ANY(
        string_to_array(ea.additional_notes, ',')::uuid[]
      )
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      LEFT JOIN users amb ON amb.id = ea.ambassador_id
      
      WHERE (
        td.team_a_athletes::jsonb ? $1 OR 
        td.team_b_athletes::jsonb ? $1
      )
      AND ea.status IN ('approved', 'pre_match', 'live')
      ${include_past ? '' : 'AND ea.event_date >= CURRENT_DATE'}
      
      ORDER BY ea.event_date ASC, ea.event_time ASC
    `

    const upcomingMatches = await query(upcomingMatchesQuery, [athlete_id])

    // Get athlete selection details
    // 获取运动员选择详情
    const selectionDetails = await query(`
      SELECT 
        eas.*,
        ea.event_title,
        ea.event_date
      FROM event_athlete_selections eas
      JOIN event_applications ea ON ea.id = eas.event_id
      WHERE eas.athlete_id = $1
      ${include_past ? '' : 'AND ea.event_date >= CURRENT_DATE'}
      ORDER BY ea.event_date ASC
    `, [athlete_id])

    // Get athlete's current competition status
    // 获取运动员当前比赛状态
    const currentStatus = {
      status: athlete.status,
      availability_status: athlete.availability_status,
      upcoming_matches_count: upcomingMatches.rows.length,
      next_match_date: upcomingMatches.rows.length > 0 ? upcomingMatches.rows[0].event_date : null,
      selected_for_events: selectionDetails.rows.length
    }

    return NextResponse.json({
      success: true,
      athlete_status: currentStatus,
      upcoming_matches: upcomingMatches.rows.map(match => ({
        ...match,
        team_a_athletes: JSON.parse(match.team_a_athletes || '[]'),
        team_b_athletes: JSON.parse(match.team_b_athletes || '[]'),
        ambassador_profile: JSON.parse(match.ambassador_profile || '{}')
      })),
      selection_details: selectionDetails.rows,
      message: 'Upcoming matches retrieved successfully',
      message_cn: '即将到来比赛获取成功'
    })

  } catch (error) {
    console.error('Error fetching upcoming matches:', error)
    console.error('获取即将到来比赛错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch upcoming matches',
      error_cn: '获取即将到来比赛失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update athlete's competition status
// POST - 更新运动员比赛状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { athlete_id, status, availability_status } = body

    console.log('Updating athlete competition status...', { athlete_id, status, availability_status })
    console.log('更新运动员比赛状态...', { athlete_id, status, availability_status })

    // Validate required parameters
    // 验证必需参数
    if (!athlete_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: athlete_id',
        error_cn: '缺少必需参数：athlete_id'
      }, { status: 400 })
    }

    // Update athlete status
    // 更新运动员状态
    const updateResult = await query(`
      UPDATE athletes 
      SET 
        status = COALESCE($2, status),
        availability_status = COALESCE($3, availability_status),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `, [athlete_id, status, availability_status])

    if (updateResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Athlete not found',
        error_cn: '运动员未找到'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      athlete: updateResult.rows[0],
      message: 'Athlete status updated successfully',
      message_cn: '运动员状态更新成功'
    })

  } catch (error) {
    console.error('Error updating athlete status:', error)
    console.error('更新运动员状态错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update athlete status',
      error_cn: '更新运动员状态失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 