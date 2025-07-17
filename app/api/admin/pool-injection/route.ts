// Admin Pool Injection API Route
// 管理员奖池注入API路由
// This endpoint handles CHZ pool injection for approved events
// 此端点处理已批准赛事的CHZ奖池注入

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Pool Injection Interface
// 奖池注入接口
interface PoolInjection {
  application_id: string
  admin_id: string
  injected_amount: number
  currency: string
  staking_fee_percent: number
  withdrawal_fee_percent: number
  distribution_fee_percent: number
  tier_1_multiplier: number // Stake only: 30%
  tier_2_multiplier: number // Stake + Match: 70%
  tier_3_multiplier: number // Full Experience: 100%
  injection_notes?: string
  admin_remarks?: string
}

// GET - Retrieve pool injection status for an event
// GET - 获取赛事的奖池注入状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const application_id = searchParams.get('application_id')
    const admin_id = searchParams.get('admin_id')

    console.log('Fetching pool injection status...', { application_id, admin_id })
    console.log('获取奖池注入状态...', { application_id, admin_id })

    // Validate required parameters
    // 验证必需参数
    if (!application_id || !admin_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: application_id and admin_id',
        error_cn: '缺少必需参数：application_id和admin_id'
      }, { status: 400 })
    }

    // Verify admin role
    // 验证管理员角色
    const adminCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'admin'
    `, [admin_id])

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found or invalid role',
        error_cn: '管理员未找到或角色无效'
      }, { status: 404 })
    }

    // Get event application details
    // 获取赛事申请详情
    const applicationQuery = await query(`
      SELECT 
        ea.*,
        u.username as ambassador_username,
        u.profile_data as ambassador_profile
      FROM event_applications ea
      JOIN users u ON ea.ambassador_id = u.id
      WHERE ea.id = $1
    `, [application_id])

    if (applicationQuery.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Event application not found',
        error_cn: '赛事申请未找到'
      }, { status: 404 })
    }

    const application = applicationQuery.rows[0]

    // Check if application is approved
    // 检查申请是否已批准
    if (application.status !== 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Event application must be approved before pool injection',
        error_cn: '赛事申请必须先批准才能注入奖池',
        current_status: application.status
      }, { status: 400 })
    }

    // Get existing pool injection if any
    // 获取现有的奖池注入（如果有）
    const poolInjectionQuery = await query(`
      SELECT *
      FROM chz_pool_injections
      WHERE application_id = $1
      ORDER BY injected_at DESC
      LIMIT 1
    `, [application_id])

    const existingInjection = poolInjectionQuery.rows[0] || null

    // Get current fee rules
    // 获取当前手续费规则
    const feeRulesQuery = await query(`
      SELECT *
      FROM fee_rules
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `)

    const defaultFeeRules = feeRulesQuery.rows[0] || {
      staking_fee_percent: 5.00,
      withdrawal_fee_percent: 2.00,
      distribution_fee_percent: 3.00
    }

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        team_a_info: JSON.parse(application.team_a_info || '{}'),
        team_b_info: JSON.parse(application.team_b_info || '{}'),
        ambassador_profile: JSON.parse(application.ambassador_profile || '{}')
      },
      existing_injection: existingInjection,
      default_fee_rules: defaultFeeRules,
      can_inject: !existingInjection || existingInjection.injection_status === 'failed',
      message: 'Pool injection status retrieved successfully',
      message_cn: '奖池注入状态获取成功'
    })

  } catch (error) {
    console.error('Error fetching pool injection status:', error)
    console.error('获取奖池注入状态错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch pool injection status',
      error_cn: '获取奖池注入状态失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Inject CHZ pool into event
// POST - 向赛事注入CHZ奖池
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      application_id,
      admin_id,
      injected_amount,
      currency = 'CHZ',
      staking_fee_percent = 5.0,
      withdrawal_fee_percent = 2.0,
      distribution_fee_percent = 3.0,
      tier_1_multiplier = 0.30,
      tier_2_multiplier = 0.70,
      tier_3_multiplier = 1.00,
      injection_notes = '',
      admin_remarks = ''
    } = body

    console.log('Processing pool injection:', { application_id, admin_id, injected_amount })
    console.log('处理奖池注入:', { application_id, admin_id, injected_amount })

    // Validate required fields
    // 验证必填字段
    const requiredFields = {
      application_id: 'Application ID',
      admin_id: 'Admin ID',
      injected_amount: 'Injection amount'
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${label}`,
          error_cn: `缺少必填字段: ${label}`,
          field: field
        }, { status: 400 })
      }
    }

    // Validate injection amount
    // 验证注入金额
    if (typeof injected_amount !== 'number' || injected_amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Injection amount must be a positive number',
        error_cn: '注入金额必须是正数'
      }, { status: 400 })
    }

    // Verify admin role
    // 验证管理员角色
    const adminCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'admin'
    `, [admin_id])

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found or invalid role',
        error_cn: '管理员未找到或角色无效'
      }, { status: 404 })
    }

    // Get and validate event application
    // 获取并验证赛事申请
    const applicationCheck = await query(`
      SELECT id, status, ambassador_id, event_title, event_start_time
      FROM event_applications
      WHERE id = $1
    `, [application_id])

    if (applicationCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Event application not found',
        error_cn: '赛事申请未找到'
      }, { status: 404 })
    }

    const application = applicationCheck.rows[0]

    // Check if application is approved
    // 检查申请是否已批准
    if (application.status !== 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Event application must be approved before pool injection',
        error_cn: '赛事申请必须先批准才能注入奖池',
        current_status: application.status
      }, { status: 400 })
    }

    // Check if pool already injected
    // 检查奖池是否已注入
    const existingInjectionCheck = await query(`
      SELECT id, injection_status
      FROM chz_pool_injections
      WHERE application_id = $1 AND injection_status IN ('pending', 'completed')
    `, [application_id])

    if (existingInjectionCheck.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Pool already injected for this event',
        error_cn: '此赛事的奖池已注入',
        existing_injection: existingInjectionCheck.rows[0]
      }, { status: 400 })
    }

    // Validate fee percentages
    // 验证手续费百分比
    const totalFeePercent = staking_fee_percent + withdrawal_fee_percent + distribution_fee_percent
    if (totalFeePercent > 20) {
      return NextResponse.json({
        success: false,
        error: 'Total fee percentages cannot exceed 20%',
        error_cn: '总手续费百分比不能超过20%',
        total_percent: totalFeePercent
      }, { status: 400 })
    }

    // Begin transaction
    // 开始事务
    await query('BEGIN')

    try {
      // Create pool injection record
      // 创建奖池注入记录
      const insertQuery = `
        INSERT INTO chz_pool_injections (
          application_id, admin_id, injected_amount, currency,
          staking_fee_percent, withdrawal_fee_percent, distribution_fee_percent,
          tier_1_multiplier, tier_2_multiplier, tier_3_multiplier,
          injection_notes, admin_remarks, injection_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'completed'
        ) RETURNING *
      `

      const newInjection = await query(insertQuery, [
        application_id, admin_id, injected_amount, currency,
        staking_fee_percent, withdrawal_fee_percent, distribution_fee_percent,
        tier_1_multiplier, tier_2_multiplier, tier_3_multiplier,
        injection_notes, admin_remarks
      ])

      const injection = newInjection.rows[0]

      // Update event application status to 'pre_match'
      // 更新赛事申请状态为'pre_match'
      await query(`
        UPDATE event_applications 
        SET status = 'pre_match', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [application_id])

      // Log admin action
      // 记录管理员操作
      await query(`
        INSERT INTO admin_activity_log (admin_id, action_type, action_details, affected_user_id, success)
        VALUES ($1, 'pool_injection', $2, $3, true)
      `, [
        admin_id,
        JSON.stringify({
          injection_id: injection.id,
          application_id: application_id,
          injected_amount: injected_amount,
          currency: currency,
          event_title: application.event_title,
          fee_rules: {
            staking_fee_percent,
            withdrawal_fee_percent,
            distribution_fee_percent
          },
          tier_multipliers: {
            tier_1_multiplier,
            tier_2_multiplier,
            tier_3_multiplier
          }
        }),
        application.ambassador_id
      ])

      // Update CHZ pool monitor
      // 更新CHZ池监控
      await query(`
        UPDATE chz_pool_monitor 
        SET 
          total_staked_chz = total_staked_chz + $1,
          last_contract_sync = CURRENT_TIMESTAMP,
          metadata = metadata || $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE monitoring_status = 'active'
      `, [
        injected_amount,
        JSON.stringify({
          last_injection: new Date().toISOString(),
          injection_id: injection.id,
          event_id: application_id
        })
      ])

      await query('COMMIT')

      return NextResponse.json({
        success: true,
        injection: injection,
        application_updated: true,
        new_status: 'pre_match',
        message: 'CHZ pool injected successfully and event moved to pre-match state',
        message_cn: 'CHZ奖池注入成功，赛事进入赛前状态',
        next_steps: [
          'Event is now in pre-match state',
          'Athletes will be notified of selection',
          'Audience can now stake on the event'
        ],
        next_steps_cn: [
          '赛事现在处于赛前状态',
          '运动员将收到选择通知',
          '观众现在可以对赛事进行质押'
        ]
      })

    } catch (error) {
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error injecting pool:', error)
    console.error('注入奖池错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to inject CHZ pool',
      error_cn: '注入CHZ奖池失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update pool injection settings
// PUT - 更新奖池注入设置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      injection_id,
      admin_id,
      injection_notes,
      admin_remarks,
      status
    } = body

    console.log('Updating pool injection:', { injection_id, admin_id, status })
    console.log('更新奖池注入:', { injection_id, admin_id, status })

    // Validate required fields
    // 验证必填字段
    if (!injection_id || !admin_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: injection_id and admin_id',
        error_cn: '缺少必填字段：injection_id和admin_id'
      }, { status: 400 })
    }

    // Verify admin role
    // 验证管理员角色
    const adminCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'admin'
    `, [admin_id])

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found or invalid role',
        error_cn: '管理员未找到或角色无效'
      }, { status: 404 })
    }

    // Check if injection exists
    // 检查注入是否存在
    const injectionCheck = await query(`
      SELECT id, injection_status, application_id
      FROM chz_pool_injections
      WHERE id = $1
    `, [injection_id])

    if (injectionCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Pool injection not found',
        error_cn: '奖池注入未找到'
      }, { status: 404 })
    }

    // Build update query
    // 构建更新查询
    const updateFields = []
    const updateValues = []
    let paramCounter = 1

    if (injection_notes !== undefined) {
      updateFields.push(`injection_notes = $${paramCounter}`)
      updateValues.push(injection_notes)
      paramCounter++
    }

    if (admin_remarks !== undefined) {
      updateFields.push(`admin_remarks = $${paramCounter}`)
      updateValues.push(admin_remarks)
      paramCounter++
    }

    if (status && ['pending', 'completed', 'failed', 'cancelled'].includes(status)) {
      updateFields.push(`injection_status = $${paramCounter}`)
      updateValues.push(status)
      paramCounter++
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update',
        error_cn: '没有要更新的字段'
      }, { status: 400 })
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)
    updateValues.push(injection_id)

    const updateQuery = `
      UPDATE chz_pool_injections 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `

    const updatedInjection = await query(updateQuery, updateValues)

    return NextResponse.json({
      success: true,
      injection: updatedInjection.rows[0],
      message: 'Pool injection updated successfully',
      message_cn: '奖池注入更新成功'
    })

  } catch (error) {
    console.error('Error updating pool injection:', error)
    console.error('更新奖池注入错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update pool injection',
      error_cn: '更新奖池注入失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 