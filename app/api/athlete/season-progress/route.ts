// Athlete Season Progress API
// 运动员赛季进度API
// This API handles athlete season progress tracking and vault eligibility
// 此API处理运动员赛季进度跟踪和托管资格

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

// GET: 获取运动员赛季进度 / Get athlete season progress
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const athleteId = searchParams.get('athleteId')
  const seasonYear = searchParams.get('seasonYear') || new Date().getFullYear().toString()
  const seasonQuarter = searchParams.get('seasonQuarter') || Math.ceil((new Date().getMonth() + 1) / 3).toString()

  if (!athleteId) {
    return NextResponse.json(
      { error: 'Athlete ID is required' },
      { status: 400 }
    )
  }

  try {
    const client = await pool.connect()
    
    try {
      // Get athlete season progress
      // 获取运动员赛季进度
      const query = `
        SELECT 
          asp.*,
          u.name as athlete_name,
          u.email as athlete_email
        FROM athlete_season_progress asp
        JOIN users u ON asp.athlete_id = u.id
        WHERE asp.athlete_id = $1 
          AND asp.season_year = $2 
          AND asp.season_quarter = $3
      `
      
      const result = await client.query(query, [athleteId, seasonYear, seasonQuarter])
      
      if (result.rows.length === 0) {
        // Create new season progress record if not exists
        // 如果不存在则创建新的赛季进度记录
        const insertQuery = `
          INSERT INTO athlete_season_progress (
            athlete_id, season_year, season_quarter,
            matches_played, matches_won, social_posts_count,
            virtual_chz_earned, required_matches, required_wins,
            required_posts, required_virtual_chz, is_eligible_for_vault,
            vault_deposit_enabled, season_completed
          ) VALUES ($1, $2, $3, 0, 0, 0, 0.0, 5, 3, 10, 100.0, false, false, false)
          RETURNING *
        `
        
        const insertResult = await client.query(insertQuery, [athleteId, seasonYear, seasonQuarter])
        
        return NextResponse.json({
          success: true,
          data: insertResult.rows[0],
          message: 'New season progress record created'
        })
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        message: 'Season progress retrieved successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error getting athlete season progress:', error)
    return NextResponse.json(
      { error: 'Failed to get athlete season progress' },
      { status: 500 }
    )
  }
}

// POST: 更新运动员赛季进度 / Update athlete season progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      athleteId,
      matchesPlayed,
      matchesWon,
      socialPostsCount,
      virtualChzEarned,
      seasonYear,
      seasonQuarter
    } = body

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID is required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      // Update or create season progress
      // 更新或创建赛季进度
      const upsertQuery = `
        INSERT INTO athlete_season_progress (
          athlete_id, season_year, season_quarter,
          matches_played, matches_won, social_posts_count,
          virtual_chz_earned, required_matches, required_wins,
          required_posts, required_virtual_chz, is_eligible_for_vault,
          vault_deposit_enabled, season_completed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 5, 3, 10, 100.0, false, false, false)
        ON CONFLICT (athlete_id, season_year, season_quarter)
        DO UPDATE SET
          matches_played = COALESCE($4, athlete_season_progress.matches_played),
          matches_won = COALESCE($5, athlete_season_progress.matches_won),
          social_posts_count = COALESCE($6, athlete_season_progress.social_posts_count),
          virtual_chz_earned = COALESCE($7, athlete_season_progress.virtual_chz_earned),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `
      
      const result = await client.query(upsertQuery, [
        athleteId,
        seasonYear || new Date().getFullYear(),
        seasonQuarter || Math.ceil((new Date().getMonth() + 1) / 3),
        matchesPlayed,
        matchesWon,
        socialPostsCount,
        virtualChzEarned
      ])
      
      // Check eligibility using database function
      // 使用数据库函数检查资格
      const eligibilityQuery = `
        SELECT check_athlete_vault_eligibility($1, $2, $3)
      `
      
      const eligibilityResult = await client.query(eligibilityQuery, [
        athleteId,
        seasonYear || new Date().getFullYear(),
        seasonQuarter || Math.ceil((new Date().getMonth() + 1) / 3)
      ])
      
      return NextResponse.json({
        success: true,
        data: result.rows[0],
        eligibility: eligibilityResult.rows[0].check_athlete_vault_eligibility,
        message: 'Season progress updated successfully'
      })
      
    } finally {
      client.release()
    }
    
  } catch (error) {
    console.error('Error updating athlete season progress:', error)
    return NextResponse.json(
      { error: 'Failed to update athlete season progress' },
      { status: 500 }
    )
  }
}

// PUT: 启用/禁用托管功能 / Enable/disable vault deposit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { athleteId, vaultDepositEnabled, seasonYear, seasonQuarter } = body

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Athlete ID is required' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    
    try {
      const updateQuery = `
        UPDATE athlete_season_progress
        SET 
          vault_deposit_enabled = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE athlete_id = $1 
          AND season_year = $3 
          AND season_quarter = $4
        RETURNING *
      `
      
      const result = await client.query(updateQuery, [
        athleteId,
        vaultDepositEnabled,
        seasonYear || new Date().getFullYear(),
        seasonQuarter || Math.ceil((new Date().getMonth() + 1) / 3)
      ])
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Season progress record not found' },
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