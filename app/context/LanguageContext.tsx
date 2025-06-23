// FanForce AI - 语言上下文文件
// Language Context File - 全局语言状态管理
// Global language state management for the entire application

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

// 语言类型定义 / Language type definition
type Language = 'en' | 'zh'

// 上下文接口定义 / Context interface definition
interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (en: string, zh: string) => string // 翻译函数 / Translation function
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
  
  // 翻译函数 / Translation function
  const t = (en: string, zh: string) => {
    return language === 'en' ? en : zh
  }
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
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