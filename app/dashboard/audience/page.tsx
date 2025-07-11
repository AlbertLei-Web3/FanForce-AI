// FanForce AI - Audience Dashboard Static Page / 观众仪表板静态页面
// This file renders a purely static (mock-data) view for the audience role so that we can finalise UI/UX before wiring APIs.
// 该文件提供观众角色的纯静态（假数据）视图，让我们在接入 API 之前先确定 UI/UX。

'use client'

import DashboardLayout from '../../components/shared/DashboardLayout'
import StatCard from '../../components/shared/StatCard'
import DataTable from '../../components/shared/DataTable'
import TimelineItem from '../../components/shared/TimelineItem'
import { useLanguage } from '../../context/LanguageContext'
import Link from 'next/link'

export default function AudienceDashboardStatic () {
  // 国际化 / Internationalisation
  const { language } = useLanguage()

  /* ----------------- 📝 Mock Data / 假数据 ----------------- */
  const stats = [
    { id: 1, titleEn: 'Total CHZ Staked', titleCn: '已质押CHZ', value: '1200', icon: '💎' },
    { id: 2, titleEn: 'Events Joined', titleCn: '参与活动', value: '3', icon: '🎯' },
    { id: 3, titleEn: 'Points Earned', titleCn: '累计积分', value: '450', icon: '🏆' }
  ]

  const upcomingEvents = [
    { id: 'evt1', name: 'Campus Basketball Final', teams: 'Team A vs Team B', date: '2025-08-01 14:00', minStake: '5 CHZ', status: 'upcoming' },
    { id: 'evt2', name: 'Football Derby', teams: 'Team C vs Team D', date: '2025-08-05 16:00', minStake: '3 CHZ', status: 'upcoming' }
  ]

  const timeline = [
    { id: 'log1', icon: '✅', textEn: 'Staked 10 CHZ on Team A', textCn: '已向A队质押10 CHZ', time: '2 hrs ago' },
    { id: 'log2', icon: '🎁', textEn: 'Received 15 CHZ reward', textCn: '获得15 CHZ奖励', time: 'Yesterday' },
    { id: 'log3', icon: '📱', textEn: 'Scanned QR for Football Derby', textCn: '扫码参加足球德比', time: '2 days ago' }
  ]
  /* -------------------------------------------------------- */

  /* ---------- Column definition for DataTable / 表格列定义 ---------- */
  const columns = [
    { key: 'name', headerEn: 'Event', headerCn: '活动' },
    { key: 'teams', headerEn: 'Teams', headerCn: '对战队伍' },
    { key: 'date', headerEn: 'Start Time', headerCn: '开始时间' },
    { key: 'minStake', headerEn: 'Min Stake', headerCn: '最低质押' },
    { key: 'action', headerEn: 'Support', headerCn: '支持' }
  ]

  /* Map upcomingEvents to rows expected by DataTable */
  const rows = upcomingEvents.map(evt => ({
    ...evt,
    action: (
      <Link
        key={evt.id}
        href={`/dashboard/audience/events/${evt.id}`}
        className="inline-block px-3 py-1 text-sm font-semibold text-white bg-fanforce-primary hover:bg-fanforce-secondary rounded-lg shadow transition transform hover:-translate-y-0.5 hover:shadow-lg animate-pulse"
      >
        {language === 'en' ? 'Support' : '支持'}
      </Link>
    )
  }))

  return (
    <DashboardLayout
      title={language === 'en' ? 'Audience Hub' : '观众中心'}
      subtitle={language === 'en' ? 'Events, Staking & Rewards' : '活动、质押与奖励'}
    >
      {/* ----- Hero Stat Cards / 统计卡片 ----- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map(card => (
          <StatCard
            key={card.id}
            title={language === 'en' ? card.titleEn : card.titleCn}
            value={card.value}
            icon={card.icon}
          />
        ))}
      </div>

      {/* ----- Upcoming Events Table / 即将到来的活动表格 ----- */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4">
          {language === 'en' ? 'Upcoming Events' : '即将到来的活动'}
        </h2>
        <DataTable columns={columns} rows={rows} />
      </div>

      {/* ----- Participation Timeline / 参与时间线 ----- */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4">
          {language === 'en' ? 'Recent Activity' : '最近活动'}
        </h2>
        <div className="space-y-4">
          {timeline.map(item => (
            <TimelineItem
              key={item.id}
              icon={item.icon}
              text={language === 'en' ? item.textEn : item.textCn}
              time={item.time}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
} 