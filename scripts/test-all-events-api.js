/*
 * Test All Events API
 * 测试所有赛事API
 * 
 * This script tests the All Events API endpoint
 * 此脚本测试所有赛事API端点
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

async function testAllEventsAPI() {
  console.log('🧪 Testing All Events API...');
  console.log('🧪 测试所有赛事API...');

  try {
    // Step 1: Test the API endpoint
    // 步骤1: 测试API端点
    console.log('\n📊 Step 1: Testing API endpoint...');
    console.log('📊 步骤1: 测试API端点...');
    
    const response = await fetch('http://localhost:3000/api/audience/all-events');
    const data = await response.json();
    
    console.log('✅ All Events API Response:');
    console.log('✅ 所有赛事API响应:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log(`\n📊 Found ${data.events.length} events`);
      console.log(`📊 找到 ${data.events.length} 个赛事`);
      
      // Step 2: Display event details
      // 步骤2: 显示赛事详情
      if (data.events.length > 0) {
        console.log('\n📊 Event Details:');
        console.log('📊 赛事详情:');
        
        data.events.forEach((event, index) => {
          console.log(`\n${index + 1}. Event: ${event.title}`);
          console.log(`   ID: ${event.id}`);
          console.log(`   Date: ${event.date} ${event.time}`);
          console.log(`   Venue: ${event.venue}`);
          console.log(`   Status: ${event.status}`);
          console.log(`   Current Stakers: ${event.currentStakers}`);
          console.log(`   Total Pool: ${event.totalPool} CHZ`);
          console.log(`   Pool Balance After: ${event.poolBalanceAfter} CHZ`);
          console.log(`   Team A: ${event.teamA.name} ${event.teamA.icon}`);
          console.log(`   Team B: ${event.teamB.name} ${event.teamB.icon}`);
          console.log(`   Ambassador: ${event.ambassadorInfo.name} (${event.ambassadorInfo.contact})`);
        });
      }
    } else {
      console.log('❌ API returned error:', data.error);
      console.log('❌ API返回错误:', data.error);
    }

    // Step 3: Verify database data
    // 步骤3: 验证数据库数据
    console.log('\n📊 Step 2: Verifying database data...');
    console.log('📊 步骤2: 验证数据库数据...');
    
    const dbEvents = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.event_date,
        e.status,
        COUNT(DISTINCT usr.user_id) as stakers_count,
        SUM(usr.stake_amount) as total_pool
      FROM events e
      LEFT JOIN user_stake_records usr ON e.id = usr.event_id AND usr.status = 'active'
      WHERE e.status = 'active' AND e.event_date > NOW()
      GROUP BY e.id
      ORDER BY e.event_date ASC
    `);
    
    console.log(`📊 Database has ${dbEvents.rows.length} active events`);
    console.log(`📊 数据库有 ${dbEvents.rows.length} 个活跃赛事`);
    
    dbEvents.rows.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (${event.stakers_count} stakers, ${event.total_pool || 0} CHZ)`);
    });

  } catch (error) {
    console.error('❌ Error testing All Events API:', error);
    console.error('❌ 测试所有赛事API时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the test
// 运行测试
testAllEventsAPI().then(() => {
  console.log('\n✨ All Events API test completed');
  console.log('✨ 所有赛事API测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  console.error('💥 测试失败:', error);
  process.exit(1);
}); 