// FanForce AI - ICP Identity Context / FanForce AI - ICP身份上下文
// Context for managing ICP Internet Identity authentication / 管理ICP Internet Identity认证的上下文
// Integrates with existing ICP service for seamless authentication / 与现有ICP服务集成，实现无缝认证

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthClient } from '@dfinity/auth-client'
import { Identity } from '@dfinity/agent'
import { icpService } from '@/app/utils/icpService'

// ICP身份状态接口 / ICP Identity State Interface
interface ICPAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  principalId: string | null
  identity: Identity | null
  error: string | null
}

// ICP上下文接口 / ICP Context Interface
interface ICPContextType {
  // 认证状态 / Authentication State
  authState: ICPAuthState
  
  // 认证方法 / Authentication Methods
  login: () => Promise<string | false>
  logout: () => Promise<void>
  
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
  }, [])

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
    login,
    logout,
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
    throw new Error('useICP must be used within ICPProvider')
  }
  return context
}

