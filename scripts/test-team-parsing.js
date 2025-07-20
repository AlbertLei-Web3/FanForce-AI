/*
 * Test Team Name Parsing
 * 测试队伍名称解析
 * 
 * This script tests the parseTeamNamesFromTitle function
 * 此脚本测试parseTeamNamesFromTitle函数
 */

// Simulate the parseTeamNamesFromTitle function
// 模拟parseTeamNamesFromTitle函数
const parseTeamNamesFromTitle = (title) => {
  if (!title) return { teamA: 'Team A', teamB: 'Team B' };
  
  // Common separators for team names / 队伍名称的常见分隔符
  const separators = [' vs ', ' VS ', ' v ', ' V ', ' - ', ' vs. ', ' VS. '];
  
  for (const separator of separators) {
    if (title.includes(separator)) {
      const parts = title.split(separator);
      if (parts.length === 2) {
        return {
          teamA: parts[0].trim(),
          teamB: parts[1].trim()
        };
      }
    }
  }
  
  // If no separator found, try to split by space / 如果没有找到分隔符，尝试按空格分割
  const words = title.trim().split(' ');
  if (words.length >= 2) {
    // Try to find a middle word that could be a separator / 尝试找到可能是分隔符的中间词
    const middleIndex = Math.floor(words.length / 2);
    const teamA = words.slice(0, middleIndex).join(' ');
    const teamB = words.slice(middleIndex + 1).join(' ');
    
    if (teamA && teamB) {
      return { teamA, teamB };
    }
  }
  
  // Fallback / 备用方案
  return { teamA: 'Team A', teamB: 'Team B' };
};

// Test cases / 测试用例
const testCases = [
  'es vs Hawks',
  'Thunder Wolves vs Lightning Hawks',
  'Engineering Eagles VS Business Bears',
  'Team A v Team B',
  'Alpha - Beta',
  'Red vs. Blue',
  'Single Team',
  '',
  null
];

console.log('🧪 Testing team name parsing function...');
console.log('🧪 测试队伍名称解析函数...');

testCases.forEach((title, index) => {
  console.log(`\n📊 Test Case ${index + 1}: "${title}"`);
  console.log(`📊 测试用例 ${index + 1}: "${title}"`);
  
  const result = parseTeamNamesFromTitle(title);
  console.log(`   Team A: "${result.teamA}"`);
  console.log(`   Team B: "${result.teamB}"`);
  
  // Validate the result / 验证结果
  if (result.teamA && result.teamB && result.teamA !== result.teamB) {
    console.log('   ✅ Valid result');
    console.log('   ✅ 有效结果');
  } else {
    console.log('   ⚠️  Fallback used');
    console.log('   ⚠️  使用了备用方案');
  }
});

console.log('\n✨ Team name parsing test completed');
console.log('✨ 队伍名称解析测试完成'); 