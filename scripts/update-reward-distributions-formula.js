const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function updateRewardDistributionsFormula() {
  try {
    console.log('🔄 更新reward_distributions表的计算公式...');
    console.log('🔄 Updating calculation formula in reward_distributions table...');

    // Get all reward distributions
    // 获取所有奖励分配记录
    const rewardDistributions = await pool.query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.user_id,
        rd.admin_pool_amount,
        rd.base_reward,
        rd.final_reward,
        rd.calculation_formula,
        usr.stake_amount,
        usr.participation_tier
      FROM reward_distributions rd
      JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
    `);

    console.log(`📊 找到 ${rewardDistributions.rows.length} 条记录需要更新`);
    console.log(`📊 Found ${rewardDistributions.rows.length} records to update`);

    for (const record of rewardDistributions.rows) {
      // Get total stake for this event
      // 获取此事件的总质押
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
      
      console.log(`\n📝 更新记录 ID: ${record.id}`);
      console.log(`📝 Updating record ID: ${record.id}`);
      console.log(`  - 事件: ${record.event_id}`);
      console.log(`  - Event: ${record.event_id}`);
      console.log(`  - 用户质押: ${userStake} CHZ`);
      console.log(`  - User Stake: ${userStake} CHZ`);
      console.log(`  - 总质押: ${totalStake} CHZ`);
      console.log(`  - Total Stake: ${totalStake} CHZ`);
      console.log(`  - 用户占比: ${(userRatio * 100).toFixed(2)}%`);
      console.log(`  - User Ratio: ${(userRatio * 100).toFixed(2)}%`);
      console.log(`  - 参与档位: ${record.participation_tier} (系数: ${tierCoefficient})`);
      console.log(`  - Participation Tier: ${record.participation_tier} (Coefficient: ${tierCoefficient})`);
      console.log(`  - 旧基础奖励: ${record.base_reward}`);
      console.log(`  - Old Base Reward: ${record.base_reward}`);
      console.log(`  - 新基础奖励: ${baseReward.toFixed(2)}`);
      console.log(`  - New Base Reward: ${baseReward.toFixed(2)}`);
      console.log(`  - 旧最终奖励: ${record.final_reward}`);
      console.log(`  - Old Final Reward: ${record.final_reward}`);
      console.log(`  - 新最终奖励: ${finalReward.toFixed(2)}`);
      console.log(`  - New Final Reward: ${finalReward.toFixed(2)}`);
      
      // Update the record
      // 更新记录
      await pool.query(`
        UPDATE reward_distributions 
        SET 
          base_reward = $1,
          final_reward = $2,
          calculation_formula = $3,
          updated_at = NOW()
        WHERE id = $4
      `, [
        baseReward.toFixed(2),
        finalReward.toFixed(2),
        correctFormula,
        record.id
      ]);
      
      console.log(`  ✅ 记录已更新`);
      console.log(`  ✅ Record updated`);
    }

    console.log('\n🎉 所有记录更新完成！');
    console.log('🎉 All records updated successfully!');

  } catch (error) {
    console.error('❌ Error updating reward distributions formula:', error);
    console.error('❌ 更新reward_distributions公式时出错:', error);
  } finally {
    await pool.end();
  }
}

updateRewardDistributionsFormula(); 