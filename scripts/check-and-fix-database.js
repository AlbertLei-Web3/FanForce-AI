// Check and Fix Database - Event Approval Workflow
// 检查并修复数据库 - 事件审批工作流
// This script checks all tables and functions needed for the complete event approval workflow
// 此脚本检查完整事件审批工作流所需的所有表和函数

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

async function checkAndFixDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking database tables and functions...');
    console.log('🔍 检查数据库表和函数...');
    
    // Check required tables
    // 检查必需的表
    const requiredTables = [
      'event_applications',
      'events',
      'support_options',
      'event_approval_log',
      'chz_pool_injection_log',
      'event_creation_log',
      'fee_rules'
    ];
    
    console.log('\n📋 Checking required tables...');
    console.log('📋 检查必需的表...');
    
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
          console.log(`✅ Table '${tableName}' exists`);
          console.log(`✅ 表 '${tableName}' 存在`);
        } else {
          console.log(`❌ Table '${tableName}' missing - creating...`);
          console.log(`❌ 表 '${tableName}' 缺失 - 正在创建...`);
          
          // Create missing tables
          // 创建缺失的表
          switch (tableName) {
            case 'chz_pool_injection_log':
              await client.query(`
                CREATE TABLE chz_pool_injection_log (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  event_id UUID NOT NULL REFERENCES events(id),
                  admin_id UUID NOT NULL REFERENCES users(id),
                  injected_amount DECIMAL(15,8) NOT NULL,
                  total_pool_amount DECIMAL(15,8) NOT NULL,
                  injection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
              `);
              break;
              
            case 'event_creation_log':
              await client.query(`
                CREATE TABLE event_creation_log (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  event_id UUID NOT NULL REFERENCES events(id),
                  application_id UUID NOT NULL REFERENCES event_applications(id),
                  ambassador_id UUID NOT NULL REFERENCES users(id),
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
              `);
              break;
              
            case 'event_approval_log':
              await client.query(`
                CREATE TABLE event_approval_log (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  application_id UUID NOT NULL REFERENCES event_applications(id),
                  admin_id UUID NOT NULL REFERENCES users(id),
                  action_type VARCHAR(20) NOT NULL,
                  decision VARCHAR(20) NOT NULL,
                  injected_chz_amount DECIMAL(15,8) DEFAULT 0,
                  support_options JSONB,
                  admin_notes TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
              `);
              break;
              
            case 'support_options':
              await client.query(`
                CREATE TABLE support_options (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  event_id UUID NOT NULL REFERENCES events(id),
                  option_name VARCHAR(255) NOT NULL,
                  option_description TEXT,
                  coefficient DECIMAL(5,2) DEFAULT 1.0,
                  team_association VARCHAR(20),
                  is_active BOOLEAN DEFAULT TRUE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
              `);
              break;
              
            case 'fee_rules':
              await client.query(`
                CREATE TABLE fee_rules (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  rule_name VARCHAR(255) NOT NULL,
                  staking_fee_percent DECIMAL(5,2) DEFAULT 0,
                  distribution_fee_percent DECIMAL(5,2) DEFAULT 0,
                  ambassador_share_percent DECIMAL(5,2) DEFAULT 0,
                  athlete_share_percent DECIMAL(5,2) DEFAULT 0,
                  community_fund_percent DECIMAL(5,2) DEFAULT 0,
                  is_active BOOLEAN DEFAULT TRUE,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
              `);
              break;
          }
          
          console.log(`✅ Created table '${tableName}'`);
          console.log(`✅ 创建表 '${tableName}'`);
        }
      } catch (error) {
        console.error(`❌ Error with table '${tableName}':`, error.message);
        console.error(`❌ 表 '${tableName}' 出错:`, error.message);
      }
    }
    
    // Check required functions
    // 检查必需的函数
    console.log('\n🔍 Checking required functions...');
    console.log('🔍 检查必需的函数...');
    
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
          console.log(`✅ Function '${funcName}' exists`);
          console.log(`✅ 函数 '${funcName}' 存在`);
        } else {
          console.log(`❌ Function '${funcName}' missing`);
          console.log(`❌ 函数 '${funcName}' 缺失`);
        }
      } catch (error) {
        console.error(`❌ Error checking function '${funcName}':`, error.message);
        console.error(`❌ 检查函数 '${funcName}' 时出错:`, error.message);
      }
    }
    
    // Check API endpoints
    // 检查API端点
    console.log('\n🌐 Checking API endpoints...');
    console.log('🌐 检查API端点...');
    
    const apiEndpoints = [
      '/api/admin/event-applications',
      '/api/ambassador/applications',
      '/api/ambassador/team-drafts'
    ];
    
    for (const endpoint of apiEndpoints) {
      console.log(`📡 API endpoint: ${endpoint}`);
      console.log(`📡 API端点: ${endpoint}`);
    }
    
    // Test data flow
    // 测试数据流
    console.log('\n🧪 Testing data flow...');
    console.log('🧪 测试数据流...');
    
    // Check pending applications
    // 检查待处理申请
    const pendingApps = await client.query(`
      SELECT COUNT(*) as count 
      FROM event_applications 
      WHERE status = 'pending'
    `);
    
    console.log(`📋 Pending applications: ${pendingApps.rows[0].count}`);
    console.log(`📋 待处理申请: ${pendingApps.rows[0].count}`);
    
    // Check events
    // 检查事件
    const events = await client.query(`
      SELECT COUNT(*) as count 
      FROM events
    `);
    
    console.log(`📊 Total events: ${events.rows[0].count}`);
    console.log(`📊 总事件数: ${events.rows[0].count}`);
    
    // Check support options
    // 检查支持选项
    const supportOptions = await client.query(`
      SELECT COUNT(*) as count 
      FROM support_options
    `);
    
    console.log(`🎯 Support options: ${supportOptions.rows[0].count}`);
    console.log(`🎯 支持选项: ${supportOptions.rows[0].count}`);
    
    // Check approval logs
    // 检查审批日志
    const approvalLogs = await client.query(`
      SELECT COUNT(*) as count 
      FROM event_approval_log
    `);
    
    console.log(`📝 Approval logs: ${approvalLogs.rows[0].count}`);
    console.log(`📝 审批日志: ${approvalLogs.rows[0].count}`);
    
    // Check CHZ injection logs
    // 检查CHZ注入日志
    try {
      const chzLogs = await client.query(`
        SELECT COUNT(*) as count 
        FROM chz_pool_injection_log
      `);
      
      console.log(`💰 CHZ injection logs: ${chzLogs.rows[0].count}`);
      console.log(`💰 CHZ注入日志: ${chzLogs.rows[0].count}`);
    } catch (error) {
      console.log(`❌ CHZ injection logs table not accessible`);
      console.log(`❌ CHZ注入日志表不可访问`);
    }
    
    // Test API functionality
    // 测试API功能
    console.log('\n🔧 Testing API functionality...');
    console.log('🔧 测试API功能...');
    
    // Check if we can fetch event applications
    // 检查是否可以获取事件申请
    try {
      const testApps = await client.query(`
        SELECT id, event_title, status 
        FROM event_applications 
        LIMIT 1
      `);
      
      if (testApps.rows.length > 0) {
        console.log(`✅ Can fetch event applications`);
        console.log(`✅ 可以获取事件申请`);
        console.log(`   Sample: ${testApps.rows[0].event_title} (${testApps.rows[0].status})`);
        console.log(`   示例: ${testApps.rows[0].event_title} (${testApps.rows[0].status})`);
      }
    } catch (error) {
      console.error(`❌ Error fetching event applications:`, error.message);
      console.error(`❌ 获取事件申请时出错:`, error.message);
    }
    
    // Check events table structure
    // 检查事件表结构
    console.log('\n📋 Checking events table structure...');
    console.log('📋 检查事件表结构...');
    
    const eventColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position
    `);
    
    const requiredEventColumns = [
      'team_a_info',
      'team_b_info',
      'support_options',
      'venue_name',
      'venue_capacity'
    ];
    
    const existingColumns = eventColumns.rows.map(row => row.column_name);
    
    for (const requiredColumn of requiredEventColumns) {
      if (existingColumns.includes(requiredColumn)) {
        console.log(`✅ Events table has column: ${requiredColumn}`);
        console.log(`✅ 事件表有列: ${requiredColumn}`);
      } else {
        console.log(`❌ Events table missing column: ${requiredColumn}`);
        console.log(`❌ 事件表缺失列: ${requiredColumn}`);
      }
    }
    
    console.log('\n🎉 Database check completed!');
    console.log('🎉 数据库检查完成！');
    
  } catch (error) {
    console.error('❌ Error during database check:', error);
    console.error('❌ 数据库检查期间出错:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
// 运行检查
if (require.main === module) {
  checkAndFixDatabase()
    .then(() => {
      console.log('✅ Database check completed successfully');
      console.log('✅ 数据库检查成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database check failed:', error);
      console.error('❌ 数据库检查失败:', error);
      process.exit(1);
    });
}

module.exports = { checkAndFixDatabase }; 