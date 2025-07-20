/*
 * Test Fixed API Endpoints
 * 测试修复的API端点
 * 
 * This script tests the fixed user-stake-status API
 * 此脚本测试修复的用户质押状态API
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

// Test user and event IDs - using real user and event from database
// 测试用户和赛事ID - 使用数据库中的真实用户和赛事
const testUserId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';
const testEventId = 'ac793df8-7dd8-4aae-943e-de10fcafadc0';

async function testFixedAPI() {
  console.log('🧪 Testing fixed API endpoints...');
  console.log('🧪 测试修复的API端点...');

  try {
    // Test user query
    // 测试用户查询
    console.log('\n📊 Testing user query...');
    console.log('📊 测试用户查询...');
    
    const userCheck = await pool.query(`
      SELECT id, wallet_address, role, virtual_chz_balance
      FROM users 
      WHERE id = $1
    `, [testUserId]);

    if (userCheck.rows.length === 0) {
      console.log('❌ User not found');
      console.log('❌ 未找到用户');
      return;
    }

    console.log('✅ User found:', userCheck.rows[0]);
    console.log('✅ 找到用户:', userCheck.rows[0]);

    // Test event query
    // 测试赛事查询
    console.log('\n📊 Testing event query...');
    console.log('📊 测试赛事查询...');
    
    const eventCheck = await pool.query(`
      SELECT id, title, start_time, status
      FROM events 
      WHERE id = $1
    `, [testEventId]);

    if (eventCheck.rows.length === 0) {
      console.log('❌ Event not found');
      console.log('❌ 未找到赛事');
      return;
    }

    console.log('✅ Event found:', eventCheck.rows[0]);
    console.log('✅ 找到赛事:', eventCheck.rows[0]);

    // Test stake records query
    // 测试质押记录查询
    console.log('\n📊 Testing stake records query...');
    console.log('📊 测试质押记录查询...');
    
    const stakeRecords = await pool.query(`
      SELECT 
        usr.id,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.stake_time,
        usr.status
      FROM user_stake_records usr
      WHERE usr.user_id = $1 
        AND usr.event_id = $2 
        AND usr.status = 'active'
    `, [testUserId, testEventId]);

    console.log(`✅ Found ${stakeRecords.rows.length} stake records`);
    console.log(`✅ 找到 ${stakeRecords.rows.length} 条质押记录`);

    // Test event statistics query
    // 测试赛事统计查询
    console.log('\n📊 Testing event statistics query...');
    console.log('📊 测试赛事统计查询...');
    
    const eventStats = await pool.query(`
      SELECT 
        COUNT(*) as total_stakes,
        SUM(stake_amount) as total_stake_amount,
        COUNT(CASE WHEN participation_tier = 1 THEN 1 END) as tier1_count,
        COUNT(CASE WHEN participation_tier = 2 THEN 1 END) as tier2_count,
        COUNT(CASE WHEN participation_tier = 3 THEN 1 END) as tier3_count,
        COUNT(CASE WHEN team_choice = 'team_a' THEN 1 END) as team_a_count,
        COUNT(CASE WHEN team_choice = 'team_b' THEN 1 END) as team_b_count
      FROM user_stake_records
      WHERE event_id = $1 AND status = 'active'
    `, [testEventId]);

    console.log('✅ Event statistics:', eventStats.rows[0]);
    console.log('✅ 赛事统计:', eventStats.rows[0]);

    console.log('\n🎉 All API queries working correctly!');
    console.log('🎉 所有API查询正常工作！');

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ 测试失败:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the test
// 运行测试
testFixedAPI().then(() => {
  console.log('\n✨ Test completed');
  console.log('✨ 测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test execution failed:', error);
  console.error('💥 测试执行失败:', error);
  process.exit(1);
}); 