// 财富池动画组件 - 水滴汇集隐喻
// Wealth Pool Animation Component - Droplet Collection Metaphor

import React from 'react'

interface WealthPoolAnimationProps {
  children: React.ReactNode
  className?: string
}

export default function WealthPoolAnimation({ children, className = '' }: WealthPoolAnimationProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 水滴下落动画 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 水滴1 */}
        <div 
          className="absolute top-0 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce opacity-50" 
          style={{ animationDelay: '0s', animationDuration: '4s' }}
        ></div>
        {/* 水滴2 */}
        <div 
          className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-400/70 rounded-full animate-bounce opacity-60" 
          style={{ animationDelay: '1.5s', animationDuration: '4.5s' }}
        ></div>
        {/* 水滴3 */}
        <div 
          className="absolute top-0 right-1/4 w-2.5 h-2.5 bg-blue-400/50 rounded-full animate-bounce opacity-40" 
          style={{ animationDelay: '3s', animationDuration: '3.8s' }}
        ></div>
        {/* 水滴4 */}
        <div 
          className="absolute top-0 right-1/3 w-1 h-1 bg-blue-400/80 rounded-full animate-bounce opacity-70" 
          style={{ animationDelay: '0.8s', animationDuration: '5s' }}
        ></div>
        {/* 水滴5 */}
        <div 
          className="absolute top-0 left-1/3 w-1.5 h-1.5 bg-blue-400/65 rounded-full animate-bounce opacity-55" 
          style={{ animationDelay: '2.2s', animationDuration: '4.2s' }}
        ></div>
      </div>

      {/* 主要内容区域 */}
      <div className="relative z-10">
        {children}
      </div>

      {/* 水面效果 */}
      <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none">
        {/* 水面反射 */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-blue-600/20 via-blue-500/10 to-transparent rounded-t-full"></div>
        
        {/* 水波纹效果 */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent rounded-full animate-pulse" 
               style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-1 w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-300/20 to-transparent rounded-full animate-pulse" 
               style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* 轻微的水面波动 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400/15 to-transparent animate-pulse" 
             style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  )
}

// 水面涟漪效果组件
// Water Ripple Effect Component
export function WealthPoolRipple({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {/* 水面涟漪 */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent rounded-full animate-pulse" 
             style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1 w-14 h-0.5 bg-gradient-to-r from-transparent via-blue-300/25 to-transparent rounded-full animate-pulse" 
             style={{ animationDelay: '0.8s' }}></div>
      </div>
    </div>
  )
}

// 水滴图标包装组件 - 有落差分布
// Droplet Icon Wrapper Component - Staggered Distribution
export function DropletIconWrapper({ children, language = 'en' }: { children: React.ReactNode, language?: string }) {
  return (
    <div className="relative">
      {/* 文字内容 */}
      <div className="text-gray-400 text-sm flex items-center justify-center">
        <span>{children}</span>
      </div>
      
             {/* 左侧水滴 - 较高位置 */}
       <div className="absolute -top-1 -left-3 text-blue-400 text-sm animate-bounce opacity-60" 
            style={{ animationDelay: '0s', animationDuration: '2s' }}>
         💧
       </div>
       
       {/* 右侧水滴 - 较低位置 */}
       <div className="absolute -bottom-1 -right-2 text-blue-400 text-sm animate-bounce opacity-60" 
            style={{ animationDelay: '1s', animationDuration: '2.5s' }}>
         💧
       </div>
    </div>
  )
} 