// FanForce AI - 表单字段组件（增强版）
// Enhanced Form Field Component

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaEye, 
  FaEyeSlash,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { debounce } from '../utils'
import { 
  validateField, 
  formatPhoneNumber, 
  parsePhoneNumberInput,
  validateEmailAdvanced 
} from '../validation'
import { validationSchemas } from '../validation'

interface FormFieldProps {
  label: string
  field: {
    value: string
    touched: boolean
    error?: string
  }
  type: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  onChange: (value: string) => void
  onBlur?: () => void
  options?: { value: string; label: string }[]
  validationSchema?: 'personal' | 'athlete' | 'audience' | 'ambassador'
  fieldName?: string
  maxLength?: number
  showCharacterCount?: boolean
  autoComplete?: string
}

export default function FormField({
  label,
  field,
  type,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  options = [],
  validationSchema,
  fieldName,
  maxLength,
  showCharacterCount = false,
  autoComplete
}: FormFieldProps) {
  const { language } = useLanguage()
  const [localError, setLocalError] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [phoneSuggestions, setPhoneSuggestions] = useState<string[]>([])
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])

  // 实时验证函数 / Real-time validation function
  const validateFieldRealTime = useCallback(
    debounce(async (value: string) => {
      if (!validationSchema || !fieldName || !value.trim()) {
        setLocalError('')
        return
      }

      setIsValidating(true)
      try {
        const schema = validationSchemas[validationSchema]
        const error = await validateField(schema, fieldName, value)
        setLocalError(error || '')
      } catch (error) {
        setLocalError('验证失败')
      } finally {
        setIsValidating(false)
      }
    }, 500),
    [validationSchema, fieldName]
  )

  // 电话号码处理 / Phone number handling
  const handlePhoneChange = (value: string) => {
    // 自动格式化电话号码
    const formatted = formatPhoneNumber(value)
    onChange(formatted)
    
    // 解析电话号码并提供建议
    if (value.trim()) {
      const parsed = parsePhoneNumberInput(value)
      if (!parsed.isValid) {
        setPhoneSuggestions([
          '请使用国际格式：+86 138 0013 8000',
          '或使用本地格式：(+86) 138-0013-8000'
        ])
      } else {
        setPhoneSuggestions([])
      }
    } else {
      setPhoneSuggestions([])
    }
    
    // 实时验证
    validateFieldRealTime(formatted)
  }

  // 邮箱处理 / Email handling
  const handleEmailChange = (value: string) => {
    onChange(value)
    
    // 增强邮箱验证
    if (value.trim()) {
      const emailValidation = validateEmailAdvanced(value)
      if (!emailValidation.isValid) {
        setEmailSuggestions(emailValidation.suggestions)
      } else {
        setEmailSuggestions([])
      }
    } else {
      setEmailSuggestions([])
    }
    
    // 实时验证
    validateFieldRealTime(value)
  }

  // 通用字段处理 / Generic field handling
  const handleFieldChange = (value: string) => {
    onChange(value)
    validateFieldRealTime(value)
  }

  // 获取字段图标 / Get field icon
  const getFieldIcon = () => {
    switch (type) {
      case 'email':
        return <FaEnvelope className="text-gray-400" />
      case 'tel':
        return <FaPhone className="text-gray-400" />
      case 'text':
        return <FaUser className="text-gray-400" />
      default:
        return null
    }
  }

  // 渲染输入字段 / Render input field
  const renderInput = () => {
    const baseClasses = "w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50"
    const errorClasses = "border-red-500 focus:ring-red-500"
    const successClasses = "border-green-500 focus:ring-green-500"
    const normalClasses = "border-gray-600"
    
    const getBorderClasses = () => {
      if (localError || field.error) return errorClasses
      if (field.touched && !localError && !field.error && field.value) return successClasses
      return normalClasses
    }

    const commonProps = {
      value: field.value,
      disabled,
      className: `${baseClasses} ${getBorderClasses()}`,
      placeholder,
      autoComplete,
      maxLength
    }

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            onChange={(e) => handleFieldChange(e.target.value)}
            onBlur={onBlur}
            className={`${commonProps.className} resize-none`}
          />
        )
      
      case 'select':
        return (
          <select
            {...commonProps}
            onChange={(e) => handleFieldChange(e.target.value)}
            onBlur={onBlur}
          >
            <option value="">{placeholder || '请选择...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'password':
        return (
          <div className="relative">
            <input
              {...commonProps}
              type={showPassword ? 'text' : 'password'}
              onChange={(e) => handleFieldChange(e.target.value)}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        )
      
      case 'tel':
        return (
          <input
            {...commonProps}
            type="tel"
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={onBlur}
          />
        )
      
      case 'email':
        return (
          <input
            {...commonProps}
            type="email"
            onChange={(e) => handleEmailChange(e.target.value)}
            onBlur={onBlur}
          />
        )
      
      default:
        return (
          <input
            {...commonProps}
            type="text"
            onChange={(e) => handleFieldChange(e.target.value)}
            onBlur={onBlur}
          />
        )
    }
  }

  // 获取错误信息 / Get error message
  const getErrorMessage = () => {
    return localError || field.error || ''
  }

  // 获取验证状态 / Get validation status
  const getValidationStatus = () => {
    if (isValidating) return 'validating'
    if (getErrorMessage()) return 'error'
    if (field.touched && field.value && !getErrorMessage()) return 'success'
    return 'neutral'
  }

  const validationStatus = getValidationStatus()

  return (
    <div className="space-y-2">
      {/* 标签 / Label */}
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {/* 输入字段 / Input field */}
      <div className="relative">
        {getFieldIcon() && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {getFieldIcon()}
          </div>
        )}
        <div className={getFieldIcon() ? 'pl-10' : ''}>
          {renderInput()}
        </div>
        
        {/* 验证状态指示器 / Validation status indicator */}
        {field.touched && field.value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validationStatus === 'validating' && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
            {validationStatus === 'error' && (
              <FaExclamationTriangle className="text-red-500" />
            )}
            {validationStatus === 'success' && (
              <FaCheckCircle className="text-green-500" />
            )}
          </div>
        )}
      </div>
      
      {/* 错误信息 / Error message */}
      {getErrorMessage() && (
        <p className="text-red-400 text-xs flex items-center">
          <FaExclamationTriangle className="mr-1" />
          {getErrorMessage()}
        </p>
      )}
      
      {/* 电话号码建议 / Phone number suggestions */}
      {type === 'tel' && phoneSuggestions.length > 0 && (
        <div className="text-yellow-400 text-xs space-y-1">
          {phoneSuggestions.map((suggestion, index) => (
            <p key={index} className="flex items-center">
              <FaPhone className="mr-1" />
              {suggestion}
            </p>
          ))}
        </div>
      )}
      
      {/* 邮箱建议 / Email suggestions */}
      {type === 'email' && emailSuggestions.length > 0 && (
        <div className="text-yellow-400 text-xs space-y-1">
          {emailSuggestions.map((suggestion, index) => (
            <p key={index} className="flex items-center">
              <FaEnvelope className="mr-1" />
              {suggestion}
            </p>
          ))}
        </div>
      )}
      
      {/* 字符计数 / Character count */}
      {showCharacterCount && maxLength && (
        <div className="text-xs text-gray-400 text-center sm:text-right">
          {field.value.length} / {maxLength}
        </div>
      )}
      
      {/* 帮助文本 / Help text */}
      {type === 'tel' && (
        <p className="text-xs text-gray-400 mt-1 text-center">
          Please enter a valid phone number in international format (e.g., +86 138 0013 8000)
        </p>
      )}
      
      {type === 'email' && (
        <p className="text-xs text-gray-400 mt-1 text-center">
          Please enter a valid email address, the system will automatically validate the format
        </p>
      )}
    </div>
  )
}
