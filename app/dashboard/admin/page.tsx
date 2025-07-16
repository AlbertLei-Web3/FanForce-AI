// FanForce AI - 管理员仪表板主页
// Admin Dashboard Main Page - 系统管理员的主要仪表板页面，具有多区域大使监督功能
// Multi-region ambassador oversight admin dashboard with proper role hierarchy
// 具有正确角色层级的多区域大使监督管理员仪表板
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/api/admin/dashboard/route.ts: 仪表板统计API
// - app/api/admin/ambassador-oversight/route.ts: 大使监督API (NEW)
// - app/api/admin/venue-management/route.ts: 场馆管理API (MOVED FROM AMBASSADOR)
// - app/api/admin/qr-generation/route.ts: QR码生成API (MOVED FROM AMBASSADOR)
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
  // 多区域监督统计 / Multi-region Oversight Statistics
  totalUniversities: number
  activeAmbassadors: number
  pendingEventApplications: number
  pendingQRRequests: number
  crossRegionMetrics: any
}

// 大使监督数据接口 / Ambassador Oversight Data Interface - NEW
interface AmbassadorOversightData {
  id: string
  name: string
  university: string
  region: string
  contactInfo: string
  performanceMetrics: {
    totalEvents: number
    successfulEvents: number
    totalRevenue: number
    monthlyCommission: number
    athletesRecruited: number
    audienceReached: number
    successRate: string
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  }
  currentStatus: 'active' | 'inactive' | 'under_review' | 'suspended'
  lastActivity: string
  pendingApplications: number
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
  }>
}

// 场馆管理数据接口 / Venue Management Data Interface - MOVED FROM AMBASSADOR
interface VenueManagementData {
  venues: Array<{
    id: string
    name: string
    university: string
    address: string
    capacity: number
    facilities: string[]
    status: 'active' | 'maintenance' | 'unavailable'
    managedBy: string // Ambassador ID
    utilizationRate: number
    upcomingEvents: number
  }>
  pendingVenueRequests: Array<{
    id: string
    venueName: string
    submittedBy: string
    submittedByName: string
    university: string
    status: 'pending' | 'approved' | 'rejected'
    submissionDate: string
  }>
}

// QR码管理数据接口 / QR Code Management Data Interface - MOVED FROM AMBASSADOR  
interface QRManagementData {
  pendingRequests: Array<{
    id: string
    eventTitle: string
    requestedBy: string
    requestedByName: string
    university: string
    eventDate: string
    status: 'pending' | 'approved' | 'rejected'
    priority: 'normal' | 'high' | 'urgent'
    requestDate: string
  }>
  activeQRCodes: Array<{
    id: string
    eventTitle: string
    generatedFor: string
    university: string
    validFrom: string
    validUntil: string
    usageCount: number
    maxUsage: number
    status: 'active' | 'expired' | 'revoked'
  }>
}

// 事件申请数据接口 / Event Application Data Interface
interface EventApplicationData {
  applications: Array<{
    id: string
    eventTitle: string
    submittedBy: string
    submittedByName: string
    university: string
    eventDate: string
    venue: string
    estimatedParticipants: number
    status: 'pending' | 'approved' | 'rejected'
    priority: 'normal' | 'high' | 'urgent'
    submissionDate: string
    adminNotes?: string
  }>
}

// 最近活动接口 / Recent Activity Interface
interface RecentActivity {
  id: string
  type: 'user_registered' | 'event_created' | 'match_completed' | 'payout_made' | 'ambassador_action' | 'admin_action' | 'venue_request' | 'qr_request'
  description: string
  timestamp: string
  amount?: number
  user?: string
  university?: string
  region?: string
  details?: any
}

// 手续费规则接口 / Fee Rules Interface
interface FeeRules {
  rule_name: string
  staking_fee_percent: number
  withdrawal_fee_percent: number
  distribution_fee_percent: number
  ambassador_share_percent: number
  athlete_share_percent: number
  community_fund_percent: number
  updated_at?: string
  updated_by?: string
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
  
  // 多区域大使监督状态 / Multi-region Ambassador Oversight State - NEW
  const [ambassadorOversightData, setAmbassadorOversightData] = useState<AmbassadorOversightData[]>([])
  const [venueManagementData, setVenueManagementData] = useState<VenueManagementData | null>(null)
  const [qrManagementData, setQRManagementData] = useState<QRManagementData | null>(null)
  const [eventApplicationData, setEventApplicationData] = useState<EventApplicationData | null>(null)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'ambassadors' | 'venues' | 'qr-codes' | 'applications' | 'users' | 'fees' | 'pool' | 'config'>('overview')
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

  // 大使筛选状态 / Ambassador Filter State - NEW
  const [ambassadorFilters, setAmbassadorFilters] = useState({
    university: 'all',
    region: 'all',
    status: 'all',
    performanceTier: 'all'
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
          configResponse,
          ambassadorOversightResponse,
          venueManagementResponse,
          qrManagementResponse,
          eventApplicationResponse
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
          }),
          // NEW: 大使监督数据 / Ambassador oversight data
          fetch('/api/admin/ambassador-oversight', {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          }),
          // MOVED FROM AMBASSADOR: 场馆管理数据 / Venue management data
          fetch('/api/admin/venue-management', {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          }),
          // MOVED FROM AMBASSADOR: QR码管理数据 / QR code management data  
          fetch('/api/admin/qr-management', {
            headers: {
              'Authorization': `Bearer ${authState.sessionToken}`,
              'Content-Type': 'application/json',
            }
          }),
          // NEW: 事件申请数据 / Event application data
          fetch('/api/admin/event-applications', {
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

        // NEW: 处理大使监督数据 / Process ambassador oversight data
        if (ambassadorOversightResponse.ok) {
          const ambassadorData = await ambassadorOversightResponse.json()
          setAmbassadorOversightData(ambassadorData.ambassadors || [])
        }

        // MOVED FROM AMBASSADOR: 处理场馆管理数据 / Process venue management data
        if (venueManagementResponse.ok) {
          const venueData = await venueManagementResponse.json()
          setVenueManagementData(venueData)
        }

        // MOVED FROM AMBASSADOR: 处理QR码管理数据 / Process QR code management data
        if (qrManagementResponse.ok) {
          const qrData = await qrManagementResponse.json()
          setQRManagementData(qrData)
        }

        // NEW: 处理事件申请数据 / Process event application data
        if (eventApplicationResponse.ok) {
          const eventAppData = await eventApplicationResponse.json()
          setEventApplicationData(eventAppData)
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

  // 处理大使操作 / Handle Ambassador Actions - NEW
  const handleAmbassadorAction = async (ambassadorId: string, action: 'approve' | 'suspend' | 'review' | 'promote' | 'demote', reason?: string) => {
    try {
      const response = await fetch('/api/admin/ambassador-actions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ambassador_id: ambassadorId,
          action,
          reason,
          admin_id: authState.user?.id
        })
      })

      if (response.ok) {
        alert(`Ambassador ${action} successfully`)
        refreshData()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${action} ambassador: ${errorData.error}`)
      }
    } catch (error) {
      console.error(`Error ${action} ambassador:`, error)
      alert(`Error ${action} ambassador`)
    }
  }

  // 处理场馆申请 / Handle Venue Requests - MOVED FROM AMBASSADOR
  const handleVenueRequest = async (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/venue-actions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          action,
          admin_notes: adminNotes,
          admin_id: authState.user?.id
        })
      })

      if (response.ok) {
        alert(`Venue request ${action}d successfully`)
        refreshData()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${action} venue request: ${errorData.error}`)
      }
    } catch (error) {
      console.error(`Error ${action} venue request:`, error)
      alert(`Error ${action} venue request`)
    }
  }

  // 处理QR码申请 / Handle QR Code Requests - MOVED FROM AMBASSADOR
  const handleQRRequest = async (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/qr-actions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          action,
          admin_notes: adminNotes,
          admin_id: authState.user?.id
        })
      })

      if (response.ok) {
        alert(`QR request ${action}d successfully`)
        refreshData()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${action} QR request: ${errorData.error}`)
      }
    } catch (error) {
      console.error(`Error ${action} QR request:`, error)
      alert(`Error ${action} QR request`)
    }
  }

  // 处理事件申请 / Handle Event Applications - NEW
  const handleEventApplication = async (applicationId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/event-application-actions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          action,
          admin_notes: adminNotes,
          admin_id: authState.user?.id
        })
      })

      if (response.ok) {
        alert(`Event application ${action}d successfully`)
        refreshData()
      } else {
        const errorData = await response.json()
        alert(`Failed to ${action} event application: ${errorData.error}`)
      }
    } catch (error) {
      console.error(`Error ${action} event application:`, error)
      alert(`Error ${action} event application`)
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
      case 'ambassador_action': return '🧑‍💼'
      case 'admin_action': return '🔧'
      case 'venue_request': return '🏟️'
      case 'qr_request': return '📱'
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
        subtitle={language === 'en' ? 'Multi-Region System Oversight' : '多区域系统监督'}
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
        subtitle={language === 'en' ? 'Multi-Region System Oversight' : '多区域系统监督'}
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
      subtitle={language === 'en' ? 'Multi-Region System Oversight' : '多区域系统监督'}
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
        <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20 overflow-x-auto">
          {[
            { id: 'overview', label: language === 'en' ? 'Overview' : '概览', icon: '📊' },
            { id: 'ambassadors', label: language === 'en' ? 'Ambassador Oversight' : '大使监督', icon: '🧑‍💼' },
            { id: 'venues', label: language === 'en' ? 'Venue Management' : '场馆管理', icon: '🏟️' },
            { id: 'qr-codes', label: language === 'en' ? 'QR Generation' : 'QR码生成', icon: '📱' },
            { id: 'applications', label: language === 'en' ? 'Event Applications' : '活动申请', icon: '📋' },
            { id: 'users', label: language === 'en' ? 'User Management' : '用户管理', icon: '👥' },
            { id: 'fees', label: language === 'en' ? 'Fee Rules' : '手续费规则', icon: '💰' },
            { id: 'pool', label: language === 'en' ? 'CHZ Pool' : 'CHZ池', icon: '💎' },
            { id: 'config', label: language === 'en' ? 'System Config' : '系统配置', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
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

          {/* 活跃大使 / Active Ambassadors - NEW */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Active Ambassadors' : '活跃大使'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber(stats?.activeAmbassadors || 0)}
                </p>
                <p className="text-xs text-blue-400">
                  {stats?.ambassadorCount || 0} {language === 'en' ? 'total' : '总计'}
                </p>
              </div>
              <div className="text-3xl">🧑‍💼</div>
            </div>
          </div>

          {/* 待审批申请 / Pending Applications - NEW */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {language === 'en' ? 'Pending Applications' : '待审批申请'}
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatNumber((stats?.pendingEventApplications || 0) + (stats?.pendingQRRequests || 0))}
                </p>
                <p className="text-xs text-yellow-400">
                  {stats?.pendingEventApplications || 0} events + {stats?.pendingQRRequests || 0} QR
                </p>
              </div>
              <div className="text-3xl">📋</div>
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
        </div>

            {/* 多区域监督概览 / Multi-region Oversight Overview - NEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 大使绩效概览 / Ambassador Performance Overview */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  {language === 'en' ? 'Ambassador Performance Overview' : '大使绩效概览'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'Total Universities' : '总大学数'}
                    </span>
                    <span className="text-white font-medium">{stats?.totalUniversities || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'Cross-Region Events' : '跨区域活动'}
                    </span>
                    <span className="text-white font-medium">{stats?.crossRegionMetrics?.totalEvents || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'Average Success Rate' : '平均成功率'}
                    </span>
                    <span className="text-green-400 font-medium">{stats?.crossRegionMetrics?.avgSuccessRate || '0%'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'Top Performing Region' : '表现最佳地区'}
                    </span>
                    <span className="text-blue-400 font-medium">{stats?.crossRegionMetrics?.topRegion || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* 待处理任务 / Pending Tasks */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  {language === 'en' ? 'Pending Admin Tasks' : '待处理管理任务'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'Event Applications' : '活动申请'}
                    </span>
                    <span className={`font-medium ${(stats?.pendingEventApplications || 0) > 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {stats?.pendingEventApplications || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'QR Code Requests' : 'QR码申请'}
                    </span>
                    <span className={`font-medium ${(stats?.pendingQRRequests || 0) > 3 ? 'text-red-400' : 'text-green-400'}`}>
                      {stats?.pendingQRRequests || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'Venue Approvals' : '场馆审批'}
                    </span>
                    <span className={`font-medium ${(venueManagementData?.pendingVenueRequests?.length || 0) > 2 ? 'text-red-400' : 'text-green-400'}`}>
                      {venueManagementData?.pendingVenueRequests?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">
                      {language === 'en' ? 'System Alerts' : '系统警报'}
                    </span>
                    <span className={`font-medium ${(stats?.pendingTransactions || 0) > 10 ? 'text-red-400' : 'text-green-400'}`}>
                      {stats?.pendingTransactions || 0}
                    </span>
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
                        {activity.university && ` • ${activity.university}`}
                        {activity.region && ` • ${activity.region}`}
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

        {/* 大使监督标签页 / Ambassador Oversight Tab - NEW */}
        {activeTab === 'ambassadors' && (
          <div className="space-y-6">
            {/* 大使筛选器 / Ambassador Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  value={ambassadorFilters.university}
                  onChange={(e) => setAmbassadorFilters({...ambassadorFilters, university: e.target.value})}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">{language === 'en' ? 'All Universities' : '所有大学'}</option>
                  <option value="tech_university">{language === 'en' ? 'Tech University' : '科技大学'}</option>
                  <option value="state_university">{language === 'en' ? 'State University' : '州立大学'}</option>
                </select>
                
                <select 
                  value={ambassadorFilters.region}
                  onChange={(e) => setAmbassadorFilters({...ambassadorFilters, region: e.target.value})}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">{language === 'en' ? 'All Regions' : '所有地区'}</option>
                  <option value="north">{language === 'en' ? 'North Region' : '北部地区'}</option>
                  <option value="south">{language === 'en' ? 'South Region' : '南部地区'}</option>
                </select>
                
                <select 
                  value={ambassadorFilters.status}
                  onChange={(e) => setAmbassadorFilters({...ambassadorFilters, status: e.target.value})}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">{language === 'en' ? 'All Status' : '所有状态'}</option>
                  <option value="active">{language === 'en' ? 'Active' : '活跃'}</option>
                  <option value="inactive">{language === 'en' ? 'Inactive' : '不活跃'}</option>
                  <option value="under_review">{language === 'en' ? 'Under Review' : '审核中'}</option>
                </select>
                
                <select 
                  value={ambassadorFilters.performanceTier}
                  onChange={(e) => setAmbassadorFilters({...ambassadorFilters, performanceTier: e.target.value})}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="all">{language === 'en' ? 'All Tiers' : '所有等级'}</option>
                  <option value="Platinum">{language === 'en' ? 'Platinum' : '铂金'}</option>
                  <option value="Gold">{language === 'en' ? 'Gold' : '金牌'}</option>
                  <option value="Silver">{language === 'en' ? 'Silver' : '银牌'}</option>
                  <option value="Bronze">{language === 'en' ? 'Bronze' : '青铜'}</option>
                </select>
              </div>
            </div>

            {/* 大使列表 / Ambassador List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ambassadorOversightData.length > 0 ? (
                ambassadorOversightData.map((ambassador) => (
                  <div key={ambassador.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {ambassador.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{ambassador.name}</h4>
                          <p className="text-gray-400 text-sm">{ambassador.university}</p>
                          <p className="text-gray-500 text-xs">{ambassador.region}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          ambassador.performanceMetrics.tier === 'Platinum' ? 'bg-purple-500/20 text-purple-400' :
                          ambassador.performanceMetrics.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-400' :
                          ambassador.performanceMetrics.tier === 'Silver' ? 'bg-gray-500/20 text-gray-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {ambassador.performanceMetrics.tier}
                        </span>
                        <p className={`text-xs mt-1 ${
                          ambassador.currentStatus === 'active' ? 'text-green-400' :
                          ambassador.currentStatus === 'under_review' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {ambassador.currentStatus}
                        </p>
                      </div>
                    </div>

                    {/* 绩效指标 / Performance Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-900/50 rounded p-2">
                        <p className="text-xs text-gray-400">Events</p>
                        <p className="font-bold text-green-400">{ambassador.performanceMetrics.totalEvents}</p>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2">
                        <p className="text-xs text-gray-400">Success Rate</p>
                        <p className="font-bold text-blue-400">{ambassador.performanceMetrics.successRate}</p>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2">
                        <p className="text-xs text-gray-400">Revenue</p>
                        <p className="font-bold text-yellow-400">{ambassador.performanceMetrics.totalRevenue.toFixed(2)} CHZ</p>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2">
                        <p className="text-xs text-gray-400">Athletes</p>
                        <p className="font-bold text-purple-400">{ambassador.performanceMetrics.athletesRecruited}</p>
                      </div>
                    </div>

                    {/* 操作按钮 / Action Buttons */}
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAmbassadorAction(ambassador.id, 'review', 'Performance review')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                      >
                        {language === 'en' ? 'Review' : '审核'}
                      </button>
                      {ambassador.currentStatus === 'active' ? (
                        <button 
                          onClick={() => handleAmbassadorAction(ambassador.id, 'suspend', 'Administrative action')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                        >
                          {language === 'en' ? 'Suspend' : '暂停'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAmbassadorAction(ambassador.id, 'approve', 'Reactivation')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                        >
                          {language === 'en' ? 'Activate' : '激活'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  {language === 'en' ? 'No ambassadors found' : '未找到大使'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 场馆管理标签页 / Venue Management Tab - MOVED FROM AMBASSADOR */}
        {activeTab === 'venues' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? 'Venue Management (Moved from Ambassador)' : '场馆管理（从大使移出）'}
              </h3>
              
              {/* 待审批场馆申请 / Pending Venue Requests */}
              <div className="mb-6">
                <h4 className="text-md font-bold text-white mb-3">
                  {language === 'en' ? 'Pending Venue Requests' : '待审批场馆申请'}
                </h4>
                <div className="space-y-3">
                  {venueManagementData?.pendingVenueRequests?.length > 0 ? (
                    venueManagementData.pendingVenueRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{request.venueName}</p>
                          <p className="text-gray-400 text-sm">
                            {language === 'en' ? 'Submitted by:' : '提交人:'} {request.submittedByName} • {request.university}
                          </p>
                          <p className="text-gray-500 text-xs">{new Date(request.submissionDate).toLocaleDateString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVenueRequest(request.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            {language === 'en' ? 'Approve' : '批准'}
                          </button>
                          <button
                            onClick={() => handleVenueRequest(request.id, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            {language === 'en' ? 'Reject' : '拒绝'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      {language === 'en' ? 'No pending venue requests' : '无待审批场馆申请'}
                    </div>
                  )}
                </div>
              </div>

              {/* 已批准场馆列表 / Approved Venues List */}
              <div>
                <h4 className="text-md font-bold text-white mb-3">
                  {language === 'en' ? 'Approved Venues' : '已批准场馆'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {venueManagementData?.venues?.length > 0 ? (
                    venueManagementData.venues.map((venue) => (
                      <div key={venue.id} className="bg-white/5 rounded-lg p-4">
                        <h5 className="text-white font-medium">{venue.name}</h5>
                        <p className="text-gray-400 text-sm">{venue.university}</p>
                        <p className="text-gray-500 text-xs">{venue.address}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-blue-400 text-sm">Capacity: {venue.capacity}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            venue.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            venue.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {venue.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4 text-gray-400">
                      {language === 'en' ? 'No approved venues' : '无已批准场馆'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR码生成标签页 / QR Code Generation Tab - MOVED FROM AMBASSADOR */}
        {activeTab === 'qr-codes' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? 'QR Code Management (Moved from Ambassador)' : 'QR码管理（从大使移出）'}
              </h3>
              
              {/* 待处理QR码申请 / Pending QR Code Requests */}
              <div className="mb-6">
                <h4 className="text-md font-bold text-white mb-3">
                  {language === 'en' ? 'Pending QR Code Requests' : '待处理QR码申请'}
                </h4>
                <div className="space-y-3">
                  {qrManagementData?.pendingRequests?.length > 0 ? (
                    qrManagementData.pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{request.eventTitle}</p>
                          <p className="text-gray-400 text-sm">
                            {language === 'en' ? 'Requested by:' : '申请人:'} {request.requestedByName} • {request.university}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {language === 'en' ? 'Event Date:' : '活动日期:'} {new Date(request.eventDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            request.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            request.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {request.priority}
                          </span>
                          <button
                            onClick={() => handleQRRequest(request.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            {language === 'en' ? 'Generate QR' : '生成QR'}
                          </button>
                          <button
                            onClick={() => handleQRRequest(request.id, 'reject')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            {language === 'en' ? 'Reject' : '拒绝'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      {language === 'en' ? 'No pending QR requests' : '无待处理QR申请'}
                    </div>
                  )}
                </div>
              </div>

              {/* 活跃QR码列表 / Active QR Codes List */}
              <div>
                <h4 className="text-md font-bold text-white mb-3">
                  {language === 'en' ? 'Active QR Codes' : '活跃QR码'}
                </h4>
                <div className="space-y-3">
                  {qrManagementData?.activeQRCodes?.length > 0 ? (
                    qrManagementData.activeQRCodes.map((qr) => (
                      <div key={qr.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{qr.eventTitle}</p>
                          <p className="text-gray-400 text-sm">
                            {language === 'en' ? 'Generated for:' : '生成给:'} {qr.generatedFor} • {qr.university}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {language === 'en' ? 'Valid:' : '有效期:'} {new Date(qr.validFrom).toLocaleString()} - {new Date(qr.validUntil).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-blue-400 text-sm">{qr.usageCount}/{qr.maxUsage}</p>
                            <p className="text-gray-500 text-xs">{language === 'en' ? 'scans' : '扫描'}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            qr.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            qr.status === 'expired' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {qr.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      {language === 'en' ? 'No active QR codes' : '无活跃QR码'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 活动申请标签页 / Event Applications Tab - NEW */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? 'Event Applications Management' : '活动申请管理'}
              </h3>
              <div className="space-y-4">
                {eventApplicationData?.applications?.length > 0 ? (
                  eventApplicationData.applications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{application.eventTitle}</h4>
                        <p className="text-gray-400 text-sm">
                          {language === 'en' ? 'Submitted by:' : '提交人:'} {application.submittedByName} • {application.university}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {language === 'en' ? 'Event Date:' : '活动日期:'} {new Date(application.eventDate).toLocaleDateString()} • 
                          {language === 'en' ? 'Venue:' : '场馆:'} {application.venue} • 
                          {language === 'en' ? 'Participants:' : '参与者:'} {application.estimatedParticipants}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {language === 'en' ? 'Submitted:' : '提交时间:'} {new Date(application.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          application.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                          application.priority === 'high' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {application.priority}
                        </span>
                        <button
                          onClick={() => handleEventApplication(application.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          {language === 'en' ? 'Approve' : '批准'}
                        </button>
                        <button
                          onClick={() => handleEventApplication(application.id, 'reject')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          {language === 'en' ? 'Reject' : '拒绝'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {language === 'en' ? 'No pending event applications' : '无待处理活动申请'}
                  </div>
                )}
              </div>
            </div>
          </div>
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
        {activeTab === 'fees' && feeRules && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">
              {language === 'en' ? 'Fee Rules Management' : '手续费规则管理'}
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
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Withdrawal Fee (%)' : '提现手续费 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.withdrawal_fee_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, withdrawal_fee_percent: parseFloat(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Ambassador Share (%)' : '大使分成 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.ambassador_share_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, ambassador_share_percent: parseFloat(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Distribution Fee (%)' : '分配手续费 (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={feeRulesForm.distribution_fee_percent}
                    onChange={(e) => setFeeRulesForm({...feeRulesForm, distribution_fee_percent: parseFloat(e.target.value)})}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
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
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
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
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button className="bg-fanforce-primary hover:bg-fanforce-secondary text-white font-bold py-2 px-4 rounded">
                {language === 'en' ? 'Update Fee Rules' : '更新手续费规则'}
              </button>
            </div>
          </div>
        )}

        {/* CHZ池标签页 / CHZ Pool Tab */}
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