// Simple Demo Data Initialization Script for FanForce AI MVP
// FanForce AI MVP简单演示数据初始化脚本
// This script creates demo data for existing tables only
// 此脚本仅为现有表创建演示数据

const { Pool } = require('pg');
require('dotenv').config();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              Simple Demo Data Initialization                   ║
║              简单演示数据初始化                                 ║
║                                                               ║
║  Creating sample data for 7-day MVP demo                     ║
║  为7天MVP演示创建示例数据                                       ║
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

async function initSimpleDemoData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting simple demo data initialization...');
    console.log('🚀 开始简单演示数据初始化...');
    
    await client.query('BEGIN');

    // Clear existing demo data from users table only / 仅清理用户表的现有演示数据
    console.log('🧹 Cleaning existing demo users...');
    console.log('🧹 清理现有演示用户...');
    
    await client.query(`DELETE FROM users WHERE wallet_address LIKE '0x%' AND role IN ('admin', 'ambassador', 'athlete', 'audience')`);

    // Insert demo users / 插入演示用户
    console.log('👥 Creating demo users...');
    console.log('👥 创建演示用户...');
    
    const demoUsers = [
      // Admin
      {
        id: 'demo-admin-001',
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
        id: 'demo-ambassador-001',
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
        id: 'demo-ambassador-002',
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

      // Athletes
      {
        id: 'demo-athlete-001',
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
        id: 'demo-athlete-002',
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
        id: 'demo-athlete-003',
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
        id: 'demo-athlete-004',
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
        id: 'demo-athlete-005',
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
        id: 'demo-athlete-006',
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

      // Basketball athletes
      {
        id: 'demo-athlete-007',
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
        id: 'demo-athlete-008',
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

      // Audience
      {
        id: 'demo-audience-001',
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
        id: 'demo-audience-002',
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
        id: 'demo-audience-003',
        role: 'audience',
        profile_data: JSON.stringify({
          name: 'Carol Match Lee',
          email: 'carol.lee@student.edu',
          studentId: 'AUD2024003',
          university: 'Tech University'
        }),
        virtual_chz_balance: 450.75,
        wallet_address: '0xAUD31234567890123456789012345678901234'
      }
    ];

    for (const user of demoUsers) {
      await client.query(`
        INSERT INTO users (id, role, profile_data, virtual_chz_balance, wallet_address, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        user.id,
        user.role,
        user.profile_data,
        user.virtual_chz_balance,
        user.wallet_address
      ]);
    }

    await client.query('COMMIT');
    
    console.log('✅ Demo data initialization completed successfully!');
    console.log('✅ 演示数据初始化成功完成！');
    console.log('');
    console.log('📊 Created demo data summary:');
    console.log('📊 创建的演示数据摘要：');
    console.log(`   • ${demoUsers.length} users:`);
    console.log(`     - ${demoUsers.filter(u => u.role === 'admin').length} admin users`);
    console.log(`     - ${demoUsers.filter(u => u.role === 'ambassador').length} ambassador users`);
    console.log(`     - ${demoUsers.filter(u => u.role === 'athlete').length} athlete users`);
    console.log(`     - ${demoUsers.filter(u => u.role === 'audience').length} audience users`);
    console.log('');
    console.log('🎮 Ready for MVP demo! You can now:');
    console.log('🎮 MVP演示准备就绪！你现在可以：');
    console.log('   1. Login as different roles and test features');
    console.log('   2. Use the wallet addresses below to connect');
    console.log('   3. Test the ambassador team draft system');
    console.log('   4. Test admin pool injection system');
    console.log('   5. Test athlete competition status');
    console.log('   6. Test audience 3-tier staking');
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
initSimpleDemoData()
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