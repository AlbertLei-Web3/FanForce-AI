const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function checkRewardCalculations() {
  try {
    console.log('🔍 检查reward_calculations表...');
    console.log('🔍 Checking reward_calculations table...');

    // Check if table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reward_calculations'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('❌ reward_calculations表不存在');
      console.log('❌ reward_calculations table does not exist');
      return;
    }

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) as total_count FROM reward_calculations');
    console.log(`\n📈 Total records in reward_calculations: ${countResult.rows[0].total_count}`);
    console.log(`📈 reward_calculations表中的总记录数: ${countResult.rows[0].total_count}`);

    // Get sample data
    const sampleData = await pool.query(`
      SELECT 
        rc.id,
        rc.event_id,
        rc.user_id,
        rc.stake_record_id,
        rc.admin_pool_amount,
        rc.final_reward,
        rc.calculation_status,
        e.title as event_title
      FROM reward_calculations rc
      LEFT JOIN events e ON rc.event_id = e.id
      LIMIT 5
    `);

    console.log('\n📋 Sample records:');
    console.log('📋 样本记录:');
    sampleData.rows.forEach((record, index) => {
      console.log(`  Record ${index + 1}:`, record);
    });

    // Check for specific user
    const userId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';
    const userRewards = await pool.query(`
      SELECT 
        rc.id,
        rc.event_id,
        rc.user_id,
        rc.stake_record_id,
        rc.admin_pool_amount,
        rc.final_reward,
        rc.calculation_status,
        e.title as event_title
      FROM reward_calculations rc
      LEFT JOIN events e ON rc.event_id = e.id
      WHERE rc.user_id = $1
    `, [userId]);

    console.log(`\n👤 User ${userId} rewards: ${userRewards.rows.length} records`);
    userRewards.rows.forEach((record, index) => {
      console.log(`  ${index + 1}. Event: ${record.event_title}, Reward: ${record.final_reward}, Status: ${record.calculation_status}`);
    });

  } catch (error) {
    console.error('❌ Error checking reward_calculations:', error);
    console.error('❌ 检查reward_calculations时出错:', error);
  } finally {
    await pool.end();
  }
}

checkRewardCalculations(); 