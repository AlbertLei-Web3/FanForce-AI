// FanForce AI - 身份选择器组件
// Identity Selector Component - 第一步：选择用户主要身份角色
// Step 1: Select user's primary identity role

'use client'

import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { roleOptions } from './roleConfig'
import RoleCard from './RoleCard'
import RoleConfirmationModal from './RoleConfirmationModal'
import InvitationCodeModal from './InvitationCodeModal'
import AdminVerificationModal from './AdminVerificationModal'
import { IdentitySelectorProps } from './types'
import { getDashboardPath } from '../shared/utils'
import { generateInviteCode, formatInviteCode } from '../../../utils/inviteCodeGenerator'

export default function IdentitySelector({ 
  registrationState, 
  updateState, 
  onNext 
}: IdentitySelectorProps) {
  const { language } = useLanguage()
  
  // 角色确认弹窗状态 / Role confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
  // 邀请码弹窗状态 / Invitation code modal state
  const [showInviteModal, setShowInviteModal] = useState(false)
  
  // Admin验证码弹窗状态 / Admin verification code modal state
  const [showAdminModal, setShowAdminModal] = useState(false)
  
  // 用户自己的邀请码状态 / User's own invitation code state
  const [userInviteCode, setUserInviteCode] = useState<string | null>(null)

  // 处理角色选择 / Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    updateState({
      selectedPrimaryRole: role,
      errors: { ...registrationState.errors, primaryRole: undefined }
    })
    
    // 选择角色后显示确认弹窗 / Show confirmation modal after role selection
    setShowConfirmModal(true)
  }

  // 处理角色确认 / Handle role confirmation
  const handleRoleConfirm = () => {
    setShowConfirmModal(false)
    
    // 立即生成用户的邀请码 / Generate user's invitation code immediately
    const generatedCode = generateInviteCode('temp-user-id') // 临时用户ID，实际使用时应该传入真实用户ID
    setUserInviteCode(generatedCode.code)
    
    // 确认角色后显示邀请码弹窗 / Show invitation code modal after role confirmation
    setShowInviteModal(true)
  }

  // 处理角色确认取消 / Handle role confirmation cancellation
  const handleRoleCancel = () => {
    setShowConfirmModal(false)
    // 重置选中的角色 / Reset selected role
    updateState({
      selectedPrimaryRole: null,
      errors: { ...registrationState.errors, primaryRole: undefined }
    })
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
    <div className="space-y-8 px-4 backdrop-blur-sm -mt-12">
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

      {/* 用户邀请码显示卡片 / User Invitation Code Display Card */}
      {userInviteCode && (
        <div className="text-center animate-fadeIn mb-6">
          <div className="bg-gradient-to-r from-blue-500/15 to-indigo-600/15 rounded-2xl p-6 border border-blue-400/20 backdrop-blur-sm shadow-2xl shadow-blue-500/15">
                         {/* 金钱暗示图标 - 美元符号 / Money-suggesting Icon - Dollar sign */}
             <div className="flex items-center justify-center space-x-3 mb-4">
                               <div className="w-8 h-8 bg-gradient-to-r from-fanforce-gold to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-fanforce-dark" fill="currentColor" viewBox="0 0 24 24">
                    {/* 标准美元符号图标 / Standard dollar sign icon */}
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                  </svg>
                </div>
               <p className="text-white font-bold text-lg">
                 {language === 'en' ? 'Your Invitation Code' : '您的邀请码'}
               </p>
             </div>
             <p className="text-gray-300 text-sm mb-4">
               {language === 'en' 
                 ? 'Share your code with friends to earn rewards together!'
                 : '与朋友分享您的邀请码，一起获得奖励！'
               }
             </p>
             
             {/* 邀请码显示 - 关键信息使用象征金钱的黄色 / Invitation Code Display - Key info uses money-symbolizing gold */}
             <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
               <p className="text-gray-300 text-sm mb-2">
                 {language === 'en' ? 'Invite Code' : '邀请码'}
               </p>
               <div className="flex items-center justify-center space-x-2">
                 <code className="text-2xl font-mono font-bold text-fanforce-gold tracking-wider">
                   {formatInviteCode(userInviteCode)}
                 </code>
                 <button
                   onClick={() => navigator.clipboard.writeText(userInviteCode)}
                   className="ml-2 p-2 bg-fanforce-gold/20 hover:bg-fanforce-gold/30 rounded-lg transition-colors duration-200"
                   title={language === 'en' ? 'Copy to clipboard' : '复制到剪贴板'}
                 >
                   <svg className="w-5 h-5 text-fanforce-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                   </svg>
                 </button>
               </div>
             </div>
             
             {/* 描述性提示 - 只保留关键描述，使用象征金钱的黄色 / Descriptive Prompts - Only keep key description with money-symbolizing gold */}
             <div className="text-center">
               <div className="flex items-center justify-center space-x-2 text-fanforce-gold">
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
                 <span>{language === 'en' ? 'Invite friends to earn real rewards' : '邀请朋友获得真实奖金'}</span>
               </div>
             </div>
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

      {/* 角色确认弹窗 / Role Confirmation Modal */}
      <RoleConfirmationModal
        isOpen={showConfirmModal}
        selectedRole={registrationState.selectedPrimaryRole}
        onConfirm={handleRoleConfirm}
        onCancel={handleRoleCancel}
      />

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
