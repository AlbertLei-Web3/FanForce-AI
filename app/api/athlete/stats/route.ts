 // Athlete Stats API Route
// 运动员统计API路由
// This endpoint provides comprehensive athlete statistics
// 此端点提供全面的运动员统计信息

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// GET - Retrieve athlete statistics
// GET - 获取运动员统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const athlete_id = searchParams.get('athlete_id')

    console.log('Fetching athlete stats...', { athlete_id })
    console.log('获取运动员统计...', { athlete_id })

    // Validate required parameters
    // 验证必需参数
    if (!athlete_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: athlete_id',
        error_cn: '缺少必需参数：athlete_id'
      }, { status: 400 })
    }

    // Get athlete statistics
    // 获取运动员统计信息
    const statsQuery = `
      SELECT 
        a.matches_played,
        a.matches_won,
        a.season_earnings,
        a.total_fees_earned,
        a.performance_stats,
        u.virtual_chz_balance,
        u.real_chz_balance
      FROM athletes a
      JOIN users u ON a.user_id = u.id
      WHERE u.id = $1 AND u.role = 'athlete'
    `

    const stats = await query(statsQuery, [athlete_id])

    if (stats.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Athlete not found',
        error_cn: '运动员未找到'
      }, { status: 404 })
    }

    const statsData = stats.rows[0]

    // Calculate derived statistics
    // 计算派生统计信息
    const totalMatches = statsData.matches_played || 0;
    const wins = statsData.matches_won || 0;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? `${Math.round((wins / totalMatches) * 100)}%` : '0%';
    
    // Calculate MVP count from performance stats
    // 从表现统计中计算MVP数量
    const performanceStats = safeJsonParse(statsData.performance_stats, {});
    const mvpCount = performanceStats.mvp_count || 0;
    
    // Calculate current streak
    // 计算当前连胜
    const currentStreak = performanceStats.current_streak || 0;
    const bestStreak = performanceStats.best_streak || 0;
    
    // Calculate average performance
    // 计算平均表现
    const averagePerformance = performanceStats.average_performance || 0;
    
    // Get fees from matches (1% fee share)
    // 获取比赛费用（1%费用分成）
    const feesFromMatches = statsData.total_fees_earned || 0;

    // Virtual CHZ balance
    // 虚拟CHZ余额
    const virtualCHZBalance = statsData.virtual_chz_balance || 0;
    const realCHZBalance = statsData.real_chz_balance || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalMatches,
        wins,
        losses,
        winRate,
        mvpCount,
        virtualCHZBalance,
        realCHZBalance,
        currentStreak,
        bestStreak,
        averagePerformance,
        feesFromMatches,
        seasonEarnings: statsData.season_earnings || 0,
        totalFeesEarned: statsData.total_fees_earned || 0
      },
      message: 'Athlete stats retrieved successfully',
      message_cn: '运动员统计获取成功'
    })

  } catch (error) {
    console.error('Error fetching athlete stats:', error)
    console.error('获取运动员统计错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch athlete stats',
      error_cn: '获取运动员统计失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function for safe JSON parsing
// 安全JSON解析辅助函数
function safeJsonParse(value: any, defaultValue: any) {
  try {
    if (!value) return defaultValue;
    if (typeof value === 'object') return value;
    return JSON.parse(value);
  } catch (error) {
    console.error('JSON parse error:', error, 'Value:', value);
    return defaultValue;
  }
}