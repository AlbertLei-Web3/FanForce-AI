// AdminPanel.tsx
// 管理员面板组件，用于创建和管理比赛
// Admin panel component for match creation and management
// 关联文件:
// - FanForcePredictionDemo.sol: 智能合约
// - AdminControls.tsx: 单场比赛的管理控件
// - teams.ts: 队伍数据

import { useState, useEffect } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { teams, deleteClassicMatchup, getClassicMatchups, addClassicMatchup } from '../../data/teams'
import { useLanguage } from '../context/LanguageContext'

const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'

export default function AdminPanel() {
  const { address } = useWeb3()
  const { t, tTeam } = useLanguage()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTeamA, setSelectedTeamA] = useState<string>('')
  const [selectedTeamB, setSelectedTeamB] = useState<string>('')
  const [matchups, setMatchups] = useState(getClassicMatchups())

  useEffect(() => {
    setIsAdmin(address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase())
  }, [address])

  useEffect(() => {
    // 每次打开面板时更新比赛列表
    // Update matchups list every time panel opens
    if (isOpen) {
      setMatchups(getClassicMatchups())
    }
  }, [isOpen])

  if (!isAdmin) return null

  const handleCreateMatch = () => {
    if (!selectedTeamA || !selectedTeamB) {
      alert(t('Please select both teams'))
      return
    }
    
    if (selectedTeamA === selectedTeamB) {
      alert(t('Please select different teams'))
      return
    }

    const result = addClassicMatchup(selectedTeamA, selectedTeamB, 'Custom Match')
    
    if (result.success) {
      setMatchups(result.matchups)
      setSelectedTeamA('')
      setSelectedTeamB('')
      alert(t('Match created successfully'))
    } else {
      alert(t('Match already exists'))
    }
  }

  const handleDeleteMatch = (index: number) => {
    const newMatchups = deleteClassicMatchup(index)
    setMatchups(newMatchups)
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
          <div className="bg-gray-900 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{t('Match Management')}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
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
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {tTeam(team.nameEn, team.nameCn)}
                      </option>
                    ))}
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
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {tTeam(team.nameEn, team.nameCn)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 创建按钮 */}
              <button
                onClick={handleCreateMatch}
                className="w-full bg-fanforce-primary text-white py-2 rounded hover:bg-fanforce-secondary transition-colors"
              >
                {t('Create Match')}
              </button>
            </div>

            {/* 现有比赛列表 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">{t('Existing Matches')}</h3>
              <div className="space-y-4">
                {matchups.map((matchup, index) => {
                  const teamA = teams.find(t => t.id === matchup.teamA)
                  const teamB = teams.find(t => t.id === matchup.teamB)
                  if (!teamA || !teamB) return null

                  return (
                    <div key={index} className="bg-gray-800 p-4 rounded relative group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={`https://flagsapi.com/${teamA.countryCode}/flat/64.png`}
                            alt={teamA.name}
                            className="w-8 h-6"
                          />
                          <span className="text-white">{tTeam(teamA.nameEn, teamA.nameCn)}</span>
                        </div>
                        <span className="text-fanforce-gold">VS</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-white">
                            {tTeam(teamB.nameEn, teamB.nameCn)}
                          </span>
                          <img 
                            src={`https://flagsapi.com/${teamB.countryCode}/flat/64.png`}
                            alt={teamB.name}
                            className="w-8 h-6"
                          />
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mt-2 text-center">{t(matchup.titleKey)}</p>
                      
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
      )}
    </>
  )
} 