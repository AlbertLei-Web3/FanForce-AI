/*
 * Test New Featured Event Staking Flow
 * 测试新的焦点赛事质押流程
 * 
 * This script tests the complete staking flow with the new featured event logic
 * 此脚本测试使用新焦点赛事逻辑的完整质押流程
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

async function testNewFeaturedStaking() {
  console.log('🧪 Testing new featured event staking flow...');
  console.log('🧪 测试新的焦点赛事质押流程...');

  try {
    // Step 1: Get the featured event from events table
    // 步骤1: 从events表获取焦点赛事
    console.log('\n📊 Step 1: Getting featured event from events table...');
    console.log('📊 步骤1: 从events表获取焦点赛事...');
    
    const featuredEvent = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.venue_name,
        ea.team_a_info,
        ea.team_b_info
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      WHERE e.status = 'active' AND e.event_date IS NOT NULL
      ORDER BY ABS(EXTRACT(EPOCH FROM (e.event_date - NOW())))
      LIMIT 1
    `);

    if (featuredEvent.rows.length === 0) {
      console.log('❌ No active events found');
      console.log('❌ 未找到活跃赛事');
      return;
    }

    const event = featuredEvent.rows[0];
    console.log(`✅ Featured Event: ${event.title}`);
    console.log(`✅ 焦点赛事: ${event.title}`);
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Date: ${event.event_date}`);
    console.log(`   Venue: ${event.venue_name}`);
    
    // Parse team info
    // 解析队伍信息
    const teamAInfo = event.team_a_info ? (typeof event.team_a_info === 'object' ? event.team_a_info : JSON.parse(event.team_a_info)) : {};
    const teamBInfo = event.team_b_info ? (typeof event.team_b_info === 'object' ? event.team_b_info : JSON.parse(event.team_b_info)) : {};
    
    console.log(`   Team A: ${teamAInfo.name || 'Unknown'}`);
    console.log(`   Team B: ${teamBInfo.name || 'Unknown'}`);

    // Step 2: Test user stake status API with event_id
    // 步骤2: 使用event_id测试用户质押状态API
    console.log('\n📊 Step 2: Testing user stake status API...');
    console.log('📊 步骤2: 测试用户质押状态API...');
    
    const mockUserId = 'test-user-123';
    const stakeStatusResponse = await fetch(`http://localhost:3000/api/audience/user-stake-status?user_id=${mockUserId}&event_id=${event.id}`);
    const stakeStatusData = await stakeStatusResponse.json();
    
    console.log(`✅ User stake status response:`, stakeStatusData);
    console.log(`✅ 用户质押状态响应:`, stakeStatusData);

    // Step 3: Test stake submission API with event_id
    // 步骤3: 使用event_id测试质押提交API
    console.log('\n📊 Step 3: Testing stake submission API...');
    console.log('📊 步骤3: 测试质押提交API...');
    
    const stakeData = {
      user_id: mockUserId,
      event_id: event.id,
      stake_amount: 50,
      participation_tier: 2,
      team_choice: 'team_a',
      event_title: event.title
    };
    
    console.log(`📊 Stake data:`, stakeData);
    console.log(`📊 质押数据:`, stakeData);
    
    const stakeResponse = await fetch('http://localhost:3000/api/audience/stake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stakeData),
    });
    
    const stakeResult = await stakeResponse.json();
    console.log(`✅ Stake submission response:`, stakeResult);
    console.log(`✅ 质押提交响应:`, stakeResult);

    // Step 4: Verify the stake was recorded correctly
    // 步骤4: 验证质押记录是否正确
    console.log('\n📊 Step 4: Verifying stake record...');
    console.log('📊 步骤4: 验证质押记录...');
    
    const stakeRecord = await pool.query(`
      SELECT 
        usr.*,
        e.title as event_title
      FROM user_stake_records usr
      JOIN events e ON usr.event_id = e.id
      WHERE usr.user_id = $1 AND usr.event_id = $2
      ORDER BY usr.created_at DESC
      LIMIT 1
    `, [mockUserId, event.id]);
    
    if (stakeRecord.rows.length > 0) {
      const record = stakeRecord.rows[0];
      console.log(`✅ Stake record found:`);
      console.log(`✅ 找到质押记录:`);
      console.log(`   Event: ${record.event_title}`);
      console.log(`   Amount: ${record.stake_amount} CHZ`);
      console.log(`   Tier: ${record.participation_tier}`);
      console.log(`   Team: ${record.team_choice}`);
      console.log(`   Status: ${record.status}`);
    } else {
      console.log('❌ No stake record found');
      console.log('❌ 未找到质押记录');
    }

    // Step 5: Check pool balance
    // 步骤5: 检查奖池余额
    console.log('\n📊 Step 5: Checking pool balance...');
    console.log('📊 步骤5: 检查奖池余额...');
    
    const poolBalance = await pool.query(`
      SELECT 
        cpm.pool_balance_after,
        cpm.created_at
      FROM chz_pool_management cpm
      WHERE cpm.event_id = $1
      ORDER BY cpm.created_at DESC
      LIMIT 1
    `, [event.id]);
    
    if (poolBalance.rows.length > 0) {
      const balance = poolBalance.rows[0];
      console.log(`✅ Pool balance: ${balance.pool_balance_after} CHZ`);
      console.log(`✅ 奖池余额: ${balance.pool_balance_after} CHZ`);
      console.log(`   Updated: ${balance.created_at}`);
    } else {
      console.log('❌ No pool balance record found');
      console.log('❌ 未找到奖池余额记录');
    }

  } catch (error) {
    console.error('❌ Error testing new featured staking:', error);
    console.error('❌ 测试新焦点赛事质押时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the test
// 运行测试
testNewFeaturedStaking().then(() => {
  console.log('\n✨ New featured staking test completed');
  console.log('✨ 新焦点赛事质押测试完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  console.error('💥 测试失败:', error);
  process.exit(1);
}); 