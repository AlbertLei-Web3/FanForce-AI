// Check ambassadors in database
// 检查数据库中的大使数据

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

async function checkAmbassadors() {
  try {
    console.log('Checking ambassadors in database...');
    console.log('检查数据库中的大使...');
    
    // Check users with ambassador role
    const ambassadorsResult = await pool.query(`
      SELECT id, username, role, profile_data 
      FROM users 
      WHERE role = 'ambassador'
      LIMIT 10
    `);
    
    console.log('📊 Ambassadors found:', ambassadorsResult.rows.length);
    console.log('📊 找到的大使数量:', ambassadorsResult.rows.length);
    
    ambassadorsResult.rows.forEach((ambassador, index) => {
      console.log(`${index + 1}. ID: ${ambassador.id}`);
      console.log(`   Username: ${ambassador.username}`);
      console.log(`   Role: ${ambassador.role}`);
    });
    
    // Check team_drafts table
    const draftsResult = await pool.query(`
      SELECT id, ambassador_id, draft_name, created_at 
      FROM team_drafts 
      LIMIT 5
    `);
    
    console.log('\n📊 Team drafts found:', draftsResult.rows.length);
    console.log('📊 找到的队伍草稿数量:', draftsResult.rows.length);
    
    draftsResult.rows.forEach((draft, index) => {
      console.log(`${index + 1}. Draft ID: ${draft.id}`);
      console.log(`   Ambassador ID: ${draft.ambassador_id}`);
      console.log(`   Draft Name: ${draft.draft_name}`);
      console.log(`   Created: ${draft.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking ambassadors:', error.message);
    console.error('❌ 检查大使时出错:', error.message);
  } finally {
    await pool.end();
  }
}

checkAmbassadors(); 