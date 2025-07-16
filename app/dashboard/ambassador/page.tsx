// FanForce AI - Ambassador Dashboard / 大使仪表板
// Event orchestration hub for campus sports ambassadors
// 校园体育大使的赛事协调中心

'use client'

import { useLanguage } from '@/app/context/LanguageContext';
import DashboardLayout from '@/app/components/shared/DashboardLayout';
import { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaUsers, 
  FaBasketballBall,
  FaQrcode,
  FaStar,
  FaCoins,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaHandshake,
  FaGift,
  FaFire,
  FaPlus,
  FaEdit,
  FaEye,
  FaUserPlus,
  FaCalendarAlt,
  FaChartLine,
  FaBullhorn,
  FaStore,
  FaAward,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

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
  achievements: ['Top Recruiter', 'Event Master', 'Community Builder']
};

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
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAthleteModal, setShowAthleteModal] = useState(false);
  const [athleteFilter, setAthleteFilter] = useState('all'); // all, available, competing, resting
  const [eventFilter, setEventFilter] = useState('all'); // all, upcoming, live, planning, completed

  // Real-time updates simulation / 实时更新模拟
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const renderEventCard = (event) => (
    <div key={event.id} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all duration-300">
      {/* Event Header / 赛事标题 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">
            {language === 'en' ? event.title : event.titleCn}
          </h3>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <FaMapMarkerAlt className="text-xs" />
            {language === 'en' ? event.venue.name : event.venue.nameCn} • {event.date} {event.time}
          </p>
        </div>
        <div className="text-right">
          <div className={`px-3 py-1 rounded text-xs font-medium ${
            event.status === 'live' ? 'bg-red-600/20 text-red-400' :
            event.status === 'upcoming' ? 'bg-green-600/20 text-green-400' :
            event.status === 'planning' ? 'bg-yellow-600/20 text-yellow-400' :
            'bg-gray-600/20 text-gray-400'
          }`}>
            {event.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Teams & Audience Stats / 队伍和观众统计 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-900/50 rounded p-2">
          <p className="text-xs text-gray-400">Teams Selected</p>
          <p className="font-bold text-blue-400 text-sm">
            {event.teams.teamA.name} vs {event.teams.teamB.name}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <p className="text-xs text-gray-400">Audience</p>
          <p className="font-bold text-purple-400 text-sm">
            {event.audience.registered} registered
          </p>
        </div>
      </div>

      {/* Revenue & Preparation / 收入和准备情况 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-gray-900/50 rounded p-2">
          <p className="text-xs text-gray-400">Total Stake</p>
          <p className="font-bold text-green-400 text-sm">{event.totalStake.toLocaleString()} CHZ</p>
        </div>
        <div className="bg-gray-900/50 rounded p-2">
          <p className="text-xs text-gray-400">Your Revenue</p>
          <p className="font-bold text-yellow-400 text-sm">{event.revenueProjection.toFixed(2)} CHZ</p>
        </div>
      </div>

      {/* Preparation Checklist / 准备清单 */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded p-2 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <FaCheckCircle className="text-blue-500 text-sm" />
          <span className="font-medium text-blue-500 text-sm">
            {language === 'en' ? 'Preparation Status' : '准备状态'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className={`flex items-center gap-1 ${event.preparation.venueBooked ? 'text-green-400' : 'text-gray-400'}`}>
            {event.preparation.venueBooked ? '✅' : '⏳'} Venue Booked
          </div>
          <div className={`flex items-center gap-1 ${event.preparation.athletesSelected ? 'text-green-400' : 'text-gray-400'}`}>
            {event.preparation.athletesSelected ? '✅' : '⏳'} Athletes Selected
          </div>
          <div className={`flex items-center gap-1 ${event.preparation.qrCodeRequested ? 'text-green-400' : 'text-gray-400'}`}>
            {event.preparation.qrCodeRequested ? '✅' : '⏳'} QR Requested
          </div>
          <div className={`flex items-center gap-1 ${event.preparation.merchantsConfirmed ? 'text-green-400' : 'text-gray-400'}`}>
            {event.preparation.merchantsConfirmed ? '✅' : '⏳'} Merchants OK
          </div>
        </div>
      </div>

      {/* Action Buttons / 操作按钮 */}
      <div className="flex gap-2">
        <button 
          onClick={() => {
            setSelectedEvent(event);
            setShowEventModal(true);
          }}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 text-sm"
        >
          <FaEye className="inline mr-1" />
          {language === 'en' ? 'Manage' : '管理'}
        </button>
        {event.status === 'planning' && (
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 text-sm">
            <FaEdit className="inline mr-1" />
            {language === 'en' ? 'Edit' : '编辑'}
          </button>
        )}
      </div>
    </div>
  );

  const renderAthleteCard = (athlete) => (
    <div key={athlete.id} className="bg-gray-800/70 rounded-lg p-3 border border-gray-700 hover:border-blue-500 transition-all duration-300">
      {/* Athlete Header / 运动员标题 */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-base font-bold text-white">{athlete.name}</h4>
          <p className="text-xs text-gray-400">{athlete.sport} • {athlete.year}</p>
        </div>
        <div className="text-right">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            athlete.availability === 'available' ? 'bg-green-600/20 text-green-400' :
            athlete.availability === 'competing' ? 'bg-red-600/20 text-red-400' :
            'bg-gray-600/20 text-gray-400'
          }`}>
            {athlete.availability.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Stats / 统计 */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
        <div className="text-center">
          <p className="text-gray-400">Ranking</p>
          <p className="font-bold text-yellow-400">{athlete.ranking}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Win Rate</p>
          <p className="font-bold text-green-400">{athlete.winRate}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">Matches</p>
          <p className="font-bold text-blue-400">{athlete.totalMatches}</p>
        </div>
      </div>

      {/* Season Progress / 赛季进度 */}
      <div className="bg-gray-900/50 rounded p-2 mb-2">
        <p className="text-xs text-gray-400 mb-1">Season Progress</p>
        <div className="flex justify-between text-xs">
          <span className={`${athlete.seasonProgress.matches >= athlete.seasonProgress.targetMatches ? 'text-green-400' : 'text-yellow-400'}`}>
            Matches: {athlete.seasonProgress.matches}/{athlete.seasonProgress.targetMatches}
          </span>
          <span className={`${athlete.seasonProgress.socialPosts >= athlete.seasonProgress.targetPosts ? 'text-green-400' : 'text-yellow-400'}`}>
            Posts: {athlete.seasonProgress.socialPosts}/{athlete.seasonProgress.targetPosts}
          </span>
        </div>
      </div>

      {/* Virtual Balance / 虚拟余额 */}
      <div className="flex justify-between items-center mb-2 text-xs">
        <span className="text-gray-400">Virtual CHZ:</span>
        <span className="font-bold text-green-400">{athlete.virtualBalance.toFixed(2)}</span>
      </div>

      {/* Action Button / 操作按钮 */}
      <button 
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 text-xs"
        disabled={athlete.availability !== 'available'}
      >
        {athlete.availability === 'available' ? 
          (language === 'en' ? 'Select for Match' : '选择参赛') :
          (language === 'en' ? 'Unavailable' : '不可用')
        }
      </button>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics / 关键指标 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrophy className="text-blue-400" />
                  <span className="text-sm text-gray-300">Active Events</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{mockAmbassadorProfile.activeEvents}</div>
                <div className="text-xs text-gray-400">
                  {mockAmbassadorProfile.totalEvents} total organized
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaCoins className="text-green-400" />
                  <span className="text-sm text-gray-300">Revenue This Month</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {mockAmbassadorProfile.monthlyCommission.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400">
                  {mockAmbassadorProfile.totalRevenue.toFixed(2)} CHZ total
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-purple-400" />
                  <span className="text-sm text-gray-300">Athletes Recruited</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">{mockAmbassadorProfile.athletesRecruited}</div>
                <div className="text-xs text-gray-400">
                  {filteredAthletes.filter(a => a.availability === 'available').length} available now
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaBullhorn className="text-yellow-400" />
                  <span className="text-sm text-gray-300">Audience Reached</span>
                </div>
                <div className="text-2xl font-bold text-yellow-400">{totalAudience}</div>
                <div className="text-xs text-gray-400">
                  across {mockEvents.length} events
                </div>
              </div>
            </div>

            {/* Quick Actions / 快速操作 */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaFire className="text-orange-500" />
                {language === 'en' ? 'Quick Actions' : '快速操作'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-sm">
                  <FaPlus className="block mx-auto mb-1" />
                  {language === 'en' ? 'Create Event' : '创建赛事'}
                </button>
                <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-sm">
                  <FaUserPlus className="block mx-auto mb-1" />
                  {language === 'en' ? 'Recruit Athlete' : '招募运动员'}
                </button>
                <button className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-sm">
                  <FaQrcode className="block mx-auto mb-1" />
                  {language === 'en' ? 'Request QR' : '申请二维码'}
                </button>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-sm">
                  <FaHandshake className="block mx-auto mb-1" />
                  {language === 'en' ? 'Add Partner' : '添加合作伙伴'}
                </button>
              </div>
            </div>

            {/* Recent Events Preview / 近期赛事预览 */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  {language === 'en' ? 'Recent Events' : '近期赛事'}
                </h3>
                <button 
                  onClick={() => setActiveTab('events')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {language === 'en' ? 'View All →' : '查看全部 →'}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockEvents.slice(0, 2).map(renderEventCard)}
              </div>
            </div>
          </div>
        );

      case 'events':
        return (
          <div>
            {/* Events Filter / 赛事筛选 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {language === 'en' ? 'Filter:' : '筛选:'}
                </span>
                <select 
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
                >
                  <option value="all">{language === 'en' ? 'All Events' : '所有赛事'}</option>
                  <option value="planning">{language === 'en' ? 'Planning' : '规划中'}</option>
                  <option value="upcoming">{language === 'en' ? 'Upcoming' : '即将开始'}</option>
                  <option value="live">{language === 'en' ? 'Live' : '进行中'}</option>
                  <option value="completed">{language === 'en' ? 'Completed' : '已完成'}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {filteredEvents.length} {language === 'en' ? 'events' : '个赛事'}
                </span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                  <FaPlus className="inline mr-1" />
                  {language === 'en' ? 'New Event' : '新建赛事'}
                </button>
              </div>
            </div>

            {/* Events Grid / 赛事网格 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredEvents.map(renderEventCard)}
            </div>
          </div>
        );

      case 'athletes':
        return (
          <div>
            {/* Athletes Filter / 运动员筛选 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {language === 'en' ? 'Status:' : '状态:'}
                  </span>
                  <select 
                    value={athleteFilter}
                    onChange={(e) => setAthleteFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white"
                  >
                    <option value="all">{language === 'en' ? 'All Athletes' : '所有运动员'}</option>
                    <option value="available">{language === 'en' ? 'Available' : '可用'}</option>
                    <option value="competing">{language === 'en' ? 'Competing' : '比赛中'}</option>
                    <option value="resting">{language === 'en' ? 'Resting' : '休息中'}</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaSearch className="text-xs" />
                  <input 
                    type="text" 
                    placeholder={language === 'en' ? 'Search athletes...' : '搜索运动员...'}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-white placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {filteredAthletes.length} {language === 'en' ? 'athletes' : '名运动员'}
                </span>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                  <FaUserPlus className="inline mr-1" />
                  {language === 'en' ? 'Recruit' : '招募'}
                </button>
              </div>
            </div>

            {/* Athletes Grid / 运动员网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAthletes.map(renderAthleteCard)}
            </div>
          </div>
        );

      case 'partners':
        return (
          <div>
            {/* Partners Header / 合作伙伴标题 */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">
                {language === 'en' ? 'Partner Merchants' : '合作商家'}
              </h3>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                <FaPlus className="inline mr-1" />
                {language === 'en' ? 'Add Partner' : '添加合作伙伴'}
              </button>
            </div>

            {/* Partners Grid / 合作伙伴网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockMerchants.map(merchant => (
                <div key={merchant.id} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {language === 'en' ? merchant.name : merchant.nameCn}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {language === 'en' ? merchant.type : merchant.typeCn}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      merchant.status === 'active' ? 'bg-green-600/20 text-green-400' :
                      'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {merchant.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="bg-gray-900/50 rounded p-2 mb-3">
                    <p className="text-xs text-gray-400 mb-1">Partnership</p>
                    <p className="text-sm text-blue-400">
                      {language === 'en' ? merchant.partnership : merchant.partnershipCn}
                    </p>
                  </div>

                  <div className="text-sm text-gray-300 mb-3">
                    {language === 'en' ? merchant.contribution : merchant.contributionCn}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Value:</span>
                    <span className="font-bold text-green-400">${merchant.value.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-400">Events:</span>
                    <span className="font-bold text-blue-400">{merchant.eventsSupported}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Revenue Chart Placeholder / 收入图表占位符 */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaChartLine className="text-green-500" />
                {language === 'en' ? 'Revenue Analytics' : '收入分析'}
              </h3>
              <div className="h-64 bg-gray-900/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <FaChartLine className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>{language === 'en' ? 'Revenue Chart Coming Soon' : '收入图表即将推出'}</p>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-lg">
                        {mockRevenueData[mockRevenueData.length - 1].revenue.toFixed(2)}
                      </p>
                      <p className="text-gray-400">This Month</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-400 font-bold text-lg">
                        {mockRevenueData.reduce((sum, data) => sum + data.revenue, 0).toFixed(2)}
                      </p>
                      <p className="text-gray-400">Total Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-yellow-400 font-bold text-lg">
                        {mockRevenueData.reduce((sum, data) => sum + data.events, 0)}
                      </p>
                      <p className="text-gray-400">Total Events</p>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-400 font-bold text-lg">
                        {mockRevenueData.reduce((sum, data) => sum + data.audience, 0)}
                      </p>
                      <p className="text-gray-400">Total Audience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics / 表现指标 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-base font-bold text-white mb-3">
                  {language === 'en' ? 'Success Metrics' : '成功指标'}
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Event Success Rate</span>
                    <span className="font-bold text-green-400">{mockAmbassadorProfile.successRate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Avg. Audience per Event</span>
                    <span className="font-bold text-blue-400">{Math.round(totalAudience / mockEvents.length)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Active Athletes</span>
                    <span className="font-bold text-purple-400">
                      {filteredAthletes.filter(a => a.availability !== 'unavailable').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Partner Merchants</span>
                    <span className="font-bold text-yellow-400">{mockAmbassadorProfile.partnerMerchants}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-base font-bold text-white mb-3">
                  {language === 'en' ? 'Achievements' : '成就'}
                </h4>
                <div className="space-y-2">
                  {mockAmbassadorProfile.achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <FaAward className="text-yellow-400" />
                      <span className="text-white">{achievement}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-600/10 border border-yellow-500/30 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-medium text-yellow-500">Ambassador Tier</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{mockAmbassadorProfile.tier}</p>
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
      title={language === 'en' ? "Ambassador Dashboard" : "大使仪表板"}
      subtitle={language === 'en' ? "Campus sports event orchestration hub" : "校园体育赛事协调中心"}
    >
      {/* Ambassador Profile Header / 大使档案标题 */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-indigo-900 rounded-lg p-4 mb-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {mockAmbassadorProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              {mockAmbassadorProfile.verified && (
                <FaCheckCircle className="absolute -bottom-1 -right-1 text-green-500 bg-gray-800 rounded-full text-sm" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{mockAmbassadorProfile.name}</h2>
              <p className="text-sm text-gray-300">{mockAmbassadorProfile.contact}</p>
              <p className="text-xs text-gray-400">
                {mockAmbassadorProfile.university} • {mockAmbassadorProfile.department}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold mb-2">
              {mockAmbassadorProfile.tier} Ambassador
            </div>
            <p className="text-xs text-gray-400">
              {language === 'en' ? 'Joined' : '加入于'}: {mockAmbassadorProfile.joinDate}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs / 导航标签 */}
      <div className="mb-4">
        <div className="flex border-b border-gray-700 overflow-x-auto">
          {[
            { id: 'overview', label: language === 'en' ? '📊 Overview' : '📊 概览' },
            { id: 'events', label: language === 'en' ? '🏆 Events' : '🏆 赛事' },
            { id: 'athletes', label: language === 'en' ? '🏃‍♂️ Athletes' : '🏃‍♂️ 运动员' },
            { id: 'partners', label: language === 'en' ? '🤝 Partners' : '🤝 合作伙伴' },
            { id: 'analytics', label: language === 'en' ? '📈 Analytics' : '📈 分析' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-white bg-blue-500/10'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content / 标签内容 */}
      {renderTabContent()}
    </DashboardLayout>
  );
} 