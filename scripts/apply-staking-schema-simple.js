/*
 * Apply Staking Schema Script (Simple Version)
 * 应用质押架构脚本（简单版本）
 * 
 * This script applies the user staking system database schema
 * 此脚本应用用户质押系统数据库架构
 * 
 * Usage: node scripts/apply-staking-schema-simple.js
 * 用法: node scripts/apply-staking-schema-simple.js
 * 
 * Related files:
 * - lib/staking-schema.sql: Database schema definition
 * - lib/database.js: Database connection utilities
 * 
 * 相关文件：
 * - lib/staking-schema.sql: 数据库架构定义
 * - lib/database.js: 数据库连接工具
 */

const fs = require('fs');
const path = require('path');
const { query, testConnection, closePool } = require('../lib/database.js');

async function applyStakingSchema() {
  console.log('Starting staking schema application...');
  console.log('开始应用质押架构...');
  
  try {
    // Test database connection
    // 测试数据库连接
    console.log('Testing database connection...');
    console.log('测试数据库连接...');
    
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    console.log('Database connection successful');
    console.log('数据库连接成功');
    
    // Read the schema file
    // 读取架构文件
    const schemaPath = path.join(__dirname, '../lib/staking-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Reading schema file:', schemaPath);
    console.log('读取架构文件:', schemaPath);
    
    // Execute the entire SQL file as one statement
    // 将整个SQL文件作为一个语句执行
    console.log('Executing schema SQL...');
    console.log('执行架构SQL...');
    
    await query(schemaSQL);
    
    console.log('Schema SQL executed successfully');
    console.log('架构SQL执行成功');
    
    // Verify table creation
    // 验证表创建
    console.log('Verifying table creation...');
    console.log('验证表创建...');
    
    const tablesToCheck = [
      'user_stake_records',
      'reward_calculations', 
      'platform_fee_config'
    ];
    
    for (const tableName of tablesToCheck) {
      try {
        const result = await query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as table_exists
        `, [tableName]);
        
        const exists = result.rows[0].table_exists;
        console.log(`Table ${tableName}: ${exists ? 'EXISTS' : 'MISSING'}`);
        console.log(`表 ${tableName}: ${exists ? '存在' : '缺失'}`);
        
        if (!exists) {
          throw new Error(`Table ${tableName} was not created successfully`);
        }
      } catch (error) {
        console.error(`Error checking table ${tableName}:`, error.message);
        console.error(`检查表 ${tableName} 时出错:`, error.message);
        throw error;
      }
    }
    
    // Check default platform fee configuration
    // 检查默认平台手续费配置
    console.log('Checking platform fee configuration...');
    console.log('检查平台手续费配置...');
    
    const feeConfig = await query(`
      SELECT fee_percentage, is_active, description 
      FROM platform_fee_config 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (feeConfig.rows.length > 0) {
      console.log('Platform fee configuration found:', feeConfig.rows[0]);
      console.log('找到平台手续费配置:', feeConfig.rows[0]);
    } else {
      console.log('No active platform fee configuration found');
      console.log('未找到活跃的平台手续费配置');
    }
    
    // Summary
    // 总结
    console.log('\n=== Schema Application Summary ===');
    console.log('=== 架构应用总结 ===');
    console.log('All required tables created successfully');
    console.log('所有必需的表创建成功');
    console.log('Staking schema application completed');
    console.log('质押架构应用完成');
    
  } catch (error) {
    console.error('Schema application failed:', error);
    console.error('架构应用失败:', error);
    process.exit(1);
  } finally {
    // Close database connection
    // 关闭数据库连接
    await closePool();
    console.log('Database connection closed');
    console.log('数据库连接已关闭');
  }
}

// Run the script if called directly
// 如果直接调用则运行脚本
if (require.main === module) {
  applyStakingSchema()
    .then(() => {
      console.log('Script completed successfully');
      console.log('脚本成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      console.error('脚本失败:', error);
      process.exit(1);
    });
}

module.exports = { applyStakingSchema }; 