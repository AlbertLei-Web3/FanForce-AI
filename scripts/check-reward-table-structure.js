// Check reward_distributions table structure
// 检查reward_distributions表结构

const { Pool } = require('pg');

async function checkRewardTableStructure() {
  console.log('🔍 Checking reward_distributions table structure...');
  console.log('🔍 检查reward_distributions表结构...');

  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fanforce_ai',
    password: process.env.DB_PASSWORD || 'LYQ20000',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const client = await pool.connect();

    // Get table structure
    // 获取表结构
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'reward_distributions'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Reward distributions table structure:');
    console.log('📊 reward_distributions表结构:');
    structureResult.rows.forEach((column, index) => {
      console.log(`  ${index + 1}. ${column.column_name} (${column.data_type}) - nullable: ${column.is_nullable}`);
    });

    // Check if there are any records
    // 检查是否有记录
    const countResult = await client.query(`
      SELECT COUNT(*) as total_count
      FROM reward_distributions
    `);
    
    console.log('\n📈 Total records in reward_distributions:', countResult.rows[0].total_count);
    console.log('📈 reward_distributions表中的总记录数:', countResult.rows[0].total_count);

    // Show sample records if any
    // 如果有记录则显示样本
    if (countResult.rows[0].total_count > 0) {
      const sampleResult = await client.query(`
        SELECT * FROM reward_distributions LIMIT 3
      `);
      
      console.log('\n📋 Sample records:');
      console.log('📋 样本记录:');
      sampleResult.rows.forEach((record, index) => {
        console.log(`  Record ${index + 1}:`, record);
      });
    }

    client.release();
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('❌ 数据库检查失败:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the check
// 运行检查
if (require.main === module) {
  checkRewardTableStructure();
}

module.exports = { checkRewardTableStructure }; 