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

// Logging functions
// 日志函数
function logInfo(message, chineseMessage) {
  console.log(`ℹ️  ${message}`);
  console.log(`ℹ️  ${chineseMessage}`);
  console.log('');
}

function logSuccess(message, chineseMessage) {
  console.log(`✅ ${message}`);
  console.log(`✅ ${chineseMessage}`);
  console.log('');
}

function logError(message, chineseMessage, error) {
  console.log(`❌ ${message}`);
  console.log(`❌ ${chineseMessage}`);
  if (error) {
    console.log(`Error details: ${error.message}`);
  }
  console.log('');
}

// Check ambassador recent events data
// 检查大使最近活动数据
async function checkAmbassadorRecentEvents() {
  try {
    logInfo(
      'Checking ambassador recent events data...',
      '检查大使最近活动数据...'
    );

    // Get all events with their details
    // 获取所有活动及其详情
    const eventsResult = await pool.query(`
      SELECT 
        e.id,
        e.title,
        e.description,
        e.status,
        e.event_date,
        e.ambassador_id,
        e.match_result,
        e.team_a_score,
        e.team_b_score,
        e.result_announced_at,
        e.total_participants,
        e.total_stakes_amount,
        e.rewards_distributed,
        ea.team_a_info,
        ea.team_b_info,
        ea.venue_name,
        ea.venue_capacity,
        u.wallet_address as ambassador_wallet
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LEFT JOIN users u ON e.ambassador_id = u.id
      ORDER BY e.event_date DESC
    `);

    logSuccess(
      `Found ${eventsResult.rows.length} total events`,
      `找到${eventsResult.rows.length}个总活动`
    );

    // Check each event
    // 检查每个活动
    eventsResult.rows.forEach((event, index) => {
      console.log(`\n📊 Event ${index + 1}:`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Status: ${event.status}`);
      console.log(`  Ambassador: ${event.ambassador_wallet}`);
      console.log(`  Event Date: ${event.event_date}`);
      
      // Check if team info exists
      // 检查队伍信息是否存在
      if (event.team_a_info && event.team_b_info) {
        console.log(`  Team A Info: ${JSON.stringify(event.team_a_info)}`);
        console.log(`  Team B Info: ${JSON.stringify(event.team_b_info)}`);
      } else {
        console.log(`  ⚠️  Missing team information`);
      }
      
      // Check match results
      // 检查比赛结果
      if (event.match_result) {
        console.log(`  Match Result: ${event.match_result}`);
        console.log(`  Score: ${event.team_a_score} - ${event.team_b_score}`);
        console.log(`  Result Announced: ${event.result_announced_at}`);
      } else {
        console.log(`  ⚠️  No match result recorded`);
      }
      
      // Check venue info
      // 检查场馆信息
      if (event.venue_name) {
        console.log(`  Venue: ${event.venue_name} (Capacity: ${event.venue_capacity})`);
      } else {
        console.log(`  ⚠️  Missing venue information`);
      }
      
      // Check participation stats
      // 检查参与统计
      console.log(`  Total Participants: ${event.total_participants || 0}`);
      console.log(`  Total Stakes: ${event.total_stakes_amount || 0} CHZ`);
      console.log(`  Rewards Distributed: ${event.rewards_distributed || false}`);
    });

    // Check if events have real team data
    // 检查活动是否有真实的队伍数据
    const eventsWithTeamData = eventsResult.rows.filter(event => 
      event.team_a_info && event.team_b_info && 
      Object.keys(event.team_a_info).length > 0 && 
      Object.keys(event.team_b_info).length > 0
    );

    logInfo(
      `Events with team data: ${eventsWithTeamData.length}/${eventsResult.rows.length}`,
      `有队伍数据的活动: ${eventsWithTeamData.length}/${eventsResult.rows.length}`
    );

    // Check if events have match results
    // 检查活动是否有比赛结果
    const eventsWithResults = eventsResult.rows.filter(event => event.match_result);

    logInfo(
      `Events with match results: ${eventsWithResults.length}/${eventsResult.rows.length}`,
      `有比赛结果的活动: ${eventsWithResults.length}/${eventsResult.rows.length}`
    );

    // Check ambassador assignments
    // 检查大使分配
    const ambassadorAssignments = eventsResult.rows.reduce((acc, event) => {
      acc[event.ambassador_wallet] = (acc[event.ambassador_wallet] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 Ambassador Event Distribution:');
    console.log('📈 大使活动分布:');
    Object.entries(ambassadorAssignments).forEach(([wallet, count]) => {
      console.log(`  ${wallet}: ${count} events`);
    });

    // Check for mock vs real data patterns
    // 检查模拟数据与真实数据模式
    const mockDataPatterns = [
      'Test Campus Basketball Match',
      'Sample Campus Basketball Game',
      'Thunder W vs Lightning H'
    ];

    const realDataPatterns = [
      'Wolves vs Lightning Hawks',
      'es vs Hawks',
      'lves vs Light'
    ];

    const mockEvents = eventsResult.rows.filter(event => 
      mockDataPatterns.some(pattern => event.title.includes(pattern))
    );

    const realEvents = eventsResult.rows.filter(event => 
      realDataPatterns.some(pattern => event.title.includes(pattern))
    );

    logInfo(
      `Mock data events: ${mockEvents.length}, Real data events: ${realEvents.length}`,
      `模拟数据活动: ${mockEvents.length}, 真实数据活动: ${realEvents.length}`
    );

    // Summary
    // 总结
    console.log('\n📋 Summary:');
    console.log('📋 总结:');
    console.log(`  Total Events: ${eventsResult.rows.length}`);
    console.log(`  Events with Team Data: ${eventsWithTeamData.length}`);
    console.log(`  Events with Match Results: ${eventsWithResults.length}`);
    console.log(`  Mock Data Events: ${mockEvents.length}`);
    console.log(`  Real Data Events: ${realEvents.length}`);
    console.log(`  Active Events: ${eventsResult.rows.filter(e => e.status === 'active').length}`);
    console.log(`  Completed Events: ${eventsResult.rows.filter(e => e.status === 'completed').length}`);

    if (realEvents.length > 0) {
      logSuccess(
        'Found real data events in the system',
        '在系统中找到真实数据活动'
      );
    } else {
      logError(
        'No real data events found - all events appear to be mock data',
        '未找到真实数据活动 - 所有活动似乎都是模拟数据'
      );
    }

  } catch (error) {
    logError(
      'Failed to check ambassador recent events',
      '检查大使最近活动失败',
      error
    );
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the check
// 运行检查
if (require.main === module) {
  checkAmbassadorRecentEvents()
    .then(() => {
      console.log('✨ Ambassador recent events check completed');
      console.log('✨ 大使最近活动检查完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Ambassador recent events check failed');
      console.error('💥 大使最近活动检查失败');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { checkAmbassadorRecentEvents }; 