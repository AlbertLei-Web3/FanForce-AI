// 全局钱包上下文 - 用于在页面间共享钱包连接状态
// Global Wallet Context - For sharing wallet connection state across pages

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { walletService, type WalletInfo } from '@/app/services/walletService'

interface WalletContextType {
  walletInfo: WalletInfo | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 初始化时尝试自动连接钱包
  useEffect(() => {
    const initializeWallet = async () => {
      setIsLoading(true)
      try {
        const result = await walletService.autoConnect()
        if (result.success && result.walletInfo) {
          setWalletInfo(result.walletInfo)
        }
      } catch (error) {
        console.error('Failed to auto-connect wallet:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeWallet()
  }, [])

  // 设置钱包事件监听器
  useEffect(() => {
    walletService.setupEventListeners(
      (address) => {
        console.log('🔄 Wallet address changed:', address)
        setWalletInfo(prev => prev ? { ...prev, address } : null)
      },
      (chainId) => {
        console.log('🔄 Wallet chainId changed:', chainId)
        setWalletInfo(prev => prev ? { ...prev, chainId } : null)
      }
    )
  }, [])

  // 连接钱包
  const connectWallet = async () => {
    setIsLoading(true)
    try {
      const result = await walletService.autoConnect()
      if (result.success && result.walletInfo) {
        setWalletInfo(result.walletInfo)
      } else {
        throw new Error(result.error || 'Failed to connect wallet')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 断开钱包连接
  const disconnectWallet = () => {
    walletService.disconnect()
    setWalletInfo(null)
  }

  const value: WalletContextType = {
    walletInfo,
    isConnected: !!walletInfo?.isConnected,
    connectWallet,
    disconnectWallet,
    isLoading
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 