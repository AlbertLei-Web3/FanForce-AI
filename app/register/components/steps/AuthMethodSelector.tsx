// FanForce AI - 认证方式选择器组件
// Auth Method Selector Component - 第二步：选择认证方式（钱包或ICP）
// Step 2: Select authentication method (Wallet or ICP)

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { RegistrationState, AuthMethod } from '../RegistrationWizard'

interface AuthMethodSelectorProps {
  registrationState: RegistrationState
  updateState: (updates: Partial<RegistrationState>) => void
  onNext: () => void
}

// 认证方式选项配置 / Auth Method Options Configuration
const authMethodOptions = [
  {
    method: AuthMethod.WALLET,
    icon: '🔗',
    title: { en: 'Web3 Wallet', cn: 'Web3钱包' },
    subtitle: { en: 'Connect with MetaMask, WalletConnect, etc.', cn: '使用MetaMask、WalletConnect等连接' },
    description: { 
      en: 'Use your existing Web3 wallet to sign transactions and manage your digital assets',
      cn: '使用您现有的Web3钱包签署交易并管理您的数字资产'
    },
    features: [
      { en: 'Compatible with MetaMask, Trust Wallet, etc.', cn: '兼容MetaMask、Trust Wallet等' },
      { en: 'Direct blockchain interactions', cn: '直接区块链交互' },
      { en: 'Full custody of your assets', cn: '完全掌控您的资产' },
      { en: 'Standard Web3 signing', cn: '标准Web3签名' }
    ],
    pros: [
      { en: 'Familiar to crypto users', cn: '加密用户熟悉' },
      { en: 'Industry standard', cn: '行业标准' },
      { en: 'Wide compatibility', cn: '广泛兼容性' }
    ],
    cons: [
      { en: 'Requires wallet setup', cn: '需要钱包设置' },
      { en: 'Gas fees for transactions', cn: '交易需要手续费' }
    ],
    gradient: 'from-purple-500 to-indigo-600',
    popular: true,
    difficulty: 'intermediate'
  },
  {
    method: AuthMethod.ICP,
    icon: '🔮',
    title: { en: 'Internet Identity (ICP)', cn: 'Internet Identity (ICP)' },
    subtitle: { en: 'Secure, passwordless authentication', cn: '安全、无密码认证' },
    description: { 
      en: 'Use Internet Computer\'s innovative identity system for seamless, secure access',
      cn: '使用Internet Computer的创新身份系统实现无缝、安全访问'
    },
    features: [
      { en: 'Passwordless authentication', cn: '无密码认证' },
      { en: 'Biometric security support', cn: '生物识别安全支持' },
      { en: 'Cross-device synchronization', cn: '跨设备同步' },
      { en: 'Privacy-focused design', cn: '注重隐私的设计' }
    ],
    pros: [
      { en: 'No seed phrases to remember', cn: '无需记住助记词' },
      { en: 'Enhanced security', cn: '增强安全性' },
      { en: 'User-friendly', cn: '用户友好' }
    ],
    cons: [
      { en: 'Newer technology', cn: '较新技术' },
      { en: 'Limited ecosystem support', cn: '生态系统支持有限' }
    ],
    gradient: 'from-cyan-500 to-blue-600',
    popular: false,
    difficulty: 'beginner'
  }
]

export default function AuthMethodSelector({ 
  registrationState, 
  updateState, 
  onNext 
}: AuthMethodSelectorProps) {
  const { language } = useLanguage()

  // 处理认证方式选择 / Handle auth method selection
  const handleAuthMethodSelect = (method: AuthMethod) => {
    updateState({
      authMethod: method,
      errors: { ...registrationState.errors, authMethod: undefined }
    })
  }

  // 处理继续按钮点击 / Handle continue button click
  const handleContinue = () => {
    if (registrationState.authMethod) {
      onNext()
    }
  }

  // 获取难度标签 / Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      beginner: { 
        en: 'Beginner Friendly', 
        cn: '新手友好', 
        color: 'bg-green-600' 
      },
      intermediate: { 
        en: 'Some Experience Required', 
        cn: '需要一些经验', 
        color: 'bg-yellow-600' 
      },
      advanced: { 
        en: 'Advanced Users', 
        cn: '高级用户', 
        color: 'bg-red-600' 
      }
    }
    
    const badge = badges[difficulty as keyof typeof badges]
    return (
      <div className={`${badge.color} text-white text-xs font-medium px-2 py-1 rounded-full`}>
        {language === 'en' ? badge.en : badge.cn}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 步骤标题 / Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          {language === 'en' ? 'Choose Authentication Method' : '选择认证方式'}
        </h2>
        <p className="text-gray-300 text-lg">
          {language === 'en' 
            ? 'Select how you want to securely access your account'
            : '选择您希望如何安全访问您的账户'
          }
        </p>
        {registrationState.errors.authMethod && (
          <p className="text-red-400 text-sm mt-2">
            {registrationState.errors.authMethod}
          </p>
        )}
      </div>

      {/* 认证方式选项 / Auth Method Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {authMethodOptions.map((option) => {
          const isSelected = registrationState.authMethod === option.method
          
          return (
            <div
              key={option.method}
              className={`
                relative group cursor-pointer transition-all duration-300
                ${isSelected ? 'scale-105' : 'hover:scale-102'}
              `}
              onClick={() => handleAuthMethodSelect(option.method)}
            >
              {/* 热门标签 / Popular Badge */}
              {option.popular && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="bg-fanforce-gold text-fanforce-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {language === 'en' ? 'Recommended' : '推荐'}
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
                backdrop-blur-sm min-h-[600px] flex flex-col
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

                {/* 方法图标和标题 / Method Icon and Title */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{option.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {language === 'en' ? option.title.en : option.title.cn}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {language === 'en' ? option.subtitle.en : option.subtitle.cn}
                    </p>
                  </div>
                </div>

                {/* 难度标签 / Difficulty Badge */}
                <div className="mb-4">
                  {getDifficultyBadge(option.difficulty)}
                </div>

                {/* 方法描述 / Method Description */}
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  {language === 'en' ? option.description.en : option.description.cn}
                </p>

                {/* 功能特性列表 / Feature List */}
                <div className="mb-6 flex-1">
                  <h4 className="text-white font-medium mb-3">
                    {language === 'en' ? 'Features:' : '功能特性：'}
                  </h4>
                  <div className="space-y-2">
                    {option.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <svg className="w-4 h-4 text-fanforce-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
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
                </div>

                {/* 优缺点对比 / Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* 优点 / Pros */}
                  <div>
                    <h5 className="text-green-400 font-medium text-sm mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      {language === 'en' ? 'Pros' : '优点'}
                    </h5>
                    <div className="space-y-1">
                      {option.pros.map((pro, index) => (
                        <div key={index} className="text-xs text-gray-400">
                          + {language === 'en' ? pro.en : pro.cn}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 缺点 / Cons */}
                  <div>
                    <h5 className="text-yellow-400 font-medium text-sm mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      {language === 'en' ? 'Considerations' : '注意事项'}
                    </h5>
                    <div className="space-y-1">
                      {option.cons.map((con, index) => (
                        <div key={index} className="text-xs text-gray-400">
                          • {language === 'en' ? con.en : con.cn}
                        </div>
                      ))}
                    </div>
                  </div>
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

      {/* 安全提示 / Security Notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 text-xl flex-shrink-0">🔒</div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-1">
              {language === 'en' ? 'Security Note' : '安全提示'}
            </p>
            <p>
              {language === 'en' 
                ? 'Both authentication methods provide robust security. Your choice depends on your familiarity with Web3 technology and personal preferences. You can always change your authentication method later in settings.'
                : '两种认证方式都提供强大的安全性。您的选择取决于您对Web3技术的熟悉程度和个人偏好。您可以随时在设置中更改认证方式。'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 快速继续按钮（选中方式后显示）/ Quick Continue Button (shown after method selection) */}
      {registrationState.authMethod && (
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
              {language === 'en' ? 'Continue with' : '继续使用'} {' '}
              {language === 'en' 
                ? authMethodOptions.find(opt => opt.method === registrationState.authMethod)?.title.en
                : authMethodOptions.find(opt => opt.method === registrationState.authMethod)?.title.cn
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
