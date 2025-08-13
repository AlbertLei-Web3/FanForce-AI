// FanForce AI - 身份选择器组件
// Identity Selector Component - 第一步：选择用户主要身份角色
// Step 1: Select user's primary identity role

'use client'

import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { roleOptions } from './roleConfig'
import RoleCard from './RoleCard'
import InvitationCodeModal from './InvitationCodeModal'
import AdminVerificationModal from './AdminVerificationModal'
import { IdentitySelectorProps } from './types'
import { getDashboardPath } from '../shared/utils'

export default function IdentitySelector({ 
  registrationState, 
  updateState, 
  onNext 
}: IdentitySelectorProps) {
  const { language } = useLanguage()
  
  // 邀请码弹窗状态 / Invitation code modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  
  // Admin验证码弹窗状态 / Admin verification code modal state
  const [showAdminModal, setShowAdminModal] = useState(false)

  // 处理角色选择 / Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    updateState({
      selectedPrimaryRole: role,
      errors: { ...registrationState.errors, primaryRole: undefined }
    })
    
    // 选择角色后显示邀请码弹窗 / Show invitation code modal after role selection
    setShowInviteModal(true)
  }

  // 处理邀请码弹窗确认 / Handle invitation code modal confirmation
  const handleInviteCodeConfirm = (code: string) => {
    // 这里可以添加邀请码验证逻辑 / Add invitation code validation logic here
    setShowInviteModal(false)
    // 弹窗关闭后，用户需要点击start journey按钮继续 / After modal closes, user needs to click start journey button
  }

  // 处理邀请码弹窗跳过 / Handle invitation code modal skip
  const handleInviteCodeSkip = () => {
    setShowInviteModal(false)
    // 弹窗关闭后，用户需要点击start journey按钮继续 / After modal closes, user needs to click start journey button
  }

  // 处理管理员验证 / Handle admin verification
  const handleAdminVerify = (code: string) => {
    // 验证成功后直接跳转到大使dashboard / After successful verification, go directly to ambassador dashboard
    window.location.href = getDashboardPath(UserRole.AMBASSADOR)
  }

  // 处理继续按钮点击 / Handle continue button click
  const handleContinue = () => {
    if (registrationState.selectedPrimaryRole) {
      // 如果是大使角色，需要验证admin码 / If ambassador role, need admin verification
      if (registrationState.selectedPrimaryRole === UserRole.AMBASSADOR) {
        setShowAdminModal(true)
      } else {
        // 其他角色直接跳转到对应的dashboard页面 / Other roles go directly to their dashboard
        const dashboardPath = getDashboardPath(registrationState.selectedPrimaryRole)
        
        // 使用window.location.href进行页面跳转 / Use window.location.href for navigation
        window.location.href = dashboardPath
      }
    }
  }

  return (
    <div className="space-y-8 px-4 backdrop-blur-sm">
      {/* 步骤标题 / Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          {language === 'en' ? 'Choose Your Identity' : '选择您的身份'}
        </h2>
        <p className="text-gray-300 text-lg drop-shadow">
          {language === 'en' 
            ? 'Select your primary role in the FanForce AI community ecosystem'
            : '在FanForce AI社区生态系统中选择您的主要角色'
          }
        </p>
        {registrationState.errors.primaryRole && (
          <p className="text-red-400 text-sm mt-2">
            {registrationState.errors.primaryRole}
          </p>
        )}
      </div>

      {/* 角色选择成功提示（显示在卡片上方）/ Role Selection Success Toast (shown above cards) */}
      {registrationState.selectedPrimaryRole && (
        <div className="text-center animate-fadeIn mb-6">
          <div className="bg-gradient-to-r from-blue-500/15 to-indigo-600/15 rounded-2xl p-6 border border-blue-400/20 backdrop-blur-sm shadow-2xl shadow-blue-500/15">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white font-bold text-lg">
                {language === 'en' ? 'Role Selected!' : '角色已选择！'}
              </p>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {language === 'en' 
                ? `You've selected ${roleOptions.find(opt => opt.role === registrationState.selectedPrimaryRole)?.title.en}. Ready to continue?`
                : `您已选择${roleOptions.find(opt => opt.role === registrationState.selectedPrimaryRole)?.title.cn}。准备继续吗？`
              }
            </p>
            <button
              onClick={handleContinue}
              className="
                inline-flex items-center space-x-3 px-10 py-4
                bg-gradient-to-r from-blue-500 to-indigo-600 
                hover:from-blue-600 hover:to-indigo-700
                text-white font-bold rounded-xl text-lg
                shadow-2xl shadow-blue-500/40
                transition-all duration-300 transform hover:scale-105 hover:-translate-y-1
                border border-blue-400/30
                animate-bounce-custom
              "
            >
              <span>
                {language === 'en' ? 'Start Journey' : '开始旅程'}
              </span>
              <div className="bg-white/20 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 角色选项网格 / Role Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto backdrop-blur-sm">
        {/* 移动端：单列布局，更好的触控体验 */}
        {/* 平板端：双列布局，适中的卡片大小 */}
        {/* 桌面端：三列布局，完美的视觉平衡 */}
        {roleOptions.map((option) => (
          <RoleCard
            key={option.role}
            option={option}
            isSelected={registrationState.selectedPrimaryRole === option.role}
            onSelect={handleRoleSelect}
          />
        ))}
      </div>

      {/* 帮助信息 / Help Information */}
      <div className="bg-gradient-to-r from-white/3 to-white/6 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-fanforce-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="text-fanforce-gold text-2xl">💡</div>
          </div>
          <div className="text-sm text-gray-300 flex-1">
            <h4 className="font-bold text-white mb-2 text-base">
              {language === 'en' ? 'Not sure which role fits you?' : '不确定哪个角色适合您？'}
            </h4>
            <p className="leading-relaxed">
              {language === 'en' 
                ? 'Don\'t worry! You can add additional roles in the next step to access multiple features and earn from different participation methods.'
                : '别担心！您可以在下一步添加其他角色，以访问多种功能并通过不同的参与方式获得收益。'
              }
            </p>
            <div className="mt-3 flex items-center space-x-2 text-xs text-fanforce-gold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {language === 'en' ? 'Multi-role selection available in step 3' : '第3步可进行多角色选择'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 邀请码弹窗 / Invitation Code Modal */}
      <InvitationCodeModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onConfirm={handleInviteCodeConfirm}
        onSkip={handleInviteCodeSkip}
      />

      {/* Admin验证码弹窗 / Admin Verification Code Modal */}
      <AdminVerificationModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerify={handleAdminVerify}
      />
    </div>
  )
}
