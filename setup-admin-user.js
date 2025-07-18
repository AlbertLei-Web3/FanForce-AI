// 设置管理员用户数据到本地存储 / Setup admin user data to localStorage
// 用于开发模式测试 / For development mode testing

console.log('🔧 开始设置管理员用户数据 / Starting admin user setup...')

// 管理员用户数据 / Admin user data
const adminUser = {
  id: 'd4e1f9dc-f1d7-40e4-93e3-08dfe2c8e56d',
  address: '0x1234567890123456789012345678901234567890',
  role: 'admin',
  username: 'Admin User',
  email: 'admin@fanforce.ai',
  createdAt: '2024-01-01T00:00:00.000Z',
  lastLogin: '2024-01-25T09:30:00.000Z'
}

const adminToken = 'dev-token-admin-1706178600000'

// 存储到localStorage / Store to localStorage
localStorage.setItem('fanforce_session_token', adminToken)
localStorage.setItem('fanforce_user_info', JSON.stringify(adminUser))

console.log('✅ 管理员用户数据设置完成 / Admin user data setup completed')
console.log('  - Token:', adminToken)
console.log('  - User:', adminUser)

// 验证存储 / Verify storage
const storedToken = localStorage.getItem('fanforce_session_token')
const storedUser = localStorage.getItem('fanforce_user_info')

console.log('🔍 验证存储 / Verify storage:')
console.log('  - Stored token:', storedToken)
console.log('  - Stored user:', storedUser)

if (storedToken && storedUser) {
  console.log('✅ 存储验证成功 / Storage verification successful')
  console.log('🔄 请刷新页面以重新加载认证状态 / Please refresh the page to reload authentication state')
  
  // 自动刷新页面 / Auto refresh page
  setTimeout(() => {
    console.log('🔄 自动刷新页面... / Auto refreshing page...')
    window.location.reload()
  }, 1000)
} else {
  console.log('❌ 存储验证失败 / Storage verification failed')
} 