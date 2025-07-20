/*
 * Check Real Team Information
 * 检查真实队伍信息
 * 
 * This script checks the real team information in the events table
 * 此脚本检查events表中的真实队伍信息
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

async function checkRealTeamInfo() {
  console.log('🔍 Checking real team information in events table...');
  console.log('🔍 检查events表中的真实队伍信息...');

  try {
    // Check the structure of events table
    // 检查events表的结构
    console.log('\n📊 Checking events table structure...');
    console.log('📊 检查events表结构...');
    
    const structure = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);

    console.log('Events table columns:');
    console.log('Events表列:');
    structure.rows.forEach((column, index) => {
      console.log(`${index + 1}. ${column.column_name} (${column.data_type})`);
    });

    // Check the most recent events with their team information
    // 检查最新的赛事及其队伍信息
    console.log('\n📊 Checking most recent events...');
    console.log('📊 检查最新赛事...');
    
    const events = await pool.query(`
      SELECT 
        id,
        title,
        team_a_info,
        team_b_info,
        status,
        created_at,
        start_time
      FROM events 
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${events.rows.length} active events:`);
    console.log(`找到 ${events.rows.length} 个活跃赛事:`);
    
    events.rows.forEach((event, index) => {
      console.log(`\n${index + 1}. Event ID: ${event.id}`);
      console.log(`   Title: ${event.title}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Created: ${event.created_at}`);
      console.log(`   Start Time: ${event.start_time}`);
      console.log(`   Team A Info: ${event.team_a_info}`);
      console.log(`   Team B Info: ${event.team_b_info}`);
      
      // Try to parse team info as JSON
      // 尝试将队伍信息解析为JSON
      try {
        if (event.team_a_info) {
          const teamA = JSON.parse(event.team_a_info);
          console.log(`   Team A (parsed): ${JSON.stringify(teamA, null, 2)}`);
        }
        if (event.team_b_info) {
          const teamB = JSON.parse(event.team_b_info);
          console.log(`   Team B (parsed): ${JSON.stringify(teamB, null, 2)}`);
        }
      } catch (error) {
        console.log(`   Team info parsing error: ${error.message}`);
      }
    });

    // Check the relationship between events and event_applications
    // 检查events和event_applications之间的关系
    console.log('\n📊 Checking relationship with event_applications...');
    console.log('📊 检查与event_applications的关系...');
    
    const relationships = await pool.query(`
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.team_a_info as event_team_a,
        e.team_b_info as event_team_b,
        ea.id as application_id,
        ea.event_title as application_title,
        ea.team_a_info as application_team_a,
        ea.team_b_info as application_team_b
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      WHERE e.status = 'active'
      ORDER BY e.created_at DESC
      LIMIT 3
    `);

    console.log(`Found ${relationships.rows.length} relationships:`);
    console.log(`找到 ${relationships.rows.length} 个关系:`);
    
    relationships.rows.forEach((rel, index) => {
      console.log(`\n${index + 1}. Event ID: ${rel.event_id}`);
      console.log(`   Event Title: ${rel.event_title}`);
      console.log(`   Application ID: ${rel.application_id}`);
      console.log(`   Application Title: ${rel.application_title}`);
      console.log(`   Event Team A: ${rel.event_team_a}`);
      console.log(`   Event Team B: ${rel.event_team_b}`);
      console.log(`   Application Team A: ${rel.application_team_a}`);
      console.log(`   Application Team B: ${rel.application_team_b}`);
    });

  } catch (error) {
    console.error('❌ Error checking team information:', error);
    console.error('❌ 检查队伍信息时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the check
// 运行检查
checkRealTeamInfo().then(() => {
  console.log('\n✨ Team info check completed');
  console.log('✨ 队伍信息检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  console.error('💥 检查失败:', error);
  process.exit(1);
}); 