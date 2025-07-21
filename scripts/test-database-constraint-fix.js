// Test the database constraint fix for match result values
// 测试比赛结果值的数据库约束修复

const { Pool } = require('pg');

// Database connection
// 数据库连接
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fanforce_ai',
  password: process.env.DB_PASSWORD || 'LYQ20000',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Test the winner value mapping
// 测试获胜者值映射
function testWinnerValueMapping() {
  console.log('🧪 Testing winner value mapping...');
  console.log('🧪 测试获胜者值映射...');

  const mapWinnerToDatabase = (winner) => {
    switch (winner) {
      case 'team_a':
        return 'team_a_wins';
      case 'team_b':
        return 'team_b_wins';
      case 'draw':
        return 'draw';
      default:
        return winner;
    }
  };

  const testCases = [
    { input: 'team_a', expected: 'team_a_wins' },
    { input: 'team_b', expected: 'team_b_wins' },
    { input: 'draw', expected: 'draw' }
  ];

  testCases.forEach((testCase, index) => {
    const result = mapWinnerToDatabase(testCase.input);
    const passed = result === testCase.expected;
    
    console.log(`  Test ${index + 1}: ${testCase.input} → ${result}`);
    console.log(`    测试 ${index + 1}: ${testCase.input} → ${result}`);
    console.log(`    Expected: ${testCase.expected}, Got: ${result}`);
    console.log(`    期望: ${testCase.expected}, 得到: ${result}`);
    console.log(`    ${passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');
  });
}

// Test database constraint values
// 测试数据库约束值
async function testDatabaseConstraints() {
  console.log('\n🗄️ Testing database constraints...');
  console.log('🗄️ 测试数据库约束...');

  const client = await pool.connect();

  try {
    // Check the events table constraint
    // 检查events表约束
    const constraintQuery = `
      SELECT 
        conname,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'events'::regclass 
      AND conname = 'events_match_result_check'
    `;

    const constraintResult = await client.query(constraintQuery);
    
    if (constraintResult.rows.length > 0) {
      console.log('Events table match_result constraint:');
      console.log('Events表match_result约束:');
      console.log('  Constraint Name:', constraintResult.rows[0].conname);
      console.log('  Definition:', constraintResult.rows[0].constraint_definition);
    } else {
      console.log('No match_result constraint found on events table');
      console.log('在events表上未找到match_result约束');
    }

    // Test valid values
    // 测试有效值
    const validValues = ['team_a_wins', 'team_b_wins', 'draw', 'cancelled'];
    console.log('\nValid match_result values:', validValues);
    console.log('有效的match_result值:', validValues);

  } finally {
    client.release();
  }
}

// Test API with corrected values
// 使用修正的值测试API
async function testAPICall() {
  console.log('\n📡 Testing API call with corrected values...');
  console.log('📡 使用修正的值测试API调用...');

  const testData = {
    eventId: '05d525b3-38bc-42f1-8a45-f7d16d0a46c5',
    teamAScore: 2,
    teamBScore: 1,
    winner: 'team_a', // This should be mapped to 'team_a_wins'
    notes: 'Test match result with corrected mapping',
    announcedBy: '1de6110a-f982-4f7f-979e-00e7f7d33bed' // Use actual UUID
  };

  try {
    const response = await fetch('http://localhost:3000/api/events/update-match-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (result.success) {
      console.log('✅ API call successful with corrected mapping');
      console.log('✅ 使用修正的映射API调用成功');
    } else {
      console.log('❌ API call failed:', result.error);
      console.log('❌ API调用失败:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
        console.log('详情:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ 测试失败:', error.message);
  }
}

// Run all tests
// 运行所有测试
async function runAllTests() {
  console.log('🚀 Running database constraint fix tests...');
  console.log('🚀 运行数据库约束修复测试...');
  
  try {
    testWinnerValueMapping();
    await testDatabaseConstraints();
    await testAPICall();
    
    console.log('\n🎉 All constraint fix tests completed!');
    console.log('🎉 所有约束修复测试完成！');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error('❌ 测试套件失败:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the tests if this file is executed directly
// 如果直接执行此文件则运行测试
if (require.main === module) {
  runAllTests();
}

module.exports = { 
  testWinnerValueMapping, 
  testDatabaseConstraints, 
  testAPICall, 
  runAllTests 
}; 