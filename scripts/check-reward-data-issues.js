const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function checkRewardDataIssues() {
  try {
    console.log('🔍 检查reward_distributions表数据问题...');
    console.log('🔍 Checking reward_distributions table data issues...');

    // 1. 检查reward_distributions表中的数据
    console.log('\n1️⃣ 检查reward_distributions表数据:');
    const rewardDistributions = await pool.query(`
      SELECT 
        rd.id,
        rd.event_id,
        rd.admin_pool_amount,
        rd.base_reward,
        rd.final_reward,
        rd.calculation_formula,
        e.title as event_title,
        e.pool_injected_chz
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
      LIMIT 5
    `);

    rewardDistributions.rows.forEach((record, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`  Event: ${record.event_title}`);
      console.log(`  Event ID: ${record.event_id}`);
      console.log(`  reward_distributions.admin_pool_amount: ${record.admin_pool_amount}`);
      console.log(`  events.pool_injected_chz: ${record.pool_injected_chz}`);
      console.log(`  base_reward: ${record.base_reward}`);
      console.log(`  final_reward: ${record.final_reward}`);
      console.log(`  calculation_formula: ${record.calculation_formula}`);
      
      const isConsistent = record.admin_pool_amount === record.pool_injected_chz;
      console.log(`  数据一致性: ${isConsistent ? '✅' : '❌'}`);
    });

    // 2. 检查event_approval_log表中的injected_chz_amount
    console.log('\n2️⃣ 检查event_approval_log表数据:');
    const approvalLogs = await pool.query(`
      SELECT 
        eal.id,
        eal.event_id,
        eal.injected_chz_amount,
        eal.decision,
        e.title as event_title,
        e.pool_injected_chz
      FROM event_approval_log eal
      LEFT JOIN events e ON eal.event_id = e.id
      WHERE eal.injected_chz_amount IS NOT NULL
      LIMIT 5
    `);

    approvalLogs.rows.forEach((record, index) => {
      console.log(`\n审批记录 ${index + 1}:`);
      console.log(`  Event: ${record.event_title}`);
      console.log(`  Event ID: ${record.event_id}`);
      console.log(`  event_approval_log.injected_chz_amount: ${record.injected_chz_amount}`);
      console.log(`  events.pool_injected_chz: ${record.pool_injected_chz}`);
      
      const isConsistent = record.injected_chz_amount === record.pool_injected_chz;
      console.log(`  数据一致性: ${isConsistent ? '✅' : '❌'}`);
    });

    // 3. 检查数据流转问题
    console.log('\n3️⃣ 数据流转分析:');
    console.log('问题分析 / Issue Analysis:');
    console.log('1. reward_distributions.admin_pool_amount 应该来自 events.pool_injected_chz');
    console.log('2. reward_distributions.base_reward 应该是动态计算的，不是固定的1500');
    console.log('3. calculation_formula 应该使用流动性挖矿公式');
    console.log('4. 数据应该在以下流程中流转:');
    console.log('   event_approval_log.injected_chz_amount → events.pool_injected_chz → reward_distributions.admin_pool_amount');

    // 4. 建议的修复方案
    console.log('\n4️⃣ 建议的修复方案 / Suggested Fixes:');
    console.log('1. 更新 update-match-result API 使用正确的流动性挖矿公式');
    console.log('2. 确保 admin_pool_amount 从 events.pool_injected_chz 获取');
    console.log('3. 动态计算 base_reward 而不是使用固定值');
    console.log('4. 更新 calculation_formula 显示正确的流动性挖矿公式');

  } catch (error) {
    console.error('❌ Error checking reward data issues:', error);
    console.error('❌ 检查奖励数据问题时出错:', error);
  } finally {
    await pool.end();
  }
}

checkRewardDataIssues(); 