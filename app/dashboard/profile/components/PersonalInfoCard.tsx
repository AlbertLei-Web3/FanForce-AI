// FanForce AI - 基础信息卡片组件
// Personal Information Card Component

'use client'

import { useState } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { useToast } from '@/app/components/shared/Toast'
import { 
  FaUser, 
  FaEnvelope, 
  FaBuilding, 
  FaExclamationTriangle,
  FaSave,
  FaUndo,
  FaEdit
} from 'react-icons/fa'
import { PersonalInfo, RegionalSelection, FormState, ValidationErrors } from '../types'
import { regionalLocationOptions } from '../constants'
import FormField from './FormField'

interface PersonalInfoCardProps {
  formState: FormState
  onFieldChange: (field: string, value: string) => void
  onSave: () => Promise<void>
  onCancel: () => void
  onStartEditing: () => void
  isEditing: boolean
  isLoading: boolean
  validationErrors: ValidationErrors
}

export default function PersonalInfoCard({
  formState,
  onFieldChange,
  onSave,
  onCancel,
  onStartEditing,
  isEditing,
  isLoading
}: PersonalInfoCardProps) {
  const { language, t } = useLanguage()
  const { showToast } = useToast()
  
  const [regionalSelection, setRegionalSelection] = useState<RegionalSelection>({
    region: '',
    country: '',
    city: '',
    institution: ''
  })

  // 区域选择处理函数 / Regional selection handlers
  const handleRegionChange = (region: string) => {
    setRegionalSelection(prev => ({ ...prev, region, country: '', city: '', institution: '' }))
    onFieldChange('regionalLocation', region)
  }

  const handleCountryChange = (country: string) => {
    setRegionalSelection(prev => ({ ...prev, country, city: '', institution: '' }))
    onFieldChange('regionalLocation', `${regionalSelection.region} > ${country}`)
  }

  const handleCityChange = (city: string) => {
    setRegionalSelection(prev => ({ ...prev, city, institution: '' }))
    onFieldChange('regionalLocation', `${regionalSelection.region} > ${regionalSelection.country} > ${city}`)
  }

  const handleInstitutionChange = (institution: string) => {
    setRegionalSelection(prev => ({ ...prev, institution }))
    onFieldChange('regionalLocation', `${regionalSelection.region} > ${regionalSelection.country} > ${regionalSelection.city} > ${institution}`)
  }

  const handleSave = async () => {
    try {
      await onSave()
    } catch (error) {
      // Error handling is done in parent component
    }
  }

  const handleCancel = () => {
    onCancel()
  }

  const handleStartEditing = () => {
    onStartEditing()
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaUser className="text-2xl text-fanforce-gold mr-3" />
          <h2 className="text-xl font-bold text-white">
            {language === 'en' ? 'Basic Personal Information' : '基础个人信息'}
          </h2>
        </div>
        
        {/* 个人信息编辑按钮 / Personal info edit buttons */}
        {!isEditing ? (
          <button
            onClick={handleStartEditing}
            className="px-4 py-2 bg-fanforce-primary hover:bg-fanforce-primary/80 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <FaEdit className="mr-2" />
            {language === 'en' ? 'Edit' : '编辑'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <FaSave className="mr-2" />
              {isLoading ? (language === 'en' ? 'Saving...' : '保存中...') : (language === 'en' ? 'Save' : '保存')}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <FaUndo className="mr-2" />
              {language === 'en' ? 'Cancel' : '取消'}
            </button>
          </div>
        )}
      </div>

      {/* 表单内容 / Form content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 用户名 / Username */}
        <FormField
          label={language === 'en' ? 'Username' : '用户名'}
          field={formState.username || { value: '', touched: false }}
          type="text"
          placeholder={language === 'en' ? 'Enter your username' : '请输入用户名'}
          required
          disabled={!isEditing}
          onChange={(value) => onFieldChange('username', value)}
        />

        {/* 邮箱 / Email */}
        <FormField
          label={language === 'en' ? 'Email' : '邮箱'}
          field={formState.email || { value: '', touched: false }}
          type="email"
          placeholder={language === 'en' ? 'Enter your email' : '请输入邮箱'}
          required
          disabled={!isEditing}
          onChange={(value) => onFieldChange('email', value)}
        />

        {/* 电话号码 / Phone */}
        <FormField
          label={language === 'en' ? 'Phone Number' : '电话号码'}
          field={formState.phone || { value: '', touched: false }}
          type="tel"
          placeholder={language === 'en' ? 'Enter your phone number' : '请输入电话号码'}
          required
          disabled={!isEditing}
          onChange={(value) => onFieldChange('phone', value)}
        />

        {/* 紧急联系人 / Emergency Contact */}
        <FormField
          label={language === 'en' ? 'Emergency Contact' : '紧急联系人'}
          field={formState.emergencyContact || { value: '', touched: false }}
          type="text"
          placeholder={language === 'en' ? 'Enter emergency contact' : '请输入紧急联系人'}
          required
          disabled={!isEditing}
          onChange={(value) => onFieldChange('emergencyContact', value)}
        />

        {/* 区域位置选择 / Regional Location Selection */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 区域 / Region */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {language === 'en' ? 'Region' : '区域'} <span className="text-blue-400 text-xs font-normal">(必填)</span>
              </label>
              <select
                value={regionalSelection.region}
                onChange={(e) => handleRegionChange(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select Region' : '选择区域'}</option>
                {Object.keys(regionalLocationOptions).map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* 国家 / Country */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {language === 'en' ? 'Country' : '国家'}
              </label>
              <select
                value={regionalSelection.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={!isEditing || !regionalSelection.region}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select Country' : '选择国家'}</option>
                {regionalSelection.region && regionalLocationOptions[regionalSelection.region] && 
                  Object.keys(regionalLocationOptions[regionalSelection.region]).map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))
                }
              </select>
            </div>

            {/* 城市 / City */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {language === 'en' ? 'City' : '城市'}
              </label>
              <select
                value={regionalSelection.city}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!isEditing || !regionalSelection.country}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select City' : '选择城市'}</option>
                {(() => {
                  const countryData = regionalSelection.country && 
                    regionalLocationOptions[regionalSelection.region] && 
                    regionalLocationOptions[regionalSelection.region][regionalSelection.country];
                  
                  if (countryData && Array.isArray(countryData)) {
                    return countryData.map((city: string) => (
                      <option key={city} value={city}>{city}</option>
                    ));
                  }
                  return null;
                })()}
              </select>
            </div>

            {/* 机构 / Institution */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {language === 'en' ? 'Institution' : '机构'}
              </label>
              <select
                value={regionalSelection.institution}
                onChange={(e) => handleInstitutionChange(e.target.value)}
                disabled={!isEditing || !regionalSelection.city}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select Institution' : '选择机构'}</option>
                                 {(() => {
                   const countryData = regionalSelection.city && 
                     regionalLocationOptions[regionalSelection.region] && 
                     regionalLocationOptions[regionalSelection.region][regionalSelection.country];
                   
                   if (countryData && !Array.isArray(countryData) && countryData[regionalSelection.city]) {
                     const institutions = countryData[regionalSelection.city];
                     if (Array.isArray(institutions)) {
                       return institutions.map((institution: string) => (
                         <option key={institution} value={institution}>{institution}</option>
                       ));
                     }
                   }
                   return null;
                 })()}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
