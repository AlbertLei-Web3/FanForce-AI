// FanForce AI - 主页面
// Main Page - 新角色仪表板系统的主要入口页面
// Main entry page for the new role-based dashboard system
// 关联文件:
// - UserContext.tsx: 用户认证和角色管理
// - /login: 登录页面
// - /dashboard: 角色仪表板路由

'use client'

import { useEffect, useState } from 'react'
import { useUser } from './context/UserContext'
import { useLanguage } from './context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SimplifiedRegistration from './register/components/SimplifiedRegistration'

export default function HomePage() {
  const { authState } = useUser()
  const { language, toggleLanguage } = useLanguage()
  const router = useRouter()
  const [showQuickRegistration, setShowQuickRegistration] = useState(false)
  const [showIdentitySelection, setShowIdentitySelection] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  // 如果已登录，自动跳转到仪表板 / Auto redirect to dashboard if logged in
  // 临时注释掉自动跳转，用于测试ICP登录功能
  // useEffect(() => {
  //   if (authState.isAuthenticated) {
  //     router.push('/dashboard')
  //   }
  // }, [authState.isAuthenticated, router])

  // 处理快速注册模态窗口的关闭 / Handle quick registration modal close
  const handleCloseQuickRegistration = () => {
    setShowQuickRegistration(false)
  }

  // 处理登录成功，显示角色选择 / Handle login success, show role selection
  const handleAuthSuccess = (authMethod: string, data: any) => {
    setUserData({ ...data, authMethod })
    setShowQuickRegistration(false)
    setShowIdentitySelection(true)
  }

  // 处理角色选择模态窗口的关闭 / Handle identity selection modal close
  const handleCloseIdentitySelection = () => {
    setShowIdentitySelection(false)
    setUserData(null)
  }

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
              <button
                onClick={() => setShowQuickRegistration(true)}
                className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                {language === 'en' ? 'Login' : '登录'}
              </button>
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
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-purple-500/50 transition-colors">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {language === 'en' ? 'Event Ambassador' : '活动大使'}
              </h3>
              <p className="text-gray-300 text-sm">
                {language === 'en'
                  ? 'Event management, team coordination, result tracking'
                  : '活动管理、队伍协调、结果跟踪'}
              </p>
            </div>

            {/* 运动员角色 / Athlete Role */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:border-orange-500/50 transition-colors">
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
            <button
              onClick={() => setShowQuickRegistration(true)}
              className="bg-fanforce-primary hover:bg-fanforce-secondary text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors flex items-center"
            >
              <span className="mr-2">🚀</span>
              {language === 'en' ? 'Access Dashboard' : '访问仪表板'}
            </button>
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

      {/* 快速注册模态窗口 / Quick Registration Modal - 第一页：登录按钮 */}
      {showQuickRegistration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/20 relative">
            {/* 关闭按钮 / Close Button */}
            <button
              onClick={handleCloseQuickRegistration}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 z-10"
            >
              ×
            </button>
            
            {/* 模态窗口内容 / Modal Content - 只显示登录步骤 */}
            <div className="p-6 pt-8">
              <SimplifiedRegistration 
                onBack={handleCloseQuickRegistration} 
                isModal={true}
                onAuthSuccess={handleAuthSuccess}
                showOnlyAuth={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 角色选择模态窗口 / Identity Selection Modal - 第二页：角色选择卡片 */}
      {showIdentitySelection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/20 relative">
            {/* 关闭按钮 / Close Button */}
            <button
              onClick={handleCloseIdentitySelection}
              className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110 z-10"
            >
              ×
            </button>
            
            {/* 模态窗口内容 / Modal Content - 显示角色选择步骤 */}
            <div className="p-6 pt-12 overflow-y-auto role-selection-scrollbar" style={{
              maxHeight: 'calc(90vh - 60px)'
            }}>
              <SimplifiedRegistration 
                onBack={handleCloseIdentitySelection} 
                isModal={true}
                userData={userData}
                showOnlyIdentity={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 自定义滚动条样式 / Custom Scrollbar Styles */}
      <style jsx global>{`
        /* 角色选择页面的滚动条样式 / Role selection page scrollbar styles */
        .role-selection-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .role-selection-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin: 4px;
        }
        .role-selection-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: content-box;
          transition: all 0.3s ease;
        }
        .role-selection-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          transform: scaleX(1.1);
        }
        .role-selection-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        /* Firefox 滚动条样式 / Firefox scrollbar styles */
        .role-selection-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  )
} 