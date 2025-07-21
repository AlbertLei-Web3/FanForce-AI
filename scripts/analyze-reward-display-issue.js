// Analyze reward display issue on audience page
// 分析观众页面奖励显示问题

const { query } = require('../lib/database.js');

async function analyzeRewardDisplayIssue() {
  console.log('🔍 Analyzing Reward Display Issue...');
  console.log('🔍 分析奖励显示问题...');

  try {
    const userId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    // 1. Check API response structure
    console.log('\n1️⃣ Checking API response structure...');
    const apiResponse = await query(`
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

    console.log(`Found ${apiResponse.rows.length} reward records in API query`);
    apiResponse.rows.forEach((reward, index) => {
      console.log(`  ${index + 1}. Event: ${reward.event_title}, Reward: ${reward.final_reward} CHZ, Status: ${reward.distribution_status}`);
    });

    // 2. Check featured championship data
    console.log('\n2️⃣ Checking featured championship data...');
    const featuredChamp = await query(`
      SELECT 
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
       LEFT JOIN reward_distributions rd ON rd.event_id = e.id AND rd.user_id = $1
       WHERE e.status = 'completed' AND e.rewards_distributed = true
       ORDER BY e.rewards_distributed_at DESC
       LIMIT 1
    `, [userId]);

    if (featuredChamp.rows.length > 0) {
      const champ = featuredChamp.rows[0];
      console.log(`Featured championship: ${champ.title}`);
      console.log(`User stake: ${champ.stake_amount} CHZ`);
      console.log(`User reward: ${champ.final_reward} CHZ`);
      console.log(`Distribution status: ${champ.distribution_status}`);
    } else {
      console.log('No featured championship found');
    }

    // 3. Check user stats
    console.log('\n3️⃣ Checking user stats...');
    const userStats = await query(`
      SELECT 
        COUNT(*) as total_events_participated,
        SUM(rd.final_reward) as total_rewards_earned,
        SUM(usr.stake_amount) as total_stakes_placed,
        AVG(rd.final_reward) as average_reward_per_event
       FROM reward_distributions rd
       JOIN user_stake_records usr ON rd.stake_record_id = usr.id
       WHERE rd.user_id = $1
    `, [userId]);

    const stats = userStats.rows[0];
    console.log(`Total events participated: ${stats.total_events_participated}`);
    console.log(`Total rewards earned: ${stats.total_rewards_earned} CHZ`);
    console.log(`Total stakes placed: ${stats.total_stakes_placed} CHZ`);
    console.log(`Average reward per event: ${stats.average_reward_per_event} CHZ`);

    // 4. Check frontend data processing
    console.log('\n4️⃣ Analyzing frontend data processing...');
    console.log('Frontend processes quickRewardOverview with:');
    console.log('- claimableCount: number of claimable rewards');
    console.log('- totalRewards: total_rewards_earned from userStats');
    console.log('- recentReward: userReward from featuredChampionship');
    console.log('- hasRewards: claimableCount > 0 || totalRewards > 0');

    // 5. Check if the issue is in data processing
    console.log('\n5️⃣ Checking data processing logic...');
    const claimableCount = apiResponse.rows.length;
    const totalRewards = parseFloat(stats.total_rewards_earned) || 0;
    const recentReward = featuredChamp.rows.length > 0 ? {
      amount: featuredChamp.rows[0].final_reward,
      distributionStatus: featuredChamp.rows[0].distribution_status
    } : null;

    console.log(`Processed data:`);
    console.log(`- claimableCount: ${claimableCount}`);
    console.log(`- totalRewards: ${totalRewards} CHZ`);
    console.log(`- recentReward: ${recentReward ? `${recentReward.amount} CHZ` : 'null'}`);
    console.log(`- hasRewards: ${claimableCount > 0 || totalRewards > 0}`);

    // 6. Check if the component should render
    console.log('\n6️⃣ Checking component rendering conditions...');
    console.log('Component renders if:');
    console.log('- !rewardsLoading: true');
    console.log('- quickRewardOverview exists: true');
    console.log('- hasRewards: true (if data exists)');

    // 7. Check for potential issues
    console.log('\n7️⃣ Potential issues analysis:');
    
    if (claimableCount === 0) {
      console.log('⚠️ Issue: No claimable rewards found');
      console.log('⚠️ 问题：未找到可领取奖励');
    }
    
    if (totalRewards === 0) {
      console.log('⚠️ Issue: Total rewards is 0');
      console.log('⚠️ 问题：总奖励为0');
    }
    
    if (!recentReward) {
      console.log('⚠️ Issue: No recent reward data');
      console.log('⚠️ 问题：没有最近奖励数据');
    }

    // 8. Check if the component is actually being called
    console.log('\n8️⃣ Component rendering check:');
    console.log('The renderQuickRewardOverview() function is called in JSX');
    console.log('It should display the reward panel if data exists');
    console.log('Check browser console for any JavaScript errors');

    // 9. Summary
    console.log('\n9️⃣ Summary:');
    if (claimableCount > 0 || totalRewards > 0) {
      console.log('✅ Data exists - Component should display rewards');
      console.log('✅ 数据存在 - 组件应该显示奖励');
      console.log('If not displaying, check:');
      console.log('1. Browser console for JavaScript errors');
      console.log('2. Network tab for API response');
      console.log('3. React DevTools for component state');
    } else {
      console.log('⚠️ No reward data found - Component will not display');
      console.log('⚠️ 未找到奖励数据 - 组件不会显示');
      console.log('This could be because:');
      console.log('1. User has no stakes in completed events');
      console.log('2. Rewards not calculated for user stakes');
      console.log('3. API query not returning expected data');
    }

  } catch (error) {
    console.error('❌ Analysis error:', error.message);
    console.error('❌ 分析错误:', error.message);
  }
}

// Run the analysis
analyzeRewardDisplayIssue().then(() => {
  console.log('\n✅ Analysis completed!');
  console.log('✅ 分析完成！');
  process.exit(0);
}).catch(error => {
  console.error('❌ Analysis failed:', error);
  console.error('❌ 分析失败:', error);
  process.exit(1);
}); 