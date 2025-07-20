// Test script to check real team names from database
// 检查数据库中真实队伍名称的测试脚本

const { Pool } = require('pg');

// Database connection pool
// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
});

async function checkTeamNames() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking real team names from database...');
    console.log('🔍 检查数据库中的真实队伍名称...');
    
    // Check team names from event_applications table
    // 检查event_applications表中的队伍名称
    console.log('\n📊 Checking team names from event_applications...');
    console.log('📊 检查event_applications表中的队伍名称...');
    
    const teamNamesQuery = `
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
      LIMIT 3
    `;
    
    const teamNamesResult = await client.query(teamNamesQuery);
    
    if (teamNamesResult.rows.length > 0) {
      console.log('✅ Found team data:');
      console.log('✅ 找到队伍数据:');
      
      teamNamesResult.rows.forEach((row, index) => {
        console.log(`\n  ${index + 1}. Event: ${row.event_title}`);
        console.log(`     Status: ${row.status}`);
        console.log(`     Created: ${row.created_at}`);
        
        // Parse team info
        // 解析队伍信息
        try {
          const teamAInfo = typeof row.team_a_info === 'string' ? JSON.parse(row.team_a_info || '{}') : row.team_a_info;
          const teamBInfo = typeof row.team_b_info === 'string' ? JSON.parse(row.team_b_info || '{}') : row.team_b_info;
          
          console.log(`     Team A: ${teamAInfo.name || 'Unknown'}`);
          console.log(`     Team B: ${teamBInfo.name || 'Unknown'}`);
          console.log(`     Team A Raw: ${JSON.stringify(teamAInfo)}`);
          console.log(`     Team B Raw: ${JSON.stringify(teamBInfo)}`);
        } catch (error) {
          console.log(`     Team A: ${row.team_a_info || 'Unknown'}`);
          console.log(`     Team B: ${row.team_b_info || 'Unknown'}`);
        }
      });
    } else {
      console.log('❌ No approved events found');
      console.log('❌ 未找到已批准的赛事');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ 测试失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
// 运行测试
checkTeamNames()
  .then(() => {
    console.log('\n🎉 Team names check completed!');
    console.log('🎉 队伍名称检查完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Team names check failed:', error);
    console.error('💥 队伍名称检查失败:', error);
    process.exit(1);
  }); 