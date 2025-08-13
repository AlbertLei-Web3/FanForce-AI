// FanForce AI - 邀请码弹窗组件
// Invitation Code Modal Component - 用户选择身份后弹出的邀请码输入窗口

'use client'

import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { InvitationCodeModalProps } from './types'

export default function InvitationCodeModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onSkip 
}: InvitationCodeModalProps) {
  const { language } = useLanguage()
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  // 处理确认按钮点击 / Handle confirm button click
  const handleConfirm = () => {
    // 这里可以添加邀请码验证逻辑 / Add invitation code validation logic here
    if (inviteCode.trim() || true) { // 暂时允许空邀请码 / Temporarily allow empty invitation code
      onConfirm(inviteCode)
      setInviteCode('')
      setError('')
    } else {
      setError(language === 'en' ? 'Please enter a valid invitation code' : '请输入有效的邀请码')
    }
  }

  // 处理跳过按钮点击 / Handle skip button click
  const handleSkip = () => {
    onSkip()
    setInviteCode('')
    setError('')
  }

  // 如果弹窗未打开，不渲染任何内容 / If modal is not open, don't render anything
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-white/20 shadow-2xl max-w-md w-full mx-4 transform -translate-y-40">
        {/* 弹窗标题 / Modal Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎫</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {language === 'en' ? 'Invitation Code' : '邀请码'}
          </h3>
          <p className="text-gray-300 text-sm">
            {language === 'en' 
              ? 'Do you have an invitation code? (Optional)'
              : '您有邀请码吗？（可选）'
            }
          </p>
        </div>
        
        {/* 邀请码输入框 / Invitation Code Input */}
        <div className="mb-6">
          <label className="block text-white text-sm font-medium mb-2">
            {language === 'en' ? 'Invitation Code' : '邀请码'}
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder={language === 'en' ? 'Enter invitation code (optional)' : '请输入邀请码（可选）'}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>
        
        {/* 弹窗按钮 / Modal Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-200"
          >
            {language === 'en' ? 'Skip' : '跳过'}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200"
          >
            {language === 'en' ? 'Confirm' : '确认'}
          </button>
        </div>
      </div>
    </div>
  )
}
