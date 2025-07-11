// Admin Fee Rules API Route
// 管理员手续费规则API路由
// This endpoint handles fee rules configuration for administrators
// 此端点处理管理员的手续费规则配置
//
// Related files:
// - lib/enhanced-admin-schema.sql: Database schema for fee rules
// - app/dashboard/admin/page.tsx: Admin dashboard frontend
// - lib/database.ts: Database connection utilities
//
// 相关文件：
// - lib/enhanced-admin-schema.sql: 手续费规则的数据库架构
// - app/dashboard/admin/page.tsx: 管理员仪表板前端
// - lib/database.ts: 数据库连接工具

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Fee Rules Interface
// 手续费规则接口
interface FeeRules {
  id: string
  rule_name: string
  staking_fee_percent: number
  withdrawal_fee_percent: number
  distribution_fee_percent: number
  ambassador_share_percent: number
  athlete_share_percent: number
  community_fund_percent: number
  is_active: boolean
  effective_date: string
  created_at: string
  updated_at: string
}

// GET - Retrieve fee rules
// GET - 检索手续费规则
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching fee rules...')
    console.log('获取手续费规则...')

    // Get current active fee rules
    // 获取当前活跃的手续费规则
    const result = await query(`
      SELECT 
        id, rule_name, staking_fee_percent, withdrawal_fee_percent, 
        distribution_fee_percent, ambassador_share_percent, 
        athlete_share_percent, community_fund_percent, 
        is_active, effective_date, created_at, updated_at
      FROM fee_rules 
      WHERE is_active = true
      ORDER BY effective_date DESC
      LIMIT 1
    `)

    // If no active rules found, return default values
    // 如果没有找到活跃规则，返回默认值
    if (result.rows.length === 0) {
      const defaultRules = {
        rule_name: 'Default Fee Structure',
        staking_fee_percent: 5.00,
        withdrawal_fee_percent: 2.00,
        distribution_fee_percent: 3.00,
        ambassador_share_percent: 1.00,
        athlete_share_percent: 1.00,
        community_fund_percent: 1.00,
        is_active: true,
        effective_date: new Date().toISOString()
      }

      return NextResponse.json({
        success: true,
        fee_rules: defaultRules,
        message: 'Default fee rules returned (no active rules found)'
      })
    }

    return NextResponse.json({
      success: true,
      fee_rules: result.rows[0],
      message: 'Fee rules retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching fee rules:', error)
    console.error('获取手续费规则错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fee rules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update fee rules
// POST - 更新手续费规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      rule_name, 
      staking_fee_percent, 
      withdrawal_fee_percent, 
      distribution_fee_percent,
      ambassador_share_percent,
      athlete_share_percent,
      community_fund_percent,
      admin_id 
    } = body

    console.log('Updating fee rules:', body)
    console.log('更新手续费规则:', body)

    // Validate required fields and logical constraints
    // 验证必填字段和逻辑约束
    if (!rule_name || 
        staking_fee_percent < 0 || 
        withdrawal_fee_percent < 0 || 
        distribution_fee_percent < 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid fee rule values. All percentages must be non-negative.'
      }, { status: 400 })
    }

    // Validate distribution percentages sum up correctly
    // 验证分配百分比总和正确
    const totalDistribution = ambassador_share_percent + athlete_share_percent + community_fund_percent
    if (Math.abs(totalDistribution - distribution_fee_percent) > 0.01) {
      return NextResponse.json({
        success: false,
        error: `Distribution shares (${totalDistribution}%) must equal distribution fee (${distribution_fee_percent}%)`
      }, { status: 400 })
    }

    // Deactivate current active rules
    // 停用当前活跃规则
    await query(`
      UPDATE fee_rules 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE is_active = true
    `)

    // Insert new fee rules
    // 插入新的手续费规则
    const result = await query(`
      INSERT INTO fee_rules (
        rule_name, staking_fee_percent, withdrawal_fee_percent, 
        distribution_fee_percent, ambassador_share_percent, 
        athlete_share_percent, community_fund_percent, 
        is_active, effective_date, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP, $8)
      RETURNING id, rule_name, staking_fee_percent, withdrawal_fee_percent, 
                distribution_fee_percent, ambassador_share_percent, 
                athlete_share_percent, community_fund_percent, 
                is_active, effective_date
    `, [
      rule_name, staking_fee_percent, withdrawal_fee_percent,
      distribution_fee_percent, ambassador_share_percent,
      athlete_share_percent, community_fund_percent, admin_id
    ])

    // Log admin action
    // 记录管理员操作
    if (admin_id) {
      await query(`
        SELECT log_admin_action(
          $1::UUID, 
          'fee_rules_update', 
          $2::JSONB, 
          NULL, 
          NULL, 
          NULL, 
          NULL, 
          true, 
          NULL
        )
      `, [admin_id, JSON.stringify(body)])
    }

    return NextResponse.json({
      success: true,
      fee_rules: result.rows[0],
      message: 'Fee rules updated successfully'
    })

  } catch (error) {
    console.error('Error updating fee rules:', error)
    console.error('更新手续费规则错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update fee rules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Retrieve fee rules history
// GET - 检索手续费规则历史
export async function GET_HISTORY(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('Fetching fee rules history...')
    console.log('获取手续费规则历史...')

    const result = await query(`
      SELECT 
        id, rule_name, staking_fee_percent, withdrawal_fee_percent, 
        distribution_fee_percent, ambassador_share_percent, 
        athlete_share_percent, community_fund_percent, 
        is_active, effective_date, created_at, updated_at
      FROM fee_rules 
      ORDER BY effective_date DESC
      LIMIT $1
    `, [limit])

    return NextResponse.json({
      success: true,
      fee_rules_history: result.rows,
      message: 'Fee rules history retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching fee rules history:', error)
    console.error('获取手续费规则历史错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fee rules history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 