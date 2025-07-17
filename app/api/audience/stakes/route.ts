// Audience Stakes API Route
// 观众质押API路由
// This endpoint handles audience staking with 3-tier support system
// 此端点处理观众的3层支持系统质押

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Stake Interface
// 质押接口
interface AudienceStake {
  id?: string
  audience_id: string
  event_id: string
  tier_level: 1 | 2 | 3 // 1: Full Experience, 2: Stake + Match, 3: Stake Only
  stake_amount: number
  selected_team: 'A' | 'B'
  team_name: string
  multiplier: number
  expected_reward: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  qr_checkin_required: boolean
  qr_checkin_completed: boolean
  party_access: boolean
  party_application_status?: 'pending' | 'approved' | 'rejected'
}

// GET - Retrieve audience stakes
// GET - 获取观众质押记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const audience_id = searchParams.get('audience_id')
    const event_id = searchParams.get('event_id')
    const status = searchParams.get('status') || 'all'

    console.log('Fetching audience stakes...', { audience_id, event_id, status })
    console.log('获取观众质押记录...', { audience_id, event_id, status })

    // Validate required parameters
    // 验证必需参数
    if (!audience_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: audience_id',
        error_cn: '缺少必需参数：audience_id'
      }, { status: 400 })
    }

    // Verify audience user exists
    // 验证观众用户存在
    const audienceCheck = await query(`
      SELECT u.id, u.role, u.profile_data, u.virtual_chz_balance
      FROM users u
      WHERE u.id = $1 AND u.role = 'audience'
    `, [audience_id])

    if (audienceCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Audience user not found or invalid role',
        error_cn: '观众用户未找到或角色无效'
      }, { status: 404 })
    }

    // Build query filters
    // 构建查询过滤器
    let eventFilter = ''
    let statusFilter = ''
    const queryParams = [audience_id]
    let paramIndex = 2

    if (event_id) {
      eventFilter = `AND as.event_id = $${paramIndex}`
      queryParams.push(event_id)
      paramIndex++
    }

    if (status !== 'all') {
      statusFilter = `AND as.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // Get audience stakes with event details
    // 获取观众质押记录及赛事详情
    const stakesQuery = `
      SELECT 
        as.*,
        ea.event_title,
        ea.sport_type,
        ea.event_date,
        ea.event_time,
        ea.venue_name,
        ea.status as event_status,
        
        -- Team information from drafts
        td.team_a_name,
        td.team_b_name,
        td.draft_name,
        
        -- CHZ Pool Information
        cpi.pool_amount,
        cpi.fee_percentage,
        
        -- Calculate potential rewards
        CASE 
          WHEN as.tier_level = 1 THEN (cpi.pool_amount * 1.0) / 
            (SELECT COUNT(*) FROM audience_stakes WHERE event_id = as.event_id AND tier_level = 1)
          WHEN as.tier_level = 2 THEN (cpi.pool_amount * 0.7) / 
            (SELECT COUNT(*) FROM audience_stakes WHERE event_id = as.event_id AND tier_level = 2)
          WHEN as.tier_level = 3 THEN (cpi.pool_amount * 0.3) / 
            (SELECT COUNT(*) FROM audience_stakes WHERE event_id = as.event_id AND tier_level = 3)
          ELSE 0
        END as calculated_reward
        
      FROM audience_stakes as
      JOIN event_applications ea ON ea.id = as.event_id
      LEFT JOIN team_drafts td ON td.id = ANY(
        string_to_array(ea.additional_notes, ',')::uuid[]
      )
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      
      WHERE as.audience_id = $1 
      ${eventFilter} 
      ${statusFilter}
      
      ORDER BY as.created_at DESC
    `

    const stakes = await query(stakesQuery, queryParams)

    // Get available events for staking
    // 获取可质押的赛事
    const availableEventsQuery = `
      SELECT DISTINCT
        ea.id as event_id,
        ea.event_title,
        ea.sport_type,
        ea.event_date,
        ea.event_time,
        ea.venue_name,
        ea.venue_capacity,
        ea.status as event_status,
        
        td.team_a_name,
        td.team_b_name,
        td.draft_name,
        
        cpi.pool_amount,
        cpi.fee_percentage,
        cpi.injection_status,
        
        -- Count current stakes by tier
        (SELECT COUNT(*) FROM audience_stakes WHERE event_id = ea.id AND tier_level = 1) as tier1_count,
        (SELECT COUNT(*) FROM audience_stakes WHERE event_id = ea.id AND tier_level = 2) as tier2_count,
        (SELECT COUNT(*) FROM audience_stakes WHERE event_id = ea.id AND tier_level = 3) as tier3_count,
        
        -- Check if user already staked
        EXISTS(SELECT 1 FROM audience_stakes WHERE event_id = ea.id AND audience_id = $1) as user_already_staked
        
      FROM event_applications ea
      LEFT JOIN team_drafts td ON td.id = ANY(
        string_to_array(ea.additional_notes, ',')::uuid[]
      )
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      
      WHERE ea.status IN ('pre_match', 'approved')
        AND ea.event_date >= CURRENT_DATE
        AND cpi.injection_status = 'completed'
        
      ORDER BY ea.event_date ASC
    `

    const availableEvents = await query(availableEventsQuery, [audience_id])

    return NextResponse.json({
      success: true,
      user_balance: parseFloat(audienceCheck.rows[0].virtual_chz_balance || '0'),
      stakes: stakes.rows,
      available_events: availableEvents.rows,
      tier_multipliers: {
        1: { name: 'Full Experience', multiplier: 1.0, bonus: 'Party Access' },
        2: { name: 'Stake + Match', multiplier: 0.7, bonus: 'QR Check-in' },
        3: { name: 'Stake Only', multiplier: 0.3, bonus: 'Remote Support' }
      },
      message: 'Audience stakes retrieved successfully',
      message_cn: '观众质押记录获取成功'
    })

  } catch (error) {
    console.error('Error fetching audience stakes:', error)
    console.error('获取观众质押记录错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch audience stakes',
      error_cn: '获取观众质押记录失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create new audience stake
// POST - 创建新的观众质押
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      audience_id,
      event_id,
      tier_level,
      stake_amount,
      selected_team,
      team_name
    } = body

    console.log('Creating audience stake...', { audience_id, event_id, tier_level, stake_amount, selected_team })
    console.log('创建观众质押...', { audience_id, event_id, tier_level, stake_amount, selected_team })

    // Validate required parameters
    // 验证必需参数
    if (!audience_id || !event_id || !tier_level || !stake_amount || !selected_team) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        error_cn: '缺少必需参数'
      }, { status: 400 })
    }

    // Validate tier level
    // 验证层级
    if (![1, 2, 3].includes(tier_level)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid tier level. Must be 1, 2, or 3',
        error_cn: '无效的层级。必须是1、2或3'
      }, { status: 400 })
    }

    // Validate team selection
    // 验证队伍选择
    if (!['A', 'B'].includes(selected_team)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid team selection. Must be A or B',
        error_cn: '无效的队伍选择。必须是A或B'
      }, { status: 400 })
    }

    // Check user balance
    // 检查用户余额
    const userCheck = await query(`
      SELECT virtual_chz_balance FROM users WHERE id = $1 AND role = 'audience'
    `, [audience_id])

    if (userCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Audience user not found',
        error_cn: '观众用户未找到'
      }, { status: 404 })
    }

    const currentBalance = parseFloat(userCheck.rows[0].virtual_chz_balance || '0')
    if (currentBalance < stake_amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient CHZ balance',
        error_cn: 'CHZ余额不足'
      }, { status: 400 })
    }

    // Check if user already staked on this event
    // 检查用户是否已在此赛事质押
    const existingStake = await query(`
      SELECT id FROM audience_stakes WHERE audience_id = $1 AND event_id = $2
    `, [audience_id, event_id])

    if (existingStake.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User has already staked on this event',
        error_cn: '用户已在此赛事质押'
      }, { status: 400 })
    }

    // Verify event exists and is stakeable
    // 验证赛事存在且可质押
    const eventCheck = await query(`
      SELECT ea.*, cpi.pool_amount, cpi.fee_percentage
      FROM event_applications ea
      LEFT JOIN chz_pool_injections cpi ON cpi.event_id = ea.id
      WHERE ea.id = $1 
        AND ea.status IN ('approved', 'pre_match')
        AND ea.event_date >= CURRENT_DATE
        AND cpi.injection_status = 'completed'
    `, [event_id])

    if (eventCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Event not found or not available for staking',
        error_cn: '赛事未找到或不可质押'
      }, { status: 404 })
    }

    const event = eventCheck.rows[0]

    // Calculate multiplier and requirements based on tier
    // 根据层级计算倍数和要求
    const tierConfig = {
      1: { multiplier: 1.0, qr_required: true, party_access: true },
      2: { multiplier: 0.7, qr_required: true, party_access: false },
      3: { multiplier: 0.3, qr_required: false, party_access: false }
    }

    const config = tierConfig[tier_level as keyof typeof tierConfig]
    const expectedReward = (event.pool_amount * config.multiplier) / 10 // Estimate based on average participation

    // Start transaction
    // 开始事务
    await query('BEGIN')

    try {
      // Create audience stake
      // 创建观众质押
      const stakeResult = await query(`
        INSERT INTO audience_stakes (
          audience_id, 
          event_id, 
          tier_level, 
          stake_amount, 
          selected_team, 
          team_name,
          multiplier,
          expected_reward,
          status,
          qr_checkin_required,
          qr_checkin_completed,
          party_access,
          party_application_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        audience_id, 
        event_id, 
        tier_level, 
        stake_amount, 
        selected_team, 
        team_name || `Team ${selected_team}`,
        config.multiplier,
        expectedReward,
        'confirmed',
        config.qr_required,
        false,
        config.party_access,
        config.party_access ? 'pending' : null
      ])

      // Deduct stake amount from user balance
      // 从用户余额中扣除质押金额
      await query(`
        UPDATE users 
        SET virtual_chz_balance = virtual_chz_balance - $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [stake_amount, audience_id])

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        stake: stakeResult.rows[0],
        new_balance: currentBalance - stake_amount,
        tier_info: {
          level: tier_level,
          multiplier: config.multiplier,
          qr_required: config.qr_required,
          party_access: config.party_access
        },
        message: 'Stake created successfully!',
        message_cn: '质押创建成功！'
      })

    } catch (transactionError) {
      await query('ROLLBACK')
      throw transactionError
    }

  } catch (error) {
    console.error('Error creating audience stake:', error)
    console.error('创建观众质押错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create stake',
      error_cn: '创建质押失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 