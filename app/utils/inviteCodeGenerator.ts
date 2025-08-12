// FanForce AI - 简化邀请码生成工具
// Simplified Invite Code Generator - 伴随账号终身的邀请码系统
// Lifetime invite code system that accompanies user accounts

export interface InviteCode {
  code: string
  userId: string
  createdAt: Date
  isActive: boolean
}

export interface InviteCodeUsage {
  inviteCode: string
  usedBy: string
  usedAt: Date
}

// 邀请码生成配置 / Invite Code Generation Configuration
const INVITE_CODE_CONFIG = {
  LENGTH: 6, // 邀请码长度 / Invite code length
  PREFIX: 'FF', // 前缀 / Prefix
  ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', // 字符集 / Character set
  SEPARATOR: '-' // 分隔符 / Separator
}

/**
 * 生成邀请码 / Generate invite code
 * @param userId 用户ID / User ID
 * @returns 邀请码对象 / Invite code object
 */
export function generateInviteCode(userId: string): InviteCode {
  // 生成随机邀请码 / Generate random invite code
  const randomCode = generateRandomCode()
  
  return {
    code: randomCode,
    userId,
    createdAt: new Date(),
    isActive: true
  }
}

/**
 * 生成随机邀请码 / Generate random invite code
 * @returns 随机邀请码字符串 / Random invite code string
 */
function generateRandomCode(): string {
  let code = INVITE_CODE_CONFIG.PREFIX + INVITE_CODE_CONFIG.SEPARATOR
  
  for (let i = 0; i < INVITE_CODE_CONFIG.LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * INVITE_CODE_CONFIG.ALPHABET.length)
    code += INVITE_CODE_CONFIG.ALPHABET[randomIndex]
  }
  
  return code
}

/**
 * 验证邀请码格式 / Validate invite code format
 * @param code 邀请码 / Invite code
 * @returns 是否有效 / Whether valid
 */
export function validateInviteCodeFormat(code: string): boolean {
  const pattern = new RegExp(`^${INVITE_CODE_CONFIG.PREFIX}${INVITE_CODE_CONFIG.SEPARATOR}[A-Z0-9]{${INVITE_CODE_CONFIG.LENGTH}}$`)
  return pattern.test(code)
}

/**
 * 验证邀请码是否可用 / Validate if invite code is usable
 * @param inviteCode 邀请码对象 / Invite code object
 * @returns 验证结果 / Validation result
 */
export function validateInviteCodeUsage(inviteCode: InviteCode): { isValid: boolean; reason?: string } {
  // 检查是否激活 / Check if active
  if (!inviteCode.isActive) {
    return { isValid: false, reason: 'Invite code is inactive' }
  }
  
  return { isValid: true }
}

/**
 * 使用邀请码 / Use invite code
 * @param inviteCode 邀请码对象 / Invite code object
 * @param usedBy 使用者ID / User ID who used the code
 * @returns 使用记录 / Usage record
 */
export function useInviteCode(inviteCode: InviteCode, usedBy: string): InviteCodeUsage {
  return {
    inviteCode: inviteCode.code,
    usedBy,
    usedAt: new Date()
  }
}

/**
 * 格式化邀请码显示 / Format invite code for display
 * @param code 邀请码 / Invite code
 * @returns 格式化后的邀请码 / Formatted invite code
 */
export function formatInviteCode(code: string): string {
  // 添加空格分隔，提高可读性 / Add spaces for better readability
  const parts = code.split(INVITE_CODE_CONFIG.SEPARATOR)
  if (parts.length === 2) {
    return `${parts[0]}${INVITE_CODE_CONFIG.SEPARATOR} ${parts[1].match(/.{1,4}/g)?.join(' ') || parts[1]}`
  }
  return code
}

/**
 * 生成邀请链接 / Generate invite link
 * @param code 邀请码 / Invite code
 * @param baseUrl 基础URL / Base URL
 * @returns 邀请链接 / Invite link
 */
export function generateInviteLink(code: string, baseUrl: string = window.location.origin): string {
  return `${baseUrl}/register?invite=${code}`
}

/**
 * 从URL中提取邀请码 / Extract invite code from URL
 * @param url URL字符串 / URL string
 * @returns 邀请码或null / Invite code or null
 */
export function extractInviteCodeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.searchParams.get('invite')
  } catch {
    return null
  }
}

/**
 * 生成批量邀请码 / Generate bulk invite codes
 * @param userId 用户ID / User ID
 * @param count 数量 / Count
 * @returns 邀请码数组 / Array of invite codes
 */
export function generateBulkInviteCodes(userId: string, count: number): InviteCode[] {
  const codes: InviteCode[] = []
  
  for (let i = 0; i < count; i++) {
    codes.push(generateInviteCode(userId))
  }
  
  return codes
}

/**
 * 获取邀请码统计信息 / Get invite code statistics
 * @param inviteCodes 邀请码数组 / Array of invite codes
 * @returns 统计信息 / Statistics
 */
export function getInviteCodeStats(inviteCodes: InviteCode[]) {
  const totalCodes = inviteCodes.length
  const activeCodes = inviteCodes.filter(code => code.isActive).length
  
  return {
    totalCodes,
    activeCodes,
    averageCodesPerUser: totalCodes > 0 ? totalCodes : 0
  }
}
