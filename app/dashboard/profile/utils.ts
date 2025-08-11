// FanForce AI - Profile页面工具函数
// Profile Page Utility Functions

import { PersonalInfo, RoleSpecificInfo, ValidationErrors, FormField, FormState } from './types'

// 表单验证函数 / Form validation functions
export const validatePersonalInfo = (data: PersonalInfo): ValidationErrors => {
  const errors: ValidationErrors = {}

  if (!data.username.trim()) {
    errors.username = '用户名不能为空'
  } else if (data.username.length < 2) {
    errors.username = '用户名至少需要2个字符'
  } else if (data.username.length > 20) {
    errors.username = '用户名不能超过20个字符'
  }

  if (!data.email.trim()) {
    errors.email = '邮箱不能为空'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = '请输入有效的邮箱地址'
  }

  if (!data.phone.trim()) {
    errors.phone = '电话号码不能为空'
  } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = '请输入有效的电话号码'
  }

  if (!data.emergencyContact.trim()) {
    errors.emergencyContact = '紧急联系人不能为空'
  }

  if (!data.regionalLocation.trim()) {
    errors.regionalLocation = '区域位置不能为空'
  }

  return errors
}

export const validateRoleSpecificInfo = (data: RoleSpecificInfo, role: string): ValidationErrors => {
  const errors: ValidationErrors = {}

  if (role === 'athlete') {
    if (!data.primarySport) {
      errors.primarySport = '请选择主要运动项目'
    }
    if (!data.experienceLevel) {
      errors.experienceLevel = '请选择经验水平'
    }
    if (!data.positions || data.positions.length === 0) {
      errors.positions = '请选择至少一个位置'
    }
  }

  if (role === 'ambassador') {
    if (!data.department) {
      errors.department = '请选择所属院系'
    }
  }

  return errors
}

// 表单状态管理 / Form state management
export const createFormState = (initialData: any): FormState => {
  const formState: FormState = {}
  
  Object.keys(initialData).forEach(key => {
    formState[key] = {
      value: initialData[key] || '',
      touched: false,
      error: undefined
    }
  })
  
  return formState
}

export const updateFormField = (
  formState: FormState, 
  field: string, 
  value: string, 
  error?: string
): FormState => {
  return {
    ...formState,
    [field]: {
      ...formState[field],
      value,
      error,
      touched: true
    }
  }
}

export const markFieldAsTouched = (formState: FormState, field: string): FormState => {
  return {
    ...formState,
    [field]: {
      ...formState[field],
      touched: true
    }
  }
}

// 数据转换函数 / Data transformation functions
export const formStateToData = (formState: FormState): any => {
  const data: any = {}
  
  Object.keys(formState).forEach(key => {
    data[key] = formState[key].value
  })
  
  return data
}

export const dataToFormState = (data: any): FormState => {
  return createFormState(data)
}

// 检查是否有未保存的更改 / Check for unsaved changes
export const hasUnsavedChanges = (original: any, current: any): boolean => {
  return JSON.stringify(original) !== JSON.stringify(current)
}

// 格式化电话号码 / Format phone number
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

// 验证文件上传 / Validate file upload
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (file.size > maxSize) {
    return { isValid: false, error: '文件大小不能超过5MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: '只支持JPEG、PNG、GIF、WebP格式的图片' }
  }
  
  return { isValid: true }
}

// 生成唯一ID / Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 防抖函数 / Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数 / Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
