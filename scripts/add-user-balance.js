/*
 * Add User Balance for Testing
 * 为测试添加用户余额
 * 
 * This script adds CHZ balance to the test user for complete testing
 * 此脚本为测试用户添加CHZ余额以进行完整测试
 */

const { Pool } = require('pg');

// Database connection
// 数据库连接
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

// Test user ID
// 测试用户ID
const testUserId = 'fb7554e2-e6e5-48f2-ade0-d9510703e8de';

async function addUserBalance() {
  console.log('💰 Adding CHZ balance to test user...');
  console.log('💰 为测试用户添加CHZ余额...');
  console.log(`User ID: ${testUserId}`);
  console.log(`用户ID: ${testUserId}`);

  try {
    // Check current balance
    // 检查当前余额
    console.log('\n📊 Checking current balance...');
    console.log('📊 检查当前余额...');
    
    const currentBalance = await pool.query(`
      SELECT virtual_chz_balance
      FROM users 
      WHERE id = $1
    `, [testUserId]);

    if (currentBalance.rows.length === 0) {
      console.log('❌ User not found');
      console.log('❌ 未找到用户');
      return;
    }

    const currentBalanceAmount = parseFloat(currentBalance.rows[0].virtual_chz_balance);
    console.log(`Current balance: ${currentBalanceAmount} CHZ`);
    console.log(`当前余额: ${currentBalanceAmount} CHZ`);

    // Add 1000 CHZ to user balance
    // 为用户余额添加1000 CHZ
    const newBalance = currentBalanceAmount + 1000;
    
    console.log('\n💰 Adding 1000 CHZ to user balance...');
    console.log('💰 为用户余额添加1000 CHZ...');
    
    const updateResult = await pool.query(`
      UPDATE users 
      SET virtual_chz_balance = $1
      WHERE id = $2
    `, [newBalance.toString(), testUserId]);

    if (updateResult.rowCount > 0) {
      console.log('✅ Balance updated successfully');
      console.log('✅ 余额更新成功');
      console.log(`New balance: ${newBalance} CHZ`);
      console.log(`新余额: ${newBalance} CHZ`);
    } else {
      console.log('❌ Failed to update balance');
      console.log('❌ 更新余额失败');
    }

    // Verify the update
    // 验证更新
    console.log('\n📊 Verifying updated balance...');
    console.log('📊 验证更新后的余额...');
    
    const verifyBalance = await pool.query(`
      SELECT virtual_chz_balance
      FROM users 
      WHERE id = $1
    `, [testUserId]);

    const finalBalance = parseFloat(verifyBalance.rows[0].virtual_chz_balance);
    console.log(`Final balance: ${finalBalance} CHZ`);
    console.log(`最终余额: ${finalBalance} CHZ`);

    console.log('\n🎉 User balance updated successfully!');
    console.log('🎉 用户余额更新成功！');
    console.log('Now you can test the complete staking flow.');
    console.log('现在您可以测试完整的质押流程。');

  } catch (error) {
    console.error('❌ Error updating user balance:', error);
    console.error('❌ 更新用户余额时出错:', error);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
    console.log('🔌 数据库连接已关闭');
  }
}

// Run the script
// 运行脚本
addUserBalance().then(() => {
  console.log('\n✨ Balance update completed');
  console.log('✨ 余额更新完成');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Balance update failed:', error);
  console.error('💥 余额更新失败:', error);
  process.exit(1);
}); 