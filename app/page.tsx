// FanForce AI - 主页面组件
// Main Page Component - 应用的核心页面，包含球队选择和战斗力对比功能
// Core page of the application with team selection and combat power comparison features

'use client'

import { useState, useEffect } from 'react'
import { teams, calculateCombatPower, getClassicMatchups, deleteClassicMatchup, Team } from '../data/teams'
import { useLanguage } from './context/LanguageContext'
import { useContract } from './context/ContractContext'
import { useWeb3 } from './context/Web3Context'
import AdminControls from './components/AdminControls'
import AdminPanel from './components/AdminPanel'

export default function HomePage() {
  // 状态管理 / State Management
  const [selectedTeamA, setSelectedTeamA] = useState<Team | null>(null)
  const [selectedTeamB, setSelectedTeamB] = useState<Team | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [votes, setVotes] = useState({ teamA: 0, teamB: 0 })
  const [aiCommentary, setAiCommentary] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [matchups, setMatchups] = useState(getClassicMatchups())
  
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
  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase()

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
    if (!showComparison) {
      setMatchups(getClassicMatchups())
    }
  }, [showComparison])

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
      generateAICommentary()
      
      // 处理比赛创建或连接 / Handle match creation or connection
      await handleMatchCreation(teamA, teamB)
    }
  }

  // 生成AI解说 / Generate AI Commentary
  const generateAICommentary = async () => {
    setIsAnalyzing(true)
    
    // 模拟AI分析过程 / Simulate AI analysis process
    setTimeout(() => {
      const commentaries = [
        "基于数据分析，这将是一场势均力敌的较量！双方在历史战绩和球员配置上都有各自的优势... / Based on data analysis, this will be an evenly matched contest! Both sides have their respective advantages in historical records and player configurations...",
        "从战术层面来看，这场对决将是经验与活力的碰撞！年轻球员的冲击力vs老将的稳定发挥... / From a tactical perspective, this matchup will be a collision of experience and vitality! The impact of young players vs the stable performance of veterans...",
        "伤病情况可能成为决定性因素！主力球员的缺席将如何影响整体战术布局... / Injury situations may become the decisive factor! How will the absence of key players affect the overall tactical setup..."
      ]
      setAiCommentary(commentaries[Math.floor(Math.random() * commentaries.length)])
      setIsAnalyzing(false)
    }, 2000)
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
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 标题区域 / Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white text-shadow mb-4">
            🏆 {t('2022 World Cup Quarterfinals')}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('AI-powered combat analysis system based on historical data, player age, injury status and more')}
          </p>
        </div>

        {/* 管理员面板 / Admin Panel */}
        <AdminPanel />

        {/* 经典对战推荐 / Classic Matchup Recommendations */}
        {!showComparison && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              🔥 {t('Classic Matchups')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchups.map((matchup, index) => {
                const teamA = teams.find(t => t.id === matchup.teamA)
                const teamB = teams.find(t => t.id === matchup.teamB)
                return (
                  <button
                    key={index}
                    onClick={async () => {
                      if (teamA && teamB) {
                        setSelectedTeamA(teamA)
                        setSelectedTeamB(teamB)
                        setShowComparison(true)
                        generateAICommentary()
                        
                        // 尝试连接或创建合约比赛 / Try to connect or create contract match
                        await handleMatchCreation(teamA, teamB)
                      }
                    }}
                    className="team-card hover:glow-effect text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={`https://flagsapi.com/${teamA?.countryCode}/flat/64.png`} 
                          alt={teamA?.name}
                          className="w-8 h-6"
                        />
                        <span className="text-white font-medium">{tTeam(teamA?.nameEn || '', teamA?.nameCn || '')}</span>
                      </div>
                      <span className="text-fanforce-gold text-xl">VS</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-white font-medium">{tTeam(teamB?.nameEn || '', teamB?.nameCn || '')}</span>
                        <img 
                          src={`https://flagsapi.com/${teamB?.countryCode}/flat/64.png`} 
                          alt={teamB?.name}
                          className="w-8 h-6"
                        />
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
              {teams.map((team) => (
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
                    <img 
                      src={`https://flagsapi.com/${team.countryCode}/flat/64.png`} 
                      alt={team.name}
                      className="w-16 h-12 mx-auto mb-3"
                    />
                    <h3 className="text-white font-bold text-lg">{tTeam(team.nameEn, team.nameCn)}</h3>
                    <p className="text-gray-400 text-sm">{tTeam(team.nameEn, team.nameCn)}</p>
                    <p className="text-fanforce-secondary text-xs mt-2">{team.starPlayer}</p>
                    
                    {/* 基础数据预览 / Basic Data Preview */}
                    <div className="mt-3 text-xs text-gray-300 space-y-1">
                      <div>{t('Win Rate')}: {team.winRate}%</div>
                      <div>{t('Avg Age')}: {team.avgAge}{t('y')}</div>
                      <div>{t('FIFA Ranking')}: #{team.fifaRanking}</div>
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
            
            {/* 对战标题 / Match Title */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                {tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)} 🆚 {tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}
              </h2>
              {/* 只有管理员才能看到重新选择按钮 / Only admin can see reselect button */}
              {isAdmin && (
                <button 
                  onClick={resetSelection}
                  className="btn-secondary text-sm"
                >
                  {t('Reselect Teams')}
                </button>
              )}
            </div>

            {/* 战斗力评分对比 / Combat Power Score Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              
              {/* 队伍A评分 / Team A Score */}
              <div className="team-card text-center glow-effect">
                <img 
                  src={`https://flagsapi.com/${selectedTeamA.countryCode}/flat/64.png`} 
                  alt={selectedTeamA.name}
                  className="w-20 h-15 mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-white mb-2">{tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)}</h3>
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
                <img 
                  src={`https://flagsapi.com/${selectedTeamB.countryCode}/flat/64.png`} 
                  alt={selectedTeamB.name}
                  className="w-20 h-15 mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-white mb-2">{tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}</h3>
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
              {isAnalyzing ? (
                <div className="flex items-center space-x-2 text-fanforce-secondary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-fanforce-secondary"></div>
                  <span>{t('AI is analyzing match data...')}</span>
                </div>
              ) : (
                <p className="text-gray-300 leading-relaxed">{aiCommentary}</p>
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
                    💰 {t('Your Bet')}: {userBet.amount} CHZ on {userBet.team === 1 ? tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn) : tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}
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
                      {!isBetDisabled() && `${t('Bet on')} ${tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)}`}
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
                      {!isBetDisabled() && `${t('Bet on')} ${tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}`}
                    </span>
                  </button>
                </div>
              )}

              {/* 错误显示 / Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-center">{error}</p>
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
              <AdminControls 
                matchId={currentMatchId || 1} 
                teamAName={selectedTeamA ? tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn) : undefined}
                teamBName={selectedTeamB ? tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn) : undefined}
              />

              {/* 实时投票结果显示 / Real-time Voting Results Display */}
              {matchInfo && (parseFloat(matchInfo.totalTeamA) > 0 || parseFloat(matchInfo.totalTeamB) > 0) && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-3 text-center">
                    {t('Live Voting Results')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white">{tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)}</span>
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
                      <span className="text-white">{tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}</span>
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