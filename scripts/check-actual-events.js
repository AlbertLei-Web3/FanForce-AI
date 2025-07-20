/*
 * Check Actual Events in Database
 * 检查数据库中的实际赛事
 * 
 * This script checks what events actually exist in the database
 * 此脚本检查数据库中实际存在的赛事
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

async function checkActualEvents() {
  console.log('🔍 Checking actual events in database...');
  console.log('🔍 检查数据库中的实际赛事...');

  try {
    // Get all events
    // 获取所有赛事
    const events = await pool.query(`
      SELECT id, title, start_time, status, created_at
      FROM events 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`\n📊 Found ${events.rows.length} events in database:`);
    console.log(`📊 数据库中找到 ${events.rows.length} 个赛事:`);
    
    events.rows.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event.id}`);
      console.log(`   Title: ${event.title}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Start Time: ${event.start_time}`);
      console.log(`   Created: ${event.created_at}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking events:', error);
    console.error('❌ 检查赛事时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the check
// 运行检查
checkActualEvents().then(() => {
  console.log('\n✨ Check completed');
  console.log('✨ 检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  console.error('💥 检查失败:', error);
  process.exit(1);
}); 