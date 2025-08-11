// FanForce AI - 电话号码输入组件
// Phone Number Input Component

'use client'

import { useState, useEffect, useRef } from 'react'
import { FaPhone, FaGlobe, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'
import { parsePhoneNumber, isValidPhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js'
import { debounce } from '../utils'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean, country?: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  showCountrySelector?: boolean
}

export default function PhoneInput({
  value,
  onChange,
  onValidationChange,
  placeholder = "+86 138 0013 8000",
  disabled = false,
  required = false,
  className = "",
  showCountrySelector = true
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState('CN')
  const [isValid, setIsValid] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showCountryList, setShowCountryList] = useState(false)
  const countryListRef = useRef<HTMLDivElement>(null)

  // 获取国家列表 / Get country list
  const countries = getCountries()

  // 实时验证电话号码 / Real-time phone number validation
  const validatePhoneNumber = debounce(async (phone: string) => {
    if (!phone.trim()) {
      setIsValid(false)
      setSuggestions([])
      onValidationChange?.(false)
      return
    }

    setIsValidating(true)
    
    try {
      const phoneNumber = parsePhoneNumber(phone)
      const valid = phoneNumber && isValidPhoneNumber(phone)
      
      setIsValid(valid)
      
      if (valid && phoneNumber?.country) {
        setSelectedCountry(phoneNumber.country)
      }
      
      // 提供格式建议
      if (!valid) {
        const suggestions = []
        if (!phone.startsWith('+')) {
          suggestions.push('请添加国家代码前缀（如：+86）')
        }
        if (phone.length < 10) {
          suggestions.push('电话号码长度不足')
        }
        if (phone.length > 15) {
          suggestions.push('电话号码长度过长')
        }
        setSuggestions(suggestions)
      } else {
        setSuggestions([])
      }
      
      onValidationChange?.(valid, phoneNumber?.country)
    } catch (error) {
      setIsValid(false)
      setSuggestions(['电话号码格式不正确'])
      onValidationChange?.(false)
    } finally {
      setIsValidating(false)
    }
  }, 500)

  // 处理电话号码变化 / Handle phone number change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    validatePhoneNumber(newValue)
  }

  // 处理国家选择 / Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode)
    setShowCountryList(false)
    
    // 如果当前有电话号码，自动添加国家代码
    if (value && !value.startsWith('+')) {
      const countryCode = getCountryCallingCode(countryCode as any)
      onChange(`+${countryCode} ${value}`)
    } else if (value && value.startsWith('+')) {
      // 重新格式化现有号码
      try {
        const phoneNumber = parsePhoneNumber(value)
        if (phoneNumber) {
          phoneNumber.country = countryCode
          onChange(phoneNumber.formatInternational())
        }
      } catch {
        // 如果解析失败，保持原值
      }
    }
  }

  // 格式化显示的电话号码 / Format displayed phone number
  const formatDisplayValue = (phone: string) => {
    if (!phone) return ''
    
    try {
      const phoneNumber = parsePhoneNumber(phone)
      if (phoneNumber && phoneNumber.isValid()) {
        return phoneNumber.formatInternational()
      }
    } catch {
      // 如果解析失败，返回原始值
    }
    
    return phone
  }

  // 点击外部关闭国家列表 / Close country list when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryListRef.current && !countryListRef.current.contains(event.target as Node)) {
        setShowCountryList(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 初始化验证 / Initialize validation
  useEffect(() => {
    if (value) {
      validatePhoneNumber(value)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* 标签 / Label */}
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Phone Number
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {/* 输入区域 / Input area */}
      <div className="relative">
        {/* 国家选择器 / Country selector */}
        {showCountrySelector && (
          <div className="relative" ref={countryListRef}>
            <button
              type="button"
              onClick={() => setShowCountryList(!showCountryList)}
              disabled={disabled}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 px-2 py-1 bg-gray-700 rounded text-white text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGlobe className="text-xs" />
              <span className="text-xs font-medium">{selectedCountry}</span>
            </button>
            
            {/* 国家列表 / Country list */}
            {showCountryList && (
              <div className="absolute top-full left-0 mt-1 w-64 max-h-60 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search countries..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm placeholder-gray-400"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {countries.map((countryCode) => {
                    const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode)
                    const callingCode = getCountryCallingCode(countryCode as any)
                    
                    return (
                      <button
                        key={countryCode}
                        type="button"
                        onClick={() => handleCountrySelect(countryCode)}
                        className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between"
                      >
                        <span className="text-sm">{countryName}</span>
                        <span className="text-xs text-gray-400">+{callingCode}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 电话号码输入框 / Phone number input */}
        <input
          type="tel"
          value={formatDisplayValue(value)}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
            showCountrySelector ? 'pl-24' : 'pl-12'
          } ${
            isValid && value ? 'border-green-500 focus:ring-green-500' :
            !isValid && value ? 'border-red-500 focus:ring-red-500' :
            'border-gray-600'
          }`}
        />
        
        {/* 图标 / Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <FaPhone className="text-gray-400" />
        </div>
        
        {/* 验证状态指示器 / Validation status indicator */}
        {value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValidating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            ) : isValid ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaExclamationTriangle className="text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {/* 建议和帮助文本 / Suggestions and help text */}
      {suggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          {suggestions.map((suggestion, index) => (
            <p key={index} className="text-yellow-400 text-xs flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {suggestion}
            </p>
          ))}
        </div>
      )}
      
      {/* 帮助文本 / Help text */}
      <p className="text-xs text-gray-400 mt-1">
        请输入国际格式电话号码，包含国家代码（如：+86 138 0013 8000）
      </p>
      
      {/* 当前选择的国家信息 / Current country info */}
      {selectedCountry && (
        <p className="text-xs text-blue-400 mt-1">
          当前选择：{new Intl.DisplayNames(['en'], { type: 'region' }).of(selectedCountry)} (+{getCountryCallingCode(selectedCountry as any)})
        </p>
      )}
    </div>
  )
}
