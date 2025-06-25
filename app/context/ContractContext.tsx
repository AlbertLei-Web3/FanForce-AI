// ContractContext.tsx - 简化版智能合约交互上下文
// Simplified Smart Contract Interaction Context
// 提供基本的合约交互功能，与现有Web3Context兼容
// Provides basic contract interaction functionality, compatible with existing Web3Context

'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from './Web3Context'

// 扩展Window接口
declare global {
  interface Window {
    ethereum?: any
  }
}

// 合约地址
const CONTRACT_ADDRESS = '0x0Aa8861bd3691F8dd92291Dd639d43ACb17aB5f5'

// 简化的合约ABI - 只包含我们需要的函数
const CONTRACT_ABI = [
  "function createMatch(uint256 matchId) external",
  "function placeBet(uint256 matchId, uint8 team, uint256 amount) external payable",
  "function injectReward(uint256 matchId, uint256 amount) external payable",
  "function settleMatch(uint256 matchId, uint8 result) external",
  "function claimReward(uint256 matchId) external",
  "function resetMatch(uint256 matchId) external",
  "function getMatch(uint256 matchId) external view returns (uint256, uint256, uint256, uint256, uint8, bool)",
  "function ADMIN() external view returns (address)"
]

// 接口定义
interface MatchInfo {
  matchId: number
  totalTeamA: string
  totalTeamB: string
  rewardPool: string
  result: number
  settled: boolean
}

interface ContractContextType {
  loading: boolean
  error: string | null
  currentMatchId: number | null
  matchInfo: MatchInfo | null
  
  createMatch: (teamA: string, teamB: string) => Promise<number | null>
  placeBet: (matchId: number, team: 1 | 2, amount: string) => Promise<boolean>
  injectReward: (matchId: number, amount: string) => Promise<boolean>
  settleMatch: (matchId: number, result: 1 | 2) => Promise<boolean>
  claimReward: (matchId: number) => Promise<boolean>
  resetMatch: (matchId: number) => Promise<boolean>
  refreshMatchInfo: (matchId: number) => Promise<void>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWeb3()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMatchId, setCurrentMatchId] = useState<number | null>(null)
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)

  // 获取合约实例
  const getContract = async () => {
    if (!isConnected || !window.ethereum) {
      throw new Error('Wallet not connected')
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }

  // 创建比赛
  const createMatch = async (teamA: string, teamB: string): Promise<number | null> => {
    try {
      setLoading(true)
      setError(null)
      
      // 生成matchId
      const timestamp = Math.floor(Date.now() / 1000)
      const matchId = timestamp % 999999
      
      const contract = await getContract()
      const tx = await contract.createMatch(matchId)
      await tx.wait()
      
      setCurrentMatchId(matchId)
      await refreshMatchInfo(matchId)
      return matchId
      
    } catch (err: any) {
      console.error('Create match failed:', err)
      setError(err.message || 'Failed to create match')
      return null
    } finally {
      setLoading(false)
    }
  }

  // 下注
  const placeBet = async (matchId: number, team: 1 | 2, amount: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const contract = await getContract()
      const betAmount = ethers.parseEther(amount)
      const tx = await contract.placeBet(matchId, team, betAmount, { value: betAmount })
      await tx.wait()
      
      await refreshMatchInfo(matchId)
      return true
      
    } catch (err: any) {
      console.error('Place bet failed:', err)
      setError(err.message || 'Failed to place bet')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 注入奖励
  const injectReward = async (matchId: number, amount: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const contract = await getContract()
      const rewardAmount = ethers.parseEther(amount)
      const tx = await contract.injectReward(matchId, rewardAmount, { value: rewardAmount })
      await tx.wait()
      
      await refreshMatchInfo(matchId)
      return true
      
    } catch (err: any) {
      console.error('Inject reward failed:', err)
      setError(err.message || 'Failed to inject reward')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 结算比赛
  const settleMatch = async (matchId: number, result: 1 | 2): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const contract = await getContract()
      const tx = await contract.settleMatch(matchId, result)
      await tx.wait()
      
      await refreshMatchInfo(matchId)
      return true
      
    } catch (err: any) {
      console.error('Settle match failed:', err)
      setError(err.message || 'Failed to settle match')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 领取奖励
  const claimReward = async (matchId: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const contract = await getContract()
      const tx = await contract.claimReward(matchId)
      await tx.wait()
      
      return true
      
    } catch (err: any) {
      console.error('Claim reward failed:', err)
      setError(err.message || 'Failed to claim reward')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 重置比赛
  const resetMatch = async (matchId: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const contract = await getContract()
      const tx = await contract.resetMatch(matchId)
      await tx.wait()
      
      await refreshMatchInfo(matchId)
      return true
      
    } catch (err: any) {
      console.error('Reset match failed:', err)
      setError(err.message || 'Failed to reset match')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 刷新比赛信息
  const refreshMatchInfo = async (matchId: number): Promise<void> => {
    try {
      if (!isConnected || !window.ethereum) return
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      const info = await contract.getMatch(matchId)
      setMatchInfo({
        matchId: Number(info[0]),
        totalTeamA: ethers.formatEther(info[1]),
        totalTeamB: ethers.formatEther(info[2]),
        rewardPool: ethers.formatEther(info[3]),
        result: Number(info[4]),
        settled: info[5]
      })
    } catch (err) {
      console.error('Failed to refresh match info:', err)
    }
  }

  const contextValue: ContractContextType = {
    loading,
    error,
    currentMatchId,
    matchInfo,
    createMatch,
    placeBet,
    injectReward,
    settleMatch,
    claimReward,
    resetMatch,
    refreshMatchInfo
  }

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  )
}

export function useContract() {
  const context = useContext(ContractContext)
  if (context === undefined) {
    throw new Error('useContract must be used within a ContractProvider')
  }
  return context
} 