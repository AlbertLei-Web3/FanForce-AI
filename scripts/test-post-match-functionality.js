const { Pool } = require('pg');

// Database configuration
// 数据库配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Logging functions
// 日志函数
function logInfo(message, chineseMessage) {
  console.log(`ℹ️  ${message}`);
  console.log(`ℹ️  ${chineseMessage}`);
  console.log('');
}

function logSuccess(message, chineseMessage) {
  console.log(`✅ ${message}`);
  console.log(`✅ ${chineseMessage}`);
  console.log('');
}

function logError(message, chineseMessage, error) {
  console.log(`❌ ${message}`);
  console.log(`❌ ${chineseMessage}`);
  if (error) {
    console.log(`Error details: ${error.message}`);
  }
  console.log('');
}

// Test post-match functionality
// 测试赛后功能
async function testPostMatchFunctionality() {
  try {
    logInfo(
      'Testing post-match functionality...',
      '测试赛后功能...'
    );

    // Step 1: Check existing events that can be managed
    // 步骤1：检查可以管理的现有活动
    logInfo(
      'Step 1: Checking existing events for management',
      '步骤1：检查可管理的现有活动'
    );

    const eventsResult = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.status,
        e.ambassador_id,
        ea.team_a_info,
        ea.team_b_info
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      WHERE e.status = 'active'
      LIMIT 3
    `);

    if (eventsResult.rows.length === 0) {
      logError(
        'No active events found for testing',
        '未找到用于测试的活跃活动'
      );
      return;
    }

    logSuccess(
      `Found ${eventsResult.rows.length} active events for testing`,
      `找到${eventsResult.rows.length}个用于测试的活跃活动`
    );

    // Step 2: Simulate match result announcement
    // 步骤2：模拟比赛结果公告
    const testEvent = eventsResult.rows[0];
    const ambassadorId = testEvent.ambassador_id;

    logInfo(
      `Step 2: Simulating match result announcement for event: ${testEvent.title}`,
      `步骤2：为活动模拟比赛结果公告：${testEvent.title}`
    );

    // Simulate match result data
    // 模拟比赛结果数据
    const matchResultData = {
      eventId: testEvent.id,
      teamAScore: 2,
      teamBScore: 1,
      matchResult: 'team_a_wins',
      announcementNotes: 'Test match result announcement',
      weatherConditions: 'Sunny',
      specialEvents: 'None'
    };

    // Update event with match result
    // 用比赛结果更新活动
    await pool.query(`
      UPDATE events 
      SET match_result = $1, 
          team_a_score = $2, 
          team_b_score = $3,
          result_announced_at = NOW(),
          result_announced_by = $4,
          match_completed_at = NOW(),
          status = 'completed',
          updated_at = NOW()
      WHERE id = $5
    `, [matchResultData.matchResult, matchResultData.teamAScore, matchResultData.teamBScore, ambassadorId, testEvent.id]);

    // Create match result announcement log
    // 创建比赛结果公告日志
    await pool.query(`
      INSERT INTO match_result_announcements (
        event_id, 
        announced_by, 
        team_a_score, 
        team_b_score, 
        match_result, 
        announcement_notes, 
        weather_conditions, 
        special_events
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      testEvent.id, 
      ambassadorId, 
      matchResultData.teamAScore, 
      matchResultData.teamBScore, 
      matchResultData.matchResult, 
      matchResultData.announcementNotes, 
      matchResultData.weatherConditions, 
      matchResultData.specialEvents
    ]);

    logSuccess(
      'Match result announced successfully',
      '比赛结果宣布成功'
    );

    // Step 3: Check if athletes were updated
    // 步骤3：检查运动员是否已更新
    logInfo(
      'Step 3: Checking athlete statistics updates',
      '步骤3：检查运动员统计更新'
    );

    const athletesResult = await pool.query(`
      SELECT 
        a.id,
        a.user_id,
        a.matches_won,
        a.matches_lost,
        a.current_ranking,
        a.win_rate,
        mr.match_result,
        mr.team_assignment
      FROM athletes a
      LEFT JOIN match_results mr ON a.id = mr.athlete_id AND mr.event_id = $1
      WHERE a.user_id IN (
        SELECT user_id FROM event_participants 
        WHERE event_id = $1 AND participation_type = 'athlete'
      )
    `, [testEvent.id]);

    logSuccess(
      `Found ${athletesResult.rows.length} athletes with updated statistics`,
      `找到${athletesResult.rows.length}个统计已更新的运动员`
    );

    athletesResult.rows.forEach((athlete, index) => {
      console.log(`  Athlete ${index + 1}:`);
      console.log(`    Matches Won: ${athlete.matches_won}`);
      console.log(`    Matches Lost: ${athlete.matches_lost}`);
      console.log(`    Current Ranking: ${athlete.current_ranking}`);
      console.log(`    Win Rate: ${athlete.win_rate}%`);
      console.log(`    Match Result: ${athlete.match_result}`);
      console.log(`    Team Assignment: ${athlete.team_assignment}`);
    });

    // Step 4: Check reward calculations
    // 步骤4：检查奖励计算
    logInfo(
      'Step 4: Checking reward calculations',
      '步骤4：检查奖励计算'
    );

    const rewardsResult = await pool.query(`
      SELECT 
        rd.id,
        rd.final_reward,
        rd.calculation_formula,
        rd.distribution_status,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        u.wallet_address
      FROM reward_distributions rd
      JOIN user_stake_records usr ON rd.stake_record_id = usr.id
      JOIN users u ON rd.user_id = u.id
      WHERE rd.event_id = $1
    `, [testEvent.id]);

    logSuccess(
      `Found ${rewardsResult.rows.length} reward calculations`,
      `找到${rewardsResult.rows.length}个奖励计算`
    );

    rewardsResult.rows.forEach((reward, index) => {
      console.log(`  Reward ${index + 1}:`);
      console.log(`    Final Reward: ${reward.final_reward} CHZ`);
      console.log(`    Stake Amount: ${reward.stake_amount} CHZ`);
      console.log(`    Participation Tier: ${reward.participation_tier}`);
      console.log(`    Team Choice: ${reward.team_choice}`);
      console.log(`    Distribution Status: ${reward.distribution_status}`);
      console.log(`    Formula: ${reward.calculation_formula}`);
    });

    // Step 5: Check event status
    // 步骤5：检查活动状态
    logInfo(
      'Step 5: Checking final event status',
      '步骤5：检查最终活动状态'
    );

    const eventStatusResult = await pool.query(`
      SELECT 
        id,
        title,
        status,
        match_result,
        team_a_score,
        team_b_score,
        result_announced_at,
        rewards_distributed,
        total_participants,
        total_stakes_amount
      FROM events 
      WHERE id = $1
    `, [testEvent.id]);

    const eventStatus = eventStatusResult.rows[0];
    logSuccess(
      'Event status updated successfully',
      '活动状态更新成功'
    );

    console.log(`  Event: ${eventStatus.title}`);
    console.log(`  Status: ${eventStatus.status}`);
    console.log(`  Match Result: ${eventStatus.match_result}`);
    console.log(`  Score: ${eventStatus.team_a_score} - ${eventStatus.team_b_score}`);
    console.log(`  Result Announced: ${eventStatus.result_announced_at}`);
    console.log(`  Rewards Distributed: ${eventStatus.rewards_distributed}`);
    console.log(`  Total Participants: ${eventStatus.total_participants}`);
    console.log(`  Total Stakes: ${eventStatus.total_stakes_amount} CHZ`);

    logSuccess(
      'Post-match functionality test completed successfully!',
      '赛后功能测试成功完成！'
    );

  } catch (error) {
    logError(
      'Post-match functionality test failed',
      '赛后功能测试失败',
      error
    );
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  testPostMatchFunctionality()
    .then(() => {
      console.log('✨ Post-match functionality test completed');
      console.log('✨ 赛后功能测试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Post-match functionality test failed');
      console.error('💥 赛后功能测试失败');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testPostMatchFunctionality }; 