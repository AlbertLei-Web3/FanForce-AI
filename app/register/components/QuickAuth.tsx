// FanForce AI - 快速登录组件
// Quick Authentication Component - 支持多种登录方式
// Supports multiple authentication methods

'use client'

import { useLanguage } from '../../context/LanguageContext'
import { useState } from 'react'

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
      await new Promise(resolve => setTimeout(resolve, 1500))
      
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
    setIsLoading('web3')
    try {
      // 检查是否安装了MetaMask / Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // 请求账户连接 / Request account connection
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        
        if (accounts.length > 0) {
          onAuthSuccess('web3', { 
            address: accounts[0],
            provider: 'MetaMask'
          })
        }
      } else {
        // 提示安装MetaMask / Prompt to install MetaMask
        alert(language === 'en' 
          ? 'Please install MetaMask to continue' 
          : '请安装MetaMask以继续'
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
    setIsLoading('icp')
    try {
      // 这里应该集成ICP身份验证逻辑 / Here should integrate ICP identity verification logic
      console.log('ICP login initiated')
      
      // 模拟成功登录 / Simulate successful login
      onAuthSuccess('icp', { 
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
    <div className={isModal ? "w-full" : "min-h-screen bg-gradient-to-br from-fanforce-dark via-blue-900 to-fanforce-primary flex items-center justify-center p-4"}>
      <div className="w-full max-w-md">
        {/* 返回按钮 / Back Button */}
        <button
          onClick={onBack}
          className={`mb-6 transition-colors duration-200 flex items-center space-x-2 ${
            isModal 
              ? 'text-white/80 hover:text-white' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">
            {language === 'en' ? 'Back' : '返回'}
          </span>
        </button>

        {/* 标题 / Title */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${
            isModal ? 'text-white' : 'text-white'
          }`}>
            {language === 'en' ? 'Quick Authentication' : '快速身份验证'}
          </h2>
          <p className={`text-sm ${
            isModal ? 'text-white/80' : 'text-white/80'
          }`}>
            {language === 'en' 
              ? 'Choose your preferred login method to continue' 
              : '选择您偏好的登录方式继续'}
          </p>
        </div>

        {/* 社交媒体登录选项 / Social Media Login Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading === 'google'}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isLoading === 'google'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {isLoading === 'google' ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{language === 'en' ? 'Continue with Google' : '使用Google继续'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleSocialLogin('x')}
            disabled={isLoading === 'x'}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isLoading === 'x'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 text-white hover:shadow-md'
            }`}
          >
            {isLoading === 'x' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-xl">𝕏</span>
                <span>{language === 'en' ? 'Continue with X' : '使用X继续'}</span>
              </>
            )}
          </button>
        </div>

        {/* 分隔线 / Divider */}
        <div className="flex items-center mb-6">
          <div className={`flex-1 h-px ${isModal ? 'bg-white/30' : 'bg-white/20'}`}></div>
          <span className={`px-4 text-sm ${isModal ? 'text-white/60' : 'text-white/60'}`}>
            {language === 'en' ? 'or' : '或者'}
          </span>
          <div className={`flex-1 h-px ${isModal ? 'bg-white/30' : 'bg-white/20'}`}></div>
        </div>

        {/* Web3和ICP登录选项 / Web3 and ICP Login Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleWeb3Login}
            disabled={isLoading === 'web3'}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isLoading === 'web3'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:shadow-md'
            }`}
          >
            {isLoading === 'web3' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-xl">🦊</span>
                <span>{language === 'en' ? 'Connect MetaMask' : '连接MetaMask'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleICPLogin}
            disabled={isLoading === 'icp'}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              isLoading === 'icp'
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:shadow-md'
            }`}
          >
            {isLoading === 'icp' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-xl">🌐</span>
                <span>{language === 'en' ? 'Connect ICP Identity' : '连接ICP身份'}</span>
              </>
            )}
          </button>
        </div>


      </div>
    </div>
  )
}
