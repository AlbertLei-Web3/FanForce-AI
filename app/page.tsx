// FanForce AI - 主页面组件
// Main Page Component - 应用的核心页面，包含球队选择和战斗力对比功能
// Core page of the application with team selection and combat power comparison features

'use client'

import { useState, useEffect } from 'react'
import { teams, calculateCombatPower, classicMatchups, Team } from '../data/teams'
import { useLanguage } from './context/LanguageContext'

export default function HomePage() {
  // 状态管理 / State Management
  const [selectedTeamA, setSelectedTeamA] = useState<Team | null>(null)
  const [selectedTeamB, setSelectedTeamB] = useState<Team | null>(null)
  const [showComparison, setShowComparison] = useState(false)
  const [votes, setVotes] = useState({ teamA: 0, teamB: 0 })
  const [aiCommentary, setAiCommentary] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // 语言上下文 / Language Context
  const { t, tTeam } = useLanguage()

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

  // 选择球队处理函数 / Team Selection Handler
  const handleTeamSelection = (team: Team, position: 'A' | 'B') => {
    if (position === 'A') {
      setSelectedTeamA(team)
    } else {
      setSelectedTeamB(team)
    }
    
    // 如果两支球队都已选择，显示对比 / Show comparison if both teams are selected
    if ((position === 'A' && selectedTeamB) || (position === 'B' && selectedTeamA)) {
      setShowComparison(true)
      generateAICommentary()
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

  // 投票处理函数 / Voting Handler
  const handleVote = (team: 'A' | 'B') => {
    if (team === 'A') {
      setVotes(prev => ({ ...prev, teamA: prev.teamA + 1 }))
    } else {
      setVotes(prev => ({ ...prev, teamB: prev.teamB + 1 }))
    }
  }

  // 重置选择 / Reset Selection
  const resetSelection = () => {
    setSelectedTeamA(null)
    setSelectedTeamB(null)
    setShowComparison(false)
    setVotes({ teamA: 0, teamB: 0 })
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

        {/* 经典对战推荐 / Classic Matchup Recommendations */}
        {!showComparison && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              🔥 {t('Classic Matchups')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classicMatchups.map((matchup, index) => {
                const teamA = teams.find(t => t.id === matchup.teamA)
                const teamB = teams.find(t => t.id === matchup.teamB)
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (teamA && teamB) {
                        setSelectedTeamA(teamA)
                        setSelectedTeamB(teamB)
                        setShowComparison(true)
                        generateAICommentary()
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
              <button 
                onClick={resetSelection}
                className="btn-secondary text-sm"
              >
                {t('Reselect Teams')}
              </button>
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

            {/* 投票区域 / Voting Section */}
            <div className="team-card">
              <h3 className="text-xl font-bold text-white mb-6 text-center">
                🗳️ {t('Fan Prediction Vote')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <button
                  onClick={() => handleVote('A')}
                  className="btn-primary text-lg py-4"
                >
                  {t('Support')} {tTeam(selectedTeamA.nameEn, selectedTeamA.nameCn)} 获胜
                  <br />
                  <span className="text-sm">Support {selectedTeamA.nameEn}</span>
                </button>
                
                <button
                  onClick={() => handleVote('B')}
                  className="btn-secondary text-lg py-4"
                >
                  {t('Support')} {tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)} 获胜
                  <br />
                  <span className="text-sm">Support {selectedTeamB.nameEn}</span>
                </button>
              </div>

              {/* 投票结果显示 / Voting Results Display */}
              {(votes.teamA > 0 || votes.teamB > 0) && (
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
                            width: `${votes.teamA / (votes.teamA + votes.teamB) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-fanforce-primary font-bold">{votes.teamA}{t('votes')}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white">{tTeam(selectedTeamB.nameEn, selectedTeamB.nameCn)}</span>
                      <div className="flex-1 mx-4 bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-fanforce-secondary h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${votes.teamB / (votes.teamA + votes.teamB) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-fanforce-secondary font-bold">{votes.teamB}{t('votes')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 