/*
 * Check Application Team Information
 * 检查申请表中的队伍信息
 * 
 * This script checks the team information in event_applications table
 * 此脚本检查event_applications表中的队伍信息
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

async function checkApplicationTeamInfo() {
  console.log('🔍 Checking team information in event_applications table...');
  console.log('🔍 检查event_applications表中的队伍信息...');

  try {
    // Check the most recent approved applications
    // 检查最新的已批准申请
    console.log('\n📊 Checking most recent approved applications...');
    console.log('📊 检查最新的已批准申请...');
    
    const applications = await pool.query(`
      SELECT 
        id,
        event_title,
        team_a_info,
        team_b_info,
        status,
        created_at,
        event_start_time
      FROM event_applications 
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${applications.rows.length} approved applications:`);
    console.log(`找到 ${applications.rows.length} 个已批准申请:`);
    
    applications.rows.forEach((app, index) => {
      console.log(`\n${index + 1}. Application ID: ${app.id}`);
      console.log(`   Title: ${app.event_title}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.created_at}`);
      console.log(`   Start Time: ${app.event_start_time}`);
      console.log(`   Team A Info: ${app.team_a_info}`);
      console.log(`   Team B Info: ${app.team_b_info}`);
      
      // Try to parse team info as JSON
      // 尝试将队伍信息解析为JSON
      try {
        if (app.team_a_info) {
          const teamA = JSON.parse(app.team_a_info);
          console.log(`   Team A (parsed): ${JSON.stringify(teamA, null, 2)}`);
        }
        if (app.team_b_info) {
          const teamB = JSON.parse(app.team_b_info);
          console.log(`   Team B (parsed): ${JSON.stringify(teamB, null, 2)}`);
        }
      } catch (error) {
        console.log(`   Team info parsing error: ${error.message}`);
      }
    });

    // Check the specific application that corresponds to our featured event
    // 检查对应我们焦点赛事的特定申请
    console.log('\n📊 Checking specific application for featured event...');
    console.log('📊 检查焦点赛事对应的特定申请...');
    
    const featuredApplication = await pool.query(`
      SELECT 
        id,
        event_title,
        team_a_info,
        team_b_info,
        status,
        created_at,
        event_start_time,
        venue_name,
        venue_capacity,
        party_venue_capacity
      FROM event_applications 
      WHERE id = '8cfd84ba-5da0-4beb-98f6-9fc2e04bdc9c'
    `);

    if (featuredApplication.rows.length > 0) {
      const app = featuredApplication.rows[0];
      console.log(`\nFeatured Application Details:`);
      console.log(`焦点申请详情:`);
      console.log(`   ID: ${app.id}`);
      console.log(`   Title: ${app.event_title}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Venue: ${app.venue_name}`);
      console.log(`   Venue Capacity: ${app.venue_capacity}`);
      console.log(`   Party Venue Capacity: ${app.party_venue_capacity}`);
      console.log(`   Team A Info: ${app.team_a_info}`);
      console.log(`   Team B Info: ${app.team_b_info}`);
      
      try {
        if (app.team_a_info) {
          const teamA = JSON.parse(app.team_a_info);
          console.log(`   Team A (parsed): ${JSON.stringify(teamA, null, 2)}`);
        }
        if (app.team_b_info) {
          const teamB = JSON.parse(app.team_b_info);
          console.log(`   Team B (parsed): ${JSON.stringify(teamB, null, 2)}`);
        }
      } catch (error) {
        console.log(`   Team info parsing error: ${error.message}`);
      }
    } else {
      console.log('❌ Featured application not found');
      console.log('❌ 未找到焦点申请');
    }

  } catch (error) {
    console.error('❌ Error checking application team information:', error);
    console.error('❌ 检查申请队伍信息时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the check
// 运行检查
checkApplicationTeamInfo().then(() => {
  console.log('\n✨ Application team info check completed');
  console.log('✨ 申请队伍信息检查完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Check failed:', error);
  console.error('💥 检查失败:', error);
  process.exit(1);
}); 