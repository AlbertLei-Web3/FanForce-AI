// Verify database update after API call
// 验证API调用后的数据库更新

const { Pool } = require('pg');

async function verifyDatabaseUpdate() {
  console.log('🔍 Verifying database update...');
  console.log('🔍 验证数据库更新...');

  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fanforce_ai',
    password: process.env.DB_PASSWORD || 'LYQ20000',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const client = await pool.connect();

    // Check events table
    // 检查events表
    console.log('\n📊 Checking events table...');
    console.log('📊 检查events表...');
    const eventResult = await client.query(`
      SELECT id, title, status, match_result, team_a_score, team_b_score, result_announced_at
      FROM events 
      WHERE id = '05d525b3-38bc-42f1-8a45-f7d16d0a46c5'
    `);
    
    if (eventResult.rows.length > 0) {
      const event = eventResult.rows[0];
      console.log('✅ Event updated successfully:');
      console.log('✅ 活动更新成功:');
      console.log('  Title:', event.title);
      console.log('  Status:', event.status);
      console.log('  Match Result:', event.match_result);
      console.log('  Team A Score:', event.team_a_score);
      console.log('  Team B Score:', event.team_b_score);
      console.log('  Result Announced At:', event.result_announced_at);
    } else {
      console.log('❌ Event not found');
      console.log('❌ 未找到活动');
    }

    // Check match_result_announcements table
    // 检查match_result_announcements表
    console.log('\n📢 Checking match_result_announcements table...');
    console.log('📢 检查match_result_announcements表...');
    const announcementResult = await client.query(`
      SELECT event_id, announced_by, match_result, team_a_score, team_b_score, 
             announcement_notes, created_at
      FROM match_result_announcements 
      WHERE event_id = '05d525b3-38bc-42f1-8a45-f7d16d0a46c5'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (announcementResult.rows.length > 0) {
      const announcement = announcementResult.rows[0];
      console.log('✅ Announcement logged successfully:');
      console.log('✅ 公告记录成功:');
      console.log('  Announced By:', announcement.announced_by);
      console.log('  Match Result:', announcement.match_result);
      console.log('  Team A Score:', announcement.team_a_score);
      console.log('  Team B Score:', announcement.team_b_score);
      console.log('  Notes:', announcement.announcement_notes);
      console.log('  Created At:', announcement.created_at);
    } else {
      console.log('❌ No announcement found');
      console.log('❌ 未找到公告记录');
    }

    // Check if there are any athletes for this event
    // 检查此活动是否有运动员
    console.log('\n🏃 Checking athletes for this event...');
    console.log('🏃 检查此活动的运动员...');
    const athleteResult = await client.query(`
      SELECT ep.user_id, ep.team_assignment, a.id as athlete_id
      FROM event_participants ep
      JOIN athletes a ON a.user_id = ep.user_id
      WHERE ep.event_id = '05d525b3-38bc-42f1-8a45-f7d16d0a46c5'
      AND ep.participation_type = 'athlete'
    `);
    
    if (athleteResult.rows.length > 0) {
      console.log('✅ Found athletes for this event:', athleteResult.rows.length);
      console.log('✅ 找到此活动的运动员:', athleteResult.rows.length);
      athleteResult.rows.forEach((athlete, index) => {
        console.log(`  Athlete ${index + 1}:`, athlete);
      });
    } else {
      console.log('❌ No athletes found for this event');
      console.log('❌ 此活动未找到运动员');
    }

    // Check if there are any audience stakes for this event
    // 检查此活动是否有观众质押
    console.log('\n👥 Checking audience stakes for this event...');
    console.log('👥 检查此活动的观众质押...');
    const stakeResult = await client.query(`
      SELECT user_id, stake_amount, participation_tier, status
      FROM user_stake_records 
      WHERE event_id = '05d525b3-38bc-42f1-8a45-f7d16d0a46c5'
      AND status = 'active'
    `);
    
    if (stakeResult.rows.length > 0) {
      console.log('✅ Found audience stakes for this event:', stakeResult.rows.length);
      console.log('✅ 找到此活动的观众质押:', stakeResult.rows.length);
      stakeResult.rows.forEach((stake, index) => {
        console.log(`  Stake ${index + 1}:`, stake);
      });
    } else {
      console.log('❌ No audience stakes found for this event');
      console.log('❌ 此活动未找到观众质押');
    }

    client.release();
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    console.error('❌ 数据库验证失败:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the verification
// 运行验证
if (require.main === module) {
  verifyDatabaseUpdate();
}

module.exports = { verifyDatabaseUpdate }; 