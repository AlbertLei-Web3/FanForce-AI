const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function testClaimableRewardsAPI() {
  try {
    console.log('🧪 测试claimable-rewards API...');
    console.log('🧪 Testing claimable-rewards API...');

    const userId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    // Test the exact query from the API
    // 测试API中的确切查询
    console.log('\n1️⃣ 测试reward_calculations查询...');
    const rewardCalculationsResult = await pool.query(
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

    console.log(`reward_calculations结果: ${rewardCalculationsResult.rows.length} 条记录`);
    if (rewardCalculationsResult.rows.length > 0) {
      console.log('第一条记录:', rewardCalculationsResult.rows[0]);
    }

    // Test fallback query
    // 测试回退查询
    console.log('\n2️⃣ 测试reward_distributions回退查询...');
    const rewardDistributionsResult = await pool.query(
      `SELECT 
        rd.id,
        rd.event_id,
        rd.final_reward,
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
        usr.stake_time,
        rd.calculation_formula
       FROM reward_distributions rd
       JOIN events e ON rd.event_id = e.id
       JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
       WHERE rd.user_id = $1
       ORDER BY rd.created_at DESC`,
      [userId]
    );

    console.log(`reward_distributions结果: ${rewardDistributionsResult.rows.length} 条记录`);
    if (rewardDistributionsResult.rows.length > 0) {
      console.log('第一条记录:', rewardDistributionsResult.rows[0]);
    }

    // Test stats query
    // 测试统计查询
    console.log('\n3️⃣ 测试统计查询...');
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_events_participated,
        SUM(rd.final_reward) as total_rewards_earned,
        SUM(usr.stake_amount) as total_stakes_placed,
        AVG(rd.final_reward) as average_reward_per_event
       FROM reward_distributions rd
       JOIN user_stake_records usr ON rd.stake_record_id = usr.id
       WHERE rd.user_id = $1`,
      [userId]
    );

    console.log('统计结果:', statsResult.rows[0]);

  } catch (error) {
    console.error('❌ Error testing claimable-rewards API:', error);
    console.error('❌ 测试claimable-rewards API时出错:', error);
  } finally {
    await pool.end();
  }
}

testClaimableRewardsAPI(); 