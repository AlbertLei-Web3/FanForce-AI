// FanForce AI - 身份选择器组件
// Identity Selector Component - 第一步：选择用户主要身份角色
// Step 1: Select user's primary identity role

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { RegistrationState } from '../RegistrationWizard'

interface IdentitySelectorProps {
  registrationState: RegistrationState
  updateState: (updates: Partial<RegistrationState>) => void
  onNext: () => void
}

// 角色选项配置 / Role Options Configuration
const roleOptions = [
  {
    role: UserRole.ATHLETE,
    icon: '🏃‍♂️',
    title: { en: 'Community Athlete', cn: '社区运动员' },
    description: { 
      en: 'Compete in matches, earn rankings, and receive ICP season bonuses',
      cn: '参与比赛，获得排名，领取ICP赛季奖金'
    },
    features: [
      { en: 'Participate in community competitions', cn: '参与社区比赛' },
      { en: 'Build your athletic profile', cn: '建立运动员档案' },
      { en: 'Earn season bonuses', cn: '获得赛季奖金' },
      { en: 'Track performance stats', cn: '追踪表现统计' }
    ],
    gradient: 'from-green-500 to-emerald-600',
    popular: true
  },
  {
    role: UserRole.AMBASSADOR,
    icon: '🧑‍💼',
    title: { en: 'Community Ambassador', cn: '社区大使' },
    description: { 
      en: 'Organize events, recruit athletes, and earn commission fees',
      cn: '组织活动，招募运动员，获得佣金费用'
    },
    features: [
      { en: 'Create and manage events', cn: '创建和管理活动' },
      { en: 'Recruit community athletes', cn: '招募社区运动员' },
      { en: 'Earn 1% fee commission', cn: '获得1%费用佣金' },
      { en: 'Partner with merchants', cn: '与商户合作' }
    ],
    gradient: 'from-yellow-500 to-orange-600',
    popular: false,
    requiresInvite: true // 需要邀请码 / Requires invitation code
  },
  {
    role: UserRole.AUDIENCE,
    icon: '🙋‍♂️',
    title: { en: 'Audience Supporter', cn: '观众支持者' },
    description: { 
      en: 'Support your favorite teams through three-tier participation system',
      cn: '通过三层参与系统支持您喜爱的队伍'
    },
    features: [
      { en: 'Stake on match outcomes', cn: '对比赛结果质押' },
      { en: 'Attend exclusive parties', cn: '参加专属聚会' },
      { en: 'Three-tier reward system', cn: '三层奖励系统' },
      { en: 'QR code check-ins', cn: '二维码签到' }
    ],
    gradient: 'from-blue-500 to-indigo-600',
    popular: true
  }
]

export default function IdentitySelector({ 
  registrationState, 
  updateState, 
  onNext 
}: IdentitySelectorProps) {
  const { language } = useLanguage()

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
      onNext()
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

      {/* 角色选项网格 / Role Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roleOptions.map((option) => {
          const isSelected = registrationState.selectedPrimaryRole === option.role
          
          return (
            <div
              key={option.role}
              className={`
                relative group cursor-pointer transition-all duration-300
                ${isSelected ? 'scale-105' : 'hover:scale-102'}
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
                bg-gradient-to-br ${option.gradient} bg-opacity-10
                ${isSelected 
                  ? 'border-fanforce-gold shadow-2xl shadow-fanforce-gold/30' 
                  : 'border-white/20 hover:border-white/40'
                }
                backdrop-blur-sm
              `}>
                {/* 选中指示器 / Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-fanforce-gold rounded-full flex items-center justify-center">
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
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{option.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {language === 'en' ? option.title.en : option.title.cn}
                    </h3>
                  </div>
                </div>

                {/* 角色描述 / Role Description */}
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {language === 'en' ? option.description.en : option.description.cn}
                </p>

                {/* 功能特性列表 / Feature List */}
                <div className="space-y-2">
                  {option.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-fanforce-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-gray-300">
                        {language === 'en' ? feature.en : feature.cn}
                      </span>
                    </div>
                  ))}
                </div>

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

      {/* 帮助信息 / Help Information */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-start space-x-3">
          <div className="text-fanforce-gold text-xl flex-shrink-0">💡</div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">
              {language === 'en' ? 'Not sure which role fits you?' : '不确定哪个角色适合您？'}
            </p>
            <p>
              {language === 'en' 
                ? 'Don\'t worry! You can add additional roles in the next step to access multiple features and earn from different participation methods.'
                : '别担心！您可以在下一步添加其他角色，以访问多种功能并通过不同的参与方式获得收益。'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 快速继续按钮（选中角色后显示）/ Quick Continue Button (shown after role selection) */}
      {registrationState.selectedPrimaryRole && (
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="
              inline-flex items-center space-x-2 px-8 py-3
              bg-fanforce-primary hover:bg-blue-700 
              text-white font-medium rounded-lg
              shadow-lg shadow-fanforce-primary/30
              transition-all duration-200 transform hover:scale-105
            "
          >
            <span>
              {language === 'en' ? 'Continue with' : '继续选择'} {' '}
              {language === 'en' 
                ? roleOptions.find(opt => opt.role === registrationState.selectedPrimaryRole)?.title.en
                : roleOptions.find(opt => opt.role === registrationState.selectedPrimaryRole)?.title.cn
              }
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
