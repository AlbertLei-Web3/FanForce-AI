// FanForce AI - 个人信息编辑页面
// Personal Profile Edit Page - 用户个人信息编辑和管理
// User personal information editing and management page
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色和认证状态
// - FormField.tsx: 表单字段组件

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { useUser } from '@/app/context/UserContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import { useToast } from '@/app/components/shared/Toast'
import { 
  FaUser, 
  FaEnvelope, 
  FaBuilding, 
  FaIdCard, 
  FaPhone, 
  FaExclamationTriangle,
  FaSave,
  FaUndo,
  FaShieldAlt,
  FaTrophy,
  FaUsers,
  FaStar
} from 'react-icons/fa'

// 个人信息接口 / Personal Information Interface
interface PersonalInfo {
  username: string
  email: string
  phone: string
  emergencyContact: string
}

// 角色特定信息接口 / Role-Specific Information Interface
interface RoleSpecificInfo {
  // 运动员特有信息 / Athlete-specific information
  primarySport?: string
  experienceLevel?: string
  position?: string
  height?: string
  achievements?: string
  
  // 观众特有信息 / Audience-specific information
  supportLevel?: string
  interestedSports?: string
  favoriteTeams?: string
  
  // 大使特有信息 / Ambassador-specific information
  campus?: string
  department?: string
  ambassadorLevel?: string
}

export default function ProfilePage() {
  const { language, t } = useLanguage()
  const { authState, updateUser } = useUser()
  const { showToast } = useToast()
  
  // 表单状态 / Form state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    username: '',
    email: '',
    phone: '',
    emergencyContact: ''
  })
  
  const [roleSpecificInfo, setRoleSpecificInfo] = useState<RoleSpecificInfo>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [originalData, setOriginalData] = useState<any>(null)

  // 运动项目选项 / Sports options
  const sportsOptions = [
    '足球', '篮球', '网球', '羽毛球', '乒乓球', 
    '排球', '游泳', '田径', '武术', '其他'
  ]

  // 经验水平选项 / Experience level options
  const experienceLevels = [
    '初学者 (0-1年)',
    '中级 (1-3年)', 
    '高级 (3-5年)',
    '专家 (5年以上)',
    '职业/半职业'
  ]

  // 支持级别选项 / Support level options
  const supportLevels = [
    '休闲粉丝 (Casual Fan)',
    '活跃支持者 (Active Supporter)',
    '铁杆粉丝 (Hardcore Fan)'
  ]

  // 初始化数据 / Initialize data
  useEffect(() => {
    if (authState.user) {
      const userData = {
        username: authState.user.username || '',
        email: authState.user.email || '',
        phone: authState.user.phone || '',
        emergencyContact: authState.user.emergencyContact || ''
      }
      
      setPersonalInfo(userData)
      setOriginalData(userData)
      
      // 设置角色特定信息 / Set role-specific information
      if (authState.user.roleSpecificData) {
        setRoleSpecificInfo(authState.user.roleSpecificData)
      }
    }
  }, [authState.user])

  // 处理个人信息变更 / Handle personal info changes
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理角色特定信息变更 / Handle role-specific info changes
  const handleRoleSpecificInfoChange = (field: keyof RoleSpecificInfo, value: any) => {
    setRoleSpecificInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 保存更改 / Save changes
  const handleSave = async () => {
    setIsLoading(true)
    try {
      // 这里应该调用API保存数据 / Here should call API to save data
      // await updateUser({ ...personalInfo, roleSpecificData: roleSpecificInfo })
      
      showToast(
        language === 'en' ? 'Profile updated successfully!' : '档案更新成功！',
        'success'
      )
      setIsEditing(false)
      setOriginalData({ ...personalInfo, roleSpecificData: roleSpecificInfo })
    } catch (error) {
      showToast(
        language === 'en' ? 'Failed to update profile' : '档案更新失败',
        'error'
      )
    } finally {
      setIsLoading(false)
    }
  }

  // 取消编辑 / Cancel editing
  const handleCancel = () => {
    setPersonalInfo(originalData)
    setRoleSpecificInfo(originalData?.roleSpecificData || {})
    setIsEditing(false)
  }

  // 渲染基础个人信息表单 / Render basic personal info form
  const renderPersonalInfoForm = () => (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center mb-6">
        <FaUser className="text-2xl text-fanforce-gold mr-3" />
        <h2 className="text-xl font-bold text-white">
          {language === 'en' ? 'Basic Personal Information' : '基础个人信息'}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 用户名 / Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {language === 'en' ? 'Username' : '用户名'} *
          </label>
          <input
            type="text"
            value={personalInfo.username}
            onChange={(e) => handlePersonalInfoChange('username', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
            placeholder={language === 'en' ? 'Enter username' : '输入用户名'}
          />
        </div>

        {/* 邮箱地址 / Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {language === 'en' ? 'Email Address' : '邮箱地址'} *
          </label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
            placeholder={language === 'en' ? 'Enter email' : '输入邮箱'}
          />
        </div>

        {/* 手机号 / Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {language === 'en' ? 'Phone Number' : '手机号'}
          </label>
          <input
            type="tel"
            value={personalInfo.phone}
            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
            placeholder={language === 'en' ? 'Enter phone number' : '输入手机号'}
          />
        </div>

        {/* 紧急联系人 / Emergency Contact */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {language === 'en' ? 'Emergency Contact' : '紧急联系人'}
          </label>
          <input
            type="text"
            value={personalInfo.emergencyContact}
            onChange={(e) => handlePersonalInfoChange('emergencyContact', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
            placeholder={language === 'en' ? 'Enter emergency contact' : '输入紧急联系人'}
          />
        </div>
      </div>
    </div>
  )

  // 渲染角色特定信息表单 / Render role-specific info form
  const renderRoleSpecificForm = () => {
    return (
      <div className="space-y-6">
        {/* 运动员信息 / Athlete Information */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-6">
            <FaTrophy className="text-2xl text-fanforce-gold mr-3" />
            <h2 className="text-xl font-bold text-white">
              {language === 'en' ? 'Athlete Information' : '运动员信息'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 主要运动项目 / Primary Sport */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Primary Sport' : '主要运动项目'} *
              </label>
              <select
                value={roleSpecificInfo.primarySport || ''}
                onChange={(e) => handleRoleSpecificInfoChange('primarySport', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select sport' : '选择运动项目'}</option>
                {sportsOptions.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* 经验水平 / Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Experience Level' : '经验水平'} *
              </label>
              <select
                value={roleSpecificInfo.experienceLevel || ''}
                onChange={(e) => handleRoleSpecificInfoChange('experienceLevel', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select level' : '选择水平'}</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* 位置/角色 / Position/Role */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Position/Role' : '位置/角色'}
              </label>
              <input
                type="text"
                value={roleSpecificInfo.position || ''}
                onChange={(e) => handleRoleSpecificInfoChange('position', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
                placeholder={language === 'en' ? 'e.g., Forward, Midfielder' : '例如：前锋、中场'}
              />
            </div>

            {/* 身高 / Height */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Height (cm)' : '身高 (厘米)'}
              </label>
              <input
                type="number"
                value={roleSpecificInfo.height || ''}
                onChange={(e) => handleRoleSpecificInfoChange('height', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
                placeholder="175"
              />
            </div>

            {/* 成就和奖项 / Achievements & Awards */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Achievements & Awards' : '成就和奖项'}
              </label>
              <textarea
                value={roleSpecificInfo.achievements || ''}
                onChange={(e) => handleRoleSpecificInfoChange('achievements', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
                placeholder={language === 'en' ? 'Enter your achievements (one per line)' : '输入您的成就（每行一个）'}
              />
            </div>
          </div>
        </div>

        {/* 观众信息 / Audience Information */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-6">
            <FaUsers className="text-2xl text-fanforce-gold mr-3" />
            <h2 className="text-xl font-bold text-white">
              {language === 'en' ? 'Audience Information' : '观众信息'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 支持级别 / Support Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Support Level' : '支持级别'} *
              </label>
              <select
                value={roleSpecificInfo.supportLevel || ''}
                onChange={(e) => handleRoleSpecificInfoChange('supportLevel', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select level' : '选择级别'}</option>
                {supportLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* 感兴趣的运动 / Interested Sports */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Interested Sports' : '感兴趣的运动'} *
              </label>
              <select
                value={roleSpecificInfo.interestedSports || ''}
                onChange={(e) => handleRoleSpecificInfoChange('interestedSports', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select sport' : '选择运动项目'}</option>
                {sportsOptions.map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* 喜爱的队伍 / Favorite Teams */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Favorite Teams' : '喜爱的队伍'}
              </label>
              <textarea
                value={roleSpecificInfo.favoriteTeams || ''}
                onChange={(e) => handleRoleSpecificInfoChange('favoriteTeams', e.target.value)}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
                placeholder={language === 'en' ? 'Enter your favorite teams (one per line)' : '输入您喜爱的队伍（每行一个）'}
              />
            </div>
          </div>
        </div>

        {/* 大使信息 / Ambassador Information */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center mb-6">
            <FaStar className="text-2xl text-fanforce-gold mr-3" />
            <h2 className="text-xl font-bold text-white">
              {language === 'en' ? 'Ambassador Information' : '大使信息'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 校园 / Campus */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Campus' : '校园'} *
              </label>
              <input
                type="text"
                value={roleSpecificInfo.campus || ''}
                onChange={(e) => handleRoleSpecificInfoChange('campus', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
                placeholder={language === 'en' ? 'Enter campus name' : '输入校园名称'}
              />
            </div>

            {/* 部门 / Department */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Department' : '部门'} *
              </label>
              <input
                type="text"
                value={roleSpecificInfo.department || ''}
                onChange={(e) => handleRoleSpecificInfoChange('department', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
                placeholder={language === 'en' ? 'Enter department' : '输入部门'}
              />
            </div>

            {/* 大使级别 / Ambassador Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'en' ? 'Ambassador Level' : '大使级别'}
              </label>
              <select
                value={roleSpecificInfo.ambassadorLevel || ''}
                onChange={(e) => handleRoleSpecificInfoChange('ambassadorLevel', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select level' : '选择级别'}</option>
                <option value="junior">初级大使</option>
                <option value="senior">高级大使</option>
                <option value="expert">专家大使</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout 
      title={language === 'en' ? 'Personal Profile' : '个人信息'} 
      subtitle={language === 'en' ? 'Manage your personal information and preferences' : '管理您的个人信息和偏好设置'}
    >
      <div className="space-y-6">
        {/* 页面头部 / Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {language === 'en' ? 'Personal Profile' : '个人信息'}
            </h1>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Manage your account information and role-specific details' 
                : '管理您的账户信息和角色特定详情'
              }
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-fanforce-primary hover:bg-fanforce-primary/80 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <FaUser className="mr-2" />
                {language === 'en' ? 'Edit Profile' : '编辑档案'}
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  <FaUndo className="mr-2" />
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-fanforce-gold hover:bg-fanforce-gold/80 text-black rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {isLoading 
                    ? (language === 'en' ? 'Saving...' : '保存中...') 
                    : (language === 'en' ? 'Save Changes' : '保存更改')
                  }
                </button>
              </>
            )}
          </div>
        </div>

        {/* 基础个人信息 / Basic Personal Information */}
        {renderPersonalInfoForm()}

        {/* 角色特定信息 / Role-Specific Information */}
        {renderRoleSpecificForm()}

        {/* 安全提示 / Security Notice */}
        <div className="bg-blue-900/20 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-start">
            <FaShieldAlt className="text-2xl text-blue-400 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                {language === 'en' ? 'Security Notice' : '安全提示'}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {language === 'en' 
                  ? 'Your personal information is securely stored and only used for account management and event participation. We never share your data with third parties without your explicit consent.'
                  : '您的个人信息安全存储，仅用于账户管理和活动参与。未经您的明确同意，我们绝不会与第三方共享您的数据。'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
