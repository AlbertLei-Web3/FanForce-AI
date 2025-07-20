/*
 * User Staking API Route
 * 用户质押API路由
 * 
 * This endpoint handles user staking requests with tier-based participation
 * 此端点处理用户质押请求，基于档位的参与方式
 * 
 * POST /api/audience/stake
 * - Handle user staking requests
 * - Validate user CHZ balance
 * - Record staking information
 * - Return success/failure status
 * 
 * POST /api/audience/stake
 * - 处理用户质押请求
 * - 验证用户CHZ余额
 * - 记录质押信息
 * - 返回成功/失败状态
 * 
 * Related files:
 * - lib/database.ts: Database connection utilities
 * - lib/staking-schema.sql: Database schema
 * - app/api/audience/user-stake-status: User stake status API
 * 
 * 相关文件：
 * - lib/database.ts: 数据库连接工具
 * - lib/staking-schema.sql: 数据库架构
 * - app/api/audience/user-stake-status: 用户质押状态API
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '../../../../lib/database';

// Staking request interface
// 质押请求接口
interface StakingRequest {
  user_id: string;
  event_id: string;
  stake_amount: number;
  participation_tier: 1 | 2 | 3; // 1=Full, 2=Stake+Match, 3=Stake Only
  team_choice: 'team_a' | 'team_b';
}

// Staking response interface
// 质押响应接口
interface StakingResponse {
  success: boolean;
  message: string;
  message_cn: string;
  stake_record?: {
    id: string;
    stake_amount: number;
    participation_tier: number;
    team_choice: string;
    stake_time: string;
  };
  error?: string;
  error_cn?: string;
}

// POST - Handle user staking request
// POST - 处理用户质押请求
export async function POST(request: NextRequest): Promise<NextResponse<StakingResponse>> {
  try {
    const body: StakingRequest = await request.json();
    const { user_id, event_id, stake_amount, participation_tier, team_choice } = body;

    console.log('Processing staking request...', { user_id, event_id, stake_amount, participation_tier, team_choice });
    console.log('处理质押请求...', { user_id, event_id, stake_amount, participation_tier, team_choice });

    // Validate required parameters
    // 验证必需参数
    if (!user_id || !event_id || !stake_amount || !participation_tier || !team_choice) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        error_cn: '缺少必需参数',
        message: 'All parameters are required: user_id, event_id, stake_amount, participation_tier, team_choice',
        message_cn: '所有参数都是必需的：user_id, event_id, stake_amount, participation_tier, team_choice'
      }, { status: 400 });
    }

    // Validate participation tier
    // 验证参与档位
    if (![1, 2, 3].includes(participation_tier)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid participation tier. Must be 1, 2, or 3',
        error_cn: '无效的参与档位。必须是1、2或3',
        message: 'Participation tier must be: 1 (Full Experience), 2 (Stake+Match), or 3 (Stake Only)',
        message_cn: '参与档位必须是：1（完整体验）、2（质押+观赛）或3（仅质押）'
      }, { status: 400 });
    }

    // Validate team choice
    // 验证队伍选择
    if (!['team_a', 'team_b'].includes(team_choice)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid team choice. Must be team_a or team_b',
        error_cn: '无效的队伍选择。必须是team_a或team_b',
        message: 'Team choice must be: team_a or team_b',
        message_cn: '队伍选择必须是：team_a或team_b'
      }, { status: 400 });
    }

    // Validate stake amount
    // 验证质押金额
    if (stake_amount <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Stake amount must be greater than 0',
        error_cn: '质押金额必须大于0',
        message: 'Please provide a valid stake amount',
        message_cn: '请提供有效的质押金额'
      }, { status: 400 });
    }

    // Process staking request using transaction
    // 使用事务处理质押请求
    const result = await transaction(async (client) => {
      // 1. Verify user exists and get current balance
      // 1. 验证用户存在并获取当前余额
      const userCheck = await client.query(`
        SELECT id, virtual_chz_balance, role
        FROM users 
        WHERE id = $1
      `, [user_id]);

      if (userCheck.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userCheck.rows[0];
      const currentBalance = parseFloat(user.virtual_chz_balance || '0');

      // Check if user has sufficient balance
      // 检查用户是否有足够余额
      if (currentBalance < stake_amount) {
        throw new Error(`Insufficient balance. Current: ${currentBalance} CHZ, Required: ${stake_amount} CHZ`);
      }

      // 2. Verify event exists and is active
      // 2. 验证赛事存在且活跃
      const eventCheck = await client.query(`
        SELECT id, status, event_start_time
        FROM events 
        WHERE id = $1
      `, [event_id]);

      if (eventCheck.rows.length === 0) {
        throw new Error('Event not found');
      }

      const event = eventCheck.rows[0];
      
      // Check if event is still accepting stakes
      // 检查赛事是否仍在接受质押
      if (event.status !== 'active' && event.status !== 'approved') {
        throw new Error(`Event is not accepting stakes. Current status: ${event.status}`);
      }

      // Check if event has started
      // 检查赛事是否已开始
      const eventStartTime = new Date(event.event_start_time);
      if (eventStartTime <= new Date()) {
        throw new Error('Event has already started. Staking is closed.');
      }

      // 3. Check if user already staked for this event
      // 3. 检查用户是否已为此赛事质押
      const existingStake = await client.query(`
        SELECT id, stake_amount, participation_tier, team_choice
        FROM user_stake_records 
        WHERE user_id = $1 AND event_id = $2 AND status = 'active'
      `, [user_id, event_id]);

      if (existingStake.rows.length > 0) {
        throw new Error('User has already staked for this event');
      }

      // 4. Create stake record
      // 4. 创建质押记录
      const stakeRecord = await client.query(`
        INSERT INTO user_stake_records (
          user_id, event_id, stake_amount, participation_tier, team_choice, status
        ) VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING id, stake_amount, participation_tier, team_choice, stake_time
      `, [user_id, event_id, stake_amount, participation_tier, team_choice]);

      // 5. Deduct stake amount from user balance
      // 5. 从用户余额中扣除质押金额
      const newBalance = currentBalance - stake_amount;
      await client.query(`
        UPDATE users 
        SET virtual_chz_balance = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [newBalance.toString(), user_id]);

      return {
        stakeRecord: stakeRecord.rows[0],
        newBalance,
        previousBalance: currentBalance
      };
    });

    // Return success response
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: 'Staking successful',
      message_cn: '质押成功',
      stake_record: {
        id: result.stakeRecord.id,
        stake_amount: result.stakeRecord.stake_amount,
        participation_tier: result.stakeRecord.participation_tier,
        team_choice: result.stakeRecord.team_choice,
        stake_time: result.stakeRecord.stake_time
      },
      balance_info: {
        previous_balance: result.previousBalance,
        new_balance: result.newBalance,
        stake_amount: stake_amount
      }
    });

  } catch (error) {
    console.error('Staking request failed:', error);
    console.error('质押请求失败:', error);

    // Handle specific error types
    // 处理特定错误类型
    let errorMessage = 'Staking failed';
    let errorMessageCn = '质押失败';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.message.includes('User not found')) {
        errorMessage = 'User not found';
        errorMessageCn = '用户未找到';
        statusCode = 404;
      } else if (error.message.includes('Event not found')) {
        errorMessage = 'Event not found';
        errorMessageCn = '赛事未找到';
        statusCode = 404;
      } else if (error.message.includes('Insufficient balance')) {
        errorMessage = error.message;
        errorMessageCn = '余额不足';
        statusCode = 400;
      } else if (error.message.includes('already staked')) {
        errorMessage = 'User has already staked for this event';
        errorMessageCn = '用户已为此赛事质押';
        statusCode = 400;
      } else if (error.message.includes('not accepting stakes')) {
        errorMessage = error.message;
        errorMessageCn = '赛事不接受质押';
        statusCode = 400;
      } else if (error.message.includes('already started')) {
        errorMessage = 'Event has already started. Staking is closed.';
        errorMessageCn = '赛事已开始，质押已关闭';
        statusCode = 400;
      }
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      error_cn: errorMessageCn,
      message: 'Please check your request and try again',
      message_cn: '请检查您的请求并重试'
    }, { status: statusCode });
  }
}

// GET - Get staking information (optional endpoint for debugging)
// GET - 获取质押信息（可选的调试端点）
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const event_id = searchParams.get('event_id');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing user_id parameter',
        error_cn: '缺少user_id参数'
      }, { status: 400 });
    }

    // Get user's staking records
    // 获取用户的质押记录
    let queryText = `
      SELECT usr.*, e.event_title, e.event_start_time
      FROM user_stake_records usr
      JOIN events e ON e.id = usr.event_id
      WHERE usr.user_id = $1
    `;
    const params = [user_id];

    if (event_id) {
      queryText += ' AND usr.event_id = $2';
      params.push(event_id);
    }

    queryText += ' ORDER BY usr.stake_time DESC';

    const result = await query(queryText, params);

    return NextResponse.json({
      success: true,
      message: 'Staking records retrieved successfully',
      message_cn: '质押记录获取成功',
      stakes: result.rows
    });

  } catch (error) {
    console.error('Error retrieving staking records:', error);
    console.error('获取质押记录时出错:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve staking records',
      error_cn: '获取质押记录失败'
    }, { status: 500 });
  }
} 