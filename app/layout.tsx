// FanForce AI - 应用布局文件
// App Layout File - 定义整个应用的基础布局和样式
// Defines the basic layout and styles for the entire application

import React from 'react'
import './globals.css'

export const metadata = {
  title: 'FanForce AI | AI驱动的体育预测平台',
  description: 'AI-Powered Sports Prediction Platform with Fan Token Integration | 结合Fan Token的AI体育预测平台',
  keywords: 'AI, Sports, Prediction, Fan Token, Chiliz, Football, World Cup',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-fanforce-dark via-gray-900 to-fanforce-primary min-h-screen font-sans">
        <div className="min-h-screen">
          {/* 顶部导航栏 / Top Navigation Bar */}
          <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-white">
                    <span className="text-fanforce-gold">FanForce</span>
                    <span className="text-fanforce-secondary ml-1">AI</span>
                  </h1>
                  <span className="ml-3 text-sm text-gray-300">
                    AI驱动的体育预测 / AI-Powered Sports Prediction
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="bg-fanforce-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    连接钱包 / Connect Wallet
                  </button>
                </div>
              </div>
            </div>
          </nav>
          
          {/* 主要内容区域 / Main Content Area */}
          <main className="relative">
            {children}
          </main>
          
          {/* 底部信息 / Footer */}
          <footer className="bg-black/30 backdrop-blur-sm mt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center text-gray-400">
                <p>© 2024 FanForce AI | 基于Chiliz生态的AI体育预测平台</p>
                <p className="text-sm mt-2">Powered by ChatGPT & Chiliz SDK</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 