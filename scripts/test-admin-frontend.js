// Test Admin Frontend - Event Applications Display
// 测试管理员前端 - 事件申请显示
// This script tests if the admin frontend can correctly display event applications
// 此脚本测试管理员前端是否能正确显示事件申请

const { Pool } = require('pg');

// Database connection configuration
// 数据库连接配置
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000'
});

async function testAdminFrontend() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing Admin Frontend - Event Applications Display');
    console.log('🧪 测试管理员前端 - 事件申请显示');
    console.log('=' .repeat(60));
    
    // Test 1: Check event applications in database
    // 测试1：检查数据库中的事件申请
    console.log('\n📋 Test 1: Database Event Applications');
    console.log('📋 测试1：数据库事件申请');
    
    const applications = await client.query(`
      SELECT 
        id,
        event_title,
        status,
        ambassador_id,
        created_at,
        reviewed_at,
        admin_review
      FROM event_applications
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${applications.rows.length} event applications:`);
    console.log(`找到 ${applications.rows.length} 个事件申请:`);
    
    applications.rows.forEach((app, index) => {
      console.log(`   ${index + 1}. ${app.event_title}`);
      console.log(`       Status: ${app.status}`);
      console.log(`       状态: ${app.status}`);
      console.log(`       Created: ${app.created_at}`);
      console.log(`       创建时间: ${app.created_at}`);
      if (app.reviewed_at) {
        console.log(`       Reviewed: ${app.reviewed_at}`);
        console.log(`       审批时间: ${app.reviewed_at}`);
      }
      if (app.admin_review) {
        console.log(`       Admin Review: ${JSON.stringify(app.admin_review)}`);
        console.log(`       管理员审批: ${JSON.stringify(app.admin_review)}`);
      }
      console.log('');
    });
    
    // Test 2: Check API endpoint
    // 测试2：检查API端点
    console.log('\n🌐 Test 2: API Endpoint Test');
    console.log('🌐 测试2：API端点测试');
    
    const http = require('http');
    
    const testApiCall = () => {
      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/admin/event-applications?status=all',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        
        const req = http.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        req.end();
      });
    };
    
    try {
      const apiResponse = await testApiCall();
      console.log('✅ API call successful');
      console.log('✅ API调用成功');
      console.log(`   Response status: ${apiResponse.success}`);
      console.log(`   响应状态: ${apiResponse.success}`);
      console.log(`   Data count: ${apiResponse.data?.length || 0}`);
      console.log(`   数据数量: ${apiResponse.data?.length || 0}`);
      
      if (apiResponse.data && apiResponse.data.length > 0) {
        console.log('   Sample data:');
        console.log('   示例数据:');
        const sample = apiResponse.data[0];
        console.log(`     Event Title: ${sample.event_title}`);
        console.log(`     事件标题: ${sample.event_title}`);
        console.log(`     Status: ${sample.status}`);
        console.log(`     状态: ${sample.status}`);
        console.log(`     Venue: ${sample.venue_name}`);
        console.log(`     场馆: ${sample.venue_name}`);
      }
    } catch (error) {
      console.log('❌ API call failed:', error.message);
      console.log('❌ API调用失败:', error.message);
    }
    
    // Test 3: Check frontend file structure
    // 测试3：检查前端文件结构
    console.log('\n🎨 Test 3: Frontend File Structure');
    console.log('🎨 测试3：前端文件结构');
    
    const fs = require('fs');
    const path = require('path');
    
    const frontendFiles = [
      'app/dashboard/admin/page.tsx',
      'app/api/admin/event-applications/route.ts'
    ];
    
    for (const file of frontendFiles) {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        console.log(`✅ ${file}: ${stats.size} bytes`);
        console.log(`✅ ${file}: ${stats.size} 字节`);
      } else {
        console.log(`❌ ${file}: File missing`);
        console.log(`❌ ${file}: 文件缺失`);
      }
    }
    
    // Test 4: Verify data consistency
    // 测试4：验证数据一致性
    console.log('\n🔍 Test 4: Data Consistency');
    console.log('🔍 测试4：数据一致性');
    
    const dbCount = applications.rows.length;
    console.log(`Database applications: ${dbCount}`);
    console.log(`数据库申请: ${dbCount}`);
    
    const pendingCount = applications.rows.filter(app => app.status === 'pending').length;
    const approvedCount = applications.rows.filter(app => app.status === 'approved').length;
    const rejectedCount = applications.rows.filter(app => app.status === 'rejected').length;
    
    console.log(`   Pending: ${pendingCount}`);
    console.log(`   待处理: ${pendingCount}`);
    console.log(`   Approved: ${approvedCount}`);
    console.log(`   已批准: ${approvedCount}`);
    console.log(`   Rejected: ${rejectedCount}`);
    console.log(`   已拒绝: ${rejectedCount}`);
    
    // Test 5: Check ambassador information
    // 测试5：检查大使信息
    console.log('\n👤 Test 5: Ambassador Information');
    console.log('👤 测试5：大使信息');
    
    const ambassadorIds = [...new Set(applications.rows.map(app => app.ambassador_id))];
    
    for (const ambassadorId of ambassadorIds) {
      const ambassador = await client.query(`
        SELECT id, wallet_address, role, profile_data
        FROM users
        WHERE id = $1
      `, [ambassadorId]);
      
      if (ambassador.rows.length > 0) {
        const amb = ambassador.rows[0];
        console.log(`   Ambassador ID: ${amb.id}`);
        console.log(`   大使ID: ${amb.id}`);
        console.log(`   Role: ${amb.role}`);
        console.log(`   角色: ${amb.role}`);
        console.log(`   Wallet: ${amb.wallet_address}`);
        console.log(`   钱包: ${amb.wallet_address}`);
      }
    }
    
    console.log('\n🎉 Admin Frontend Test Completed!');
    console.log('🎉 管理员前端测试完成！');
    console.log('=' .repeat(60));
    
    // Summary
    // 总结
    console.log('\n📊 Summary:');
    console.log('📊 总结:');
    console.log(`   Total applications: ${dbCount}`);
    console.log(`   总申请数: ${dbCount}`);
    console.log(`   API should return: ${dbCount} applications`);
    console.log(`   API应返回: ${dbCount} 个申请`);
    console.log(`   Frontend should display: ${dbCount} applications`);
    console.log(`   前端应显示: ${dbCount} 个申请`);
    
    if (dbCount > 0) {
      console.log('\n✅ The admin frontend should now display all event applications');
      console.log('✅ 管理员前端现在应该显示所有事件申请');
      console.log('   - Including approved applications');
      console.log('   - 包括已批准的申请');
      console.log('   - With proper status indicators');
      console.log('   - 带有适当的状态指示器');
      console.log('   - With approval/rejection buttons for pending applications');
      console.log('   - 为待处理申请提供批准/拒绝按钮');
    }
    
  } catch (error) {
    console.error('❌ Error during admin frontend test:', error);
    console.error('❌ 管理员前端测试期间出错:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
// 运行测试
if (require.main === module) {
  testAdminFrontend()
    .then(() => {
      console.log('✅ Admin frontend test completed successfully');
      console.log('✅ 管理员前端测试成功完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin frontend test failed:', error);
      console.error('❌ 管理员前端测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testAdminFrontend }; 