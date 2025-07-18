// Create Events Table Script
// 创建事件表脚本
// This script adds the missing events table and related tables to the database
// 此脚本将缺失的事件表和相关表添加到数据库

const { Pool } = require('pg')

// Database configuration / 数据库配置
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000' // Replace with your actual password / 替换为你的实际密码
})

async function createEventsTable() {
  const client = await pool.connect()
  
  try {
    console.log('Creating events table... / 创建事件表...')
    
    // Create events table / 创建事件表
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        venue_id uuid,
        party_venue_id uuid,
        ambassador_id uuid,
        title varchar(200) NOT NULL,
        description text,
        event_date timestamp NOT NULL,
        registration_deadline timestamp NOT NULL,
        status varchar(20) DEFAULT 'draft',
        entry_fee numeric(18,8) DEFAULT 0.0,
        stake_amount numeric(18,8) DEFAULT 0.0,
        max_participants int4 DEFAULT 100,
        current_participants int4 DEFAULT 0,
        weather_dependency varchar(20) DEFAULT 'low',
        contingency_plans jsonb DEFAULT '{}',
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT events_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES venues(id),
        CONSTRAINT events_party_venue_id_fkey FOREIGN KEY (party_venue_id) REFERENCES venues(id),
        CONSTRAINT events_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES users(id),
        PRIMARY KEY (id)
      )
    `)
    
    // Create indices / 创建索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_status ON events USING btree (status)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_date ON events USING btree (event_date)
    `)
    
    // Create event_applications table if it doesn't exist / 如果不存在则创建event_applications表
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_applications (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        ambassador_id uuid NOT NULL,
        event_name varchar(200) NOT NULL,
        event_description text,
        event_date date NOT NULL,
        event_time time,
        venue varchar(200) NOT NULL,
        sport_type varchar(50) DEFAULT 'soccer',
        team_a_name varchar(200) NOT NULL,
        team_a_athletes jsonb DEFAULT '[]',
        team_a_metadata jsonb DEFAULT '{}',
        team_b_name varchar(200) NOT NULL,
        team_b_athletes jsonb DEFAULT '[]',
        team_b_metadata jsonb DEFAULT '{}',
        estimated_duration int4 DEFAULT 90,
        expected_audience int4 DEFAULT 100,
        ticket_price numeric(10,2) DEFAULT 0.0,
        application_notes text,
        status varchar(20) DEFAULT 'pending',
        admin_notes text,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT event_applications_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES users(id),
        PRIMARY KEY (id)
      )
    `)
    
    // Create indices for event_applications / 为event_applications创建索引
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_event_applications_ambassador_id ON event_applications USING btree (ambassador_id)
    `)
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_event_applications_status ON event_applications USING btree (status)
    `)
    
    console.log('Events table and related tables created successfully! / 事件表和相关表创建成功！')
    
    // Check if tables exist / 检查表是否存在
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('events', 'event_applications')
    `)
    
    console.log('Existing tables: / 现有表:', tablesCheck.rows.map(row => row.table_name))
    
  } catch (error) {
    console.error('Error creating events table: / 创建事件表时出错:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the script / 运行脚本
createEventsTable().catch(console.error) 