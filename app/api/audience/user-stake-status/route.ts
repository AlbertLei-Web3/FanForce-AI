/*
 * User Stake Status API Route
 * 用户质押状态API路由
 * 
 * This endpoint retrieves user staking status for specific events
 * 此端点获取用户在特定赛事的质押状态
 * 
 * GET /api/audience/user-stake-status
 * - Get user stake status
 * - Parameters: user_id, event_id
 * - Returns: user stake information, participation tier, team choice
 * 
 * GET /api/audience/user-stake-status
 * - 获取用户质押状态
 * - 参数：user_id, event_id
 * - 返回：用户质押信息、参与档位、队伍选择
 * 
 * Related files:
 * - lib/database.ts: Database connection utilities
 * - lib/staking-schema.sql: Database schema
 * - app/api/audience/stake: Staking API
 * 
 * 相关文件：
 * - lib/database.ts: 数据库连接工具
 * - lib/staking-schema.sql: 数据库架构
 * - app/api/audience/stake: 质押API
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

// User stake status response interface
// 用户质押状态响应接口
interface UserStakeStatusResponse {
  success: boolean;
  message: string;
  message_cn: string;
  has_staked?: boolean;
  stake_info?: {
    id: string;
    stake_amount: number;
    participation_tier: number;
    team_choice: string;
    stake_time: string;
    status: string;
  };
  event_info?: {
    id: string;
    event_title: string;
    event_start_time: string;
    status: string;
  };
  error?: string;
  error_cn?: string;
}

// GET - Get user stake status
// GET - 获取用户质押状态
export async function GET(request: NextRequest): Promise<NextResponse<UserStakeStatusResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const event_id = searchParams.get('event_id');

    console.log('Getting user stake status...', { user_id, event_id });
    console.log('获取用户质押状态...', { user_id, event_id });

    // Validate required parameters
    // 验证必需参数
    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: user_id',
        error_cn: '缺少必需参数：user_id',
        message: 'Please provide user_id parameter',
        message_cn: '请提供user_id参数'
      }, { status: 400 });
    }

    if (!event_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: event_id',
        error_cn: '缺少必需参数：event_id',
        message: 'Please provide event_id parameter',
        message_cn: '请提供event_id参数'
      }, { status: 400 });
    }

    // Verify user exists
    // 验证用户存在
    const userCheck = await query(`
      SELECT id, username, role, virtual_chz_balance
      FROM users 
      WHERE id = $1
    `, [user_id]);

    if (userCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        error_cn: '用户未找到',
        message: 'The specified user does not exist',
        message_cn: '指定的用户不存在'
      }, { status: 404 });
    }

    // Get event information
    // 获取赛事信息
    const eventInfo = await query(`
      SELECT id, event_title, event_start_time, status
      FROM events 
      WHERE id = $1
    `, [event_id]);

    if (eventInfo.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Event not found',
        error_cn: '赛事未找到',
        message: 'The specified event does not exist',
        message_cn: '指定的赛事不存在'
      }, { status: 404 });
    }

    // Get user's stake record for this event
    // 获取用户在此赛事的质押记录
    const stakeRecord = await query(`
      SELECT 
        usr.id,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.stake_time,
        usr.status,
        usr.created_at,
        usr.updated_at
      FROM user_stake_records usr
      WHERE usr.user_id = $1 
        AND usr.event_id = $2 
        AND usr.status = 'active'
    `, [user_id, event_id]);

    const hasStaked = stakeRecord.rows.length > 0;
    const stakeInfo = hasStaked ? stakeRecord.rows[0] : null;

    // Get additional event statistics
    // 获取额外的赛事统计信息
    const eventStats = await query(`
      SELECT 
        COUNT(*) as total_stakes,
        SUM(stake_amount) as total_stake_amount,
        COUNT(CASE WHEN participation_tier = 1 THEN 1 END) as tier1_count,
        COUNT(CASE WHEN participation_tier = 2 THEN 1 END) as tier2_count,
        COUNT(CASE WHEN participation_tier = 3 THEN 1 END) as tier3_count,
        COUNT(CASE WHEN team_choice = 'team_a' THEN 1 END) as team_a_count,
        COUNT(CASE WHEN team_choice = 'team_b' THEN 1 END) as team_b_count
      FROM user_stake_records
      WHERE event_id = $1 AND status = 'active'
    `, [event_id]);

    // Get platform fee configuration
    // 获取平台手续费配置
    const feeConfig = await query(`
      SELECT fee_percentage, is_active
      FROM platform_fee_config
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const platformFee = feeConfig.rows.length > 0 ? feeConfig.rows[0].fee_percentage : 5.0;

    // Calculate potential reward if user has staked
    // 如果用户已质押，计算潜在奖励
    let potentialReward = null;
    if (hasStaked && stakeInfo) {
      const stats = eventStats.rows[0];
      const tierCoefficient = stakeInfo.participation_tier === 1 ? 1.0 : 
                             stakeInfo.participation_tier === 2 ? 0.7 : 0.3;
      
      // Get admin pool amount (you may need to adjust this based on your actual data structure)
      // 获取管理员奖池金额（您可能需要根据实际数据结构调整此查询）
      const adminPool = await query(`
        SELECT pool_balance_after
        FROM chz_pool_management cpm
        JOIN events e ON cpm.event_id = e.id
        WHERE e.id = $1
        ORDER BY cpm.created_at DESC
        LIMIT 1
      `, [event_id]);

      const poolAmount = adminPool.rows.length > 0 ? parseFloat(adminPool.rows[0].pool_balance_after) : 0;
      
      if (poolAmount > 0 && stats.total_stakes > 0) {
        const baseReward = (poolAmount / stats.total_stakes) * tierCoefficient;
        const feeAmount = baseReward * (platformFee / 100);
        potentialReward = baseReward - feeAmount;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User stake status retrieved successfully',
      message_cn: '用户质押状态获取成功',
      has_staked: hasStaked,
      stake_info: hasStaked ? {
        id: stakeInfo.id,
        stake_amount: parseFloat(stakeInfo.stake_amount),
        participation_tier: stakeInfo.participation_tier,
        team_choice: stakeInfo.team_choice,
        stake_time: stakeInfo.stake_time,
        status: stakeInfo.status
      } : null,
      event_info: {
        id: eventInfo.rows[0].id,
        event_title: eventInfo.rows[0].event_title,
        event_start_time: eventInfo.rows[0].event_start_time,
        status: eventInfo.rows[0].status
      },
      event_statistics: {
        total_stakes: parseInt(eventStats.rows[0].total_stakes),
        total_stake_amount: parseFloat(eventStats.rows[0].total_stake_amount || '0'),
        tier1_count: parseInt(eventStats.rows[0].tier1_count),
        tier2_count: parseInt(eventStats.rows[0].tier2_count),
        tier3_count: parseInt(eventStats.rows[0].tier3_count),
        team_a_count: parseInt(eventStats.rows[0].team_a_count),
        team_b_count: parseInt(eventStats.rows[0].team_b_count)
      },
      platform_fee: platformFee,
      potential_reward: potentialReward,
      user_info: {
        id: userCheck.rows[0].id,
        username: userCheck.rows[0].username,
        role: userCheck.rows[0].role,
        balance: parseFloat(userCheck.rows[0].virtual_chz_balance || '0')
      }
    });

  } catch (error) {
    console.error('Error getting user stake status:', error);
    console.error('获取用户质押状态时出错:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to get user stake status',
      error_cn: '获取用户质押状态失败',
      message: 'Please check your request and try again',
      message_cn: '请检查您的请求并重试'
    }, { status: 500 });
  }
} 