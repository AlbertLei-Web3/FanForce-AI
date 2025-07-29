// Profit Distributions API
// 收益分配API
// This API handles profit distribution calculations and management
// 此API处理收益分配计算和管理

import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

// Database connection configuration
// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
})

// GET: 获取收益分配记录 / Get profit distributions
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const athleteId = searchParams.get('athleteId')
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const client = await pool.connect()
    
    try {
      let query = `
        SELECT 
          pd.*,
          u.name as athlete_name,
          u.email as athlete_email,
          vd.usdc_amount as original_deposit_amount,
          vd.deposit_timestamp
        FROM profit_distributions pd
        JOIN users u ON pd.athlete_id = u.id
        LEFT JOIN vault_deposits vd ON pd.vault_deposit_id = vd.id
        WHERE 1=1
      `
      
      const params: any[] = []
      let paramIndex = 1
      
      if (athleteId) {
        query += ` AND pd.athlete_id = $${paramIndex}`
        params.push(athleteId)
        paramIndex++
      }
      
      if (status) {
        query += ` AND pd.status = $${paramIndex}`
        params.push(status)
        paramIndex++
      }
      
      query += ` ORDER BY pd.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, offset)
      
      const result = await client.query(query, params)
      
      // Get total count for pagination
      // 获取总数用于分页
      let countQuery = `
        SELECT COUNT(*) as total
        FROM profit_distributions pd
        WHERE 1=1
      `
      
      const countParams: any[] = []
      paramIndex = 1
      
      if (athleteId) {
        countQuery += ` AND pd.athlete_id = $${paramIndex}`
        countParams.push(athleteId)
        paramIndex++
      }
      
      if (status) {
        countQuery += ` AND pd.status = $${paramIndex}`
        countParams.push(status)
        paramIndex++
      }
      
      const countResult = await client.query(countQuery, countParams)
      
      return NextResponse.json({
        success: true,
        data: result.rows,
        pagination: {
          total: parseInt(countResult.rows[0].total),
          limit,
          offset,
          hasMore: offset + limit < parseInt(countResult.rows[0].total)
        },
        message: 'Profit distributions retrieved successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error getting profit distributions:', error)
    return NextResponse.json(
      { error: 'Failed to get profit distributions' },
      { status: 500 }
    )
  }
}

// POST: 创建收益分配 / Create profit distribution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      athleteId,
      vaultDepositId,
      totalProfitUsdc,
      distributionPeriodStart,
      distributionPeriodEnd,
      tradingPairs,
      totalTrades,
      averageRoi,
      blockchainHash
    } = body

    if (!athleteId || !totalProfitUsdc) {
      return NextResponse.json(
        { error: 'Athlete ID and total profit are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Calculate athlete and foundation shares (80/20 split)
      // 计算运动员和基金会份额（80/20分配）
      const athleteShareUsdc = parseFloat(totalProfitUsdc) * 0.8
      const foundationShareUsdc = parseFloat(totalProfitUsdc) * 0.2
      
      // Create profit distribution record
      // 创建收益分配记录
      const insertQuery = `
        INSERT INTO profit_distributions (
          athlete_id, vault_deposit_id, total_profit_usdc,
          athlete_share_usdc, foundation_share_usdc,
          distribution_period_start, distribution_period_end,
          distribution_timestamp, trading_pairs, total_trades,
          average_roi, status, blockchain_hash, distribution_metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, $9, $10, 'calculated', $11, $12)
        RETURNING *
      `
      
      const distributionMetadata = {
        created_at: new Date().toISOString(),
        calculation_method: '80/20_split',
        athlete_percentage: 80,
        foundation_percentage: 20,
        trading_pairs: tradingPairs || [],
        total_trades: totalTrades || 0,
        average_roi: averageRoi || 0
      }
      
      const result = await client.query(insertQuery, [
        athleteId,
        vaultDepositId,
        totalProfitUsdc,
        athleteShareUsdc,
        foundationShareUsdc,
        distributionPeriodStart || new Date().toISOString(),
        distributionPeriodEnd || new Date().toISOString(),
        tradingPairs ? JSON.stringify(tradingPairs) : '[]',
        totalTrades || 0,
        averageRoi || 0,
        blockchainHash,
        JSON.stringify(distributionMetadata)
      ])
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Profit distribution created successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error creating profit distribution:', error)
    return NextResponse.json(
      { error: 'Failed to create profit distribution' },
      { status: 500 }
    )
  }
}

// PUT: 更新收益分配状态 / Update profit distribution status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { distributionId, status, blockchainHash } = body

    if (!distributionId || !status) {
      return NextResponse.json(
        { error: 'Distribution ID and status are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      const updateQuery = `
        UPDATE profit_distributions
        SET 
          status = $2,
          blockchain_hash = COALESCE($3, blockchain_hash),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `
      
      const result = await client.query(updateQuery, [
        distributionId,
        status,
        blockchainHash
      ])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Profit distribution not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Profit distribution status updated successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error updating profit distribution status:', error)
    return NextResponse.json(
      { error: 'Failed to update profit distribution status' },
      { status: 500 }
    )
  }
}

// POST: 批量计算收益分配 / Batch calculate profit distributions
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { periodStart, periodEnd, tradingPairs, totalTrades, averageRoi } = body

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Period start and end dates are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Get all eligible vault deposits for the period
      // 获取期间内所有符合条件的托管记录
      const depositsQuery = `
        SELECT 
          vd.id as vault_deposit_id,
          vd.athlete_id,
          vd.usdc_amount,
          vd.shares_received
        FROM vault_deposits vd
        WHERE vd.status = 'completed'
          AND vd.deposit_timestamp BETWEEN $1 AND $2
      `
      
      const depositsResult = await client.query(depositsQuery, [periodStart, periodEnd])
      
      if (depositsResult.rows.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No eligible deposits found for the specified period',
          distributionsCreated: 0
        })
      }
      
      // Calculate profit for each deposit and create distributions
      // 为每个托管记录计算收益并创建分配
      const distributionsCreated = []
      
      for (const deposit of depositsResult.rows) {
        // Calculate profit based on shares and average ROI
        // 基于份额和平均ROI计算收益
        const totalProfitUsdc = parseFloat(deposit.usdc_amount) * (averageRoi / 100)
        
        if (totalProfitUsdc > 0) {
          const insertQuery = `
            INSERT INTO profit_distributions (
              athlete_id, vault_deposit_id, total_profit_usdc,
              athlete_share_usdc, foundation_share_usdc,
              distribution_period_start, distribution_period_end,
              distribution_timestamp, trading_pairs, total_trades,
              average_roi, status, distribution_metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, $9, $10, 'calculated', $11)
            RETURNING id
          `
          
          const athleteShareUsdc = totalProfitUsdc * 0.8
          const foundationShareUsdc = totalProfitUsdc * 0.2
          
          const distributionMetadata = {
            created_at: new Date().toISOString(),
            calculation_method: 'batch_calculation',
            deposit_amount: deposit.usdc_amount,
            shares_received: deposit.shares_received,
            trading_pairs: tradingPairs || [],
            total_trades: totalTrades || 0,
            average_roi: averageRoi || 0
          }
          
          const distributionResult = await client.query(insertQuery, [
            deposit.athlete_id,
            deposit.vault_deposit_id,
            totalProfitUsdc,
            athleteShareUsdc,
            foundationShareUsdc,
            periodStart,
            periodEnd,
            tradingPairs ? JSON.stringify(tradingPairs) : '[]',
            totalTrades || 0,
            averageRoi || 0,
            JSON.stringify(distributionMetadata)
          ])
          
          distributionsCreated.push(distributionResult.rows[0].id)
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Batch profit distribution calculation completed',
        distributionsCreated: distributionsCreated.length,
        distributionIds: distributionsCreated
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error in batch profit distribution calculation:', error)
    return NextResponse.json(
      { error: 'Failed to calculate batch profit distributions' },
      { status: 500 }
    )
  }
} 