// FanForce AI - Web3上下文管理 / Web3 Context Management
// 管理钱包连接状态和Web3功能，直接使用MetaMask API / Manage wallet connection state and Web3 functionality using MetaMask API directly
// 关联文件：app/config/web3.ts, app/components/WalletConnect.tsx / Related files: app/config/web3.ts, app/components/WalletConnect.tsx

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { chilizChain } from '../config/web3'

// Web3状态接口定义 / Web3 State Interface Definition
interface Web3State {
  isConnected: boolean
  address: string | null
  balance: string
  chainId: number | null
  isCorrectChain: boolean
  connecting: boolean
}

// Web3上下文接口定义 / Web3 Context Interface Definition
interface Web3ContextType extends Web3State {
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchChain: () => Promise<void>
  refreshBalance: () => Promise<void>
}

// 创建Web3上下文 / Create Web3 Context
const Web3Context = createContext<Web3ContextType | undefined>(undefined)

// Web3提供者组件 / Web3 Provider Component
export function Web3Provider({ children }: { children: ReactNode }) {
  // 状态管理 / State Management
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    address: null,
    balance: '0.0000',
    chainId: null,
    isCorrectChain: false,
    connecting: false
  })

  // 检查MetaMask是否可用 / Check if MetaMask is available
  const isMetaMaskAvailable = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask
  }

  // 连接钱包函数 / Connect Wallet Function
  const connectWallet = async () => {
    if (!isMetaMaskAvailable()) {
      alert('请安装MetaMask钱包 / Please install MetaMask wallet')
      return
    }

    try {
      setState(prev => ({ ...prev, connecting: true }))
      
      // 请求连接账户 / Request account connection
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        const address = accounts[0]
        setState(prev => ({
          ...prev,
          isConnected: true,
          address,
          connecting: false
        }))
        
        // 获取链ID和余额 / Get chain ID and balance
        await checkChainAndBalance(address)
      }
    } catch (error) {
      console.error('钱包连接失败 / Wallet connection failed:', error)
      setState(prev => ({ ...prev, connecting: false }))
    }
  }

  // 断开钱包连接 / Disconnect Wallet
  const disconnectWallet = () => {
    setState({
      isConnected: false,
      address: null,
      balance: '0.0000',
      chainId: null,
      isCorrectChain: false,
      connecting: false
    })
  }

  // 切换到Chiliz链 / Switch to Chiliz Chain
  const switchChain = async () => {
    if (!isMetaMaskAvailable()) return

    try {
      // 尝试切换到Chiliz主网 / Try to switch to Chiliz mainnet
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chilizChain.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // 如果链不存在，添加链 / If chain doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum!.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chilizChain.chainId.toString(16)}`,
                chainName: chilizChain.name,
                nativeCurrency: {
                  name: 'CHZ',
                  symbol: 'CHZ',
                  decimals: 18,
                },
                rpcUrls: [chilizChain.rpcUrl],
                blockExplorerUrls: [chilizChain.explorerUrl],
              },
            ],
          })
        } catch (addError) {
          console.error('添加链失败 / Failed to add chain:', addError)
        }
      }
    }
  }

  // 检查链和余额 / Check Chain and Balance
  const checkChainAndBalance = async (address: string | null) => {
    if (!address || !isMetaMaskAvailable()) return

    try {
      // 获取当前链ID / Get current chain ID
      const chainId = await window.ethereum!.request({ method: 'eth_chainId' })
      const currentChainId = parseInt(chainId, 16)
      
      // 检查是否在正确的链上 / Check if on correct chain
      const isCorrectChain = currentChainId === chilizChain.chainId
      
      // 获取余额 / Get balance
      const balance = await getCHZBalance(address)
      
      setState(prev => ({
        ...prev,
        chainId: currentChainId,
        isCorrectChain,
        balance
      }))
    } catch (error) {
      console.error('检查链和余额失败 / Failed to check chain and balance:', error)
    }
  }

  // 获取CHZ余额 / Get CHZ Balance
  const getCHZBalance = async (address: string): Promise<string> => {
    try {
      const balance = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      })
      
      // 转换wei为CHZ / Convert wei to CHZ
      const balanceInCHZ = parseInt(balance, 16) / Math.pow(10, 18)
      return balanceInCHZ.toFixed(4)
    } catch (error) {
      console.error('获取CHZ余额失败 / Failed to get CHZ balance:', error)
      return '0.0000'
    }
  }

  // 刷新余额 / Refresh Balance
  const refreshBalance = async () => {
    if (state.address) {
      const balance = await getCHZBalance(state.address)
      setState(prev => ({ ...prev, balance }))
    }
  }

  // 监听账户变化 / Listen for Account Changes
  useEffect(() => {
    if (!isMetaMaskAvailable()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        setState(prev => ({ ...prev, address: accounts[0] }))
        checkChainAndBalance(accounts[0])
      }
    }

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16)
      setState(prev => ({
        ...prev,
        chainId: newChainId,
        isCorrectChain: newChainId === chilizChain.chainId
      }))
    }

    // 添加事件监听器 / Add event listeners
    window.ethereum!.on('accountsChanged', handleAccountsChanged)
    window.ethereum!.on('chainChanged', handleChainChanged)

    // 检查初始连接状态 / Check initial connection state
    const checkInitialConnection = async () => {
      try {
        const accounts = await window.ethereum!.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setState(prev => ({
            ...prev,
            isConnected: true,
            address: accounts[0]
          }))
          await checkChainAndBalance(accounts[0])
        }
      } catch (error) {
        console.error('检查初始连接失败 / Failed to check initial connection:', error)
      }
    }

    checkInitialConnection()

    // 清理事件监听器 / Cleanup event listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  // 上下文值 / Context Value
  const contextValue: Web3ContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    switchChain,
    refreshBalance
  }

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  )
}

// 使用Web3上下文的Hook / Hook to use Web3 Context
export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
} 