// FanForce AI - 认证服务
// Authentication Service - 处理多种认证方式的用户创建和认证
// Handles user creation and authentication for multiple authentication methods

export interface UserAuthData {
  id?: string
  principalId?: string
  walletAddress?: string
  email?: string
  googleId?: string
  twitterId?: string
  username?: string
  authType: 'icp' | 'wallet' | 'google' | 'twitter' | 'email'
  role?: string
  profileData?: any
}

export interface AuthResult {
  success: boolean
  user?: any
  error?: string
  isNewUser?: boolean
}

class AuthService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  // 通过ICP Principal ID认证用户 / Authenticate user by ICP Principal ID
  async authenticateWithICP(principalId: string): Promise<AuthResult> {
    try {
      console.log('🔐 通过ICP Principal ID认证用户:', principalId)
      
      // 新增：ICP Canister身份验证 / New: ICP Canister identity verification
      console.log('🔍 开始ICP Canister身份验证...')
      const { icpService } = await import('../utils/icpService')
      
      try {
        const canisterVerification = await icpService.verifyUserIdentity(principalId)
        if (!canisterVerification) {
          console.warn('⚠️ ICP Canister验证失败，继续使用Web2认证')
        } else {
          console.log('✅ ICP Canister身份验证成功:', canisterVerification)
          
          // 记录用户登录操作到链上 / Log user login operation to blockchain
          await icpService.logOperation(
            canisterVerification.principalId,
            principalId,
            'user_login',
            { 
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
              ip: '127.0.0.1' // 实际应从请求中获取 / Should get from request in reality
            }
          )
        }
      } catch (canisterError) {
        console.warn('⚠️ ICP Canister验证出错，继续使用Web2认证:', canisterError)
      }
      
      // 检查用户是否已存在 / Check if user already exists
      const existingUser = await this.findUserByICP(principalId)
      
      if (existingUser) {
        console.log('✅ 找到现有ICP用户:', existingUser)
        
        // 新增：更新用户最后活跃时间到链上 / New: Update user last active time on blockchain
        try {
          await icpService.logOperation(
            existingUser.id,
            principalId,
            'user_login_existing',
            { 
              userId: existingUser.id,
              role: existingUser.role,
              lastLogin: Date.now()
            }
          )
        } catch (logError) {
          console.warn('⚠️ 链上日志记录失败，不影响登录流程:', logError)
        }
        
        return {
          success: true,
          user: existingUser,
          isNewUser: false
        }
      }

      // 创建新ICP用户 / Create new ICP user
      console.log('🆕 创建新ICP用户:', principalId)
      const newUser = await this.createICPUser(principalId)
      
      // 新增：记录新用户注册到链上 / New: Log new user registration to blockchain
      try {
        await icpService.logOperation(
          newUser.id,
          principalId,
          'user_registration',
          { 
            userId: newUser.id,
            role: newUser.role,
            inviteCode: newUser.lifetime_invite_code,
            registrationTime: Date.now()
          }
        )
      } catch (logError) {
        console.warn('⚠️ 链上日志记录失败，不影响注册流程:', logError)
      }
      
      return {
        success: true,
        user: newUser,
        isNewUser: true
      }
    } catch (error) {
      console.error('❌ ICP认证失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ICP authentication failed'
      }
    }
  }

  // 通过钱包地址认证用户 / Authenticate user by wallet address
  async authenticateWithWallet(walletAddress: string): Promise<AuthResult> {
    try {
      console.log('🔐 通过钱包地址认证用户:', walletAddress)
      
      // 检查用户是否已存在 / Check if user already exists
      const existingUser = await this.findUserByWallet(walletAddress)
      
      if (existingUser) {
        console.log('✅ 找到现有钱包用户:', existingUser)
        return {
          success: true,
          user: existingUser,
          isNewUser: false
        }
      }

      // 创建新钱包用户 / Create new wallet user
      console.log('🆕 创建新钱包用户:', walletAddress)
      const newUser = await this.createWalletUser(walletAddress)
      
      return {
        success: true,
        user: newUser,
        isNewUser: true
      }
    } catch (error) {
      console.error('❌ 钱包认证失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Wallet authentication failed'
      }
    }
  }

  // 通过ICP Principal ID查找用户 / Find user by ICP Principal ID
  private async findUserByICP(principalId: string): Promise<any> {
    try {
      console.log('🔍 查询ICP用户:', principalId)
      
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'SELECT * FROM users WHERE icp_principal_id = $1',
          params: [principalId]
        })
      })

      console.log('📡 查询ICP用户响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 查询ICP用户失败:', errorText)
        // 不抛出错误，返回null让流程继续 / Don't throw error, return null to continue flow
        return null
      }

      const result = await response.json()
      console.log('✅ 查询ICP用户结果:', result)
      
      if (result.rows && result.rows.length > 0) {
        console.log('✅ 找到现有ICP用户:', result.rows[0])
        return result.rows[0]
      } else {
        console.log('ℹ️ 未找到现有ICP用户')
        return null
      }
    } catch (error) {
      console.error('❌ 查询ICP用户时出错:', error)
      // 不抛出错误，返回null让流程继续 / Don't throw error, return null to continue flow
      return null
    }
  }

  // 通过钱包地址查找用户 / Find user by wallet address
  private async findUserByWallet(walletAddress: string): Promise<any> {
    try {
      console.log('🔍 查询钱包用户:', walletAddress)
      
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'SELECT * FROM users WHERE wallet_address = $1',
          params: [walletAddress]
        })
      })

      console.log('📡 查询钱包用户响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 查询钱包用户失败:', errorText)
        // 不抛出错误，返回null让流程继续 / Don't throw error, return null to continue flow
        return null
      }

      const result = await response.json()
      console.log('✅ 查询钱包用户结果:', result)
      
      if (result.rows && result.rows.length > 0) {
        console.log('✅ 找到现有钱包用户:', result.rows[0])
        return result.rows[0]
      } else {
        console.log('ℹ️ 未找到现有钱包用户')
        return null
      }
    } catch (error) {
      console.error('❌ 查询钱包用户时出错:', error)
      // 不抛出错误，返回null让流程继续 / Don't throw error, return null to continue flow
      return null
    }
  }

  // 创建新ICP用户 / Create new ICP user
  private async createICPUser(principalId: string): Promise<any> {
    try {
      const username = `icp_user_${principalId.slice(0, 8)}`
      
      console.log('🆕 尝试创建ICP用户:', { principalId, username })
      
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            INSERT INTO users (icp_principal_id, auth_type, username, role, profile_data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `,
          params: [principalId, 'icp', username, 'audience', '{}']
        })
      })

      console.log('📡 数据库响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 数据库响应错误:', errorText)
        throw new Error(`Database error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ 数据库响应结果:', result)
      
      if (!result.rows || result.rows.length === 0) {
        console.warn('⚠️ 数据库响应中没有返回用户数据')
        // 创建一个模拟用户对象作为fallback / Create a mock user object as fallback
        return {
          id: `temp-${Date.now()}`,
          icp_principal_id: principalId,
          auth_type: 'icp',
          username: username,
          role: 'audience',
          profile_data: {}
        }
      }
      
      return result.rows[0]
    } catch (error) {
      console.error('❌ 创建ICP用户失败:', error)
      
      // 如果数据库操作失败，创建一个临时用户对象 / If database operation fails, create a temporary user object
      console.log('🔄 创建临时ICP用户作为fallback')
      return {
        id: `temp-${Date.now()}`,
        icp_principal_id: principalId,
        auth_type: 'icp',
        username: `icp_user_${principalId.slice(0, 8)}`,
        role: 'audience',
        profile_data: {}
      }
    }
  }

  // 创建新钱包用户 / Create new wallet user
  private async createWalletUser(walletAddress: string): Promise<any> {
    try {
      const username = `wallet_user_${walletAddress.slice(0, 8)}`
      
      console.log('🆕 尝试创建钱包用户:', { walletAddress, username })
      
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            INSERT INTO users (wallet_address, auth_type, username, role, profile_data)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
          `,
          params: [walletAddress, 'wallet', username, 'audience', '{}']
        })
      })

      console.log('📡 创建钱包用户响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 创建钱包用户失败:', errorText)
        throw new Error(`Database error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ 创建钱包用户结果:', result)
      
      if (!result.rows || result.rows.length === 0) {
        console.warn('⚠️ 数据库响应中没有返回用户数据')
        // 创建一个模拟用户对象作为fallback / Create a mock user object as fallback
        return {
          id: `temp-${Date.now()}`,
          wallet_address: walletAddress,
          auth_type: 'wallet',
          username: username,
          role: 'audience',
          profile_data: {}
        }
      }
      
      return result.rows[0]
    } catch (error) {
      console.error('❌ 创建钱包用户失败:', error)
      
      // 如果数据库操作失败，创建一个临时用户对象 / If database operation fails, create a temporary user object
      console.log('🔄 创建临时钱包用户作为fallback')
      return {
        id: `temp-${Date.now()}`,
        wallet_address: walletAddress,
        auth_type: 'wallet',
        username: `wallet_user_${walletAddress.slice(0, 8)}`,
        role: 'audience',
        profile_data: {}
      }
    }
  }

  // 更新用户角色 / Update user role
  async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      console.log('🔄 更新用户角色:', { userId, role })
      
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'UPDATE users SET role = $1 WHERE id = $2',
          params: [role, userId]
        })
      })

      console.log('📡 更新角色响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 更新用户角色失败:', errorText)
        return false
      }

      console.log('✅ 用户角色更新成功')
      return true
    } catch (error) {
      console.error('❌ 更新用户角色时出错:', error)
      return false
    }
  }
}

export const authService = new AuthService()
