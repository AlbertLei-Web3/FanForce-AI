// FanForce AI - 注册进度指示器组件
// Registration Progress Indicator Component - 显示注册流程的当前进度
// Shows current progress of registration flow

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { RegistrationStep } from '../RegistrationWizard'

interface ProgressIndicatorProps {
  currentStep: RegistrationStep
  totalSteps: number
  completedSteps: RegistrationStep[]
}

export default function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  completedSteps 
}: ProgressIndicatorProps) {
  const { language } = useLanguage()

  // 步骤标签 / Step labels
  const stepLabels = {
    [RegistrationStep.IDENTITY_SELECTION]: {
      en: 'Identity',
      cn: '身份选择'
    },
    [RegistrationStep.AUTH_METHOD]: {
      en: 'Authentication',
      cn: '认证方式'
    },
    [RegistrationStep.MULTI_ROLE]: {
      en: 'Roles',
      cn: '多角色'
    },
    [RegistrationStep.PERSONAL_INFO]: {
      en: 'Personal Info',
      cn: '个人信息'
    },
    [RegistrationStep.ROLE_SPECIFIC]: {
      en: 'Role Details',
      cn: '角色详情'
    },
    [RegistrationStep.WELCOME_COMPLETE]: {
      en: 'Complete',
      cn: '完成'
    }
  }

  // 步骤图标 / Step icons
  const stepIcons = {
    [RegistrationStep.IDENTITY_SELECTION]: '🎯',
    [RegistrationStep.AUTH_METHOD]: '🔐',
    [RegistrationStep.MULTI_ROLE]: '🎭',
    [RegistrationStep.PERSONAL_INFO]: '📝',
    [RegistrationStep.ROLE_SPECIFIC]: '⚡',
    [RegistrationStep.WELCOME_COMPLETE]: '🎉'
  }

  // 获取步骤状态 / Get step status
  const getStepStatus = (step: RegistrationStep) => {
    if (completedSteps.includes(step)) {
      return 'completed'
    } else if (step === currentStep) {
      return 'current'
    } else {
      return 'pending'
    }
  }

  // 获取步骤样式 / Get step styles
  const getStepStyles = (step: RegistrationStep) => {
    const status = getStepStatus(step)
    
    switch (status) {
      case 'completed':
        return {
          container: 'text-fanforce-accent',
          circle: 'bg-fanforce-accent text-white border-fanforce-accent',
          connector: 'bg-fanforce-accent'
        }
      case 'current':
        return {
          container: 'text-fanforce-gold',
          circle: 'bg-fanforce-gold text-fanforce-dark border-fanforce-gold shadow-lg shadow-fanforce-gold/30',
          connector: 'bg-gray-600'
        }
      default: // pending
        return {
          container: 'text-gray-400',
          circle: 'bg-gray-700 text-gray-400 border-gray-600',
          connector: 'bg-gray-600'
        }
    }
  }

  return (
    <div className="w-full">
      {/* 总体进度条 / Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-white">
            {language === 'en' ? 'Registration Progress' : '注册进度'}
          </span>
          <span className="text-sm text-gray-400">
            {currentStep} / {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-fanforce-primary to-fanforce-accent h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* 步骤指示器 / Step Indicators */}
      <div className="relative">
        {/* 连接线容器 / Connector Line Container */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-700 z-0" />
        
        {/* 步骤容器 / Steps Container */}
        <div className="relative z-10 flex justify-between">
          {Object.values(RegistrationStep)
            .filter(step => typeof step === 'number')
            .map((step) => {
              const stepNumber = step as RegistrationStep
              const styles = getStepStyles(stepNumber)
              const status = getStepStatus(stepNumber)
              const label = stepLabels[stepNumber]
              const icon = stepIcons[stepNumber]

              return (
                <div 
                  key={stepNumber}
                  className={`flex flex-col items-center ${styles.container} transition-all duration-300`}
                >
                  {/* 步骤圆圈 / Step Circle */}
                  <div 
                    className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold
                      transition-all duration-300 transform
                      ${styles.circle}
                      ${status === 'current' ? 'scale-110' : 'scale-100'}
                    `}
                  >
                    {status === 'completed' ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    ) : (
                      <span>{icon}</span>
                    )}
                  </div>

                  {/* 步骤标签 / Step Label */}
                  <div className="mt-2 text-center">
                    <div className={`text-xs font-medium ${status === 'current' ? 'text-fanforce-gold' : ''}`}>
                      {language === 'en' ? label.en : label.cn}
                    </div>
                    {status === 'current' && (
                      <div className="text-xs text-gray-400 mt-1">
                        {language === 'en' ? 'Current' : '当前'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* 移动端简化视图 / Mobile Simplified View */}
      <div className="md:hidden mt-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">{stepIcons[currentStep]}</span>
            <div className="text-center">
              <div className="text-white font-medium">
                {language === 'en' 
                  ? stepLabels[currentStep].en 
                  : stepLabels[currentStep].cn
                }
              </div>
              <div className="text-sm text-gray-400">
                {language === 'en' ? 'Step' : '步骤'} {currentStep} {language === 'en' ? 'of' : '/'} {totalSteps}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
