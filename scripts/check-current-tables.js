// Check Current Database Tables Script
// 检查当前数据库表脚本

const { Pool } = require('pg');

// Database configuration
// 数据库配置
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function checkCurrentTables() {
  try {
    console.log('Checking current database tables...');
    // 检查当前数据库表...
    
    // Get all tables
    // 获取所有表
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\nCurrent tables in database:');
    // 数据库中的当前表：
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in database');
      // 数据库中未找到表
    } else {
      tablesResult.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }
    
    // Check table structures for key tables
    // 检查关键表的结构
    const keyTables = ['users', 'athletes', 'events', 'event_participants'];
    
    for (const tableName of keyTables) {
      try {
        const structureResult = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `, [tableName]);
        
        if (structureResult.rows.length > 0) {
          console.log(`\n${tableName} table structure:`);
          // ${tableName} 表结构：
          structureResult.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
          });
        }
      } catch (err) {
        console.log(`Table ${tableName} not found`);
        // 未找到表 ${tableName}
      }
    }
    
    // Check sample data
    // 检查示例数据
    try {
      const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`\nUsers count: ${userCount.rows[0].count}`);
      // 用户数量：${userCount.rows[0].count}
    } catch (err) {
      console.log('Users table not found or empty');
      // 未找到用户表或为空
    }
    
    try {
      const athleteCount = await pool.query('SELECT COUNT(*) as count FROM athletes');
      console.log(`Athletes count: ${athleteCount.rows[0].count}`);
      // 运动员数量：${athleteCount.rows[0].count}
    } catch (err) {
      console.log('Athletes table not found or empty');
      // 未找到运动员表或为空
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
    // 检查表时出错：
  } finally {
    await pool.end();
  }
}

// Run the check
// 运行检查
checkCurrentTables(); 