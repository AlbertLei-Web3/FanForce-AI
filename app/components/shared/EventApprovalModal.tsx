// Event Approval Modal Component
// 事件审批模态框组件
// This component provides a comprehensive interface for admins to approve or reject event applications
// 此组件为管理员提供批准或拒绝事件申请的综合界面

'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaCheck, FaTimes as FaX, FaCoins, FaUsers, FaEdit, FaInfoCircle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { toastStyles } from '../../utils/toastStyles'

// Event Application Interface
// 事件申请接口
interface EventApplication {
  id: string
  event_title: string
  event_description?: string
  venue_name: string
  venue_capacity: number
  estimated_participants: number
  team_a_info: any
  team_b_info: any
  status: string
  created_at: string
  application_notes?: string
  external_sponsors?: any[]
}

// Approval Modal Props
// 审批模态框属性
interface EventApprovalModalProps {
  isOpen: boolean
  onClose: () => void
  application: EventApplication | null
  onApprove: (applicationId: string, data: ApprovalData) => Promise<void>
  onReject: (applicationId: string, data: RejectionData) => Promise<void>
  language: 'en' | 'zh'
}

// Approval Data Interface
// 批准数据接口
interface ApprovalData {
  injectedChzAmount: number
  teamACoefficient: number
  teamBCoefficient: number
  adminNotes: string
}

// Rejection Data Interface
// 拒绝数据接口
interface RejectionData {
  adminNotes: string
}

export default function EventApprovalModal({
  isOpen,
  onClose,
  application,
  onApprove,
  onReject,
  language
}: EventApprovalModalProps) {
  // Form state for approval
  // 批准表单状态
  const [approvalData, setApprovalData] = useState<ApprovalData>({
    injectedChzAmount: 500,
    teamACoefficient: 1.0,
    teamBCoefficient: 1.0,
    adminNotes: ''
  })

  // Form state for rejection
  // 拒绝表单状态
  const [rejectionData, setRejectionData] = useState<RejectionData>({
    adminNotes: ''
  })

  // Loading states
  // 加载状态
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Reset form when application changes
  // 当申请改变时重置表单
  useEffect(() => {
    if (application) {
      setApprovalData({
        injectedChzAmount: 500,
        teamACoefficient: 1.0,
        teamBCoefficient: 1.0,
        adminNotes: ''
      })
      setRejectionData({
        adminNotes: ''
      })
    }
  }, [application])

  // Handle approval submission
  // 处理批准提交
  const handleApprove = async () => {
    if (!application) return

    if (approvalData.injectedChzAmount <= 0) {
      toast.error(language === 'en' ? 'Please enter a valid CHZ amount' : '请输入有效的CHZ金额', toastStyles.error)
      return
    }

    if (approvalData.teamACoefficient <= 0 || approvalData.teamBCoefficient <= 0) {
      toast.error(language === 'en' ? 'Please enter valid coefficients' : '请输入有效的系数', toastStyles.error)
      return
    }

    setIsApproving(true)
    try {
      await onApprove(application.id, approvalData)
      onClose()
    } catch (error) {
      console.error('Error approving application:', error)
    } finally {
      setIsApproving(false)
    }
  }

  // Handle rejection submission
  // 处理拒绝提交
  const handleReject = async () => {
    if (!application) return

    setIsRejecting(true)
    try {
      await onReject(application.id, rejectionData)
      onClose()
    } catch (error) {
      console.error('Error rejecting application:', error)
    } finally {
      setIsRejecting(false)
    }
  }

  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800/95 border border-slate-700/50 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <FaEdit className="text-blue-400 text-xl" />
            </div>
            <span>
              {language === 'en' ? 'Event Application Review' : '事件申请审核'}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Application Details */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-6 mb-8 shadow-lg">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span>{application.event_title}</span>
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">{language === 'en' ? 'Venue:' : '场馆:'}</span>
              <span className="text-white ml-2">{application.venue_name}</span>
            </div>
            <div>
              <span className="text-slate-500">{language === 'en' ? 'Capacity:' : '容量:'}</span>
              <span className="text-white ml-2">{application.venue_capacity}</span>
            </div>
            <div>
              <span className="text-slate-500">{language === 'en' ? 'Participants:' : '参与者:'}</span>
              <span className="text-white ml-2">{application.estimated_participants}</span>
            </div>
            <div>
              <span className="text-slate-500">{language === 'en' ? 'Created:' : '创建时间:'}</span>
              <span className="text-white ml-2">
                {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-slate-500">{language === 'en' ? 'Team A:' : 'A队:'}</span>
              <span className="text-white">{application.team_a_info?.name || 'N/A'}</span>
              <span className="text-slate-500">{language === 'en' ? 'Team B:' : 'B队:'}</span>
              <span className="text-white">{application.team_b_info?.name || 'N/A'}</span>
            </div>
          </div>

          {application.application_notes && (
            <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700/30 rounded">
              <span className="text-slate-500 text-sm">{language === 'en' ? 'Notes:' : '备注:'}</span>
              <p className="text-white text-sm mt-1">{application.application_notes}</p>
            </div>
          )}
        </div>

        {/* Approval Form */}
        <div className="space-y-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-emerald-400 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <FaCheck className="text-emerald-400" />
              </div>
              <span>{language === 'en' ? 'Approve Application' : '批准申请'}</span>
            </h4>
            
            <div className="space-y-4">
              {/* CHZ Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
                  <FaCoins className="text-yellow-400" />
                  <span>{language === 'en' ? 'CHZ Pool Amount' : 'CHZ奖池金额'}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={approvalData.injectedChzAmount}
                  onChange={(e) => setApprovalData(prev => ({
                    ...prev,
                    injectedChzAmount: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  placeholder={language === 'en' ? 'Enter CHZ amount' : '输入CHZ金额'}
                />
              </div>

              {/* Team Coefficients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Team A Coefficient' : 'A队系数'}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={approvalData.teamACoefficient}
                    onChange={(e) => setApprovalData(prev => ({
                      ...prev,
                      teamACoefficient: parseFloat(e.target.value) || 1.0
                    }))}
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {language === 'en' ? 'Team B Coefficient' : 'B队系数'}
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={approvalData.teamBCoefficient}
                    onChange={(e) => setApprovalData(prev => ({
                      ...prev,
                      teamBCoefficient: parseFloat(e.target.value) || 1.0
                    }))}
                    className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                    placeholder="1.0"
                  />
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {language === 'en' ? 'Admin Notes (Optional)' : '管理员备注（可选）'}
                </label>
                <textarea
                  value={approvalData.adminNotes}
                  onChange={(e) => setApprovalData(prev => ({
                    ...prev,
                    adminNotes: e.target.value
                  }))}
                  rows={3}
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 resize-none"
                  placeholder={language === 'en' ? 'Enter approval notes...' : '输入批准备注...'}
                />
              </div>

              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border border-emerald-400/20"
              >
                {isApproving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="text-sm">{language === 'en' ? 'Approving...' : '批准中...'}</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="text-lg" />
                    <span className="text-sm">{language === 'en' ? 'Approve Application' : '批准申请'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rejection Form */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-red-400 mb-6 flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FaX className="text-red-400" />
              </div>
              <span>{language === 'en' ? 'Reject Application' : '拒绝申请'}</span>
            </h4>
            
            <div className="space-y-4">
              {/* Rejection Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {language === 'en' ? 'Rejection Reason' : '拒绝原因'}
                </label>
                <textarea
                  value={rejectionData.adminNotes}
                  onChange={(e) => setRejectionData(prev => ({
                    ...prev,
                    adminNotes: e.target.value
                  }))}
                  rows={3}
                  className="w-full bg-slate-800/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 resize-none"
                  placeholder={language === 'en' ? 'Enter rejection reason...' : '输入拒绝原因...'}
                />
              </div>

              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl border border-red-400/20"
              >
                {isRejecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="text-sm">{language === 'en' ? 'Rejecting...' : '拒绝中...'}</span>
                  </>
                ) : (
                  <>
                    <FaX className="text-lg" />
                    <span className="text-sm">{language === 'en' ? 'Reject Application' : '拒绝申请'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl shadow-lg">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <FaInfoCircle className="text-blue-400" />
            </div>
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">
                {language === 'en' ? 'Approval Process' : '审批流程'}
              </p>
              <ul className="space-y-1 text-xs">
                <li>• {language === 'en' ? 'CHZ amount will be injected into the event pool' : 'CHZ金额将注入事件奖池'}</li>
                <li>• {language === 'en' ? 'Support options will be created for both teams' : '将为两个队伍创建支持选项'}</li>
                <li>• {language === 'en' ? 'Event will be created and activated' : '事件将被创建并激活'}</li>
                <li>• {language === 'en' ? 'Approval will be logged for audit' : '审批将被记录用于审计'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 