// Test team name display functionality
// 测试队伍名称显示功能

// Simulate the team info parsing logic from the frontend
// 模拟前端的队伍信息解析逻辑

function parseTeamInfo(teamInfo) {
  if (!teamInfo) return null;
  
  try {
    return typeof teamInfo === 'string' ? JSON.parse(teamInfo) : teamInfo;
  } catch (error) {
    console.error('Error parsing team info:', error);
    return teamInfo; // Return as string if parsing fails
  }
}

function getTeamName(teamInfo) {
  if (!teamInfo) return null;
  
  const parsed = parseTeamInfo(teamInfo);
  return typeof parsed === 'string' ? parsed : parsed?.name || 'Unknown Team';
}

function testTeamDisplay() {
  console.log('🧪 Testing team name display functionality...');
  console.log('🧪 测试队伍名称显示功能...');

  // Test cases
  // 测试用例
  const testCases = [
    {
      name: 'JSON Object with name',
      teamA: { name: 'Thunder Wolves', players: ['John', 'Mike'] },
      teamB: { name: 'Lightning Hawks', players: ['Sarah', 'Tom'] }
    },
    {
      name: 'String values',
      teamA: 'Thunder Wolves',
      teamB: 'Lightning Hawks'
    },
    {
      name: 'Mixed types',
      teamA: { name: 'Team Alpha', color: 'blue' },
      teamB: 'Team Beta'
    },
    {
      name: 'Null values',
      teamA: null,
      teamB: null
    },
    {
      name: 'Invalid JSON string',
      teamA: '{invalid json}',
      teamB: 'Valid Team'
    }
  ];

  testCases.forEach((testCase, index) => {
    console.log(`\n📋 Test Case ${index + 1}: ${testCase.name}`);
    console.log(`📋 测试用例 ${index + 1}: ${testCase.name}`);
    
    const teamAName = getTeamName(testCase.teamA);
    const teamBName = getTeamName(testCase.teamB);
    
    console.log('  Team A Info:', testCase.teamA);
    console.log('  Team A Name:', teamAName);
    console.log('  Team B Info:', testCase.teamB);
    console.log('  Team B Name:', teamBName);
    
    // Simulate the display logic
    // 模拟显示逻辑
    if (teamAName && teamBName) {
      console.log('  Display:');
      console.log(`    ${teamAName} VS ${teamBName}`);
    } else {
      console.log('  Display: No teams to display');
    }
  });

  console.log('\n✅ Team display test completed');
  console.log('✅ 队伍显示测试完成');
}

// Run the test
// 运行测试
if (require.main === module) {
  testTeamDisplay();
}

module.exports = { parseTeamInfo, getTeamName, testTeamDisplay }; 