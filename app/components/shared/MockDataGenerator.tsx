// FanForce AI - 模拟数据生成器
// Mock Data Generator - 开发工具，用于生成所有角色的测试数据
// Development tool for generating test data for all roles
// 关联文件:
// - UserContext.tsx: 用户角色管理
// - 各角色仪表板: 数据填充目标

'use client'

import { useState } from 'react'
import { useUser } from '../../context/UserContext'
import { useLanguage } from '../../context/LanguageContext'

// 模拟数据接口 / Mock Data Interfaces
interface MockUser {
  id: string
  address: string
  username: string
  email: string
  profilePhoto: string
  role: string
  createdAt: string
  lastLogin: string
}

interface MockEvent {
  id: string
  title: string
  description: string
  teamA: string
  teamB: string
  startTime: string
  endTime: string
  venue: string
  minStake: number
  maxStake: number
  totalStaked: number
  participants: number
  status: 'upcoming' | 'live' | 'completed'
}

interface MockStakeRecord {
  id: string
  eventId: string
  eventTitle: string
  teamSelected: string
  amount: number
  tier: number
  timestamp: string
  status: 'active' | 'won' | 'lost' | 'pending'
  reward?: number
}

export default function MockDataGenerator() {
  const { isSuperAdmin } = useUser()
  const { language } = useLanguage()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)

  // 如果不是超级管理员，不显示组件 / Don't show component if not super admin
  if (!isSuperAdmin()) {
    return null
  }

  // 生成模拟用户数据 / Generate Mock User Data
  const generateMockUsers = (): MockUser[] => {
    const users: MockUser[] = []
    
    // 管理员用户 / Admin Users
    users.push({
      id: 'admin-001',
      address: '0x1234567890123456789012345678901234567890',
      username: 'Super Admin',
      email: 'admin@fanforce.ai',
      profilePhoto: '/images/avatars/admin.png',
      role: 'super_admin',
      createdAt: '2024-01-01T00:00:00Z',
      lastLogin: new Date().toISOString()
    })

    // 大使用户 / Ambassador Users
    for (let i = 1; i <= 5; i++) {
      users.push({
        id: `ambassador-${String(i).padStart(3, '0')}`,
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        username: `Campus Ambassador ${i}`,
        email: `ambassador${i}@university.edu`,
        profilePhoto: `/images/avatars/ambassador${i}.png`,
        role: 'ambassador',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // 运动员用户 / Athlete Users
    const athleteNames = ['张三', '李四', '王五', '赵六', '钱七', 'John', 'Mike', 'Sarah', 'Emma', 'Alex']
    for (let i = 1; i <= 20; i++) {
      users.push({
        id: `athlete-${String(i).padStart(3, '0')}`,
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        username: athleteNames[i % athleteNames.length] + ` ${i}`,
        email: `athlete${i}@university.edu`,
        profilePhoto: `/images/avatars/athlete${i}.png`,
        role: 'athlete',
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // 观众用户 / Audience Users
    for (let i = 1; i <= 100; i++) {
      users.push({
        id: `audience-${String(i).padStart(3, '0')}`,
        address: `0x${Math.random().toString(16).substring(2, 42)}`,
        username: `Student ${i}`,
        email: `student${i}@university.edu`,
        profilePhoto: `/images/avatars/student${i % 10}.png`,
        role: 'audience',
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    return users
  }

  // 生成模拟活动数据 / Generate Mock Event Data
  const generateMockEvents = (): MockEvent[] => {
    const events: MockEvent[] = []
    const sports = ['篮球', '足球', '排球', '羽毛球', '乒乓球', '网球']
    const venues = ['体育馆A', '体育馆B', '户外球场', '游泳馆', '田径场']
    const teams = ['工程学院', '商学院', '医学院', '文学院', '理学院', '艺术学院']

    // 生成30个活动 / Generate 30 events
    for (let i = 1; i <= 30; i++) {
      const sport = sports[Math.floor(Math.random() * sports.length)]
      const venue = venues[Math.floor(Math.random() * venues.length)]
      const teamA = teams[Math.floor(Math.random() * teams.length)]
      let teamB = teams[Math.floor(Math.random() * teams.length)]
      while (teamB === teamA) {
        teamB = teams[Math.floor(Math.random() * teams.length)]
      }

      const startTime = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000)
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000)
      
      let status: 'upcoming' | 'live' | 'completed' = 'upcoming'
      if (Math.random() < 0.2) status = 'live'
      if (Math.random() < 0.3) status = 'completed'

      events.push({
        id: `event-${String(i).padStart(3, '0')}`,
        title: `${sport}比赛 ${i}`,
        description: `${teamA} vs ${teamB} - ${sport}校际对抗赛`,
        teamA,
        teamB,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        venue,
        minStake: Math.floor(Math.random() * 50) + 10,
        maxStake: Math.floor(Math.random() * 500) + 200,
        totalStaked: Math.floor(Math.random() * 10000) + 1000,
        participants: Math.floor(Math.random() * 200) + 50,
        status
      })
    }

    return events
  }

  // 生成模拟质押记录 / Generate Mock Stake Records
  const generateMockStakeRecords = (events: MockEvent[]): MockStakeRecord[] => {
    const stakes: MockStakeRecord[] = []
    
    for (let i = 1; i <= 50; i++) {
      const event = events[Math.floor(Math.random() * events.length)]
      const teamSelected = Math.random() < 0.5 ? event.teamA : event.teamB
      const amount = Math.floor(Math.random() * 200) + 50
      const tier = Math.floor(Math.random() * 3) + 1
      
      let status: 'active' | 'won' | 'lost' | 'pending' = 'active'
      if (event.status === 'completed') {
        status = Math.random() < 0.6 ? 'won' : 'lost'
      }
      
      stakes.push({
        id: `stake-${String(i).padStart(3, '0')}`,
        eventId: event.id,
        eventTitle: event.title,
        teamSelected,
        amount,
        tier,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status,
        reward: status === 'won' ? amount * (1.5 + Math.random()) : undefined
      })
    }

    return stakes
  }

  // 生成所有模拟数据 / Generate All Mock Data
  const generateAllMockData = async () => {
    setIsGenerating(true)
    
    try {
      // 模拟API调用延迟 / Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const users = generateMockUsers()
      const events = generateMockEvents()
      const stakes = generateMockStakeRecords(events)
      
      const mockData = {
        users,
        events,
        stakes,
        systemStats: {
          totalUsers: users.length,
          activeUsers: Math.floor(users.length * 0.7),
          totalEvents: events.length,
          activeEvents: events.filter(e => e.status === 'upcoming' || e.status === 'live').length,
          totalRevenue: stakes.reduce((sum, stake) => sum + stake.amount, 0),
          totalStaked: events.reduce((sum, event) => sum + event.totalStaked, 0),
          platformFees: stakes.reduce((sum, stake) => sum + stake.amount * 0.05, 0),
          adminCount: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
          ambassadorCount: users.filter(u => u.role === 'ambassador').length,
          athleteCount: users.filter(u => u.role === 'athlete').length,
          audienceCount: users.filter(u => u.role === 'audience').length
        }
      }
      
      setGeneratedData(mockData)
      
      // 将数据存储到 localStorage 供仪表板使用 / Store data in localStorage for dashboard use
      localStorage.setItem('fanforce_mock_data', JSON.stringify(mockData))
      
    } catch (error) {
      console.error('Error generating mock data:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // 清除模拟数据 / Clear Mock Data
  const clearMockData = () => {
    localStorage.removeItem('fanforce_mock_data')
    setGeneratedData(null)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            {language === 'en' ? 'Mock Data' : '模拟数据'}
          </h3>
          <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-1 rounded">
            {language === 'en' ? 'DEV' : '开发'}
          </span>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={generateAllMockData}
            disabled={isGenerating}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {language === 'en' ? 'Generating...' : '生成中...'}
              </>
            ) : (
              <>
                <span className="mr-2">🎲</span>
                {language === 'en' ? 'Generate Data' : '生成数据'}
              </>
            )}
          </button>
          
          <button
            onClick={clearMockData}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
          >
            <span className="mr-2">🗑️</span>
            {language === 'en' ? 'Clear Data' : '清除数据'}
          </button>
        </div>
        
        {generatedData && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              {language === 'en' ? 'Generated:' : '已生成:'}
            </h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>👥 {generatedData.users.length} {language === 'en' ? 'Users' : '用户'}</div>
              <div>🎯 {generatedData.events.length} {language === 'en' ? 'Events' : '活动'}</div>
              <div>💰 {generatedData.stakes.length} {language === 'en' ? 'Stakes' : '质押'}</div>
              <div>📊 {language === 'en' ? 'System Stats' : '系统统计'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 