// Final System Test - Event Approval Workflow
// 最终系统测试 - 事件审批工作流
// This script performs a comprehensive test of the complete event approval system
// 此脚本对完整的事件审批系统进行综合测试

const { Pool } = require('pg');

// Database connection configuration
// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function finalSystemTest() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Final System Test - Event Approval Workflow');
    console.log('🧪 最终系统测试 - 事件审批工作流');
    console.log('=' .repeat(60));
    
    // Test 1: Database Tables
    // 测试1：数据库表
    console.log('\n📋 Test 1: Database Tables');
    console.log('📋 测试1：数据库表');
    
    const requiredTables = [
      'event_applications',
      'events',
      'support_options',
      'event_approval_log',
      'chz_pool_injection_log',
      'event_creation_log',
      'fee_rules',
      'team_drafts',
      'users'
    ];
    
    for (const tableName of requiredTables) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [tableName]);
        
        if (result.rows[0].exists) {
          const countResult = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`✅ ${tableName}: ${countResult.rows[0].count} records`);
          console.log(`✅ ${tableName}: ${countResult.rows[0].count} 条记录`);
        } else {
          console.log(`❌ ${tableName}: Table missing`);
          console.log(`❌ ${tableName}: 表缺失`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: Error - ${error.message}`);
        console.log(`❌ ${tableName}: 错误 - ${error.message}`);
      }
    }
    
    // Test 2: Database Functions
    // 测试2：数据库函数
    console.log('\n🔧 Test 2: Database Functions');
    console.log('🔧 测试2：数据库函数');
    
    const requiredFunctions = [
      'create_event_from_application',
      'inject_chz_pool',
      'create_event_support_options',
      'complete_event_approval',
      'reject_event_application'
    ];
    
    for (const funcName of requiredFunctions) {
      try {
        const result = await client.query(`
          SELECT routine_name 
          FROM information_schema.routines 
          WHERE routine_name = $1 AND routine_type = 'FUNCTION'
        `, [funcName]);
        
        if (result.rows.length > 0) {
          console.log(`✅ ${funcName}: Function exists`);
          console.log(`✅ ${funcName}: 函数存在`);
        } else {
          console.log(`❌ ${funcName}: Function missing`);
          console.log(`❌ ${funcName}: 函数缺失`);
        }
      } catch (error) {
        console.log(`❌ ${funcName}: Error - ${error.message}`);
        console.log(`❌ ${funcName}: 错误 - ${error.message}`);
      }
    }
    
    // Test 3: Data Flow
    // 测试3：数据流
    console.log('\n🔄 Test 3: Data Flow');
    console.log('🔄 测试3：数据流');
    
    // Check pending applications
    // 检查待处理申请
    const pendingApps = await client.query(`
      SELECT id, event_title, ambassador_id, status 
      FROM event_applications 
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log(`📋 Pending applications: ${pendingApps.rows.length}`);
    console.log(`📋 待处理申请: ${pendingApps.rows.length}`);
    
    pendingApps.rows.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.event_title} (${app.id})`);
      console.log(`   ${index + 1}. ${app.event_title} (${app.id})`);
    });
    
    // Check events
    // 检查事件
    const events = await client.query(`
      SELECT id, title, status, pool_injected_chz, total_pool_amount
      FROM events
      ORDER BY created_at DESC
      LIMIT 3
    `);
    
    console.log(`📊 Total events: ${events.rows.length}`);
    console.log(`📊 总事件数: ${events.rows.length}`);
    
    events.rows.forEach((event, index) => {
      console.log(`   ${index + 1}. ${event.title} (${event.status}) - Pool: ${event.pool_injected_chz || 0} CHZ`);
      console.log(`   ${index + 1}. ${event.title} (${event.status}) - 奖池: ${event.pool_injected_chz || 0} CHZ`);
    });
    
    // Check support options
    // 检查支持选项
    const supportOptions = await client.query(`
      SELECT so.id, so.option_name, so.coefficient, so.team_association, e.title as event_title
      FROM support_options so
      JOIN events e ON so.event_id = e.id
      ORDER BY so.created_at DESC
      LIMIT 5
    `);
    
    console.log(`🎯 Support options: ${supportOptions.rows.length}`);
    console.log(`🎯 支持选项: ${supportOptions.rows.length}`);
    
    supportOptions.rows.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.option_name} (${option.coefficient}x) - ${option.event_title}`);
      console.log(`   ${index + 1}. ${option.option_name} (${option.coefficient}x) - ${option.event_title}`);
    });
    
    // Test 4: API Endpoints (File Check)
    // 测试4：API端点（文件检查）
    console.log('\n🌐 Test 4: API Endpoints');
    console.log('🌐 测试4：API端点');
    
    const fs = require('fs');
    const path = require('path');
    
    const apiEndpoints = [
      'app/api/admin/event-applications/route.ts',
      'app/api/ambassador/applications/route.ts',
      'app/api/ambassador/team-drafts/route.ts'
    ];
    
    for (const endpoint of apiEndpoints) {
      if (fs.existsSync(endpoint)) {
        console.log(`✅ ${endpoint}: File exists`);
        console.log(`✅ ${endpoint}: 文件存在`);
      } else {
        console.log(`❌ ${endpoint}: File missing`);
        console.log(`❌ ${endpoint}: 文件缺失`);
      }
    }
    
    // Test 5: Frontend Integration
    // 测试5：前端集成
    console.log('\n🎨 Test 5: Frontend Integration');
    console.log('🎨 测试5：前端集成');
    
    const frontendFiles = [
      'app/dashboard/admin/page.tsx',
      'app/dashboard/ambassador/page.tsx',
      'app/dashboard/ambassador/event-applications/page.tsx'
    ];
    
    for (const file of frontendFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}: File exists`);
        console.log(`✅ ${file}: 文件存在`);
      } else {
        console.log(`❌ ${file}: File missing`);
        console.log(`❌ ${file}: 文件缺失`);
      }
    }
    
    // Test 6: Complete Workflow Test
    // 测试6：完整工作流测试
    console.log('\n⚡ Test 6: Complete Workflow Test');
    console.log('⚡ 测试6：完整工作流测试');
    
    if (pendingApps.rows.length > 0) {
      const testApp = pendingApps.rows[0];
      console.log(`🧪 Testing with application: ${testApp.event_title}`);
      console.log(`🧪 测试申请: ${testApp.event_title}`);
      
      // Get admin user
      // 获取管理员用户
      const adminUser = await client.query(`
        SELECT id, wallet_address, role 
        FROM users 
        WHERE role = 'admin' 
        LIMIT 1
      `);
      
      if (adminUser.rows.length > 0) {
        const adminId = adminUser.rows[0].id;
        console.log(`👤 Using admin: ${adminId}`);
        console.log(`👤 使用管理员: ${adminId}`);
        
        try {
          // Test approval process
          // 测试审批流程
          const approvalResult = await client.query(`
            SELECT complete_event_approval($1, $2, $3, $4, $5, $6)
          `, [
            testApp.id,
            adminId,
            500.0, // Injected CHZ amount
            1.2,   // Team A coefficient
            1.0,   // Team B coefficient
            'Final system test approval'
          ]);
          
          const eventId = approvalResult.rows[0].complete_event_approval;
          console.log(`✅ Workflow test successful - Event created: ${eventId}`);
          console.log(`✅ 工作流测试成功 - 事件创建: ${eventId}`);
          
          // Verify the created event
          // 验证创建的事件
          const eventResult = await client.query(`
            SELECT title, status, pool_injected_chz, support_options
            FROM events 
            WHERE id = $1
          `, [eventId]);
          
          if (eventResult.rows.length > 0) {
            const event = eventResult.rows[0];
            console.log(`   Event: ${event.title}`);
            console.log(`   事件: ${event.title}`);
            console.log(`   Status: ${event.status}`);
            console.log(`   状态: ${event.status}`);
            console.log(`   Pool: ${event.pool_injected_chz} CHZ`);
            console.log(`   奖池: ${event.pool_injected_chz} CHZ`);
            console.log(`   Support Options: ${JSON.stringify(event.support_options)}`);
            console.log(`   支持选项: ${JSON.stringify(event.support_options)}`);
          }
          
        } catch (error) {
          console.error(`❌ Workflow test failed: ${error.message}`);
          console.error(`❌ 工作流测试失败: ${error.message}`);
        }
      } else {
        console.log('❌ No admin user found for testing');
        console.log('❌ 未找到管理员用户进行测试');
      }
    } else {
      console.log('ℹ️ No pending applications for workflow test');
      console.log('ℹ️ 没有待处理申请进行工作流测试');
    }
    
    // Test 7: System Summary
    // 测试7：系统总结
    console.log('\n📊 Test 7: System Summary');
    console.log('📊 测试7：系统总结');
    
    const summaryQueries = [
      { name: 'Total Applications', query: 'SELECT COUNT(*) as count FROM event_applications' },
      { name: 'Pending Applications', query: 'SELECT COUNT(*) as count FROM event_applications WHERE status = \'pending\'' },
      { name: 'Approved Applications', query: 'SELECT COUNT(*) as count FROM event_applications WHERE status = \'approved\'' },
      { name: 'Total Events', query: 'SELECT COUNT(*) as count FROM events' },
      { name: 'Support Options', query: 'SELECT COUNT(*) as count FROM support_options' },
      { name: 'Approval Logs', query: 'SELECT COUNT(*) as count FROM event_approval_log' },
      { name: 'CHZ Injection Logs', query: 'SELECT COUNT(*) as count FROM chz_pool_injection_log' }
    ];
    
    for (const summary of summaryQueries) {
      try {
        const result = await client.query(summary.query);
        console.log(`   ${summary.name}: ${result.rows[0].count}`);
        console.log(`   ${summary.name}: ${result.rows[0].count}`);
      } catch (error) {
        console.log(`   ${summary.name}: Error - ${error.message}`);
        console.log(`   ${summary.name}: 错误 - ${error.message}`);
      }
    }
    
    console.log('\n🎉 Final System Test Completed!');
    console.log('🎉 最终系统测试完成！');
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Error during final system test:', error);
    console.error('❌ 最终系统测试期间出错:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  finalSystemTest()
    .then(() => {
      console.log('✅ Final system test completed successfully');
      console.log('✅ 最终系统测试成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Final system test failed:', error);
      console.error('❌ 最终系统测试失败:', error);
      process.exit(1);
    });
}

module.exports = { finalSystemTest }; 