// FanForce AI - Athlete Dashboard Static Page / 运动员仪表板静态页面
// This file renders a purely static (mock-data) view for the athlete role so that we can finalise UI/UX before wiring APIs.
// 该文件提供运动员角色的纯静态（假数据）视图，让我们在接入 API 之前先确定 UI/UX。
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/api/athlete/profile/route.ts: 运动员档案API
// - app/api/athlete/status/route.ts: 运动员状态API
// - app/api/athlete/ranking/route.ts: 运动员排名API
// - app/api/athlete/matches/route.ts: 运动员比赛API
// - app/api/athlete/earnings/route.ts: 运动员收入API
// - lib/athlete-schema.sql: 运动员数据库架构

'use client'

import { useLanguage } from '@/app/context/LanguageContext';
import DashboardLayout from '@/app/components/shared/DashboardLayout';
import DataTable from '@/app/components/shared/DataTable';
import StatCard from '@/app/components/shared/StatCard';
import { useState } from 'react';
import { 
  FaTrophy, 
  FaFistRaised, 
  FaHistory, 
  FaUsers, 
  FaBasketballBall, 
  FaMedal, 
  FaCoins, 
  FaUserEdit,
  FaPlay,
  FaPause,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaCrown,
  FaChartLine,
  FaCalendarAlt,
  FaShieldAlt,
  FaStar
} from 'react-icons/fa';
import Link from 'next/link';

// Mock Data for Athlete Dashboard / 运动员仪表板模拟数据
const mockAthleteProfile = {
  name: 'Mike "The Machine" Johnson',
  avatar: '/placeholder.svg',
  studentId: '2023001',
  sport: 'Basketball',
  position: 'Point Guard',
  team: 'Campus Warriors',
  status: 'active', // 'active' | 'resting'
  rank: 'Gold',
  rankPoints: 1250,
  totalMatches: 15,
  winRate: '73%',
  totalEarnings: 850.50,
  virtualSalary: 120.75,
  seasonMatches: 8,
  seasonPosts: 3,
  seasonTarget: 10,
  postsTarget: 5
};

const mockAthleteStats = {
  totalMatches: 15,
  wins: 11,
  losses: 4,
  mvpCount: 3,
  totalEarnings: 850.50,
  virtualSalary: 120.75,
  currentStreak: 4,
  bestStreak: 6,
  averagePerformance: 8.5
};

const mockRankingSystem = [
  { rank: 'Bronze', minPoints: 0, maxPoints: 500, color: '#cd7f32' },
  { rank: 'Silver', minPoints: 501, maxPoints: 1000, color: '#c0c0c0' },
  { rank: 'Gold', minPoints: 1001, maxPoints: 1500, color: '#ffd700' },
  { rank: 'Platinum', minPoints: 1501, maxPoints: 2000, color: '#e5e4e2' },
  { rank: 'Diamond', minPoints: 2001, maxPoints: 2500, color: '#b9f2ff' },
  { rank: 'Master', minPoints: 2501, maxPoints: 9999, color: '#ff6b6b' }
];

const mockAchievements = [
  { name: 'First Victory', icon: '🏆', unlocked: true, description: 'Won your first match!' },
  { name: 'MVP Streak', icon: '⭐', unlocked: true, description: 'Won MVP 3 times in a row.' },
  { name: 'Gold Rank', icon: '🥇', unlocked: true, description: 'Reached Gold rank.' },
  { name: 'Social Star', icon: '📱', unlocked: true, description: 'Posted 5 social media updates.' },
  { name: 'Season Champion', icon: '👑', unlocked: false, description: 'Complete a full season (10+ matches).' },
  { name: 'Campus Legend', icon: '🌟', unlocked: false, description: 'Reach Master rank.' },
  { name: 'Earnings King', icon: '💰', unlocked: false, description: 'Earn 1000+ CHZ in a season.' },
  { name: 'Perfect Season', icon: '💎', unlocked: false, description: 'Win 10+ matches with 0 losses.' },
];

const mockMatchHistory = {
  columns: [
    { key: 'date', headerEn: 'Date', headerCn: '日期' },
    { key: 'opponent', headerEn: 'Opponent', headerCn: '对手' },
    { key: 'result', headerEn: 'Result', headerCn: '结果' },
    { key: 'performance', headerEn: 'Performance', headerCn: '表现' },
    { key: 'earnings', headerEn: 'Earnings (CHZ)', headerCn: '收入 (CHZ)' },
    { key: 'mvp', headerEn: 'MVP', headerCn: 'MVP' },
  ],
  rows: [
    { date: '2023-11-15', opponent: 'Team B', result: { type: 'win', text: 'W' }, performance: '9.5/10', earnings: '75.50', mvp: true },
    { date: '2023-11-10', opponent: 'Team C', result: { type: 'win', text: 'W' }, performance: '8.0/10', earnings: '65.25', mvp: false },
    { date: '2023-11-05', opponent: 'Team A', result: { type: 'loss', text: 'L' }, performance: '7.5/10', earnings: '25.00', mvp: false },
    { date: '2023-10-28', opponent: 'Team D', result: { type: 'win', text: 'W' }, performance: '9.0/10', earnings: '70.00', mvp: true },
    { date: '2023-10-20', opponent: 'Team B', result: { type: 'win', text: 'W' }, performance: '8.5/10', earnings: '68.75', mvp: false },
  ]
};

const mockSocialPosts = [
  { platform: 'Instagram', postId: 'inst_123', verified: true, date: '2023-11-12', engagement: 245 },
  { platform: 'Twitter', postId: 'tw_456', verified: true, date: '2023-11-08', engagement: 189 },
  { platform: 'Facebook', postId: 'fb_789', verified: false, date: '2023-11-05', engagement: 156 },
];

const mockUpcomingMatches = [
  { date: '2023-11-20', opponent: 'Team E', venue: 'Campus Gym', time: '19:00', status: 'confirmed' },
  { date: '2023-11-25', opponent: 'Team F', venue: 'Sports Center', time: '20:00', status: 'pending' },
  { date: '2023-12-02', opponent: 'Team G', venue: 'University Arena', time: '18:30', status: 'tentative' },
];

const mockEarningsHistory = {
  columns: [
    { key: 'date', headerEn: 'Date', headerCn: '日期' },
    { key: 'type', headerEn: 'Type', headerCn: '类型' },
    { key: 'amount', headerEn: 'Amount (CHZ)', headerCn: '数量 (CHZ)' },
    { key: 'source', headerEn: 'Source', headerCn: '来源' },
    { key: 'status', headerEn: 'Status', headerCn: '状态' },
  ],
  rows: [
    { date: '2023-11-15', type: 'Match Win', amount: '75.50', source: 'Team B Victory', status: { type: 'paid', text: 'Paid' } },
    { date: '2023-11-10', type: 'Match Win', amount: '65.25', source: 'Team C Victory', status: { type: 'paid', text: 'Paid' } },
    { date: '2023-11-01', type: 'Virtual Salary', amount: '120.75', source: 'Monthly Salary', status: { type: 'paid', text: 'Paid' } },
    { date: '2023-10-28', type: 'Match Win + MVP', amount: '85.00', source: 'Team D Victory + MVP', status: { type: 'paid', text: 'Paid' } },
    { date: '2023-10-20', type: 'Match Win', amount: '68.75', source: 'Team B Victory', status: { type: 'paid', text: 'Paid' } },
  ]
};

export default function AthleteDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Status Control Section / 状态控制部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {language === 'en' ? "Competition Status" : "比赛状态"}
                </h3>
                <button 
                  onClick={() => setStatusModalOpen(true)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                    mockAthleteProfile.status === 'active' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {mockAthleteProfile.status === 'active' ? (
                    <>
                      <FaPlay className="inline mr-2" />
                      {language === 'en' ? 'Active' : '活跃'}
                    </>
                  ) : (
                    <>
                      <FaPause className="inline mr-2" />
                      {language === 'en' ? 'Resting' : '休赛'}
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                {language === 'en' 
                  ? "Manage your competition availability. Active athletes can be selected for matches." 
                  : "管理您的比赛可用性。活跃的运动员可以被选中参加比赛。"}
              </p>
            </div>

            {/* Ranking Progress Section / 段位进度部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? "Ranking Progress" : "段位进度"}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">{language === 'en' ? "Current Rank" : "当前段位"}</span>
                  <span className="font-bold text-yellow-400">{mockAthleteProfile.rank}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(mockAthleteProfile.rankPoints / 1500) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{mockAthleteProfile.rankPoints} / 1500 {language === 'en' ? 'points' : '积分'}</span>
                  <span>{language === 'en' ? 'Next: Platinum' : '下一级：白金'}</span>
                </div>
              </div>
            </div>

            {/* Season Progress Section / 赛季进度部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? "Season Progress" : "赛季进度"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{mockAthleteProfile.seasonMatches}</div>
                  <div className="text-sm text-gray-400">{language === 'en' ? 'Matches' : '比赛'}</div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Target: 10+' : '目标：10+'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{mockAthleteProfile.seasonPosts}</div>
                  <div className="text-sm text-gray-400">{language === 'en' ? 'Social Posts' : '社交帖子'}</div>
                  <div className="text-xs text-gray-500">{language === 'en' ? 'Target: 5' : '目标：5'}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((mockAthleteProfile.seasonMatches / 10) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-gray-400 mt-2">
                  {language === 'en' ? 'Season Completion Progress' : '赛季完成进度'}
                </div>
              </div>
            </div>

            {/* Upcoming Matches Section / 即将到来的比赛部分 */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {language === 'en' ? "Upcoming Matches" : "即将到来的比赛"}
              </h3>
              <div className="space-y-3">
                {mockUpcomingMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaCalendarAlt className="text-blue-400" />
                      <div>
                        <div className="font-semibold text-white">{match.opponent}</div>
                        <div className="text-sm text-gray-400">{match.date} at {match.time}</div>
                        <div className="text-xs text-gray-500">{match.venue}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      match.status === 'confirmed' ? 'bg-green-600 text-white' :
                      match.status === 'pending' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {match.status === 'confirmed' ? (language === 'en' ? 'Confirmed' : '已确认') :
                       match.status === 'pending' ? (language === 'en' ? 'Pending' : '待定') :
                       (language === 'en' ? 'Tentative' : '暂定')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'matches':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "Match History" : "比赛历史"}
            </h2>
            <DataTable columns={mockMatchHistory.columns} rows={mockMatchHistory.rows} language={language} />
          </div>
        );

      case 'earnings':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "Earnings History" : "收入历史"}
            </h2>
            <DataTable columns={mockEarningsHistory.columns} rows={mockEarningsHistory.rows} language={language} />
          </div>
        );

      case 'social':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "Social Media Posts" : "社交媒体帖子"}
            </h2>
            <div className="space-y-4">
              {mockSocialPosts.map((post, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {post.platform === 'Instagram' && <FaInstagram className="text-pink-500 text-xl" />}
                    {post.platform === 'Twitter' && <FaTwitter className="text-blue-400 text-xl" />}
                    {post.platform === 'Facebook' && <FaFacebook className="text-blue-600 text-xl" />}
                    <div>
                      <div className="font-semibold text-white">{post.platform}</div>
                      <div className="text-sm text-gray-400">{post.date}</div>
                      <div className="text-xs text-gray-500">{post.engagement} {language === 'en' ? 'engagements' : '互动'}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    post.verified ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                  }`}>
                    {post.verified ? (language === 'en' ? 'Verified' : '已验证') : (language === 'en' ? 'Pending' : '待验证')}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                {language === 'en' ? "Add New Post" : "添加新帖子"}
              </button>
            </div>
          </div>
        );

      case 'achievements':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">
              {language === 'en' ? "Achievements" : "成就"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockAchievements.map((achievement, index) => (
                <div key={index} className={`text-center p-4 rounded-lg transition-all duration-300 ${
                  achievement.unlocked 
                    ? 'bg-yellow-500/10 border-2 border-yellow-500' 
                    : 'bg-gray-700/50 border-2 border-gray-600'
                }`}>
                  <div className={`text-3xl mb-2 ${!achievement.unlocked && 'opacity-30'}`}>
                    {achievement.icon}
                  </div>
                  <h4 className={`font-bold text-sm ${!achievement.unlocked && 'opacity-30'}`}>
                    {achievement.name}
                  </h4>
                  <p className={`text-xs text-gray-400 mt-1 ${!achievement.unlocked && 'opacity-30'}`}>
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      title={language === 'en' ? "Athlete Dashboard" : "运动员仪表板"}
      subtitle={language === 'en' ? "Your performance hub for campus competitions" : "您的校园比赛表现中心"}
    >
      {/* Profile Header Section / 档案头部部分 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-4 flex items-center space-x-4">
          <img src={mockAthleteProfile.avatar} alt="Athlete Avatar" className="w-16 h-16 rounded-full border-2 border-yellow-500"/>
          <div>
            <h3 className="font-bold text-lg">{mockAthleteProfile.name}</h3>
            <p className="text-sm text-gray-400">{mockAthleteProfile.sport} • {mockAthleteProfile.position}</p>
            <p className="text-xs text-yellow-400">{mockAthleteProfile.rank} Rank</p>
          </div>
        </div>
        <StatCard icon={<FaTrophy />} title={language === 'en' ? "Win Rate" : "胜率"} value={mockAthleteStats.winRate} />
        <StatCard icon={<FaCoins />} title={language === 'en' ? "Total Earnings" : "总收入"} value={`${mockAthleteStats.totalEarnings} CHZ`} />
        <StatCard icon={<FaChartLine />} title={language === 'en' ? "Avg Performance" : "平均表现"} value={`${mockAthleteStats.averagePerformance}/10`} />
      </div>

      {/* Quick Stats Row / 快速统计行 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{mockAthleteStats.totalMatches}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'Total Matches' : '总比赛'}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{mockAthleteStats.wins}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'Wins' : '胜利'}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{mockAthleteStats.mvpCount}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'MVP Awards' : 'MVP奖项'}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{mockAthleteStats.currentStreak}</div>
          <div className="text-sm text-gray-400">{language === 'en' ? 'Current Streak' : '当前连胜'}</div>
        </div>
      </div>

      {/* Featured Achievement Section / 焦点成就部分 */}
      <div className="bg-gradient-to-r from-yellow-900 via-gray-800 to-yellow-900 rounded-lg p-6 mb-8 text-center shadow-lg border border-yellow-500/30">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">{language === 'en' ? "Recent Achievement" : "最近成就"}</h2>
        <div className="flex justify-center items-center my-4">
          <div className="text-6xl mb-4">🥇</div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{language === 'en' ? "Gold Rank Achieved!" : "达到黄金段位！"}</h3>
        <p className="text-gray-300 mb-4">
          {language === 'en' 
            ? "You've reached Gold rank with 1250 points. Keep pushing for Platinum!" 
            : "您已达到1250积分的黄金段位。继续向白金段位进发！"}
        </p>
        <div className="flex justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{mockAthleteProfile.rankPoints}</div>
            <div className="text-sm text-gray-400">{language === 'en' ? 'Points' : '积分'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{mockAthleteStats.totalMatches}</div>
            <div className="text-sm text-gray-400">{language === 'en' ? 'Matches' : '比赛'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{mockAthleteStats.winRate}</div>
            <div className="text-sm text-gray-400">{language === 'en' ? 'Win Rate' : '胜率'}</div>
          </div>
        </div>
      </div>
      
      {/* Tabs / 标签页 */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Overview" : "概览"}
          </button>
          <button onClick={() => setActiveTab('matches')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'matches' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Match History" : "比赛历史"}
          </button>
          <button onClick={() => setActiveTab('earnings')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'earnings' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Earnings" : "收入"}
          </button>
          <button onClick={() => setActiveTab('social')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'social' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Social Media" : "社交媒体"}
          </button>
          <button onClick={() => setActiveTab('achievements')} className={`py-2 px-4 text-sm font-medium whitespace-nowrap ${activeTab === 'achievements' ? 'border-b-2 border-yellow-500 text-white' : 'text-gray-400'}`}>
            {language === 'en' ? "Achievements" : "成就"}
          </button>
        </div>
      </div>

      {/* Tab Content / 标签页内容 */}
      {renderTabContent()}

      {/* Status Change Modal / 状态更改模态框 */}
      {statusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {language === 'en' ? "Change Competition Status" : "更改比赛状态"}
            </h3>
            <p className="text-gray-400 mb-6">
              {language === 'en' 
                ? "Choose your availability for upcoming matches. Active athletes can be selected for competitions." 
                : "选择您对即将到来的比赛的可用性。活跃的运动员可以被选中参加比赛。"}
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setStatusModalOpen(false)}
                className={`w-full p-3 rounded-lg font-bold transition-all duration-300 ${
                  mockAthleteProfile.status === 'active' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                <FaPlay className="inline mr-2" />
                {language === 'en' ? 'Set as Active' : '设为活跃'}
              </button>
              <button 
                onClick={() => setStatusModalOpen(false)}
                className={`w-full p-3 rounded-lg font-bold transition-all duration-300 ${
                  mockAthleteProfile.status === 'resting' 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
              >
                <FaPause className="inline mr-2" />
                {language === 'en' ? 'Set as Resting' : '设为休赛'}
              </button>
            </div>
            <button 
              onClick={() => setStatusModalOpen(false)}
              className="w-full mt-4 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {language === 'en' ? 'Cancel' : '取消'}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 