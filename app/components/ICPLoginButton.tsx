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
  FaExclamationTriangle,
  FaShieldAlt,
  FaClipboardList,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'
import { InviteCodeVerification } from '@/app/utils/icpService'

interface ICPLoginButtonProps {
  onSuccess?: (principalId: string) => void
  onError?: (error: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  showVerificationStatus?: boolean
  showInviteCodeVerification?: boolean
  showOperationLogs?: boolean
}

export default function ICPLoginButton({
  onSuccess,
  onError,
  className = '',
  size = 'md',
  variant = 'primary',
  showVerificationStatus = false,
  showInviteCodeVerification = false,
  showOperationLogs = false
}: ICPLoginButtonProps) {
  const { 
    authState, 
    verificationState, 
    operationLogState,
    login, 
    verifyIdentity, 
    verifyInviteCode,
    refreshOperationLogs,
    logOperation
  } = useICP()
  const { language } = useLanguage()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [verificationResult, setVerificationResult] = useState<InviteCodeVerification | null>(null)

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
      
      const result = await login()
      
      if (result) {
        console.log('✅ ICP身份登录成功，Principal ID:', result)
        onSuccess?.(result)
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

  // 处理身份验证 / Handle identity verification
  const handleVerifyIdentity = async () => {
    try {
      const result = await verifyIdentity()
      console.log('身份验证结果:', result)
    } catch (error) {
      console.error('身份验证失败:', error)
    }
  }

  // 处理邀请码验证 / Handle invite code verification
  const handleVerifyInviteCode = async () => {
    if (!inviteCode.trim()) {
      alert('请输入邀请码')
      return
    }
    
    try {
      const result = await verifyInviteCode(inviteCode)
      setVerificationResult(result)
      console.log('邀请码验证结果:', result)
    } catch (error) {
      console.error('邀请码验证失败:', error)
    }
  }

  // 处理操作日志刷新 / Handle operation logs refresh
  const handleRefreshLogs = async () => {
    try {
      await refreshOperationLogs()
    } catch (error) {
      console.error('刷新操作日志失败:', error)
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

  // 格式化时间戳 / Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  return (
    <div className="space-y-4">
      {/* 主登录按钮 / Main Login Button */}
      <button
        onClick={handleLogin}
        disabled={getButtonState() === 'disabled'}
        className={getButtonStyles()}
        title={language === 'en' ? 'Login with Internet Computer Identity' : '使用互联网计算机身份登录'}
      >
        {getButtonContent()}
      </button>

      {/* 扩展功能区域 / Extended Features Area */}
      {authState.isAuthenticated && (
        <div className="space-y-4">
          {/* 状态切换按钮 / Status Toggle Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {showDetails ? <FaEyeSlash /> : <FaEye />}
            {showDetails ? '隐藏详情' : '显示详情'}
          </button>

          {/* 详细状态信息 / Detailed Status Information */}
          {showDetails && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              {/* 身份验证状态 / Identity Verification Status */}
              {showVerificationStatus && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FaShieldAlt className="text-green-600" />
                    身份验证状态 / Identity Verification Status
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span>验证状态:</span>
                    <span className={verificationState.isVerified ? 'text-green-600' : 'text-red-600'}>
                      {verificationState.isVerified ? '✅ 已验证' : '❌ 未验证'}
                    </span>
                    <span>最后验证:</span>
                    <span>{verificationState.lastVerified ? formatTimestamp(verificationState.lastVerified) : 'N/A'}</span>
                  </div>
                  {verificationState.verificationError && (
                    <p className="text-red-600 text-sm">错误: {verificationState.verificationError}</p>
                  )}
                  <button
                    onClick={handleVerifyIdentity}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    🔍 验证身份
                  </button>
                </div>
              )}

              {/* 邀请码验证 / Invite Code Verification */}
              {showInviteCodeVerification && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">🎫 邀请码验证 / Invite Code Verification</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="输入邀请码 (如: FF-ABC123)"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleVerifyInviteCode}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                    >
                      验证
                    </button>
                  </div>
                  
                  {verificationResult && (
                    <div className="p-2 bg-white rounded border text-xs">
                      <div className="grid grid-cols-2 gap-1">
                        <span>邀请码:</span>
                        <span>{verificationResult.code}</span>
                        <span>有效性:</span>
                        <span className={verificationResult.isValid ? 'text-green-600' : 'text-red-600'}>
                          {verificationResult.isValid ? '✅ 有效' : '❌ 无效'}
                        </span>
                        <span>邀请人角色:</span>
                        <span>{verificationResult.inviterRole || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 操作日志 / Operation Logs */}
              {showOperationLogs && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <FaClipboardList className="text-blue-600" />
                      操作日志 / Operation Logs
                    </h3>
                    <button
                      onClick={handleRefreshLogs}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      刷新
                    </button>
                  </div>
                  
                  {operationLogState.isLoading ? (
                    <p className="text-xs text-gray-600">⏳ 加载中...</p>
                  ) : operationLogState.error ? (
                    <p className="text-xs text-red-600">❌ 错误: {operationLogState.error}</p>
                  ) : (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {operationLogState.operations.length === 0 ? (
                        <p className="text-xs text-gray-600">暂无操作日志</p>
                      ) : (
                        operationLogState.operations.slice(0, 3).map((log, index) => (
                          <div key={index} className="p-2 bg-white rounded border text-xs">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{log.action}</span>
                              <span className={`text-xs px-1 rounded ${
                                log.status === 'success' ? 'bg-green-100 text-green-800' : 
                                log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            <p className="text-gray-600">{formatTimestamp(log.timestamp)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
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

// 增强的ICP登录按钮 / Enhanced ICP Login Button
export function EnhancedICPLoginButton({ onSuccess, onError }: {
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
      showVerificationStatus={true}
      showInviteCodeVerification={true}
      showOperationLogs={true}
    />
  )
}

