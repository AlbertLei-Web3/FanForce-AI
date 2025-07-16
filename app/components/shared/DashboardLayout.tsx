// FanForce AI - 仪表板布局组件
// Dashboard Layout Component - 所有角色仪表板的通用布局
// Common layout for all role-based dashboards
// 关联文件:
// - UserContext.tsx: 用户角色和认证状态
// - EnhancedNavbar.tsx: 增强的导航栏
// - WebSocketClient.tsx: 实时通信

'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useUser, UserRole } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

// 仪表板侧边栏菜单接口 / Dashboard Sidebar Menu Interface
interface MenuItem {
  id: string
  label: string
  labelCn: string
  icon: string
  href: string
  badge?: string
  permission?: string
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  actions 
}: DashboardLayoutProps) {
  const { authState, logout, isAdmin, isAmbassador, isAthlete, isAudience, isSuperAdmin, isDevelopmentMode } = useUser()
  const { language, toggleLanguage, t } = useLanguage()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [devToolsOpen, setDevToolsOpen] = useState(false) // 新增：开发工具下拉菜单状态 / New: Dev tools dropdown state

  // 更新时间 / Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 每分钟更新一次 / Update every minute

    return () => clearInterval(timer)
  }, [])

  // 点击外部关闭开发工具下拉菜单 / Close dev tools dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (devToolsOpen && !(event.target as Element)?.closest('.dev-tools-dropdown')) {
        setDevToolsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [devToolsOpen])

  // 处理登出 / Handle logout
  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // 根据角色获取菜单项 / Get menu items based on role
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = []

    // 超级管理员和管理员都能访问管理员菜单 / Both super admin and admin can access admin menu
    if (isAdmin() || isSuperAdmin()) {
      const adminItems = [
        { id: 'overview', label: 'System Overview', labelCn: '系统概览', icon: '📊', href: '/dashboard/admin' },
        { id: 'users', label: 'User Management', labelCn: '用户管理', icon: '👥', href: '/dashboard/admin/users' },
        { id: 'events', label: 'Event Management', labelCn: '活动管理', icon: '🎯', href: '/dashboard/admin/events' },
        { id: 'analytics', label: 'Analytics', labelCn: '数据分析', icon: '📈', href: '/dashboard/admin/analytics' },
        { id: 'settings', label: 'System Settings', labelCn: '系统设置', icon: '⚙️', href: '/dashboard/admin/settings' },
      ]
      
      // 超级管理员额外的开发工具菜单 / Additional dev tools menu for super admin
      if (isSuperAdmin()) {
        adminItems.push({
          id: 'dev-tools',
          label: 'Dev Tools',
          labelCn: '开发工具',
          icon: '🛠️',
          href: '/dashboard/admin/dev-tools'
        })
      }
      
      return adminItems
    }

    if (isAmbassador()) {
      return [
        { id: 'overview', label: 'Ambassador Hub', labelCn: '大使中心', icon: '🏛️', href: '/dashboard/ambassador' },
        { id: 'events', label: 'Create Event', labelCn: '创建活动', icon: '➕', href: '/dashboard/ambassador/create-event' },
        { id: 'athletes', label: 'Athlete Management', labelCn: '运动员管理', icon: '🏃‍♂️', href: '/dashboard/ambassador/athletes' },
        { id: 'venues', label: 'Venue Management', labelCn: '场馆管理', icon: '🏟️', href: '/dashboard/ambassador/venues' },
        { id: 'performance', label: 'Performance', labelCn: '业绩统计', icon: '📊', href: '/dashboard/ambassador/performance' },
      ]
    }

    if (isAthlete()) {
      return [
        { id: 'overview', label: 'Athlete Profile', labelCn: '运动员档案', icon: '🏃‍♂️', href: '/dashboard/athlete' },
        { id: 'competitions', label: 'Competitions', labelCn: '比赛状态', icon: '🏆', href: '/dashboard/athlete/competitions' },
        { id: 'rankings', label: 'Rankings', labelCn: '段位排名', icon: '🥇', href: '/dashboard/athlete/rankings' },
        { id: 'earnings', label: 'Earnings', labelCn: '收入统计', icon: '💰', href: '/dashboard/athlete/earnings' },
        { id: 'profile', label: 'Profile Settings', labelCn: '档案设置', icon: '⚙️', href: '/dashboard/athlete/profile' },
      ]
    }

    if (isAudience()) {
      return [
        { id: 'overview', label: 'Audience Hub', labelCn: '观众中心', icon: '🙋‍♂️', href: '/dashboard/audience' },
        { id: 'events', label: 'Browse Events', labelCn: '浏览活动', icon: '🎯', href: '/dashboard/audience/events' },
        { id: 'staking', label: 'Staking', labelCn: '质押中心', icon: '💎', href: '/dashboard/audience/staking' },
        { id: 'rewards', label: 'Rewards', labelCn: '奖励记录', icon: '🏅', href: '/dashboard/audience/rewards' },
        { id: 'qr-scanner', label: 'QR Scanner', labelCn: '扫码签到', icon: '📱', href: '/dashboard/audience/scanner' },
      ]
    }

    return baseItems
  }

  // 获取角色显示信息 / Get role display info
  const getRoleInfo = () => {
    const roleLabels = {
      [UserRole.SUPER_ADMIN]: { label: 'Super Admin', labelCn: '超级管理员', color: 'bg-purple-500' },
      [UserRole.ADMIN]: { label: 'System Admin', labelCn: '系统管理员', color: 'bg-red-500' },
      [UserRole.AMBASSADOR]: { label: 'Campus Ambassador', labelCn: '校园大使', color: 'bg-yellow-500' },
      [UserRole.ATHLETE]: { label: 'Student Athlete', labelCn: '学生运动员', color: 'bg-green-500' },
      [UserRole.AUDIENCE]: { label: 'Audience Supporter', labelCn: '观众支持者', color: 'bg-blue-500' }
    }

    const currentRole = authState.user?.role || UserRole.AUDIENCE
    return roleLabels[currentRole] || roleLabels[UserRole.AUDIENCE]
  }

  const menuItems = getMenuItems()
  const roleInfo = getRoleInfo()

  return (
    <>
    {/*
      采用 Flex 布局让侧边栏与主内容区在同一水平基线，
      Fix blank spacing issue by switching to flex container so both sidebar and content share the same Y-axis.
    */}
    <div className="min-h-screen flex bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary">
      {/* 侧边栏背景遮罩 / Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 / Sidebar */}
      <div className={`z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 
        ${sidebarOpen ? 'fixed inset-y-0 left-0 translate-x-0' : 'fixed inset-y-0 left-0 -translate-x-full'} 
        lg:static lg:h-auto lg:sticky lg:top-0`}>
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 / Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-fanforce-gold">FanForce</span>
              <span className="text-xl font-bold text-fanforce-secondary ml-1">AI</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* 用户信息 / User Info */}
          <div className="p-4 bg-gray-700 border-b border-gray-600">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-fanforce-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {authState.user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {authState.user?.username || 'User'}
                </p>
                <div className="flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${roleInfo.color}`}></span>
                  <p className="text-xs text-gray-300">
                    {language === 'en' ? roleInfo.label : roleInfo.labelCn}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 导航菜单 / Navigation Menu */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center px-2 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              >
                <span className="mr-3">{item.icon}</span>
                {language === 'en' ? item.label : item.labelCn}
                {item.badge && (
                  <span className="ml-auto bg-fanforce-primary text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* 侧边栏底部 / Sidebar Footer */}
          <div className="p-4 border-t border-gray-600">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{currentTime.toLocaleTimeString()}</span>
              <button 
                onClick={toggleLanguage}
                className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                {language === 'en' ? '中' : 'EN'}
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
            >
              {language === 'en' ? 'Logout' : '登出'}
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 / Main Content Area */}
      <div className="flex-1">
        {/* 顶部栏 / Top Bar */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:text-fanforce-gold mr-3"
              >
                ☰
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-300">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {actions}
              
              {/* 开发工具下拉菜单 / Dev Tools Dropdown Menu */}
              {isDevelopmentMode() && (
                <div className="relative dev-tools-dropdown">
                  <button
                    onClick={() => setDevToolsOpen(!devToolsOpen)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors"
                  >
                    <span>🛠️</span>
                    <span className="text-sm">{language === 'en' ? 'Dev Tools' : '开发工具'}</span>
                    <span className={`transform transition-transform ${devToolsOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  {devToolsOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-600 z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            router.push('/dashboard/admin')
                            setDevToolsOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-300 transition-colors flex items-center space-x-2"
                        >
                          <span>🔧</span>
                          <span>{language === 'en' ? 'Admin View' : '管理员视图'}</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push('/dashboard/ambassador')
                            setDevToolsOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-300 transition-colors flex items-center space-x-2"
                        >
                          <span>🧑‍💼</span>
                          <span>{language === 'en' ? 'Ambassador View' : '大使视图'}</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push('/dashboard/athlete')
                            setDevToolsOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm bg-green-600/20 hover:bg-green-600/40 text-green-300 transition-colors flex items-center space-x-2"
                        >
                          <span>🏃‍♂️</span>
                          <span>{language === 'en' ? 'Athlete View' : '运动员视图'}</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push('/dashboard/audience')
                            setDevToolsOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 transition-colors flex items-center space-x-2"
                        >
                          <span>🙋‍♂️</span>
                          <span>{language === 'en' ? 'Audience View' : '观众视图'}</span>
                        </button>
                        <hr className="border-gray-600 my-2" />
                        <button
                          onClick={() => {
                            localStorage.clear()
                            window.location.reload()
                          }}
                          className="w-full text-left px-4 py-2 text-sm bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 transition-colors flex items-center space-x-2"
                        >
                          <span>🔄</span>
                          <span>{language === 'en' ? 'Reset App' : '重置应用'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 用户头像和快速菜单 / User Avatar and Quick Menu */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-fanforce-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {authState.user?.username?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-white text-sm">
                  {authState.user?.username || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 页面内容 / Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

    </div>
    </>
  )
} 