// FanForce AI - 个人信息表单组件
// Personal Info Form Component - 第四步：收集用户基本个人信息
// Step 4: Collect user's basic personal information

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { RegistrationState } from '../RegistrationWizard'
import FormField from '../shared/FormField'

interface PersonalInfoFormProps {
  registrationState: RegistrationState
  updateState: (updates: Partial<RegistrationState>) => void
  onNext: () => void
}

// 大学选项 / University Options
const universityOptions = [
  { value: 'beijing_university', label: 'Beijing University', labelCn: '北京大学' },
  { value: 'tsinghua_university', label: 'Tsinghua University', labelCn: '清华大学' },
  { value: 'fudan_university', label: 'Fudan University', labelCn: '复旦大学' },
  { value: 'shanghai_jiaotong', label: 'Shanghai Jiao Tong University', labelCn: '上海交通大学' },
  { value: 'zhejiang_university', label: 'Zhejiang University', labelCn: '浙江大学' },
  { value: 'nanjing_university', label: 'Nanjing University', labelCn: '南京大学' },
  { value: 'xian_jiaotong', label: 'Xi\'an Jiaotong University', labelCn: '西安交通大学' },
  { value: 'huazhong_university', label: 'Huazhong University of Science and Technology', labelCn: '华中科技大学' },
  { value: 'other', label: 'Other University', labelCn: '其他大学' }
]

export default function PersonalInfoForm({ 
  registrationState, 
  updateState, 
  onNext 
}: PersonalInfoFormProps) {
  const { language } = useLanguage()

  // 更新个人信息字段 / Update personal info field
  const updatePersonalInfo = (field: string, value: string) => {
    updateState({
      personalInfo: {
        ...registrationState.personalInfo,
        [field]: value
      },
      // 清除该字段的错误 / Clear error for this field
      errors: {
        ...registrationState.errors,
        [field]: undefined
      }
    })
  }

  // 验证并继续 / Validate and continue
  const handleContinue = () => {
    const { personalInfo } = registrationState
    const errors: Record<string, string> = {}

    // 验证必填字段 / Validate required fields
    if (!personalInfo.username?.trim()) {
      errors.username = language === 'en' ? 'Username is required' : '用户名为必填项'
    } else if (personalInfo.username.length < 2) {
      errors.username = language === 'en' ? 'Username must be at least 2 characters' : '用户名至少需要2个字符'
    } else if (personalInfo.username.length > 20) {
      errors.username = language === 'en' ? 'Username must be less than 20 characters' : '用户名不能超过20个字符'
    }

    if (!personalInfo.email?.trim()) {
      errors.email = language === 'en' ? 'Email is required' : '邮箱为必填项'
    } else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) {
      errors.email = language === 'en' ? 'Invalid email format' : '邮箱格式无效'
    }

    if (!personalInfo.university?.trim()) {
      errors.university = language === 'en' ? 'University is required' : '大学为必填项'
    }

    // 验证可选但有格式要求的字段 / Validate optional but format-constrained fields
    if (personalInfo.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(personalInfo.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = language === 'en' ? 'Invalid phone number format' : '手机号格式无效'
    }

    if (Object.keys(errors).length > 0) {
      updateState({ errors })
      return
    }

    // 验证通过，继续下一步 / Validation passed, continue to next step
    onNext()
  }

  return (
    <div className="space-y-8">
      {/* 步骤标题 / Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          {language === 'en' ? 'Personal Information' : '个人信息'}
        </h2>
        <p className="text-gray-300 text-lg">
          {language === 'en' 
            ? 'Tell us a bit about yourself to personalize your experience'
            : '告诉我们一些关于您的信息，以个性化您的体验'
          }
        </p>
      </div>

      {/* 个人信息表单 / Personal Information Form */}
      <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 用户名 / Username */}
          <div className="md:col-span-1">
            <FormField
              label="Username"
              labelCn="用户名"
              name="username"
              type="text"
              value={registrationState.personalInfo.username || ''}
              onChange={(value) => updatePersonalInfo('username', value)}
              error={registrationState.errors.username}
              placeholder="Enter your username"
              placeholderCn="输入您的用户名"
              required
              maxLength={20}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              helpText="This will be your display name on the platform"
              helpTextCn="这将是您在平台上的显示名称"
            />
          </div>

          {/* 邮箱 / Email */}
          <div className="md:col-span-1">
            <FormField
              label="Email Address"
              labelCn="邮箱地址"
              name="email"
              type="email"
              value={registrationState.personalInfo.email || ''}
              onChange={(value) => updatePersonalInfo('email', value)}
              error={registrationState.errors.email}
              placeholder="Enter your email"
              placeholderCn="输入您的邮箱"
              required
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
              helpText="For important notifications and account recovery"
              helpTextCn="用于重要通知和账户恢复"
            />
          </div>

          {/* 大学 / University */}
          <div className="md:col-span-1">
            <FormField
              label="University"
              labelCn="大学"
              name="university"
              type="select"
              value={registrationState.personalInfo.university || ''}
              onChange={(value) => updatePersonalInfo('university', value)}
              error={registrationState.errors.university}
              required
              options={universityOptions}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h4" />
                </svg>
              }
              helpText="Your current educational institution"
              helpTextCn="您当前的教育机构"
            />
          </div>

          {/* 学号 / Student ID */}
          <div className="md:col-span-1">
            <FormField
              label="Student ID"
              labelCn="学号"
              name="studentId"
              type="text"
              value={registrationState.personalInfo.studentId || ''}
              onChange={(value) => updatePersonalInfo('studentId', value)}
              error={registrationState.errors.studentId}
              placeholder="Enter your student ID"
              placeholderCn="输入您的学号"
              maxLength={20}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              }
              helpText="Optional: For verification and university-specific features"
              helpTextCn="可选：用于验证和大学特定功能"
            />
          </div>

          {/* 手机号 / Phone Number */}
          <div className="md:col-span-1">
            <FormField
              label="Phone Number"
              labelCn="手机号"
              name="phone"
              type="tel"
              value={registrationState.personalInfo.phone || ''}
              onChange={(value) => updatePersonalInfo('phone', value)}
              error={registrationState.errors.phone}
              placeholder="Enter your phone number"
              placeholderCn="输入您的手机号"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
              helpText="Optional: For SMS notifications and two-factor authentication"
              helpTextCn="可选：用于短信通知和双重认证"
            />
          </div>

          {/* 紧急联系人 / Emergency Contact */}
          <div className="md:col-span-1">
            <FormField
              label="Emergency Contact"
              labelCn="紧急联系人"
              name="emergencyContact"
              type="text"
              value={registrationState.personalInfo.emergencyContact || ''}
              onChange={(value) => updatePersonalInfo('emergencyContact', value)}
              error={registrationState.errors.emergencyContact}
              placeholder="Name and phone number"
              placeholderCn="姓名和电话号码"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
              helpText="Optional: For safety purposes during events"
              helpTextCn="可选：活动期间的安全目的"
            />
          </div>
        </div>
      </div>

      {/* 隐私和条款说明 / Privacy and Terms Notice */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-400 text-xl flex-shrink-0">🔒</div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-blue-400 mb-2">
              {language === 'en' ? 'Privacy & Security' : '隐私与安全'}
            </p>
            <div className="space-y-1">
              <p>
                {language === 'en' 
                  ? '• Your personal information is encrypted and stored securely'
                  : '• 您的个人信息已加密并安全存储'
                }
              </p>
              <p>
                {language === 'en' 
                  ? '• We only use your data to provide platform services'
                  : '• 我们仅使用您的数据提供平台服务'
                }
              </p>
              <p>
                {language === 'en' 
                  ? '• You can update or delete your information anytime in settings'
                  : '• 您可以随时在设置中更新或删除您的信息'
                }
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              {language === 'en' 
                ? 'By continuing, you agree to our Terms of Service and Privacy Policy'
                : '继续操作即表示您同意我们的服务条款和隐私政策'
              }
            </p>
          </div>
        </div>
      </div>

      {/* 表单验证提示 / Form Validation Notice */}
      {Object.keys(registrationState.errors).length > 0 && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-red-400 text-xl flex-shrink-0">⚠️</div>
            <div className="text-sm text-gray-300">
              <p className="font-medium text-red-400 mb-2">
                {language === 'en' ? 'Please fix the following errors:' : '请修复以下错误：'}
              </p>
              <ul className="space-y-1 text-xs">
                {Object.entries(registrationState.errors).map(([field, error]) => (
                  error && (
                    <li key={field} className="text-red-300">
                      • {error}
                    </li>
                  )
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 继续按钮 / Continue Button */}
      <div className="text-center">
        <button
          onClick={handleContinue}
          className="
            inline-flex items-center space-x-2 px-8 py-3
            bg-fanforce-primary hover:bg-blue-700 
            text-white font-medium rounded-lg
            shadow-lg shadow-fanforce-primary/30
            transition-all duration-200 transform hover:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <span>
            {language === 'en' ? 'Continue to Role Details' : '继续到角色详情'}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
