// ContractContext.tsx - 简化版智能合约交互上下文
// Simplified Smart Contract Interaction Context
// 提供基本的合约交互功能，与现有Web3Context兼容
// Provides basic contract interaction functionality, compatible with existing Web3Context
// 关联文件: Web3Context.tsx (钱包连接), AdminPanel.tsx (管理员功能), page.tsx (主界面)
// 智能比赛连接逻辑，避免重复创建已存在的比赛 / Smart match connection logic to avoid recreating existing matches

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
  "function getMatch(uint256 matchId) external view returns (uint256, uint256, uint256, uint256, uint8, bool, bool)",
  "function getUserBet(uint256 matchId, address user) external view returns (uint8, uint256, bool)",
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
  rewardInjected: boolean
}

// 用户下注信息接口 / User Bet Info Interface
interface UserBet {
  team: number // 1 or 2, 0 means no bet
  amount: string // formatted ETH amount
  claimed: boolean
}

interface ContractContextType {
  loading: boolean
  error: string | null
  currentMatchId: number | null
  matchInfo: MatchInfo | null
  userBet: UserBet | null // 添加用户下注信息 / Add user bet info
  
  createMatch: (teamA: string, teamB: string) => Promise<number | null>
  connectToMatch: (teamA: string, teamB: string) => Promise<number | null> // 新增智能连接函数 / New smart connection function
  placeBet: (matchId: number, team: 1 | 2, amount: string) => Promise<boolean>
  injectReward: (matchId: number, amount: string) => Promise<boolean>
  settleMatch: (matchId: number, result: 1 | 2) => Promise<boolean>
  claimReward: (matchId: number) => Promise<boolean>
  resetMatch: (matchId: number) => Promise<boolean>
  refreshMatchInfo: (matchId: number) => Promise<void>
  refreshUserBet: (matchId: number) => Promise<void> // 添加刷新用户下注信息函数 / Add refresh user bet function
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWeb3()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMatchId, setCurrentMatchId] = useState<number | null>(null)
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [userBet, setUserBet] = useState<UserBet | null>(null) // 添加用户下注状态 / Add user bet state

  // 生成确定性比赛ID / Generate deterministic match ID
  const generateMatchId = (teamA: string, teamB: string): number => {
    // 标准化队伍名称顺序，确保A vs B 和 B vs A 产生相同ID / Normalize team order to ensure A vs B and B vs A generate same ID
    const teams = [teamA, teamB].sort()
    const teamKey = teams.join('-')
    
    // 使用简单哈希算法生成确定性ID / Use simple hash algorithm to generate deterministic ID
    let hash = 0
    for (let i = 0; i < teamKey.length; i++) {
      const char = teamKey.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    // 确保ID在合理范围内 / Ensure ID is in reasonable range
    return Math.abs(hash) % 900000 + 100000 // 100000-999999 range
  }

  // 检查比赛是否存在 / Check if match exists
  const checkMatchExists = async (matchId: number): Promise<boolean> => {
    try {
      if (!isConnected || !window.ethereum) return false
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      const info = await contract.getMatch(matchId)
      // 如果matchId > 0，说明比赛存在 / If matchId > 0, match exists
      return Number(info[0]) > 0
    } catch (error) {
      console.error('Error checking match existence:', error)
      return false
    }
  }

  // 获取合约实例
  const getContract = async () => {
    if (!isConnected || !window.ethereum) {
      throw new Error('Wallet not connected')
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }

  // 智能连接到比赛 / Smart connect to match
  const connectToMatch = async (teamA: string, teamB: string): Promise<number | null> => {
    try {
      setLoading(true)
      setError(null)
      
      // 生成确定性比赛ID / Generate deterministic match ID
      const matchId = generateMatchId(teamA, teamB)
      console.log(`Generated match ID ${matchId} for ${teamA} vs ${teamB}`)
      
      // 检查比赛是否已存在 / Check if match already exists
      const exists = await checkMatchExists(matchId)
      
      if (exists) {
        // 比赛已存在，直接连接 / Match exists, connect directly
        console.log(`Match ${matchId} already exists, connecting directly`)
        setCurrentMatchId(matchId)
        await refreshMatchInfo(matchId)
        await refreshUserBet(matchId)
        return matchId
      } else {
        // 比赛不存在，创建新比赛 / Match doesn't exist, create new one
        console.log(`Match ${matchId} doesn't exist, creating new match`)
        return await createMatch(teamA, teamB, matchId)
      }
      
    } catch (err: any) {
      console.error('Connect to match failed:', err)
      setError(err.message || 'Failed to connect to match')
      return null
    } finally {
      setLoading(false)
    }
  }

  // 创建比赛 (支持指定ID) / Create match (support specified ID)
  const createMatch = async (teamA: string, teamB: string, specifiedId?: number): Promise<number | null> => {
    try {
      setLoading(true)
      setError(null)
      
      // 使用指定ID或生成新ID / Use specified ID or generate new one
      const matchId = specifiedId || generateMatchId(teamA, teamB)
      
      const contract = await getContract()
      const tx = await contract.createMatch(matchId)
      await tx.wait()
      
      setCurrentMatchId(matchId)
      await refreshMatchInfo(matchId)
      await refreshUserBet(matchId) // 刷新用户下注信息 / Refresh user bet info
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
      await refreshUserBet(matchId) // 刷新用户下注信息 / Refresh user bet info
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
      await refreshUserBet(matchId) // 刷新用户下注信息 / Refresh user bet info
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
      
      await refreshUserBet(matchId) // 刷新用户下注信息 / Refresh user bet info
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
      await refreshUserBet(matchId) // 刷新用户下注信息 / Refresh user bet info
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
        settled: info[5],
        rewardInjected: info[6]
      })
    } catch (err) {
      console.error('Failed to refresh match info:', err)
    }
  }

  // 刷新用户下注信息 / Refresh User Bet Info
  const refreshUserBet = async (matchId: number): Promise<void> => {
    try {
      if (!isConnected || !window.ethereum || !address) {
        setUserBet(null)
        return
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      const betInfo = await contract.getUserBet(matchId, address)
      setUserBet({
        team: Number(betInfo[0]),
        amount: ethers.formatEther(betInfo[1]),
        claimed: betInfo[2]
      })
    } catch (err) {
      console.error('Failed to refresh user bet:', err)
      setUserBet(null)
    }
  }

  const contextValue: ContractContextType = {
    loading,
    error,
    currentMatchId,
    matchInfo,
    userBet, // 添加到context值 / Add to context value
    createMatch,
    connectToMatch, // 添加新函数 / Add new function
    placeBet,
    injectReward,
    settleMatch,
    claimReward,
    resetMatch,
    refreshMatchInfo,
    refreshUserBet // 添加到context值 / Add to context value
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