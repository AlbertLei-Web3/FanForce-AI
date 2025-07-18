// Fix Events Table - Add Missing Columns
// 修复事件表 - 添加缺失的列
// This script adds missing columns to the events table for the approval workflow
// 此脚本为事件表添加审批工作流所需的缺失列

const { Pool } = require('pg');

// Database connection configuration
// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function fixEventsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing events table...');
    console.log('🔧 修复事件表...');
    
    // Check current columns
    // 检查当前列
    console.log('\n📋 Current events table columns:');
    console.log('📋 当前事件表列:');
    
    const currentColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position
    `);
    
    currentColumns.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type})`);
    });
    
    // Add missing columns
    // 添加缺失的列
    const missingColumns = [
      {
        name: 'sport_type',
        type: 'VARCHAR(50)',
        description: 'Sport type (soccer, basketball, etc.)'
      },
      {
        name: 'start_time',
        type: 'TIME',
        description: 'Event start time'
      },
      {
        name: 'end_time',
        type: 'TIME',
        description: 'Event end time'
      },
      {
        name: 'venue_name',
        type: 'VARCHAR(255)',
        description: 'Venue name'
      },
      {
        name: 'venue_address',
        type: 'TEXT',
        description: 'Venue address'
      },
      {
        name: 'venue_capacity',
        type: 'INTEGER',
        description: 'Venue capacity'
      },
      {
        name: 'party_venue_capacity',
        type: 'INTEGER',
        description: 'Party venue capacity'
      },
      {
        name: 'team_a_info',
        type: 'JSONB',
        description: 'Team A information'
      },
      {
        name: 'team_b_info',
        type: 'JSONB',
        description: 'Team B information'
      },
      {
        name: 'estimated_participants',
        type: 'INTEGER',
        description: 'Estimated number of participants'
      },
      {
        name: 'expected_revenue',
        type: 'NUMERIC(10,2)',
        description: 'Expected revenue'
      },
      {
        name: 'support_options',
        type: 'JSONB',
        description: 'Support options configuration'
      },
      {
        name: 'fee_rule_id',
        type: 'UUID',
        description: 'Fee rule ID'
      }
    ];
    
    console.log('\n🔧 Adding missing columns...');
    console.log('🔧 添加缺失的列...');
    
    for (const column of missingColumns) {
      try {
        // Check if column already exists
        // 检查列是否已存在
        const existsResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'events' AND column_name = $1
        `, [column.name]);
        
        if (existsResult.rows.length === 0) {
          // Add column
          // 添加列
          await client.query(`
            ALTER TABLE events 
            ADD COLUMN ${column.name} ${column.type}
          `);
          
          console.log(`✅ Added column: ${column.name} (${column.type})`);
          console.log(`✅ 添加列: ${column.name} (${column.type})`);
        } else {
          console.log(`ℹ️ Column already exists: ${column.name}`);
          console.log(`ℹ️ 列已存在: ${column.name}`);
        }
      } catch (error) {
        console.error(`❌ Error adding column ${column.name}:`, error.message);
        console.error(`❌ 添加列 ${column.name} 时出错:`, error.message);
      }
    }
    
    // Verify all columns exist
    // 验证所有列都存在
    console.log('\n🔍 Verifying all columns exist...');
    console.log('🔍 验证所有列都存在...');
    
    const finalColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Final events table columns:');
    console.log('📋 最终事件表列:');
    
    finalColumns.rows.forEach(row => {
      console.log(`   ${row.column_name} (${row.data_type})`);
    });
    
    // Check if we have any events to test with
    // 检查是否有事件可以测试
    const eventsCount = await client.query('SELECT COUNT(*) as count FROM events');
    console.log(`\n📊 Total events in database: ${eventsCount.rows[0].count}`);
    console.log(`📊 数据库中的总事件数: ${eventsCount.rows[0].count}`);
    
    if (parseInt(eventsCount.rows[0].count) > 0) {
      console.log('\n🧪 Testing with existing event...');
      console.log('🧪 用现有事件测试...');
      
      const testEvent = await client.query(`
        SELECT id, title, status 
        FROM events 
        LIMIT 1
      `);
      
      if (testEvent.rows.length > 0) {
        const event = testEvent.rows[0];
        console.log(`✅ Found test event: ${event.title} (${event.id})`);
        console.log(`✅ 找到测试事件: ${event.title} (${event.id})`);
        console.log(`   Status: ${event.status}`);
        console.log(`   状态: ${event.status}`);
      }
    }
    
    console.log('\n🎉 Events table fix completed!');
    console.log('🎉 事件表修复完成！');
    
  } catch (error) {
    console.error('❌ Error fixing events table:', error);
    console.error('❌ 修复事件表时出错:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
// 运行修复
if (require.main === module) {
  fixEventsTable()
    .then(() => {
      console.log('✅ Fix completed successfully');
      console.log('✅ 修复成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fix failed:', error);
      console.error('❌ 修复失败:', error);
      process.exit(1);
    });
}

module.exports = { fixEventsTable }; 