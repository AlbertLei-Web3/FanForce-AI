// A page to display all athletes of a specific team.
// 一个用于显示特定队伍所有运动员的页面。
'use client'

import { useRouter } from 'next/navigation'
import { useLanguage } from '../../../../context/LanguageContext'
import DashboardLayout from '../../../../components/shared/DashboardLayout'
import AthleteCard from '../../../../components/shared/AthleteCard'

// Mock Data - In a real app, this would be fetched from a database
// 模拟数据 - 在真实应用中，这些数据会从数据库获取
const allTeamsData = {
  teamA: {
    name: 'Team A: The Notorious',
    athletes: [
      { id: 'ath1', name: 'Athlete 1', imageUrl: '/placeholder.svg', height: `6'2"`, weight: '180 lbs', wins: 10, losses: 2 },
      { id: 'ath2', name: 'Athlete 2', imageUrl: '/placeholder.svg', height: `5'11"`, weight: '165 lbs', wins: 8, losses: 4 },
      { id: 'ath3', name: 'Athlete 3', imageUrl: '/placeholder.svg', height: `6'5"`, weight: '200 lbs', wins: 12, losses: 0 },
      { id: 'ath4', name: 'Athlete 4', imageUrl: '/placeholder.svg', height: `6'0"`, weight: '175 lbs', wins: 9, losses: 3 },
      { id: 'ath5', name: 'Athlete 5', imageUrl: '/placeholder.svg', height: `6'1"`, weight: '185 lbs', wins: 11, losses: 1 },
      { id: 'ath6', name: 'Athlete 6', imageUrl: '/placeholder.svg', height: `6'3"`, weight: '190 lbs', wins: 10, losses: 2 },
    ]
  },
  teamB: {
    name: 'Team B: Iron',
    athletes: [
      { id: 'ath7', name: 'Athlete 7', imageUrl: '/placeholder.svg', height: `6'3"`, weight: '185 lbs', wins: 11, losses: 1 },
      { id: 'ath8', name: 'Athlete 8', imageUrl: '/placeholder.svg', height: `6'0"`, weight: '170 lbs', wins: 7, losses: 5 },
      { id: 'ath9', name: 'Athlete 9', imageUrl: '/placeholder.svg', height: `6'4"`, weight: '195 lbs', wins: 10, losses: 2 },
      { id: 'ath10', name: 'Athlete 10', imageUrl: '/placeholder.svg', height: `5'10"`, weight: '160 lbs', wins: 6, losses: 6 },
      { id: 'ath11', name: 'Athlete 11', imageUrl: '/placeholder.svg', height: `6'2"`, weight: '180 lbs', wins: 9, losses: 3 },
      { id: 'ath12', name: 'Athlete 12', imageUrl: '/placeholder.svg', height: `6'6"`, weight: '210 lbs', wins: 13, losses: 0 },
    ]
  }
};

interface PageProps {
  params: { teamId: string }
}

export default function TeamDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const { teamId } = params;
  
  const team = allTeamsData[teamId as keyof typeof allTeamsData];

  if (!team) {
    return (
      <DashboardLayout title="Team Not Found" subtitle="Please check the URL.">
        <div className="text-center">
            <p>{language === 'en' ? 'The requested team could not be found.' : '未找到请求的队伍。'}</p>
            <button onClick={() => router.back()} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                {language === 'en' ? 'Back' : '返回'}
            </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={team.name}
      subtitle={language === 'en' ? `Full Athlete Roster` : '全体运动员名单'}
      actions={
        <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
          {language === 'en' ? 'Back' : '返回'}
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {team.athletes.map(athlete => (
          <AthleteCard key={athlete.id} athlete={athlete} />
        ))}
      </div>
    </DashboardLayout>
  )
} 