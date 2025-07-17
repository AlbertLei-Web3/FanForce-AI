// Fix Athlete Profiles Script
// 修复运动员档案脚本

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

async function fixAthleteProfiles() {
  const client = await pool.connect();
  
  try {
    console.log('Starting to fix athlete profiles...');
    // 开始修复运动员档案...
    
    // Get all users with role 'athlete'
    // 获取所有运动员角色的用户
    const athleteUsers = await client.query(
      "SELECT id, wallet_address, role FROM users WHERE role = 'athlete'"
    );
    
    console.log(`Found ${athleteUsers.rows.length} athlete users`);
    // 找到 ${athleteUsers.rows.length} 个运动员用户
    
    for (const user of athleteUsers.rows) {
      // Check if athlete profile already exists
      // 检查运动员档案是否已存在
      const existingProfile = await client.query(
        'SELECT id FROM athletes WHERE user_id = $1',
        [user.id]
      );
      
      if (existingProfile.rows.length === 0) {
        // Create new athlete profile with default stats
        // 创建新的运动员档案，包含默认统计数据
        const defaultStats = {
          goals: 0,
          assists: 0,
          matches_played: 0,
          win_rate: 0,
          yellow_cards: 0,
          red_cards: 0
        };
        
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
            user.id,
            1000, // Initial ranking
            'bronze', // Initial tier (changed from 'rookie' to 'bronze')
            'active', // Initial status
            0.0, // Initial earnings
            0, // Initial matches played
            0, // Initial matches won
            0, // Initial social posts
            0.0, // Initial total fees
            JSON.stringify(defaultStats), // Performance stats
            'available' // Initial availability
          ]
        );
        
        console.log(`Created athlete profile for user: ${user.wallet_address}`);
        // 为用户创建运动员档案：${user.wallet_address}
      } else {
        console.log(`Athlete profile already exists for user: ${user.wallet_address}`);
        // 用户运动员档案已存在：${user.wallet_address}
      }
    }
    
    // Verify the fix
    // 验证修复结果
    const athleteCount = await client.query('SELECT COUNT(*) as count FROM athletes');
    console.log(`Total athletes after fix: ${athleteCount.rows[0].count}`);
    // 修复后运动员总数：${athleteCount.rows[0].count}
    
    console.log('Athlete profiles fixed successfully!');
    // 运动员档案修复成功！
    
  } catch (error) {
    console.error('Error fixing athlete profiles:', error);
    // 修复运动员档案时出错：
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
// 运行修复
fixAthleteProfiles(); 