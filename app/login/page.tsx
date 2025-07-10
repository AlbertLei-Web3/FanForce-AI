// FanForce AI - 登录页面
// Login Page - 用户认证登录页面，使用钱包签名验证
// User authentication login page using wallet signature verification
// 关联文件:
// - UserContext.tsx: 用户认证和会话管理
// - Web3Context.tsx: 钱包连接管理
// - Backend API: 签名验证和用户角色获取

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../context/UserContext'
import { useWeb3 } from '../context/Web3Context'
import { useLanguage } from '../context/LanguageContext'
import Link from 'next/link'

// 认证步骤枚举 / Authentication Steps Enum
enum AuthStep {
  CONNECT_WALLET = 'connect_wallet',
  SIGN_MESSAGE = 'sign_message',
  AUTHENTICATING = 'authenticating',
  SUCCESS = 'success',
  ERROR = 'error'
}

export default function LoginPage() {
  const { authState, login } = useUser()
  const { address, connectWallet, isConnected } = useWeb3()
  const { language, t } = useLanguage()
  const router = useRouter()

  // 状态管理 / State Management
  const [currentStep, setCurrentStep] = useState<AuthStep>(AuthStep.CONNECT_WALLET)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authMessage, setAuthMessage] = useState<string>('')

  // 检查用户是否已经登录 / Check if user is already logged in
  useEffect(() => {
    if (authState.isAuthenticated) {
      router.push('/dashboard')
    }
  }, [authState.isAuthenticated, router])

  // 钱包连接后的处理 / Handle wallet connection
  useEffect(() => {
    if (isConnected && address && currentStep === AuthStep.CONNECT_WALLET) {
      setCurrentStep(AuthStep.SIGN_MESSAGE)
      generateAuthMessage()
    }
  }, [isConnected, address, currentStep])

  // 生成认证消息 / Generate Authentication Message
  const generateAuthMessage = () => {
    const timestamp = Date.now()
    const message = `FanForce AI Authentication\n\nAddress: ${address}\nTimestamp: ${timestamp}\n\nPlease sign this message to authenticate your identity.`
    setAuthMessage(message)
  }

  // 处理钱包连接 / Handle Wallet Connection
  const handleConnectWallet = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      await connectWallet()
      setCurrentStep(AuthStep.SIGN_MESSAGE)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
      setCurrentStep(AuthStep.ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理消息签名 / Handle Message Signing
  const handleSignMessage = async () => {
    if (!window.ethereum || !address) {
      setError('Web3 not initialized or address not found')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      setCurrentStep(AuthStep.AUTHENTICATING)

      // 使用window.ethereum签名消息 / Sign message using window.ethereum
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [authMessage, address],
      })
      
      // 调用用户上下文的登录方法 / Call user context login method
      const success = await login(signature, authMessage)
      
      if (success) {
        setCurrentStep(AuthStep.SUCCESS)
        // 延迟跳转到仪表板 / Delayed redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        throw new Error('Authentication failed')
      }
    } catch (err: any) {
      console.error('Sign message error:', err)
      setError(err.message || 'Failed to sign message')
      setCurrentStep(AuthStep.ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  // 开发模式快速登录 / Development Mode Quick Login
  const handleQuickLogin = async (role: 'super_admin' | 'admin' | 'ambassador' | 'athlete' | 'audience') => {
    try {
      setIsLoading(true)
      setError(null)
      setCurrentStep(AuthStep.AUTHENTICATING)

      // 模拟用户数据 / Mock user data
      const mockUsers = {
        super_admin: {
          id: 'dev-super-admin',
          address: '0x1234567890123456789012345678901234567890',
          role: 'super_admin',
          username: 'Super Admin (Dev)',
          email: 'dev@fanforce.ai',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        admin: {
          id: 'dev-admin',
          address: '0x2345678901234567890123456789012345678901',
          role: 'admin',
          username: 'Admin (Dev)',
          email: 'admin@fanforce.ai',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        ambassador: {
          id: 'dev-ambassador',
          address: '0x3456789012345678901234567890123456789012',
          role: 'ambassador',
          username: 'Ambassador (Dev)',
          email: 'ambassador@fanforce.ai',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        athlete: {
          id: 'dev-athlete',
          address: '0x4567890123456789012345678901234567890123',
          role: 'athlete',
          username: 'Athlete (Dev)',
          email: 'athlete@fanforce.ai',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        },
        audience: {
          id: 'dev-audience',
          address: '0x5678901234567890123456789012345678901234',
          role: 'audience',
          username: 'Audience (Dev)',
          email: 'audience@fanforce.ai',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      }

      const mockUser = mockUsers[role]
      const mockToken = `dev-token-${role}-${Date.now()}`
      
      // 存储模拟用户数据 / Store mock user data
      localStorage.setItem('fanforce_session_token', mockToken)
      localStorage.setItem('fanforce_user_info', JSON.stringify(mockUser))
      
      // 使用特殊的开发模式签名调用login / Use special dev mode signature to call login
      const mockSignature = `dev-mock-${role}-${Date.now()}`
      const mockMessage = `Development mode login for ${role}`
      
      // 调用用户上下文的登录方法（它会识别开发模式并直接返回成功）/ Call user context login method (it will recognize dev mode and return success directly)
      const success = await login(mockSignature, mockMessage)
      
      if (success) {
        setCurrentStep(AuthStep.SUCCESS)
        
        // 显示成功消息后立即跳转 / Show success message then redirect immediately
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 直接跳转到仪表板 / Direct redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error('Mock login failed')
      }
      
    } catch (err: any) {
      console.error('Quick login error:', err)
      setError(err.message || 'Quick login failed')
      setCurrentStep(AuthStep.ERROR)
    } finally {
      setIsLoading(false)
    }
  }

  // 重置认证流程 / Reset Authentication Flow
  const resetAuth = () => {
    setCurrentStep(AuthStep.CONNECT_WALLET)
    setError(null)
    setAuthMessage('')
  }

  // 获取步骤显示信息 / Get Step Display Info
  const getStepInfo = () => {
    switch (currentStep) {
      case AuthStep.CONNECT_WALLET:
        return {
          title: language === 'en' ? 'Connect Your Wallet' : '连接您的钱包',
          description: language === 'en' 
            ? 'Connect your Web3 wallet to access your FanForce AI dashboard'
            : '连接您的Web3钱包以访问FanForce AI仪表板',
          icon: '🔗'
        }
      case AuthStep.SIGN_MESSAGE:
        return {
          title: language === 'en' ? 'Sign Authentication Message' : '签署认证消息',
          description: language === 'en'
            ? 'Sign the message to verify your identity and access your account'
            : '签署消息以验证您的身份并访问您的账户',
          icon: '✍️'
        }
      case AuthStep.AUTHENTICATING:
        return {
          title: language === 'en' ? 'Authenticating...' : '正在认证...',
          description: language === 'en'
            ? 'Please wait while we verify your signature'
            : '请等待我们验证您的签名',
          icon: '🔄'
        }
      case AuthStep.SUCCESS:
        return {
          title: language === 'en' ? 'Authentication Successful' : '认证成功',
          description: language === 'en'
            ? 'Welcome to FanForce AI! Redirecting to your dashboard...'
            : '欢迎来到FanForce AI！正在跳转到您的仪表板...',
          icon: '✅'
        }
      case AuthStep.ERROR:
        return {
          title: language === 'en' ? 'Authentication Failed' : '认证失败',
          description: language === 'en'
            ? 'There was an error during authentication. Please try again.'
            : '认证过程中出现错误。请重试。',
          icon: '❌'
        }
      default:
        return {
          title: language === 'en' ? 'Unknown Step' : '未知步骤',
          description: '',
          icon: '❓'
        }
    }
  }

  const stepInfo = getStepInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 返回首页链接 / Back to Home Link */}
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="text-fanforce-gold hover:text-fanforce-secondary transition-colors"
          >
            ← {language === 'en' ? 'Back to Home' : '返回首页'}
          </Link>
        </div>

        {/* 主要登录卡片 / Main Login Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* 头部标题 / Header Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              <span className="text-fanforce-gold">FanForce</span>
              <span className="text-fanforce-secondary ml-1">AI</span>
            </h1>
            <p className="text-gray-300">
              {language === 'en' ? 'Campus Sports Prediction Platform' : '校园体育预测平台'}
            </p>
          </div>

          {/* 开发模式快速登录 / Development Mode Quick Login */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center">
                <span className="mr-2">⚡</span>
                {language === 'en' ? 'Development Mode - Quick Login' : '开发模式 - 快速登录'}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickLogin('super_admin')}
                  disabled={isLoading}
                  className="flex items-center justify-center p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded text-xs transition-colors"
                >
                  <span className="mr-1">👑</span>
                  {language === 'en' ? 'Super Admin' : '超级管理员'}
                </button>
                <button
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="flex items-center justify-center p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded text-xs transition-colors"
                >
                  <span className="mr-1">🔧</span>
                  {language === 'en' ? 'Admin' : '管理员'}
                </button>
                <button
                  onClick={() => handleQuickLogin('ambassador')}
                  disabled={isLoading}
                  className="flex items-center justify-center p-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded text-xs transition-colors"
                >
                  <span className="mr-1">🧑‍💼</span>
                  {language === 'en' ? 'Ambassador' : '大使'}
                </button>
                <button
                  onClick={() => handleQuickLogin('athlete')}
                  disabled={isLoading}
                  className="flex items-center justify-center p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-xs transition-colors"
                >
                  <span className="mr-1">🏃‍♂️</span>
                  {language === 'en' ? 'Athlete' : '运动员'}
                </button>
                <button
                  onClick={() => handleQuickLogin('audience')}
                  disabled={isLoading}
                  className="flex items-center justify-center p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-xs transition-colors"
                >
                  <span className="mr-1">🙋‍♂️</span>
                  {language === 'en' ? 'Audience' : '观众'}
                </button>
                <div className="flex items-center justify-center p-2 bg-gray-700 text-gray-300 rounded text-xs">
                  <span className="mr-1">ℹ️</span>
                  {language === 'en' ? 'Dev Only' : '仅开发'}
                </div>
              </div>
            </div>
          )}

          {/* 认证步骤显示 / Authentication Step Display */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{stepInfo.icon}</div>
            <h2 className="text-xl font-bold text-white mb-2">{stepInfo.title}</h2>
            <p className="text-gray-300 text-sm">{stepInfo.description}</p>
          </div>

          {/* 错误消息 / Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* 认证错误信息 / Authentication Error Info */}
          {authState.error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{authState.error}</p>
            </div>
          )}

          {/* 操作按钮 / Action Buttons */}
          <div className="space-y-4">
            {currentStep === AuthStep.CONNECT_WALLET && (
              <button
                onClick={handleConnectWallet}
                disabled={isLoading}
                className="w-full bg-fanforce-primary hover:bg-fanforce-secondary disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <span className="mr-2">🔗</span>
                )}
                {language === 'en' ? 'Connect Wallet' : '连接钱包'}
              </button>
            )}

            {currentStep === AuthStep.SIGN_MESSAGE && (
              <button
                onClick={handleSignMessage}
                disabled={isLoading}
                className="w-full bg-fanforce-primary hover:bg-fanforce-secondary disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <span className="mr-2">✍️</span>
                )}
                {language === 'en' ? 'Sign Message' : '签署消息'}
              </button>
            )}

            {currentStep === AuthStep.AUTHENTICATING && (
              <div className="w-full bg-gray-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {language === 'en' ? 'Authenticating...' : '正在认证...'}
              </div>
            )}

            {currentStep === AuthStep.SUCCESS && (
              <div className="w-full bg-green-600 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center">
                <span className="mr-2">✅</span>
                {language === 'en' ? 'Success! Redirecting...' : '成功！正在跳转...'}
              </div>
            )}

            {currentStep === AuthStep.ERROR && (
              <button
                onClick={resetAuth}
                className="w-full bg-fanforce-primary hover:bg-fanforce-secondary text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                <span className="mr-2">🔄</span>
                {language === 'en' ? 'Try Again' : '重试'}
              </button>
            )}
          </div>

          {/* 认证消息显示 / Authentication Message Display */}
          {authMessage && currentStep === AuthStep.SIGN_MESSAGE && (
            <div className="mt-6 bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-300 text-xs font-mono whitespace-pre-wrap">{authMessage}</p>
            </div>
          )}

          {/* 帮助信息 / Help Information */}
          <div className="mt-8 text-center">
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
    </div>
  )
} 