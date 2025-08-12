// FanForce AI - 简化邀请码显示组件
// Simplified Invite Code Display Component - 显示用户终身可用的邀请码
// Displays user's lifetime invite code

'use client'

import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { generateInviteCode, formatInviteCode, generateInviteLink, type InviteCode } from '../../utils/inviteCodeGenerator'

interface InviteCodeDisplayProps {
  userId: string
  userRole: string
  className?: string
}

export default function InviteCodeDisplay({ userId, userRole, className = '' }: InviteCodeDisplayProps) {
  const { language } = useLanguage()
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null)
  const [copied, setCopied] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 生成邀请码 / Generate invite code
  const handleGenerateInviteCode = () => {
    const newInviteCode = generateInviteCode(userId)
    setInviteCode(newInviteCode)
  }

  // 复制邀请码 / Copy invite code
  const handleCopyInviteCode = async () => {
    if (!inviteCode) return
    
    try {
      await navigator.clipboard.writeText(inviteCode.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy invite code:', error)
      // 降级方案：使用传统复制方法 / Fallback: use traditional copy method
      const textArea = document.createElement('textarea')
      textArea.value = inviteCode.code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 复制邀请链接 / Copy invite link
  const handleCopyInviteLink = async () => {
    if (!inviteCode) return
    
    const inviteLink = generateInviteLink(inviteCode.code)
    
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy invite link:', error)
      // 降级方案 / Fallback
      const textArea = document.createElement('textarea')
      textArea.value = inviteLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 分享邀请码 / Share invite code
  const handleShareInviteCode = async () => {
    if (!inviteCode) return
    
    const inviteLink = generateInviteLink(inviteCode.code)
    const shareText = language === 'en' 
      ? `Join FanForce AI with my invite code: ${inviteCode.code}. Welcome to the community!`
      : `使用我的邀请码加入FanForce AI：${inviteCode.code}。欢迎加入社区！`

    if (navigator.share) {
      try {
        await navigator.share({
          title: language === 'en' ? 'FanForce AI Invitation' : 'FanForce AI 邀请',
          text: shareText,
          url: inviteLink
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // 降级方案：复制到剪贴板 / Fallback: copy to clipboard
      handleCopyInviteLink()
    }
  }

  return (
    <div className={`bg-gradient-to-r from-fanforce-primary/20 to-fanforce-secondary/20 rounded-2xl p-6 border border-fanforce-primary/30 backdrop-blur-sm ${className}`}>
      {/* 标题和图标 / Title and Icon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-fanforce-gold to-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎁</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {language === 'en' ? 'Your Lifetime Invite Code' : '您的终身邀请码'}
            </h3>
            <p className="text-sm text-fanforce-gold">
              {language === 'en' ? 'Invite friends anytime!' : '随时邀请朋友！'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-fanforce-gold hover:text-white transition-colors duration-200"
        >
          <svg className={`w-6 h-6 transform transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 邀请码显示区域 / Invite Code Display Area */}
      {inviteCode ? (
        <div className="space-y-4">
          {/* 邀请码 / Invite Code */}
          <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">
                  {language === 'en' ? 'Your Invite Code' : '您的邀请码'}
                </p>
                <p className="text-2xl font-mono font-bold text-fanforce-gold tracking-wider">
                  {formatInviteCode(inviteCode.code)}
                </p>
              </div>
              <button
                onClick={handleCopyInviteCode}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-fanforce-primary hover:bg-fanforce-secondary text-white'
                }`}
              >
                {copied 
                  ? (language === 'en' ? 'Copied!' : '已复制!') 
                  : (language === 'en' ? 'Copy' : '复制')
                }
              </button>
            </div>
          </div>

          {/* 操作按钮 / Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleCopyInviteLink}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>{language === 'en' ? 'Copy Link' : '复制链接'}</span>
            </button>
            <button
              onClick={handleShareInviteCode}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-fanforce-primary to-fanforce-secondary hover:from-fanforce-secondary hover:to-fanforce-primary text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>{language === 'en' ? 'Share' : '分享'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 生成邀请码按钮 / Generate Invite Code Button */
        <div className="text-center">
          <p className="text-gray-300 mb-4">
            {language === 'en' 
              ? 'Generate your lifetime invite code to start inviting friends to the community!'
              : '生成您的终身邀请码，开始邀请朋友加入社区！'
            }
          </p>
          <button
            onClick={handleGenerateInviteCode}
            className="px-8 py-3 bg-gradient-to-r from-fanforce-primary to-fanforce-secondary hover:from-fanforce-secondary hover:to-fanforce-primary text-white font-medium rounded-xl transition-all duration-200 flex items-center mx-auto space-x-2"
          >
            <span>🎯</span>
            <span>{language === 'en' ? 'Generate Invite Code' : '生成邀请码'}</span>
          </button>
        </div>
      )}

      {/* 详细信息 / Detailed Information */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-white/20 space-y-4">
          <h4 className="text-white font-semibold mb-3">
            {language === 'en' ? 'How It Works' : '工作原理'}
          </h4>
          
          {/* 终身可用说明 / Lifetime Availability Explanation */}
          <div className="bg-gradient-to-r from-fanforce-gold/20 to-yellow-500/20 rounded-xl p-4 border border-fanforce-gold/30">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-fanforce-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-fanforce-dark text-sm font-bold">♾️</span>
              </div>
              <div>
                <h5 className="text-fanforce-gold font-semibold mb-1">
                  {language === 'en' ? 'Lifetime Availability' : '终身可用'}
                </h5>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {language === 'en' 
                    ? 'Your invite code is valid forever and can be used unlimited times. It\'s your permanent way to welcome new members to the FanForce AI community.'
                    : '您的邀请码永久有效，可以无限次使用。这是您欢迎新成员加入FanForce AI社区的永久方式。'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 简单易用说明 / Simple Usage Explanation */}
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">✨</span>
              </div>
              <div>
                <h5 className="text-blue-400 font-semibold mb-1">
                  {language === 'en' ? 'Simple & Easy' : '简单易用'}
                </h5>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {language === 'en' 
                    ? 'Just share your invite code with friends. They can use it during registration to join the platform. No complex rules or limitations.'
                    : '只需与朋友分享您的邀请码。他们可以在注册时使用它来加入平台。没有复杂的规则或限制。'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* 角色特定说明 / Role-Specific Information */}
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">🏆</span>
              </div>
              <div>
                <h5 className="text-green-400 font-semibold mb-1">
                  {language === 'en' ? `${userRole} Benefits` : `${userRole} 优势`}
                </h5>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {language === 'en' 
                    ? `As a ${userRole}, you have the privilege to invite new members to the community. Help grow the FanForce AI ecosystem!`
                    : `作为${userRole}，您有特权邀请新成员加入社区。帮助发展FanForce AI生态系统！`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
