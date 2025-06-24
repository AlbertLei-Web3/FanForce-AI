// FanForce AI - 钱包连接组件 / Wallet Connection Component
// 提供MetaMask钱包连接和Chiliz Chain切换功能 / Provides MetaMask wallet connection and Chiliz Chain switching functionality
// 关联文件：app/context/Web3Context.tsx, app/components/Navbar.tsx / Related files: app/context/Web3Context.tsx, app/components/Navbar.tsx

'use client'

import { useWeb3 } from '../context/Web3Context'
import { useLanguage } from '../context/LanguageContext'

export default function WalletConnect() {
  // Web3状态和函数 / Web3 state and functions
  const {
    isConnected,
    address,
    balance,
    isCorrectChain,
    connecting,
    connectWallet,
    disconnectWallet,
    switchChain
  } = useWeb3()

  // 语言上下文 / Language context
  const { t } = useLanguage()

  // 格式化地址显示 / Format address display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // 如果未连接，显示连接按钮 / If not connected, show connect button
  if (!isConnected) {
    return (
      <button
        onClick={connectWallet}
        disabled={connecting}
        className="bg-fanforce-primary hover:bg-fanforce-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
      >
        {connecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{t('Connecting')}...</span>
          </>
        ) : (
          <>
            <span>🦊</span>
            <span>{t('Connect Wallet')}</span>
          </>
        )}
      </button>
    )
  }

  // 如果已连接，显示钱包信息 / If connected, show wallet info
  return (
    <div className="flex items-center space-x-4">
      {/* 链状态指示器 / Chain status indicator */}
      {!isCorrectChain && (
        <button
          onClick={switchChain}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded-full transition-colors duration-200 flex items-center space-x-1"
        >
          <span>⚠️</span>
          <span>{t('Switch to Chiliz')}</span>
        </button>
      )}

      {/* 余额显示 / Balance display */}
      <div className="bg-fanforce-dark border border-fanforce-secondary rounded-lg px-3 py-2 text-sm">
        <div className="text-fanforce-gold font-medium">
          {balance} CHZ
        </div>
        <div className="text-gray-400 text-xs">
          {formatAddress(address!)}
        </div>
      </div>

      {/* 断开连接按钮 / Disconnect button */}
      <button
        onClick={disconnectWallet}
        className="text-gray-400 hover:text-white transition-colors duration-200 p-2"
        title={t('Disconnect Wallet')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
} 