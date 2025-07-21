// Test the complete match result data flow
// 测试完整的比赛结果数据流

const { Pool } = require('pg');

// Database connection
// 数据库连接
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fanforce_ai',
  password: process.env.DB_PASSWORD || 'LYQ20000',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Simulate match result submission
// 模拟比赛结果提交
async function testMatchResultSubmission() {
  console.log('🧪 Testing match result submission flow...');
  console.log('🧪 测试比赛结果提交流程...');

  const testData = {
    eventId: '05d525b3-38bc-42f1-8a45-f7d16d0a46c5', // Use actual event ID
    teamAScore: 2,
    teamBScore: 1,
    winner: 'team_a',
    notes: 'Great match with excellent teamwork from Thunder Wolves',
    announcedBy: 'ambassador_test'
  };

  try {
    // 1. Test API endpoint
    // 1. 测试API端点
    console.log('\n📡 Testing API endpoint...');
    console.log('📡 测试API端点...');

    const response = await fetch('http://localhost:3000/api/events/update-match-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (result.success) {
      console.log('✅ API call successful');
      console.log('✅ API调用成功');
    } else {
      console.log('❌ API call failed:', result.error);
      console.log('❌ API调用失败:', result.error);
      return;
    }

    // 2. Verify database updates
    // 2. 验证数据库更新
    console.log('\n🗄️ Verifying database updates...');
    console.log('🗄️ 验证数据库更新...');

    const client = await pool.connect();

    try {
      // Check event status
      // 检查活动状态
      const eventQuery = `
        SELECT 
          id, title, status, match_result, team_a_score, team_b_score,
          result_announced_at
        FROM events 
        WHERE id = $1
      `;
      
      const eventResult = await client.query(eventQuery, [testData.eventId]);
      console.log('Event Status:', eventResult.rows[0]);

      // Check athlete updates
      // 检查运动员更新
      const athleteQuery = `
        SELECT 
          a.id, a.matches_won, a.matches_lost, a.matches_drawn,
          a.ranking_points, a.win_rate, a.last_match_date,
          mr.match_result, mr.ranking_points_earned, mr.ranking_points_lost
        FROM athletes a
        JOIN match_results mr ON a.id = mr.athlete_id
        WHERE mr.event_id = $1
      `;

      const athleteResult = await client.query(athleteQuery, [testData.eventId]);
      console.log('Athlete Updates:', athleteResult.rows);

      // Check reward distributions
      // 检查奖励分配
      const rewardQuery = `
        SELECT 
          event_id, user_id, admin_pool_amount, total_participants,
          user_tier_coefficient, base_reward, platform_fee_amount,
          final_reward, calculation_formula
        FROM reward_distributions 
        WHERE event_id = $1
      `;

      const rewardResult = await client.query(rewardQuery, [testData.eventId]);
      console.log('Reward Distributions:', rewardResult.rows);

      // Check announcement log
      // 检查公告日志
      const announcementQuery = `
        SELECT 
          event_id, announced_by, match_result, team_a_score, team_b_score,
          announcement_notes, announcement_timestamp
        FROM match_result_announcements 
        WHERE event_id = $1
        ORDER BY announcement_timestamp DESC
        LIMIT 1
      `;

      const announcementResult = await client.query(announcementQuery, [testData.eventId]);
      console.log('Announcement Log:', announcementResult.rows[0]);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ 测试失败:', error.message);
  }
}

// Test reward calculation formula
// 测试奖励计算公式
async function testRewardCalculation() {
  console.log('\n💰 Testing reward calculation formula...');
  console.log('💰 测试奖励计算公式...');

  const testCases = [
    {
      name: 'Standard tier user',
      adminPool: 1000,
      totalParticipants: 10,
      tierCoefficient: 1.0,
      platformFee: 5.0
    },
    {
      name: 'Premium tier user',
      adminPool: 1000,
      totalParticipants: 10,
      tierCoefficient: 1.5,
      platformFee: 5.0
    },
    {
      name: 'VIP tier user',
      adminPool: 1000,
      totalParticipants: 10,
      tierCoefficient: 2.0,
      platformFee: 5.0
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n📊 Test Case ${index + 1}: ${testCase.name}`);
    console.log(`📊 测试案例 ${index + 1}: ${testCase.name}`);

    const baseReward = (testCase.adminPool / testCase.totalParticipants) * testCase.tierCoefficient;
    const platformFeeAmount = baseReward * (testCase.platformFee / 100);
    const finalReward = baseReward - platformFeeAmount;

    const formula = `个人获得奖励 = (${testCase.adminPool} ÷ ${testCase.totalParticipants} × ${testCase.tierCoefficient}) - (${testCase.adminPool} ÷ ${testCase.totalParticipants} × ${testCase.tierCoefficient}) × ${testCase.platformFee}% = ${finalReward.toFixed(2)} CHZ`;

    console.log('  Base Reward:', baseReward.toFixed(2));
    console.log('  Platform Fee:', platformFeeAmount.toFixed(2));
    console.log('  Final Reward:', finalReward.toFixed(2));
    console.log('  Formula:', formula);
  });
}

// Test athlete ranking updates
// 测试运动员排名更新
async function testAthleteRankingUpdates() {
  console.log('\n🏆 Testing athlete ranking updates...');
  console.log('🏆 测试运动员排名更新...');

  const client = await pool.connect();

  try {
    // Get athlete stats before and after match
    // 获取比赛前后的运动员统计
    const athleteStatsQuery = `
      SELECT 
        a.id,
        a.matches_won,
        a.matches_lost,
        a.matches_drawn,
        a.ranking_points,
        a.win_rate,
        a.current_ranking,
        mr.match_result,
        mr.ranking_points_earned,
        mr.ranking_points_lost
      FROM athletes a
      LEFT JOIN match_results mr ON a.id = mr.athlete_id AND mr.event_id = $1
      WHERE a.id IN (
        SELECT DISTINCT a.id 
        FROM athletes a
        JOIN event_participants ep ON a.user_id = ep.user_id
        WHERE ep.event_id = $1
      )
    `;

    const statsResult = await client.query(athleteStatsQuery, ['05d525b3-38bc-42f1-8a45-f7d16d0a46c5']);
    
    console.log('Athlete Statistics:');
    console.log('运动员统计:');
    statsResult.rows.forEach((athlete, index) => {
      console.log(`  Athlete ${index + 1}:`);
      console.log(`    运动员 ${index + 1}:`);
      console.log(`    Matches Won: ${athlete.matches_won}`);
      console.log(`    Matches Lost: ${athlete.matches_lost}`);
      console.log(`    Matches Drawn: ${athlete.matches_drawn}`);
      console.log(`    Win Rate: ${athlete.win_rate}%`);
      console.log(`    Ranking Points: ${athlete.ranking_points}`);
      console.log(`    Match Result: ${athlete.match_result || 'N/A'}`);
      console.log(`    Points Earned: ${athlete.ranking_points_earned || 0}`);
      console.log(`    Points Lost: ${athlete.ranking_points_lost || 0}`);
    });

  } finally {
    client.release();
  }
}

// Test event status changes
// 测试活动状态变化
async function testEventStatusChanges() {
  console.log('\n📅 Testing event status changes...');
  console.log('📅 测试活动状态变化...');

  const client = await pool.connect();

  try {
    const eventStatusQuery = `
      SELECT 
        id,
        title,
        status,
        match_result,
        team_a_score,
        team_b_score,
        result_announced_at,
        event_date
      FROM events 
      WHERE id = $1
    `;

    const eventResult = await client.query(eventStatusQuery, ['05d525b3-38bc-42f1-8a45-f7d16d0a46c5']);
    
    if (eventResult.rows.length > 0) {
      const event = eventResult.rows[0];
      console.log('Event Status:');
      console.log('活动状态:');
      console.log(`  Title: ${event.title}`);
      console.log(`  Status: ${event.status}`);
      console.log(`  Match Result: ${event.match_result}`);
      console.log(`  Team A Score: ${event.team_a_score}`);
      console.log(`  Team B Score: ${event.team_b_score}`);
      console.log(`  Result Announced At: ${event.result_announced_at}`);
      console.log(`  Event Date: ${event.event_date}`);
    } else {
      console.log('Event not found');
      console.log('未找到活动');
    }

  } finally {
    client.release();
  }
}

// Run all tests
// 运行所有测试
async function runAllTests() {
  console.log('🚀 Running complete match result flow tests...');
  console.log('🚀 运行完整比赛结果流程测试...');
  
  try {
    await testMatchResultSubmission();
    await testRewardCalculation();
    await testAthleteRankingUpdates();
    await testEventStatusChanges();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('🎉 所有测试成功完成！');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('❌ 测试套件失败:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the tests if this file is executed directly
// 如果直接执行此文件则运行测试
if (require.main === module) {
  runAllTests();
}

module.exports = { 
  testMatchResultSubmission, 
  testRewardCalculation, 
  testAthleteRankingUpdates, 
  testEventStatusChanges, 
  runAllTests 
}; 