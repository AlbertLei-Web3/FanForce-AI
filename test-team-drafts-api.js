// Test team-drafts API functionality
// 测试 team-drafts API 功能

const fetch = require('node-fetch');

async function testTeamDraftsAPI() {
  console.log('Testing team-drafts API...');
  console.log('测试 team-drafts API...');
  
  try {
    // Test GET request without parameters (should return error for missing ambassador_id)
    console.log('\n1. Testing GET without ambassador_id...');
    console.log('1. 测试没有 ambassador_id 的 GET 请求...');
    
    const response1 = await fetch('http://localhost:3000/api/ambassador/team-drafts');
    const data1 = await response1.json();
    console.log('Response:', data1);
    console.log('响应:', data1);
    
    // Test GET request with ambassador_id
    console.log('\n2. Testing GET with ambassador_id...');
    console.log('2. 测试带有 ambassador_id 的 GET 请求...');
    
    const response2 = await fetch('http://localhost:3000/api/ambassador/team-drafts?ambassador_id=test_ambassador');
    const data2 = await response2.json();
    console.log('Response:', data2);
    console.log('响应:', data2);
    
    // Test POST request to create a draft
    console.log('\n3. Testing POST to create draft...');
    console.log('3. 测试 POST 创建草稿...');
    
    const draftData = {
      ambassador_id: 'test_ambassador',
      draft_name: 'Test Draft',
      sport_type: 'soccer',
      team_a_name: 'Team A',
      team_a_athletes: [],
      team_a_metadata: {},
      team_b_name: 'Team B',
      team_b_athletes: [],
      team_b_metadata: {},
      status: 'draft',
      estimated_duration: 90,
      match_notes: 'Test draft'
    };
    
    const response3 = await fetch('http://localhost:3000/api/ambassador/team-drafts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(draftData)
    });
    
    const data3 = await response3.json();
    console.log('Response:', data3);
    console.log('响应:', data3);
    
    if (data3.success && data3.draft) {
      console.log('\n4. Testing GET single draft...');
      console.log('4. 测试获取单个草稿...');
      
      const response4 = await fetch(`http://localhost:3000/api/ambassador/team-drafts?draft_id=${data3.draft.id}`);
      const data4 = await response4.json();
      console.log('Response:', data4);
      console.log('响应:', data4);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('❌ API 测试失败:', error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    console.log('✅ Server is running on port 3000');
    console.log('✅ 服务器在端口 3000 上运行');
    return true;
  } catch (error) {
    console.log('❌ Server is not running on port 3000');
    console.log('❌ 服务器没有在端口 3000 上运行');
    console.log('💡 Please start the development server with: npm run dev');
    console.log('💡 请使用以下命令启动开发服务器: npm run dev');
    return false;
  }
}

async function runTests() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testTeamDraftsAPI();
  }
}

runTests(); 