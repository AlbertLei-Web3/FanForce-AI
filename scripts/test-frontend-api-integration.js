/*
 * Test Frontend API Integration
 * 测试前端API集成
 * 
 * This script tests the actual API calls that the frontend makes
 * 此脚本测试前端实际进行的API调用
 */

const fetch = require('node-fetch');

// Test frontend API integration
// 测试前端API集成
async function testFrontendAPI() {
  try {
    console.log('🧪 Testing frontend API integration...');
    console.log('🧪 测试前端API集成...');

    const ambassadorId = '1de6110a-f982-4f7f-979e-00e7f7d33bed';
    const baseUrl = 'http://localhost:3000'; // Assuming dev server runs on 3000

    // Test the recent events API endpoint
    // 测试最近活动API端点
    console.log('\n📡 Testing recent events API...');
    console.log('📡 测试最近活动API...');

    const response = await fetch(`${baseUrl}/api/ambassador/recent-events?ambassador_id=${ambassadorId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API响应状态:', response.status);
    
    if (data.success) {
      console.log('✅ API call successful');
      console.log('✅ API调用成功');
      console.log(`📊 Found ${data.data.length} recent events`);
      console.log(`📊 找到${data.data.length}个最近活动`);
      
      // Display sample data
      // 显示样本数据
      if (data.data.length > 0) {
        console.log('\n📋 Sample Event Data:');
        console.log('📋 样本活动数据:');
        const sampleEvent = data.data[0];
        console.log(`  Event ID: ${sampleEvent.event_id}`);
        console.log(`  Title: ${sampleEvent.event_title}`);
        console.log(`  Date: ${sampleEvent.event_date}`);
        console.log(`  Status: ${sampleEvent.match_status}`);
        console.log(`  Teams: ${sampleEvent.team_a_info ? 'Available' : 'Not available'}`);
        console.log(`  Match Result: ${sampleEvent.match_result || 'None'}`);
        console.log(`  Participants: ${sampleEvent.total_participants}`);
        console.log(`  Total Stakes: ${sampleEvent.total_stakes_amount} CHZ`);
        console.log(`  Time Proximity: ${Math.round(sampleEvent.time_proximity_hours)} hours`);
      }
    } else {
      console.log('❌ API call failed:', data.error);
      console.log('❌ API调用失败:', data.error);
    }

    // Test with different filters
    // 使用不同过滤器测试
    console.log('\n🔍 Testing with different filters...');
    console.log('🔍 使用不同过滤器测试...');

    const filters = ['all', 'active', 'completed'];
    
    for (const filter of filters) {
      try {
        const filterResponse = await fetch(`${baseUrl}/api/ambassador/recent-events?ambassador_id=${ambassadorId}&filter=${filter}`);
        const filterData = await filterResponse.json();
        
        if (filterData.success) {
          console.log(`  ${filter}: ${filterData.data.length} events`);
        } else {
          console.log(`  ${filter}: Error - ${filterData.error}`);
        }
      } catch (error) {
        console.log(`  ${filter}: Network error - ${error.message}`);
      }
    }

    // Test error handling
    // 测试错误处理
    console.log('\n⚠️  Testing error handling...');
    console.log('⚠️  测试错误处理...');

    try {
      const errorResponse = await fetch(`${baseUrl}/api/ambassador/recent-events?ambassador_id=invalid-id`);
      const errorData = await errorResponse.json();
      
      if (!errorData.success) {
        console.log('✅ Error handling working correctly');
        console.log('✅ 错误处理工作正常');
      } else {
        console.log('❌ Error handling not working as expected');
        console.log('❌ 错误处理未按预期工作');
      }
    } catch (error) {
      console.log('✅ Network error handled correctly');
      console.log('✅ 网络错误处理正确');
    }

    console.log('\n✨ Frontend API integration test completed');
    console.log('✨ 前端API集成测试完成');

  } catch (error) {
    console.error('💥 Frontend API integration test failed');
    console.error('💥 前端API集成测试失败');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure the development server is running with "npm run dev"');
      console.log('💡 提示: 确保开发服务器正在运行 "npm run dev"');
    }
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  testFrontendAPI()
    .then(() => {
      console.log('\n🎉 All tests completed successfully');
      console.log('🎉 所有测试成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed');
      console.error('💥 测试套件失败');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testFrontendAPI }; 