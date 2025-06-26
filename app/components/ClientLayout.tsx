// FanForce AI - 客户端布局组件
// Client Layout Component - 客户端渲染的布局组件，包含语言上下文、Web3上下文和合约上下文
// Client-side rendered layout component with language context, Web3 context and contract context

'use client'

import { useState, useEffect, ReactNode } from 'react'
import { LanguageProvider } from '../context/LanguageContext'
import { Web3Provider } from '../context/Web3Context'
import { ContractProvider } from '../context/ContractContext'
import Navbar from './Navbar'

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <LanguageProvider>
      <Web3Provider>
        <ContractProvider>
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
        </ContractProvider>
      </Web3Provider>
    </LanguageProvider>
  )
}

// 客户端挂载检测组件 / Client Mount Detection Component
interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// 延迟渲染组件，用于需要localStorage或其他浏览器API的组件
// Delayed Render Component for components that need localStorage or other browser APIs
interface DelayedRenderProps {
  children: ReactNode
  delay?: number
  fallback?: ReactNode
}

export function DelayedRender({ children, delay = 100, fallback = null }: DelayedRenderProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!shouldRender) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// 水合安全组件 - 确保服务器端和客户端渲染一致
// Hydration Safe Component - ensures server and client render consistency
interface HydrationSafeProps {
  children: ReactNode
  serverFallback?: ReactNode
}

export function HydrationSafe({ children, serverFallback = <div></div> }: HydrationSafeProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient ? <>{children}</> : <>{serverFallback}</>
} 