const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function applyMatchLifecycleSchema() {
  try {
    console.log('Applying match lifecycle schema...');
    console.log('应用比赛生命周期架构...');
    
    // Read the schema file
    // 读取架构文件
    const schemaPath = path.join(__dirname, '../lib/match-lifecycle-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    // 执行架构
    await pool.query(schemaSQL);
    
    console.log('✅ Match lifecycle schema applied successfully!');
    console.log('✅ 比赛生命周期架构应用成功！');
    
    // Verify the new tables and columns exist
    // 验证新表和列是否存在
    console.log('\nVerifying schema changes...');
    console.log('验证架构更改...');
    
    // Check if new columns were added to events table
    // 检查events表是否添加了新列
    const eventsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('application_id', 'match_status', 'pool_injected_chz', 'fee_rule_id')
      ORDER BY column_name
    `);
    
    console.log('\nNew columns added to events table:');
    console.log('添加到events表的新列:');
    eventsColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if new tables were created
    // 检查是否创建了新表
    const newTables = [
      'event_approval_log',
      'match_status_transitions', 
      'chz_pool_management',
      'support_options',
      'audience_support_records'
    ];
    
    console.log('\nNew tables created:');
    console.log('创建的新表:');
    for (const tableName of newTables) {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [tableName]);
      
      if (tableExists.rows[0].exists) {
        console.log(`  ✅ ${tableName}`);
      } else {
        console.log(`  ❌ ${tableName} (not found)`);
      }
    }
    
    // Check if views were created
    // 检查是否创建了视图
    const viewExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_name = 'ambassador_recent_events'
      )
    `);
    
    if (viewExists.rows[0].exists) {
      console.log('\n✅ ambassador_recent_events view created');
      console.log('✅ ambassador_recent_events 视图已创建');
    } else {
      console.log('\n❌ ambassador_recent_events view not found');
      console.log('❌ ambassador_recent_events 视图未找到');
    }
    
    console.log('\n🎉 Schema update completed!');
    console.log('🎉 架构更新完成！');
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    console.error('❌ 应用架构时出错:', error);
  } finally {
    await pool.end();
  }
}

applyMatchLifecycleSchema(); 