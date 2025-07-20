// Test script for team name display with gladiator helmet emojis
// 测试队伍名称显示与角斗士头盔emoji的脚本

const { Pool } = require('pg');

// Database connection pool
// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function testTeamDisplay() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing team name display with gladiator helmet emojis...');
    console.log('🔍 测试队伍名称显示与角斗士头盔emoji...');
    
    // Test the featured events API query with team names
    // 测试包含队伍名称的焦点赛事API查询
    console.log('\n📊 Testing featured events API with team names...');
    console.log('📊 测试包含队伍名称的焦点赛事API...');
    
    const featuredEventQuery = `
      SELECT 
        ea.id,
        ea.event_title,
        ea.team_a_info,
        ea.team_b_info,
        ea.status,
        -- Fixed: Get the latest pool balance after from chz_pool_management through events table
        -- 修复: 通过events表从chz_pool_management获取最新的pool_balance_after
        COALESCE((
          SELECT cpm.pool_balance_after 
          FROM chz_pool_management cpm
          JOIN events e ON cpm.event_id = e.id
          WHERE e.application_id = ea.id 
          ORDER BY cpm.created_at DESC 
          LIMIT 1
        ), 0) as pool_balance_after
      FROM event_applications ea
      WHERE ea.status = 'approved'
      ORDER BY ea.created_at DESC
      LIMIT 1
    `;
    
    const featuredEventResult = await client.query(featuredEventQuery);
    
    if (featuredEventResult.rows.length > 0) {
      const event = featuredEventResult.rows[0];
      
      // Safe JSON parsing function
      // 安全JSON解析函数
      const safeJsonParse = (value) => {
        try {
          if (!value) return {};
          if (typeof value === 'object') return value;
          return JSON.parse(value);
        } catch (error) {
          console.error('JSON parse error:', error, 'Value:', value);
          return {};
        }
      };
      
      const teamAInfo = safeJsonParse(event.team_a_info);
      const teamBInfo = safeJsonParse(event.team_b_info);
      
      console.log('✅ Featured event team display:');
      console.log('✅ 焦点赛事队伍显示:');
      console.log(`  Event: ${event.event_title}`);
      console.log(`  Status: ${event.status}`);
      console.log(`  Pool Balance: ${event.pool_balance_after} CHZ`);
      console.log('');
      console.log('  Team A:');
      console.log(`    Icon: 🛡️`);
      console.log(`    Name: ${teamAInfo.name || 'Unknown'}`);
      console.log('');
      console.log('  Team B:');
      console.log(`    Icon: ⚔️`);
      console.log(`    Name: ${teamBInfo.name || 'Unknown'}`);
      console.log('');
      console.log('  Display Format:');
      console.log(`    🛡️ ${teamAInfo.name || 'Team A'} VS ⚔️ ${teamBInfo.name || 'Team B'}`);
    } else {
      console.log('❌ No approved events found');
      console.log('❌ 未找到已批准的赛事');
    }
    
    // Test API endpoint (if server is running)
    // 测试API端点（如果服务器正在运行）
    console.log('\n🌐 Testing API endpoint with team names...');
    console.log('🌐 测试包含队伍名称的API端点...');
    
    try {
      const response = await fetch('http://localhost:3000/api/audience/featured-events');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API endpoint working correctly:');
        console.log('✅ API端点工作正常:');
        console.log(`  Event Title: ${data.featuredEvent.title}`);
        console.log(`  Team A: ${data.featuredEvent.teamA.icon} ${data.featuredEvent.teamA.name}`);
        console.log(`  Team B: ${data.featuredEvent.teamB.icon} ${data.featuredEvent.teamB.name}`);
        console.log(`  Pool Balance: ${data.featuredEvent.poolBalanceAfter} CHZ`);
      } else {
        console.log('❌ API endpoint returned error:');
        console.log('❌ API端点返回错误:');
        console.log(`  Error: ${data.error}`);
      }
    } catch (error) {
      console.log('❌ API endpoint test failed (server may not be running):');
      console.log('❌ API端点测试失败（服务器可能未运行）:');
      console.log(`  Error: ${error.message}`);
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
testTeamDisplay()
  .then(() => {
    console.log('\n🎉 Team display test completed!');
    console.log('🎉 队伍显示测试完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Team display test failed:', error);
    console.error('💥 队伍显示测试失败:', error);
    process.exit(1);
  }); 