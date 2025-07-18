// Test Complete Event Approval Workflow
// 测试完整事件审批工作流
// This script tests the complete event approval process from application to event creation
// 此脚本测试从申请到事件创建的完整事件审批流程

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

async function testCompleteEventWorkflow() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing Complete Event Approval Workflow...');
    console.log('🧪 测试完整事件审批工作流...');
    
    // Step 1: Check if we have pending applications
    // 步骤1：检查是否有待处理的申请
    console.log('\n📋 Step 1: Checking pending applications...');
    console.log('📋 步骤1：检查待处理申请...');
    
    const pendingApps = await client.query(`
      SELECT id, event_title, ambassador_id, status 
      FROM event_applications 
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (pendingApps.rows.length === 0) {
      console.log('❌ No pending applications found');
      console.log('❌ 未找到待处理申请');
      return;
    }
    
    console.log(`✅ Found ${pendingApps.rows.length} pending applications`);
    console.log(`✅ 找到 ${pendingApps.rows.length} 个待处理申请`);
    
    // Step 2: Check if database functions exist
    // 步骤2：检查数据库函数是否存在
    console.log('\n🔍 Step 2: Verifying database functions...');
    console.log('🔍 步骤2：验证数据库函数...');
    
    const functionNames = [
      'create_event_from_application',
      'inject_chz_pool',
      'create_event_support_options',
      'complete_event_approval',
      'reject_event_application'
    ];
    
    for (const funcName of functionNames) {
      const result = await client.query(`
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_name = $1 AND routine_type = 'FUNCTION'
      `, [funcName]);
      
      if (result.rows.length > 0) {
        console.log(`✅ Function '${funcName}' exists`);
        console.log(`✅ 函数 '${funcName}' 存在`);
      } else {
        console.log(`❌ Function '${funcName}' not found`);
        console.log(`❌ 未找到函数 '${funcName}'`);
      }
    }
    
    // Step 3: Test approval process with first pending application
    // 步骤3：用第一个待处理申请测试审批流程
    console.log('\n⚡ Step 3: Testing approval process...');
    console.log('⚡ 步骤3：测试审批流程...');
    
    const testApp = pendingApps.rows[0];
    console.log(`📋 Testing with application: ${testApp.event_title} (${testApp.id})`);
    console.log(`📋 测试申请: ${testApp.event_title} (${testApp.id})`);
    
    // Get admin user for testing
    // 获取管理员用户进行测试
    const adminUser = await client.query(`
      SELECT id, wallet_address, role 
      FROM users 
      WHERE role = 'admin' 
      LIMIT 1
    `);
    
    if (adminUser.rows.length === 0) {
      console.log('❌ No admin user found for testing');
      console.log('❌ 未找到管理员用户进行测试');
      return;
    }
    
    const adminId = adminUser.rows[0].id;
    console.log(`👤 Using admin: ${adminId}`);
    console.log(`👤 使用管理员: ${adminId}`);
    
    // Test the complete approval function
    // 测试完整的批准函数
    console.log('\n🎯 Testing complete_event_approval function...');
    console.log('🎯 测试 complete_event_approval 函数...');
    
    try {
      const approvalResult = await client.query(`
        SELECT complete_event_approval($1, $2, $3, $4, $5, $6)
      `, [
        testApp.id,
        adminId,
        1000.0, // Injected CHZ amount
        1.5,    // Team A coefficient
        1.0,    // Team B coefficient
        'Test approval with CHZ injection and support options'
      ]);
      
      const eventId = approvalResult.rows[0].complete_event_approval;
      console.log(`✅ Event created successfully with ID: ${eventId}`);
      console.log(`✅ 事件创建成功，ID: ${eventId}`);
      
      // Step 4: Verify event was created
      // 步骤4：验证事件是否已创建
      console.log('\n🔍 Step 4: Verifying event creation...');
      console.log('🔍 步骤4：验证事件创建...');
      
      const eventResult = await client.query(`
        SELECT id, title, status, pool_injected_chz, total_pool_amount, support_options
        FROM events 
        WHERE id = $1
      `, [eventId]);
      
      if (eventResult.rows.length > 0) {
        const event = eventResult.rows[0];
        console.log(`✅ Event found: ${event.title}`);
        console.log(`✅ 找到事件: ${event.title}`);
        console.log(`   Status: ${event.status}`);
        console.log(`   状态: ${event.status}`);
        console.log(`   Pool Injected: ${event.pool_injected_chz} CHZ`);
        console.log(`   注入奖池: ${event.pool_injected_chz} CHZ`);
        console.log(`   Total Pool: ${event.total_pool_amount} CHZ`);
        console.log(`   总奖池: ${event.total_pool_amount} CHZ`);
        console.log(`   Support Options: ${JSON.stringify(event.support_options)}`);
        console.log(`   支持选项: ${JSON.stringify(event.support_options)}`);
      } else {
        console.log('❌ Event not found after creation');
        console.log('❌ 创建后未找到事件');
      }
      
      // Step 5: Check support options were created
      // 步骤5：检查支持选项是否已创建
      console.log('\n🔍 Step 5: Verifying support options...');
      console.log('🔍 步骤5：验证支持选项...');
      
      const supportOptionsResult = await client.query(`
        SELECT id, option_name, coefficient, team_association, is_active
        FROM support_options 
        WHERE event_id = $1
        ORDER BY team_association
      `, [eventId]);
      
      console.log(`✅ Found ${supportOptionsResult.rows.length} support options`);
      console.log(`✅ 找到 ${supportOptionsResult.rows.length} 个支持选项`);
      
      supportOptionsResult.rows.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.option_name} (${option.coefficient}x) - ${option.team_association}`);
        console.log(`   ${index + 1}. ${option.option_name} (${option.coefficient}x) - ${option.team_association}`);
      });
      
      // Step 6: Check approval log
      // 步骤6：检查审批日志
      console.log('\n🔍 Step 6: Verifying approval log...');
      console.log('🔍 步骤6：验证审批日志...');
      
      const logResult = await client.query(`
        SELECT action_type, decision, injected_chz_amount, admin_notes, created_at
        FROM event_approval_log 
        WHERE application_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [testApp.id]);
      
      if (logResult.rows.length > 0) {
        const log = logResult.rows[0];
        console.log(`✅ Approval logged: ${log.action_type} - ${log.decision}`);
        console.log(`✅ 审批已记录: ${log.action_type} - ${log.decision}`);
        console.log(`   Injected CHZ: ${log.injected_chz_amount}`);
        console.log(`   注入CHZ: ${log.injected_chz_amount}`);
        console.log(`   Admin Notes: ${log.admin_notes}`);
        console.log(`   管理员备注: ${log.admin_notes}`);
      } else {
        console.log('❌ Approval log not found');
        console.log('❌ 未找到审批日志');
      }
      
    } catch (error) {
      console.error('❌ Error during approval test:', error.message);
      console.error('❌ 审批测试期间出错:', error.message);
    }
    
    // Step 7: Summary
    // 步骤7：总结
    console.log('\n📊 Step 7: Workflow Summary...');
    console.log('📊 步骤7：工作流总结...');
    
    const summaryStats = await client.query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_applications,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_applications
      FROM event_applications
    `);
    
    const stats = summaryStats.rows[0];
    console.log(`📈 Application Statistics:`);
    console.log(`📈 申请统计:`);
    console.log(`   Total: ${stats.total_applications}`);
    console.log(`   总计: ${stats.total_applications}`);
    console.log(`   Pending: ${stats.pending_applications}`);
    console.log(`   待处理: ${stats.pending_applications}`);
    console.log(`   Approved: ${stats.approved_applications}`);
    console.log(`   已批准: ${stats.approved_applications}`);
    console.log(`   Rejected: ${stats.rejected_applications}`);
    console.log(`   已拒绝: ${stats.rejected_applications}`);
    
    const eventStats = await client.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'pre_match' THEN 1 END) as pre_match_events,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as live_events,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_events
      FROM events
    `);
    
    const eventStat = eventStats.rows[0];
    console.log(`📈 Event Statistics:`);
    console.log(`📈 事件统计:`);
    console.log(`   Total: ${eventStat.total_events}`);
    console.log(`   总计: ${eventStat.total_events}`);
    console.log(`   Pre-match: ${eventStat.pre_match_events}`);
    console.log(`   赛前: ${eventStat.pre_match_events}`);
    console.log(`   Live: ${eventStat.live_events}`);
    console.log(`   直播: ${eventStat.live_events}`);
    console.log(`   Completed: ${eventStat.completed_events}`);
    console.log(`   已完成: ${eventStat.completed_events}`);
    
    console.log('\n🎉 Complete Event Workflow Test Finished!');
    console.log('🎉 完整事件工作流测试完成！');
    
  } catch (error) {
    console.error('❌ Error during workflow test:', error);
    console.error('❌ 工作流测试期间出错:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  testCompleteEventWorkflow()
    .then(() => {
      console.log('✅ Test completed successfully');
      console.log('✅ 测试成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      console.error('❌ 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteEventWorkflow }; 