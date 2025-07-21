// Check team info format in database
// 检查数据库中的队伍信息格式

const { Pool } = require('pg');

async function checkTeamInfoFormat() {
  console.log('🔍 Checking team info format in database...');
  console.log('🔍 检查数据库中的队伍信息格式...');

  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fanforce_ai',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const client = await pool.connect();

    // Check events with team info
    // 检查包含队伍信息的活动
    console.log('\n📊 Checking events with team info...');
    console.log('📊 检查包含队伍信息的活动...');
    const eventsResult = await client.query(`
      SELECT id, title, team_a_info, team_b_info, 
             team_a_info::text as team_a_info_text,
             team_b_info::text as team_b_info_text
      FROM events 
      WHERE team_a_info IS NOT NULL OR team_b_info IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    
    if (eventsResult.rows.length > 0) {
      console.log('✅ Found events with team info:', eventsResult.rows.length);
      console.log('✅ 找到包含队伍信息的活动:', eventsResult.rows.length);
      eventsResult.rows.forEach((event, index) => {
        console.log(`\n  Event ${index + 1}:`);
        console.log(`  活动 ${index + 1}:`);
        console.log('    Title:', event.title);
        console.log('    Team A Info:', event.team_a_info);
        console.log('    Team A Info (text):', event.team_a_info_text);
        console.log('    Team B Info:', event.team_b_info);
        console.log('    Team B Info (text):', event.team_b_info_text);
        
        // Try to parse team info
        // 尝试解析队伍信息
        if (event.team_a_info) {
          try {
            const teamA = typeof event.team_a_info === 'string' ? 
              JSON.parse(event.team_a_info) : event.team_a_info;
            console.log('    Team A Parsed:', teamA);
          } catch (e) {
            console.log('    Team A Parse Error:', e.message);
          }
        }
        
        if (event.team_b_info) {
          try {
            const teamB = typeof event.team_b_info === 'string' ? 
              JSON.parse(event.team_b_info) : event.team_b_info;
            console.log('    Team B Parsed:', teamB);
          } catch (e) {
            console.log('    Team B Parse Error:', e.message);
          }
        }
      });
    } else {
      console.log('❌ No events with team info found');
      console.log('❌ 未找到包含队伍信息的活动');
    }

    // Check specific event that was just updated
    // 检查刚刚更新的特定活动
    console.log('\n🎯 Checking specific updated event...');
    console.log('🎯 检查刚刚更新的特定活动...');
    const specificEventResult = await client.query(`
      SELECT id, title, team_a_info, team_b_info, 
             team_a_info::text as team_a_info_text,
             team_b_info::text as team_b_info_text
      FROM events 
      WHERE id = '9b33b55c-c09e-41b9-b031-1c8680dd636a'
    `);
    
    if (specificEventResult.rows.length > 0) {
      const event = specificEventResult.rows[0];
      console.log('✅ Found specific event:');
      console.log('✅ 找到特定活动:');
      console.log('  Title:', event.title);
      console.log('  Team A Info:', event.team_a_info);
      console.log('  Team B Info:', event.team_b_info);
      
      // Parse team info for this specific event
      // 解析此特定活动的队伍信息
      if (event.team_a_info) {
        try {
          const teamA = typeof event.team_a_info === 'string' ? 
            JSON.parse(event.team_a_info) : event.team_a_info;
          console.log('  Team A Parsed:', teamA);
          console.log('  Team A Name:', teamA.name);
        } catch (e) {
          console.log('  Team A Parse Error:', e.message);
        }
      }
      
      if (event.team_b_info) {
        try {
          const teamB = typeof event.team_b_info === 'string' ? 
            JSON.parse(event.team_b_info) : event.team_b_info;
          console.log('  Team B Parsed:', teamB);
          console.log('  Team B Name:', teamB.name);
        } catch (e) {
          console.log('  Team B Parse Error:', e.message);
        }
      }
    } else {
      console.log('❌ Specific event not found');
      console.log('❌ 未找到特定活动');
    }

    client.release();
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('❌ 数据库检查失败:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the check
// 运行检查
if (require.main === module) {
  checkTeamInfoFormat();
}

module.exports = { checkTeamInfoFormat }; 