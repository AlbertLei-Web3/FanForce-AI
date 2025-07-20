/*
 * Test Frontend API Integration
 * 测试前端API集成
 * 
 * This script tests the actual API calls that the frontend makes
 * 此脚本测试前端实际进行的API调用
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

// Test user and event IDs - using real data from database
// 测试用户和赛事ID - 使用数据库中的真实数据
const testUserId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';
const testEventId = 'ac793df8-7dd8-4aae-943e-de10fcafadc0';

async function testFrontendAPIIntegration() {
  console.log('🧪 Testing Frontend API Integration...');
  console.log('🧪 测试前端API集成...');
  console.log(`User ID: ${testUserId}`);
  console.log(`Event ID: ${testEventId}`);
  console.log(`用户ID: ${testUserId}`);
  console.log(`赛事ID: ${testEventId}`);

  const testResults = {
    featured_events_api: false,
    user_stake_status_api: false,
    stake_submission_api: false,
    overall_success: false
  };

  try {
    // 1. Test Featured Events API (what frontend calls on load)
    // 1. 测试焦点赛事API（前端加载时调用）
    console.log('\n📊 Testing Featured Events API...');
    console.log('📊 测试焦点赛事API...');
    
    try {
      const featuredEventsResponse = await fetch('http://localhost:3000/api/audience/featured-events');
      if (featuredEventsResponse.ok) {
        const data = await featuredEventsResponse.json();
        console.log('✅ Featured Events API Response:', data);
        console.log('✅ 焦点赛事API响应:', data);
        testResults.featured_events_api = true;
      } else {
        console.log('❌ Featured Events API failed:', featuredEventsResponse.status);
        console.log('❌ 焦点赛事API失败:', featuredEventsResponse.status);
      }
    } catch (error) {
      console.log('❌ Featured Events API error:', error.message);
      console.log('❌ 焦点赛事API错误:', error.message);
    }

    // 2. Test User Stake Status API (what frontend calls after loading featured event)
    // 2. 测试用户质押状态API（前端加载焦点赛事后调用）
    console.log('\n📊 Testing User Stake Status API...');
    console.log('📊 测试用户质押状态API...');
    
    try {
      const stakeStatusResponse = await fetch(`http://localhost:3000/api/audience/user-stake-status?user_id=${testUserId}&event_id=${testEventId}`);
      if (stakeStatusResponse.ok) {
        const data = await stakeStatusResponse.json();
        console.log('✅ User Stake Status API Response:', data);
        console.log('✅ 用户质押状态API响应:', data);
        testResults.user_stake_status_api = true;
      } else {
        console.log('❌ User Stake Status API failed:', stakeStatusResponse.status);
        console.log('❌ 用户质押状态API失败:', stakeStatusResponse.status);
      }
    } catch (error) {
      console.log('❌ User Stake Status API error:', error.message);
      console.log('❌ 用户质押状态API错误:', error.message);
    }

    // 3. Test Stake Submission API (what frontend calls when user submits stake)
    // 3. 测试质押提交API（用户提交质押时前端调用）
    console.log('\n📊 Testing Stake Submission API...');
    console.log('📊 测试质押提交API...');
    
    try {
      const stakeData = {
        user_id: testUserId,
        event_id: testEventId,
        stake_amount: 50,
        participation_tier: 2,
        team_choice: 'team_a'
      };

      const stakeResponse = await fetch('http://localhost:3000/api/audience/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stakeData)
      });

      if (stakeResponse.ok) {
        const data = await stakeResponse.json();
        console.log('✅ Stake Submission API Response:', data);
        console.log('✅ 质押提交API响应:', data);
        testResults.stake_submission_api = true;
      } else {
        const errorData = await stakeResponse.json();
        console.log('❌ Stake Submission API failed:', stakeResponse.status, errorData);
        console.log('❌ 质押提交API失败:', stakeResponse.status, errorData);
      }
    } catch (error) {
      console.log('❌ Stake Submission API error:', error.message);
      console.log('❌ 质押提交API错误:', error.message);
    }

    // Calculate overall success
    // 计算整体成功
    const successCount = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length - 1; // Exclude overall_success
    testResults.overall_success = successCount >= totalTests * 0.8; // 80% success threshold

    console.log('\n📈 Frontend API Integration Test Results:');
    console.log('📈 前端API集成测试结果:');
    console.log(`   Featured Events API: ${testResults.featured_events_api ? '✅' : '❌'}`);
    console.log(`   焦点赛事API: ${testResults.featured_events_api ? '✅' : '❌'}`);
    console.log(`   User Stake Status API: ${testResults.user_stake_status_api ? '✅' : '❌'}`);
    console.log(`   用户质押状态API: ${testResults.user_stake_status_api ? '✅' : '❌'}`);
    console.log(`   Stake Submission API: ${testResults.stake_submission_api ? '✅' : '❌'}`);
    console.log(`   质押提交API: ${testResults.stake_submission_api ? '✅' : '❌'}`);
    
    console.log(`\n🎯 Overall Success: ${testResults.overall_success ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🎯 整体成功: ${testResults.overall_success ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   Success Rate: ${Math.round((successCount / totalTests) * 100)}%`);
    console.log(`   成功率: ${Math.round((successCount / totalTests) * 100)}%`);

    if (testResults.overall_success) {
      console.log('\n🎉 Frontend API integration is working correctly!');
      console.log('🎉 前端API集成正常工作！');
    } else {
      console.log('\n⚠️ Some API endpoints may need attention.');
      console.log('⚠️ 一些API端点可能需要关注。');
    }

  } catch (error) {
    console.error('❌ Frontend API integration test failed:', error);
    console.error('❌ 前端API集成测试失败:', error);
    testResults.overall_success = false;
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the test
// 运行测试
testFrontendAPIIntegration().then(() => {
  console.log('\n✨ Frontend API integration test finished');
  console.log('✨ 前端API集成测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test execution failed:', error);
  console.error('💥 测试执行失败:', error);
  process.exit(1);
}); 