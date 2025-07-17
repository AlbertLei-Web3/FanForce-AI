'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { 
  FaCoins, 
  FaBasketballBall,
  FaGift,
  FaTrophy,
  FaUsers,
  FaCheckCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaQrcode,
  FaHeart,
  FaChevronRight,
  FaArrowRight,
  FaStar,
  FaHandshake
} from 'react-icons/fa'

// Interface definitions / 接口定义
interface AvailableEvent {
  event_id: string
  event_title: string
  sport_type: string
  event_date: string
  event_time: string
  venue_name: string
  venue_capacity: number
  event_status: string
  team_a_name: string
  team_b_name: string
  pool_amount: number
  fee_percentage: number
  tier1_count: number
  tier2_count: number
  tier3_count: number
  user_already_staked: boolean
}

interface StakeData {
  event_id: string
  tier_level: 1 | 2 | 3
  stake_amount: number
  selected_team: 'A' | 'B'
  team_name: string
}

interface TierSupportSystemProps {
  audienceId: string
}

// Tier configuration / 层级配置
const tierConfig = [
  {
    tier: 3,
    name: 'Stake Only',
    nameCn: '仅质押',
    description: 'Support your team remotely and earn rewards',
    descriptionCn: '远程支持您的队伍并获得奖励',
    multiplier: '30%',
    icon: <FaCoins className="text-3xl" />,
    color: 'from-gray-600 to-gray-800',
    borderColor: 'border-gray-500/30',
    features: [
      { en: 'Remote participation', cn: '远程参与', icon: FaCoins },
      { en: 'Basic rewards', cn: '基础奖励', icon: FaStar },
      { en: 'Real CHZ staking', cn: '真实CHZ质押', icon: FaHandshake }
    ],
    requirements: { en: 'CHZ stake only', cn: '仅需CHZ质押' }
  },
  {
    tier: 2,
    name: 'Stake + Match',
    nameCn: '质押+比赛',
    description: 'Attend the match and boost your rewards',
    descriptionCn: '参加比赛并提升您的奖励',
    multiplier: '70%',
    icon: <FaBasketballBall className="text-3xl" />,
    color: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-500/30',
    features: [
      { en: 'Match attendance', cn: '比赛出席', icon: FaBasketballBall },
      { en: 'JWT QR check-in', cn: 'JWT二维码签到', icon: FaQrcode },
      { en: 'Enhanced rewards', cn: '增强奖励', icon: FaTrophy }
    ],
    requirements: { en: 'CHZ stake + QR check-in', cn: 'CHZ质押 + 二维码签到' }
  },
  {
    tier: 1,
    name: 'Full Experience',
    nameCn: '完整体验',
    description: 'Maximum rewards with exclusive party access',
    descriptionCn: '最高奖励和独家聚会权限',
    multiplier: '100% + Bonus',
    icon: <FaGift className="text-3xl" />,
    color: 'from-yellow-500 to-orange-600',
    borderColor: 'border-yellow-500/30',
    features: [
      { en: 'Match + Party access', cn: '比赛+聚会权限', icon: FaHeart },
      { en: 'Guaranteed party entry', cn: '保证聚会入场', icon: FaCheckCircle },
      { en: 'Maximum rewards', cn: '最高奖励', icon: FaGift }
    ],
    requirements: { en: 'CHZ stake + QR check-in + Party application', cn: 'CHZ质押 + 二维码签到 + 聚会申请' }
  }
]

export default function TierSupportSystem({ audienceId }: TierSupportSystemProps) {
  const { language } = useLanguage()
  
  // State management / 状态管理
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [availableEvents, setAvailableEvents] = useState<AvailableEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AvailableEvent | null>(null)
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B' | null>(null)
  const [stakeAmount, setStakeAmount] = useState<number>(50)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load available events and user balance / 加载可用赛事和用户余额
  useEffect(() => {
    loadStakeData()
  }, [audienceId])

  const loadStakeData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/audience/stakes?audience_id=${audienceId}`)
      const data = await response.json()
      
      if (data.success) {
        setUserBalance(data.user_balance || 0)
        setAvailableEvents(data.available_events || [])
      } else {
        setError(data.error || 'Failed to load stake data')
      }
    } catch (error) {
      console.error('Error loading stake data:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle stake submission / 处理质押提交
  const handleStakeSubmission = async () => {
    if (!selectedEvent || !selectedTier || !selectedTeam || stakeAmount <= 0) {
      setError(language === 'en' ? 'Please complete all selections' : '请完成所有选择')
      return
    }

    if (stakeAmount > userBalance) {
      setError(language === 'en' ? 'Insufficient CHZ balance' : 'CHZ余额不足')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const stakeData: StakeData = {
        event_id: selectedEvent.event_id,
        tier_level: selectedTier,
        stake_amount: stakeAmount,
        selected_team: selectedTeam,
        team_name: selectedTeam === 'A' ? selectedEvent.team_a_name : selectedEvent.team_b_name
      }

      const response = await fetch('/api/audience/stakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...stakeData,
          audience_id: audienceId
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess(language === 'en' ? 'Stake created successfully!' : '质押创建成功！')
        setUserBalance(data.new_balance)
        // Reset form
        setSelectedEvent(null)
        setSelectedTier(null)
        setSelectedTeam(null)
        setStakeAmount(50)
        // Reload available events
        await loadStakeData()
      } else {
        setError(data.error || 'Failed to create stake')
      }
    } catch (error) {
      console.error('Error creating stake:', error)
      setError('Network error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate estimated reward / 计算预估奖励
  const calculateEstimatedReward = () => {
    if (!selectedEvent || !selectedTier) return 0
    
    const tierMultiplier = selectedTier === 1 ? 1.0 : selectedTier === 2 ? 0.7 : 0.3
    const totalParticipants = selectedEvent.tier1_count + selectedEvent.tier2_count + selectedEvent.tier3_count + 1
    const baseReward = (selectedEvent.pool_amount / totalParticipants) * tierMultiplier
    const finalReward = baseReward - (baseReward * (selectedEvent.fee_percentage / 100))
    
    return Math.max(finalReward, 0)
  }

  // Render event card / 渲染赛事卡片
  const renderEventCard = (event: AvailableEvent) => (
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
        {event.user_already_staked && (
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
            {language === 'en' ? 'STAKED' : '已质押'}
          </div>
        )}
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
            <div className="text-slate-400">Participants</div>
            <div className="font-bold text-purple-400">
              {event.tier1_count + event.tier2_count + event.tier3_count}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render tier selection / 渲染层级选择
  const renderTierSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tierConfig.map((tier) => (
        <div
          key={tier.tier}
          onClick={() => setSelectedTier(tier.tier as 1 | 2 | 3)}
          className={`cursor-pointer transition-all duration-300 rounded-xl p-6 border ${
            selectedTier === tier.tier
              ? `bg-gradient-to-br ${tier.color} bg-opacity-20 ${tier.borderColor} border-2`
              : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
          }`}
        >
          <div className="text-center mb-4">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 bg-gradient-to-br ${tier.color}`}>
              {tier.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {language === 'en' ? tier.name : tier.nameCn}
            </h3>
            <p className="text-slate-400 text-sm mb-3">
              {language === 'en' ? tier.description : tier.descriptionCn}
            </p>
            <div className="text-2xl font-bold text-emerald-400 mb-4">
              {tier.multiplier}
            </div>
          </div>

          {/* Features / 功能特性 */}
          <div className="space-y-3 mb-4">
            {tier.features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm">
                <feature.icon className="text-emerald-400" />
                <span className="text-slate-300">
                  {language === 'en' ? feature.en : feature.cn}
                </span>
              </div>
            ))}
          </div>

          {/* Requirements / 要求 */}
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3">
            <div className="text-xs text-slate-400 mb-1">
              {language === 'en' ? 'Requirements:' : '要求：'}
            </div>
            <div className="text-sm text-slate-300">
              {language === 'en' ? tier.requirements.en : tier.requirements.cn}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render team selection / 渲染队伍选择
  const renderTeamSelection = () => {
    if (!selectedEvent) return null

    return (
      <div className="grid grid-cols-2 gap-6">
        <div
          onClick={() => setSelectedTeam('A')}
          className={`cursor-pointer transition-all duration-300 rounded-xl p-6 border ${
            selectedTeam === 'A'
              ? 'bg-blue-500/20 border-blue-500/50'
              : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
          }`}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              A
            </div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">
              {selectedEvent.team_a_name}
            </h3>
            <p className="text-slate-400 text-sm">
              {language === 'en' ? 'Support Team A' : '支持队伍A'}
            </p>
          </div>
        </div>

        <div
          onClick={() => setSelectedTeam('B')}
          className={`cursor-pointer transition-all duration-300 rounded-xl p-6 border ${
            selectedTeam === 'B'
              ? 'bg-red-500/20 border-red-500/50'
              : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
          }`}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              B
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">
              {selectedEvent.team_b_name}
            </h3>
            <p className="text-slate-400 text-sm">
              {language === 'en' ? 'Support Team B' : '支持队伍B'}
            </p>
          </div>
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
            {language === 'en' ? 'Loading support options...' : '加载支持选项...'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* User Balance / 用户余额 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FaCoins className="text-yellow-400" />
            <span>{language === 'en' ? 'Your Balance' : '您的余额'}</span>
          </h2>
          <div className="text-3xl font-bold text-yellow-400">
            {userBalance.toFixed(2)} CHZ
          </div>
        </div>
      </div>

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

      {/* Available Events / 可用赛事 */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <FaTrophy className="text-yellow-400" />
          <span>{language === 'en' ? 'Available Events' : '可用赛事'}</span>
        </h3>
        
        {availableEvents.length === 0 ? (
          <div className="text-center py-8">
            <FaTrophy className="mx-auto text-4xl text-slate-500 mb-4" />
            <p className="text-slate-400">
              {language === 'en' ? 'No events available for staking' : '暂无可质押的赛事'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availableEvents.map(renderEventCard)}
          </div>
        )}
      </div>

      {/* Tier Selection / 层级选择 */}
      {selectedEvent && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <FaStar className="text-purple-400" />
            <span>{language === 'en' ? 'Choose Support Tier' : '选择支持层级'}</span>
          </h3>
          {renderTierSelection()}
        </div>
      )}

      {/* Team Selection / 队伍选择 */}
      {selectedEvent && selectedTier && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <FaUsers className="text-blue-400" />
            <span>{language === 'en' ? 'Select Team to Support' : '选择支持的队伍'}</span>
          </h3>
          {renderTeamSelection()}
        </div>
      )}

      {/* Stake Amount and Submit / 质押金额和提交 */}
      {selectedEvent && selectedTier && selectedTeam && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <FaCoins className="text-emerald-400" />
            <span>{language === 'en' ? 'Stake Amount' : '质押金额'}</span>
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {language === 'en' ? 'CHZ Amount' : 'CHZ数量'}
              </label>
              <input
                type="number"
                min="1"
                max={userBalance}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                placeholder="Enter stake amount..."
              />
              <div className="mt-2 text-sm text-slate-400">
                {language === 'en' ? 'Available:' : '可用：'} {userBalance.toFixed(2)} CHZ
              </div>
            </div>
            
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4">
              <h4 className="font-bold text-white mb-3">
                {language === 'en' ? 'Estimated Reward' : '预估奖励'}
              </h4>
              <div className="text-2xl font-bold text-emerald-400 mb-2">
                {calculateEstimatedReward().toFixed(2)} CHZ
              </div>
              <div className="text-sm text-slate-400">
                {language === 'en' ? 'Based on current participation' : '基于当前参与情况'}
              </div>
            </div>
          </div>
          
          <button
            onClick={handleStakeSubmission}
            disabled={submitting || stakeAmount <= 0 || stakeAmount > userBalance}
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>{language === 'en' ? 'Processing...' : '处理中...'}</span>
              </>
            ) : (
              <>
                <FaCheckCircle />
                <span>{language === 'en' ? 'Confirm Stake & Participation' : '确认质押和参与'}</span>
                <FaArrowRight />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
} 