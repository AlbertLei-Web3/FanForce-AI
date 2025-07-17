// Clean and Initialize Demo Data Script for FanForce AI MVP
// FanForce AI MVP清理并初始化演示数据脚本
// This script cleans existing demo data and creates fresh sample data
// 此脚本清理现有演示数据并创建新的示例数据

const { Pool } = require('pg');
require('dotenv').config();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Clean & Initialize Demo Data                      ║
║              清理并初始化演示数据                                ║
║                                                               ║
║  Fresh start with realistic sample data for 7-day demo       ║
║  为7天演示重新开始，使用真实示例数据                             ║
╚════════════════════════════════════════════════════════════════╝
`);

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost', 
  database: process.env.DB_NAME || 'fanforce_ai',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Demo data with unique IDs and wallet addresses / 使用唯一ID和钱包地址的演示数据
const demoUsers = [
  // Admin users / 管理员用户
  {
    id: 'a550e840-e29b-41d4-a716-446655440001',
    role: 'admin',
    profile_data: {
      name: 'Sarah Administrator',
      email: 'admin@fanforce.ai',
      department: 'Sports Management',
      university: 'Tech University'
    },
    virtual_chz_balance: 10000.00,
    wallet_address: '0xa234567890123456789012345678901234567890'
  },
  
  // Ambassador users / 大使用户
  {
    id: 'b550e840-e29b-41d4-a716-446655440002',
    role: 'ambassador',
    profile_data: {
      name: 'Mike Ambassador Chen',
      email: 'mike.chen@student.edu',
      studentId: 'AMB2024001',
      contact: '@mikec_sports',
      university: 'Tech University',
      department: 'Sports Management'
    },
    virtual_chz_balance: 1500.00,
    wallet_address: '0xb345678901234567890123456789012345678901'
  },
  {
    id: 'c550e840-e29b-41d4-a716-446655440003',
    role: 'ambassador',
    profile_data: {
      name: 'Lisa Ambassador Wang',
      email: 'lisa.wang@student.edu',
      studentId: 'AMB2024002',
      contact: '@lisaw_events',
      university: 'Tech University',
      department: 'Event Management'
    },
    virtual_chz_balance: 1200.00,
    wallet_address: '0xc456789012345678901234567890123456789012'
  },

  // Athlete users / 运动员用户
  {
    id: 'd550e840-e29b-41d4-a716-446655440010',
    role: 'athlete',
    profile_data: {
      name: 'Alex Thunder Johnson',
      email: 'alex.johnson@student.edu',
      sport: 'Soccer',
      position: 'Forward',
      year: 'Junior',
      studentId: 'ATH2024001'
    },
    virtual_chz_balance: 320.75,
    wallet_address: '0xd010101010101010101010101010101010101010'
  },
  {
    id: 'e550e840-e29b-41d4-a716-446655440011',
    role: 'athlete',
    profile_data: {
      name: 'Maria Lightning Rodriguez',
      email: 'maria.rodriguez@student.edu',
      sport: 'Soccer',
      position: 'Midfielder',
      year: 'Senior',
      studentId: 'ATH2024002'
    },
    virtual_chz_balance: 485.20,
    wallet_address: '0xe111111111111111111111111111111111111111'
  },
  {
    id: 'f550e840-e29b-41d4-a716-446655440012',
    role: 'athlete',
    profile_data: {
      name: 'James Storm Wilson',
      email: 'james.wilson@student.edu',
      sport: 'Soccer',
      position: 'Defender',
      year: 'Sophomore',
      studentId: 'ATH2024003'
    },
    virtual_chz_balance: 210.30,
    wallet_address: '0xf212121212121212121212121212121212121212'
  },
  {
    id: 'g550e840-e29b-41d4-a716-446655440013',
    role: 'athlete',
    profile_data: {
      name: 'Emma Fire Chen',
      email: 'emma.chen@student.edu',
      sport: 'Soccer',
      position: 'Goalkeeper',
      year: 'Junior',
      studentId: 'ATH2024004'
    },
    virtual_chz_balance: 390.45,
    wallet_address: '0xg313131313131313131313131313131313131313'
  },
  {
    id: 'h550e840-e29b-41d4-a716-446655440014',
    role: 'athlete',
    profile_data: {
      name: 'David Bolt Kim',
      email: 'david.kim@student.edu',
      sport: 'Soccer',
      position: 'Forward',
      year: 'Senior',
      studentId: 'ATH2024005'
    },
    virtual_chz_balance: 275.80,
    wallet_address: '0xh414141414141414141414141414141414141414'
  },
  {
    id: 'i550e840-e29b-41d4-a716-446655440015',
    role: 'athlete',
    profile_data: {
      name: 'Sophie Rocket Davis',
      email: 'sophie.davis@student.edu',
      sport: 'Soccer',
      position: 'Midfielder',
      year: 'Freshman',
      studentId: 'ATH2024006'
    },
    virtual_chz_balance: 195.60,
    wallet_address: '0xi515151515151515151515151515151515151515'
  },

  // Basketball athletes / 篮球运动员
  {
    id: 'j550e840-e29b-41d4-a716-446655440020',
    role: 'athlete',
    profile_data: {
      name: 'Marcus Beast Thompson',
      email: 'marcus.thompson@student.edu',
      sport: 'Basketball',
      position: 'Center',
      year: 'Senior',
      studentId: 'ATH2024007'
    },
    virtual_chz_balance: 420.90,
    wallet_address: '0xj020202020202020202020202020202020202020'
  },
  {
    id: 'k550e840-e29b-41d4-a716-446655440021',
    role: 'athlete',
    profile_data: {
      name: 'Zoe Flash Parker',
      email: 'zoe.parker@student.edu',
      sport: 'Basketball',
      position: 'Guard',
      year: 'Junior',
      studentId: 'ATH2024008'
    },
    virtual_chz_balance: 315.25,
    wallet_address: '0xk121212121212121212121212121212121212121'
  },

  // Audience users / 观众用户
  {
    id: 'l550e840-e29b-41d4-a716-446655440030',
    role: 'audience',
    profile_data: {
      name: 'Alice Fan Smith',
      email: 'alice.smith@student.edu',
      studentId: 'AUD2024001',
      university: 'Tech University'
    },
    virtual_chz_balance: 850.25,
    wallet_address: '0xl030303030303030303030303030303030303030'
  },
  {
    id: 'm550e840-e29b-41d4-a716-446655440031',
    role: 'audience',
    profile_data: {
      name: 'Bob Sports Brown',
      email: 'bob.brown@student.edu',
      studentId: 'AUD2024002',
      university: 'Tech University'
    },
    virtual_chz_balance: 650.50,
    wallet_address: '0xm131313131313131313131313131313131313131'
  },
  {
    id: 'n550e840-e29b-41d4-a716-446655440032',
    role: 'audience',
    profile_data: {
      name: 'Carol Match Lee',
      email: 'carol.lee@student.edu',
      studentId: 'AUD2024003',
      university: 'Tech University'
    },
    virtual_chz_balance: 450.75,
    wallet_address: '0xn232323232323232323232323232323232323232'
  }
];

// Clean and initialize database / 清理并初始化数据库
async function cleanAndInitializeDemoData() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Cleaning existing demo data...');
    console.log('🧹 清理现有演示数据...');
    
    await client.query('BEGIN');

    // Clean existing data (in reverse order of dependencies) / 清理现有数据（按依赖关系逆序）
    console.log('🗑️ Removing existing data...');
    console.log('🗑️ 删除现有数据...');
    
    await client.query('DELETE FROM audience_stakes');
    await client.query('DELETE FROM match_results');
    await client.query('DELETE FROM chz_pool_injections');
    await client.query('DELETE FROM event_athlete_selections');
    await client.query('DELETE FROM event_applications');
    await client.query('DELETE FROM team_drafts');
    await client.query('DELETE FROM athletes');
    await client.query('DELETE FROM users WHERE role IN (\'admin\', \'ambassador\', \'athlete\', \'audience\')');

    console.log('🚀 Starting fresh data initialization...');
    console.log('🚀 开始新数据初始化...');

    // 1. Insert users / 插入用户
    console.log('📝 Creating users...');
    console.log('📝 创建用户...');
    
    for (const user of demoUsers) {
      await client.query(`
        INSERT INTO users (id, role, profile_data, virtual_chz_balance, wallet_address, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        user.id,
        user.role,
        JSON.stringify(user.profile_data),
        user.virtual_chz_balance,
        user.wallet_address
      ]);
    }

    // 2. Insert athletes / 插入运动员
    console.log('🏃‍♂️ Creating athlete profiles...');
    console.log('🏃‍♂️ 创建运动员档案...');
    
    const athleteData = [
      {
        user_id: 'd550e840-e29b-41d4-a716-446655440010',
        ranking: 8.5,
        tier: 'gold',
        status: 'active',
        matches_played: 15,
        matches_won: 11,
        availability_status: 'available',
        performance_stats: {
          goals: 12,
          assists: 8,
          yellow_cards: 2,
          season_performance: 'excellent'
        }
      },
      {
        user_id: 'e550e840-e29b-41d4-a716-446655440011',
        ranking: 9.2,
        tier: 'platinum',
        status: 'active',
        matches_played: 22,
        matches_won: 15,
        availability_status: 'available',
        performance_stats: {
          goals: 8,
          assists: 18,
          yellow_cards: 1,
          season_performance: 'outstanding'
        }
      },
      {
        user_id: 'f550e840-e29b-41d4-a716-446655440012',
        ranking: 7.8,
        tier: 'silver',
        status: 'active',
        matches_played: 18,
        matches_won: 12,
        availability_status: 'available',
        performance_stats: {
          goals: 2,
          assists: 5,
          yellow_cards: 3,
          defensive_actions: 45
        }
      },
      {
        user_id: 'g550e840-e29b-41d4-a716-446655440013',
        ranking: 8.9,
        tier: 'gold',
        status: 'active',
        matches_played: 20,
        matches_won: 14,
        availability_status: 'available',
        performance_stats: {
          saves: 89,
          goals_conceded: 12,
          clean_sheets: 8,
          season_performance: 'excellent'
        }
      },
      {
        user_id: 'h550e840-e29b-41d4-a716-446655440014',
        ranking: 8.1,
        tier: 'gold',
        status: 'active',
        matches_played: 19,
        matches_won: 13,
        availability_status: 'available',
        performance_stats: {
          goals: 15,
          assists: 6,
          yellow_cards: 4,
          season_performance: 'very_good'
        }
      },
      {
        user_id: 'i550e840-e29b-41d4-a716-446655440015',
        ranking: 6.5,
        tier: 'bronze',
        status: 'active',
        matches_played: 8,
        matches_won: 4,
        availability_status: 'available',
        performance_stats: {
          goals: 3,
          assists: 7,
          yellow_cards: 1,
          season_performance: 'promising'
        }
      },
      {
        user_id: 'j550e840-e29b-41d4-a716-446655440020',
        ranking: 9.0,
        tier: 'platinum',
        status: 'active',
        matches_played: 25,
        matches_won: 18,
        availability_status: 'available',
        performance_stats: {
          points: 245,
          rebounds: 180,
          blocks: 45,
          season_performance: 'outstanding'
        }
      },
      {
        user_id: 'k550e840-e29b-41d4-a716-446655440021',
        ranking: 8.3,
        tier: 'gold',
        status: 'active',
        matches_played: 20,
        matches_won: 14,
        availability_status: 'available',
        performance_stats: {
          points: 180,
          assists: 95,
          steals: 35,
          season_performance: 'excellent'
        }
      }
    ];
    
    for (const athlete of athleteData) {
      await client.query(`
        INSERT INTO athletes (user_id, ranking, tier, status, matches_played, matches_won, availability_status, performance_stats, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        athlete.user_id,
        athlete.ranking,
        athlete.tier,
        athlete.status,
        athlete.matches_played,
        athlete.matches_won,
        athlete.availability_status,
        JSON.stringify(athlete.performance_stats)
      ]);
    }

    // 3. Create sample team drafts / 创建示例队伍草稿
    console.log('⚽ Creating team drafts...');
    console.log('⚽ 创建队伍草稿...');
    
    const teamDrafts = [
      {
        id: 'td1e8400-e29b-41d4-a716-446655440001',
        ambassador_id: 'b550e840-e29b-41d4-a716-446655440002',
        draft_name: 'Championship Finals Teams',
        sport_type: 'soccer',
        team_a_name: 'Thunder Wolves',
        team_a_athletes: ['d550e840-e29b-41d4-a716-446655440010', 'f550e840-e29b-41d4-a716-446655440012', 'g550e840-e29b-41d4-a716-446655440013'],
        team_b_name: 'Lightning Hawks',
        team_b_athletes: ['e550e840-e29b-41d4-a716-446655440011', 'h550e840-e29b-41d4-a716-446655440014', 'i550e840-e29b-41d4-a716-446655440015'],
        status: 'draft',
        estimated_duration: 90,
        match_notes: 'Championship final match between top teams'
      },
      {
        id: 'td2e8400-e29b-41d4-a716-446655440002',
        ambassador_id: 'c550e840-e29b-41d4-a716-446655440003',
        draft_name: 'Basketball Showdown',
        sport_type: 'basketball',
        team_a_name: 'Storm Breakers',
        team_a_athletes: ['j550e840-e29b-41d4-a716-446655440020'],
        team_b_name: 'Fire Dragons',
        team_b_athletes: ['k550e840-e29b-41d4-a716-446655440021'],
        status: 'draft',
        estimated_duration: 40,
        match_notes: 'Exciting basketball match between rivals'
      }
    ];

    for (const draft of teamDrafts) {
      await client.query(`
        INSERT INTO team_drafts (id, ambassador_id, draft_name, sport_type, team_a_name, team_a_athletes, team_a_metadata, team_b_name, team_b_athletes, team_b_metadata, status, estimated_duration, match_notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        draft.id,
        draft.ambassador_id,
        draft.draft_name,
        draft.sport_type,
        draft.team_a_name,
        JSON.stringify(draft.team_a_athletes),
        JSON.stringify({}),
        draft.team_b_name,
        JSON.stringify(draft.team_b_athletes),
        JSON.stringify({}),
        draft.status,
        draft.estimated_duration,
        draft.match_notes
      ]);
    }

    // 4. Create sample event applications / 创建示例赛事申请
    console.log('📋 Creating event applications...');
    console.log('📋 创建赛事申请...');
    
    const eventApplications = [
      {
        id: 'ea1e8400-e29b-41d4-a716-446655440001',
        ambassador_id: 'b550e840-e29b-41d4-a716-446655440002',
        event_title: 'Campus Soccer Championship Finals',
        sport_type: 'soccer',
        event_date: '2024-01-25',
        event_time: '15:00',
        venue_name: 'Main Soccer Field',
        venue_capacity: 500,
        estimated_duration: 90,
        party_venue_name: 'Student Center Rooftop',
        party_capacity: 80,
        status: 'approved',
        additional_notes: 'td1e8400-e29b-41d4-a716-446655440001',
        submission_notes: 'Championship match between Thunder Wolves and Lightning Hawks'
      },
      {
        id: 'ea2e8400-e29b-41d4-a716-446655440002',
        ambassador_id: 'c550e840-e29b-41d4-a716-446655440003',
        event_title: 'Basketball Derby Match',
        sport_type: 'basketball',
        event_date: '2024-01-22',
        event_time: '18:00',
        venue_name: 'Sports Arena',
        venue_capacity: 300,
        estimated_duration: 40,
        party_venue_name: 'Sports Bar',
        party_capacity: 50,
        status: 'pending',
        additional_notes: 'td2e8400-e29b-41d4-a716-446655440002',
        submission_notes: 'Exciting basketball rivalry match'
      }
    ];

    for (const event of eventApplications) {
      await client.query(`
        INSERT INTO event_applications (id, ambassador_id, event_title, sport_type, event_date, event_time, venue_name, venue_capacity, estimated_duration, party_venue_name, party_capacity, status, additional_notes, submission_notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        event.id,
        event.ambassador_id,
        event.event_title,
        event.sport_type,
        event.event_date,
        event.event_time,
        event.venue_name,
        event.venue_capacity,
        event.estimated_duration,
        event.party_venue_name,
        event.party_capacity,
        event.status,
        event.additional_notes,
        event.submission_notes
      ]);
    }

    // 5. Create CHZ pool injections for approved events / 为已批准的赛事创建CHZ奖池注入
    console.log('💰 Creating CHZ pool injections...');
    console.log('💰 创建CHZ奖池注入...');
    
    await client.query(`
      INSERT INTO chz_pool_injections (id, event_id, admin_id, pool_amount, fee_percentage, injection_status, injection_notes, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      'cp1e8400-e29b-41d4-a716-446655440001',
      'ea1e8400-e29b-41d4-a716-446655440001',
      'a550e840-e29b-41d4-a716-446655440001',
      2500.00,
      5.0,
      'completed',
      'Initial pool injection for championship finals'
    ]);

    // 6. Update event status to pre_match / 更新赛事状态为赛前
    await client.query(`
      UPDATE event_applications 
      SET status = 'pre_match', updated_at = CURRENT_TIMESTAMP
      WHERE id = 'ea1e8400-e29b-41d4-a716-446655440001'
    `);

    // 7. Create sample audience stakes / 创建示例观众质押
    console.log('🎯 Creating audience stakes...');
    console.log('🎯 创建观众质押...');
    
    const audienceStakes = [
      {
        id: 'as1e8400-e29b-41d4-a716-446655440001',
        audience_id: 'l550e840-e29b-41d4-a716-446655440030',
        event_id: 'ea1e8400-e29b-41d4-a716-446655440001',
        tier_level: 2,
        stake_amount: 100.00,
        selected_team: 'A',
        team_name: 'Thunder Wolves',
        multiplier: 0.7,
        expected_reward: 75.00,
        status: 'confirmed'
      },
      {
        id: 'as2e8400-e29b-41d4-a716-446655440002',
        audience_id: 'm550e840-e29b-41d4-a716-446655440031',
        event_id: 'ea1e8400-e29b-41d4-a716-446655440001',
        tier_level: 1,
        stake_amount: 150.00,
        selected_team: 'B',
        team_name: 'Lightning Hawks',
        multiplier: 1.0,
        expected_reward: 120.00,
        status: 'confirmed'
      }
    ];

    for (const stake of audienceStakes) {
      await client.query(`
        INSERT INTO audience_stakes (id, audience_id, event_id, tier_level, stake_amount, selected_team, team_name, multiplier, expected_reward, status, qr_checkin_required, qr_checkin_completed, party_access, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        stake.id,
        stake.audience_id,
        stake.event_id,
        stake.tier_level,
        stake.stake_amount,
        stake.selected_team,
        stake.team_name,
        stake.multiplier,
        stake.expected_reward,
        stake.status,
        stake.tier_level <= 2,
        false,
        stake.tier_level === 1
      ]);
    }

    // 8. Deduct stake amounts from audience balances / 从观众余额中扣除质押金额
    for (const stake of audienceStakes) {
      await client.query(`
        UPDATE users 
        SET virtual_chz_balance = virtual_chz_balance - $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [stake.stake_amount, stake.audience_id]);
    }

    await client.query('COMMIT');
    
    console.log('✅ Demo data initialization completed successfully!');
    console.log('✅ 演示数据初始化成功完成！');
    console.log('');
    console.log('📊 Created demo data summary:');
    console.log('📊 创建的演示数据摘要：');
    console.log(`   • ${demoUsers.length} users (${demoUsers.filter(u => u.role === 'admin').length} admin, ${demoUsers.filter(u => u.role === 'ambassador').length} ambassadors, ${demoUsers.filter(u => u.role === 'athlete').length} athletes, ${demoUsers.filter(u => u.role === 'audience').length} audience)`);
    console.log(`   • 8 athlete profiles with performance stats`);
    console.log(`   • 2 team drafts ready for selection`);
    console.log(`   • 2 event applications (1 approved with CHZ pool)`);
    console.log(`   • 2 audience stakes for testing`);
    console.log('');
    console.log('🎮 Ready for MVP demo! You can now:');
    console.log('🎮 MVP演示准备就绪！你现在可以：');
    console.log('   1. Login as ambassador and see existing team drafts');
    console.log('   2. Login as admin and manage event applications');
    console.log('   3. Login as athlete and see competition status');
    console.log('   4. Login as audience and participate in staking');
    console.log('');
    console.log('🔑 Test wallet addresses for demo:');
    console.log('🔑 演示测试钱包地址：');
    console.log('   Admin (Sarah): 0xa234567890123456789012345678901234567890');
    console.log('   Ambassador 1 (Mike): 0xb345678901234567890123456789012345678901');
    console.log('   Ambassador 2 (Lisa): 0xc456789012345678901234567890123456789012');
    console.log('   Athlete 1 (Alex): 0xd010101010101010101010101010101010101010');
    console.log('   Athlete 2 (Maria): 0xe111111111111111111111111111111111111111');
    console.log('   Audience 1 (Alice): 0xl030303030303030303030303030303030303030');
    console.log('   Audience 2 (Bob): 0xm131313131313131313131313131313131313131');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing demo data:', error);
    console.error('❌ 初始化演示数据错误:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization / 运行初始化
cleanAndInitializeDemoData()
  .then(() => {
    console.log('🎉 Demo data initialization script completed!');
    console.log('🎉 演示数据初始化脚本完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Demo data initialization failed:', error);
    console.error('💥 演示数据初始化失败:', error);
    process.exit(1);
  }); 