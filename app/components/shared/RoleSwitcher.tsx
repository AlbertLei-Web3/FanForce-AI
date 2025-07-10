// FanForce AI - 角色切换器组件
// Role Switcher Component - 超级管理员开发工具，用于切换角色视图
// Super Admin development tool for switching role views
// 关联文件:
// - UserContext.tsx: 用户角色管理和切换逻辑
// - 各角色仪表板: 用于测试不同角色的界面

'use client'

import { useState } from 'react'
import { useUser, UserRole } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'
import { useRouter } from 'next/navigation'

export default function RoleSwitcher() {
  const { 
    isSuperAdmin, 
    currentViewRole, 
    switchRole, 
    resetRole, 
    getAvailableRoles,
    authState 
  } = useUser()
  const { language } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // 如果不是超级管理员，不显示组件 / Don't show component if not super admin
  if (!isSuperAdmin()) {
    return null
  }

  // 角色配置 / Role Configuration
  const roleConfig = {
    [UserRole.ADMIN]: {
      icon: '🔧',
      name: language === 'en' ? 'Admin' : '管理员',
      description: language === 'en' ? 'System Management' : '系统管理',
      color: 'bg-red-500 hover:bg-red-600'
    },
    [UserRole.AMBASSADOR]: {
      icon: '🧑‍💼',
      name: language === 'en' ? 'Ambassador' : '大使',
      description: language === 'en' ? 'Event Creation' : '活动创建',
      color: 'bg-yellow-500 hover:bg-yellow-600'
    },
    [UserRole.ATHLETE]: {
      icon: '🏃‍♂️',
      name: language === 'en' ? 'Athlete' : '运动员',
      description: language === 'en' ? 'Profile Management' : '档案管理',
      color: 'bg-green-500 hover:bg-green-600'
    },
    [UserRole.AUDIENCE]: {
      icon: '🙋‍♂️',
      name: language === 'en' ? 'Audience' : '观众',
      description: language === 'en' ? 'Staking Interface' : '质押界面',
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  // 处理角色切换 / Handle Role Switch
  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role)
    setIsOpen(false)
    // 自动导航到对应的仪表板 / Auto navigate to corresponding dashboard
    setTimeout(() => {
      router.push(`/dashboard/${role}`)
    }, 100)
  }

  // 重置角色 / Reset Role
  const handleReset = () => {
    resetRole()
    setIsOpen(false)
    // 返回超级管理员的默认视图 / Return to super admin default view
    setTimeout(() => {
      router.push('/dashboard/admin')
    }, 100)
  }

  const availableRoles = getAvailableRoles()

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* 当前状态指示器 / Current Status Indicator */}
      <div className="mb-2 text-right">
        <div className="bg-purple-900/90 backdrop-blur-sm rounded-lg px-3 py-1 text-sm text-white">
          <span className="text-purple-300">
            {language === 'en' ? 'Super Admin' : '超级管理员'}
          </span>
          {currentViewRole && (
            <span className="ml-2 text-purple-100">
              → {roleConfig[currentViewRole]?.name}
            </span>
          )}
        </div>
      </div>

      {/* 角色切换器主按钮 / Role Switcher Main Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
          title={language === 'en' ? 'Switch Role View' : '切换角色视图'}
        >
          <span className="text-xl">
            {currentViewRole ? roleConfig[currentViewRole]?.icon : '👑'}
          </span>
          <span className="ml-2 text-sm hidden sm:inline">
            {language === 'en' ? 'DEV' : '开发'}
          </span>
        </button>

        {/* 角色切换面板 / Role Switch Panel */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* 面板头部 / Panel Header */}
            <div className="bg-purple-600 text-white p-4">
              <h3 className="font-bold text-lg">
                {language === 'en' ? 'Role Switcher' : '角色切换器'}
              </h3>
              <p className="text-purple-100 text-sm">
                {language === 'en' 
                  ? 'Switch between different role views' 
                  : '在不同角色视图之间切换'}
              </p>
            </div>

            {/* 当前用户信息 / Current User Info */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">
                    {authState.user?.username?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {authState.user?.username || 'Super Admin'}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {authState.user?.address?.slice(0, 6)}...{authState.user?.address?.slice(-4)}
                  </div>
                </div>
              </div>
            </div>

            {/* 角色选择列表 / Role Selection List */}
            <div className="p-2">
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    currentViewRole === role 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${roleConfig[role]?.color}`}>
                    <span className="text-lg">{roleConfig[role]?.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{roleConfig[role]?.name}</div>
                    <div className="text-sm opacity-70">{roleConfig[role]?.description}</div>
                  </div>
                  {currentViewRole === role && (
                    <div className="text-purple-600 dark:text-purple-400">
                      <span className="text-sm">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* 控制按钮 / Control Buttons */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex space-x-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                disabled={!currentViewRole}
              >
                {language === 'en' ? 'Reset View' : '重置视图'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
              >
                {language === 'en' ? 'Close' : '关闭'}
              </button>
            </div>

            {/* 开发信息 / Development Info */}
            <div className="bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between items-center">
                <span>
                  {language === 'en' ? 'Development Mode' : '开发模式'}
                </span>
                <span className="text-purple-600 dark:text-purple-400">
                  {process.env.NODE_ENV}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 点击外部关闭 / Click Outside to Close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 