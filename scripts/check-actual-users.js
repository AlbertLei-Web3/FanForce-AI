/*
 * Check Actual Users in Database
 * 检查数据库中的实际用户
 * 
 * This script checks what users actually exist in the database
 * 此脚本检查数据库中实际存在的用户
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

async function checkActualUsers() {
  console.log('🔍 Checking actual users in database...');
  console.log('🔍 检查数据库中的实际用户...');

  try {
    // Get all users
    // 获取所有用户
    const users = await pool.query(`
      SELECT id, wallet_address, role, virtual_chz_balance, created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`\n📊 Found ${users.rows.length} users in database:`);
    console.log(`📊 数据库中找到 ${users.rows.length} 个用户:`);
    
    users.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Wallet: ${user.wallet_address}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Balance: ${user.virtual_chz_balance} CHZ`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    // Get all events
    // 获取所有赛事
    const events = await pool.query(`
      SELECT id, title, event_start_time, status
      FROM events 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`\n📊 Found ${events.rows.length} events in database:`);
    console.log(`📊 数据库中找到 ${events.rows.length} 个赛事:`);
    
    events.rows.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event.id}`);
      console.log(`   Title: ${event.title}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Start Time: ${event.event_start_time}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
    console.error('❌ 检查用户时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the check
// 运行检查
checkActualUsers().then(() => {
  console.log('\n✨ Check completed');
  console.log('✨ 检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  console.error('💥 检查失败:', error);
  process.exit(1);
}); 