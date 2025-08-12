// FanForce AI - 用户注册向导主页面
// User Registration Wizard Main Page - 多角色渐进式注册流程
// Multi-role progressive registration flow
// 关联文件:
// - UserContext.tsx: 用户认证和会话管理
// - RegistrationWizard.tsx: 注册向导核心逻辑

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../context/UserContext'
import { useLanguage } from '../context/LanguageContext'
import Link from 'next/link'
import SimplifiedRegistration from './components/SimplifiedRegistration'

export default function RegisterPage() {
  const { authState } = useUser()
  const { language } = useLanguage()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [registrationMode, setRegistrationMode] = useState<'choice'>('choice')

  // 检查是否有强制注册参数 / Check for force registration parameter
  const [forceRegister, setForceRegister] = useState(false)
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const force = urlParams.get('force') === 'true'
    setForceRegister(force)
  }, [])

  // 检查用户是否已经登录，如果已登录则重定向到仪表板
  // Check if user is already logged in, redirect to dashboard if logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true)
      
      // 等待认证状态稳定
      // Wait for auth state to stabilize
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 如果用户已登录且没有强制注册参数，则重定向到仪表板
      // If user is logged in and no force registration parameter, redirect to dashboard
      if (authState.isAuthenticated && authState.user && !forceRegister) {
        console.log('✅ 用户已登录，重定向到仪表板 / User already logged in, redirecting to dashboard')
        router.push('/dashboard')
        return
      }
      
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [authState.isAuthenticated, authState.user, router, forceRegister])

  // 显示加载状态
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fanforce-gold mb-4 mx-auto"></div>
          <p className="text-white">
            {language === 'en' ? 'Loading...' : '正在加载...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary">
      {/* 返回首页链接 / Back to Home Link */}
      <div className="absolute top-6 left-6 z-10">
        <Link 
          href="/"
          className="flex items-center text-fanforce-gold hover:text-fanforce-secondary transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {language === 'en' ? 'Back to Home' : '返回首页'}
        </Link>
      </div>

      {/* 已有账户链接 / Already Have Account Link */}
      <div className="absolute top-6 right-6 z-10">
        <Link 
          href="/"
          className="flex items-center text-gray-300 hover:text-white transition-colors"
        >
          {language === 'en' ? 'Already have an account?' : '已有账户？'}
          <span className="ml-2 text-fanforce-gold">
            {language === 'en' ? 'Sign In' : '登录'}
          </span>
        </Link>
      </div>

      {/* 主标题区域 / Main Title Area */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'en' ? 'Join ' : '加入 '}
            <span className="text-fanforce-gold">FanForce</span>
            <span className="text-fanforce-secondary ml-2">AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {language === 'en' 
              ? 'Create your multi-role community sports account' 
              : '创建您的多角色社区体育账户'
            }
          </p>
          <p className="text-sm text-gray-400">
            {language === 'en'
              ? 'Choose your identity, connect your wallet, and start your journey'
              : '选择您的身份，连接您的钱包，开始您的旅程'
            }
          </p>
        </div>

        {/* 直接进入简化注册 / Direct to Simplified Registration */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mx-auto max-w-2xl">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {language === 'en' ? 'Quick Start Registration' : '快速开始注册'}
              </h3>
              <p className="text-gray-300 mb-6">
                {language === 'en'
                  ? 'Simple 2-step process: authenticate and choose your role'
                  : '简单的2步流程：身份验证和角色选择'
                }
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-fanforce-accent rounded-full"></span>
                  <span>{language === 'en' ? 'Multiple login methods' : '多种登录方式'}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-fanforce-accent rounded-full"></span>
                  <span>{language === 'en' ? 'Instant role selection' : '即时角色选择'}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 bg-fanforce-accent rounded-full"></span>
                  <span>{language === 'en' ? 'Direct platform access' : '直接平台访问'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 注册向导组件 / Registration Wizard Component */}
        <SimplifiedRegistration onBack={() => setRegistrationMode('choice')} />
      </div>

      {/* 底部帮助信息 / Bottom Help Information */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
          <p className="text-gray-400 text-sm">
            {language === 'en' ? 'Need help? ' : '需要帮助？'}
            <a 
              href="mailto:support@fanforce.ai" 
              className="text-fanforce-gold hover:text-fanforce-secondary transition-colors"
            >
              {language === 'en' ? 'Contact Support' : '联系支持'}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
