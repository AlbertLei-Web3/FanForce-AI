// FanForce AI - Profile页面类型定义
// Profile Page Type Definitions

// 个人信息接口 / Personal Information Interface
export interface PersonalInfo {
  username: string
  email: string
  phone: string
  emergencyContact: string
  regionalLocation: string
}

// 角色特定信息接口 / Role-Specific Information Interface
export interface RoleSpecificInfo {
  // 运动员特有信息 / Athlete-specific information
  primarySport?: string
  experienceLevel?: string
  positions?: string[]
  height?: string
  weight?: string
  achievements?: string
  
  // 观众特有信息 / Audience-specific information
  interestedSports?: string
  favoriteTeams?: string
  
  // 大使特有信息 / Ambassador-specific information
  department?: string
}

// 运动项目选项 / Sports options
export interface SportOption {
  value: string
  label: string
  note?: string
}

// 区域位置选项 / Regional location options
export interface RegionalLocationOptions {
  [region: string]: {
    [country: string]: string[] | {
      [city: string]: string[]
    }
  }
}

// 编辑状态接口 / Edit state interface
export interface EditStates {
  personal: boolean
  athlete: boolean
  audience: boolean
  ambassador: boolean
}

// 区域选择状态 / Regional selection state
export interface RegionalSelection {
  region: string
  country: string
  city: string
  institution: string
}

// 表单验证错误接口 / Form validation error interface
export interface ValidationErrors {
  [field: string]: string
}

// 表单字段接口 / Form field interface
export interface FormField {
  value: string
  error?: string
  touched: boolean
}

// 表单状态接口 / Form state interface
export interface FormState {
  [key: string]: FormField
}

// API响应接口 / API response interface
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationErrors
}

// 用户角色枚举 / User role enum
export enum UserRole {
  ATHLETE = 'athlete',
  AUDIENCE = 'audience',
  AMBASSADOR = 'ambassador'
}

// 用户完整信息接口 / Complete user information interface
export interface UserProfile {
  id: string
  personalInfo: PersonalInfo
  roleSpecificInfo: RoleSpecificInfo
  roles: UserRole[]
  createdAt: string
  updatedAt: string
}

// 保存操作状态 / Save operation state
export interface SaveState {
  isSaving: boolean
  lastSaved?: string
  hasUnsavedChanges: boolean
}

// 文件上传接口 / File upload interface
export interface FileUpload {
  id: string
  filename: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

// 头像信息接口 / Avatar information interface
export interface AvatarInfo {
  current: string
  uploads: FileUpload[]
}

// 通知偏好设置 / Notification preferences
export interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  marketing: boolean
}

// 隐私设置 / Privacy settings
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private'
  showContactInfo: boolean
  showLocation: boolean
  allowMessages: boolean
}
