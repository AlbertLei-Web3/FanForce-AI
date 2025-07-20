/*
 * Check Events Table Structure
 * 检查赛事表结构
 * 
 * This script checks the actual column names in the events table
 * 此脚本检查events表中的实际列名
 */

const { Pool } = require('pg');

// Database connection
// 数据库连接
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function checkEventsTable() {
  console.log('🔍 Checking events table structure...');
  console.log('🔍 检查赛事表结构...');

  try {
    // Get table structure
    // 获取表结构
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);

    console.log('\n📊 Events table columns:');
    console.log('📊 赛事表列:');
    structure.rows.forEach((column, index) => {
      console.log(`${index + 1}. ${column.column_name} (${column.data_type}, nullable: ${column.is_nullable})`);
    });

    // Get sample data
    // 获取示例数据
    const sampleData = await pool.query(`
      SELECT * FROM events LIMIT 3
    `);

    console.log('\n📊 Sample event data:');
    console.log('📊 示例赛事数据:');
    sampleData.rows.forEach((event, index) => {
      console.log(`Event ${index + 1}:`, event);
    });

  } catch (error) {
    console.error('❌ Error checking events table:', error);
    console.error('❌ 检查赛事表时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the check
// 运行检查
checkEventsTable().then(() => {
  console.log('\n✨ Check completed');
  console.log('✨ 检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  console.error('💥 检查失败:', error);
  process.exit(1);
}); 