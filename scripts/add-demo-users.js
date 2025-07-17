// Add Demo Users Script for FanForce AI MVP
// FanForce AI MVP添加演示用户脚本
// This script safely adds demo users without deleting existing data
// 此脚本安全地添加演示用户而不删除现有数据

const { Pool } = require('pg');
require('dotenv').config();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Add Demo Users for MVP Demo                       ║
║              为MVP演示添加演示用户                               ║
║                                                               ║
║  Safely adding demo users for testing                        ║
║  安全地添加演示用户进行测试                                      ║
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

async function addDemoUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting demo user addition...');
    console.log('🚀 开始添加演示用户...');
    
    await client.query('BEGIN');

         // Demo users data / 演示用户数据
     const demoUsers = [
       // Admin
       {
         id: '11111111-1111-1111-1111-111111111111',
         role: 'admin',
         profile_data: JSON.stringify({
           name: 'Sarah Administrator',
           email: 'admin@fanforce.ai',
           department: 'Sports Management'
         }),
         virtual_chz_balance: 10000.00,
         wallet_address: '0xADMIN1234567890123456789012345678901234'
       },
       
       // Ambassadors
       {
         id: '22222222-2222-2222-2222-222222222222',
         role: 'ambassador',
         profile_data: JSON.stringify({
           name: 'Mike Ambassador Chen',
           email: 'mike.chen@student.edu',
           studentId: 'AMB2024001',
           contact: '@mikec_sports',
           university: 'Tech University'
         }),
         virtual_chz_balance: 1500.00,
         wallet_address: '0xAMB11234567890123456789012345678901234'
       },
       {
         id: '33333333-3333-3333-3333-333333333333',
         role: 'ambassador',
         profile_data: JSON.stringify({
           name: 'Lisa Ambassador Wang',
           email: 'lisa.wang@student.edu',
           studentId: 'AMB2024002',
           contact: '@lisaw_events',
           university: 'Tech University'
         }),
         virtual_chz_balance: 1200.00,
         wallet_address: '0xAMB21234567890123456789012345678901234'
       },

       // Athletes - Soccer
       {
         id: '44444444-4444-4444-4444-444444444444',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'Alex Thunder Johnson',
           email: 'alex.johnson@student.edu',
           sport: 'Soccer',
           position: 'Forward',
           year: 'Junior',
           studentId: 'ATH2024001'
         }),
         virtual_chz_balance: 320.75,
         wallet_address: '0xATH11234567890123456789012345678901234'
       },
       {
         id: '55555555-5555-5555-5555-555555555555',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'Maria Lightning Rodriguez',
           email: 'maria.rodriguez@student.edu',
           sport: 'Soccer',
           position: 'Midfielder',
           year: 'Senior',
           studentId: 'ATH2024002'
         }),
         virtual_chz_balance: 485.20,
         wallet_address: '0xATH21234567890123456789012345678901234'
       },
       {
         id: '66666666-6666-6666-6666-666666666666',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'James Storm Wilson',
           email: 'james.wilson@student.edu',
           sport: 'Soccer',
           position: 'Defender',
           year: 'Sophomore',
           studentId: 'ATH2024003'
         }),
         virtual_chz_balance: 210.30,
         wallet_address: '0xATH31234567890123456789012345678901234'
       },
       {
         id: '77777777-7777-7777-7777-777777777777',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'Emma Fire Chen',
           email: 'emma.chen@student.edu',
           sport: 'Soccer',
           position: 'Goalkeeper',
           year: 'Junior',
           studentId: 'ATH2024004'
         }),
         virtual_chz_balance: 390.45,
         wallet_address: '0xATH41234567890123456789012345678901234'
       },
       {
         id: '88888888-8888-8888-8888-888888888888',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'David Bolt Kim',
           email: 'david.kim@student.edu',
           sport: 'Soccer',
           position: 'Forward',
           year: 'Senior',
           studentId: 'ATH2024005'
         }),
         virtual_chz_balance: 275.80,
         wallet_address: '0xATH51234567890123456789012345678901234'
       },
       {
         id: '99999999-9999-9999-9999-999999999999',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'Sophie Rocket Davis',
           email: 'sophie.davis@student.edu',
           sport: 'Soccer',
           position: 'Midfielder',
           year: 'Freshman',
           studentId: 'ATH2024006'
         }),
         virtual_chz_balance: 195.60,
         wallet_address: '0xATH61234567890123456789012345678901234'
       },

       // Athletes - Basketball
       {
         id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'Marcus Beast Thompson',
           email: 'marcus.thompson@student.edu',
           sport: 'Basketball',
           position: 'Center',
           year: 'Senior',
           studentId: 'ATH2024007'
         }),
         virtual_chz_balance: 420.90,
         wallet_address: '0xATH71234567890123456789012345678901234'
       },
       {
         id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
         role: 'athlete',
         profile_data: JSON.stringify({
           name: 'Zoe Flash Parker',
           email: 'zoe.parker@student.edu',
           sport: 'Basketball',
           position: 'Guard',
           year: 'Junior',
           studentId: 'ATH2024008'
         }),
         virtual_chz_balance: 315.25,
         wallet_address: '0xATH81234567890123456789012345678901234'
       },

       // Audience members
       {
         id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
         role: 'audience',
         profile_data: JSON.stringify({
           name: 'Alice Fan Smith',
           email: 'alice.smith@student.edu',
           studentId: 'AUD2024001',
           university: 'Tech University'
         }),
         virtual_chz_balance: 850.25,
         wallet_address: '0xAUD11234567890123456789012345678901234'
       },
       {
         id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
         role: 'audience',
         profile_data: JSON.stringify({
           name: 'Bob Sports Brown',
           email: 'bob.brown@student.edu',
           studentId: 'AUD2024002',
           university: 'Tech University'
         }),
         virtual_chz_balance: 650.50,
         wallet_address: '0xAUD21234567890123456789012345678901234'
       },
       {
         id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
         role: 'audience',
         profile_data: JSON.stringify({
           name: 'Carol Match Lee',
           email: 'carol.lee@student.edu',
           studentId: 'AUD2024003',
           university: 'Tech University'
         }),
         virtual_chz_balance: 450.75,
         wallet_address: '0xAUD31234567890123456789012345678901234'
       },
       {
         id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
         role: 'audience',
         profile_data: JSON.stringify({
           name: 'Daniel Event Wilson',
           email: 'daniel.wilson@student.edu',
           studentId: 'AUD2024004',
           university: 'Tech University'
         }),
         virtual_chz_balance: 300.00,
         wallet_address: '0xAUD41234567890123456789012345678901234'
       }
     ];

    // Insert demo users using ON CONFLICT to avoid duplicates / 使用ON CONFLICT插入演示用户以避免重复
    console.log('👥 Adding demo users...');
    console.log('👥 添加演示用户...');
    
    let addedCount = 0;
    let skippedCount = 0;

    for (const user of demoUsers) {
      try {
        const result = await client.query(`
          INSERT INTO users (id, role, profile_data, virtual_chz_balance, wallet_address, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO NOTHING
          RETURNING id
        `, [
          user.id,
          user.role,
          user.profile_data,
          user.virtual_chz_balance,
          user.wallet_address
        ]);

        if (result.rows.length > 0) {
          addedCount++;
          console.log(`✅ Added user: ${JSON.parse(user.profile_data).name} (${user.role})`);
        } else {
          skippedCount++;
          console.log(`⏭️ Skipped existing user: ${JSON.parse(user.profile_data).name} (${user.role})`);
        }
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          skippedCount++;
          console.log(`⏭️ Skipped duplicate user: ${JSON.parse(user.profile_data).name} (${user.role})`);
        } else {
          throw error;
        }
      }
    }

    // Also add athlete data if athletes table exists / 如果athletes表存在也添加运动员数据
    try {
      console.log('🏃‍♂️ Adding athlete profiles...');
      console.log('🏃‍♂️ 添加运动员档案...');
      
             const athleteProfiles = [
         {
           user_id: '44444444-4444-4444-4444-444444444444',
           ranking: 8.5,
           tier: 'gold',
           status: 'active',
           matches_played: 15,
           matches_won: 11,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             goals: 12,
             assists: 8,
             yellow_cards: 2,
             season_performance: 'excellent'
           })
         },
         {
           user_id: '55555555-5555-5555-5555-555555555555',
           ranking: 9.2,
           tier: 'platinum',
           status: 'active',
           matches_played: 22,
           matches_won: 15,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             goals: 8,
             assists: 18,
             yellow_cards: 1,
             season_performance: 'outstanding'
           })
         },
         {
           user_id: '66666666-6666-6666-6666-666666666666',
           ranking: 7.8,
           tier: 'silver',
           status: 'active',
           matches_played: 18,
           matches_won: 12,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             goals: 2,
             assists: 5,
             yellow_cards: 3,
             defensive_actions: 45
           })
         },
         {
           user_id: '77777777-7777-7777-7777-777777777777',
           ranking: 8.9,
           tier: 'gold',
           status: 'active',
           matches_played: 20,
           matches_won: 14,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             saves: 89,
             goals_conceded: 12,
             clean_sheets: 8,
             season_performance: 'excellent'
           })
         },
         {
           user_id: '88888888-8888-8888-8888-888888888888',
           ranking: 8.1,
           tier: 'gold',
           status: 'active',
           matches_played: 19,
           matches_won: 13,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             goals: 15,
             assists: 6,
             yellow_cards: 4,
             season_performance: 'very_good'
           })
         },
         {
           user_id: '99999999-9999-9999-9999-999999999999',
           ranking: 6.5,
           tier: 'bronze',
           status: 'active',
           matches_played: 8,
           matches_won: 4,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             goals: 3,
             assists: 7,
             yellow_cards: 1,
             season_performance: 'promising'
           })
         },
         {
           user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
           ranking: 9.0,
           tier: 'platinum',
           status: 'active',
           matches_played: 25,
           matches_won: 18,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             points: 245,
             rebounds: 180,
             blocks: 45,
             season_performance: 'outstanding'
           })
         },
         {
           user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
           ranking: 8.3,
           tier: 'gold',
           status: 'active',
           matches_played: 20,
           matches_won: 14,
           availability_status: 'available',
           performance_stats: JSON.stringify({
             points: 180,
             assists: 95,
             steals: 35,
             season_performance: 'excellent'
           })
         }
       ];

      let athleteAddedCount = 0;
      for (const athlete of athleteProfiles) {
        try {
          const result = await client.query(`
            INSERT INTO athletes (user_id, ranking, tier, status, matches_played, matches_won, availability_status, performance_stats, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) DO NOTHING
            RETURNING user_id
          `, [
            athlete.user_id,
            athlete.ranking,
            athlete.tier,
            athlete.status,
            athlete.matches_played,
            athlete.matches_won,
            athlete.availability_status,
            athlete.performance_stats
          ]);

          if (result.rows.length > 0) {
            athleteAddedCount++;
          }
        } catch (error) {
          console.log(`⏭️ Skipped athlete profile (may not exist): ${athlete.user_id}`);
        }
      }
      
      console.log(`✅ Added ${athleteAddedCount} athlete profiles`);
      console.log(`✅ 添加了 ${athleteAddedCount} 个运动员档案`);
      
    } catch (error) {
      console.log('⚠️ Athletes table may not exist, skipping athlete data');
      console.log('⚠️ 运动员表可能不存在，跳过运动员数据');
    }

    await client.query('COMMIT');
    
    console.log('');
    console.log('✅ Demo user addition completed successfully!');
    console.log('✅ 演示用户添加成功完成！');
    console.log('');
    console.log('📊 Demo user summary:');
    console.log('📊 演示用户摘要：');
    console.log(`   • ${addedCount} new users added`);
    console.log(`   • ${skippedCount} existing users skipped`);
    console.log(`   • ${demoUsers.filter(u => u.role === 'admin').length} admin users available`);
    console.log(`   • ${demoUsers.filter(u => u.role === 'ambassador').length} ambassador users available`);
    console.log(`   • ${demoUsers.filter(u => u.role === 'athlete').length} athlete users available`);
    console.log(`   • ${demoUsers.filter(u => u.role === 'audience').length} audience users available`);
    console.log('');
    console.log('🎮 Ready for MVP demo! You can now:');
    console.log('🎮 MVP演示准备就绪！你现在可以：');
    console.log('   1. Login using the wallet addresses below');
    console.log('   2. Test all role-based features');
    console.log('   3. Create team drafts as ambassador');
    console.log('   4. Manage events as admin');
    console.log('   5. View competition status as athlete');
    console.log('   6. Participate in staking as audience');
    console.log('');
    console.log('🔑 Test wallet addresses for demo:');
    console.log('🔑 演示测试钱包地址：');
    console.log('   Admin (Sarah): 0xADMIN1234567890123456789012345678901234');
    console.log('   Ambassador 1 (Mike): 0xAMB11234567890123456789012345678901234');
    console.log('   Ambassador 2 (Lisa): 0xAMB21234567890123456789012345678901234');
    console.log('   Athlete 1 (Alex): 0xATH11234567890123456789012345678901234');
    console.log('   Athlete 2 (Maria): 0xATH21234567890123456789012345678901234');
    console.log('   Athlete 3 (James): 0xATH31234567890123456789012345678901234');
    console.log('   Athlete 4 (Emma): 0xATH41234567890123456789012345678901234');
    console.log('   Audience 1 (Alice): 0xAUD11234567890123456789012345678901234');
    console.log('   Audience 2 (Bob): 0xAUD21234567890123456789012345678901234');
    console.log('   Audience 3 (Carol): 0xAUD31234567890123456789012345678901234');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding demo users:', error);
    console.error('❌ 添加演示用户错误:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the user addition / 运行用户添加
addDemoUsers()
  .then(() => {
    console.log('🎉 Demo user addition script completed!');
    console.log('🎉 演示用户添加脚本完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Demo user addition failed:', error);
    console.error('💥 演示用户添加失败:', error);
    process.exit(1);
  }); 