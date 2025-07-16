// FanForce AI - 运动员仪表板主页（基于详细用户流程）
// Athlete Dashboard Main Page - 运动员的主要仪表板页面，基于Web2优先架构的详细用户流程
// Main dashboard page for athletes based on detailed Web2-first user flow
// 运动员的主要仪表板页面，基于Web2优先架构的详细用户流程
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/api/athlete/profile/route.ts: 运动员档案API
// - app/api/athlete/status/route.ts: 运动员状态API
// - app/api/athlete/ranking/route.ts: 运动员排名API
// - app/api/athlete/matches/route.ts: 运动员比赛API
// - app/api/athlete/earnings/route.ts: 运动员收入API
// - lib/athlete-schema.sql: 运动员数据库架构
// 
// 用户流程要点:
// 1. 虚拟CHZ薪水系统（数据库余额追踪）
// 2. 赛季要求：10+比赛 + X社交帖子才能解锁主网支付
// 3. 入赛手续费（从虚拟余额扣除）
// 4. 休赛 → 活跃 → 等待选择 → 被选中的状态流程
// 5. 社交媒体帖子验证（外部API检查）

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import DataTable from '@/app/components/shared/DataTable'
import StatCard from '@/app/components/shared/StatCard'
import { useRouter } from 'next/navigation'
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

// Mock Data for Athlete Dashboard based on detailed user flow / 基于详细用户流程的运动员仪表板模拟数据
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
  
  // Virtual CHZ System (Database Balance Tracking) / 虚拟CHZ系统（数据库余额追踪）
  virtualCHZBalance: 285.50, // Current virtual balance before mainnet payout
  virtualSalaryMonthly: 120.75, // Monthly virtual salary
  entryFeeAmount: 25.00, // Fee to enter competition
  
  // Season Progress Requirements / 赛季进度要求
  seasonMatches: 8, // Current matches this season
  seasonMatchesRequired: 10, // Must complete 10+ matches
  socialPosts: 3, // Current verified social posts
  socialPostsRequired: 5, // Must have 5+ verified posts
  
  // Career Statistics / 职业统计
  totalMatches: 15,
  winRate: '73%',
  careerEarnings: 450.25, // Total from previous seasons
  
  // Queue Information / 队列信息
  queuePosition: 3,
  estimatedWaitTime: '15 mins',
  
  // Season Status / 赛季状态
  seasonCompleted: false, // Whether current season requirements are met
  canRequestPayout: false // Whether eligible for mainnet CHZ payout
}

const mockAthleteStats = {
  totalMatches: 15,
  wins: 11,
  losses: 4,
  mvpCount: 3,
  virtualCHZBalance: 285.50,
  virtualSalaryMonthly: 120.75,
  currentStreak: 4,
  bestStreak: 6,
  averagePerformance: 8.5,
  winRate: '73%',
  feesFromMatches: 65.25 // 1% fee share from matches
}

// Season Requirements Progress / 赛季要求进度
const mockSeasonProgress = {
  matchesCompleted: 8,
  matchesRequired: 10,
  postsCompleted: 3,
  postsRequired: 5,
  progressPercentage: Math.min(((8/10) + (3/5)) / 2 * 100, 100),
  canAdvanceToNextSeason: false
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

// Virtual CHZ Transaction History / 虚拟CHZ交易历史
const mockVirtualTransactions = {
  columns: [
    { key: 'date', headerEn: 'Date', headerCn: '日期' },
    { key: 'type', headerEn: 'Type', headerCn: '类型' },
    { key: 'amount', headerEn: 'Amount (Virtual CHZ)', headerCn: '数量 (虚拟CHZ)' },
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
      description: 'Virtual CHZ monthly salary' 
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
  const [activeTab, setActiveTab] = useState('overview')
  const [currentStatus, setCurrentStatus] = useState(mockAthleteProfile.status)
  const [showEntryFeeModal, setShowEntryFeeModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)

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

  // Handle entry fee payment / 处理入赛手续费支付
  const handlePayEntryFee = () => {
    if (mockAthleteProfile.virtualCHZBalance >= mockAthleteProfile.entryFeeAmount) {
      setCurrentStatus('active')
      setShowEntryFeeModal(false)
      // In real app, deduct from virtual balance / 在真实应用中，从虚拟余额扣除
      console.log(`Entry fee of ${mockAthleteProfile.entryFeeAmount} CHZ deducted from virtual balance`)
    } else {
      alert(language === 'en' ? 'Insufficient virtual CHZ balance!' : '虚拟CHZ余额不足！')
    }
  }

  // Request mainnet CHZ payout / 请求主网CHZ支付
  const handleRequestPayout = () => {
    if (seasonRequirementsMet) {
      setShowPayoutModal(true)
    } else {
      alert(language === 'en' 
        ? 'Complete season requirements first: 10+ matches and 5+ verified social posts' 
        : '请先完成赛季要求：10场比赛和5条已验证的社交帖子')
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
                  {language === 'en' ? "Virtual CHZ Balance" : "虚拟CHZ余额"}
                </h3>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {mockAthleteProfile.virtualCHZBalance.toFixed(2)} CHZ
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>{language === 'en' ? 'Monthly Salary:' : '月薪：'} {mockAthleteProfile.virtualSalaryMonthly} CHZ</div>
                  <div>{language === 'en' ? 'Career Earnings:' : '职业收入：'} {mockAthleteProfile.careerEarnings} CHZ</div>
                  <div className="text-orange-400">
                    {language === 'en' ? 'Entry Fee:' : '入赛费用：'} {mockAthleteProfile.entryFeeAmount} CHZ
                  </div>
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
                  {language === 'en' ? "Current Balance:" : "当前余额："} 
                  <span className="text-green-400 font-bold ml-1">
                    {mockAthleteProfile.virtualCHZBalance} Virtual CHZ
                  </span>
                </p>
                <p className="text-gray-300 text-sm mt-1">
                  {language === 'en' ? "After Entry:" : "入赛后："} 
                  <span className="text-blue-400 font-bold ml-1">
                    {(mockAthleteProfile.virtualCHZBalance - mockAthleteProfile.entryFeeAmount).toFixed(2)} Virtual CHZ
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
                  {mockAthleteProfile.virtualCHZBalance} → Real CHZ
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
                  alert(language === 'en' ? 'Mainnet payout requested!' : '主网支付请求已提交！')
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Request Payout' : '请求支付'}
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
          title={language === 'en' ? "Virtual CHZ" : "虚拟CHZ"} 
          value={`${mockAthleteStats.virtualCHZBalance} CHZ`} 
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
      
      {/* Tabs / 标签页 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Overview" : "概览"}
          </button>
          <button onClick={() => setActiveTab('virtual-transactions')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'virtual-transactions' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Virtual CHZ" : "虚拟CHZ"}
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
    </DashboardLayout>
  )
} 