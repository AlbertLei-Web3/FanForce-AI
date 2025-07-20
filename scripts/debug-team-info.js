/*
 * Debug Team Info
 * 调试队伍信息
 * 
 * This script debugs the actual content of team information objects
 * 此脚本调试队伍信息对象的实际内容
 */

const { Pool } = require('pg');

// Database connection
// 数据库连接
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
});

async function debugTeamInfo() {
  console.log('🔍 Debugging team info objects...');
  console.log('🔍 调试队伍信息对象...');

  try {
    // Get the most recent approved application
    // 获取最新的已批准申请
    const application = await pool.query(`
      SELECT 
        id,
        event_title,
        team_a_info,
        team_b_info
      FROM event_applications 
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (application.rows.length > 0) {
      const app = application.rows[0];
      console.log(`\n📊 Application: ${app.event_title}`);
      console.log(`📊 申请: ${app.event_title}`);
      
      console.log('\n🔍 Team A Info Debug:');
      console.log('🔍 队伍A信息调试:');
      console.log(`   Raw value: ${app.team_a_info}`);
      console.log(`   Type: ${typeof app.team_a_info}`);
      console.log(`   Constructor: ${app.team_a_info?.constructor?.name}`);
      
      if (app.team_a_info) {
        // Try different ways to access the object
        // 尝试不同的方式访问对象
        console.log(`   Keys: ${Object.keys(app.team_a_info)}`);
        console.log(`   Values: ${Object.values(app.team_a_info)}`);
        console.log(`   Stringified: ${JSON.stringify(app.team_a_info)}`);
        
        // Try to access common properties
        // 尝试访问常见属性
        if (app.team_a_info.name) {
          console.log(`   .name: ${app.team_a_info.name}`);
        }
        if (app.team_a_info.team_name) {
          console.log(`   .team_name: ${app.team_a_info.team_name}`);
        }
        if (app.team_a_info.title) {
          console.log(`   .title: ${app.team_a_info.title}`);
        }
      }
      
      console.log('\n🔍 Team B Info Debug:');
      console.log('🔍 队伍B信息调试:');
      console.log(`   Raw value: ${app.team_b_info}`);
      console.log(`   Type: ${typeof app.team_b_info}`);
      console.log(`   Constructor: ${app.team_b_info?.constructor?.name}`);
      
      if (app.team_b_info) {
        // Try different ways to access the object
        // 尝试不同的方式访问对象
        console.log(`   Keys: ${Object.keys(app.team_b_info)}`);
        console.log(`   Values: ${Object.values(app.team_b_info)}`);
        console.log(`   Stringified: ${JSON.stringify(app.team_b_info)}`);
        
        // Try to access common properties
        // 尝试访问常见属性
        if (app.team_b_info.name) {
          console.log(`   .name: ${app.team_b_info.name}`);
        }
        if (app.team_b_info.team_name) {
          console.log(`   .team_name: ${app.team_b_info.team_name}`);
        }
        if (app.team_b_info.title) {
          console.log(`   .title: ${app.team_b_info.title}`);
        }
      }
    } else {
      console.log('❌ No approved applications found');
      console.log('❌ 未找到已批准的申请');
    }

  } catch (error) {
    console.error('❌ Error debugging team info:', error);
    console.error('❌ 调试队伍信息时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the debug
// 运行调试
debugTeamInfo().then(() => {
  console.log('\n✨ Team info debug completed');
  console.log('✨ 队伍信息调试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Debug failed:', error);
  console.error('💥 调试失败:', error);
  process.exit(1);
}); 