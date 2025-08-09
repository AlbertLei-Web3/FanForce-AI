// FanForce AI - 步骤导航组件
// Step Navigation Component - 注册向导的前进/后退导航控制
// Forward/backward navigation controls for registration wizard

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { RegistrationStep } from '../RegistrationWizard'

interface StepNavigationProps {
  currentStep: RegistrationStep
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  isProcessing: boolean
  canGoNext: boolean
  nextButtonText?: string
  showSkip?: boolean
  onSkip?: () => void
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  isProcessing,
  canGoNext,
  nextButtonText,
  showSkip = false,
  onSkip
}: StepNavigationProps) {
  const { language } = useLanguage()

  // 是否显示上一步按钮 / Whether to show previous button
  const showPrevious = currentStep > 1

  // 是否是最后一步 / Whether it's the last step
  const isLastStep = currentStep === totalSteps

  // 获取下一步按钮文本 / Get next button text
  const getNextButtonText = () => {
    if (nextButtonText) return nextButtonText
    
    if (isLastStep) {
      return language === 'en' ? 'Complete Registration' : '完成注册'
    }
    
    return language === 'en' ? 'Continue' : '继续'
  }

  // 获取下一步按钮图标 / Get next button icon
  const getNextButtonIcon = () => {
    if (isProcessing) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      )
    }
    
    if (isLastStep) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    )
  }

  return (
    <div className="flex items-center justify-between">
      {/* 左侧：上一步按钮 / Left: Previous Button */}
      <div className="flex items-center space-x-4">
        {showPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isProcessing}
            className="
              flex items-center space-x-2 px-4 py-2 
              text-gray-300 hover:text-white 
              bg-white/5 hover:bg-white/10 
              border border-gray-600 hover:border-gray-500
              rounded-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>{language === 'en' ? 'Previous' : '上一步'}</span>
          </button>
        ) : (
          <div /> // 占位元素确保右侧按钮对齐 / Placeholder to ensure right-side button alignment
        )}

        {/* 跳过按钮（可选）/ Skip Button (Optional) */}
        {showSkip && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isProcessing}
            className="
              text-sm text-gray-400 hover:text-gray-300 
              underline transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {language === 'en' ? 'Skip this step' : '跳过此步骤'}
          </button>
        )}
      </div>

      {/* 中间：步骤信息 / Center: Step Information */}
      <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
        <span>
          {language === 'en' ? 'Step' : '步骤'} {currentStep} {language === 'en' ? 'of' : '/'} {totalSteps}
        </span>
      </div>

      {/* 右侧：下一步/完成按钮 / Right: Next/Complete Button */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isProcessing}
          className={`
            flex items-center space-x-2 px-6 py-3 
            text-white font-medium rounded-lg 
            transition-all duration-200 transform
            disabled:opacity-50 disabled:cursor-not-allowed
            ${isLastStep 
              ? 'bg-fanforce-accent hover:bg-green-600 shadow-lg shadow-fanforce-accent/30' 
              : 'bg-fanforce-primary hover:bg-blue-700 shadow-lg shadow-fanforce-primary/30'
            }
            ${!isProcessing && canGoNext ? 'hover:scale-105 active:scale-95' : ''}
          `}
        >
          <span>{getNextButtonText()}</span>
          {getNextButtonIcon()}
        </button>
      </div>
    </div>
  )
}
