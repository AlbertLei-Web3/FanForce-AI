// FanForce AI - ICP Login Button Component / FanForce AI - ICP登录按钮组件
// Button component for ICP Internet Identity login / ICP Internet Identity登录按钮组件
// Can be integrated into existing login pages / 可以集成到现有登录页面

'use client'

import { useState } from 'react'
import { useICP } from '@/app/context/ICPContext'
import { useLanguage } from '@/app/context/LanguageContext'
import { 
  FaNetworkWired, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from 'react-icons/fa'

interface ICPLoginButtonProps {
  onSuccess?: (principalId: string) => void
  onError?: (error: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
}

export default function ICPLoginButton({
  onSuccess,
  onError,
  className = '',
  size = 'md',
  variant = 'primary'
}: ICPLoginButtonProps) {
  const { authState, login } = useICP()
  const { language } = useLanguage()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // 处理登录点击 / Handle login click
  const handleLogin = async () => {
    if (authState.isAuthenticated) {
      console.log('✅ 用户已通过ICP身份认证 / User already authenticated with ICP')
      onSuccess?.(authState.principalId!)
      return
    }

    try {
      setIsLoggingIn(true)
      console.log('🔐 开始ICP身份登录 / Starting ICP Identity login...')
      
      const success = await login()
      
      if (success && authState.principalId) {
        console.log('✅ ICP身份登录成功 / ICP Identity login successful')
        onSuccess?.(authState.principalId)
      } else {
        console.error('❌ ICP身份登录失败 / ICP Identity login failed')
        onError?.('Login failed')
      }
    } catch (error) {
      console.error('❌ ICP登录过程中出错 / Error during ICP login:', error)
      onError?.(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // 获取按钮样式 / Get button styles
  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }
    
    const variantStyles = {
      primary: 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white focus:ring-purple-500'
    }
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`
  }

  // 获取按钮内容 / Get button content
  const getButtonContent = () => {
    if (authState.isAuthenticated) {
      return (
        <>
          <FaCheckCircle className="mr-2" />
          {language === 'en' ? 'ICP Connected' : 'ICP已连接'}
        </>
      )
    }
    
    if (isLoggingIn || authState.isLoading) {
      return (
        <>
          <FaSpinner className="mr-2 animate-spin" />
          {language === 'en' ? 'Connecting...' : '连接中...'}
        </>
      )
    }
    
    if (authState.error) {
      return (
        <>
          <FaExclamationTriangle className="mr-2" />
          {language === 'en' ? 'Retry ICP Login' : '重试ICP登录'}
        </>
      )
    }
    
    return (
      <>
        <FaNetworkWired className="mr-2" />
        {language === 'en' ? 'Login with ICP' : 'ICP身份登录'}
      </>
    )
  }

  // 获取按钮状态 / Get button state
  const getButtonState = () => {
    if (authState.isAuthenticated) {
      return 'disabled'
    }
    
    if (isLoggingIn || authState.isLoading) {
      return 'disabled'
    }
    
    return 'enabled'
  }

  return (
    <button
      onClick={handleLogin}
      disabled={getButtonState() === 'disabled'}
      className={getButtonStyles()}
      title={language === 'en' ? 'Login with Internet Computer Identity' : '使用互联网计算机身份登录'}
    >
      {getButtonContent()}
    </button>
  )
}

// 简化的ICP登录按钮 / Simplified ICP Login Button
export function SimpleICPLoginButton({ onSuccess, onError }: {
  onSuccess?: (principalId: string) => void
  onError?: (error: string) => void
}) {
  return (
    <ICPLoginButton
      onSuccess={onSuccess}
      onError={onError}
      variant="primary"
      size="md"
      className="w-full"
    />
  )
}

