// FanForce AI - 导航栏组件
// Navbar Component - 顶部导航栏，包含语言切换和钱包连接功能
// Top navigation bar with language switching and wallet connection features

'use client'

import { useLanguage } from '../context/LanguageContext'
import WalletConnect from './WalletConnect'

export default function Navbar() {
  const { language, toggleLanguage, t } = useLanguage()

  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              <span className="text-fanforce-gold">FanForce</span>
              <span className="text-fanforce-secondary ml-1">AI</span>
            </h1>
            <span className="ml-3 text-sm text-gray-300">
              AI-Powered Sports Prediction Platform
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
              title="Switch Language"
            >
              {language === 'en' ? '中' : 'EN'}
            </button>
            <WalletConnect />
          </div>
        </div>
      </div>
    </nav>
  )
} 