// FanForce AI - 运动员仪表板主页（基于ICP赛季奖金池系统）
// Athlete Dashboard Main Page - 运动员的主要仪表板页面，基于ICP赛季奖金池系统
// Main dashboard page for athletes based on ICP Season Bonus Pool system
// 运动员的主要仪表板页面，基于ICP赛季奖金池系统
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/utils/icpService.ts: ICP赛季奖金池服务
// - app/api/athlete/profile/route.ts: 运动员档案API
// - app/api/athlete/status/route.ts: 运动员状态API
// - app/api/athlete/ranking/route.ts: 运动员排名API
// - app/api/athlete/matches/route.ts: 运动员比赛API
// - app/api/athlete/earnings/route.ts: 运动员收入API
// - lib/athlete-schema.sql: 运动员数据库架构
// 
// 用户流程要点:
// 1. ICP赛季奖金池系统（去中心化奖金管理）
// 2. 赛季要求：10+比赛 + X社交帖子才能解锁ICP支付
// 3. 入赛手续费（从ICP余额扣除）
// 4. 休赛 → 活跃 → 等待选择 → 被选中的状态流程
// 5. 社交媒体帖子验证（外部API检查）

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import DataTable from '@/app/components/shared/DataTable'
import StatCard from '@/app/components/shared/StatCard'
import { useRouter } from 'next/navigation'
import { icpService, type AthleteProfile, type SeasonBonus } from '@/app/utils/icpService'
import ICPIntegration from '@/app/components/ICPIntegration'
import ICPBonusWidget from '@/app/components/ICPBonusWidget'
import { useWallet } from '@/app/context/WalletContext'
import { vaultService } from '@/app/services/vaultService'
import { okxDexService } from '@/app/services/okxDexService'
import { useToast } from '@/app/components/shared/Toast'
import { 
  FaTrophy, 
  FaFistRaised, 
  FaHistory, 
  FaUsers, 
  FaBasketballBall, 
  FaMedal, 
  FaCoins, 
  FaUserEdit,
  FaPlay,
  FaPause,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaCrown,
  FaChartLine,
  FaCalendarAlt,
  FaShieldAlt,
  FaStar,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLock,
  FaUnlock,
  FaDollarSign,
  FaShare,
  FaUpload
} from 'react-icons/fa'
import Link from 'next/link'

// Mock Data for Athlete Dashboard based on ICP Season Bonus Pool / 基于ICP赛季奖金池的运动员仪表板模拟数据
const mockAthleteProfile = {
  name: 'Mike "The Machine" Johnson',
  avatar: '/placeholder.svg',
  studentId: '2023001',
  sport: 'Basketball',
  position: 'Point Guard',
  team: 'Campus Warriors',
  status: 'resting', // 'resting' | 'active' | 'waiting' | 'selected' - Default is resting per flow
  rank: 'Gold',
  rankPoints: 1250,
  
  // ICP Season Bonus Pool System (Decentralized Bonus Management) / ICP赛季奖金池系统（去中心化奖金管理）
  icpSeasonBonusBalance: 285.50, // Current ICP season bonus balance / 当前ICP赛季奖金余额
  icpBaseSalary: 120.75, // Monthly ICP base salary / 月ICP基础薪资
  entryFeeAmount: 25.00, // Fee to enter competition / 入赛手续费
  
  // Season Progress Requirements / 赛季进度要求
  seasonMatches: 8, // Current matches this season / 本赛季当前比赛数
  seasonMatchesRequired: 10, // Must complete 10+ matches / 必须完成10+场比赛
  socialPosts: 3, // Current verified social posts / 当前已验证社交媒体帖子
  socialPostsRequired: 5, // Must have 5+ verified posts / 必须有5+个已验证帖子
  
  // Career Statistics / 职业统计
  totalMatches: 15,
  winRate: '73%',
  careerEarnings: 450.25, // Total from previous seasons / 之前赛季总收入
  
  // Queue Information / 队列信息
  queuePosition: 3,
  estimatedWaitTime: '15 mins',
  
  // Season Status / 赛季状态
  seasonCompleted: false, // Whether current season requirements are met / 当前赛季要求是否满足
  canRequestPayout: false // Whether eligible for ICP payout / 是否有资格获得ICP支付
}

const mockAthleteStats = {
  totalMatches: 15,
  wins: 11,
  losses: 4,
  mvpCount: 3,
  icpSeasonBonusBalance: 285.50,
  icpBaseSalary: 120.75,
  currentStreak: 4,
  bestStreak: 6,
  averagePerformance: 8.5,
  winRate: '73%',
  feesFromMatches: 65.25 // 1% fee share from matches / 比赛1%费用分成
}

// Season Requirements Progress / 赛季要求进度
const mockSeasonProgress = {
  matchesCompleted: 10, // 修改为10，满足要求
  matchesRequired: 10,
  postsCompleted: 5, // 修改为5，满足要求
  postsRequired: 5,
  progressPercentage: Math.min(((10/10) + (5/5)) / 2 * 100, 100),
  canAdvanceToNextSeason: true // 修改为true
}

// Social Media Verification / 社交媒体验证
const mockSocialPosts = [
  { 
    platform: 'Instagram', 
    postId: 'inst_123', 
    verified: true, 
    date: '2023-11-12', 
    engagement: 245,
    status: 'verified'
  },
  { 
    platform: 'Twitter', 
    postId: 'tw_456', 
    verified: true, 
    date: '2023-11-08', 
    engagement: 189,
    status: 'verified'
  },
  { 
    platform: 'Facebook', 
    postId: 'fb_789', 
    verified: false, 
    date: '2023-11-05', 
    engagement: 156,
    status: 'pending_verification'
  },
]

// ICP Season Bonus Transaction History / ICP赛季奖金交易历史
const mockVirtualTransactions = {
  columns: [
    { key: 'date', headerEn: 'Date', headerCn: '日期' },
    { key: 'type', headerEn: 'Type', headerCn: '类型' },
    { key: 'amount', headerEn: 'Amount (ICP)', headerCn: '数量 (ICP)' },
    { key: 'balance', headerEn: 'Balance', headerCn: '余额' },
    { key: 'description', headerEn: 'Description', headerCn: '描述' },
  ],
  rows: [
    { 
      date: '2023-11-15', 
      type: 'Match Reward', 
      amount: '+35.50', 
      balance: '285.50',
      description: 'Team A Victory + 1% fee share' 
    },
    { 
      date: '2023-11-10', 
      type: 'Match Reward', 
      amount: '+25.25', 
      balance: '250.00',
      description: 'Team C Victory' 
    },
    { 
      date: '2023-11-08', 
      type: 'Entry Fee', 
      amount: '-25.00', 
      balance: '224.75',
      description: 'Competition entry fee deduction' 
    },
    { 
      date: '2023-11-01', 
      type: 'Monthly Salary', 
      amount: '+120.75', 
      balance: '249.75',
      description: 'ICP monthly base salary' 
    },
    { 
      date: '2023-10-28', 
      type: 'Match Reward + MVP', 
      amount: '+45.00', 
      balance: '129.00',
      description: 'Team D Victory + MVP bonus + fee share' 
    },
  ]
}

const mockMatchHistory = {
  columns: [
    { key: 'date', headerEn: 'Date', headerCn: '日期' },
    { key: 'opponent', headerEn: 'Opponent', headerCn: '对手' },
    { key: 'result', headerEn: 'Result', headerCn: '结果' },
    { key: 'performance', headerEn: 'Performance', headerCn: '表现' },
    { key: 'earnings', headerEn: 'Virtual CHZ Earned', headerCn: '虚拟CHZ收入' },
    { key: 'mvp', headerEn: 'MVP', headerCn: 'MVP' },
  ],
  rows: [
    { date: '2023-11-15', opponent: 'Team B', result: { type: 'win', text: 'W' }, performance: '9.5/10', earnings: '+35.50', mvp: true },
    { date: '2023-11-10', opponent: 'Team C', result: { type: 'win', text: 'W' }, performance: '8.0/10', earnings: '+25.25', mvp: false },
    { date: '2023-11-05', opponent: 'Team A', result: { type: 'loss', text: 'L' }, performance: '7.5/10', earnings: '+5.00', mvp: false },
    { date: '2023-10-28', opponent: 'Team D', result: { type: 'win', text: 'W' }, performance: '9.0/10', earnings: '+45.00', mvp: true },
    { date: '2023-10-20', opponent: 'Team B', result: { type: 'win', text: 'W' }, performance: '8.5/10', earnings: '+28.75', mvp: false },
  ]
}

export default function AthleteDashboard() {
  const { language } = useLanguage()
  const router = useRouter()
  const { showToast, ToastContainer } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentStatus, setCurrentStatus] = useState(mockAthleteProfile.status)
  const [showEntryFeeModal, setShowEntryFeeModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  
  // 新增：托管到基金会的状态管理
  const [vaultTransferLoading, setVaultTransferLoading] = useState(false)
  const [showVaultModal, setShowVaultModal] = useState(false)
  const [transferAmount, setTransferAmount] = useState('') // 新增：转账金额输入
  
  // 新增：钱包连接状态 - 使用全局钱包上下文
  const { walletInfo, isConnected, connectWallet: globalConnectWallet, isLoading: walletLoading } = useWallet()
  // 新增：查看托管信息的状态
  const [vaultInfo, setVaultInfo] = useState<any>(null)
  const [userVaultInfo, setUserVaultInfo] = useState<any>(null)
  const [isLoadingVaultInfo, setIsLoadingVaultInfo] = useState(false)

  // 新增：真实USDC余额状态
  const [realUSDCBalance, setRealUSDCBalance] = useState<string>('0')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)

  // Check if season requirements are met / 检查赛季要求是否满足
  const seasonRequirementsMet = mockSeasonProgress.matchesCompleted >= mockSeasonProgress.matchesRequired && 
                               mockSeasonProgress.postsCompleted >= mockSeasonProgress.postsRequired

  // Status management functions based on user flow / 基于用户流程的状态管理函数
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'active' && currentStatus === 'resting') {
      // Show entry fee modal when entering competition / 进入比赛时显示入赛手续费模态框
      setShowEntryFeeModal(true)
    } else {
      setCurrentStatus(newStatus)
      console.log(`Status changed to: ${newStatus}`)
    }
  }

  const handlePayEntryFee = () => {
    if (mockAthleteProfile.icpSeasonBonusBalance < mockAthleteProfile.entryFeeAmount) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Insufficient virtual CHZ balance!' : '虚拟CHZ余额不足！'
      })
      return
    }
    
    // 入赛费用支付成功后显示Toast
    showToast({
      type: 'success',
      message: language === 'en' 
        ? `Entry fee paid: ${mockAthleteProfile.entryFeeAmount} Virtual CHZ` 
        : `已支付入赛费用：${mockAthleteProfile.entryFeeAmount} 虚拟CHZ`
    })
    setCurrentStatus('active')
    setShowEntryFeeModal(false)
    // In real app, deduct from virtual balance / 在真实应用中，从虚拟余额扣除
  }

  const handleRequestPayout = () => {
    if (seasonRequirementsMet) {
      setShowPayoutModal(true)
    } else {
      showToast({
        type: 'error',
        message: language === 'en' 
          ? 'Complete season requirements first: 10+ matches and 5+ verified social posts' 
          : '请先完成赛季要求：10场比赛和5条已验证的社交帖子'
      })
    }
  }

;

  // 新增：切换到X Layer Testnet
  const switchToXLayerTestnet = async () => {
    const { ethereum } = window as any;
    
    if (!ethereum) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'MetaMask not found' : '未找到MetaMask'
      })
      return;
    }

    // X Layer Testnet配置
    const xLayerTestnet = {
      chainId: '0xC3', // 195
      chainName: 'X Layer Testnet',
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: ['https://testrpc.xlayer.tech'],
      blockExplorerUrls: ['https://testnet.xlayer.tech']
    };

    try {
      // 尝试切换到X Layer Testnet
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xC3' }]
      });
      
      // 网络切换成功后显示Toast
      showToast({
        type: 'success',
        message: language === 'en' ? 'Switched to X Layer Testnet' : '已切换到X Layer测试网'
      })
    } catch (switchError: any) {
      // 如果网络不存在，尝试添加它
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [xLayerTestnet]
          });
          // 网络添加成功后显示Toast
          showToast({
            type: 'success',
            message: language === 'en' ? 'X Layer Testnet added and switched' : '已添加并切换到X Layer测试网'
          })
        } catch (addError) {
          showToast({
            type: 'error',
            message: language === 'en' ? 'Failed to add X Layer Testnet' : '添加X Layer测试网失败'
          })
        }
      } else {
        showToast({
          type: 'error',
          message: language === 'en' ? 'Failed to switch network' : '切换网络失败'
        })
      }
    }
  };

  // 获取真实USDC余额
  const fetchRealUSDCBalance = async () => {
    // 只在钱包已连接时才获取余额
    if (!isConnected) {
      setRealUSDCBalance('0');
      return;
    }

    setIsLoadingBalance(true);
    try {
      const initialized = await vaultService.initialize();
      if (initialized) {
        const balance = await vaultService.getUSDCBalance();
        setRealUSDCBalance(balance);
      } else {
        // 静默处理初始化失败，不显示Toast
        setRealUSDCBalance('0');
      }
    } catch (error) {
      // 静默处理错误，不显示Toast
      setRealUSDCBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  }

  // 获取托管信息
  const fetchVaultInfo = async () => {
    setIsLoadingVaultInfo(true);
    try {
      const initialized = await vaultService.initialize();
      if (initialized) {
        // 获取合约总资产信息
        const contractInfo = await vaultService.getContractTotalAssets();
        setVaultInfo(contractInfo);
        
        // 获取用户托管信息
        if (isConnected && walletInfo) {
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

  // 初始化OKX DEX服务
  useEffect(() => {
    const initializeServices = async () => {
      // 初始化OKX DEX服务
      await okxDexService.initialize();
    };

    initializeServices();
  }, []);

  // 当钱包连接状态改变时，获取USDC余额
  useEffect(() => {
    // 只在钱包已连接时才获取余额
    if (isConnected && walletInfo) {
      fetchRealUSDCBalance()
    }
  }, [isConnected, walletInfo?.address])

  // 定期刷新余额（每30秒）
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      fetchRealUSDCBalance()
    }, 30000) // 30秒

    return () => clearInterval(interval)
  }, [isConnected])

  // 修改：处理托管到基金会的函数（使用服务层）
  const handleVaultTransfer = async () => {
    if (!seasonRequirementsMet) {
      showToast({
        type: 'error',
        message: language === 'en' 
          ? 'Complete season requirements first: 10+ matches and 5+ verified social posts' 
          : '请先完成赛季要求：10场比赛和5条已验证的社交帖子'
      })
      return
    }
    
    if (!isConnected) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Please connect your wallet first' : '请先连接您的钱包'
      })
      return
    }
    
    // 设置默认转账金额为真实USDC余额
    setTransferAmount(realUSDCBalance)
    setShowVaultModal(true)
  }

  // 修改：确认托管到基金会（使用钱包地址和USDC）
  const handleConfirmVaultTransfer = async () => {
    console.log('🚀 Starting vault transfer process...');
    console.log('Transfer amount:', transferAmount);
    
    // 验证输入金额
    const amount = parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast({
        type: 'error',
        message: language === 'en' ? 'Please enter a valid amount' : '请输入有效金额'
      })
      return
    }

    setVaultTransferLoading(true)
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
      console.log('USDC balance:', usdcBalance);
      
      if (parseFloat(usdcBalance) < amount) {
        throw new Error(`Insufficient USDC balance. Available: ${usdcBalance}, Required: ${amount}`);
      }

      console.log('💸 Executing deposit...');
      // 执行存款到金库
      const result = await vaultService.deposit(amount);
      console.log('Deposit result:', result);
      
      if (result.success) {
        setShowVaultModal(false)
        setTransferAmount('') // 清空输入
        
        // 只在这里显示成功Toast通知
        showToast({
          type: 'success',
          message: language === 'en' 
            ? `Successfully transferred ${amount} USDC to Foundation Vault! Transaction: ${result.transactionHash}` 
            : `成功托管 ${amount} USDC到基金会！交易哈希: ${result.transactionHash}`
        })
        
        // 删除自动跳转到金库页面的代码
        // router.push('/dashboard/vault')
      } else {
        throw new Error(result.error || 'Deposit failed');
      }
      
    } catch (error) {
      console.error('❌ Vault transfer failed:', error)
      showToast({
        type: 'error',
        message: language === 'en' 
          ? `Failed to transfer to Foundation Vault: ${error instanceof Error ? error.message : 'Unknown error'}` 
          : `托管到基金会失败: ${error instanceof Error ? error.message : '未知错误'}`
      })
    } finally {
      setVaultTransferLoading(false)
    }
  }

  // Render status button based on user flow / 基于用户流程渲染状态按钮
  const renderStatusButton = () => {
    switch (currentStatus) {
      case 'resting':
        return (
          <button 
            onClick={() => handleStatusChange('active')}
            className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-green-500/50"
          >
            <FaPlay className="inline mr-3 text-2xl" />
            {language === 'en' ? 'Enter Competition' : '选择出战'}
            <div className="text-sm mt-1 opacity-75">
              {language === 'en' ? `Entry Fee: ${mockAthleteProfile.entryFeeAmount} Virtual CHZ` : `入赛费用：${mockAthleteProfile.entryFeeAmount} 虚拟CHZ`}
            </div>
          </button>
        )
      case 'active':
        return (
          <button 
            onClick={() => router.push('/dashboard/athlete/waiting')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-blue-500/50"
          >
            <FaClock className="inline mr-3 text-2xl" />
            {language === 'en' ? 'Waiting for Ambassador Selection' : '等待大使选择'}
            <div className="text-sm mt-1 opacity-75">
              {language === 'en' ? 'Available for team selection' : '可被队伍选择'}
            </div>
          </button>
        )
      case 'waiting':
        return (
          <button 
            onClick={() => router.push('/dashboard/athlete/waiting')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-yellow-500/50 animate-pulse"
          >
            <FaSpinner className="inline mr-3 text-2xl animate-spin" />
            {language === 'en' ? 'In Queue - Position #3' : '队列中 - 第3位'}
            <div className="text-sm mt-1 opacity-75">
              {language === 'en' ? `Est. wait: ${mockAthleteProfile.estimatedWaitTime}` : `预计等待：${mockAthleteProfile.estimatedWaitTime}`}
            </div>
          </button>
        )
      case 'selected':
        return (
          <button 
            onClick={() => router.push('/dashboard/athlete/match')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-purple-500/50"
          >
            <FaCheckCircle className="inline mr-3 text-2xl" />
            {language === 'en' ? 'Selected for Match!' : '已被选中参赛！'}
            <div className="text-sm mt-1 opacity-75">
              {language === 'en' ? 'Click to view match details' : '点击查看比赛详情'}
            </div>
          </button>
        )
      default:
        return null
    }
  }

  // Render status description based on user flow / 基于用户流程渲染状态描述
  const renderStatusDescription = () => {
    switch (currentStatus) {
      case 'resting':
        return (
          <div className="text-gray-400 text-center mt-4">
            <p className="mb-2">
              {language === 'en' 
                ? "You're in resting state (default). Enter competition to be available for ambassador selection." 
                : "您处于休赛状态（默认）。进入比赛模式可被大使选择。"}
            </p>
            <p className="text-sm">
              {language === 'en' 
                ? `Entry fee of ${mockAthleteProfile.entryFeeAmount} Virtual CHZ will be deducted from your balance.` 
                : `将从您的余额中扣除${mockAthleteProfile.entryFeeAmount}虚拟CHZ入赛费用。`}
            </p>
          </div>
        )
      case 'active':
        return (
          <p className="text-gray-400 text-center mt-4">
            {language === 'en' 
              ? "You're active and available for selection. Ambassadors can now choose you for their teams using ranking-based algorithms." 
              : "您处于活跃状态，可被选择。大使现在可以使用基于排名的算法选择您加入他们的队伍。"}
          </p>
        )
      case 'waiting':
        return (
          <p className="text-gray-400 text-center mt-4">
            {language === 'en' 
              ? `You're #${mockAthleteProfile.queuePosition} in the selection queue. Database notification system will alert you when selected.` 
              : `您在选择队列中排第${mockAthleteProfile.queuePosition}位。数据库通知系统会在您被选中时提醒您。`}
          </p>
        )
      case 'selected':
        return (
          <p className="text-gray-400 text-center mt-4">
            {language === 'en' 
              ? "Congratulations! You've been selected by an ambassador. Participate in the match to update your profile and earn virtual CHZ." 
              : "恭喜！您已被大使选中。参加比赛以更新您的档案并赚取虚拟CHZ。"}
          </p>
        )
      default:
        return null
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Virtual CHZ Balance & Season Progress / 虚拟CHZ余额和赛季进度 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Virtual CHZ Balance / 虚拟CHZ余额 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FaCoins className="mr-2 text-yellow-400" />
                  {language === 'en' ? "ICP Season Bonus Pool" : "ICP赛季奖金池"}
                </h3>
                <div className="text-3xl font-bold text-green-400 mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    {isLoadingBalance ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Loading...
                      </>
                    ) : isConnected ? (
                      `${realUSDCBalance} USDC`
                    ) : (
                      `${mockAthleteProfile.icpSeasonBonusBalance.toFixed(2)} USDC`
                    )}
                  </div>
                  {isConnected && (
                    <button
                      onClick={fetchRealUSDCBalance}
                      disabled={isLoadingBalance}
                      className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                      title={language === 'en' ? 'Refresh Balance' : '刷新余额'}
                    >
                      <FaSpinner className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>{language === 'en' ? 'Monthly Base Salary:' : '月基础薪资：'} {mockAthleteProfile.icpBaseSalary} USDC</div>
                  <div>{language === 'en' ? 'Career Earnings:' : '职业收入：'} {mockAthleteProfile.careerEarnings} USDC</div>
                  <div className="text-orange-400">
                    {language === 'en' ? 'Entry Fee:' : '入赛费用：'} {mockAthleteProfile.entryFeeAmount} USDC
                  </div>
                </div>
                
                {/* 新增：钱包连接状态显示 */}
                <div className="mt-4 mb-4">
                  {isConnected ? (
                    <div className="bg-green-600/20 p-3 rounded-lg border border-green-500/30">
                      <div className="text-green-400 text-sm font-medium">
                        {language === 'en' ? 'Wallet Connected' : '钱包已连接'}
                      </div>
                      <div className="text-white text-xs truncate">
                        {walletInfo.address}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {language === 'en' ? 'Network:' : '网络：'} {walletInfo.chainId === '0xc3' ? 'X Layer Testnet' : walletInfo.chainId === '0x1' ? 'Ethereum Mainnet' : `Chain ID: ${walletInfo.chainId}`}
                      </div>
                      {walletInfo.chainId !== '0xc3' && (
                        <button 
                          onClick={switchToXLayerTestnet}
                          className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
                        >
                          {language === 'en' ? 'Switch to X Layer Testnet' : '切换到X Layer测试网'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={async () => {
                      try {
                        await globalConnectWallet();
                        showToast({
                          type: 'success',
                          message: language === 'en' ? 'Wallet connected successfully!' : '钱包连接成功！'
                        });
                      } catch (error) {
                        showToast({
                          type: 'error',
                          message: language === 'en' ? 'Failed to connect wallet' : '连接钱包失败'
                        });
                      }
                    }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      {language === 'en' ? 'Connect Wallet' : '连接钱包'}
                    </button>
                  )}
                </div>
                
                <div className="mt-4">
                <button 
                    onClick={handleRequestPayout}
                    disabled={!seasonRequirementsMet}
                    className={`w-full px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                      seasonRequirementsMet 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {seasonRequirementsMet ? (
                      <>
                        <FaUnlock className="inline mr-2" />
                        {language === 'en' ? 'Request Mainnet Payout' : '请求主网支付'}
                      </>
                    ) : (
                      <>
                        <FaLock className="inline mr-2" />
                        {language === 'en' ? 'Complete Season First' : '先完成赛季'}
                      </>
                    )}
                  </button>
                  
                  {/* 修改：托管到基金会按钮（需要钱包连接） */}
                  <button 
                    onClick={handleVaultTransfer}
                    disabled={!seasonRequirementsMet || !isConnected}
                    className={`w-full mt-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      seasonRequirementsMet && isConnected
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105 shadow-lg' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-lg">🏦</span>
                    <span>{language === 'en' ? 'Transfer to Foundation Vault' : '托管到基金会自动投资'}</span>
                  </button>
                  
                  {/* 新增：跳转到金库页面按钮 */}
                  <button 
                    onClick={() => router.push('/dashboard/vault')}
                    className="w-full mt-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white transform hover:scale-105 shadow-lg"
                  >
                    <span className="text-lg">📊</span>
                    <span>{language === 'en' ? 'View Foundation Vault' : '查看基金会金库'}</span>
                  </button>
                  
                  {/* 新增：查看托管信息按钮 */}
                  <button 
                    onClick={fetchVaultInfo}
                    disabled={isLoadingVaultInfo}
                    className="w-full mt-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transform hover:scale-105 shadow-lg disabled:opacity-50"
                  >
                    <span className="text-lg">🔍</span>
                    <span>
                      {isLoadingVaultInfo ? (
                        <span className="flex items-center">
                          <FaSpinner className="animate-spin mr-2" />
                          {language === 'en' ? 'Loading...' : '加载中...'}
                        </span>
                      ) : (
                        language === 'en' ? 'Check Vault Status' : '查看托管状态'
                      )}
                    </span>
                  </button>
                  
                  {/* 新增：托管信息显示 */}
                  {vaultInfo && (
                    <div className="mt-4 p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
                      <h4 className="text-blue-400 font-bold mb-2">
                        {language === 'en' ? 'Contract Status' : '合约状态'}
                      </h4>
                      <div className="space-y-1 text-sm">
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
                            {vaultInfo.contractAddress.slice(0, 6)}...{vaultInfo.contractAddress.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 新增：用户托管信息显示 */}
                  {userVaultInfo && (
                    <div className="mt-4 p-4 bg-green-600/20 rounded-lg border border-green-500/30">
                      <h4 className="text-green-400 font-bold mb-2">
                        {language === 'en' ? 'Your Vault Status' : '您的托管状态'}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">{language === 'en' ? 'Your Deposits:' : '您的托管：'}</span>
                          <span className="text-white font-bold">{userVaultInfo.userDeposits} USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{language === 'en' ? 'Your Shares:' : '您的份额：'}</span>
                          <span className="text-white font-bold">{userVaultInfo.userShares} FFVAULT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{language === 'en' ? 'Your Profits:' : '您的收益：'}</span>
                          <span className="text-green-400 font-bold">{userVaultInfo.userProfits} USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">{language === 'en' ? 'Share %:' : '份额占比：'}</span>
                          <span className="text-yellow-400 font-bold">{userVaultInfo.sharePercentage}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Season Progress / 赛季进度 */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <FaTrophy className="mr-2 text-blue-400" />
                  {language === 'en' ? "Season Requirements" : "赛季要求"}
                </h3>
                
                {/* Matches Progress / 比赛进度 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{language === 'en' ? 'Matches' : '比赛'}</span>
                    <span>{mockSeasonProgress.matchesCompleted}/{mockSeasonProgress.matchesRequired}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        mockSeasonProgress.matchesCompleted >= mockSeasonProgress.matchesRequired 
                          ? 'bg-green-500' 
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((mockSeasonProgress.matchesCompleted / mockSeasonProgress.matchesRequired) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Social Posts Progress / 社交帖子进度 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{language === 'en' ? 'Verified Posts' : '已验证帖子'}</span>
                    <span>{mockSeasonProgress.postsCompleted}/{mockSeasonProgress.postsRequired}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        mockSeasonProgress.postsCompleted >= mockSeasonProgress.postsRequired 
                          ? 'bg-green-500' 
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min((mockSeasonProgress.postsCompleted / mockSeasonProgress.postsRequired) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Season Status / 赛季状态 */}
                <div className={`text-center p-2 rounded-lg ${
                  seasonRequirementsMet 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-orange-600/20 text-orange-400'
                }`}>
                  {seasonRequirementsMet ? (
                    <>
                      <FaCheckCircle className="inline mr-2" />
                      {language === 'en' ? 'Season Complete!' : '赛季完成！'}
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="inline mr-2" />
                      {language === 'en' ? 'Season Incomplete' : '赛季未完成'}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Ranking Progress Section / 段位进度部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? "Ranking Progress (Database Algorithm)" : "段位进度（数据库算法）"}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{language === 'en' ? "Current Rank" : "当前段位"}</span>
                  <span className="font-bold text-yellow-400">{mockAthleteProfile.rank}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(mockAthleteProfile.rankPoints / 1500) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{mockAthleteProfile.rankPoints} / 1500 {language === 'en' ? 'points' : '积分'}</span>
                  <span>{language === 'en' ? 'Next: Platinum' : '下一级：白金'}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'en' 
                    ? "Rankings calculated via database algorithm using performance data from all matches." 
                    : "段位通过数据库算法计算，使用所有比赛的表现数据。"}
                </p>
              </div>
            </div>
          </div>
        )

      case 'virtual-transactions':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center">
              <FaCoins className="mr-2 text-yellow-400" />
              {language === 'en' ? "Virtual CHZ Transactions" : "虚拟CHZ交易"}
            </h2>
            <div className="mb-4 p-4 bg-blue-600/20 rounded-lg border border-blue-500/30">
              <p className="text-blue-400 text-sm">
                {language === 'en' 
                  ? "All transactions are tracked in the database as virtual CHZ balance. Convert to real CHZ after completing season requirements." 
                  : "所有交易都在数据库中作为虚拟CHZ余额追踪。完成赛季要求后转换为真实CHZ。"}
              </p>
            </div>
            <DataTable columns={mockVirtualTransactions.columns} rows={mockVirtualTransactions.rows} language={language} />
          </div>
        )

      case 'social-media':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white flex items-center">
              <FaShare className="mr-2 text-purple-400" />
              {language === 'en' ? "Social Media Verification" : "社交媒体验证"}
            </h2>
            <div className="mb-4 p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <p className="text-purple-400 text-sm">
                {language === 'en' 
                  ? "Post verification is handled by external API checks. You need 5+ verified posts to complete the season." 
                  : "帖子验证通过外部API检查处理。您需要5+条已验证帖子才能完成赛季。"}
              </p>
          </div>
            <div className="space-y-4">
              {mockSocialPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {post.platform === 'Instagram' && <FaInstagram className="text-pink-500 text-xl" />}
                    {post.platform === 'Twitter' && <FaTwitter className="text-blue-400 text-xl" />}
                    {post.platform === 'Facebook' && <FaFacebook className="text-blue-600 text-xl" />}
                    <div>
                      <div className="font-semibold text-white">{post.platform}</div>
                      <div className="text-sm text-gray-400">{post.date}</div>
                      <div className="text-xs text-gray-500">{post.engagement} {language === 'en' ? 'engagements' : '互动'}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    post.verified ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                  }`}>
                    {post.verified ? (language === 'en' ? 'Verified' : '已验证') : (language === 'en' ? 'Pending' : '待验证')}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center mx-auto">
                <FaUpload className="mr-2" />
                {language === 'en' ? "Submit New Post for Verification" : "提交新帖子进行验证"}
              </button>
            </div>
          </div>
        )

      case 'matches':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "Match History" : "比赛历史"}
            </h2>
            <DataTable columns={mockMatchHistory.columns} rows={mockMatchHistory.rows} language={language} />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout
      title={language === 'en' ? "Athlete Dashboard" : "运动员仪表板"}
      subtitle={language === 'en' ? "Your Web2-first campus competition hub with virtual CHZ system" : "您的Web2优先校园比赛中心，配备虚拟CHZ系统"}
    >
      {/* Entry Fee Modal / 入赛费用模态框 */}
      {showEntryFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {language === 'en' ? "Enter Competition" : "进入比赛"}
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30">
                <p className="text-orange-400 mb-2">
                  {language === 'en' ? "Entry Fee Required" : "需要入赛费用"}
                </p>
                <p className="text-white text-lg font-bold">
                  {mockAthleteProfile.entryFeeAmount} Virtual CHZ
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <p className="text-gray-300 text-sm">
                  {language === 'en' ? "Current ICP Balance:" : "当前ICP余额："} 
                  <span className="text-green-400 font-bold ml-1">
                    {mockAthleteProfile.icpSeasonBonusBalance} ICP
                  </span>
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  {language === 'en' ? "After Entry:" : "入赛后："} 
                  <span className="text-blue-400 font-bold ml-1">
                    {(mockAthleteProfile.icpSeasonBonusBalance - mockAthleteProfile.entryFeeAmount).toFixed(2)} ICP
                  </span>
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'en' 
                  ? "This fee will be deducted from your virtual CHZ balance. You'll be available for ambassador selection via ranking-based algorithms." 
                  : "此费用将从您的虚拟CHZ余额中扣除。您将可通过基于排名的算法被大使选择。"}
              </p>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={handlePayEntryFee}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Pay Entry Fee' : '支付入赛费用'}
              </button>
              <button 
                onClick={() => setShowEntryFeeModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Cancel' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mainnet Payout Modal / 主网支付模态框 */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {language === 'en' ? "Request Mainnet CHZ Payout" : "请求主网CHZ支付"}
            </h3>
            <div className="space-y-4">
              <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-400 mb-2">
                  {language === 'en' ? "Season Requirements Met!" : "赛季要求已满足！"}
                </p>
                <div className="text-white space-y-1">
                  <div>✅ {mockSeasonProgress.matchesCompleted}/{mockSeasonProgress.matchesRequired} {language === 'en' ? 'matches' : '比赛'}</div>
                  <div>✅ {mockSeasonProgress.postsCompleted}/{mockSeasonProgress.postsRequired} {language === 'en' ? 'verified posts' : '已验证帖子'}</div>
                </div>
              </div>
              <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
                <p className="text-blue-400 mb-2">
                  {language === 'en' ? "Virtual CHZ to Convert:" : "要转换的虚拟CHZ："}
                </p>
                <p className="text-white text-2xl font-bold">
                  {mockAthleteProfile.icpSeasonBonusBalance} → Real ICP
                </p>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'en' 
                  ? "This will convert your virtual CHZ balance to real CHZ tokens on Chiliz mainnet via the ultra-simple contract." 
                  : "这将通过超简化合约将您的虚拟CHZ余额转换为Chiliz主网上的真实CHZ代币。"}
              </p>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => {
                  setShowPayoutModal(false)
                  // In real app, trigger mainnet payout process
                  showToast({
                    type: 'success',
                    message: language === 'en' ? 'Mainnet payout requested!' : '主网支付请求已提交！'
                  })
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Confirm Payout' : '确认支付'}
              </button>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Cancel' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增：托管到基金会确认模态框 */}
      {showVaultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-2xl mr-3">🏦</span>
              {language === 'en' ? "Confirm Transfer to Foundation Vault" : "确认托管到基金会"}
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500/30">
                <p className="text-blue-400 mb-2">
                  {language === 'en' ? "Foundation Vault Benefits:" : "基金会金库优势："}
                </p>
                <div className="text-white space-y-1 text-sm">
                  <div>✅ {language === 'en' ? 'AI-powered investment management' : 'AI驱动的投资管理'}</div>
                  <div>✅ {language === 'en' ? 'Expected returns: 8-15% APY' : '预期收益：8-15%年化'}</div>
                  <div>✅ {language === 'en' ? 'Withdraw anytime' : '随时可提取'}</div>
                </div>
              </div>
              <div className="bg-green-600/20 p-4 rounded-lg border border-green-500/30">
                <p className="text-green-400 mb-2">
                  {language === 'en' ? "Transfer Amount:" : "托管金额："}
                </p>
                <div className="mb-3">
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder={language === 'en' ? "Enter USDC amount" : "输入USDC金额"}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg font-bold focus:outline-none focus:border-blue-500"
                    disabled={vaultTransferLoading}
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setTransferAmount((parseFloat(realUSDCBalance) * 0.25).toFixed(2))}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      disabled={vaultTransferLoading || isLoadingBalance}
                    >
                      {language === 'en' ? '25%' : '25%'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferAmount((parseFloat(realUSDCBalance) * 0.5).toFixed(2))}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      disabled={vaultTransferLoading || isLoadingBalance}
                    >
                      {language === 'en' ? '50%' : '50%'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferAmount((parseFloat(realUSDCBalance) * 0.75).toFixed(2))}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      disabled={vaultTransferLoading || isLoadingBalance}
                    >
                      {language === 'en' ? '75%' : '75%'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransferAmount(realUSDCBalance)}
                      className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      disabled={vaultTransferLoading || isLoadingBalance}
                    >
                      {language === 'en' ? '100%' : '100%'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>
                    {language === 'en' ? "Available:" : "可用余额："} 
                    {isLoadingBalance ? (
                      <span className="inline-flex items-center">
                        <FaSpinner className="animate-spin mr-1" />
                        Loading...
                      </span>
                    ) : (
                      `${realUSDCBalance} USDC`
                    )}
                  </span>
                  <span>{language === 'en' ? "Wallet:" : "钱包："} {walletInfo?.address ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}` : 'Not connected'}</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'en' 
                  ? "Your USDC will be automatically invested through OKX DEX using AI strategies for optimal returns." 
                  : "您的USDC将通过OKX DEX使用AI策略自动投资，获得最优收益。"}
              </p>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={handleConfirmVaultTransfer}
                disabled={vaultTransferLoading || !transferAmount || parseFloat(transferAmount) <= 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {vaultTransferLoading ? (
                  <>
                    <FaSpinner className="inline mr-2 animate-spin" />
                    {language === 'en' ? 'Processing...' : '处理中...'}
                  </>
                ) : (
                  <>
                    <span className="mr-2">🏦</span>
                    {language === 'en' ? 'Confirm Transfer' : '确认托管'}
                  </>
                )}
              </button>
              <button 
                onClick={() => setShowVaultModal(false)}
                disabled={vaultTransferLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {language === 'en' ? 'Cancel' : '取消'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header Section / 档案头部部分 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-4 flex items-center space-x-4">
          <img src={mockAthleteProfile.avatar} alt="Athlete Avatar" className="w-16 h-16 rounded-full border-2 border-yellow-500"/>
          <div>
            <h3 className="font-bold text-lg">{mockAthleteProfile.name}</h3>
            <p className="text-sm text-gray-400">{mockAthleteProfile.sport} • {mockAthleteProfile.position}</p>
            <p className="text-xs text-yellow-400">{mockAthleteProfile.rank} Rank</p>
          </div>
        </div>
        <StatCard 
          icon={<FaCoins />} 
          title={language === 'en' ? "USDC Balance" : "USDC余额"} 
          value={
            isLoadingBalance ? (
              <span className="flex items-center">
                <FaSpinner className="animate-spin mr-1" />
                Loading...
              </span>
            ) : isConnected ? (
              `${realUSDCBalance} USDC`
            ) : (
              `${mockAthleteStats.icpSeasonBonusBalance} ICP`
            )
          } 
        />
        <StatCard 
          icon={<FaTrophy />} 
          title={language === 'en' ? "Win Rate" : "胜率"} 
          value={mockAthleteStats.winRate} 
        />
        <StatCard 
          icon={<FaChartLine />} 
          title={language === 'en' ? "Season Progress" : "赛季进度"} 
          value={`${Math.round(mockSeasonProgress.progressPercentage)}%`} 
        />
      </div>

      {/* VISUAL CENTER: Competition Status Section / 视觉中心：比赛状态部分 */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-8 mb-8 text-center">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4 animate-pulse">
          {language === 'en' ? "Competition Status" : "比赛状态"}
        </h2>
        <div className="mb-6">
          {renderStatusButton()}
        </div>
        {renderStatusDescription()}
        
        {/* Quick Status Toggle Options / 快速状态切换选项 */}
        <div className="flex justify-center mt-6 space-x-4">
          <button 
            onClick={() => handleStatusChange('resting')}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
              currentStatus === 'resting' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <FaPause className="inline mr-2" />
            {language === 'en' ? 'Rest' : '休赛'}
          </button>
          <button 
            onClick={() => handleStatusChange('active')}
            disabled={currentStatus === 'active'}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
              currentStatus === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <FaPlay className="inline mr-2" />
            {language === 'en' ? 'Active' : '活跃'}
          </button>
        </div>
      </div>

      {/* Quick Stats Row / 快速统计行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{mockAthleteStats.totalMatches}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'Total Matches' : '总比赛'}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{mockAthleteStats.wins}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'Wins' : '胜利'}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{mockAthleteStats.mvpCount}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'MVP Awards' : 'MVP奖项'}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{mockAthleteStats.currentStreak}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'Current Streak' : '当前连胜'}</div>
        </div>
      </div>

      {/* ICP Integration Section / ICP集成部分 */}
      <div className="mb-8">
        <ICPIntegration />
        
        {/* ICP Bonus Widget Integration / ICP奖金组件集成 */}
        <div className="mt-6">
          <ICPBonusWidget />
        </div>
      </div>
      
      {/* Tabs / 标签页 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Overview" : "概览"}
          </button>
          <button onClick={() => setActiveTab('virtual-transactions')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'virtual-transactions' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "ICP Season Bonus" : "ICP赛季奖金"}
          </button>
          <button onClick={() => setActiveTab('social-media')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'social-media' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Social Media" : "社交媒体"}
          </button>
          <button onClick={() => setActiveTab('matches')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'matches' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Match History" : "比赛历史"}
          </button>
        </div>
      </div>

      {/* Tab Content / 标签页内容 */}
      {renderTabContent()}
      <ToastContainer />
    </DashboardLayout>
  )
} 