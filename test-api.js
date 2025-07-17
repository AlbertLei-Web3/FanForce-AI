import { query } from './lib/database.ts';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0]);
    
    // Test team_drafts table
    console.log('\nTesting team_drafts table...');
    const draftsResult = await query('SELECT COUNT(*) as count FROM team_drafts');
    console.log('Team drafts count:', draftsResult.rows[0]);
    
    // Test users table for ambassadors
    console.log('\nTesting ambassadors...');
    const ambassadorsResult = await query(`
      SELECT id, role, profile_data 
      FROM users 
      WHERE role = 'ambassador' 
      LIMIT 5
    `);
    console.log('Ambassadors found:', ambassadorsResult.rows.length);
    if (ambassadorsResult.rows.length > 0) {
      console.log('First ambassador:', ambassadorsResult.rows[0]);
    }
    
    // Test athletes
    console.log('\nTesting athletes...');
    const athletesResult = await query(`
      SELECT COUNT(*) as count 
      FROM users u 
      JOIN athletes a ON u.id = a.user_id 
      WHERE u.role = 'athlete'
    `);
    console.log('Athletes count:', athletesResult.rows[0]);
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase(); 