import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// Audience Claimable Rewards API
// 观众可领取奖励API
// This endpoint allows audience members to view their claimable rewards with calculation details
// 此端点允许观众成员查看其可领取奖励及计算详情

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || request.headers.get('x-user-id') || 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    // Get user's claimable rewards from reward_calculations table (liquidity mining)
    // 从reward_calculations表获取用户的可领取奖励（流动性挖矿）
    const rewardsResult = await query(
      `SELECT 
        rc.id,
        rc.event_id,
        rc.final_reward,
        rc.calculation_status as distribution_status,
        rc.calculation_time as calculated_at,
        e.title as event_title,
        e.match_result,
        e.team_a_score,
        e.team_b_score,
        e.team_a_info,
        e.team_b_info,
        e.event_date,
        e.venue_name,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.stake_time,
        -- Create calculation formula display for liquidity mining
        -- 为流动性挖矿创建计算公式显示
        CONCAT('流动性挖矿奖励 = (', rc.admin_pool_amount, ' × ', 
               ROUND((usr.stake_amount::numeric / (SELECT SUM(stake_amount::numeric) FROM user_stake_records WHERE event_id = rc.event_id)) * 100, 2), 
               '% × ', rc.user_tier_coefficient, ') × (1 - ', rc.platform_fee_percentage, '%) = ', rc.final_reward, ' CHZ') as calculation_formula
       FROM reward_calculations rc
       JOIN events e ON rc.event_id = e.id
       JOIN user_stake_records usr ON usr.id = rc.stake_record_id
       WHERE rc.user_id = $1
       ORDER BY rc.calculation_time DESC`,
      [userId]
    );

    // Get user's total statistics from reward_calculations table
    // 从reward_calculations表获取用户的总统计
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_events_participated,
        SUM(rc.final_reward) as total_rewards_earned,
        SUM(usr.stake_amount) as total_stakes_placed,
        AVG(rc.final_reward) as average_reward_per_event
       FROM reward_calculations rc
       JOIN user_stake_records usr ON rc.stake_record_id = usr.id
       WHERE rc.user_id = $1`,
      [userId]
    );

    // Get user's recent activity from reward_calculations table
    // 从reward_calculations表获取用户的最近活动
    const recentActivityResult = await query(
      `SELECT 
        e.title as event_title,
        e.match_result,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.stake_time,
        rc.final_reward,
        rc.calculation_status as distribution_status
       FROM user_stake_records usr
       JOIN events e ON usr.event_id = e.id
       LEFT JOIN reward_calculations rc ON rc.stake_record_id = usr.id
       WHERE usr.user_id = $1
       ORDER BY usr.stake_time DESC
       LIMIT 10`,
      [userId]
    );

    // Get featured championship (most recent completed event)
    // 获取焦点锦标赛（最近的已完成活动）
    const featuredChampionshipResult = await query(
      `SELECT 
        e.id,
        e.title,
        e.description,
        e.match_result,
        e.team_a_score,
        e.team_b_score,
        e.team_a_info,
        e.team_b_info,
        e.event_date,
        e.venue_name,
        e.total_participants,
        e.total_stakes_amount,
        e.rewards_distributed,
        e.rewards_distributed_at,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.stake_time,
        rd.final_reward,
        rd.calculation_formula,
        rd.distribution_status
       FROM events e
       LEFT JOIN user_stake_records usr ON usr.event_id = e.id AND usr.user_id = $1
               LEFT JOIN reward_calculations rc ON rc.event_id = e.id AND rc.user_id = $1
       WHERE e.status = 'completed' AND e.rewards_distributed = true
       ORDER BY e.rewards_distributed_at DESC
       LIMIT 1`,
      [userId]
    );

    const featuredChampionship = featuredChampionshipResult.rows[0];

    // Format the response
    // 格式化响应
    const response = {
      success: true,
      data: {
        userStats: statsResult.rows[0] || {
          total_events_participated: 0,
          total_rewards_earned: 0,
          total_stakes_placed: 0,
          average_reward_per_event: 0
        },
        claimableRewards: rewardsResult.rows.map(reward => ({
          id: reward.id,
          eventId: reward.event_id,
          eventTitle: reward.event_title,
          matchResult: reward.match_result,
          teamAScore: reward.team_a_score,
          teamBScore: reward.team_b_score,
          teamAInfo: reward.team_a_info,
          teamBInfo: reward.team_b_info,
          eventDate: reward.event_date,
          venueName: reward.venue_name,
          stakeAmount: reward.stake_amount,
          participationTier: reward.participation_tier,
          teamChoice: reward.team_choice,
          stakeTime: reward.stake_time,
          finalReward: reward.final_reward,
          calculationFormula: reward.calculation_formula,
          distributionStatus: reward.distribution_status,
          calculatedAt: reward.calculated_at
        })),
        recentActivity: recentActivityResult.rows.map(activity => ({
          eventTitle: activity.event_title,
          matchResult: activity.match_result,
          stakeAmount: activity.stake_amount,
          participationTier: activity.participation_tier,
          teamChoice: activity.team_choice,
          stakeTime: activity.stake_time,
          finalReward: activity.final_reward,
          distributionStatus: activity.distribution_status
        })),
        featuredChampionship: featuredChampionship ? {
          id: featuredChampionship.id,
          title: featuredChampionship.title,
          description: featuredChampionship.description,
          matchResult: featuredChampionship.match_result,
          teamAScore: featuredChampionship.team_a_score,
          teamBScore: featuredChampionship.team_b_score,
          teamAInfo: featuredChampionship.team_a_info,
          teamBInfo: featuredChampionship.team_b_info,
          eventDate: featuredChampionship.event_date,
          venueName: featuredChampionship.venue_name,
          totalParticipants: featuredChampionship.total_participants,
          totalStakesAmount: featuredChampionship.total_stakes_amount,
          rewardsDistributed: featuredChampionship.rewards_distributed,
          rewardsDistributedAt: featuredChampionship.rewards_distributed_at,
          userStake: featuredChampionship.stake_amount ? {
            amount: featuredChampionship.stake_amount,
            participationTier: featuredChampionship.participation_tier,
            teamChoice: featuredChampionship.team_choice,
            stakeTime: featuredChampionship.stake_time
          } : null,
          userReward: featuredChampionship.final_reward ? {
            amount: featuredChampionship.final_reward,
            calculationFormula: featuredChampionship.calculation_formula,
            distributionStatus: featuredChampionship.distribution_status
          } : null
        } : null
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting claimable rewards:', error);
    console.error('获取可领取奖励时出错:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: '内部服务器错误'
      },
      { status: 500 }
    );
  }
}

// Claim rewards endpoint
// 领取奖励端点
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardId } = body;
    const userId = request.headers.get('x-user-id') || 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    if (!rewardId) {
      return NextResponse.json(
        { 
          error: 'Reward ID is required', 
          message: '需要奖励ID'
        },
        { status: 400 }
      );
    }

    // Verify the reward belongs to the user and is claimable
    // 验证奖励属于用户且可领取
    const rewardCheck = await query(
              `SELECT 
          rc.id,
          rc.final_reward,
          rc.calculation_status as distribution_status,
          e.title as event_title
                  FROM reward_calculations rc
         JOIN events e ON rc.event_id = e.id
         WHERE rc.id = $1 AND rc.user_id = $2`,
      [rewardId, userId]
    );

    if (rewardCheck.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Reward not found or access denied', 
          message: '未找到奖励或访问被拒绝'
        },
        { status: 404 }
      );
    }

    const reward = rewardCheck.rows[0];

    if (reward.distribution_status !== 'calculated') {
      return NextResponse.json(
        { 
          error: 'Reward is not available for claiming', 
          message: '奖励不可领取',
          status: reward.distribution_status
        },
        { status: 400 }
      );
    }

    // Update reward status to claimed
    // 将奖励状态更新为已领取
    await query(
      `UPDATE reward_calculations 
       SET calculation_status = 'claimed',
           updated_at = NOW()
       WHERE id = $1`,
      [rewardId]
    );

    // Update user's balance (in a real app, this would be a blockchain transaction)
    // 更新用户余额（在实际应用中，这将是区块链交易）
    await query(
      `UPDATE users 
       SET real_chz_balance = real_chz_balance + $1,
           updated_at = NOW()
       WHERE id = $2`,
      [reward.final_reward, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Reward claimed successfully',
      message_zh: '奖励领取成功',
      data: {
        rewardId,
        amount: reward.final_reward,
        eventTitle: reward.event_title,
        claimedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error claiming reward:', error);
    console.error('领取奖励时出错:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: '内部服务器错误'
      },
      { status: 500 }
    );
  }
} 