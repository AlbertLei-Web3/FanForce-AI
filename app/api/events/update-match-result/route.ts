import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection configuration
// 数据库连接配置
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      eventId, 
      teamAScore, 
      teamBScore, 
      winner, 
      notes,
      announcedBy 
    } = body;

    // Validate required fields
    // 验证必需字段
    if (!eventId || teamAScore === undefined || teamBScore === undefined || !winner) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: eventId, teamAScore, teamBScore, winner'
      }, { status: 400 });
    }

    // Validate winner value and map to database format
    // 验证获胜者值并映射到数据库格式
    const validWinners = ['team_a', 'team_b', 'draw'];
    if (!validWinners.includes(winner)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid winner value. Must be team_a, team_b, or draw'
      }, { status: 400 });
    }

    // Map frontend values to database format
    // 将前端值映射到数据库格式
    const mapWinnerToDatabase = (winner) => {
      switch (winner) {
        case 'team_a':
          return 'team_a_wins';
        case 'team_b':
          return 'team_b_wins';
        case 'draw':
          return 'draw';
        default:
          return winner;
      }
    };

    const databaseWinner = mapWinnerToDatabase(winner);

    const client = await pool.connect();

    try {
      // Start transaction
      // 开始事务
      await client.query('BEGIN');

      // 1. Update the event with match result
      // 1. 更新活动比赛结果
      const updateEventQuery = `
        UPDATE events 
        SET 
          match_result = $1,
          team_a_score = $2,
          team_b_score = $3,
          result_announced_at = CURRENT_TIMESTAMP,
          status = 'completed',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;

      const eventResult = await client.query(updateEventQuery, [
        databaseWinner,
        teamAScore,
        teamBScore,
        eventId
      ]);

      if (eventResult.rows.length === 0) {
        throw new Error('Event not found');
      }

      // 2. Get event participants (athletes) for individual results
      // 2. 获取活动参与者（运动员）以获取个人结果
      const getParticipantsQuery = `
        SELECT 
          ep.user_id,
          ep.team_assignment,
          a.id as athlete_id,
          a.matches_won,
          a.matches_lost,
          a.matches_drawn,
          a.current_ranking,
          a.ranking_points
        FROM event_participants ep
        JOIN athletes a ON a.user_id = ep.user_id
        WHERE ep.event_id = $1 AND ep.participation_type = 'athlete'
      `;

      const participantsResult = await client.query(getParticipantsQuery, [eventId]);
      const participants = participantsResult.rows;

      // 3. Calculate individual match results for each athlete
      // 3. 计算每个运动员的个人比赛结果
      const matchResultsToInsert = [];
      const athleteUpdates = [];

      for (const participant of participants) {
        let individualResult;
        let rankingPointsChange = 0;

        // Determine individual result based on team assignment and winner
        // 根据队伍分配和获胜者确定个人结果
        if (participant.team_assignment === 'A') {
          if (winner === 'team_a') {
            individualResult = 'win';
            rankingPointsChange = 50; // Win points
          } else if (winner === 'team_b') {
            individualResult = 'loss';
            rankingPointsChange = -30; // Loss points
          } else {
            individualResult = 'draw';
            rankingPointsChange = 10; // Draw points
          }
        } else if (participant.team_assignment === 'B') {
          if (winner === 'team_b') {
            individualResult = 'win';
            rankingPointsChange = 50;
          } else if (winner === 'team_a') {
            individualResult = 'loss';
            rankingPointsChange = -30;
          } else {
            individualResult = 'draw';
            rankingPointsChange = 10;
          }
        }

        // Prepare match result record
        // 准备比赛结果记录
        matchResultsToInsert.push({
          event_id: eventId,
          athlete_id: participant.athlete_id,
          team_assignment: participant.team_assignment,
          match_result: individualResult,
          ranking_points_earned: individualResult === 'win' ? 50 : (individualResult === 'draw' ? 10 : 0),
          ranking_points_lost: individualResult === 'loss' ? 30 : 0,
          performance_score: individualResult === 'win' ? 100 : (individualResult === 'draw' ? 50 : 0)
        });

        // Prepare athlete stats update
        // 准备运动员统计更新
        const newMatchesWon = participant.matches_won + (individualResult === 'win' ? 1 : 0);
        const newMatchesLost = participant.matches_lost + (individualResult === 'loss' ? 1 : 0);
        const newMatchesDrawn = participant.matches_drawn + (individualResult === 'draw' ? 1 : 0);
        const newRankingPoints = participant.ranking_points + rankingPointsChange;
        const newWinRate = ((newMatchesWon / (newMatchesWon + newMatchesLost + newMatchesDrawn)) * 100).toFixed(2);

        athleteUpdates.push({
          athlete_id: participant.athlete_id,
          matches_won: newMatchesWon,
          matches_lost: newMatchesLost,
          matches_drawn: newMatchesDrawn,
          ranking_points: newRankingPoints,
          win_rate: parseFloat(newWinRate),
          last_match_date: new Date().toISOString().split('T')[0]
        });
      }

      // 4. Insert match results for all athletes
      // 4. 为所有运动员插入比赛结果
      for (const matchResult of matchResultsToInsert) {
        const insertMatchResultQuery = `
          INSERT INTO match_results (
            event_id, athlete_id, team_assignment, match_result,
            ranking_points_earned, ranking_points_lost, performance_score
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (event_id, athlete_id) DO UPDATE SET
            team_assignment = EXCLUDED.team_assignment,
            match_result = EXCLUDED.match_result,
            ranking_points_earned = EXCLUDED.ranking_points_earned,
            ranking_points_lost = EXCLUDED.ranking_points_lost,
            performance_score = EXCLUDED.performance_score,
            updated_at = CURRENT_TIMESTAMP
        `;

        await client.query(insertMatchResultQuery, [
          matchResult.event_id,
          matchResult.athlete_id,
          matchResult.team_assignment,
          matchResult.match_result,
          matchResult.ranking_points_earned,
          matchResult.ranking_points_lost,
          matchResult.performance_score
        ]);
      }

      // 5. Update athlete statistics
      // 5. 更新运动员统计
      for (const athleteUpdate of athleteUpdates) {
        const updateAthleteQuery = `
          UPDATE athletes 
          SET 
            matches_won = $1,
            matches_lost = $2,
            matches_drawn = $3,
            ranking_points = $4,
            win_rate = $5,
            last_match_date = $6,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $7
        `;

        await client.query(updateAthleteQuery, [
          athleteUpdate.matches_won,
          athleteUpdate.matches_lost,
          athleteUpdate.matches_drawn,
          athleteUpdate.ranking_points,
          athleteUpdate.win_rate,
          athleteUpdate.last_match_date,
          athleteUpdate.athlete_id
        ]);
      }

      // 6. Calculate and distribute rewards to audience members
      // 6. 计算并分配奖励给观众成员
      const getAudienceStakesQuery = `
        SELECT 
          usr.user_id,
          usr.stake_amount,
          usr.participation_tier,
          usr.event_id
        FROM user_stake_records usr
        WHERE usr.event_id = $1 AND usr.status = 'active'
      `;

      const audienceStakesResult = await client.query(getAudienceStakesQuery, [eventId]);
      const audienceStakes = audienceStakesResult.rows;

      if (audienceStakes.length > 0) {
        // Get admin pool amount from events.pool_injected_chz
        // 从events.pool_injected_chz获取管理员奖池金额
        const eventResult = await client.query(
          'SELECT pool_injected_chz FROM events WHERE id = $1',
          [eventId]
        );
        
        if (eventResult.rows.length === 0) {
          throw new Error('Event not found');
        }
        
        const adminPoolAmount = parseFloat(eventResult.rows[0].pool_injected_chz) || 0;
        const totalParticipants = audienceStakes.length;
        const platformFeePercentage = 5.0; // 5% platform fee

        for (const stake of audienceStakes) {
          // Calculate tier coefficient based on participation_tier
          // 根据participation_tier计算等级系数
          let tierCoefficient = 0.3;
          switch (stake.participation_tier) {
            case 1: // Full Experience
              tierCoefficient = 1.0;
              break;
            case 2: // Stake+Match
              tierCoefficient = 0.7;
              break;
            case 3: // Stake Only
              tierCoefficient = 0.3;
              break;
            default:
              tierCoefficient = 0.3;
          }

          // === 流动性挖矿奖励计算公式实现 ===
          // Liquidity Mining Reward Calculation Formula Implementation
          // 
          // 公式：个人可领取奖励 = （奖池总额 × 用户质押占比 × 系数） × (1 - 平台手续费%)
          // Formula: Personal Reward = (Pool Total × User Stake Ratio × Coefficient) × (1 - Platform Fee%)
          //
          // 其中：
          // Where:
          // - 奖池总额 = events.pool_injected_chz (管理员注入的奖池金额)
          // - Pool Total = events.pool_injected_chz (Admin injected pool amount)
          // - 用户质押占比 = 用户个人质押金额 ÷ 所有用户质押金额总和
          // - User Stake Ratio = User's stake amount ÷ Total stake amount of all users
          // - 系数 = 基于用户奖励档位的倍数 (一档1.0, 二档0.7, 三档0.3)
          // - Coefficient = Multiplier based on user reward tier (Tier 1: 1.0, Tier 2: 0.7, Tier 3: 0.3)
          // - 平台手续费% = 从平台配置中获取的手续费百分比
          // - Platform Fee% = Fee percentage obtained from platform configuration

          // Step 1: Calculate total stake amount for all users in this event
          // 步骤1：计算此赛事所有用户的总质押金额
          let totalStake = 0;
          for (const stakeRecord of audienceStakes) {
            totalStake += parseFloat(stakeRecord.stake_amount);
          }

          // Step 2: Calculate user stake ratio (liquidity contribution ratio)
          // 步骤2：计算用户质押占比（流动性贡献比例）
          const userStake = parseFloat(stake.stake_amount);
          const userRatio = userStake / totalStake;

          // Step 3: Calculate base reward using liquidity mining formula
          // 步骤3：使用流动性挖矿公式计算基础奖励
          // baseReward = adminPoolAmount × userRatio × tierCoefficient
          // 基础奖励 = 奖池总额 × 用户质押占比 × 系数
          const baseReward = adminPoolAmount * userRatio * tierCoefficient;
          
          // Step 4: Calculate platform fee
          // 步骤4：计算平台手续费
          const platformFeeAmount = baseReward * (platformFeePercentage / 100);
          
          // Step 5: Calculate final reward after deducting platform fee
          // 步骤5：扣除平台手续费后计算最终奖励
          const finalReward = baseReward - platformFeeAmount;

          // Create calculation formula display with liquidity mining details
          // 创建包含流动性挖矿详细信息的计算公式显示
          const calculationFormula = `流动性挖矿奖励 = (${adminPoolAmount} × ${(userRatio * 100).toFixed(2)}% × ${tierCoefficient}) × (1 - ${platformFeePercentage}%) = ${finalReward.toFixed(2)} CHZ`;

          // Insert reward distribution record
          // 插入奖励分配记录
          const insertRewardQuery = `
            INSERT INTO reward_distributions (
              event_id, user_id, stake_record_id, original_stake_amount,
              admin_pool_amount, total_participants, user_tier_coefficient,
              base_reward, platform_fee_percentage, platform_fee_amount,
              final_reward, calculation_formula
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          `;

          await client.query(insertRewardQuery, [
            eventId,
            stake.user_id,
            stake.id,
            stake.stake_amount,
            adminPoolAmount,
            totalParticipants,
            tierCoefficient,
            baseReward,
            platformFeePercentage,
            platformFeeAmount,
            finalReward,
            calculationFormula
          ]);
        }
      }

      // 7. Log the match result announcement
      // 7. 记录比赛结果公告
      const insertAnnouncementQuery = `
        INSERT INTO match_result_announcements (
          event_id, announced_by, match_result, team_a_score, team_b_score,
          announcement_notes
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;

      // For now, use a default user ID or handle the announcedBy properly
      // 目前，使用默认用户ID或正确处理announcedBy
      const defaultUserId = '1de6110a-f982-4f7f-979e-00e7f7d33bed'; // Use actual user ID
      
      await client.query(insertAnnouncementQuery, [
        eventId,
        announcedBy || defaultUserId,
        databaseWinner,
        teamAScore,
        teamBScore,
        notes || ''
      ]);

      // Commit transaction
      // 提交事务
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Match result announced successfully',
        data: {
          eventId,
          teamAScore,
          teamBScore,
          winner,
          participantsUpdated: participants.length,
          rewardsCalculated: audienceStakes.length
        }
      });

    } catch (error) {
      // Rollback transaction on error
      // 错误时回滚事务
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating match result:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update match result',
      details: error.message
    }, { status: 500 });
  }
} 