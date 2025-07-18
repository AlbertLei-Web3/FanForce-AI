const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function checkTableStructure() {
  try {
    console.log('Checking events table structure...');
    const eventsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nEvents table structure:');
    eventsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('\nChecking event_applications table structure...');
    const applicationsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'event_applications' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nEvent Applications table structure:');
    applicationsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check if there are any events in the database
    const eventsCount = await pool.query('SELECT COUNT(*) as count FROM events');
    console.log(`\nTotal events in database: ${eventsCount.rows[0].count}`);

    // Check if there are any event applications
    const applicationsCount = await pool.query('SELECT COUNT(*) as count FROM event_applications');
    console.log(`Total event applications in database: ${applicationsCount.rows[0].count}`);

    // Check sample data
    if (eventsCount.rows[0].count > 0) {
      console.log('\nSample event data:');
      const sampleEvent = await pool.query('SELECT * FROM events LIMIT 1');
      console.log(JSON.stringify(sampleEvent.rows[0], null, 2));
    }

    if (applicationsCount.rows[0].count > 0) {
      console.log('\nSample event application data:');
      const sampleApplication = await pool.query('SELECT * FROM event_applications LIMIT 1');
      console.log(JSON.stringify(sampleApplication.rows[0], null, 2));
    }

  } catch (error) {
    console.error('Error checking table structure:', error);
  } finally {
    await pool.end();
  }
}

checkTableStructure(); 