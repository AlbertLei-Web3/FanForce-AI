// Demo Data Initialization Script for FanForce AI MVP
// FanForce AI MVP演示数据初始化脚本
// This script creates realistic sample data for the 7-day demo deadline
// 此脚本为7天演示截止日期创建真实的示例数据

const { Pool } = require('pg');
require('dotenv').config();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Initialize Demo Data for MVP                      ║
║              初始化MVP演示数据                                  ║
║                                                               ║
║  Creating realistic sample data for 7-day demo               ║
║  为7天演示创建真实示例数据                                      ║
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

// Demo data templates / 演示数据模板
const demoUsers = [
  // Admin users / 管理员用户
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    role: 'admin',
    profile_data: {
      name: 'Sarah Administrator',
      email: 'admin@fanforce.ai',
      department: 'Sports Management',
      university: 'Tech University'
    },
    virtual_chz_balance: 10000.00,
    wallet_address: '0x1234567890123456789012345678901234567890'
  },
  
  // Ambassador users / 大使用户
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
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
    wallet_address: '0x2345678901234567890123456789012345678901'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
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
    wallet_address: '0x3456789012345678901234567890123456789012'
  },

  // Athlete users / 运动员用户
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
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
    wallet_address: '0x1010101010101010101010101010101010101010'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
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
    wallet_address: '0x1111111111111111111111111111111111111111'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
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
    wallet_address: '0x1212121212121212121212121212121212121212'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
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
    wallet_address: '0x1313131313131313131313131313131313131313'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
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
    wallet_address: '0x1414141414141414141414141414141414141414'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
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
    wallet_address: '0x1515151515151515151515151515151515151515'
  },

  // Basketball athletes / 篮球运动员
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
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
    wallet_address: '0x2020202020202020202020202020202020202020'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
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
    wallet_address: '0x2121212121212121212121212121212121212121'
  },

  // Audience users / 观众用户
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    role: 'audience',
    profile_data: {
      name: 'Alice Fan Smith',
      email: 'alice.smith@student.edu',
      studentId: 'AUD2024001',
      university: 'Tech University'
    },
    virtual_chz_balance: 850.25,
    wallet_address: '0x3030303030303030303030303030303030303030'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    role: 'audience',
    profile_data: {
      name: 'Bob Sports Brown',
      email: 'bob.brown@student.edu',
      studentId: 'AUD2024002',
      university: 'Tech University'
    },
    virtual_chz_balance: 650.50,
    wallet_address: '0x3131313131313131313131313131313131313131'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    role: 'audience',
    profile_data: {
      name: 'Carol Match Lee',
      email: 'carol.lee@student.edu',
      studentId: 'AUD2024003',
      university: 'Tech University'
    },
    virtual_chz_balance: 450.75,
    wallet_address: '0x3232323232323232323232323232323232323232'
  }
];

// Athlete-specific data / 运动员特定数据
const athleteData = [
  {
    user_id: '550e8400-e29b-41d4-a716-446655440010',
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
    user_id: '550e8400-e29b-41d4-a716-446655440011',
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
    user_id: '550e8400-e29b-41d4-a716-446655440012',
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
    user_id: '550e8400-e29b-41d4-a716-446655440013',
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
    user_id: '550e8400-e29b-41d4-a716-446655440014',
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
    user_id: '550e8400-e29b-41d4-a716-446655440015',
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
    user_id: '550e8400-e29b-41d4-a716-446655440020',
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
    user_id: '550e8400-e29b-41d4-a716-446655440021',
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

// Initialize database / 初始化数据库
async function initializeDemoData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting demo data initialization...');
    console.log('🚀 开始演示数据初始化...');
    
    await client.query('BEGIN');

    // 1. Insert users / 插入用户
    console.log('📝 Creating users...');
    console.log('📝 创建用户...');
    
    for (const user of demoUsers) {
      await client.query(`
        INSERT INTO users (id, role, profile_data, virtual_chz_balance, wallet_address, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          profile_data = $3,
          virtual_chz_balance = $4,
          updated_at = CURRENT_TIMESTAMP
        ON CONFLICT (wallet_address) DO UPDATE SET
          profile_data = $3,
          virtual_chz_balance = $4,
          updated_at = CURRENT_TIMESTAMP
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
    
    for (const athlete of athleteData) {
      await client.query(`
        INSERT INTO athletes (user_id, ranking, tier, status, matches_played, matches_won, availability_status, performance_stats, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          ranking = $2,
          tier = $3,
          status = $4,
          matches_played = $5,
          matches_won = $6,
          availability_status = $7,
          performance_stats = $8,
          updated_at = CURRENT_TIMESTAMP
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
        id: '650e8400-e29b-41d4-a716-446655440001',
        ambassador_id: '550e8400-e29b-41d4-a716-446655440002',
        draft_name: 'Championship Finals Teams',
        sport_type: 'soccer',
        team_a_name: 'Thunder Wolves',
        team_a_athletes: ['550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440013'],
        team_b_name: 'Lightning Hawks',
        team_b_athletes: ['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440015'],
        status: 'draft',
        estimated_duration: 90,
        match_notes: 'Championship final match between top teams'
      },
      {
        id: '650e8400-e29b-41d4-a716-446655440002',
        ambassador_id: '550e8400-e29b-41d4-a716-446655440003',
        draft_name: 'Basketball Showdown',
        sport_type: 'basketball',
        team_a_name: 'Storm Breakers',
        team_a_athletes: ['550e8400-e29b-41d4-a716-446655440020'],
        team_b_name: 'Fire Dragons',
        team_b_athletes: ['550e8400-e29b-41d4-a716-446655440021'],
        status: 'draft',
        estimated_duration: 40,
        match_notes: 'Exciting basketball match between rivals'
      }
    ];

    for (const draft of teamDrafts) {
      await client.query(`
        INSERT INTO team_drafts (id, ambassador_id, draft_name, sport_type, team_a_name, team_a_athletes, team_a_metadata, team_b_name, team_b_athletes, team_b_metadata, status, estimated_duration, match_notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          draft_name = $3,
          updated_at = CURRENT_TIMESTAMP
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
        id: '750e8400-e29b-41d4-a716-446655440001',
        ambassador_id: '550e8400-e29b-41d4-a716-446655440002',
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
        additional_notes: '650e8400-e29b-41d4-a716-446655440001',
        submission_notes: 'Championship match between Thunder Wolves and Lightning Hawks'
      },
      {
        id: '750e8400-e29b-41d4-a716-446655440002',
        ambassador_id: '550e8400-e29b-41d4-a716-446655440003',
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
        additional_notes: '650e8400-e29b-41d4-a716-446655440002',
        submission_notes: 'Exciting basketball rivalry match'
      }
    ];

    for (const event of eventApplications) {
      await client.query(`
        INSERT INTO event_applications (id, ambassador_id, event_title, sport_type, event_date, event_time, venue_name, venue_capacity, estimated_duration, party_venue_name, party_capacity, status, additional_notes, submission_notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          event_title = $3,
          status = $12,
          updated_at = CURRENT_TIMESTAMP
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
      ON CONFLICT (event_id) DO UPDATE SET
        pool_amount = $4,
        updated_at = CURRENT_TIMESTAMP
    `, [
      '850e8400-e29b-41d4-a716-446655440001',
      '750e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440001',
      2500.00,
      5.0,
      'completed',
      'Initial pool injection for championship finals'
    ]);

    // 6. Update event status to pre_match / 更新赛事状态为赛前
    await client.query(`
      UPDATE event_applications 
      SET status = 'pre_match', updated_at = CURRENT_TIMESTAMP
      WHERE id = '750e8400-e29b-41d4-a716-446655440001'
    `);

    // 7. Create sample audience stakes / 创建示例观众质押
    console.log('🎯 Creating audience stakes...');
    console.log('🎯 创建观众质押...');
    
    const audienceStakes = [
      {
        id: '950e8400-e29b-41d4-a716-446655440001',
        audience_id: '550e8400-e29b-41d4-a716-446655440030',
        event_id: '750e8400-e29b-41d4-a716-446655440001',
        tier_level: 2,
        stake_amount: 100.00,
        selected_team: 'A',
        team_name: 'Thunder Wolves',
        multiplier: 0.7,
        expected_reward: 75.00,
        status: 'confirmed'
      },
      {
        id: '950e8400-e29b-41d4-a716-446655440002',
        audience_id: '550e8400-e29b-41d4-a716-446655440031',
        event_id: '750e8400-e29b-41d4-a716-446655440001',
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
        ON CONFLICT (id) DO UPDATE SET
          stake_amount = $5,
          updated_at = CURRENT_TIMESTAMP
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
    console.log(`   • ${athleteData.length} athlete profiles with performance stats`);
    console.log(`   • ${teamDrafts.length} team drafts ready for selection`);
    console.log(`   • ${eventApplications.length} event applications (1 approved with CHZ pool)`);
    console.log(`   • ${audienceStakes.length} audience stakes for testing`);
    console.log('');
    console.log('🎮 Ready for MVP demo! You can now:');
    console.log('🎮 MVP演示准备就绪！你现在可以：');
    console.log('   1. Login as ambassador and see existing team drafts');
    console.log('   2. Login as admin and manage event applications');
    console.log('   3. Login as athlete and see competition status');
    console.log('   4. Login as audience and participate in staking');
    console.log('');
    console.log('🔑 Test wallet addresses:');
    console.log('🔑 测试钱包地址：');
    console.log('   Admin: 0x1234567890123456789012345678901234567890');
    console.log('   Ambassador 1: 0x2345678901234567890123456789012345678901');
    console.log('   Ambassador 2: 0x3456789012345678901234567890123456789012');
    console.log('   Athlete 1 (Alex): 0x1010101010101010101010101010101010101010');
    console.log('   Audience 1 (Alice): 0x3030303030303030303030303030303030303030');

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
initializeDemoData()
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