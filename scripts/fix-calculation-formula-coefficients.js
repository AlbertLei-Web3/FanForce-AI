const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function fixCalculationFormulaCoefficients() {
  try {
    console.log('🔧 修复计算公式中的系数...');
    console.log('🔧 Fixing coefficients in calculation formula...');

    // Get all reward distributions with user participation tier
    // 获取所有奖励分配记录及用户参与档位
    const rewardDistributions = await pool.query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.admin_pool_amount,
        rd.final_reward,
        rd.calculation_formula,
        rd.user_tier_coefficient,
        e.title as event_title,
        usr.participation_tier,
        usr.stake_amount,
        usr.user_id
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
      JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
    `);

    console.log(`📊 找到 ${rewardDistributions.rows.length} 条记录需要检查`);
    console.log(`📊 Found ${rewardDistributions.rows.length} records to check`);

    for (const record of rewardDistributions.rows) {
      console.log(`\n📝 检查记录 ID: ${record.id}`);
      console.log(`📝 Checking record ID: ${record.id}`);
      console.log(`  - 事件: ${record.event_title}`);
      console.log(`  - Event: ${record.event_title}`);
      console.log(`  - 用户参与档位: ${record.participation_tier}`);
      console.log(`  - User Participation Tier: ${record.participation_tier}`);
      console.log(`  - 当前存储的系数: ${record.user_tier_coefficient}`);
      console.log(`  - Current Stored Coefficient: ${record.user_tier_coefficient}`);
      
      // Get correct tier coefficient based on participation_tier
      // 根据participation_tier获取正确的系数
      let correctCoefficient;
      let tierName;
      switch (record.participation_tier) {
        case 1:
          correctCoefficient = 1.0;
          tierName = 'Full Experience';
          break;
        case 2:
          correctCoefficient = 0.7;
          tierName = 'Stake+Match';
          break;
        case 3:
          correctCoefficient = 0.3;
          tierName = 'Stake Only';
          break;
        default:
          correctCoefficient = 0.3;
          tierName = 'Stake Only (Default)';
      }
      
      console.log(`  - 正确系数: ${correctCoefficient} (${tierName})`);
      console.log(`  - Correct Coefficient: ${correctCoefficient} (${tierName})`);
      
      if (record.user_tier_coefficient !== correctCoefficient) {
        console.log(`  ❌ 系数不匹配！需要修复`);
        console.log(`  ❌ Coefficient mismatch! Need to fix`);
        
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
        
        // Platform fee percentage (assuming 5%)
        // 平台手续费百分比（假设5%）
        const platformFeePercentage = 5;
        
        // Recalculate base reward with correct coefficient
        // 用正确系数重新计算基础奖励
        const baseReward = record.admin_pool_amount * userRatio * correctCoefficient;
        
        // Recalculate final reward after platform fee
        // 重新计算扣除平台手续费后的最终奖励
        const finalReward = baseReward * (1 - platformFeePercentage / 100);
        
        // Generate correct formula string with correct coefficient
        // 用正确系数生成正确的公式字符串
        const correctFormula = `流动性挖矿奖励 = (${record.admin_pool_amount} × ${(userRatio * 100).toFixed(2)}% × ${correctCoefficient}) × (1 - ${platformFeePercentage}%) = ${finalReward.toFixed(2)} CHZ`;
        
        console.log(`  - 用户质押: ${userStake} CHZ`);
        console.log(`  - User Stake: ${userStake} CHZ`);
        console.log(`  - 总质押: ${totalStake} CHZ`);
        console.log(`  - Total Stake: ${totalStake} CHZ`);
        console.log(`  - 用户占比: ${(userRatio * 100).toFixed(2)}%`);
        console.log(`  - User Ratio: ${(userRatio * 100).toFixed(2)}%`);
        console.log(`  - 新基础奖励: ${baseReward.toFixed(2)}`);
        console.log(`  - New Base Reward: ${baseReward.toFixed(2)}`);
        console.log(`  - 新最终奖励: ${finalReward.toFixed(2)}`);
        console.log(`  - New Final Reward: ${finalReward.toFixed(2)}`);
        console.log(`  - 新计算公式: ${correctFormula}`);
        console.log(`  - New Calculation Formula: ${correctFormula}`);
        
        // Update the record with correct coefficient and recalculated values
        // 用正确系数和重新计算的值更新记录
        await pool.query(`
          UPDATE reward_distributions 
          SET 
            user_tier_coefficient = $1,
            base_reward = $2,
            final_reward = $3,
            calculation_formula = $4,
            updated_at = NOW()
          WHERE id = $5
        `, [
          correctCoefficient,
          baseReward.toFixed(2),
          finalReward.toFixed(2),
          correctFormula,
          record.id
        ]);
        
        console.log(`  ✅ 记录已修复`);
        console.log(`  ✅ Record fixed`);
      } else {
        console.log(`  ✅ 系数匹配，无需修复`);
        console.log(`  ✅ Coefficient matches, no fix needed`);
      }
    }

    console.log('\n🎉 所有计算公式系数修复完成！');
    console.log('🎉 All calculation formula coefficients fixed successfully!');

  } catch (error) {
    console.error('❌ Error fixing calculation formula coefficients:', error);
    console.error('❌ 修复计算公式系数时出错:', error);
  } finally {
    await pool.end();
  }
}

fixCalculationFormulaCoefficients(); 