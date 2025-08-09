// FanForce AI - 注册完成欢迎组件
// Welcome Complete Component - 第六步：注册完成欢迎页面
// Step 6: Registration completion welcome page

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { RegistrationState } from '../RegistrationWizard'

interface WelcomeCompleteProps {
  registrationState: RegistrationState
}

export default function WelcomeComplete({ 
  registrationState 
}: WelcomeCompleteProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // 倒计时和自动跳转 / Countdown and auto-redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsRedirecting(true)
          clearInterval(timer)
          // 跳转到仪表板 / Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard')
          }, 1000)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  // 立即跳转到仪表板 / Immediate redirect to dashboard
  const handleGoToDashboard = () => {
    setIsRedirecting(true)
    router.push('/dashboard')
  }

  // 获取角色信息 / Get role information
  const getRoleInfo = (role: UserRole) => {
    const roleData = {
      [UserRole.ATHLETE]: {
        icon: '🏃‍♂️',
        name: { en: 'Student Athlete', cn: '学生运动员' },
        color: 'text-green-400'
      },
      [UserRole.AMBASSADOR]: {
        icon: '🧑‍💼',
        name: { en: 'Campus Ambassador', cn: '校园大使' },
        color: 'text-yellow-400'
      },
      [UserRole.AUDIENCE]: {
        icon: '🙋‍♂️',
        name: { en: 'Audience Supporter', cn: '观众支持者' },
        color: 'text-blue-400'
      },
      [UserRole.ADMIN]: {
        icon: '⚙️',
        name: { en: 'System Administrator', cn: '系统管理员' },
        color: 'text-red-400'
      }
    }
    
    return roleData[role] || { icon: '❓', name: { en: 'Unknown', cn: '未知' }, color: 'text-gray-400' }
  }

  const primaryRoleInfo = registrationState.selectedPrimaryRole 
    ? getRoleInfo(registrationState.selectedPrimaryRole)
    : null

  // 获取下一步建议 / Get next step suggestions
  const getNextSteps = () => {
    const steps = []
    
    if (registrationState.selectedPrimaryRole === UserRole.ATHLETE || 
        registrationState.selectedSecondaryRoles.includes(UserRole.ATHLETE)) {
      steps.push({
        icon: '🏆',
        title: { en: 'Join Competitions', cn: '加入比赛' },
        description: { en: 'Browse upcoming matches and register to compete', cn: '浏览即将到来的比赛并注册参加' }
      })
    }
    
    if (registrationState.selectedPrimaryRole === UserRole.AMBASSADOR || 
        registrationState.selectedSecondaryRoles.includes(UserRole.AMBASSADOR)) {
      steps.push({
        icon: '📅',
        title: { en: 'Create Events', cn: '创建活动' },
        description: { en: 'Start organizing events and recruiting athletes', cn: '开始组织活动和招募运动员' }
      })
    }
    
    if (registrationState.selectedPrimaryRole === UserRole.AUDIENCE || 
        registrationState.selectedSecondaryRoles.includes(UserRole.AUDIENCE)) {
      steps.push({
        icon: '🎯',
        title: { en: 'Start Staking', cn: '开始质押' },
        description: { en: 'Support your favorite teams and earn rewards', cn: '支持您喜爱的队伍并获得奖励' }
      })
    }
    
    // 通用建议 / Universal suggestions
    steps.push(
      {
        icon: '👤',
        title: { en: 'Complete Profile', cn: '完善个人资料' },
        description: { en: 'Add more details to maximize your opportunities', cn: '添加更多详细信息以最大化您的机会' }
      },
      {
        icon: '🎁',
        title: { en: 'Claim Welcome Bonus', cn: '领取欢迎奖金' },
        description: { en: 'Get your welcome rewards and free tokens', cn: '获得您的欢迎奖励和免费代币' }
      }
    )
    
    return steps.slice(0, 4) // 最多显示4个建议 / Show up to 4 suggestions
  }

  const nextSteps = getNextSteps()

  return (
    <div className="space-y-8 text-center">
      {/* 成功动画和标题 / Success Animation and Title */}
      <div className="space-y-6">
        {/* 成功动画 / Success Animation */}
        <div className="relative">
          <div className="w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-fanforce-accent to-green-600 rounded-full flex items-center justify-center animate-bounce">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
          
          {/* 庆祝粒子效果 / Celebration Particle Effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 bg-fanforce-gold rounded-full animate-ping`}
                style={{
                  left: `${20 + (i * 12)}%`,
                  top: `${30 + ((i % 2) * 20)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>

        {/* 欢迎文本 / Welcome Text */}
        <div>
          <h2 className="text-4xl font-bold text-white mb-4">
            🎉 {language === 'en' ? 'Welcome to FanForce AI!' : '欢迎来到FanForce AI！'}
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            {language === 'en' 
              ? 'Your account has been successfully created!'
              : '您的账户已成功创建！'
            }
          </p>
          <p className="text-gray-400">
            {language === 'en' 
              ? 'You\'re now ready to explore the campus sports ecosystem'
              : '您现在可以探索校园体育生态系统了'
            }
          </p>
        </div>
      </div>

      {/* 用户角色摘要 / User Role Summary */}
      <div className="bg-gradient-to-r from-fanforce-primary/20 to-fanforce-accent/20 border border-fanforce-primary/30 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">
          {language === 'en' ? 'Your Role Configuration' : '您的角色配置'}
        </h3>
        
        <div className="space-y-4">
          {/* 主角色 / Primary Role */}
          {primaryRoleInfo && (
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">{primaryRoleInfo.icon}</span>
              <div className="text-center">
                <div className="text-fanforce-gold font-medium">
                  {language === 'en' ? 'Primary Role' : '主要角色'}
                </div>
                <div className={`text-lg ${primaryRoleInfo.color} font-bold`}>
                  {language === 'en' ? primaryRoleInfo.name.en : primaryRoleInfo.name.cn}
                </div>
              </div>
            </div>
          )}
          
          {/* 辅助角色 / Secondary Roles */}
          {registrationState.selectedSecondaryRoles.length > 0 && (
            <div>
              <div className="text-gray-400 text-sm mb-2">
                {language === 'en' ? 'Additional Roles' : '其他角色'}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {registrationState.selectedSecondaryRoles.map(role => {
                  const roleInfo = getRoleInfo(role)
                  return (
                    <div key={role} className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2">
                      <span>{roleInfo.icon}</span>
                      <span className={`text-sm ${roleInfo.color}`}>
                        {language === 'en' ? roleInfo.name.en : roleInfo.name.cn}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 下一步建议 / Next Steps Suggestions */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h3 className="text-white font-bold text-lg mb-4">
          {language === 'en' ? 'Recommended Next Steps' : '推荐的下一步'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nextSteps.map((step, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 text-left">
              <div className="flex items-start space-x-3">
                <span className="text-2xl flex-shrink-0">{step.icon}</span>
                <div>
                  <h4 className="text-white font-medium text-sm">
                    {language === 'en' ? step.title.en : step.title.cn}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1">
                    {language === 'en' ? step.description.en : step.description.cn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 立即开始或倒计时 / Start Now or Countdown */}
      <div className="space-y-4">
        {!isRedirecting ? (
          <>
            <button
              onClick={handleGoToDashboard}
              className="
                inline-flex items-center space-x-2 px-8 py-4
                bg-gradient-to-r from-fanforce-primary to-fanforce-accent 
                hover:from-blue-700 hover:to-green-600
                text-white font-bold text-lg rounded-lg
                shadow-xl shadow-fanforce-primary/30
                transition-all duration-200 transform hover:scale-105
              "
            >
              <span>
                {language === 'en' ? 'Go to Dashboard' : '前往仪表板'}
              </span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <p className="text-gray-400 text-sm">
              {language === 'en' 
                ? `Auto-redirecting in ${countdown} seconds...`
                : `${countdown}秒后自动跳转...`
              }
            </p>
          </>
        ) : (
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-fanforce-gold"></div>
            <span className="text-white">
              {language === 'en' ? 'Taking you to your dashboard...' : '正在跳转到您的仪表板...'}
            </span>
          </div>
        )}
      </div>

      {/* 帮助和支持 / Help and Support */}
      <div className="bg-gray-800/50 rounded-lg p-4 text-sm">
        <p className="text-gray-300 mb-2">
          {language === 'en' ? 'Need help getting started?' : '需要帮助开始使用？'}
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <a 
            href="mailto:support@fanforce.ai" 
            className="text-fanforce-gold hover:text-fanforce-secondary transition-colors"
          >
            📧 {language === 'en' ? 'Contact Support' : '联系支持'}
          </a>
          <a 
            href="/docs" 
            className="text-fanforce-gold hover:text-fanforce-secondary transition-colors"
          >
            📚 {language === 'en' ? 'Documentation' : '使用文档'}
          </a>
          <a 
            href="/community" 
            className="text-fanforce-gold hover:text-fanforce-secondary transition-colors"
          >
            💬 {language === 'en' ? 'Join Community' : '加入社区'}
          </a>
        </div>
      </div>
    </div>
  )
}
