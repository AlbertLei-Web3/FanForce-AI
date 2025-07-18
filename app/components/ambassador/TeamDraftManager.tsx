'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '../../context/LanguageContext'
import { useToast } from '../shared/Toast'
import { 
  FaUsers, 
  FaFootballBall,
  FaSave,
  FaEdit,
  FaTrash,
  FaPlus,
  FaMinus,
  FaStar,
  FaTrophy,
  FaCheckCircle,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSearch
} from 'react-icons/fa'

// Interface definitions / 接口定义
interface Athlete {
  id: string
  profile_data: any
  virtual_chz_balance: number
  ranking: number
  tier: string
  status: string
  matches_played: number
  matches_won: number
  availability_status: string
  performance_stats: any
}

interface TeamDraft {
  id?: string
  ambassador_id: string
  draft_name: string
  sport_type: string
  team_a_name: string
  team_a_athletes: string[]
  team_a_metadata: any
  team_b_name: string
  team_b_athletes: string[]
  team_b_metadata: any
  status: 'draft' | 'submitted' | 'approved' | 'cancelled'
  estimated_duration: number
  match_notes: string
  created_at?: string
  updated_at?: string
}

interface TeamDraftManagerProps {
  ambassadorId: string
  onClose: () => void
  onDraftSelected?: (draft: TeamDraft) => void
}

export default function TeamDraftManager({ ambassadorId, onClose, onDraftSelected }: TeamDraftManagerProps) {
  const router = useRouter()
  const { language } = useLanguage()
  const { showToast, ToastContainer } = useToast()
  
  // State management / 状态管理
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([])
  const [existingDrafts, setExistingDrafts] = useState<TeamDraft[]>([])
  const [currentDraft, setCurrentDraft] = useState<TeamDraft>({
    ambassador_id: ambassadorId,
    draft_name: '',
    sport_type: 'soccer',
    team_a_name: 'Thunder Wolves',
    team_a_athletes: [],
    team_a_metadata: {},
    team_b_name: 'Lightning Hawks',
    team_b_athletes: [],
    team_b_metadata: {},
    status: 'draft',
    estimated_duration: 90,
    match_notes: ''
  })
  
  // UI state / UI状态
  const [activeTab, setActiveTab] = useState<'create' | 'drafts'>('create')
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A')
  const [athleteFilter, setAthleteFilter] = useState('')
  const [tierFilter, setTierFilter] = useState('all')

  // Load data on component mount / 组件挂载时加载数据
  useEffect(() => {
    loadData()
  }, [ambassadorId])

  // Load available athletes and existing drafts / 加载可用运动员和现有草稿
  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ambassador/team-drafts?ambassador_id=${ambassadorId}`)
      const data = await response.json()
      
      if (data.success) {
        setAvailableAthletes(data.available_athletes || [])
        setExistingDrafts(data.drafts || [])
      } else {
        console.error('Failed to load data:', data.error)
        showToast({
          message: language === 'en' ? 'Failed to load data' : '加载数据失败',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error loading data:', error)
      showToast({
        message: language === 'en' ? 'Error loading data' : '加载数据时出错',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Save current draft / 保存当前草稿
  const saveDraft = async () => {
    if (!currentDraft.draft_name.trim()) {
      showToast({
        message: language === 'en' ? 'Please enter a draft name' : '请输入草稿名称',
        type: 'warning'
      })
      return
    }

    if (!currentDraft.team_a_name?.trim() || !currentDraft.team_b_name?.trim()) {
      showToast({
        message: language === 'en' ? 'Please enter team names' : '请输入队伍名称',
        type: 'warning'
      })
      return
    }

    // 构造完整的 draft 对象，保证所有字段都存在
    const draftToSave: any = {
      ambassador_id: currentDraft.ambassador_id,
      draft_name: currentDraft.draft_name,
      sport_type: currentDraft.sport_type || 'soccer',
      team_a_name: currentDraft.team_a_name,
      team_a_athletes: Array.isArray(currentDraft.team_a_athletes) ? currentDraft.team_a_athletes : [],
      team_a_metadata: currentDraft.team_a_metadata || {},
      team_b_name: currentDraft.team_b_name,
      team_b_athletes: Array.isArray(currentDraft.team_b_athletes) ? currentDraft.team_b_athletes : [],
      team_b_metadata: currentDraft.team_b_metadata || {},
      status: currentDraft.status || 'draft',
      estimated_duration: typeof currentDraft.estimated_duration === 'number' ? currentDraft.estimated_duration : 90,
      match_notes: currentDraft.match_notes || ''
    };
    if (currentDraft.id) draftToSave.id = currentDraft.id;
    if (currentDraft.created_at) draftToSave.created_at = currentDraft.created_at;
    if (currentDraft.updated_at) draftToSave.updated_at = currentDraft.updated_at;

    setSaving(true)
    try {
      const method = currentDraft.id ? 'PUT' : 'POST'
      const response = await fetch('/api/ambassador/team-drafts', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftToSave)
      })

      const data = await response.json()
      
      if (data.success) {
        if (!currentDraft.id) {
          setCurrentDraft(data.draft)
        }
        await loadData() // Reload drafts
        showToast({
          message: language === 'en' ? 'Draft saved successfully!' : '草稿保存成功！',
          type: 'success'
        })
      } else {
        showToast({
          message: data.error || (language === 'en' ? 'Failed to save draft' : '保存草稿失败'),
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      showToast({
        message: language === 'en' ? 'Error saving draft' : '保存草稿时出错',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  // Load existing draft / 加载现有草稿
  const loadDraft = (draft: TeamDraft) => {
    setCurrentDraft(draft)
    setActiveTab('create')
  }

  // Handle draft selection for event application / 处理草稿选择用于赛事申请
  const handleDraftUse = (draft: TeamDraft) => {
    if (onDraftSelected) {
      onDraftSelected(draft)
    } else {
      // Navigate to event application page with draft data / 导航到赛事申请页面并携带草稿数据
      router.push(`/dashboard/ambassador/event-applications?draft_id=${draft.id}&ambassador_id=${ambassadorId}`)
    }
  }

  // Delete draft / 删除草稿
  const deleteDraft = async (draftId: string) => {
    if (!confirm(language === 'en' ? 'Are you sure you want to delete this draft?' : '确定要删除这个草稿吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/ambassador/team-drafts?draft_id=${draftId}&ambassador_id=${ambassadorId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        await loadData()
        showToast({
          message: language === 'en' ? 'Draft deleted successfully!' : '草稿删除成功！',
          type: 'success'
        })
      } else {
        showToast({
          message: data.error || (language === 'en' ? 'Failed to delete draft' : '删除草稿失败'),
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      showToast({
        message: language === 'en' ? 'Error deleting draft' : '删除草稿时出错',
        type: 'error'
      })
    }
  }

  // Add athlete to team / 添加运动员到队伍
  const addAthleteToTeam = (athleteId: string, team: 'A' | 'B') => {
    const teamKey = team === 'A' ? 'team_a_athletes' : 'team_b_athletes'
    const otherTeamKey = team === 'A' ? 'team_b_athletes' : 'team_a_athletes'
    
    // Check if athlete is already on this team / 检查运动员是否已在此队伍
    if (currentDraft[teamKey].includes(athleteId)) {
      return
    }
    
    // Remove from other team if present / 如果在另一队伍则移除
    const otherTeamAthletes = currentDraft[otherTeamKey].filter(id => id !== athleteId)
    
    setCurrentDraft({
      ...currentDraft,
      [teamKey]: [...currentDraft[teamKey], athleteId],
      [otherTeamKey]: otherTeamAthletes
    })
  }

  // Remove athlete from team / 从队伍中移除运动员
  const removeAthleteFromTeam = (athleteId: string, team: 'A' | 'B') => {
    const teamKey = team === 'A' ? 'team_a_athletes' : 'team_b_athletes'
    
    setCurrentDraft({
      ...currentDraft,
      [teamKey]: currentDraft[teamKey].filter(id => id !== athleteId)
    })
  }

  // Filter athletes based on search, tier, and selection status / 根据搜索、等级和选择状态过滤运动员
  const filteredAthletes = availableAthletes.filter(athlete => {
    const matchesFilter = athleteFilter === '' || 
      athlete.profile_data?.name?.toLowerCase().includes(athleteFilter.toLowerCase()) ||
      athlete.profile_data?.sport?.toLowerCase().includes(athleteFilter.toLowerCase())
    
    const matchesTier = tierFilter === 'all' || athlete.tier === tierFilter
    
    // Exclude athletes that are already selected in either team / 排除已经在任一队伍中的运动员
    const isAlreadySelected = currentDraft.team_a_athletes.includes(athlete.id) || 
                             currentDraft.team_b_athletes.includes(athlete.id)
    
    return matchesFilter && matchesTier && !isAlreadySelected
  })

  // Get athlete details by ID / 根据ID获取运动员详情
  const getAthleteById = (id: string) => availableAthletes.find(a => a.id === id)

  // Render athlete card / 渲染运动员卡片
  const renderAthleteCard = (athlete: Athlete, isSelected: boolean = false, team?: 'A' | 'B') => (
    <div 
      key={athlete.id}
      className={`bg-slate-800/50 border rounded-xl p-4 transition-all duration-300 cursor-pointer ${
        isSelected 
          ? 'border-emerald-500/50 bg-emerald-500/10' 
          : 'border-slate-700/50 hover:border-slate-600/50'
      }`}
    >
      {/* Athlete Header / 运动员标题 */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {athlete.profile_data?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">
              {athlete.profile_data?.name || `Athlete ${athlete.id.slice(0, 8)}`}
            </h4>
            <p className="text-slate-400 text-xs">
              {athlete.profile_data?.sport || 'Soccer'} • {athlete.tier}
            </p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
          athlete.availability_status === 'available' 
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {athlete.availability_status}
        </div>
      </div>

      {/* Performance Stats / 表现统计 */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="text-center">
          <div className="text-slate-400">Rank</div>
          <div className="text-yellow-400 font-bold">{athlete.ranking}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Games</div>
          <div className="text-blue-400 font-bold">{athlete.matches_played}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400">Win%</div>
          <div className="text-emerald-400 font-bold">
            {athlete.matches_played > 0 ? Math.round((athlete.matches_won / athlete.matches_played) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Action Buttons / 操作按钮 */}
      <div className="flex gap-2">
        {!isSelected ? (
          <>
            <button
              onClick={() => addAthleteToTeam(athlete.id, 'A')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
            >
              + Team A
            </button>
            <button
              onClick={() => addAthleteToTeam(athlete.id, 'B')}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-lg transition-colors"
            >
              + Team B
            </button>
          </>
        ) : (
          <button
            onClick={() => removeAthleteFromTeam(athlete.id, team!)}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <FaMinus />
            <span>Remove</span>
          </button>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-xl p-8 flex items-center space-x-4">
          <FaSpinner className="text-blue-400 text-2xl animate-spin" />
          <span className="text-white text-lg">
            {language === 'en' ? 'Loading...' : '加载中...'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header / 标题 */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <FaUsers className="text-emerald-400 text-2xl" />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {language === 'en' ? 'Team Draft Manager' : '队伍草稿管理器'}
                </h2>
                <p className="text-slate-400">
                  {language === 'en' ? 'Select athletes and create team compositions' : '选择运动员并创建队伍组合'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tab Navigation / 标签导航 */}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'create'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'en' ? 'Create Draft' : '创建草稿'}
            </button>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'drafts'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'en' ? 'Saved Drafts' : '已保存草稿'} ({existingDrafts.length})
            </button>
          </div>
        </div>

        {/* Content Area / 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'create' ? (
            <div className="p-6 space-y-6">
              {/* Draft Settings / 草稿设置 */}
              <div className="bg-slate-900/50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <FaFootballBall className="text-emerald-400" />
                  <span>{language === 'en' ? 'Draft Settings' : '草稿设置'}</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      {language === 'en' ? 'Draft Name' : '草稿名称'}
                    </label>
                    <input
                      type="text"
                      value={currentDraft.draft_name}
                      onChange={(e) => setCurrentDraft({...currentDraft, draft_name: e.target.value})}
                      placeholder={language === 'en' ? 'Enter draft name...' : '输入草稿名称...'}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      {language === 'en' ? 'Team A Name' : '队伍A名称'}
                    </label>
                    <input
                      type="text"
                      value={currentDraft.team_a_name}
                      onChange={(e) => setCurrentDraft({...currentDraft, team_a_name: e.target.value})}
                      placeholder="Thunder Wolves"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      {language === 'en' ? 'Team B Name' : '队伍B名称'}
                    </label>
                    <input
                      type="text"
                      value={currentDraft.team_b_name}
                      onChange={(e) => setCurrentDraft({...currentDraft, team_b_name: e.target.value})}
                      placeholder="Lightning Hawks"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Team Composition / 队伍组成 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Team A */}
                <div className="bg-slate-900/50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-blue-400 flex items-center space-x-2">
                      <FaUsers />
                      <span>{currentDraft.team_a_name}</span>
                    </h3>
                    <span className="text-slate-400 text-sm">
                      {currentDraft.team_a_athletes.length} athletes
                    </span>
                  </div>
                  
                  <div className="space-y-3 min-h-[200px]">
                    {currentDraft.team_a_athletes.length === 0 ? (
                      <div className="text-center text-slate-400 py-8">
                        {language === 'en' ? 'No athletes selected' : '未选择运动员'}
                      </div>
                    ) : (
                      currentDraft.team_a_athletes.map(athleteId => {
                        const athlete = getAthleteById(athleteId)
                        return athlete ? renderAthleteCard(athlete, true, 'A') : null
                      })
                    )}
                  </div>
                </div>

                {/* Team B */}
                <div className="bg-slate-900/50 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-red-400 flex items-center space-x-2">
                      <FaUsers />
                      <span>{currentDraft.team_b_name}</span>
                    </h3>
                    <span className="text-slate-400 text-sm">
                      {currentDraft.team_b_athletes.length} athletes
                    </span>
                  </div>
                  
                  <div className="space-y-3 min-h-[200px]">
                    {currentDraft.team_b_athletes.length === 0 ? (
                      <div className="text-center text-slate-400 py-8">
                        {language === 'en' ? 'No athletes selected' : '未选择运动员'}
                      </div>
                    ) : (
                      currentDraft.team_b_athletes.map(athleteId => {
                        const athlete = getAthleteById(athleteId)
                        return athlete ? renderAthleteCard(athlete, true, 'B') : null
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Available Athletes / 可用运动员 */}
              <div className="bg-slate-900/50 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <FaTrophy className="text-yellow-400" />
                    <span>{language === 'en' ? 'Available Athletes' : '可用运动员'}</span>
                  </h3>
                  
                  {/* Filters / 过滤器 */}
                  <div className="flex space-x-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="text"
                        value={athleteFilter}
                        onChange={(e) => setAthleteFilter(e.target.value)}
                        placeholder={language === 'en' ? 'Search athletes...' : '搜索运动员...'}
                        className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="all">{language === 'en' ? 'All Tiers' : '所有等级'}</option>
                      <option value="platinum">Platinum</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="bronze">Bronze</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAthletes.length === 0 ? (
                    <div className="col-span-full text-center text-slate-400 py-8">
                      {language === 'en' ? 'No athletes found' : '未找到运动员'}
                    </div>
                  ) : (
                    filteredAthletes.map(athlete => renderAthleteCard(athlete))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Saved Drafts Tab / 已保存草稿标签 */
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {existingDrafts.length === 0 ? (
                  <div className="col-span-full text-center text-slate-400 py-12">
                    <FaUsers className="mx-auto text-4xl mb-4" />
                    <p className="text-lg">
                      {language === 'en' ? 'No saved drafts' : '没有保存的草稿'}
                    </p>
                    <p className="text-sm">
                      {language === 'en' ? 'Create your first team draft!' : '创建你的第一个队伍草稿！'}
                    </p>
                  </div>
                ) : (
                  existingDrafts.map(draft => (
                    <div key={draft.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-white font-bold">{draft.draft_name}</h4>
                          <p className="text-slate-400 text-sm">{draft.sport_type}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                          draft.status === 'draft' ? 'bg-amber-500/20 text-amber-400' :
                          draft.status === 'submitted' ? 'bg-blue-500/20 text-blue-400' :
                          draft.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {draft.status}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">{draft.team_a_name}:</span>
                          <span className="text-blue-400">{draft.team_a_athletes.length} athletes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">{draft.team_b_name}:</span>
                          <span className="text-red-400">{draft.team_b_athletes.length} athletes</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadDraft(draft)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                        >
                          <FaEdit />
                          <span>{language === 'en' ? 'Edit' : '编辑'}</span>
                        </button>
                        <button
                          onClick={() => handleDraftUse(draft)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1"
                        >
                          <FaCheckCircle />
                          <span>{language === 'en' ? 'Use' : '使用'}</span>
                        </button>
                        <button
                          onClick={() => deleteDraft(draft.id!)}
                          disabled={draft.status === 'approved'}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm py-2 px-3 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions / 底部操作 */}
        {activeTab === 'create' && (
          <div className="p-6 border-t border-slate-700/50">
            <div className="flex justify-between items-center">
              <div className="text-slate-400 text-sm">
                {language === 'en' 
                  ? `Total: ${currentDraft.team_a_athletes.length + currentDraft.team_b_athletes.length} athletes selected`
                  : `总计：已选择 ${currentDraft.team_a_athletes.length + currentDraft.team_b_athletes.length} 名运动员`
                }
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
                
                <button
                  onClick={saveDraft}
                  disabled={saving || !currentDraft.draft_name.trim()}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  <span>{saving ? (language === 'en' ? 'Saving...' : '保存中...') : (language === 'en' ? 'Save Draft' : '保存草稿')}</span>
                </button>
                
                {(currentDraft.team_a_athletes.length > 0 || currentDraft.team_b_athletes.length > 0) && (
                  <button
                    onClick={() => handleDraftUse(currentDraft)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FaCheckCircle />
                    <span>{language === 'en' ? 'Use for Event' : '用于赛事'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
} 