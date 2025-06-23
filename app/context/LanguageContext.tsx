// FanForce AI - 语言上下文文件
// Language Context File - 全局语言状态管理
// Global language state management for the entire application

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { translate, Language, TranslationKeys } from '../utils/i18n'

// 上下文接口定义 / Context interface definition
interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: keyof TranslationKeys) => string // 使用翻译键的翻译函数 / Translation function using translation keys
  tTeam: (en: string, zh: string) => string // 球队名称翻译函数 / Team name translation function
}

// 创建语言上下文 / Create language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 语言提供者组件 / Language provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en') // 默认英文 / Default English
  
  // 切换语言函数 / Toggle language function
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en')
  }
  
  // 标准翻译函数 / Standard translation function
  const t = (key: keyof TranslationKeys) => {
    return translate(key, language)
  }
  
  // 球队名称翻译函数（保持兼容性）/ Team name translation function (maintain compatibility)
  const tTeam = (en: string, zh: string) => {
    return language === 'en' ? en : zh
  }
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, tTeam }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 使用语言上下文的Hook / Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext 