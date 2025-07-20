const { query, closePool } = require('../lib/database.js');

async function checkEventsTable() {
  try {
    console.log('Checking events table structure...');
    console.log('检查events表结构...');
    
    const result = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position
    `);
    
    console.log('Events table columns:');
    console.log('Events表列:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await closePool();
  }
}

checkEventsTable(); 