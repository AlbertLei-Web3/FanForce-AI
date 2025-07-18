// Apply Event Approval Database Functions
// 应用事件审批数据库函数
// This script applies the complete event approval workflow functions to the database
// 此脚本将完整的事件审批工作流函数应用到数据库

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function applyEventApprovalFunctions() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting to apply event approval functions...');
    console.log('🚀 开始应用事件审批函数...');
    
    // Read the SQL file
    // 读取SQL文件
    const sqlFilePath = path.join(__dirname, '../lib/event-approval-functions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📖 Reading SQL functions from:', sqlFilePath);
    console.log('📖 从以下文件读取SQL函数:', sqlFilePath);
    
    // Execute the entire SQL file as one statement
    // 将整个SQL文件作为一个语句执行
    console.log('⚡ Executing SQL functions...');
    console.log('⚡ 执行SQL函数...');
    
    try {
      await client.query(sqlContent);
      console.log('✅ SQL functions executed successfully');
      console.log('✅ SQL函数执行成功');
    } catch (error) {
      console.error('❌ Error executing SQL functions:', error.message);
      console.error('❌ 执行SQL函数时出错:', error.message);
      
      // Try to execute functions individually
      // 尝试单独执行函数
      console.log('🔄 Trying to execute functions individually...');
      console.log('🔄 尝试单独执行函数...');
      
      const functionDefinitions = [
        // create_event_from_application function
        `CREATE OR REPLACE FUNCTION create_event_from_application(application_id UUID)
        RETURNS UUID AS $$
        DECLARE
            event_id UUID;
            application_record RECORD;
        BEGIN
            SELECT * INTO application_record 
            FROM event_applications 
            WHERE id = application_id AND status = 'approved';
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Application not found or not approved';
            END IF;
            
            INSERT INTO events (
                title, description, sport_type, event_date, start_time, end_time,
                venue_name, venue_address, venue_capacity, party_venue_capacity,
                team_a_info, team_b_info, estimated_participants, expected_revenue,
                status, ambassador_id, application_id, created_at, updated_at
            ) VALUES (
                application_record.event_title,
                application_record.event_description,
                'soccer',
                application_record.event_start_time::date,
                application_record.event_start_time::time,
                application_record.event_end_time::time,
                application_record.venue_name,
                application_record.venue_address,
                application_record.venue_capacity,
                application_record.party_venue_capacity,
                application_record.team_a_info,
                application_record.team_b_info,
                application_record.estimated_participants,
                application_record.expected_revenue,
                'pre_match',
                application_record.ambassador_id,
                application_id,
                NOW(),
                NOW()
            ) RETURNING id INTO event_id;
            
            INSERT INTO event_creation_log (
                event_id, application_id, ambassador_id, created_at
            ) VALUES (
                event_id, application_id, application_record.ambassador_id, NOW()
            );
            
            RETURN event_id;
        END;
        $$ LANGUAGE plpgsql;`,
        
        // inject_chz_pool function
        `CREATE OR REPLACE FUNCTION inject_chz_pool(
            event_id UUID, amount DECIMAL, admin_id UUID, fee_rule_id UUID DEFAULT NULL
        )
        RETURNS BOOLEAN AS $$
        DECLARE
            event_record RECORD;
            current_pool DECIMAL;
        BEGIN
            SELECT * INTO event_record FROM events WHERE id = event_id;
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Event not found';
            END IF;
            
            current_pool := COALESCE(event_record.pool_injected_chz, 0);
            
            UPDATE events 
            SET 
                pool_injected_chz = current_pool + amount,
                total_pool_amount = current_pool + amount,
                fee_rule_id = COALESCE(fee_rule_id, event_record.fee_rule_id),
                updated_at = NOW()
            WHERE id = event_id;
            
            INSERT INTO chz_pool_injection_log (
                event_id, admin_id, injected_amount, total_pool_amount, injection_date
            ) VALUES (
                event_id, admin_id, amount, current_pool + amount, NOW()
            );
            
            RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql;`,
        
        // create_event_support_options function
        `CREATE OR REPLACE FUNCTION create_event_support_options(
            event_id UUID, team_a_coefficient DECIMAL DEFAULT 1.0, team_b_coefficient DECIMAL DEFAULT 1.0
        )
        RETURNS BOOLEAN AS $$
        DECLARE
            event_record RECORD;
        BEGIN
            SELECT * INTO event_record FROM events WHERE id = event_id;
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Event not found';
            END IF;
            
            INSERT INTO support_options (
                event_id, option_name, option_description, coefficient, team_association, is_active, created_at
            ) VALUES (
                event_id, 'Support Team A', 
                'Support ' || (event_record.team_a_info->>'name') || ' with ' || team_a_coefficient || 'x coefficient',
                team_a_coefficient, 'team_a', TRUE, NOW()
            );
            
            INSERT INTO support_options (
                event_id, option_name, option_description, coefficient, team_association, is_active, created_at
            ) VALUES (
                event_id, 'Support Team B',
                'Support ' || (event_record.team_b_info->>'name') || ' with ' || team_b_coefficient || 'x coefficient',
                team_b_coefficient, 'team_b', TRUE, NOW()
            );
            
            UPDATE events 
            SET 
                support_options = jsonb_build_object(
                    'team_a_coefficient', team_a_coefficient,
                    'team_b_coefficient', team_b_coefficient
                ),
                updated_at = NOW()
            WHERE id = event_id;
            
            RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql;`,
        
        // complete_event_approval function
        `CREATE OR REPLACE FUNCTION complete_event_approval(
            application_id UUID, admin_id UUID, injected_chz_amount DECIMAL DEFAULT 0,
            team_a_coefficient DECIMAL DEFAULT 1.0, team_b_coefficient DECIMAL DEFAULT 1.0,
            admin_notes TEXT DEFAULT ''
        )
        RETURNS UUID AS $$
        DECLARE
            event_id UUID;
            application_record RECORD;
        BEGIN
            SELECT * INTO application_record 
            FROM event_applications 
            WHERE id = application_id AND status = 'pending';
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Application not found or already processed';
            END IF;
            
            UPDATE event_applications 
            SET 
                status = 'approved',
                reviewed_by = admin_id,
                reviewed_at = NOW(),
                admin_review = jsonb_build_object(
                    'decision', 'approved',
                    'admin_notes', admin_notes,
                    'injected_chz_amount', injected_chz_amount,
                    'team_a_coefficient', team_a_coefficient,
                    'team_b_coefficient', team_b_coefficient
                )
            WHERE id = application_id;
            
            SELECT create_event_from_application(application_id) INTO event_id;
            
            IF injected_chz_amount > 0 THEN
                PERFORM inject_chz_pool(event_id, injected_chz_amount, admin_id);
            END IF;
            
            PERFORM create_event_support_options(event_id, team_a_coefficient, team_b_coefficient);
            
            INSERT INTO event_approval_log (
                application_id, admin_id, action_type, decision, injected_chz_amount,
                support_options, admin_notes, created_at
            ) VALUES (
                application_id, admin_id, 'approve', 'approved', injected_chz_amount,
                jsonb_build_object('team_a_coefficient', team_a_coefficient, 'team_b_coefficient', team_b_coefficient),
                admin_notes, NOW()
            );
            
            RETURN event_id;
        END;
        $$ LANGUAGE plpgsql;`,
        
        // reject_event_application function
        `CREATE OR REPLACE FUNCTION reject_event_application(
            application_id UUID, admin_id UUID, admin_notes TEXT DEFAULT ''
        )
        RETURNS BOOLEAN AS $$
        DECLARE
            application_record RECORD;
        BEGIN
            SELECT * INTO application_record 
            FROM event_applications 
            WHERE id = application_id AND status = 'pending';
            
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Application not found or already processed';
            END IF;
            
            UPDATE event_applications 
            SET 
                status = 'rejected',
                reviewed_by = admin_id,
                reviewed_at = NOW(),
                admin_review = jsonb_build_object(
                    'decision', 'rejected',
                    'admin_notes', admin_notes
                )
            WHERE id = application_id;
            
            INSERT INTO event_approval_log (
                application_id, admin_id, action_type, decision, admin_notes, created_at
            ) VALUES (
                application_id, admin_id, 'reject', 'rejected', admin_notes, NOW()
            );
            
            RETURN TRUE;
        END;
        $$ LANGUAGE plpgsql;`
      ];
      
      for (let i = 0; i < functionDefinitions.length; i++) {
        try {
          console.log(`⚡ Executing function ${i + 1}/${functionDefinitions.length}...`);
          console.log(`⚡ 执行函数 ${i + 1}/${functionDefinitions.length}...`);
          
          await client.query(functionDefinitions[i]);
          
          console.log(`✅ Function ${i + 1} executed successfully`);
          console.log(`✅ 函数 ${i + 1} 执行成功`);
        } catch (error) {
          console.error(`❌ Error executing function ${i + 1}:`, error.message);
          console.error(`❌ 执行函数 ${i + 1} 时出错:`, error.message);
        }
      }
    }
    
    // Verify functions were created
    // 验证函数是否已创建
    console.log('🔍 Verifying functions were created...');
    console.log('🔍 验证函数是否已创建...');
    
    const functionNames = [
      'create_event_from_application',
      'inject_chz_pool',
      'create_event_support_options',
      'complete_event_approval',
      'reject_event_application'
    ];
    
    for (const funcName of functionNames) {
      try {
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
      } catch (error) {
        console.error(`❌ Error checking function '${funcName}':`, error.message);
        console.error(`❌ 检查函数 '${funcName}' 时出错:`, error.message);
      }
    }
    
    console.log('🎉 Event approval functions application completed!');
    console.log('🎉 事件审批函数应用完成！');
    
    // Test the functions with a sample
    // 用示例测试函数
    console.log('🧪 Testing functions with sample data...');
    console.log('🧪 用示例数据测试函数...');
    
    // Check if we have any pending applications to test with
    // 检查是否有待处理的申请可以测试
    const testResult = await client.query(`
      SELECT id, event_title, status 
      FROM event_applications 
      WHERE status = 'pending' 
      LIMIT 1
    `);
    
    if (testResult.rows.length > 0) {
      const testApp = testResult.rows[0];
      console.log(`📋 Found test application: ${testApp.event_title} (${testApp.id})`);
      console.log(`📋 找到测试申请: ${testApp.event_title} (${testApp.id})`);
      
      // Note: We won't actually execute the approval to avoid affecting real data
      // 注意：我们不会实际执行批准以避免影响真实数据
      console.log('💡 Functions are ready to use with real applications');
      console.log('💡 函数已准备好与真实申请一起使用');
    } else {
      console.log('ℹ️ No pending applications found for testing');
      console.log('ℹ️ 未找到待处理的申请进行测试');
    }
    
  } catch (error) {
    console.error('❌ Error applying event approval functions:', error);
    console.error('❌ 应用事件审批函数时出错:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
// 运行脚本
if (require.main === module) {
  applyEventApprovalFunctions()
    .then(() => {
      console.log('✅ Script completed successfully');
      console.log('✅ 脚本成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      console.error('❌ 脚本失败:', error);
      process.exit(1);
    });
}

module.exports = { applyEventApprovalFunctions }; 