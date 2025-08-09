// FanForce AI - 多角色选择器组件
// Multi-Role Selector Component - 第三步：选择辅助角色权限
// Step 3: Select additional role permissions

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { RegistrationState } from '../RegistrationWizard'

interface MultiRoleSelectorProps {
  registrationState: RegistrationState
  updateState: (updates: Partial<RegistrationState>) => void
  onNext: () => void
}

// 辅助角色选项配置 / Secondary Role Options Configuration
const secondaryRoleOptions = [
  {
    role: UserRole.AUDIENCE,
    icon: '🙋‍♂️',
    title: { en: 'Audience Supporter', cn: '观众支持者' },
    description: { 
      en: 'Support teams, participate in staking, and attend exclusive events',
      cn: '支持队伍，参与质押，参加专属活动'
    },
    benefits: [
      { en: 'Stake on match outcomes', cn: '对比赛结果质押' },
      { en: 'Access to three-tier rewards', cn: '获得三层奖励' },
      { en: 'Exclusive party invitations', cn: '专属聚会邀请' },
      { en: 'QR code check-in bonuses', cn: '二维码签到奖金' }
    ],
    compatibility: {
      [UserRole.ATHLETE]: 'excellent',
      [UserRole.AMBASSADOR]: 'good',
      [UserRole.ADMIN]: 'fair'
    },
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    role: UserRole.ATHLETE,
    icon: '🏃‍♂️',
    title: { en: 'Student Athlete', cn: '学生运动员' },
    description: { 
      en: 'Compete in matches, build your athletic profile, and earn performance rewards',
      cn: '参与比赛，建立运动员档案，获得表现奖励'
    },
    benefits: [
      { en: 'Participate in competitions', cn: '参与比赛' },
      { en: 'Build athletic reputation', cn: '建立运动声誉' },
      { en: 'Earn season bonuses', cn: '获得赛季奖金' },
      { en: 'Performance tracking', cn: '表现跟踪' }
    ],
    compatibility: {
      [UserRole.AUDIENCE]: 'excellent',
      [UserRole.AMBASSADOR]: 'good',
      [UserRole.ADMIN]: 'fair'
    },
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    role: UserRole.AMBASSADOR,
    icon: '🧑‍💼',
    title: { en: 'Community Ambassador', cn: '社区大使' },
    description: { 
      en: 'Organize events, recruit athletes, and earn commission from platform activities',
      cn: '组织活动，招募运动员，从平台活动中获得佣金'
    },
    benefits: [
      { en: 'Create and manage events', cn: '创建和管理活动' },
      { en: 'Recruit student athletes', cn: '招募学生运动员' },
      { en: 'Earn 1% commission fees', cn: '获得1%佣金费用' },
      { en: 'Access to merchant partnerships', cn: '获得商户合作机会' }
    ],
    compatibility: {
      [UserRole.ATHLETE]: 'excellent',
      [UserRole.AUDIENCE]: 'good',
      [UserRole.ADMIN]: 'excellent'
    },
    gradient: 'from-yellow-500 to-orange-600'
  }
]

export default function MultiRoleSelector({ 
  registrationState, 
  updateState, 
  onNext 
}: MultiRoleSelectorProps) {
  const { language } = useLanguage()

  // 获取可选择的辅助角色（排除主角色）/ Get selectable secondary roles (exclude primary role)
  const availableSecondaryRoles = secondaryRoleOptions.filter(
    option => option.role !== registrationState.selectedPrimaryRole
  )

  // 处理辅助角色切换 / Handle secondary role toggle
  const handleSecondaryRoleToggle = (role: UserRole) => {
    const currentSecondaryRoles = registrationState.selectedSecondaryRoles
    const isSelected = currentSecondaryRoles.includes(role)
    
    let newSecondaryRoles: UserRole[]
    if (isSelected) {
      // 移除角色 / Remove role
      newSecondaryRoles = currentSecondaryRoles.filter(r => r !== role)
    } else {
      // 添加角色 / Add role
      newSecondaryRoles = [...currentSecondaryRoles, role]
    }

    updateState({
      selectedSecondaryRoles: newSecondaryRoles
    })
  }

  // 获取角色兼容性 / Get role compatibility
  const getRoleCompatibility = (role: UserRole) => {
    const option = secondaryRoleOptions.find(opt => opt.role === role)
    if (!option || !registrationState.selectedPrimaryRole) return 'fair'
    
    return option.compatibility[registrationState.selectedPrimaryRole] || 'fair'
  }

  // 获取兼容性标签 / Get compatibility badge
  const getCompatibilityBadge = (compatibility: string) => {
    const badges = {
      excellent: { 
        en: 'Perfect Match', 
        cn: '完美匹配', 
        color: 'bg-green-600',
        icon: '🎯'
      },
      good: { 
        en: 'Good Synergy', 
        cn: '良好协同', 
        color: 'bg-blue-600',
        icon: '👍'
      },
      fair: { 
        en: 'Works Well', 
        cn: '运作良好', 
        color: 'bg-gray-600',
        icon: '✓'
      }
    }
    
    const badge = badges[compatibility as keyof typeof badges]
    return (
      <div className={`${badge.color} text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1`}>
        <span>{badge.icon}</span>
        <span>{language === 'en' ? badge.en : badge.cn}</span>
      </div>
    )
  }

  // 获取主角色信息 / Get primary role info
  const getPrimaryRoleInfo = () => {
    const roleNames = {
      [UserRole.ATHLETE]: { en: 'Community Athlete', cn: '社区运动员', icon: '🏃‍♂️' },
      [UserRole.AMBASSADOR]: { en: 'Community Ambassador', cn: '社区大使', icon: '🧑‍💼' },
      [UserRole.AUDIENCE]: { en: 'Audience Supporter', cn: '观众支持者', icon: '🙋‍♂️' },
      [UserRole.ADMIN]: { en: 'System Administrator', cn: '系统管理员', icon: '⚙️' }
    }
    
    const primaryRole = registrationState.selectedPrimaryRole
    return primaryRole ? roleNames[primaryRole] : null
  }

  const primaryRoleInfo = getPrimaryRoleInfo()

  return (
    <div className="space-y-8">
      {/* 步骤标题 / Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          {language === 'en' ? 'Expand Your Capabilities' : '扩展您的能力'}
        </h2>
        <p className="text-gray-300 text-lg mb-4">
          {language === 'en' 
            ? 'Add additional roles to unlock more features and earning opportunities'
            : '添加其他角色以解锁更多功能和收益机会'
          }
        </p>
        
        {/* 主角色显示 / Primary Role Display */}
        {primaryRoleInfo && (
          <div className="inline-flex items-center space-x-2 bg-fanforce-gold/20 border border-fanforce-gold/30 rounded-lg px-4 py-2">
            <span className="text-lg">{primaryRoleInfo.icon}</span>
            <span className="text-fanforce-gold font-medium">
              {language === 'en' ? 'Primary:' : '主要身份：'} 
              {language === 'en' ? primaryRoleInfo.en : primaryRoleInfo.cn}
            </span>
          </div>
        )}
      </div>

      {/* 辅助角色选项网格 / Secondary Role Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableSecondaryRoles.map((option) => {
          const isSelected = registrationState.selectedSecondaryRoles.includes(option.role)
          const compatibility = getRoleCompatibility(option.role)
          
          return (
            <div
              key={option.role}
              className={`
                relative group cursor-pointer transition-all duration-300
                ${isSelected ? 'scale-105' : 'hover:scale-102'}
              `}
              onClick={() => handleSecondaryRoleToggle(option.role)}
            >
              {/* 兼容性标签 / Compatibility Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                {getCompatibilityBadge(compatibility)}
              </div>

              {/* 卡片主体 / Card Body */}
              <div className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300
                bg-gradient-to-br ${option.gradient} bg-opacity-10
                ${isSelected 
                  ? 'border-fanforce-accent shadow-xl shadow-fanforce-accent/30' 
                  : 'border-white/20 hover:border-white/40'
                }
                backdrop-blur-sm h-full flex flex-col
              `}>
                {/* 选中指示器 / Selected Indicator */}
                <div className="absolute top-4 right-4">
                  {isSelected ? (
                    <div className="w-6 h-6 bg-fanforce-accent rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-white/30 rounded-full"></div>
                  )}
                </div>

                {/* 角色图标和标题 / Role Icon and Title */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-3xl">{option.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {language === 'en' ? option.title.en : option.title.cn}
                    </h3>
                  </div>
                </div>

                {/* 角色描述 / Role Description */}
                <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-1">
                  {language === 'en' ? option.description.en : option.description.cn}
                </p>

                {/* 收益列表 / Benefits List */}
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">
                    {language === 'en' ? 'Benefits:' : '收益：'}
                  </h4>
                  {option.benefits.slice(0, 3).map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <svg className="w-3 h-3 text-fanforce-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-gray-300">
                        {language === 'en' ? benefit.en : benefit.cn}
                      </span>
                    </div>
                  ))}
                  {option.benefits.length > 3 && (
                    <div className="text-xs text-gray-400 italic">
                      {language === 'en' ? `+${option.benefits.length - 3} more benefits` : `还有${option.benefits.length - 3}项收益`}
                    </div>
                  )}
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

      {/* 多角色优势说明 / Multi-Role Benefits Explanation */}
      <div className="bg-gradient-to-r from-fanforce-primary/20 to-fanforce-accent/20 border border-fanforce-primary/30 rounded-lg p-6">
        <div className="flex items-start space-x-4">
          <div className="text-3xl flex-shrink-0">✨</div>
          <div>
            <h3 className="text-white font-bold text-lg mb-2">
              {language === 'en' ? 'Why Choose Multiple Roles?' : '为什么选择多个角色？'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-fanforce-accent">💰</span>
                  <span>{language === 'en' ? 'Multiple income streams' : '多种收入来源'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-fanforce-accent">🎯</span>
                  <span>{language === 'en' ? 'Access to all platform features' : '访问所有平台功能'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-fanforce-accent">🏆</span>
                  <span>{language === 'en' ? 'Maximized earning potential' : '最大化收益潜力'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-fanforce-accent">🌟</span>
                  <span>{language === 'en' ? 'Enhanced platform experience' : '增强平台体验'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 选择摘要 / Selection Summary */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <span className="mr-2">📋</span>
          {language === 'en' ? 'Your Role Selection:' : '您的角色选择：'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-400">
              {language === 'en' ? 'Primary Role:' : '主要角色：'}
            </span>
            <div className="text-fanforce-gold font-medium">
              {primaryRoleInfo && (
                <>
                  {primaryRoleInfo.icon} {language === 'en' ? primaryRoleInfo.en : primaryRoleInfo.cn}
                </>
              )}
            </div>
          </div>
          <div>
            <span className="text-sm text-gray-400">
              {language === 'en' ? 'Additional Roles:' : '其他角色：'}
            </span>
            <div className="text-fanforce-accent font-medium">
              {registrationState.selectedSecondaryRoles.length === 0 ? (
                <span className="text-gray-500">
                  {language === 'en' ? 'None selected' : '未选择'}
                </span>
              ) : (
                registrationState.selectedSecondaryRoles.map(role => {
                  const roleOption = secondaryRoleOptions.find(opt => opt.role === role)
                  return roleOption ? (
                    <div key={role} className="flex items-center space-x-1">
                      <span>{roleOption.icon}</span>
                      <span>{language === 'en' ? roleOption.title.en : roleOption.title.cn}</span>
                    </div>
                  ) : null
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 跳过选项 / Skip Option */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-4">
          {language === 'en' 
            ? 'You can always add more roles later in your profile settings'
            : '您可以随时在个人资料设置中添加更多角色'
          }
        </p>
        <button
          onClick={onNext}
          className="
            inline-flex items-center space-x-2 px-8 py-3
            bg-fanforce-primary hover:bg-blue-700 
            text-white font-medium rounded-lg
            shadow-lg shadow-fanforce-primary/30
            transition-all duration-200 transform hover:scale-105
          "
        >
          <span>
            {registrationState.selectedSecondaryRoles.length > 0
              ? (language === 'en' ? 'Continue with Selected Roles' : '继续已选角色')
              : (language === 'en' ? 'Continue with Primary Role Only' : '仅使用主要角色继续')
            }
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
