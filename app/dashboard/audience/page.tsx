// FanForce AI - Audience Dashboard Static Page / 观众仪表板静态页面
// This file renders a purely static (mock-data) view for the audience role so that we can finalise UI/UX before wiring APIs.
// 该文件提供观众角色的纯静态（假数据）视图，让我们在接入 API 之前先确定 UI/UX。

'use client'

import { useLanguage } from '@/app/context/LanguageContext';
import DashboardLayout from '@/app/components/shared/DashboardLayout';
import DataTable from '@/app/components/shared/DataTable';
import StatCard from '@/app/components/shared/StatCard';
import { useState } from 'react';
import { FaTrophy, FaFistRaised, FaHistory, FaUsers, FaBasketballBall } from 'react-icons/fa';
import Link from 'next/link';

// Mock Data for the new sections
// 新模块的模拟数据

const mockUserStats = {
  name: 'Alex "The Oracle"',
  avatar: '/placeholder.svg',
  chzBalance: 1250.75,
  totalSupports: 42,
  winRate: '68%',
};

const mockBadges = [
  { name: 'First Bet', icon: '🏆', unlocked: true, description: 'Placed your first support!' },
  { name: 'On Fire', icon: '🔥', unlocked: true, description: 'Won 3 supports in a row.' },
  { name: 'High Roller', icon: '💰', unlocked: true, description: 'Staked over 1000 CHZ in total.' },
  { name: 'Loyal Fan', icon: '🛡️', unlocked: false, description: 'Supported the same team 5 times.' },
  { name: 'Campus Legend', icon: '👑', unlocked: false, description: 'Reached the top 10 on the leaderboard.' },
  { name: 'Iron Will', icon: '🦾', unlocked: false, description: 'Supported an underdog team that won.' },
];

const mockSupportHistory = {
  columns: [
    { key: 'event', headerEn: 'Event', headerCn: '赛事' },
    { key: 'team', headerEn: 'Team Supported', headerCn: '支持队伍' },
    { key: 'amount', headerEn: 'Amount (CHZ)', headerCn: '数量 (CHZ)' },
    { key: 'outcome', headerEn: 'Outcome', headerCn: '结果' },
    { key: 'date', headerEn: 'Date', headerCn: '日期' },
  ],
  rows: [
    { event: 'Campus B-Ball', team: 'Team A', amount: '100', outcome: { type: 'win', text: '+35 CHZ' }, date: '2023-10-28' },
    { event: 'Soccer Finals', team: 'Team B', amount: '50', outcome: { type: 'loss', text: '-50 CHZ' }, date: '2023-10-25' },
    { event: 'Debate Championship', team: 'Team A', amount: '200', outcome: { type: 'win', text: '+90 CHZ' }, date: '2023-10-22' },
    { event: 'Hackathon', team: 'Team B', amount: '75', outcome: { type: 'pending', text: 'Pending' }, date: '2023-10-21' },
  ]
};

const mockLeaderboard = [
  { rank: 1, name: 'CryptoKing', winRate: '85%', totalWinnings: 2500 },
  { rank: 2, name: 'Alex "The Oracle"', winRate: '68%', totalWinnings: 1850 },
  { rank: 3, name: 'StrategySavvy', winRate: '65%', totalWinnings: 1500 },
  { rank: 4, name: 'RookieRiches', winRate: '60%', totalWinnings: 1200 },
  { rank: 5, name: 'FanForceFanatic', winRate: '58%', totalWinnings: 950 },
];


export default function AudienceDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('events');

  const upcomingEvents = {
    columns: [
        { key: 'event', headerEn: 'Event', headerCn: '赛事' },
        { key: 'teams', headerEn: 'Teams', headerCn: '队伍' },
        { key: 'date', headerEn: 'Date', headerCn: '日期' },
        { key: 'action', headerEn: 'Action', headerCn: '操作' },
    ],
    rows: [
        { event: "Campus Basketball Final", teams: "Team A vs Team B", date: "2023-11-15", action: { type: 'link', href: '/dashboard/audience/events/evt1', text: 'Support' } },
        { event: "University Soccer League", teams: "Team C vs Team D", date: "2023-11-18", action: { type: 'link', href: '/dashboard/audience/events/evt2', text: 'Support' } },
        { event: "Annual Hackathon", teams: "InnovateU vs CodeCrafters", date: "2023-11-20", action: { type: 'link', href: '/dashboard/audience/events/evt3', text: 'Support' } },
    ]
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return (
            <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-white">{language === 'en' ? "Upcoming Events" : "未来赛事"}</h2>
                <DataTable columns={upcomingEvents.columns} rows={upcomingEvents.rows} language={language} />
            </div>
        );
      case 'history':
        return (
            <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-white">{language === 'en' ? "My Support History" : "我的支持历史"}</h2>
                <DataTable columns={mockSupportHistory.columns} rows={mockSupportHistory.rows} language={language} />
            </div>
        );
      case 'leaderboard':
        return (
          <div className="bg-gray-800/50 rounded-lg p-6">
             <h2 className="text-xl font-bold mb-4 text-white">{language === 'en' ? "Top Supporters" : "顶尖支持者"}</h2>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="p-2">Rank</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Win Rate</th>
                    <th className="p-2">Total Winnings (CHZ)</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeaderboard.map(user => (
                    <tr key={user.rank} className={`border-b border-gray-800 ${user.name === mockUserStats.name ? 'bg-blue-900/50' : ''}`}>
                      <td className="p-3 font-bold">{user.rank}</td>
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.winRate}</td>
                      <td className="p-3 text-green-400">{user.totalWinnings.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
             <div className="text-center mt-4">
               <a href="#" className="text-blue-400 hover:underline">{language === 'en' ? "View Full Leaderboard" : "查看完整排行榜"}</a>
             </div>
          </div>
        )
      default:
        return null;
    }
  }

  return (
    <DashboardLayout
      title={language === 'en' ? "Audience Dashboard" : "观众仪表板"}
      subtitle={language === 'en' ? "Your central hub for campus events" : "您的校园活动中心"}
    >
      {/* Personalized Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-4 flex items-center space-x-4">
            <img src={mockUserStats.avatar} alt="User Avatar" className="w-16 h-16 rounded-full border-2 border-blue-500"/>
            <div>
                <h3 className="font-bold text-lg">{mockUserStats.name}</h3>
                <p className="text-sm text-gray-400">Audience</p>
            </div>
        </div>
        <StatCard icon={<FaFistRaised />} title="CHZ Balance" value={mockUserStats.chzBalance.toLocaleString()} />
        <StatCard icon={<FaHistory />} title="Total Supports" value={mockUserStats.totalSupports} />
        <StatCard icon={<FaTrophy />} title="Win Rate" value={mockUserStats.winRate} />
      </div>

      {/* My Badges Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-white">{language === 'en' ? "My Badges" : "我的徽章"}</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {mockBadges.map(badge => (
            <div key={badge.name} className={`flex-shrink-0 w-40 h-40 rounded-lg p-4 flex flex-col items-center justify-center text-center transition-all duration-300 ${badge.unlocked ? 'bg-yellow-500/10 border-2 border-yellow-500' : 'bg-gray-800/50'}`}>
              <div className={`text-4xl mb-2 ${!badge.unlocked && 'opacity-30'}`}>{badge.icon}</div>
              <h4 className={`font-bold ${!badge.unlocked && 'opacity-30'}`}>{badge.name}</h4>
              <p className={`text-xs text-gray-400 mt-1 ${!badge.unlocked && 'opacity-30'}`}>{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Event Section */}
      <div className="bg-gradient-to-r from-blue-900 via-gray-800 to-red-900 rounded-lg p-6 mb-8 text-center shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2 animate-pulse">{language === 'en' ? "Featured Event" : "焦点赛事"}</h2>
        <p className="text-gray-300 mb-4">{upcomingEvents.rows[0].event}</p>
        <div className="flex justify-around items-center my-4">
            <div className="flex flex-col items-center">
                <FaBasketballBall className="text-5xl text-blue-400"/>
                <span className="font-bold mt-2 text-lg">Team A</span>
            </div>
            <span className="text-4xl font-bold text-gray-500">VS</span>
            <div className="flex flex-col items-center">
                <FaBasketballBall className="text-5xl text-red-400"/>
                <span className="font-bold mt-2 text-lg">Team B</span>
            </div>
        </div>
        <p className="text-sm text-gray-400 mb-6">{upcomingEvents.rows[0].date}</p>
        <Link href={upcomingEvents.rows[0].action.href} className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-xl">
            {language === 'en' ? "Support Now" : "立即支持"}
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-700">
            <button onClick={() => setActiveTab('events')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'events' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>
                {language === 'en' ? "Upcoming Events" : "未来赛事"}
            </button>
            <button onClick={() => setActiveTab('history')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>
                {language === 'en' ? "My Support History" : "我的支持历史"}
            </button>
            <button onClick={() => setActiveTab('leaderboard')} className={`py-2 px-4 text-sm font-medium ${activeTab === 'leaderboard' ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>
                {language === 'en' ? "Leaderboard" : "排行榜"}
            </button>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </DashboardLayout>
  );
} 