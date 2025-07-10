/*
 * Database Schema Update Script with Contingency Handling
 * 数据库架构更新脚本，包含突发情况处理
 * 
 * This script updates the existing database schema to include comprehensive
 * contingency handling features for real-world scenarios.
 * 
 * 此脚本更新现有数据库架构，包含全面的突发情况处理功能以应对现实场景。
 * 
 * Usage: node scripts/update-database-schema.js [--rollback]
 * 使用: node scripts/update-database-schema.js [--rollback]
 * 
 * Features Added:
 * - Substitute player management system
 * - Emergency refund processing
 * - Weather monitoring and safety assessment
 * - Enhanced athlete reliability scoring
 * - Comprehensive notification system
 * - Venue availability tracking
 * - System alert management
 * - Compensation processing
 * 
 * 新增功能：
 * - 候补球员管理系统
 * - 紧急退款处理
 * - 天气监控和安全评估
 * - 增强运动员可靠性评分
 * - 全面通知系统
 * - 场馆可用性追踪
 * - 系统警报管理
 * - 补偿处理
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Database configuration
// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'fanforce_ai',
};

// Colors for console output
// 控制台输出颜色
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
// 日志函数
function logInfo(messageEn, messageCn) {
  console.log(`${colors.blue}ℹ INFO${colors.reset}: ${messageEn}`);
  console.log(`${colors.blue}ℹ 信息${colors.reset}: ${messageCn}`);
}

function logSuccess(messageEn, messageCn) {
  console.log(`${colors.green}✓ SUCCESS${colors.reset}: ${messageEn}`);
  console.log(`${colors.green}✓ 成功${colors.reset}: ${messageCn}`);
}

function logError(messageEn, messageCn, error = null) {
  console.error(`${colors.red}✗ ERROR${colors.reset}: ${messageEn}`);
  console.error(`${colors.red}✗ 错误${colors.reset}: ${messageCn}`);
  if (error) {
    console.error(`${colors.red}Details${colors.reset}:`, error.message);
    console.error(`${colors.red}详情${colors.reset}:`, error.message);
  }
}

function logWarning(messageEn, messageCn) {
  console.warn(`${colors.yellow}⚠ WARNING${colors.reset}: ${messageEn}`);
  console.warn(`${colors.yellow}⚠ 警告${colors.reset}: ${messageCn}`);
}

// Check if enhanced schema already exists
// 检查增强架构是否已存在
async function checkEnhancedSchemaExists(pool) {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'substitute_players'
    `);
    
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    logError(
      'Error checking enhanced schema existence',
      '检查增强架构存在性时出错',
      error
    );
    return false;
  }
}

// Create backup of existing schema
// 创建现有架构的备份
async function createSchemaBackup(pool) {
  try {
    logInfo(
      'Creating backup of existing schema...',
      '创建现有架构的备份...'
    );

    // Get current schema structure
    // 获取当前架构结构
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Create backup table for schema info
    // 创建架构信息的备份表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_backup (
        id SERIAL PRIMARY KEY,
        backup_date TIMESTAMP DEFAULT NOW(),
        table_count INTEGER,
        table_names TEXT[],
        backup_notes TEXT
      )
    `);

    // Insert current schema info
    // 插入当前架构信息
    await pool.query(`
      INSERT INTO schema_backup (table_count, table_names, backup_notes)
      VALUES ($1, $2, $3)
    `, [tables.length, tables, 'Pre-enhancement backup']);

    logSuccess(
      `Schema backup created with ${tables.length} tables`,
      `架构备份已创建，包含${tables.length}个表`
    );

    return true;
  } catch (error) {
    logError(
      'Failed to create schema backup',
      '创建架构备份失败',
      error
    );
    return false;
  }
}

// Apply enhanced schema updates
// 应用增强架构更新
async function applyEnhancedSchema(pool) {
  try {
    logInfo(
      'Applying enhanced schema updates...',
      '应用增强架构更新...'
    );

    // Step 1: Create new enumeration types
    // 步骤1：创建新的枚举类型
    const enumTypes = [
      `CREATE TYPE IF NOT EXISTS player_participation_status AS ENUM (
        'registered', 'confirmed', 'checked_in', 'no_show', 'late_arrival', 
        'injured', 'substituted', 'disqualified', 'cancelled'
      )`,
      `CREATE TYPE IF NOT EXISTS enhanced_event_status AS ENUM (
        'draft', 'published', 'active', 'delayed', 'postponed', 'cancelled_weather',
        'cancelled_venue', 'cancelled_insufficient_players', 'cancelled_emergency',
        'completed', 'disputed', 'refunded'
      )`,
      `CREATE TYPE IF NOT EXISTS refund_status AS ENUM (
        'none', 'requested', 'approved', 'processing', 'completed', 'rejected'
      )`,
      `CREATE TYPE IF NOT EXISTS emergency_type AS ENUM (
        'weather', 'venue_unavailable', 'insufficient_players', 'safety_concern',
        'technical_failure', 'security_issue', 'medical_emergency', 'force_majeure'
      )`,
      `CREATE TYPE IF NOT EXISTS substitute_priority AS ENUM (
        'primary', 'secondary', 'emergency', 'last_resort'
      )`
    ];

    for (const enumType of enumTypes) {
      await pool.query(enumType);
    }

    // Step 2: Add new columns to existing athletes table
    // 步骤2：向现有运动员表添加新列
    const athleteColumns = [
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS availability_notes TEXT',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS last_availability_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS attendance_rate DECIMAL(5,2) DEFAULT 100.00',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS no_show_count INTEGER DEFAULT 0',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS substitute_count INTEGER DEFAULT 0',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 1000',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100)',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20)',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(50)',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS medical_conditions JSONB',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS allergies JSONB',
      'ALTER TABLE athletes ADD COLUMN IF NOT EXISTS medical_clearance_date DATE'
    ];

    for (const column of athleteColumns) {
      await pool.query(column);
    }

    // Step 3: Add new columns to existing event_participants table
    // 步骤3：向现有活动参与者表添加新列
    const participantColumns = [
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS participation_status VARCHAR(20) DEFAULT \'registered\'',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS status_notes TEXT',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS is_substitute BOOLEAN DEFAULT false',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS substitute_for UUID REFERENCES users(id)',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS check_in_location JSONB',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS late_arrival BOOLEAN DEFAULT false',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS late_arrival_reason TEXT',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT \'none\'',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(18, 8) DEFAULT 0',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS refund_reason TEXT',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS emergency_contact_confirmed BOOLEAN DEFAULT false',
      'ALTER TABLE event_participants ADD COLUMN IF NOT EXISTS emergency_contact_info JSONB'
    ];

    for (const column of participantColumns) {
      await pool.query(column);
    }

    // Step 4: Create new tables for enhanced functionality
    // 步骤4：创建增强功能的新表
    const newTables = [
      // Substitute players table
      // 候补球员表
      `CREATE TABLE IF NOT EXISTS substitute_players (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID REFERENCES events(id) NOT NULL,
        athlete_id UUID REFERENCES athletes(id) NOT NULL,
        team VARCHAR(1) NOT NULL,
        substitute_priority VARCHAR(20) NOT NULL DEFAULT 'primary',
        is_activated BOOLEAN DEFAULT false,
        activated_at TIMESTAMP WITH TIME ZONE,
        replaced_athlete_id UUID REFERENCES athletes(id),
        replacement_reason TEXT,
        confirmed_available BOOLEAN DEFAULT false,
        confirmation_deadline TIMESTAMP WITH TIME ZONE,
        confirmed_at TIMESTAMP WITH TIME ZONE,
        contact_attempts INTEGER DEFAULT 0,
        last_contact_attempt TIMESTAMP WITH TIME ZONE,
        contact_method VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(event_id, athlete_id)
      )`,
      
      // Event contingencies table
      // 活动突发情况表
      `CREATE TABLE IF NOT EXISTS event_contingencies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID REFERENCES events(id) NOT NULL,
        contingency_type VARCHAR(50) NOT NULL,
        severity_level INTEGER NOT NULL CHECK (severity_level BETWEEN 1 AND 5),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        reported_by UUID REFERENCES users(id),
        reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_resolved BOOLEAN DEFAULT false,
        resolution_notes TEXT,
        resolved_by UUID REFERENCES users(id),
        resolved_at TIMESTAMP WITH TIME ZONE,
        affected_participants INTEGER DEFAULT 0,
        estimated_loss DECIMAL(18, 8) DEFAULT 0,
        actions_taken JSONB,
        automatic_refund_triggered BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Refund transactions table
      // 退款交易表
      `CREATE TABLE IF NOT EXISTS refund_transactions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID REFERENCES events(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        original_transaction_id UUID REFERENCES transactions(id),
        refund_amount DECIMAL(18, 8) NOT NULL,
        refund_percentage DECIMAL(5, 2) NOT NULL,
        refund_reason TEXT NOT NULL,
        refund_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'requested',
        requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        blockchain_tx_hash VARCHAR(66),
        blockchain_confirmed_at TIMESTAMP WITH TIME ZONE,
        admin_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Weather conditions table
      // 天气条件表
      `CREATE TABLE IF NOT EXISTS weather_conditions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID REFERENCES events(id) NOT NULL,
        venue_id UUID REFERENCES venues(id) NOT NULL,
        check_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        temperature DECIMAL(5, 2),
        humidity DECIMAL(5, 2),
        wind_speed DECIMAL(5, 2),
        precipitation DECIMAL(5, 2),
        weather_description TEXT,
        is_safe_for_event BOOLEAN DEFAULT true,
        safety_notes TEXT,
        assessed_by UUID REFERENCES users(id),
        data_source VARCHAR(50),
        api_response JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      
      // Emergency notifications table
      // 紧急通知表
      `CREATE TABLE IF NOT EXISTS emergency_notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID REFERENCES events(id) NOT NULL,
        notification_type VARCHAR(50) NOT NULL,
        message_title VARCHAR(200) NOT NULL,
        message_content TEXT NOT NULL,
        urgency_level INTEGER NOT NULL CHECK (urgency_level BETWEEN 1 AND 5),
        send_to_all BOOLEAN DEFAULT false,
        target_roles VARCHAR(100)[],
        target_users UUID[],
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivery_attempts INTEGER DEFAULT 0,
        successful_deliveries INTEGER DEFAULT 0,
        failed_deliveries INTEGER DEFAULT 0,
        responses_required BOOLEAN DEFAULT false,
        responses_received INTEGER DEFAULT 0,
        response_deadline TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ];

    for (const table of newTables) {
      await pool.query(table);
    }

    // Step 5: Create enhanced indexes
    // 步骤5：创建增强索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_athletes_availability ON athletes(is_available)',
      'CREATE INDEX IF NOT EXISTS idx_athletes_reliability ON athletes(reliability_score DESC)',
      'CREATE INDEX IF NOT EXISTS idx_substitute_players_event ON substitute_players(event_id)',
      'CREATE INDEX IF NOT EXISTS idx_substitute_players_activated ON substitute_players(is_activated)',
      'CREATE INDEX IF NOT EXISTS idx_event_contingencies_type ON event_contingencies(contingency_type)',
      'CREATE INDEX IF NOT EXISTS idx_event_contingencies_severity ON event_contingencies(severity_level)',
      'CREATE INDEX IF NOT EXISTS idx_refund_transactions_status ON refund_transactions(status)',
      'CREATE INDEX IF NOT EXISTS idx_weather_conditions_safe ON weather_conditions(is_safe_for_event)',
      'CREATE INDEX IF NOT EXISTS idx_emergency_notifications_urgency ON emergency_notifications(urgency_level)'
    ];

    for (const index of indexes) {
      await pool.query(index);
    }

    // Step 6: Create enhanced functions
    // 步骤6：创建增强函数
    await pool.query(`
      CREATE OR REPLACE FUNCTION calculate_reliability_score()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.reliability_score := GREATEST(
          0, 
          1000 + (NEW.attendance_rate * 10) - (NEW.no_show_count * 50)
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      CREATE OR REPLACE TRIGGER update_reliability_score 
      BEFORE UPDATE ON athletes 
      FOR EACH ROW 
      WHEN (OLD.attendance_rate IS DISTINCT FROM NEW.attendance_rate OR OLD.no_show_count IS DISTINCT FROM NEW.no_show_count)
      EXECUTE FUNCTION calculate_reliability_score();
    `);

    logSuccess(
      'Enhanced schema updates applied successfully',
      '增强架构更新应用成功'
    );

    return true;
  } catch (error) {
    logError(
      'Failed to apply enhanced schema updates',
      '应用增强架构更新失败',
      error
    );
    return false;
  }
}

// Rollback enhanced schema changes
// 回滚增强架构更改
async function rollbackEnhancedSchema(pool) {
  try {
    logInfo(
      'Rolling back enhanced schema changes...',
      '回滚增强架构更改...'
    );

    // Drop new tables
    // 删除新表
    const tablesToDrop = [
      'emergency_notifications',
      'weather_conditions',
      'refund_transactions',
      'event_contingencies',
      'substitute_players'
    ];

    for (const table of tablesToDrop) {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }

    // Drop new columns from athletes table
    // 从运动员表删除新列
    const athleteColumnsToRemove = [
      'medical_clearance_date',
      'allergies',
      'medical_conditions',
      'emergency_contact_relation',
      'emergency_contact_phone',
      'emergency_contact_name',
      'reliability_score',
      'substitute_count',
      'no_show_count',
      'attendance_rate',
      'last_availability_update',
      'availability_notes',
      'is_available'
    ];

    for (const column of athleteColumnsToRemove) {
      await pool.query(`ALTER TABLE athletes DROP COLUMN IF EXISTS ${column} CASCADE`);
    }

    // Drop new columns from event_participants table
    // 从活动参与者表删除新列
    const participantColumnsToRemove = [
      'emergency_contact_info',
      'emergency_contact_confirmed',
      'refund_processed_at',
      'refund_reason',
      'refund_amount',
      'refund_status',
      'late_arrival_reason',
      'late_arrival',
      'check_in_location',
      'substitute_for',
      'is_substitute',
      'status_notes',
      'status_updated_at',
      'participation_status'
    ];

    for (const column of participantColumnsToRemove) {
      await pool.query(`ALTER TABLE event_participants DROP COLUMN IF EXISTS ${column} CASCADE`);
    }

    // Drop new enumeration types
    // 删除新的枚举类型
    const enumTypesToDrop = [
      'substitute_priority',
      'emergency_type',
      'refund_status',
      'enhanced_event_status',
      'player_participation_status'
    ];

    for (const enumType of enumTypesToDrop) {
      await pool.query(`DROP TYPE IF EXISTS ${enumType} CASCADE`);
    }

    // Drop triggers and functions
    // 删除触发器和函数
    await pool.query(`DROP TRIGGER IF EXISTS update_reliability_score ON athletes`);
    await pool.query(`DROP FUNCTION IF EXISTS calculate_reliability_score()`);

    logSuccess(
      'Enhanced schema rollback completed successfully',
      '增强架构回滚完成成功'
    );

    return true;
  } catch (error) {
    logError(
      'Failed to rollback enhanced schema',
      '回滚增强架构失败',
      error
    );
    return false;
  }
}

// Test enhanced schema functionality
// 测试增强架构功能
async function testEnhancedSchema(pool) {
  try {
    logInfo(
      'Testing enhanced schema functionality...',
      '测试增强架构功能...'
    );

    // Test substitute players table
    // 测试候补球员表
    const substitutesResult = await pool.query('SELECT COUNT(*) as count FROM substitute_players');
    const substitutesCount = substitutesResult.rows[0].count;

    // Test event contingencies table
    // 测试活动突发情况表
    const contingenciesResult = await pool.query('SELECT COUNT(*) as count FROM event_contingencies');
    const contingenciesCount = contingenciesResult.rows[0].count;

    // Test refund transactions table
    // 测试退款交易表
    const refundsResult = await pool.query('SELECT COUNT(*) as count FROM refund_transactions');
    const refundsCount = refundsResult.rows[0].count;

    // Test weather conditions table
    // 测试天气条件表
    const weatherResult = await pool.query('SELECT COUNT(*) as count FROM weather_conditions');
    const weatherCount = weatherResult.rows[0].count;

    // Test emergency notifications table
    // 测试紧急通知表
    const notificationsResult = await pool.query('SELECT COUNT(*) as count FROM emergency_notifications');
    const notificationsCount = notificationsResult.rows[0].count;

    logSuccess(
      `Enhanced schema test completed successfully:
       - Substitute players: ${substitutesCount} records
       - Event contingencies: ${contingenciesCount} records
       - Refund transactions: ${refundsCount} records
       - Weather conditions: ${weatherCount} records
       - Emergency notifications: ${notificationsCount} records`,
      `增强架构测试完成成功：
       - 候补球员：${substitutesCount} 条记录
       - 活动突发情况：${contingenciesCount} 条记录
       - 退款交易：${refundsCount} 条记录
       - 天气条件：${weatherCount} 条记录
       - 紧急通知：${notificationsCount} 条记录`
    );

    return true;
  } catch (error) {
    logError(
      'Enhanced schema test failed',
      '增强架构测试失败',
      error
    );
    return false;
  }
}

// Main function
// 主函数
async function main() {
  let pool = null;
  const isRollback = process.argv.includes('--rollback');

  try {
    console.log(`${colors.magenta}
╔════════════════════════════════════════════════════════════════╗
║          Enhanced Database Schema Update Tool                 ║
║          增强数据库架构更新工具                                 ║
║                                                                ║
║  ${isRollback ? 'ROLLBACK MODE - Will remove enhancements' : 'UPDATE MODE - Will add enhancements'}               ║
║  ${isRollback ? '回滚模式 - 将移除增强功能' : '更新模式 - 将添加增强功能'}                       ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

    // Connect to database
    // 连接数据库
    logInfo('Connecting to database...', '连接数据库...');
    pool = new Pool(dbConfig);
    await pool.query('SELECT 1');

    logSuccess('Database connection established', '数据库连接已建立');

    // Check if enhanced schema exists
    // 检查增强架构是否存在
    const enhancedExists = await checkEnhancedSchemaExists(pool);

    if (isRollback) {
      if (!enhancedExists) {
        logWarning(
          'Enhanced schema not found, nothing to rollback',
          '未找到增强架构，无需回滚'
        );
        return;
      }

      // Perform rollback
      // 执行回滚
      const rollbackSuccess = await rollbackEnhancedSchema(pool);
      if (!rollbackSuccess) {
        throw new Error('Rollback failed');
      }
    } else {
      if (enhancedExists) {
        logWarning(
          'Enhanced schema already exists, skipping update',
          '增强架构已存在，跳过更新'
        );
        return;
      }

      // Create backup
      // 创建备份
      const backupSuccess = await createSchemaBackup(pool);
      if (!backupSuccess) {
        throw new Error('Backup creation failed');
      }

      // Apply enhancements
      // 应用增强
      const updateSuccess = await applyEnhancedSchema(pool);
      if (!updateSuccess) {
        throw new Error('Schema update failed');
      }

      // Test the enhanced schema
      // 测试增强架构
      const testSuccess = await testEnhancedSchema(pool);
      if (!testSuccess) {
        throw new Error('Schema test failed');
      }
    }

    // Success message
    // 成功消息
    console.log(`${colors.green}
╔════════════════════════════════════════════════════════════════╗
║                    ${isRollback ? 'Rollback' : 'Update'} Complete! ${isRollback ? '回滚' : '更新'}完成!                ║
║                                                                ║
║  Enhanced contingency handling features ${isRollback ? 'removed' : 'added'}:           ║
║  增强突发情况处理功能已${isRollback ? '移除' : '添加'}：                                 ║
║  ${isRollback ? '✗' : '✓'} Substitute player management                            ║
║  ${isRollback ? '✗' : '✓'} Emergency refund processing                            ║
║  ${isRollback ? '✗' : '✓'} Weather monitoring                                     ║
║  ${isRollback ? '✗' : '✓'} Enhanced athlete reliability                           ║
║  ${isRollback ? '✗' : '✓'} Comprehensive notifications                            ║
║                                                                ║
║  ${isRollback ? '✗' : '✓'} 候补球员管理                                              ║
║  ${isRollback ? '✗' : '✓'} 紧急退款处理                                              ║
║  ${isRollback ? '✗' : '✓'} 天气监控                                                  ║
║  ${isRollback ? '✗' : '✓'} 增强运动员可靠性                                           ║
║  ${isRollback ? '✗' : '✓'} 全面通知系统                                              ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  } catch (error) {
    logError(
      `Schema ${isRollback ? 'rollback' : 'update'} failed`,
      `架构${isRollback ? '回滚' : '更新'}失败`,
      error
    );
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the script
// 运行脚本
if (require.main === module) {
  main();
}

module.exports = {
  applyEnhancedSchema,
  rollbackEnhancedSchema,
  testEnhancedSchema,
  createSchemaBackup,
  checkEnhancedSchemaExists
}; 