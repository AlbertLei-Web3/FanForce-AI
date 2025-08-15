// FanForce AI - ICP Identity Context / FanForce AI - ICP身份上下文
// Context for managing ICP Internet Identity authentication / 管理ICP Internet Identity认证的上下文
// Integrates with existing ICP service for seamless authentication / 与现有ICP服务集成，实现无缝认证

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Identity } from '@dfinity/agent'
import { icpService, UserIdentity, OperationLog, InviteCodeVerification } from '@/app/utils/icpService'

// ICP身份状态接口 / ICP Identity State Interface
interface ICPAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  principalId: string | null
  identity: Identity | null
  error: string | null
}

// 新增：ICP验证状态接口 / New: ICP Verification State Interface
interface ICPVerificationState {
  isVerified: boolean
  verificationData: UserIdentity | null
  lastVerified: number | null
  verificationError: string | null
}

// 新增：链上操作日志状态接口 / New: Blockchain Operation Log State Interface
interface ICPOperationLogState {
  operations: OperationLog[]
  isLoading: boolean
  lastUpdated: number | null
  error: string | null
}

// ICP上下文接口 / ICP Context Interface
interface ICPContextType {
  // 认证状态 / Authentication State
  authState: ICPAuthState
  
  // 新增：验证状态 / New: Verification State
  verificationState: ICPVerificationState
  
  // 新增：操作日志状态 / New: Operation Log State
  operationLogState: ICPOperationLogState
  
  // 认证方法 / Authentication Methods
  login: () => Promise<string | false>
  logout: () => Promise<void>
  
  // 新增：验证方法 / New: Verification Methods
  verifyIdentity: () => Promise<boolean>
  verifyInviteCode: (code: string) => Promise<InviteCodeVerification | null>
  
  // 新增：操作日志方法 / New: Operation Log Methods
  refreshOperationLogs: () => Promise<void>
  logOperation: (action: string, metadata?: any) => Promise<boolean>
  
  // 用户信息方法 / User Information Methods
  getUserProfile: () => Promise<any>
  updateUserProfile: (updates: any) => Promise<boolean>
  
  // 网络状态方法 / Network Status Methods
  getNetworkStatus: () => Promise<any>
  getCanisterStats: () => Promise<any>
}

const ICPContext = createContext<ICPContextType | undefined>(undefined)

// ICP上下文提供者组件 / ICP Context Provider Component
export function ICPProvider({ children }: { children: ReactNode }) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null)
  const [authState, setAuthState] = useState<ICPAuthState>({
    isAuthenticated: false,
    isLoading: true,
    principalId: null,
    identity: null,
    error: null
  })

  // 新增：验证状态 / New: Verification State
  const [verificationState, setVerificationState] = useState<ICPVerificationState>({
    isVerified: false,
    verificationData: null,
    lastVerified: null,
    verificationError: null
  })

  // 新增：操作日志状态 / New: Operation Log State
  const [operationLogState, setOperationLogState] = useState<ICPOperationLogState>({
    operations: [],
    isLoading: false,
    lastUpdated: null,
    error: null
  })

  // 新增：验证ICP身份 / New: Verify ICP Identity
  const verifyIdentity = useCallback(async (): Promise<boolean> => {
    if (!authState.principalId) {
      console.warn('⚠️ 无法验证：Principal ID不存在 / Cannot verify: Principal ID not exists')
      return false
    }

    try {
      console.log('🔍 开始验证ICP身份... / Starting ICP identity verification...')
      setVerificationState(prev => ({ ...prev, verificationError: null }))

      const verificationData = await icpService.verifyUserIdentity(authState.principalId)
      
      if (verificationData) {
        setVerificationState({
          isVerified: true,
          verificationData,
          lastVerified: Date.now(),
          verificationError: null
        })
        
        console.log('✅ ICP身份验证成功 / ICP identity verification successful:', verificationData)
        
        // 自动刷新操作日志 / Auto-refresh operation logs
        await refreshOperationLogs()
        
        return true
      } else {
        setVerificationState({
          isVerified: false,
          verificationData: null,
          lastVerified: null,
          verificationError: 'Verification failed'
        })
        
        console.warn('⚠️ ICP身份验证失败 / ICP identity verification failed')
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown verification error'
      setVerificationState({
        isVerified: false,
        verificationData: null,
        lastVerified: null,
        verificationError: errorMessage
      })
      
      console.error('❌ ICP身份验证出错 / ICP identity verification error:', error)
      return false
    }
  }, [authState.principalId])

  // 新增：验证邀请码 / New: Verify Invite Code
  const verifyInviteCode = useCallback(async (code: string): Promise<InviteCodeVerification | null> => {
    try {
      console.log('🔍 验证邀请码:', code)
      return await icpService.verifyInviteCode(code)
    } catch (error) {
      console.error('❌ 邀请码验证失败:', error)
      return null
    }
  }, [])

  // 新增：刷新操作日志 / New: Refresh Operation Logs
  const refreshOperationLogs = useCallback(async (): Promise<void> => {
    if (!authState.principalId) return

    try {
      setOperationLogState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const operations = await icpService.getUserOperationHistory(authState.principalId)
      
      setOperationLogState({
        operations,
        isLoading: false,
        lastUpdated: Date.now(),
        error: null
      })
      
      console.log('✅ 操作日志刷新成功 / Operation logs refreshed successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setOperationLogState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      
      console.error('❌ 操作日志刷新失败 / Operation logs refresh failed:', error)
    }
  }, [authState.principalId])

  // 新增：记录操作到链上 / New: Log Operation to Blockchain
  const logOperation = useCallback(async (action: string, metadata?: any): Promise<boolean> => {
    if (!authState.principalId) {
      console.warn('⚠️ 无法记录操作：Principal ID不存在 / Cannot log operation: Principal ID not exists')
      return false
    }

    try {
      console.log('📝 记录操作到链上:', { action, metadata })
      
      const operationLog = await icpService.logOperation(
        authState.principalId, // 使用Principal ID作为用户ID / Use Principal ID as user ID
        authState.principalId,
        action,
        metadata
      )
      
      if (operationLog) {
        // 更新本地操作日志状态 / Update local operation log state
        setOperationLogState(prev => ({
          ...prev,
          operations: [operationLog, ...prev.operations],
          lastUpdated: Date.now()
        }))
        
        console.log('✅ 操作记录成功 / Operation logged successfully')
        return true
      } else {
        console.warn('⚠️ 操作记录失败 / Operation logging failed')
        return false
      }
    } catch (error) {
      console.error('❌ 操作记录出错 / Operation logging error:', error)
      return false
    }
  }, [authState.principalId])

  // 初始化ICP身份客户端 / Initialize ICP Identity Client
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔧 初始化ICP身份客户端 / Initializing ICP Identity Client...')
        
        // 创建ICP身份客户端 / Create ICP Identity Client
        const client = await AuthClient.create()
        setAuthClient(client)
        
        // 检查是否已登录 / Check if already authenticated
        const isLoggedIn = await client.isAuthenticated()
        
        if (isLoggedIn) {
          const identity = client.getIdentity()
          const principalId = identity.getPrincipal().toString()
          
          console.log('✅ ICP身份已登录 / ICP Identity already logged in:', principalId)
          
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            principalId,
            identity,
            error: null
          })

          // 新增：自动验证身份 / New: Auto-verify identity
          await verifyIdentity()
        } else {
          console.log('❌ ICP身份未登录 / ICP Identity not logged in')
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('❌ ICP身份初始化失败 / ICP Identity initialization failed:', error)
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          principalId: null,
          identity: null,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    initializeAuth()
  }, [verifyIdentity])

  // ICP登录方法 / ICP Login Method
  const login = async (): Promise<string | false> => {
    if (!authClient) {
      console.error('❌ ICP身份客户端未初始化 / ICP Identity client not initialized')
      return false
    }

    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      console.log('🔐 开始ICP身份登录 / Starting ICP Identity login...')
      
      return new Promise((resolve) => {
        authClient.login({
          // 暂时使用生产环境的Internet Identity，避免本地开发环境问题
          // Temporarily use production Internet Identity to avoid local dev environment issues
          identityProvider: 'https://identity.ic0.app',
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds / 7天（纳秒）
          onSuccess: () => {
            console.log('✅ ICP身份登录成功 / ICP Identity login successful')
            
            const identity = authClient.getIdentity()
            const principalId = identity.getPrincipal().toString()
            
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              principalId,
              identity,
              error: null
            })
            
            console.log('🔐 ICP身份认证成功，Principal ID:', principalId)
            // 返回principalId而不是boolean，这样可以立即使用
            // Return principalId instead of boolean so it can be used immediately
            resolve(principalId)
          },
          onError: (error: string | Error) => {
            console.error('❌ ICP身份登录失败 / ICP Identity login failed:', error)
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: typeof error === 'string' ? error : error.message || 'Login failed'
            }))
            resolve(false)
          }
        })
      })
    } catch (error: any) {
      console.error('❌ ICP登录过程中出错 / Error during ICP login:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }))
      return false
    }
  }

  // ICP登出方法 / ICP Logout Method
  const logout = async (): Promise<void> => {
    if (!authClient) return

    try {
      console.log('🚪 开始ICP身份登出 / Starting ICP Identity logout...')
      
      await authClient.logout()
      
      console.log('✅ ICP身份登出成功 / ICP Identity logout successful')
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        principalId: null,
        identity: null,
        error: null
      })
    } catch (error) {
      console.error('❌ ICP登出失败 / ICP logout failed:', error)
    }
  }

  // 获取用户档案 / Get User Profile
  const getUserProfile = async (): Promise<any> => {
    if (!authState.principalId) {
      throw new Error('User not authenticated')
    }
    
    // 使用现有的ICP服务获取用户档案 / Use existing ICP service to get user profile
    return await icpService.getAthleteProfile(authState.principalId)
  }

  // 更新用户档案 / Update User Profile
  const updateUserProfile = async (updates: any): Promise<boolean> => {
    if (!authState.principalId) {
      return false
    }
    
    // 这里可以调用ICP服务更新用户档案 / Here you can call ICP service to update user profile
    console.log('📝 更新ICP用户档案 / Updating ICP user profile:', updates)
    return true
  }

  // 获取网络状态 / Get Network Status
  const getNetworkStatus = async (): Promise<any> => {
    return await icpService.getNetworkStatus()
  }

  // 获取容器统计 / Get Canister Stats
  const getCanisterStats = async (): Promise<any> => {
    return await icpService.getCanisterStats()
  }

  // 上下文值 / Context Value
  const contextValue: ICPContextType = {
    authState,
    verificationState,
    operationLogState,
    login,
    logout,
    verifyIdentity,
    verifyInviteCode,
    refreshOperationLogs,
    logOperation,
    getUserProfile,
    updateUserProfile,
    getNetworkStatus,
    getCanisterStats
  }

  return (
    <ICPContext.Provider value={contextValue}>
      {children}
    </ICPContext.Provider>
  )
}

// ICP Hook / ICP Hook
export const useICP = () => {
  const context = useContext(ICPContext)
  if (!context) {
    console.error('❌ useICP Hook Error: ICPProvider not found in component tree')
    console.error('🔍 Please ensure your component is wrapped with ICPProvider')
    console.error('📁 Check your app/layout.tsx or component hierarchy')
    
    // 返回一个默认的context对象，避免应用崩溃
    // Return a default context object to prevent app crash
    return {
      authState: {
        isAuthenticated: false,
        isLoading: true,
        principalId: null,
        identity: null,
        error: 'ICPProvider not initialized'
      },
      verificationState: {
        isVerified: false,
        verificationData: null,
        lastVerified: null,
        verificationError: 'ICPProvider not initialized'
      },
      operationLogState: {
        operations: [],
        isLoading: false,
        lastUpdated: null,
        error: 'ICPProvider not initialized'
      },
      login: async () => {
        console.error('❌ ICP login called but provider not initialized')
        return false
      },
      logout: async () => {
        console.error('❌ ICP logout called but provider not initialized')
      },
      verifyIdentity: async () => {
        console.error('❌ ICP verifyIdentity called but provider not initialized')
        return false
      },
      verifyInviteCode: async () => {
        console.error('❌ ICP verifyInviteCode called but provider not initialized')
        return null
      },
      refreshOperationLogs: async () => {
        console.error('❌ ICP refreshOperationLogs called but provider not initialized')
      },
      logOperation: async () => {
        console.error('❌ ICP logOperation called but provider not initialized')
        return false
      },
      getUserProfile: async () => {
        console.error('❌ ICP getUserProfile called but provider not initialized')
        return null
      },
      updateUserProfile: async () => {
        console.error('❌ ICP updateUserProfile called but provider not initialized')
        return false
      },
      getNetworkStatus: async () => {
        console.error('❌ ICP getNetworkStatus called but provider not initialized')
        return {
          isConnected: false,
          canisterId: 'N/A',
          network: 'N/A',
          latency: 0
        }
      },
      getCanisterStats: async () => {
        console.error('❌ ICP getCanisterStats called but provider not initialized')
        return {
          totalAthletes: 0,
          totalBonuses: 0,
          totalSeasons: 0,
          totalDistributed: 0
        }
      }
    }
  }
  return context
}

