const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function testEventApprovalWorkflow() {
  try {
    console.log('🧪 Testing Event Application Approval Workflow');
    console.log('🧪 测试活动申请审批工作流');
    console.log('=====================================');

    // Step 1: Check existing event applications
    // 步骤1: 检查现有的活动申请
    console.log('\n1. Checking existing event applications...');
    console.log('1. 检查现有的活动申请...');
    
    const applicationsResult = await pool.query(`
      SELECT id, event_title, status, ambassador_id 
      FROM event_applications 
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    console.log(`Found ${applicationsResult.rows.length} pending applications`);
    console.log(`找到 ${applicationsResult.rows.length} 个待处理申请`);

    if (applicationsResult.rows.length === 0) {
      console.log('❌ No pending applications found. Please create some first.');
      console.log('❌ 未找到待处理申请。请先创建一些。');
      return;
    }

    const testApplication = applicationsResult.rows[0];
    console.log(`Using application: ${testApplication.event_title} (ID: ${testApplication.id})`);
    console.log(`使用申请: ${testApplication.event_title} (ID: ${testApplication.id})`);

    // Step 2: Check fee rules
    // 步骤2: 检查手续费规则
    console.log('\n2. Checking fee rules...');
    console.log('2. 检查手续费规则...');
    
    const feeRulesResult = await pool.query(`
      SELECT id, rule_name, staking_fee_percent 
      FROM fee_rules 
      WHERE is_active = true
      ORDER BY effective_date DESC
      LIMIT 1
    `);

    if (feeRulesResult.rows.length === 0) {
      console.log('❌ No active fee rules found. Creating default rule...');
      console.log('❌ 未找到活跃的手续费规则。创建默认规则...');
      
      await pool.query(`
        INSERT INTO fee_rules (
          rule_name, staking_fee_percent, withdrawal_fee_percent, 
          distribution_fee_percent, ambassador_share_percent, 
          athlete_share_percent, community_fund_percent, is_active
        ) VALUES (
          'Default Fee Structure', 5.00, 2.00, 3.00, 1.00, 1.00, 1.00, true
        )
      `);
      
      const newFeeRule = await pool.query(`
        SELECT id, rule_name FROM fee_rules WHERE is_active = true ORDER BY created_at DESC LIMIT 1
      `);
      console.log(`✅ Created fee rule: ${newFeeRule.rows[0].rule_name}`);
      console.log(`✅ 创建手续费规则: ${newFeeRule.rows[0].rule_name}`);
    } else {
      console.log(`✅ Using fee rule: ${feeRulesResult.rows[0].rule_name}`);
      console.log(`✅ 使用手续费规则: ${feeRulesResult.rows[0].rule_name}`);
    }

    // Step 3: Simulate admin approval
    // 步骤3: 模拟管理员批准
    console.log('\n3. Simulating admin approval...');
    console.log('3. 模拟管理员批准...');
    
    // Get a real admin user ID
    // 获取真实的管理员用户ID
    const adminUserResult = await pool.query(`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `);
    
    if (adminUserResult.rows.length === 0) {
      console.log('❌ No admin user found. Creating one...');
      console.log('❌ 未找到管理员用户。创建一个...');
      
      await pool.query(`
        INSERT INTO users (wallet_address, role, student_id) 
        VALUES ('0xADMIN123456789012345678901234567890123456', 'admin', 'ADMIN001')
      `);
      
      const newAdminResult = await pool.query(`
        SELECT id FROM users WHERE role = 'admin' LIMIT 1
      `);
      adminId = newAdminResult.rows[0].id;
    } else {
      adminId = adminUserResult.rows[0].id;
    }
    
    console.log(`Using admin ID: ${adminId}`);
    console.log(`使用管理员ID: ${adminId}`);
    
    const injectedChzAmount = 1000.0; // 1000 CHZ pool injection
    const supportOptions = {
      team_a_coefficient: 1.5,
      team_b_coefficient: 1.2
    };

    // Update application status to approved
    // 更新申请状态为已批准
    await pool.query(`
      UPDATE event_applications 
      SET status = 'approved', 
          reviewed_by = $1, 
          reviewed_at = CURRENT_TIMESTAMP,
          admin_review = $2
      WHERE id = $3
    `, [
      adminId,
      JSON.stringify({
        decision: 'approve',
        admin_notes: 'Test approval for workflow verification',
        support_options: supportOptions,
        injected_chz_amount: injectedChzAmount
      }),
      testApplication.id
    ]);

    console.log(`✅ Application ${testApplication.id} approved`);
    console.log(`✅ 申请 ${testApplication.id} 已批准`);

    // Step 4: Create event from approved application
    // 步骤4: 从已批准的申请创建活动
    console.log('\n4. Creating event from approved application...');
    console.log('4. 从已批准的申请创建活动...');
    
    const createEventResult = await pool.query(`
      SELECT create_event_from_application($1)
    `, [testApplication.id]);

    const eventId = createEventResult.rows[0].create_event_from_application;
    console.log(`✅ Event created with ID: ${eventId}`);
    console.log(`✅ 活动创建成功，ID: ${eventId}`);

    // Step 5: Inject CHZ pool
    // 步骤5: 注入CHZ池
    console.log('\n5. Injecting CHZ pool...');
    console.log('5. 注入CHZ池...');
    
    await pool.query(`
      SELECT inject_chz_pool($1, $2, $3, $4)
    `, [eventId, injectedChzAmount, adminId, feeRulesResult.rows[0]?.id]);

    console.log(`✅ Injected ${injectedChzAmount} CHZ into pool`);
    console.log(`✅ 向池中注入 ${injectedChzAmount} CHZ`);

    // Step 6: Create support options
    // 步骤6: 创建支持选项
    console.log('\n6. Creating support options...');
    console.log('6. 创建支持选项...');
    
    for (const [teamKey, coefficient] of Object.entries(supportOptions)) {
      const teamName = teamKey === 'team_a_coefficient' ? 'Team A' : 'Team B';
      const teamAssociation = teamKey === 'team_a_coefficient' ? 'team_a' : 'team_b';
      
      await pool.query(`
        INSERT INTO support_options (
          event_id, option_name, option_description, 
          coefficient, team_association, is_active
        ) VALUES ($1, $2, $3, $4, $5, true)
      `, [
        eventId,
        `Support ${teamName}`,
        `Support ${teamName} with ${coefficient}x coefficient`,
        coefficient,
        teamAssociation
      ]);
      
      console.log(`✅ Created support option for ${teamName} with ${coefficient}x coefficient`);
      console.log(`✅ 为 ${teamName} 创建支持选项，系数 ${coefficient}x`);
    }

    // Step 7: Verify the complete workflow
    // 步骤7: 验证完整工作流
    console.log('\n7. Verifying complete workflow...');
    console.log('7. 验证完整工作流...');
    
    const verificationResult = await pool.query(`
      SELECT 
        ea.id as application_id,
        ea.status as application_status,
        e.id as event_id,
        e.title as event_title,
        e.match_status,
        e.pool_injected_chz,
        e.total_pool_amount,
        COUNT(so.id) as support_options_count,
        COUNT(assr.id) as support_records_count
      FROM event_applications ea
      LEFT JOIN events e ON ea.id = e.application_id
      LEFT JOIN support_options so ON e.id = so.event_id
      LEFT JOIN audience_support_records assr ON e.id = assr.event_id
      WHERE ea.id = $1
      GROUP BY ea.id, ea.status, e.id, e.title, e.match_status, 
               e.pool_injected_chz, e.total_pool_amount
    `, [testApplication.id]);

    if (verificationResult.rows.length > 0) {
      const result = verificationResult.rows[0];
      console.log('\n✅ Workflow Verification Results:');
      console.log('✅ 工作流验证结果:');
      console.log(`   Application Status: ${result.application_status}`);
      console.log(`   申请状态: ${result.application_status}`);
      console.log(`   Event ID: ${result.event_id}`);
      console.log(`   活动ID: ${result.event_id}`);
      console.log(`   Event Title: ${result.event_title}`);
      console.log(`   活动标题: ${result.event_title}`);
      console.log(`   Match Status: ${result.match_status}`);
      console.log(`   比赛状态: ${result.match_status}`);
      console.log(`   Pool Injected: ${result.pool_injected_chz} CHZ`);
      console.log(`   注入池: ${result.pool_injected_chz} CHZ`);
      console.log(`   Support Options: ${result.support_options_count}`);
      console.log(`   支持选项: ${result.support_options_count}`);
      console.log(`   Support Records: ${result.support_records_count}`);
      console.log(`   支持记录: ${result.support_records_count}`);
    }

    // Step 8: Test ambassador recent events view
    // 步骤8: 测试大使最近活动视图
    console.log('\n8. Testing ambassador recent events view...');
    console.log('8. 测试大使最近活动视图...');
    
    const recentEventsResult = await pool.query(`
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.match_status,
        e.pool_injected_chz,
        ea.team_a_info,
        ea.team_b_info
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      WHERE e.ambassador_id = $1 
        AND e.match_status IN ('pre_match', 'active', 'completed')
      ORDER BY e.event_date DESC
    `, [testApplication.ambassador_id]);

    console.log(`✅ Found ${recentEventsResult.rows.length} recent events for ambassador`);
    console.log(`✅ 为大使找到 ${recentEventsResult.rows.length} 个最近活动`);

    console.log('\n🎉 Event Approval Workflow Test Completed Successfully!');
    console.log('🎉 活动审批工作流测试成功完成！');
    console.log('\nSummary:');
    console.log('总结:');
    console.log('- Event application approved');
    console.log('- 活动申请已批准');
    console.log('- Event created from application');
    console.log('- 从申请创建活动');
    console.log('- CHZ pool injected');
    console.log('- CHZ池已注入');
    console.log('- Support options configured');
    console.log('- 支持选项已配置');
    console.log('- Ambassador can view recent events');
    console.log('- 大使可以查看最近活动');

  } catch (error) {
    console.error('❌ Error testing workflow:', error);
    console.error('❌ 测试工作流时出错:', error);
  } finally {
    await pool.end();
  }
}

testEventApprovalWorkflow(); 