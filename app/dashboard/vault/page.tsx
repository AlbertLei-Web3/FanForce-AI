// 基金会金库页面 - 基于ERC-4626的资金池管理，集成AI Agent
// Foundation Vault Page - ERC-4626 based fund pool management with AI Agent integration

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import StatCard from '@/app/components/shared/StatCard'
import { useToast } from '@/app/components/shared/Toast'
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
  FaEyeSlash,
  FaBrain,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRedo,
  FaUser,
  FaDollarSign
} from 'react-icons/fa'
import { walletService } from '@/app/services/walletService'
import { vaultService } from '@/app/services/vaultService'
import { okxDexService } from '@/app/services/okxDexService'
import { aiAgentService } from '@/app/services/aiAgentService'

// 用户托管信息接口 / User deposit info interface
interface UserDepositInfo {
  address: string;
  deposits: string;
  shares: string;
  profits: string;
  sharePercentage: string;
}

export default function VaultPage() {
  const { language } = useLanguage()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [walletInfo, setWalletInfo] = useState<any>(null)
  const [vaultInfo, setVaultInfo] = useState<any>(null)
  const [userVaultInfo, setUserVaultInfo] = useState<any>(null)
  const [userDeposits, setUserDeposits] = useState<UserDepositInfo[]>([])
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingVaultInfo, setIsLoadingVaultInfo] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  
  // AI Agent状态
  const [aiAgentStatus, setAiAgentStatus] = useState<any>(null)
  const [lastExecution, setLastExecution] = useState<number | null>(null)

  // 获取金库信息
  const fetchVaultInfo = async () => {
    setIsLoadingVaultInfo(true);
    try {
      const initialized = await vaultService.initialize();
      if (initialized) {
        // 获取合约总资产信息
        const contractInfo = await vaultService.getContractTotalAssets();
        setVaultInfo(contractInfo);
        
        // 获取用户托管信息
        if (walletInfo?.isConnected) {
          const userInfo = await vaultService.getUserVaultInfo(walletInfo.address);
          setUserVaultInfo(userInfo);
        }
        
        showToast({
          type: 'success',
          message: language === 'en' ? 'Vault info updated!' : '金库信息已更新！'
        })
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Failed to fetch vault info' : '获取金库信息失败'
      })
    } finally {
      setIsLoadingVaultInfo(false);
    }
  }

  // 获取所有用户托管信息（模拟数据，实际需要从合约获取）
  const fetchAllUserDeposits = async () => {
    try {
      // 这里应该从合约获取所有用户的托管信息
      // 目前使用模拟数据，后续需要实现真实的合约调用
      const mockUsers: UserDepositInfo[] = [
        {
          address: '0x36b8ad2ffbf5fed807c1c61bde0effac58fdec85',
          deposits: '3.1',
          shares: '0.0000000000031',
          profits: '0.0',
          sharePercentage: '100.00%'
        }
      ];
      setUserDeposits(mockUsers);
    } catch (error) {
      console.error('Failed to fetch user deposits:', error);
    }
  }

  // 初始化服务
  useEffect(() => {
    const initializeServices = async () => {
      await okxDexService.initialize()
      await aiAgentService.initialize()
      
      walletService.setupEventListeners(
        (address) => {
          setWalletInfo(prev => prev ? { ...prev, address } : null)
        },
        (chainId) => {
          setWalletInfo(prev => prev ? { ...prev, chainId } : null)
        }
      )

      // 加载金库信息
      await fetchVaultInfo();
      await fetchAllUserDeposits();

      // 加载AI Agent状态
      loadAiAgentStatus();
    }

    initializeServices()
  }, [])

  // 当钱包连接状态改变时，获取用户信息
  useEffect(() => {
    if (walletInfo?.isConnected) {
      fetchVaultInfo();
    }
  }, [walletInfo?.isConnected, walletInfo?.address])

  // 定期刷新金库信息（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVaultInfo();
    }, 30000) // 30秒

    return () => clearInterval(interval)
  }, [])

  // 加载AI Agent状态
  const loadAiAgentStatus = async () => {
    try {
      const status = {
        strategies: aiAgentService.getCurrentStrategy() ? [aiAgentService.getCurrentStrategy()] : [],
        lastExecution: aiAgentService.getStatus().lastUpdate ? new Date(aiAgentService.getStatus().lastUpdate).getTime() : null,
        canExecute: aiAgentService.getStatus().isRunning
      };
      setAiAgentStatus(status);
      setLastExecution(status.lastExecution);
    } catch (error) {
      console.error('Failed to load AI Agent status:', error);
    }
  }

  // 手动执行策略
  const executeStrategies = async () => {
    try {
      setIsLoading(true);
      
      // 启动AI Agent服务
      aiAgentService.start();
      
      showToast({
        type: 'success',
        message: language === 'en' 
          ? 'AI Agent service started successfully!' 
          : 'AI代理服务启动成功！'
      });
      
      // 刷新状态
      loadAiAgentStatus();
    } catch (error) {
      showToast({
        type: 'error',
        message: language === 'en' 
          ? `Strategy execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          : `策略执行失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsLoading(false);
    }
  }

  // 连接钱包
  const connectWallet = async () => {
    try {
      const result = await walletService.autoConnect()
      if (result.success && result.walletInfo) {
        setWalletInfo(result.walletInfo)
      } else {
        showToast({
          type: 'error',
          message: language === 'en' ? result.error || 'Failed to connect wallet' : result.error || '连接钱包失败'
        })
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      showToast({
        type: 'error',
        message: language === 'en' ? 'Failed to connect wallet' : '连接钱包失败'
      })
    }
  }

  // 处理存款
  const handleDeposit = async () => {
    if (!walletInfo?.isConnected) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Please connect your wallet first' : '请先连接您的钱包'
      })
      return
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Please enter a valid amount' : '请输入有效金额'
      })
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
        showToast({
          type: 'success',
          message: language === 'en' 
            ? `Deposit successful! You received ${result.shares} shares.` 
            : `存款成功！您获得了 ${result.shares} 份额。`
        })
        setShowDepositModal(false)
        setDepositAmount('')
        
        // 刷新金库信息
        await fetchVaultInfo();
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: language === 'en' 
          ? `Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          : `存款失败: ${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 处理提款
  const handleWithdraw = async () => {
    if (!walletInfo?.isConnected) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Please connect your wallet first' : '请先连接您的钱包'
      })
      return
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Please enter a valid amount' : '请输入有效金额'
      })
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
        showToast({
          type: 'success',
          message: language === 'en' 
            ? `Withdraw successful! You received ${result.assets} USDC.` 
            : `提款成功！您获得了 ${result.assets} USDC。`
        })
        setShowWithdrawModal(false)
        setWithdrawAmount('')
        
        // 刷新金库信息
        await fetchVaultInfo();
      } else {
        throw new Error(result.error || 'Withdraw failed');
      }
    } catch (error) {
      showToast({
        type: 'error',
        message: language === 'en' 
          ? `Withdraw failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
          : `提款失败: ${error instanceof Error ? error.message : '未知错误'}`
      })
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
                value={vaultInfo ? `${vaultInfo.totalAssets} USDC` : 'Loading...'} 
              />
              <StatCard 
                icon={<FaChartLine />} 
                title={language === 'en' ? "Total Shares" : "总份额"} 
                value={vaultInfo ? `${vaultInfo.totalShares} FFVAULT` : 'Loading...'} 
              />
              <StatCard 
                icon={<FaUsers />} 
                title={language === 'en' ? "Active Users" : "活跃用户"} 
                value={userDeposits.length.toString()} 
              />
              <StatCard 
                icon={<FaExchangeAlt />} 
                title={language === 'en' ? "Contract Address" : "合约地址"} 
                value={vaultInfo ? `${vaultInfo.contractAddress.slice(0, 6)}...${vaultInfo.contractAddress.slice(-4)}` : 'Loading...'} 
              />
            </div>

            {/* 合约状态详情 */}
            {vaultInfo && (
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-400" />
                  {language === 'en' ? "Contract Status Details" : "合约状态详情"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">{language === 'en' ? 'Total Assets:' : '总资产：'}</span>
                      <span className="text-white font-bold">{vaultInfo.totalAssets} USDC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{language === 'en' ? 'Total Shares:' : '总份额：'}</span>
                      <span className="text-white font-bold">{vaultInfo.totalShares} FFVAULT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{language === 'en' ? 'Contract:' : '合约地址：'}</span>
                      <span className="text-blue-400 text-xs truncate">
                        {vaultInfo.contractAddress}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">{language === 'en' ? 'Raw Assets:' : '原始资产：'}</span>
                      <span className="text-white font-bold text-xs">{vaultInfo.rawTotalAssets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">{language === 'en' ? 'Raw Shares:' : '原始份额：'}</span>
                      <span className="text-white font-bold text-xs">{vaultInfo.rawTotalShares}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Agent状态 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <FaBrain className="mr-2 text-purple-400" />
                {language === 'en' ? "AI Agent Status" : "AI代理状态"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{language === 'en' ? "Last Execution" : "最后执行"}</p>
                  <p className="text-white text-lg font-bold">
                    {lastExecution ? new Date(lastExecution).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">{language === 'en' ? "Can Execute" : "可执行"}</p>
                  <p className={`text-lg font-bold ${aiAgentStatus?.canExecute ? 'text-green-400' : 'text-red-400'}`}>
                    {aiAgentStatus?.canExecute ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <button
                    onClick={executeStrategies}
                    disabled={isLoading || !aiAgentStatus?.canExecute}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="inline mr-2 animate-spin" />
                        {language === 'en' ? 'Executing...' : '执行中...'}
                      </>
                    ) : (
                      <>
                        <FaRocket className="inline mr-2" />
                        {language === 'en' ? 'Execute Now' : '立即执行'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 用户投资信息 */}
            {userVaultInfo && (
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FaWallet className="mr-2 text-blue-400" />
                  {language === 'en' ? "Your Investment" : "您的投资"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{language === 'en' ? "Your Deposits" : "您的托管"}</p>
                    <p className="text-white text-2xl font-bold">{userVaultInfo.userDeposits} USDC</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{language === 'en' ? "Your Shares" : "您的份额"}</p>
                    <p className="text-white text-2xl font-bold">{userVaultInfo.userShares} FFVAULT</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{language === 'en' ? "Your Profits" : "您的收益"}</p>
                    <p className="text-green-400 text-2xl font-bold">{userVaultInfo.userProfits} USDC</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">{language === 'en' ? "Share %" : "份额占比"}</p>
                    <p className="text-yellow-400 text-2xl font-bold">{userVaultInfo.sharePercentage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'users':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <FaUsers className="mr-2 text-green-400" />
                {language === 'en' ? "User Deposit List" : "用户托管列表"}
              </h3>
              <button
                onClick={fetchAllUserDeposits}
                disabled={isLoadingVaultInfo}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                {isLoadingVaultInfo ? (
                  <>
                    <FaSpinner className="inline mr-2 animate-spin" />
                    {language === 'en' ? 'Loading...' : '加载中...'}
                  </>
                ) : (
                  <>
                    <FaRedo className="inline mr-2" />
                    {language === 'en' ? 'Refresh' : '刷新'}
                  </>
                )}
              </button>
            </div>
            
            {userDeposits.length > 0 ? (
              <div className="space-y-4">
                {userDeposits.map((user, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="flex items-center space-x-3">
                        <FaUser className="text-blue-400" />
                        <div>
                          <p className="font-bold text-white text-sm">
                            {user.address.slice(0, 6)}...{user.address.slice(-4)}
                          </p>
                          <p className="text-gray-400 text-xs">{user.address}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">{language === 'en' ? 'Deposits' : '托管金额'}</p>
                        <p className="text-white font-bold">{user.deposits} USDC</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">{language === 'en' ? 'Shares' : '份额'}</p>
                        <p className="text-white font-bold">{user.shares} FFVAULT</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">{language === 'en' ? 'Profits' : '收益'}</p>
                        <p className="text-green-400 font-bold">{user.profits} USDC</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">{language === 'en' ? 'Share %' : '份额占比'}</p>
                        <p className="text-yellow-400 font-bold">{user.sharePercentage}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaUsers className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-400">
                  {language === 'en' ? 'No user deposits found' : '暂无用户托管记录'}
                </p>
              </div>
            )}
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
          <button
            onClick={fetchVaultInfo}
            disabled={isLoadingVaultInfo}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center"
          >
            {isLoadingVaultInfo ? (
              <>
                <FaSpinner className="inline mr-2 animate-spin" />
                {language === 'en' ? 'Loading...' : '加载中...'}
              </>
            ) : (
                                <>
                    <FaRedo className="inline mr-2" />
                    {language === 'en' ? 'Refresh' : '刷新'}
                  </>
            )}
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
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {language === 'en' ? 'Users' : '用户列表'}
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