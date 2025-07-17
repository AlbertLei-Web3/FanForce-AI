// Match Results Management API Route
// 比赛结果管理API路由
// This endpoint handles post-match score input, result announcement, and reward calculation
// 此端点处理赛后比分录入、结果公布和奖励计算

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Match Result Interface
// 比赛结果接口
interface MatchResult {
  id?: string
  event_id: string
  team_a_score: number
  team_b_score: number
  winning_team: 'A' | 'B' | 'tie'
  match_duration?: number
  result_notes?: string
  recorded_by: string
  status: 'draft' | 'confirmed' | 'published'
  rewards_calculated: boolean
  rewards_distributed: boolean
}

// GET - Retrieve match results
// GET - 获取比赛结果
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const event_id = searchParams.get('event_id')
    const ambassador_id = searchParams.get('ambassador_id')
    const status = searchParams.get('status') || 'all'

    console.log('Fetching match results...', { event_id, ambassador_id, status })
    console.log('获取比赛结果...', { event_id, ambassador_id, status })

    // Build query filters
    // 构建查询过滤器
    let eventFilter = ''
    let ambassadorFilter = ''
    let statusFilter = ''
    const queryParams: any[] = []
    let paramIndex = 1

    if (event_id) {
      eventFilter = `WHERE mr.event_id = $${paramIndex}`
      queryParams.push(event_id)
      paramIndex++
    }

    if (ambassador_id && !event_id) {
      ambassadorFilter = `WHERE ea.ambassador_id = $${paramIndex}`
      queryParams.push(ambassador_id)
      paramIndex++
    } else if (ambassador_id && event_id) {
      ambassadorFilter = `AND ea.ambassador_id = $${paramIndex}`
      queryParams.push(ambassador_id)
      paramIndex++
    }

    if (status !== 'all') {
      const statusConnector = eventFilter || ambassadorFilter ? 'AND' : 'WHERE'
      statusFilter = `${statusConnector} mr.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // Get match results with event details
    // 获取比赛结果及赛事详情
    const resultsQuery = `
      SELECT 
        mr.*,
        ea.event_title,
        ea.sport_type,
        ea.event_date,
        ea.event_time,
        ea.venue_name,
        ea.status as event_status,
        
        -- Team information
        td.team_a_name,
        td.team_b_name,
        td.team_a_athletes,
        td.team_b_athletes,
        
        -- CHZ Pool information
        cpi.pool_amount,
        cpi.fee_percentage,
        
        -- Ambassador information
        amb.profile_data as ambassador_profile,
        
        -- Stakes summary
        (SELECT COUNT(*) FROM audience_stakes WHERE event_id = mr.event_id) as total_stakes,
        (SELECT SUM(stake_amount) FROM audience_stakes WHERE event_id = mr.event_id) as total_staked_amount,
        (SELECT COUNT(*) FROM audience_stakes WHERE event_id = mr.event_id AND selected_team = mr.winning_team) as winning_stakes,
        
        -- Rewards calculation
        CASE 
          WHEN mr.rewards_calculated THEN (
            SELECT SUM(calculated_reward) 
            FROM audience_stakes 
            WHERE event_id = mr.event_id
          )
          ELSE 0
        END as total_rewards_distributed
        
      FROM match_results mr
      JOIN event_applications ea ON ea.id = mr.event_id
      LEFT JOIN team_drafts td ON td.id = ANY(
        string_to_array(ea.additional_notes, ',')::uuid[]
      )
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      LEFT JOIN users amb ON amb.id = ea.ambassador_id
      
      ${eventFilter} ${ambassadorFilter} ${statusFilter}
      
      ORDER BY mr.created_at DESC
    `

    const results = await query(resultsQuery, queryParams)

    // Get events that need results (completed but no results yet)
    // 获取需要结果的赛事（已完成但尚无结果）
    const pendingEventsQuery = `
      SELECT DISTINCT
        ea.id as event_id,
        ea.event_title,
        ea.sport_type,
        ea.event_date,
        ea.event_time,
        ea.venue_name,
        ea.status,
        
        td.team_a_name,
        td.team_b_name,
        
        cpi.pool_amount,
        
        (SELECT COUNT(*) FROM audience_stakes WHERE event_id = ea.id) as total_stakes
        
      FROM event_applications ea
      LEFT JOIN team_drafts td ON td.id = ANY(
        string_to_array(ea.additional_notes, ',')::uuid[]
      )
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      LEFT JOIN match_results mr ON mr.event_id = ea.id
      
      WHERE ea.status IN ('live', 'completed')
        AND mr.id IS NULL
        ${ambassador_id ? `AND ea.ambassador_id = $${queryParams.length + 1}` : ''}
        
      ORDER BY ea.event_date DESC
    `

    const pendingEventsParams = ambassador_id ? [...queryParams, ambassador_id] : queryParams
    const pendingEvents = await query(pendingEventsQuery, pendingEventsParams)

    return NextResponse.json({
      success: true,
      match_results: results.rows.map(result => ({
        ...result,
        team_a_athletes: JSON.parse(result.team_a_athletes || '[]'),
        team_b_athletes: JSON.parse(result.team_b_athletes || '[]'),
        ambassador_profile: JSON.parse(result.ambassador_profile || '{}')
      })),
      pending_events: pendingEvents.rows,
      message: 'Match results retrieved successfully',
      message_cn: '比赛结果获取成功'
    })

  } catch (error) {
    console.error('Error fetching match results:', error)
    console.error('获取比赛结果错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch match results',
      error_cn: '获取比赛结果失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create/Submit match result
// POST - 创建/提交比赛结果
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      event_id,
      team_a_score,
      team_b_score,
      match_duration,
      result_notes,
      recorded_by,
      auto_publish = false
    } = body

    console.log('Creating match result...', { event_id, team_a_score, team_b_score, recorded_by })
    console.log('创建比赛结果...', { event_id, team_a_score, team_b_score, recorded_by })

    // Validate required parameters
    // 验证必需参数
    if (!event_id || team_a_score === undefined || team_b_score === undefined || !recorded_by) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        error_cn: '缺少必需参数'
      }, { status: 400 })
    }

    // Validate scores are non-negative integers
    // 验证比分为非负整数
    if (team_a_score < 0 || team_b_score < 0 || !Number.isInteger(team_a_score) || !Number.isInteger(team_b_score)) {
      return NextResponse.json({
        success: false,
        error: 'Scores must be non-negative integers',
        error_cn: '比分必须为非负整数'
      }, { status: 400 })
    }

    // Determine winning team
    // 确定获胜队伍
    let winning_team: 'A' | 'B' | 'tie'
    if (team_a_score > team_b_score) {
      winning_team = 'A'
    } else if (team_b_score > team_a_score) {
      winning_team = 'B'
    } else {
      winning_team = 'tie'
    }

    // Verify event exists and is in appropriate status
    // 验证赛事存在且状态合适
    const eventCheck = await query(`
      SELECT ea.*, cpi.pool_amount, cpi.fee_percentage
      FROM event_applications ea
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      WHERE ea.id = $1 
        AND ea.status IN ('live', 'completed')
    `, [event_id])

    if (eventCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Event not found or not in valid status for result submission',
        error_cn: '赛事未找到或状态不适合提交结果'
      }, { status: 404 })
    }

    const event = eventCheck.rows[0]

    // Check if result already exists
    // 检查结果是否已存在
    const existingResult = await query(`
      SELECT id FROM match_results WHERE event_id = $1
    `, [event_id])

    if (existingResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Match result already exists for this event',
        error_cn: '此赛事的比赛结果已存在'
      }, { status: 400 })
    }

    // Start transaction
    // 开始事务
    await query('BEGIN')

    try {
      // Create match result
      // 创建比赛结果
      const resultData = await query(`
        INSERT INTO match_results (
          event_id,
          team_a_score,
          team_b_score,
          winning_team,
          match_duration,
          result_notes,
          recorded_by,
          status,
          rewards_calculated,
          rewards_distributed
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        event_id,
        team_a_score,
        team_b_score,
        winning_team,
        match_duration,
        result_notes,
        recorded_by,
        auto_publish ? 'published' : 'draft',
        false,
        false
      ])

      const matchResult = resultData.rows[0]

      // If auto-publishing, calculate and distribute rewards
      // 如果自动发布，计算并分发奖励
      if (auto_publish) {
        await calculateAndDistributeRewards(event_id, matchResult.id, event.pool_amount, event.fee_percentage, winning_team)
        
        // Update event status to completed
        // 更新赛事状态为已完成
        await query(`
          UPDATE event_applications 
          SET status = 'completed', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [event_id])
      }

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        match_result: matchResult,
        winning_team,
        score_summary: `${team_a_score} - ${team_b_score}`,
        rewards_processed: auto_publish,
        message: auto_publish ? 'Match result published and rewards distributed!' : 'Match result saved as draft',
        message_cn: auto_publish ? '比赛结果已发布，奖励已分发！' : '比赛结果已保存为草稿'
      })

    } catch (transactionError) {
      await query('ROLLBACK')
      throw transactionError
    }

  } catch (error) {
    console.error('Error creating match result:', error)
    console.error('创建比赛结果错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create match result',
      error_cn: '创建比赛结果失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Publish result and distribute rewards
// PUT - 发布结果并分发奖励
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { result_id, action } = body

    console.log('Publishing match result...', { result_id, action })
    console.log('发布比赛结果...', { result_id, action })

    if (action !== 'publish') {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Only "publish" is supported',
        error_cn: '无效操作。仅支持"publish"'
      }, { status: 400 })
    }

    // Get match result details
    // 获取比赛结果详情
    const resultCheck = await query(`
      SELECT mr.*, ea.id as event_id, cpi.pool_amount, cpi.fee_percentage
      FROM match_results mr
      JOIN event_applications ea ON ea.id = mr.event_id
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      WHERE mr.id = $1 AND mr.status = 'draft'
    `, [result_id])

    if (resultCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Match result not found or already published',
        error_cn: '比赛结果未找到或已发布'
      }, { status: 404 })
    }

    const result = resultCheck.rows[0]

    await query('BEGIN')

    try {
      // Update result status to published
      // 更新结果状态为已发布
      await query(`
        UPDATE match_results 
        SET status = 'published', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [result_id])

      // Calculate and distribute rewards
      // 计算并分发奖励
      await calculateAndDistributeRewards(
        result.event_id, 
        result_id, 
        result.pool_amount, 
        result.fee_percentage, 
        result.winning_team
      )

      // Update event status to completed
      // 更新赛事状态为已完成
      await query(`
        UPDATE event_applications 
        SET status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [result.event_id])

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Match result published and rewards distributed successfully!',
        message_cn: '比赛结果发布成功，奖励分发完成！'
      })

    } catch (transactionError) {
      await query('ROLLBACK')
      throw transactionError
    }

  } catch (error) {
    console.error('Error publishing match result:', error)
    console.error('发布比赛结果错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to publish match result',
      error_cn: '发布比赛结果失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to calculate and distribute rewards
// 辅助函数：计算并分发奖励
async function calculateAndDistributeRewards(
  eventId: string, 
  resultId: string, 
  poolAmount: number, 
  feePercentage: number, 
  winningTeam: 'A' | 'B' | 'tie'
) {
  console.log('Calculating rewards...', { eventId, poolAmount, feePercentage, winningTeam })
  console.log('计算奖励...', { eventId, poolAmount, feePercentage, winningTeam })

  // Get all stakes for this event
  // 获取此赛事的所有质押
  const stakes = await query(`
    SELECT * FROM audience_stakes WHERE event_id = $1 AND status = 'confirmed'
  `, [eventId])

  if (stakes.rows.length === 0) {
    console.log('No stakes found for event', eventId)
    return
  }

  // Calculate platform fee
  // 计算平台手续费
  const platformFee = poolAmount * (feePercentage / 100)
  const availableRewards = poolAmount - platformFee

  // Group stakes by tier
  // 按层级分组质押
  const tierGroups = {
    1: stakes.rows.filter(s => s.tier_level === 1),
    2: stakes.rows.filter(s => s.tier_level === 2),
    3: stakes.rows.filter(s => s.tier_level === 3)
  }

  // Calculate rewards for each tier based on formula
  // 根据公式计算各层级奖励
  // Formula: 个人获得奖励 = (admin奖池 ÷ 总人数 × 三档之一的系数) - (admin奖池 ÷ 总人数 × 三档之一的系数) × 平台手续费
  const totalParticipants = stakes.rows.length

  for (const [tier, tierStakes] of Object.entries(tierGroups)) {
    if (tierStakes.length === 0) continue

    const tierLevel = parseInt(tier)
    const tierMultiplier = tierLevel === 1 ? 1.0 : tierLevel === 2 ? 0.7 : 0.3
    
    for (const stake of tierStakes) {
      // Calculate individual reward
      // 计算个人奖励
      const baseReward = (poolAmount / totalParticipants) * tierMultiplier
      const finalReward = baseReward - (baseReward * (feePercentage / 100))

      // Update stake with calculated reward
      // 更新质押记录的计算奖励
      await query(`
        UPDATE audience_stakes 
        SET 
          calculated_reward = $1,
          status = 'completed',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [finalReward, stake.id])

      // Add reward to user balance
      // 将奖励添加到用户余额
      await query(`
        UPDATE users 
        SET 
          virtual_chz_balance = virtual_chz_balance + $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [finalReward, stake.audience_id])
    }
  }

  // Update match result as rewards calculated and distributed
  // 更新比赛结果为奖励已计算和分发
  await query(`
    UPDATE match_results 
    SET 
      rewards_calculated = true,
      rewards_distributed = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [resultId])

  console.log('Rewards calculation and distribution completed')
  console.log('奖励计算和分发完成')
} 