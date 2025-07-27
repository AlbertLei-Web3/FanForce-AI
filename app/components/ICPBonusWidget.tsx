// FanForce AI - ICP Bonus Widget / FanForce AI - ICP奖金组件
// Simple widget for ICP season bonus integration / ICP赛季奖金集成的简单组件
// This component can be safely added to existing dashboards / 此组件可以安全地添加到现有仪表板

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { 
  FaTrophy, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaCoins,
  FaNetworkWired,
  FaCalendarAlt,
  FaMedal
} from 'react-icons/fa'

// ICP Status interface / ICP状态接口
interface ICPStatus {
  totalSeasons: number
  totalClaims: number
  totalDistributed: number
  canisterId: string
  network: string
  connected: boolean
  lastUpdated: string
}

// Athlete eligibility interface / 运动员资格接口
interface AthleteEligibility {
  athleteId: string
  seasonId: string
  matchCount: number
  requiredMatches: number
  eligible: boolean
  bonusAmount: number
  reason: string
  seasonInfo: {
    id: string
    name: string
    isActive: boolean
    requiredMatches: number
    bonusAmount: number
  }
}

// Claim result interface / 领取结果接口
interface ClaimResult {
  success: boolean
  athleteId: string
  seasonId: string
  bonusAmount: number
  claimTime: string
  transactionId: string
  message: string
}

export default function ICPBonusWidget() {
  const { language } = useLanguage()
  const [icpStatus, setIcpStatus] = useState<ICPStatus | null>(null)
  const [eligibility, setEligibility] = useState<AthleteEligibility | null>(null)
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState<string>('')

  // Fetch ICP status on component mount / 组件挂载时获取ICP状态
  useEffect(() => {
    fetchICPStatus()
  }, [])

  // Fetch ICP canister status / 获取ICP容器状态
  const fetchICPStatus = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/icp/status')
      const data = await response.json()
      
      if (data.success) {
        setIcpStatus(data.status)
      } else {
        setError(data.error || 'Failed to fetch ICP status')
      }
    } catch (error) {
      console.error('Error fetching ICP status:', error)
      setError('Failed to connect to ICP Bridge service')
    }
  }

  // Check athlete eligibility / 检查运动员资格
  const checkEligibility = async () => {
    setIsLoading(true)
    setError('')
    setClaimResult(null)
    
    try {
      // For MVP, use a demo athlete ID / 对于MVP，使用演示运动员ID
      const athleteId = 'demo-athlete-1'
      const seasonId = 'spring-2024'
      
      const response = await fetch('http://localhost:3002/api/icp/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId, seasonId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setEligibility(data)
      } else {
        setError(data.error || 'Failed to check eligibility')
      }
    } catch (error) {
      console.error('Error checking eligibility:', error)
      setError(language === 'en' ? 'Error checking eligibility' : '检查资格时出错')
    } finally {
      setIsLoading(false)
    }
  }

  // Claim bonus / 领取奖金
  const claimBonus = async () => {
    if (!eligibility || !eligibility.eligible) {
      setError(language === 'en' ? 'Not eligible for bonus' : '不符合奖金资格')
      return
    }

    setIsClaiming(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3002/api/icp/claim-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          athleteId: eligibility.athleteId, 
          seasonId: eligibility.seasonId 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setClaimResult(data)
        // Refresh ICP status after claim / 领取后刷新ICP状态
        fetchICPStatus()
      } else {
        setError(data.error || 'Failed to claim bonus')
      }
    } catch (error) {
      console.error('Error claiming bonus:', error)
      setError(language === 'en' ? 'Error claiming bonus' : '领取奖金时出错')
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      {/* Header / 标题 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaTrophy className="text-yellow-400" />
          {language === 'en' ? 'ICP Season Bonus' : 'ICP赛季奖金'}
        </h3>
        <div className="flex items-center gap-2">
          <FaNetworkWired className="text-blue-400" />
          <span className="text-sm text-gray-300">ICP</span>
        </div>
      </div>
      
      {/* ICP Status / ICP状态 */}
      {icpStatus && (
        <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-green-400" />
              <span className="text-green-400 font-medium">
                {language === 'en' ? 'ICP Connected' : 'ICP已连接'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-gray-300 text-xs">
                {language === 'en' ? 'Network' : '网络'}: {icpStatus.network}
              </p>
              <p className="text-gray-300 text-xs">
                {language === 'en' ? 'Claims' : '领取'}: {icpStatus.totalClaims}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {language === 'en' 
              ? `Total Distributed: ${icpStatus.totalDistributed} ICP`
              : `总分配: ${icpStatus.totalDistributed} ICP`}
          </div>
        </div>
      )}
      
      {/* Error Display / 错误显示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 rounded border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {/* Eligibility Check Button / 资格检查按钮 */}
      <div className="mb-4">
        <button
          onClick={checkEligibility}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              {language === 'en' ? 'Checking...' : '检查中...'}
            </>
          ) : (
            <>
              <FaMedal />
              {language === 'en' ? 'Check Eligibility' : '检查资格'}
            </>
          )}
        </button>
      </div>
      
      {/* Eligibility Results / 资格结果 */}
      {eligibility && (
        <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-blue-400 font-medium">
              {language === 'en' ? 'Eligibility Status' : '资格状态'}
            </h4>
            {eligibility.eligible ? (
              <FaCheckCircle className="text-green-400" />
            ) : (
              <FaTimesCircle className="text-red-400" />
            )}
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">
                {language === 'en' ? 'Matches' : '比赛'}: 
              </span>
              <span className="text-white">
                {eligibility.matchCount}/{eligibility.requiredMatches}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">
                {language === 'en' ? 'Bonus Amount' : '奖金金额'}: 
              </span>
              <span className="text-yellow-400 font-medium">
                {eligibility.bonusAmount} ICP
              </span>
            </div>
            
            <div className="text-xs text-gray-400 mt-2">
              {eligibility.reason}
            </div>
          </div>
          
          {/* Claim Button / 领取按钮 */}
          {eligibility.eligible && (
            <button
              onClick={claimBonus}
              disabled={isClaiming}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {isClaiming ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {language === 'en' ? 'Claiming...' : '领取中...'}
                </>
              ) : (
                <>
                  <FaCoins />
                  {language === 'en' ? 'Claim Bonus' : '领取奖金'}
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Claim Result / 领取结果 */}
      {claimResult && (
        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <FaCheckCircle className="text-green-400" />
            <span className="text-green-400 font-medium">
              {language === 'en' ? 'Bonus Claimed!' : '奖金已领取！'}
            </span>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">
                {language === 'en' ? 'Amount' : '金额'}: 
              </span>
              <span className="text-yellow-400 font-medium">
                {claimResult.bonusAmount} ICP
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-300">
                {language === 'en' ? 'Transaction' : '交易'}: 
              </span>
              <span className="text-gray-400 text-xs">
                {claimResult.transactionId}
              </span>
            </div>
            
            <div className="text-xs text-gray-400 mt-2">
              {claimResult.message}
            </div>
          </div>
        </div>
      )}
      
      {/* Season Info / 赛季信息 */}
      {eligibility?.seasonInfo && (
        <div className="mt-4 p-3 bg-purple-500/10 rounded border border-purple-500/20">
          <div className="flex items-center gap-2 mb-1">
            <FaCalendarAlt className="text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">
              {eligibility.seasonInfo.name}
            </span>
          </div>
          <div className="text-xs text-gray-400">
            {language === 'en' 
              ? `Required: ${eligibility.seasonInfo.requiredMatches} matches`
              : `要求: ${eligibility.seasonInfo.requiredMatches} 场比赛`}
          </div>
        </div>
      )}
    </div>
  )
} 