/*
 * Test Featured Events API
 * 测试焦点赛事API
 * 
 * This script specifically tests the featured events API and checks team information
 * 此脚本专门测试焦点赛事API并检查队伍信息
 */

async function testFeaturedEventsAPI() {
  console.log('🧪 Testing Featured Events API...');
  console.log('🧪 测试焦点赛事API...');

  try {
    const response = await fetch('http://localhost:3000/api/audience/featured-events');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Featured Events API Response:');
      console.log('✅ 焦点赛事API响应:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success && data.featuredEvent) {
        const event = data.featuredEvent;
        console.log('\n📊 Featured Event Details:');
        console.log('📊 焦点赛事详情:');
        console.log(`   ID: ${event.id}`);
        console.log(`   Title: ${event.title}`);
        console.log(`   Description: ${event.description}`);
        console.log(`   Date: ${event.date}`);
        console.log(`   Time: ${event.time}`);
        console.log(`   Venue: ${event.venue}`);
        console.log(`   Current Stakers: ${event.currentStakers}`);
        console.log(`   Total Pool: ${event.totalPool} CHZ`);
        console.log(`   Pool Balance After: ${event.poolBalanceAfter} CHZ`);
        
        console.log('\n🏆 Team Information:');
        console.log('🏆 队伍信息:');
        console.log(`   Team A: ${event.teamA.name} ${event.teamA.icon}`);
        console.log(`   Team B: ${event.teamB.name} ${event.teamB.icon}`);
        
        console.log('\n👤 Ambassador Information:');
        console.log('👤 大使信息:');
        console.log(`   Name: ${event.ambassadorInfo.name}`);
        console.log(`   Contact: ${event.ambassadorInfo.contact}`);
        
        console.log('\n🎉 Featured Events API is working correctly!');
        console.log('🎉 焦点赛事API正常工作！');
      } else {
        console.log('❌ Featured event data is missing');
        console.log('❌ 焦点赛事数据缺失');
      }
    } else {
      console.log('❌ Featured Events API failed:', response.status);
      console.log('❌ 焦点赛事API失败:', response.status);
      const errorData = await response.json();
      console.log('Error details:', errorData);
      console.log('错误详情:', errorData);
    }
  } catch (error) {
    console.error('❌ Featured Events API error:', error);
    console.error('❌ 焦点赛事API错误:', error);
  }
}

// Run the test
// 运行测试
testFeaturedEventsAPI().then(() => {
  console.log('\n✨ Featured Events API test completed');
  console.log('✨ 焦点赛事API测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  console.error('💥 测试失败:', error);
  process.exit(1);
}); 