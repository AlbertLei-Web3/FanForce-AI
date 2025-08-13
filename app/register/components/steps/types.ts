// FanForce AI - 类型定义文件
// Types Definition File - 统一管理所有组件需要的接口定义

import { UserRole } from '../../../context/UserContext'

// 注册状态接口 / Registration State Interface
export interface RegistrationState {
  currentStep: number
  completedSteps: number[]
  selectedPrimaryRole: UserRole | null
  selectedSecondaryRoles: UserRole[]
  authMethod: string | null
  personalInfo: Record<string, any>
  roleSpecificData: Record<string, any>
  isProcessing: boolean
  errors: Record<string, string | undefined>
  userId: string
}

// 身份选择器属性接口 / Identity Selector Props Interface
export interface IdentitySelectorProps {
  registrationState: RegistrationState
  updateState: (updates: Partial<RegistrationState>) => void
  onNext: () => void
}

// 角色选项接口 / Role Option Interface
export interface RoleOption {
  role: UserRole
  icon: string
  title: { en: string; cn: string }
  description: { en: string; cn: string }
  features: Array<{ en: string; cn: string }>
  gradient: string
  popular: boolean
  requiresInvite?: boolean
}

// 角色卡片属性接口 / Role Card Props Interface
export interface RoleCardProps {
  option: RoleOption
  isSelected: boolean
  onSelect: (role: UserRole) => void
}

// 邀请码弹窗属性接口 / Invitation Code Modal Props Interface
export interface InvitationCodeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (code: string) => void
  onSkip: () => void
}

// 管理员验证弹窗属性接口 / Admin Verification Modal Props Interface
export interface AdminVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (code: string) => void
}
