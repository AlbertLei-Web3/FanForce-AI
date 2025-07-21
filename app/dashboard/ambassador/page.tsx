// FanForce AI - Ambassador Dashboard / 大使仪表板（现代化响应式设计）
// Event orchestration hub for campus sports ambassadors (Limited to single university/region)
// Modern responsive design with enhanced visual appeal and optimized layout
// 校园体育大使的赛事协调中心（限制在单一大学/地区），采用现代化响应式设计和增强的视觉吸引力
// ROLE SEPARATION: Ambassadors can only submit applications, not directly manage system-level features
// 角色分离：大使只能提交申请，不能直接管理系统级功能

'use client'

import { useLanguage } from '@/app/context/LanguageContext';
import DashboardLayout from '@/app/components/shared/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaTrophy, 
  FaUsers, 
  FaBasketballBall,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaHandshake,
  FaGift,
  FaFire,
  FaUserPlus,
  FaCalendarAlt,
  FaChartLine,
  FaBullhorn,
  FaStore,
  FaAward,
  FaSearch,
  FaFilter,
  FaFileAlt,
  FaHourglassHalf,
  FaPaperPlane,
  FaExclamationCircle,
  FaStar,
  FaCoins,
  FaPlay,
  FaPause,
  FaSpinner,
  FaUserShield,
  FaBuilding,
  FaPlus,
  FaEdit,
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
  FaBell,
  FaCalendar,
  FaPercent,
  FaRocket,
  FaHeart,
  FaTimes
} from 'react-icons/fa';

import TeamDraftManager from '@/app/components/ambassador/TeamDraftManager';

// Mock data for ambassador profile / 大使档案模拟数据
const mockAmbassadorProfile = {
  name: 'Sarah Chen',
  studentId: 'AMB2024001',
  contact: '@sarahc_sports',
  university: 'Tech University',
  department: 'Sports Management',
  verified: true,
  joinDate: '2024-01-15',
  totalEvents: 28,
  activeEvents: 3,
  totalRevenue: 2840.75, // 1% fee share from all events / 所有赛事1%手续费分成
  monthlyCommission: 185.50,
  partnerMerchants: 12,
  athletesRecruited: 45,
  audienceReached: 1250,
  successRate: '89%',
  tier: 'Gold', // Bronze, Silver, Gold, Platinum
  achievements: ['Top Recruiter', 'Event Master', 'Community Builder'],
  // NEW: Application status tracking / 新增：申请状态跟踪
  applicationStatuses: {
    pendingEventApplications: 2,
    approvedEventApplications: 15,
    rejectedEventApplications: 1,
    pendingQRRequests: 1,
    approvedQRRequests: 8,
    pendingVenueRequests: 0
  }
};

// Mock data for application history / 申请历史模拟数据
const mockApplicationHistory = [
  {
    id: 'APP001',
    type: 'event',
    title: 'Basketball Championship Finals',
    submittedDate: '2024-01-20',
    status: 'approved',
    approvedDate: '2024-01-21',
    adminComments: 'Great proposal! Approved for March 15th.'
  },
  {
    id: 'APP002',
    type: 'qr',
    title: 'QR Code Request for Basketball Championship',
    submittedDate: '2024-01-22',
    status: 'pending',
    priority: 'high',
    estimatedResponse: '2024-01-24'
  },
  {
    id: 'APP003',
    type: 'event',
    title: 'Soccer Tournament Semifinals',
    submittedDate: '2024-01-18',
    status: 'under_review',
    adminComments: 'Need more details about venue capacity.'
  }
];

// Athlete recruitment and management / 运动员招募和管理
const mockAthletes = [
  {
    id: 'ath1',
    name: 'Mike Johnson',
    sport: 'Basketball',
    year: 'Sophomore',
    ranking: 8.5,
    totalMatches: 15,
    winRate: '73%',
    virtualBalance: 320.75,
    status: 'active', // active, resting, competing
    seasonProgress: {
      matches: 12,
      socialPosts: 8,
      targetMatches: 10,
      targetPosts: 5
    },
    lastActive: '2024-11-10',
    skills: ['3-Point Shooting', 'Defense', 'Leadership'],
    availability: 'available' // available, competing, unavailable
  },
  {
    id: 'ath2',
    name: 'Lisa Wang',
    sport: 'Soccer',
    year: 'Junior',
    ranking: 9.2,
    totalMatches: 22,
    winRate: '68%',
    virtualBalance: 485.20,
    status: 'competing',
    seasonProgress: {
      matches: 15,
      socialPosts: 12,
      targetMatches: 10,
      targetPosts: 5
    },
    lastActive: '2024-11-12',
    skills: ['Striker', 'Speed', 'Teamwork'],
    availability: 'competing'
  },
  {
    id: 'ath3',
    name: 'David Rodriguez',
    sport: 'Tennis',
    year: 'Senior',
    ranking: 7.8,
    totalMatches: 8,
    winRate: '75%',
    virtualBalance: 210.30,
    status: 'resting',
    seasonProgress: {
      matches: 8,
      socialPosts: 3,
      targetMatches: 10,
      targetPosts: 5
    },
    lastActive: '2024-11-08',
    skills: ['Serve', 'Backhand', 'Strategy'],
    availability: 'available'
  }
];

// Event management / 赛事管理
const mockEvents = [
  {
    id: 'evt1',
    title: 'Campus Basketball Championship',
    titleCn: '校园篮球锦标赛',
    sport: 'Basketball',
    status: 'upcoming', // planning, upcoming, live, completed
    date: '2024-11-20',
    time: '19:00',
    venue: {
      name: 'Main Sports Arena',
      nameCn: '主体育馆',
      capacity: 500,
      address: 'Sports Complex Building A',
      facilities: ['Lighting', 'Sound System', 'Livestream Setup']
    },
    partyVenue: {
      name: 'Student Center Rooftop',
      nameCn: '学生中心屋顶',
      capacity: 80,
      address: 'Student Center 5F',
      facilities: ['DJ Setup', 'Catering', 'Photo Booth']
    },
    teams: {
      teamA: { name: 'Thunder Wolves', athletes: ['Mike Johnson', 'Alex Chen'] },
      teamB: { name: 'Lightning Hawks', athletes: ['Ryan Park', 'Tom Wilson'] }
    },
    audience: {
      registered: 128,
      tier1: 25,
      tier2: 45,
      tier3: 58
    },
    totalStake: 2450.75,
    inviteCode: 'BBALL2024',
    qrGenerated: false,
    partnersConfirmed: 8,
    revenueProjection: 122.54, // 1% of total stakes
    preparation: {
      venueBooked: true,
      athletesSelected: true,
      qrCodeRequested: false,
      merchantsConfirmed: true,
      promotionComplete: false
    }
  },
  {
    id: 'evt2',
    title: 'Soccer Derby Finals',
    titleCn: '足球德比决赛',
    sport: 'Soccer',
    status: 'live',
    date: '2024-11-15',
    time: '16:00',
    venue: {
      name: 'Soccer Field Complex',
      nameCn: '足球场综合体',
      capacity: 300,
      address: 'Outdoor Sports Area',
      facilities: ['Grass Field', 'Scoreboard', 'Bleachers']
    },
    partyVenue: {
      name: 'Sports Bar',
      nameCn: '体育酒吧',
      capacity: 50,
      address: 'Campus Plaza',
      facilities: ['Big Screen', 'Food & Drinks', 'Pool Tables']
    },
    teams: {
      teamA: { name: 'Campus United', athletes: ['Lisa Wang', 'Carlos Rivera'] },
      teamB: { name: 'Student FC', athletes: ['Emma Thompson', 'Jake Miller'] }
    },
    audience: {
      registered: 89,
      tier1: 15,
      tier2: 32,
      tier3: 42
    },
    totalStake: 1890.25,
    inviteCode: 'SOCCER24',
    qrGenerated: true,
    partnersConfirmed: 6,
    revenueProjection: 94.51,
    preparation: {
      venueBooked: true,
      athletesSelected: true,
      qrCodeRequested: true,
      merchantsConfirmed: true,
      promotionComplete: true
    }
  },
  {
    id: 'evt3',
    title: 'Innovation Hackathon Battle',
    titleCn: '创新黑客马拉松对战',
    sport: 'E-Sports/Coding',
    status: 'planning',
    date: '2024-11-25',
    time: '10:00',
    venue: {
      name: 'Tech Hub Auditorium',
      nameCn: '科技中心礼堂',
      capacity: 200,
      address: 'Innovation Building',
      facilities: ['Projectors', 'WiFi', 'Power Outlets']
    },
    partyVenue: {
      name: 'Innovation Lab',
      nameCn: '创新实验室',
      capacity: 40,
      address: 'Innovation Building 2F',
      facilities: ['Demo Stations', 'Networking Area', 'Refreshments']
    },
    teams: {
      teamA: { name: 'CodeCrafters', athletes: ['Alex Kim', 'Jenny Liu'] },
      teamB: { name: 'InnovateU', athletes: ['Sam Chen', 'Maya Patel'] }
    },
    audience: {
      registered: 45,
      tier1: 8,
      tier2: 18,
      tier3: 19
    },
    totalStake: 980.50,
    inviteCode: 'HACK2024',
    qrGenerated: false,
    partnersConfirmed: 4,
    revenueProjection: 49.03,
    preparation: {
      venueBooked: true,
      athletesSelected: false,
      qrCodeRequested: false,
      merchantsConfirmed: false,
      promotionComplete: false
    }
  }
];

// Partner merchants / 合作商家
const mockMerchants = [
  {
    id: 'mer1',
    name: 'Campus Coffee Co.',
    nameCn: '校园咖啡公司',
    type: 'Food & Beverage',
    typeCn: '餐饮',
    contact: 'owner@campuscoffee.com',
    partnership: 'Event Sponsor',
    partnershipCn: '赛事赞助商',
    contribution: 'Free drinks for athletes',
    contributionCn: '为运动员提供免费饮品',
    value: 150.00,
    status: 'active',
    eventsSupported: 12
  },
  {
    id: 'mer2',
    name: 'TechGear Sports',
    nameCn: '科技运动装备',
    type: 'Sports Equipment',
    typeCn: '体育用品',
    contact: 'sales@techgear.com',
    partnership: 'Equipment Provider',
    partnershipCn: '设备提供商',
    contribution: 'Sports equipment & prizes',
    contributionCn: '体育设备和奖品',
    value: 300.00,
    status: 'active',
    eventsSupported: 8
  },
  {
    id: 'mer3',
    name: 'Digital Media Hub',
    nameCn: '数字媒体中心',
    type: 'Media Services',
    typeCn: '媒体服务',
    contact: 'info@mediahub.com',
    partnership: 'Live Streaming',
    partnershipCn: '直播服务',
    contribution: 'Event photography & streaming',
    contributionCn: '赛事摄影和直播',
    value: 200.00,
    status: 'pending',
    eventsSupported: 5
  }
];

// Revenue analytics / 收入分析
const mockRevenueData = [
  { month: 'Jan', events: 3, revenue: 145.20, athletes: 12, audience: 180 },
  { month: 'Feb', events: 4, revenue: 198.75, athletes: 15, audience: 220 },
  { month: 'Mar', events: 5, revenue: 267.30, athletes: 18, audience: 285 },
  { month: 'Apr', events: 3, revenue: 156.80, athletes: 16, audience: 195 },
  { month: 'May', events: 6, revenue: 334.95, athletes: 22, audience: 340 },
  { month: 'Jun', events: 4, revenue: 223.40, athletes: 19, audience: 260 },
  { month: 'Jul', events: 2, revenue: 98.60, athletes: 14, audience: 120 },
  { month: 'Aug', events: 5, revenue: 289.15, athletes: 21, audience: 310 },
  { month: 'Sep', events: 7, revenue: 412.85, athletes: 25, audience: 420 },
  { month: 'Oct', events: 6, revenue: 356.20, athletes: 23, audience: 380 },
  { month: 'Nov', revenue: 185.50, events: 3, athletes: 20, audience: 200 } // Current month
];

export default function AmbassadorDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const [showTeamDraftManager, setShowTeamDraftManager] = useState(false);
  const [selectedTeamDraft, setSelectedTeamDraft] = useState(null);
  const [athleteFilter, setAthleteFilter] = useState('all'); // all, available, competing, resting
  const [eventFilter, setEventFilter] = useState('all'); // all, upcoming, live, planning, completed
  
  // Match management modal states / 比赛管理弹窗状态
  const [showMatchManagementModal, setShowMatchManagementModal] = useState(false);
  const [selectedMatchEvent, setSelectedMatchEvent] = useState(null);
  const [matchResult, setMatchResult] = useState({
    teamAScore: '',
    teamBScore: '',
    winner: '', // 'team_a', 'team_b', 'draw'
    notes: ''
  });

  // Handle match result submission / 处理比赛结果提交
  const handleMatchResultSubmission = async () => {
    try {
      const teamAScore = parseInt(matchResult.teamAScore) || 0;
      const teamBScore = parseInt(matchResult.teamBScore) || 0;
      
      console.log('Submitting match result:', {
        eventId: selectedMatchEvent.event_id,
        teamAScore: teamAScore,
        teamBScore: teamBScore,
        winner: matchResult.winner,
        notes: matchResult.notes
      });

      // Make API call to update the database
      // 调用API来更新数据库
      const response = await fetch('/api/events/update-match-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedMatchEvent.event_id,
          teamAScore: teamAScore,
          teamBScore: teamBScore,
          winner: matchResult.winner,
          notes: matchResult.notes,
          announcedBy: '1de6110a-f982-4f7f-979e-00e7f7d33bed' // Use actual ambassador UUID
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(language === 'en' ? 'Match result announced successfully!' : '比赛结果宣布成功！');
        
        // Close modal and reset form
        // 关闭弹窗并重置表单
        setShowMatchManagementModal(false);
        setSelectedMatchEvent(null);
        setMatchResult({ teamAScore: '', teamBScore: '', winner: '', notes: '' });
        
        // Refresh the events list to show updated status
        // 刷新活动列表以显示更新状态
        fetchRecentEvents();
      } else {
        throw new Error(result.error || 'Failed to announce match result');
      }
      
    } catch (error) {
      console.error('Error submitting match result:', error);
      alert(language === 'en' ? 'Error announcing match result. Please try again.' : '宣布比赛结果时出错。请重试。');
    }
  };

  // Real-time updates simulation / 实时更新模拟
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real data state / 真实数据状态
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Fetch real recent events from database / 从数据库获取真实最近活动
  const fetchRecentEvents = async () => {
    try {
      setEventsLoading(true);
      // Use the actual ambassador ID from database / 使用数据库中实际的大使ID
      const ambassadorId = '1de6110a-f982-4f7f-979e-00e7f7d33bed';
      
      const response = await fetch(`/api/ambassador/recent-events?ambassador_id=${ambassadorId}`);
      const data = await response.json();
      
      if (data.success) {
        setRecentEvents(data.data);
        console.log('Fetched recent events:', data.data);
      } else {
        console.error('Failed to fetch recent events:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recent events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter athletes based on status / 根据状态筛选运动员
  const filteredAthletes = mockAthletes.filter(athlete => {
    if (athleteFilter === 'all') return true;
    if (athleteFilter === 'available') return athlete.availability === 'available';
    if (athleteFilter === 'competing') return athlete.availability === 'competing';
    if (athleteFilter === 'resting') return athlete.status === 'resting';
    return true;
  });

  // Filter events based on status / 根据状态筛选赛事
  const filteredEvents = mockEvents.filter(event => {
    if (eventFilter === 'all') return true;
    return event.status === eventFilter;
  });

  // Calculate total audience across all events / 计算所有赛事的总观众数
  const totalAudience = mockEvents.reduce((sum, event) => sum + event.audience.registered, 0);

  // Calculate total revenue potential / 计算总收入潜力
  const totalRevenuePotential = mockEvents.reduce((sum, event) => sum + event.revenueProjection, 0);

  // Get tier color / 获取等级颜色
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'from-cyan-400 to-blue-500'
      case 'Gold': return 'from-yellow-400 to-orange-500'
      case 'Silver': return 'from-slate-300 to-slate-500'
      case 'Bronze': return 'from-orange-500 to-red-500'
      default: return 'from-slate-400 to-slate-600'
    }
  }

  // Get status color / 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'upcoming': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'planning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'completed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'under_review': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  // Render compact event card for mock data / 渲染紧凑的赛事卡片（模拟数据）
  const renderEventCard = (event) => (
    <div key={event.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105">
      {/* Event Header / 赛事标题 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
            {language === 'en' ? event.title : event.titleCn}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
            <FaMapMarkerAlt className="text-xs" />
            <span className="line-clamp-1">{language === 'en' ? event.venue.name : event.venue.nameCn}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <FaCalendar className="text-xs" />
            <span>{event.date} • {event.time}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(event.status)}`}>
          {event.status.toUpperCase()}
        </div>
      </div>

      {/* Quick Stats / 快速统计 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <FaUsers className="text-purple-400 text-xs" />
            <span className="text-slate-400 text-xs">Audience</span>
          </div>
          <p className="font-bold text-purple-400">{event.audience.registered}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <FaCoins className="text-emerald-400 text-xs" />
            <span className="text-slate-400 text-xs">Revenue</span>
          </div>
          <p className="font-bold text-emerald-400">{event.revenueProjection.toFixed(0)} CHZ</p>
        </div>
      </div>

      {/* Preparation Progress / 准备进度 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">
            {language === 'en' ? 'Preparation' : '准备进度'}
          </span>
          <span className="text-xs text-slate-400">
            {Object.values(event.preparation).filter(Boolean).length}/5
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.values(event.preparation).filter(Boolean).length / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button / 操作按钮 */}
      <button 
        onClick={() => {
          setSelectedEvent(event);
          setShowEventModal(true);
        }}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <FaEye />
        <span>{language === 'en' ? 'Manage Event' : '管理赛事'}</span>
      </button>
    </div>
  );

  // Render recent event card for real data / 渲染最近活动卡片（真实数据）
  const renderRecentEventCard = (event) => {
    // Team information is already parsed as objects by PostgreSQL
    // 队伍信息已经被PostgreSQL解析为对象
    const teamAInfo = event.team_a_info || null;
    const teamBInfo = event.team_b_info || null;
    
    // Format event date
    // 格式化活动日期
    const eventDate = new Date(event.event_date);
    const formattedDate = eventDate.toLocaleDateString();
    const formattedTime = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Calculate time proximity for display
    // 计算时间接近度用于显示
    const timeProximityHours = Math.round(event.time_proximity_hours);
    const isFuture = eventDate > new Date();
    
    return (
      <div key={event.event_id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105">
        {/* Event Header / 活动标题 */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
              {event.event_title || 'Untitled Event'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
              <FaMapMarkerAlt className="text-xs" />
              <span className="line-clamp-1">{event.venue_name || 'Venue TBD'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <FaCalendar className="text-xs" />
              <span>{formattedDate} • {formattedTime}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(event.match_status)}`}>
            {event.match_status.toUpperCase()}
          </div>
        </div>

        {/* Teams Information / 队伍信息 */}
        {teamAInfo && teamBInfo && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-400 font-medium">{teamAInfo.name}</span>
              </div>
              <span className="text-slate-500">VS</span>
              <div className="flex items-center space-x-2">
                <span className="text-red-400 font-medium">{teamBInfo.name}</span>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Match Result / 比赛结果 */}
        {event.match_result && (
          <div className="mb-4 p-3 bg-slate-900/50 border border-slate-700/30 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Result:</span>
              <span className="font-bold text-emerald-400">
                {event.match_result === 'team_a_wins' ? `${teamAInfo?.name} Wins` :
                 event.match_result === 'team_b_wins' ? `${teamBInfo?.name} Wins` :
                 event.match_result === 'draw' ? 'Draw' : event.match_result}
              </span>
            </div>
            {event.team_a_score !== null && event.team_b_score !== null && (
              <div className="flex items-center justify-center space-x-4 mt-2">
                <span className="text-2xl font-bold text-blue-400">{event.team_a_score}</span>
                <span className="text-slate-500">-</span>
                <span className="text-2xl font-bold text-red-400">{event.team_b_score}</span>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats / 快速统计 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <FaUsers className="text-purple-400 text-xs" />
              <span className="text-slate-400 text-xs">Participants</span>
            </div>
            <p className="font-bold text-purple-400">{event.total_participants || 0}</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <FaCoins className="text-emerald-400 text-xs" />
              <span className="text-slate-400 text-xs">Stakes</span>
            </div>
            <p className="font-bold text-emerald-400">{parseFloat(event.total_stakes_amount || 0).toFixed(2)} CHZ</p>
          </div>
        </div>

        {/* Time Proximity / 时间接近度 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              {isFuture ? 'Time Until Event' : 'Time Since Event'}
            </span>
            <span className={`text-xs font-bold ${
              isFuture ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {timeProximityHours} hours
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isFuture ? 'bg-gradient-to-r from-emerald-500 to-blue-600' : 'bg-gradient-to-r from-slate-500 to-slate-600'
              }`}
              style={{ width: `${Math.min((timeProximityHours / 24) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button / 操作按钮 */}
        <button 
          onClick={() => {
            setSelectedMatchEvent(event);
            setShowMatchManagementModal(true);
          }}
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <FaTrophy />
          <span>{language === 'en' ? 'Manage Match' : '管理比赛'}</span>
        </button>
      </div>
    );
  };

  // Render compact athlete card / 渲染紧凑的运动员卡片
  const renderAthleteCard = (athlete) => (
    <div key={athlete.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300">
      {/* Athlete Header / 运动员标题 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
            {athlete.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h4 className="text-white font-bold">{athlete.name}</h4>
            <p className="text-slate-400 text-sm">{athlete.sport} • {athlete.year}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-bold border ${
          athlete.availability === 'available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
          athlete.availability === 'competing' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
          'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }`}>
          {athlete.availability.toUpperCase()}
        </div>
      </div>

      {/* Performance Stats / 表现统计 */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="text-slate-400 text-xs">Rank</span>
          </div>
          <p className="font-bold text-yellow-400">{athlete.ranking}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <FaPercent className="text-emerald-400 text-xs" />
            <span className="text-slate-400 text-xs">Win</span>
          </div>
          <p className="font-bold text-emerald-400">{athlete.winRate}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <FaTrophy className="text-blue-400 text-xs" />
            <span className="text-slate-400 text-xs">Games</span>
          </div>
          <p className="font-bold text-blue-400">{athlete.totalMatches}</p>
        </div>
      </div>

      {/* Season Progress / 赛季进度 */}
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">
            {language === 'en' ? 'Season Progress' : '赛季进度'}
          </span>
          <span className="text-xs text-slate-500">
            {athlete.seasonProgress.matches}/{athlete.seasonProgress.targetMatches}
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-blue-600 h-1.5 rounded-full"
            style={{ width: `${(athlete.seasonProgress.matches / athlete.seasonProgress.targetMatches) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button / 操作按钮 */}
      <button 
        className={`w-full font-medium py-2 px-3 rounded-lg transition-all duration-300 text-sm ${
          athlete.availability === 'available' 
            ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white' 
            : 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
        }`}
        disabled={athlete.availability !== 'available'}
      >
        {athlete.availability === 'available' ? 
          (language === 'en' ? 'Select for Match' : '选择参赛') :
          (language === 'en' ? 'Unavailable' : '不可用')
        }
      </button>
    </div>
  );

  // Render tab content / 渲染标签内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Key Performance Metrics / 关键绩效指标 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FaTrophy className="text-blue-400 text-xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{mockAmbassadorProfile.activeEvents}</p>
                    <p className="text-blue-400 text-sm font-medium">Active Events</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <FaArrowUp className="text-xs" />
                    <span>{mockAmbassadorProfile.totalEvents} total</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{mockAmbassadorProfile.successRate} success</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FaCoins className="text-emerald-400 text-xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{mockAmbassadorProfile.monthlyCommission.toFixed(0)}</p>
                    <p className="text-emerald-400 text-sm font-medium">Monthly CHZ</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <FaArrowUp className="text-xs" />
                    <span>{mockAmbassadorProfile.totalRevenue.toFixed(0)} total</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">1% fee share</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <FaUsers className="text-purple-400 text-xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{mockAmbassadorProfile.athletesRecruited}</p>
                    <p className="text-purple-400 text-sm font-medium">Athletes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>{filteredAthletes.filter(a => a.availability === 'available').length} available</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">recruited</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <FaBullhorn className="text-amber-400 text-xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{totalAudience}</p>
                    <p className="text-amber-400 text-sm font-medium">Audience</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <FaRocket className="text-xs" />
                    <span>avg {Math.round(totalAudience / mockEvents.length)}/event</span>
                  </div>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">reached</span>
                </div>
              </div>
            </div>

            {/* Application Workflow Center / 申请工作流程中心 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaPaperPlane className="text-blue-400" />
                  <span>{language === 'en' ? 'Application Center' : '申请中心'}</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium">
                    {mockAmbassadorProfile.applicationStatuses.pendingEventApplications + 
                     mockAmbassadorProfile.applicationStatuses.pendingQRRequests} pending
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
                    {mockAmbassadorProfile.applicationStatuses.approvedEventApplications + 
                     mockAmbassadorProfile.applicationStatuses.approvedQRRequests} approved
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={() => router.push('/dashboard/ambassador/event-applications')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-4 px-4 rounded-xl transition-all duration-300 text-sm group"
                >
                  <FaFileAlt className="text-xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold">{language === 'en' ? 'Event Application' : '赛事申请'}</div>
                  <div className="text-xs opacity-80">{language === 'en' ? 'Submit new event' : '提交新赛事'}</div>
                </button>
                
                <button 
                  onClick={() => setShowTeamDraftManager(true)}
                  className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-medium py-4 px-4 rounded-xl transition-all duration-300 text-sm group"
                >
                  <FaUserPlus className="text-xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold">{language === 'en' ? 'Recruit Athlete' : '招募运动员'}</div>
                  <div className="text-xs opacity-80">{language === 'en' ? 'Add team member' : '添加团队成员'}</div>
                </button>
                
                <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium py-4 px-4 rounded-xl transition-all duration-300 text-sm group">
                  <FaHourglassHalf className="text-xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold">{language === 'en' ? 'Request QR' : '申请二维码'}</div>
                  <div className="text-xs opacity-80">{language === 'en' ? 'Generate access codes' : '生成访问码'}</div>
                </button>
                
                <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-4 px-4 rounded-xl transition-all duration-300 text-sm group">
                  <FaHandshake className="text-xl mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="font-bold">{language === 'en' ? 'Add Partner' : '添加合作伙伴'}</div>
                  <div className="text-xs opacity-80">{language === 'en' ? 'Expand network' : '扩展网络'}</div>
                </button>
              </div>
            </div>

            {/* Recent Events Showcase / 近期赛事展示 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaCalendarAlt className="text-emerald-400" />
                  <span>{language === 'en' ? 'Recent Events' : '近期赛事'}</span>
                </h3>
                <button 
                  onClick={() => setActiveTab('events')}
                  className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                >
                  <span>{language === 'en' ? 'View All' : '查看全部'}</span>
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {eventsLoading ? (
                  <div className="col-span-2 flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-2xl text-emerald-400 mr-3" />
                    <span className="text-slate-400">
                      {language === 'en' ? 'Loading approved events...' : '加载已批准赛事中...'}
                    </span>
                  </div>
                ) : recentEvents.length > 0 ? (
                  recentEvents.slice(0, 2).map(renderRecentEventCard)
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <FaCalendarAlt className="text-4xl text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {language === 'en' ? 'No approved events yet' : '暂无已批准赛事'}
                    </p>
                    <p className="text-slate-500 text-sm mt-2">
                      {language === 'en' ? 'Your approved applications will appear here' : '您的已批准申请将显示在这里'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'applications':
        return (
          <div className="space-y-8">
            {/* Application Status Overview / 申请状态概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <FaHourglassHalf className="text-amber-400 text-xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {mockAmbassadorProfile.applicationStatuses.pendingEventApplications + 
                       mockAmbassadorProfile.applicationStatuses.pendingQRRequests + 
                       mockAmbassadorProfile.applicationStatuses.pendingVenueRequests}
                    </p>
                    <p className="text-amber-400 text-sm font-medium">Pending</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  {language === 'en' ? 'Awaiting admin approval' : '等待管理员批准'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="text-emerald-400 text-xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {mockAmbassadorProfile.applicationStatuses.approvedEventApplications + 
                       mockAmbassadorProfile.applicationStatuses.approvedQRRequests}
                    </p>
                    <p className="text-emerald-400 text-sm font-medium">Approved</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  {language === 'en' ? 'Total approved to date' : '总计已批准'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <FaExclamationCircle className="text-red-400 text-xl" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">
                      {mockAmbassadorProfile.applicationStatuses.rejectedEventApplications}
                    </p>
                    <p className="text-red-400 text-sm font-medium">Rejected</p>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  {language === 'en' ? 'Need revision or resubmission' : '需要修改或重新提交'}
                </p>
              </div>
            </div>

            {/* Application History / 申请历史 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <FaFileAlt className="text-blue-400" />
                <span>{language === 'en' ? 'Application History' : '申请历史'}</span>
              </h3>
              <div className="space-y-4">
                {mockApplicationHistory.map(app => (
                  <div key={app.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 hover:border-slate-600/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {app.type === 'event' ? '🏆' : app.type === 'qr' ? '📱' : '🏟️'}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{app.title}</h4>
                          <p className="text-slate-400 text-sm">
                            {app.type === 'event' ? 'Event Application' : 
                             app.type === 'qr' ? 'QR Code Request' : 'Venue Request'} • 
                            {app.submittedDate}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(app.status)}`}>
                        {app.status === 'approved' ? (language === 'en' ? 'Approved' : '已批准') :
                         app.status === 'pending' ? (language === 'en' ? 'Pending' : '待审批') :
                         app.status === 'under_review' ? (language === 'en' ? 'Under Review' : '审核中') :
                         (language === 'en' ? 'Rejected' : '已拒绝')}
                      </span>
                    </div>
                    {app.adminComments && (
                      <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 mt-3">
                        <p className="text-slate-300 text-sm">
                          <span className="font-bold text-blue-400">Admin Comments:</span> {app.adminComments}
                        </p>
                      </div>
                    )}
                    {app.priority && (
                      <div className="mt-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          app.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          app.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {app.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    )}
                    {app.estimatedResponse && (
                      <p className="text-slate-400 text-sm mt-2">
                        Estimated response: {app.estimatedResponse}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="space-y-8">
            {/* Events Filter Header / 赛事筛选标题 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaCalendarAlt className="text-blue-400" />
                  <span>{language === 'en' ? 'Event Management' : '赛事管理'}</span>
                </h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <select 
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  >
                    <option value="all">{language === 'en' ? 'All Events' : '所有赛事'}</option>
                    <option value="planning">{language === 'en' ? 'Planning' : '规划中'}</option>
                    <option value="upcoming">{language === 'en' ? 'Upcoming' : '即将开始'}</option>
                    <option value="live">{language === 'en' ? 'Live' : '进行中'}</option>
                    <option value="completed">{language === 'en' ? 'Completed' : '已完成'}</option>
                  </select>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm flex items-center space-x-2">
                    <FaPaperPlane />
                    <span>{language === 'en' ? 'New Application' : '新申请'}</span>
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
                <span>{filteredEvents.length} events found</span>
                <span>•</span>
                <span>{mockEvents.filter(e => e.status === 'live').length} live</span>
                <span>•</span>
                <span>{mockEvents.filter(e => e.status === 'upcoming').length} upcoming</span>
              </div>
            </div>

            {/* Events Grid / 赛事网格 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map(renderEventCard)}
            </div>
          </div>
        );

      case 'athletes':
        return (
          <div className="space-y-8">
            {/* Athletes Filter Header / 运动员筛选标题 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaUsers className="text-purple-400" />
                  <span>{language === 'en' ? 'Athlete Management' : '运动员管理'}</span>
                </h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <select 
                    value={athleteFilter}
                    onChange={(e) => setAthleteFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm"
                  >
                    <option value="all">{language === 'en' ? 'All Athletes' : '所有运动员'}</option>
                    <option value="available">{language === 'en' ? 'Available' : '可用'}</option>
                    <option value="competing">{language === 'en' ? 'Competing' : '比赛中'}</option>
                    <option value="resting">{language === 'en' ? 'Resting' : '休息中'}</option>
                  </select>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      placeholder={language === 'en' ? 'Search athletes...' : '搜索运动员...'}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm placeholder-slate-400"
                    />
                    <button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm flex items-center space-x-2">
                      <FaUserPlus />
                      <span>{language === 'en' ? 'Recruit' : '招募'}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
                <span>{filteredAthletes.length} athletes found</span>
                <span>•</span>
                <span>{filteredAthletes.filter(a => a.availability === 'available').length} available</span>
                <span>•</span>
                <span>{filteredAthletes.filter(a => a.availability === 'competing').length} competing</span>
              </div>
            </div>

            {/* Athletes Grid / 运动员网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAthletes.map(renderAthleteCard)}
            </div>
          </div>
        );

      case 'partners':
        return (
          <div className="space-y-8">
            {/* Partners Header / 合作伙伴标题 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <FaHandshake className="text-emerald-400" />
                  <span>{language === 'en' ? 'Partner Network' : '合作伙伴网络'}</span>
                </h3>
                <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm flex items-center space-x-2">
                  <FaPlus />
                  <span>{language === 'en' ? 'Add Partner' : '添加合作伙伴'}</span>
                </button>
              </div>
              <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
                <span>{mockMerchants.length} partners</span>
                <span>•</span>
                <span>{mockMerchants.filter(m => m.status === 'active').length} active</span>
                <span>•</span>
                <span>Total value: ${mockMerchants.reduce((sum, m) => sum + m.value, 0)}</span>
              </div>
            </div>

            {/* Partners Grid / 合作伙伴网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockMerchants.map(merchant => (
                <div key={merchant.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {merchant.name.split(' ')[0][0]}
                      </div>
                      <div>
                        <h4 className="text-white font-bold">
                          {language === 'en' ? merchant.name : merchant.nameCn}
                        </h4>
                        <p className="text-slate-400 text-sm">
                          {language === 'en' ? merchant.type : merchant.typeCn}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      merchant.status === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {merchant.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 mb-4">
                    <p className="text-slate-400 text-sm mb-2">Partnership</p>
                    <p className="text-blue-400 font-medium">
                      {language === 'en' ? merchant.partnership : merchant.partnershipCn}
                    </p>
                  </div>

                  <div className="text-slate-300 text-sm mb-4">
                    {language === 'en' ? merchant.contribution : merchant.contributionCn}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Value:</span>
                    <span className="font-bold text-emerald-400">${merchant.value.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-slate-400">Events:</span>
                    <span className="font-bold text-blue-400">{merchant.eventsSupported}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            {/* Performance Overview / 表现概览 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <FaChartLine className="text-emerald-400" />
                  <span>{language === 'en' ? 'Revenue Analytics' : '收入分析'}</span>
                </h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-400">
                        {mockRevenueData[mockRevenueData.length - 1].revenue.toFixed(0)}
                      </p>
                      <p className="text-slate-400 text-sm">This Month CHZ</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">
                        {mockRevenueData.reduce((sum, data) => sum + data.revenue, 0).toFixed(0)}
                      </p>
                      <p className="text-slate-400 text-sm">Total CHZ</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {mockRevenueData.reduce((sum, data) => sum + data.events, 0)}
                      </p>
                      <p className="text-slate-400 text-sm">Total Events</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-400">
                        {mockRevenueData.reduce((sum, data) => sum + data.audience, 0)}
                      </p>
                      <p className="text-slate-400 text-sm">Total Audience</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <FaAward className="text-yellow-400" />
                  <span>{language === 'en' ? 'Achievements' : '成就'}</span>
                </h3>
                <div className="space-y-4">
                  {mockAmbassadorProfile.achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-900/50 border border-slate-700/30 rounded-lg">
                      <FaAward className="text-yellow-400" />
                      <span className="text-white font-medium">{achievement}</span>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-600/10 border border-yellow-500/20 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaStar className="text-yellow-400 text-xl" />
                      <span className="font-bold text-yellow-400">Ambassador Tier</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{mockAmbassadorProfile.tier}</p>
                    <p className="text-slate-400 text-sm mt-1">
                      {language === 'en' ? 'Current tier status' : '当前等级状态'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Metrics / 成功指标 */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <FaFire className="text-red-400" />
                <span>{language === 'en' ? 'Success Metrics' : '成功指标'}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaPercent className="text-emerald-400 text-2xl" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">{mockAmbassadorProfile.successRate}</p>
                  <p className="text-slate-400 text-sm">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaUsers className="text-blue-400 text-2xl" />
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{Math.round(totalAudience / mockEvents.length)}</p>
                  <p className="text-slate-400 text-sm">Avg. Audience</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaUserShield className="text-purple-400 text-2xl" />
                  </div>
                  <p className="text-2xl font-bold text-purple-400">
                    {filteredAthletes.filter(a => a.availability !== 'unavailable').length}
                  </p>
                  <p className="text-slate-400 text-sm">Active Athletes</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaStore className="text-amber-400 text-2xl" />
                  </div>
                  <p className="text-2xl font-bold text-amber-400">{mockAmbassadorProfile.partnerMerchants}</p>
                  <p className="text-slate-400 text-sm">Partners</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title={language === 'en' ? "Ambassador Hub" : "大使中心"}
      subtitle={language === 'en' ? "Campus sports event orchestration with modern design" : "校园体育赛事协调，采用现代化设计"}
    >
      {/* Ambassador Profile Hero Section / 大使资料英雄部分 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 mb-8 border border-slate-700/50 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {mockAmbassadorProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-white text-sm" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{mockAmbassadorProfile.name}</h2>
              <p className="text-slate-300 font-medium">{mockAmbassadorProfile.contact}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r border ${
                  mockAmbassadorProfile.tier === 'Platinum' ? 'from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/30' :
                  mockAmbassadorProfile.tier === 'Gold' ? 'from-yellow-500/20 to-orange-600/20 text-yellow-400 border-yellow-500/30' :
                  mockAmbassadorProfile.tier === 'Silver' ? 'from-slate-400/20 to-slate-600/20 text-slate-400 border-slate-500/30' :
                  'from-orange-600/20 to-red-600/20 text-orange-400 border-orange-500/30'
                }`}>
                  {mockAmbassadorProfile.tier} Ambassador
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm text-slate-300">
            <div className="flex items-center space-x-2">
              <FaClock className="text-blue-400" />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaBuilding className="text-purple-400" />
              <span>{mockAmbassadorProfile.university}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaPercent className="text-emerald-400" />
              <span>{mockAmbassadorProfile.successRate} Success</span>
            </div>
          </div>
        </div>

        {/* Quick Stats / 快速统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FaTrophy className="text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockAmbassadorProfile.activeEvents}</p>
                <p className="text-slate-400 text-sm">Active Events</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <FaCoins className="text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockAmbassadorProfile.monthlyCommission.toFixed(0)}</p>
                <p className="text-slate-400 text-sm">Monthly CHZ</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FaUsers className="text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{mockAmbassadorProfile.athletesRecruited}</p>
                <p className="text-slate-400 text-sm">Athletes</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <FaBell className="text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {mockAmbassadorProfile.applicationStatuses.pendingEventApplications + 
                   mockAmbassadorProfile.applicationStatuses.pendingQRRequests}
                </p>
                <p className="text-slate-400 text-sm">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar / 导航标签栏 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-1 mb-8 border border-slate-700/50">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: language === 'en' ? 'Overview' : '概览', icon: FaChartLine },
            { id: 'applications', label: language === 'en' ? 'Applications' : '申请状态', icon: FaFileAlt },
            { id: 'events', label: language === 'en' ? 'Events' : '赛事', icon: FaTrophy },
            { id: 'athletes', label: language === 'en' ? 'Athletes' : '运动员', icon: FaUsers },
            { id: 'partners', label: language === 'en' ? 'Partners' : '合作伙伴', icon: FaHandshake },
            { id: 'analytics', label: language === 'en' ? 'Analytics' : '分析', icon: FaChartLine }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content / 标签内容 */}
      {renderTabContent()}

      {/* Match Management Modal / 比赛管理弹窗 */}
      {showMatchManagementModal && selectedMatchEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header / 弹窗标题 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <FaTrophy className="text-emerald-400" />
                <span>{language === 'en' ? 'Match Management' : '比赛管理'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowMatchManagementModal(false);
                  setSelectedMatchEvent(null);
                  setMatchResult({ teamAScore: '', teamBScore: '', winner: '', notes: '' });
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Event Information / 活动信息 */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 mb-6">
              <h4 className="text-lg font-bold text-white mb-3">{selectedMatchEvent.event_title}</h4>
              
              {/* Teams Display / 队伍显示 */}
              {selectedMatchEvent.team_a_info && selectedMatchEvent.team_b_info && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-400 font-medium">{selectedMatchEvent.team_a_info.name}</span>
                  </div>
                  <span className="text-slate-500 font-bold">VS</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-red-400 font-medium">{selectedMatchEvent.team_b_info.name}</span>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              )}

              {/* Event Details / 活动详情 */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">{language === 'en' ? 'Date:' : '日期:'}</span>
                  <p className="text-white">{new Date(selectedMatchEvent.event_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">{language === 'en' ? 'Time:' : '时间:'}</span>
                  <p className="text-white">{new Date(selectedMatchEvent.event_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <span className="text-slate-400">{language === 'en' ? 'Venue:' : '场地:'}</span>
                  <p className="text-white">{selectedMatchEvent.venue_name || 'TBD'}</p>
                </div>
                <div>
                  <span className="text-slate-400">{language === 'en' ? 'Status:' : '状态:'}</span>
                  <p className="text-white">{selectedMatchEvent.match_status}</p>
                </div>
              </div>
            </div>

            {/* Score Input Form / 分数输入表单 */}
            <div className="space-y-6">
              <h5 className="text-lg font-bold text-white">{language === 'en' ? 'Enter Match Results' : '录入比赛结果'}</h5>
              
              {/* Score Inputs / 分数输入 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {selectedMatchEvent.team_a_info?.name || 'Team A'} {language === 'en' ? 'Score' : '分数'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matchResult.teamAScore}
                    onChange={(e) => setMatchResult(prev => ({ ...prev, teamAScore: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {selectedMatchEvent.team_b_info?.name || 'Team B'} {language === 'en' ? 'Score' : '分数'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={matchResult.teamBScore}
                    onChange={(e) => setMatchResult(prev => ({ ...prev, teamBScore: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Winner Selection / 获胜者选择 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Match Result' : '比赛结果'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setMatchResult(prev => ({ ...prev, winner: 'team_a' }))}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      matchResult.winner === 'team_a'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-blue-500'
                    }`}
                  >
                    {selectedMatchEvent.team_a_info?.name || 'Team A'} {language === 'en' ? 'Wins' : '获胜'}
                  </button>
                  <button
                    onClick={() => setMatchResult(prev => ({ ...prev, winner: 'team_b' }))}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      matchResult.winner === 'team_b'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-red-500'
                    }`}
                  >
                    {selectedMatchEvent.team_b_info?.name || 'Team B'} {language === 'en' ? 'Wins' : '获胜'}
                  </button>
                  <button
                    onClick={() => setMatchResult(prev => ({ ...prev, winner: 'draw' }))}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      matchResult.winner === 'draw'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-amber-500'
                    }`}
                  >
                    {language === 'en' ? 'Draw' : '平局'}
                  </button>
                </div>
              </div>

              {/* Notes Input / 备注输入 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Match Notes' : '比赛备注'}
                </label>
                <textarea
                  value={matchResult.notes}
                  onChange={(e) => setMatchResult(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder={language === 'en' ? 'Enter any additional notes about the match...' : '输入关于比赛的任何额外备注...'}
                />
              </div>

              {/* Action Buttons / 操作按钮 */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowMatchManagementModal(false);
                    setSelectedMatchEvent(null);
                    setMatchResult({ teamAScore: '', teamBScore: '', winner: '', notes: '' });
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                >
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
                <button
                  onClick={() => handleMatchResultSubmission()}
                  disabled={!matchResult.teamAScore || !matchResult.teamBScore || !matchResult.winner}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FaCheckCircle />
                  <span>{language === 'en' ? 'Announce Result' : '宣布结果'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Draft Manager Modal / 队伍草稿管理器模态框 */}
      {showTeamDraftManager && (
        <TeamDraftManager
          ambassadorId="1de6110a-f982-4f7f-979e-00e7f7d33bed" // Use actual ambassador ID from database
          onClose={() => setShowTeamDraftManager(false)}
          onDraftSelected={(draft) => {
            setSelectedTeamDraft(draft);
            setShowTeamDraftManager(false);
            // Navigate to event application page with draft data
            console.log('Selected team draft:', draft);
            router.push(`/dashboard/ambassador/event-applications?draft_id=${draft.id}&ambassador_id=${draft.ambassador_id}`);
          }}
        />
      )}
    </DashboardLayout>
  );
} 