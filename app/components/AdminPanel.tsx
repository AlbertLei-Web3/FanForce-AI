// AdminPanel.tsx
// 管理员面板组件，用于创建和管理比赛
// Admin panel component for match creation and management
// 关联文件:
// - FanForcePredictionDemo.sol: 智能合约
// - AdminControls.tsx: 单场比赛的管理控件
// - teams.ts: 队伍数据

import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { useContract } from '../context/ContractContext'
import { teams, deleteClassicMatchup, getClassicMatchups, addClassicMatchup, getAllTeams, saveDynamicTeam, isCustomTeam } from '../../data/teams'
import { useLanguage } from '../context/LanguageContext'

const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'

// 消息类型定义 / Message Type Definition
interface Message {
  type: 'success' | 'error' | 'warning'
  content: string
}

export default function AdminPanel() {
  const { address } = useWeb3()
  const { connectToMatch, createMatch, loading } = useContract()
  const { t, tTeam } = useLanguage()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTeamA, setSelectedTeamA] = useState<string>('')
  const [selectedTeamB, setSelectedTeamB] = useState<string>('')
  const [matchups, setMatchups] = useState<any[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState<Message | null>(null) // 添加消息状态 / Add message state
  
  // 动态队伍管理状态 / Dynamic team management states
  const [allTeams, setAllTeams] = useState<any[]>([])
  const [showAddTeamModal, setShowAddTeamModal] = useState(false)
  const [newTeamData, setNewTeamData] = useState({
    name: '',
    winRate: 75,
    avgAge: 28.5,
    injuryCount: 1
  })

  useEffect(() => {
    setIsMounted(true)
    setIsAdmin(address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase())
    // 客户端挂载后加载对战数据 / Load matchups after client mount
    setMatchups(getClassicMatchups())
    // 客户端挂载后加载队伍数据 / Load teams after client mount
    setAllTeams(getAllTeams())
  }, [address])

  useEffect(() => {
    // 每次打开面板时更新比赛列表
    // Update matchups list every time panel opens
    if (isOpen && isMounted) {
      setMatchups(getClassicMatchups())
    }
  }, [isOpen, isMounted])

  // 自动清除消息 / Auto clear message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
      }, 4000) // 4秒后自动清除 / Auto clear after 4 seconds
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!isMounted || !isAdmin) return null

  // 显示消息函数 / Show message function
  const showMessage = (type: 'success' | 'error' | 'warning', content: string) => {
    setMessage({ type, content })
  }

  const handleCreateMatch = async () => {
    if (!selectedTeamA || !selectedTeamB) {
      showMessage('error', t('Please select both teams'))
      return
    }
    
    if (selectedTeamA === selectedTeamB) {
      showMessage('error', t('Please select different teams'))
      return
    }

    setIsCreating(true)
    
    try {
      // 获取队伍信息（包括动态队伍） / Get team information (including dynamic teams)
      const teamA = allTeams.find(t => t.id === selectedTeamA)
      const teamB = allTeams.find(t => t.id === selectedTeamB)
      
      if (teamA && teamB) {
        // 管理员直接使用 createMatch 创建新比赛，避免连接到已有比赛
        // Admin directly uses createMatch to create new match, avoiding connection to existing match
        const contractMatchId = await createMatch(
          `${teamA.nameEn}|${teamA.nameCn}`,
          `${teamB.nameEn}|${teamB.nameCn}`
        )
        
        if (contractMatchId) {
          console.log(`New contract match created with ID: ${contractMatchId} for ${teamA.nameEn} vs ${teamB.nameEn}`)
          
          // 添加到前端数据 / Add to frontend data
          const result = addClassicMatchup(selectedTeamA, selectedTeamB, 'Custom Match')
          if (result.success) {
            setMatchups(result.matchups)
          }
          
          setSelectedTeamA('')
          setSelectedTeamB('')
          showMessage('success', t('Match created successfully') + ` (ID: ${contractMatchId})`)
        } else {
          console.error('Contract match creation failed')
          showMessage('error', 'Failed to create contract match')
        }
      }
    } catch (error: any) {
      console.error('Error creating match:', error)
      
      // 特殊处理重复比赛错误 / Special handling for duplicate match error
      if (error.message && error.message.includes('Match exists')) {
        showMessage('warning', 'Match with this ID already exists. Creating with unique ID...')
        
                 // 管理员可以强制创建唯一ID的比赛 / Admin can force create match with unique ID
         try {
           // 重新获取队伍信息（包括动态队伍） / Re-get team information (including dynamic teams)
           const teamA = allTeams.find(t => t.id === selectedTeamA)
           const teamB = allTeams.find(t => t.id === selectedTeamB)
           
                       if (teamA && teamB) {
              const uniqueMatchId = await createMatch(
                `${teamA.nameEn}|${teamA.nameCn}`,
                `${teamB.nameEn}|${teamB.nameCn}`
              )
           
              if (uniqueMatchId) {
                const result = addClassicMatchup(selectedTeamA, selectedTeamB, 'Custom Match')
                if (result.success) {
                  setMatchups(result.matchups)
                }
                
                setSelectedTeamA('')
                setSelectedTeamB('')
                showMessage('success', `Unique match created successfully (ID: ${uniqueMatchId})`)
              }
            }
         } catch (retryError) {
           console.error('Retry match creation failed:', retryError)
           showMessage('error', 'Failed to create unique match')
         }
      } else {
        showMessage('error', 'Error creating match: ' + (error.message || 'Unknown error'))
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteMatch = (index: number) => {
    const newMatchups = deleteClassicMatchup(index)
    setMatchups(newMatchups)
    showMessage('success', t('Match deleted successfully'))
  }

  // 处理添加队伍 / Handle add team
  const handleAddTeam = () => {
    if (!newTeamData.name.trim()) {
      showMessage('error', '请输入队伍名称 / Please enter team name')
      return
    }

    try {
      // 保存新队伍到localStorage，使用时间戳确保唯一性 / Save new team to localStorage with timestamp for uniqueness
      const savedTeam = saveDynamicTeam(newTeamData)
      
      // 刷新队伍列表 / Refresh team list
      setAllTeams(getAllTeams())
      
      // 重置表单 / Reset form
      setNewTeamData({ name: '', winRate: 75, avgAge: 28.5, injuryCount: 1 })
      setShowAddTeamModal(false)
      
      showMessage('success', `队伍 "${savedTeam.name}" 添加成功 / Team "${savedTeam.name}" added successfully`)
    } catch (error) {
      showMessage('error', '添加队伍失败 / Failed to add team')
    }
  }

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-fanforce-primary text-white p-4 rounded-full shadow-lg hover:bg-fanforce-secondary transition-colors"
      >
        {t('Admin')}
      </button>

      {/* 管理员面板 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 relative">
            {/* 消息提示组件 / Message Notification Component */}
            {message && (
              <div className={`
                absolute top-4 left-4 right-4 p-4 rounded-lg border-l-4 backdrop-blur-sm transition-all duration-300 z-10
                ${message.type === 'success' ? 'bg-green-900/30 border-green-500 text-green-300' : ''}
                ${message.type === 'error' ? 'bg-red-900/30 border-red-500 text-red-300' : ''}
                ${message.type === 'warning' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-300' : ''}
              `}>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">
                    {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : '⚠️'}
                  </span>
                  <span className="font-medium">{message.content}</span>
                  <button
                    onClick={() => setMessage(null)}
                    className="ml-auto text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className={`transition-all duration-300 ${message ? 'mt-16' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t('Match Management')}</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* 添加队伍按钮 / Add Team Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAddTeamModal(true)}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ➕ 添加队伍 / Add Team
                </button>
              </div>

              {/* 创建新比赛 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">{t('Create New Match')}</h3>
                
                {/* 选择队伍 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* 队伍A选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('Team A')}
                    </label>
                    <select
                      value={selectedTeamA}
                      onChange={(e) => setSelectedTeamA(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded p-2 border border-gray-700"
                    >
                      <option value="">{t('Select Team A')}</option>
                      {/* 原有队伍 / Original Teams */}
                      <optgroup label="📊 官方队伍 / Official Teams">
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>
                            {tTeam(team.nameEn, team.nameCn)}
                          </option>
                        ))}
                      </optgroup>
                      {/* 动态队伍 / Dynamic Teams */}
                      {allTeams.length > teams.length && (
                        <optgroup label="⚡ 自定义队伍 / Custom Teams">
                          {allTeams.slice(teams.length).map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name} ⏰
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>

                  {/* 队伍B选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t('Team B')}
                    </label>
                    <select
                      value={selectedTeamB}
                      onChange={(e) => setSelectedTeamB(e.target.value)}
                      className="w-full bg-gray-800 text-white rounded p-2 border border-gray-700"
                    >
                      <option value="">{t('Select Team B')}</option>
                      {/* 原有队伍 / Original Teams */}
                      <optgroup label="📊 官方队伍 / Official Teams">
                        {teams.map(team => (
                          <option key={team.id} value={team.id}>
                            {tTeam(team.nameEn, team.nameCn)}
                          </option>
                        ))}
                      </optgroup>
                      {/* 动态队伍 / Dynamic Teams */}
                      {allTeams.length > teams.length && (
                        <optgroup label="⚡ 自定义队伍 / Custom Teams">
                          {allTeams.slice(teams.length).map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name} ⏰
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                {/* 创建按钮 */}
                <button
                  onClick={handleCreateMatch}
                  disabled={isCreating || loading}
                  className="w-full bg-fanforce-primary text-white py-2 rounded hover:bg-fanforce-secondary transition-colors disabled:opacity-50"
                >
                  {isCreating || loading ? t('Creating match...') : t('Create Match')}
                </button>
              </div>

              {/* 现有比赛列表 */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('Existing Matches')}</h3>
                <div className="space-y-4">
                  {matchups.map((matchup, index) => {
                    // 使用allTeams查找队伍，包括自定义队伍 / Use allTeams to find teams, including custom teams
                    const teamA = allTeams.find(t => t.id === matchup.teamA)
                    const teamB = allTeams.find(t => t.id === matchup.teamB)
                    if (!teamA || !teamB) return null

                    return (
                      <div key={index} className="bg-gray-800 p-4 rounded relative group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* 条件渲染队伍A图标 / Conditional render team A icon */}
                            {!isCustomTeam(teamA.id) ? (
                              <img 
                                src={`https://flagsapi.com/${teamA.countryCode}/flat/64.png`}
                                alt={teamA.name}
                                className="w-8 h-6"
                              />
                            ) : (
                              <div className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
                                <span className="text-xs">⚡</span>
                              </div>
                            )}
                            <span className="text-white">
                              {isCustomTeam(teamA.id) ? teamA.name : tTeam(teamA.nameEn, teamA.nameCn)}
                            </span>
                          </div>
                          <span className="text-fanforce-gold">VS</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-white">
                              {isCustomTeam(teamB.id) ? teamB.name : tTeam(teamB.nameEn, teamB.nameCn)}
                            </span>
                            {/* 条件渲染队伍B图标 / Conditional render team B icon */}
                            {!isCustomTeam(teamB.id) ? (
                              <img 
                                src={`https://flagsapi.com/${teamB.countryCode}/flat/64.png`}
                                alt={teamB.name}
                                className="w-8 h-6"
                              />
                            ) : (
                              <div className="w-8 h-6 bg-gray-700 rounded flex items-center justify-center">
                                <span className="text-xs">⚡</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mt-2 text-center">
                          {matchup.titleKey ? t(matchup.titleKey) : 
                           (isCustomTeam(teamA.id) || isCustomTeam(teamB.id) ? 
                            '自定义对战 / Custom Match' : '经典对战 / Classic Match')}
                        </p>
                        
                        {/* 删除按钮 - 悬停时显示 */}
                        <button
                          onClick={() => handleDeleteMatch(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                          title={t('Delete Match')}
                        >
                          ×
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加队伍模态框 / Add Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              ➕ 添加队伍 / Add Team
            </h3>
            
            {/* 队伍名称输入 / Team Name Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                队伍名称 / Team Name (例如: 某代号)
              </label>
              <input
                type="text"
                value={newTeamData.name}
                onChange={(e) => setNewTeamData({...newTeamData, name: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="输入队伍名称..."
              />
            </div>

            {/* 历史胜率输入 / Historical Win Rate Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Historical Win Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newTeamData.winRate}
                onChange={(e) => setNewTeamData({...newTeamData, winRate: Number(e.target.value)})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* 平均年龄输入 / Average Age Input */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Average Age (years old)
              </label>
              <input
                type="number"
                min="18"
                max="40"
                step="0.1"
                value={newTeamData.avgAge}
                onChange={(e) => setNewTeamData({...newTeamData, avgAge: Number(e.target.value)})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* 伤病数量输入 / Injury Count Input */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Injury Count (people)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={newTeamData.injuryCount}
                onChange={(e) => setNewTeamData({...newTeamData, injuryCount: Number(e.target.value)})}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
              />
            </div>
            
            {/* 按钮组 / Button Group */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddTeamModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                取消 / Cancel
              </button>
              <button
                onClick={handleAddTeam}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading || !newTeamData.name.trim()}
              >
                添加 / Add Team
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 