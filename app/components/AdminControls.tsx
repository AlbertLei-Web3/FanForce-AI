// AdminControls.tsx
// 管理员控制组件 / Admin Controls Component
// 提供管理员专用的比赛管理功能 / Provides admin-only match management functionality
// 包括奖励池注入、比赛结算和比赛重置 / Including reward pool injection, match settlement, and match reset
// 相关文件 / Related files:
// - FanForcePredictionDemo.sol: 智能合约管理员功能 / Smart contract admin functions
// - ContractContext.tsx: 合约交互上下文 / Contract interaction context
// - Web3Context.tsx: 钱包连接上下文 / Wallet connection context

import { useEffect, useState } from 'react'
import { useWeb3 } from '../context/Web3Context'
import { useContract } from '../context/ContractContext'

const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'

interface AdminControlsProps {
  matchId: number;
  teamAName?: string;
  teamBName?: string;
}

export default function AdminControls({ matchId, teamAName, teamBName }: AdminControlsProps) {
  const { address } = useWeb3()
  const { injectReward, settleMatch, resetMatch, loading, error, matchInfo } = useContract()
  const [isAdmin, setIsAdmin] = useState(false)
  const [rewardAmount, setRewardAmount] = useState('5')
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)

  useEffect(() => {
    setIsAdmin(address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase())
  }, [address])

  // 注入奖励处理 / Handle Reward Injection
  const handleInjectReward = async () => {
    const success = await injectReward(matchId, rewardAmount)
    if (success) {
      setShowRewardModal(false)
      setRewardAmount('5')
    }
  }

  // 结算比赛处理 / Handle Match Settlement
  const handleSettleMatch = async (result: 1 | 2) => {
    const success = await settleMatch(matchId, result)
    if (success) {
      setShowResultModal(false)
    }
  }

  // 重置比赛处理 / Handle Match Reset
  const handleResetMatch = async () => {
    if (confirm('Are you sure you want to reset this match? This will clear all bets and rewards.')) {
      await resetMatch(matchId)
    }
  }

  if (!isAdmin) return null

  return (
    <>
      <div className="mt-6 space-y-4">
        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-white font-medium mb-4 text-center">Admin Controls</h4>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setShowRewardModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading || !matchInfo}
            >
              Add Reward Pool
            </button>
            <button
              onClick={() => setShowResultModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading || !matchInfo || matchInfo.settled}
            >
              Announce Result
            </button>
            <button
              onClick={handleResetMatch}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={loading || !matchInfo}
            >
              Reset Match
            </button>
          </div>
          
          {matchInfo?.settled && (
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
              <p className="text-blue-400 text-center">
                Match settled! Winner: {matchInfo.result === 1 ? (teamAName || 'Team A') : (teamBName || 'Team B')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 奖励注入模态框 / Reward Injection Modal */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Add Reward Pool
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Reward Amount (CHZ)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-fanforce-primary focus:outline-none"
                placeholder="Enter reward amount"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRewardModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleInjectReward}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={loading || parseFloat(rewardAmount) <= 0}
              >
                {loading ? 'Processing...' : `Add ${rewardAmount} CHZ`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 结果公布模态框 / Result Announcement Modal */}
      {showResultModal && matchInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Announce Match Result
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-300 text-center mb-4">
                Select the winning team:
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleSettleMatch(1)}
                  className="w-full px-4 py-3 bg-fanforce-primary text-white rounded-lg hover:bg-fanforce-primary/80 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `${teamAName || 'Team A'} Wins`}
                </button>
                <button
                  onClick={() => handleSettleMatch(2)}
                  className="w-full px-4 py-3 bg-fanforce-secondary text-white rounded-lg hover:bg-fanforce-secondary/80 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : `${teamBName || 'Team B'} Wins`}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowResultModal(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
} 