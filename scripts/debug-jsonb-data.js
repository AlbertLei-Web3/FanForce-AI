const { Pool } = require('pg');

// Database configuration
// 数据库配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Debug JSONB data format
// 调试JSONB数据格式
async function debugJSONBData() {
  try {
    console.log('🔍 Debugging JSONB data format...');
    console.log('🔍 调试JSONB数据格式...');

    const ambassadorId = '1de6110a-f982-4f7f-979e-00e7f7d33bed';

    // Get sample events with team info
    // 获取带有队伍信息的样本活动
    const query = `
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.event_date,
        e.status as match_status,
        ea.team_a_info,
        ea.team_b_info,
        ea.venue_name,
        ea.venue_capacity
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      WHERE e.ambassador_id = $1 
        AND e.status IN ('active', 'completed')
        AND e.event_date > (NOW() - INTERVAL '30 days')
      LIMIT 3
    `;

    const result = await pool.query(query, [ambassadorId]);

    console.log(`\n📊 Found ${result.rows.length} events to debug`);
    console.log(`📊 找到${result.rows.length}个活动进行调试`);

    result.rows.forEach((event, index) => {
      console.log(`\n📅 Event ${index + 1}:`);
      console.log(`  ID: ${event.event_id}`);
      console.log(`  Title: ${event.event_title}`);
      console.log(`  Date: ${event.event_date}`);
      console.log(`  Status: ${event.match_status}`);
      
      // Debug team_a_info
      console.log(`\n  🔍 Team A Info Debug:`);
      console.log(`    Raw value: ${event.team_a_info}`);
      console.log(`    Type: ${typeof event.team_a_info}`);
      console.log(`    Is null: ${event.team_a_info === null}`);
      console.log(`    Is undefined: ${event.team_a_info === undefined}`);
      
      if (event.team_a_info) {
        try {
          const parsed = typeof event.team_a_info === 'string' ? JSON.parse(event.team_a_info) : event.team_a_info;
          console.log(`    Parsed successfully: ${JSON.stringify(parsed)}`);
          console.log(`    Parsed type: ${typeof parsed}`);
          if (parsed && typeof parsed === 'object') {
            console.log(`    Has name property: ${parsed.hasOwnProperty('name')}`);
            console.log(`    Name value: ${parsed.name}`);
          }
        } catch (error) {
          console.log(`    Parse error: ${error.message}`);
        }
      }
      
      // Debug team_b_info
      console.log(`\n  🔍 Team B Info Debug:`);
      console.log(`    Raw value: ${event.team_b_info}`);
      console.log(`    Type: ${typeof event.team_b_info}`);
      console.log(`    Is null: ${event.team_b_info === null}`);
      console.log(`    Is undefined: ${event.team_b_info === undefined}`);
      
      if (event.team_b_info) {
        try {
          const parsed = typeof event.team_b_info === 'string' ? JSON.parse(event.team_b_info) : event.team_b_info;
          console.log(`    Parsed successfully: ${JSON.stringify(parsed)}`);
          console.log(`    Parsed type: ${typeof parsed}`);
          if (parsed && typeof parsed === 'object') {
            console.log(`    Has name property: ${parsed.hasOwnProperty('name')}`);
            console.log(`    Name value: ${parsed.name}`);
          }
        } catch (error) {
          console.log(`    Parse error: ${error.message}`);
        }
      }
    });

    // Test the exact API query to see what format is returned
    // 测试精确的API查询以查看返回的格式
    console.log('\n🔍 Testing API query format...');
    console.log('🔍 测试API查询格式...');

    const apiQuery = `
      SELECT 
        e.id as event_id,
        e.title as event_title,
        e.description as event_description,
        e.event_date,
        e.status as match_status,
        e.pool_injected_chz,
        e.total_pool_amount,
        e.match_result,
        e.team_a_score,
        e.team_b_score,
        e.result_announced_at,
        ea.team_a_info,
        ea.team_b_info,
        ea.venue_name,
        ea.venue_capacity,
        u.wallet_address as ambassador_wallet,
        COUNT(DISTINCT ep.id) as total_participants,
        COUNT(DISTINCT usr.id) as total_stakes,
        SUM(usr.stake_amount) as total_stakes_amount,
        e.rewards_distributed,
        e.rewards_distributed_at,
        CASE 
          WHEN e.event_date > NOW() THEN 
            EXTRACT(EPOCH FROM (e.event_date - NOW())) / 3600
          ELSE 
            EXTRACT(EPOCH FROM (NOW() - e.event_date)) / 3600
        END as time_proximity_hours
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LEFT JOIN users u ON e.ambassador_id = u.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      LEFT JOIN user_stake_records usr ON e.id = usr.event_id
      WHERE e.ambassador_id = $1 
        AND e.status IN ('active', 'completed')
        AND e.event_date > (NOW() - INTERVAL '30 days')
      GROUP BY e.id, e.title, e.description, e.event_date, e.status, 
               e.pool_injected_chz, e.total_pool_amount, e.match_result,
               e.team_a_score, e.team_b_score, e.result_announced_at,
               ea.team_a_info, ea.team_b_info, ea.venue_name, ea.venue_capacity,
               u.wallet_address, e.rewards_distributed, e.rewards_distributed_at
      ORDER BY 
        CASE WHEN e.event_date > NOW() THEN 0 ELSE 1 END,
        time_proximity_hours ASC,
        e.event_date DESC
      LIMIT 2
    `;

    const apiResult = await pool.query(apiQuery, [ambassadorId]);

    console.log(`\n📊 API Query returned ${apiResult.rows.length} events`);
    console.log(`📊 API查询返回${apiResult.rows.length}个活动`);

    if (apiResult.rows.length > 0) {
      const sampleEvent = apiResult.rows[0];
      console.log('\n📋 Sample API Response Event:');
      console.log('📋 样本API响应活动:');
      console.log(`  Event ID: ${sampleEvent.event_id}`);
      console.log(`  Title: ${sampleEvent.event_title}`);
      console.log(`  Team A Info Type: ${typeof sampleEvent.team_a_info}`);
      console.log(`  Team B Info Type: ${typeof sampleEvent.team_b_info}`);
      
      if (sampleEvent.team_a_info) {
        console.log(`  Team A Info: ${JSON.stringify(sampleEvent.team_a_info)}`);
      }
      
      if (sampleEvent.team_b_info) {
        console.log(`  Team B Info: ${JSON.stringify(sampleEvent.team_b_info)}`);
      }
    }

  } catch (error) {
    console.error('❌ Error debugging JSONB data:', error);
    console.error('❌ 调试JSONB数据时出错:', error);
  } finally {
    await pool.end();
  }
}

// Run the debug
// 运行调试
if (require.main === module) {
  debugJSONBData()
    .then(() => {
      console.log('\n✨ JSONB data debug completed');
      console.log('✨ JSONB数据调试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 JSONB data debug failed');
      console.error('💥 JSONB数据调试失败');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { debugJSONBData }; 