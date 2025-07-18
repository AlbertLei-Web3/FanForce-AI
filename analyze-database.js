// Comprehensive Database Analysis
// 全面数据库分析

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000',
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function analyzeDatabase() {
  try {
    console.log('🔍 开始全面分析数据库结构...');
    console.log('🔍 Starting comprehensive database analysis...\n');

    // 1. 获取所有表名
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📋 数据库中的所有表 / All tables in database:');
    tablesResult.rows.forEach((table, index) => {
      console.log(`  ${index + 1}. ${table.table_name}`);
    });
    console.log('');

    // 2. 详细分析每个表
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n🔍 分析表: ${tableName}`);
      console.log(`🔍 Analyzing table: ${tableName}`);

      // 获取表结构
      const structureResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log('📋 表结构 / Table structure:');
      structureResult.rows.forEach(row => {
        const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const maxLength = row.character_maximum_length ? `(${row.character_maximum_length})` : '';
        console.log(`  - ${row.column_name}: ${row.data_type}${maxLength} ${nullable}`);
        if (row.column_default) {
          console.log(`    Default: ${row.column_default}`);
        }
      });

      // 获取记录数
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`📊 记录数 / Record count: ${countResult.rows[0].count}`);

      // 获取示例数据
      const sampleResult = await pool.query(`SELECT * FROM ${tableName} LIMIT 3`);
      if (sampleResult.rows.length > 0) {
        console.log('📊 示例数据 / Sample data:');
        sampleResult.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${JSON.stringify(row, null, 2)}`);
        });
      }
      console.log('');
    }

    // 3. 分析外键关系
    console.log('🔗 外键关系分析 / Foreign Key Analysis:');
    const foreignKeysResult = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name, kcu.column_name;
    `);

    if (foreignKeysResult.rows.length > 0) {
      foreignKeysResult.rows.forEach(row => {
        console.log(`  ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('  没有发现外键关系 / No foreign keys found');
    }
    console.log('');

    // 4. 分析索引
    console.log('📈 索引分析 / Index Analysis:');
    const indexesResult = await pool.query(`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `);

    indexesResult.rows.forEach(row => {
      console.log(`  ${row.tablename}.${row.indexname}: ${row.indexdef}`);
    });
    console.log('');

    // 5. 用户角色分布
    console.log('👥 用户角色分布 / User Role Distribution:');
    const rolesResult = await pool.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC;
    `);

    rolesResult.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count} 用户 / users`);
    });
    console.log('');

    // 6. 数据统计摘要
    console.log('📊 数据统计摘要 / Data Statistics Summary:');
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`  ${tableName}: ${countResult.rows[0].count} 条记录 / records`);
    }

  } catch (error) {
    console.error('❌ 数据库分析失败 / Database analysis failed:', error.message);
    console.error('❌ Error details:', error);
  } finally {
    await pool.end();
  }
}

analyzeDatabase(); 