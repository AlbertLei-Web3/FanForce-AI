// FanForce AI - StatCard Component / 统计卡片组件
// This reusable card shows a numeric value with icon and title.
// 该可复用卡片组件显示一个带图标和标题的数值。

'use client'

import React from 'react'

interface StatCardProps {
  /** Title text already localised / 已本地化的标题 */
  title: string
  /** Display value (string to allow formatted) / 显示值（字符串以便格式化） */
  value: string | number
  /** Emoji or icon component / Emoji 或图标组件 */
  icon?: React.ReactNode
}

export default function StatCard ({ title, value, icon }: StatCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex items-center space-x-4 backdrop-blur-sm">
      <div className="text-3xl">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
} 