// Check database table structure
// 检查数据库表结构

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function checkDatabaseStructure() {
  try {
    console.log('Checking database table structure...');
    console.log('检查数据库表结构...');
    
    // Check users table structure
    const usersStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Users table structure:');
    console.log('📋 Users 表结构:');
    usersStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check team_drafts table structure
    const draftsStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'team_drafts'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Team_drafts table structure:');
    console.log('📋 Team_drafts 表结构:');
    draftsStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check sample data from users table
    const usersData = await pool.query(`
      SELECT * FROM users LIMIT 3
    `);
    
    console.log('\n📊 Sample users data:');
    console.log('📊 用户数据示例:');
    usersData.rows.forEach((user, index) => {
      console.log(`${index + 1}. User:`, {
        id: user.id,
        role: user.role,
        profile_data: user.profile_data ? 'exists' : 'null'
      });
    });
    
    // Check sample data from team_drafts table
    const draftsData = await pool.query(`
      SELECT id, ambassador_id, draft_name, team_a_name, team_b_name 
      FROM team_drafts LIMIT 3
    `);
    
    console.log('\n📊 Sample team_drafts data:');
    console.log('📊 队伍草稿数据示例:');
    draftsData.rows.forEach((draft, index) => {
      console.log(`${index + 1}. Draft:`, {
        id: draft.id,
        ambassador_id: draft.ambassador_id,
        draft_name: draft.draft_name,
        team_a_name: draft.team_a_name,
        team_b_name: draft.team_b_name
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking database structure:', error.message);
    console.error('❌ 检查数据库结构时出错:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseStructure(); 