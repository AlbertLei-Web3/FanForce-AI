// FanForce AI - 主页面组件
// Main Page Component - 应用的核心页面，包含球队选择和战斗力对比功能
// Core page of the application with team selection and combat power comparison features

'use client'

import { useState, useEffect } from 'react'
import { teams, calculateCombatPower, getClassicMatchups, deleteClassicMatchup, Team, getAllTeams, isCustomTeam } from '../data/teams'
import { useLanguage } from './context/LanguageContext'
import { useContract } from './context/ContractContext'
import { useWeb3 } from './context/Web3Context'
import AdminControls from './components/AdminControls'
import AdminPanel from './components/AdminPanel'
import { ClientOnly, HydrationSafe } from './components/ClientLayout'
import { generatePersonalizedCommentary } from './utils/matchAnalyzer'

export default function HomePage() {
  // 状态管理 / State Management
  const [selectedTeamA, setSelectedTeamA] = useState<Team | null>(null)
  const [selectedTeamB, setSelectedTeamB] = useState<Team | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [votes, setVotes] = useState({ teamA: 0, teamB: 0 })
  const [aiCommentary, setAiCommentary] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [showAnalysisButton, setShowAnalysisButton] = useState(true)
  const [matchups, setMatchups] = useState<any[]>([])
  const [matchupsLoaded, setMatchupsLoaded] = useState(false)
  
  // 下注相关状态 / Betting Related State
  const [betAmount, setBetAmount] = useState('1')
  const [showBetModal, setShowBetModal] = useState(false)
  const [selectedBetTeam, setSelectedBetTeam] = useState<'A' | 'B' | null>(null)
  
  // 上下文 / Contexts
  const { t, tTeam } = useLanguage()
  const { address } = useWeb3()
  const { 
    createMatch, 
    connectToMatch,
    placeBet, 
    claimReward,
    currentMatchId, 
    matchInfo, 
    userBet, 
    loading, 
    error,
    refreshMatchInfo,
    refreshUserBet
  } = useContract()

  // 管理员地址检查 / Admin address check
  const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // 客户端挂载后设置管理员状态和加载对战数据 / Set admin state and load matchups after client mount
  useEffect(() => {
    setIsMounted(true)
    setIsAdmin(address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase())
    // 客户端挂载后加载对战数据 / Load matchups after client mount
    setMatchups(getClassicMatchups())
    setMatchupsLoaded(true)
  }, [address])

  // 页面历史管理 / Page history management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (showComparison) {
        // 阻止默认的后退行为，返回到选择页面 / Prevent default back behavior, return to selection page
        event.preventDefault()
        resetSelection()
        // 添加新的历史状态 / Add new history state
        window.history.pushState({ page: 'selection' }, '', window.location.pathname)
      }
    }

    // 当进入对比页面时，添加历史状态 / Add history state when entering comparison page
    if (showComparison) {
      window.history.pushState({ page: 'comparison' }, '', window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [showComparison])

  // 每次显示主页面时更新比赛列表
  // Update matchups list every time main page is shown
  useEffect(() => {
    if (!showComparison && isMounted) {
      setMatchups(getClassicMatchups())
    }
  }, [showComparison, isMounted])

  // 处理比赛创建或连接 / Handle match creation or connection
  const handleMatchCreation = async (teamA: Team, teamB: Team) => {
    try {
      console.log(`Attempting to connect/create match for ${teamA.nameEn} vs ${teamB.nameEn}`)
      
      // 使用智能连接函数，避免重复创建 / Use smart connection function to avoid duplicate creation
      const matchId = await connectToMatch(
        `${teamA.nameEn}|${teamA.nameCn}`,
        `${teamB.nameEn}|${teamB.nameCn}`
      )
      
      if (matchId) {
        console.log('Match connected/created with ID:', matchId)
      }
      
    } catch (error) {
      console.error('Error handling match creation:', error)
    }
  }

  // 选择球队处理函数 / Team Selection Handler
  const handleTeamSelection = async (team: Team, position: 'A' | 'B') => {
    if (position === 'A') {
      setSelectedTeamA(team)
    } else {
      setSelectedTeamB(team)
    }
    
    // 如果两支球队都已选择，显示对比并创建合约匹配 / Show comparison and create contract match if both teams are selected
    if ((position === 'A' && selectedTeamB) || (position === 'B' && selectedTeamA)) {
      const teamA = position === 'A' ? team : selectedTeamA!
      const teamB = position === 'B' ? team : selectedTeamB!
      
      setShowComparison(true)
      // 移除自动触发，改为手动触发 / Remove auto-trigger, change to manual trigger
      setShowAnalysisButton(true)
      setHasAnalyzed(false)
      setAiCommentary('')
      
      // 处理比赛创建或连接 / Handle match creation or connection
      await handleMatchCreation(teamA, teamB)
    }
  }

  // 生成AI解说 / Generate AI Commentary
  const generateAICommentary = async () => {
    if (!selectedTeamA || !selectedTeamB) {
      console.log('generateAICommentary: Missing teams', { selectedTeamA, selectedTeamB })
      return
    }
    
    generateAICommentaryWithTeams(selectedTeamA, selectedTeamB)
  }

  // 生成AI解说（直接传入队伍） / Generate AI Commentary with specific teams
  const generateAICommentaryWithTeams = async (teamA: Team, teamB: Team) => {
    console.log('generateAICommentaryWithTeams: Starting analysis for', teamA.nameEn, 'vs', teamB.nameEn)
    setIsAnalyzing(true)
    setShowAnalysisButton(false)
    setAiCommentary('')
    
    // 基于真实数据生成个性化解说 / Generate personalized commentary based on real data
    setTimeout(() => {
      try {
        const personalizedCommentary = generatePersonalizedCommentary(teamA, teamB)
        console.log('Generated commentary:', personalizedCommentary)
        setAiCommentary(personalizedCommentary)
        setHasAnalyzed(true)
      } catch (error) {
        console.error('Error generating commentary:', error)
        setAiCommentary('Error generating analysis. Please try again.')
        setHasAnalyzed(true)
      }
      setIsAnalyzing(false)
    }, 3000) // 增加到3秒增强期待感
  }

  // 手动触发AI分析 / Manually trigger AI analysis
  const handleStartAnalysis = () => {
    if (selectedTeamA && selectedTeamB) {
      generateAICommentaryWithTeams(selectedTeamA, selectedTeamB)
    }
  }

  // 重新分析 / Re-analyze
  const handleReAnalysis = () => {
    setHasAnalyzed(false)
    setShowAnalysisButton(true)
    setAiCommentary('')
    if (selectedTeamA && selectedTeamB) {
      generateAICommentaryWithTeams(selectedTeamA, selectedTeamB)
    }
  }

  // 下注处理函数 / Betting Handler
  const handleVote = (team: 'A' | 'B') => {
    setSelectedBetTeam(team)
    setShowBetModal(true)
  }

  // 确认下注 / Confirm Bet
  const handleConfirmBet = async () => {
    if (!selectedBetTeam || !currentMatchId) return
    
    const teamNumber = selectedBetTeam === 'A' ? 1 : 2
    const success = await placeBet(currentMatchId, teamNumber as 1 | 2, betAmount)
    
    if (success) {
      // 下注成功后会自动刷新matchInfo，包含最新的投票数据
      // After successful bet, matchInfo will be automatically refreshed with latest voting data
      setShowBetModal(false)
      setSelectedBetTeam(null)
    }
  }

  // 检查下注按钮是否应该禁用 / Check if bet button should be disabled
  const isBetDisabled = () => {
    if (loading) return true // 加载中 / Loading
    if (!currentMatchId) return true // 没有匹配ID / No match ID
    if (!matchInfo) return true // 没有匹配信息 / No match info
    if (matchInfo.settled) return true // 比赛已结算 / Match settled
    if (userBet && parseFloat(userBet.amount) > 0) return true // 用户已下注 / User already bet
    return false
  }

  // 获取下注按钮禁用原因 / Get bet button disabled reason
  const getBetDisabledReason = () => {
    if (loading) return t('Processing...')
    if (!currentMatchId) return t('Creating match...')
    if (!matchInfo) return t('Loading match info...')
    if (matchInfo.settled) return t('Match is already settled')
    if (userBet && parseFloat(userBet.amount) > 0) return t('You have already bet on this match')
    return ''
  }

  // 检查是否可以领取奖励 / Check if can claim reward
  const canClaimReward = () => {
    return matchInfo?.settled && 
           matchInfo.result > 0 && // 确保有有效的比赛结果 / Ensure valid match result
           userBet && 
           parseFloat(userBet.amount) > 0 && 
           !userBet.claimed
  }

  // 检查是否已经领取奖励 / Check if already claimed reward
  const hasClaimedReward = () => {
    return userBet?.claimed || false
  }

  // 检查用户是否下注失败 / Check if user bet on losing team
  const isLosingBet = () => {
    if (!matchInfo?.settled || matchInfo.result === 0 || !userBet || parseFloat(userBet.amount) === 0) return false
    return userBet.team !== matchInfo.result
  }

  // 处理领取奖励 / Handle claim reward
  const handleClaimReward = async () => {
    if (!currentMatchId) return
    const success = await claimReward(currentMatchId)
    if (success) {
      console.log('Reward claimed successfully')
    }
  }

  // 提示用户联系管理员 / Prompt user to contact admin
  const handleContactAdmin = () => {
    // 显示联系管理员的提示信息
    alert(t('Please contact the administrator to create a new match for these teams.') + ' / 请联系管理员为这些队伍创建新的比赛。')
  }

  // 取消下注 / Cancel Bet
  const handleCancelBet = () => {
    setShowBetModal(false)
    setSelectedBetTeam(null)
  }

  // 重置选择 / Reset Selection
  const resetSelection = () => {
    setSelectedTeamA(null)
    setSelectedTeamB(null)
    setShowComparison(false)
    setAiCommentary('')
    setHasAnalyzed(false)
    setShowAnalysisButton(true)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 标题区域 / Header Section - 只在主页显示 / Only show on main page */}
        {!showComparison && (
          <div className="text-center mb-12">
            {/* 主品牌标题 / Main Brand Title */}
            <h1 className="text-6xl font-bold text-white text-shadow mb-3">
              🏆 {t('FanForce AI - Win-Win Prediction Platform')}
            </h1>
            
            {/* 核心价值主张 / Core Value Proposition */}
            <div className="mb-6">
              <p className="text-lg text-fanforce-gold font-medium">
                {t('Revolutionary non-zero-sum design ensures all participants earn rewards from their predictions')}
              </p>
            </div>
            
            {/* 双赢概念强调框 / Win-Win Concept Highlight Box */}
            <div className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-blue-500/10 via-blue-600/15 to-blue-700/20 rounded-lg border border-blue-400/30 mb-6">
              <div className="flex items-center justify-center space-x-8 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Win</div>
                  <div className="text-sm text-gray-300">70% of Pool</div>
                </div>
                <div className="text-3xl text-fanforce-gold">+</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Lose</div>
                  <div className="text-sm text-gray-300">30% of Pool</div>
                </div>
                <div className="text-3xl text-fanforce-gold">=</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fanforce-gold">💰 Everyone Profits</div>
                </div>
              </div>
            </div>
            
            {/* 技术说明 / Technical Description */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('AI-Powered Non-Zero-Sum Betting - Everyone Profits from Predictions')}
            </p>
            
            {/* WebSocket Demo Link / WebSocket演示链接 */}
            <div className="mt-8">
              <a 
                href="/websocket-demo" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                </svg>
                🔗 Real-time WebSocket Demo / 实时WebSocket演示
              </a>
            </div>
          </div>
        )}

        {/* 管理员面板 / Admin Panel */}
        <ClientOnly>
          <AdminPanel />
        </ClientOnly>

        {/* 经典对战推荐 / Classic Matchup Recommendations */}
        {!showComparison && matchupsLoaded && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              🔥 {t('Classic Matchups')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchups.map((matchup, index) => {
                const allTeamsData = isMounted ? getAllTeams() : teams // 获取所有队伍（包括自定义）/ Get all teams (including custom)
                const teamA = allTeamsData.find(t => t.id === matchup.teamA)
                const teamB = allTeamsData.find(t => t.id === matchup.teamB)
                return (
                  <button
                    key={index}
                    onClick={async () => {
                      if (teamA && teamB) {
                        setSelectedTeamA(teamA)
                        setSelectedTeamB(teamB)
                        setShowComparison(true)
                        // 移除自动触发，改为手动触发 / Remove auto-trigger, change to manual trigger  
                        setShowAnalysisButton(true)
                        setHasAnalyzed(false)
                        setAiCommentary('')
                        
                        // 尝试连接或创建合约比赛 / Try to connect or create contract match
                        await handleMatchCreation(teamA, teamB)
                      }
                    }}
                    className="team-card hover:glow-effect text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {!isCustomTeam(teamA?.id || '') && (
                          <img 
                            src={`https://flagsapi.com/${teamA?.countryCode}/flat/64.png`} 
                            alt={teamA?.name}
                            className="w-8 h-6"
                          />
                        )}
                        <span className="text-white font-medium">
                          {isCustomTeam(teamA?.id || '') ? teamA?.name : tTeam(teamA?.nameEn || '', teamA?.nameCn || '')}
                        </span>
                      </div>
                      <span className="text-fanforce-gold text-xl">VS</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-white font-medium">
                          {isCustomTeam(teamB?.id || '') ? teamB?.name : tTeam(teamB?.nameEn || '', teamB?.nameCn || '')}
                        </span>
                        {!isCustomTeam(teamB?.id || '') && (
                          <img 
                            src={`https://flagsapi.com/${teamB?.countryCode}/flat/64.png`} 
                            alt={teamB?.name}
                            className="w-8 h-6"
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 text-center">{t(matchup.titleKey)}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 球队选择区域 / Team Selection Area */}
        {!showComparison && (
          <div>
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              {t('Select Teams to Compare')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(isMounted ? getAllTeams() : teams).map((team) => (
                <div
                  key={team.id}
                  className="team-card cursor-pointer hover:glow-effect"
                  onClick={() => {
                    if (!selectedTeamA) {
                      handleTeamSelection(team, 'A')
                    } else if (!selectedTeamB && team.id !== selectedTeamA.id) {
                      handleTeamSelection(team, 'B')
                    }
                  }}
                >
                  <div className="text-center">
                    {!isCustomTeam(team.id) && (
                      <img 
                        src={`https://flagsapi.com/${team.countryCode}/flat/64.png`} 
                        alt={team.name}
                        className="w-16 h-12 mx-auto mb-3"
                      />
                    )}
                    {isCustomTeam(team.id) && (
                      <div className="w-16 h-12 mx-auto mb-3 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-2xl">⚡</span>
                      </div>
                    )}
                    <h3 className="text-white font-bold text-lg">
                      {isCustomTeam(team.id) ? team.name : tTeam(team.nameEn, team.nameCn)}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {isCustomTeam(team.id) ? '自定义队伍 / Custom Team' : tTeam(team.nameEn, team.nameCn)}
                    </p>
                    <p className="text-fanforce-secondary text-xs mt-2">{team.starPlayer}</p>
                    
                    {/* 基础数据预览 / Basic Data Preview */}
                    <div className="mt-3 text-xs text-gray-300 space-y-1">
                      <div>{t('Win Rate')}: {team.winRate}%</div>
                      <div>{t('Avg Age')}: {team.avgAge}{t('y')}</div>
                      {!isCustomTeam(team.id) && <div>{t('FIFA Ranking')}: #{team.fifaRanking}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 战斗力对比区域 / Combat Power Comparison Area */}
        {showComparison && selectedTeamA && selectedTeamB && (
          <div className="space-y-8">
            
            {/* 对战标题已隐藏 / Match Title Hidden */}

            {/* 战斗力评分对比 / Combat Power Score Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* 队伍A评分 / Team A Score */}
              <div className="team-card text-center glow-effect">
                {!isCustomTeam(selectedTeamA.id) && (
                  <img 
                    src={`https://flagsapi.com/${selectedTeamA.countryCode}/flat/64.png`} 
                    alt={selectedTeamA.name}
                    className="w-20 h-15 mx-auto mb-4"
                  />
                )}
                {isCustomTeam(selectedTeamA.id) && (
                  <div className="w-20 h-15 mx-auto mb-4 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-4xl">⚡</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isCustomTeam(selectedTeamA.id) ? selectedTeamA.name : tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)}
                </h3>
                <div className="combat-score mb-4">
                  {calculateCombatPower(selectedTeamA)}
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>{t('Historical Win Rate')}: {selectedTeamA.winRate}%</div>
                  <div>{t('Average Age')}: {selectedTeamA.avgAge}{t('years old')}</div>
                  <div>{t('Injury Count')}: {selectedTeamA.injuryCount}{t('people')}</div>
                  <div>{t('Core Player')}: {selectedTeamA.starPlayer}</div>
                </div>
              </div>

              {/* VS 分隔符 / VS Separator */}
              <div className="text-center">
                <div className="text-6xl font-bold text-fanforce-gold animate-pulse-slow">
                  VS
                </div>
                <p className="text-white mt-4">{t('Combat Power')}</p>
              </div>

              {/* 队伍B评分 / Team B Score */}
              <div className="team-card text-center glow-effect">
                {!isCustomTeam(selectedTeamB.id) && (
                  <img 
                    src={`https://flagsapi.com/${selectedTeamB.countryCode}/flat/64.png`} 
                    alt={selectedTeamB.name}
                    className="w-20 h-15 mx-auto mb-4"
                  />
                )}
                {isCustomTeam(selectedTeamB.id) && (
                  <div className="w-20 h-15 mx-auto mb-4 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-4xl">⚡</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isCustomTeam(selectedTeamB.id) ? selectedTeamB.name : tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}
                </h3>
                <div className="combat-score mb-4">
                  {calculateCombatPower(selectedTeamB)}
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>{t('Historical Win Rate')}: {selectedTeamB.winRate}%</div>
                  <div>{t('Average Age')}: {selectedTeamB.avgAge}{t('years old')}</div>
                  <div>{t('Injury Count')}: {selectedTeamB.injuryCount}{t('people')}</div>
                  <div>{t('Core Player')}: {selectedTeamB.starPlayer}</div>
                </div>
              </div>
            </div>

            {/* AI解说区域 / AI Commentary Section */}
            <div className="team-card">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                🤖 {t('AI Tactical Analyst Commentary')}
              </h3>
              
              {/* 分析前状态 - 显示开始分析按钮 / Pre-analysis state - Show start analysis button */}
              {showAnalysisButton && !isAnalyzing && !hasAnalyzed && (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="text-6xl mb-4">🧠</div>
                    <p className="text-gray-400 mb-6">Ready to generate expert tactical analysis based on real team data</p>
                  </div>
                  <button
                    onClick={handleStartAnalysis}
                    className="group relative bg-gradient-to-r from-fanforce-primary to-fanforce-secondary hover:from-blue-600 hover:to-amber-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
                  >
                    <span className="flex items-center space-x-2">
                      <span>🚀</span>
                      <span>Start AI Analysis</span>
                      <span className="animate-pulse">✨</span>
                    </span>
                    <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              )}

              {/* 分析中状态 - 显示加载动画 / During analysis state - Show loading animation */}
              {isAnalyzing && (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <div className="relative inline-block">
                      <div className="text-6xl animate-bounce-slow">🧠</div>
                      <div className="absolute -top-2 -right-2 text-2xl animate-spin">⚡</div>
                    </div>
                    <p className="text-fanforce-secondary font-medium mb-4">AI Brain Processing...</p>
                  </div>
                  
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-fanforce-primary rounded-full animate-pulse"></div>
                      <span>🔍 Comparing historical performance data</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-fanforce-secondary rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <span>⚡ Analyzing age and fitness factors</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-fanforce-accent rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <span>🏥 Evaluating injury impact on tactics</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-fanforce-gold rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                      <span>🌟 Assessing star player influence</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 分析后状态 - 显示分析结果 / Post-analysis state - Show analysis results */}
              {hasAnalyzed && !isAnalyzing && aiCommentary && (
                <div>
                  <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-green-400">✅</span>
                      <span className="text-green-400 font-medium">Analysis Complete</span>
                      <span className="text-xs text-gray-400">• Generated just now</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{aiCommentary}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={handleReAnalysis}
                      className="flex-1 bg-fanforce-dark hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>🔄</span>
                      <span>Re-analyze</span>
                    </button>
                    <button
                      onClick={() => {
                        // 可以后续添加分享功能 / Can add share functionality later
                        navigator.clipboard.writeText(aiCommentary)
                        alert('Analysis copied to clipboard!')
                      }}
                      className="flex-1 bg-fanforce-accent hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <span>📋</span>
                      <span>Copy Analysis</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 合约信息显示 / Contract Info Display */}
            {matchInfo && (
              <div className="team-card">
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  📊 {t('Match Statistics')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">{t('Team A Bets')}</p>
                    <p className="text-fanforce-primary text-2xl font-bold">{matchInfo.totalTeamA} CHZ</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">{t('Reward Pool')}</p>
                    <p className="text-fanforce-gold text-2xl font-bold">{matchInfo.rewardPool} CHZ</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">{t('Team B Bets')}</p>
                    <p className="text-fanforce-secondary text-2xl font-bold">{matchInfo.totalTeamB} CHZ</p>
                  </div>
                </div>
                
                {userBet && parseFloat(userBet.amount) > 0 && (
                  <div className="mt-4 p-4 bg-green-900/30 border border-green-600 rounded-lg">
                    <p className="text-green-400 text-center">
                      {t('Your Bet')}: {userBet.amount} CHZ on {userBet.team === 1 ? tTeam(selectedTeamA?.nameEn || '', selectedTeamA?.nameCn || '') : tTeam(selectedTeamB?.nameEn || '', selectedTeamB?.nameCn || '')}
                      {userBet.claimed && <span className="ml-2">✅ {t('Claimed')}</span>}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 下注区域 / Betting Section */}
            <div className="team-card">
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                🎯 {t('Place Your Bet')}
              </h3>
              
              {/* 显示用户当前下注状态 / Show user's current bet status */}
              {userBet && parseFloat(userBet.amount) > 0 && (
                <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
                  <p className="text-blue-300 text-center">
                    💰 {t('Your Bet')}: {userBet.amount} CHZ on {userBet.team === 1 ? 
                      (isCustomTeam(selectedTeamA.id) ? selectedTeamA.name : tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)) : 
                      (isCustomTeam(selectedTeamB.id) ? selectedTeamB.name : tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn))
                    }
                  </p>
                  {/* 只有在比赛已结算且结果有效时才显示输赢状态 / Only show win/loss when match is settled with valid result */}
                  {matchInfo?.settled && matchInfo.result > 0 && (
                    <p className="text-center mt-2">
                      {userBet.team === matchInfo.result ? (
                        <span className="text-green-400">🎉 {t('You Won!')}</span>
                      ) : (
                        <span className="text-red-400">😔 {t('You Lost')}</span>
                      )}
                    </p>
                  )}
                  {/* 如果比赛未结算，显示等待状态 / If match not settled, show waiting status */}
                  {!matchInfo?.settled && (
                    <p className="text-center mt-2">
                      <span className="text-yellow-400">⏳ Waiting for match result / 等待比赛结果</span>
                    </p>
                  )}
                </div>
              )}

              {/* 下注按钮或奖励领取按钮 / Betting buttons or reward claim button */}
              {canClaimReward() ? (
                <div className="space-y-4">
                  {/* 奖励详情显示 / Reward Details Display */}
                  <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                    <h4 className="text-green-400 font-bold text-center mb-3">🏆 {t('Reward Details')}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('Net Bet Amount')} ({t('Principal')}):</span>
                        <span className="text-white font-bold">{userBet?.amount} CHZ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('Reward Pool Share')}:</span>
                        <span className="text-green-400 font-bold">
                          {matchInfo && userBet ? (
                            (() => {
                              const netBet = parseFloat(userBet.amount); // userBet.amount已经是净额
                              const totalWinnerBets = userBet.team === 1 ? parseFloat(matchInfo.totalTeamA) : parseFloat(matchInfo.totalTeamB);
                              const rewardPool = parseFloat(matchInfo.rewardPool);
                              const winnerRatio = userBet.team === matchInfo.result ? 0.7 : 0.3; // 胜方70%，败方30%
                              const poolShare = rewardPool * winnerRatio;
                              const userRewardShare = totalWinnerBets > 0 ? (netBet / totalWinnerBets) * poolShare : 0;
                              return `+${userRewardShare.toFixed(3)} CHZ`;
                            })()
                          ) : '0 CHZ'}
                        </span>
                      </div>
                      <hr className="border-gray-600" />
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('Total Before Fee')}:</span>
                        <span className="text-white">
                          {matchInfo && userBet ? (
                            (() => {
                              const netBet = parseFloat(userBet.amount);
                              const totalWinnerBets = userBet.team === 1 ? parseFloat(matchInfo.totalTeamA) : parseFloat(matchInfo.totalTeamB);
                              const rewardPool = parseFloat(matchInfo.rewardPool);
                              const winnerRatio = userBet.team === matchInfo.result ? 0.7 : 0.3;
                              const poolShare = rewardPool * winnerRatio;
                              const userRewardShare = totalWinnerBets > 0 ? (netBet / totalWinnerBets) * poolShare : 0;
                              const totalBeforeFee = netBet + userRewardShare;
                              return `${totalBeforeFee.toFixed(3)} CHZ`;
                            })()
                          ) : '0 CHZ'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">{t('Claim Fee')} (5%):</span>
                        <span className="text-red-400">
                          {matchInfo && userBet ? (
                            (() => {
                              const netBet = parseFloat(userBet.amount);
                              const totalWinnerBets = userBet.team === 1 ? parseFloat(matchInfo.totalTeamA) : parseFloat(matchInfo.totalTeamB);
                              const rewardPool = parseFloat(matchInfo.rewardPool);
                              const winnerRatio = userBet.team === matchInfo.result ? 0.7 : 0.3;
                              const poolShare = rewardPool * winnerRatio;
                              const userRewardShare = totalWinnerBets > 0 ? (netBet / totalWinnerBets) * poolShare : 0;
                              const totalBeforeFee = netBet + userRewardShare;
                              const claimFee = totalBeforeFee * 0.05;
                              return `-${claimFee.toFixed(3)} CHZ`;
                            })()
                          ) : '0 CHZ'}
                        </span>
                      </div>
                      <hr className="border-gray-600" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-green-400">{t('Final Reward')}:</span>
                        <span className="text-green-400">
                          {matchInfo && userBet ? (
                            (() => {
                              const netBet = parseFloat(userBet.amount);
                              const totalWinnerBets = userBet.team === 1 ? parseFloat(matchInfo.totalTeamA) : parseFloat(matchInfo.totalTeamB);
                              const rewardPool = parseFloat(matchInfo.rewardPool);
                              const winnerRatio = userBet.team === matchInfo.result ? 0.7 : 0.3;
                              const poolShare = rewardPool * winnerRatio;
                              const userRewardShare = totalWinnerBets > 0 ? (netBet / totalWinnerBets) * poolShare : 0;
                              const totalBeforeFee = netBet + userRewardShare;
                              const finalAmount = totalBeforeFee * 0.95; // 扣除5%领取手续费
                              return `${finalAmount.toFixed(3)} CHZ`;
                            })()
                          ) : '0 CHZ'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleClaimReward}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-lg transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? t('Processing...') : `🏆 ${t('Claim Reward')}`}
                  </button>
                </div>
              ) : hasClaimedReward() ? (
                <button
                  className="w-full bg-gray-600 text-gray-300 font-bold text-lg py-4 rounded-lg cursor-not-allowed"
                  disabled
                >
                  ✅ {t('Reward Claimed')}
                </button>
              ) : isLosingBet() ? (
                <button
                  className="w-full bg-red-600 text-white font-bold text-lg py-4 rounded-lg cursor-not-allowed"
                  disabled
                >
                  😔 {t('Lost Bet')}
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handleVote('A')}
                    className="btn-primary text-lg py-4 disabled:opacity-50"
                    disabled={isBetDisabled()}
                    title={getBetDisabledReason()}
                  >
                    {isBetDisabled() ? getBetDisabledReason() : t('Bet on')}
                    <br />
                    <span className="text-sm">
                      {!isBetDisabled() && `${t('Bet on')} ${isCustomTeam(selectedTeamA.id) ? selectedTeamA.name : tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)}`}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleVote('B')}
                    className="btn-secondary text-lg py-4 disabled:opacity-50"
                    disabled={isBetDisabled()}
                    title={getBetDisabledReason()}
                  >
                    {isBetDisabled() ? getBetDisabledReason() : t('Bet on')}
                    <br />
                    <span className="text-sm">
                      {!isBetDisabled() && `${t('Bet on')} ${isCustomTeam(selectedTeamB.id) ? selectedTeamB.name : tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}`}
                    </span>
                  </button>
                </div>
              )}

              {/* 调试信息已隐藏 / Debug info hidden */}

              {/* 错误显示 / Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-center">{error}</p>
                  {/* 如果是"Only admin"错误，显示详细解决方案 / Show detailed solution for "Only admin" error */}
                  {(error.includes('Only admin') || error.includes('管理员函数')) && (
                    <div className="mt-4 p-3 bg-orange-900/30 border border-orange-600 rounded-lg">
                      <h4 className="text-orange-400 font-bold mb-2">🛠️ Troubleshooting / 故障排除:</h4>
                      <ol className="text-orange-300 text-sm space-y-2 list-decimal list-inside">
                        <li>Refresh the page / 刷新页面</li>
                        <li>Disconnect and reconnect your wallet / 断开并重新连接钱包</li>
                        <li>Make sure you're using a user wallet, not admin wallet / 确保使用用户钱包，而非管理员钱包</li>
                        <li>Clear browser cache if problem persists / 如问题持续，清理浏览器缓存</li>
                      </ol>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        🔄 Refresh Page / 刷新页面
                      </button>
                    </div>
                  )}
                  {/* 如果是"Already bet"错误，显示联系管理员按钮 / Show contact admin button for "Already bet" error */}
                  {(error.includes('Already bet') || error.includes('已经在此比赛中下过注')) && (
                    <button
                      onClick={handleContactAdmin}
                      className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      📞 {t('Please contact the administrator to create a new match for these teams.')}
                    </button>
                  )}
                </div>
              )}

              {/* Add AdminControls component */}
              <ClientOnly>
                <AdminControls 
                  matchId={currentMatchId || 1} 
                  teamAName={selectedTeamA ? (isCustomTeam(selectedTeamA.id) ? selectedTeamA.name : tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)) : undefined}
                  teamBName={selectedTeamB ? (isCustomTeam(selectedTeamB.id) ? selectedTeamB.name : tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)) : undefined}
                />
              </ClientOnly>

              {/* 实时投票结果显示 / Real-time Voting Results Display */}
              {matchInfo && (parseFloat(matchInfo.totalTeamA) > 0 || parseFloat(matchInfo.totalTeamB) > 0) && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-3 text-center">
                    {t('Live Voting Results')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{isCustomTeam(selectedTeamA.id) ? selectedTeamA.name : tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)}</span>
                      <div className="flex-1 mx-4 bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-fanforce-primary h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${parseFloat(matchInfo.totalTeamA) / (parseFloat(matchInfo.totalTeamA) + parseFloat(matchInfo.totalTeamB)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-fanforce-primary font-bold">{parseFloat(matchInfo.totalTeamA).toFixed(2)} CHZ</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                                              <span className="text-white">{isCustomTeam(selectedTeamB.id) ? selectedTeamB.name : tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}</span>
                      <div className="flex-1 mx-4 bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-fanforce-secondary h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${parseFloat(matchInfo.totalTeamB) / (parseFloat(matchInfo.totalTeamA) + parseFloat(matchInfo.totalTeamB)) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-fanforce-secondary font-bold">{parseFloat(matchInfo.totalTeamB).toFixed(2)} CHZ</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs text-center mt-2">
                    {t('Real-time data from smart contract')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 下注模态框 / Betting Modal */}
      {showBetModal && selectedBetTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {t('Place Your Bet')}
            </h3>
            
            <div className="mb-4">
              <p className="text-gray-300 text-center mb-2">
                {t('Bet on')} {selectedBetTeam === 'A' 
                  ? tTeam(selectedTeamA?.nameEn || '', selectedTeamA?.nameCn || '')
                  : tTeam(selectedTeamB?.nameEn || '', selectedTeamB?.nameCn || '')
                }
              </p>
              
              <div className="space-y-2">
                <label className="block text-gray-400 text-sm">
                  Amount (CHZ) - Minimum 1 CHZ
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:outline-none"
                  placeholder="Enter bet amount"
                />
                <p className="text-xs text-gray-500">
                  Note: 5% fee will be deducted (Net bet: {(parseFloat(betAmount) * 0.95).toFixed(2)} CHZ)
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelBet}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBet}
                className="flex-1 px-4 py-2 bg-fanforce-primary text-white rounded-lg hover:bg-fanforce-primary/80 transition-colors disabled:opacity-50"
                disabled={loading || parseFloat(betAmount) < 1}
              >
                {loading ? 'Processing...' : `Bet ${betAmount} CHZ`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 