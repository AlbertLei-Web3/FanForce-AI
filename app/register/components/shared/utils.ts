// FanForce AI - 注册流程工具函数
// Registration Flow Utility Functions

import { UserRole } from '../../../context/UserContext'
import { REGISTRATION_ROUTES } from './constants'

// 根据角色获取仪表板路径 / Get dashboard path based on role
export const getDashboardPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.AUDIENCE:
      return REGISTRATION_ROUTES.AUDIENCE
    case UserRole.ATHLETE:
      return REGISTRATION_ROUTES.ATHLETE
    case UserRole.AMBASSADOR:
      return REGISTRATION_ROUTES.AMBASSADOR
    default:
      return REGISTRATION_ROUTES.DASHBOARD
  }
}

// 保存用户数据到本地存储 / Save user data to local storage
export const saveUserData = (userData: any, selectedRole: UserRole): void => {
  try {
    const dataToSave = {
      ...userData,
      selectedRole,
      registrationCompleted: true,
      registrationDate: new Date().toISOString()
    }
    localStorage.setItem('userData', JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Failed to save user data:', error)
  }
}

// 从本地存储获取用户数据 / Get user data from local storage
export const getUserData = (): any => {
  try {
    const data = localStorage.getItem('userData')
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to get user data:', error)
    return null
  }
}

// 清除本地存储的用户数据 / Clear user data from local storage
export const clearUserData = (): void => {
  try {
    localStorage.removeItem('userData')
  } catch (error) {
    console.error('Failed to clear user data:', error)
  }
}

// 检查用户是否已完成注册 / Check if user has completed registration
export const isRegistrationCompleted = (): boolean => {
  const userData = getUserData()
  return userData?.registrationCompleted === true
}

// 模拟延迟函数 / Simulate delay function
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 验证邮箱格式 / Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 生成随机用户ID / Generate random user ID
export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
