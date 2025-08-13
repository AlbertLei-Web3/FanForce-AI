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
    <div className={isModal ? "w-full flex justify-center" : "min-h-screen flex items-center justify-center p-4"}>
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
        <div className="text-center mb-8 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {language === 'en' ? 'Welcome Back!' : '欢迎回来！'}
          </h2>
          <p className="text-gray-300 drop-shadow">
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
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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

          {/* X (Twitter) 登录 / X (Twitter) Login - 修复Facebook为X */}
          <button
            onClick={() => handleSocialLogin(AUTH_PROVIDERS.TWITTER)}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === AUTH_PROVIDERS.TWITTER ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            )}
            <span>
              {isLoading === AUTH_PROVIDERS.TWITTER 
                ? (language === 'en' ? 'Signing in...' : '登录中...')
                : (language === 'en' ? 'Continue with X' : '使用X继续')
              }
            </span>
          </button>

          {/* Web3钱包登录 / Web3 Wallet Login - 使用简洁白色钱包图标 */}
          <button
            onClick={handleWeb3Login}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === AUTH_PROVIDERS.WEB3 ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {/* 简洁白色钱包图标 / Clean White Wallet Icon */}
                
                {/* 钱包主体 / Wallet Body */}
                <rect x="3" y="7" width="18" height="10" rx="2" stroke="white" fill="none"/>
                
                {/* 钱包开口 / Wallet Opening */}
                <path d="M21 9H17C15.9 9 15 9.9 15 11V13C15 14.1 15.9 15 17 15H21" stroke="white" fill="none"/>
                
                {/* 钱包顶部装饰线 / Wallet Top Decoration */}
                <line x1="3" y1="9" x2="21" y2="9" stroke="white" strokeWidth="1"/>
                
                {/* 内部卡片 / Internal Card */}
                <rect x="5" y="10.5" width="8" height="5" rx="0.5" stroke="white" fill="none" opacity="0.8"/>
                
                {/* 卡片芯片 / Card Chip */}
                <rect x="6.5" y="11.5" width="1.5" height="2.5" rx="0.25" stroke="white" fill="none"/>
                
                {/* 卡片条纹 / Card Stripes */}
                <line x1="9" y1="11.8" x2="12" y2="11.8" stroke="white" opacity="0.6"/>
                <line x1="9" y1="12.5" x2="11.5" y2="12.5" stroke="white" opacity="0.6"/>
                <line x1="9" y1="13.2" x2="12" y2="13.2" stroke="white" opacity="0.6"/>
                
                {/* 钱包扣子 / Wallet Buckle */}
                <circle cx="19.5" cy="12" r="0.8" stroke="white" fill="none"/>
                <circle cx="19.5" cy="12" r="0.3" stroke="white" fill="none"/>
              </svg>
            )}
            <span>
              {isLoading === AUTH_PROVIDERS.WEB3 
                ? (language === 'en' ? 'Connecting...' : '连接中...')
                : (language === 'en' ? 'Connect Web3 Wallet' : '连接web3钱包')
              }
            </span>
          </button>

          {/* ICP登录 / ICP Login - 使用官方ICP图标 */}
          <button
            onClick={handleICPLogin}
            disabled={isLoading !== null}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === AUTH_PROVIDERS.ICP ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 85 40" fill="none">
                {/* 从官方ICP SVG提取的莫比乌斯之环图标 / Extracted Mobius Strip from Official ICP SVG */}
                <path d="M69.5606 33.234C63.7777 33.234 57.6722 29.4534 54.6754 26.711C51.3977 23.7104 42.3941 13.9438 42.3543 13.9002C36.4499 7.31258 28.511 0 20.5911 0C11.0523 0 2.73196 6.60657 0.568359 15.3578C0.733476 14.7808 3.76631 6.76409 15.1499 6.76409C20.9328 6.76409 27.0383 10.5447 30.035 13.2872C33.3127 16.2877 42.3163 26.0543 42.3562 26.0979C48.2605 32.6855 56.1994 39.9981 64.1212 39.9981C73.66 39.9981 81.9785 33.3915 84.144 24.6404C83.9789 25.2173 80.946 33.234 69.5625 33.234H69.5606Z" fill="#29AAE1"/>
                <path d="M42.3534 26.0998C42.3326 26.0752 39.74 23.2644 36.8325 20.1974C35.261 22.063 32.9968 24.6043 30.3948 26.8837C25.5438 31.1349 22.3914 32.027 20.5884 32.027C13.7864 32.027 8.23691 26.6312 8.23691 20C8.23691 13.3688 13.7788 8.01481 20.5884 7.97306C20.8351 7.97306 21.135 7.99773 21.4956 8.06226C19.4497 7.27653 17.2766 6.7641 15.1471 6.7641C3.76737 6.7641 0.73454 14.777 0.567525 15.3578C0.199334 16.8495 0.00195312 18.402 0.00195312 20C0.00195312 31.0287 9.09855 40 20.4423 40C25.1718 40 30.4688 37.5764 35.9234 32.7937C38.5026 30.5333 40.7383 28.1154 42.418 26.172C42.3971 26.1473 42.3743 26.1245 42.3534 26.0998Z" fill="url(#paint0_linear_icp)"/>
                <path d="M42.3536 13.9002C42.3745 13.9248 44.967 16.7356 47.8746 19.8026C49.446 17.937 51.7102 15.3957 54.3122 13.1163C59.1632 8.86506 62.3156 7.97305 64.1186 7.97305C70.9207 7.97305 76.4701 13.3688 76.4701 20C76.4701 26.5933 70.9283 31.9852 64.1186 32.027C63.8719 32.027 63.572 32.0023 63.2114 31.9377C65.2574 32.7235 67.4305 33.2359 69.5599 33.2359C80.9416 33.2359 83.9744 25.223 84.1414 24.6422C84.5096 23.1505 84.707 21.598 84.707 20C84.707 8.97134 75.4623 0 64.1186 0C59.3891 0 54.2401 2.42361 48.7837 7.2063C46.2044 9.46669 43.9687 11.8846 42.2891 13.8281C42.3099 13.8527 42.3327 13.8755 42.3536 13.9002Z" fill="url(#paint1_linear_icp)"/>
                <defs>
                  <linearGradient id="paint0_linear_icp" x1="31.2622" y1="37.3828" x2="3.40487" y2="8.53484" gradientUnits="userSpaceOnUse">
                    <stop offset="0.22" stopColor="#EC1E79"/>
                    <stop offset="0.89" stopColor="#522784"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_icp" x1="53.4278" y1="2.63428" x2="81.2851" y2="31.4823" gradientUnits="userSpaceOnUse">
                    <stop offset="0.21" stopColor="#F05A24"/>
                    <stop offset="0.68" stopColor="#FAAF3B"/>
                  </linearGradient>
                </defs>
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
