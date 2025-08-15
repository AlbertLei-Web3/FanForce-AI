// FanForce AI - 基础信息卡片组件
// Personal Information Card Component

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { useToast } from '@/app/components/shared/Toast'
import { useUser } from '@/app/context/UserContext'
import { 
  FaUser, 
  FaEnvelope, 
  FaBuilding, 
  FaExclamationTriangle,
  FaSave,
  FaUndo,
  FaEdit,
  FaShieldAlt,
  FaNetworkWired
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
  const { authState, icpIntegrationState } = useUser()
  
  const [regionalSelection, setRegionalSelection] = useState<RegionalSelection>({
    region: '',
    country: '',
    city: '',
    institution: ''
  })
  
  const [selectedCountryCode, setSelectedCountryCode] = useState('+62') // 默认选择印度尼西亚 / Default to Indonesia
  const [countrySearchTerm, setCountrySearchTerm] = useState('')
  const countrySelectRef = useRef<HTMLSelectElement>(null)

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

  // Phone number validation helper - 修复验证逻辑，为不同国家设置正确的位数要求 / Fix validation logic with correct digit requirements for different countries
  const validatePhoneNumber = (phone: string) => {
    if (!phone) return false;
    
    // 获取国家代码和数字部分 / Get country code and number part
    let countryCode = '';
    let numberPart = '';
    
    if (phone.startsWith('+') && phone.includes(' ')) {
      const parts = phone.split(' ');
      if (parts.length >= 2) {
        countryCode = parts[0];
        numberPart = parts.slice(1).join('');
      }
    } else {
      // 如果没有空格，尝试从开头提取国家代码 / If no space, try to extract country code from start
      const match = phone.match(/^\+(\d+)/);
      if (match) {
        countryCode = '+' + match[1];
        numberPart = phone.replace(/^\+\d+/, '');
      } else {
        numberPart = phone;
      }
    }
    
    // 验证数字部分是否只包含数字 / Validate number part contains only digits
    if (!/^\d+$/.test(numberPart)) return false;
    
    // 根据国家代码设置不同的位数要求 / Set different digit requirements based on country code
    const digitRequirements = {
      '+62': { min: 9, max: 11 },  // 印度尼西亚：9-11位 / Indonesia: 9-11 digits
      '+33': { min: 10, max: 10 }, // 法国：10位 / France: 10 digits  
      '+356': { min: 8, max: 8 }   // 马耳他：8位 / Malta: 8 digits
    };
    
    const requirements = digitRequirements[countryCode as keyof typeof digitRequirements];
    if (!requirements) return false;
    
    return numberPart.length >= requirements.min && numberPart.length <= requirements.max;
  }

  // Get current country code from state
  const getCurrentCountryCode = () => {
    return selectedCountryCode;
  }

  // Initialize phone number with default country code if empty - 修复重复+号问题 / Fix duplicate + sign issue
  useEffect(() => {
    if (!formState.phone?.value && selectedCountryCode) {
      // selectedCountryCode 已经包含+号，不需要再添加 / selectedCountryCode already contains + sign
      onFieldChange('phone', `${selectedCountryCode} `);
    }
  }, []); // 只在组件挂载时执行一次 / Only run once when component mounts

  // Get country name and flag from country code - 只包含三个指定国家 / Only includes three specified countries
  const getCountryInfo = (countryCode: string) => {
    const countryData: { [key: string]: { name: string; flag: string } } = {
      '+62': { name: 'Indonesia', flag: '🇮🇩' }, // 印度尼西亚 / Indonesia
      '+33': { name: 'France', flag: '🇫🇷' },   // 法国 / France
      '+356': { name: 'Malta', flag: '🇲🇹' }    // 马耳他 / Malta
    };
    return countryData[countryCode] || { name: 'Unknown', flag: '🏳️' };
  };

  const getCountryName = (countryCode: string) => {
    return getCountryInfo(countryCode).name;
  };

  const getCountryFlag = (countryCode: string) => {
    return getCountryInfo(countryCode).flag;
  };

  // Get filtered country options based on search - 限制为三个指定国家 / Limited to three specified countries
  const getFilteredCountries = () => {
    // 只显示三个指定的国家 / Only show three specified countries
    const allowedCountries = ['+62', '+33', '+356']; // 印度尼西亚、法国、马耳他 / Indonesia, France, Malta
    
    if (!countrySearchTerm) {
      return allowedCountries;
    }
    
    return allowedCountries.filter(countryCode => {
      const countryName = getCountryName(countryCode);
      return countryName.toLowerCase().includes(countrySearchTerm.toLowerCase()) ||
             countryCode.includes(countrySearchTerm);
    });
  };

  return (
    <div className="bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <FaUndo className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
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
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Phone Number <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="text-xs text-blue-400 mb-2 text-center bg-blue-900/20 rounded-lg p-2 border border-blue-500/30">
            <span className="font-medium">Selected Country:</span> {getCountryFlag(selectedCountryCode)} {selectedCountryCode} ({getCountryName(selectedCountryCode)})
          </div>
          
          {/* Country Search */}
          <div className="mb-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search countries..."
                value={countrySearchTerm}
                onChange={(e) => setCountrySearchTerm(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
              />
              {countrySearchTerm && (
                <>
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    {getFilteredCountries().length} results
                  </div>
                  <button
                    type="button"
                    onClick={() => setCountrySearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 hover:text-white transition-colors"
                    title="Clear search"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* 地区选择 / Country Code Selector */}
            <div className="relative w-full sm:w-32">
              <select
                ref={countrySelectRef}
                disabled={!isEditing}
                className="w-full px-3 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm appearance-none"
                onChange={(e) => {
                  const countryCode = e.target.value;
                  setSelectedCountryCode(countryCode);
                  const phoneValue = formState.phone?.value || '';
                  
                  if (phoneValue && phoneValue.includes(' ')) {
                    // 如果已有电话号码，只更新国家代码部分 / If phone number exists, only update country code part
                    const numberPart = phoneValue.replace(/^\+\d+\s*/, '');
                    onFieldChange('phone', `${countryCode} ${numberPart}`);
                  } else if (phoneValue && !phoneValue.startsWith('+')) {
                    // 如果只有数字部分，添加国家代码 / If only number part, add country code
                    onFieldChange('phone', `${countryCode} ${phoneValue}`);
                  } else if (!phoneValue) {
                    // 如果没有电话号码，只设置国家代码 / If no phone number, only set country code
                    onFieldChange('phone', `${countryCode} `);
                  }
                }}
                value={selectedCountryCode}
              >
                {getFilteredCountries().length > 0 ? (
                  getFilteredCountries().map((countryCode, index) => {
                    return (
                      <option key={countryCode} value={countryCode} className="font-semibold">
                        {getCountryFlag(countryCode)} {countryCode} ({getCountryName(countryCode)}) ⭐
                      </option>
                    );
                  })
                ) : (
                  <option value="" disabled>No countries found</option>
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {/* 号码输入 / Phone Number Input */}
            <input
              type="tel"
              value={formState.phone?.value?.replace(/^\+\d+\s*/, '') || ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                
                // 用户输入的是完整的国际号码 / User is entering full international number
                if (inputValue.startsWith('+') && inputValue.includes(' ')) {
                  onFieldChange('phone', inputValue);
                  // 尝试提取并设置国家代码 / Try to extract and set country code
                  const parts = inputValue.split(' ');
                  if (parts.length >= 2) {
                    const countryCode = parts[0];
                    // 检查这个国家代码是否在我们的选项中 / Check if this country code exists in our options
                    const option = Array.from(countrySelectRef.current?.options || []).find(opt => opt.value === countryCode);
                    if (option) {
                      setSelectedCountryCode(countryCode);
                    }
                  }
                } else {
                  // 用户只输入数字部分，自动添加国家代码 / User is entering just the number part, auto-add country code
                  onFieldChange('phone', `${selectedCountryCode} ${inputValue}`);
                }
              }}
              placeholder={`Enter ${getCountryFlag(selectedCountryCode)} ${getCountryName(selectedCountryCode)} phone number`}
              disabled={!isEditing}
              className={`flex-1 px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
                formState.phone?.value && validatePhoneNumber(formState.phone.value) 
                  ? 'border-green-500 focus:ring-green-500' 
                  : formState.phone?.value && !validatePhoneNumber(formState.phone.value)
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-600'
              }`}
              maxLength={(() => {
                const requirements = {
                  '+62': 11,  // 印度尼西亚：最大11位 / Indonesia: max 11 digits
                  '+33': 10,  // 法国：最大10位 / France: max 10 digits
                  '+356': 8   // 马耳他：最大8位 / Malta: max 8 digits
                };
                return requirements[selectedCountryCode as keyof typeof requirements] || 11;
              })()}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
            <span className="text-center sm:text-left">
              Please enter your phone number without country code
            </span>
            {formState.phone?.value && (
              <span className={`text-center sm:text-right ${
                validatePhoneNumber(formState.phone.value) ? 'text-green-400' : 'text-red-400'
              }`}>
                                 {(() => {
                   const numberPart = formState.phone.value.replace(/^\+\d+\s*/, '');
                   const countryCode = formState.phone.value.match(/^\+(\d+)/)?.[0] || selectedCountryCode;
                   const requirements = {
                     '+62': { min: 9, max: 11 },  // 印度尼西亚 / Indonesia
                     '+33': { min: 10, max: 10 }, // 法国 / France
                     '+356': { min: 8, max: 8 }   // 马耳他 / Malta
                   };
                   const req = requirements[countryCode as keyof typeof requirements];
                   return `${numberPart.length}/${req ? req.max : '?'} digits`;
                 })()}
              </span>
            )}
          </div>
          {/* 当前选择的完整号码显示 / Current full phone number display */}
          {formState.phone?.value && (
            <div className={`text-xs text-center rounded-lg p-2 ${
              validatePhoneNumber(formState.phone.value)
                ? 'text-green-400 bg-green-900/20 border border-green-500/30'
                : 'text-red-400 bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="font-medium flex items-center justify-center gap-2">
                {validatePhoneNumber(formState.phone.value) ? (
                  <>
                    <span className="text-green-400">✓</span>
                    <span>Valid Phone Number</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-400">✗</span>
                    <span>Invalid Phone Number</span>
                  </>
                )}
              </div>
              <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-600">
                <div className="font-mono text-sm">
                  {formState.phone.value}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                                     Country: {getCountryFlag(selectedCountryCode)} {selectedCountryCode} ({getCountryName(selectedCountryCode)}) | Length: {(() => {
                     const numberPart = formState.phone.value.replace(/^\+\d+\s*/, '');
                     const requirements = {
                       '+62': { min: 9, max: 11 },  // 印度尼西亚 / Indonesia
                       '+33': { min: 10, max: 10 }, // 法国 / France
                       '+356': { min: 8, max: 8 }   // 马耳他 / Malta
                     };
                     const req = requirements[selectedCountryCode as keyof typeof requirements];
                     return `${numberPart.length} digits (${req ? `${req.min}-${req.max}` : 'unknown'} required)`;
                   })()}
                </div>
              </div>
            </div>
          )}
        </div>

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
        <div className="md:col-span-2 mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="mt-8"></div>
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

      {/* ICP 状态显示 / ICP Status Display */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <FaShieldAlt className="text-fanforce-gold mr-2" /> ICP Status
        </h3>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaNetworkWired className="text-fanforce-gold mr-2 text-2xl" />
              <h4 className="text-md font-bold text-white">ICP Verification</h4>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              icpIntegrationState?.isVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {icpIntegrationState?.isVerified ? 'Verified' : 'Not Verified'}
            </div>
          </div>
          <p className="text-sm text-gray-300">
            Your ICP (Internet Computer) verification status is currently:
            {icpIntegrationState?.isVerified ? (
              <span className="text-green-400"> Verified</span>
            ) : (
              <span className="text-red-400"> Not Verified</span>
            )}
          </p>
          <p className="text-sm text-gray-300 mt-2">
            {icpIntegrationState?.isVerified 
              ? 'Your ICP identity has been verified on the blockchain.'
              : 'Please complete ICP authentication to verify your identity.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
