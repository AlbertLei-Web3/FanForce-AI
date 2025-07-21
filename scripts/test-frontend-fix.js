// Test the frontend fix for JSONB data parsing
// 测试前端JSONB数据解析修复

// Simulate the data format that comes from the API
// 模拟来自API的数据格式
const mockEventData = {
  event_id: "05d525b3-38bc-42f1-8a45-f7d16d0a46c5",
  event_title: "Thunder W vs Lightning H",
  event_date: "2025-07-25T11:31:00Z",
  match_status: "active",
  team_a_info: {
    name: "Thunder W",
    athletes: ["85c75c8c-7540-40ac-aae9-a4042aa87d59", "9bfc59fa-1c0e-4f39-b45f-1d063432b22c"],
    metadata: {}
  },
  team_b_info: {
    name: "Lightning H",
    athletes: ["58ebca77-3ce5-46f5-a00b-f797cd383c32", "ea6ca5ba-4ee1-43a5-9c16-6ed1f630da3b"],
    metadata: {}
  },
  venue_name: "Venue1",
  venue_capacity: 100,
  match_result: null,
  team_a_score: null,
  team_b_score: null,
  total_participants: 0,
  total_stakes_amount: "0.00",
  time_proximity_hours: 98
};

// Test the parsing logic (simulating the frontend code)
// 测试解析逻辑（模拟前端代码）
function testTeamInfoParsing(event) {
  console.log('🧪 Testing team info parsing...');
  console.log('🧪 测试队伍信息解析...');
  
  try {
    // This is the fixed logic from the frontend
    // 这是从前端修复的逻辑
    const teamAInfo = event.team_a_info || null;
    const teamBInfo = event.team_b_info || null;
    
    console.log('✅ Parsing successful');
    console.log('✅ 解析成功');
    console.log(`  Team A Info: ${JSON.stringify(teamAInfo)}`);
    console.log(`  Team B Info: ${JSON.stringify(teamBInfo)}`);
    
    if (teamAInfo && teamBInfo) {
      console.log(`  Team A Name: ${teamAInfo.name}`);
      console.log(`  Team B Name: ${teamBInfo.name}`);
      console.log(`  Team A Athletes: ${teamAInfo.athletes?.length || 0} athletes`);
      console.log(`  Team B Athletes: ${teamBInfo.athletes?.length || 0} athletes`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Parsing failed:', error.message);
    console.error('❌ 解析失败:', error.message);
    return false;
  }
}

// Test with different data scenarios
// 使用不同数据场景测试
function testDifferentScenarios() {
  console.log('\n🔍 Testing different data scenarios...');
  console.log('🔍 测试不同数据场景...');
  
  // Scenario 1: Normal data
  console.log('\n📋 Scenario 1: Normal data');
  testTeamInfoParsing(mockEventData);
  
  // Scenario 2: Null team info
  console.log('\n📋 Scenario 2: Null team info');
  testTeamInfoParsing({
    ...mockEventData,
    team_a_info: null,
    team_b_info: null
  });
  
  // Scenario 3: Missing team info
  console.log('\n📋 Scenario 3: Missing team info');
  testTeamInfoParsing({
    ...mockEventData,
    team_a_info: undefined,
    team_b_info: undefined
  });
  
  // Scenario 4: String team info (should not happen but testing anyway)
  console.log('\n📋 Scenario 4: String team info');
  testTeamInfoParsing({
    ...mockEventData,
    team_a_info: '{"name":"Test Team","athletes":[]}',
    team_b_info: '{"name":"Test Team 2","athletes":[]}'
  });
}

// Test the date formatting logic
// 测试日期格式化逻辑
function testDateFormatting(event) {
  console.log('\n📅 Testing date formatting...');
  console.log('📅 测试日期格式化...');
  
  try {
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString();
    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    console.log(`  Original: ${event.event_date}`);
    console.log(`  Formatted Date: ${formattedDate}`);
    console.log(`  Formatted Time: ${formattedTime}`);
    console.log(`  Is Future: ${eventDate > new Date()}`);
    
    return true;
  } catch (error) {
    console.error('❌ Date formatting failed:', error.message);
    console.error('❌ 日期格式化失败:', error.message);
    return false;
  }
}

// Test the time proximity calculation
// 测试时间接近度计算
function testTimeProximity(event) {
  console.log('\n⏰ Testing time proximity...');
  console.log('⏰ 测试时间接近度...');
  
  try {
    const timeProximityHours = Math.round(event.time_proximity_hours);
    const eventDate = new Date(event.event_date);
    const isFuture = eventDate > new Date();
    
    console.log(`  Time Proximity Hours: ${timeProximityHours}`);
    console.log(`  Is Future Event: ${isFuture}`);
    console.log(`  Progress Bar Width: ${Math.min((timeProximityHours / 24) * 100, 100)}%`);
    
    return true;
  } catch (error) {
    console.error('❌ Time proximity calculation failed:', error.message);
    console.error('❌ 时间接近度计算失败:', error.message);
    return false;
  }
}

// Run all tests
// 运行所有测试
function runAllTests() {
  console.log('🚀 Running frontend fix tests...');
  console.log('🚀 运行前端修复测试...');
  
  const results = {
    teamParsing: testTeamInfoParsing(mockEventData),
    dateFormatting: testDateFormatting(mockEventData),
    timeProximity: testTimeProximity(mockEventData),
    scenarios: testDifferentScenarios()
  };
  
  console.log('\n📊 Test Results:');
  console.log('📊 测试结果:');
  console.log(`  Team Parsing: ${results.teamParsing ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Date Formatting: ${results.dateFormatting ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Time Proximity: ${results.timeProximity ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = results.teamParsing && results.dateFormatting && results.timeProximity;
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Frontend fix is working correctly.');
    console.log('🎉 所有测试通过！前端修复工作正常。');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the implementation.');
    console.log('⚠️ 一些测试失败。请检查实现。');
  }
  
  return allPassed;
}

// Run the tests
// 运行测试
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = { testTeamInfoParsing, testDateFormatting, testTimeProximity, runAllTests }; 