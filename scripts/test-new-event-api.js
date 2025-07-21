// Test API with the new event ID from frontend
// 使用前端提供的新eventId测试API

async function testNewEventAPI() {
  console.log('🔍 Testing API with new event ID...');
  console.log('🔍 使用新eventId测试API...');

  const testData = {
    eventId: '9b33b55c-c09e-41b9-b031-1c8680dd636a',
    teamAScore: 3,
    teamBScore: 2,
    winner: 'team_a',
    notes: '',
    announcedBy: '1de6110a-f982-4f7f-979e-00e7f7d33bed'
  };

  try {
    console.log('📡 Making API call for new event...');
    console.log('📡 为新活动进行API调用...');
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
    console.log('Response status text:', response.statusText);
    console.log('响应状态文本:', response.statusText);

    const result = await response.text();
    console.log('Response body:', result);
    console.log('响应体:', result);

    if (response.ok) {
      console.log('✅ API call successful for new event');
      console.log('✅ 新活动的API调用成功');
    } else {
      console.log('❌ API call failed for new event');
      console.log('❌ 新活动的API调用失败');
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('❌ 网络错误:', error.message);
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  testNewEventAPI();
}

module.exports = { testNewEventAPI }; 