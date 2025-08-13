// FanForce AI - 快速登录组件
// Quick Authentication Component - 支持多种登录方式
// Supports multiple authentication methods

'use client'

import { useLanguage } from '../../context/LanguageContext'
import { useState } from 'react'
import { AUTH_PROVIDERS, LOADING_DELAYS, ERROR_MESSAGES } from './shared/constants'
import { delay } from './shared/utils'

interface QuickAuthProps {
  onAuthSuccess: (authMethod: string, userData?: any) => void
  onBack: () => void
  isModal?: boolean // 新增：是否在模态窗口中显示 / New: whether displayed in modal
}

export default function QuickAuth({ onAuthSuccess, onBack, isModal = false }: QuickAuthProps) {
  const { language } = useLanguage()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // 处理社交媒体登录 / Handle social media login
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider)
    try {
      // 模拟登录过程 / Simulate login process
      await delay(LOADING_DELAYS.SOCIAL_LOGIN)
      
      // 这里应该集成实际的OAuth登录逻辑 / Here should integrate actual OAuth login logic
      console.log(`${provider} login initiated`)
      
      // 模拟成功登录 / Simulate successful login
      onAuthSuccess(provider, { 
        provider, 
        email: `user@${provider}.com`,
        name: `User from ${provider}`
      })
    } catch (error) {
      console.error(`${provider} login failed:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  // 处理Web3钱包登录 / Handle Web3 wallet login
  const handleWeb3Login = async () => {
    setIsLoading(AUTH_PROVIDERS.WEB3)
    try {
      // 检查是否安装了MetaMask / Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // 请求账户连接 / Request account connection
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts.length > 0) {
          onAuthSuccess(AUTH_PROVIDERS.WEB3, { 
            address: accounts[0],
            provider: 'MetaMask'
          })
        }
      } else {
        // 提示安装MetaMask / Prompt to install MetaMask
        alert(language === 'en' 
          ? ERROR_MESSAGES.METAMASK_NOT_INSTALLED.en
          : ERROR_MESSAGES.METAMASK_NOT_INSTALLED.cn
        )
      }
    } catch (error) {
      console.error('Web3 login failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  // 处理ICP登录 / Handle ICP login
  const handleICPLogin = async () => {
    setIsLoading(AUTH_PROVIDERS.ICP)
    try {
      // 这里应该集成ICP身份验证逻辑 / Here should integrate ICP identity verification logic
      console.log('ICP login initiated')
      
      // 模拟成功登录 / Simulate successful login
      onAuthSuccess(AUTH_PROVIDERS.ICP, { 
        provider: 'ICP',
        identity: 'icp-identity-123'
      })
    } catch (error) {
      console.error('ICP login failed:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className={isModal ? "w-full flex justify-center" : "min-h-screen bg-gradient-to-br from-fanforce-dark via-blue-900 to-fanforce-primary flex items-center justify-center p-4"}>
      <div className={`${isModal ? 'w-full max-w-sm mx-auto flex flex-col items-center' : 'w-full max-w-md'}`}>
        {/* 返回按钮 / Back Button */}
        <button
          onClick={onBack}
          className={`${isModal ? 'mb-3' : 'mb-6'} transition-colors duration-200 flex items-center space-x-2 ${
            isModal 
              ? 'text-white/80 hover:text-white' 
              : 'text-fanforce-gold hover:text-fanforce-secondary'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{language === 'en' ? 'Back' : '返回'}</span>
        </button>

        {/* 标题 / Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {language === 'en' ? 'Welcome Back!' : '欢迎回来！'}
          </h2>
          <p className="text-gray-300">
            {language === 'en' 
              ? 'Choose your preferred login method' 
              : '选择您偏好的登录方式'
            }
          </p>
        </div>

        {/* 登录选项 / Login Options */}
        <div className="space-y-4">
          {/* Google登录 / Google Login */}
          <button
            onClick={() => handleSocialLogin(AUTH_PROVIDERS.GOOGLE)}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === AUTH_PROVIDERS.GOOGLE ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>
              {isLoading === AUTH_PROVIDERS.GOOGLE 
                ? (language === 'en' ? 'Signing in...' : '登录中...')
                : (language === 'en' ? 'Continue with Google' : '使用Google继续')
              }
            </span>
          </button>

          {/* Facebook登录 / Facebook Login */}
          <button
            onClick={() => handleSocialLogin(AUTH_PROVIDERS.FACEBOOK)}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === AUTH_PROVIDERS.FACEBOOK ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            <span>
              {isLoading === AUTH_PROVIDERS.FACEBOOK 
                ? (language === 'en' ? 'Signing in...' : '登录中...')
                : (language === 'en' ? 'Continue with Facebook' : '使用Facebook继续')
              }
            </span>
          </button>

          {/* Web3钱包登录 / Web3 Wallet Login */}
          <button
            onClick={handleWeb3Login}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === AUTH_PROVIDERS.WEB3 ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
            <span>
              {isLoading === AUTH_PROVIDERS.WEB3 
                ? (language === 'en' ? 'Connecting...' : '连接中...')
                : (language === 'en' ? 'Connect Web3 Wallet' : '连接Web3钱包')
              }
            </span>
          </button>

          {/* ICP登录 / ICP Login */}
          <button
            onClick={handleICPLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === AUTH_PROVIDERS.ICP ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            )}
            <span>
              {isLoading === AUTH_PROVIDERS.ICP 
                ? (language === 'en' ? 'Connecting...' : '连接中...')
                : (language === 'en' ? 'Connect ICP Identity' : '连接ICP身份')
              }
            </span>
          </button>
        </div>

        {/* 帮助信息 / Help Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {language === 'en' 
              ? 'By continuing, you agree to our Terms of Service and Privacy Policy'
              : '继续即表示您同意我们的服务条款和隐私政策'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
