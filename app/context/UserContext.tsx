// FanForce AI - 用户上下文管理器
// User Context Manager - 全局用户状态管理，包含角色认证和会话管理
// Global user state management with role authentication and session management
// 关联文件:
// - Web3Context.tsx: 钱包连接管理
// - ICPContext.tsx: ICP身份验证管理
// - Backend API: 用户认证和角色验证
// - PostgreSQL: 用户数据存储

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useWeb3 } from './Web3Context'
import { useICP } from './ICPContext'

// 用户角色枚举 / User Role Enum
export enum UserRole {
  SUPER_ADMIN = 'super_admin', // 超级管理员 / Super Administrator (Development)
  ADMIN = 'admin',           // 系统管理员 / System Administrator
  AMBASSADOR = 'ambassador', // 校园大使 / Campus Ambassador
  ATHLETE = 'athlete',       // 学生运动员 / Student Athlete
  AUDIENCE = 'audience'      // 观众支持者 / Audience Supporter
}

// 用户信息接口 / User Information Interface
export interface UserInfo {
  id: string
  address: string
  role: UserRole
  username?: string
  email?: string
  profilePhoto?: string
  createdAt: string
  lastLogin: string
  // 新增：ICP相关信息 / New: ICP-related information
  icpPrincipalId?: string
  icpVerified?: boolean
  icpLastVerified?: string
  // 角色特定信息 / Role-specific information
  roleData?: {
    // 管理员特有数据 / Admin-specific data
    adminLevel?: number
    permissions?: string[]
    // 大使特有数据 / Ambassador-specific data
    campusId?: string
    eventsCreated?: number
    totalCommission?: number
    // 运动员特有数据 / Athlete-specific data
    ranking?: number
    winRate?: number
    totalMatches?: number
    isActive?: boolean
    // 观众特有数据 / Audience-specific data
    totalStaked?: number
    totalWinnings?: number
    tierLevel?: number
  }
}

// 认证状态接口 / Authentication State Interface
export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null
  sessionToken: string | null
  error: string | null
}

// 新增：ICP集成状态接口 / New: ICP Integration State Interface
export interface ICPIntegrationState {
  isICPLoggedIn: boolean
  principalId: string | null
  isVerified: boolean
  verificationData: any | null
  lastVerified: string | null
  operationLogs: any[]
  logsLastUpdated: string | null
}

// 用户上下文接口 / User Context Interface
interface UserContextType {
  // 认证状态 / Authentication State
  authState: AuthState
  
  // 新增：ICP集成状态 / New: ICP Integration State
  icpIntegrationState: ICPIntegrationState
  
  // 认证方法 / Authentication Methods
  login: (signature: string, message: string) => Promise<boolean>
  loginWithICP: (principalId: string) => Promise<boolean> // 新增ICP登录方法 / Add ICP login method
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  
  // 新增：ICP集成方法 / New: ICP Integration Methods
  refreshICPStatus: () => Promise<void>
  verifyICPIdentity: () => Promise<boolean>
  refreshICPLogs: () => Promise<void>
  
  // 用户信息方法 / User Information Methods
  updateUserInfo: (updates: Partial<UserInfo>) => Promise<boolean>
  uploadProfilePhoto: (file: File) => Promise<string | null>
  
  // 角色检查方法 / Role Checking Methods
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
  isAmbassador: () => boolean
  isAthlete: () => boolean
  isAudience: () => boolean
  isSuperAdmin: () => boolean
  
  // 仪表板路由方法 / Dashboard Routing Methods
  getDashboardPath: () => string
  getDefaultRoute: () => string
  
  // 开发者方法 / Developer Methods (简化版 / Simplified)
  isDevelopmentMode: () => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// 用户上下文提供者组件 / User Context Provider Component
export function UserProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWeb3()
  const { 
    authState: icpAuthState, 
    verificationState, 
    operationLogState,
    verifyIdentity,
    refreshOperationLogs
  } = useICP()
  
  // 认证状态管理 / Authentication State Management
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    sessionToken: null,
    error: null
  })

  // 新增：ICP集成状态管理 / New: ICP Integration State Management
  const [icpIntegrationState, setIcpIntegrationState] = useState<ICPIntegrationState>({
    isICPLoggedIn: false,
    principalId: null,
    isVerified: false,
    verificationData: null,
    lastVerified: null,
    operationLogs: [],
    logsLastUpdated: null
  })

  // 开发模式检查 / Development Mode Check
  const isDevelopmentMode = useCallback((): boolean => {
    return process.env.NODE_ENV === 'development'
  }, [])

  // 新增：同步ICP状态到用户上下文 / New: Sync ICP state to user context
  useEffect(() => {
    if (icpAuthState.isAuthenticated && icpAuthState.principalId) {
      setIcpIntegrationState(prev => ({
        ...prev,
        isICPLoggedIn: true,
        principalId: icpAuthState.principalId,
        isVerified: verificationState.isVerified,
        verificationData: verificationState.verificationData,
        lastVerified: verificationState.lastVerified ? new Date(verificationState.lastVerified).toISOString() : null
      }))
    } else {
      setIcpIntegrationState(prev => ({
        ...prev,
        isICPLoggedIn: false,
        principalId: null,
        isVerified: false,
        verificationData: null,
        lastVerified: null
      }))
    }
  }, [icpAuthState.isAuthenticated, icpAuthState.principalId, verificationState.isVerified, verificationState.verificationData, verificationState.lastVerified])

  // 新增：同步ICP操作日志到用户上下文 / New: Sync ICP operation logs to user context
  useEffect(() => {
    if (operationLogState.operations.length > 0) {
      setIcpIntegrationState(prev => ({
        ...prev,
        operationLogs: operationLogState.operations,
        logsLastUpdated: operationLogState.lastUpdated ? new Date(operationLogState.lastUpdated).toISOString() : null
      }))
    }
  }, [operationLogState.operations, operationLogState.lastUpdated])

  // 初始化时检查已存在的会话 / Check existing session on initialization
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔧 开始初始化认证状态 / Starting auth initialization...')
      
      const storedToken = localStorage.getItem('fanforce_session_token')
      const storedUser = localStorage.getItem('fanforce_user_info')
      
      console.log('🔧 本地存储信息 / Local storage info:')
      console.log('  - Token:', storedToken ? '存在 / Exists' : '不存在 / Not found')
      console.log('  - User:', storedUser ? '存在 / Exists' : '不存在 / Not found')
      
      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser)
          console.log('🔧 解析用户信息成功 / Successfully parsed user info:', user)
          
          // 开发模式：跳过后端验证，直接使用存储的信息 / Development mode: skip backend verification, use stored info directly
          if (isDevelopmentMode() || storedToken.startsWith('dev-token-')) {
            console.log('🔧 开发模式：跳过后端验证，直接使用本地存储的用户信息 / Development mode: skipping backend verification, using local stored user info')
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user,
              sessionToken: storedToken,
              error: null
            })
            console.log('✅ 认证状态设置完成 / Auth state set successfully')
          } else {
            // 生产模式：需要验证token / Production mode: need to verify token
            if (isConnected) {
              const isValid = await verifySessionToken(storedToken)
              
              if (isValid) {
                setAuthState({
                  isAuthenticated: true,
                  isLoading: false,
                  user,
                  sessionToken: storedToken,
                  error: null
                })
              } else {
                // Token无效，清除本地存储 / Invalid token, clear local storage
                localStorage.removeItem('fanforce_session_token')
                localStorage.removeItem('fanforce_user_info')
              }
            } else {
              // 生产模式下钱包未连接，清除无效的本地存储 / Production mode wallet not connected, clear invalid local storage
              console.log('⚠️ 生产模式：钱包未连接，清除本地存储 / Production mode: wallet not connected, clearing local storage')
              localStorage.removeItem('fanforce_session_token')
              localStorage.removeItem('fanforce_user_info')
            }
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          localStorage.removeItem('fanforce_session_token')
          localStorage.removeItem('fanforce_user_info')
        }
      } else {
        console.log('❌ 本地存储中没有找到用户信息 / No user info found in local storage')
      }
    }

    initializeAuth()
  }, []) // 移除isConnected依赖，避免钱包连接状态影响认证初始化 / Remove isConnected dependency to avoid wallet connection affecting auth initialization

  // 钱包地址变化时检查用户 / Check user when wallet address changes
  useEffect(() => {
    // 开发模式下跳过钱包地址检查，避免影响认证状态 / Skip wallet address check in development mode to avoid affecting auth state
    if (isDevelopmentMode()) {
      return
    }
    
    if (address && authState.user && authState.user.address !== address) {
      // 钱包地址变化，需要重新认证 / Wallet address changed, re-authentication required
      console.log('🔄 钱包地址变化，重新认证 / Wallet address changed, re-authenticating')
      logout()
    }
  }, [address, authState.user, isDevelopmentMode])

  // 用户登录方法 / User Login Method
  const login = async (signature: string, message: string): Promise<boolean> => {
    // 检查是否是开发模式的模拟登录 / Check if it's a development mode mock login
    if (signature.startsWith('dev-mock-')) {
      // 开发模式：读取已存储的用户数据并设置认证状态 / Dev mode: read stored user data and set auth state
      try {
        const storedToken = localStorage.getItem('fanforce_session_token')
        const storedUser = localStorage.getItem('fanforce_user_info')
        
        if (storedToken && storedUser) {
          const user = JSON.parse(storedUser)
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user,
            sessionToken: storedToken,
            error: null
          })
          return true
        }
      } catch (error) {
        console.error('Dev mode login error:', error)
      }
      return false
    }

    if (!address) {
      setAuthState(prev => ({ ...prev, error: 'No wallet connected' }))
      return false
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // 发送签名到后端进行验证 / Send signature to backend for verification
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { user, token } = data
        
        // 存储用户信息和token / Store user information and token
        localStorage.setItem('fanforce_session_token', token)
        localStorage.setItem('fanforce_user_info', JSON.stringify(user))
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          sessionToken: token,
          error: null
        })
        
        return true
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.message || 'Login failed'
        }))
        return false
      }
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Network error during login'
      }))
      return false
    }
  }

  // ICP身份登录方法 / ICP Identity Login Method
  const loginWithICP = async (principalId: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🔐 开始ICP身份登录 / Starting ICP Identity login with Principal ID:', principalId)
      
      // 发送Principal ID到后端进行ICP认证 / Send Principal ID to backend for ICP authentication
      const response = await fetch('http://localhost:3001/api/auth/icp-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          principalId
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { user, token } = data
        
        console.log('✅ ICP身份登录成功 / ICP Identity login successful:', user)
        
        // 存储用户信息和token / Store user information and token
        localStorage.setItem('fanforce_session_token', token)
        localStorage.setItem('fanforce_user_info', JSON.stringify(user))
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          sessionToken: token,
          error: null
        })
        
        return true
      } else {
        console.error('❌ ICP身份登录失败 / ICP Identity login failed:', data.message)
        setAuthState(prev => ({ ...prev, isLoading: false, error: data.message || 'ICP login failed' }))
        return false
      }
    } catch (error) {
      console.error('❌ ICP登录请求错误 / ICP login request error:', error)
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'ICP登录失败，请重试 / ICP login failed, please retry' 
      }))
      return false
    }
  }

  // 用户登出方法 / User Logout Method
  const logout = async (): Promise<void> => {
    try {
      // 开发模式：跳过后端登出调用 / Development mode: skip backend logout call
      if (!isDevelopmentMode() && authState.sessionToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.sessionToken}`,
            'Content-Type': 'application/json',
          }
        })
      }
    } catch (error) {
      console.error('Logout request failed:', error)
    }

    // 清除本地存储和状态 / Clear local storage and state
    localStorage.removeItem('fanforce_session_token')
    localStorage.removeItem('fanforce_user_info')
    
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      sessionToken: null,
      error: null
    })
  }

  // 刷新会话方法 / Refresh Session Method
  const refreshSession = async (): Promise<void> => {
    if (!authState.sessionToken) return

    try {
      const response = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const { user, token } = data
        
        localStorage.setItem('fanforce_session_token', token)
        localStorage.setItem('fanforce_user_info', JSON.stringify(user))
        
        setAuthState(prev => ({
          ...prev,
          user,
          sessionToken: token
        }))
      } else {
        // 刷新失败，需要重新登录 / Refresh failed, need to re-login
        await logout()
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      await logout()
    }
  }

  // 验证会话token / Verify Session Token
  const verifySessionToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      return response.ok
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  // 更新用户信息方法 / Update User Information Method
  const updateUserInfo = async (updates: Partial<UserInfo>): Promise<boolean> => {
    if (!authState.sessionToken) return false

    try {
      const response = await fetch('http://localhost:3001/api/user/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const updatedUser = { ...authState.user, ...updates } as UserInfo
        
        localStorage.setItem('fanforce_user_info', JSON.stringify(updatedUser))
        setAuthState(prev => ({
          ...prev,
          user: updatedUser
        }))
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('User update failed:', error)
      return false
    }
  }

  // 上传用户头像方法 / Upload Profile Photo Method
  const uploadProfilePhoto = async (file: File): Promise<string | null> => {
    if (!authState.sessionToken) return null

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('http://localhost:3001/api/user/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 更新用户信息中的头像URL / Update profile photo URL in user info
        await updateUserInfo({ profilePhoto: data.photoUrl })
        return data.photoUrl
      }
      
      return null
    } catch (error) {
      console.error('Photo upload failed:', error)
      return null
    }
  }

  // 角色检查方法 / Role Checking Methods
  const hasRole = (role: UserRole): boolean => {
    return authState.user?.role === role
  }

  const hasPermission = (permission: string): boolean => {
    return authState.user?.roleData?.permissions?.includes(permission) || false
  }

  const isAdmin = (): boolean => hasRole(UserRole.ADMIN)
  const isAmbassador = (): boolean => hasRole(UserRole.AMBASSADOR)
  const isAthlete = (): boolean => hasRole(UserRole.ATHLETE)
  const isAudience = (): boolean => hasRole(UserRole.AUDIENCE)
  const isSuperAdmin = (): boolean => hasRole(UserRole.SUPER_ADMIN)

  // 简化的开发者方法 / Simplified Developer Methods - removed complex role switching

  // 仪表板路由方法 / Dashboard Routing Methods
  const getDashboardPath = useCallback((): string => {
    if (!authState.user) return '/'
    
    // 简化逻辑：移除复杂的角色切换，直接根据用户角色跳转 / Simplified logic: remove complex role switching
    switch (authState.user.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return '/dashboard/admin'
      case UserRole.AMBASSADOR:
        return '/dashboard/ambassador'
      case UserRole.ATHLETE:
        return '/dashboard/athlete'
      case UserRole.AUDIENCE:
        return '/dashboard/audience'
      default:
        return '/dashboard/audience' // 默认跳转到观众页面 / Default to audience dashboard
    }
  }, [authState.user?.role])

  const getDefaultRoute = useCallback((): string => {
    return authState.isAuthenticated ? getDashboardPath() : '/'
  }, [authState.isAuthenticated, getDashboardPath])

  // 新增：ICP集成方法实现 / New: ICP Integration Methods Implementation
  const refreshICPStatus = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 刷新ICP状态...')
      if (icpAuthState.isAuthenticated && icpAuthState.principalId) {
        await verifyIdentity()
      }
    } catch (error) {
      console.error('❌ 刷新ICP状态失败:', error)
    }
  }, [icpAuthState.isAuthenticated, icpAuthState.principalId, verifyIdentity])

  const verifyICPIdentity = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 验证ICP身份...')
      if (icpAuthState.isAuthenticated && icpAuthState.principalId) {
        return await verifyIdentity()
      }
      return false
    } catch (error) {
      console.error('❌ ICP身份验证失败:', error)
      return false
    }
  }, [icpAuthState.isAuthenticated, icpAuthState.principalId, verifyIdentity])

  const refreshICPLogs = useCallback(async (): Promise<void> => {
    try {
      console.log('📝 刷新ICP操作日志...')
      if (icpAuthState.isAuthenticated && icpAuthState.principalId) {
        await refreshOperationLogs()
      }
    } catch (error) {
      console.error('❌ 刷新ICP操作日志失败:', error)
    }
  }, [icpAuthState.isAuthenticated, icpAuthState.principalId, refreshOperationLogs])

  // 上下文值 / Context Value
  const contextValue: UserContextType = {
    authState,
    icpIntegrationState, // 新增：ICP集成状态 / New: ICP Integration State
    login,
    loginWithICP, // 添加ICP登录方法 / Add ICP login method
    logout,
    refreshSession,
    refreshICPStatus, // 新增：刷新ICP状态 / New: Refresh ICP Status
    verifyICPIdentity, // 新增：验证ICP身份 / New: Verify ICP Identity
    refreshICPLogs, // 新增：刷新ICP日志 / New: Refresh ICP Logs
    updateUserInfo,
    uploadProfilePhoto,
    hasRole,
    hasPermission,
    isAdmin,
    isAmbassador,
    isAthlete,
    isAudience,
    isSuperAdmin,
    getDashboardPath,
    getDefaultRoute,
    isDevelopmentMode
  }

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

// 使用用户上下文的Hook / Hook to use User Context
export function useUser(): UserContextType {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// 导出用户角色枚举供其他组件使用 / Export UserRole enum for other components
export { UserRole as Role } 