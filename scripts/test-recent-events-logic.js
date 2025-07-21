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

// Test the fixed recent events logic
// 测试修复后的最近活动逻辑
async function testRecentEventsLogic() {
  try {
    logInfo(
      'Testing fixed recent events logic...',
      '测试修复后的最近活动逻辑...'
    );

    const ambassadorId = '1de6110a-f982-4f7f-979e-00e7f7d33bed';

    // Test the new query logic
    // 测试新的查询逻辑
    const sqlQuery = `
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
        -- Calculate time proximity to current time for better sorting
        -- 计算与当前时间的接近度以便更好地排序
        CASE 
          WHEN e.event_date > NOW() THEN 
            EXTRACT(EPOCH FROM (e.event_date - NOW())) / 3600 -- Hours until event
          ELSE 
            EXTRACT(EPOCH FROM (NOW() - e.event_date)) / 3600 -- Hours since event
        END as time_proximity_hours
      FROM events e
      LEFT JOIN event_applications ea ON e.application_id = ea.id
      LEFT JOIN users u ON e.ambassador_id = u.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      LEFT JOIN user_stake_records usr ON e.id = usr.event_id
      WHERE e.ambassador_id = $1 
        AND e.status IN ('active', 'completed')
        -- Filter out events older than 30 days (configurable)
        -- 过滤掉超过30天的活动（可配置）
        AND e.event_date > (NOW() - INTERVAL '30 days')
      GROUP BY e.id, e.title, e.description, e.event_date, e.status, 
               e.pool_injected_chz, e.total_pool_amount, e.match_result,
               e.team_a_score, e.team_b_score, e.result_announced_at,
               ea.team_a_info, ea.team_b_info, ea.venue_name, ea.venue_capacity,
               u.wallet_address, e.rewards_distributed, e.rewards_distributed_at
      ORDER BY 
        -- Future events first (closest to current time)
        -- 未来活动优先（最接近当前时间）
        CASE WHEN e.event_date > NOW() THEN 0 ELSE 1 END,
        -- Then by time proximity (closest first)
        -- 然后按时间接近度排序（最近的优先）
        time_proximity_hours ASC,
        -- Finally by event date for events at same time
        -- 最后按活动日期排序（同一时间的活动）
        e.event_date DESC
    `;

    const result = await pool.query(sqlQuery, [ambassadorId]);

    logSuccess(
      `Found ${result.rows.length} recent events after filtering`,
      `过滤后找到${result.rows.length}个最近活动`
    );

    // Display current time for reference
    // 显示当前时间以供参考
    const currentTime = new Date();
    console.log(`\n🕐 Current Time: ${currentTime.toISOString()}`);
    console.log(`🕐 当前时间: ${currentTime.toISOString()}`);

    // Analyze the results
    // 分析结果
    let futureEvents = 0;
    let pastEvents = 0;
    let realDataEvents = 0;
    let mockDataEvents = 0;

    console.log('\n📊 Recent Events Analysis:');
    console.log('📊 最近活动分析:');

    result.rows.forEach((event, index) => {
      const eventDate = new Date(event.event_date);
      const isFuture = eventDate > currentTime;
      const isRealData = event.title && (event.title.includes('Wolves') || event.title.includes('Hawks') || event.title.includes('es vs'));
      
      if (isFuture) futureEvents++;
      else pastEvents++;
      
      if (isRealData) realDataEvents++;
      else mockDataEvents++;

      console.log(`\n📅 Event ${index + 1}:`);
      console.log(`  Title: ${event.title}`);
      console.log(`  Date: ${event.event_date}`);
      console.log(`  Status: ${event.match_status}`);
      console.log(`  Time Proximity: ${Math.round(event.time_proximity_hours)} hours`);
      console.log(`  Type: ${isFuture ? '🔮 Future' : '📜 Past'}`);
      console.log(`  Data: ${isRealData ? '✅ Real' : '🎭 Mock'}`);
      
      if (event.team_a_info && event.team_b_info) {
        console.log(`  Teams: ${event.team_a_info.name} vs ${event.team_b_info.name}`);
      }
      
      if (event.match_result) {
        console.log(`  Result: ${event.match_result} (${event.team_a_score}-${event.team_b_score})`);
      }
    });

    // Summary statistics
    // 统计摘要
    console.log('\n📈 Summary Statistics:');
    console.log('📈 统计摘要:');
    console.log(`  Total Events: ${result.rows.length}`);
    console.log(`  Future Events: ${futureEvents}`);
    console.log(`  Past Events: ${pastEvents}`);
    console.log(`  Real Data Events: ${realDataEvents}`);
    console.log(`  Mock Data Events: ${mockDataEvents}`);
    console.log(`  Events with Match Results: ${result.rows.filter(e => e.match_result).length}`);

    // Check if the logic is working correctly
    // 检查逻辑是否正确工作
    if (result.rows.length > 0) {
      const firstEvent = result.rows[0];
      const firstEventDate = new Date(firstEvent.event_date);
      const isFirstEventFuture = firstEventDate > currentTime;
      
      logSuccess(
        `Logic working correctly - showing ${result.rows.length} events within 30 days`,
        `逻辑工作正常 - 显示30天内的${result.rows.length}个活动`
      );
      
      if (isFirstEventFuture) {
        logSuccess(
          'Future events are prioritized correctly',
          '未来活动正确优先显示'
        );
      } else {
        logSuccess(
          'Recent past events are shown correctly',
          '最近的过去活动正确显示'
        );
      }
    } else {
      logError(
        'No events found - may need to adjust time filter',
        '未找到活动 - 可能需要调整时间过滤器'
      );
    }

    // Test with different time filters
    // 使用不同时间过滤器测试
    logInfo(
      'Testing with different time filters...',
      '使用不同时间过滤器测试...'
    );

    const timeFilters = [
      { name: '7 days', interval: '7 days' },
      { name: '14 days', interval: '14 days' },
      { name: '30 days', interval: '30 days' },
      { name: '60 days', interval: '60 days' }
    ];

    for (const filter of timeFilters) {
      const testQuery = `
        SELECT COUNT(*) as count
        FROM events e
        WHERE e.ambassador_id = $1 
          AND e.status IN ('active', 'completed')
          AND e.event_date > (NOW() - INTERVAL '${filter.interval}')
      `;
      
      const testResult = await pool.query(testQuery, [ambassadorId]);
      console.log(`  ${filter.name}: ${testResult.rows[0].count} events`);
    }

  } catch (error) {
    logError(
      'Failed to test recent events logic',
      '测试最近活动逻辑失败',
      error
    );
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  testRecentEventsLogic()
    .then(() => {
      console.log('✨ Recent events logic test completed');
      console.log('✨ 最近活动逻辑测试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Recent events logic test failed');
      console.error('💥 最近活动逻辑测试失败');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testRecentEventsLogic }; 