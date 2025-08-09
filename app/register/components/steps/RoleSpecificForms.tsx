// FanForce AI - 角色特定表单组件
// Role-Specific Forms Component - 第五步：收集角色特定信息
// Step 5: Collect role-specific information

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { RegistrationState, RoleSpecificData } from '../RegistrationWizard'
import FormField from '../shared/FormField'

interface RoleSpecificFormsProps {
  registrationState: RegistrationState
  updateState: (updates: Partial<RegistrationState>) => void
  onNext: () => void
}

// 运动项目选项 / Sports Options
const sportsOptions = [
  { value: 'football', label: 'Football', labelCn: '足球' },
  { value: 'basketball', label: 'Basketball', labelCn: '篮球' },
  { value: 'tennis', label: 'Tennis', labelCn: '网球' },
  { value: 'badminton', label: 'Badminton', labelCn: '羽毛球' },
  { value: 'table_tennis', label: 'Table Tennis', labelCn: '乒乓球' },
  { value: 'volleyball', label: 'Volleyball', labelCn: '排球' },
  { value: 'swimming', label: 'Swimming', labelCn: '游泳' },
  { value: 'track_field', label: 'Track & Field', labelCn: '田径' },
  { value: 'martial_arts', label: 'Martial Arts', labelCn: '武术' },
  { value: 'other', label: 'Other', labelCn: '其他' }
]

// 经验水平选项 / Experience Level Options
const experienceOptions = [
  { value: 'beginner', label: 'Beginner (0-1 years)', labelCn: '初学者 (0-1年)' },
  { value: 'intermediate', label: 'Intermediate (1-3 years)', labelCn: '中级 (1-3年)' },
  { value: 'advanced', label: 'Advanced (3-5 years)', labelCn: '高级 (3-5年)' },
  { value: 'expert', label: 'Expert (5+ years)', labelCn: '专家 (5年以上)' },
  { value: 'professional', label: 'Professional/Semi-Pro', labelCn: '职业/半职业' }
]

// 部门选项 / Department Options
const departmentOptions = [
  { value: 'sports_management', label: 'Sports Management', labelCn: '体育管理' },
  { value: 'marketing', label: 'Marketing', labelCn: '市场营销' },
  { value: 'event_planning', label: 'Event Planning', labelCn: '活动策划' },
  { value: 'business', label: 'Business Administration', labelCn: '工商管理' },
  { value: 'communications', label: 'Communications', labelCn: '传播学' },
  { value: 'computer_science', label: 'Computer Science', labelCn: '计算机科学' },
  { value: 'other', label: 'Other', labelCn: '其他' }
]

// 支持级别选项 / Support Level Options
const supportLevelOptions = [
  { value: 'casual', label: 'Casual Fan', labelCn: '休闲粉丝' },
  { value: 'active', label: 'Active Supporter', labelCn: '活跃支持者' },
  { value: 'hardcore', label: 'Hardcore Fan', labelCn: '铁杆粉丝' }
]

export default function RoleSpecificForms({ 
  registrationState, 
  updateState, 
  onNext 
}: RoleSpecificFormsProps) {
  const { language } = useLanguage()

  // 获取需要填写的角色列表 / Get roles that need forms
  const rolesToFill = [
    registrationState.selectedPrimaryRole,
    ...registrationState.selectedSecondaryRoles
  ].filter(role => role !== null) as UserRole[]

  // 更新角色特定数据 / Update role-specific data
  const updateRoleData = (role: UserRole, field: string, value: any) => {
    const roleDataKey = role === UserRole.ATHLETE ? 'athleteInfo' :
                       role === UserRole.AMBASSADOR ? 'ambassadorInfo' :
                       role === UserRole.AUDIENCE ? 'audienceInfo' : null

    if (!roleDataKey) return

    updateState({
      roleSpecificData: {
        ...registrationState.roleSpecificData,
        [roleDataKey]: {
          ...registrationState.roleSpecificData[roleDataKey],
          [field]: value
        }
      }
    })
  }

  // 渲染运动员表单 / Render Athlete Form
  const renderAthleteForm = () => {
    const data = registrationState.roleSpecificData.athleteInfo || {
      sports: [],
      experience: '',
      achievements: [],
      position: '',
      height: ''
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
            <span>🏃‍♂️</span>
            <span>{language === 'en' ? 'Athlete Information' : '运动员信息'}</span>
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            {language === 'en' 
              ? 'Tell us about your athletic background and specializations'
              : '告诉我们您的运动背景和专长'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 主要运动项目 / Primary Sport */}
          <FormField
            label="Primary Sport"
            labelCn="主要运动项目"
            name="primarySport"
            type="select"
            value={data.sports?.[0] || ''}
            onChange={(value) => {
              const newSports = [value, ...(data.sports?.slice(1) || [])]
              updateRoleData(UserRole.ATHLETE, 'sports', newSports)
            }}
            options={sportsOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />

          {/* 经验水平 / Experience Level */}
          <FormField
            label="Experience Level"
            labelCn="经验水平"
            name="experience"
            type="select"
            value={data.experience || ''}
            onChange={(value) => updateRoleData(UserRole.ATHLETE, 'experience', value)}
            options={experienceOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />

          {/* 位置/角色 / Position/Role */}
          <FormField
            label="Position/Role"
            labelCn="位置/角色"
            name="position"
            type="text"
            value={data.position || ''}
            onChange={(value) => updateRoleData(UserRole.ATHLETE, 'position', value)}
            placeholder="e.g., Forward, Midfielder, Guard"
            placeholderCn="例如：前锋、中场、后卫"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />

          {/* 身高 / Height */}
          <FormField
            label="Height (cm)"
            labelCn="身高 (厘米)"
            name="height"
            type="number"
            value={data.height || ''}
            onChange={(value) => updateRoleData(UserRole.ATHLETE, 'height', value)}
            placeholder="170"
            placeholderCn="170"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            }
          />
        </div>

        {/* 成就和奖项 / Achievements and Awards */}
        <FormField
          label="Achievements & Awards"
          labelCn="成就和奖项"
          name="achievements"
          type="textarea"
          value={data.achievements?.join('\n') || ''}
          onChange={(value) => updateRoleData(UserRole.ATHLETE, 'achievements', value.split('\n').filter(a => a.trim()))}
          placeholder="List your notable achievements, awards, or recognitions (one per line)"
          placeholderCn="列出您的显著成就、奖项或认可（每行一个）"
          rows={4}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          helpText="Optional: Share your sports achievements to build credibility"
          helpTextCn="可选：分享您的体育成就以建立可信度"
        />
      </div>
    )
  }

  // 渲染大使表单 / Render Ambassador Form
  const renderAmbassadorForm = () => {
    const data = registrationState.roleSpecificData.ambassadorInfo || {
      campus: '',
      department: '',
      previousEvents: 0,
      socialMedia: {
        instagram: '',
        twitter: '',
        wechat: ''
      }
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
            <span>🧑‍💼</span>
            <span>{language === 'en' ? 'Ambassador Information' : '大使信息'}</span>
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            {language === 'en' 
              ? 'Help us understand your background and motivation for being an ambassador'
              : '帮助我们了解您的背景和成为大使的动机'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 社区/地区 / Community/Region */}
          <FormField
            label="Community/Region"
            labelCn="社区/地区"
            name="campus"
            type="text"
            value={data.campus || ''}
            onChange={(value) => updateRoleData(UserRole.AMBASSADOR, 'campus', value)}
            placeholder="e.g., Local Sports Community Center"
            placeholderCn="例如：本地体育社区中心"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h4" />
              </svg>
            }
          />

          {/* 部门/专业 / Department/Major */}
          <FormField
            label="Department/Major"
            labelCn="部门/专业"
            name="department"
            type="select"
            value={data.department || ''}
            onChange={(value) => updateRoleData(UserRole.AMBASSADOR, 'department', value)}
            options={departmentOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />

          {/* 以往活动经验 / Previous Event Experience */}
          <FormField
            label="Previous Events Organized"
            labelCn="以往组织活动数量"
            name="previousEvents"
            type="number"
            value={data.previousEvents?.toString() || ''}
            onChange={(value) => updateRoleData(UserRole.AMBASSADOR, 'previousEvents', parseInt(value) || 0)}
            placeholder="0"
            placeholderCn="0"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            helpText="How many events have you organized before?"
            helpTextCn="您之前组织过多少次活动？"
          />

          {/* Instagram */}
          <FormField
            label="Instagram Handle"
            labelCn="Instagram账号"
            name="instagram"
            type="text"
            value={data.socialMedia?.instagram || ''}
            onChange={(value) => updateRoleData(UserRole.AMBASSADOR, 'socialMedia', {
              ...data.socialMedia,
              instagram: value
            })}
            placeholder="@username"
            placeholderCn="@用户名"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          />
        </div>

        {/* 微信 / WeChat */}
        <FormField
          label="WeChat ID"
          labelCn="微信号"
          name="wechat"
          type="text"
          value={data.socialMedia?.wechat || ''}
          onChange={(value) => updateRoleData(UserRole.AMBASSADOR, 'socialMedia', {
            ...data.socialMedia,
            wechat: value
          })}
          placeholder="Enter your WeChat ID"
          placeholderCn="输入您的微信号"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
          helpText="Optional: For communication with Chinese students"
          helpTextCn="可选：用于与中国学生沟通"
        />
      </div>
    )
  }

  // 渲染观众表单 / Render Audience Form
  const renderAudienceForm = () => {
    const data = registrationState.roleSpecificData.audienceInfo || {
      favoriteTeams: [],
      supportLevel: 'casual' as const,
      interests: []
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
            <span>🙋‍♂️</span>
            <span>{language === 'en' ? 'Supporter Information' : '支持者信息'}</span>
          </h3>
          <p className="text-gray-400 text-sm mt-2">
            {language === 'en' 
              ? 'Tell us about your interests and support preferences'
              : '告诉我们您的兴趣和支持偏好'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 支持级别 / Support Level */}
          <FormField
            label="Support Level"
            labelCn="支持级别"
            name="supportLevel"
            type="select"
            value={data.supportLevel || ''}
            onChange={(value) => updateRoleData(UserRole.AUDIENCE, 'supportLevel', value)}
            options={supportLevelOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />

          {/* 感兴趣的运动 / Interested Sports */}
          <FormField
            label="Interested Sports"
            labelCn="感兴趣的运动"
            name="interests"
            type="select"
            value={data.interests?.[0] || ''}
            onChange={(value) => {
              const newInterests = [value, ...(data.interests?.slice(1) || [])]
              updateRoleData(UserRole.AUDIENCE, 'interests', newInterests)
            }}
            options={sportsOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />
        </div>

        {/* 喜爱的队伍 / Favorite Teams */}
        <FormField
          label="Favorite Teams"
          labelCn="喜爱的队伍"
          name="favoriteTeams"
          type="textarea"
          value={data.favoriteTeams?.join('\n') || ''}
          onChange={(value) => updateRoleData(UserRole.AUDIENCE, 'favoriteTeams', value.split('\n').filter(t => t.trim()))}
          placeholder="List your favorite teams or athletes (one per line)"
          placeholderCn="列出您喜爱的队伍或运动员（每行一个）"
          rows={3}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
          helpText="Optional: Help us recommend relevant events and matches"
          helpTextCn="可选：帮助我们推荐相关活动和比赛"
        />
      </div>
    )
  }

  // 验证并继续 / Validate and continue
  const handleContinue = () => {
    // 基本验证逻辑 / Basic validation logic
    const hasRequiredData = rolesToFill.every(role => {
      if (role === UserRole.ATHLETE) {
        const data = registrationState.roleSpecificData.athleteInfo
        return data?.sports?.length > 0 && data?.experience
      }
      if (role === UserRole.AMBASSADOR) {
        const data = registrationState.roleSpecificData.ambassadorInfo
        return data?.campus && data?.department
      }
      if (role === UserRole.AUDIENCE) {
        const data = registrationState.roleSpecificData.audienceInfo
        return data?.supportLevel && data?.interests?.length > 0
      }
      return true
    })

    if (!hasRequiredData) {
      // 这里可以添加更详细的错误处理 / More detailed error handling can be added here
      return
    }

    onNext()
  }

  return (
    <div className="space-y-8">
      {/* 步骤标题 / Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          {language === 'en' ? 'Role-Specific Details' : '角色特定详情'}
        </h2>
        <p className="text-gray-300 text-lg">
          {language === 'en' 
            ? 'Provide details for your selected roles to optimize your experience'
            : '为您选择的角色提供详细信息以优化您的体验'
          }
        </p>
      </div>

      {/* 角色表单列表 / Role Forms List */}
      <div className="space-y-8">
        {rolesToFill.map((role, index) => (
          <div key={role} className="bg-white/5 rounded-2xl p-8 border border-white/10">
            {role === UserRole.ATHLETE && renderAthleteForm()}
            {role === UserRole.AMBASSADOR && renderAmbassadorForm()}
            {role === UserRole.AUDIENCE && renderAudienceForm()}
          </div>
        ))}
      </div>

      {/* 提示信息 / Hint Information */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-400 text-xl flex-shrink-0">💡</div>
          <div className="text-sm text-gray-300">
            <p className="font-medium text-yellow-400 mb-1">
              {language === 'en' ? 'Pro Tip' : '专业提示'}
            </p>
            <p>
              {language === 'en' 
                ? 'The more detailed information you provide, the better we can match you with relevant opportunities and events. You can always update this information later in your profile.'
                : '您提供的信息越详细，我们就能更好地为您匹配相关机会和活动。您可以随时在个人资料中更新这些信息。'
              }
            </p>
          </div>
        </div>
      </div>

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
          "
        >
          <span>
            {language === 'en' ? 'Complete Registration' : '完成注册'}
          </span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
