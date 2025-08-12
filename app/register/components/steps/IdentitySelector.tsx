// FanForce AI - 身份选择器组件
// Identity Selector Component - 第一步：选择用户主要身份角色
// Step 1: Select user's primary identity role

'use client'

import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { RegistrationState } from '../RegistrationWizard'
import InviteCodeDisplay from '../../../components/shared/InviteCodeDisplay'

interface IdentitySelectorProps {
  registrationState: RegistrationState
  updateState: (updates: Partial<RegistrationState>) => void
  onNext: () => void
}

// 角色选项配置 / Role Options Configuration  
// 排序：观众(左) → 运动员(中) → 大使(右) / Order: Audience(left) → Athlete(center) → Ambassador(right)
const roleOptions = [
  {
    role: UserRole.AUDIENCE,
    icon: '🙋‍♂️',
    title: { en: 'Audience Supporter', cn: '观众支持者' },
    description: { 
      en: 'Support teams through staking and tier rewards',
      cn: '通过质押和层级奖励支持队伍'
    },
    features: [
      { en: 'Stake on match outcomes', cn: '对比赛结果质押' },
      { en: 'Attend exclusive events', cn: '参加专属活动' },
      { en: 'Three-tier rewards', cn: '三层奖励系统' },
      { en: 'QR check-ins', cn: '二维码签到' }
    ],
    gradient: 'from-blue-500 to-indigo-600',
    popular: true
  },
  {
    role: UserRole.ATHLETE,
    icon: '🏃‍♂️',
    title: { en: 'Community Athlete', cn: '社区运动员' },
    description: { 
      en: 'Compete in matches and earn season bonuses',
      cn: '参与比赛，获得排名，领取赛季奖金'
    },
    features: [
      { en: 'Join competitions', cn: '参与比赛' },
      { en: 'Build athletic profile', cn: '建立运动档案' },
      { en: 'Earn season bonuses', cn: '获得赛季奖金' },
      { en: 'Track performance', cn: '追踪表现' }
    ],
    gradient: 'from-green-500 to-emerald-600',
    popular: true
  },
  {
    role: UserRole.AMBASSADOR,
    icon: '🧑‍💼',
    title: { en: 'Ambassador', cn: '大使' },
    description: { 
      en: 'Organize events and earn commission fees',
      cn: '组织活动，招募运动员，获得佣金费用'
    },
    features: [
      { en: 'Create events', cn: '创建活动' },
      { en: 'Recruit athletes', cn: '招募运动员' },
      { en: 'Earn 1% commission', cn: '获得1%佣金' },
      { en: 'Partner with merchants', cn: '与商户合作' }
    ],
    gradient: 'from-yellow-500 to-orange-600',
    popular: false,
    requiresInvite: true // 需要邀请码 / Requires invitation code
  }
]

export default function IdentitySelector({ 
  registrationState, 
  updateState, 
  onNext 
}: IdentitySelectorProps) {
  const { language } = useLanguage()
  
  // Admin验证码弹窗状态 / Admin verification code modal state
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState('')

  // 处理角色选择 / Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    updateState({
      selectedPrimaryRole: role,
      errors: { ...registrationState.errors, primaryRole: undefined }
    })
  }

  // 处理继续按钮点击 / Handle continue button click
  const handleContinue = () => {
    if (registrationState.selectedPrimaryRole) {
      // 如果是大使角色，需要验证admin码 / If ambassador role, need admin verification
      if (registrationState.selectedPrimaryRole === UserRole.AMBASSADOR) {
        setShowAdminModal(true)
      } else {
        // 其他角色直接跳转到对应的dashboard页面 / Other roles go directly to their dashboard
        const role = registrationState.selectedPrimaryRole
        let dashboardPath = '/dashboard'
        
        // 根据角色跳转到对应的dashboard / Navigate to role-specific dashboard
        switch (role) {
          case UserRole.AUDIENCE:
            dashboardPath = '/dashboard/audience'
            break
          case UserRole.ATHLETE:
            dashboardPath = '/dashboard/athlete'
            break
          default:
            dashboardPath = '/dashboard'
        }
        
        // 使用window.location.href进行页面跳转 / Use window.location.href for navigation
        window.location.href = dashboardPath
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* 步骤标题 / Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          {language === 'en' ? 'Choose Your Identity' : '选择您的身份'}
        </h2>
        <p className="text-gray-300 text-lg">
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
          <div className="bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-2xl p-6 border border-blue-400/30 backdrop-blur-sm shadow-2xl shadow-blue-500/20">
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
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* 移动端：单列布局，更好的触控体验 */}
        {/* 平板端：双列布局，适中的卡片大小 */}
        {/* 桌面端：三列布局，完美的视觉平衡 */}
        {roleOptions.map((option) => {
          const isSelected = registrationState.selectedPrimaryRole === option.role
          
          return (
            <div
              key={option.role}
              className={`
                relative group cursor-pointer transition-all duration-300
                ${isSelected ? 'scale-105' : 'hover:scale-102'}
                min-h-[280px] sm:min-h-[260px] lg:min-h-[300px]
              `}
              onClick={() => handleRoleSelect(option.role)}
            >
              {/* 热门标签 / Popular Badge */}
              {option.popular && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-fanforce-gold text-fanforce-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {language === 'en' ? 'Popular' : '热门'}
                  </div>
                </div>
              )}

              {/* 邀请码要求标签 / Invitation Required Badge */}
              {option.requiresInvite && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {language === 'en' ? 'Invite Required' : '需要邀请码'}
                  </div>
                </div>
              )}

              {/* 卡片主体 / Card Body */}
              <div className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                bg-gradient-to-br ${option.gradient} bg-opacity-15
                ${isSelected 
                  ? 'border-fanforce-gold shadow-2xl shadow-fanforce-gold/30' 
                  : 'border-white/20 hover:border-white/40'
                }
                backdrop-blur-sm h-full flex flex-col
                hover:shadow-xl hover:shadow-${option.gradient.split(' ')[1]}/20
              `}>
                {/* 选中指示器 / Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="w-6 h-6 bg-fanforce-gold rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-fanforce-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                  </div>
                )}

                {/* 角色图标和标题 / Role Icon and Title */}
                <div className="text-center mb-4">
                  <div className="text-3xl mb-2 transform hover:scale-110 transition-transform duration-200">
                    {option.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white drop-shadow-lg">
                    {language === 'en' ? option.title.en : option.title.cn}
                  </h3>
                </div>

                {/* 角色描述 / Role Description */}
                <p className="text-white/90 mb-4 text-sm leading-relaxed text-center flex-grow font-medium drop-shadow">
                  {language === 'en' ? option.description.en : option.description.cn}
                </p>

                {/* 功能特性列表 / Feature List */}
                {/* 已删除功能特性列表，使卡片更简洁 / Removed feature list for cleaner card design */}
                {/* <div className="space-y-3 mt-auto">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </div>
                      <span className="text-white/90 font-medium drop-shadow">
                        {language === 'en' ? feature.en : feature.cn}
                      </span>
                    </div>
                  ))}
                </div> */}

                {/* 悬停效果 / Hover Effect */}
                <div className={`
                  absolute inset-0 rounded-2xl transition-opacity duration-300
                  bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5
                  ${isSelected ? 'opacity-10' : ''}
                `} />
              </div>
            </div>
          )
        })}
      </div>

      {/* 邀请码显示区域 / Invite Code Display Area */}
      {registrationState.selectedPrimaryRole && (
        <div className="mb-6">
          <InviteCodeDisplay 
            userId={registrationState.userId || `user-${Date.now()}`}
            userRole={registrationState.selectedPrimaryRole}
            className="mb-6"
          />
        </div>
      )}

      {/* 帮助信息 / Help Information */}
      <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-sm">
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

      {/* 快速继续按钮（选中角色后显示）/ Quick Continue Button (shown after role selection) */}
      {/* 已删除，替换为上方的新提示组件 / Removed, replaced with new toast component above */}
      
      {/* Admin验证码弹窗 / Admin Verification Code Modal */}
      {showAdminModal && (
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
              {adminError && (
                <p className="text-red-400 text-sm mt-2">{adminError}</p>
              )}
            </div>
            
            {/* 弹窗按钮 / Modal Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAdminModal(false)
                  setAdminCode('')
                  setAdminError('')
                }}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-200"
              >
                {language === 'en' ? 'Cancel' : '取消'}
              </button>
              <button
                onClick={() => {
                  // 这里可以添加实际的admin码验证逻辑 / Add actual admin code verification logic here
                  if (adminCode === 'admin123') { // 示例验证码，实际应该从后端验证 / Example code, should verify from backend
                    setShowAdminModal(false)
                    setAdminCode('')
                    setAdminError('')
                    // 验证成功后直接跳转到大使dashboard / After successful verification, go directly to ambassador dashboard
                    window.location.href = '/dashboard/ambassador'
                  } else {
                    setAdminError(language === 'en' ? 'Invalid admin code' : '验证码无效')
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-bold rounded-xl transition-all duration-200"
              >
                {language === 'en' ? 'Verify' : '验证'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
