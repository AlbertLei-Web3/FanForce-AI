// FanForce AI - 应用布局文件
// App Layout File - 定义整个应用的基础布局和样式
// Defines the basic layout and styles for the entire application

import React from 'react'
import './globals.css'
import ClientLayout from './components/ClientLayout'

export const metadata = {
  title: 'FanForce AI | AI-Powered Sports Prediction Platform',
  description: 'AI-Powered Sports Prediction Platform with Fan Token Integration',
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
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 