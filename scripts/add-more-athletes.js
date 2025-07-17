// Add More Demo Athletes Script
// 添加更多演示运动员脚本

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Database configuration
// 数据库配置
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'fanforce_ai',
  user: 'postgres',
  password: 'LYQ20000'
});

// Demo athletes data
// 演示运动员数据
const demoAthletes = [
  {
    wallet_address: '0x1111111111111111111111111111111111111111',
    student_id: 'ATH001',
    sport: 'soccer',
    name: 'Alex Chen',
    performance_stats: {
      goals: 15,
      assists: 8,
      matches_played: 25,
      win_rate: 0.72,
      yellow_cards: 2,
      red_cards: 0
    }
  },
  {
    wallet_address: '0x2222222222222222222222222222222222222222',
    student_id: 'ATH002',
    sport: 'soccer',
    name: 'Maria Rodriguez',
    performance_stats: {
      goals: 12,
      assists: 15,
      matches_played: 28,
      win_rate: 0.68,
      yellow_cards: 1,
      red_cards: 0
    }
  },
  {
    wallet_address: '0x3333333333333333333333333333333333333333',
    student_id: 'ATH003',
    sport: 'soccer',
    name: 'David Kim',
    performance_stats: {
      goals: 18,
      assists: 6,
      matches_played: 22,
      win_rate: 0.75,
      yellow_cards: 3,
      red_cards: 0
    }
  },
  {
    wallet_address: '0x4444444444444444444444444444444444444444',
    student_id: 'ATH004',
    sport: 'soccer',
    name: 'Sarah Johnson',
    performance_stats: {
      goals: 10,
      assists: 12,
      matches_played: 26,
      win_rate: 0.65,
      yellow_cards: 1,
      red_cards: 0
    }
  },
  {
    wallet_address: '0x5555555555555555555555555555555555555555',
    student_id: 'ATH005',
    sport: 'soccer',
    name: 'Michael Brown',
    performance_stats: {
      goals: 14,
      assists: 9,
      matches_played: 24,
      win_rate: 0.70,
      yellow_cards: 2,
      red_cards: 0
    }
  },
  {
    wallet_address: '0x6666666666666666666666666666666666666666',
    student_id: 'ATH006',
    sport: 'soccer',
    name: 'Emma Wilson',
    performance_stats: {
      goals: 16,
      assists: 7,
      matches_played: 23,
      win_rate: 0.73,
      yellow_cards: 1,
      red_cards: 0
    }
  },
  {
    wallet_address: '0x7777777777777777777777777777777777777777',
    student_id: 'ATH007',
    sport: 'basketball',
    name: 'James Davis',
    performance_stats: {
      points: 22.5,
      rebounds: 8.2,
      assists: 4.8,
      matches_played: 20,
      win_rate: 0.65,
      field_goal_percentage: 0.48
    }
  },
  {
    wallet_address: '0x8888888888888888888888888888888888888888',
    student_id: 'ATH008',
    sport: 'basketball',
    name: 'Lisa Thompson',
    performance_stats: {
      points: 19.8,
      rebounds: 6.5,
      assists: 6.2,
      matches_played: 18,
      win_rate: 0.72,
      field_goal_percentage: 0.52
    }
  }
];

async function addMoreAthletes() {
  const client = await pool.connect();
  
  try {
    console.log('Adding more demo athletes...');
    // 添加更多演示运动员...
    
    for (const athleteData of demoAthletes) {
      // Check if user already exists
      // 检查用户是否已存在
      const existingUser = await client.query(
        'SELECT id FROM users WHERE wallet_address = $1',
        [athleteData.wallet_address]
      );
      
      let userId;
      
      if (existingUser.rows.length === 0) {
        // Create new user
        // 创建新用户
        const userResult = await client.query(
          `INSERT INTO users (
            id,
            wallet_address,
            role,
            student_id,
            profile_data,
            virtual_chz_balance,
            real_chz_balance,
            reliability_score,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
          [
            uuidv4(),
            athleteData.wallet_address,
            'athlete',
            athleteData.student_id,
            JSON.stringify({ name: athleteData.name, sport: athleteData.sport }),
            100.0, // Initial virtual CHZ balance
            0.0,   // Initial real CHZ balance
            100    // Initial reliability score
          ]
        );
        
        userId = userResult.rows[0].id;
        console.log(`Created user for athlete: ${athleteData.name}`);
        // 为运动员创建用户：${athleteData.name}
      } else {
        userId = existingUser.rows[0].id;
        console.log(`User already exists for athlete: ${athleteData.name}`);
        // 运动员用户已存在：${athleteData.name}
      }
      
      // Check if athlete profile already exists
      // 检查运动员档案是否已存在
      const existingProfile = await client.query(
        'SELECT id FROM athletes WHERE user_id = $1',
        [userId]
      );
      
      if (existingProfile.rows.length === 0) {
        // Create athlete profile
        // 创建运动员档案
        await client.query(
          `INSERT INTO athletes (
            id,
            user_id,
            ranking,
            tier,
            status,
            season_earnings,
            matches_played,
            matches_won,
            social_posts,
            total_fees_earned,
            performance_stats,
            availability_status,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
          [
            uuidv4(),
            userId,
            1000, // Initial ranking
            'bronze', // Initial tier
            'active', // Initial status
            0.0, // Initial earnings
            athleteData.performance_stats.matches_played || 0,
            Math.floor((athleteData.performance_stats.matches_played || 0) * (athleteData.performance_stats.win_rate || 0)),
            0, // Initial social posts
            0.0, // Initial total fees
            JSON.stringify(athleteData.performance_stats),
            'available' // Initial availability
          ]
        );
        
        console.log(`Created athlete profile for: ${athleteData.name}`);
        // 为以下运动员创建档案：${athleteData.name}
      } else {
        console.log(`Athlete profile already exists for: ${athleteData.name}`);
        // 运动员档案已存在：${athleteData.name}
      }
    }
    
    // Verify the results
    // 验证结果
    const athleteCount = await client.query('SELECT COUNT(*) as count FROM athletes');
    const userCount = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'athlete'");
    
    console.log(`\nTotal athletes: ${athleteCount.rows[0].count}`);
    // 运动员总数：${athleteCount.rows[0].count}
    console.log(`Total athlete users: ${userCount.rows[0].count}`);
    // 运动员用户总数：${userCount.rows[0].count}
    
    console.log('\nDemo athletes added successfully!');
    // 演示运动员添加成功！
    
  } catch (error) {
    console.error('Error adding demo athletes:', error);
    // 添加演示运动员时出错：
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
// 运行脚本
addMoreAthletes(); 