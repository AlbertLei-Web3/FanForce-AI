// FanForce AI - 个人信息编辑页面
// Personal Profile Edit Page - 用户个人信息编辑和管理
// User personal information editing and management page

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { useUser } from '@/app/context/UserContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import { useToast } from '@/app/components/shared/Toast'
import { FaShieldAlt, FaUser, FaRunning, FaUsers, FaHandshake } from 'react-icons/fa'
import { PersonalInfo, RoleSpecificInfo, UserRole } from './types'
import { useProfileForm } from './hooks/useProfileForm'
import PersonalInfoCard from './components/PersonalInfoCard'
import AthleteCard from './components/AthleteCard'
import AudienceCard from './components/AudienceCard'
import AmbassadorCard from './components/AmbassadorCard'
import SaveStatus from './components/SaveStatus'

export default function ProfilePage() {
  const { language } = useLanguage()
  const { authState, updateUserInfo, isAthlete, isAudience, isAmbassador, isAdmin, isSuperAdmin } = useUser()
  const { showToast } = useToast()
  
  // 初始化数据 / Initialize data
  const [initialData, setInitialData] = useState({
    personalInfo: {
      username: '',
      email: '',
      phone: '',
      emergencyContact: '',
      regionalLocation: ''
    },
    roleSpecificInfo: {}
  })

  // 使用自定义Hook管理表单状态 / Use custom hook for form state management
  const {
    personalFormState,
    roleFormState,
    editStates,
    saveState,
    validationErrors,
    updatePersonalField,
    updateRoleField,
    startEditing,
    cancelEditing,
    savePersonalInfo,
    saveRoleInfo,
    getCurrentData,
    resetForm
  } = useProfileForm(initialData)

  // 初始化数据 / Initialize data
  useEffect(() => {
    if (authState.user) {
      const userData = {
        personalInfo: {
          username: authState.user.username || '',
          email: authState.user.email || '',
          phone: '',
          emergencyContact: '',
          regionalLocation: ''
        },
        roleSpecificInfo: {}
      }
      setInitialData(userData)
    }
  }, [authState.user])

  // 保存成功处理 / Handle save success
  const handleSaveSuccess = (section: string) => {
    const message = language === 'en' 
      ? `${section} information updated successfully!` 
      : `${section}信息更新成功！`
    showToast({ message, type: 'success' })
  }

  // 保存失败处理 / Handle save failure
  const handleSaveFailure = (section: string) => {
    const message = language === 'en' 
      ? `Failed to update ${section} information` 
      : `更新${section}信息失败`
    showToast({ message, type: 'error' })
  }

  // 保存个人信息 / Save personal info
  const handleSavePersonal = async () => {
    const success = await savePersonalInfo()
    if (success) {
      handleSaveSuccess('Personal')
    } else {
      handleSaveFailure('Personal')
    }
  }

  // 保存运动员信息 / Save athlete info
  const handleSaveAthlete = async () => {
    const success = await saveRoleInfo('athlete')
    if (success) {
      handleSaveSuccess('Athlete')
    } else {
      handleSaveFailure('Athlete')
    }
  }

  // 保存观众信息 / Save audience info
  const handleSaveAudience = async () => {
    const success = await saveRoleInfo('audience')
    if (success) {
      handleSaveSuccess('Audience')
    } else {
      handleSaveFailure('Audience')
    }
  }

  // 保存大使信息 / Save ambassador info
  const handleSaveAmbassador = async () => {
    const success = await saveRoleInfo('ambassador')
    if (success) {
      handleSaveSuccess('Ambassador')
    } else {
      handleSaveFailure('Ambassador')
    }
  }

  // 取消编辑处理 / Handle cancel editing
  const handleCancel = (section: string) => {
    cancelEditing(section as any)
    const message = language === 'en' ? 'Changes cancelled' : '更改已取消'
    showToast({ message, type: 'info' })
  }

  // 开始编辑处理 / Handle start editing
  const handleStartEditing = (section: string) => {
    startEditing(section as any)
  }

  // 检查用户是否有权限编辑特定角色信息 / Check if user has permission to edit specific role info
  const canEditRole = (role: string) => {
    switch (role) {
      case 'athlete':
        return isAthlete() || isAdmin() || isSuperAdmin()
      case 'audience':
        return isAudience() || isAdmin() || isSuperAdmin()
      case 'ambassador':
        return isAmbassador() || isAdmin() || isSuperAdmin()
      default:
        return true
    }
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
          
          {/* 保存状态指示器 / Save status indicator */}
          <SaveStatus saveState={saveState} />
        </div>

        {/* 基础个人信息 / Basic Personal Information */}
        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <FaUser className="text-2xl text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              {language === 'en' ? 'Basic Information' : '基本信息'}
            </h2>
          </div>
          
          <PersonalInfoCard
            formState={personalFormState}
            onFieldChange={updatePersonalField}
            onSave={handleSavePersonal}
            onCancel={() => handleCancel('personal')}
            onStartEditing={() => handleStartEditing('personal')}
            isEditing={editStates.personal}
            isLoading={saveState.isSaving}
            validationErrors={validationErrors}
          />
        </div>

        {/* 角色特定信息 / Role-Specific Information */}
        <div className="space-y-6">
          {/* 运动员信息 / Athlete Information */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <FaRunning className="text-2xl text-green-400" />
              <h2 className="text-xl font-semibold text-white">
                {language === 'en' ? 'Athlete Profile' : '运动员档案'}
              </h2>
            </div>
            
            <AthleteCard
              formState={roleFormState}
              onFieldChange={updateRoleField}
              onSave={handleSaveAthlete}
              onCancel={() => handleCancel('athlete')}
              onStartEditing={() => handleStartEditing('athlete')}
              isEditing={editStates.athlete}
              isLoading={saveState.isSaving}
              validationErrors={validationErrors}
              canEdit={canEditRole('athlete')}
            />
          </div>

          {/* 观众信息 / Audience Information */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <FaUsers className="text-2xl text-purple-400" />
              <h2 className="text-xl font-semibold text-white">
                {language === 'en' ? 'Audience Profile' : '观众档案'}
              </h2>
            </div>
            
            <AudienceCard
              formState={roleFormState}
              onFieldChange={updateRoleField}
              onSave={handleSaveAudience}
              onCancel={() => handleCancel('audience')}
              onStartEditing={() => handleStartEditing('audience')}
              isEditing={editStates.audience}
              isLoading={saveState.isSaving}
              validationErrors={validationErrors}
              canEdit={canEditRole('audience')}
            />
          </div>

          {/* 大使信息 / Ambassador Information */}
          <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <FaHandshake className="text-2xl text-orange-400" />
              <h2 className="text-xl font-semibold text-white">
                {language === 'en' ? 'Ambassador Profile' : '大使档案'}
              </h2>
            </div>
            
            <AmbassadorCard
              formState={roleFormState}
              onFieldChange={updateRoleField}
              onSave={handleSaveAmbassador}
              onCancel={() => handleCancel('ambassador')}
              onStartEditing={() => handleStartEditing('ambassador')}
              isEditing={editStates.ambassador}
              isLoading={saveState.isSaving}
              validationErrors={validationErrors}
              canEdit={canEditRole('ambassador')}
            />
          </div>
        </div>

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

