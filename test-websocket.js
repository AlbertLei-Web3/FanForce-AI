/**
 * FanForce AI WebSocket Test Client
 * FanForce AI WebSocket测试客户端
 * 
 * Tests real-time functionality including:
 * 测试实时功能包括：
 * - JWT authentication / JWT认证
 * - User role-based rooms / 基于用户角色的房间
 * - Event participation / 活动参与
 * - Match result broadcasting / 比赛结果广播
 * - QR code scanning / 二维码扫描
 * - Reward distribution / 奖励分配
 * - Connection health monitoring / 连接健康监控
 */

const io = require('socket.io-client');
const axios = require('axios');
const colors = require('colors');
require('dotenv').config();

// Test configuration
// 测试配置
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'ws://localhost:3001';

// Test users for different roles
// 不同角色的测试用户
const testUsers = {
  admin: {
    walletAddress: '0x1234567890123456789012345678901234567890',
    signature: 'admin_signature_mock',
    role: 'admin'
  },
  ambassador: {
    walletAddress: '0x2234567890123456789012345678901234567890',
    signature: 'ambassador_signature_mock',
    role: 'ambassador'
  },
  athlete: {
    walletAddress: '0x3234567890123456789012345678901234567890',
    signature: 'athlete_signature_mock',
    role: 'athlete'
  },
  audience: {
    walletAddress: '0x4234567890123456789012345678901234567890',
    signature: 'audience_signature_mock',
    role: 'audience'
  }
};

// Helper function to get JWT token
// 获取JWT令牌的辅助函数
async function getJWTToken(user) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      walletAddress: user.walletAddress,
      signature: user.signature,
      message: 'Login to FanForce AI'
    });
    
    return response.data.token;
  } catch (error) {
    console.error(`❌ Failed to get JWT token for ${user.role}:`.red, error.message);
    return null;
  }
}

// Helper function to create WebSocket connection
// 创建WebSocket连接的辅助函数
function createWebSocketConnection(token, userRole) {
  return new Promise((resolve, reject) => {
    const socket = io(WEBSOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log(`✅ ${userRole.toUpperCase()} WebSocket connected`.green);
      console.log(`✅ ${userRole.toUpperCase()} WebSocket已连接`.green);
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ ${userRole.toUpperCase()} WebSocket connection failed:`.red, error.message);
      reject(error);
    });

    socket.on('connected', (data) => {
      console.log(`🎉 ${userRole.toUpperCase()} received welcome:`.cyan, data);
    });

    socket.on('error', (error) => {
      console.error(`❌ ${userRole.toUpperCase()} WebSocket error:`.red, error);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 ${userRole.toUpperCase()} WebSocket disconnected:`.yellow, reason);
    });
  });
}

// Test function for user status updates
// 测试用户状态更新功能
function testUserStatusUpdates(socket, userRole) {
  console.log(`\n🧪 Testing user status updates for ${userRole.toUpperCase()}`.magenta);
  console.log(`🧪 测试${userRole.toUpperCase()}的用户状态更新`.magenta);

  // Listen for status updates
  // 监听状态更新
  socket.on('user_status_update', (data) => {
    console.log(`📊 ${userRole.toUpperCase()} received status update:`.blue, data);
  });

  // Send status update
  // 发送状态更新
  socket.emit('update_status', {
    status: userRole === 'athlete' ? 'active' : 'online',
    message: `${userRole} is now active`
  });
}

// Test function for event participation
// 测试活动参与功能
function testEventParticipation(socket, userRole) {
  console.log(`\n🎯 Testing event participation for ${userRole.toUpperCase()}`.magenta);
  console.log(`🎯 测试${userRole.toUpperCase()}的活动参与`.magenta);

  // Listen for event-related events
  // 监听活动相关事件
  socket.on('event_joined', (data) => {
    console.log(`🎉 ${userRole.toUpperCase()} joined event:`.green, data);
  });

  socket.on('participant_joined', (data) => {
    console.log(`👥 ${userRole.toUpperCase()} saw participant join:`.cyan, data);
  });

  socket.on('participant_disconnected', (data) => {
    console.log(`👋 ${userRole.toUpperCase()} saw participant disconnect:`.yellow, data);
  });

  // Join test event
  // 加入测试活动
  const testEventId = `test_event_${Date.now()}`;
  socket.emit('join_event', { eventId: testEventId });

  return testEventId;
}

// Test function for QR code scanning
// 测试二维码扫描功能
function testQRCodeScanning(socket, userRole, eventId) {
  if (userRole !== 'audience') return;

  console.log(`\n📱 Testing QR code scanning for ${userRole.toUpperCase()}`.magenta);
  console.log(`📱 测试${userRole.toUpperCase()}的二维码扫描`.magenta);

  // Listen for QR scan confirmations
  // 监听二维码扫描确认
  socket.on('qr_scan_confirmed', (data) => {
    console.log(`✅ ${userRole.toUpperCase()} QR scan confirmed:`.green, data);
  });

  // Simulate QR code scan
  // 模拟二维码扫描
  socket.emit('qr_scan', {
    eventId: eventId,
    scanResult: 'valid_qr_code_jwt_token_mock'
  });
}

// Test function for match results (admin/ambassador only)
// 测试比赛结果功能（仅管理员/大使）
function testMatchResults(socket, userRole, eventId) {
  if (userRole !== 'admin' && userRole !== 'ambassador') return;

  console.log(`\n🏆 Testing match results for ${userRole.toUpperCase()}`.magenta);
  console.log(`🏆 测试${userRole.toUpperCase()}的比赛结果`.magenta);

  // Listen for match result confirmations
  // 监听比赛结果确认
  socket.on('match_result_confirmed', (data) => {
    console.log(`✅ ${userRole.toUpperCase()} match result confirmed:`.green, data);
  });

  // Send match result
  // 发送比赛结果
  setTimeout(() => {
    socket.emit('match_result', {
      eventId: eventId,
      teamAScore: 3,
      teamBScore: 1,
      winningTeam: 'A'
    });
  }, 2000);
}

// Test function for reward distribution (admin only)
// 测试奖励分配功能（仅管理员）
function testRewardDistribution(socket, userRole, eventId) {
  if (userRole !== 'admin') return;

  console.log(`\n💰 Testing reward distribution for ${userRole.toUpperCase()}`.magenta);
  console.log(`💰 测试${userRole.toUpperCase()}的奖励分配`.magenta);

  // Send reward distribution
  // 发送奖励分配
  setTimeout(() => {
    socket.emit('reward_distribution', {
      eventId: eventId,
      recipients: [
        { userId: 1, amount: 100 },
        { userId: 2, amount: 50 },
        { userId: 3, amount: 25 }
      ]
    });
  }, 5000);
}

// Test function for connection health
// 测试连接健康状况功能
function testConnectionHealth(socket, userRole) {
  console.log(`\n💓 Testing connection health for ${userRole.toUpperCase()}`.magenta);
  console.log(`💓 测试${userRole.toUpperCase()}的连接健康状况`.magenta);

  socket.on('pong', (data) => {
    console.log(`💓 ${userRole.toUpperCase()} received pong:`.green, data.timestamp);
  });

  // Send ping every 10 seconds
  // 每10秒发送ping
  const pingInterval = setInterval(() => {
    socket.emit('ping');
  }, 10000);

  // Clean up interval when socket disconnects
  // 当socket断开连接时清理间隔
  socket.on('disconnect', () => {
    clearInterval(pingInterval);
  });
}

// Listen for broadcast events
// 监听广播事件
function listenForBroadcastEvents(socket, userRole) {
  console.log(`\n📢 Setting up broadcast listeners for ${userRole.toUpperCase()}`.magenta);
  console.log(`📢 为${userRole.toUpperCase()}设置广播监听器`.magenta);

  // General notifications
  // 通用通知
  socket.on('match_completed', (data) => {
    console.log(`🏆 ${userRole.toUpperCase()} received match completion:`.green, data);
  });

  socket.on('match_result_update', (data) => {
    console.log(`📊 ${userRole.toUpperCase()} received match result update:`.blue, data);
  });

  socket.on('reward_received', (data) => {
    console.log(`💰 ${userRole.toUpperCase()} received reward:`.green, data);
  });

  // Admin/Ambassador specific
  // 管理员/大使特定
  if (userRole === 'admin' || userRole === 'ambassador') {
    socket.on('qr_scan_update', (data) => {
      console.log(`📱 ${userRole.toUpperCase()} received QR scan update:`.cyan, data);
    });
  }
}

// Main test function
// 主要测试函数
async function runWebSocketTests() {
  console.log('🚀 Starting FanForce AI WebSocket Tests'.rainbow);
  console.log('🚀 开始FanForce AI WebSocket测试'.rainbow);
  console.log('=' * 50);

  const connections = {};
  const eventIds = {};

  try {
    // Test each user role
    // 测试每个用户角色
    for (const [role, userData] of Object.entries(testUsers)) {
      console.log(`\n📡 Testing ${role.toUpperCase()} WebSocket connection...`.yellow);
      console.log(`📡 测试${role.toUpperCase()} WebSocket连接...`.yellow);

      // Get JWT token
      // 获取JWT令牌
      const token = await getJWTToken(userData);
      if (!token) {
        console.error(`❌ Skipping ${role} tests - no token`.red);
        continue;
      }

      // Create WebSocket connection
      // 创建WebSocket连接
      const socket = await createWebSocketConnection(token, role);
      connections[role] = socket;

      // Set up broadcast listeners
      // 设置广播监听器
      listenForBroadcastEvents(socket, role);

      // Test user status updates
      // 测试用户状态更新
      testUserStatusUpdates(socket, role);

      // Test event participation
      // 测试活动参与
      const eventId = testEventParticipation(socket, role);
      eventIds[role] = eventId;

      // Test QR code scanning
      // 测试二维码扫描
      testQRCodeScanning(socket, role, eventId);

      // Test match results
      // 测试比赛结果
      testMatchResults(socket, role, eventId);

      // Test reward distribution
      // 测试奖励分配
      testRewardDistribution(socket, role, eventId);

      // Test connection health
      // 测试连接健康状况
      testConnectionHealth(socket, role);

      // Wait a bit between connections
      // 连接之间等待一段时间
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 All WebSocket connections established successfully!'.green);
    console.log('🎉 所有WebSocket连接已成功建立！'.green);
    console.log('\n📊 Monitoring real-time events for 30 seconds...'.cyan);
    console.log('📊 监控实时事件30秒...'.cyan);

    // Keep connections alive for testing
    // 保持连接活跃以供测试
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('❌ WebSocket test failed:'.red, error);
  } finally {
    // Clean up connections
    // 清理连接
    console.log('\n🔌 Closing WebSocket connections...'.yellow);
    console.log('🔌 关闭WebSocket连接...'.yellow);
    
    for (const [role, socket] of Object.entries(connections)) {
      if (socket && socket.connected) {
        socket.disconnect();
        console.log(`✅ ${role.toUpperCase()} connection closed`.green);
      }
    }
    
    console.log('\n🏁 WebSocket tests completed!'.rainbow);
    console.log('🏁 WebSocket测试完成！'.rainbow);
  }
}

// Run tests if called directly
// 如果直接调用则运行测试
if (require.main === module) {
  runWebSocketTests().catch(console.error);
}

module.exports = { runWebSocketTests }; 