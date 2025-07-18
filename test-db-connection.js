// Test database connection
// 测试数据库连接

const { Pool } = require('pg');

// Create a simple connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('测试数据库连接...');
    
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', result.rows[0]);
    console.log('✅ 数据库连接成功:', result.rows[0]);
    
    // Test if team_drafts table exists
    const tableResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'team_drafts'
      );
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ team_drafts table exists');
      console.log('✅ team_drafts 表存在');
      
      // Check table structure
      const structureResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'team_drafts'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 team_drafts table structure:');
      console.log('📋 team_drafts 表结构:');
      structureResult.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
      
      // Check if there are any drafts
      const draftsResult = await pool.query('SELECT COUNT(*) as count FROM team_drafts');
      console.log(`📊 Total drafts: ${draftsResult.rows[0].count}`);
      console.log(`📊 总草稿数: ${draftsResult.rows[0].count}`);
      
    } else {
      console.log('❌ team_drafts table does not exist');
      console.log('❌ team_drafts 表不存在');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ 数据库连接失败:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure PostgreSQL is running on localhost:5432');
      console.log('💡 确保PostgreSQL在localhost:5432上运行');
    } else if (error.code === '28P01') {
      console.log('💡 Check your database username and password');
      console.log('💡 检查您的数据库用户名和密码');
    } else if (error.code === '3D000') {
      console.log('💡 Database "fanforce_ai" does not exist. Create it first.');
      console.log('💡 数据库"fanforce_ai"不存在。请先创建它。');
    }
  } finally {
    await pool.end();
  }
}

testConnection(); 