// 基金会金库页面 - 基于ERC-4626的资金池管理
// Foundation Vault Page - ERC-4626 based fund pool management

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import StatCard from '@/app/components/shared/StatCard'
import { 
  FaCoins, 
  FaChartLine, 
  FaHistory, 
  FaUsers, 
  FaTrophy,
  FaWallet,
  FaExchangeAlt,
  FaPercentage,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
  FaInfoCircle,
  FaShieldAlt,
  FaRocket,
  FaCog,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'
import { walletService } from '@/app/services/walletService'
import { vaultService } from '@/app/services/vaultService'
import { okxDexService } from '@/app/services/okxDexService'

// 模拟金库数据
const mockVaultData = {
  totalAssets: '1,250,000',
  totalShares: '1,000,000',
  userShares: '50,000',
  userAssets: '62,500',
  apy: '15.2',
  userPercentage: '5.0',
  totalUsers: 1250,
  dailyVolume: '450,000',
  weeklyReturn: '+8.5%',
  monthlyReturn: '+12.3%'
}

// 模拟投资策略
const mockStrategies = [
  {
    id: 1,
    name: 'PEPE/USDC Strategy',
    description: 'Momentum trading with PEPE token',
    allocation: '40%',
    performance: '+18.5%',
    status: 'active',
    lastTrade: '2 hours ago',
    trades: 156
  },
  {
    id: 2,
    name: 'ETH/LST Strategy',
    description: 'Liquid staking derivatives yield farming',
    allocation: '35%',
    performance: '+12.3%',
    status: 'active',
    lastTrade: '4 hours ago',
    trades: 89
  },
  {
    id: 3,
    name: 'DOGE/USDC Strategy',
    description: 'Meme coin arbitrage opportunities',
    allocation: '25%',
    performance: '+22.1%',
    status: 'active',
    lastTrade: '1 hour ago',
    trades: 203
  }
]

// 模拟交易记录
const mockTransactions = [
  {
    id: 1,
    type: 'deposit',
    amount: '10,000',
    token: 'USDC',
    timestamp: Date.now() - 3600000,
    status: 'completed',
    txHash: '0x1234567890abcdef'
  },
  {
    id: 2,
    type: 'swap',
    fromAmount: '5,000',
    fromToken: 'USDC',
    toAmount: '4,125,000',
    toToken: 'PEPE',
    timestamp: Date.now() - 7200000,
    status: 'completed',
    txHash: '0xabcdef1234567890'
  },
  {
    id: 3,
    type: 'withdraw',
    amount: '2,500',
    token: 'USDC',
    timestamp: Date.now() - 10800000,
    status: 'completed',
    txHash: '0x7890abcdef123456'
  }
]

export default function VaultPage() {
  const { language } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')
  const [walletInfo, setWalletInfo] = useState<any>(null)
  const [vaultInfo, setVaultInfo] = useState<any>(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showBalance, setShowBalance] = useState(true)

  // 初始化服务
  useEffect(() => {
    const initializeServices = async () => {
      await okxDexService.initialize()
      
      walletService.setupEventListeners(
        (address) => {
          setWalletInfo(prev => prev ? { ...prev, address } : null)
        },
        (chainId) => {
          setWalletInfo(prev => prev ? { ...prev, chainId } : null)
        }
      )

      // 如果钱包已连接，加载金库信息
      const walletInfo = walletService.getWalletInfo();
      if (walletInfo?.isConnected) {
        try {
          const initialized = await vaultService.initialize();
          if (initialized) {
            const vaultInfo = await vaultService.getVaultInfo();
            if (vaultInfo) {
              setVaultInfo(vaultInfo);
            }
          }
        } catch (error) {
          console.error('Failed to load vault info:', error);
        }
      }
    }

    initializeServices()
  }, [])

  // 连接钱包
  const connectWallet = async () => {
    try {
      const result = await walletService.autoConnect()
      if (result.success && result.walletInfo) {
        setWalletInfo(result.walletInfo)
      } else {
        alert(language === 'en' ? result.error || 'Failed to connect wallet' : result.error || '连接钱包失败')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert(language === 'en' ? 'Failed to connect wallet' : '连接钱包失败')
    }
  }

  // 处理存款
  const handleDeposit = async () => {
    if (!walletInfo?.isConnected) {
      alert(language === 'en' ? 'Please connect your wallet first' : '请先连接您的钱包')
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert(language === 'en' ? 'Please enter a valid amount' : '请输入有效金额')
      return
    }

    setIsLoading(true)
    try {
      // 初始化金库服务
      const initialized = await vaultService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize vault service');
      }

      // 检查金库健康状态
      const isHealthy = await vaultService.isHealthy();
      if (!isHealthy) {
        throw new Error('Vault is not in healthy state');
      }

      // 获取用户USDC余额
      const usdcBalance = await vaultService.getUSDCBalance();
      const amount = parseFloat(depositAmount);
      
      if (parseFloat(usdcBalance) < amount) {
        throw new Error('Insufficient USDC balance');
      }

      // 执行存款
      const result = await vaultService.deposit(amount);
      
      if (result.success) {
        alert(language === 'en' 
          ? `Deposit successful! You received ${result.shares} shares. Transaction: ${result.transactionHash}` 
          : `存款成功！您获得了 ${result.shares} 份额。交易哈希: ${result.transactionHash}`)
        setShowDepositModal(false)
        setDepositAmount('')
        
        // 刷新金库信息
        const vaultInfo = await vaultService.getVaultInfo();
        if (vaultInfo) {
          setVaultInfo(vaultInfo);
        }
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
    } catch (error) {
      alert(language === 'en' 
        ? `Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        : `存款失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理提款
  const handleWithdraw = async () => {
    if (!walletInfo?.isConnected) {
      alert(language === 'en' ? 'Please connect your wallet first' : '请先连接您的钱包')
      return
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert(language === 'en' ? 'Please enter a valid amount' : '请输入有效金额')
      return
    }

    setIsLoading(true)
    try {
      // 初始化金库服务
      const initialized = await vaultService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize vault service');
      }

      // 检查金库健康状态
      const isHealthy = await vaultService.isHealthy();
      if (!isHealthy) {
        throw new Error('Vault is not in healthy state');
      }

      // 获取用户份额
      const vaultInfo = await vaultService.getVaultInfo();
      if (!vaultInfo) {
        throw new Error('Failed to get vault info');
      }

      const amount = parseFloat(withdrawAmount);
      const userShares = parseFloat(vaultInfo.userShares);
      
      // 计算需要的份额
      const requiredShares = await vaultService.previewWithdraw(amount);
      if (userShares < parseFloat(requiredShares)) {
        throw new Error('Insufficient shares');
      }

      // 执行提款
      const result = await vaultService.withdraw(amount);
      
      if (result.success) {
        alert(language === 'en' 
          ? `Withdraw successful! You received ${result.assets} USDC. Transaction: ${result.transactionHash}` 
          : `提款成功！您获得了 ${result.assets} USDC。交易哈希: ${result.transactionHash}`)
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        
        // 刷新金库信息
        const newVaultInfo = await vaultService.getVaultInfo();
        if (newVaultInfo) {
          setVaultInfo(newVaultInfo);
        }
      } else {
        throw new Error(result.error || 'Withdraw failed');
      }
    } catch (error) {
      alert(language === 'en' 
        ? `Withdraw failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        : `提款失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* 金库概览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={<FaCoins />} 
                title={language === 'en' ? "Total Assets" : "总资产"} 
                value={`$${mockVaultData.totalAssets}`} 
              />
              <StatCard 
                icon={<FaChartLine />} 
                title={language === 'en' ? "APY" : "年化收益率"} 
                value={`${mockVaultData.apy}%`} 
              />
              <StatCard 
                icon={<FaUsers />} 
                title={language === 'en' ? "Total Users" : "总用户数"} 
                value={mockVaultData.totalUsers.toLocaleString()} 
              />
              <StatCard 
                icon={<FaExchangeAlt />} 
                title={language === 'en' ? "Daily Volume" : "日交易量"} 
                value={`$${mockVaultData.dailyVolume}`} 
              />
            </div>

            {/* 用户投资信息 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <FaWallet className="mr-2 text-blue-400" />
                {language === 'en' ? "Your Investment" : "您的投资"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{language === 'en' ? "Your Shares" : "您的份额"}</p>
                  <p className="text-white text-2xl font-bold">{mockVaultData.userShares}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{language === 'en' ? "Your Assets" : "您的资产"}</p>
                  <p className="text-white text-2xl font-bold">${mockVaultData.userAssets}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{language === 'en' ? "Your Percentage" : "您的占比"}</p>
                  <p className="text-white text-2xl font-bold">{mockVaultData.userPercentage}%</p>
                </div>
              </div>
            </div>

            {/* 投资策略 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <FaRocket className="mr-2 text-green-400" />
                {language === 'en' ? "Investment Strategies" : "投资策略"}
              </h3>
              <div className="space-y-4">
                {mockStrategies.map((strategy) => (
                  <div key={strategy.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-white">{strategy.name}</h4>
                        <p className="text-gray-400 text-sm">{strategy.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{strategy.performance}</p>
                        <p className="text-gray-400 text-sm">{strategy.allocation}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{language === 'en' ? "Last Trade" : "最后交易"}: {strategy.lastTrade}</span>
                      <span>{language === 'en' ? "Total Trades" : "总交易"}: {strategy.trades}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'transactions':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
              <FaHistory className="mr-2 text-yellow-400" />
              {language === 'en' ? "Transaction History" : "交易历史"}
            </h3>
            <div className="space-y-4">
              {mockTransactions.map((tx) => (
                <div key={tx.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        tx.type === 'deposit' ? 'bg-green-500' : 
                        tx.type === 'withdraw' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="font-bold text-white capitalize">{tx.type}</p>
                        <p className="text-gray-400 text-sm">
                          {tx.type === 'swap' 
                            ? `${tx.fromAmount} ${tx.fromToken} → ${tx.toAmount} ${tx.toToken}`
                            : `${tx.amount} ${tx.token}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                      <p className="text-green-400 text-sm">{tx.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout title={language === 'en' ? "Foundation Vault" : "基金会金库"}>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === 'en' ? "Foundation Vault" : "基金会金库"}
            </h1>
            <p className="text-gray-400">
              {language === 'en' 
                ? "AI-powered investment strategies with OKX DEX integration" 
                : "基于OKX DEX集成的AI驱动投资策略"
              }
            </p>
          </div>
          
          {/* 钱包连接状态 */}
          <div className="flex items-center space-x-4">
            {walletInfo?.isConnected ? (
              <div className="bg-green-600/20 p-3 rounded-lg border border-green-500/30">
                <div className="text-green-400 text-sm font-medium">
                  {language === 'en' ? 'Wallet Connected' : '钱包已连接'}
                </div>
                <div className="text-white text-xs truncate">
                  {walletInfo.address}
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Connect Wallet' : '连接钱包'}
              </button>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowDepositModal(true)}
            disabled={!walletInfo?.isConnected}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            {language === 'en' ? 'Deposit' : '存款'}
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!walletInfo?.isConnected}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            {language === 'en' ? 'Withdraw' : '提款'}
          </button>
        </div>

        {/* 标签页导航 */}
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {language === 'en' ? 'Overview' : '概览'}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {language === 'en' ? 'Transactions' : '交易记录'}
            </button>
          </nav>
        </div>

        {/* 标签页内容 */}
        {renderTabContent()}

        {/* 存款模态框 */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">
                {language === 'en' ? 'Deposit USDC' : '存入USDC'}
              </h3>
              <input
                type="number"
                placeholder={language === 'en' ? 'Enter amount' : '输入金额'}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleDeposit}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="inline mr-2 animate-spin" />
                      {language === 'en' ? 'Processing...' : '处理中...'}
                    </>
                  ) : (
                    language === 'en' ? 'Confirm' : '确认'
                  )}
                </button>
                <button
                  onClick={() => setShowDepositModal(false)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 提款模态框 */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">
                {language === 'en' ? 'Withdraw USDC' : '提取USDC'}
              </h3>
              <input
                type="number"
                placeholder={language === 'en' ? 'Enter amount' : '输入金额'}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded-lg mb-4"
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="inline mr-2 animate-spin" />
                      {language === 'en' ? 'Processing...' : '处理中...'}
                    </>
                  ) : (
                    language === 'en' ? 'Confirm' : '确认'
                  )}
                </button>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  disabled={isLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 