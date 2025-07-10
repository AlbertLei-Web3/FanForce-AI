// FanForce AI - 观众仪表板主页
// Audience Dashboard Main Page - 观众支持者的主要仪表板页面
// Main dashboard page for audience supporters
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - Backend API: 活动浏览和质押功能

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../components/shared/DashboardLayout'
import Link from 'next/link'

// 用户统计数据接口 / User Statistics Interface
interface UserStats {
  totalStaked: number
  totalWinnings: number
  totalEvents: number
  activeStakes: number
  winRate: number
  currentTier: number
  tierProgress: number
  totalRewards: number
  pendingRewards: number
  // 本周数据 / This Week Data
  weeklyStaked: number
  weeklyWinnings: number
  weeklyEvents: number
}

// 活动接口 / Event Interface
interface Event {
  id: string
  title: string
  description: string
  teamA: string
  teamB: string
  startTime: string
  endTime: string
  venue: string
  minStake: number
  maxStake: number
  totalStaked: number
  participants: number
  status: 'upcoming' | 'live' | 'completed'
  userStake?: number
  userTeam?: 'A' | 'B'
}

// 质押记录接口 / Stake Record Interface
interface StakeRecord {
  id: string
  eventId: string
  eventTitle: string
  teamSelected: string
  amount: number
  tier: number
  timestamp: string
  status: 'active' | 'won' | 'lost' | 'pending'
  reward?: number
}

export default function AudienceDashboard() {
  const { authState, isAudience } = useUser()
  const { language, t } = useLanguage()
  const router = useRouter()

  // 状态管理 / State Management
  const [stats, setStats] = useState<UserStats | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recentStakes, setRecentStakes] = useState<StakeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 权限检查 / Permission Check
  useEffect(() => {
    if (!authState.isAuthenticated || !isAudience()) {
      router.push('/')
      return
    }
  }, [authState.isAuthenticated, isAudience, router])

  // 加载用户统计数据 / Load User Statistics
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3001/api/audience/stats', {
          headers: {
            'Authorization': `Bearer ${authState.sessionToken}`,
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setUpcomingEvents(data.upcomingEvents || [])
          setRecentStakes(data.recentStakes || [])
        } else {
          setError('Failed to load user statistics')
        }
      } catch (err) {
        setError('Network error while loading statistics')
        console.error('Error loading stats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (authState.sessionToken && isAudience()) {
      fetchUserStats()
    }
  }, [authState.sessionToken, isAudience])

  // 处理快速质押 / Handle Quick Stake
  const handleQuickStake = (eventId: string) => {
    router.push(`/dashboard/audience/events/${eventId}`)
  }

  // 获取等级名称 / Get Tier Name
  const getTierName = (tier: number) => {
    const tiers = {
      1: language === 'en' ? 'Gold Supporter' : '金牌支持者',
      2: language === 'en' ? 'Silver Supporter' : '银牌支持者',
      3: language === 'en' ? 'Bronze Supporter' : '铜牌支持者'
    }
    return tiers[tier as keyof typeof tiers] || (language === 'en' ? 'New Supporter' : '新支持者')
  }

  // 获取状态颜色 / Get Status Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500'
      case 'live': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      case 'won': return 'bg-green-500'
      case 'lost': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  // 格式化数字 / Format Numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toFixed(2)
  }

  // 加载中状态 / Loading State
  if (loading) {
    return (
      <DashboardLayout 
        title={language === 'en' ? 'Audience Hub' : '观众中心'}
        subtitle={language === 'en' ? 'Events, Staking & Rewards' : '活动、质押和奖励'}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fanforce-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  // 错误状态 / Error State
  if (error) {
    return (
      <DashboardLayout 
        title={language === 'en' ? 'Audience Hub' : '观众中心'}
        subtitle={language === 'en' ? 'Events, Staking & Rewards' : '活动、质押和奖励'}
      >
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={language === 'en' ? 'Audience Hub' : '观众中心'}
      subtitle={language === 'en' ? 'Events, Staking & Rewards' : '活动、质押和奖励'}
      actions={
        <div className="flex space-x-2">
          <Link 
            href="/dashboard/audience/scanner"
            className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-3 py-1 rounded text-sm"
          >
            {language === 'en' ? 'QR Scanner' : '扫码签到'}
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
          >
            {language === 'en' ? 'Refresh' : '刷新'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 用户统计卡片 / User Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 总质押 / Total Staked */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Total Staked' : '总质押'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.totalStaked || 0)} CHZ
                </p>
                <p className="text-xs text-purple-400">
                  +{formatNumber(stats?.weeklyStaked || 0)} {language === 'en' ? 'this week' : '本周'}
                </p>
              </div>
              <div className="text-3xl">💎</div>
            </div>
          </div>

          {/* 总奖励 / Total Rewards */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Total Rewards' : '总奖励'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.totalRewards || 0)} CHZ
                </p>
                <p className="text-xs text-green-400">
                  {formatNumber(stats?.pendingRewards || 0)} {language === 'en' ? 'pending' : '待领取'}
                </p>
              </div>
              <div className="text-3xl">🏅</div>
            </div>
          </div>

          {/* 胜率 / Win Rate */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Win Rate' : '胜率'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {((stats?.winRate || 0) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-blue-400">
                  {stats?.totalEvents || 0} {language === 'en' ? 'events' : '场活动'}
                </p>
              </div>
              <div className="text-3xl">📈</div>
            </div>
          </div>

          {/* 当前等级 / Current Tier */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Current Tier' : '当前等级'}
                </p>
                <p className="text-xl font-bold text-white">
                  {getTierName(stats?.currentTier || 3)}
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-fanforce-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats?.tierProgress || 0) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>
        </div>

        {/* 即将开始的活动和最近质押 / Upcoming Events and Recent Stakes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 即将开始的活动 / Upcoming Events */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {language === 'en' ? 'Upcoming Events' : '即将开始的活动'}
              </h3>
              <Link
                href="/dashboard/audience/events"
                className="text-fanforce-primary hover:text-fanforce-secondary text-sm"
              >
                {language === 'en' ? 'View All' : '查看全部'}
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{event.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      {event.teamA} vs {event.teamB}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{new Date(event.startTime).toLocaleDateString()}</span>
                      <span>{formatNumber(event.totalStaked)} CHZ staked</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {event.participants} {language === 'en' ? 'participants' : '参与者'}
                      </span>
                      <button
                        onClick={() => handleQuickStake(event.id)}
                        className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-3 py-1 rounded text-xs"
                      >
                        {language === 'en' ? 'Stake' : '质押'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {language === 'en' ? 'No upcoming events' : '暂无即将开始的活动'}
                </div>
              )}
            </div>
          </div>

          {/* 最近质押 / Recent Stakes */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {language === 'en' ? 'Recent Stakes' : '最近质押'}
              </h3>
              <Link
                href="/dashboard/audience/staking"
                className="text-fanforce-primary hover:text-fanforce-secondary text-sm"
              >
                {language === 'en' ? 'View All' : '查看全部'}
              </Link>
            </div>
            <div className="space-y-3">
              {recentStakes.length > 0 ? (
                recentStakes.slice(0, 5).map((stake) => (
                  <div key={stake.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">{stake.eventTitle}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(stake.status)}`}>
                        {stake.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        {stake.teamSelected} • {formatNumber(stake.amount)} CHZ
                      </span>
                      {stake.reward && (
                        <span className="text-green-400">
                          +{formatNumber(stake.reward)} CHZ
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(stake.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {language === 'en' ? 'No recent stakes' : '暂无最近质押'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快速操作 / Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">
            {language === 'en' ? 'Quick Actions' : '快速操作'}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/audience/events"
              className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm">
                {language === 'en' ? 'Browse Events' : '浏览活动'}
              </div>
            </Link>
            <Link
              href="/dashboard/audience/staking"
              className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">💎</div>
              <div className="text-sm">
                {language === 'en' ? 'Staking Center' : '质押中心'}
              </div>
            </Link>
            <Link
              href="/dashboard/audience/rewards"
              className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">🏅</div>
              <div className="text-sm">
                {language === 'en' ? 'Rewards' : '奖励中心'}
              </div>
            </Link>
            <Link
              href="/dashboard/audience/scanner"
              className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-4 rounded-lg text-center transition-colors"
            >
              <div className="text-2xl mb-2">📱</div>
              <div className="text-sm">
                {language === 'en' ? 'QR Scanner' : '扫码签到'}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 