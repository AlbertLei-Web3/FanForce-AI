/*
 * Calculate Rewards API Route
 * 计算奖励API路由
 * 
 * This endpoint calculates rewards for all users who staked in an event
 * 此端点计算所有在赛事中质押的用户的奖励
 * 
 * POST /api/audience/calculate-rewards
 * - Calculate rewards for all stakers in an event
 * - Parameter: event_id
 * - Implements reward formula: (admin_pool ÷ total_participants × tier_coefficient) - (admin_pool ÷ total_participants × tier_coefficient) × platform_fee
 * - Updates reward_calculations table
 * 
 * POST /api/audience/calculate-rewards
 * - 计算赛事中所有质押者的奖励
 * - 参数：event_id
 * - 实现奖励公式：(admin奖池÷总人数×档位系数)-(admin奖池÷总人数×档位系数)×平台手续费
 * - 更新reward_calculations表
 * 
 * Related files:
 * - lib/database.ts: Database connection utilities
 * - lib/staking-schema.sql: Database schema
 * - app/api/audience/stake: Staking API
 * - app/api/audience/user-stake-status: User stake status API
 * 
 * 相关文件：
 * - lib/database.ts: 数据库连接工具
 * - lib/staking-schema.sql: 数据库架构
 * - app/api/audience/stake: 质押API
 * - app/api/audience/user-stake-status: 用户质押状态API
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '../../../../lib/database';

// Calculate rewards request interface
// 计算奖励请求接口
interface CalculateRewardsRequest {
  event_id: string;
  admin_user_id?: string; // Optional admin user ID for logging
}

// Calculate rewards response interface
// 计算奖励响应接口
interface CalculateRewardsResponse {
  success: boolean;
  message: string;
  message_cn: string;
  calculation_summary?: {
    event_id: string;
    total_participants: number;
    admin_pool_amount: number;
    platform_fee_percentage: number;
    total_rewards_calculated: number;
    total_fees_collected: number;
    calculations_created: number;
  };
  error?: string;
  error_cn?: string;
}

// POST - Calculate rewards for an event
// POST - 计算赛事的奖励
export async function POST(request: NextRequest): Promise<NextResponse<CalculateRewardsResponse>> {
  try {
    const body: CalculateRewardsRequest = await request.json();
    const { event_id, admin_user_id } = body;

    console.log('Calculating rewards for event...', { event_id, admin_user_id });
    console.log('计算赛事奖励...', { event_id, admin_user_id });

    // Validate required parameters
    // 验证必需参数
    if (!event_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: event_id',
        error_cn: '缺少必需参数：event_id',
        message: 'Please provide event_id parameter',
        message_cn: '请提供event_id参数'
      }, { status: 400 });
    }

    // Process reward calculation using transaction
    // 使用事务处理奖励计算
    const result = await transaction(async (client) => {
      // 1. Verify event exists and is completed
      // 1. 验证赛事存在且已完成
      const eventCheck = await client.query(`
        SELECT id, event_title, status, event_start_time, event_end_time
        FROM events 
        WHERE id = $1
      `, [event_id]);

      if (eventCheck.rows.length === 0) {
        throw new Error('Event not found');
      }

      const event = eventCheck.rows[0];
      
      // Check if event has ended
      // 检查赛事是否已结束
      const eventEndTime = new Date(event.event_end_time || event.event_start_time);
      if (eventEndTime > new Date()) {
        throw new Error('Event has not ended yet. Cannot calculate rewards.');
      }

      // 2. Get all active stakes for this event
      // 2. 获取此赛事的所有活跃质押
      const stakes = await client.query(`
        SELECT 
          usr.id as stake_id,
          usr.user_id,
          usr.stake_amount,
          usr.participation_tier,
          usr.team_choice,
          usr.stake_time,
          u.username,
          u.virtual_chz_balance
        FROM user_stake_records usr
        JOIN users u ON u.id = usr.user_id
        WHERE usr.event_id = $1 AND usr.status = 'active'
        ORDER BY usr.stake_time ASC
      `, [event_id]);

      if (stakes.rows.length === 0) {
        throw new Error('No active stakes found for this event');
      }

      // 3. Get admin pool amount
      // 3. 获取管理员奖池金额
      const adminPool = await client.query(`
        SELECT pool_balance_after
        FROM chz_pool_management cpm
        JOIN events e ON cpm.event_id = e.id
        WHERE e.id = $1
        ORDER BY cpm.created_at DESC
        LIMIT 1
      `, [event_id]);

      if (adminPool.rows.length === 0) {
        throw new Error('No admin pool found for this event');
      }

      const adminPoolAmount = parseFloat(adminPool.rows[0].pool_balance_after);

      // 4. Get platform fee configuration
      // 4. 获取平台手续费配置
      const feeConfig = await client.query(`
        SELECT fee_percentage
        FROM platform_fee_config
        WHERE is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `, []);

      const platformFeePercentage = feeConfig.rows.length > 0 ? 
        parseFloat(feeConfig.rows[0].fee_percentage) : 5.0;

      // 5. Calculate rewards for each stake
      // 5. 为每个质押计算奖励
      const totalParticipants = stakes.rows.length;
      let totalRewardsCalculated = 0;
      let totalFeesCollected = 0;
      let calculationsCreated = 0;

      for (const stake of stakes.rows) {
        // Calculate tier coefficient
        // 计算档位系数
        const tierCoefficient = stake.participation_tier === 1 ? 1.0 : 
                               stake.participation_tier === 2 ? 0.7 : 0.3;

        // Calculate base reward
        // 计算基础奖励
        const baseReward = (adminPoolAmount / totalParticipants) * tierCoefficient;
        
        // Calculate platform fee
        // 计算平台手续费
        const feeAmount = baseReward * (platformFeePercentage / 100);
        
        // Calculate final reward
        // 计算最终奖励
        const finalReward = baseReward - feeAmount;

        // Insert reward calculation record
        // 插入奖励计算记录
        await client.query(`
          INSERT INTO reward_calculations (
            event_id, user_id, stake_record_id, admin_pool_amount, total_participants,
            user_tier_coefficient, calculated_reward, platform_fee_percentage, 
            platform_fee_amount, final_reward, calculation_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'calculated')
        `, [
          event_id,
          stake.user_id,
          stake.stake_id,
          adminPoolAmount,
          totalParticipants,
          tierCoefficient,
          baseReward,
          platformFeePercentage,
          feeAmount,
          finalReward
        ]);

        // Update user balance with reward
        // 用奖励更新用户余额
        const currentBalance = parseFloat(stake.virtual_chz_balance || '0');
        const newBalance = currentBalance + finalReward;
        
        await client.query(`
          UPDATE users 
          SET virtual_chz_balance = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [newBalance.toString(), stake.user_id]);

        // Update stake record status
        // 更新质押记录状态
        await client.query(`
          UPDATE user_stake_records 
          SET status = 'settled', settlement_time = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [stake.stake_id]);

        totalRewardsCalculated += finalReward;
        totalFeesCollected += feeAmount;
        calculationsCreated++;
      }

      return {
        event_id,
        total_participants: totalParticipants,
        admin_pool_amount: adminPoolAmount,
        platform_fee_percentage: platformFeePercentage,
        total_rewards_calculated: totalRewardsCalculated,
        total_fees_collected: totalFeesCollected,
        calculations_created: calculationsCreated
      };
    });

    // Return success response
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Rewards calculated successfully',
      message_cn: '奖励计算成功',
      calculation_summary: {
        event_id: result.event_id,
        total_participants: result.total_participants,
        admin_pool_amount: result.admin_pool_amount,
        platform_fee_percentage: result.platform_fee_percentage,
        total_rewards_calculated: result.total_rewards_calculated,
        total_fees_collected: result.total_fees_collected,
        calculations_created: result.calculations_created
      }
    });

  } catch (error) {
    console.error('Reward calculation failed:', error);
    console.error('奖励计算失败:', error);

    // Handle specific error types
    // 处理特定错误类型
    let errorMessage = 'Reward calculation failed';
    let errorMessageCn = '奖励计算失败';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('Event not found')) {
        errorMessage = 'Event not found';
        errorMessageCn = '赛事未找到';
        statusCode = 404;
      } else if (error.message.includes('has not ended')) {
        errorMessage = 'Event has not ended yet. Cannot calculate rewards.';
        errorMessageCn = '赛事尚未结束，无法计算奖励';
        statusCode = 400;
      } else if (error.message.includes('No active stakes')) {
        errorMessage = 'No active stakes found for this event';
        errorMessageCn = '此赛事未找到活跃质押';
        statusCode = 400;
      } else if (error.message.includes('No admin pool')) {
        errorMessage = 'No admin pool found for this event';
        errorMessageCn = '此赛事未找到管理员奖池';
        statusCode = 400;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      error_cn: errorMessageCn,
      message: 'Please check the event status and try again',
      message_cn: '请检查赛事状态并重试'
    }, { status: statusCode });
  }
}

// GET - Get reward calculation summary (optional endpoint for debugging)
// GET - 获取奖励计算摘要（可选的调试端点）
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const event_id = searchParams.get('event_id');

    if (!event_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing event_id parameter',
        error_cn: '缺少event_id参数',
        message: 'Please provide event_id parameter',
        message_cn: '请提供event_id参数'
      }, { status: 400 });
    }

    // Get reward calculations for the event
    // 获取赛事的奖励计算
    const calculations = await query(`
      SELECT 
        rc.*,
        u.username,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice
      FROM reward_calculations rc
      JOIN users u ON u.id = rc.user_id
      JOIN user_stake_records usr ON usr.id = rc.stake_record_id
      WHERE rc.event_id = $1
      ORDER BY rc.calculation_time DESC
    `, [event_id]);

    // Get calculation summary
    // 获取计算摘要
    const summary = await query(`
      SELECT 
        COUNT(*) as total_calculations,
        SUM(final_reward) as total_rewards_paid,
        SUM(platform_fee_amount) as total_fees_collected,
        AVG(user_tier_coefficient) as avg_tier_coefficient
      FROM reward_calculations
      WHERE event_id = $1
    `, [event_id]);

    return NextResponse.json({
      success: true,
      message: 'Reward calculations retrieved successfully',
      message_cn: '奖励计算获取成功',
      calculations: calculations.rows,
      summary: summary.rows[0]
    });

  } catch (error) {
    console.error('Error retrieving reward calculations:', error);
    console.error('获取奖励计算时出错:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve reward calculations',
      error_cn: '获取奖励计算失败',
      message: 'Please check your request and try again',
      message_cn: '请检查您的请求并重试'
    }, { status: 500 });
  }
} 