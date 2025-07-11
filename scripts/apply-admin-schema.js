/*
 * Apply Enhanced Admin Schema Script
 * 应用增强管理员架构脚本
 * 
 * This script applies the enhanced admin schema to the existing database.
 * It reads the enhanced-admin-schema.sql file and executes it.
 * 
 * 此脚本将增强的管理员架构应用到现有数据库。
 * 它读取enhanced-admin-schema.sql文件并执行它。
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Logging functions
function logInfo(messageEn, messageCn) {
  console.log(`${colors.blue}ℹ INFO${colors.reset}: ${messageEn}`);
  console.log(`${colors.blue}ℹ 信息${colors.reset}: ${messageCn}`);
}

function logSuccess(messageEn, messageCn) {
  console.log(`${colors.green}✅ SUCCESS${colors.reset}: ${messageEn}`);
  console.log(`${colors.green}✅ 成功${colors.reset}: ${messageCn}`);
}

function logError(messageEn, messageCn) {
  console.log(`${colors.red}❌ ERROR${colors.reset}: ${messageEn}`);
  console.log(`${colors.red}❌ 错误${colors.reset}: ${messageCn}`);
}

function logWarning(messageEn, messageCn) {
  console.log(`${colors.yellow}⚠️ WARNING${colors.reset}: ${messageEn}`);
  console.log(`${colors.yellow}⚠️ 警告${colors.reset}: ${messageCn}`);
}

// Main function to apply admin schema
async function applyAdminSchema() {
  let pool = null;

  try {
    console.log(`${colors.magenta}
╔════════════════════════════════════════════════════════════════╗
║                Apply Enhanced Admin Schema                     ║
║                应用增强管理员架构                                ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

    // Step 1: Connect to database
    logInfo(
      'Connecting to PostgreSQL database...',
      '连接到PostgreSQL数据库...'
    );

    pool = new Pool(dbConfig);
    await pool.query('SELECT 1'); // Test connection
    
    logSuccess(
      'Connected to database successfully',
      '数据库连接成功'
    );

    // Step 2: Read enhanced schema file
    logInfo(
      'Reading enhanced admin schema file...',
      '读取增强管理员架构文件...'
    );

    const schemaPath = path.join(__dirname, '..', 'lib', 'enhanced-admin-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    logSuccess(
      `Schema file read successfully (${schemaSQL.length} characters)`,
      `架构文件读取成功（${schemaSQL.length} 字符）`
    );

    // Step 3: Execute schema
    logInfo(
      'Executing enhanced admin schema...',
      '执行增强管理员架构...'
    );

    // Check if update_updated_at_column function exists
    const checkFunction = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'update_updated_at_column'
      );
    `);

    if (!checkFunction.rows[0].exists) {
      logInfo(
        'Creating update_updated_at_column function...',
        '创建update_updated_at_column函数...'
      );

      await pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

      logSuccess(
        'update_updated_at_column function created',
        'update_updated_at_column函数已创建'
      );
    }

    // Execute the schema
    await pool.query(schemaSQL);

    logSuccess(
      'Enhanced admin schema applied successfully',
      '增强管理员架构应用成功'
    );

    // Step 4: Verify tables created
    logInfo(
      'Verifying admin tables created...',
      '验证管理员表是否创建...'
    );

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'system_config', 'fee_rules', 'user_management_log', 
        'chz_pool_monitor', 'admin_dashboard_stats', 
        'user_registration_queue', 'admin_activity_log'
      )
      ORDER BY table_name;
    `);

    console.log(`${colors.cyan}
📊 Admin Tables Created / 管理员表已创建:${colors.reset}`);
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Step 5: Verify default data
    logInfo(
      'Verifying default configuration data...',
      '验证默认配置数据...'
    );

    const configCount = await pool.query('SELECT COUNT(*) FROM system_config');
    const feeRulesCount = await pool.query('SELECT COUNT(*) FROM fee_rules');

    console.log(`${colors.cyan}
📋 Default Data Verification / 默认数据验证:${colors.reset}`);
    console.log(`  ✓ System Config Records: ${configCount.rows[0].count}`);
    console.log(`  ✓ Fee Rules Records: ${feeRulesCount.rows[0].count}`);

    logSuccess(
      'All admin tables and default data verified',
      '所有管理员表和默认数据验证完成'
    );

    console.log(`${colors.green}
🎉 Enhanced Admin Schema Applied Successfully! / 增强管理员架构应用成功！

You can now test the admin API endpoints:
现在可以测试管理员API端点：

• GET http://localhost:3000/api/admin/dashboard
• GET http://localhost:3000/api/admin/config
• GET http://localhost:3000/api/admin/fee-rules
• GET http://localhost:3000/api/admin/users
• GET http://localhost:3000/api/admin/chz-pool

Next steps: 下一步：
1. Test API endpoints / 测试API端点
2. View admin dashboard / 查看管理员仪表板
3. Configure fee rules / 配置费用规则
${colors.reset}`);

  } catch (error) {
    logError(
      `Failed to apply admin schema: ${error.message}`,
      `应用管理员架构失败: ${error.message}`
    );
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the script
if (require.main === module) {
  applyAdminSchema();
}

module.exports = { applyAdminSchema }; 