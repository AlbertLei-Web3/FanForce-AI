// Verify database update for the new event
// 验证新活动的数据库更新

const { Pool } = require('pg');

async function verifyNewEventUpdate() {
  console.log('🔍 Verifying database update for new event...');
  console.log('🔍 验证新活动的数据库更新...');

  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'fanforce_ai',
    password: process.env.DB_PASSWORD || 'LYQ20000',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const client = await pool.connect();

    // Check events table for new event
    // 检查新活动的events表
    console.log('\n📊 Checking events table for new event...');
    console.log('📊 检查新活动的events表...');
    const eventResult = await client.query(`
      SELECT id, title, status, match_result, team_a_score, team_b_score, result_announced_at
      FROM events 
      WHERE id = '9b33b55c-c09e-41b9-b031-1c8680dd636a'
    `);
    
    if (eventResult.rows.length > 0) {
      const event = eventResult.rows[0];
      console.log('✅ New event updated successfully:');
      console.log('✅ 新活动更新成功:');
      console.log('  Title:', event.title);
      console.log('  Status:', event.status);
      console.log('  Match Result:', event.match_result);
      console.log('  Team A Score:', event.team_a_score);
      console.log('  Team B Score:', event.team_b_score);
      console.log('  Result Announced At:', event.result_announced_at);
    } else {
      console.log('❌ New event not found');
      console.log('❌ 未找到新活动');
    }

    // Check match_result_announcements table
    // 检查match_result_announcements表
    console.log('\n📢 Checking match_result_announcements for new event...');
    console.log('📢 检查新活动的match_result_announcements...');
    const announcementResult = await client.query(`
      SELECT event_id, announced_by, match_result, team_a_score, team_b_score, 
             announcement_notes, created_at
      FROM match_result_announcements 
      WHERE event_id = '9b33b55c-c09e-41b9-b031-1c8680dd636a'
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    if (announcementResult.rows.length > 0) {
      const announcement = announcementResult.rows[0];
      console.log('✅ Announcement logged successfully for new event:');
      console.log('✅ 新活动的公告记录成功:');
      console.log('  Announced By:', announcement.announced_by);
      console.log('  Match Result:', announcement.match_result);
      console.log('  Team A Score:', announcement.team_a_score);
      console.log('  Team B Score:', announcement.team_b_score);
      console.log('  Notes:', announcement.announcement_notes);
      console.log('  Created At:', announcement.created_at);
    } else {
      console.log('❌ No announcement found for new event');
      console.log('❌ 新活动未找到公告记录');
    }

    // Check reward distributions for this event
    // 检查此活动的奖励分配
    console.log('\n💰 Checking reward distributions for new event...');
    console.log('💰 检查新活动的奖励分配...');
    const rewardResult = await client.query(`
      SELECT user_id, event_id, original_stake_amount, user_tier_coefficient, 
             base_reward, platform_fee_amount, final_reward, distribution_status
      FROM reward_distributions 
      WHERE event_id = '9b33b55c-c09e-41b9-b031-1c8680dd636a'
      ORDER BY final_reward DESC
    `);
    
    if (rewardResult.rows.length > 0) {
      console.log('✅ Found reward distributions for new event:', rewardResult.rows.length);
      console.log('✅ 找到新活动的奖励分配:', rewardResult.rows.length);
      rewardResult.rows.forEach((reward, index) => {
        console.log(`  Reward ${index + 1}:`, {
          userId: reward.user_id,
          originalStakeAmount: reward.original_stake_amount,
          tierCoefficient: reward.user_tier_coefficient,
          baseReward: reward.base_reward,
          platformFee: reward.platform_fee_amount,
          finalReward: reward.final_reward,
          status: reward.distribution_status
        });
      });
    } else {
      console.log('❌ No reward distributions found for new event');
      console.log('❌ 新活动未找到奖励分配');
    }

    // Check audience stakes for this event
    // 检查此活动的观众质押
    console.log('\n👥 Checking audience stakes for new event...');
    console.log('👥 检查新活动的观众质押...');
    const stakeResult = await client.query(`
      SELECT user_id, stake_amount, participation_tier, status, created_at
      FROM user_stake_records 
      WHERE event_id = '9b33b55c-c09e-41b9-b031-1c8680dd636a'
      AND status = 'active'
      ORDER BY stake_amount DESC
    `);
    
    if (stakeResult.rows.length > 0) {
      console.log('✅ Found audience stakes for new event:', stakeResult.rows.length);
      console.log('✅ 找到新活动的观众质押:', stakeResult.rows.length);
      stakeResult.rows.forEach((stake, index) => {
        console.log(`  Stake ${index + 1}:`, {
          userId: stake.user_id,
          stakeAmount: stake.stake_amount,
          tier: stake.participation_tier,
          status: stake.status,
          createdAt: stake.created_at
        });
      });
    } else {
      console.log('❌ No audience stakes found for new event');
      console.log('❌ 新活动未找到观众质押');
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
  verifyNewEventUpdate();
}

module.exports = { verifyNewEventUpdate }; 