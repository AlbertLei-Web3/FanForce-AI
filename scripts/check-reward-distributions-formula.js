const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function checkRewardDistributionsFormula() {
  try {
    console.log('🔍 检查reward_distributions表的calculation_formula字段...');
    console.log('🔍 Checking calculation_formula field in reward_distributions table...');

    // Get sample data from reward_distributions
    // 从reward_distributions获取样本数据
    const rewardDistributions = await pool.query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.user_id,
        rd.admin_pool_amount,
        rd.base_reward,
        rd.final_reward,
        rd.calculation_formula,
        rd.distribution_status,
        e.title as event_title,
        e.pool_injected_chz,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
      JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
      LIMIT 5
    `);

    console.log('\n📋 reward_distributions表数据:');
    console.log('📋 reward_distributions table data:');
    rewardDistributions.rows.forEach((record, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`Record ${index + 1}:`);
      console.log(`  - Event: ${record.event_title}`);
      console.log(`  - Admin Pool Amount: ${record.admin_pool_amount}`);
      console.log(`  - Base Reward: ${record.base_reward}`);
      console.log(`  - Final Reward: ${record.final_reward}`);
      console.log(`  - Stake Amount: ${record.stake_amount}`);
      console.log(`  - Participation Tier: ${record.participation_tier}`);
      console.log(`  - Team Choice: ${record.team_choice}`);
      console.log(`  - Calculation Formula: ${record.calculation_formula}`);
    });

    // Check total stake for each event
    // 检查每个事件的总质押
    console.log('\n📊 检查事件总质押金额:');
    console.log('📊 Checking total stake amounts for events:');
    
    for (const record of rewardDistributions.rows) {
      const totalStakeResult = await pool.query(`
        SELECT SUM(stake_amount::numeric) as total_stake
        FROM user_stake_records 
        WHERE event_id = $1
      `, [record.event_id]);
      
      const totalStake = totalStakeResult.rows[0].total_stake;
      const userStake = parseFloat(record.stake_amount);
      const userRatio = (userStake / totalStake) * 100;
      
      console.log(`\n事件: ${record.event_title}`);
      console.log(`Event: ${record.event_title}`);
      console.log(`  - 用户质押: ${userStake} CHZ`);
      console.log(`  - User Stake: ${userStake} CHZ`);
      console.log(`  - 总质押: ${totalStake} CHZ`);
      console.log(`  - Total Stake: ${totalStake} CHZ`);
      console.log(`  - 用户占比: ${userRatio.toFixed(2)}%`);
      console.log(`  - User Ratio: ${userRatio.toFixed(2)}%`);
    }

    // Calculate correct formula based on new requirements
    // 根据新要求计算正确的公式
    console.log('\n🧮 根据新要求计算正确公式:');
    console.log('🧮 Calculate correct formula based on new requirements:');
    
    for (const record of rewardDistributions.rows) {
      const totalStakeResult = await pool.query(`
        SELECT SUM(stake_amount::numeric) as total_stake
        FROM user_stake_records 
        WHERE event_id = $1
      `, [record.event_id]);
      
      const totalStake = totalStakeResult.rows[0].total_stake;
      const userStake = parseFloat(record.stake_amount);
      const userRatio = userStake / totalStake;
      
      // Get tier coefficient based on participation_tier
      // 根据participation_tier获取系数
      let tierCoefficient;
      switch (record.participation_tier) {
        case 1: // Full Experience
          tierCoefficient = 1.0;
          break;
        case 2: // Stake+Match
          tierCoefficient = 0.7;
          break;
        case 3: // Stake only
          tierCoefficient = 0.3;
          break;
        default:
          tierCoefficient = 0.3;
      }
      
      // Platform fee percentage (assuming 5%)
      // 平台手续费百分比（假设5%）
      const platformFeePercentage = 5;
      
      // Calculate base reward
      // 计算基础奖励
      const baseReward = record.admin_pool_amount * userRatio * tierCoefficient;
      
      // Calculate final reward after platform fee
      // 计算扣除平台手续费后的最终奖励
      const finalReward = baseReward * (1 - platformFeePercentage / 100);
      
      // Generate correct formula string
      // 生成正确的公式字符串
      const correctFormula = `流动性挖矿奖励 = (${record.admin_pool_amount} × ${(userRatio * 100).toFixed(2)}% × ${tierCoefficient}) × (1 - ${platformFeePercentage}%) = ${finalReward.toFixed(2)} CHZ`;
      
      console.log(`\n事件: ${record.event_title}`);
      console.log(`Event: ${record.event_title}`);
      console.log(`  - 当前公式: ${record.calculation_formula}`);
      console.log(`  - Current Formula: ${record.calculation_formula}`);
      console.log(`  - 正确公式: ${correctFormula}`);
      console.log(`  - Correct Formula: ${correctFormula}`);
      console.log(`  - 当前奖励: ${record.final_reward}`);
      console.log(`  - Current Reward: ${record.final_reward}`);
      console.log(`  - 计算奖励: ${finalReward.toFixed(2)}`);
      console.log(`  - Calculated Reward: ${finalReward.toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Error checking reward distributions formula:', error);
    console.error('❌ 检查reward_distributions公式时出错:', error);
  } finally {
    await pool.end();
  }
}

checkRewardDistributionsFormula(); 