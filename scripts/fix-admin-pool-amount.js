const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function fixAdminPoolAmount() {
  try {
    console.log('🔧 修复reward_distributions表的admin_pool_amount字段...');
    console.log('🔧 Fixing admin_pool_amount field in reward_distributions table...');

    // Get all reward distributions with their corresponding events
    // 获取所有奖励分配记录及其对应的事件
    const rewardDistributions = await pool.query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.admin_pool_amount as current_admin_pool,
        e.pool_injected_chz as event_pool_injected,
        e.title as event_title,
        rd.final_reward,
        rd.calculation_formula
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
    `);

    console.log(`📊 找到 ${rewardDistributions.rows.length} 条记录需要检查`);
    console.log(`📊 Found ${rewardDistributions.rows.length} records to check`);

    for (const record of rewardDistributions.rows) {
      console.log(`\n📝 检查记录 ID: ${record.id}`);
      console.log(`📝 Checking record ID: ${record.id}`);
      console.log(`  - 事件: ${record.event_title}`);
      console.log(`  - Event: ${record.event_title}`);
      console.log(`  - 当前admin_pool_amount: ${record.current_admin_pool}`);
      console.log(`  - Current admin_pool_amount: ${record.current_admin_pool}`);
      console.log(`  - events.pool_injected_chz: ${record.event_pool_injected}`);
      console.log(`  - events.pool_injected_chz: ${record.event_pool_injected}`);
      
      if (record.current_admin_pool !== record.event_pool_injected) {
        console.log(`  ❌ 数据不一致！需要修复`);
        console.log(`  ❌ Data inconsistent! Need to fix`);
        
        // Update the admin_pool_amount to match events.pool_injected_chz
        // 更新admin_pool_amount以匹配events.pool_injected_chz
        await pool.query(`
          UPDATE reward_distributions 
          SET 
            admin_pool_amount = $1,
            updated_at = NOW()
          WHERE id = $2
        `, [record.event_pool_injected, record.id]);
        
        console.log(`  ✅ 已更新admin_pool_amount为: ${record.event_pool_injected}`);
        console.log(`  ✅ Updated admin_pool_amount to: ${record.event_pool_injected}`);
      } else {
        console.log(`  ✅ 数据一致，无需修复`);
        console.log(`  ✅ Data consistent, no fix needed`);
      }
    }

    console.log('\n🎉 admin_pool_amount修复完成！');
    console.log('🎉 admin_pool_amount fix completed!');

    // Now we need to recalculate the rewards with the correct admin_pool_amount
    // 现在需要用正确的admin_pool_amount重新计算奖励
    console.log('\n🔄 重新计算奖励金额...');
    console.log('🔄 Recalculating reward amounts...');

    for (const record of rewardDistributions.rows) {
      // Get user stake data
      // 获取用户质押数据
      const userStakeResult = await pool.query(`
        SELECT 
          usr.stake_amount,
          usr.participation_tier
        FROM user_stake_records usr
        WHERE usr.event_id = $1 AND usr.user_id = (
          SELECT user_id FROM reward_distributions WHERE id = $2
        )
      `, [record.event_id, record.id]);

      if (userStakeResult.rows.length === 0) {
        console.log(`  ⚠️ 未找到用户质押记录，跳过记录 ${record.id}`);
        console.log(`  ⚠️ No user stake record found, skipping record ${record.id}`);
        continue;
      }

      const userStake = userStakeResult.rows[0];

      // Get total stake for this event
      // 获取此事件的总质押
      const totalStakeResult = await pool.query(`
        SELECT SUM(stake_amount::numeric) as total_stake
        FROM user_stake_records 
        WHERE event_id = $1
      `, [record.event_id]);
      
      const totalStake = totalStakeResult.rows[0].total_stake;
      const userStakeAmount = parseFloat(userStake.stake_amount);
      const userRatio = userStakeAmount / totalStake;
      
      // Get tier coefficient based on participation_tier
      // 根据participation_tier获取系数
      let tierCoefficient;
      switch (userStake.participation_tier) {
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
      const baseReward = record.event_pool_injected * userRatio * tierCoefficient;
      
      // Calculate final reward after platform fee
      // 计算扣除平台手续费后的最终奖励
      const finalReward = baseReward * (1 - platformFeePercentage / 100);
      
      // Generate correct formula string
      // 生成正确的公式字符串
      const correctFormula = `流动性挖矿奖励 = (${record.event_pool_injected} × ${(userRatio * 100).toFixed(2)}% × ${tierCoefficient}) × (1 - ${platformFeePercentage}%) = ${finalReward.toFixed(2)} CHZ`;
      
      console.log(`\n📝 重新计算记录 ID: ${record.id}`);
      console.log(`📝 Recalculating record ID: ${record.id}`);
      console.log(`  - 用户质押: ${userStakeAmount} CHZ`);
      console.log(`  - User Stake: ${userStakeAmount} CHZ`);
      console.log(`  - 总质押: ${totalStake} CHZ`);
      console.log(`  - Total Stake: ${totalStake} CHZ`);
      console.log(`  - 用户占比: ${(userRatio * 100).toFixed(2)}%`);
      console.log(`  - User Ratio: ${(userRatio * 100).toFixed(2)}%`);
      console.log(`  - 参与档位: ${userStake.participation_tier} (系数: ${tierCoefficient})`);
      console.log(`  - Participation Tier: ${userStake.participation_tier} (Coefficient: ${tierCoefficient})`);
      console.log(`  - 奖池金额: ${record.event_pool_injected} CHZ`);
      console.log(`  - Pool Amount: ${record.event_pool_injected} CHZ`);
      console.log(`  - 新基础奖励: ${baseReward.toFixed(2)}`);
      console.log(`  - New Base Reward: ${baseReward.toFixed(2)}`);
      console.log(`  - 新最终奖励: ${finalReward.toFixed(2)}`);
      console.log(`  - New Final Reward: ${finalReward.toFixed(2)}`);
      
      // Update the record with recalculated values
      // 用重新计算的值更新记录
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
      
      console.log(`  ✅ 记录已重新计算并更新`);
      console.log(`  ✅ Record recalculated and updated`);
    }

    console.log('\n🎉 所有奖励重新计算完成！');
    console.log('🎉 All rewards recalculated successfully!');

  } catch (error) {
    console.error('❌ Error fixing admin pool amount:', error);
    console.error('❌ 修复admin pool amount时出错:', error);
  } finally {
    await pool.end();
  }
}

fixAdminPoolAmount(); 