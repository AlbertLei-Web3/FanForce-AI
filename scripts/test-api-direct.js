// Direct API test script
// 直接API测试脚本

async function testAPIDirect() {
  console.log('🔍 Testing API directly...');
  console.log('🔍 直接测试API...');

  const testData = {
    eventId: '05d525b3-38bc-42f1-8a45-f7d16d0a46c5',
    teamAScore: 2,
    teamBScore: 1,
    winner: 'team_a',
    notes: 'Direct API test',
    announcedBy: '1de6110a-f982-4f7f-979e-00e7f7d33bed'
  };

  try {
    console.log('📡 Making direct API call...');
    console.log('📡 进行直接API调用...');
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
      console.log('✅ API call successful');
      console.log('✅ API调用成功');
    } else {
      console.log('❌ API call failed');
      console.log('❌ API调用失败');
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.error('❌ 网络错误:', error.message);
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  testAPIDirect();
}

module.exports = { testAPIDirect }; 