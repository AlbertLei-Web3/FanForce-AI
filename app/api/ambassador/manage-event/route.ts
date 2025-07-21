import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database';

// Ambassador Manage Event API
// 大使管理活动API
// This endpoint allows ambassadors to input match results and announce outcomes
// 此端点允许大使输入比赛结果并宣布结果

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventId,
      teamAScore,
      teamBScore,
      matchResult,
      announcementNotes,
      weatherConditions,
      specialEvents
    } = body;

    // Validate required fields
    // 验证必填字段
    if (!eventId || teamAScore === undefined || teamBScore === undefined || !matchResult) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          message: '缺少必填字段',
          required: ['eventId', 'teamAScore', 'teamBScore', 'matchResult']
        },
        { status: 400 }
      );
    }

    // Validate match result
    // 验证比赛结果
    const validResults = ['team_a_wins', 'team_b_wins', 'draw', 'cancelled'];
    if (!validResults.includes(matchResult)) {
      return NextResponse.json(
        { 
          error: 'Invalid match result', 
          message: '无效的比赛结果',
          validResults 
        },
        { status: 400 }
      );
    }

    // Get ambassador ID from request (in real app, this would come from authentication)
    // 从请求中获取大使ID（在实际应用中，这将来自身份验证）
    const ambassadorId = request.headers.get('x-user-id') || '550e8400-e29b-41d4-a716-446655440001';

    // Verify the event exists and belongs to this ambassador
    // 验证活动存在且属于此大使
    const eventCheck = await query(
      `SELECT id, ambassador_id, status, title 
       FROM events 
       WHERE id = $1 AND ambassador_id = $2`,
      [eventId, ambassadorId]
    );

    if (eventCheck.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Event not found or access denied', 
          message: '未找到活动或访问被拒绝'
        },
        { status: 404 }
      );
    }

    const event = eventCheck.rows[0];

    // Check if event is in a valid state for result announcement
    // 检查活动是否处于有效状态以宣布结果
    if (event.status === 'completed' || event.status === 'cancelled') {
      return NextResponse.json(
        { 
          error: 'Event already has a final result', 
          message: '活动已有最终结果'
        },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    // 使用事务确保数据一致性
    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Update event with match result
      // 用比赛结果更新活动
      await client.query(
        `UPDATE events 
         SET match_result = $1, 
             team_a_score = $2, 
             team_b_score = $3,
             result_announced_at = NOW(),
             result_announced_by = $4,
             match_completed_at = NOW(),
             status = 'completed',
             updated_at = NOW()
         WHERE id = $5`,
        [matchResult, teamAScore, teamBScore, ambassadorId, eventId]
      );

      // Create match result announcement log
      // 创建比赛结果公告日志
      await client.query(
        `INSERT INTO match_result_announcements (
          event_id, 
          announced_by, 
          team_a_score, 
          team_b_score, 
          match_result, 
          announcement_notes, 
          weather_conditions, 
          special_events
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          eventId, 
          ambassadorId, 
          teamAScore, 
          teamBScore, 
          matchResult, 
          announcementNotes || null, 
          weatherConditions || null, 
          specialEvents || null
        ]
      );

      // Get athletes for this event to update their statistics
      // 获取此活动的运动员以更新他们的统计
      const athletes = await client.query(
        `SELECT ep.user_id, ep.team_assignment, a.id as athlete_id
         FROM event_participants ep
         JOIN athletes a ON a.user_id = ep.user_id
         WHERE ep.event_id = $1 AND ep.participation_type = 'athlete'`,
        [eventId]
      );

      // Update athlete statistics for each participant
      // 为每个参与者更新运动员统计
      for (const athlete of athletes.rows) {
        let individualResult = 'draw';
        
        // Determine individual result based on team assignment and match result
        // 根据队伍分配和比赛结果确定个人结果
        if (matchResult === 'team_a_wins') {
          individualResult = athlete.team_assignment === 'A' ? 'win' : 'loss';
        } else if (matchResult === 'team_b_wins') {
          individualResult = athlete.team_assignment === 'B' ? 'win' : 'loss';
        }

        // Insert match result record
        // 插入比赛结果记录
        await client.query(
          `INSERT INTO match_results (
            event_id, 
            athlete_id, 
            team_assignment, 
            match_result
          ) VALUES ($1, $2, $3, $4)
          ON CONFLICT (event_id, athlete_id) DO UPDATE SET
            match_result = EXCLUDED.match_result,
            updated_at = NOW()`,
          [eventId, athlete.athlete_id, athlete.team_assignment, individualResult]
        );

        // Update athlete statistics using the database function
        // 使用数据库函数更新运动员统计
        await client.query(
          `SELECT update_athlete_stats_after_match($1, $2, $3)`,
          [eventId, athlete.athlete_id, individualResult]
        );
      }

      // Calculate rewards for all participants
      // 为所有参与者计算奖励
      await client.query(
        `SELECT calculate_event_rewards($1)`,
        [eventId]
      );

      await client.query('COMMIT');

      // Return success response
      // 返回成功响应
      return NextResponse.json({
        success: true,
        message: 'Match result announced successfully',
        message_zh: '比赛结果宣布成功',
        data: {
          eventId,
          matchResult,
          teamAScore,
          teamBScore,
          announcedAt: new Date().toISOString(),
          athletesUpdated: athletes.rows.length,
          rewardsCalculated: true
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error in manage event API:', error);
    console.error('管理活动API中的错误:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: '内部服务器错误',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get event details for management
// 获取管理用活动详情
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const ambassadorId = request.headers.get('x-user-id') || '550e8400-e29b-41d4-a716-446655440001';

    if (!eventId) {
      return NextResponse.json(
        { 
          error: 'Event ID is required', 
          message: '需要活动ID'
        },
        { status: 400 }
      );
    }

    // Get event details with team information
    // 获取带队伍信息的活动详情
    const eventResult = await query(
      `SELECT 
        e.id,
        e.title,
        e.description,
        e.status,
        e.match_result,
        e.team_a_score,
        e.team_b_score,
        e.result_announced_at,
        e.team_a_info,
        e.team_b_info,
        e.event_date,
        e.venue_name,
        e.venue_address,
        e.total_participants,
        e.total_stakes_amount,
        e.rewards_distributed,
        e.rewards_distributed_at,
        u.wallet_address as ambassador_wallet
       FROM events e
       JOIN users u ON e.ambassador_id = u.id
       WHERE e.id = $1 AND e.ambassador_id = $2`,
      [eventId, ambassadorId]
    );

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Event not found or access denied', 
          message: '未找到活动或访问被拒绝'
        },
        { status: 404 }
      );
    }

    const event = eventResult.rows[0];

    // Get athlete participants for this event
    // 获取此活动的运动员参与者
    const athletesResult = await query(
      `SELECT 
        ep.user_id,
        ep.team_assignment,
        u.wallet_address,
        a.ranking as current_ranking,
        a.matches_won,
        a.matches_lost,
        a.win_rate
       FROM event_participants ep
       JOIN users u ON ep.user_id = u.id
       JOIN athletes a ON a.user_id = u.id
       WHERE ep.event_id = $1 AND ep.participation_type = 'athlete'
       ORDER BY ep.team_assignment, a.current_ranking`,
      [eventId]
    );

    // Get audience participants and their stakes
    // 获取观众参与者及其质押
    const audienceResult = await query(
      `SELECT 
        usr.user_id,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.status as stake_status,
        u.wallet_address
       FROM user_stake_records usr
       JOIN users u ON usr.user_id = u.id
       WHERE usr.event_id = $1
       ORDER BY usr.stake_time DESC`,
      [eventId]
    );

    // Get reward distributions if available
    // 获取奖励分配（如果可用）
    const rewardsResult = await query(
      `SELECT 
        rd.user_id,
        rd.final_reward,
        rd.calculation_formula,
        rd.distribution_status,
        u.wallet_address
       FROM reward_distributions rd
       JOIN users u ON rd.user_id = u.id
       WHERE rd.event_id = $1
       ORDER BY rd.final_reward DESC`,
      [eventId]
    );

    return NextResponse.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          status: event.status,
          matchResult: event.match_result,
          teamAScore: event.team_a_score,
          teamBScore: event.team_b_score,
          resultAnnouncedAt: event.result_announced_at,
          teamAInfo: event.team_a_info,
          teamBInfo: event.team_b_info,
          eventDate: event.event_date,
          venueName: event.venue_name,
          venueAddress: event.venue_address,
          totalParticipants: event.total_participants,
          totalStakesAmount: event.total_stakes_amount,
          rewardsDistributed: event.rewards_distributed,
          rewardsDistributedAt: event.rewards_distributed_at,
          ambassadorWallet: event.ambassador_wallet
        },
        athletes: athletesResult.rows,
        audience: audienceResult.rows,
        rewards: rewardsResult.rows
      }
    });

  } catch (error) {
    console.error('Error getting event details:', error);
    console.error('获取活动详情时出错:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: '内部服务器错误'
      },
      { status: 500 }
    );
  }
} 