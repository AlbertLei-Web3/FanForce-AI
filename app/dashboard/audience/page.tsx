// FanForce AI - Enhanced Audience Dashboard / 增强观众仪表板
// Implementing three-tier participation system with Web2-first architecture
// 实现三层参与系统和Web2优先架构

'use client'

import { useLanguage } from '@/app/context/LanguageContext';
import DashboardLayout from '@/app/components/shared/DashboardLayout';
import DataTable from '@/app/components/shared/DataTable';
import StatCard from '@/app/components/shared/StatCard';
import { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaFistRaised, 
  FaHistory, 
  FaUsers, 
  FaBasketballBall,
  FaQrcode,
  FaStar,
  FaCoins,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaIdCard,
  FaChartLine,
  FaGift,
  FaFire,
  FaMedal,
  FaTh,
  FaList
} from 'react-icons/fa';

// Enhanced Mock Data based on documentation / 基于文档的增强模拟数据
const mockUserProfile = {
  id: 'fb7554e2-e6e5-48f2-ade0-d9510703e8de', // Real user ID from database
  name: 'Alex "The Oracle"',
  studentId: 'CS2021001',
  verified: true,
  avatar: '/placeholder.svg',
  realChzBalance: 850.25, // Real CHZ from previous seasons / 上赛季真实CHZ
  currentStake: 125.50, // Currently staked in active events / 当前活跃赛事质押
  totalSupports: 42,
  winRate: '68%',
  currentTier: 2, // Current participation tier / 当前参与等级
  inviteCode: 'FANFORCE2024',
  joinedVia: 'invite', // 'invite' or 'direct' / 通过邀请或直接加入
  partyAttendance: 3, // Number of parties attended / 参加聚会次数
  tierProgress: {
    tier1: { completed: 8, required: 10 }, // Full participation events / 完整参与活动
    tier2: { completed: 15, required: 20 }, // Match attendance events / 比赛出席活动
    tier3: { completed: 25, required: 30 }  // Stake-only events / 仅质押活动
  }
};

// Three-tier participation system / 三层参与系统
const participationTiers = [
  {
    tier: 3,
    name: 'Stake Only',
    nameCn: '仅质押',
    description: 'Support your team remotely and earn rewards',
    descriptionCn: '远程支持您的队伍并获得奖励',
    multiplier: '30%',
    features: ['Remote participation', 'Basic rewards', 'Real CHZ staking'],
    featuresCn: ['远程参与', '基础奖励', '真实CHZ质押'],
    color: 'from-gray-600 to-gray-800',
    icon: <FaCoins className="text-3xl" />,
    requirements: 'CHZ stake only',
    requirementsCn: '仅需CHZ质押'
  },
  {
    tier: 2,
    name: 'Stake + Match',
    nameCn: '质押+比赛',
    description: 'Attend the match and boost your rewards',
    descriptionCn: '参加比赛并提升您的奖励',
    multiplier: '70%',
    features: ['Match attendance', 'JWT QR check-in', 'Enhanced rewards'],
    featuresCn: ['比赛出席', 'JWT二维码签到', '增强奖励'],
    color: 'from-blue-600 to-blue-800',
    icon: <FaBasketballBall className="text-3xl" />,
    requirements: 'CHZ stake + QR check-in',
    requirementsCn: 'CHZ质押 + 二维码签到'
  },
  {
    tier: 1,
    name: 'Full Experience',
    nameCn: '完整体验',
    description: 'Maximum rewards with exclusive party access',
    descriptionCn: '最高奖励和独家聚会权限',
    multiplier: '100% + Bonus',
    features: ['Match + Party access', 'Guaranteed party entry', 'Maximum rewards'],
    featuresCn: ['比赛+聚会权限', '保证聚会入场', '最高奖励'],
    color: 'from-yellow-500 to-orange-600',
    icon: <FaGift className="text-3xl" />,
    requirements: 'CHZ stake + QR check-in + Party application',
    requirementsCn: 'CHZ质押 + 二维码签到 + 聚会申请'
  }
];

// Enhanced upcoming events with three-tier system / 增强的即将到来赛事与三层系统
const mockUpcomingEvents = [
  {
    id: 'evt1',
    title: 'Campus Basketball Championship',
    titleCn: '校园篮球锦标赛',
    teamA: { name: 'Thunder Wolves', icon: '🛡️' },
    teamB: { name: 'Lightning Hawks', icon: '⚔️' },
    date: '2024-11-15',
    time: '19:00',
    venue: 'Main Sports Arena',
    venueCn: '主体育馆',
    capacity: 500,
    currentStakers: 128,
    totalPool: 2450.75,
    poolBalanceAfter: 3200.50, // Real pool balance from chz_pool_management
    partyVenue: 'Student Center',
    partyVenueCn: '学生中心',
    partyCapacity: 80,
    partyApplicants: 156,
    status: 'open', // open, closed, live, finished
    qrExpiry: '2024-11-15T15:00:00Z', // 4-hour expiry before match
    ambassadorInfo: {
      name: 'Sarah Chen',
      contact: '@sarahc_sports'
    }
  },
  {
    id: 'evt2',
    title: 'University Soccer Derby',
    titleCn: '大学足球德比',
    teamA: { name: 'Campus United', icon: '🛡️' },
    teamB: { name: 'Student FC', icon: '⚔️' },
    date: '2024-11-18',
    time: '16:00',
    venue: 'Soccer Field Complex',
    venueCn: '足球场综合体',
    capacity: 300,
    currentStakers: 89,
    totalPool: 1890.25,
    poolBalanceAfter: 2450.75, // Real pool balance from chz_pool_management
    partyVenue: 'Rooftop Lounge',
    partyVenueCn: '屋顶休息室',
    partyCapacity: 50,
    partyApplicants: 95,
    status: 'open',
    qrExpiry: '2024-11-18T12:00:00Z',
    ambassadorInfo: {
      name: 'Mike Rodriguez',
      contact: '@mike_soccer'
    }
  },
  {
    id: 'evt3',
    title: 'Annual Innovation Hackathon',
    titleCn: '年度创新黑客马拉松',
    teamA: { name: 'CodeCrafters', icon: '🛡️' },
    teamB: { name: 'InnovateU', icon: '⚔️' },
    date: '2024-11-20',
    time: '10:00',
    venue: 'Tech Hub Auditorium',
    venueCn: '科技中心礼堂',
    capacity: 200,
    currentStakers: 67,
    totalPool: 1456.80,
    poolBalanceAfter: 1890.25, // Real pool balance from chz_pool_management
    partyVenue: 'Innovation Lab',
    partyVenueCn: '创新实验室',
    partyCapacity: 40,
    partyApplicants: 72,
    status: 'open',
    qrExpiry: '2024-11-20T06:00:00Z',
    ambassadorInfo: {
      name: 'Dr. Jennifer Liu',
      contact: '@prof_liu'
    }
  }
];

// Support history with tier information / 支持历史与等级信息
const mockSupportHistory = [
  {
    event: 'Campus Basketball Final',
    eventCn: '校园篮球决赛',
    team: 'Thunder Wolves 🐺',
    amount: 100,
    tier: 1,
    tierName: 'Full Experience',
    tierNameCn: '完整体验',
    outcome: 'win',
    payout: 185.50,
    multiplier: '100% + Bonus',
    date: '2024-10-28',
    qrCheckedIn: true,
    partyAttended: true
  },
  {
    event: 'Soccer Championship',
    eventCn: '足球锦标赛',
    team: 'Campus United ⚽',
    amount: 75,
    tier: 2,
    tierName: 'Stake + Match',
    tierNameCn: '质押+比赛',
    outcome: 'loss',
    payout: 0,
    multiplier: '70%',
    date: '2024-10-25',
    qrCheckedIn: true,
    partyAttended: false
  },
  {
    event: 'Debate Tournament',
    eventCn: '辩论比赛',
    team: 'Logic Masters 🎤',
    amount: 50,
    tier: 3,
    tierName: 'Stake Only',
    tierNameCn: '仅质押',
    outcome: 'win',
    payout: 22.50,
    multiplier: '30%',
    date: '2024-10-22',
    qrCheckedIn: false,
    partyAttended: false
  },
  {
    event: 'Tech Innovation Battle',
    eventCn: '科技创新对战',
    team: 'CodeWarriors 💻',
    amount: 125,
    tier: 1,
    tierName: 'Full Experience',
    tierNameCn: '完整体验',
    outcome: 'pending',
    payout: 'TBD',
    multiplier: '100% + Bonus',
    date: '2024-10-21',
    qrCheckedIn: true,
    partyAttended: 'pending'
  }
];

// Enhanced leaderboard with tier achievements / 增强排行榜与等级成就
const mockLeaderboard = [
  { 
    rank: 1, 
    name: 'CryptoKing', 
    winRate: '85%', 
    totalWinnings: 4250.75,
    tier1Events: 15,
    tier2Events: 8,
    tier3Events: 12,
    badges: ['👑', '🔥', '💎']
  },
  { 
    rank: 2, 
    name: 'Alex "The Oracle"', 
    winRate: '68%', 
    totalWinnings: 2180.25,
    tier1Events: 8,
    tier2Events: 15,
    tier3Events: 25,
    badges: ['🎯', '🔥', '🏆']
  },
  { 
    rank: 3, 
    name: 'StrategySavvy', 
    winRate: '72%', 
    totalWinnings: 1950.50,
    tier1Events: 12,
    tier2Events: 6,
    tier3Events: 18,
    badges: ['🧠', '⚡', '🏆']
  },
  { 
    rank: 4, 
    name: 'PartyGoer', 
    winRate: '58%', 
    totalWinnings: 1456.80,
    tier1Events: 20,
    tier2Events: 3,
    tier3Events: 5,
    badges: ['🎉', '🏆']
  },
  { 
    rank: 5, 
    name: 'RemoteSupporter', 
    winRate: '74%', 
    totalWinnings: 1234.20,
    tier1Events: 2,
    tier2Events: 5,
    tier3Events: 38,
    badges: ['🎯', '💰']
  }
];

// Achievement badges system / 成就徽章系统
const mockBadges = [
  { 
    id: 'first_stake', 
    name: 'First Stake', 
    nameCn: '首次质押',
    icon: '🏆', 
    unlocked: true, 
    description: 'Placed your first CHZ stake!',
    descriptionCn: '完成首次CHZ质押！'
  },
  { 
    id: 'party_animal', 
    name: 'Party Animal', 
    nameCn: '聚会达人',
    icon: '🎉', 
    unlocked: true, 
    description: 'Attended 3+ after-parties',
    descriptionCn: '参加3次以上聚会'
  },
  { 
    id: 'tier1_master', 
    name: 'Full Experience Master', 
    nameCn: '完整体验大师',
    icon: '👑', 
    unlocked: true, 
    description: 'Completed 10+ Tier 1 events',
    descriptionCn: '完成10次以上一级赛事'
  },
  { 
    id: 'oracle', 
    name: 'The Oracle', 
    nameCn: '先知',
    icon: '🔮', 
    unlocked: false, 
    description: 'Achieve 80%+ win rate',
    descriptionCn: '达到80%以上胜率'
  },
  { 
    id: 'whale', 
    name: 'CHZ Whale', 
    nameCn: 'CHZ巨鲸',
    icon: '🐋', 
    unlocked: false, 
    description: 'Stake 1000+ CHZ in single event',
    descriptionCn: '单次赛事质押1000+CHZ'
  },
  { 
    id: 'community_builder', 
    name: 'Community Builder', 
    nameCn: '社区建设者',
    icon: '🤝', 
    unlocked: false, 
    description: 'Invite 5+ friends via invite code',
    descriptionCn: '通过邀请码邀请5位以上朋友'
  }
];

export default function AudienceDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState(2);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [eventsLayout, setEventsLayout] = useState('grid'); // 'grid' or 'list'

  // Stake submission states / 质押提交状态
  const [stakeSuccess, setStakeSuccess] = useState({ show: false, stakeAmount: 0, participationTier: 2, teamChoice: '', eventTitle: '' });
  const [stakeError, setStakeError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time updates simulation / 实时更新模拟
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real data state for featured event / 焦点赛事的真实数据状态
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [featuredEventLoading, setFeaturedEventLoading] = useState(true);
  const [featuredEventError, setFeaturedEventError] = useState(null);
  const [userStakeStatus, setUserStakeStatus] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real featured event from database / 从数据库获取真实焦点赛事
  useEffect(() => {
    const fetchFeaturedEvent = async () => {
      try {
        setFeaturedEventLoading(true);
        setFeaturedEventError(null);
        
        const response = await fetch('/api/audience/featured-events');
        const data = await response.json();
        
        if (data.success) {
          setFeaturedEvent(data.featuredEvent);
          console.log('✅ Featured event loaded from database:', data.featuredEvent.title);
          console.log('✅ 从数据库加载焦点赛事:', data.featuredEvent.title);
          
          // Fetch user stake status for this event / 获取用户在此赛事的质押状态
          await fetchUserStakeStatus(data.featuredEvent.id);
        } else {
          setFeaturedEventError(data.error || 'Failed to fetch featured event');
          console.error('❌ Failed to fetch featured event:', data.error);
          console.error('❌ 获取焦点赛事失败:', data.error);
        }
      } catch (error) {
        setFeaturedEventError('Network error while fetching featured event');
        console.error('❌ Network error fetching featured event:', error);
        console.error('❌ 获取焦点赛事网络错误:', error);
      } finally {
        setFeaturedEventLoading(false);
      }
    };

    fetchFeaturedEvent();
  }, []);

  // Fetch user stake status for featured event / 获取用户在焦点赛事的质押状态
  const fetchUserStakeStatus = async (eventId) => {
    try {
      // Use event_id for featured events (now from events table)
      // 对焦点赛事使用event_id（现在来自events表）
      const response = await fetch(`/api/audience/user-stake-status?user_id=${mockUserProfile.id}&event_id=${eventId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserStakeStatus(data);
        console.log('✅ User stake status loaded:', data.has_staked);
        console.log('✅ 用户质押状态已加载:', data.has_staked);
      } else {
        console.error('❌ Failed to fetch user stake status:', data.error);
        console.error('❌ 获取用户质押状态失败:', data.error);
      }
    } catch (error) {
      console.error('❌ Network error fetching user stake status:', error);
      console.error('❌ 获取用户质押状态网络错误:', error);
    }
  };

  // Calculate time remaining for QR expiry / 计算二维码过期剩余时间
  const getTimeRemaining = (expiryTime) => {
    const now = new Date();
    const expiry = new Date(expiryTime);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  // Parse team names from event title / 从赛事标题解析队伍名称
  const parseTeamNamesFromTitle = (title) => {
    if (!title) return { teamA: 'Team A', teamB: 'Team B' };
    
    // Common separators for team names / 队伍名称的常见分隔符
    const separators = [' vs ', ' VS ', ' v ', ' V ', ' - ', ' vs. ', ' VS. '];
    
    for (const separator of separators) {
      if (title.includes(separator)) {
        const parts = title.split(separator);
        if (parts.length === 2) {
          return {
            teamA: parts[0].trim(),
            teamB: parts[1].trim()
          };
        }
      }
    }
    
    // If no separator found, try to split by space / 如果没有找到分隔符，尝试按空格分割
    const words = title.trim().split(' ');
    if (words.length >= 2) {
      // Try to find a middle word that could be a separator / 尝试找到可能是分隔符的中间词
      const middleIndex = Math.floor(words.length / 2);
      const teamA = words.slice(0, middleIndex).join(' ');
      const teamB = words.slice(middleIndex + 1).join(' ');
      
      if (teamA && teamB) {
        return { teamA, teamB };
      }
    }
    
    // Fallback / 备用方案
    return { teamA: 'Team A', teamB: 'Team B' };
  };

  // Handle stake submission / 处理质押提交
  const handleStakeSubmission = async () => {
    if (!selectedEvent || !stakeAmount || parseFloat(stakeAmount) <= 0 || !selectedTeam) {
      console.error('Invalid stake submission parameters');
      console.error('无效的质押提交参数');
      return;
    }

    setIsSubmitting(true);
    setStakeError(null);

    try {
      console.log('Submitting stake:', {
        event_id: selectedEvent.id, // Use event_id for featured events (now from events table)
        stake_amount: parseFloat(stakeAmount),
        participation_tier: selectedTier,
        team_choice: selectedTeam
      });

      const response = await fetch('/api/audience/stake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: mockUserProfile.id,
          event_id: selectedEvent.id, // Use event_id for featured events (now from events table)
          stake_amount: parseFloat(stakeAmount),
          participation_tier: selectedTier,
          team_choice: selectedTeam
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Stake submitted successfully:', data);
        console.log('✅ 质押提交成功:', data);
        
        // Show success message
        // 显示成功消息
        setStakeSuccess({
          show: true,
          stakeAmount: parseFloat(stakeAmount),
          participationTier: selectedTier,
          teamChoice: selectedTeam,
          eventTitle: selectedEvent.title
        });
        
        // Reset form
        // 重置表单
        setShowStakeModal(false);
        setStakeAmount('');
        setSelectedTier(2);
        setSelectedTeam(null);
        
        // Refresh user stake status to show updated status
        // 刷新用户质押状态以显示更新状态
        if (selectedEvent) {
          await fetchUserStakeStatus(selectedEvent.id);
        }
        
      } else {
        console.error('❌ Stake submission failed:', data.error);
        console.error('❌ 质押提交失败:', data.error);
        // Show error message
        // 显示错误消息
        setStakeError(data.error || 'Stake submission failed');
      }
    } catch (error) {
      console.error('❌ Network error during stake submission:', error);
      console.error('❌ 质押提交网络错误:', error);
      setStakeError('Network error during stake submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEventCard = (event, layout = 'list') => {
    // Grid layout - compact version / 网格布局 - 紧凑版本
    if (layout === 'grid') {
      return (
        <div key={event.id} className="bg-gray-800/70 rounded-lg p-3 border border-gray-700 hover:border-blue-500 transition-all duration-300">
          {/* Compact Header / 紧凑标题 */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1 truncate">
                {language === 'en' ? event.title : event.titleCn}
              </h3>
              <p className="text-xs text-gray-400">
                {event.date} {event.time}
              </p>
            </div>
            <div className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
              {event.status.toUpperCase()}
            </div>
          </div>

          {/* Compact Teams Battle / 紧凑队伍对战 */}
          <div className="flex justify-around items-center my-3 bg-gray-900/50 rounded-lg p-2">
            <div className="text-center">
              <div className="text-2xl mb-1">{event.teamA.icon}</div>
              <h4 className="font-bold text-white text-xs truncate">{event.teamA.name}</h4>
              <p className="text-xs text-gray-400">{event.teamA.odds}x</p>
            </div>
            <div className="text-2xl font-bold text-gray-500">VS</div>
            <div className="text-center">
              <div className="text-2xl mb-1">{event.teamB.icon}</div>
              <h4 className="font-bold text-white text-xs truncate">{event.teamB.name}</h4>
              <p className="text-xs text-gray-400">{event.teamB.odds}x</p>
            </div>
          </div>

          {/* Compact Stats / 紧凑统计 */}
          <div className="flex justify-between text-xs mb-2">
            <span className="text-gray-400">
              Pool: <span className="text-green-400 font-semibold">{event.totalPool.toLocaleString()}</span>
            </span>
            <span className="text-gray-400">
              {event.currentStakers}/{event.capacity} stakers
            </span>
          </div>

          {/* Compact Party Info / 紧凑聚会信息 */}
          <div className="flex items-center gap-1 mb-2 text-xs text-yellow-400">
            <FaGift className="text-xs" />
            <span>Party: {event.partyApplicants}/{event.partyCapacity}</span>
          </div>

          {/* Compact Support Button / 紧凑支持按钮 */}
          <button 
            onClick={() => {
              setSelectedEvent(event);
              setShowStakeModal(true);
            }}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 text-xs"
          >
            {language === 'en' ? 'Support' : '支持'}
          </button>
        </div>
      );
    }

    // List layout - detailed version / 列表布局 - 详细版本
    return (
      <div key={event.id} className="bg-gray-800/70 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all duration-300">
        {/* Event Header / 赛事标题 */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              {language === 'en' ? event.title : event.titleCn}
            </h3>
            <p className="text-xs text-gray-400">
              {language === 'en' ? event.venue : event.venueCn} • {event.date} {event.time}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-green-600/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
              {event.status.toUpperCase()}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              QR Expires: {getTimeRemaining(event.qrExpiry)}
            </p>
          </div>
        </div>

        {/* Teams Battle / 队伍对战 */}
        <div className="flex justify-around items-center my-4 bg-gray-900/50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-3xl mb-1">{event.teamA.icon}</div>
            <h4 className="font-bold text-white text-sm">{event.teamA.name}</h4>
            <p className="text-xs text-gray-400">Odds: {event.teamA.odds}x</p>
          </div>
          <div className="text-3xl font-bold text-gray-500">VS</div>
          <div className="text-center">
            <div className="text-3xl mb-1">{event.teamB.icon}</div>
            <h4 className="font-bold text-white text-sm">{event.teamB.name}</h4>
            <p className="text-xs text-gray-400">Odds: {event.teamB.odds}x</p>
          </div>
        </div>

        {/* Event Stats / 赛事统计 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-900/50 rounded p-2">
            <p className="text-xs text-gray-400">Total Pool</p>
            <p className="font-bold text-green-400 text-sm">{event.totalPool.toLocaleString()} CHZ</p>
          </div>
          <div className="bg-gray-900/50 rounded p-2">
            <p className="text-xs text-gray-400">Stakers</p>
            <p className="font-bold text-blue-400 text-sm">{event.currentStakers}/{event.capacity}</p>
          </div>
        </div>

        {/* Party Information / 聚会信息 */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <FaGift className="text-yellow-500 text-sm" />
            <span className="font-medium text-yellow-500 text-sm">After-Party Available</span>
          </div>
          <p className="text-xs text-gray-300">
            {language === 'en' ? event.partyVenue : event.partyVenueCn} • 
            Capacity: {event.partyCapacity} • 
            Applications: {event.partyApplicants}
          </p>
        </div>

        {/* Ambassador Info / 大使信息 */}
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
          <FaUsers className="text-xs" />
          <span>Ambassador: {event.ambassadorInfo.name} ({event.ambassadorInfo.contact})</span>
        </div>

        {/* Support Button / 支持按钮 */}
        <button 
          onClick={() => {
            setSelectedEvent(event);
            setShowStakeModal(true);
          }}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-sm"
        >
          {language === 'en' ? 'Support Team' : '支持队伍'}
        </button>
      </div>
    );
  };

  const renderStakeModal = () => {
    if (!showStakeModal || !selectedEvent) return null;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {language === 'en' ? 'Choose Your Participation' : '选择您的参与方式'}
            </h2>
            <button 
              onClick={() => setShowStakeModal(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>

          {/* Event Summary / 赛事摘要 */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-white mb-2">
              {language === 'en' ? selectedEvent.title : selectedEvent.titleCn}
            </h3>
            <p className="text-sm text-gray-400">
              {selectedEvent.date} {selectedEvent.time} • {language === 'en' ? selectedEvent.venue : selectedEvent.venueCn}
            </p>
          </div>

          {/* Three-Tier Selection / 三层选择 */}
          <div className="space-y-4 mb-6">
            {participationTiers.map((tier) => (
              <div 
                key={tier.tier}
                onClick={() => setSelectedTier(tier.tier)}
                className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-300 ${
                  selectedTier === tier.tier 
                    ? 'border-blue-500 bg-blue-600/20' 
                    : 'border-gray-600 bg-gray-900/30 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {tier.icon}
                    <div>
                      <h4 className="font-bold text-white">
                        {language === 'en' ? tier.name : tier.nameCn}
                      </h4>
                      <p className="text-sm text-gray-400">
                        {language === 'en' ? tier.description : tier.descriptionCn}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`bg-gradient-to-r ${tier.color} text-white px-3 py-1 rounded font-bold`}>
                      {tier.multiplier}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  {(language === 'en' ? tier.features : tier.featuresCn).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-gray-300">
                      <FaCheckCircle className="text-green-500 text-xs" />
                      {feature}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  {language === 'en' ? tier.requirements : tier.requirementsCn}
                </p>
              </div>
            ))}
          </div>

          {/* Team Selection / 队伍选择 */}
          <div className="mb-6">
            <h4 className="font-bold text-white mb-3">
              {language === 'en' ? 'Select Team to Support' : '选择支持的队伍'}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setSelectedTeam('team_a')}
                className={`rounded-lg p-4 transition-all duration-300 ${
                  selectedTeam === 'team_a'
                    ? 'bg-blue-600/30 border-blue-500'
                    : 'bg-gray-900/50 hover:bg-blue-600/30 border-gray-600 hover:border-blue-500'
                } border`}
              >
                <div className="text-3xl mb-2">{selectedEvent.teamA.icon}</div>
                <div className="font-bold text-white">{selectedEvent.teamA.name}</div>
                <div className="text-sm text-gray-400">Team A</div>
              </button>
              <button 
                onClick={() => setSelectedTeam('team_b')}
                className={`rounded-lg p-4 transition-all duration-300 ${
                  selectedTeam === 'team_b'
                    ? 'bg-blue-600/30 border-blue-500'
                    : 'bg-gray-900/50 hover:bg-blue-600/30 border-gray-600 hover:border-blue-500'
                } border`}
              >
                <div className="text-3xl mb-2">{selectedEvent.teamB.icon}</div>
                <div className="font-bold text-white">{selectedEvent.teamB.name}</div>
                <div className="text-sm text-gray-400">Team B</div>
              </button>
            </div>
          </div>

          {/* Stake Amount / 质押金额 */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">
              {language === 'en' ? 'Stake Amount (CHZ)' : '质押金额 (CHZ)'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter CHZ amount"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                Balance: {mockUserProfile.realChzBalance.toLocaleString()} CHZ
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {[25, 50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setStakeAmount(amount.toString())}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {/* Tier-specific Requirements / 特定等级要求 */}
          {selectedTier <= 2 && (
            <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FaQrcode className="text-blue-500" />
                <span className="font-medium text-blue-500">
                  {language === 'en' ? 'QR Check-in Required' : '需要二维码签到'}
                </span>
              </div>
              <p className="text-sm text-gray-300">
                {language === 'en' 
                  ? 'You will receive a JWT QR code 4 hours before the match for venue check-in.'
                  : '您将在比赛前4小时收到用于场馆签到的JWT二维码。'
                }
              </p>
            </div>
          )}

          {selectedTier === 1 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
            <FaGift className="text-yellow-500" />
            <span className="font-medium text-yellow-500">
              {language === 'en' ? 'Party Application Included' : '包含聚会申请'}
            </span>
          </div>
              <p className="text-sm text-gray-300">
                {language === 'en' 
                  ? `Guaranteed entry to after-party at ${selectedEvent.partyVenue}. Limited to ${selectedEvent.partyCapacity} participants.`
                  : `保证进入${selectedEvent.partyVenueCn}聚会。限制${selectedEvent.partyCapacity}名参与者。`
                }
              </p>
            </div>
          )}

          {/* Submit Button / 提交按钮 */}
          <button
            onClick={handleStakeSubmission}
            disabled={
              !stakeAmount || 
              parseFloat(stakeAmount) <= 0 || 
              parseFloat(stakeAmount) > mockUserProfile.realChzBalance ||
              !selectedTeam ||
              isSubmitting
            }
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {language === 'en' ? 'Processing...' : '处理中...'}
              </div>
            ) : (
              language === 'en' ? 'Confirm Stake & Participation' : '确认质押和参与'
            )}
          </button>

          {/* Error Message / 错误消息 */}
          {stakeError && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-red-500" />
                <span className="font-medium text-red-500">
                  {language === 'en' ? 'Error' : '错误'}
                </span>
              </div>
              <p className="text-sm text-red-300">{stakeError}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return (
          <div>
            {/* Layout Toggle Controls / 布局切换控制 */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {language === 'en' ? 'Layout:' : '布局:'}
                </span>
                <div className="flex bg-gray-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setEventsLayout('grid')}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-all duration-200 ${
                      eventsLayout === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <FaTh className="text-xs" />
                    {language === 'en' ? 'Grid' : '网格'}
                  </button>
                  <button
                    onClick={() => setEventsLayout('list')}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-all duration-200 ${
                      eventsLayout === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <FaList className="text-xs" />
                    {language === 'en' ? 'List' : '列表'}
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {mockUpcomingEvents.length} {language === 'en' ? 'events available' : '个可用赛事'}
              </div>
            </div>

            {/* Events Display / 赛事显示 */}
            <div className={
              eventsLayout === 'grid' 
                ? "grid grid-cols-1 lg:grid-cols-2 gap-4" 
                : "space-y-4"
            }>
              {mockUpcomingEvents.map((event) => renderEventCard(event, eventsLayout))}
            </div>
            </div>
        );
      
      case 'history':
        return (
            <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "My Support History" : "我的支持历史"}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="p-3">{language === 'en' ? 'Event' : '赛事'}</th>
                    <th className="p-3">{language === 'en' ? 'Team' : '队伍'}</th>
                    <th className="p-3">{language === 'en' ? 'Stake' : '质押'}</th>
                    <th className="p-3">{language === 'en' ? 'Tier' : '等级'}</th>
                    <th className="p-3">{language === 'en' ? 'Result' : '结果'}</th>
                    <th className="p-3">{language === 'en' ? 'Payout' : '支付'}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSupportHistory.map((record, idx) => (
                    <tr key={idx} className="border-b border-gray-800 hover:bg-gray-700/30">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-white">
                            {language === 'en' ? record.event : record.eventCn}
                          </div>
                          <div className="text-xs text-gray-400">{record.date}</div>
                        </div>
                      </td>
                      <td className="p-3 text-white">{record.team}</td>
                      <td className="p-3 text-white">{record.amount} CHZ</td>
                      <td className="p-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          record.tier === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                          record.tier === 2 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {record.tier === 1 && <FaGift />}
                          {record.tier === 2 && <FaBasketballBall />}
                          {record.tier === 3 && <FaCoins />}
                          {language === 'en' ? record.tierName : record.tierNameCn}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={`font-medium ${
                          record.outcome === 'win' ? 'text-green-400' :
                          record.outcome === 'loss' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {record.outcome === 'win' ? '✅ Win' : 
                           record.outcome === 'loss' ? '❌ Loss' : 
                           '⏳ Pending'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={`font-bold ${
                          record.outcome === 'win' ? 'text-green-400' :
                          record.outcome === 'loss' ? 'text-red-400' :
                          'text-yellow-400'
                        }`}>
                          {typeof record.payout === 'number' ? `${record.payout} CHZ` : record.payout}
                        </div>
                        <div className="text-xs text-gray-400">
                          {record.multiplier} multiplier
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
        );
      
      case 'leaderboard':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "Top Supporters Leaderboard" : "顶级支持者排行榜"}
            </h2>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="p-3">{language === 'en' ? 'Rank' : '排名'}</th>
                    <th className="p-3">{language === 'en' ? 'Supporter' : '支持者'}</th>
                    <th className="p-3">{language === 'en' ? 'Win Rate' : '胜率'}</th>
                    <th className="p-3">{language === 'en' ? 'Total Winnings' : '总奖金'}</th>
                    <th className="p-3">{language === 'en' ? 'Tier Distribution' : '等级分布'}</th>
                    <th className="p-3">{language === 'en' ? 'Badges' : '徽章'}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeaderboard.map((user) => (
                    <tr 
                      key={user.rank} 
                      className={`border-b border-gray-800 hover:bg-gray-700/30 ${
                        user.name === mockUserProfile.name ? 'bg-blue-900/30' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {user.rank === 1 && <FaTrophy className="text-yellow-500" />}
                          {user.rank === 2 && <FaMedal className="text-gray-400" />}
                          {user.rank === 3 && <FaMedal className="text-orange-500" />}
                          <span className="font-bold text-white">{user.rank}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-white">{user.name}</div>
                        {user.name === mockUserProfile.name && (
                          <div className="text-xs text-blue-400">You</div>
                        )}
                      </td>
                      <td className="p-3 text-white">{user.winRate}</td>
                      <td className="p-3 text-green-400 font-bold">
                        {user.totalWinnings.toLocaleString()} CHZ
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 text-xs">
                          <span className="bg-yellow-500/20 text-yellow-400 px-1 rounded">
                            T1: {user.tier1Events}
                          </span>
                          <span className="bg-blue-500/20 text-blue-400 px-1 rounded">
                            T2: {user.tier2Events}
                          </span>
                          <span className="bg-gray-500/20 text-gray-400 px-1 rounded">
                            T3: {user.tier3Events}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {user.badges.map((badge, idx) => (
                            <span key={idx} className="text-lg">{badge}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title={language === 'en' ? "Audience Dashboard" : "观众仪表板"}
      subtitle={language === 'en' ? "Three-tier campus sports prediction platform" : "三层校园体育预测平台"}
    >
      {/* Enhanced User Profile Section / 增强用户资料部分 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* User Avatar & Verification / 用户头像和验证 */}
        <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="relative">
              <img 
                src={mockUserProfile.avatar} 
                alt="User Avatar" 
                className="w-12 h-12 rounded-full border-2 border-blue-500"
              />
              {mockUserProfile.verified && (
                <FaCheckCircle className="absolute -bottom-1 -right-1 text-green-500 bg-gray-800 rounded-full text-xs" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{mockUserProfile.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <FaIdCard className="text-xs" />
                <span>{mockUserProfile.studentId}</span>
              </div>
              <div className="text-xs text-blue-400">
                {mockUserProfile.joinedVia === 'invite' ? `Invite: ${mockUserProfile.inviteCode}` : 'Direct Registration'}
              </div>
            </div>
          </div>
        </div>

        {/* CHZ Balance / CHZ余额 */}
        <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaCoins className="text-green-400 text-sm" />
            <span className="text-xs text-gray-300">CHZ Balance</span>
          </div>
          <div className="text-xl font-bold text-green-400">
            {mockUserProfile.realChzBalance.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Staked: {mockUserProfile.currentStake.toLocaleString()} CHZ
          </div>
        </div>

        {/* Win Rate / 胜率 */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaChartLine className="text-blue-400 text-sm" />
            <span className="text-xs text-gray-300">Win Rate</span>
          </div>
          <div className="text-xl font-bold text-blue-400">{mockUserProfile.winRate}</div>
          <div className="text-xs text-gray-400">
            {mockUserProfile.totalSupports} total supports
          </div>
        </div>

        {/* Current Tier / 当前等级 */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-xs text-gray-300">Current Tier</span>
          </div>
          <div className="text-xl font-bold text-yellow-400">
            Tier {mockUserProfile.currentTier}
          </div>
          <div className="text-xs text-gray-400">
            {participationTiers.find(t => t.tier === mockUserProfile.currentTier)?.name}
          </div>
        </div>

        {/* Party Attendance / 聚会出席 */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaGift className="text-purple-400 text-sm" />
            <span className="text-xs text-gray-300">Parties</span>
          </div>
          <div className="text-xl font-bold text-purple-400">
            {mockUserProfile.partyAttendance}
          </div>
          <div className="text-xs text-gray-400">attended</div>
        </div>
      </div>

      {/* Tier Progress Section / 等级进度部分 */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          <FaFire className="text-orange-500 text-sm" />
          {language === 'en' ? "Tier Progress & Achievements" : "等级进度和成就"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(mockUserProfile.tierProgress).map(([tier, progress]) => {
            const tierInfo = participationTiers.find(t => t.tier === parseInt(tier.replace('tier', '')));
            const percentage = (progress.completed / progress.required) * 100;
            
            return (
              <div key={tier} className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">{tierInfo?.icon}</div>
                  <span className="font-medium text-white text-sm">
                    {language === 'en' ? tierInfo?.name : tierInfo?.nameCn}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                  <div 
                    className={`bg-gradient-to-r ${tierInfo?.color} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">
                  {progress.completed}/{progress.required} events completed
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Badges / 成就徽章 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 text-white flex items-center gap-2">
          <FaGift className="text-yellow-500 text-sm" />
          {language === 'en' ? "Achievement Badges" : "成就徽章"}
        </h2>
        <div className="flex space-x-3 overflow-x-auto pb-3">
          {mockBadges.map(badge => (
            <div 
              key={badge.id} 
              className={`flex-shrink-0 w-36 h-32 rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                badge.unlocked 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500' 
                  : 'bg-gray-800/50 border border-gray-600'
              }`}
            >
              <div className={`text-3xl mb-1 ${!badge.unlocked && 'opacity-30 grayscale'}`}>
                {badge.icon}
              </div>
              <h4 className={`font-bold text-xs ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>
                {language === 'en' ? badge.name : badge.nameCn}
              </h4>
              <p className={`text-xs mt-1 ${badge.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'en' ? badge.description : badge.descriptionCn}
              </p>
              {badge.unlocked && (
                <FaCheckCircle className="text-green-500 mt-1 text-xs" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Event Banner - Now with Real Data / 焦点赛事横幅 - 现在使用真实数据 */}
      {featuredEventLoading ? (
        <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-red-900 rounded-lg p-4 mb-6 text-center shadow-xl border border-gray-700">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-700 rounded mb-4"></div>
            <div className="h-12 bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : featuredEventError ? (
        <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-lg p-4 mb-6 text-center shadow-xl border border-red-700">
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            {language === 'en' ? "⚠️ Featured Event Unavailable" : "⚠️ 焦点赛事不可用"}
          </h2>
          <p className="text-gray-300 mb-4">
            {language === 'en' ? "Unable to load featured championship" : "无法加载焦点锦标赛"}
          </p>
          <div className="text-sm text-gray-400">
            {featuredEventError}
          </div>
        </div>
      ) : featuredEvent ? (
        <div className="bg-gradient-to-r from-blue-900 via-purple-800 to-red-900 rounded-lg p-4 mb-6 text-center shadow-xl border border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2 animate-pulse">
            {language === 'en' ? "🔥 Featured Championship 🔥" : "🔥 焦点锦标赛 🔥"}
          </h2>
          <p className="text-gray-200 mb-3 text-base">
            {language === 'en' ? featuredEvent.title : featuredEvent.titleCn}
          </p>
          
          <div className="flex justify-around items-center my-4 bg-black/20 rounded-lg p-3">
            <div className="text-center">
              <div className="text-4xl mb-1">🛡️</div>
              <span className="font-bold text-base text-white">
                {parseTeamNamesFromTitle(featuredEvent.title).teamA}
              </span>
            </div>
            <div className="text-center">
              <span className="text-4xl font-bold text-white animate-pulse">VS</span>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-1">⚔️</div>
              <span className="font-bold text-base text-white">
                {parseTeamNamesFromTitle(featuredEvent.title).teamB}
              </span>
            </div>
          </div>
          
          {/* New Pool Balance After Display / 新增奖池余额显示 */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaCoins className="text-green-400 text-lg" />
              <span className="text-lg font-bold text-green-400">
                {language === 'en' ? "Current Pool Balance" : "当前奖池余额"}
              </span>
            </div>
            <div className="text-2xl font-bold text-white">
              {featuredEvent.poolBalanceAfter.toLocaleString()} CHZ
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {language === 'en' ? "Pool balance available for all participants to share" : "每个参与用户可实际分享的奖池"}
            </div>
          </div>
          
          <div className="text-sm text-gray-300 mb-4">
            {featuredEvent.date} {featuredEvent.time} • 
            {language === 'en' ? featuredEvent.venue : featuredEvent.venueCn}
          </div>
          
          {userStakeStatus && userStakeStatus.has_staked ? (
            // User has already staked - show supported status / 用户已质押 - 显示已支持状态
            <div className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-xl">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-xl" />
                {language === 'en' ? "✅ Supported" : "✅ 已支持"}
              </div>
              <div className="text-sm mt-1 opacity-90">
                {language === 'en' 
                  ? `${userStakeStatus.stake_info.stake_amount} CHZ • ${participationTiers.find(t => t.tier === userStakeStatus.stake_info.participation_tier)?.name}`
                  : `${userStakeStatus.stake_info.stake_amount} CHZ • ${participationTiers.find(t => t.tier === userStakeStatus.stake_info.participation_tier)?.nameCn}`
                }
              </div>
            </div>
          ) : (
            // User hasn't staked - show support button / 用户未质押 - 显示支持按钮
            <button 
              onClick={() => {
                setSelectedEvent(featuredEvent);
                setShowStakeModal(true);
              }}
              className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {language === 'en' ? "🚀 Support Now" : "🚀 立即支持"}
            </button>
          )}
          
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <FaUsers className="text-xs" />
              {featuredEvent.currentStakers} supporters
            </div>
            <div className="flex items-center gap-1">
              <FaClock className="text-xs" />
              QR expires: {getTimeRemaining(featuredEvent.qrExpiry)}
            </div>
            <div className="flex items-center gap-1">
              <FaGift className="text-xs" />
              After-party available
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Navigation Tabs / 导航标签 */}
      <div className="mb-4">
        <div className="flex border-b border-gray-700">
          <button 
            onClick={() => setActiveTab('events')} 
            className={`py-2 px-4 text-sm font-medium transition-all duration-300 ${
              activeTab === 'events' 
                ? 'border-b-2 border-blue-500 text-white bg-blue-500/10' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {language === 'en' ? "🏆 All Events" : "🏆 所有赛事"}
            </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`py-2 px-4 text-sm font-medium transition-all duration-300 ${
              activeTab === 'history' 
                ? 'border-b-2 border-blue-500 text-white bg-blue-500/10' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {language === 'en' ? "📊 My History" : "📊 我的历史"}
            </button>
          <button 
            onClick={() => setActiveTab('leaderboard')} 
            className={`py-2 px-4 text-sm font-medium transition-all duration-300 ${
              activeTab === 'leaderboard' 
                ? 'border-b-2 border-blue-500 text-white bg-blue-500/10' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {language === 'en' ? "🏅 Leaderboard" : "🏅 排行榜"}
            </button>
        </div>
      </div>

      {/* Tab Content / 标签内容 */}
      {renderTabContent()}

      {/* Stake Modal / 质押模态框 */}
      {renderStakeModal()}

      {/* Success Modal / 成功弹窗 */}
      {stakeSuccess.show && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {language === 'en' ? 'Congratulations!' : '恭喜！'}
              </h2>
              <p className="text-green-400 font-medium mb-4">
                {language === 'en' ? 'Stake Submitted Successfully' : '质押提交成功'}
              </p>
              
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-white mb-3">
                  {language === 'en' ? 'Stake Details' : '质押详情'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Event:' : '赛事:'}</span>
                    <span className="text-white">{stakeSuccess.eventTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Amount:' : '金额:'}</span>
                    <span className="text-green-400 font-bold">{stakeSuccess.stakeAmount} CHZ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Tier:' : '档位:'}</span>
                    <span className="text-blue-400">
                      {language === 'en' 
                        ? participationTiers.find(t => t.tier === stakeSuccess.participationTier)?.name
                        : participationTiers.find(t => t.tier === stakeSuccess.participationTier)?.nameCn
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Team:' : '队伍:'}</span>
                    <span className="text-white">
                      {stakeSuccess.teamChoice === 'team_a' ? 'Team A' : 'Team B'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setStakeSuccess({ ...stakeSuccess, show: false })}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300"
              >
                {language === 'en' ? 'Return to Dashboard' : '返回仪表板'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 