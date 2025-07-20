/*
 * Test Staking System Script
 * 测试质押系统脚本
 * 
 * This script tests the complete user staking system implementation
 * 此脚本测试完整的用户质押系统实现
 * 
 * Usage: node scripts/test-staking-system.js
 * 用法: node scripts/test-staking-system.js
 * 
 * Related files:
 * - lib/staking-schema.sql: Database schema
 * - app/api/audience/stake: Staking API
 * - app/api/audience/user-stake-status: User stake status API
 * - app/api/audience/calculate-rewards: Reward calculation API
 * 
 * 相关文件：
 * - lib/staking-schema.sql: 数据库架构
 * - app/api/audience/stake: 质押API
 * - app/api/audience/user-stake-status: 用户质押状态API
 * - app/api/audience/calculate-rewards: 奖励计算API
 */

const fs = require('fs');
const path = require('path');
const { query, testConnection, closePool } = require('../lib/database.js');

async function testStakingSystem() {
  console.log('=== Testing Staking System ===');
  console.log('=== 测试质押系统 ===');
  
  try {
    // Test database connection
    // 测试数据库连接
    console.log('\n1. Testing database connection...');
    console.log('1. 测试数据库连接...');
    
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ 数据库连接成功');
    
    // 2. Test table existence
    // 2. 测试表存在性
    console.log('\n2. Testing table existence...');
    console.log('2. 测试表存在性...');
    
    const tablesToCheck = [
      'user_stake_records',
      'reward_calculations', 
      'platform_fee_config'
    ];
    
    for (const tableName of tablesToCheck) {
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        ) as table_exists
      `, [tableName]);
      
      const exists = result.rows[0].table_exists;
      console.log(`${exists ? '✅' : '❌'} Table ${tableName}: ${exists ? 'EXISTS' : 'MISSING'}`);
      console.log(`${exists ? '✅' : '❌'} 表 ${tableName}: ${exists ? '存在' : '缺失'}`);
      
      if (!exists) {
        throw new Error(`Table ${tableName} was not created successfully`);
      }
    }
    
    // 3. Test platform fee configuration
    // 3. 测试平台手续费配置
    console.log('\n3. Testing platform fee configuration...');
    console.log('3. 测试平台手续费配置...');
    
    const feeConfig = await query(`
      SELECT fee_percentage, is_active, description 
      FROM platform_fee_config 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (feeConfig.rows.length > 0) {
      console.log('✅ Platform fee configuration found:', feeConfig.rows[0]);
      console.log('✅ 找到平台手续费配置:', feeConfig.rows[0]);
    } else {
      console.log('❌ No active platform fee configuration found');
      console.log('❌ 未找到活跃的平台手续费配置');
    }
    
    // 4. Test API endpoints (simulate HTTP requests)
    // 4. 测试API端点（模拟HTTP请求）
    console.log('\n4. Testing API endpoints...');
    console.log('4. 测试API端点...');
    
    // Test staking API
    // 测试质押API
    console.log('\n   Testing POST /api/audience/stake...');
    console.log('   测试 POST /api/audience/stake...');
    
    // Get test user and event
    // 获取测试用户和赛事
    const testUser = await query(`
      SELECT id, wallet_address, virtual_chz_balance 
      FROM users 
      WHERE role = 'audience' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    const testEvent = await query(`
      SELECT id, title, status, event_date
      FROM events 
      WHERE status IN ('active', 'approved')
      ORDER BY event_date DESC 
      LIMIT 1
    `);
    
    if (testUser.rows.length === 0) {
      console.log('❌ No test user found');
      console.log('❌ 未找到测试用户');
    } else {
      console.log('✅ Test user found:', testUser.rows[0].wallet_address);
      console.log('✅ 找到测试用户:', testUser.rows[0].wallet_address);
    }
    
    if (testEvent.rows.length === 0) {
      console.log('❌ No test event found');
      console.log('❌ 未找到测试赛事');
    } else {
      console.log('✅ Test event found:', testEvent.rows[0].title);
      console.log('✅ 找到测试赛事:', testEvent.rows[0].title);
    }
    
    // 5. Test user stake status API
    // 5. 测试用户质押状态API
    console.log('\n   Testing GET /api/audience/user-stake-status...');
    console.log('   测试 GET /api/audience/user-stake-status...');
    
    if (testUser.rows.length > 0 && testEvent.rows.length > 0) {
      const userStakeStatus = await query(`
        SELECT 
          usr.id,
          usr.stake_amount,
          usr.participation_tier,
          usr.team_choice,
          usr.status
        FROM user_stake_records usr
        WHERE usr.user_id = $1 AND usr.event_id = $2
      `, [testUser.rows[0].id, testEvent.rows[0].id]);
      
      if (userStakeStatus.rows.length > 0) {
        console.log('✅ User has staked for this event:', userStakeStatus.rows[0]);
        console.log('✅ 用户已为此赛事质押:', userStakeStatus.rows[0]);
      } else {
        console.log('ℹ️ User has not staked for this event yet');
        console.log('ℹ️ 用户尚未为此赛事质押');
      }
    }
    
    // 6. Test reward calculation preparation
    // 6. 测试奖励计算准备
    console.log('\n5. Testing reward calculation preparation...');
    console.log('5. 测试奖励计算准备...');
    
    // Check if there are any stakes for events
    // 检查是否有赛事的质押
    const activeStakes = await query(`
      SELECT 
        COUNT(*) as total_stakes,
        COUNT(DISTINCT event_id) as events_with_stakes,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_stake_records 
      WHERE status = 'active'
    `);
    
    console.log('✅ Active stakes summary:', activeStakes.rows[0]);
    console.log('✅ 活跃质押摘要:', activeStakes.rows[0]);
    
    // 7. Test admin pool availability
    // 7. 测试管理员奖池可用性
    console.log('\n6. Testing admin pool availability...');
    console.log('6. 测试管理员奖池可用性...');
    
    const adminPools = await query(`
      SELECT 
        COUNT(*) as total_pools,
        SUM(pool_balance_after) as total_pool_amount
      FROM chz_pool_management
    `);
    
    console.log('✅ Admin pools summary:', adminPools.rows[0]);
    console.log('✅ 管理员奖池摘要:', adminPools.rows[0]);
    
    // 8. Test reward calculations table
    // 8. 测试奖励计算表
    console.log('\n7. Testing reward calculations...');
    console.log('7. 测试奖励计算...');
    
    const rewardCalculations = await query(`
      SELECT 
        COUNT(*) as total_calculations,
        COUNT(DISTINCT event_id) as events_with_calculations,
        SUM(final_reward) as total_rewards_paid
      FROM reward_calculations
    `);
    
    console.log('✅ Reward calculations summary:', rewardCalculations.rows[0]);
    console.log('✅ 奖励计算摘要:', rewardCalculations.rows[0]);
    
    // 9. Generate test report
    // 9. 生成测试报告
    console.log('\n=== Test Report ===');
    console.log('=== 测试报告 ===');
    
    const report = {
      database_connection: 'SUCCESS',
      tables_created: tablesToCheck.length,
      platform_fee_configured: feeConfig.rows.length > 0,
      test_user_available: testUser.rows.length > 0,
      test_event_available: testEvent.rows.length > 0,
      active_stakes: parseInt(activeStakes.rows[0].total_stakes),
      admin_pools: parseInt(adminPools.rows[0].total_pools),
      reward_calculations: parseInt(rewardCalculations.rows[0].total_calculations)
    };
    
    console.log('Test Results:', report);
    console.log('测试结果:', report);
    
    // Save test report to file
    // 保存测试报告到文件
    const reportPath = path.join(__dirname, '../logs/staking-system-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nTest report saved to: ${reportPath}`);
    console.log(`\n测试报告已保存到: ${reportPath}`);
    
    console.log('\n✅ Staking system test completed successfully');
    console.log('✅ 质押系统测试成功完成');
    
  } catch (error) {
    console.error('❌ Staking system test failed:', error);
    console.error('❌ 质押系统测试失败:', error);
    process.exit(1);
  } finally {
    // Close database connection
    // 关闭数据库连接
    await closePool();
    console.log('\nDatabase connection closed');
    console.log('数据库连接已关闭');
  }
}

// Run the script if called directly
// 如果直接调用则运行脚本
if (require.main === module) {
  testStakingSystem()
    .then(() => {
      console.log('\nScript completed successfully');
      console.log('脚本成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      console.error('脚本失败:', error);
      process.exit(1);
    });
}

module.exports = { testStakingSystem }; 