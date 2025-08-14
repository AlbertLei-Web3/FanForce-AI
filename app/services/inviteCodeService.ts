// FanForce AI - 邀请码服务
// Invite Code Service - 确保邀请码的唯一性和终身性
// Ensures invite code uniqueness and lifetime persistence

export interface InviteCodeData {
  id: string
  userId: string
  inviteCode: string
  generatedAt: Date
  isActive: boolean
}

export interface InviteCodeGenerationResult {
  success: boolean
  inviteCode?: string
  error?: string
  isNew?: boolean
}

class InviteCodeService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  /**
   * 获取或生成用户的终身邀请码
   * Get or generate user's lifetime invite code
   * @param userId 用户ID / User ID
   * @returns 邀请码生成结果 / Invite code generation result
   */
  async getOrGenerateLifetimeInviteCode(userId: string): Promise<InviteCodeGenerationResult> {
    try {
      console.log('🔍 检查用户是否已有终身邀请码:', userId)
      
      // 首先检查用户是否已有邀请码 / First check if user already has an invite code
      const existingCode = await this.getUserLifetimeInviteCode(userId)
      
      if (existingCode) {
        console.log('✅ 用户已有终身邀请码:', existingCode.inviteCode)
        return {
          success: true,
          inviteCode: existingCode.inviteCode,
          isNew: false
        }
      }

      // 用户没有邀请码，生成新的 / User has no invite code, generate new one
      console.log('🆕 为用户生成新的终身邀请码:', userId)
      const newCode = await this.generateAndStoreLifetimeInviteCode(userId)
      
      if (newCode) {
        console.log('✅ 终身邀请码生成成功:', newCode)
        return {
          success: true,
          inviteCode: newCode,
          isNew: true
        }
      } else {
        throw new Error('Failed to generate invite code')
      }
    } catch (error) {
      console.error('❌ 获取或生成终身邀请码失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get or generate invite code'
      }
    }
  }

  /**
   * 获取用户的终身邀请码
   * Get user's lifetime invite code
   * @param userId 用户ID / User ID
   * @returns 邀请码数据或null / Invite code data or null
   */
  async getUserLifetimeInviteCode(userId: string): Promise<InviteCodeData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT id, lifetime_invite_code, invite_code_generated_at
            FROM users 
            WHERE id = $1 AND lifetime_invite_code IS NOT NULL
          `,
          params: [userId]
        })
      })

      if (!response.ok) {
        console.error('❌ 查询用户邀请码失败:', response.status, response.statusText)
        return null
      }

      const result = await response.json()
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0]
        return {
          id: row.id,
          userId: userId,
          inviteCode: row.lifetime_invite_code,
          generatedAt: new Date(row.invite_code_generated_at),
          isActive: true
        }
      }

      return null
    } catch (error) {
      console.error('❌ 查询用户邀请码时出错:', error)
      return null
    }
    }

  /**
   * 生成并存储终身邀请码
   * Generate and store lifetime invite code
   * @param userId 用户ID / User ID
   * @returns 生成的邀请码或null / Generated invite code or null
   */
  private async generateAndStoreLifetimeInviteCode(userId: string): Promise<string | null> {
    try {
      // 生成唯一的邀请码 / Generate unique invite code
      const inviteCode = await this.generateUniqueInviteCode()
      
      console.log('🔐 尝试存储邀请码到数据库:', { userId, inviteCode })
      
      // 使用事务确保原子性 / Use transaction to ensure atomicity
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            UPDATE users 
            SET lifetime_invite_code = $1, invite_code_generated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND lifetime_invite_code IS NULL
            RETURNING lifetime_invite_code
          `,
          params: [inviteCode, userId]
        })
      })

      if (!response.ok) {
        console.error('❌ 存储邀请码失败:', response.status, response.statusText)
        return null
      }

      const result = await response.json()
      
      if (result.rows && result.rows.length > 0) {
        console.log('✅ 邀请码存储成功:', inviteCode)
        return inviteCode
      } else {
        // 可能其他进程已经生成了邀请码 / Another process may have generated the code
        console.log('⚠️ 邀请码可能已被其他进程生成，重新查询')
        const existingCode = await this.getUserLifetimeInviteCode(userId)
        return existingCode?.inviteCode || null
      }
    } catch (error) {
      console.error('❌ 生成并存储邀请码失败:', error)
      return null
    }
  }

  /**
   * 生成唯一的邀请码
   * Generate unique invite code
   * @returns 唯一的邀请码 / Unique invite code
   */
  private async generateUniqueInviteCode(): Promise<string> {
    const prefix = 'FF'
    const separator = '-'
    const length = 6
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    
    let code: string
    let attempts = 0
    const maxAttempts = 100
    
    console.log('🎲 开始生成唯一邀请码...')
    
    do {
      code = prefix + separator
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length)
        code += alphabet[randomIndex]
      }
      attempts++
      
      console.log(`🎯 尝试第 ${attempts} 次，生成邀请码: ${code}`)
      
      // 防止无限循环 / Prevent infinite loop
      if (attempts > maxAttempts) {
        console.error(`❌ 达到最大尝试次数 ${maxAttempts}，无法生成唯一邀请码`)
        throw new Error('Failed to generate unique invite code after maximum attempts')
      }
      
      // 检查是否已被使用 / Check if code is already in use
      const isUsed = await this.isCodeInUse(code)
      if (!isUsed) {
        console.log(`✅ 找到唯一邀请码: ${code}`)
        return code
      }
      
      console.log(`⚠️ 邀请码 ${code} 已被使用，继续尝试...`)
    } while (true) // 改为无限循环，因为我们在循环内部处理退出条件 / Change to infinite loop since we handle exit condition inside
    
    // 这里永远不会执行到，但为了TypeScript类型检查 / This will never execute, but for TypeScript type checking
    throw new Error('Unexpected error in generateUniqueInviteCode')
  }

  /**
   * 检查邀请码是否已被使用
   * Check if invite code is already in use
   * @param code 邀请码 / Invite code
   * @returns 是否已被使用 / Whether already in use
   */
  private async isCodeInUse(code: string): Promise<boolean> {
    try {
      console.log('🔍 检查邀请码是否已被使用:', code)
      
      const response = await fetch(`${this.baseUrl}/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT COUNT(*) as count
            FROM users 
            WHERE lifetime_invite_code = $1
          `,
          params: [code]
        })
      })

      if (!response.ok) {
        console.error('❌ 检查邀请码使用状态失败:', response.status, response.statusText)
        return false // 如果检查失败，假设可用 / If check fails, assume available
      }

      const result = await response.json()
      console.log('📊 邀请码使用状态检查结果:', result)
      
      const isUsed = result.rows && result.rows.length > 0 && parseInt(result.rows[0].count) > 0
      console.log(`🔍 邀请码 ${code} ${isUsed ? '已被使用' : '可用'}`)
      
      return isUsed
    } catch (error) {
      console.error('❌ 检查邀请码使用状态时出错:', error)
      return false // 如果检查失败，假设可用 / If check fails, assume available
    }
  }

  /**
   * 验证邀请码格式
   * Validate invite code format
   * @param code 邀请码 / Invite code
   * @returns 是否格式正确 / Whether format is correct
   */
  validateInviteCodeFormat(code: string): boolean {
    const pattern = /^FF-[A-Z0-9]{6}$/
    return pattern.test(code)
  }

  /**
   * 格式化邀请码显示
   * Format invite code for display
   * @param code 邀请码 / Invite code
   * @returns 格式化后的邀请码 / Formatted invite code
   */
  formatInviteCode(code: string): string {
    if (!this.validateInviteCodeFormat(code)) {
      return code
    }
    
    const parts = code.split('-')
    if (parts.length === 2) {
      return `${parts[0]}-${parts[1].match(/.{1,4}/g)?.join(' ') || parts[1]}`
    }
    return code
  }

  /**
   * 生成邀请链接
   * Generate invite link
   * @param code 邀请码 / Invite code
   * @param baseUrl 基础URL / Base URL
   * @returns 邀请链接 / Invite link
   */
  generateInviteLink(code: string, baseUrl: string = window.location.origin): string {
    return `${baseUrl}/register?invite=${code}`
  }
}

// 创建单例实例 / Create singleton instance
export const inviteCodeService = new InviteCodeService()
