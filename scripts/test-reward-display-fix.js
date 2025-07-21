// Test reward display fix
// 测试奖励显示修复

const { query } = require('../lib/database.js');

async function testRewardDisplayFix() {
  console.log('🧪 Testing Reward Display Fix...');
  console.log('🧪 测试奖励显示修复...');

  try {
    const userId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    // Test the fixed API query
    console.log('\n1️⃣ Testing fixed API query...');
    const fixedQuery = await query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.final_reward,
        rd.calculation_formula,
        rd.distribution_status,
        rd.created_at as calculated_at,
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
        usr.stake_time
       FROM reward_distributions rd
       JOIN events e ON rd.event_id = e.id
       JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
       WHERE rd.user_id = $1
       ORDER BY rd.created_at DESC
    `, [userId]);

    console.log(`Fixed query result: ${fixedQuery.rows.length} records`);
    fixedQuery.rows.forEach((reward, index) => {
      console.log(`  ${index + 1}. Event: ${reward.event_title}, Reward: ${reward.final_reward} CHZ, Status: ${reward.distribution_status}`);
    });

    // Test the old broken query
    console.log('\n2️⃣ Testing old broken query...');
    const brokenQuery = await query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.final_reward,
        rd.calculation_formula,
        rd.distribution_status,
        rd.created_at as calculated_at,
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
        usr.stake_time
       FROM reward_distributions rd
       JOIN events e ON rd.event_id = e.id
       JOIN user_stake_records usr ON rd.stake_record_id = usr.id
       WHERE rd.user_id = $1
       ORDER BY rd.created_at DESC
    `, [userId]);

    console.log(`Broken query result: ${brokenQuery.rows.length} records`);

    // Compare results
    console.log('\n3️⃣ Comparison:');
    console.log(`Fixed query: ${fixedQuery.rows.length} records`);
    console.log(`Broken query: ${brokenQuery.rows.length} records`);
    
    if (fixedQuery.rows.length > brokenQuery.rows.length) {
      console.log('✅ Fix successful! API will now return reward data');
      console.log('✅ 修复成功！API现在将返回奖励数据');
    } else {
      console.log('❌ Fix did not work as expected');
      console.log('❌ 修复未按预期工作');
    }

    // Test the complete API response structure
    console.log('\n4️⃣ Testing complete API response...');
    
    // Simulate the API response processing
    const claimableCount = fixedQuery.rows.length;
    const totalRewards = fixedQuery.rows.reduce((sum, reward) => sum + parseFloat(reward.final_reward), 0);
    const recentReward = fixedQuery.rows.length > 0 ? {
      amount: fixedQuery.rows[0].final_reward,
      distributionStatus: fixedQuery.rows[0].distribution_status
    } : null;

    console.log(`Processed data for frontend:`);
    console.log(`- claimableCount: ${claimableCount}`);
    console.log(`- totalRewards: ${totalRewards} CHZ`);
    console.log(`- recentReward: ${recentReward ? `${recentReward.amount} CHZ` : 'null'}`);
    console.log(`- hasRewards: ${claimableCount > 0 || totalRewards > 0}`);

    // Check if the component should now display
    console.log('\n5️⃣ Component display check:');
    if (claimableCount > 0 || totalRewards > 0) {
      console.log('✅ Component should now display rewards!');
      console.log('✅ 组件现在应该显示奖励！');
      console.log('The reward overview panel should show:');
      console.log('奖励概览板块应该显示:');
      console.log(`- Recent reward: ${recentReward ? `${recentReward.amount} CHZ` : '0 CHZ'}`);
      console.log(`- Claimable count: ${claimableCount}`);
      console.log(`- Total rewards: ${totalRewards.toFixed(2)} CHZ`);
    } else {
      console.log('❌ Component will still not display');
      console.log('❌ 组件仍然不会显示');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error('❌ 测试错误:', error.message);
  }
}

// Run the test
testRewardDisplayFix().then(() => {
  console.log('\n✅ Reward display fix test completed!');
  console.log('✅ 奖励显示修复测试完成！');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  console.error('❌ 测试失败:', error);
  process.exit(1);
}); 