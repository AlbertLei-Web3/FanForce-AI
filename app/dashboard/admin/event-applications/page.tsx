'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Types for Event Application Management
// 活动申请管理的类型定义
interface EventApplication {
  id: string;
  ambassador_id: string;
  event_title: string;
  event_description: string;
  event_start_time: string;
  venue_name: string;
  venue_capacity: number;
  team_a_info: any;
  team_b_info: any;
  status: string;
  priority_level: number;
  ambassador_wallet: string;
  ambassador_student_id: string;
  created_at: string;
  admin_review: any;
}

interface FeeRule {
  id: string;
  rule_name: string;
  staking_fee_percent: number;
  distribution_fee_percent: number;
}

interface ApprovalForm {
  applicationId: string;
  action: 'approve' | 'reject';
  injectedChzAmount: number;
  feeRuleId: string;
  supportOptions: {
    team_a_coefficient: number;
    team_b_coefficient: number;
  };
  adminNotes: string;
}

export default function AdminEventApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<EventApplication | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    applicationId: '',
    action: 'approve',
    injectedChzAmount: 0,
    feeRuleId: '',
    supportOptions: {
      team_a_coefficient: 1.5,
      team_b_coefficient: 1.2
    },
    adminNotes: ''
  });
  const [feeRules, setFeeRules] = useState<FeeRule[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch event applications
  // 获取活动申请
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/event-applications?status=pending&page=${currentPage}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error('Failed to fetch applications');
        toast.error('获取申请失败');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Error fetching applications');
      toast.error('获取申请时出错');
    } finally {
      setLoading(false);
    }
  };

  // Fetch fee rules
  // 获取手续费规则
  const fetchFeeRules = async () => {
    try {
      const response = await fetch('/api/admin/fee-rules');
      const data = await response.json();
      
      if (data.success) {
        setFeeRules(data.data);
      }
    } catch (error) {
      console.error('Error fetching fee rules:', error);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchFeeRules();
  }, [currentPage]);

  // Handle application approval/rejection
  // 处理申请批准/拒绝
  const handleApproval = async () => {
    try {
      const response = await fetch('/api/admin/event-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: approvalForm.applicationId,
          action: approvalForm.action,
          adminId: 'admin-user-id', // This should come from user context
          injectedChzAmount: approvalForm.injectedChzAmount,
          feeRuleId: approvalForm.feeRuleId,
          supportOptions: approvalForm.supportOptions,
          adminNotes: approvalForm.adminNotes
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Application ${approvalForm.action}d successfully`);
        toast.success(`申请${approvalForm.action === 'approve' ? '批准' : '拒绝'}成功`);
        setShowApprovalModal(false);
        fetchApplications(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to process application');
        toast.error(data.error || '处理申请失败');
      }
    } catch (error) {
      console.error('Error processing application:', error);
      toast.error('Error processing application');
      toast.error('处理申请时出错');
    }
  };

  // Open approval modal
  // 打开审批模态框
  const openApprovalModal = (application: EventApplication) => {
    setSelectedApplication(application);
    setApprovalForm({
      applicationId: application.id,
      action: 'approve',
      injectedChzAmount: 0,
      feeRuleId: feeRules[0]?.id || '',
      supportOptions: {
        team_a_coefficient: 1.5,
        team_b_coefficient: 1.2
      },
      adminNotes: ''
    });
    setShowApprovalModal(true);
  };

  // Format date for display
  // 格式化日期显示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get team names from JSON
  // 从JSON获取队伍名称
  const getTeamNames = (application: EventApplication) => {
    const teamA = application.team_a_info?.name || 'Team A';
    const teamB = application.team_b_info?.name || 'Team B';
    return { teamA, teamB };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Event Applications Management
          </h1>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            活动申请管理
          </h1>
          <p className="text-gray-600">
            Review and approve event applications from ambassadors
          </p>
          <p className="text-gray-600">
            审核并批准大使的活动申请
          </p>
        </div>

        {/* Statistics */}
        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <h3 className="text-lg font-semibold text-gray-900">待处理</h3>
            <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Applications</h3>
            <h3 className="text-lg font-semibold text-gray-900">总申请数</h3>
            <p className="text-3xl font-bold text-green-600">{applications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            <h3 className="text-lg font-semibold text-gray-900">本周</h3>
            <p className="text-3xl font-bold text-purple-600">{applications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Avg Response Time</h3>
            <h3 className="text-lg font-semibold text-gray-900">平均响应时间</h3>
            <p className="text-3xl font-bold text-orange-600">2.5h</p>
          </div>
        </div>

        {/* Applications List */}
        {/* 申请列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Applications
            </h2>
            <h2 className="text-xl font-semibold text-gray-900">
              待处理申请
            </h2>
          </div>

          {applications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No pending applications</p>
              <p>没有待处理的申请</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => {
                const { teamA, teamB } = getTeamNames(application);
                
                return (
                  <div key={application.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {application.event_title}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {application.event_description}
                            </p>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>📍 {application.venue_name}</span>
                              <span>👥 {application.venue_capacity} capacity</span>
                              <span>📅 {formatDate(application.event_start_time)}</span>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                              <span>🏆 {teamA} vs {teamB}</span>
                              <span>👤 Ambassador: {application.ambassador_student_id}</span>
                              <span>⭐ Priority: {application.priority_level}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => openApprovalModal(application)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => openApprovalModal(application)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          审核
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                上一页
              </button>
              
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                Page {currentPage} of {totalPages}
              </span>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                下一页
              </button>
            </nav>
          </div>
        )}

        {/* Approval Modal */}
        {/* 审批模态框 */}
        {showApprovalModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <h2 className="text-2xl font-bold mb-4">
                Review Application
              </h2>
              <h2 className="text-2xl font-bold mb-4">
                审核申请
              </h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {selectedApplication.event_title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedApplication.event_description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <select
                      value={approvalForm.action}
                      onChange={(e) => setApprovalForm({
                        ...approvalForm,
                        action: e.target.value as 'approve' | 'reject'
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fee Rule
                    </label>
                    <select
                      value={approvalForm.feeRuleId}
                      onChange={(e) => setApprovalForm({
                        ...approvalForm,
                        feeRuleId: e.target.value
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {feeRules.map((rule) => (
                        <option key={rule.id} value={rule.id}>
                          {rule.rule_name} ({rule.staking_fee_percent}% fee)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {approvalForm.action === 'approve' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CHZ Pool Injection Amount
                      </label>
                      <input
                        type="number"
                        value={approvalForm.injectedChzAmount}
                        onChange={(e) => setApprovalForm({
                          ...approvalForm,
                          injectedChzAmount: parseFloat(e.target.value) || 0
                        })}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter CHZ amount"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Team A Coefficient
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={approvalForm.supportOptions.team_a_coefficient}
                          onChange={(e) => setApprovalForm({
                            ...approvalForm,
                            supportOptions: {
                              ...approvalForm.supportOptions,
                              team_a_coefficient: parseFloat(e.target.value) || 1.0
                            }
                          })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Team B Coefficient
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={approvalForm.supportOptions.team_b_coefficient}
                          onChange={(e) => setApprovalForm({
                            ...approvalForm,
                            supportOptions: {
                              ...approvalForm.supportOptions,
                              team_b_coefficient: parseFloat(e.target.value) || 1.0
                            }
                          })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    value={approvalForm.adminNotes}
                    onChange={(e) => setApprovalForm({
                      ...approvalForm,
                      adminNotes: e.target.value
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter notes for the ambassador..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={handleApproval}
                  className={`px-4 py-2 text-white rounded-lg ${
                    approvalForm.action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalForm.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
                <button
                  onClick={handleApproval}
                  className={`px-4 py-2 text-white rounded-lg ${
                    approvalForm.action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {approvalForm.action === 'approve' ? '批准' : '拒绝'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 