'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Types for Recent Events
// 最近活动的类型定义
interface RecentEvent {
  event_id: string;
  event_title: string;
  event_description: string;
  event_date: string;
  match_status: string;
  pool_injected_chz: number;
  total_pool_amount: number;
  match_result: string;
  team_a_info: any;
  team_b_info: any;
  venue_name: string;
  venue_capacity: number;
  ambassador_wallet: string;
  total_participants: number;
  total_supporters: number;
}

export default function AmbassadorRecentEventsPage() {
  const router = useRouter();
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pre_match, active, completed

  // Fetch recent events for ambassador
  // 获取大使的最近活动
  const fetchRecentEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ambassador/recent-events?filter=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setRecentEvents(data.data);
      } else {
        toast.error('Failed to fetch recent events');
        toast.error('获取最近活动失败');
      }
    } catch (error) {
      console.error('Error fetching recent events:', error);
      toast.error('Error fetching recent events');
      toast.error('获取最近活动时出错');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentEvents();
  }, [filter]);

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

  // Get status badge color
  // 获取状态徽章颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pre_match':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pre_match':
        return 'Pre-Match';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Get match result text
  // 获取比赛结果文本
  const getMatchResultText = (result: string) => {
    switch (result) {
      case 'team_a_wins':
        return 'Team A Wins';
      case 'team_b_wins':
        return 'Team B Wins';
      case 'draw':
        return 'Draw';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  // Get team names from JSON
  // 从JSON获取队伍名称
  const getTeamNames = (event: RecentEvent) => {
    const teamA = event.team_a_info?.name || 'Team A';
    const teamB = event.team_b_info?.name || 'Team B';
    return { teamA, teamB };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
            Recent Events
          </h1>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            最近活动
          </h1>
          <p className="text-gray-600">
            View your approved events and their current status
          </p>
          <p className="text-gray-600">
            查看您已批准的活动及其当前状态
          </p>
        </div>

        {/* Filter Tabs */}
        {/* 过滤标签 */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow">
            {[
              { key: 'all', label: 'All Events', label_cn: '所有活动' },
              { key: 'pre_match', label: 'Pre-Match', label_cn: '赛前' },
              { key: 'active', label: 'Active', label_cn: '进行中' },
              { key: 'completed', label: 'Completed', label_cn: '已完成' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics */}
        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Events</h3>
            <h3 className="text-lg font-semibold text-gray-900">总活动数</h3>
            <p className="text-3xl font-bold text-blue-600">{recentEvents.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Active Events</h3>
            <h3 className="text-lg font-semibold text-gray-900">活跃活动</h3>
            <p className="text-3xl font-bold text-green-600">
              {recentEvents.filter(e => e.match_status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Pool</h3>
            <h3 className="text-lg font-semibold text-gray-900">总奖池</h3>
            <p className="text-3xl font-bold text-purple-600">
              {recentEvents.reduce((sum, e) => sum + (e.pool_injected_chz || 0), 0).toFixed(2)} CHZ
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Supporters</h3>
            <h3 className="text-lg font-semibold text-gray-900">总支持者</h3>
            <p className="text-3xl font-bold text-orange-600">
              {recentEvents.reduce((sum, e) => sum + (e.total_supporters || 0), 0)}
            </p>
          </div>
        </div>

        {/* Events List */}
        {/* 活动列表 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Events
            </h2>
            <h2 className="text-xl font-semibold text-gray-900">
              您的活动
            </h2>
          </div>

          {recentEvents.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No events found for the selected filter</p>
              <p>所选过滤器下没有找到活动</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentEvents.map((event) => {
                const { teamA, teamB } = getTeamNames(event);
                
                return (
                  <div key={event.event_id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.event_title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.match_status)}`}>
                            {getStatusText(event.match_status)}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3">
                          {event.event_description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">📍 Venue:</span> {event.venue_name}
                          </div>
                          <div>
                            <span className="font-medium">📅 Date:</span> {formatDate(event.event_date)}
                          </div>
                          <div>
                            <span className="font-medium">🏆 Match:</span> {teamA} vs {teamB}
                          </div>
                          <div>
                            <span className="font-medium">👥 Capacity:</span> {event.venue_capacity}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-3 text-sm">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="font-medium text-blue-900">💰 Pool Amount:</span>
                            <div className="text-lg font-bold text-blue-600">
                              {event.pool_injected_chz?.toFixed(2) || '0.00'} CHZ
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="font-medium text-green-900">👥 Participants:</span>
                            <div className="text-lg font-bold text-green-600">
                              {event.total_participants || 0}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <span className="font-medium text-purple-900">🎯 Supporters:</span>
                            <div className="text-lg font-bold text-purple-600">
                              {event.total_supporters || 0}
                            </div>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg">
                            <span className="font-medium text-orange-900">🏁 Result:</span>
                            <div className="text-lg font-bold text-orange-600">
                              {getMatchResultText(event.match_result)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => router.push(`/dashboard/ambassador/events/${event.event_id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/ambassador/events/${event.event_id}`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {/* 快速操作 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            快速操作
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/ambassador/team-drafts')}
              className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <div className="text-lg font-semibold mb-2">Create New Event</div>
              <div className="text-sm opacity-90">Create New Event</div>
              <div className="text-sm opacity-90">创建新活动</div>
            </button>
            
            <button
              onClick={() => router.push('/dashboard/ambassador/event-applications')}
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div className="text-lg font-semibold mb-2">View Applications</div>
              <div className="text-sm opacity-90">View Applications</div>
              <div className="text-sm opacity-90">查看申请</div>
            </button>
            
            <button
              onClick={() => router.push('/dashboard/ambassador/analytics')}
              className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <div className="text-lg font-semibold mb-2">Event Analytics</div>
              <div className="text-sm opacity-90">Event Analytics</div>
              <div className="text-sm opacity-90">活动分析</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 