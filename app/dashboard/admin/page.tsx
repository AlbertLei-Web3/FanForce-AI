// FanForce AI - 管理员仪表板主页
// Admin Dashboard Main Page - 系统管理员的主要仪表板页面
// Main dashboard page for system administrators with enhanced Phase 1 features
// 系统管理员的主要仪表板页面，包含增强的第一阶段功能
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/api/admin/dashboard/route.ts: 仪表板统计API
// - app/api/admin/config/route.ts: 系统配置API
// - app/api/admin/fee-rules/route.ts: 手续费规则API
// - app/api/admin/users/route.ts: 用户管理API
// - app/api/admin/chz-pool/route.ts: CHZ池监控API
// - lib/enhanced-admin-schema.sql: 增强的管理员数据库架构

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
  // 新增统计 / New Statistics
  chzPoolHealth: number
  pendingTransactions: number
  systemStatus: string
}

// 最近活动接口 / Recent Activity Interface
interface RecentActivity {
  id: string
  type: 'user_registered' | 'event_created' | 'match_completed' | 'payout_made' | 'user_action' | 'transaction' | 'event'
  description: string
  timestamp: string
  amount?: number
  user?: string
  details?: any
}

// 手续费规则接口 / Fee Rules Interface
interface FeeRules {
  id: string
  rule_name: string
  staking_fee_percent: number
  withdrawal_fee_percent: number
  distribution_fee_percent: number
  ambassador_share_percent: number
  athlete_share_percent: number
  community_fund_percent: number
  is_active: boolean
  effective_date: string
}

// 用户管理数据接口 / User Management Data Interface
interface UserManagementData {
  users: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    [key: string]: {
      total: number
      active: number
      inactive: number
    }
  }
}

// CHZ池状态接口 / CHZ Pool Status Interface
interface CHZPoolStatus {
  pool_status: {
    total_staked_chz: number
    total_fees_collected: number
    available_for_withdrawal: number
    pool_health_score: number
    monitoring_status: string
  }
  transaction_stats: {
    total_staked: number
    total_paid_out: number
    total_fees: number
    pending_count: number
  }
  calculated_metrics: {
    pool_health_score: number
    available_for_withdrawal: number
  }
}

export default function AdminDashboard() {
  const { authState, isAdmin, isSuperAdmin } = useUser()
  const { language, t } = useLanguage()
  const router = useRouter()

  // 状态管理 / State Management
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 新增状态管理 / New State Management
  const [feeRules, setFeeRules] = useState<FeeRules | null>(null)
  const [userManagementData, setUserManagementData] = useState<UserManagementData | null>(null)
  const [chzPoolStatus, setCHZPoolStatus] = useState<CHZPoolStatus | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'fees' | 'pool' | 'config'>('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [systemConfig, setSystemConfig] = useState<any>(null)
  
  // 手续费规则表单状态 / Fee Rules Form State
  const [feeRulesForm, setFeeRulesForm] = useState({
    rule_name: 'Default Fee Structure',
    staking_fee_percent: 5.00,
    withdrawal_fee_percent: 2.00,
    distribution_fee_percent: 3.00,
    ambassador_share_percent: 1.00,
    athlete_share_percent: 1.00,
    community_fund_percent: 1.00
  })
  
  // 用户管理过滤器状态 / User Management Filter State
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    status: 'all',
    search: '',
    page: 1
  })

  // 权限检查 / Permission Check - 允许管理员和超级管理员访问 / Allow both admin and super admin access
  useEffect(() => {
    if (!authState.isAuthenticated || (!isAdmin() && !isSuperAdmin())) {
      router.push('/')
      return
    }
  }, [authState.isAuthenticated, isAdmin, isSuperAdmin, router])

  // 加载所有仪表板数据 / Load All Dashboard Data
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true)
        
        // 获取管理员ID用于API调用 / Get admin ID for API calls
        const adminId = authState.user?.id || 'unknown'
        
        // 并行获取所有数据 / Fetch all data in parallel
        const [
          dashboardResponse,
          feeRulesResponse,
          userManagementResponse,
          chzPoolResponse,
          configResponse
        ] = await Promise.all([
          fetch(`/api/admin/dashboard?admin_id=${adminId}`, {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          }),
          fetch('/api/admin/fee-rules', {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          }),
          fetch(`/api/admin/users?page=1&limit=10&role=all&status=all`, {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          }),
          fetch('/api/admin/chz-pool', {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          }),
          fetch('/api/admin/config', {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          })
        ])

        // 处理仪表板统计数据 / Process dashboard statistics
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json()
          setStats(dashboardData.stats)
          setRecentActivities(dashboardData.recentActivities || [])
        }

        // 处理手续费规则数据 / Process fee rules data
        if (feeRulesResponse.ok) {
          const feeRulesData = await feeRulesResponse.json()
          setFeeRules(feeRulesData.fee_rules)
          setFeeRulesForm(feeRulesData.fee_rules)
        }

        // 处理用户管理数据 / Process user management data
        if (userManagementResponse.ok) {
          const userManagementData = await userManagementResponse.json()
          setUserManagementData(userManagementData)
        }

        // 处理CHZ池状态数据 / Process CHZ pool status data
        if (chzPoolResponse.ok) {
          const chzPoolData = await chzPoolResponse.json()
          setCHZPoolStatus(chzPoolData)
        }

        // 处理系统配置数据 / Process system configuration data
        if (configResponse.ok) {
          const configData = await configResponse.json()
          setSystemConfig(configData.configs)
        }

        setError(null)
      } catch (err) {
        setError('Network error while loading dashboard data')
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (authState.sessionToken && (isAdmin() || isSuperAdmin())) {
      fetchAllDashboardData()
    }
  }, [authState.sessionToken, isAdmin, isSuperAdmin])

  // 刷新数据函数 / Refresh Data Function
  const refreshData = async () => {
    setRefreshing(true)
    try {
      const adminId = authState.user?.id || 'unknown'
      
      const dashboardResponse = await fetch(`/api/admin/dashboard?admin_id=${adminId}`, {
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        }
      })

      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json()
        setStats(dashboardData.stats)
        setRecentActivities(dashboardData.recentActivities || [])
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
    } finally {
      setRefreshing(false)
    }
  }

  // 处理紧急操作 / Handle Emergency Actions
  const handleEmergencyAction = async (action: string) => {
    if (!confirm(`Are you sure you want to execute: ${action}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/emergency/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        alert(`${action} executed successfully`)
        refreshData()
      } else {
        alert(`Failed to execute ${action}`)
      }
    } catch (error) {
      console.error(`Error executing ${action}:`, error)
      alert(`Error executing ${action}`)
    }
  }

  // 更新手续费规则 / Update Fee Rules
  const handleUpdateFeeRules = async () => {
    try {
      const adminId = authState.user?.id
      if (!adminId) {
        alert('Admin ID not found')
        return
      }

      const response = await fetch('/api/admin/fee-rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feeRulesForm,
          admin_id: adminId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFeeRules(data.fee_rules)
        alert(language === 'en' ? 'Fee rules updated successfully' : '手续费规则更新成功')
        refreshData()
      } else {
        const errorData = await response.json()
        alert(`Failed to update fee rules: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating fee rules:', error)
      alert('Error updating fee rules')
    }
  }

  // 更新用户状态 / Update User Status
  const handleUpdateUserStatus = async (userId: string, action: 'enable' | 'disable', reason?: string) => {
    try {
      const adminId = authState.user?.id
      if (!adminId) {
        alert('Admin ID not found')
        return
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          action,
          admin_id: adminId,
          reason
        })
      })

      if (response.ok) {
        alert(`User ${action} successfully`)
        // 重新加载用户数据 / Reload user data
        const userResponse = await fetch(`/api/admin/users?page=${userFilters.page}&limit=10&role=${userFilters.role}&status=${userFilters.status}&search=${userFilters.search}`, {
          headers: {
            'Authorization': `Bearer ${authState.sessionToken}`,
            'Content-Type': 'application/json',
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUserManagementData(userData)
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to ${action} user: ${errorData.error}`)
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error)
      alert(`Error ${action} user`)
    }
  }

  // 更新系统配置 / Update System Configuration
  const handleUpdateSystemConfig = async (configKey: string, configValue: any, description: string) => {
    try {
      const adminId = authState.user?.id
      if (!adminId) {
        alert('Admin ID not found')
        return
      }

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config_key: configKey,
          config_value: configValue,
          description,
          admin_id: adminId
        })
      })

      if (response.ok) {
        alert(language === 'en' ? 'System configuration updated successfully' : '系统配置更新成功')
        refreshData()
      } else {
        const errorData = await response.json()
        alert(`Failed to update system configuration: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error updating system configuration:', error)
      alert('Error updating system configuration')
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
            onClick={refreshData}
            disabled={refreshing}
            className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            {refreshing ? (language === 'en' ? 'Refreshing...' : '刷新中...') : (language === 'en' ? 'Refresh' : '刷新')}
          </button>
        </div>
      }
    >
      {/* 导航标签 / Navigation Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          {[
            { id: 'overview', label: language === 'en' ? 'Overview' : '概览', icon: '📊' },
            { id: 'users', label: language === 'en' ? 'User Management' : '用户管理', icon: '👥' },
            { id: 'fees', label: language === 'en' ? 'Fee Rules' : '手续费规则', icon: '💰' },
            { id: 'pool', label: language === 'en' ? 'CHZ Pool' : 'CHZ池', icon: '💎' },
            { id: 'config', label: language === 'en' ? 'System Config' : '系统配置', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-fanforce-primary text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* 标签页内容 / Tab Content */}
      <div className="space-y-6">
        {/* 概览标签页 / Overview Tab */}
        {activeTab === 'overview' && (
          <>
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

            {/* 系统状态和CHZ池健康 / System Status and CHZ Pool Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 系统状态 / System Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  {language === 'en' ? 'System Status' : '系统状态'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'System Status' : '系统状态'}
                    </span>
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        stats?.systemStatus === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <span className={`text-sm font-medium ${
                        stats?.systemStatus === 'active' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stats?.systemStatus === 'active' ? 
                          (language === 'en' ? 'Active' : '活跃') : 
                          (language === 'en' ? 'Maintenance' : '维护中')
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'CHZ Pool Health' : 'CHZ池健康度'}
                    </span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-700 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (stats?.chzPoolHealth || 0) >= 80 ? 'bg-green-500' :
                            (stats?.chzPoolHealth || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stats?.chzPoolHealth || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium">{stats?.chzPoolHealth || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'Pending Transactions' : '待处理交易'}
                    </span>
                    <span className={`font-medium ${
                      (stats?.pendingTransactions || 0) > 10 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {stats?.pendingTransactions || 0}
                    </span>
                  </div>
                </div>
              </div>

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
          </>
        )}

        {/* 用户管理标签页 / User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">
              {language === 'en' ? 'User Management' : '用户管理'}
            </h3>
            <div className="space-y-4">
              {userManagementData?.users?.length > 0 ? (
                userManagementData.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        user.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-white text-sm font-medium">{user.wallet_address}</p>
                        <p className="text-gray-400 text-xs">
                          {language === 'en' ? 'Role:' : '角色:'} {user.role} | 
                          {language === 'en' ? 'Created:' : '创建于:'} {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateUserStatus(user.id, user.is_active ? 'disable' : 'enable')}
                        className={`px-3 py-1 rounded text-sm ${
                          user.is_active 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {user.is_active ? 
                          (language === 'en' ? 'Disable' : '禁用') : 
                          (language === 'en' ? 'Enable' : '启用')
                        }
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {language === 'en' ? 'No users found' : '未找到用户'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 手续费规则标签页 / Fee Rules Tab */}
        {activeTab === 'fees' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">
              {language === 'en' ? 'Fee Rules Configuration' : '手续费规则配置'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Staking Fee (%)' : '质押手续费 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.staking_fee_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, staking_fee_percent: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Withdrawal Fee (%)' : '提取手续费 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.withdrawal_fee_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, withdrawal_fee_percent: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Distribution Fee (%)' : '分配手续费 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.distribution_fee_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, distribution_fee_percent: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Ambassador Share (%)' : '大使分成 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.ambassador_share_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, ambassador_share_percent: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Athlete Share (%)' : '运动员分成 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.athlete_share_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, athlete_share_percent: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Community Fund (%)' : '社区基金 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.community_fund_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, community_fund_percent: parseFloat(e.target.value)})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleUpdateFeeRules}
                className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-4 py-2 rounded-lg"
              >
                {language === 'en' ? 'Update Fee Rules' : '更新手续费规则'}
              </button>
            </div>
          </div>
        )}

        {/* CHZ池监控标签页 / CHZ Pool Monitoring Tab */}
        {activeTab === 'pool' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? 'CHZ Pool Status' : 'CHZ池状态'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Total Staked' : '总质押'}
                  </p>
                  <p className="text-xl font-bold text-white">
                    {formatNumber(chzPoolStatus?.transaction_stats?.total_staked || 0)} CHZ
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Total Fees' : '总手续费'}
                  </p>
                  <p className="text-xl font-bold text-white">
                    {formatNumber(chzPoolStatus?.transaction_stats?.total_fees || 0)} CHZ
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Available Withdrawal' : '可提取金额'}
                  </p>
                  <p className="text-xl font-bold text-white">
                    {formatNumber(chzPoolStatus?.calculated_metrics?.available_for_withdrawal || 0)} CHZ
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Pool Health' : '池健康度'}
                  </p>
                  <p className="text-xl font-bold text-white">
                    {chzPoolStatus?.calculated_metrics?.pool_health_score || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 系统配置标签页 / System Configuration Tab */}
        {activeTab === 'config' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">
              {language === 'en' ? 'System Configuration' : '系统配置'}
            </h3>
            <div className="space-y-4">
              {systemConfig && Object.entries(systemConfig).map(([key, config]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{key}</p>
                    <p className="text-gray-400 text-xs">{(config as any).description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-300 text-sm">
                      {typeof (config as any).value === 'string' ? (config as any).value : JSON.stringify((config as any).value)}
                    </span>
                    <button
                      onClick={() => {
                        const newValue = prompt(
                          `${language === 'en' ? 'Enter new value for' : '输入新值'} ${key}:`,
                          typeof (config as any).value === 'string' ? (config as any).value : JSON.stringify((config as any).value)
                        )
                        if (newValue !== null) {
                          handleUpdateSystemConfig(key, newValue, (config as any).description)
                        }
                      }}
                      className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-2 py-1 rounded text-xs"
                    >
                      {language === 'en' ? 'Edit' : '编辑'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
} 