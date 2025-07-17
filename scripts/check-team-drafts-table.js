// Check Team Drafts Table Script
// 检查队伍草稿表脚本

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

async function checkTeamDraftsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Checking team_drafts table...');
    // 检查team_drafts表...
    
    // Check if table exists
    // 检查表是否存在
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'team_drafts'
      )
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('team_drafts table exists');
      // team_drafts表存在
      
      // Check table structure
      // 检查表结构
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'team_drafts'
        ORDER BY ordinal_position
      `);
      
      console.log('\nTeam drafts table structure:');
      // 队伍草稿表结构：
      structure.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Check if there are any records
      // 检查是否有记录
      const recordCount = await client.query('SELECT COUNT(*) as count FROM team_drafts');
      console.log(`\nRecords in team_drafts: ${recordCount.rows[0].count}`);
      // team_drafts中的记录数：${recordCount.rows[0].count}
      
    } else {
      console.log('team_drafts table does not exist, creating it...');
      // team_drafts表不存在，正在创建...
      
      // Create the table
      // 创建表
      await client.query(`
        CREATE TABLE team_drafts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          ambassador_id UUID REFERENCES users(id),
          draft_name VARCHAR(200) NOT NULL,
          sport_type VARCHAR(50) DEFAULT 'soccer',
          team_a_name VARCHAR(200) NOT NULL,
          team_a_athletes JSONB DEFAULT '[]',
          team_a_metadata JSONB DEFAULT '{}',
          team_b_name VARCHAR(200) NOT NULL,
          team_b_athletes JSONB DEFAULT '[]',
          team_b_metadata JSONB DEFAULT '{}',
          status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'cancelled')),
          estimated_duration INTEGER DEFAULT 90,
          match_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes
      // 创建索引
      await client.query('CREATE INDEX idx_team_drafts_ambassador_id ON team_drafts(ambassador_id)');
      await client.query('CREATE INDEX idx_team_drafts_status ON team_drafts(status)');
      
      console.log('team_drafts table created successfully');
      // team_drafts表创建成功
    }
    
  } catch (error) {
    console.error('Error checking team_drafts table:', error);
    // 检查team_drafts表时出错：
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
// 运行检查
checkTeamDraftsTable(); 