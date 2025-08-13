// FanForce AI - 简化注册流程组件
// Simplified Registration Component - 只包含快速登录和身份选择
// Only includes quick login and identity selection

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../context/LanguageContext'
import { UserRole } from '../../context/UserContext'
import QuickAuth from './QuickAuth'
import IdentitySelector from './steps/IdentitySelector'
import { getDashboardPath, saveUserData } from './shared/utils'
import { REGISTRATION_STEPS, STORAGE_KEYS } from './shared/constants'

interface SimplifiedRegistrationProps {
  onBack: () => void
  isModal?: boolean // 新增：是否在模态窗口中显示 / New: whether displayed in modal
  onAuthSuccess?: (authMethod: string, data: any) => void // 新增：登录成功回调 / New: auth success callback
  showOnlyAuth?: boolean // 新增：是否只显示登录步骤 / New: whether to show only auth step
  showOnlyIdentity?: boolean // 新增：是否只显示身份选择步骤 / New: whether to show only identity step
  userData?: any // 新增：用户数据 / New: user data
}

export default function SimplifiedRegistration({ 
  onBack, 
  isModal = false, 
  onAuthSuccess,
  showOnlyAuth = false,
  showOnlyIdentity = false,
  userData: externalUserData
}: SimplifiedRegistrationProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'auth' | 'identity'>(
    showOnlyIdentity ? REGISTRATION_STEPS.IDENTITY : REGISTRATION_STEPS.AUTH
  )
  const [userData, setUserData] = useState<any>(externalUserData || null)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)

  // 处理认证成功 / Handle authentication success
  const handleAuthSuccess = (authMethod: string, data: any) => {
    const newUserData = { ...data, authMethod }
    setUserData(newUserData)
    
    if (showOnlyAuth && onAuthSuccess) {
      // 如果只显示登录步骤，调用外部回调 / If only showing auth step, call external callback
      onAuthSuccess(authMethod, newUserData)
    } else {
      // 否则正常切换到身份选择步骤 / Otherwise normally switch to identity selection step
      setCurrentStep(REGISTRATION_STEPS.IDENTITY)
    }
  }

  // 处理角色选择 / Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
  }

  // 处理继续到平台 / Handle continue to platform
  const handleContinueToPlatform = () => {
    if (!selectedRole) return

    // 根据角色跳转到对应的dashboard / Navigate to corresponding dashboard based on role
    const dashboardPath = getDashboardPath(selectedRole)

    // 这里可以保存用户数据到localStorage或context / Save user data to localStorage or context
    saveUserData(userData, selectedRole)

    // 跳转到对应的dashboard / Navigate to corresponding dashboard
    router.push(dashboardPath)
  }

  // 返回认证步骤 / Go back to authentication step
  const handleBackToAuth = () => {
    setCurrentStep(REGISTRATION_STEPS.AUTH)
    setUserData(null)
    setSelectedRole(null)
  }

  return (
    <div className={isModal ? "w-full" : "min-h-screen bg-gradient-to-br from-fanforce-dark via-blue-900 to-fanforce-primary"}>
      {(currentStep === REGISTRATION_STEPS.AUTH && !showOnlyIdentity) ? (
        <QuickAuth 
          onAuthSuccess={handleAuthSuccess}
          onBack={onBack}
          isModal={isModal}
        />
      ) : (
        <div className="min-h-screen">
          {/* 返回按钮 / Back Button */}
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={handleBackToAuth}
              className="flex items-center text-fanforce-gold hover:text-fanforce-secondary transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {language === 'en' ? 'Back to Login' : '返回登录'}
            </button>
          </div>

          {/* 身份选择器 / Identity Selector */}
          <div className="pt-20 pb-8 px-4">
            <IdentitySelector
              registrationState={{
                currentStep: 2,
                completedSteps: [1],
                selectedPrimaryRole: selectedRole,
                selectedSecondaryRoles: [],
                authMethod: userData?.authMethod || null,
                personalInfo: {},
                roleSpecificData: {},
                isProcessing: false,
                errors: {},
                userId: userData?.id || ''
              }}
              updateState={(updates) => {
                if (updates.selectedPrimaryRole) {
                  setSelectedRole(updates.selectedPrimaryRole)
                }
              }}
              onNext={handleContinueToPlatform}
            />
          </div>
        </div>
      )}
    </div>
  )
}
