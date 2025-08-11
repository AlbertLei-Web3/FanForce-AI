// FanForce AI - 通用表单字段组件
// Common Form Field Component

import React from 'react'
import { FormField as FormFieldType } from '../types'

interface FormFieldProps {
  label: string
  field: FormFieldType
  type?: 'text' | 'email' | 'tel' | 'password' | 'textarea' | 'select'
  placeholder?: string
  options?: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  field,
  type = 'text',
  placeholder,
  options = [],
  required = false,
  disabled = false,
  onChange,
  onBlur,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  const handleBlur = () => {
    if (onBlur) {
      onBlur()
    }
  }

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            value={field.value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              field.error && field.touched ? 'border-red-500' : 'border-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            rows={4}
          />
        )
      
      case 'select':
        return (
          <select
            value={field.value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              field.error && field.touched ? 'border-red-500' : 'border-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">{placeholder || '请选择...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      default:
        return (
          <input
            type={type}
            value={field.value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              field.error && field.touched ? 'border-red-500' : 'border-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        )
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {field.error && field.touched && (
        <p className="text-sm text-red-400 animate-fadeIn">
          {field.error}
        </p>
      )}
    </div>
  )
}

export default FormField
