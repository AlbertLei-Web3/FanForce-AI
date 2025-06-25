// ContractContext.tsx
// 智能合约交互上下文 / Smart Contract Interaction Context
// 提供与FanForcePredictionDemo合约的完整交互功能 / Provides complete interaction with FanForcePredictionDemo contract
// 包括下注、管理员功能、数据获取等 / Including betting, admin functions, data fetching, etc.
// 相关文件 / Related files:
// - FanForcePredictionDemo.sol: 主智能合约 / Main smart contract
// - Web3Context.tsx: 钱包连接上下文 / Wallet connection context
// - deployment-info.json: 合约部署信息 / Contract deployment info

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from './Web3Context'

// 合约地址和ABI / Contract Address and ABI
const CONTRACT_ADDRESS = '0x0Aa8861bd3691F8dd92291Dd639d43ACb17aB5f5'
const CONTRACT_ABI = [
  // Constructor
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint8", "name": "team", "type": "uint8"},
      {"indexed": false, "internalType": "uint256", "name": "netAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"}
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "principal", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "rewardShare", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "fee", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "finalAmount", "type": "uint256"}
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "RewardInjected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256"},
      {"indexed": false, "internalType": "uint8", "name": "result", "type": "uint8"}
    ],
    "name": "MatchSettled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256"}
    ],
    "name": "MatchCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "matchId", "type": "uint256"}
    ],
    "name": "MatchReset",
    "type": "event"
  },
  // Functions
  {
    "inputs": [],
    "name": "ADMIN",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "teamA", "type": "string"},
      {"internalType": "string", "name": "teamB", "type": "string"}
    ],
    "name": "createMatch",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "matchId", "type": "uint256"},
      {"internalType": "uint8", "name": "team", "type": "uint8"}
    ],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "matchId", "type": "uint256"}],
    "name": "injectReward",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "matchId", "type": "uint256"},
      {"internalType": "uint8", "name": "result", "type": "uint8"}
    ],
    "name": "settleMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "matchId", "type": "uint256"}],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "matchId", "type": "uint256"}],
    "name": "resetMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "matchId", "type": "uint256"}],
    "name": "getMatchInfo",
    "outputs": [
      {"internalType": "string", "name": "teamA", "type": "string"},
      {"internalType": "string", "name": "teamB", "type": "string"},
      {"internalType": "uint256", "name": "totalTeamA", "type": "uint256"},
      {"internalType": "uint256", "name": "totalTeamB", "type": "uint256"},
      {"internalType": "uint256", "name": "rewardPool", "type": "uint256"},
      {"internalType": "uint8", "name": "result", "type": "uint8"},
      {"internalType": "bool", "name": "settled", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "matchId", "type": "uint256"},
      {"internalType": "address", "name": "user", "type": "address"}
    ],
    "name": "getUserBet",
    "outputs": [
      {"internalType": "uint8", "name": "team", "type": "uint8"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "bool", "name": "claimed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

// 接口定义 / Interface Definitions
interface MatchInfo {
  teamA: string
  teamB: string
  totalTeamA: string
  totalTeamB: string
  rewardPool: string
  result: number
  settled: boolean
}

interface UserBet {
  team: number
  amount: string
  claimed: boolean
}

interface ContractContextType {
  // 合约实例 / Contract Instance
  contract: ethers.Contract | null
  
  // 状态 / State
  loading: boolean
  error: string | null
  
  // 匹配数据 / Match Data
  currentMatchId: number | null
  matchInfo: MatchInfo | null
  userBet: UserBet | null
  
  // 功能函数 / Functions
  createMatch: (teamA: string, teamB: string) => Promise<number | null>
  placeBet: (matchId: number, team: 1 | 2, amount: string) => Promise<boolean>
  injectReward: (matchId: number, amount: string) => Promise<boolean>
  settleMatch: (matchId: number, result: 1 | 2) => Promise<boolean>
  claimReward: (matchId: number) => Promise<boolean>
  resetMatch: (matchId: number) => Promise<boolean>
  
  // 数据获取 / Data Fetching
  refreshMatchInfo: (matchId: number) => Promise<void>
  refreshUserBet: (matchId: number) => Promise<void>
}

const ContractContext = createContext<ContractContextType | undefined>(undefined)

export function ContractProvider({ children }: { children: ReactNode }) {
  const { provider, signer, address } = useWeb3()
  
  // 状态管理 / State Management
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMatchId, setCurrentMatchId] = useState<number | null>(null)
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [userBet, setUserBet] = useState<UserBet | null>(null)

  // 初始化合约 / Initialize Contract
  useEffect(() => {
    if (provider) {
      try {
        const contractInstance = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer || provider
        )
        setContract(contractInstance)
        setError(null)
      } catch (err) {
        console.error('Contract initialization failed:', err)
        setError('Failed to initialize contract')
      }
    }
  }, [provider, signer])

  // 创建匹配 / Create Match
  const createMatch = async (teamA: string, teamB: string): Promise<number | null> => {
    if (!contract || !signer) {
      setError('Contract or signer not available')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const tx = await contract.createMatch(teamA, teamB)
      const receipt = await tx.wait()
      
      // 从事件中获取matchId / Get matchId from event
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('MatchCreated(uint256)')
      )
      
      if (event) {
        const matchId = parseInt(event.topics[1], 16)
        setCurrentMatchId(matchId)
        await refreshMatchInfo(matchId)
        return matchId
      }
      
      return null
    } catch (err: any) {
      console.error('Create match failed:', err)
      setError(err.message || 'Failed to create match')
      return null
    } finally {
      setLoading(false)
    }
  }

  // 下注 / Place Bet
  const placeBet = async (matchId: number, team: 1 | 2, amount: string): Promise<boolean> => {
    if (!contract || !signer) {
      setError('Contract or signer not available')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      
      const betAmount = ethers.parseEther(amount)
      const tx = await contract.placeBet(matchId, team, { value: betAmount })
      await tx.wait()
      
      // 刷新数据 / Refresh data
      await refreshMatchInfo(matchId)
      await refreshUserBet(matchId)
      
      return true
    } catch (err: any) {
      console.error('Place bet failed:', err)
      setError(err.message || 'Failed to place bet')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 注入奖励 / Inject Reward
  const injectReward = async (matchId: number, amount: string): Promise<boolean> => {
    if (!contract || !signer) {
      setError('Contract or signer not available')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      
      const rewardAmount = ethers.parseEther(amount)
      const tx = await contract.injectReward(matchId, { value: rewardAmount })
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

  // 结算比赛 / Settle Match
  const settleMatch = async (matchId: number, result: 1 | 2): Promise<boolean> => {
    if (!contract || !signer) {
      setError('Contract or signer not available')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      
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

  // 领取奖励 / Claim Reward
  const claimReward = async (matchId: number): Promise<boolean> => {
    if (!contract || !signer) {
      setError('Contract or signer not available')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      
      const tx = await contract.claimReward(matchId)
      await tx.wait()
      
      await refreshUserBet(matchId)
      return true
    } catch (err: any) {
      console.error('Claim reward failed:', err)
      setError(err.message || 'Failed to claim reward')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 重置比赛 / Reset Match
  const resetMatch = async (matchId: number): Promise<boolean> => {
    if (!contract || !signer) {
      setError('Contract or signer not available')
      return false
    }

    try {
      setLoading(true)
      setError(null)
      
      const tx = await contract.resetMatch(matchId)
      await tx.wait()
      
      await refreshMatchInfo(matchId)
      await refreshUserBet(matchId)
      return true
    } catch (err: any) {
      console.error('Reset match failed:', err)
      setError(err.message || 'Failed to reset match')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 刷新比赛信息 / Refresh Match Info
  const refreshMatchInfo = async (matchId: number): Promise<void> => {
    if (!contract) return

    try {
      const info = await contract.getMatchInfo(matchId)
      setMatchInfo({
        teamA: info[0],
        teamB: info[1],
        totalTeamA: ethers.formatEther(info[2]),
        totalTeamB: ethers.formatEther(info[3]),
        rewardPool: ethers.formatEther(info[4]),
        result: info[5],
        settled: info[6]
      })
    } catch (err) {
      console.error('Failed to refresh match info:', err)
    }
  }

  // 刷新用户下注信息 / Refresh User Bet Info
  const refreshUserBet = async (matchId: number): Promise<void> => {
    if (!contract || !address) return

    try {
      const bet = await contract.getUserBet(matchId, address)
      setUserBet({
        team: bet[0],
        amount: ethers.formatEther(bet[1]),
        claimed: bet[2]
      })
    } catch (err) {
      console.error('Failed to refresh user bet:', err)
    }
  }

  const contextValue: ContractContextType = {
    contract,
    loading,
    error,
    currentMatchId,
    matchInfo,
    userBet,
    createMatch,
    placeBet,
    injectReward,
    settleMatch,
    claimReward,
    resetMatch,
    refreshMatchInfo,
    refreshUserBet
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