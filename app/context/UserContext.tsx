// FanForce AI - 用户上下文管理器
// User Context Manager - 全局用户状态管理，包含角色认证和会话管理
// Global user state management with role authentication and session management
// 关联文件:
// - Web3Context.tsx: 钱包连接管理
// - Backend API: 用户认证和角色验证
// - PostgreSQL: 用户数据存储

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useWeb3 } from './Web3Context'

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

// 用户上下文接口 / User Context Interface
interface UserContextType {
  // 认证状态 / Authentication State
  authState: AuthState
  
  // 认证方法 / Authentication Methods
  login: (signature: string, message: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  
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
  
  // 开发者方法 / Developer Methods (Super Admin Only)
  currentViewRole: UserRole | null
  switchRole: (role: UserRole) => void
  resetRole: () => void
  getAvailableRoles: () => UserRole[]
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// 用户上下文提供者组件 / User Context Provider Component
export function UserProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWeb3()
  
  // 认证状态管理 / Authentication State Management
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    sessionToken: null,
    error: null
  })

  // 开发者角色切换状态 / Developer Role Switching State
  const [currentViewRole, setCurrentViewRole] = useState<UserRole | null>(null)

  // 初始化时检查已存在的会话 / Check existing session on initialization
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('fanforce_session_token')
      const storedUser = localStorage.getItem('fanforce_user_info')
      
      if (storedToken && storedUser) {
        try {
          const user = JSON.parse(storedUser)
          
          // 检查是否是开发模式token / Check if it's a development mode token
          if (storedToken.startsWith('dev-token-')) {
            // 开发模式：直接使用存储的信息，不验证后端 / Dev mode: directly use stored info, no backend verification
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user,
              sessionToken: storedToken,
              error: null
            })
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
            }
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          localStorage.removeItem('fanforce_session_token')
          localStorage.removeItem('fanforce_user_info')
        }
      }
    }

    initializeAuth()
  }, [isConnected])

  // 钱包地址变化时检查用户 / Check user when wallet address changes
  useEffect(() => {
    if (address && authState.user && authState.user.address !== address) {
      // 钱包地址变化，需要重新认证 / Wallet address changed, re-authentication required
      logout()
    }
  }, [address, authState.user])

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

  // 用户登出方法 / User Logout Method
  const logout = async (): Promise<void> => {
    try {
      // 通知后端登出 / Notify backend of logout
      if (authState.sessionToken) {
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

  // 开发者方法 / Developer Methods (Super Admin Only)
  const switchRole = (role: UserRole): void => {
    if (!isSuperAdmin()) {
      console.warn('Role switching is only available for Super Admin users')
      return
    }
    setCurrentViewRole(role)
  }

  const resetRole = (): void => {
    if (!isSuperAdmin()) {
      console.warn('Role reset is only available for Super Admin users')
      return
    }
    setCurrentViewRole(null)
  }

  const getAvailableRoles = (): UserRole[] => {
    if (!isSuperAdmin()) return []
    return [UserRole.ADMIN, UserRole.AMBASSADOR, UserRole.ATHLETE, UserRole.AUDIENCE]
  }

  // 仪表板路由方法 / Dashboard Routing Methods
  const getDashboardPath = (): string => {
    if (!authState.user) return '/'
    
    // 如果是超级管理员且正在切换角色，使用当前视图角色 / If super admin and role switching, use current view role
    const effectiveRole = isSuperAdmin() && currentViewRole ? currentViewRole : authState.user.role
    
    switch (effectiveRole) {
      case UserRole.SUPER_ADMIN:
        return '/dashboard/admin' // Super admin uses admin dashboard by default
      case UserRole.ADMIN:
        return '/dashboard/admin'
      case UserRole.AMBASSADOR:
        return '/dashboard/ambassador'
      case UserRole.ATHLETE:
        return '/dashboard/athlete'
      case UserRole.AUDIENCE:
        return '/dashboard/audience'
      default:
        return '/'
    }
  }

  const getDefaultRoute = (): string => {
    return authState.isAuthenticated ? getDashboardPath() : '/'
  }

  // 上下文值 / Context Value
  const contextValue: UserContextType = {
    authState,
    login,
    logout,
    refreshSession,
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
    currentViewRole,
    switchRole,
    resetRole,
    getAvailableRoles
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