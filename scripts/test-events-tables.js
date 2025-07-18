// Test Events Tables Script
// 测试事件表脚本
// This script verifies that the events and event_applications tables exist
// 此脚本验证events和event_applications表是否存在

const { Pool } = require('pg')

// Database configuration / 数据库配置
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000' // Replace with your actual password / 替换为你的实际密码
})

async function testEventsTables() {
  const client = await pool.connect()
  
  try {
    console.log('Testing events tables... / 测试事件表...')
    
    // Check if tables exist / 检查表是否存在
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('events', 'event_applications', 'team_drafts')
    `)
    
    console.log('Existing tables: / 现有表:', tablesCheck.rows.map(row => row.table_name))
    
    // Check table structures / 检查表结构
    for (const table of ['events', 'event_applications']) {
      if (tablesCheck.rows.some(row => row.table_name === table)) {
        console.log(`\n${table} table structure: / ${table}表结构:`)
        const structure = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_name = '${table}'
          ORDER BY ordinal_position
        `)
        structure.rows.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`)
        })
      } else {
        console.log(`\n❌ ${table} table does not exist / ${table}表不存在`)
      }
    }
    
    // Test inserting a sample event application / 测试插入示例赛事申请
    if (tablesCheck.rows.some(row => row.table_name === 'event_applications')) {
      console.log('\nTesting event application insertion... / 测试赛事申请插入...')
      
      // Get a sample ambassador ID / 获取示例大使ID
      const ambassadorCheck = await client.query(`
        SELECT id FROM users WHERE role = 'ambassador' LIMIT 1
      `)
      
      if (ambassadorCheck.rows.length > 0) {
        const ambassadorId = ambassadorCheck.rows[0].id
        
        try {
          const testInsert = await client.query(`
            INSERT INTO event_applications (
              ambassador_id, event_title, event_description, event_start_time, venue_name,
              venue_capacity, team_a_info, team_b_info, estimated_participants, expected_revenue
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id
          `, [
            ambassadorId,
            'Test Event',
            'Test event description',
            '2025-01-15 14:00:00',
            'Test Venue',
            100,
            JSON.stringify({ name: 'Team A', athletes: [] }),
            JSON.stringify({ name: 'Team B', athletes: [] }),
            100,
            0
          ])
          
          console.log('✅ Test event application inserted successfully / 测试赛事申请插入成功')
          console.log('Test application ID:', testInsert.rows[0].id)
          
          // Clean up test data / 清理测试数据
          await client.query(`
            DELETE FROM event_applications WHERE event_title = 'Test Event'
          `)
          console.log('Test data cleaned up / 测试数据已清理')
          
        } catch (error) {
          console.error('❌ Error inserting test event application: / 插入测试赛事申请时出错:', error.message)
        }
      } else {
        console.log('❌ No ambassador found for testing / 未找到大使进行测试')
      }
    }
    
  } catch (error) {
    console.error('Error testing events tables: / 测试事件表时出错:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the test / 运行测试
testEventsTables().catch(console.error) 