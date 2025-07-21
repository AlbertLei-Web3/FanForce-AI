const { Pool } = require('pg');

// Database configuration
// 数据库配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Check database structure
// 检查数据库结构
async function checkDatabaseStructure() {
  try {
    console.log('🔍 Checking database structure...');
    console.log('🔍 检查数据库结构...');

    // Check events table structure
    // 检查events表结构
    const eventsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('id', 'ambassador_id', 'title', 'event_date', 'status')
      ORDER BY column_name
    `);

    console.log('\n📊 Events table structure:');
    console.log('📊 Events表结构:');
    eventsStructure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check users table structure
    // 检查users表结构
    const usersStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('id', 'wallet_address', 'role')
      ORDER BY column_name
    `);

    console.log('\n📊 Users table structure:');
    console.log('📊 Users表结构:');
    usersStructure.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Check sample data from events table
    // 检查events表的样本数据
    const sampleEvents = await pool.query(`
      SELECT id, ambassador_id, title, event_date, status
      FROM events 
      LIMIT 3
    `);

    console.log('\n📊 Sample events data:');
    console.log('📊 样本活动数据:');
    sampleEvents.rows.forEach((event, index) => {
      console.log(`  Event ${index + 1}:`);
      console.log(`    ID: ${event.id}`);
      console.log(`    Ambassador ID: ${event.ambassador_id}`);
      console.log(`    Title: ${event.title}`);
      console.log(`    Date: ${event.event_date}`);
      console.log(`    Status: ${event.status}`);
    });

    // Check if ambassador_id is UUID or wallet address
    // 检查ambassador_id是UUID还是钱包地址
    const ambassadorIdCheck = await pool.query(`
      SELECT DISTINCT ambassador_id, LENGTH(ambassador_id) as length
      FROM events 
      WHERE ambassador_id IS NOT NULL
      LIMIT 5
    `);

    console.log('\n📊 Ambassador ID analysis:');
    console.log('📊 大使ID分析:');
    ambassadorIdCheck.rows.forEach((row, index) => {
      console.log(`  Sample ${index + 1}: ${row.ambassador_id} (length: ${row.length})`);
    });

    // Check if there are any users with ambassador role
    // 检查是否有大使角色的用户
    const ambassadorUsers = await pool.query(`
      SELECT id, wallet_address, role
      FROM users 
      WHERE role = 'ambassador'
    `);

    console.log('\n📊 Ambassador users:');
    console.log('📊 大使用户:');
    if (ambassadorUsers.rows.length > 0) {
      ambassadorUsers.rows.forEach((user, index) => {
        console.log(`  Ambassador ${index + 1}: ${user.wallet_address} (ID: ${user.id})`);
      });
    } else {
      console.log('  No ambassador users found');
    }

    // Check all user roles
    // 检查所有用户角色
    const allRoles = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users 
      GROUP BY role
      ORDER BY count DESC
    `);

    console.log('\n📊 User roles distribution:');
    console.log('📊 用户角色分布:');
    allRoles.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count} users`);
    });

  } catch (error) {
    console.error('❌ Error checking database structure:', error);
    console.error('❌ 检查数据库结构时出错:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
// 运行检查
if (require.main === module) {
  checkDatabaseStructure()
    .then(() => {
      console.log('✨ Database structure check completed');
      console.log('✨ 数据库结构检查完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database structure check failed');
      console.error('💥 数据库结构检查失败');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { checkDatabaseStructure }; 