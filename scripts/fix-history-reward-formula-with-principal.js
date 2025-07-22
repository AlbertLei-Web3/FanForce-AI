const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function fixHistoryRewardFormulaWithPrincipal() {
  try {
    console.log('🔧 批量修复历史奖励数据，采用新公式...');
    console.log('🔧 Batch fixing historical reward data with new formula...');

    // 查询所有reward_distributions及相关stake数据
    // Query all reward_distributions and related stake data
    const rewards = await pool.query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.user_id,
        rd.admin_pool_amount,
        rd.user_tier_coefficient,
        rd.platform_fee_percentage,
        usr.stake_amount,
        usr.participation_tier
      FROM reward_distributions rd
      JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
    `);

    for (const record of rewards.rows) {
      // 获取总质押
      // Get total stake for this event
      const totalStakeResult = await pool.query(`
        SELECT SUM(stake_amount::numeric) as total_stake
        FROM user_stake_records WHERE event_id = $1
      `, [record.event_id]);
      const totalStake = parseFloat(totalStakeResult.rows[0].total_stake);
      const principal = parseFloat(record.stake_amount);
      const userRatio = principal / totalStake;
      const tierCoefficient = parseFloat(record.user_tier_coefficient);
      const adminPoolAmount = parseFloat(record.admin_pool_amount);
      const platformFeePercentage = parseFloat(record.platform_fee_percentage);
      // 新公式
      // New formula
      const baseReward = adminPoolAmount * userRatio * tierCoefficient;
      const finalReward = (baseReward + principal) * (1 - platformFeePercentage / 100);
      const platformFeeAmount = (baseReward + principal) * (platformFeePercentage / 100);
      const calculationFormula = `流动性挖矿奖励 = (${adminPoolAmount} × ${(userRatio * 100).toFixed(2)}% × ${tierCoefficient} + ${principal}) × (1 - ${platformFeePercentage}%) = ${finalReward.toFixed(2)} CHZ`;
      // 更新数据库
      // Update database
      await pool.query(`
        UPDATE reward_distributions SET 
          base_reward = $1,
          final_reward = $2,
          platform_fee_amount = $3,
          calculation_formula = $4,
          updated_at = NOW()
        WHERE id = $5
      `, [
        baseReward.toFixed(2),
        finalReward.toFixed(2),
        platformFeeAmount.toFixed(2),
        calculationFormula,
        record.id
      ]);
      console.log(`✅ 已修复记录ID: ${record.id}`);
    }
    console.log('🎉 历史奖励数据批量修复完成！');
    console.log('🎉 Batch fix of historical reward data completed!');
  } catch (error) {
    console.error('❌ 修复历史奖励数据出错:', error);
    console.error('❌ Error fixing historical reward data:', error);
  } finally {
    await pool.end();
  }
}

fixHistoryRewardFormulaWithPrincipal(); 