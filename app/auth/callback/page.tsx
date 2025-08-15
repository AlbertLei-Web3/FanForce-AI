// FanForce AI - OAuth回调处理页面
// OAuth Callback Handler Page - 处理OAuth成功后的重定向
// Handles redirect after successful OAuth authentication

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuthState } = useUser()
  const { language } = useLanguage()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 从URL参数获取认证信息 / Get authentication info from URL parameters
        const token = searchParams.get('token')
        const authType = searchParams.get('authType')
        const errorParam = searchParams.get('error')

        console.log('🔐 OAuth回调参数:', { token, authType, error: errorParam })

        // 检查是否有错误 / Check for errors
        if (errorParam) {
          console.error('❌ OAuth认证失败:', errorParam)
          setError(errorParam)
          setIsProcessing(false)
          return
        }

        // 检查必要参数 / Check required parameters
        if (!token || !authType) {
          console.error('❌ 缺少必要的OAuth参数')
          setError('Missing required OAuth parameters')
          setIsProcessing(false)
          return
        }

        // 验证token并获取用户信息 / Validate token and get user info
        console.log('🔍 验证OAuth token:', token)
        
        // 调用API验证token并获取用户信息 / Call API to validate token and get user info
        const verifyResponse = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token, authType })
        })

        if (!verifyResponse.ok) {
          throw new Error('Token verification failed')
        }

        const verifyResult = await verifyResponse.json()
        console.log('✅ Token验证结果:', verifyResult)

        if (!verifyResult.success) {
          throw new Error(verifyResult.error || 'Token verification failed')
        }

        const userData = {
          ...verifyResult.user,
          authType: authType,
          provider: authType,
          isNewUser: verifyResult.isNewUser
        }

        // 设置认证状态 / Set authentication state
        setAuthState({
          isAuthenticated: true,
          user: userData,
          token: token,
          isLoading: false
        })

        console.log('✅ OAuth认证成功，用户数据:', userData)

        // 重定向到注册流程的身份选择步骤 / Redirect to identity selection step in registration flow
        router.push('/register?step=identity')

      } catch (error) {
        console.error('❌ 处理OAuth回调时出错:', error)
        setError('Failed to process OAuth callback')
        setIsProcessing(false)
      }
    }

    handleCallback()
  }, [searchParams, setAuthState, router])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fanforce-gold mb-4 mx-auto"></div>
          <p className="text-white">
            {language === 'en' ? 'Processing authentication...' : '正在处理认证...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              {language === 'en' ? 'Authentication Failed' : '认证失败'}
            </h2>
            <p className="text-red-300 mb-6">
              {language === 'en' ? 'Error: ' : '错误: '}{error}
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-fanforce-gold hover:bg-fanforce-secondary text-black font-medium py-3 px-6 rounded-xl transition-colors"
            >
              {language === 'en' ? 'Try Again' : '重试'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
