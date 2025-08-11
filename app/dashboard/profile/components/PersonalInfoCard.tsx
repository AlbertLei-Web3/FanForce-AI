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
import PhoneInput from './PhoneInput'

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
            Basic Personal Information
          </h2>
        </div>
        
        {/* 个人信息编辑按钮 / Personal info edit buttons */}
        {!isEditing ? (
          <button
            onClick={handleStartEditing}
            className="px-4 py-2 bg-fanforce-primary hover:bg-fanforce-primary/80 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <FaEdit className="mr-2" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <FaUndo className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <FaSave className="mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* 表单内容 / Form content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 用户名 / Username */}
        <FormField
          label="Username"
          field={formState.username || { value: '', touched: false }}
          type="text"
          placeholder="Enter your username"
          required
          disabled={!isEditing}
          onChange={(value) => onFieldChange('username', value)}
          validationSchema="personal"
          fieldName="username"
          maxLength={20}
          showCharacterCount
          autoComplete="username"
        />

        {/* 邮箱 / Email */}
        <FormField
          label="Email"
          field={formState.email || { value: '', touched: false }}
          type="email"
          placeholder="Enter your email address"
          required
          disabled={!isEditing}
          onChange={(value) => onFieldChange('email', value)}
          validationSchema="personal"
          fieldName="email"
          maxLength={100}
          autoComplete="email"
        />

        {/* 电话号码 / Phone */}
        <PhoneInput
          value={formState.phone?.value || ''}
          onChange={(value) => onFieldChange('phone', value)}
          disabled={!isEditing}
          required
        />

        {/* 紧急联系人 / Emergency Contact */}
        <FormField
          label="Emergency Contact"
          field={formState.emergencyContact || { value: '', touched: false }}
          type="text"
          placeholder="Enter emergency contact name"
          required
          disabled={!isEditing}
          onChange={(value) => onFieldChange('emergencyContact', value)}
          validationSchema="personal"
          fieldName="emergencyContact"
          maxLength={50}
          autoComplete="name"
        />

        {/* 区域位置选择 / Regional Location Selection */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 区域 / Region */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Region <span className="text-red-400 text-xs font-normal">*</span>
              </label>
              <select
                value={regionalSelection.region}
                onChange={(e) => handleRegionChange(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">Select Region</option>
                {Object.keys(regionalLocationOptions).map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* 国家 / Country */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Country
              </label>
              <select
                value={regionalSelection.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={!isEditing || !regionalSelection.region}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">Select Country</option>
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
                City
              </label>
              <select
                value={regionalSelection.city}
                onChange={(e) => handleCityChange(e.target.value)}
                disabled={!isEditing || !regionalSelection.country}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">Select City</option>
                {(() => {
                  const countryData = regionalSelection.country && 
                    regionalLocationOptions[regionalSelection.region] && 
                    regionalLocationOptions[regionalSelection.region][regionalSelection.country];
                  
                  if (countryData) {
                    if (Array.isArray(countryData)) {
                      // 欧洲数据结构：直接是城市数组
                      return countryData.map((city: string) => (
                        <option key={city} value={city}>{city}</option>
                      ));
                    } else {
                      // 亚洲数据结构：城市是对象的键
                      return Object.keys(countryData).map((city: string) => (
                        <option key={city} value={city}>{city}</option>
                      ));
                    }
                  }
                  return null;
                })()}
              </select>
            </div>

            {/* 机构 / Institution */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Institution
              </label>
              <select
                value={regionalSelection.institution}
                onChange={(e) => handleInstitutionChange(e.target.value)}
                disabled={!isEditing || !regionalSelection.city}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              >
                <option value="">Select Institution</option>
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
          
          {/* 区域位置验证 / Regional location validation */}
          {isEditing && (
            <FormField
              label="Regional Location"
              field={formState.regionalLocation || { value: '', touched: false }}
              type="text"
              placeholder="Selected location will appear here"
              required
              disabled={true}
              onChange={() => {}}
              validationSchema="personal"
              fieldName="regionalLocation"
            />
          )}
        </div>
      </div>
    </div>
  )
}
