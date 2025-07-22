const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'postgres'
});

async function checkEventsPoolData() {
  try {
    console.log('🔍 检查events表的pool_injected_chz字段数据...');
    console.log('🔍 Checking pool_injected_chz field data in events table...');

    // Get events with pool_injected_chz data
    // 获取有pool_injected_chz数据的事件
    const events = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.pool_injected_chz,
        e.status,
        e.match_result,
        e.team_a_score,
        e.team_b_score
      FROM events e
      WHERE e.pool_injected_chz IS NOT NULL
      ORDER BY e.created_at DESC
    `);

    console.log(`\n📊 找到 ${events.rows.length} 个事件有pool_injected_chz数据`);
    console.log(`📊 Found ${events.rows.length} events with pool_injected_chz data`);

    events.rows.forEach((event, index) => {
      console.log(`\n事件 ${index + 1}:`);
      console.log(`Event ${index + 1}:`);
      console.log(`  - ID: ${event.id}`);
      console.log(`  - 标题: ${event.title}`);
      console.log(`  - Title: ${event.title}`);
      console.log(`  - 注入CHZ: ${event.pool_injected_chz}`);
      console.log(`  - Pool Injected CHZ: ${event.pool_injected_chz}`);
      console.log(`  - 状态: ${event.status}`);
      console.log(`  - Status: ${event.status}`);
      console.log(`  - 比赛结果: ${event.match_result}`);
      console.log(`  - Match Result: ${event.match_result}`);
      console.log(`  - 比分: ${event.team_a_score} - ${event.team_b_score}`);
      console.log(`  - Score: ${event.team_a_score} - ${event.team_b_score}`);
    });

    // Check reward_distributions admin_pool_amount vs events pool_injected_chz
    // 检查reward_distributions的admin_pool_amount与events的pool_injected_chz对比
    console.log('\n🔍 检查reward_distributions与events的数据一致性...');
    console.log('🔍 Checking data consistency between reward_distributions and events...');

    const comparison = await pool.query(`
      SELECT 
        rd.id as reward_id,
        rd.event_id,
        rd.admin_pool_amount as reward_admin_pool,
        e.pool_injected_chz as event_pool_injected,
        e.title as event_title,
        rd.final_reward,
        rd.calculation_formula
      FROM reward_distributions rd
      JOIN events e ON rd.event_id = e.id
    `);

    console.log(`\n📊 找到 ${comparison.rows.length} 条reward_distributions记录`);
    console.log(`📊 Found ${comparison.rows.length} reward_distributions records`);

    comparison.rows.forEach((record, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`Record ${index + 1}:`);
      console.log(`  - 事件: ${record.event_title}`);
      console.log(`  - Event: ${record.event_title}`);
      console.log(`  - reward_distributions.admin_pool_amount: ${record.reward_admin_pool}`);
      console.log(`  - events.pool_injected_chz: ${record.event_pool_injected}`);
      
      if (record.reward_admin_pool === record.event_pool_injected) {
        console.log(`  ✅ 数据一致 / Data consistent`);
      } else {
        console.log(`  ❌ 数据不一致！需要修复 / Data inconsistent! Need to fix`);
        console.log(`  ❌ 差异: ${record.reward_admin_pool} vs ${record.event_pool_injected}`);
        console.log(`  ❌ Difference: ${record.reward_admin_pool} vs ${record.event_pool_injected}`);
      }
    });

    // Check event_approval_log for injected_chz_amount
    // 检查event_approval_log的injected_chz_amount
    console.log('\n🔍 检查event_approval_log的injected_chz_amount...');
    console.log('🔍 Checking injected_chz_amount in event_approval_log...');

    const approvalLog = await pool.query(`
      SELECT 
        eal.id,
        eal.event_id,
        eal.injected_chz_amount,
        eal.decision,
        e.title as event_title,
        e.pool_injected_chz
      FROM event_approval_log eal
      JOIN events e ON eal.event_id = e.id
      WHERE eal.injected_chz_amount IS NOT NULL
      ORDER BY eal.created_at DESC
    `);

    console.log(`\n📊 找到 ${approvalLog.rows.length} 条event_approval_log记录`);
    console.log(`📊 Found ${approvalLog.rows.length} event_approval_log records`);

    approvalLog.rows.forEach((record, index) => {
      console.log(`\n记录 ${index + 1}:`);
      console.log(`Record ${index + 1}:`);
      console.log(`  - 事件: ${record.event_title}`);
      console.log(`  - Event: ${record.event_title}`);
      console.log(`  - event_approval_log.injected_chz_amount: ${record.injected_chz_amount}`);
      console.log(`  - events.pool_injected_chz: ${record.pool_injected_chz}`);
      
      if (record.injected_chz_amount === record.pool_injected_chz) {
        console.log(`  ✅ 数据一致 / Data consistent`);
      } else {
        console.log(`  ❌ 数据不一致！需要修复 / Data inconsistent! Need to fix`);
        console.log(`  ❌ 差异: ${record.injected_chz_amount} vs ${record.pool_injected_chz}`);
        console.log(`  ❌ Difference: ${record.injected_chz_amount} vs ${record.pool_injected_chz}`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking events pool data:', error);
    console.error('❌ 检查events pool数据时出错:', error);
  } finally {
    await pool.end();
  }
}

checkEventsPoolData(); 