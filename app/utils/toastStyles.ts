// Toast Styles Configuration
// Toast样式配置
// Centralized toast styling for consistent UI across the application
// 集中式toast样式配置，确保应用程序UI一致性

export const toastStyles = {
  // Success toast styles
  // 成功toast样式
  success: {
    duration: 4000,
    position: 'top-right' as const,
    style: {
      background: '#10b981',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    }
  },

  // Error toast styles
  // 错误toast样式
  error: {
    duration: 5000,
    position: 'top-right' as const,
    style: {
      background: '#ef4444',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }
  },

  // Warning toast styles
  // 警告toast样式
  warning: {
    duration: 4000,
    position: 'top-right' as const,
    style: {
      background: '#f59e0b',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
      border: '1px solid rgba(245, 158, 11, 0.2)'
    }
  },

  // Info toast styles
  // 信息toast样式
  info: {
    duration: 4000,
    position: 'top-right' as const,
    style: {
      background: '#3b82f6',
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    }
  }
}

// Toast helper functions
// Toast辅助函数
export const showSuccessToast = (message: string) => {
  const { toast } = require('react-hot-toast')
  return toast.success(message, toastStyles.success)
}

export const showErrorToast = (message: string) => {
  const { toast } = require('react-hot-toast')
  return toast.error(message, toastStyles.error)
}

export const showWarningToast = (message: string) => {
  const { toast } = require('react-hot-toast')
  return toast(message, {
    ...toastStyles.warning,
    icon: '⚠️'
  })
}

export const showInfoToast = (message: string) => {
  const { toast } = require('react-hot-toast')
  return toast(message, {
    ...toastStyles.info,
    icon: 'ℹ️'
  })
} 