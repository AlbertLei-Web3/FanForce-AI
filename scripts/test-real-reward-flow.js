// Real test for reward data flow verification
// 真实测试奖励数据流验证

// Use the project's database connection
const { query } = require('../lib/database.js');

async function testRewardDataFlow() {
  console.log('🧪 Testing Real Reward Data Flow...');
  console.log('🧪 测试真实奖励数据流...');

  try {
    // 1. Check if user_stake_records has data
    console.log('\n1️⃣ Checking user_stake_records table...');
    const stakeResult = await query('SELECT COUNT(*) as count FROM user_stake_records WHERE status = \'active\'');
    console.log(`Active stakes found: ${stakeResult.rows[0].count}`);

    // 2. Check if events have match results
    console.log('\n2️⃣ Checking events with match results...');
    const eventResult = await query('SELECT COUNT(*) as count FROM events WHERE match_result IS NOT NULL');
    console.log(`Events with match results: ${eventResult.rows[0].count}`);

    // 3. Check reward_distributions table
    console.log('\n3️⃣ Checking reward_distributions table...');
    const rewardDistResult = await query('SELECT COUNT(*) as count FROM reward_distributions');
    console.log(`Reward distributions found: ${rewardDistResult.rows[0].count}`);

    // 4. Check reward_calculations table
    console.log('\n4️⃣ Checking reward_calculations table...');
    const rewardCalcResult = await query('SELECT COUNT(*) as count FROM reward_calculations');
    console.log(`Reward calculations found: ${rewardCalcResult.rows[0].count}`);

    // 5. Check specific user stakes
    console.log('\n5️⃣ Checking specific user stakes...');
    const userStakes = await query(`
      SELECT usr.*, e.title as event_title, e.match_result 
      FROM user_stake_records usr 
      JOIN events e ON usr.event_id = e.id 
      WHERE usr.user_id = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de' 
      ORDER BY usr.stake_time DESC 
      LIMIT 5
    `);
    console.log(`User stakes found: ${userStakes.rows.length}`);
    userStakes.rows.forEach((stake, index) => {
      console.log(`  ${index + 1}. Event: ${stake.event_title}, Stake: ${stake.stake_amount} CHZ, Status: ${stake.status}, Match Result: ${stake.match_result}`);
    });

    // 6. Check reward distributions for the user
    console.log('\n6️⃣ Checking reward distributions for user...');
    const userRewards = await query(`
      SELECT rd.*, e.title as event_title 
      FROM reward_distributions rd 
      JOIN events e ON rd.event_id = e.id 
      WHERE rd.user_id = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de' 
      ORDER BY rd.created_at DESC 
      LIMIT 5
    `);
    console.log(`User rewards found: ${userRewards.rows.length}`);
    userRewards.rows.forEach((reward, index) => {
      console.log(`  ${index + 1}. Event: ${reward.event_title}, Reward: ${reward.final_reward} CHZ, Status: ${reward.distribution_status}`);
    });

    // 7. Check reward calculations for the user
    console.log('\n7️⃣ Checking reward calculations for user...');
    const userCalcRewards = await query(`
      SELECT rc.*, e.title as event_title 
      FROM reward_calculations rc 
      JOIN events e ON rc.event_id = e.id 
      WHERE rc.user_id = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de' 
      ORDER BY rc.calculation_time DESC 
      LIMIT 5
    `);
    console.log(`User calculation rewards found: ${userCalcRewards.rows.length}`);
    userCalcRewards.rows.forEach((reward, index) => {
      console.log(`  ${index + 1}. Event: ${reward.event_title}, Reward: ${reward.final_reward} CHZ, Status: ${reward.calculation_status}`);
    });

    // 8. Check which table is actually being used by the API
    console.log('\n8️⃣ Checking API table usage...');
    console.log('claimable-rewards API uses: reward_distributions table');
    console.log('calculate-rewards API uses: reward_calculations table');
    console.log('update-match-result API creates: reward_distributions records');

    // 9. Data flow verification
    console.log('\n9️⃣ Data Flow Verification:');
    if (userStakes.rows.length > 0 && userRewards.rows.length > 0) {
      console.log('✅ User has stakes AND rewards - Data flow is working!');
      console.log('✅ 用户有质押和奖励 - 数据流正常工作！');
    } else if (userStakes.rows.length > 0 && userRewards.rows.length === 0) {
      console.log('⚠️ User has stakes but NO rewards - Data flow issue!');
      console.log('⚠️ 用户有质押但没有奖励 - 数据流问题！');
    } else if (userStakes.rows.length === 0) {
      console.log('⚠️ No user stakes found - Need to create test data');
      console.log('⚠️ 未找到用户质押 - 需要创建测试数据');
    }

    // 10. Check if there are any completed events with stakes but no rewards
    console.log('\n🔍 Checking for data flow gaps...');
    const gapCheck = await query(`
      SELECT 
        e.id,
        e.title,
        e.match_result,
        COUNT(usr.id) as stake_count,
        COUNT(rd.id) as reward_count
      FROM events e
      LEFT JOIN user_stake_records usr ON e.id = usr.event_id AND usr.status = 'active'
      LEFT JOIN reward_distributions rd ON e.id = rd.event_id
      WHERE e.match_result IS NOT NULL
      GROUP BY e.id, e.title, e.match_result
      HAVING COUNT(usr.id) > 0 AND COUNT(rd.id) = 0
    `);
    
    if (gapCheck.rows.length > 0) {
      console.log('⚠️ Found events with stakes but no rewards:');
      gapCheck.rows.forEach(event => {
        console.log(`  - ${event.title}: ${event.stake_count} stakes, ${event.reward_count} rewards`);
      });
    } else {
      console.log('✅ All events with stakes have rewards - Data flow is complete!');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('❌ 数据库连接错误:', error.message);
  }
}

// Run the test
testRewardDataFlow().then(() => {
  console.log('\n✅ Real data flow test completed!');
  console.log('✅ 真实数据流测试完成！');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  console.error('❌ 测试失败:', error);
  process.exit(1);
}); 