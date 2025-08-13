// FanForce AI - 管理员验证弹窗组件
// Admin Verification Modal Component - 大使角色需要管理员验证码

'use client'

import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { AdminVerificationModalProps } from './types'

export default function AdminVerificationModal({ 
  isOpen, 
  onClose, 
  onVerify 
}: AdminVerificationModalProps) {
  const { language } = useLanguage()
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')

  // 处理验证按钮点击 / Handle verify button click
  const handleVerify = () => {
    // 这里可以添加实际的admin码验证逻辑 / Add actual admin code verification logic here
    if (adminCode === 'admin123') { // 示例验证码，实际应该从后端验证 / Example code, should verify from backend
      onVerify(adminCode)
      setAdminCode('')
      setError('')
    } else {
      setError(language === 'en' ? 'Invalid admin code' : '验证码无效')
    }
  }

  // 处理取消按钮点击 / Handle cancel button click
  const handleCancel = () => {
    onClose()
    setAdminCode('')
    setError('')
  }

  // 如果弹窗未打开，不渲染任何内容 / If modal is not open, don't render anything
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
        {/* 弹窗标题 / Modal Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {language === 'en' ? 'Admin Verification Required' : '需要管理员验证'}
          </h3>
          <p className="text-gray-300 text-sm">
            {language === 'en' 
              ? 'Ambassador role requires admin verification code'
              : '大使角色需要管理员验证码'
            }
          </p>
        </div>
        
        {/* 验证码输入框 / Verification Code Input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            {language === 'en' ? 'Admin Code' : '管理员验证码'}
          </label>
          <input
            type="password"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder={language === 'en' ? 'Enter admin code' : '请输入管理员验证码'}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>
        
        {/* 弹窗按钮 / Modal Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-200"
          >
            {language === 'en' ? 'Cancel' : '取消'}
          </button>
          <button
            onClick={handleVerify}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all duration-200"
          >
            {language === 'en' ? 'Verify' : '验证'}
          </button>
        </div>
      </div>
    </div>
  )
}
