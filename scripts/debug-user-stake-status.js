/*
 * Debug User Stake Status API
 * 调试用户质押状态API
 * 
 * This script helps debug the user-stake-status API endpoint
 * 此脚本帮助调试用户质押状态API端点
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

// Test user and event IDs from the error
// 从错误中获取的测试用户和赛事ID
const testUserId = '550e8400-e29b-41d4-a716-446655440001';
const testEventId = '8cfd84ba-5da0-4beb-98f6-9fc2e04bdc9c';

async function debugUserStakeStatus() {
  console.log('🔍 Debugging User Stake Status API...');
  console.log('🔍 调试用户质押状态API...');
  console.log(`User ID: ${testUserId}`);
  console.log(`Event ID: ${testEventId}`);
  console.log(`用户ID: ${testUserId}`);
  console.log(`赛事ID: ${testEventId}`);

  try {
    // 1. Check if user exists
    // 1. 检查用户是否存在
    console.log('\n📊 Checking if user exists...');
    console.log('📊 检查用户是否存在...');
    
    const userCheck = await pool.query(`
      SELECT id, username, role, virtual_chz_balance
      FROM users 
      WHERE id = $1
    `, [testUserId]);

    if (userCheck.rows.length === 0) {
      console.log('❌ User not found in database');
      console.log('❌ 数据库中未找到用户');
      return;
    }

    console.log('✅ User found:', userCheck.rows[0]);
    console.log('✅ 找到用户:', userCheck.rows[0]);

    // 2. Check if event exists
    // 2. 检查赛事是否存在
    console.log('\n📊 Checking if event exists...');
    console.log('📊 检查赛事是否存在...');
    
    const eventCheck = await pool.query(`
      SELECT id, event_title, event_start_time, status
      FROM events 
      WHERE id = $1
    `, [testEventId]);

    if (eventCheck.rows.length === 0) {
      console.log('❌ Event not found in database');
      console.log('❌ 数据库中未找到赛事');
      return;
    }

    console.log('✅ Event found:', eventCheck.rows[0]);
    console.log('✅ 找到赛事:', eventCheck.rows[0]);

    // 3. Check if user_stake_records table exists
    // 3. 检查user_stake_records表是否存在
    console.log('\n📊 Checking if user_stake_records table exists...');
    console.log('📊 检查user_stake_records表是否存在...');
    
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_stake_records'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ user_stake_records table does not exist');
      console.log('❌ user_stake_records表不存在');
      return;
    }

    console.log('✅ user_stake_records table exists');
    console.log('✅ user_stake_records表存在');

    // 4. Check user's stake records
    // 4. 检查用户的质押记录
    console.log('\n📊 Checking user stake records...');
    console.log('📊 检查用户质押记录...');
    
    const stakeRecords = await pool.query(`
      SELECT 
        usr.id,
        usr.stake_amount,
        usr.participation_tier,
        usr.team_choice,
        usr.status,
        usr.stake_time
      FROM user_stake_records usr
      WHERE usr.user_id = $1 
        AND usr.event_id = $2 
        AND usr.status = 'active'
    `, [testUserId, testEventId]);

    console.log(`Found ${stakeRecords.rows.length} stake records for this user/event`);
    console.log(`找到此用户/赛事的 ${stakeRecords.rows.length} 条质押记录`);
    
    if (stakeRecords.rows.length > 0) {
      console.log('Stake records:', stakeRecords.rows);
      console.log('质押记录:', stakeRecords.rows);
    }

    // 5. Check platform_fee_config table
    // 5. 检查platform_fee_config表
    console.log('\n📊 Checking platform_fee_config table...');
    console.log('📊 检查platform_fee_config表...');
    
    const feeConfigCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'platform_fee_config'
      );
    `);

    if (!feeConfigCheck.rows[0].exists) {
      console.log('❌ platform_fee_config table does not exist');
      console.log('❌ platform_fee_config表不存在');
      return;
    }

    console.log('✅ platform_fee_config table exists');
    console.log('✅ platform_fee_config表存在');

    const feeConfig = await pool.query(`
      SELECT fee_percentage, is_active
      FROM platform_fee_config
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `);

    console.log(`Found ${feeConfig.rows.length} active fee configurations`);
    console.log(`找到 ${feeConfig.rows.length} 个活跃的手续费配置`);

    // 6. Check chz_pool_management table
    // 6. 检查chz_pool_management表
    console.log('\n📊 Checking chz_pool_management table...');
    console.log('📊 检查chz_pool_management表...');
    
    const poolCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'chz_pool_management'
      );
    `);

    if (!poolCheck.rows[0].exists) {
      console.log('❌ chz_pool_management table does not exist');
      console.log('❌ chz_pool_management表不存在');
      return;
    }

    console.log('✅ chz_pool_management table exists');
    console.log('✅ chz_pool_management表存在');

    const poolData = await pool.query(`
      SELECT pool_balance_after
      FROM chz_pool_management cpm
      JOIN events e ON cpm.event_id = e.id
      WHERE e.id = $1
      ORDER BY cpm.created_at DESC
      LIMIT 1
    `, [testEventId]);

    console.log(`Found ${poolData.rows.length} pool records for this event`);
    console.log(`找到此赛事的 ${poolData.rows.length} 条奖池记录`);

    // 7. Test the complete query that's failing
    // 7. 测试失败的完整查询
    console.log('\n📊 Testing the complete query...');
    console.log('📊 测试完整查询...');
    
    try {
      const completeQuery = await pool.query(`
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

      console.log('✅ Complete query executed successfully');
      console.log('✅ 完整查询执行成功');
      console.log('Result:', completeQuery.rows[0]);
      console.log('结果:', completeQuery.rows[0]);
    } catch (error) {
      console.error('❌ Complete query failed:', error);
      console.error('❌ 完整查询失败:', error);
    }

  } catch (error) {
    console.error('❌ Debug script failed:', error);
    console.error('❌ 调试脚本失败:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the debug script
// 运行调试脚本
debugUserStakeStatus().then(() => {
  console.log('\n✨ Debug completed');
  console.log('✨ 调试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Debug execution failed:', error);
  console.error('💥 调试执行失败:', error);
  process.exit(1);
}); 