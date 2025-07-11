// Admin CHZ Pool Monitoring API Route
// 管理员CHZ池监控API路由
// This endpoint handles CHZ pool monitoring for administrators
// 此端点处理管理员的CHZ池监控
//
// Related files:
// - lib/enhanced-admin-schema.sql: Database schema for CHZ pool monitoring
// - contracts/FanForcePredictionDemo.sol: Smart contract for CHZ operations
// - app/dashboard/admin/page.tsx: Admin dashboard frontend
// - lib/database.ts: Database connection utilities
//
// 相关文件：
// - lib/enhanced-admin-schema.sql: CHZ池监控的数据库架构
// - contracts/FanForcePredictionDemo.sol: CHZ操作的智能合约
// - app/dashboard/admin/page.tsx: 管理员仪表板前端
// - lib/database.ts: 数据库连接工具

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// CHZ Pool Status Interface
// CHZ池状态接口
interface CHZPoolStatus {
  id: string
  contract_address: string
  total_staked_chz: number
  total_fees_collected: number
  available_for_withdrawal: number
  total_rewards_distributed: number
  pool_health_score: number
  last_contract_sync: string
  monitoring_status: string
  alert_threshold: number
  metadata: any
}

// GET - Retrieve CHZ pool status
// GET - 检索CHZ池状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contract_address = searchParams.get('contract_address')
    
    console.log('Fetching CHZ pool status...')
    console.log('获取CHZ池状态...')

    // Get current CHZ pool status from database
    // 从数据库获取当前CHZ池状态
    let poolQuery = `
      SELECT 
        id, contract_address, total_staked_chz, total_fees_collected,
        available_for_withdrawal, total_rewards_distributed,
        pool_health_score, last_contract_sync, monitoring_status,
        alert_threshold, metadata, created_at, updated_at
      FROM chz_pool_monitor
      WHERE monitoring_status = 'active'
    `
    
    const queryParams: any[] = []
    if (contract_address) {
      poolQuery += ` AND contract_address = $1`
      queryParams.push(contract_address)
    }
    
    poolQuery += ` ORDER BY updated_at DESC LIMIT 1`

    const poolResult = await query(poolQuery, queryParams)

    // Get aggregated transaction data for more accurate pool status
    // 获取汇总交易数据以获得更准确的池状态
    const transactionStats = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'stake' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_staked,
        COALESCE(SUM(CASE WHEN transaction_type = 'payout' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_paid_out,
        COALESCE(SUM(CASE WHEN transaction_type = 'fee' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_fees,
        COUNT(CASE WHEN transaction_type = 'stake' AND status = 'completed' THEN 1 END) as stake_count,
        COUNT(CASE WHEN transaction_type = 'payout' AND status = 'completed' THEN 1 END) as payout_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
      FROM transactions
      WHERE currency = 'CHZ'
    `)

    const stats = transactionStats.rows[0]
    
    // Calculate pool health score based on various factors
    // 根据各种因素计算池健康评分
    const totalStaked = parseFloat(stats.total_staked) || 0
    const totalPaidOut = parseFloat(stats.total_paid_out) || 0
    const totalFees = parseFloat(stats.total_fees) || 0
    const pendingCount = parseInt(stats.pending_count) || 0
    
    // Health score calculation (0-100)
    // 健康评分计算（0-100）
    let healthScore = 100
    
    // Reduce score if too many pending transactions
    // 如果待处理交易过多则降低评分
    if (pendingCount > 10) {
      healthScore -= Math.min(pendingCount * 2, 30)
    }
    
    // Reduce score if payout ratio is too high
    // 如果支付比例过高则降低评分
    if (totalStaked > 0) {
      const payoutRatio = totalPaidOut / totalStaked
      if (payoutRatio > 0.8) {
        healthScore -= (payoutRatio - 0.8) * 100
      }
    }
    
    // Ensure health score is within bounds
    // 确保健康评分在范围内
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)))

    // Calculate available for withdrawal (staked - paid out + fees)
    // 计算可提取金额（已质押 - 已支付 + 手续费）
    const availableForWithdrawal = totalStaked - totalPaidOut + totalFees

    // Get recent pool activity
    // 获取最近的池活动
    const recentActivity = await query(`
      SELECT 
        transaction_type, amount, status, created_at,
        (SELECT COUNT(*) FROM transactions t2 WHERE t2.created_at >= t1.created_at AND t2.currency = 'CHZ') as running_count
      FROM transactions t1
      WHERE currency = 'CHZ' AND created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 20
    `)

    // If no pool record exists, create one
    // 如果没有池记录，创建一个
    if (poolResult.rows.length === 0) {
      console.log('Creating new CHZ pool monitor record...')
      console.log('创建新的CHZ池监控记录...')
      
      const newPoolRecord = await query(`
        INSERT INTO chz_pool_monitor (
          contract_address, total_staked_chz, total_fees_collected,
          available_for_withdrawal, total_rewards_distributed,
          pool_health_score, last_contract_sync, monitoring_status,
          alert_threshold, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, 'active', $7, $8)
        RETURNING *
      `, [
        contract_address || '0x0000000000000000000000000000000000000000',
        totalStaked,
        totalFees,
        availableForWithdrawal,
        totalPaidOut,
        healthScore,
        1000.0, // Default alert threshold
        JSON.stringify({
          last_health_check: new Date().toISOString(),
          transaction_counts: {
            stakes: parseInt(stats.stake_count),
            payouts: parseInt(stats.payout_count),
            pending: pendingCount
          }
        })
      ])
      
      const poolStatus = newPoolRecord.rows[0]
      
      return NextResponse.json({
        success: true,
        pool_status: poolStatus,
        transaction_stats: stats,
        recent_activity: recentActivity.rows,
        calculated_metrics: {
          total_staked: totalStaked,
          total_paid_out: totalPaidOut,
          total_fees: totalFees,
          available_for_withdrawal: availableForWithdrawal,
          pool_health_score: healthScore,
          pending_transactions: pendingCount
        },
        message: 'CHZ pool status retrieved successfully (new record created)'
      })
    }

    // Update existing pool record with latest data
    // 用最新数据更新现有池记录
    const updateResult = await query(`
      UPDATE chz_pool_monitor 
      SET 
        total_staked_chz = $1,
        total_fees_collected = $2,
        available_for_withdrawal = $3,
        total_rewards_distributed = $4,
        pool_health_score = $5,
        last_contract_sync = CURRENT_TIMESTAMP,
        metadata = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [
      totalStaked,
      totalFees,
      availableForWithdrawal,
      totalPaidOut,
      healthScore,
      JSON.stringify({
        last_health_check: new Date().toISOString(),
        transaction_counts: {
          stakes: parseInt(stats.stake_count),
          payouts: parseInt(stats.payout_count),
          pending: pendingCount
        }
      }),
      poolResult.rows[0].id
    ])

    return NextResponse.json({
      success: true,
      pool_status: updateResult.rows[0],
      transaction_stats: stats,
      recent_activity: recentActivity.rows,
      calculated_metrics: {
        total_staked: totalStaked,
        total_paid_out: totalPaidOut,
        total_fees: totalFees,
        available_for_withdrawal: availableForWithdrawal,
        pool_health_score: healthScore,
        pending_transactions: pendingCount
      },
      message: 'CHZ pool status retrieved and updated successfully'
    })

  } catch (error) {
    console.error('Error fetching CHZ pool status:', error)
    console.error('获取CHZ池状态错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch CHZ pool status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update CHZ pool monitoring settings
// POST - 更新CHZ池监控设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      contract_address, 
      alert_threshold, 
      monitoring_status, 
      admin_id 
    } = body

    console.log('Updating CHZ pool monitoring settings:', body)
    console.log('更新CHZ池监控设置:', body)

    // Validate required fields
    // 验证必填字段
    if (!contract_address || !admin_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: contract_address and admin_id'
      }, { status: 400 })
    }

    // Validate monitoring status
    // 验证监控状态
    if (monitoring_status && !['active', 'paused', 'maintenance'].includes(monitoring_status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid monitoring_status. Must be: active, paused, or maintenance'
      }, { status: 400 })
    }

    // Update pool monitoring settings
    // 更新池监控设置
    const result = await query(`
      UPDATE chz_pool_monitor 
      SET 
        alert_threshold = COALESCE($1, alert_threshold),
        monitoring_status = COALESCE($2, monitoring_status),
        metadata = metadata || $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE contract_address = $4
      RETURNING *
    `, [
      alert_threshold,
      monitoring_status,
      JSON.stringify({
        last_settings_update: new Date().toISOString(),
        updated_by: admin_id
      }),
      contract_address
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'CHZ pool monitor record not found for the specified contract address'
      }, { status: 404 })
    }

    // Log admin action
    // 记录管理员操作
    await query(`
      SELECT log_admin_action(
        $1::UUID, 
        'chz_pool_settings_update', 
        $2::JSONB, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        true, 
        NULL
      )
    `, [admin_id, JSON.stringify({ contract_address, alert_threshold, monitoring_status })])

    return NextResponse.json({
      success: true,
      pool_monitor: result.rows[0],
      message: 'CHZ pool monitoring settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating CHZ pool monitoring settings:', error)
    console.error('更新CHZ池监控设置错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update CHZ pool monitoring settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Reset CHZ pool monitoring data
// DELETE - 重置CHZ池监控数据
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contract_address = searchParams.get('contract_address')
    const admin_id = searchParams.get('admin_id')

    if (!contract_address || !admin_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: contract_address and admin_id'
      }, { status: 400 })
    }

    console.log('Resetting CHZ pool monitoring data for:', contract_address)
    console.log('重置CHZ池监控数据:', contract_address)

    // Reset pool monitoring data (set to maintenance mode instead of deleting)
    // 重置池监控数据（设置为维护模式而不是删除）
    const result = await query(`
      UPDATE chz_pool_monitor 
      SET 
        monitoring_status = 'maintenance',
        metadata = metadata || $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE contract_address = $2
      RETURNING id, contract_address, monitoring_status
    `, [
      JSON.stringify({
        reset_at: new Date().toISOString(),
        reset_by: admin_id,
        reason: 'Admin reset'
      }),
      contract_address
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'CHZ pool monitor record not found'
      }, { status: 404 })
    }

    // Log admin action
    // 记录管理员操作
    await query(`
      SELECT log_admin_action(
        $1::UUID, 
        'chz_pool_reset', 
        $2::JSONB, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        true, 
        NULL
      )
    `, [admin_id, JSON.stringify({ contract_address })])

    return NextResponse.json({
      success: true,
      message: 'CHZ pool monitoring data reset successfully'
    })

  } catch (error) {
    console.error('Error resetting CHZ pool monitoring data:', error)
    console.error('重置CHZ池监控数据错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to reset CHZ pool monitoring data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 