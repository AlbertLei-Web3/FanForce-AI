// FanForce AI - Audience Event Stake Page / 观众赛事质押页面
// Static page showing teams with athlete cards for staking.
// 该页面为观众查看赛事并进行质押的静态实现，包含运动员卡片。

'use client'

import { useLanguage } from '../../../../context/LanguageContext'
import DashboardLayout from '../../../../components/shared/DashboardLayout'
import AthleteCard from '@/app/components/shared/AthleteCard';
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react';
import Modal from '@/app/components/shared/Modal';

interface PageProps {
  params: { eventId: string }
}

export default function AudienceEventStakePage({ params }: PageProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string, name: string } | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');

  const handleSupportClick = (team: { id: string, name: string }) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
    setStakeAmount('');
  };

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
        alert(language === 'en' ? 'Please enter a valid amount.' : '请输入有效的金额。');
        return;
    }
    // In a real app, here you would interact with a wallet/contract.
    // 在真实应用中，这里会与钱包/合约进行交互。
    console.log(`Staking ${stakeAmount} on ${selectedTeam?.name}`);
    
    // After staking, redirect to the success page.
    // 质押后，重定向到成功页面。
    router.push(`/dashboard/audience/events/${params.eventId}/success?team=${selectedTeam?.id}`);
  };

  // Mock Data
  const mockEvent = {
    id: params.eventId,
    title: language === 'en' ? 'Campus Basketball Final' : '校园篮球决赛',
  }

  const mockTeams = {
    teamA: {
      id: 'teamA',
      name: 'Team A: The Notorious',
      athletes: [
        { id: 'ath1', name: 'Athlete 1', imageUrl: '/placeholder.svg', height: `6'2"`, weight: '180 lbs', wins: 10, losses: 2 },
        { id: 'ath2', name: 'Athlete 2', imageUrl: '/placeholder.svg', height: `5'11"`, weight: '165 lbs', wins: 8, losses: 4 },
        { id: 'ath3', name: 'Athlete 3', imageUrl: '/placeholder.svg', height: `6'5"`, weight: '200 lbs', wins: 12, losses: 0 },
        { id: 'ath4', name: 'Athlete 4', imageUrl: '/placeholder.svg', height: `6'0"`, weight: '175 lbs', wins: 9, losses: 3 },
        { id: 'ath5', name: 'Athlete 5', imageUrl: '/placeholder.svg', height: `6'1"`, weight: '185 lbs', wins: 11, losses: 1 },
        { id: 'ath6', name: 'Athlete 6', imageUrl: '/placeholder.svg', height: `6'3"`, weight: '190 lbs', wins: 10, losses: 2 },
      ]
    },
    teamB: {
      id: 'teamB',
      name: 'Team B: Iron',
      athletes: [
        { id: 'ath7', name: 'Athlete 7', imageUrl: '/placeholder.svg', height: `6'3"`, weight: '185 lbs', wins: 11, losses: 1 },
        { id: 'ath8', name: 'Athlete 8', imageUrl: '/placeholder.svg', height: `6'0"`, weight: '170 lbs', wins: 7, losses: 5 },
        { id: 'ath9', name: 'Athlete 9', imageUrl: '/placeholder.svg', height: `6'4"`, weight: '195 lbs', wins: 10, losses: 2 },
        { id: 'ath10', name: 'Athlete 10', imageUrl: '/placeholder.svg', height: `5'10"`, weight: '160 lbs', wins: 6, losses: 6 },
        { id: 'ath11', name: 'Athlete 11', imageUrl: '/placeholder.svg', height: `6'2"`, weight: '180 lbs', wins: 9, losses: 3 },
        { id: 'ath12', name: 'Athlete 12', imageUrl: '/placeholder.svg', height: `6'6"`, weight: '210 lbs', wins: 13, losses: 0 },
      ]
    }
  };

  return (
    <DashboardLayout
      title={mockEvent.title}
      subtitle={language === 'en' ? 'Select a team to support' : '选择一支队伍以支持'}
      actions={
        <button onClick={() => router.back()} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
          {language === 'en' ? 'Back' : '返回'}
        </button>
      }
    >
      <div className="space-y-12">
        {/* Team Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Team A Section - 左侧队伍A的区域 */}
          {/* Team A Section - Area for Team A on the left */}
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center h-full">
            <div className="flex-grow w-full">
               <div className="flex justify-between items-center mb-6 w-full">
                <h2 className="text-3xl font-semibold">{mockTeams.teamA.name}</h2>
                <Link href={`/dashboard/audience/teams/${mockTeams.teamA.id}`} className="text-sm text-blue-400 hover:underline whitespace-nowrap ml-4">
                  {language === 'en' ? 'View More' : '查看更多'}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {/* 遍历并渲染队伍A的运动员卡片（仅显示前4名） */}
                {/* Loop and render athlete cards for Team A (showing only the first 4) */}
                {mockTeams.teamA.athletes.slice(0, 4).map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            </div>
            {/* 队伍A的支持按钮 */}
            {/* Support button for Team A */}
            <div className="mt-8 w-full">
              <button 
                onClick={() => handleSupportClick({ id: mockTeams.teamA.id, name: mockTeams.teamA.name })}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 w-full"
              >
                Support Team A
              </button>
            </div>
          </div>

          {/* Team B Section - 右侧队伍B的区域 */}
          {/* Team B Section - Area for Team B on the right */}
          <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center h-full">
            <div className="flex-grow w-full">
              <div className="flex justify-between items-center mb-6 w-full">
                <h2 className="text-3xl font-semibold">{mockTeams.teamB.name}</h2>
                <Link href={`/dashboard/audience/teams/${mockTeams.teamB.id}`} className="text-sm text-blue-400 hover:underline whitespace-nowrap ml-4">
                  {language === 'en' ? 'View More' : '查看更多'}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {/* 遍历并渲染队伍B的运动员卡片（仅显示前4名） */}
                {/* Loop and render athlete cards for Team B (showing only the first 4) */}
                {mockTeams.teamB.athletes.slice(0, 4).map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            </div>
            {/* 队伍B的支持按钮 */}
            {/* Support button for Team B */}
            <div className="mt-8 w-full">
              <button 
                onClick={() => handleSupportClick({ id: mockTeams.teamB.id, name: mockTeams.teamB.name })}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 w-full"
              >
                Support Team B
              </button>
            </div>
          </div>
        </div>

        {/* 移除了中央的支持按钮，将其分别置于各自队伍下方 */}
        {/* Removed the central support button, placing them under their respective teams */}
      </div>
      
      {/* Staking Modal - 质押模态框 */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={`${language === 'en' ? 'Support' : '支持'} ${selectedTeam?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="stakeAmount" className="block text-sm font-medium text-gray-300 mb-1">
              {language === 'en' ? 'Stake Amount (CHZ)' : '质押数量 (CHZ)'}
            </label>
            <input
              type="number"
              id="stakeAmount"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder={language === 'en' ? 'Enter amount' : '输入金额'}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleStake}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-500"
            disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
          >
            {language === 'en' ? 'Stake Now' : '立即质押'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  )
} 