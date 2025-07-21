// Debug API query issue
// 调试API查询问题

const { query } = require('../lib/database.js');

async function debugApiQuery() {
  console.log('🔍 Debugging API Query Issue...');
  console.log('🔍 调试API查询问题...');

  try {
    const userId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    // 1. Check if reward_distributions table has data
    console.log('\n1️⃣ Checking reward_distributions table...');
    const allRewards = await query('SELECT COUNT(*) as count FROM reward_distributions');
    console.log(`Total reward_distributions records: ${allRewards.rows[0].count}`);

    // 2. Check if user has any reward_distributions
    console.log('\n2️⃣ Checking user reward_distributions...');
    const userRewards = await query('SELECT COUNT(*) as count FROM reward_distributions WHERE user_id = $1', [userId]);
    console.log(`User reward_distributions records: ${userRewards.rows[0].count}`);

    // 3. Check the actual reward_distributions for the user
    console.log('\n3️⃣ Checking actual reward_distributions data...');
    const userRewardData = await query(`
      SELECT rd.*, e.title as event_title 
      FROM reward_distributions rd 
      JOIN events e ON rd.event_id = e.id 
      WHERE rd.user_id = $1
    `, [userId]);
    
    console.log(`Found ${userRewardData.rows.length} reward records for user`);
    userRewardData.rows.forEach((reward, index) => {
      console.log(`  ${index + 1}. Event: ${reward.event_title}, Reward: ${reward.final_reward} CHZ, Status: ${reward.distribution_status}`);
    });

    // 4. Check user_stake_records for the user
    console.log('\n4️⃣ Checking user_stake_records...');
    const userStakes = await query(`
      SELECT usr.*, e.title as event_title 
      FROM user_stake_records usr 
      JOIN events e ON usr.event_id = e.id 
      WHERE usr.user_id = $1
    `, [userId]);
    
    console.log(`Found ${userStakes.rows.length} stake records for user`);
    userStakes.rows.forEach((stake, index) => {
      console.log(`  ${index + 1}. Event: ${stake.event_title}, Stake: ${stake.stake_amount} CHZ, Status: ${stake.status}`);
    });

    // 5. Check the API query step by step
    console.log('\n5️⃣ Debugging API query step by step...');
    
    // Step 1: Check if reward_distributions has the user_id
    console.log('\nStep 1: Check reward_distributions user_id...');
    const step1 = await query('SELECT user_id FROM reward_distributions WHERE user_id = $1 LIMIT 1', [userId]);
    console.log(`User ID found in reward_distributions: ${step1.rows.length > 0}`);

    // Step 2: Check if events table has the events
    console.log('\nStep 2: Check events table...');
    const step2 = await query(`
      SELECT e.id, e.title 
      FROM events e 
      JOIN reward_distributions rd ON e.id = rd.event_id 
      WHERE rd.user_id = $1
    `, [userId]);
    console.log(`Events found: ${step2.rows.length}`);
    step2.rows.forEach(event => {
      console.log(`  - ${event.title}`);
    });

    // Step 3: Check if user_stake_records has the stake_record_id
    console.log('\nStep 3: Check user_stake_records stake_record_id...');
    const step3 = await query(`
      SELECT usr.id, usr.event_id, e.title 
      FROM user_stake_records usr 
      JOIN events e ON usr.event_id = e.id 
      WHERE usr.user_id = $1
    `, [userId]);
    console.log(`User stake records found: ${step3.rows.length}`);
    step3.rows.forEach(stake => {
      console.log(`  - Event: ${stake.title}, Stake ID: ${stake.id}`);
    });

    // Step 4: Check if the JOIN condition is the issue
    console.log('\nStep 4: Check JOIN condition...');
    const step4 = await query(`
      SELECT rd.id as reward_id, rd.stake_record_id, usr.id as stake_id, e.title
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
      JOIN user_stake_records usr ON rd.stake_record_id = usr.id
      WHERE rd.user_id = $1
    `, [userId]);
    console.log(`JOIN successful records: ${step4.rows.length}`);
    step4.rows.forEach(record => {
      console.log(`  - Event: ${record.title}, Reward ID: ${record.reward_id}, Stake ID: ${record.stake_id}`);
    });

    // 6. Check if the issue is with the stake_record_id relationship
    console.log('\n6️⃣ Checking stake_record_id relationship...');
    const step6 = await query(`
      SELECT 
        rd.id as reward_id,
        rd.stake_record_id,
        rd.user_id as reward_user_id,
        usr.id as stake_id,
        usr.user_id as stake_user_id,
        e.title
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
      LEFT JOIN user_stake_records usr ON rd.stake_record_id = usr.id
      WHERE rd.user_id = $1
    `, [userId]);
    
    console.log(`Records with stake_record_id relationship:`);
    step6.rows.forEach(record => {
      console.log(`  - Event: ${record.title}`);
      console.log(`    Reward ID: ${record.reward_id}, User: ${record.reward_user_id}`);
      console.log(`    Stake ID: ${record.stake_id}, User: ${record.stake_user_id}`);
      console.log(`    Stake Record ID in reward: ${record.stake_record_id}`);
    });

    // 7. Check if the API query is using the wrong JOIN
    console.log('\n7️⃣ Comparing API query with working query...');
    console.log('API query uses: JOIN user_stake_records usr ON rd.stake_record_id = usr.id');
    console.log('But maybe it should be: JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id');

    // 8. Test the alternative JOIN
    console.log('\n8️⃣ Testing alternative JOIN...');
    const step8 = await query(`
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
    
    console.log(`Alternative JOIN result: ${step8.rows.length} records`);
    step8.rows.forEach((reward, index) => {
      console.log(`  ${index + 1}. Event: ${reward.event_title}, Reward: ${reward.final_reward} CHZ, Status: ${reward.distribution_status}`);
    });

  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('❌ 调试错误:', error.message);
  }
}

// Run the debug
debugApiQuery().then(() => {
  console.log('\n✅ Debug completed!');
  console.log('✅ 调试完成！');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  console.error('❌ 调试失败:', error);
  process.exit(1);
}); 