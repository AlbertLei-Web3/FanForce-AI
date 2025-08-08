// FanForce AI - 主页面
// Main Page - 新角色仪表板系统的主要入口页面
// Main entry page for the new role-based dashboard system
// 关联文件:
// - UserContext.tsx: 用户认证和角色管理
// - /login: 登录页面
// - /dashboard: 角色仪表板路由

'use client'

import { useEffect } from 'react'
import { useUser } from './context/UserContext'
import { useLanguage } from './context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const { authState } = useUser()
  const { language, toggleLanguage } = useLanguage()
  const router = useRouter()

  // 如果已登录，自动跳转到仪表板 / Auto redirect to dashboard if logged in
  // 临时注释掉自动跳转，用于测试ICP登录功能
  // useEffect(() => {
  //   if (authState.isAuthenticated) {
  //     router.push('/dashboard')
  //   }
  // }, [authState.isAuthenticated, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary">
      {/* 顶部导航 / Top Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                <span className="text-fanforce-gold">FanForce</span>
                <span className="text-fanforce-secondary ml-1">AI</span>
            </h1>
              <span className="ml-3 text-sm text-gray-300">
                Campus Sports Prediction Platform
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleLanguage}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                title="Switch Language"
              >
                {language === 'en' ? '中' : 'EN'}
              </button>
              <Link
                href="/login"
                className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                {language === 'en' ? 'Login' : '登录'}
              </Link>
                </div>
              </div>
            </div>
      </nav>

      {/* 主要内容 / Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* 英雄区域 / Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-white mb-6">
              <span className="text-fanforce-gold">FanForce</span>
              <span className="text-fanforce-secondary ml-2">AI</span>
            </h1>
            <p className="text-2xl text-gray-300 mb-4">
              {language === 'en' 
                ? 'Campus Sports Prediction Platform' 
                : '校园体育预测平台'}
            </p>
            <p className="text-lg text-gray-400 mb-8">
              {language === 'en'
                ? 'AI-Powered Campus Sports with Role-Based Dashboard System'
                : 'AI驱动的校园体育，配备基于角色的仪表板系统'}
            </p>
          </div>

          {/* 角色介绍卡片 / Role Introduction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* 管理员角色 / Admin Role */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-red-500/50 transition-colors">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === 'en' ? 'System Admin' : '系统管理员'}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === 'en' 
                  ? 'System configuration, user management, analytics oversight'
                  : '系统配置、用户管理、分析监督'}
              </p>
            </div>

            {/* 大使角色 / Ambassador Role */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-yellow-500/50 transition-colors">
              <div className="text-4xl mb-4">🧑‍💼</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === 'en' ? 'Campus Ambassador' : '校园大使'}
                    </h3>
              <p className="text-gray-300 text-sm">
                {language === 'en'
                  ? 'Event creation, athlete management, venue coordination'
                  : '活动创建、运动员管理、场馆协调'}
              </p>
            </div>

            {/* 运动员角色 / Athlete Role */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-green-500/50 transition-colors">
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === 'en' ? 'Student Athlete' : '学生运动员'}
                </h3>
              <p className="text-gray-300 text-sm">
                {language === 'en'
                  ? 'Profile management, competition status, ranking system'
                  : '档案管理、比赛状态、排名系统'}
              </p>
            </div>

            {/* 观众角色 / Audience Role */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-blue-500/50 transition-colors">
              <div className="text-4xl mb-4">🙋‍♂️</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === 'en' ? 'Audience Supporter' : '观众支持者'}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === 'en'
                  ? 'Event browsing, team staking, reward tracking'
                  : '活动浏览、队伍质押、奖励跟踪'}
              </p>
                    </div>
                  </div>
                  
          {/* 操作按钮 / Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/login"
              className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center"
            >
              <span className="mr-2">🚀</span>
              {language === 'en' ? 'Access Dashboard' : '访问仪表板'}
            </Link>
            <Link
              href="/websocket-demo"
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center"
            >
              <span className="mr-2">🔗</span>
              {language === 'en' ? 'WebSocket Demo' : 'WebSocket演示'}
            </Link>
            </div>

          {/* 系统特性 / System Features */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              {language === 'en' ? 'Key Features' : '核心功能'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="text-lg font-bold text-fanforce-gold mb-2">
                  {language === 'en' ? 'Web2-First Architecture' : 'Web2优先架构'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'en'
                    ? 'PostgreSQL-driven business logic with minimal smart contract interaction'
                    : 'PostgreSQL驱动的业务逻辑，最少的智能合约交互'}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-fanforce-gold mb-2">
                  {language === 'en' ? 'Real-time Communication' : '实时通信'}
              </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'en'
                    ? 'WebSocket-powered live updates and cross-role messaging'
                    : 'WebSocket驱动的实时更新和跨角色消息传递'}
                  </p>
                </div>
              <div>
                <h3 className="text-lg font-bold text-fanforce-gold mb-2">
                  {language === 'en' ? 'Role-Based Dashboards' : '基于角色的仪表板'}
            </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'en'
                    ? 'Customized interfaces for each user type with permission controls'
                    : '为每种用户类型定制的界面，具有权限控制'}
                </p>
              </div>
              </div>
            </div>
            
          {/* 底部信息 / Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              {language === 'en' 
                ? 'Powered by Chiliz Chain • Built with Next.js & TypeScript'
                : '由Chiliz链驱动 • 使用Next.js和TypeScript构建'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 