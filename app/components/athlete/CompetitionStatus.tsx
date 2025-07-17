'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { 
  FaTrophy, 
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCoins,
  FaFlag,
  FaPlay,
  FaBullhorn,
  FaChevronRight
} from 'react-icons/fa'

// Interface definitions / 接口定义
interface UpcomingMatch {
  event_id: string
  event_title: string
  sport_type: string
  event_date: string
  event_time: string
  venue_name: string
  venue_capacity: number
  estimated_duration: number
  event_status: string
  team_a_name: string
  team_b_name: string
  athlete_team: 'A' | 'B'
  pool_amount: number
  fee_percentage: number
  ambassador_profile: any
}

interface AthleteStatus {
  status: string
  availability_status: string
  upcoming_matches_count: number
  next_match_date: string | null
  selected_for_events: number
}

interface CompetitionStatusProps {
  athleteId: string
}

export default function CompetitionStatus({ athleteId }: CompetitionStatusProps) {
  const { language } = useLanguage()
  
  // State management / 状态管理
  const [loading, setLoading] = useState(true)
  const [athleteStatus, setAthleteStatus] = useState<AthleteStatus | null>(null)
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load athlete status and upcoming matches / 加载运动员状态和即将到来的比赛
  useEffect(() => {
    loadAthleteData()
  }, [athleteId])

  const loadAthleteData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/athlete/upcoming-matches?athlete_id=${athleteId}`)
      const data = await response.json()
      
      if (data.success) {
        setAthleteStatus(data.athlete_status)
        setUpcomingMatches(data.upcoming_matches || [])
      } else {
        setError(data.error || 'Failed to load athlete data')
      }
    } catch (error) {
      console.error('Error loading athlete data:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Get status color / 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'competing':
      case 'selected':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'resting':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'unavailable':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  // Format date and time / 格式化日期和时间
  const formatDateTime = (date: string, time: string) => {
    const matchDate = new Date(`${date}T${time}`)
    const now = new Date()
    const diffMs = matchDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return language === 'en' ? 'Today' : '今天'
    } else if (diffDays === 1) {
      return language === 'en' ? 'Tomorrow' : '明天'
    } else if (diffDays > 1) {
      return language === 'en' ? `In ${diffDays} days` : `${diffDays}天后`
    } else {
      return language === 'en' ? 'Past' : '已过期'
    }
  }

  // Render match card / 渲染比赛卡片
  const renderMatchCard = (match: UpcomingMatch) => (
    <div key={match.event_id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all duration-300">
      {/* Match Header / 比赛标题 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {match.event_title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <FaTrophy className="text-yellow-400" />
            <span>{match.sport_type}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(match.event_status)}`}>
              {match.event_status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400 mb-1">
            {language === 'en' ? 'Your Team' : '你的队伍'}
          </div>
          <div className="text-lg font-bold text-blue-400">
            {match.athlete_team === 'A' ? match.team_a_name : match.team_b_name}
          </div>
        </div>
      </div>

      {/* Teams Display / 队伍显示 */}
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className={`text-center flex-1 ${match.athlete_team === 'A' ? 'text-blue-400 font-bold' : 'text-slate-300'}`}>
            <div className="text-lg">{match.team_a_name}</div>
            {match.athlete_team === 'A' && (
              <div className="text-xs text-blue-300 mt-1">
                {language === 'en' ? 'YOUR TEAM' : '你的队伍'}
              </div>
            )}
          </div>
          
          <div className="px-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              VS
            </div>
          </div>
          
          <div className={`text-center flex-1 ${match.athlete_team === 'B' ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
            <div className="text-lg">{match.team_b_name}</div>
            {match.athlete_team === 'B' && (
              <div className="text-xs text-red-300 mt-1">
                {language === 'en' ? 'YOUR TEAM' : '你的队伍'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Match Details / 比赛详情 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <FaCalendar className="text-emerald-400" />
          <div>
            <div className="text-slate-400">{match.event_date}</div>
            <div className="font-medium text-emerald-400">
              {formatDateTime(match.event_date, match.event_time)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <FaClock className="text-blue-400" />
          <div>
            <div className="text-slate-400">{match.event_time}</div>
            <div className="font-medium text-blue-400">
              {match.estimated_duration}min
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <FaMapMarkerAlt className="text-purple-400" />
          <div>
            <div className="text-slate-400">{language === 'en' ? 'Venue' : '场地'}</div>
            <div className="font-medium text-purple-400">
              {match.venue_name}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <FaCoins className="text-yellow-400" />
          <div>
            <div className="text-slate-400">{language === 'en' ? 'Prize Pool' : '奖池'}</div>
            <div className="font-medium text-yellow-400">
              {match.pool_amount.toFixed(0)} CHZ
            </div>
          </div>
        </div>
      </div>

      {/* Ambassador Info / 大使信息 */}
      {match.ambassador_profile && (
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <FaBullhorn className="text-amber-400" />
            <span className="text-slate-400">{language === 'en' ? 'Organized by:' : '组织者：'}</span>
            <span className="text-amber-400 font-medium">
              {match.ambassador_profile.name || 'Ambassador'}
            </span>
          </div>
        </div>
      )}

      {/* Action Button / 操作按钮 */}
      <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2">
        <FaInfoCircle />
        <span>{language === 'en' ? 'View Match Details' : '查看比赛详情'}</span>
        <FaChevronRight className="text-sm" />
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center space-x-3">
          <FaSpinner className="text-blue-400 text-xl animate-spin" />
          <span className="text-white">
            {language === 'en' ? 'Loading competition status...' : '加载比赛状态...'}
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <div className="flex items-center space-x-3 text-red-400">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!athleteStatus) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="text-center text-slate-400">
          {language === 'en' ? 'No athlete data available' : '无运动员数据'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Overview / 状态概览 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <FaFlag className="text-emerald-400" />
          <span>{language === 'en' ? 'Competition Status' : '比赛状态'}</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(athleteStatus.status)}`}>
              {athleteStatus.status.toUpperCase()}
            </div>
            <div className="text-slate-400 text-sm mt-2">
              {language === 'en' ? 'Current Status' : '当前状态'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {athleteStatus.upcoming_matches_count}
            </div>
            <div className="text-slate-400 text-sm">
              {language === 'en' ? 'Upcoming Matches' : '即将到来的比赛'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {athleteStatus.selected_for_events}
            </div>
            <div className="text-slate-400 text-sm">
              {language === 'en' ? 'Selected Events' : '已选择赛事'}
            </div>
          </div>
        </div>
        
        {athleteStatus.next_match_date && (
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-400">
              <FaPlay />
              <span className="font-medium">
                {language === 'en' ? 'Next Match:' : '下一场比赛：'}
              </span>
              <span>{formatDateTime(athleteStatus.next_match_date, '00:00')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Matches / 即将到来的比赛 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FaTrophy className="text-yellow-400" />
            <span>{language === 'en' ? 'Upcoming Matches' : '即将到来的比赛'}</span>
          </h3>
          {upcomingMatches.length > 0 && (
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
              {upcomingMatches.length} {language === 'en' ? 'matches' : '场比赛'}
            </span>
          )}
        </div>
        
        {upcomingMatches.length === 0 ? (
          <div className="text-center py-12">
            <FaTrophy className="mx-auto text-4xl text-slate-500 mb-4" />
            <p className="text-lg text-slate-400 mb-2">
              {language === 'en' ? 'No upcoming matches' : '没有即将到来的比赛'}
            </p>
            <p className="text-sm text-slate-500">
              {language === 'en' 
                ? 'You will be notified when selected for competitions' 
                : '当被选中参加比赛时您会收到通知'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingMatches.map(renderMatchCard)}
          </div>
        )}
      </div>
    </div>
  )
} 