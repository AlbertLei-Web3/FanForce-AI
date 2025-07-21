const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

// Main function to apply match results schema
// 应用比赛结果架构的主函数
async function applyMatchResultsSchema() {
  try {
    logInfo(
      'Applying match results schema to database...',
      '正在向数据库应用比赛结果架构...'
    );

    // Read the schema file
    // 读取架构文件
    const schemaPath = path.join(__dirname, '../lib/match-results-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    // 执行架构
    await pool.query(schemaSQL);

    logSuccess(
      'Match results schema applied successfully!',
      '比赛结果架构应用成功！'
    );

    // Verify the new tables and columns
    // 验证新表和列
    await verifySchemaChanges();

  } catch (error) {
    logError(
      'Failed to apply match results schema',
      '应用比赛结果架构失败',
      error
    );
    throw error;
  } finally {
    await pool.end();
  }
}

// Verify schema changes
// 验证架构更改
async function verifySchemaChanges() {
  try {
    logInfo(
      'Verifying schema changes...',
      '验证架构更改...'
    );

    // Check if new columns were added to events table
    // 检查events表是否添加了新列
    const eventsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('match_result', 'team_a_score', 'team_b_score', 'result_announced_at', 'result_announced_by', 'match_completed_at', 'total_participants', 'total_stakes_amount', 'rewards_distributed', 'rewards_distributed_at')
      ORDER BY column_name
    `);

    if (eventsColumns.rows.length > 0) {
      logSuccess(
        `Found ${eventsColumns.rows.length} new columns in events table`,
        `在events表中找到${eventsColumns.rows.length}个新列`
      );
      eventsColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }

    // Check if new tables were created
    // 检查是否创建了新表
    const newTables = ['match_results', 'reward_distributions', 'match_result_announcements'];
    for (const tableName of newTables) {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [tableName]);

      if (tableExists.rows[0].exists) {
        logSuccess(
          `Table ${tableName} created successfully`,
          `表${tableName}创建成功`
        );
      } else {
        logError(
          `Table ${tableName} was not created`,
          `表${tableName}未创建`
        );
      }
    }

    // Check if new columns were added to athletes table
    // 检查athletes表是否添加了新列
    const athletesColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'athletes' 
      AND column_name IN ('matches_won', 'matches_lost', 'matches_drawn', 'current_ranking', 'ranking_points', 'last_match_date', 'win_rate', 'total_goals_scored', 'total_assists', 'total_yellow_cards', 'total_red_cards')
      ORDER BY column_name
    `);

    if (athletesColumns.rows.length > 0) {
      logSuccess(
        `Found ${athletesColumns.rows.length} new columns in athletes table`,
        `在athletes表中找到${athletesColumns.rows.length}个新列`
      );
      athletesColumns.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }

    // Check if functions were created
    // 检查是否创建了函数
    const functions = ['update_athlete_stats_after_match', 'calculate_event_rewards'];
    for (const funcName of functions) {
      const funcExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.routines 
          WHERE routine_name = $1
        )
      `, [funcName]);

      if (funcExists.rows[0].exists) {
        logSuccess(
          `Function ${funcName} created successfully`,
          `函数${funcName}创建成功`
        );
      } else {
        logError(
          `Function ${funcName} was not created`,
          `函数${funcName}未创建`
        );
      }
    }

    logSuccess(
      'Schema verification completed!',
      '架构验证完成！'
    );

  } catch (error) {
    logError(
      'Failed to verify schema changes',
      '验证架构更改失败',
      error
    );
    throw error;
  }
}

// Run the script
// 运行脚本
if (require.main === module) {
  applyMatchResultsSchema()
    .then(() => {
      console.log('✨ Schema application completed successfully');
      console.log('✨ 架构应用成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema application failed');
      console.error('💥 架构应用失败');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { applyMatchResultsSchema }; 