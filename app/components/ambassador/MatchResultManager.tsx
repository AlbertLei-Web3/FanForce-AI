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
  FaChevronRight,
  FaSave,
  FaEdit,
  FaEye,
  FaAward,
  FaCalculator
} from 'react-icons/fa'

// Interface definitions / 接口定义
interface PendingEvent {
  event_id: string
  event_title: string
  sport_type: string
  event_date: string
  event_time: string
  venue_name: string
  status: string
  team_a_name: string
  team_b_name: string
  pool_amount: number
  total_stakes: number
}

interface MatchResult {
  id: string
  event_id: string
  team_a_score: number
  team_b_score: number
  winning_team: 'A' | 'B' | 'tie'
  match_duration?: number
  result_notes?: string
  status: 'draft' | 'confirmed' | 'published'
  rewards_calculated: boolean
  rewards_distributed: boolean
  event_title: string
  team_a_name: string
  team_b_name: string
  total_stakes: number
  total_rewards_distributed: number
}

interface MatchResultManagerProps {
  ambassadorId: string
}

export default function MatchResultManager({ ambassadorId }: MatchResultManagerProps) {
  const { language } = useLanguage()
  
  // State management / 状态管理
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([])
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [selectedEvent, setSelectedEvent] = useState<PendingEvent | null>(null)
  const [formData, setFormData] = useState({
    team_a_score: 0,
    team_b_score: 0,
    match_duration: 90,
    result_notes: '',
    auto_publish: false
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load pending events and existing results / 加载待处理赛事和现有结果
  useEffect(() => {
    loadMatchData()
  }, [ambassadorId])

  const loadMatchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/match-results?ambassador_id=${ambassadorId}`)
      const data = await response.json()
      
      if (data.success) {
        setPendingEvents(data.pending_events || [])
        setMatchResults(data.match_results || [])
      } else {
        setError(data.error || 'Failed to load match data')
      }
    } catch (error) {
      console.error('Error loading match data:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle result submission / 处理结果提交
  const handleResultSubmission = async () => {
    if (!selectedEvent) {
      setError(language === 'en' ? 'Please select an event' : '请选择赛事')
      return
    }

    if (formData.team_a_score < 0 || formData.team_b_score < 0) {
      setError(language === 'en' ? 'Scores must be non-negative' : '比分必须为非负数')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/match-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: selectedEvent.event_id,
          team_a_score: formData.team_a_score,
          team_b_score: formData.team_b_score,
          match_duration: formData.match_duration,
          result_notes: formData.result_notes,
          recorded_by: ambassadorId,
          auto_publish: formData.auto_publish
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(
          formData.auto_publish 
            ? (language === 'en' ? 'Match result published and rewards distributed!' : '比赛结果已发布，奖励已分发！')
            : (language === 'en' ? 'Match result saved as draft' : '比赛结果已保存为草稿')
        )
        
        // Reset form
        setSelectedEvent(null)
        setFormData({
          team_a_score: 0,
          team_b_score: 0,
          match_duration: 90,
          result_notes: '',
          auto_publish: false
        })
        
        // Reload data
        await loadMatchData()
      } else {
        setError(data.error || 'Failed to submit result')
      }
    } catch (error) {
      console.error('Error submitting result:', error)
      setError('Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle result publication / 处理结果发布
  const handleResultPublication = async (resultId: string) => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/match-results', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          result_id: resultId,
          action: 'publish'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(language === 'en' ? 'Match result published and rewards distributed!' : '比赛结果发布成功，奖励分发完成！')
        await loadMatchData()
      } else {
        setError(data.error || 'Failed to publish result')
      }
    } catch (error) {
      console.error('Error publishing result:', error)
      setError('Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // Get winning team display / 获取获胜队伍显示
  const getWinningTeamDisplay = (teamAScore: number, teamBScore: number, teamAName: string, teamBName: string) => {
    if (teamAScore > teamBScore) {
      return { team: teamAName, color: 'text-blue-400' }
    } else if (teamBScore > teamAScore) {
      return { team: teamBName, color: 'text-red-400' }
    } else {
      return { team: language === 'en' ? 'Tie' : '平局', color: 'text-slate-400' }
    }
  }

  // Get status color / 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'draft':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  // Render pending event card / 渲染待处理赛事卡片
  const renderPendingEventCard = (event: PendingEvent) => (
    <div 
      key={event.event_id}
      onClick={() => setSelectedEvent(event)}
      className={`cursor-pointer transition-all duration-300 rounded-xl p-6 border ${
        selectedEvent?.event_id === event.event_id
          ? 'bg-blue-500/20 border-blue-500/50'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-2">
            {event.event_title}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
            <FaTrophy className="text-yellow-400" />
            <span>{event.sport_type}</span>
            <span>•</span>
            <FaCalendar className="text-emerald-400" />
            <span>{event.event_date}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
          event.status === 'live' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
          'bg-amber-500/20 text-amber-400 border-amber-500/30'
        }`}>
          {event.status.toUpperCase()}
        </div>
      </div>

      {/* Teams / 队伍 */}
      <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-blue-400">{event.team_a_name}</div>
          </div>
          <div className="px-4">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              VS
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="text-lg font-bold text-red-400">{event.team_b_name}</div>
          </div>
        </div>
      </div>

      {/* Event Stats / 赛事统计 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <FaCoins className="text-yellow-400" />
          <div>
            <div className="text-slate-400">Prize Pool</div>
            <div className="font-bold text-yellow-400">{event.pool_amount.toFixed(0)} CHZ</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <FaUsers className="text-purple-400" />
          <div>
            <div className="text-slate-400">Stakes</div>
            <div className="font-bold text-purple-400">{event.total_stakes}</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render result card / 渲染结果卡片
  const renderResultCard = (result: MatchResult) => {
    const winnerInfo = getWinningTeamDisplay(result.team_a_score, result.team_b_score, result.team_a_name, result.team_b_name)
    
    return (
      <div key={result.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">
              {result.event_title}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(result.status)}`}>
                {result.status.toUpperCase()}
              </span>
              {result.rewards_distributed && (
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                  {language === 'en' ? 'REWARDS PAID' : '奖励已发放'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score Display / 比分显示 */}
        <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-blue-400">{result.team_a_name}</div>
              <div className="text-3xl font-bold text-white mt-2">{result.team_a_score}</div>
            </div>
            
            <div className="px-4">
              <div className="text-2xl font-bold text-slate-400">-</div>
            </div>
            
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-red-400">{result.team_b_name}</div>
              <div className="text-3xl font-bold text-white mt-2">{result.team_b_score}</div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <div className="text-sm text-slate-400">{language === 'en' ? 'Winner:' : '获胜者：'}</div>
            <div className={`text-lg font-bold ${winnerInfo.color}`}>
              {winnerInfo.team}
            </div>
          </div>
        </div>

        {/* Result Stats / 结果统计 */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center space-x-2">
            <FaUsers className="text-purple-400" />
            <div>
              <div className="text-slate-400">Total Stakes</div>
              <div className="font-bold text-purple-400">{result.total_stakes}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaCoins className="text-yellow-400" />
            <div>
              <div className="text-slate-400">Rewards Paid</div>
              <div className="font-bold text-yellow-400">{result.total_rewards_distributed.toFixed(0)} CHZ</div>
            </div>
          </div>
        </div>

        {/* Actions / 操作 */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <FaEye />
            <span>{language === 'en' ? 'View Details' : '查看详情'}</span>
          </button>
          
          {result.status === 'draft' && (
            <button 
              onClick={() => handleResultPublication(result.id)}
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaBullhorn />}
              <span>{language === 'en' ? 'Publish & Pay' : '发布并支付'}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center space-x-3">
          <FaSpinner className="text-blue-400 text-xl animate-spin" />
          <span className="text-white">
            {language === 'en' ? 'Loading match data...' : '加载比赛数据...'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Error/Success Messages / 错误/成功消息 */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3 text-red-400">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-3 text-emerald-400">
            <FaCheckCircle />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Events Awaiting Results / 等待结果的赛事 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <FaClock className="text-amber-400" />
          <span>{language === 'en' ? 'Events Awaiting Results' : '等待结果的赛事'}</span>
        </h3>
        
        {pendingEvents.length === 0 ? (
          <div className="text-center py-8">
            <FaTrophy className="mx-auto text-4xl text-slate-500 mb-4" />
            <p className="text-slate-400">
              {language === 'en' ? 'No events awaiting results' : '暂无等待结果的赛事'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingEvents.map(renderPendingEventCard)}
          </div>
        )}
      </div>

      {/* Score Input Form / 比分录入表单 */}
      {selectedEvent && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <FaEdit className="text-blue-400" />
            <span>{language === 'en' ? 'Enter Match Result' : '录入比赛结果'}</span>
          </h3>
          
          <div className="space-y-6">
            {/* Selected Event Info / 选中赛事信息 */}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
              <h4 className="font-bold text-white mb-2">{selectedEvent.event_title}</h4>
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-medium">{selectedEvent.team_a_name}</span>
                <span className="text-slate-400">VS</span>
                <span className="text-red-400 font-medium">{selectedEvent.team_b_name}</span>
              </div>
            </div>

            {/* Score Inputs / 比分输入 */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {selectedEvent.team_a_name} {language === 'en' ? 'Score' : '得分'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.team_a_score}
                  onChange={(e) => setFormData({...formData, team_a_score: Number(e.target.value)})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-2xl font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {selectedEvent.team_b_name} {language === 'en' ? 'Score' : '得分'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.team_b_score}
                  onChange={(e) => setFormData({...formData, team_b_score: Number(e.target.value)})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-center text-2xl font-bold focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Additional Details / 附加详情 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  {language === 'en' ? 'Match Duration (minutes)' : '比赛时长（分钟）'}
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.match_duration}
                  onChange={(e) => setFormData({...formData, match_duration: Number(e.target.value)})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {language === 'en' ? 'Result Notes (Optional)' : '结果备注（可选）'}
              </label>
              <textarea
                value={formData.result_notes}
                onChange={(e) => setFormData({...formData, result_notes: e.target.value})}
                placeholder={language === 'en' ? 'Add any additional notes about the match...' : '添加关于比赛的任何额外备注...'}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none h-24 resize-none"
              />
            </div>

            {/* Auto-publish option / 自动发布选项 */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="auto-publish"
                checked={formData.auto_publish}
                onChange={(e) => setFormData({...formData, auto_publish: e.target.checked})}
                className="w-4 h-4 text-emerald-600 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="auto-publish" className="text-slate-300 text-sm">
                {language === 'en' 
                  ? 'Automatically publish result and distribute rewards' 
                  : '自动发布结果并分发奖励'}
              </label>
            </div>

            {/* Submit Button / 提交按钮 */}
            <button
              onClick={handleResultSubmission}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>{language === 'en' ? 'Processing...' : '处理中...'}</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>{language === 'en' ? 'Submit Result' : '提交结果'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Results / 近期结果 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <FaAward className="text-emerald-400" />
          <span>{language === 'en' ? 'Recent Results' : '近期结果'}</span>
        </h3>
        
        {matchResults.length === 0 ? (
          <div className="text-center py-8">
            <FaAward className="mx-auto text-4xl text-slate-500 mb-4" />
            <p className="text-slate-400">
              {language === 'en' ? 'No match results yet' : '暂无比赛结果'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matchResults.map(renderResultCard)}
          </div>
        )}
      </div>
    </div>
  )
} 