// FanForce AI - 运动员信息卡片组件
// Athlete Information Card Component

'use client'

import { useState } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { useToast } from '@/app/components/shared/Toast'
import { 
  FaTrophy,
  FaExclamationTriangle,
  FaSave,
  FaUndo,
  FaEdit,
  FaTimes
} from 'react-icons/fa'
import { FormState } from '../types'
import { sportsOptions, sportPositions, experienceLevels } from '../constants'

interface AthleteCardProps {
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

export default function AthleteCard({
  formState,
  onFieldChange,
  onSave,
  onCancel,
  onStartEditing,
  isEditing,
  isLoading,
  validationErrors = {},
  canEdit
}: AthleteCardProps) {
  const { language } = useLanguage()
  const { showToast } = useToast()

  // 位置标签切换处理 / Position tag toggle handler
  const handlePositionToggle = (position: string) => {
    const currentPositions = formState.positions?.value || []
    if (Array.isArray(currentPositions) && currentPositions.includes(position)) {
      onFieldChange('positions', currentPositions.filter(p => p !== position))
    } else {
      onFieldChange('positions', [...(Array.isArray(currentPositions) ? currentPositions : []), position])
    }
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
          <FaTrophy className="text-2xl text-fanforce-gold mr-3" />
          <h2 className="text-xl font-bold text-white">
            Athlete Information
          </h2>
        </div>
        
        {/* 运动员信息编辑按钮 / Athlete info edit buttons */}
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
              className="px-4 py-2 bg-fanforce-gold hover:bg-fanforce-gold/80 text-black rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 主要运动项目 / Primary Sport */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Primary Sport <span className="text-red-400 text-xs font-normal">*</span>
          </label>
          <select
            value={getFieldValue('primarySport')}
            onChange={(e) => {
              onFieldChange('primarySport', e.target.value)
              // 清空位置选择当运动项目改变时
              onFieldChange('positions', [])
            }}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
          >
            <option value="">Select sport</option>
            {sportsOptions.map((sport) => (
              <option key={sport.value} value={sport.value}>
                {sport.label}
              </option>
            ))}
          </select>
          {/* 显示说明文字 */}
          {getFieldValue('primarySport') && 
           sportsOptions.find(s => s.value === getFieldValue('primarySport'))?.note && (
            <p className="text-xs text-fanforce-gold mt-1 italic">
              {sportsOptions.find(s => s.value === getFieldValue('primarySport'))?.note}
            </p>
          )}
          {/* 显示验证错误 */}
          {getFieldError('primarySport') && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {getFieldError('primarySport')}
            </p>
          )}
        </div>

        {/* 经验水平 / Experience Level */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Experience Level <span className="text-red-400 text-xs font-normal">*</span>
          </label>
          <select
            value={getFieldValue('experienceLevel')}
            onChange={(e) => onFieldChange('experienceLevel', e.target.value)}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
          >
            <option value="">Select level</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {/* 显示验证错误 */}
          {getFieldError('experienceLevel') && (
            <p className="text-red-400 text-xs mt-1 flex items-center">
              <FaExclamationTriangle className="mr-1" />
              {getFieldError('experienceLevel')}
            </p>
          )}
        </div>

        {/* 位置/角色 / Position/Role */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Position/Role <span className="text-red-400 text-xs font-normal">*</span>
          </label>
          {getFieldValue('primarySport') && sportPositions[getFieldValue('primarySport')] ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {sportPositions[getFieldValue('primarySport')].map((position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => handlePositionToggle(position)}
                    disabled={!isEditing}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      (getFieldValue('positions') || []).includes(position)
                        ? 'bg-fanforce-primary text-white border border-fanforce-primary'
                        : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {position}
                  </button>
                ))}
              </div>
              {/* 显示已选择的位置 */}
              {(() => {
                const positions = getFieldValue('positions');
                const positionsArray = Array.isArray(positions) ? positions : [];
                return positionsArray.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {positionsArray.map((position: string) => (
                      <span
                        key={position}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-fanforce-primary/20 text-fanforce-primary border border-fanforce-primary/30"
                      >
                        {position}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handlePositionToggle(position)}
                            className="ml-2 text-fanforce-primary hover:text-white"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                );
              })()}
              {/* 显示验证错误 */}
              {getFieldError('positions') && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FaExclamationTriangle className="mr-1" />
                  {getFieldError('positions')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Please select a primary sport first
            </p>
          )}
        </div>

        {/* 身高 / Height */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Height
          </label>
          <input
            type="text"
            value={getFieldValue('height')}
            onChange={(e) => onFieldChange('height', e.target.value)}
            placeholder="e.g., 180cm, 1.8m, 5ft 10in"
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 mt-1">
            支持格式：180cm, 1.8m, 5ft 10in
          </p>
        </div>

        {/* 体重 / Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Weight
          </label>
          <input
            type="text"
            value={getFieldValue('weight')}
            onChange={(e) => onFieldChange('weight', e.target.value)}
            placeholder="e.g., 75kg, 165lb"
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50"
          />
          <p className="text-xs text-gray-400 mt-1">
            支持格式：75kg, 165lb
          </p>
        </div>

        {/* 成就 / Achievements */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Achievements
          </label>
          <textarea
            value={getFieldValue('achievements')}
            onChange={(e) => onFieldChange('achievements', e.target.value)}
            placeholder="Describe your sports achievements, awards, or notable performances..."
            rows={3}
            disabled={!isEditing}
            maxLength={500}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:ring-1 focus:ring-fanforce-primary disabled:opacity-50 resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-400">
              最多500个字符
            </p>
            <span className="text-xs text-gray-400">
              {getFieldValue('achievements').length}/500
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
