const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function debugClaimableRewardsAPI() {
  try {
    console.log('🔍 详细调试claimable-rewards API...');
    console.log('🔍 Detailed debugging of claimable-rewards API...');

    const userId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    // Test each query step by step
    // 逐步测试每个查询

    console.log('\n1️⃣ 测试reward_calculations查询...');
    try {
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
      console.log(`✅ reward_calculations查询成功: ${rewardCalculationsResult.rows.length} 条记录`);
    } catch (error) {
      console.log(`❌ reward_calculations查询失败:`, error.message);
    }

    console.log('\n2️⃣ 测试reward_distributions查询...');
    try {
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
      console.log(`✅ reward_distributions查询成功: ${rewardDistributionsResult.rows.length} 条记录`);
    } catch (error) {
      console.log(`❌ reward_distributions查询失败:`, error.message);
    }

    console.log('\n3️⃣ 测试reward_calculations统计查询...');
    try {
      const rewardCalculationsStats = await pool.query(
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
      console.log(`✅ reward_calculations统计查询成功:`, rewardCalculationsStats.rows[0]);
    } catch (error) {
      console.log(`❌ reward_calculations统计查询失败:`, error.message);
    }

    console.log('\n4️⃣ 测试reward_distributions统计查询...');
    try {
      const rewardDistributionsStats = await pool.query(
        `SELECT 
          COUNT(*) as total_events_participated,
          SUM(rd.final_reward) as total_rewards_earned,
          SUM(usr.stake_amount) as total_stakes_placed,
          AVG(rd.final_reward) as average_reward_per_event
         FROM reward_distributions rd
         JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
         WHERE rd.user_id = $1`,
        [userId]
      );
      console.log(`✅ reward_distributions统计查询成功:`, rewardDistributionsStats.rows[0]);
    } catch (error) {
      console.log(`❌ reward_distributions统计查询失败:`, error.message);
    }

    console.log('\n5️⃣ 测试recent activity查询...');
    try {
      const recentActivityResult = await pool.query(
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
      console.log(`✅ recent activity查询成功: ${recentActivityResult.rows.length} 条记录`);
    } catch (error) {
      console.log(`❌ recent activity查询失败:`, error.message);
    }

    console.log('\n6️⃣ 测试featured championship查询...');
    try {
      const featuredChampionshipResult = await pool.query(
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
          rc.final_reward,
          rc.calculation_status as distribution_status
         FROM events e
         LEFT JOIN user_stake_records usr ON usr.event_id = e.id AND usr.user_id = $1
         LEFT JOIN reward_calculations rc ON rc.event_id = e.id AND rc.user_id = $1
         WHERE e.status = 'completed' AND e.rewards_distributed = true
         ORDER BY e.rewards_distributed_at DESC
         LIMIT 1`,
        [userId]
      );
      console.log(`✅ featured championship查询成功: ${featuredChampionshipResult.rows.length} 条记录`);
    } catch (error) {
      console.log(`❌ featured championship查询失败:`, error.message);
    }

  } catch (error) {
    console.error('❌ Error in debug:', error);
    console.error('❌ 调试时出错:', error);
  } finally {
    await pool.end();
  }
}

debugClaimableRewardsAPI(); 