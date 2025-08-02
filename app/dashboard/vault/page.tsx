// FanForce Vault页面 - 模仿Yearn Vault界面风格
// FanForce Vault Page - Mimicking Yearn Vault UI Style

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import { useToast } from '@/app/components/shared/Toast'
import { 
  FaArrowLeft,
  FaArrowRight,
  FaCog,
  FaStar,
  FaExternalLinkAlt,
  FaSpinner,
  FaWallet,
  FaCoins,
  FaChartLine,
  FaPercentage,
  FaQuestionCircle,
  FaEye,
  FaEyeSlash,
  FaChevronDown
} from 'react-icons/fa'
import { walletService } from '@/app/services/walletService'
import { vaultService } from '@/app/services/vaultService'
import Link from 'next/link'

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
  const [activeAction, setActiveAction] = useState('deposit') // 'deposit' | 'withdraw'
  const [activeInfoTab, setActiveInfoTab] = useState('about') // 'about' | 'strategies' | 'harvests' | 'info'
  const [walletInfo, setWalletInfo] = useState<any>(null)
  const [vaultInfo, setVaultInfo] = useState<any>(null)
  const [userVaultInfo, setUserVaultInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingVaultInfo, setIsLoadingVaultInfo] = useState(false)
  const [showBalance, setShowBalance] = useState(true)
  
  // 存款/提款表单状态
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [userBalance, setUserBalance] = useState('0.00')
  const [userShares, setUserShares] = useState('0.00')
  const [estimatedShares, setEstimatedShares] = useState('0.00')
  const [estimatedAssets, setEstimatedAssets] = useState('0.00')
  
  // 代币选择状态
  const [selectedDepositToken, setSelectedDepositToken] = useState('USDC')
  const [selectedWithdrawToken, setSelectedWithdrawToken] = useState('USDC')
  const [showDepositDropdown, setShowDepositDropdown] = useState(false)
  const [showWithdrawDropdown, setShowWithdrawDropdown] = useState(false)
  
  // 可用代币列表
  const [availableTokens, setAvailableTokens] = useState([
    { symbol: 'USDC', name: 'USD Coin', icon: 'F', balance: '0.00' },
    { symbol: 'OKB', name: 'OKB Token', icon: 'O', balance: '0.00' },
    { symbol: 'ICP', name: 'Internet Computer', icon: 'I', balance: '0.00' },
    { symbol: 'CHZ', name: 'Chiliz', icon: 'C', balance: '0.00' }
  ])

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
          setUserBalance(userInfo?.userDeposits || '0.00');
          setUserShares(userInfo?.userShares || '0.00');
        }
        
        // 静默更新，不显示Toast
        console.log('✅ Vault info updated successfully');
      }
    } catch (error) {
      console.error('Failed to fetch vault info:', error);
      // 静默处理错误，不显示Toast
    } finally {
      setIsLoadingVaultInfo(false);
    }
  }

  // 获取用户USDC余额
  const fetchUserUSDCBalance = async () => {
    try {
      const initialized = await vaultService.initialize();
      if (initialized) {
        const balance = await vaultService.getUSDCBalance();
        // 更新USDC余额
        setAvailableTokens(prevTokens => 
          prevTokens.map(token => 
            token.symbol === 'USDC' 
              ? { ...token, balance } 
              : token
          )
        );
        console.log('✅ USDC balance updated:', balance);
      }
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error);
    }
  }

  // 初始化服务
  useEffect(() => {
    const initializeServices = async () => {
      // 设置钱包事件监听
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
    }

    initializeServices()
  }, [])

  // 当钱包连接状态改变时，获取用户信息
  useEffect(() => {
    if (walletInfo?.isConnected) {
      fetchVaultInfo();
      fetchUserUSDCBalance();
    }
  }, [walletInfo?.isConnected, walletInfo?.address])

  // 定期刷新金库信息（每30秒）
  useEffect(() => {
    if (!walletInfo?.isConnected) return

    const interval = setInterval(() => {
      fetchVaultInfo();
      fetchUserUSDCBalance();
    }, 30000) // 30秒

    return () => clearInterval(interval)
  }, [walletInfo?.isConnected])
  
  // 点击外部区域关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.token-dropdown')) {
        setShowDepositDropdown(false);
        setShowWithdrawDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // 切换到XLayer测试网
  const switchToXLayerTestnet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        throw new Error('MetaMask not installed');
      }

      // XLayer测试网配置
      const xlayerTestnet = {
        chainId: '0x1b58', // 十进制: 7000
        chainName: 'XLayer Testnet',
        nativeCurrency: {
          name: 'OKB',
          symbol: 'OKB',
          decimals: 18
        },
        rpcUrls: ['https://testrpc.xlayer.tech'],
        blockExplorerUrls: ['https://www.oklink.com/xlayer-test']
      };

      // 尝试切换到XLayer测试网
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: xlayerTestnet.chainId }]
      });

      showToast({
        type: 'success',
        message: language === 'en' ? 'Switched to XLayer Testnet' : '已切换到XLayer测试网'
      });

      // 刷新钱包信息
      const result = await walletService.autoConnect();
      if (result.success && result.walletInfo) {
        setWalletInfo(result.walletInfo);
      }
    } catch (error: any) {
      console.error('Failed to switch network:', error);
      
      if (error.code === 4902) {
        // 网络不存在，尝试添加网络
        try {
          const { ethereum } = window as any;
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x1b58',
              chainName: 'XLayer Testnet',
              nativeCurrency: {
                name: 'OKB',
                symbol: 'OKB',
                decimals: 18
              },
              rpcUrls: ['https://testrpc.xlayer.tech'],
              blockExplorerUrls: ['https://www.oklink.com/xlayer-test']
            }]
          });
          
          showToast({
            type: 'success',
            message: language === 'en' ? 'XLayer Testnet added and switched' : '已添加并切换到XLayer测试网'
          });
        } catch (addError) {
          showToast({
            type: 'error',
            message: language === 'en' ? 'Failed to add XLayer Testnet' : '添加XLayer测试网失败'
          });
        }
      } else {
        showToast({
          type: 'error',
          message: language === 'en' ? 'Failed to switch network' : '切换网络失败'
        });
      }
    }
  }

  // 处理存款
  const handleDeposit = async () => {
    console.log('🚀 Starting deposit process...');
    console.log('Deposit amount:', depositAmount);
    
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
      console.log('📡 Initializing vault service...');
      // 初始化金库服务
      const initialized = await vaultService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize vault service');
      }
      console.log('✅ Vault service initialized');

      console.log('🔍 Checking vault health...');
      // 检查金库健康状态
      const isHealthy = await vaultService.isHealthy();
      if (!isHealthy) {
        throw new Error('Vault is not in healthy state');
      }
      console.log('✅ Vault is healthy');

      console.log('💰 Getting USDC balance...');
      // 获取用户USDC余额
      const usdcBalance = await vaultService.getUSDCBalance();
      const amount = parseFloat(depositAmount);
      console.log('USDC balance:', usdcBalance);
      console.log('Amount to deposit:', amount);
      
      if (parseFloat(usdcBalance) < amount) {
        throw new Error(`Insufficient USDC balance. Available: ${usdcBalance}, Required: ${amount}`);
      }

      console.log('💸 Executing deposit...');
      // 执行存款
      const result = await vaultService.deposit(amount);
      console.log('Deposit result:', result);
      
      if (result.success) {
        setDepositAmount('') // 清空输入
        
        showToast({
          type: 'success',
          message: language === 'en' 
            ? `Deposit successful! You received ${result.shares} shares. Transaction: ${result.transactionHash}` 
            : `存款成功！您获得了 ${result.shares} 份额。交易哈希: ${result.transactionHash}`
        })
        
        // 刷新金库信息
        await fetchVaultInfo();
        await fetchUserUSDCBalance();
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
    } catch (error) {
      console.error('❌ Deposit failed:', error);
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
    console.log('🚀 Starting withdraw process...');
    console.log('Withdraw amount:', withdrawAmount);
    
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
      console.log('📡 Initializing vault service...');
      // 初始化金库服务
      const initialized = await vaultService.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize vault service');
      }
      console.log('✅ Vault service initialized');

      console.log('🔍 Checking vault health...');
      // 检查金库健康状态
      const isHealthy = await vaultService.isHealthy();
      if (!isHealthy) {
        throw new Error('Vault is not in healthy state');
      }
      console.log('✅ Vault is healthy');

      console.log('💰 Getting user vault info...');
      // 获取用户份额
      const userInfo = await vaultService.getUserVaultInfo(walletInfo.address);
      if (!userInfo) {
        throw new Error('Failed to get user vault info');
      }

      const amount = parseFloat(withdrawAmount);
      const userShares = parseFloat(userInfo.userShares);
      console.log('User shares:', userShares);
      console.log('Amount to withdraw:', amount);
      
      // 计算需要的份额
      const requiredShares = await vaultService.previewWithdraw(amount);
      console.log('Required shares:', requiredShares);
      
      if (userShares < parseFloat(requiredShares)) {
        throw new Error(`Insufficient shares. Available: ${userShares}, Required: ${requiredShares}`);
      }

      console.log('💸 Executing withdraw...');
      // 执行提款
      const result = await vaultService.withdraw(amount);
      console.log('Withdraw result:', result);
      
      if (result.success) {
        setWithdrawAmount('') // 清空输入
        
        showToast({
          type: 'success',
          message: language === 'en' 
            ? `Withdraw successful! You received ${result.assets} USDC. Transaction: ${result.transactionHash}` 
            : `提款成功！您获得了 ${result.assets} USDC。交易哈希: ${result.transactionHash}`
        })
        
        // 刷新金库信息
        await fetchVaultInfo();
        await fetchUserUSDCBalance();
      } else {
        throw new Error(result.error || 'Withdraw failed');
      }
    } catch (error) {
      console.error('❌ Withdraw failed:', error);
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

  // 设置最大存款金额
  const setMaxDeposit = async () => {
    try {
      const initialized = await vaultService.initialize();
      if (initialized) {
        const balance = await vaultService.getUSDCBalance();
        setDepositAmount(balance);
      }
    } catch (error) {
      console.error('Failed to get max deposit amount:', error);
      setDepositAmount('0');
    }
  }

  // 设置最大提款金额
  const setMaxWithdraw = () => {
    setWithdrawAmount(userShares);
  }
  
  // 获取选中代币的信息
  const getSelectedTokenInfo = (symbol: string) => {
    return availableTokens.find(token => token.symbol === symbol) || availableTokens[0];
  }
  
  // 处理代币选择
  const handleTokenSelect = (tokenSymbol: string, isDeposit: boolean) => {
    if (isDeposit) {
      setSelectedDepositToken(tokenSymbol);
      setShowDepositDropdown(false);
    } else {
      setSelectedWithdrawToken(tokenSymbol);
      setShowWithdrawDropdown(false);
    }
  }

  // 计算预估份额（存款时）
  const calculateEstimatedShares = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setEstimatedShares('0.00');
      return;
    }

    try {
      const initialized = await vaultService.initialize();
      if (initialized) {
        const shares = await vaultService.previewDeposit(parseFloat(amount));
        setEstimatedShares(shares);
      }
    } catch (error) {
      console.error('Failed to calculate estimated shares:', error);
      setEstimatedShares('0.00');
    }
  }

  // 计算预估资产（提款时）
  const calculateEstimatedAssets = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      setEstimatedAssets('0.00');
      return;
    }

    try {
      const initialized = await vaultService.initialize();
      if (initialized) {
        const assets = await vaultService.previewWithdraw(parseFloat(amount));
        setEstimatedAssets(assets);
      }
    } catch (error) {
      console.error('Failed to calculate estimated assets:', error);
      setEstimatedAssets('0.00');
    }
  }

  // 监听存款金额变化，实时计算预估份额
  useEffect(() => {
    if (activeAction === 'deposit') {
      calculateEstimatedShares(depositAmount);
    }
  }, [depositAmount, activeAction]);

  // 监听提款金额变化，实时计算预估资产
  useEffect(() => {
    if (activeAction === 'withdraw') {
      calculateEstimatedAssets(withdrawAmount);
    }
  }, [withdrawAmount, activeAction]);

  // 渲染信息标签页内容
  const renderInfoTabContent = () => {
    switch (activeInfoTab) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-gray-300 leading-relaxed">
              <p className="mb-4">
                {language === 'en' 
                  ? "Deposit your USDC into FanForce's auto-compounding vault and start earning the maximum APY immediately. The vault will handle staking, claiming and swapping rewards, and reinvesting your USDC for you. For more details about FanForce Vault, check out our documentation."
                  : "将您的USDC存入FanForce的自动复利金库，立即开始获得最大年化收益率。金库将处理质押、领取和交换奖励，并为您重新投资USDC。有关FanForce金库的更多详细信息，请查看我们的文档。"
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-bold mb-3">{language === 'en' ? 'APY Breakdown' : '年化收益率明细'}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{language === 'en' ? 'Weekly APY:' : '周收益率：'}</span>
                      <span className="text-white">28.40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{language === 'en' ? 'Monthly APY:' : '月收益率：'}</span>
                      <span className="text-white">20.36%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{language === 'en' ? 'Inception APY:' : '成立以来收益率：'}</span>
                      <span className="text-white">38.68%</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-2">
                      <span className="text-gray-400 font-bold">{language === 'en' ? 'Net APY:' : '净收益率：'}</span>
                      <span className="text-white font-bold">20.36%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-bold mb-3">{language === 'en' ? 'FanForce Fees' : 'FanForce费用'}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{language === 'en' ? 'Deposit/Withdrawal fee:' : '存取款费用：'}</span>
                      <span className="text-white">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{language === 'en' ? 'Management fee:' : '管理费：'}</span>
                      <span className="text-white">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">{language === 'en' ? 'Performance fee:' : '绩效费：'}</span>
                      <span className="text-white">10%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 累积收益图表占位符 */}
              <div className="mt-6">
                <h4 className="text-white font-bold mb-3">{language === 'en' ? 'Cumulative Earnings' : '累积收益'}</h4>
                <div className="bg-gray-700/50 rounded-lg p-8 text-center">
                  <div className="text-gray-400 text-sm">
                    {language === 'en' ? 'Chart placeholder - To be implemented' : '图表占位符 - 待实现'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'strategies':
        return (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">
              {language === 'en' ? 'Strategies section - To be implemented' : '策略部分 - 待实现'}
            </div>
          </div>
        )
      
      case 'harvests':
        return (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">
              {language === 'en' ? 'Harvests section - To be implemented' : '收获部分 - 待实现'}
            </div>
          </div>
        )
      
      case 'info':
        return (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">
              {language === 'en' ? 'Info section - To be implemented' : '信息部分 - 待实现'}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <DashboardLayout title={language === 'en' ? "FanForce Vault" : "FanForce金库"}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 返回链接 */}
        <div className="flex items-center">
          <Link 
            href="/dashboard/athlete" 
            className="text-gray-400 hover:text-white transition-colors flex items-center text-sm"
          >
            <FaArrowLeft className="mr-2" />
            {language === 'en' ? 'Back to vaults' : '返回金库列表'}
          </Link>
        </div>

        {/* 金库标题和地址 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">FanForce Vault</h1>
          <p className="text-gray-400 text-sm font-mono">
            0x27B5739e22ad9033bcBf192059122d163b60349D
          </p>
        </div>

        {/* 资产选择标签 */}
        <div className="flex justify-center space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            FanForce USDC
          </button>
          <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600">
            Ethereum
          </button>
        </div>

                 {/* 网络状态和关键指标 */}
         <div className="space-y-4">
           {/* 网络状态 */}
           {walletInfo?.isConnected && (
             <div className="bg-gray-800/50 rounded-lg p-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-2">
                   <div className={`w-3 h-3 rounded-full ${walletInfo.chainId === '0x1b58' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                   <span className="text-gray-400 text-sm">
                     {walletInfo.chainId === '0x1b58' 
                       ? (language === 'en' ? 'XLayer Testnet' : 'XLayer测试网')
                       : (language === 'en' ? 'Wrong Network' : '错误网络')
                     }
                   </span>
                 </div>
                 {walletInfo.chainId !== '0x1b58' && (
                   <button
                     onClick={switchToXLayerTestnet}
                     className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded transition-colors"
                   >
                     {language === 'en' ? 'Switch Network' : '切换网络'}
                   </button>
                 )}
               </div>
             </div>
           )}
           
           {/* 关键指标 */}
           <div className="bg-gray-800/50 rounded-lg p-6 text-center">
             <div className="text-2xl font-bold text-white mb-1">
               {vaultInfo ? `${parseFloat(vaultInfo.totalAssets).toLocaleString()}` : '0.00'}
             </div>
             <div className="text-gray-400 text-sm mb-2">
               {language === 'en' ? 'Total deposited, st-USDC' : '总托管，st-USDC'}
             </div>
             <div className="text-lg text-white">
               ${vaultInfo ? (parseFloat(vaultInfo.totalAssets) * 1).toLocaleString() : '0.00'}
             </div>
           </div>
         </div>

        {/* 存款/提款标签 */}
        <div className="flex justify-center space-x-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveAction('deposit')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeAction === 'deposit'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {language === 'en' ? 'Deposit' : '存款'}
          </button>
          <button
            onClick={() => setActiveAction('withdraw')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeAction === 'withdraw'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {language === 'en' ? 'Withdraw' : '提款'}
          </button>
        </div>

        {/* 存款/提款界面 */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          {activeAction === 'deposit' ? (
            <div className="grid grid-cols-5 gap-4 items-start">
                             {/* From wallet */}
               <div className="space-y-2">
                 <label className="text-gray-400 text-sm block">{language === 'en' ? 'From wallet' : '从钱包'}</label>
                 <div className="relative token-dropdown">
                   <div 
                     className="bg-gray-700 rounded-lg p-3 flex items-center justify-between cursor-pointer"
                     onClick={() => setShowDepositDropdown(!showDepositDropdown)}
                   >
                     <div className="flex items-center space-x-2">
                       <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                         <span className="text-white text-xs font-bold">{getSelectedTokenInfo(selectedDepositToken).icon}</span>
                       </div>
                       <span className="text-white font-medium">{selectedDepositToken}</span>
                     </div>
                     <FaChevronDown className={`text-gray-400 text-sm transition-transform ${showDepositDropdown ? 'rotate-180' : ''}`} />
                   </div>
                   
                   {/* 下拉菜单 */}
                   {showDepositDropdown && (
                     <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-10">
                       {availableTokens.map((token) => (
                         <div
                           key={token.symbol}
                           className="p-3 flex items-center justify-between hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                           onClick={() => handleTokenSelect(token.symbol, true)}
                         >
                           <div className="flex items-center space-x-2">
                             <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                               <span className="text-white text-xs font-bold">{token.icon}</span>
                             </div>
                             <span className="text-white font-medium">{token.symbol}</span>
                           </div>
                           <span className="text-gray-400 text-xs">{token.balance}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
                 <div className="text-gray-400 text-xs">
                   {language === 'en' ? 'You have' : '您拥有'} {showBalance ? getSelectedTokenInfo(selectedDepositToken).balance : '***'} {selectedDepositToken}
                 </div>
               </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm block">{language === 'en' ? 'Amount' : '金额'}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-gray-700 text-white p-3 rounded-lg text-xl font-bold pr-16"
                  />
                  <button
                    onClick={setMaxDeposit}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                    {language === 'en' ? 'Max' : '最大'}
                  </button>
                </div>
                <div className="text-gray-400 text-xs">
                  ${depositAmount ? (parseFloat(depositAmount) * 1).toFixed(2) : '0.00'}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pt-8">
                <FaArrowRight className="text-gray-400 text-xl" />
              </div>

              {/* To vault */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm block">{language === 'en' ? 'To vault' : '到金库'}</label>
                <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">ST</span>
                    </div>
                    <span className="text-white font-medium">st-USDC</span>
                  </div>
                </div>
                <div className="text-gray-400 text-xs">0.00%</div>
              </div>

                             {/* You will receive */}
               <div className="space-y-2">
                 <label className="text-gray-400 text-sm block">{language === 'en' ? 'You will receive' : '您将收到'}</label>
                 <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                       <span className="text-white text-xs font-bold">ST</span>
                     </div>
                     <span className="text-white font-medium text-xl">
                       {estimatedShares}
                     </span>
                   </div>
                 </div>
                 <div className="text-gray-400 text-xs">
                   ${depositAmount ? (parseFloat(depositAmount) * 1).toFixed(2) : '0.00'}
                 </div>
               </div>

              {/* Deposit button */}
              <div className="col-span-5 mt-4">
                <button
                  onClick={handleDeposit}
                  disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="w-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      {language === 'en' ? 'Processing...' : '处理中...'}
                    </div>
                  ) : (
                    language === 'en' ? 'Deposit' : '存款'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4 items-start">
              {/* From vault */}
                             <div className="space-y-2">
                 <label className="text-gray-400 text-sm block">{language === 'en' ? 'From vault' : '从金库'}</label>
                 <div className="bg-gray-700 rounded-lg p-3 flex items-center">
                   <div className="flex items-center space-x-2">
                     <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                       <span className="text-white text-xs font-bold">ST</span>
                     </div>
                     <span className="text-white font-medium">st-USDC</span>
                   </div>
                 </div>
                <div className="text-gray-400 text-xs">
                  {language === 'en' ? 'You have' : '您拥有'} {showBalance ? userShares : '***'} st-USDC
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm block">{language === 'en' ? 'Amount' : '金额'}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-gray-700 text-white p-3 rounded-lg text-xl font-bold pr-16"
                  />
                  <button
                    onClick={setMaxWithdraw}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-600 text-white px-2 py-1 rounded text-xs"
                  >
                    {language === 'en' ? 'Max' : '最大'}
                  </button>
                </div>
                <div className="text-gray-400 text-xs">
                  ${withdrawAmount ? (parseFloat(withdrawAmount) * 1).toFixed(2) : '0.00'}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pt-8">
                <FaArrowRight className="text-gray-400 text-xl" />
              </div>

                             {/* To wallet */}
               <div className="space-y-2">
                 <label className="text-gray-400 text-sm block">{language === 'en' ? 'To wallet' : '到钱包'}</label>
                 <div className="relative token-dropdown">
                   <div 
                     className="bg-gray-700 rounded-lg p-3 flex items-center justify-between cursor-pointer"
                     onClick={() => setShowWithdrawDropdown(!showWithdrawDropdown)}
                   >
                     <div className="flex items-center space-x-2">
                       <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                         <span className="text-white text-xs font-bold">{getSelectedTokenInfo(selectedWithdrawToken).icon}</span>
                       </div>
                       <span className="text-white font-medium">{selectedWithdrawToken}</span>
                     </div>
                     <FaChevronDown className={`text-gray-400 text-sm transition-transform ${showWithdrawDropdown ? 'rotate-180' : ''}`} />
                   </div>
                   
                   {/* 下拉菜单 */}
                   {showWithdrawDropdown && (
                     <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg z-10">
                       {availableTokens.map((token) => (
                         <div
                           key={token.symbol}
                           className="p-3 flex items-center justify-between hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                           onClick={() => handleTokenSelect(token.symbol, false)}
                         >
                           <div className="flex items-center space-x-2">
                             <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                               <span className="text-white text-xs font-bold">{token.icon}</span>
                             </div>
                             <span className="text-white font-medium">{token.symbol}</span>
                           </div>
                           <span className="text-gray-400 text-xs">{token.balance}</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
               </div>

                             {/* You will receive */}
               <div className="space-y-2">
                 <label className="text-gray-400 text-sm block">{language === 'en' ? 'You will receive' : '您将收到'}</label>
                 <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                   <div className="flex items-center space-x-2">
                     <div className="w-6 h-6 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-full flex items-center justify-center">
                       <span className="text-white text-xs font-bold">F</span>
                     </div>
                     <span className="text-white font-medium text-xl">
                       {estimatedAssets}
                     </span>
                   </div>
                 </div>
                 <div className="text-gray-400 text-xs">
                   ${withdrawAmount ? (parseFloat(withdrawAmount) * 1).toFixed(2) : '0.00'}
                 </div>
               </div>

              {/* Withdraw button */}
              <div className="col-span-5 mt-4">
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className="w-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      {language === 'en' ? 'Processing...' : '处理中...'}
                    </div>
                  ) : (
                    language === 'en' ? 'Withdraw' : '提款'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 信息标签页 */}
        <div className="bg-gray-800/50 rounded-lg">
          {/* 信息标签导航 */}
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveInfoTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeInfoTab === 'about'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {language === 'en' ? 'About' : '关于'}
              </button>
              <button
                onClick={() => setActiveInfoTab('strategies')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeInfoTab === 'strategies'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {language === 'en' ? 'Strategies' : '策略'}
              </button>
              <button
                onClick={() => setActiveInfoTab('harvests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeInfoTab === 'harvests'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {language === 'en' ? 'Harvests' : '收获'}
              </button>
              <button
                onClick={() => setActiveInfoTab('info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeInfoTab === 'info'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {language === 'en' ? 'Info' : '信息'}
              </button>
            </nav>
          </div>

          {/* 信息标签内容 */}
          <div className="p-6">
            {renderInfoTabContent()}
          </div>
        </div>

                 {/* 钱包连接状态 */}
         {!walletInfo?.isConnected && (
           <div className="text-center py-8">
             <div className="bg-gray-800/50 rounded-lg p-6">
               <FaWallet className="text-gray-400 text-4xl mx-auto mb-4" />
               <h3 className="text-white font-bold mb-2">
                 {language === 'en' ? 'Connect Your Wallet' : '连接您的钱包'}
               </h3>
               <p className="text-gray-400 mb-4">
                 {language === 'en' 
                   ? 'Connect your wallet to start depositing and earning with FanForce Vault'
                   : '连接您的钱包开始存款并在FanForce金库中赚取收益'
                 }
               </p>
               <div className="space-y-3">
                 <button
                   onClick={connectWallet}
                   className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                 >
                   {language === 'en' ? 'Connect Wallet' : '连接钱包'}
                 </button>
                 <div className="text-xs text-gray-500">
                   {language === 'en' ? 'Make sure you are on XLayer Testnet' : '请确保您在XLayer测试网上'}
                 </div>
                 <button
                   onClick={switchToXLayerTestnet}
                   className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm"
                 >
                   {language === 'en' ? 'Switch to XLayer Testnet' : '切换到XLayer测试网'}
                 </button>
               </div>
             </div>
           </div>
         )}
      </div>
    </DashboardLayout>
  )
} 