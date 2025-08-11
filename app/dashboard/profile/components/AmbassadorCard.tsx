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
  FaEdit
} from 'react-icons/fa'
import { FormState } from '../types'
import { sportDepartments } from '../constants'

interface AmbassadorCardProps {
  formState: FormState
  onFieldChange: (field: string, value: any) => void
  onSave: () => Promise<void>
  onCancel: () => void
  isEditing: boolean
  isLoading: boolean
  validationErrors?: Record<string, string>
}

export default function AmbassadorCard({
  formState,
  onFieldChange,
  onSave,
  onCancel,
  isEditing,
  isLoading,
  validationErrors = {}
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
            {language === 'en' ? 'Ambassador Information' : '大使信息'}
          </h2>
        </div>
        
        {/* 大使信息编辑按钮 / Ambassador info edit buttons */}
        {!isEditing ? (
          <button
            onClick={() => onFieldChange('_editMode', true)}
            className="px-4 py-2 bg-fanforce-primary hover:bg-fanforce-primary/80 text-white rounded-lg font-medium transition-colors flex items-center"
          >
            <FaEdit className="mr-2" />
            {language === 'en' ? 'Edit' : '编辑'}
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <FaUndo className="mr-2" />
              {language === 'en' ? 'Cancel' : '取消'}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-fanforce-primary hover:bg-fanforce-primary/80 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isLoading 
                ? (language === 'en' ? 'Saving...' : '保存中...') 
                : (language === 'en' ? 'Save' : '保存')
              }
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 院系 / Department */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {language === 'en' ? 'Department' : '院系'}
          </label>
          {(() => {
            const primarySport = getFieldValue('primarySport');
            const availableDepartments = primarySport && sportDepartments[primarySport] ? sportDepartments[primarySport] : [];
            
            return (
              <select
                value={getFieldValue('department')}
                onChange={(e) => onFieldChange('department', e.target.value)}
                disabled={!isEditing || !primarySport}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
              >
                <option value="">{language === 'en' ? 'Select department' : '选择院系'}</option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            );
          })()}
          {!getFieldValue('primarySport') && (
            <p className="text-gray-500 text-sm italic mt-1">
              {language === 'en' ? 'Please select a primary sport first' : '请先选择主要运动项目'}
            </p>
          )}
          {/* 显示验证错误 */}
          {getFieldError('department') && (
            <p className="text-red-400 text-xs mt-1">{getFieldError('department')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
