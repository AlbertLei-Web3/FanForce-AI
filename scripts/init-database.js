/*
 * Database Initialization Script
 * 数据库初始化脚本
 * 
 * This script initializes the PostgreSQL database for FanForce AI platform.
 * It creates the database, runs the schema, and verifies the connection.
 * 
 * 此脚本初始化FanForce AI平台的PostgreSQL数据库。
 * 它创建数据库、运行schema并验证连接。
 * 
 * Usage: node scripts/init-database.js
 * 使用: node scripts/init-database.js
 * 
 * Prerequisites:
 * - PostgreSQL server running
 * - Environment variables set in .env.local
 * - Database user with proper permissions
 * 
 * 先决条件：
 * - PostgreSQL服务器运行中
 * - 在.env.local中设置环境变量
 * - 具有适当权限的数据库用户
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
  database: 'postgres', // Connect to default database first - 首先连接默认数据库
};

const targetDatabase = process.env.DB_NAME || 'fanforce_ai';

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

// Logging functions with bilingual output
// 双语输出的日志函数
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

// Check if database exists
// 检查数据库是否存在
async function checkDatabaseExists(pool, databaseName) {
  try {
    const result = await pool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );
    return result.rows.length > 0;
  } catch (error) {
    logError(
      `Error checking database existence: ${error.message}`,
      `检查数据库存在性时出错: ${error.message}`
    );
    return false;
  }
}

// Create database if not exists
// 如果不存在则创建数据库
async function createDatabase(pool, databaseName) {
  try {
    const exists = await checkDatabaseExists(pool, databaseName);
    
    if (exists) {
      logInfo(
        `Database "${databaseName}" already exists, skipping creation`,
        `数据库 "${databaseName}" 已存在，跳过创建`
      );
      return true;
    }

    logInfo(
      `Creating database "${databaseName}"...`,
      `创建数据库 "${databaseName}"...`
    );

    await pool.query(`CREATE DATABASE "${databaseName}"`);
    
    logSuccess(
      `Database "${databaseName}" created successfully`,
      `数据库 "${databaseName}" 创建成功`
    );
    
    return true;
  } catch (error) {
    logError(
      `Failed to create database "${databaseName}"`,
      `创建数据库 "${databaseName}" 失败`,
      error
    );
    return false;
  }
}

// Run SQL schema file
// 运行SQL schema文件
async function runSchemaFile(pool, schemaPath) {
  try {
    logInfo(
      `Running schema file: ${schemaPath}`,
      `运行schema文件: ${schemaPath}`
    );

    // Check if schema file exists
    // 检查schema文件是否存在
    if (!fs.existsSync(schemaPath)) {
      logError(
        `Schema file not found: ${schemaPath}`,
        `Schema文件未找到: ${schemaPath}`
      );
      return false;
    }

    // Read and execute schema file
    // 读取并执行schema文件
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSQL);
    
    logSuccess(
      'Database schema created successfully',
      '数据库schema创建成功'
    );
    
    return true;
  } catch (error) {
    logError(
      'Failed to run schema file',
      '运行schema文件失败',
      error
    );
    return false;
  }
}

// Test database connection and verify tables
// 测试数据库连接并验证表
async function testDatabaseConnection(pool) {
  try {
    logInfo(
      'Testing database connection...',
      '测试数据库连接...'
    );

    // Test basic connection
    // 测试基本连接
    const timeResult = await pool.query('SELECT NOW() as current_time');
    const currentTime = timeResult.rows[0].current_time;
    
    logSuccess(
      `Database connection successful. Current time: ${currentTime}`,
      `数据库连接成功。当前时间: ${currentTime}`
    );

    // Verify tables exist
    // 验证表是否存在
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    if (tables.length === 0) {
      logWarning(
        'No tables found in database',
        '数据库中未找到表'
      );
      return false;
    }

    logSuccess(
      `Found ${tables.length} tables: ${tables.join(', ')}`,
      `找到 ${tables.length} 个表: ${tables.join(', ')}`
    );

    // Test basic operations on users table
    // 测试users表的基本操作
    const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.rows[0].count;
    
    logInfo(
      `Users table contains ${userCount} records`,
      `用户表包含 ${userCount} 条记录`
    );

    return true;
  } catch (error) {
    logError(
      'Database connection test failed',
      '数据库连接测试失败',
      error
    );
    return false;
  }
}

// Main initialization function
// 主要初始化函数
async function initializeDatabase() {
  let pool = null;
  let targetPool = null;

  try {
    console.log(`${colors.magenta}
╔════════════════════════════════════════════════════════════════╗
║                  FanForce AI Database Setup                   ║
║                  FanForce AI 数据库设置                        ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

    // Step 1: Connect to PostgreSQL server
    // 步骤1：连接到PostgreSQL服务器
    logInfo(
      'Connecting to PostgreSQL server...',
      '连接到PostgreSQL服务器...'
    );

    pool = new Pool(dbConfig);
    await pool.query('SELECT 1'); // Test connection - 测试连接
    
    logSuccess(
      'Connected to PostgreSQL server',
      '已连接到PostgreSQL服务器'
    );

    // Step 2: Create target database
    // 步骤2：创建目标数据库
    const databaseCreated = await createDatabase(pool, targetDatabase);
    if (!databaseCreated) {
      throw new Error(`Failed to create database ${targetDatabase}`);
    }

    // Step 3: Connect to target database
    // 步骤3：连接到目标数据库
    logInfo(
      `Connecting to target database "${targetDatabase}"...`,
      `连接到目标数据库 "${targetDatabase}"...`
    );

    const targetDbConfig = {
      ...dbConfig,
      database: targetDatabase,
    };

    targetPool = new Pool(targetDbConfig);
    await targetPool.query('SELECT 1'); // Test connection - 测试连接
    
    logSuccess(
      `Connected to database "${targetDatabase}"`,
      `已连接到数据库 "${targetDatabase}"`
    );

    // Step 4: Run schema file
    // 步骤4：运行schema文件
    const schemaPath = path.join(__dirname, '..', 'lib', 'schema.sql');
    const schemaSuccess = await runSchemaFile(targetPool, schemaPath);
    
    if (!schemaSuccess) {
      throw new Error('Schema creation failed');
    }

    // Step 5: Test final connection and verify setup
    // 步骤5：测试最终连接并验证设置
    const testSuccess = await testDatabaseConnection(targetPool);
    
    if (!testSuccess) {
      throw new Error('Database verification failed');
    }

    // Success message
    // 成功消息
    console.log(`${colors.green}
╔════════════════════════════════════════════════════════════════╗
║                     Setup Complete! 设置完成!                 ║
║                                                                ║
║  Database: ${targetDatabase.padEnd(48)} ║
║  Tables: Successfully created 成功创建表                       ║
║  Connection: Verified 连接已验证                               ║
║                                                                ║
║  Next steps 下一步:                                            ║
║  1. Start your Next.js application                            ║
║  2. Test API endpoints                                         ║
║  3. Begin user registration flow                              ║
║                                                                ║
║  1. 启动您的Next.js应用程序                                     ║
║  2. 测试API端点                                                 ║
║  3. 开始用户注册流程                                             ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  } catch (error) {
    logError(
      'Database initialization failed',
      '数据库初始化失败',
      error
    );
    
    console.log(`${colors.red}
╔════════════════════════════════════════════════════════════════╗
║                    Setup Failed! 设置失败!                    ║
║                                                                ║
║  Please check:                                                 ║
║  1. PostgreSQL server is running                              ║
║  2. Database credentials in .env.local                        ║
║  3. User has proper permissions                               ║
║                                                                ║
║  请检查:                                                        ║
║  1. PostgreSQL服务器是否运行                                    ║
║  2. .env.local中的数据库凭据                                    ║
║  3. 用户是否有适当的权限                                         ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    process.exit(1);
  } finally {
    // Clean up connections
    // 清理连接
    if (pool) {
      await pool.end();
    }
    if (targetPool) {
      await targetPool.end();
    }
  }
}

// Run initialization if script is executed directly
// 如果脚本被直接执行则运行初始化
if (require.main === module) {
  initializeDatabase();
}

module.exports = {
  initializeDatabase,
  checkDatabaseExists,
  createDatabase,
  runSchemaFile,
  testDatabaseConnection,
}; 