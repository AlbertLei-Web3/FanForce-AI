// FanForce AI - 保存状态指示器组件
// Save Status Indicator Component

import React from 'react'
import { SaveState } from '../types'
import { FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa'

interface SaveStatusProps {
  saveState: SaveState
  className?: string
}

const SaveStatus: React.FC<SaveStatusProps> = ({ saveState, className = '' }) => {
  const formatLastSaved = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return '刚刚'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours}小时前`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days}天前`
    }
  }

  if (saveState.isSaving) {
    return (
      <div className={`flex items-center gap-2 text-blue-400 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
        <span className="text-sm">保存中...</span>
      </div>
    )
  }

  if (saveState.hasUnsavedChanges) {
    return (
      <div className={`flex items-center gap-2 text-yellow-400 ${className}`}>
        <FaExclamationTriangle className="w-4 h-4" />
        <span className="text-sm">有未保存的更改</span>
      </div>
    )
  }

  if (saveState.lastSaved) {
    return (
      <div className={`flex items-center gap-2 text-green-400 ${className}`}>
        <FaCheck className="w-4 h-4" />
        <span className="text-sm">已保存</span>
        <span className="text-xs text-gray-400">
          ({formatLastSaved(saveState.lastSaved)})
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
      <FaClock className="w-4 h-4" />
      <span className="text-sm">未保存</span>
    </div>
  )
}

export default SaveStatus
