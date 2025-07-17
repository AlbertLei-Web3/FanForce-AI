import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// 创建数据库连接
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function fixDirtyData() {
  try {
    console.log('开始清理数据库脏数据...');
    
    // 1. 检查当前数据状态
    console.log('\n1. 检查当前数据状态...');
    const checkResult = await pool.query(`
      SELECT 
        id,
        team_a_athletes,
        team_b_athletes,
        team_a_metadata,
        team_b_metadata
      FROM team_drafts 
      LIMIT 5
    `);
    
    console.log('当前数据示例:', checkResult.rows);
    
    // 2. 修复 team_a_athletes 字段
    console.log('\n2. 修复 team_a_athletes 字段...');
    const fixTeamA = await pool.query(`
      UPDATE team_drafts 
      SET team_a_athletes = '[]' 
      WHERE team_a_athletes IS NULL 
         OR team_a_athletes = '' 
         OR team_a_athletes = 'null'
         OR team_a_athletes NOT LIKE '[%]'
    `);
    console.log(`修复了 ${fixTeamA.rowCount} 条 team_a_athletes 记录`);
    
    // 3. 修复 team_b_athletes 字段
    console.log('\n3. 修复 team_b_athletes 字段...');
    const fixTeamB = await pool.query(`
      UPDATE team_drafts 
      SET team_b_athletes = '[]' 
      WHERE team_b_athletes IS NULL 
         OR team_b_athletes = '' 
         OR team_b_athletes = 'null'
         OR team_b_athletes NOT LIKE '[%]'
    `);
    console.log(`修复了 ${fixTeamB.rowCount} 条 team_b_athletes 记录`);
    
    // 4. 修复 team_a_metadata 字段
    console.log('\n4. 修复 team_a_metadata 字段...');
    const fixMetadataA = await pool.query(`
      UPDATE team_drafts 
      SET team_a_metadata = '{}' 
      WHERE team_a_metadata IS NULL 
         OR team_a_metadata = '' 
         OR team_a_metadata = 'null'
         OR team_a_metadata NOT LIKE '{%'
    `);
    console.log(`修复了 ${fixMetadataA.rowCount} 条 team_a_metadata 记录`);
    
    // 5. 修复 team_b_metadata 字段
    console.log('\n5. 修复 team_b_metadata 字段...');
    const fixMetadataB = await pool.query(`
      UPDATE team_drafts 
      SET team_b_metadata = '{}' 
      WHERE team_b_metadata IS NULL 
         OR team_b_metadata = '' 
         OR team_b_metadata = 'null'
         OR team_b_metadata NOT LIKE '{%'
    `);
    console.log(`修复了 ${fixMetadataB.rowCount} 条 team_b_metadata 记录`);
    
    // 6. 验证修复结果
    console.log('\n6. 验证修复结果...');
    const verifyResult = await pool.query(`
      SELECT 
        id,
        team_a_athletes,
        team_b_athletes,
        team_a_metadata,
        team_b_metadata
      FROM team_drafts 
      LIMIT 5
    `);
    
    console.log('修复后的数据示例:', verifyResult.rows);
    
    // 7. 测试 JSON 解析
    console.log('\n7. 测试 JSON 解析...');
    for (const row of verifyResult.rows) {
      try {
        JSON.parse(row.team_a_athletes);
        JSON.parse(row.team_b_athletes);
        JSON.parse(row.team_a_metadata);
        JSON.parse(row.team_b_metadata);
        console.log(`✅ 记录 ${row.id} 的 JSON 解析成功`);
      } catch (error) {
        console.error(`❌ 记录 ${row.id} 的 JSON 解析失败:`, error);
      }
    }
    
    console.log('\n✅ 数据库脏数据清理完成！');
    
  } catch (error) {
    console.error('清理数据库脏数据时出错:', error);
  } finally {
    await pool.end();
  }
}

fixDirtyData(); 