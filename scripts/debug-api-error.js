// Debug API error script
// 调试API错误脚本

// Use built-in fetch for Node.js 18+
// 使用Node.js 18+内置的fetch

async function debugAPIError() {
  console.log('🔍 Debugging API error...');
  console.log('🔍 调试API错误...');

  // Test data that matches what frontend would send
  // 测试数据，匹配前端发送的内容
  const testData = {
    eventId: '05d525b3-38bc-42f1-8a45-f7d16d0a46c5',
    teamAScore: 2,
    teamBScore: 1,
    winner: 'team_a',
    notes: 'Debug test match result',
    announcedBy: '1de6110a-f982-4f7f-979e-00e7f7d33bed'
  };

  try {
    console.log('📡 Making API call to /api/events/update-match-result...');
    console.log('📡 调用API /api/events/update-match-result...');
    console.log('Request data:', testData);
    console.log('请求数据:', testData);

    const response = await fetch('http://localhost:3000/api/events/update-match-result', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('响应状态:', response.status);
    console.log('Response headers:', response.headers);
    console.log('响应头:', response.headers);

    const result = await response.text();
    console.log('Response body:', result);
    console.log('响应体:', result);

    try {
      const jsonResult = JSON.parse(result);
      console.log('Parsed JSON:', jsonResult);
      console.log('解析的JSON:', jsonResult);
    } catch (parseError) {
      console.log('Failed to parse response as JSON:', parseError.message);
      console.log('无法将响应解析为JSON:', parseError.message);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('❌ 网络错误:', error.message);
  }
}

// Check if server is running
// 检查服务器是否运行
async function checkServerStatus() {
  console.log('\n🌐 Checking server status...');
  console.log('🌐 检查服务器状态...');

  try {
    const response = await fetch('http://localhost:3000/api/ambassador/recent-events?ambassador_id=1de6110a-f982-4f7f-979e-00e7f7d33bed');
    console.log('Server is running, status:', response.status);
    console.log('服务器正在运行，状态:', response.status);
  } catch (error) {
    console.error('❌ Server not running or not accessible:', error.message);
    console.error('❌ 服务器未运行或无法访问:', error.message);
    console.log('Please start the development server with: npm run dev');
    console.log('请启动开发服务器: npm run dev');
  }
}

// Test database connection
// 测试数据库连接
async function testDatabaseConnection() {
  console.log('\n🗄️ Testing database connection...');
  console.log('🗄️ 测试数据库连接...');

  const { Pool } = require('pg');
  
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fanforce_ai',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    console.log('✅ 数据库连接成功');

    // Test if the event exists
    // 测试活动是否存在
    const eventQuery = 'SELECT id, title, status FROM events WHERE id = $1';
    const eventResult = await client.query(eventQuery, ['05d525b3-38bc-42f1-8a45-f7d16d0a46c5']);
    
    if (eventResult.rows.length > 0) {
      console.log('✅ Event found:', eventResult.rows[0]);
      console.log('✅ 找到活动:', eventResult.rows[0]);
    } else {
      console.log('❌ Event not found in database');
      console.log('❌ 数据库中未找到活动');
    }

    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ 数据库连接失败:', error.message);
  } finally {
    await pool.end();
  }
}

// Run all debug functions
// 运行所有调试函数
async function runDebug() {
  console.log('🚀 Starting API error debug...');
  console.log('🚀 开始API错误调试...');
  
  await checkServerStatus();
  await testDatabaseConnection();
  await debugAPIError();
  
  console.log('\n🎉 Debug completed!');
  console.log('🎉 调试完成！');
}

// Run if this file is executed directly
// 如果直接执行此文件则运行
if (require.main === module) {
  runDebug();
}

module.exports = { debugAPIError, checkServerStatus, testDatabaseConnection, runDebug }; 