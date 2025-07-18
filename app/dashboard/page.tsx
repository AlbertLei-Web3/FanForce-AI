// FanForce AI - 仪表板路由页面
// Dashboard Router Page - 根据用户角色自动跳转到对应仪表板
// Automatically redirects users to their role-specific dashboard
// 关联文件:
// - UserContext.tsx: 用户角色和认证状态
// - 各角色仪表板页面: admin/page.tsx, ambassador/page.tsx, athlete/page.tsx, audience/page.tsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'

export default function DashboardRouter() {
  const { authState, getDashboardPath } = useUser()
  const { language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    // 检查用户认证状态 / Check user authentication state
    if (!authState.isAuthenticated) {
      console.log('❌ 用户未认证，跳转到登录页面 / User not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // 用户已认证，根据角色跳转到相应仪表板 / User authenticated, redirect to role-specific dashboard
    const dashboardPath = getDashboardPath()
    console.log('✅ 用户已认证，跳转到仪表板 / User authenticated, redirecting to dashboard:', dashboardPath)
    router.push(dashboardPath)
  }, [authState.isAuthenticated, getDashboardPath, router])

  // 显示加载页面 / Show loading page
  return (
    <div className="min-h-screen bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-fanforce-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-white mb-2">
          {language === 'en' ? 'Loading Dashboard...' : '正在加载仪表板...'}
        </h2>
        <p className="text-gray-300">
          {language === 'en' ? 'Redirecting to your dashboard' : '正在跳转到您的仪表板'}
        </p>
      </div>
    </div>
  )
} 