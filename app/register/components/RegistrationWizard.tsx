// FanForce AI - 注册向导核心组件
// Registration Wizard Core Component - 管理注册流程的状态和步骤导航
// Manages registration flow state and step navigation
// 关联文件:
// - UserContext.tsx: 用户认证方法
// - steps/: 各个步骤组件

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, UserRole } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../../components/shared/Toast'

// 导入共享组件 / Import shared components
import ProgressIndicator from './shared/ProgressIndicator'
import StepNavigation from './shared/StepNavigation'

// 动态导入步骤组件 / Dynamic import step components
import dynamic from 'next/dynamic'

const IdentitySelector = dynamic(() => import('./steps/IdentitySelector'), { ssr: false })
const AuthMethodSelector = dynamic(() => import('./steps/AuthMethodSelector'), { ssr: false })
const MultiRoleSelector = dynamic(() => import('./steps/MultiRoleSelector'), { ssr: false })
const PersonalInfoForm = dynamic(() => import('./steps/PersonalInfoForm'), { ssr: false })
const RoleSpecificForms = dynamic(() => import('./steps/RoleSpecificForms'), { ssr: false })
const WelcomeComplete = dynamic(() => import('./steps/WelcomeComplete'), { ssr: false })

// 注册步骤枚举 / Registration Steps Enum
export enum RegistrationStep {
  IDENTITY_SELECTION = 1,    // 身份类型选择 / Identity Type Selection
  AUTH_METHOD = 2,           // 认证方式选择 / Authentication Method Selection
  MULTI_ROLE = 3,            // 多角色询问 / Multi-Role Inquiry
  PERSONAL_INFO = 4,         // 个人信息收集 / Personal Information Collection
  ROLE_SPECIFIC = 5,         // 角色特定信息 / Role-Specific Information
  WELCOME_COMPLETE = 6       // 欢迎完成 / Welcome & Completion
}

// 认证方式枚举 / Authentication Method Enum
export enum AuthMethod {
  WALLET = 'wallet',
  ICP = 'icp'
}

// 个人信息接口 / Personal Information Interface
export interface PersonalInfo {
  username?: string
  email?: string
  university?: string
  studentId?: string
  phone?: string
  emergencyContact?: string
}

// 角色特定数据接口 / Role-Specific Data Interface
export interface RoleSpecificData {
  athleteInfo?: {
    sports: string[]
    experience: string
    achievements: string[]
    position?: string
    height?: string
    weight?: string
  }
  ambassadorInfo?: {
    campus: string
    department: string
    previousEvents?: number
    socialMedia?: {
      instagram?: string
      twitter?: string
      wechat?: string
    }
  }
  audienceInfo?: {
    favoriteTeams: string[]
    supportLevel: 'casual' | 'active' | 'hardcore'
    interests: string[]
  }
}

// 注册状态接口 / Registration State Interface
export interface RegistrationState {
  currentStep: RegistrationStep
  completedSteps: RegistrationStep[]
  selectedPrimaryRole: UserRole | null
  selectedSecondaryRoles: UserRole[]
  authMethod: AuthMethod | null
  personalInfo: PersonalInfo
  roleSpecificData: RoleSpecificData
  isProcessing: boolean
  errors: Record<string, string>
}

// 初始注册状态 / Initial Registration State
const initialState: RegistrationState = {
  currentStep: RegistrationStep.IDENTITY_SELECTION,
  completedSteps: [],
  selectedPrimaryRole: null,
  selectedSecondaryRoles: [],
  authMethod: null,
  personalInfo: {},
  roleSpecificData: {},
  isProcessing: false,
  errors: {}
}

export default function RegistrationWizard() {
  const [registrationState, setRegistrationState] = useState<RegistrationState>(initialState)
  const { login, loginWithICP } = useUser()
  const { language } = useLanguage()
  const { showToast } = useToast()
  const router = useRouter()

  // 步骤总数 / Total number of steps
  const totalSteps = 6 // 固定6个步骤 / Fixed 6 steps

  // 更新注册状态 / Update registration state
  const updateState = useCallback((updates: Partial<RegistrationState>) => {
    setRegistrationState(prev => ({
      ...prev,
      ...updates,
      errors: { ...prev.errors, ...updates.errors }
    }))
  }, [])

  // 前进到下一步 / Go to next step
  const goToNextStep = useCallback(() => {
    const currentStep = registrationState.currentStep
    const nextStep = currentStep + 1
    
    if (nextStep <= totalSteps) {
      updateState({
        currentStep: nextStep as RegistrationStep,
        completedSteps: [...registrationState.completedSteps, currentStep]
      })
    }
  }, [registrationState.currentStep, registrationState.completedSteps, totalSteps, updateState])

  // 返回上一步 / Go to previous step
  const goToPreviousStep = useCallback(() => {
    const currentStep = registrationState.currentStep
    const previousStep = currentStep - 1
    
    if (previousStep >= 1) {
      updateState({
        currentStep: previousStep as RegistrationStep,
        completedSteps: registrationState.completedSteps.filter(step => step !== currentStep)
      })
    }
  }, [registrationState.currentStep, registrationState.completedSteps, updateState])

  // 跳转到指定步骤 / Jump to specific step
  const goToStep = useCallback((step: RegistrationStep) => {
    updateState({ currentStep: step })
  }, [updateState])

  // 验证当前步骤 / Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const { currentStep, selectedPrimaryRole, authMethod, personalInfo } = registrationState
    const errors: Record<string, string> = {}

    switch (currentStep) {
      case RegistrationStep.IDENTITY_SELECTION:
        if (!selectedPrimaryRole) {
          errors.primaryRole = language === 'en' ? 'Please select a primary role' : '请选择主要身份'
        }
        break

      case RegistrationStep.AUTH_METHOD:
        if (!authMethod) {
          errors.authMethod = language === 'en' ? 'Please select an authentication method' : '请选择认证方式'
        }
        break

      case RegistrationStep.PERSONAL_INFO:
        if (!personalInfo.username?.trim()) {
          errors.username = language === 'en' ? 'Username is required' : '用户名为必填项'
        }
        if (!personalInfo.email?.trim()) {
          errors.email = language === 'en' ? 'Email is required' : '邮箱为必填项'
        } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
          errors.email = language === 'en' ? 'Invalid email format' : '邮箱格式无效'
        }
        break
    }

    if (Object.keys(errors).length > 0) {
      updateState({ errors })
      return false
    }

    updateState({ errors: {} })
    return true
  }, [registrationState, language, updateState])

  // 处理步骤完成 / Handle step completion
  const handleStepComplete = useCallback(() => {
    if (validateCurrentStep()) {
      goToNextStep()
    }
  }, [validateCurrentStep, goToNextStep])

  // 处理最终注册提交 / Handle final registration submission
  const handleRegistrationSubmit = useCallback(async () => {
    updateState({ isProcessing: true })

    try {
      const { selectedPrimaryRole, selectedSecondaryRoles, authMethod, personalInfo, roleSpecificData } = registrationState

      // 构建用户数据 / Build user data
      const userData = {
        role: selectedPrimaryRole,
        secondary_roles: selectedSecondaryRoles,
        auth_type: authMethod,
        profile_data: {
          ...personalInfo,
          ...roleSpecificData
        },
        role_preferences: {
          defaultDashboard: selectedPrimaryRole,
          notificationSettings: {
            matchUpdates: true,
            stakingReminders: true
          }
        }
      }

      console.log('📝 准备提交注册数据 / Preparing to submit registration data:', userData)

      // 这里需要调用注册API
      // Here we need to call the registration API
      // 暂时使用模拟登录来演示流程
      // Temporarily using mock login to demonstrate the flow
      
      let success = false
      
      if (authMethod === AuthMethod.WALLET) {
        // 钱包认证流程 / Wallet authentication flow
        showToast('请连接钱包并签名以完成注册 / Please connect wallet and sign to complete registration', 'info')
        // TODO: 实现钱包连接和签名逻辑
        // TODO: Implement wallet connection and signing logic
      } else if (authMethod === AuthMethod.ICP) {
        // ICP认证流程 / ICP authentication flow
        showToast('请使用ICP身份完成注册 / Please complete registration with ICP identity', 'info')
        // TODO: 实现ICP身份认证逻辑
        // TODO: Implement ICP identity authentication logic
      }

      // 模拟成功注册 / Simulate successful registration
      await new Promise(resolve => setTimeout(resolve, 2000))
      success = true

      if (success) {
        showToast(
          language === 'en' 
            ? '🎉 Registration completed successfully!' 
            : '🎉 注册成功完成！',
          'success'
        )
        
        // 跳转到欢迎完成步骤
        // Go to welcome completion step
        goToNextStep()
        
        // 延迟跳转到仪表板
        // Delayed redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      }
      
    } catch (error) {
      console.error('❌ 注册失败 / Registration failed:', error)
      showToast(
        language === 'en' 
          ? 'Registration failed. Please try again.' 
          : '注册失败，请重试。',
        'error'
      )
    } finally {
      updateState({ isProcessing: false })
    }
  }, [registrationState, language, showToast, goToNextStep, router, updateState])

  // 渲染当前步骤组件 / Render current step component
  const renderCurrentStep = () => {
    const { currentStep } = registrationState

    const stepProps = {
      registrationState,
      updateState,
      onNext: handleStepComplete,
      onPrevious: goToPreviousStep,
      onSubmit: handleRegistrationSubmit
    }

    switch (currentStep) {
      case RegistrationStep.IDENTITY_SELECTION:
        return <IdentitySelector {...stepProps} />
      
      case RegistrationStep.AUTH_METHOD:
        return <AuthMethodSelector {...stepProps} />
      
      case RegistrationStep.MULTI_ROLE:
        return <MultiRoleSelector {...stepProps} />
      
      case RegistrationStep.PERSONAL_INFO:
        return <PersonalInfoForm {...stepProps} />
      
      case RegistrationStep.ROLE_SPECIFIC:
        return <RoleSpecificForms {...stepProps} />
      
      case RegistrationStep.WELCOME_COMPLETE:
        return <WelcomeComplete {...stepProps} />
      
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 进度指示器 / Progress Indicator */}
      <div className="mb-8">
        <ProgressIndicator 
          currentStep={registrationState.currentStep}
          totalSteps={totalSteps}
          completedSteps={registrationState.completedSteps}
        />
      </div>

      {/* 步骤内容容器 / Step Content Container */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
        {/* 当前步骤组件 / Current Step Component */}
        <div className="p-8">
          {renderCurrentStep()}
        </div>

        {/* 步骤导航 / Step Navigation */}
        {registrationState.currentStep !== RegistrationStep.WELCOME_COMPLETE && (
          <div className="border-t border-white/20 p-6">
            <StepNavigation 
              currentStep={registrationState.currentStep}
              totalSteps={totalSteps}
              onPrevious={goToPreviousStep}
              onNext={handleStepComplete}
              isProcessing={registrationState.isProcessing}
              canGoNext={Object.keys(registrationState.errors).length === 0}
            />
          </div>
        )}
      </div>
    </div>
  )
}
