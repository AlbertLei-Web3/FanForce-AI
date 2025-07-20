// Test script for pool balance functionality
// 奖池余额功能测试脚本
// This script tests the chz_pool_management table data and API integration
// 此脚本测试chz_pool_management表数据和API集成

const { Pool } = require('pg');

// Database connection pool
// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function testPoolBalanceData() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing pool balance data from chz_pool_management table...');
    console.log('🔍 测试来自chz_pool_management表的奖池余额数据...');
    
    // Test 1: Check if chz_pool_management table exists and has data
    // 测试1: 检查chz_pool_management表是否存在且有数据
    console.log('\n📊 Test 1: Checking chz_pool_management table data...');
    console.log('📊 测试1: 检查chz_pool_management表数据...');
    
    const poolDataQuery = `
      SELECT 
        id,
        event_id,
        operation_type,
        amount,
        pool_balance_before,
        pool_balance_after,
        created_at
      FROM chz_pool_management 
      ORDER BY created_at DESC 
      LIMIT 5
    `;
    
    const poolDataResult = await client.query(poolDataQuery);
    
    if (poolDataResult.rows.length === 0) {
      console.log('❌ No data found in chz_pool_management table');
      console.log('❌ chz_pool_management表中未找到数据');
      
      // Create sample data for testing
      // 创建测试用的示例数据
      console.log('\n📝 Creating sample pool management data...');
      console.log('📝 创建示例池管理数据...');
      
      // First, get an existing event_id
      // 首先，获取一个现有的事件ID
      const eventQuery = `
        SELECT id FROM events LIMIT 1
      `;
      const eventResult = await client.query(eventQuery);
      
      if (eventResult.rows.length > 0) {
        const eventId = eventResult.rows[0].id;
        
        // Insert sample pool management data
        // 插入示例池管理数据
        await client.query(`
          INSERT INTO chz_pool_management (
            event_id,
            operation_type,
            amount,
            performed_by,
            operation_reason,
            pool_balance_before,
            pool_balance_after,
            transaction_status
          ) VALUES (
            $1,
            'injection',
            2500.00,
            (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
            'Initial pool injection for featured championship',
            0.00,
            2500.00,
            'completed'
          )
        `, [eventId]);
        
        console.log('✅ Sample pool management data created');
        console.log('✅ 示例池管理数据已创建');
      }
    } else {
      console.log('✅ Found pool management data:');
      console.log('✅ 找到池管理数据:');
      poolDataResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. Event ID: ${row.event_id}`);
        console.log(`     Operation: ${row.operation_type}`);
        console.log(`     Amount: ${row.amount} CHZ`);
        console.log(`     Pool Balance After: ${row.pool_balance_after} CHZ`);
        console.log(`     Created: ${row.created_at}`);
        console.log('');
      });
    }
    
    // Test 2: Test the fixed featured events API query
    // 测试2: 测试修复后的焦点赛事API查询
    console.log('\n🔗 Test 2: Testing fixed featured events API query...');
    console.log('🔗 测试2: 测试修复后的焦点赛事API查询...');
    
    const featuredEventQuery = `
      SELECT 
        ea.id,
        ea.event_title,
        ea.event_description,
        ea.event_start_time,
        ea.venue_name,
        ea.venue_capacity,
        ea.party_venue_capacity,
        ea.team_a_info,
        ea.team_b_info,
        ea.estimated_participants,
        ea.expected_revenue,
        ea.status,
        ea.created_at,
        u.student_id as ambassador_student_id,
        u.profile_data as ambassador_profile,
        (ea.event_start_time - INTERVAL '4 hours') as qr_expiry_time,
        COALESCE((
          SELECT COUNT(DISTINCT user_id) 
          FROM audience_stakes_extended 
          WHERE event_id = ea.id AND stake_status = 'active'
        ), 0) as current_stakers,
        COALESCE((
          SELECT SUM(stake_amount) 
          FROM audience_stakes_extended 
          WHERE event_id = ea.id AND stake_status = 'active'
        ), 0) as total_pool_amount,
        COALESCE((
          SELECT COUNT(*) 
          FROM event_participations 
          WHERE application_id = ea.id AND participation_type = 'watch_and_party'
        ), 0) as party_applicants,
        -- Fixed: Get the latest pool balance after from chz_pool_management through events table
        -- 修复: 通过events表从chz_pool_management获取最新的pool_balance_after
        COALESCE((
          SELECT cpm.pool_balance_after 
          FROM chz_pool_management cpm
          JOIN events e ON cpm.event_id = e.id
          WHERE e.application_id = ea.id 
          ORDER BY cpm.created_at DESC 
          LIMIT 1
        ), 0) as pool_balance_after
      FROM event_applications ea
      LEFT JOIN users u ON ea.ambassador_id = u.id
      WHERE ea.status = 'approved'
      ORDER BY ea.created_at DESC
      LIMIT 1
    `;
    
    const featuredEventResult = await client.query(featuredEventQuery);
    
    if (featuredEventResult.rows.length > 0) {
      const event = featuredEventResult.rows[0];
      console.log('✅ Featured event found:');
      console.log('✅ 找到焦点赛事:');
      console.log(`  Title: ${event.event_title}`);
      console.log(`  Status: ${event.status}`);
      console.log(`  Current Stakers: ${event.current_stakers}`);
      console.log(`  Total Pool Amount: ${event.total_pool_amount} CHZ`);
      console.log(`  Pool Balance After: ${event.pool_balance_after} CHZ`);
      console.log(`  Party Applicants: ${event.party_applicants}`);
      console.log(`  Created: ${event.created_at}`);
    } else {
      console.log('❌ No approved events found for featured championship');
      console.log('❌ 未找到已批准的焦点锦标赛赛事');
    }
    
    // Test 3: Test API endpoint (if server is running)
    // 测试3: 测试API端点（如果服务器正在运行）
    console.log('\n🌐 Test 3: Testing API endpoint...');
    console.log('🌐 测试3: 测试API端点...');
    
    try {
      const response = await fetch('http://localhost:3000/api/audience/featured-events');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API endpoint working correctly:');
        console.log('✅ API端点工作正常:');
        console.log(`  Event Title: ${data.featuredEvent.title}`);
        console.log(`  Pool Balance After: ${data.featuredEvent.poolBalanceAfter} CHZ`);
        console.log(`  Current Stakers: ${data.featuredEvent.currentStakers}`);
        console.log(`  Total Pool: ${data.featuredEvent.totalPool} CHZ`);
      } else {
        console.log('❌ API endpoint returned error:');
        console.log('❌ API端点返回错误:');
        console.log(`  Error: ${data.error}`);
      }
    } catch (error) {
      console.log('❌ API endpoint test failed (server may not be running):');
      console.log('❌ API端点测试失败（服务器可能未运行）:');
      console.log(`  Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ 测试失败:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
// 运行测试
testPoolBalanceData()
  .then(() => {
    console.log('\n🎉 Pool balance test completed!');
    console.log('🎉 奖池余额测试完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Pool balance test failed:', error);
    console.error('💥 奖池余额测试失败:', error);
    process.exit(1);
  }); 