// FanForce AI - 运动员等待上场页面
// Athlete Waiting Queue Page - 运动员等待队列页面，显示等待状态和队列信息
// Waiting queue page for athletes showing queue position and wait times
// 运动员等待队列页面，显示队列位置和等待时间
// 关联文件:
// - DashboardLayout.tsx: 仪表板布局组件
// - UserContext.tsx: 用户角色验证
// - app/dashboard/athlete/page.tsx: 运动员主仪表板
// - app/api/athlete/queue/route.ts: 运动员队列API
// - lib/athlete-schema.sql: 运动员数据库架构

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import DashboardLayout from '@/app/components/shared/DashboardLayout'
import { useRouter } from 'next/navigation'
import { 
  FaClock, 
  FaSpinner, 
  FaUsers, 
  FaArrowLeft,
  FaCheckCircle,
  FaTimes,
  FaPlay,
  FaPause,
  FaRandom,
  FaChartLine,
  FaMedal
} from 'react-icons/fa'

// Mock Data for Waiting Queue / 等待队列模拟数据
const mockCurrentAthlete = {
  id: 'ath_current',
  name: 'Mike "The Machine" Johnson',
  avatar: '/placeholder.svg',
  position: 3,
  estimatedWaitTime: '15 mins',
  queuedAt: '14:23',
  status: 'waiting' // 'waiting' | 'selected' | 'cancelled'
}

const mockQueueData = {
  totalInQueue: 12,
  averageWaitTime: '22 mins',
  lastSelectionTime: '14:15',
  nextSelectionEstimate: '14:40',
  queue: [
    { id: 'ath1', name: 'Alex Thunder', avatar: '/placeholder.svg', position: 1, waitTime: '5 mins', rank: 'Gold', sport: 'Basketball' },
    { id: 'ath2', name: 'Sarah Lightning', avatar: '/placeholder.svg', position: 2, waitTime: '10 mins', rank: 'Platinum', sport: 'Soccer' },
    { id: 'ath_current', name: 'Mike "The Machine" Johnson', avatar: '/placeholder.svg', position: 3, waitTime: '15 mins', rank: 'Gold', sport: 'Basketball' },
    { id: 'ath4', name: 'David Storm', avatar: '/placeholder.svg', position: 4, waitTime: '20 mins', rank: 'Silver', sport: 'Basketball' },
    { id: 'ath5', name: 'Lisa Fire', avatar: '/placeholder.svg', position: 5, waitTime: '25 mins', rank: 'Gold', sport: 'Volleyball' },
    { id: 'ath6', name: 'Tom Wave', avatar: '/placeholder.svg', position: 6, waitTime: '30 mins', rank: 'Bronze', sport: 'Tennis' },
    { id: 'ath7', name: 'Nina Frost', avatar: '/placeholder.svg', position: 7, waitTime: '35 mins', rank: 'Silver', sport: 'Basketball' },
    { id: 'ath8', name: 'Jake Wind', avatar: '/placeholder.svg', position: 8, waitTime: '40 mins', rank: 'Gold', sport: 'Soccer' }
  ]
}

const mockRecentSelections = [
  { athleteName: 'Chris Flash', selectedBy: 'Team Alpha', selectionTime: '14:15', matchTime: '15:00' },
  { athleteName: 'Maya Speed', selectedBy: 'Team Beta', selectionTime: '14:08', matchTime: '14:45' },
  { athleteName: 'Ryan Power', selectedBy: 'Team Gamma', selectionTime: '14:02', matchTime: '14:30' }
]

export default function AthleteWaitingPage() {
  const { language } = useLanguage()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [queuePosition, setQueuePosition] = useState(mockCurrentAthlete.position)
  const [isSelected, setIsSelected] = useState(false)

  // 模拟时间更新 / Simulate time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // 模拟队列位置更新 / Simulate queue position updates
  useEffect(() => {
    const positionTimer = setInterval(() => {
      if (queuePosition > 1 && !isSelected) {
        setQueuePosition(prev => prev - 1)
      }
    }, 30000) // 每30秒更新一次位置 / Update position every 30 seconds

    return () => clearInterval(positionTimer)
  }, [queuePosition, isSelected])

  // 模拟被选中 / Simulate being selected
  const simulateSelection = () => {
    setIsSelected(true)
    setTimeout(() => {
      router.push('/dashboard/athlete/match')
    }, 3000)
  }

  // 退出队列 / Leave queue
  const leaveQueue = () => {
    router.push('/dashboard/athlete')
  }

  // 获取排名颜色 / Get rank color
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Bronze': return 'text-amber-600'
      case 'Silver': return 'text-gray-400'
      case 'Gold': return 'text-yellow-400'
      case 'Platinum': return 'text-blue-300'
      case 'Diamond': return 'text-cyan-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <DashboardLayout
      title={language === 'en' ? "Waiting Queue" : "等待队列"}
      subtitle={language === 'en' ? "Your position in the selection queue" : "您在选择队列中的位置"}
      actions={
        <button 
          onClick={() => router.back()} 
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          {language === 'en' ? 'Back' : '返回'}
        </button>
      }
    >
      {/* Success Modal for Selection / 被选中的成功模态框 */}
      {isSelected && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-400 mb-4">
              {language === 'en' ? 'Selected!' : '被选中了！'}
            </h3>
            <p className="text-gray-300 mb-6">
              {language === 'en' 
                ? 'Congratulations! You have been selected for a match. Redirecting to match details...' 
                : '恭喜！您已被选中参加比赛。正在跳转到比赛详情...'}
            </p>
            <FaSpinner className="animate-spin text-blue-400 text-2xl mx-auto" />
          </div>
        </div>
      )}

      {/* Current Position Section / 当前位置部分 */}
      <div className="bg-gradient-to-r from-blue-800 to-purple-800 rounded-lg p-8 mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          {language === 'en' ? "Your Queue Position" : "您的队列位置"}
        </h2>
        <div className="text-8xl font-bold text-yellow-400 mb-4 animate-pulse">
          #{queuePosition}
        </div>
        <p className="text-xl text-gray-200 mb-6">
          {language === 'en' 
            ? `Estimated wait time: ${mockCurrentAthlete.estimatedWaitTime}` 
            : `预计等待时间：${mockCurrentAthlete.estimatedWaitTime}`}
        </p>
        <div className="flex justify-center space-x-6 text-gray-300">
          <div className="text-center">
            <FaClock className="text-2xl mb-2 mx-auto" />
            <div className="text-sm">{language === 'en' ? 'Queued at' : '入队时间'}</div>
            <div className="font-bold">{mockCurrentAthlete.queuedAt}</div>
          </div>
          <div className="text-center">
            <FaUsers className="text-2xl mb-2 mx-auto" />
            <div className="text-sm">{language === 'en' ? 'Total in queue' : '队列总数'}</div>
            <div className="font-bold">{mockQueueData.totalInQueue}</div>
          </div>
          <div className="text-center">
            <FaRandom className="text-2xl mb-2 mx-auto" />
            <div className="text-sm">{language === 'en' ? 'Next selection' : '下次选择'}</div>
            <div className="font-bold">{mockQueueData.nextSelectionEstimate}</div>
          </div>
        </div>
      </div>

      {/* Queue Management Actions / 队列管理操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button 
          onClick={simulateSelection}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <FaCheckCircle className="mr-2" />
          {language === 'en' ? 'Simulate Selection' : '模拟被选中'}
        </button>
        <button 
          onClick={leaveQueue}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <FaTimes className="mr-2" />
          {language === 'en' ? 'Leave Queue' : '离开队列'}
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <FaSpinner className="mr-2" />
          {language === 'en' ? 'Refresh Status' : '刷新状态'}
        </button>
      </div>

      {/* Queue Overview / 队列概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Queue / 当前队列 */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-400" />
            {language === 'en' ? "Current Queue" : "当前队列"}
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockQueueData.queue.map((athlete) => (
              <div 
                key={athlete.id} 
                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                  athlete.id === mockCurrentAthlete.id 
                    ? 'bg-blue-600/30 border-2 border-blue-500' 
                    : 'bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl font-bold text-yellow-400">#{athlete.position}</div>
                  <img src={athlete.avatar} alt={athlete.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-semibold text-white">{athlete.name}</div>
                    <div className="text-sm text-gray-400">{athlete.sport}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getRankColor(athlete.rank)}`}>{athlete.rank}</div>
                  <div className="text-sm text-gray-400">{athlete.waitTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Selections / 最近选择 */}
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaCheckCircle className="mr-2 text-green-400" />
            {language === 'en' ? "Recent Selections" : "最近选择"}
          </h3>
          <div className="space-y-4">
            {mockRecentSelections.map((selection, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-white">{selection.athleteName}</div>
                  <div className="text-sm text-green-400">{selection.selectionTime}</div>
                </div>
                <div className="text-sm text-gray-400">
                  {language === 'en' ? 'Selected by' : '被选择于'} <span className="text-blue-400">{selection.selectedBy}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {language === 'en' ? 'Match at' : '比赛时间'} <span className="text-yellow-400">{selection.matchTime}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Queue Statistics / 队列统计 */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <h4 className="font-bold text-white mb-3">{language === 'en' ? "Queue Statistics" : "队列统计"}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-blue-400 font-bold">{mockQueueData.averageWaitTime}</div>
                <div className="text-gray-400">{language === 'en' ? 'Avg Wait' : '平均等待'}</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">{mockQueueData.lastSelectionTime}</div>
                <div className="text-gray-400">{language === 'en' ? 'Last Selection' : '上次选择'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section / 提示部分 */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-bold text-yellow-400 mb-3">
          {language === 'en' ? "💡 Queue Tips" : "💡 队列提示"}
        </h3>
        <ul className="text-gray-300 space-y-2 text-sm">
          <li>• {language === 'en' 
            ? "Your position updates automatically as athletes ahead of you get selected" 
            : "当您前面的运动员被选中时，您的位置会自动更新"}</li>
          <li>• {language === 'en' 
            ? "Ambassadors can see your profile and statistics when making selections" 
            : "大使在做选择时可以看到您的档案和统计数据"}</li>
          <li>• {language === 'en' 
            ? "Higher-ranked athletes may have priority in team selections" 
            : "段位更高的运动员在队伍选择中可能有优先权"}</li>
          <li>• {language === 'en' 
            ? "You can leave the queue anytime and return to resting status" 
            : "您可以随时离开队列并返回休赛状态"}</li>
        </ul>
      </div>
    </DashboardLayout>
  )
} 