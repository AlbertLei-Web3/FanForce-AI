// FanForce AI API Testing Script
// FanForce AI API测试脚本
// This script tests all API endpoints to ensure they work correctly
// 此脚本测试所有API端点以确保它们正常工作

const axios = require('axios');
const { Pool } = require('pg');

// Configuration
// 配置
const API_BASE_URL = 'http://localhost:3001';
const DB_PASSWORD = 'your_password'; // Replace with your actual password / 替换为你的实际密码

// Database configuration
// 数据库配置
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: DB_PASSWORD
});

// Test data
// 测试数据
const testWalletAddress = '0x1234567890123456789012345678901234567890';
const testSignature = 'test_signature_would_be_here';

// Colors for console output
// 控制台输出颜色
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// Helper function to log with colors
// 彩色日志助手函数
function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// Helper function to make API requests
// API请求助手函数
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test database connection
// 测试数据库连接
async function testDatabaseConnection() {
  log('\n📊 Testing Database Connection...', 'blue');
  log('📊 测试数据库连接...', 'blue');
  
  try {
    const result = await pool.query('SELECT NOW() as current_time, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
    log('✅ Database connection successful', 'green');
    log('✅ 数据库连接成功', 'green');
    log(`📅 Current time: ${result.rows[0].current_time}`);
    log(`📊 Tables: ${result.rows[0].table_count}`);
    return true;
  } catch (error) {
    log('❌ Database connection failed: ' + error.message, 'red');
    log('❌ 数据库连接失败: ' + error.message, 'red');
    return false;
  }
}

// Test health check endpoint
// 测试健康检查端点
async function testHealthCheck() {
  log('\n🏥 Testing Health Check Endpoint...', 'blue');
  log('🏥 测试健康检查端点...', 'blue');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.success) {
    log('✅ Health check passed', 'green');
    log('✅ 健康检查通过', 'green');
    log(`📊 Status: ${result.data.status}`);
    log(`🌐 Environment: ${result.data.environment}`);
    log(`📍 Database: ${result.data.database}`);
    return true;
  } else {
    log('❌ Health check failed: ' + JSON.stringify(result.error), 'red');
    log('❌ 健康检查失败: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

// Test authentication endpoint
// 测试认证端点
async function testAuthentication() {
  log('\n🔐 Testing Authentication Endpoint...', 'blue');
  log('🔐 测试认证端点...', 'blue');
  
  const result = await makeRequest('POST', '/api/auth/login', {
    walletAddress: testWalletAddress,
    signature: testSignature
  });
  
  if (result.success) {
    log('✅ Authentication successful', 'green');
    log('✅ 认证成功', 'green');
    log(`🔑 Token received: ${result.data.token ? 'Yes' : 'No'}`);
    log(`👤 User role: ${result.data.user?.role}`);
    return { success: true, token: result.data.token };
  } else {
    log('❌ Authentication failed: ' + JSON.stringify(result.error), 'red');
    log('❌ 认证失败: ' + JSON.stringify(result.error), 'red');
    return { success: false };
  }
}

// Test user profile endpoint
// 测试用户档案端点
async function testUserProfile(token) {
  log('\n👤 Testing User Profile Endpoint...', 'blue');
  log('👤 测试用户档案端点...', 'blue');
  
  const result = await makeRequest('GET', '/api/users/profile', null, {
    'Authorization': `Bearer ${token}`
  });
  
  if (result.success) {
    log('✅ User profile retrieved', 'green');
    log('✅ 用户档案获取成功', 'green');
    log(`📧 Wallet: ${result.data.user?.wallet_address}`);
    log(`🎭 Role: ${result.data.user?.role}`);
    log(`💰 Virtual CHZ: ${result.data.user?.virtual_chz_balance}`);
    return true;
  } else {
    log('❌ User profile failed: ' + JSON.stringify(result.error), 'red');
    log('❌ 用户档案获取失败: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

// Test events endpoint
// 测试活动端点
async function testEvents() {
  log('\n🎯 Testing Events Endpoint...', 'blue');
  log('🎯 测试活动端点...', 'blue');
  
  const result = await makeRequest('GET', '/api/events?limit=5');
  
  if (result.success) {
    log('✅ Events retrieved successfully', 'green');
    log('✅ 活动获取成功', 'green');
    log(`📊 Events count: ${result.data.events?.length || 0}`);
    log(`📄 Pagination: ${JSON.stringify(result.data.pagination)}`);
    return true;
  } else {
    log('❌ Events retrieval failed: ' + JSON.stringify(result.error), 'red');
    log('❌ 活动获取失败: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

// Test athletes endpoint
// 测试运动员端点
async function testAthletes() {
  log('\n🏃‍♂️ Testing Athletes Endpoint...', 'blue');
  log('🏃‍♂️ 测试运动员端点...', 'blue');
  
  const result = await makeRequest('GET', '/api/athletes?limit=5');
  
  if (result.success) {
    log('✅ Athletes retrieved successfully', 'green');
    log('✅ 运动员获取成功', 'green');
    log(`📊 Athletes count: ${result.data.athletes?.length || 0}`);
    log(`📄 Pagination: ${JSON.stringify(result.data.pagination)}`);
    return true;
  } else {
    log('❌ Athletes retrieval failed: ' + JSON.stringify(result.error), 'red');
    log('❌ 运动员获取失败: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

// Test venues endpoint
// 测试场馆端点
async function testVenues() {
  log('\n🏟️ Testing Venues Endpoint...', 'blue');
  log('🏟️ 测试场馆端点...', 'blue');
  
  const result = await makeRequest('GET', '/api/venues');
  
  if (result.success) {
    log('✅ Venues retrieved successfully', 'green');
    log('✅ 场馆获取成功', 'green');
    log(`📊 Venues count: ${result.data.venues?.length || 0}`);
    result.data.venues?.forEach(venue => {
      log(`  📍 ${venue.name}: ${venue.capacity} capacity`);
    });
    return true;
  } else {
    log('❌ Venues retrieval failed: ' + JSON.stringify(result.error), 'red');
    log('❌ 场馆获取失败: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

// Test invalid endpoint (404)
// 测试无效端点(404)
async function testInvalidEndpoint() {
  log('\n❓ Testing Invalid Endpoint (404)...', 'blue');
  log('❓ 测试无效端点(404)...', 'blue');
  
  const result = await makeRequest('GET', '/api/nonexistent');
  
  if (!result.success && result.status === 404) {
    log('✅ 404 handling works correctly', 'green');
    log('✅ 404处理正常工作', 'green');
    return true;
  } else {
    log('❌ 404 handling failed', 'red');
    log('❌ 404处理失败', 'red');
    return false;
  }
}

// Test unauthorized access
// 测试未授权访问
async function testUnauthorizedAccess() {
  log('\n🔒 Testing Unauthorized Access...', 'blue');
  log('🔒 测试未授权访问...', 'blue');
  
  const result = await makeRequest('GET', '/api/users/profile');
  
  if (!result.success && result.status === 401) {
    log('✅ Unauthorized access blocked correctly', 'green');
    log('✅ 未授权访问被正确阻止', 'green');
    return true;
  } else {
    log('❌ Unauthorized access not blocked', 'red');
    log('❌ 未授权访问未被阻止', 'red');
    return false;
  }
}

// Run all tests
// 运行所有测试
async function runAllTests() {
  log('🚀 Starting FanForce AI API Tests...', 'yellow');
  log('🚀 开始FanForce AI API测试...', 'yellow');
  log('=' * 50);
  
  const tests = [];
  
  // Test database connection first
  // 首先测试数据库连接
  const dbTest = await testDatabaseConnection();
  tests.push({ name: 'Database Connection', passed: dbTest });
  
  if (!dbTest) {
    log('\n❌ Database connection failed. Please check your configuration.', 'red');
    log('❌ 数据库连接失败。请检查你的配置。', 'red');
    process.exit(1);
  }
  
  // Test health check
  // 测试健康检查
  const healthTest = await testHealthCheck();
  tests.push({ name: 'Health Check', passed: healthTest });
  
  if (!healthTest) {
    log('\n❌ Server is not running. Please start the server first: npm run server', 'red');
    log('❌ 服务器未运行。请先启动服务器：npm run server', 'red');
    process.exit(1);
  }
  
  // Test authentication
  // 测试认证
  const authTest = await testAuthentication();
  tests.push({ name: 'Authentication', passed: authTest.success });
  
  // Test protected routes with token
  // 使用令牌测试受保护的路由
  if (authTest.success) {
    const profileTest = await testUserProfile(authTest.token);
    tests.push({ name: 'User Profile', passed: profileTest });
  }
  
  // Test public routes
  // 测试公共路由
  const eventsTest = await testEvents();
  tests.push({ name: 'Events', passed: eventsTest });
  
  const athletesTest = await testAthletes();
  tests.push({ name: 'Athletes', passed: athletesTest });
  
  const venuesTest = await testVenues();
  tests.push({ name: 'Venues', passed: venuesTest });
  
  // Test error handling
  // 测试错误处理
  const invalidTest = await testInvalidEndpoint();
  tests.push({ name: '404 Handling', passed: invalidTest });
  
  const unauthorizedTest = await testUnauthorizedAccess();
  tests.push({ name: 'Unauthorized Access', passed: unauthorizedTest });
  
  // Summary
  // 摘要
  log('\n📊 Test Results Summary:', 'yellow');
  log('📊 测试结果摘要:', 'yellow');
  log('=' * 50);
  
  let passedCount = 0;
  tests.forEach(test => {
    const status = test.passed ? '✅ PASSED' : '❌ FAILED';
    const color = test.passed ? 'green' : 'red';
    log(`${status} - ${test.name}`, color);
    if (test.passed) passedCount++;
  });
  
  log(`\n📊 Overall: ${passedCount}/${tests.length} tests passed`, passedCount === tests.length ? 'green' : 'red');
  log(`📊 总体：${passedCount}/${tests.length} 测试通过`, passedCount === tests.length ? 'green' : 'red');
  
  if (passedCount === tests.length) {
    log('\n🎉 All tests passed! Your API is ready for development.', 'green');
    log('🎉 所有测试通过！你的API已准备好进行开发。', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the logs above.', 'red');
    log('⚠️  一些测试失败。请检查上面的日志。', 'red');
  }
  
  // Close database connection
  // 关闭数据库连接
  await pool.end();
}

// Check if axios is available
// 检查axios是否可用
async function checkDependencies() {
  try {
    require('axios');
    return true;
  } catch (error) {
    log('❌ axios not found. Installing...', 'red');
    log('❌ 未找到axios。正在安装...', 'red');
    
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('npm install axios', (error) => {
        if (error) {
          log('❌ Failed to install axios: ' + error.message, 'red');
          log('❌ 安装axios失败: ' + error.message, 'red');
          resolve(false);
        } else {
          log('✅ axios installed successfully', 'green');
          log('✅ axios安装成功', 'green');
          resolve(true);
        }
      });
    });
  }
}

// Main execution
// 主要执行
async function main() {
  const depsReady = await checkDependencies();
  if (!depsReady) {
    log('❌ Dependencies not ready. Please install axios manually: npm install axios', 'red');
    log('❌ 依赖项未准备好。请手动安装axios：npm install axios', 'red');
    process.exit(1);
  }
  
  await runAllTests();
}

// Run if this file is executed directly
// 如果直接执行此文件则运行
if (require.main === module) {
  main();
}

module.exports = { runAllTests }; 