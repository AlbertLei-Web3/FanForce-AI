// FanForce AI - 角色确认弹窗组件
// Role Confirmation Modal Component - 用户选择角色后的确认弹窗
// Confirmation popup after user selects a role

'use client'

import { useLanguage } from '../../../context/LanguageContext'
import { UserRole } from '../../../context/UserContext'
import { roleOptions } from './roleConfig'

interface RoleConfirmationModalProps {
  isOpen: boolean
  selectedRole: UserRole | null
  onConfirm: () => void
  onCancel: () => void
}

export default function RoleConfirmationModal({ 
  isOpen, 
  selectedRole, 
  onConfirm, 
  onCancel 
}: RoleConfirmationModalProps) {
  const { language } = useLanguage()
  
  // 如果弹窗未打开，不渲染任何内容 / If modal is not open, don't render anything
  if (!isOpen || !selectedRole) return null

  // 获取选中角色的信息 / Get selected role information
  const roleInfo = roleOptions.find(opt => opt.role === selectedRole)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-white/20 shadow-2xl max-w-lg w-full mx-4 transform animate-fadeIn">
        {/* 弹窗标题 / Modal Title */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{roleInfo?.icon}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {language === 'en' ? 'Confirm Your Role' : '确认您的角色'}
          </h3>
          <p className="text-gray-300 text-lg">
            {language === 'en' 
              ? `You've selected: ${roleInfo?.title.en}`
              : `您已选择：${roleInfo?.title.cn}`
            }
          </p>
        </div>
        
        {/* 角色详情 / Role Details */}
        <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/20">
          <h4 className="text-white font-semibold mb-3 text-lg">
            {language === 'en' ? 'Role Features:' : '角色特性：'}
          </h4>
          <ul className="space-y-2">
            {roleInfo?.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-fanforce-gold rounded-full flex-shrink-0"></div>
                <span className="text-sm">
                  {language === 'en' ? feature.en : feature.cn}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 确认提示 / Confirmation Prompt */}
        <div className="text-center mb-6">
          <p className="text-gray-300 text-sm">
            {language === 'en' 
              ? 'Are you sure you want to proceed with this role? You can change it later in your profile settings.'
              : '您确定要选择这个角色吗？您可以在个人资料设置中稍后更改。'
            }
          </p>
        </div>
        
        {/* 弹窗按钮 / Modal Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all duration-200 hover:scale-105"
          >
            {language === 'en' ? 'Change Role' : '更改角色'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            {language === 'en' ? 'Confirm & Continue' : '确认并继续'}
          </button>
        </div>
      </div>
    </div>
  )
}
