// FanForce AI - 大使信息卡片组件
// Ambassador Information Card Component

'use client'

import { useState } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { useToast } from '@/app/components/shared/Toast'
import { 
  FaStar,
  FaSave,
  FaUndo,
  FaEdit,
  FaExclamationTriangle
} from 'react-icons/fa'
import { FormState } from '../types'
import { sportsOptions } from '../constants'

interface AmbassadorCardProps {
  formState: FormState
  onFieldChange: (field: string, value: any) => void
  onSave: () => Promise<void>
  onCancel: () => void
  onStartEditing: () => void
  isEditing: boolean
  isLoading: boolean
  validationErrors?: Record<string, string>
  canEdit: boolean
}

export default function AmbassadorCard({
  formState,
  onFieldChange,
  onSave,
  onCancel,
  onStartEditing,
  isEditing,
  isLoading,
  validationErrors = {},
  canEdit
}: AmbassadorCardProps) {
  const { language } = useLanguage()
  const { showToast } = useToast()

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

  // 获取字段值 / Get field value
  const getFieldValue = (field: string) => {
    return formState[field]?.value || ''
  }

  // 获取字段错误 / Get field error
  const getFieldError = (field: string) => {
    return validationErrors[field] || ''
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaStar className="text-2xl text-fanforce-gold mr-3" />
          <h2 className="text-xl font-bold text-white">
            Ambassador Information
          </h2>
        </div>
        
        {/* 大使信息编辑按钮 / Ambassador info edit buttons */}
        {!isEditing ? (
          <button
            onClick={onStartEditing}
            disabled={!canEdit}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
              canEdit 
                ? 'bg-fanforce-primary hover:bg-fanforce-primary/80 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaEdit className="mr-2" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <FaUndo className="mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-fanforce-primary hover:bg-fanforce-primary/80 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* 体育项目大使 / Sports Ambassador */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sports Ambassador Type <span className="text-red-400 text-xs font-normal">*</span>
          </label>
          <select
            value={getFieldValue('sportsAmbassadorType')}
            onChange={(e) => onFieldChange('sportsAmbassadorType', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
          >
            <option value="">Select your sports ambassador type</option>
            {sportsOptions.map((sport) => (
              <option key={sport.value} value={sport.value}>
                {sport.label} Ambassador
              </option>
            ))}
          </select>
          {/* 显示验证错误 */}
          {getFieldError('sportsAmbassadorType') && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {getFieldError('sportsAmbassadorType')}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
