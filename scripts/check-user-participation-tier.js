const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function checkUserParticipationTier() {
  try {
    console.log('🔍 检查用户参与档位和计算公式...');
    console.log('🔍 Checking user participation tier and calculation formula...');

    const userId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

    // Get user's stake records with participation tier
    // 获取用户的质押记录及参与档位
    const userStakes = await pool.query(`
      SELECT 
        usr.id,
        usr.event_id,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.stake_time,
        e.title as event_title,
        e.pool_injected_chz
      FROM user_stake_records usr
      JOIN events e ON usr.event_id = e.id
      WHERE usr.user_id = $1
      ORDER BY usr.stake_time DESC
    `, [userId]);

    console.log(`\n📊 用户质押记录: ${userStakes.rows.length} 条`);
    console.log(`📊 User stake records: ${userStakes.rows.length} records`);

    userStakes.rows.forEach((stake, index) => {
      console.log(`\n质押记录 ${index + 1}:`);
      console.log(`Stake Record ${index + 1}:`);
      console.log(`  - 事件: ${stake.event_title}`);
      console.log(`  - Event: ${stake.event_title}`);
      console.log(`  - 质押金额: ${stake.stake_amount} CHZ`);
      console.log(`  - Stake Amount: ${stake.stake_amount} CHZ`);
      console.log(`  - 参与档位: ${stake.participation_tier}`);
      console.log(`  - Participation Tier: ${stake.participation_tier}`);
      console.log(`  - 队伍选择: ${stake.team_choice}`);
      console.log(`  - Team Choice: ${stake.team_choice}`);
      console.log(`  - 事件奖池: ${stake.pool_injected_chz} CHZ`);
      console.log(`  - Event Pool: ${stake.pool_injected_chz} CHZ`);
      
      // Get tier coefficient based on participation_tier
      // 根据participation_tier获取系数
      let tierCoefficient;
      let tierName;
      switch (stake.participation_tier) {
        case 1:
          tierCoefficient = 1.0;
          tierName = 'Full Experience';
          break;
        case 2:
          tierCoefficient = 0.7;
          tierName = 'Stake+Match';
          break;
        case 3:
          tierCoefficient = 0.3;
          tierName = 'Stake Only';
          break;
        default:
          tierCoefficient = 0.3;
          tierName = 'Stake Only (Default)';
      }
      
      console.log(`  - 档位名称: ${tierName}`);
      console.log(`  - Tier Name: ${tierName}`);
      console.log(`  - 系数: ${tierCoefficient}`);
      console.log(`  - Coefficient: ${tierCoefficient}`);
    });

    // Get reward distributions for this user
    // 获取此用户的奖励分配记录
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
        usr.stake_amount
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
      JOIN user_stake_records usr ON usr.event_id = rd.event_id AND usr.user_id = rd.user_id
      WHERE rd.user_id = $1
    `, [userId]);

    console.log(`\n📊 奖励分配记录: ${rewardDistributions.rows.length} 条`);
    console.log(`📊 Reward distribution records: ${rewardDistributions.rows.length} records`);

    rewardDistributions.rows.forEach((reward, index) => {
      console.log(`\n奖励记录 ${index + 1}:`);
      console.log(`Reward Record ${index + 1}:`);
      console.log(`  - 事件: ${reward.event_title}`);
      console.log(`  - Event: ${reward.event_title}`);
      console.log(`  - 奖池金额: ${reward.admin_pool_amount} CHZ`);
      console.log(`  - Pool Amount: ${reward.admin_pool_amount} CHZ`);
      console.log(`  - 最终奖励: ${reward.final_reward} CHZ`);
      console.log(`  - Final Reward: ${reward.final_reward} CHZ`);
      console.log(`  - 用户参与档位: ${reward.participation_tier}`);
      console.log(`  - User Participation Tier: ${reward.participation_tier}`);
      console.log(`  - 存储的系数: ${reward.user_tier_coefficient}`);
      console.log(`  - Stored Coefficient: ${reward.user_tier_coefficient}`);
      console.log(`  - 计算公式: ${reward.calculation_formula}`);
      console.log(`  - Calculation Formula: ${reward.calculation_formula}`);
      
      // Check if the coefficient in formula matches the actual tier
      // 检查公式中的系数是否与实际档位匹配
      let expectedCoefficient;
      let expectedTierName;
      switch (reward.participation_tier) {
        case 1:
          expectedCoefficient = 1.0;
          expectedTierName = 'Full Experience';
          break;
        case 2:
          expectedCoefficient = 0.7;
          expectedTierName = 'Stake+Match';
          break;
        case 3:
          expectedCoefficient = 0.3;
          expectedTierName = 'Stake Only';
          break;
        default:
          expectedCoefficient = 0.3;
          expectedTierName = 'Stake Only (Default)';
      }
      
      console.log(`  - 期望系数: ${expectedCoefficient} (${expectedTierName})`);
      console.log(`  - Expected Coefficient: ${expectedCoefficient} (${expectedTierName})`);
      
      if (reward.user_tier_coefficient === expectedCoefficient) {
        console.log(`  ✅ 系数匹配 / Coefficient matches`);
      } else {
        console.log(`  ❌ 系数不匹配！需要修复 / Coefficient mismatch! Need to fix`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking user participation tier:', error);
    console.error('❌ 检查用户参与档位时出错:', error);
  } finally {
    await pool.end();
  }
}

checkUserParticipationTier(); 