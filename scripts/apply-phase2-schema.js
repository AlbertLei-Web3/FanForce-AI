/*
 * Apply Phase 2 Database Schema Script
 * 应用第二阶段数据库架构脚本
 * 
 * This script applies the Phase 2 schema for event applications and QR codes.
 * 此脚本应用第二阶段的活动申请和二维码架构。
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

// Main function to apply Phase 2 schema
async function applyPhase2Schema() {
  let pool = null;

  try {
    console.log(`${colors.magenta}
╔════════════════════════════════════════════════════════════════╗
║              Apply Phase 2 Database Schema                     ║
║              应用第二阶段数据库架构                              ║
║                                                               ║
║  Event Applications + QR Codes + Participation System        ║
║  活动申请 + 二维码 + 参与系统                                  ║
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

    // Step 2: Check if Phase 1 tables exist
    logInfo(
      'Checking Phase 1 admin tables...',
      '检查第一阶段管理员表...'
    );

    const adminTablesCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('system_config', 'fee_rules', 'admin_dashboard_stats')
    `);

    if (adminTablesCheck.rows.length < 3) {
      logWarning(
        'Phase 1 admin tables not found. Please run apply-admin-schema.js first.',
        '未找到第一阶段管理员表。请先运行 apply-admin-schema.js。'
      );
    } else {
      logSuccess(
        'Phase 1 admin tables verified',
        '第一阶段管理员表验证通过'
      );
    }

    // Step 3: Read Phase 2 schema file
    logInfo(
      'Reading Phase 2 schema file...',
      '读取第二阶段架构文件...'
    );

    const schemaPath = path.join(__dirname, '..', 'lib', 'phase2-schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    logSuccess(
      `Phase 2 schema file read successfully (${schemaSQL.length} characters)`,
      `第二阶段架构文件读取成功（${schemaSQL.length} 字符）`
    );

    // Step 4: Execute Phase 2 schema
    logInfo(
      'Executing Phase 2 database schema...',
      '执行第二阶段数据库架构...'
    );

    await pool.query(schemaSQL);

    logSuccess(
      'Phase 2 schema applied successfully',
      '第二阶段架构应用成功'
    );

    // Step 5: Verify new tables created
    logInfo(
      'Verifying Phase 2 tables created...',
      '验证第二阶段表是否创建...'
    );

    const newTables = await pool.query(`
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN (
        'event_applications', 'event_qr_codes', 'event_participations', 
        'audience_stakes_extended', 'qr_scan_logs', 'party_allocations'
      )
      ORDER BY table_name;
    `);

    console.log(`${colors.cyan}
📊 Phase 2 Tables Created / 第二阶段表已创建:${colors.reset}`);
    newTables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name} (${row.column_count} columns)`);
    });

    // Step 6: Verify functions created
    logInfo(
      'Verifying Phase 2 functions created...',
      '验证第二阶段函数是否创建...'
    );

    const functions = await pool.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN ('calculate_qr_timing', 'update_qr_code_status', 'calculate_reward_tier')
      ORDER BY routine_name;
    `);

    console.log(`${colors.cyan}
🔧 Phase 2 Functions Created / 第二阶段函数已创建:${colors.reset}`);
    functions.rows.forEach(row => {
      console.log(`  ✓ ${row.routine_name} (${row.routine_type})`);
    });

    // Step 7: Test core functions
    logInfo(
      'Testing core Phase 2 functions...',
      '测试第二阶段核心函数...'
    );

    // Test QR timing calculation
    const timingTest = await pool.query(`
      SELECT 
        '2025-07-15 18:00:00'::timestamp as event_start,
        ('2025-07-15 18:00:00'::timestamp - INTERVAL '3 hours') as qr_valid_from,
        ('2025-07-15 18:00:00'::timestamp + INTERVAL '1 hour') as qr_valid_until
    `);

    console.log(`${colors.cyan}
⏰ QR Timing Test / QR时效测试:${colors.reset}`);
    const timing = timingTest.rows[0];
    console.log(`  Event Start: ${timing.event_start}`);
    console.log(`  QR Valid From: ${timing.qr_valid_from}`);
    console.log(`  QR Valid Until: ${timing.qr_valid_until}`);

    // Step 8: Create initial data (if needed)
    logInfo(
      'Setting up initial Phase 2 configuration...',
      '设置第二阶段初始配置...'
    );

    // Update system_config with Phase 2 settings
    await pool.query(`
      INSERT INTO system_config (config_key, config_value, description, is_active) VALUES
      ('phase2_enabled', 'true', 'Enable Phase 2 features (Event Applications)', TRUE),
      ('qr_code_default_expiry_hours', '4', 'Default QR code validity period in hours', TRUE),
      ('max_events_per_ambassador', '5', 'Maximum concurrent events per ambassador', TRUE),
      ('party_allocation_method', '"first_come"', 'Default party allocation method', TRUE)
      ON CONFLICT (config_key) DO UPDATE SET
        config_value = EXCLUDED.config_value,
        updated_at = CURRENT_TIMESTAMP
    `);

    logSuccess(
      'Phase 2 configuration added to system_config',
      '第二阶段配置已添加到系统配置'
    );

    // Step 9: Create sample event application (if ambassador exists)
    const ambassadorExists = await pool.query(`
      SELECT id FROM users WHERE role = 'ambassador' LIMIT 1
    `);

    if (ambassadorExists.rows.length > 0) {
      logInfo(
        'Creating sample event application...',
        '创建示例活动申请...'
      );

      await pool.query(`
        INSERT INTO event_applications (
          ambassador_id, 
          event_title, 
          event_description,
          event_start_time,
          venue_name,
          venue_address,
          venue_capacity,
          party_venue_capacity,
          team_a_info,
          team_b_info,
          estimated_participants,
          application_notes
        ) VALUES (
          $1,
          'Sample Campus Basketball Game',
          'A sample basketball game for testing Phase 2 functionality',
          '2025-07-20 18:00:00',
          'University Sports Center',
          '123 Campus Drive, University Town',
          200,
          50,
          '{"name": "Engineering Eagles", "players": ["John Doe", "Jane Smith"], "captain": "John Doe"}',
          '{"name": "Business Bears", "players": ["Mike Johnson", "Sarah Wilson"], "captain": "Mike Johnson"}',
          150,
          'This is a test event application for Phase 2 development and testing.'
        )
      `, [ambassadorExists.rows[0].id]);

      logSuccess(
        'Sample event application created',
        '示例活动申请已创建'
      );
    }

    console.log(`${colors.green}
🎉 Phase 2 Database Schema Applied Successfully! / 第二阶段数据库架构应用成功！

New Features Available / 新功能可用:
• Event Applications (Ambassador → Admin workflow) / 活动申请（大使→管理员工作流）
• Time-Limited QR Codes (3 hours before + 1 hour after) / 限时QR码（赛前3小时+赛后1小时）
• Audience Participation Tracking / 观众参与追踪
• Three-Tier Reward System (30%/70%/100%) / 三档奖励系统（30%/70%/100%）
• Party Allocation System / 聚会分配系统
• Comprehensive Scan Logging / 全面扫描日志

Next Steps / 下一步:
1. Implement Ambassador APIs for event applications / 实现大使活动申请API
2. Extend Admin Dashboard for application review / 扩展管理员仪表板进行申请审核
3. Create QR code generation and scanning APIs / 创建QR码生成和扫描API
4. Build Audience participation interface / 构建观众参与界面

Database Status / 数据库状态:
• Phase 1 Tables: ${adminTablesCheck.rows.length} ✓
• Phase 2 Tables: ${newTables.rows.length} ✓
• Phase 2 Functions: ${functions.rows.length} ✓
${colors.reset}`);

  } catch (error) {
    logError(
      `Failed to apply Phase 2 schema: ${error.message}`,
      `应用第二阶段架构失败: ${error.message}`
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
  applyPhase2Schema();
}

module.exports = { applyPhase2Schema }; 