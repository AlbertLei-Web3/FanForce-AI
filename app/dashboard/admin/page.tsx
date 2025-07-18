// FanForce AI - 管理员仪表板主页（现代化响应式设计）
// Admin Dashboard Main Page - 系统管理员的主要仪表板页面，采用现代化响应式设计
// Modern responsive admin dashboard with optimized visual design
// 现代化响应式管理员仪表板，采用优化的视觉设计
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/api/admin/dashboard/route.ts: 仪表板统计API
// - app/api/admin/ambassador-oversight/route.ts: 大使监督API
// - app/api/admin/venue-management/route.ts: 场馆管理API
// - app/api/admin/qr-generation/route.ts: QR码生成API
// - lib/enhanced-admin-schema.sql: 增强的管理员数据库架构

'use client'

import { useState, useEffect } from 'react'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../components/shared/DashboardLayout'
import EventApprovalModal from '../../components/shared/EventApprovalModal'
import { 
  FaTrophy, 
  FaUsers, 
  FaBasketballBall,
  FaCoins,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaQrcode,
  FaGift,
  FaFire,
  FaCalendarAlt,
  FaChartLine,
  FaBullhorn,
  FaStore,
  FaAward,
  FaSearch,
  FaFilter,
  FaFileAlt,
  FaHourglassHalf,
  FaPaperPlane,
  FaExclamationCircle,
  FaShieldAlt,
  FaCrown,
  FaStar,
  FaUserShield,
  FaBuilding,
  FaGlobe,
  FaCog,
  FaBell,
  FaDatabase,
  FaPlay,
  FaPause,
  FaEye,
  FaEdit,
  FaTrash,
  FaChevronRight,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'

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

// Mock Admin Profile / 管理员档案模拟数据
const mockAdminProfile = {
  name: 'Sarah Chen',
  avatar: '/placeholder.svg',
  adminId: 'ADMIN2024001',
  role: 'System Administrator',
  department: 'Platform Operations',
  verified: true,
  joinDate: '2024-01-01',
  lastLogin: '2024-01-25 09:30',
  permissions: ['full_system_access', 'emergency_controls', 'ambassador_oversight'],
  securityLevel: 'Level 5',
  totalRegionsManaged: 8,
  activeCampaigns: 15
}

// Mock System Statistics / 系统统计模拟数据
const mockSystemStats = {
  totalUsers: 12847,
  activeUsers: 8923,
  totalEvents: 156,
  activeEvents: 12,
  totalRevenue: 245780.50,
  totalStaked: 189340.25,
  platformFees: 12890.75,
  adminCount: 3,
  ambassadorCount: 25,
  athleteCount: 320,
  audienceCount: 12499,
  todayUsers: 247,
  todayEvents: 3,
  todayRevenue: 8940.25,
  todayStaked: 6780.50,
  chzPoolHealth: 98.5,
  pendingTransactions: 8,
  systemStatus: 'optimal',
  totalUniversities: 8,
  activeAmbassadors: 23,
  pendingEventApplications: 7,
  pendingQRRequests: 12,
  crossRegionMetrics: {
    northRegion: { ambassadors: 6, events: 28, revenue: 68940.25 },
    southRegion: { ambassadors: 8, events: 45, revenue: 89230.50 },
    eastRegion: { ambassadors: 5, events: 32, revenue: 54980.75 },
    westRegion: { ambassadors: 4, events: 51, revenue: 32629.00 }
  }
}

// Mock Recent Activities / 最近活动模拟数据
const mockRecentActivities = [
  {
    id: 1,
    type: 'application_approval',
    title: 'Basketball Championship Event Approved',
    titleCn: '篮球锦标赛活动已批准',
    ambassador: 'John Smith',
    university: 'Tech University',
    timestamp: '2024-01-25 14:30',
    priority: 'high',
    status: 'completed'
  },
  {
    id: 2,
    type: 'qr_generation',
    title: 'QR Code Generated for Soccer Finals',
    titleCn: '足球决赛二维码已生成',
    ambassador: 'Lisa Wang',
    university: 'Science University',
    timestamp: '2024-01-25 13:45',
    priority: 'medium',
    status: 'active'
  },
  {
    id: 3,
    type: 'venue_approval',
    title: 'New Venue Registration Approved',
    titleCn: '新场馆注册已批准',
    ambassador: 'Mike Johnson',
    university: 'Arts University',
    timestamp: '2024-01-25 12:20',
    priority: 'low',
    status: 'completed'
  }
]

// Mock Ambassador Performance Data / 大使表现数据模拟
const mockAmbassadorPerformance = [
  {
    id: 'amb_001',
    name: 'John Smith',
    university: 'Tech University',
    region: 'North',
    tier: 'Platinum',
    totalEvents: 28,
    successRate: '94%',
    totalRevenue: 68940.25,
    monthlyCommission: 689.40,
    athletesRecruited: 45,
    audienceReached: 1250,
    status: 'active',
    lastActivity: '2024-01-25',
    pendingApplications: 2,
    avatar: '/placeholder.svg'
  },
  {
    id: 'amb_002',
    name: 'Lisa Wang',
    university: 'Science University',
    region: 'East',
    tier: 'Gold',
    totalEvents: 22,
    successRate: '89%',
    totalRevenue: 54980.75,
    monthlyCommission: 549.81,
    athletesRecruited: 38,
    audienceReached: 980,
    status: 'active',
    lastActivity: '2024-01-24',
    pendingApplications: 1,
    avatar: '/placeholder.svg'
  },
  {
    id: 'amb_003',
    name: 'Mike Johnson',
    university: 'Arts University',
    region: 'West',
    tier: 'Silver',
    totalEvents: 16,
    successRate: '81%',
    totalRevenue: 32629.00,
    monthlyCommission: 326.29,
    athletesRecruited: 29,
    audienceReached: 750,
    status: 'under_review',
    lastActivity: '2024-01-23',
    pendingApplications: 0,
    avatar: '/placeholder.svg'
  }
]

export default function AdminDashboard() {
  const { authState, isAdmin, isSuperAdmin } = useUser()
  const { language, t } = useLanguage()
  const router = useRouter()

  // 状态管理 / State Management
  const [stats, setStats] = useState<SystemStats | null>(mockSystemStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [eventApplications, setEventApplications] = useState([])
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean
    application: any | null
  }>({
    isOpen: false,
    application: null
  })

  // 实时时间更新 / Real-time time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 当切换到Applications标签页时获取事件申请 / Fetch event applications when Applications tab is active
  useEffect(() => {
    if (activeTab === 'applications') {
      fetchEventApplications()
    }
  }, [activeTab])

  // 权限检查 / Permission Check
  useEffect(() => {
    // 开发模式：临时禁用严格权限检查 / Development mode: temporarily disable strict permission check
    const isDevelopmentMode = process.env.NODE_ENV === 'development'
    
    if (!authState.isAuthenticated) {
      console.log('❌ 用户未认证，跳转到首页 / User not authenticated, redirecting to home')
      router.push('/')
      return
    }
    
    // 开发模式下允许所有认证用户访问管理员页面 / In development mode, allow all authenticated users to access admin page
    if (!isDevelopmentMode && (!isAdmin() && !isSuperAdmin())) {
      console.log('❌ 生产模式：用户不是管理员，跳转到首页 / Production mode: User is not admin, redirecting to home')
      router.push('/')
      return
    }
    
    // 开发模式下的权限警告 / Permission warning in development mode
    if (isDevelopmentMode && (!isAdmin() && !isSuperAdmin())) {
      console.warn('⚠️ 开发模式：用户不是管理员，但允许访问管理员页面 / Development mode: User is not admin but allowed to access admin page')
    }
    
    console.log('✅ 权限检查通过，允许访问管理员页面 / Permission check passed, allowing access to admin page')
  }, [authState.isAuthenticated, isAdmin, isSuperAdmin, router])

  // 格式化数字 / Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // 获取状态颜色 / Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      case 'under_review': return 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      case 'suspended': return 'text-red-400 bg-red-500/10 border-red-500/30'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
  }

  // 获取等级颜色 / Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-cyan-400 to-blue-500'
      case 'Gold': return 'from-yellow-400 to-orange-500'
      case 'Silver': return 'from-slate-300 to-slate-500'
      case 'Bronze': return 'from-orange-500 to-red-500'
      default: return 'from-slate-400 to-slate-600'
    }
  }

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
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
    } finally {
      setRefreshing(false)
    }
  }

  // 获取事件申请列表 / Fetch Event Applications
  const fetchEventApplications = async () => {
    try {
      // Fetch all event applications (not just pending)
      // 获取所有事件申请（不仅仅是待处理的）
      const response = await fetch('/api/admin/event-applications?status=all', {
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEventApplications(data.data || [])
        }
      }
    } catch (err) {
      console.error('Error fetching event applications:', err)
    }
  }

  // 处理大使操作 / Handle Ambassador Actions
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

  // 处理场馆申请 / Handle Venue Requests
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

  // 处理QR码申请 / Handle QR Code Requests
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

  // 打开审批模态框 / Open Approval Modal
  const openApprovalModal = (application: any) => {
    setApprovalModal({
      isOpen: true,
      application
    })
  }

  // 关闭审批模态框 / Close Approval Modal
  const closeApprovalModal = () => {
    setApprovalModal({
      isOpen: false,
      application: null
    })
  }

  // 处理批准申请 / Handle Approve Application
  const handleApproveApplication = async (applicationId: string, data: any) => {
    try {
      const response = await fetch('/api/admin/event-applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          action: 'approve',
          admin_id: authState.user?.id,
          injected_chz_amount: data.injectedChzAmount,
          team_a_coefficient: data.teamACoefficient,
          team_b_coefficient: data.teamBCoefficient,
          admin_notes: data.adminNotes
        })
      })

      if (response.ok) {
        alert(language === 'en' ? 'Event application approved successfully' : '事件申请批准成功')
        refreshData()
        fetchEventApplications()
      } else {
        const errorData = await response.json()
        alert(language === 'en' ? `Failed to approve application: ${errorData.error}` : `批准申请失败: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error approving application:', error)
      alert(language === 'en' ? 'Error approving application' : '批准申请时出错')
    }
  }

  // 处理拒绝申请 / Handle Reject Application
  const handleRejectApplication = async (applicationId: string, data: any) => {
    try {
      const response = await fetch('/api/admin/event-applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          application_id: applicationId,
          action: 'reject',
          admin_id: authState.user?.id,
          admin_notes: data.adminNotes
        })
      })

      if (response.ok) {
        alert(language === 'en' ? 'Event application rejected successfully' : '事件申请拒绝成功')
        refreshData()
        fetchEventApplications()
      } else {
        const errorData = await response.json()
        alert(language === 'en' ? `Failed to reject application: ${errorData.error}` : `拒绝申请失败: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert(language === 'en' ? 'Error rejecting application' : '拒绝申请时出错')
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

  // 加载中状态 / Loading State
  if (loading) {
    return (
      <DashboardLayout 
        title={language === 'en' ? 'Admin Dashboard' : '管理员仪表板'}
        subtitle={language === 'en' ? 'Multi-Region System Oversight' : '多区域系统监督'}
      >
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-blue-500"></div>
            <p className="text-slate-400">{language === 'en' ? 'Loading dashboard...' : '加载仪表板中...'}</p>
          </div>
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
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <FaExclamationCircle className="text-red-400 text-4xl mx-auto mb-4" />
          <p className="text-red-400 text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {language === 'en' ? 'Retry' : '重试'}
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={language === 'en' ? 'System Control Center' : '系统控制中心'}
      subtitle={language === 'en' ? 'Multi-Region Sports Ecosystem Management' : '多区域体育生态系统管理'}
      actions={
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEmergencyAction('pause_system')}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
          >
            <FaShieldAlt className="text-sm" />
            <span>{language === 'en' ? 'Emergency' : '紧急'}</span>
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
          >
            <FaDatabase className={`text-sm ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? (language === 'en' ? 'Refreshing...' : '刷新中...') : (language === 'en' ? 'Refresh' : '刷新')}</span>
          </button>
        </div>
      }
    >
      {/* 顶级管理员概览卡片 / Top-level Admin Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 mb-8 border border-slate-700/50 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {mockAdminProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-white text-sm" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{mockAdminProfile.name}</h2>
              <p className="text-slate-300 font-medium">{mockAdminProfile.role}</p>
              <p className="text-blue-400 text-sm font-medium">{mockAdminProfile.securityLevel}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-300">
            <div className="flex items-center space-x-2">
              <FaClock className="text-blue-400" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaBuilding className="text-purple-400" />
              <span>{mockSystemStats.totalUniversities} Universities</span>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
              mockSystemStats.systemStatus === 'optimal' 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                mockSystemStats.systemStatus === 'optimal' ? 'bg-emerald-400' : 'bg-red-400'
              }`}></div>
              <span className="font-medium">
                {mockSystemStats.systemStatus === 'optimal' ? 'System Optimal' : 'System Issues'}
              </span>
            </div>
          </div>
        </div>

        {/* 核心系统指标 / Core System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FaUsers className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatNumber(mockSystemStats.totalUsers)}</p>
                <p className="text-slate-400 text-sm">Total Users</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <FaArrowUp className="text-xs" />
              <span>+{mockSystemStats.todayUsers} today</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FaCoins className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatNumber(mockSystemStats.totalRevenue)}</p>
                <p className="text-slate-400 text-sm">Revenue (CHZ)</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <FaArrowUp className="text-xs" />
              <span>+{formatNumber(mockSystemStats.todayRevenue)} today</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FaUserShield className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockSystemStats.activeAmbassadors}</p>
                <p className="text-slate-400 text-sm">Active Ambassadors</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>{mockSystemStats.ambassadorCount} total</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <FaBell className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {mockSystemStats.pendingEventApplications + mockSystemStats.pendingQRRequests}
                </p>
                <p className="text-slate-400 text-sm">Pending Tasks</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-amber-400">
              <FaClock className="text-xs" />
              <span>Require attention</span>
            </div>
          </div>
        </div>
      </div>

      {/* 导航标签栏 / Navigation Tab Bar */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 mb-8 border border-slate-700/50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: language === 'en' ? 'Overview' : '概览', icon: FaChartLine },
            { id: 'ambassadors', label: language === 'en' ? 'Ambassadors' : '大使监督', icon: FaUserShield },
            { id: 'venues', label: language === 'en' ? 'Venues' : '场馆管理', icon: FaMapMarkerAlt },
            { id: 'qr-codes', label: language === 'en' ? 'QR Codes' : 'QR码管理', icon: FaQrcode },
            { id: 'applications', label: language === 'en' ? 'Applications' : '申请审批', icon: FaFileAlt },
            { id: 'users', label: language === 'en' ? 'Users' : '用户管理', icon: FaUsers },
            { id: 'fees', label: language === 'en' ? 'Fee Rules' : '费用规则', icon: FaCoins },
            { id: 'pool', label: language === 'en' ? 'CHZ Pool' : 'CHZ池', icon: FaDatabase },
            { id: 'config', label: language === 'en' ? 'Config' : '系统配置', icon: FaCog }
          ].map(tab => {
            const Icon = tab.icon
            return (
            <button
              key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
                <Icon className="text-sm" />
                <span>{tab.label}</span>
            </button>
            )
          })}
        </div>
      </div>

      {/* 标签页内容 / Tab Content */}
      <div className="space-y-8">
        {/* 概览标签页 / Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* 核心业务指标 / Core Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FaTrophy className="text-blue-400 text-xl" />
              </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats?.totalEvents || 0}</p>
                    <p className="text-blue-400 text-sm font-medium">Total Events</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <FaArrowUp className="text-xs" />
                    <span>{stats?.activeEvents || 0} active</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{stats?.todayEvents || 0} today</span>
            </div>
          </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-emerald-400 text-xl" />
              </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{formatNumber(stats?.activeUsers || 0)}</p>
                    <p className="text-emerald-400 text-sm font-medium">Active Users</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <FaArrowUp className="text-xs" />
                    <span>89% retention</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{formatNumber(stats?.totalUsers || 0)} total</span>
            </div>
          </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FaCoins className="text-purple-400 text-xl" />
              </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{formatNumber(stats?.totalStaked || 0)}</p>
                    <p className="text-purple-400 text-sm font-medium">Total Staked</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <FaArrowUp className="text-xs" />
                    <span>{formatNumber(stats?.todayStaked || 0)} today</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">CHZ</span>
            </div>
          </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <FaFire className="text-amber-400 text-xl" />
              </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats?.chzPoolHealth || 0}%</p>
                    <p className="text-amber-400 text-sm font-medium">Pool Health</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>Optimal</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{stats?.pendingTransactions || 0} pending</span>
            </div>
          </div>
        </div>

            {/* 地区表现概览 / Regional Performance Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FaGlobe className="text-blue-400" />
                    <span>{language === 'en' ? 'Regional Performance' : '地区表现'}</span>
                </h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    {language === 'en' ? 'View Details' : '查看详情'} →
                  </button>
                    </div>
                <div className="space-y-4">
                  {Object.entries(stats?.crossRegionMetrics || {}).map(([region, data]: [string, any]) => (
                    <div key={region} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-white font-medium capitalize">{region.replace('Region', ' Region')}</p>
                          <p className="text-slate-400 text-sm">{data.ambassadors} ambassadors</p>
                  </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{data.events} events</p>
                        <p className="text-emerald-400 text-sm">{formatNumber(data.revenue)} CHZ</p>
                    </div>
                  </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FaBell className="text-amber-400" />
                    <span>{language === 'en' ? 'Pending Tasks' : '待处理任务'}</span>
            </h3>
                  <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                    {(stats?.pendingEventApplications || 0) + (stats?.pendingQRRequests || 0)} total
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaFileAlt className="text-amber-400" />
                      <div>
                        <p className="text-white font-medium">{language === 'en' ? 'Event Applications' : '活动申请'}</p>
                        <p className="text-slate-400 text-sm">{language === 'en' ? 'Awaiting approval' : '等待批准'}</p>
              </div>
                </div>
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-bold">
                      {stats?.pendingEventApplications || 0}
                  </span>
                </div>

                  <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaQrcode className="text-blue-400" />
                      <div>
                        <p className="text-white font-medium">{language === 'en' ? 'QR Code Requests' : 'QR码申请'}</p>
                        <p className="text-slate-400 text-sm">{language === 'en' ? 'Ready for generation' : '准备生成'}</p>
              </div>
                    </div>
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                      {stats?.pendingQRRequests || 0}
                  </span>
              </div>
            </div>
          </div>
        </div>

        {/* 最近活动 / Recent Activities */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaClock className="text-green-400" />
                  <span>{language === 'en' ? 'Recent System Activities' : '最近系统活动'}</span>
          </h3>
                <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                  {language === 'en' ? 'View All' : '查看全部'} →
                </button>
              </div>
          <div className="space-y-3">
                {mockRecentActivities.length > 0 ? (
                  mockRecentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg">
                          {getActivityIcon(activity.type)}
                        </div>
                    <div>
                          <p className="text-white font-medium">{activity.title}</p>
                          <p className="text-slate-400 text-sm flex items-center space-x-2">
                            <span>{new Date(activity.timestamp).toLocaleString()}</span>
                            <span>•</span>
                            <span>{activity.university}</span>
                            <span>•</span>
                            <span>{activity.ambassador}</span>
                      </p>
                    </div>
                  </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        activity.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {activity.priority.toUpperCase()}
                      </div>
                </div>
              ))
            ) : (
                  <div className="text-center py-12 text-slate-400">
                    <FaClock className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>{language === 'en' ? 'No recent activities' : '暂无最近活动'}</p>
              </div>
            )}
          </div>
        </div>
          </>
        )}

        {/* 大使监督标签页 / Ambassador Oversight Tab */}
        {activeTab === 'ambassadors' && (
          <div className="space-y-8">
            {/* 大使筛选器 / Ambassador Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaUserShield className="text-blue-400" />
                  <span>{language === 'en' ? 'Ambassador Management' : '大使管理'}</span>
            </h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <select className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
                    <option value="all">{language === 'en' ? 'All Universities' : '所有大学'}</option>
                    <option value="tech_university">{language === 'en' ? 'Tech University' : '科技大学'}</option>
                    <option value="state_university">{language === 'en' ? 'State University' : '州立大学'}</option>
                  </select>
                  
                  <select className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
                    <option value="all">{language === 'en' ? 'All Regions' : '所有地区'}</option>
                    <option value="north">{language === 'en' ? 'North Region' : '北部地区'}</option>
                    <option value="south">{language === 'en' ? 'South Region' : '南部地区'}</option>
                  </select>
                  
                  <select className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm">
                    <option value="all">{language === 'en' ? 'All Status' : '所有状态'}</option>
                    <option value="active">{language === 'en' ? 'Active' : '活跃'}</option>
                    <option value="inactive">{language === 'en' ? 'Inactive' : '不活跃'}</option>
                    <option value="under_review">{language === 'en' ? 'Under Review' : '审核中'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 大使列表 / Ambassador List */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {mockAmbassadorPerformance.length > 0 ? (
                mockAmbassadorPerformance.map((ambassador) => (
                  <div key={ambassador.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-colors">
                    <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {ambassador.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      <div>
                          <h4 className="text-white font-bold text-lg">{ambassador.name}</h4>
                          <p className="text-slate-300 font-medium">{ambassador.university}</p>
                          <p className="text-slate-400 text-sm">{ambassador.region} Region</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${
                          ambassador.tier === 'Platinum' ? 'from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30' :
                          ambassador.tier === 'Gold' ? 'from-yellow-500/20 to-orange-600/20 text-yellow-400 border border-yellow-500/30' :
                          ambassador.tier === 'Silver' ? 'from-slate-400/20 to-slate-600/20 text-slate-400 border border-slate-500/30' :
                          'from-orange-600/20 to-red-600/20 text-orange-400 border border-orange-500/30'
                        }`}>
                          {ambassador.tier}
                        </span>
                        <p className={`text-xs font-medium ${getStatusColor(ambassador.status).split(' ')[0]} flex items-center space-x-1`}>
                          <div className={`w-2 h-2 rounded-full ${
                            ambassador.status === 'active' ? 'bg-emerald-400' :
                            ambassador.status === 'under_review' ? 'bg-amber-400' :
                            'bg-red-400'
                          }`}></div>
                          <span>{ambassador.status}</span>
                        </p>
                      </div>
                    </div>

                    {/* 绩效指标网格 / Performance Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-medium mb-1">Events</p>
                        <p className="font-bold text-emerald-400 text-lg">{ambassador.totalEvents}</p>
                        <p className="text-slate-500 text-xs">{ambassador.successRate} success</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-medium mb-1">Revenue</p>
                        <p className="font-bold text-blue-400 text-lg">{ambassador.totalRevenue.toFixed(0)} CHZ</p>
                        <p className="text-slate-500 text-xs">{ambassador.monthlyCommission.toFixed(2)}/mo</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-medium mb-1">Athletes</p>
                        <p className="font-bold text-purple-400 text-lg">{ambassador.athletesRecruited}</p>
                        <p className="text-slate-500 text-xs">recruited</p>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-medium mb-1">Audience</p>
                        <p className="font-bold text-amber-400 text-lg">{ambassador.audienceReached}</p>
                        <p className="text-slate-500 text-xs">reached</p>
                      </div>
                    </div>

                    {/* 操作按钮 / Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAmbassadorAction(ambassador.id, 'review', 'Performance review')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <FaEye />
                        <span>{language === 'en' ? 'Review' : '审核'}</span>
                      </button>
                      {ambassador.status === 'active' ? (
                        <button 
                          onClick={() => handleAmbassadorAction(ambassador.id, 'suspend', 'Administrative action')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
                        >
                          <FaPause />
                          <span>{language === 'en' ? 'Suspend' : '暂停'}</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAmbassadorAction(ambassador.id, 'approve', 'Reactivation')}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center space-x-2"
                        >
                          <FaPlay />
                          <span>{language === 'en' ? 'Activate' : '激活'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  <FaUserShield className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>{language === 'en' ? 'No ambassadors found' : '未找到大使'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 场馆管理标签页 / Venue Management Tab */}
        {activeTab === 'venues' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaMapMarkerAlt className="text-purple-400" />
              <span>{language === 'en' ? 'Venue Management' : '场馆管理'}</span>
            </h3>
            <div className="space-y-6">
              {/* 待审批场馆申请 / Pending Venue Requests */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FaFileAlt className="text-amber-400" />
                  <span>{language === 'en' ? 'Pending Venue Requests' : '待审批场馆申请'}</span>
                </h4>
                <div className="space-y-3">
                  {/* Mock data doesn't have pending venue requests */}
                  <div className="text-center py-4 text-slate-400">
                    {language === 'en' ? 'No pending venue requests' : '无待审批场馆申请'}
                  </div>
                </div>
              </div>

              {/* 已批准场馆列表 / Approved Venues List */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FaBuilding className="text-emerald-400" />
                  <span>{language === 'en' ? 'Approved Venues' : '已批准场馆'}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock data doesn't have approved venues */}
                  <div className="col-span-3 text-center py-4 text-slate-400">
                    {language === 'en' ? 'No approved venues' : '无已批准场馆'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR码生成标签页 / QR Code Generation Tab */}
        {activeTab === 'qr-codes' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaQrcode className="text-blue-400" />
              <span>{language === 'en' ? 'QR Code Management' : 'QR码管理'}</span>
            </h3>
            <div className="space-y-6">
              {/* 待处理QR码申请 / Pending QR Code Requests */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FaFileAlt className="text-blue-400" />
                  <span>{language === 'en' ? 'Pending QR Code Requests' : '待处理QR码申请'}</span>
                </h4>
                <div className="space-y-3">
                  {/* Mock data doesn't have pending QR requests */}
                  <div className="text-center py-4 text-slate-400">
                    {language === 'en' ? 'No pending QR requests' : '无待处理QR申请'}
                  </div>
                </div>
              </div>

              {/* 活跃QR码列表 / Active QR Codes List */}
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FaQrcode className="text-purple-400" />
                  <span>{language === 'en' ? 'Active QR Codes' : '活跃QR码'}</span>
                </h4>
                <div className="space-y-3">
                  {/* Mock data doesn't have active QR codes */}
                  <div className="text-center py-4 text-slate-400">
                    {language === 'en' ? 'No active QR codes' : '无活跃QR码'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 活动申请标签页 / Event Applications Tab */}
        {activeTab === 'applications' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaFileAlt className="text-emerald-400" />
              <span>{language === 'en' ? 'Event Applications Management' : '活动申请管理'}</span>
            </h3>
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FaFileAlt className="text-amber-400" />
                  <span>{language === 'en' ? 'Event Applications' : '活动申请'}</span>
                </h4>
                <div className="space-y-4">
                  {eventApplications.length > 0 ? (
                    eventApplications.map((app) => (
                      <div key={app.id} className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4 hover:border-slate-600/50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h5 className="font-bold text-white text-lg mb-2">{app.event_title}</h5>
                            <p className="text-slate-400 text-sm mb-2">{app.event_description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-500">{language === 'en' ? 'Venue:' : '场馆:'}</span>
                                <span className="text-white ml-2">{app.venue_name}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">{language === 'en' ? 'Capacity:' : '容量:'}</span>
                                <span className="text-white ml-2">{app.venue_capacity}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">{language === 'en' ? 'Start Time:' : '开始时间:'}</span>
                                <span className="text-white ml-2">{new Date(app.event_start_time).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">{language === 'en' ? 'Participants:' : '参与者:'}</span>
                                <span className="text-white ml-2">{app.estimated_participants}</span>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="text-slate-500">{language === 'en' ? 'Team A:' : 'A队:'}</span>
                                <span className="text-white">{app.team_a_info?.name || 'N/A'}</span>
                                <span className="text-slate-500">{language === 'en' ? 'Team B:' : 'B队:'}</span>
                                <span className="text-white">{app.team_b_info?.name || 'N/A'}</span>
                              </div>
                            </div>
                            {app.application_notes && (
                              <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700/30 rounded">
                                <span className="text-slate-500 text-sm">{language === 'en' ? 'Notes:' : '备注:'}</span>
                                <p className="text-white text-sm mt-1">{app.application_notes}</p>
                              </div>
                            )}
                            {(app.status === 'approved' || app.status === 'rejected') && app.reviewed_at && (
                              <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700/30 rounded">
                                <div className="text-slate-500 text-sm">
                                  {language === 'en' ? 'Reviewed at:' : '审批时间:'} {new Date(app.reviewed_at).toLocaleString()}
                                </div>
                                {app.admin_review && (
                                  <div className="text-slate-500 text-sm mt-1">
                                    {language === 'en' ? 'Admin Notes:' : '管理员备注:'} {app.admin_review.admin_notes || 'N/A'}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                              {app.status === 'pending' ? (language === 'en' ? 'Pending' : '待审批') :
                               app.status === 'approved' ? (language === 'en' ? 'Approved' : '已批准') :
                               (language === 'en' ? 'Rejected' : '已拒绝')}
                            </span>
                            {app.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openApprovalModal(app)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  {language === 'en' ? 'Review' : '审核'}
                                </button>
                              </div>
                            )}
                            {app.status === 'approved' && (
                              <div className="text-xs text-emerald-400">
                                {language === 'en' ? 'Approved' : '已批准'}
                              </div>
                            )}
                            {app.status === 'rejected' && (
                              <div className="text-xs text-red-400">
                                {language === 'en' ? 'Rejected' : '已拒绝'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                  <div className="text-center py-8 text-slate-400">
                    {language === 'en' ? 'No pending event applications' : '无待处理活动申请'}
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 用户管理标签页 / User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaUsers className="text-blue-400" />
              <span>{language === 'en' ? 'User Management' : '用户管理'}</span>
            </h3>
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FaUsers className="text-purple-400" />
                  <span>{language === 'en' ? 'Users' : '用户'}</span>
                </h4>
                <div className="space-y-4">
                  {/* Mock data doesn't have users */}
                  <div className="text-center py-8 text-slate-400">
                    {language === 'en' ? 'No users found' : '未找到用户'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 手续费规则标签页 / Fee Rules Tab */}
        {activeTab === 'fees' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaCoins className="text-yellow-400" />
              <span>{language === 'en' ? 'Fee Rules Management' : '手续费规则管理'}</span>
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
                    value={0} // Mock data doesn't have fee rules
                    onChange={(e) => {}}
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
                    value={0} // Mock data doesn't have fee rules
                    onChange={(e) => {}}
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
                    value={0} // Mock data doesn't have fee rules
                    onChange={(e) => {}}
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
                    value={0} // Mock data doesn't have fee rules
                    onChange={(e) => {}}
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
                    value={0} // Mock data doesn't have fee rules
                    onChange={(e) => {}}
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
                    value={0} // Mock data doesn't have fee rules
                    onChange={(e) => {}}
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
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaDatabase className="text-emerald-400" />
              <span>{language === 'en' ? 'CHZ Pool Status' : 'CHZ池状态'}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Total Staked' : '总质押'}
                  </p>
                  <p className="text-xl font-bold text-white">
                  {formatNumber(0)} CHZ {/* Mock data doesn't have CHZ pool status */}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Total Fees' : '总手续费'}
                  </p>
                  <p className="text-xl font-bold text-white">
                  {formatNumber(0)} CHZ {/* Mock data doesn't have CHZ pool status */}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Available Withdrawal' : '可提取金额'}
                  </p>
                  <p className="text-xl font-bold text-white">
                  {formatNumber(0)} CHZ {/* Mock data doesn't have CHZ pool status */}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-300">
                    {language === 'en' ? 'Pool Health' : '池健康度'}
                  </p>
                  <p className="text-xl font-bold text-white">
                  0% {/* Mock data doesn't have CHZ pool status */}
                  </p>
              </div>
            </div>
          </div>
        )}

        {/* 系统配置标签页 / System Configuration Tab */}
        {activeTab === 'config' && (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaCog className="text-blue-400" />
              <span>{language === 'en' ? 'System Configuration' : '系统配置'}</span>
            </h3>
            <div className="space-y-4">
              {/* Mock data doesn't have system config */}
              <div className="text-center py-8 text-slate-400">
                {language === 'en' ? 'No system configurations found' : '未找到系统配置'}
                  </div>
            </div>
          </div>
        )}

        {/* Event Approval Modal */}
        <EventApprovalModal
          isOpen={approvalModal.isOpen}
          onClose={closeApprovalModal}
          application={approvalModal.application}
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
          language={language}
        />
      </div>
    </DashboardLayout>
  )
} 