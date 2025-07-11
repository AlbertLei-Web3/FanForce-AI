/*
 * Phase 2 API Testing Script
 * 第二阶段API测试脚本
 * 
 * This script tests all Phase 2 APIs including:
 * - Ambassador event applications
 * - Admin event review
 * - QR code scanning
 * 
 * 此脚本测试所有第二阶段API，包括：
 * - 大使活动申请
 * - 管理员活动审核
 * - QR码扫描
 */

const baseURL = 'http://localhost:3000'

// Test data
// 测试数据
const testData = {
  ambassador_id: null, // Will be set from database
  admin_id: null,      // Will be set from database  
  audience_id: null,   // Will be set from database
  application_id: null,
  verification_code: null
}

// Helper function to make API calls
// 辅助函数进行API调用
async function apiCall(endpoint, method = 'GET', data = null) {
  const url = `${baseURL}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Phase2-Test-Script/1.0'
    }
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data)
  }

  try {
    console.log(`\n🔄 ${method} ${endpoint}`)
    console.log(`🔄 ${method} ${endpoint}`)
    
    const response = await fetch(url, options)
    const result = await response.json()
    
    console.log(`📊 Status: ${response.status}`)
    console.log(`📊 状态: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Success / 成功')
      return { success: true, data: result, status: response.status }
    } else {
      console.log('❌ Error / 错误:', result.error || result.error_cn)
      return { success: false, data: result, status: response.status }
    }
  } catch (error) {
    console.log('💥 Request failed / 请求失败:', error.message)
    return { success: false, error: error.message }
  }
}

// Get user IDs from database
// 从数据库获取用户ID
async function getUserIds() {
  console.log('\n🔍 Getting user IDs from database...')
  console.log('🔍 从数据库获取用户ID...')
  
  try {
    const { Pool } = require('pg')
    require('dotenv').config()
    
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'fanforce_ai',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    })

    const result = await pool.query(`
      SELECT id, role 
      FROM users 
      WHERE role IN ('ambassador', 'admin', 'audience')
      ORDER BY role, created_at
    `)

    for (const user of result.rows) {
      if (user.role === 'ambassador' && !testData.ambassador_id) {
        testData.ambassador_id = user.id
        console.log(`📋 Ambassador ID: ${user.id}`)
      } else if (user.role === 'admin' && !testData.admin_id) {
        testData.admin_id = user.id
        console.log(`🔧 Admin ID: ${user.id}`)
      } else if (user.role === 'audience' && !testData.audience_id) {
        testData.audience_id = user.id
        console.log(`🙋‍♂️ Audience ID: ${user.id}`)
      }
    }

    await pool.end()
    
    if (!testData.ambassador_id || !testData.admin_id || !testData.audience_id) {
      console.log('⚠️ Warning: Not all required user types found')
      console.log('⚠️ 警告：未找到所有必需的用户类型')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error getting user IDs:', error.message)
    console.error('❌ 获取用户ID错误:', error.message)
    return false
  }
}

// Test 1: Ambassador creates event application
// 测试1：大使创建活动申请
async function testCreateEventApplication() {
  console.log('\n' + '='.repeat(60))
  console.log('🧑‍💼 TEST 1: Ambassador Event Application Creation')
  console.log('🧑‍💼 测试1：大使活动申请创建')
  console.log('='.repeat(60))

  if (!testData.ambassador_id) {
    console.log('❌ No ambassador ID available, skipping test')
    console.log('❌ 无大使ID，跳过测试')
    return false
  }

  const eventData = {
    ambassador_id: testData.ambassador_id,
    event_title: 'Test Campus Basketball Match',
    event_description: 'A test basketball match between Engineering and Business departments',
    event_start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
    event_end_time: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
    venue_name: 'University Sports Center',
    venue_address: '123 Campus Drive, University Town',
    venue_capacity: 200,
    party_venue_capacity: 50,
    team_a_info: {
      name: 'Engineering Eagles',
      players: ['John Doe', 'Jane Smith', 'Bob Johnson'],
      captain: 'John Doe'
    },
    team_b_info: {
      name: 'Business Bears',
      players: ['Mike Wilson', 'Sarah Davis', 'Tom Brown'],
      captain: 'Mike Wilson'
    },
    estimated_participants: 150,
    application_notes: 'This is a test application for Phase 2 API testing',
    external_sponsors: [
      { name: 'Campus Store', contribution: 500 },
      { name: 'Local Pizza', contribution: 300 }
    ]
  }

  const result = await apiCall('/api/ambassador/applications', 'POST', eventData)
  
  if (result.success) {
    testData.application_id = result.data.application.id
    console.log(`✅ Application created with ID: ${testData.application_id}`)
    console.log(`✅ 申请创建成功，ID: ${testData.application_id}`)
    console.log(`⏰ QR Valid From: ${result.data.application.qr_timing.qr_valid_from}`)
    console.log(`⏰ QR Valid Until: ${result.data.application.qr_timing.qr_valid_until}`)
    return true
  }
  
  return false
}

// Test 2: Ambassador views applications
// 测试2：大使查看申请
async function testViewApplications() {
  console.log('\n' + '='.repeat(60))
  console.log('📋 TEST 2: Ambassador View Applications')
  console.log('📋 测试2：大使查看申请')
  console.log('='.repeat(60))

  if (!testData.ambassador_id) {
    console.log('❌ No ambassador ID available, skipping test')
    console.log('❌ 无大使ID，跳过测试')
    return false
  }

  const result = await apiCall(
    `/api/ambassador/applications?ambassador_id=${testData.ambassador_id}&status=all&page=1&limit=10`
  )
  
  if (result.success) {
    console.log(`✅ Found ${result.data.applications.length} applications`)
    console.log(`✅ 找到${result.data.applications.length}个申请`)
    
    if (result.data.applications.length > 0) {
      const app = result.data.applications[0]
      console.log(`📝 Latest Application: ${app.event_title}`)
      console.log(`📝 最新申请: ${app.event_title}`)
      console.log(`🏆 Teams: ${app.team_info.team_a.name} vs ${app.team_info.team_b.name}`)
      console.log(`⏰ QR Status: ${app.qr_timing.status}`)
    }
    
    return true
  }
  
  return false
}

// Test 3: Admin reviews applications
// 测试3：管理员审核申请
async function testAdminReviewApplications() {
  console.log('\n' + '='.repeat(60))
  console.log('🔧 TEST 3: Admin Review Applications')
  console.log('🔧 测试3：管理员审核申请')
  console.log('='.repeat(60))

  if (!testData.admin_id) {
    console.log('❌ No admin ID available, skipping test')
    console.log('❌ 无管理员ID，跳过测试')
    return false
  }

  const result = await apiCall(
    `/api/admin/event-applications?admin_id=${testData.admin_id}&status=pending&page=1&limit=10`
  )
  
  if (result.success) {
    console.log(`✅ Found ${result.data.applications.length} pending applications`)
    console.log(`✅ 找到${result.data.applications.length}个待审核申请`)
    
    if (result.data.applications.length > 0) {
      const app = result.data.applications[0]
      console.log(`📝 Application: ${app.event_title}`)
      console.log(`🧑‍💼 Ambassador: ${app.ambassador_username}`)
      console.log(`🏟️ Venue: ${app.venue_name} (${app.venue_capacity} capacity)`)
      console.log(`⏰ Event Start: ${app.event_start_time}`)
    }
    
    return true
  }
  
  return false
}

// Test 4: Admin approves application
// 测试4：管理员批准申请
async function testAdminApproveApplication() {
  console.log('\n' + '='.repeat(60))
  console.log('✅ TEST 4: Admin Approve Application')
  console.log('✅ 测试4：管理员批准申请')
  console.log('='.repeat(60))

  if (!testData.admin_id || !testData.application_id) {
    console.log('❌ Missing admin ID or application ID, skipping test')
    console.log('❌ 缺少管理员ID或申请ID，跳过测试')
    return false
  }

  const approvalData = {
    admin_id: testData.admin_id,
    application_id: testData.application_id,
    action: 'approve',
    decision_reason: 'Application meets all requirements. Good venue and team setup.',
    admin_notes: 'Approved for Phase 2 testing. Event looks well organized.',
    suggestions: 'Consider adding more security for the event.',
    generate_qr: true
  }

  const result = await apiCall('/api/admin/event-applications', 'POST', approvalData)
  
  if (result.success) {
    console.log(`✅ Application approved successfully`)
    console.log(`✅ 申请批准成功`)
    
    if (result.data.qr_code) {
      testData.verification_code = result.data.qr_code.verification_code
      console.log(`🔗 QR Code generated: ${result.data.qr_code.verification_code}`)
      console.log(`🔗 QR码已生成: ${result.data.qr_code.verification_code}`)
      console.log(`📱 QR URL: ${result.data.qr_code.qr_content}`)
      console.log(`⏰ Valid From: ${result.data.qr_code.valid_from}`)
      console.log(`⏰ Valid Until: ${result.data.qr_code.valid_until}`)
    }
    
    return true
  }
  
  return false
}

// Test 5: Get QR code information
// 测试5：获取QR码信息
async function testGetQRCodeInfo() {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 TEST 5: Get QR Code Information')
  console.log('🔍 测试5：获取QR码信息')
  console.log('='.repeat(60))

  if (!testData.verification_code) {
    console.log('❌ No verification code available, skipping test')
    console.log('❌ 无验证码，跳过测试')
    return false
  }

  const result = await apiCall(
    `/api/audience/qr-scan?verification_code=${testData.verification_code}&user_id=${testData.audience_id}`
  )
  
  if (result.success) {
    console.log(`✅ QR Code information retrieved`)
    console.log(`✅ QR码信息获取成功`)
    console.log(`🎯 Event: ${result.data.event_info.title}`)
    console.log(`🏟️ Venue: ${result.data.event_info.venue.name}`)
    console.log(`🏆 Teams: ${result.data.event_info.teams.team_a.name} vs ${result.data.event_info.teams.team_b.name}`)
    console.log(`⏰ Currently Valid: ${result.data.timing.is_currently_valid}`)
    console.log(`📊 Current Participants: ${result.data.current_stats.total_participants}`)
    console.log(`🎉 Party Spots Remaining: ${result.data.participation_options.watch_and_party.party_spots_remaining}`)
    
    return true
  }
  
  return false
}

// Test 6: Audience scans QR code (watch only)
// 测试6：观众扫描QR码（仅观看）
async function testAudienceQRScanWatchOnly() {
  console.log('\n' + '='.repeat(60))
  console.log('🙋‍♂️ TEST 6: Audience QR Scan (Watch Only)')
  console.log('🙋‍♂️ 测试6：观众QR码扫描（仅观看）')
  console.log('='.repeat(60))

  if (!testData.audience_id || !testData.verification_code) {
    console.log('❌ Missing audience ID or verification code, skipping test')
    console.log('❌ 缺少观众ID或验证码，跳过测试')
    return false
  }

  const scanData = {
    user_id: testData.audience_id,
    verification_code: testData.verification_code,
    participation_type: 'watch_only',
    scan_location: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    },
    user_agent: 'Phase2-Test-Script/1.0',
    device_info: {
      platform: 'Test',
      version: '1.0'
    }
  }

  const result = await apiCall('/api/audience/qr-scan', 'POST', scanData)
  
  if (result.success) {
    console.log(`✅ QR Code scanned successfully`)
    console.log(`✅ QR码扫描成功`)
    console.log(`🎯 Participation Type: ${result.data.participation.participation_type}`)
    console.log(`🏆 Reward Tier: ${result.data.participation.reward_tier}`)
    console.log(`💰 Reward Multiplier: ${result.data.reward_info.multiplier}`)
    console.log(`📝 Description: ${result.data.reward_info.description}`)
    
    return true
  } else {
    // This might fail if QR code is not yet valid (timing issue)
    // 如果QR码尚未生效（时间问题），这可能会失败
    console.log(`⚠️ Scan failed, possibly due to timing: ${result.data.error}`)
    console.log(`⚠️ 扫描失败，可能是时间问题: ${result.data.error_cn}`)
    return false
  }
}

// Test 7: Test QR code with different audience (party)
// 测试7：不同观众测试QR码（聚会）
async function testAudienceQRScanWithParty() {
  console.log('\n' + '='.repeat(60))
  console.log('🎉 TEST 7: Audience QR Scan (Watch + Party)')
  console.log('🎉 测试7：观众QR码扫描（观看+聚会）')
  console.log('='.repeat(60))

  if (!testData.verification_code) {
    console.log('❌ No verification code available, skipping test')
    console.log('❌ 无验证码，跳过测试')
    return false
  }

  // Create a second audience user for this test
  // 为此测试创建第二个观众用户
  const { Pool } = require('pg')
  require('dotenv').config()
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'fanforce_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  })

  let secondAudienceId = null
  
  try {
    const userResult = await pool.query(`
      SELECT id FROM users WHERE role = 'audience' AND id != $1 LIMIT 1
    `, [testData.audience_id])
    
    if (userResult.rows.length > 0) {
      secondAudienceId = userResult.rows[0].id
    } else {
              // Create a test audience user
        const createResult = await pool.query(`
          INSERT INTO users (role, wallet_address, profile_data)
          VALUES ('audience', '0x' || encode(gen_random_bytes(20), 'hex'), '{}')
          RETURNING id
        `)
      secondAudienceId = createResult.rows[0].id
    }
  } catch (error) {
    console.log('⚠️ Could not create second audience user:', error.message)
    console.log('⚠️ 无法创建第二个观众用户:', error.message)
    await pool.end()
    return false
  }

  await pool.end()

  const scanData = {
    user_id: secondAudienceId,
    verification_code: testData.verification_code,
    participation_type: 'watch_and_party',
    scan_location: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10
    },
    user_agent: 'Phase2-Test-Script/1.0',
    device_info: {
      platform: 'Test',
      version: '1.0'
    }
  }

  const result = await apiCall('/api/audience/qr-scan', 'POST', scanData)
  
  if (result.success) {
    console.log(`✅ QR Code scanned successfully`)
    console.log(`✅ QR码扫描成功`)
    console.log(`🎯 Participation Type: ${result.data.participation.participation_type}`)
    console.log(`🏆 Reward Tier: ${result.data.participation.reward_tier}`)
    console.log(`💰 Reward Multiplier: ${result.data.reward_info.multiplier}`)
    console.log(`🎉 Party Status: ${result.data.participation.party_allocation_status}`)
    
    return true
  } else {
    console.log(`⚠️ Scan failed: ${result.data.error}`)
    console.log(`⚠️ 扫描失败: ${result.data.error_cn}`)
    return false
  }
}

// Main test function
// 主测试函数
async function runAllTests() {
  console.log('🚀 Starting Phase 2 API Tests...')
  console.log('🚀 开始第二阶段API测试...')
  
  const testResults = []
  
  // Get user IDs first
  // 首先获取用户ID
  const userIdsReady = await getUserIds()
  if (!userIdsReady) {
    console.log('❌ Cannot proceed without user IDs')
    console.log('❌ 没有用户ID无法继续')
    return
  }
  
  // Run all tests
  // 运行所有测试
  const tests = [
    { name: 'Create Event Application', func: testCreateEventApplication },
    { name: 'View Applications', func: testViewApplications },
    { name: 'Admin Review Applications', func: testAdminReviewApplications },
    { name: 'Admin Approve Application', func: testAdminApproveApplication },
    { name: 'Get QR Code Info', func: testGetQRCodeInfo },
    { name: 'Audience QR Scan (Watch Only)', func: testAudienceQRScanWatchOnly },
    { name: 'Audience QR Scan (Watch + Party)', func: testAudienceQRScanWithParty }
  ]
  
  for (const test of tests) {
    try {
      const result = await test.func()
      testResults.push({ name: test.name, success: result })
      
      // Wait between tests
      // 测试之间等待
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.log(`💥 Test failed: ${test.name}`)
      console.log(`💥 测试失败: ${test.name}`)
      console.log(`Error: ${error.message}`)
      testResults.push({ name: test.name, success: false, error: error.message })
    }
  }
  
  // Print summary
  // 打印摘要
  console.log('\n' + '='.repeat(60))
  console.log('📊 TEST SUMMARY / 测试摘要')
  console.log('='.repeat(60))
  
  const passedTests = testResults.filter(r => r.success)
  const failedTests = testResults.filter(r => !r.success)
  
  console.log(`✅ Passed: ${passedTests.length}/${testResults.length}`)
  console.log(`✅ 通过: ${passedTests.length}/${testResults.length}`)
  console.log(`❌ Failed: ${failedTests.length}/${testResults.length}`)
  console.log(`❌ 失败: ${failedTests.length}/${testResults.length}`)
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:')
    console.log('❌ 失败的测试:')
    failedTests.forEach(test => {
      console.log(`  - ${test.name}`)
      if (test.error) {
        console.log(`    Error: ${test.error}`)
      }
    })
  }
  
  console.log('\n🎉 Phase 2 API Testing Complete!')
  console.log('🎉 第二阶段API测试完成!')
}

// Run tests if this file is executed directly
// 如果直接执行此文件则运行测试
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests } 