// FanForce AI - 表单字段组件
// Form Field Component - 可复用的表单输入字段组件
// Reusable form input field component

'use client'

import { ReactNode } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

interface FormFieldProps {
  label: string
  labelCn: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'select' | 'textarea'
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  placeholderCn?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; label: string; labelCn: string }[] // for select type
  rows?: number // for textarea type
  icon?: ReactNode
  helpText?: string
  helpTextCn?: string
  maxLength?: number
  pattern?: string
}

export default function FormField({
  label,
  labelCn,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  placeholderCn,
  required = false,
  disabled = false,
  options = [],
  rows = 3,
  icon,
  helpText,
  helpTextCn,
  maxLength,
  pattern
}: FormFieldProps) {
  const { language } = useLanguage()

  // 获取显示文本 / Get display text
  const getDisplayText = (en: string, cn: string) => {
    return language === 'en' ? en : cn
  }

  // 获取占位符文本 / Get placeholder text
  const getPlaceholder = () => {
    if (placeholder && placeholderCn) {
      return getDisplayText(placeholder, placeholderCn)
    }
    return getDisplayText(`Enter ${label.toLowerCase()}`, `输入${labelCn}`)
  }

  // 渲染输入组件 / Render input component
  const renderInput = () => {
    const baseClasses = `
      w-full px-4 py-3 
      bg-white/10 border border-white/20 
      text-white placeholder-gray-400
      rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-fanforce-primary focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? 'border-red-500 focus:ring-red-500' : ''}
      ${icon ? 'pl-12' : ''}
    `

    const inputProps = {
      name,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        onChange(e.target.value),
      placeholder: getPlaceholder(),
      required,
      disabled,
      maxLength,
      pattern,
      className: baseClasses
    }

    switch (type) {
      case 'select':
        return (
          <select {...inputProps}>
            <option value="">
              {getDisplayText('Select an option', '请选择')}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {getDisplayText(option.label, option.labelCn)}
              </option>
            ))}
          </select>
        )

      case 'textarea':
        return (
          <textarea 
            {...inputProps}
            rows={rows}
            style={{ resize: 'none' }}
          />
        )

      default:
        return (
          <input 
            {...inputProps}
            type={type}
          />
        )
    }
  }

  return (
    <div className="space-y-2">
      {/* 字段标签 / Field Label */}
      <div className="flex items-center justify-between">
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-white"
        >
          {getDisplayText(label, labelCn)}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        
        {maxLength && (
          <span className="text-xs text-gray-400">
            {value.length} / {maxLength}
          </span>
        )}
      </div>

      {/* 输入字段容器 / Input Field Container */}
      <div className="relative">
        {/* 图标 / Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        {/* 输入组件 / Input Component */}
        {renderInput()}
      </div>

      {/* 帮助文本 / Help Text */}
      {helpText && helpTextCn && !error && (
        <p className="text-xs text-gray-400">
          {getDisplayText(helpText, helpTextCn)}
        </p>
      )}

      {/* 错误信息 / Error Message */}
      {error && (
        <p className="text-xs text-red-400 flex items-center space-x-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
