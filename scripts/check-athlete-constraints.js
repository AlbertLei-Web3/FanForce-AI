// Check Athlete Table Constraints Script
// 检查运动员表约束脚本

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

async function checkAthleteConstraints() {
  const client = await pool.connect();
  
  try {
    console.log('Checking athlete table constraints...');
    // 检查运动员表约束...
    
    // Check the tier constraint
    // 检查tier约束
    const tierConstraint = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'athletes'::regclass 
      AND conname = 'athletes_tier_check'
    `);
    
    if (tierConstraint.rows.length > 0) {
      console.log('Tier constraint definition:');
      // Tier约束定义：
      console.log(tierConstraint.rows[0].definition);
    }
    
    // Check all constraints on athletes table
    // 检查运动员表的所有约束
    const allConstraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'athletes'::regclass
    `);
    
    console.log('\nAll constraints on athletes table:');
    // 运动员表的所有约束：
    allConstraints.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.conname}: ${row.definition}`);
    });
    
  } catch (error) {
    console.error('Error checking constraints:', error);
    // 检查约束时出错：
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
// 运行检查
checkAthleteConstraints(); 