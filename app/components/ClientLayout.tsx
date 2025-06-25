// FanForce AI - 客户端布局组件
// Client Layout Component - 客户端渲染的布局组件，包含语言上下文和导航栏
// Client-side rendered layout component with language context and navbar

'use client'

import { ReactNode } from 'react'
import { LanguageProvider } from '../context/LanguageContext'
import { Web3Provider } from '../context/Web3Context'
import Navbar from './Navbar'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <LanguageProvider>
      <Web3Provider>
      <div className="min-h-screen">
        {/* 顶部导航栏 / Top Navigation Bar */}
        <Navbar />
        
        {/* 主要内容区域 / Main Content Area */}
        <main className="relative">
          {children}
        </main>
        
        {/* 底部信息 / Footer */}
        <footer className="bg-black/30 backdrop-blur-sm mt-20">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-gray-400">
              <p>© 2024 FanForce AI | AI-Powered Sports Prediction Platform</p>
              <p className="text-sm mt-2">Powered by ChatGPT & Chiliz SDK</p>
            </div>
          </div>
        </footer>
      </div>
      </Web3Provider>
    </LanguageProvider>
  )
} 