// FanForce AI - 运动员仪表板主页
// Athlete Dashboard Main Page - 运动员的主要仪表板页面，以比赛状态为视觉中心
// Main dashboard page for athletes with Competition Status as the visual center
// 运动员的主要仪表板页面，以比赛状态为视觉中心
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/api/athlete/profile/route.ts: 运动员档案API
// - app/api/athlete/status/route.ts: 运动员状态API
// - app/api/athlete/ranking/route.ts: 运动员排名API
// - app/api/athlete/matches/route.ts: 运动员比赛API
// - app/api/athlete/earnings/route.ts: 运动员收入API
// - lib/athlete-schema.sql: 运动员数据库架构

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
  FaCheckCircle
} from 'react-icons/fa'
import Link from 'next/link'

// Mock Data for Athlete Dashboard / 运动员仪表板模拟数据
const mockAthleteProfile = {
  name: 'Mike "The Machine" Johnson',
  avatar: '/placeholder.svg',
  studentId: '2023001',
  sport: 'Basketball',
  position: 'Point Guard',
  team: 'Campus Warriors',
  status: 'active', // 'active' | 'resting' | 'waiting' | 'selected'
  rank: 'Gold',
  rankPoints: 1250,
  totalMatches: 15,
  winRate: '73%',
  totalEarnings: 850.50,
  virtualSalary: 120.75,
  seasonMatches: 8,
  seasonPosts: 3,
  seasonTarget: 10,
  postsTarget: 5,
  queuePosition: 3, // 等待队列中的位置
  estimatedWaitTime: '15 mins' // 预计等待时间
}

const mockAthleteStats = {
  totalMatches: 15,
  wins: 11,
  losses: 4,
  mvpCount: 3,
  totalEarnings: 850.50,
  virtualSalary: 120.75,
  currentStreak: 4,
  bestStreak: 6,
  averagePerformance: 8.5,
  winRate: '73%'
}

const mockAchievements = [
  { name: 'First Victory', icon: '🏆', unlocked: true, description: 'Won your first match!' },
  { name: 'MVP Streak', icon: '⭐', unlocked: true, description: 'Won MVP 3 times in a row.' },
  { name: 'Gold Rank', icon: '🥇', unlocked: true, description: 'Reached Gold rank.' },
  { name: 'Social Star', icon: '📱', unlocked: true, description: 'Posted 5 social media updates.' },
  { name: 'Season Champion', icon: '👑', unlocked: false, description: 'Complete a full season (10+ matches).' },
  { name: 'Campus Legend', icon: '🌟', unlocked: false, description: 'Reach Master rank.' },
]

const mockMatchHistory = {
  columns: [
    { key: 'date', headerEn: 'Date', headerCn: '日期' },
    { key: 'opponent', headerEn: 'Opponent', headerCn: '对手' },
    { key: 'result', headerEn: 'Result', headerCn: '结果' },
    { key: 'performance', headerEn: 'Performance', headerCn: '表现' },
    { key: 'earnings', headerEn: 'Earnings (CHZ)', headerCn: '收入 (CHZ)' },
    { key: 'mvp', headerEn: 'MVP', headerCn: 'MVP' },
  ],
  rows: [
    { date: '2023-11-15', opponent: 'Team B', result: { type: 'win', text: 'W' }, performance: '9.5/10', earnings: '75.50', mvp: true },
    { date: '2023-11-10', opponent: 'Team C', result: { type: 'win', text: 'W' }, performance: '8.0/10', earnings: '65.25', mvp: false },
    { date: '2023-11-05', opponent: 'Team A', result: { type: 'loss', text: 'L' }, performance: '7.5/10', earnings: '25.00', mvp: false },
    { date: '2023-10-28', opponent: 'Team D', result: { type: 'win', text: 'W' }, performance: '9.0/10', earnings: '70.00', mvp: true },
    { date: '2023-10-20', opponent: 'Team B', result: { type: 'win', text: 'W' }, performance: '8.5/10', earnings: '68.75', mvp: false },
  ]
}

export default function AthleteDashboard() {
  const { language } = useLanguage()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [currentStatus, setCurrentStatus] = useState(mockAthleteProfile.status)

  // 状态管理函数 / Status management functions
  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus)
    // 在真实应用中，这里会调用API / In real app, this would call API
    console.log(`Status changed to: ${newStatus}`)
  }

  // 渲染状态按钮的函数 / Function to render status button
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
          </button>
        )
      case 'active':
        return (
          <button 
            onClick={() => router.push('/dashboard/athlete/waiting')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-blue-500/50"
          >
            <FaClock className="inline mr-3 text-2xl" />
            {language === 'en' ? 'Waiting for Selection' : '等待选择'}
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
          </button>
        )
      default:
        return null
    }
  }

  // 渲染状态描述 / Render status description
  const renderStatusDescription = () => {
    switch (currentStatus) {
      case 'resting':
        return (
          <p className="text-gray-400 text-center mt-4">
            {language === 'en' 
              ? "You're currently resting. Click above to enter competition mode and be available for team selection." 
              : "您当前处于休赛状态。点击上方按钮进入比赛模式，可被队伍选择。"}
          </p>
        )
      case 'active':
        return (
          <p className="text-gray-400 text-center mt-4">
            {language === 'en' 
              ? "You're active and available for selection. Ambassadors can now choose you for their teams." 
              : "您处于活跃状态，可被选择。大使现在可以选择您加入他们的队伍。"}
          </p>
        )
      case 'waiting':
        return (
          <p className="text-gray-400 text-center mt-4">
            {language === 'en' 
              ? `You're #${mockAthleteProfile.queuePosition} in the selection queue. Estimated wait time: ${mockAthleteProfile.estimatedWaitTime}` 
              : `您在选择队列中排第${mockAthleteProfile.queuePosition}位。预计等待时间：${mockAthleteProfile.estimatedWaitTime}`}
          </p>
        )
      case 'selected':
        return (
          <p className="text-gray-400 text-center mt-4">
            {language === 'en' 
              ? "Congratulations! You've been selected for an upcoming match. Check your match details." 
              : "恭喜！您已被选中参加即将到来的比赛。查看您的比赛详情。"}
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
            {/* Ranking Progress Section / 段位进度部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? "Ranking Progress" : "段位进度"}
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
              </div>
            </div>

            {/* Season Progress Section / 赛季进度部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? "Season Progress" : "赛季进度"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{mockAthleteProfile.seasonMatches}</div>
                  <div className="text-sm text-gray-400">{language === 'en' ? 'Matches' : '比赛'}</div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Target: 10+' : '目标：10+'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{mockAthleteProfile.seasonPosts}</div>
                  <div className="text-sm text-gray-400">{language === 'en' ? 'Social Posts' : '社交帖子'}</div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Target: 5' : '目标：5'}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((mockAthleteProfile.seasonMatches / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-400 mt-2">
                  {language === 'en' ? 'Season Completion Progress' : '赛季完成进度'}
                </div>
              </div>
            </div>

            {/* Recent Achievement Section / 最近成就部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? "Recent Achievement" : "最近成就"}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-4xl">🥇</div>
                <div>
                  <h4 className="font-bold text-yellow-400">{language === 'en' ? "Gold Rank Achieved!" : "达到黄金段位！"}</h4>
                  <p className="text-gray-400 text-sm">
                    {language === 'en' 
                      ? "You've reached Gold rank with 1250 points." 
                      : "您已达到1250积分的黄金段位。"}
                  </p>
                </div>
              </div>
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

      case 'achievements':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "Achievements" : "成就"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockAchievements.map((achievement, index) => (
                <div key={index} className={`text-center p-4 rounded-lg transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-yellow-500/10 border-2 border-yellow-500' 
                    : 'bg-gray-700/50 border-2 border-gray-600'
                }`}>
                  <div className={`text-3xl mb-2 ${!achievement.unlocked && 'opacity-30'}`}>
                    {achievement.icon}
                  </div>
                  <h4 className={`font-bold text-sm ${!achievement.unlocked && 'opacity-30'}`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-xs text-gray-400 mt-1 ${!achievement.unlocked && 'opacity-30'}`}>
                    {achievement.description}
                  </p>
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
    <DashboardLayout
      title={language === 'en' ? "Athlete Dashboard" : "运动员仪表板"}
      subtitle={language === 'en' ? "Your performance hub for campus competitions" : "您的校园比赛表现中心"}
    >
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
        <StatCard icon={<FaTrophy />} title={language === 'en' ? "Win Rate" : "胜率"} value={mockAthleteStats.winRate} />
        <StatCard icon={<FaCoins />} title={language === 'en' ? "Total Earnings" : "总收入"} value={`${mockAthleteStats.totalEarnings} CHZ`} />
        <StatCard icon={<FaChartLine />} title={language === 'en' ? "Avg Performance" : "平均表现"} value={`${mockAthleteStats.averagePerformance}/10`} />
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
          <button onClick={() => setActiveTab('matches')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'matches' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Match History" : "比赛历史"}
          </button>
          <button onClick={() => setActiveTab('achievements')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'achievements' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Achievements" : "成就"}
          </button>
        </div>
      </div>

      {/* Tab Content / 标签页内容 */}
      {renderTabContent()}
    </DashboardLayout>
  )
} 