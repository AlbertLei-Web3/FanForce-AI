'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '../../../context/LanguageContext'
import { useToast } from '../../../components/shared/Toast'
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaTrophy,
  FaSave,
  FaSpinner,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaClock,
  FaEdit,
  FaTrash
} from 'react-icons/fa'

// Interface definitions / 接口定义
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

interface EventApplication {
  id?: string
  ambassador_id: string
  event_name: string
  event_description: string
  event_date: string
  event_time: string
  venue: string
  sport_type: string
  team_a_name: string
  team_a_athletes: string[]
  team_a_metadata: any
  team_b_name: string
  team_b_athletes: string[]
  team_b_metadata: any
  estimated_duration: number
  expected_audience: number
  ticket_price: number
  application_notes: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at?: string
  updated_at?: string
}

export default function EventApplicationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const { showToast, ToastContainer } = useToast()
  
  // State management / 状态管理
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<TeamDraft | null>(null)
  const [application, setApplication] = useState<EventApplication>({
    ambassador_id: '',
    event_name: '',
    event_description: '',
    event_date: '',
    event_time: '',
    venue: '',
    sport_type: 'soccer',
    team_a_name: '',
    team_a_athletes: [],
    team_a_metadata: {},
    team_b_name: '',
    team_b_athletes: [],
    team_b_metadata: {},
    estimated_duration: 90,
    expected_audience: 100,
    ticket_price: 0,
    application_notes: '',
    status: 'pending'
  })

  // Load draft data from URL parameters / 从URL参数加载草稿数据
  useEffect(() => {
    const draftId = searchParams.get('draft_id')
    if (draftId) {
      loadDraftData(draftId)
    }
  }, [searchParams])

  // Load draft data / 加载草稿数据
  const loadDraftData = async (draftId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ambassador/team-drafts?draft_id=${draftId}`)
      const data = await response.json()
      
      if (data.success && data.draft) {
        const draft = data.draft
        setSelectedDraft(draft)
        
        // Pre-populate application with draft data / 用草稿数据预填充申请
        setApplication(prev => ({
          ...prev,
          ambassador_id: draft.ambassador_id,
          sport_type: draft.sport_type,
          team_a_name: draft.team_a_name,
          team_a_athletes: draft.team_a_athletes,
          team_a_metadata: draft.team_a_metadata,
          team_b_name: draft.team_b_name,
          team_b_athletes: draft.team_b_athletes,
          team_b_metadata: draft.team_b_metadata,
          estimated_duration: draft.estimated_duration,
          application_notes: draft.match_notes || '',
          event_name: `${draft.team_a_name} vs ${draft.team_b_name}`,
          event_description: `${draft.sport_type} match between ${draft.team_a_name} and ${draft.team_b_name}`
        }))
      } else {
        showToast({
          message: language === 'en' ? 'Failed to load draft data' : '加载草稿数据失败',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error loading draft data:', error)
      showToast({
        message: language === 'en' ? 'Error loading draft data' : '加载草稿数据时出错',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission / 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!application.event_name.trim() || !application.venue.trim() || !application.event_date) {
      showToast({
        message: language === 'en' ? 'Please fill in all required fields' : '请填写所有必填字段',
        type: 'warning'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/ambassador/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(application)
      })

      const data = await response.json()
      
      if (data.success) {
        showToast({
          message: language === 'en' ? 'Event application submitted successfully!' : '赛事申请提交成功！',
          type: 'success'
        })
        
        // Redirect to ambassador dashboard / 重定向到大使仪表板
        setTimeout(() => {
          router.push('/dashboard/ambassador')
        }, 2000)
      } else {
        showToast({
          message: data.error || (language === 'en' ? 'Failed to submit application' : '提交申请失败'),
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      showToast({
        message: language === 'en' ? 'Error submitting application' : '提交申请时出错',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes / 处理输入变化
  const handleInputChange = (field: keyof EventApplication, value: any) => {
    setApplication(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-emerald-400 mx-auto mb-4" />
          <p className="text-white">
            {language === 'en' ? 'Loading draft data...' : '加载草稿数据中...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <ToastContainer />
      
      {/* Header / 头部 */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <h1 className="text-2xl font-bold text-white">
                {language === 'en' ? 'Event Application' : '赛事申请'}
              </h1>
            </div>
            
            {selectedDraft && (
              <div className="text-slate-400 text-sm">
                {language === 'en' ? 'Based on draft:' : '基于草稿：'} {selectedDraft.draft_name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content / 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Event Details Section / 赛事详情部分 */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaCalendarAlt className="text-emerald-400" />
              <span>{language === 'en' ? 'Event Details' : '赛事详情'}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Name / 赛事名称 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Event Name' : '赛事名称'} *
                </label>
                <input
                  type="text"
                  value={application.event_name}
                  onChange={(e) => handleInputChange('event_name', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  placeholder={language === 'en' ? 'Enter event name' : '输入赛事名称'}
                  required
                />
              </div>

              {/* Sport Type / 运动类型 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Sport Type' : '运动类型'} *
                </label>
                <select
                  value={application.sport_type}
                  onChange={(e) => handleInputChange('sport_type', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="soccer">Soccer / 足球</option>
                  <option value="basketball">Basketball / 篮球</option>
                  <option value="tennis">Tennis / 网球</option>
                  <option value="volleyball">Volleyball / 排球</option>
                  <option value="badminton">Badminton / 羽毛球</option>
                </select>
              </div>

              {/* Event Date / 赛事日期 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Event Date' : '赛事日期'} *
                </label>
                <input
                  type="date"
                  value={application.event_date}
                  onChange={(e) => handleInputChange('event_date', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* Event Time / 赛事时间 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Event Time' : '赛事时间'} *
                </label>
                <input
                  type="time"
                  value={application.event_time}
                  onChange={(e) => handleInputChange('event_time', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              {/* Venue / 场地 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Venue' : '场地'} *
                </label>
                <input
                  type="text"
                  value={application.venue}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  placeholder={language === 'en' ? 'Enter venue address' : '输入场地地址'}
                  required
                />
              </div>

              {/* Event Description / 赛事描述 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Event Description' : '赛事描述'}
                </label>
                <textarea
                  value={application.event_description}
                  onChange={(e) => handleInputChange('event_description', e.target.value)}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  placeholder={language === 'en' ? 'Describe the event...' : '描述赛事...'}
                />
              </div>
            </div>
          </div>

          {/* Team Information Section / 队伍信息部分 */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaUsers className="text-blue-400" />
              <span>{language === 'en' ? 'Team Information' : '队伍信息'}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team A / 队伍A */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  {application.team_a_name}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{language === 'en' ? 'Athletes:' : '运动员：'}</span>
                    <span className="text-blue-400 font-medium">{application.team_a_athletes.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{language === 'en' ? 'Status:' : '状态：'}</span>
                    <span className="text-emerald-400 font-medium">
                      {language === 'en' ? 'Ready' : '就绪'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Team B / 队伍B */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-400 mb-4">
                  {application.team_b_name}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{language === 'en' ? 'Athletes:' : '运动员：'}</span>
                    <span className="text-red-400 font-medium">{application.team_b_athletes.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{language === 'en' ? 'Status:' : '状态：'}</span>
                    <span className="text-emerald-400 font-medium">
                      {language === 'en' ? 'Ready' : '就绪'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Duration / 比赛时长 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {language === 'en' ? 'Estimated Duration (minutes)' : '预计时长（分钟）'}
              </label>
              <input
                type="number"
                value={application.estimated_duration}
                onChange={(e) => handleInputChange('estimated_duration', parseInt(e.target.value) || 90)}
                min="30"
                max="180"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Business Details Section / 商业详情部分 */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaTrophy className="text-yellow-400" />
              <span>{language === 'en' ? 'Business Details' : '商业详情'}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expected Audience / 预期观众 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Expected Audience Size' : '预期观众人数'}
                </label>
                <input
                  type="number"
                  value={application.expected_audience}
                  onChange={(e) => handleInputChange('expected_audience', parseInt(e.target.value) || 100)}
                  min="10"
                  max="10000"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Ticket Price / 票价 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {language === 'en' ? 'Ticket Price (CHZ)' : '票价（CHZ）'}
                </label>
                <input
                  type="number"
                  value={application.ticket_price}
                  onChange={(e) => handleInputChange('ticket_price', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Application Notes / 申请备注 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {language === 'en' ? 'Additional Notes' : '附加备注'}
              </label>
              <textarea
                value={application.application_notes}
                onChange={(e) => handleInputChange('application_notes', e.target.value)}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                placeholder={language === 'en' ? 'Any additional information about the event...' : '关于赛事的任何附加信息...'}
              />
            </div>
          </div>

          {/* Submit Section / 提交部分 */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="text-slate-400 text-sm">
                {language === 'en' 
                  ? 'All fields marked with * are required'
                  : '标记 * 的字段为必填项'
                }
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  {language === 'en' ? 'Cancel' : '取消'}
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {saving ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  <span>
                    {saving 
                      ? (language === 'en' ? 'Submitting...' : '提交中...')
                      : (language === 'en' ? 'Submit Application' : '提交申请')
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 