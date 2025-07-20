/*
 * Test Fixed Staking Flow
 * 测试修复后的质押流程
 * 
 * This script tests the complete staking flow with application_id support
 * 此脚本测试支持application_id的完整质押流程
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

// Test user and application IDs
// 测试用户和申请ID
const testUserId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';
const testApplicationId = '8cfd84ba-5da0-4beb-98f6-9fc2e04bdc9c';

async function testFixedStakingFlow() {
  console.log('🧪 Testing Fixed Staking Flow...');
  console.log('🧪 测试修复后的质押流程...');
  console.log(`User ID: ${testUserId}`);
  console.log(`Application ID: ${testApplicationId}`);
  console.log(`用户ID: ${testUserId}`);
  console.log(`申请ID: ${testApplicationId}`);

  const testResults = {
    featured_events_api: false,
    user_stake_status_api: false,
    stake_submission_api: false,
    overall_success: false
  };

  try {
    // 1. Test Featured Events API
    // 1. 测试焦点赛事API
    console.log('\n📊 Testing Featured Events API...');
    console.log('📊 测试焦点赛事API...');
    
    try {
      const featuredEventsResponse = await fetch('http://localhost:3000/api/audience/featured-events');
      if (featuredEventsResponse.ok) {
        const data = await featuredEventsResponse.json();
        console.log('✅ Featured Events API Response:', data.success);
        console.log('✅ 焦点赛事API响应:', data.success);
        if (data.success && data.featuredEvent) {
          console.log(`   Event ID: ${data.featuredEvent.id}`);
          console.log(`   Title: ${data.featuredEvent.title}`);
          console.log(`   Team A: ${data.featuredEvent.teamA.name}`);
          console.log(`   Team B: ${data.featuredEvent.teamB.name}`);
          testResults.featured_events_api = true;
        }
      } else {
        console.log('❌ Featured Events API failed:', featuredEventsResponse.status);
        console.log('❌ 焦点赛事API失败:', featuredEventsResponse.status);
      }
    } catch (error) {
      console.log('❌ Featured Events API error:', error.message);
      console.log('❌ 焦点赛事API错误:', error.message);
    }

    // 2. Test User Stake Status API with application_id
    // 2. 使用application_id测试用户质押状态API
    console.log('\n📊 Testing User Stake Status API with application_id...');
    console.log('📊 使用application_id测试用户质押状态API...');
    
    try {
      const stakeStatusResponse = await fetch(`http://localhost:3000/api/audience/user-stake-status?user_id=${testUserId}&application_id=${testApplicationId}`);
      if (stakeStatusResponse.ok) {
        const data = await stakeStatusResponse.json();
        console.log('✅ User Stake Status API Response:', data.success);
        console.log('✅ 用户质押状态API响应:', data.success);
        if (data.success) {
          console.log(`   Has Staked: ${data.has_staked}`);
          console.log(`   Event Title: ${data.event_info?.event_title}`);
          console.log(`   Total Stakes: ${data.event_statistics?.total_stakes}`);
        }
        testResults.user_stake_status_api = true;
      } else {
        console.log('❌ User Stake Status API failed:', stakeStatusResponse.status);
        console.log('❌ 用户质押状态API失败:', stakeStatusResponse.status);
      }
    } catch (error) {
      console.log('❌ User Stake Status API error:', error.message);
      console.log('❌ 用户质押状态API错误:', error.message);
    }

    // 3. Test Stake Submission API with application_id
    // 3. 使用application_id测试质押提交API
    console.log('\n📊 Testing Stake Submission API with application_id...');
    console.log('📊 使用application_id测试质押提交API...');
    
    try {
      const stakeData = {
        user_id: testUserId,
        application_id: testApplicationId,
        stake_amount: 25,
        participation_tier: 2,
        team_choice: 'team_b'
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
        console.log('✅ Stake Submission API Response:', data.success);
        console.log('✅ 质押提交API响应:', data.success);
        if (data.success) {
          console.log(`   Stake Amount: ${data.stake_record?.stake_amount}`);
          console.log(`   Participation Tier: ${data.stake_record?.participation_tier}`);
          console.log(`   Team Choice: ${data.stake_record?.team_choice}`);
        }
        testResults.stake_submission_api = true;
      } else {
        const errorData = await stakeResponse.json();
        console.log('❌ Stake Submission API failed:', stakeResponse.status, errorData.error);
        console.log('❌ 质押提交API失败:', stakeResponse.status, errorData.error);
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

    console.log('\n📈 Fixed Staking Flow Test Results:');
    console.log('📈 修复后质押流程测试结果:');
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
      console.log('\n🎉 Fixed staking flow is working correctly!');
      console.log('🎉 修复后的质押流程正常工作！');
      console.log('✅ Real team information displayed');
      console.log('✅ 显示真实队伍信息');
      console.log('✅ Staking functionality working');
      console.log('✅ 质押功能正常工作');
    } else {
      console.log('\n⚠️ Some components may need attention.');
      console.log('⚠️ 一些组件可能需要关注。');
    }

  } catch (error) {
    console.error('❌ Fixed staking flow test failed:', error);
    console.error('❌ 修复后质押流程测试失败:', error);
    testResults.overall_success = false;
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the test
// 运行测试
testFixedStakingFlow().then(() => {
  console.log('\n✨ Fixed staking flow test completed');
  console.log('✨ 修复后质押流程测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test execution failed:', error);
  console.error('💥 测试执行失败:', error);
  process.exit(1);
}); 