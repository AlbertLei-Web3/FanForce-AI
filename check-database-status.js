// Check Database Status
// 检查数据库状态

const { Pool } = require('pg');

// Load environment variables from .env file
// 从.env文件加载环境变量
require('dotenv').config();

// Database connection configuration from environment variables
// 从环境变量获取数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
});

async function checkDatabaseStatus() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 检查数据库状态... / Checking database status...');
    console.log(`📊 数据库连接: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME} / Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
    // Check if OKX DEX integration tables exist
    // 检查OKX DEX集成表是否存在
    console.log('\n📋 检查OKX DEX集成表... / Checking OKX DEX integration tables...');
    
    const okxDexTables = [
      'athlete_season_progress',
      'vault_deposits', 
      'profit_distributions',
      'rule_engine_logs'
    ];
    
    for (const table of okxDexTables) {
      try {
        const result = await client.query(`
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [table]);
        
        if (result.rows.length > 0) {
          console.log(`✅ 表 ${table} 存在，包含 ${result.rows.length} 个字段 / Table ${table} exists with ${result.rows.length} columns`);
          console.log(`   📝 字段列表 / Column list: ${result.rows.map(row => row.column_name).join(', ')}`);
        } else {
          console.log(`❌ 表 ${table} 不存在 / Table ${table} does not exist`);
        }
      } catch (error) {
        console.log(`❌ 检查表 ${table} 时出错 / Error checking table ${table}:`, error.message);
      }
    }
    
    // Check if functions exist
    // 检查函数是否存在
    console.log('\n🔧 检查数据库函数... / Checking database functions...');
    
    const functions = [
      'check_athlete_vault_eligibility',
      'update_athlete_progress',
      'log_rule_engine_activity'
    ];
    
    for (const func of functions) {
      try {
        const result = await client.query(`
          SELECT routine_name, routine_type
          FROM information_schema.routines 
          WHERE routine_name = $1
        `, [func]);
        
        if (result.rows.length > 0) {
          console.log(`✅ 函数 ${func} 存在 / Function ${func} exists`);
        } else {
          console.log(`❌ 函数 ${func} 不存在 / Function ${func} does not exist`);
        }
      } catch (error) {
        console.log(`❌ 检查函数 ${func} 时出错 / Error checking function ${func}:`, error.message);
      }
    }
    
    // Check if views exist
    // 检查视图是否存在
    console.log('\n👁️ 检查数据库视图... / Checking database views...');
    
    const views = [
      'athlete_vault_status',
      'rule_engine_performance'
    ];
    
    for (const view of views) {
      try {
        const result = await client.query(`
          SELECT table_name
          FROM information_schema.views 
          WHERE table_name = $1
        `, [view]);
        
        if (result.rows.length > 0) {
          console.log(`✅ 视图 ${view} 存在 / View ${view} exists`);
        } else {
          console.log(`❌ 视图 ${view} 不存在 / View ${view} does not exist`);
        }
      } catch (error) {
        console.log(`❌ 检查视图 ${view} 时出错 / Error checking view ${view}:`, error.message);
      }
    }
    
    // Check if triggers exist
    // 检查触发器是否存在
    console.log('\n⚡ 检查数据库触发器... / Checking database triggers...');
    
    const triggers = [
      'update_athlete_season_progress_updated_at',
      'update_vault_deposits_updated_at',
      'update_profit_distributions_updated_at'
    ];
    
    for (const trigger of triggers) {
      try {
        const result = await client.query(`
          SELECT trigger_name, event_object_table
          FROM information_schema.triggers 
          WHERE trigger_name = $1
        `, [trigger]);
        
        if (result.rows.length > 0) {
          console.log(`✅ 触发器 ${trigger} 存在，关联表: ${result.rows[0].event_object_table} / Trigger ${trigger} exists, associated table: ${result.rows[0].event_object_table}`);
        } else {
          console.log(`❌ 触发器 ${trigger} 不存在 / Trigger ${trigger} does not exist`);
        }
      } catch (error) {
        console.log(`❌ 检查触发器 ${trigger} 时出错 / Error checking trigger ${trigger}:`, error.message);
      }
    }
    
    // Check existing data
    // 检查现有数据
    console.log('\n📊 检查现有数据... / Checking existing data...');
    
    for (const table of okxDexTables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`📈 表 ${table} 包含 ${result.rows[0].count} 条记录 / Table ${table} contains ${result.rows[0].count} records`);
      } catch (error) {
        console.log(`❌ 无法查询表 ${table} 的数据 / Cannot query data from table ${table}:`, error.message);
      }
    }
    
    // Check existing users and athletes
    // 检查现有用户和运动员
    console.log('\n👥 检查现有用户... / Checking existing users...');
    
    try {
      const userResult = await client.query('SELECT role, COUNT(*) FROM users GROUP BY role');
      console.log('📊 用户角色分布 / User role distribution:');
      userResult.rows.forEach(row => {
        console.log(`   ${row.role}: ${row.count} 用户 / ${row.count} users`);
      });
    } catch (error) {
      console.log('❌ 无法查询用户数据 / Cannot query user data:', error.message);
    }
    
    console.log('\n🎯 数据库状态检查完成！/ Database status check completed!');
    
  } catch (error) {
    console.error('💥 检查过程中发生错误 / Error during check:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute the check
// 执行检查
checkDatabaseStatus()
  .then(() => {
    console.log('🚀 检查脚本执行完成 / Check script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 检查脚本执行失败 / Check script execution failed:', error);
    process.exit(1);
  }); 