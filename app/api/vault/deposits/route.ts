// Vault Deposits API
// 金库托管API
// This API handles vault deposit operations and management
// 此API处理金库托管操作和管理

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

// GET: 获取托管记录 / Get vault deposits
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
          vd.*,
          u.name as athlete_name,
          u.email as athlete_email,
          asp.season_year,
          asp.season_quarter,
          asp.matches_played,
          asp.matches_won,
          asp.social_posts_count,
          asp.virtual_chz_earned
        FROM vault_deposits vd
        JOIN users u ON vd.athlete_id = u.id
        LEFT JOIN athlete_season_progress asp ON vd.season_progress_id = asp.id
        WHERE 1=1
      `
      
      const params: any[] = []
      let paramIndex = 1
      
      if (athleteId) {
        query += ` AND vd.athlete_id = $${paramIndex}`
        params.push(athleteId)
        paramIndex++
      }
      
      if (status) {
        query += ` AND vd.status = $${paramIndex}`
        params.push(status)
        paramIndex++
      }
      
      query += ` ORDER BY vd.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
      params.push(limit, offset)
      
      const result = await client.query(query, params)
      
      // Get total count for pagination
      // 获取总数用于分页
      let countQuery = `
        SELECT COUNT(*) as total
        FROM vault_deposits vd
        WHERE 1=1
      `
      
      const countParams: any[] = []
      paramIndex = 1
      
      if (athleteId) {
        countQuery += ` AND vd.athlete_id = $${paramIndex}`
        countParams.push(athleteId)
        paramIndex++
      }
      
      if (status) {
        countQuery += ` AND vd.status = $${paramIndex}`
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
        message: 'Vault deposits retrieved successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error getting vault deposits:', error)
    return NextResponse.json(
      { error: 'Failed to get vault deposits' },
      { status: 500 }
    )
  }
}

// POST: 创建托管记录 / Create vault deposit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      athleteId,
      usdcAmount,
      blockchainHash,
      vaultContractAddress,
      sharesReceived,
      seasonProgressId
    } = body

    if (!athleteId || !usdcAmount) {
      return NextResponse.json(
        { error: 'Athlete ID and USDC amount are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Check if athlete is eligible for vault deposit
      // 检查运动员是否有托管资格
      const eligibilityQuery = `
        SELECT is_eligible_for_vault, vault_deposit_enabled
        FROM athlete_season_progress
        WHERE athlete_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `
      
      const eligibilityResult = await client.query(eligibilityQuery, [athleteId])
      
      if (eligibilityResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Athlete season progress not found' },
          { status: 404 }
        )
      }
      
      const eligibility = eligibilityResult.rows[0]
      
      if (!eligibility.is_eligible_for_vault) {
        return NextResponse.json(
          { error: 'Athlete is not eligible for vault deposit' },
          { status: 400 }
        )
      }
      
      if (!eligibility.vault_deposit_enabled) {
        return NextResponse.json(
          { error: 'Vault deposit is not enabled for this athlete' },
          { status: 400 }
        )
      }
      
      // Create vault deposit record
      // 创建托管记录
      const insertQuery = `
        INSERT INTO vault_deposits (
          athlete_id, season_progress_id, usdc_amount,
          deposit_timestamp, blockchain_hash, status,
          vault_contract_address, shares_received, deposit_metadata
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, 'pending', $5, $6, $7)
        RETURNING *
      `
      
      const depositMetadata = {
        created_at: new Date().toISOString(),
        eligibility_check: {
          is_eligible_for_vault: eligibility.is_eligible_for_vault,
          vault_deposit_enabled: eligibility.vault_deposit_enabled
        }
      }
      
      const result = await client.query(insertQuery, [
        athleteId,
        seasonProgressId,
        usdcAmount,
        blockchainHash,
        vaultContractAddress,
        sharesReceived,
        JSON.stringify(depositMetadata)
      ])
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Vault deposit created successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error creating vault deposit:', error)
    return NextResponse.json(
      { error: 'Failed to create vault deposit' },
      { status: 500 }
    )
  }
}

// PUT: 更新托管状态 / Update vault deposit status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { depositId, status, blockchainHash, sharesReceived } = body

    if (!depositId || !status) {
      return NextResponse.json(
        { error: 'Deposit ID and status are required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      const updateQuery = `
        UPDATE vault_deposits
        SET 
          status = $2,
          blockchain_hash = COALESCE($3, blockchain_hash),
          shares_received = COALESCE($4, shares_received),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `
      
      const result = await client.query(updateQuery, [
        depositId,
        status,
        blockchainHash,
        sharesReceived
      ])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Vault deposit not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Vault deposit status updated successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error updating vault deposit status:', error)
    return NextResponse.json(
      { error: 'Failed to update vault deposit status' },
      { status: 500 }
    )
  }
} 