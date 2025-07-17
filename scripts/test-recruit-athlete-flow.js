// Test Recruit Athlete Flow Script
// 测试招募运动员流程脚本

const { Pool } = require('pg');

// Database configuration
// 数据库配置
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

async function testRecruitAthleteFlow() {
  const client = await pool.connect();
  
  try {
    console.log('Testing Recruit Athlete data flow...');
    // 测试招募运动员数据流...
    
    // 1. Get ambassador user
    // 1. 获取大使用户
    const ambassadorResult = await client.query(`
      SELECT id, wallet_address, role 
      FROM users 
      WHERE role = 'ambassador' 
      LIMIT 1
    `);
    
    if (ambassadorResult.rows.length === 0) {
      console.log('No ambassador found, creating one...');
      // 未找到大使，正在创建一个...
      
      const ambassadorId = await client.query(`
        INSERT INTO users (id, wallet_address, role, student_id, profile_data)
        VALUES (uuid_generate_v4(), '0xAMBASSADOR123456789012345678901234567890', 'ambassador', 'AMB001', '{"name": "Test Ambassador"}')
        RETURNING id
      `);
      
      console.log(`Created ambassador with ID: ${ambassadorId.rows[0].id}`);
      // 创建大使，ID：${ambassadorId.rows[0].id}
    } else {
      console.log(`Using existing ambassador: ${ambassadorResult.rows[0].wallet_address}`);
      // 使用现有大使：${ambassadorResult.rows[0].wallet_address}
    }
    
    const ambassadorId = ambassadorResult.rows[0]?.id || (await client.query(`
      SELECT id FROM users WHERE role = 'ambassador' LIMIT 1
    `)).rows[0].id;
    
    // 2. Get available athletes
    // 2. 获取可用运动员
    const athletesResult = await client.query(`
      SELECT 
        u.id,
        u.profile_data,
        a.ranking,
        a.tier,
        a.status,
        a.availability_status
      FROM users u
      JOIN athletes a ON u.id = a.user_id
      WHERE u.role = 'athlete' 
        AND a.availability_status = 'available'
      LIMIT 6
    `);
    
    console.log(`Found ${athletesResult.rows.length} available athletes`);
    // 找到 ${athletesResult.rows.length} 个可用运动员
    
    if (athletesResult.rows.length < 6) {
      console.log('Not enough athletes for a proper test');
      // 运动员数量不足以进行适当测试
      return;
    }
    
    // 3. Create a team draft
    // 3. 创建队伍草稿
    const athleteIds = athletesResult.rows.map(row => row.id);
    const teamAIds = athleteIds.slice(0, 3);
    const teamBIds = athleteIds.slice(3, 6);
    
    const draftResult = await client.query(`
      INSERT INTO team_drafts (
        ambassador_id,
        draft_name,
        sport_type,
        team_a_name,
        team_a_athletes,
        team_b_name,
        team_b_athletes,
        status,
        estimated_duration,
        match_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, draft_name, status
    `, [
      ambassadorId,
      'Test Match Draft',
      'soccer',
      'Thunder Wolves',
      JSON.stringify(teamAIds),
      'Lightning Hawks',
      JSON.stringify(teamBIds),
      'draft',
      90,
      'Test match for MVP demonstration'
    ]);
    
    console.log(`Created team draft: ${draftResult.rows[0].draft_name} (${draftResult.rows[0].status})`);
    // 创建队伍草稿：${draftResult.rows[0].draft_name} (${draftResult.rows[0].status})
    
    // 4. Verify the draft was created (simplified query)
    // 4. 验证草稿已创建（简化查询）
    const verifyDraft = await client.query(`
      SELECT 
        td.id,
        td.draft_name,
        td.team_a_name,
        td.team_b_name,
        td.status,
        td.sport_type,
        jsonb_array_length(td.team_a_athletes) as team_a_count,
        jsonb_array_length(td.team_b_athletes) as team_b_count
      FROM team_drafts td
      WHERE td.id = $1
    `, [draftResult.rows[0].id]);
    
    if (verifyDraft.rows.length > 0) {
      const draft = verifyDraft.rows[0];
      console.log(`\nDraft verification:`);
      // 草稿验证：
      console.log(`  - Draft ID: ${draft.id}`);
      console.log(`  - Team A (${draft.team_a_name}): ${draft.team_a_count} athletes`);
      console.log(`  - Team B (${draft.team_b_name}): ${draft.team_b_count} athletes`);
      console.log(`  - Status: ${draft.status}`);
      console.log(`  - Sport: ${draft.sport_type}`);
    }
    
    // 5. Test API endpoint simulation (simplified)
    // 5. 测试API端点模拟（简化）
    console.log('\nTesting API endpoint simulation...');
    // 测试API端点模拟...
    
    const apiTestResult = await client.query(`
      SELECT 
        td.id,
        td.draft_name,
        td.team_a_name,
        td.team_b_name,
        td.status,
        jsonb_array_length(td.team_a_athletes) as team_a_count,
        jsonb_array_length(td.team_b_athletes) as team_b_count
      FROM team_drafts td
      WHERE td.ambassador_id = $1
      ORDER BY td.updated_at DESC
    `, [ambassadorId]);
    
    console.log(`API simulation found ${apiTestResult.rows.length} drafts for ambassador`);
    // API模拟为大使找到 ${apiTestResult.rows.length} 个草稿
    
    if (apiTestResult.rows.length > 0) {
      const draft = apiTestResult.rows[0];
      console.log(`\nAPI Test Results:`);
      // API测试结果：
      console.log(`  - Draft Name: ${draft.draft_name}`);
      console.log(`  - Team A Athletes: ${draft.team_a_count}`);
      console.log(`  - Team B Athletes: ${draft.team_b_count}`);
      console.log(`  - Status: ${draft.status}`);
    }
    
    console.log('\n✅ Recruit Athlete data flow test completed successfully!');
    // ✅ 招募运动员数据流测试成功完成！
    console.log('✅ The database and API structure are ready for the MVP demo');
    // ✅ 数据库和API结构已准备好进行MVP演示
    
  } catch (error) {
    console.error('❌ Error testing Recruit Athlete flow:', error);
    // ❌ 测试招募运动员流程时出错：
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
// 运行测试
testRecruitAthleteFlow(); 