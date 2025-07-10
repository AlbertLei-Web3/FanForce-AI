// FanForce AI - 管理员仪表板主页
// Admin Dashboard Main Page - 系统管理员的主要仪表板页面
// Main dashboard page for system administrators
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - Backend API: 系统统计和管理功能

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../components/shared/DashboardLayout'
import Link from 'next/link'

// 系统统计数据接口 / System Statistics Interface
interface SystemStats {
  totalUsers: number
  activeUsers: number
  totalEvents: number
  activeEvents: number
  totalRevenue: number
  totalStaked: number
  platformFees: number
  // 角色统计 / Role Statistics
  adminCount: number
  ambassadorCount: number
  athleteCount: number
  audienceCount: number
  // 今日数据 / Today's Data
  todayUsers: number
  todayEvents: number
  todayRevenue: number
  todayStaked: number
}

// 最近活动接口 / Recent Activity Interface
interface RecentActivity {
  id: string
  type: 'user_registered' | 'event_created' | 'match_completed' | 'payout_made'
  description: string
  timestamp: string
  amount?: number
  user?: string
}

export default function AdminDashboard() {
  const { authState, isAdmin } = useUser()
  const { language, t } = useLanguage()
  const router = useRouter()

  // 状态管理 / State Management
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 权限检查 / Permission Check
  useEffect(() => {
    if (!authState.isAuthenticated || !isAdmin()) {
      router.push('/')
      return
    }
  }, [authState.isAuthenticated, isAdmin, router])

  // 加载系统统计数据 / Load System Statistics
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:3001/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${authState.sessionToken}`,
            'Content-Type': 'application/json',
          }
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
          setRecentActivities(data.recentActivities || [])
        } else {
          setError('Failed to load system statistics')
        }
      } catch (err) {
        setError('Network error while loading statistics')
        console.error('Error loading stats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (authState.sessionToken && isAdmin()) {
      fetchSystemStats()
    }
  }, [authState.sessionToken, isAdmin])

  // 处理紧急操作 / Handle Emergency Actions
  const handleEmergencyAction = async (action: string) => {
    if (!confirm(`Are you sure you want to execute: ${action}?`)) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/admin/emergency/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        alert(`${action} executed successfully`)
        // 重新加载数据 / Reload data
        window.location.reload()
      } else {
        alert(`Failed to execute ${action}`)
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error)
      alert(`Error executing ${action}`)
    }
  }

  // 获取活动类型图标 / Get Activity Type Icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered': return '👤'
      case 'event_created': return '🎯'
      case 'match_completed': return '🏆'
      case 'payout_made': return '💰'
      default: return '📝'
    }
  }

  // 格式化数字 / Format Numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // 加载中状态 / Loading State
  if (loading) {
    return (
      <DashboardLayout 
        title={language === 'en' ? 'Admin Dashboard' : '管理员仪表板'}
        subtitle={language === 'en' ? 'System Overview & Management' : '系统概览和管理'}
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
        title={language === 'en' ? 'Admin Dashboard' : '管理员仪表板'}
        subtitle={language === 'en' ? 'System Overview & Management' : '系统概览和管理'}
      >
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={language === 'en' ? 'Admin Dashboard' : '管理员仪表板'}
      subtitle={language === 'en' ? 'System Overview & Management' : '系统概览和管理'}
      actions={
        <div className="flex space-x-2">
          <button
            onClick={() => handleEmergencyAction('pause_system')}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            {language === 'en' ? 'Emergency Pause' : '紧急暂停'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-3 py-1 rounded text-sm"
          >
            {language === 'en' ? 'Refresh' : '刷新'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* 系统概览卡片 / System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 总用户数 / Total Users */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Total Users' : '总用户数'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.totalUsers || 0)}
                </p>
                <p className="text-xs text-green-400">
                  +{stats?.todayUsers || 0} {language === 'en' ? 'today' : '今日'}
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          {/* 活跃活动 / Active Events */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Active Events' : '活跃活动'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.activeEvents || 0)}
                </p>
                <p className="text-xs text-blue-400">
                  {stats?.totalEvents || 0} {language === 'en' ? 'total' : '总计'}
                </p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </div>

          {/* 总收入 / Total Revenue */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Total Revenue' : '总收入'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.totalRevenue || 0)} CHZ
                </p>
                <p className="text-xs text-yellow-400">
                  +{formatNumber(stats?.todayRevenue || 0)} {language === 'en' ? 'today' : '今日'}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

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
                  +{formatNumber(stats?.todayStaked || 0)} {language === 'en' ? 'today' : '今日'}
                </p>
              </div>
              <div className="text-3xl">💎</div>
            </div>
          </div>
        </div>

        {/* 角色分布和快速操作 / Role Distribution and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 角色分布 / Role Distribution */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">
              {language === 'en' ? 'Role Distribution' : '角色分布'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-gray-300">
                    {language === 'en' ? 'Admins' : '管理员'}
                  </span>
                </div>
                <span className="text-white font-medium">{stats?.adminCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-gray-300">
                    {language === 'en' ? 'Ambassadors' : '大使'}
                  </span>
                </div>
                <span className="text-white font-medium">{stats?.ambassadorCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-gray-300">
                    {language === 'en' ? 'Athletes' : '运动员'}
                  </span>
                </div>
                <span className="text-white font-medium">{stats?.athleteCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="text-gray-300">
                    {language === 'en' ? 'Audience' : '观众'}
                  </span>
                </div>
                <span className="text-white font-medium">{stats?.audienceCount || 0}</span>
              </div>
            </div>
          </div>

          {/* 快速操作 / Quick Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">
              {language === 'en' ? 'Quick Actions' : '快速操作'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/admin/users"
                className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-3 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-1">👥</div>
                <div className="text-sm">
                  {language === 'en' ? 'User Management' : '用户管理'}
                </div>
              </Link>
              <Link
                href="/dashboard/admin/events"
                className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-3 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-sm">
                  {language === 'en' ? 'Event Management' : '活动管理'}
                </div>
              </Link>
              <Link
                href="/dashboard/admin/analytics"
                className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-3 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-1">📈</div>
                <div className="text-sm">
                  {language === 'en' ? 'Analytics' : '数据分析'}
                </div>
              </Link>
              <Link
                href="/dashboard/admin/settings"
                className="bg-fanforce-primary hover:bg-fanforce-secondary text-white p-3 rounded-lg text-center transition-colors"
              >
                <div className="text-2xl mb-1">⚙️</div>
                <div className="text-sm">
                  {language === 'en' ? 'Settings' : '系统设置'}
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 最近活动 / Recent Activities */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4">
            {language === 'en' ? 'Recent System Activities' : '最近系统活动'}
          </h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{getActivityIcon(activity.type)}</span>
                    <div>
                      <p className="text-white text-sm">{activity.description}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activity.amount && (
                    <span className="text-fanforce-gold font-medium">
                      {formatNumber(activity.amount)} CHZ
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                {language === 'en' ? 'No recent activities' : '暂无最近活动'}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 