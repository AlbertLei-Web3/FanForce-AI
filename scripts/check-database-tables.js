/*
 * Check Database Tables and Data
 * 检查数据库表和数据
 * 
 * This script checks what tables exist and what data they contain
 * 此脚本检查存在哪些表以及它们包含什么数据
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

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables and data...');
  console.log('🔍 检查数据库表和数据...');

  try {
    // 1. Check what tables exist
    // 1. 检查存在哪些表
    console.log('\n📊 Checking existing tables...');
    console.log('📊 检查现有表...');
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('Existing tables:');
    console.log('现有表:');
    tables.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });

    // 2. Check events table
    // 2. 检查events表
    console.log('\n📊 Checking events table...');
    console.log('📊 检查events表...');
    
    const events = await pool.query(`
      SELECT id, title, start_time, status, created_at
      FROM events 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${events.rows.length} events:`);
    console.log(`找到 ${events.rows.length} 个赛事:`);
    events.rows.forEach((event, index) => {
      console.log(`${index + 1}. ID: ${event.id}`);
      console.log(`   Title: ${event.title}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Start Time: ${event.start_time}`);
      console.log('');
    });

    // 3. Check event_applications table
    // 3. 检查event_applications表
    console.log('\n📊 Checking event_applications table...');
    console.log('📊 检查event_applications表...');
    
    const applications = await pool.query(`
      SELECT id, event_title, status, created_at
      FROM event_applications 
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${applications.rows.length} event applications:`);
    console.log(`找到 ${applications.rows.length} 个赛事申请:`);
    applications.rows.forEach((app, index) => {
      console.log(`${index + 1}. ID: ${app.id}`);
      console.log(`   Title: ${app.event_title}`);
      console.log(`   Status: ${app.status}`);
      console.log('');
    });

    // 4. Check if there's a relationship between events and event_applications
    // 4. 检查events和event_applications之间是否有关系
    console.log('\n📊 Checking relationship between events and event_applications...');
    console.log('📊 检查events和event_applications之间的关系...');
    
    const relationship = await pool.query(`
      SELECT e.id as event_id, e.title as event_title, ea.id as application_id, ea.event_title as application_title
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LIMIT 5
    `);

    console.log(`Found ${relationship.rows.length} relationships:`);
    console.log(`找到 ${relationship.rows.length} 个关系:`);
    relationship.rows.forEach((rel, index) => {
      console.log(`${index + 1}. Event ID: ${rel.event_id}`);
      console.log(`   Event Title: ${rel.event_title}`);
      console.log(`   Application ID: ${rel.application_id}`);
      console.log(`   Application Title: ${rel.application_title}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking database tables:', error);
    console.error('❌ 检查数据库表时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the check
// 运行检查
checkDatabaseTables().then(() => {
  console.log('\n✨ Database check completed');
  console.log('✨ 数据库检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  console.error('💥 检查失败:', error);
  process.exit(1);
}); 