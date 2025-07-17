'use client'

import { useState, useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'

export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-emerald-400" />
      case 'error':
        return <FaExclamationCircle className="text-red-400" />
      case 'warning':
        return <FaExclamationCircle className="text-amber-400" />
      case 'info':
        return <FaInfoCircle className="text-blue-400" />
      default:
        return <FaInfoCircle className="text-blue-400" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
      case 'error':
        return 'bg-red-500/10 border-red-500/30 text-red-400'
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
      default:
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] animate-in slide-in-from-top-2 duration-300">
      <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl border backdrop-blur-sm shadow-lg min-w-[300px] ${getStyles()}`}>
        {getIcon()}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(() => onClose?.(), 300)
          }}
          className="ml-2 text-slate-400 hover:text-slate-300 transition-colors"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  )
}

// Toast Manager Hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([])

  const showToast = (toast: Omit<ToastProps, 'onClose'>) => {
    const id = Date.now() + Math.random()
    const newToast = {
      ...toast,
      id,
      onClose: () => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }
    }
    setToasts(prev => [...prev, newToast])
  }

  const ToastContainer = () => (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )

  return { showToast, ToastContainer }
} 