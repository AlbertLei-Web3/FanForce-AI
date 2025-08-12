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
    showOnlyIdentity ? 'identity' : 'auth'
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
      setCurrentStep('identity')
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
    let dashboardPath = '/dashboard'
    
    switch (selectedRole) {
      case UserRole.AUDIENCE:
        dashboardPath = '/dashboard/audience'
        break
      case UserRole.ATHLETE:
        dashboardPath = '/dashboard/athlete'
        break
      case UserRole.AMBASSADOR:
        dashboardPath = '/dashboard/ambassador'
        break
      default:
        dashboardPath = '/dashboard'
    }

    // 这里可以保存用户数据到localStorage或context / Save user data to localStorage or context
    localStorage.setItem('userData', JSON.stringify({
      ...userData,
      selectedRole,
      registrationCompleted: true
    }))

    // 跳转到对应的dashboard / Navigate to corresponding dashboard
    router.push(dashboardPath)
  }

  // 返回认证步骤 / Go back to authentication step
  const handleBackToAuth = () => {
    setCurrentStep('auth')
    setUserData(null)
    setSelectedRole(null)
  }

  return (
    <div className={isModal ? "w-full" : "min-h-screen bg-gradient-to-br from-fanforce-dark via-blue-900 to-fanforce-primary"}>
      {(currentStep === 'auth' && !showOnlyIdentity) ? (
        <QuickAuth 
          onAuthSuccess={handleAuthSuccess}
          onBack={onBack}
          isModal={isModal}
        />
      ) : (
        <div className={isModal ? "w-full" : "min-h-screen flex items-center justify-center p-4"}>
          <div className="w-full max-w-4xl">
            {/* 步骤指示器 / Step Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-fanforce-gold rounded-full flex items-center justify-center text-fanforce-dark font-bold text-sm">
                    1
                  </div>
                  <span className={`ml-2 text-sm ${isModal ? 'text-white/80' : 'text-white/60'}`}>
                    {language === 'en' ? 'Authentication' : '身份验证'}
                  </span>
                </div>
                <div className={`w-8 h-1 rounded ${isModal ? 'bg-white/30' : 'bg-white/20'}`}></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-fanforce-gold rounded-full flex items-center justify-center text-fanforce-dark font-bold text-sm">
                    2
                  </div>
                  <span className={`ml-2 font-medium text-sm ${isModal ? 'text-white' : 'text-white'}`}>
                    {language === 'en' ? 'Choose Role' : '选择角色'}
                  </span>
                </div>
              </div>
            </div>

            {/* 身份选择器 / Identity Selector */}
            <div className="mb-8">
              <IdentitySelector
                registrationState={{
                  currentStep: 1, // RegistrationStep.IDENTITY_SELECTION
                  completedSteps: [],
                  selectedPrimaryRole: selectedRole,
                  selectedSecondaryRoles: [],
                  authMethod: null,
                  personalInfo: {},
                  roleSpecificData: {},
                  isProcessing: false,
                  errors: {}
                }}
                updateState={(updates) => {
                  if (updates.selectedPrimaryRole) {
                    setSelectedRole(updates.selectedPrimaryRole)
                  }
                }}
                onNext={() => {}} // 不使用原有的onNext逻辑
              />
            </div>

            {/* 继续按钮 / Continue Button */}
            {/* 已删除重复的提示，IdentitySelector组件中已有相同功能 / Removed duplicate toast, IdentitySelector component already has the same functionality */}
            {/* {selectedRole && (
              <div className="text-center animate-fadeIn">
                <div className={`rounded-2xl p-6 border mb-6 ${
                  isModal 
                    ? 'bg-gradient-to-r from-white/10 to-white/5 border-white/20' 
                    : 'bg-gradient-to-r from-fanforce-primary/10 to-fanforce-accent/10 border-fanforce-primary/20'
                }`}>
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-fanforce-gold rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-fanforce-dark" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={`font-medium ${isModal ? 'text-white' : 'text-white'}`}>
                      {language === 'en' ? 'Role Selected!' : '角色已选择！'}
                    </p>
                  </div>
                  <p className={`text-sm mb-4 ${isModal ? 'text-white/80' : 'text-gray-300'}`}>
                    {language === 'en' 
                      ? `You've selected ${selectedRole}. Ready to enter platform?`
                      : `您已选择${selectedRole}。准备进入平台吗？`
                    }
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleBackToAuth}
                      className={`px-6 py-3 font-medium rounded-xl transition-all duration-200 border ${
                        isModal 
                          ? 'bg-white/10 hover:bg-white/20 text-white border-white/30' 
                          : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                      }`}
                    >
                      {language === 'en' ? 'Change Role' : '更换角色'}
                    </button>
                    <button
                      onClick={handleContinueToPlatform}
                      className={`px-6 py-3 font-medium rounded-xl transition-all duration-200 ${
                        isModal 
                          ? 'bg-gradient-to-r from-fanforce-primary to-fanforce-secondary text-white hover:from-fanforce-secondary hover:to-fanforce-primary' 
                          : 'bg-gradient-to-r from-fanforce-primary to-fanforce-accent text-white hover:from-fanforce-accent hover:to-fanforce-primary'
                      }`}
                    >
                      {language === 'en' ? 'Enter Platform' : '进入平台'}
                    </button>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  )
}
