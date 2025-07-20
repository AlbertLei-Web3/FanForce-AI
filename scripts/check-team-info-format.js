/*
 * Check Team Info Format
 * 检查队伍信息格式
 * 
 * This script checks the actual format of team information in the database
 * 此脚本检查数据库中队伍信息的实际格式
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

async function checkTeamInfoFormat() {
  console.log('🔍 Checking team info format in database...');
  console.log('🔍 检查数据库中队伍信息格式...');

  try {
    // Check the most recent approved application
    // 检查最新的已批准申请
    console.log('\n📊 Checking most recent approved application...');
    console.log('📊 检查最新的已批准申请...');
    
    const application = await pool.query(`
      SELECT 
        id,
        event_title,
        team_a_info,
        team_b_info,
        status,
        created_at
      FROM event_applications 
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 1
    `);

    if (application.rows.length > 0) {
      const app = application.rows[0];
      console.log(`Application ID: ${app.id}`);
      console.log(`Event Title: ${app.event_title}`);
      console.log(`Status: ${app.status}`);
      console.log(`Created: ${app.created_at}`);
      
      console.log('\n📊 Team A Info:');
      console.log('📊 队伍A信息:');
      console.log(`   Raw value: ${app.team_a_info}`);
      console.log(`   Type: ${typeof app.team_a_info}`);
      
      if (app.team_a_info) {
        try {
          const parsed = JSON.parse(app.team_a_info);
          console.log(`   Parsed: ${JSON.stringify(parsed, null, 2)}`);
        } catch (error) {
          console.log(`   Parse error: ${error.message}`);
        }
      }
      
      console.log('\n📊 Team B Info:');
      console.log('📊 队伍B信息:');
      console.log(`   Raw value: ${app.team_b_info}`);
      console.log(`   Type: ${typeof app.team_b_info}`);
      
      if (app.team_b_info) {
        try {
          const parsed = JSON.parse(app.team_b_info);
          console.log(`   Parsed: ${JSON.stringify(parsed, null, 2)}`);
        } catch (error) {
          console.log(`   Parse error: ${error.message}`);
        }
      }
    } else {
      console.log('❌ No approved applications found');
      console.log('❌ 未找到已批准的申请');
    }

    // Check all approved applications to see different formats
    // 检查所有已批准的申请以查看不同格式
    console.log('\n📊 Checking all approved applications...');
    console.log('📊 检查所有已批准的申请...');
    
    const allApplications = await pool.query(`
      SELECT 
        id,
        event_title,
        team_a_info,
        team_b_info
      FROM event_applications 
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${allApplications.rows.length} approved applications:`);
    console.log(`找到 ${allApplications.rows.length} 个已批准的申请:`);
    
    allApplications.rows.forEach((app, index) => {
      console.log(`\n${index + 1}. Application ID: ${app.id}`);
      console.log(`   Title: ${app.event_title}`);
      console.log(`   Team A Info: ${app.team_a_info}`);
      console.log(`   Team B Info: ${app.team_b_info}`);
      
      if (app.team_a_info) {
        try {
          const parsedA = JSON.parse(app.team_a_info);
          console.log(`   Team A Parsed: ${JSON.stringify(parsedA)}`);
        } catch (error) {
          console.log(`   Team A Parse error: ${error.message}`);
        }
      }
      
      if (app.team_b_info) {
        try {
          const parsedB = JSON.parse(app.team_b_info);
          console.log(`   Team B Parsed: ${JSON.stringify(parsedB)}`);
        } catch (error) {
          console.log(`   Team B Parse error: ${error.message}`);
        }
      }
    });

  } catch (error) {
    console.error('❌ Error checking team info format:', error);
    console.error('❌ 检查队伍信息格式时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the check
// 运行检查
checkTeamInfoFormat().then(() => {
  console.log('\n✨ Team info format check completed');
  console.log('✨ 队伍信息格式检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  console.error('💥 检查失败:', error);
  process.exit(1);
}); 