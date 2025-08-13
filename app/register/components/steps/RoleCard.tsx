// FanForce AI - 角色卡片组件
// Role Card Component - 显示单个角色选项的卡片

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { RoleCardProps } from './types'

export default function RoleCard({ option, isSelected, onSelect }: RoleCardProps) {
  const { language } = useLanguage()

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-300
        ${isSelected ? 'scale-105' : 'hover:scale-102'}
        min-h-[280px] sm:min-h-[260px] lg:min-h-[300px]
      `}
      onClick={() => onSelect(option.role)}
    >
      {/* 热门标签 / Popular Badge */}
      {option.popular && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-fanforce-gold text-fanforce-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {language === 'en' ? 'Popular' : '热门'}
          </div>
        </div>
      )}

      {/* 邀请码要求标签 / Invitation Required Badge */}
      {option.requiresInvite && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            {language === 'en' ? 'Invite Required' : '需要邀请码'}
          </div>
        </div>
      )}

      {/* 卡片主体 / Card Body */}
      <div className={`
        relative p-6 rounded-2xl border-2 transition-all duration-300
        bg-gradient-to-br ${option.gradient} bg-opacity-15
        ${isSelected 
          ? 'border-fanforce-gold shadow-2xl shadow-fanforce-gold/30' 
          : 'border-white/20 hover:border-white/40'
        }
        backdrop-blur-sm h-full flex flex-col
        hover:shadow-xl hover:shadow-${option.gradient.split(' ')[1]}/20
      `}>
        {/* 选中指示器 / Selected Indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4 z-10">
            <div className="w-6 h-6 bg-fanforce-gold rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-fanforce-dark" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        )}

        {/* 角色图标和标题 / Role Icon and Title */}
        <div className="text-center mb-4">
          <div className="text-3xl mb-2 transform hover:scale-110 transition-transform duration-200">
            {option.icon}
          </div>
          <h3 className="text-lg font-bold text-white drop-shadow-lg">
            {language === 'en' ? option.title.en : option.title.cn}
          </h3>
        </div>

        {/* 角色描述 / Role Description */}
        <p className="text-white/90 mb-4 text-sm leading-relaxed text-center flex-grow font-medium drop-shadow">
          {language === 'en' ? option.description.en : option.description.cn}
        </p>

        {/* 悬停效果 / Hover Effect */}
        <div className={`
          absolute inset-0 rounded-2xl transition-opacity duration-300
          bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-5
          ${isSelected ? 'opacity-10' : ''}
        `} />
      </div>
    </div>
  )
}
