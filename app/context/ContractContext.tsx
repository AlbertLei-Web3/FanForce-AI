// ContractContext.tsx - 简化版智能合约交互上下文
// Simplified Smart Contract Interaction Context
// 提供基本的合约交互功能，与现有Web3Context兼容
// Provides basic contract interaction functionality, compatible with existing Web3Context
// 关联文件: Web3Context.tsx (钱包连接), AdminPanel.tsx (管理员功能), page.tsx (主界面)
// 智能比赛连接逻辑，避免重复创建已存在的比赛 / Smart match connection logic to avoid recreating existing matches

'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
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
  teamA?: string // 添加队伍A名称 / Add team A name
  teamB?: string // 添加队伍B名称 / Add team B name
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
  refreshMatchInfo: (matchId: number, teamA?: string, teamB?: string) => Promise<void>
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

  // 钱包地址变化时清理状态 / Clear states when wallet address changes
  useEffect(() => {
    // 清理错误状态 / Clear error state
    setError(null)
    // 清理用户下注信息 / Clear user bet info
    setUserBet(null)
    // 如果有当前比赛，重新获取用户下注信息 / If there's current match, refresh user bet info
    if (currentMatchId && address && isConnected) {
      refreshUserBet(currentMatchId)
    }
  }, [address, isConnected])

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

  // 生成唯一比赛ID（避免用户重复下注问题）/ Generate unique match ID (avoid user duplicate betting issue)
  const generateUniqueMatchId = (teamA: string, teamB: string): number => {
    // 使用时间戳和随机数生成唯一ID / Use timestamp and random number for unique ID
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const baseId = generateMatchId(teamA, teamB)
    
    // 组合生成唯一ID / Combine to generate unique ID
    return (baseId + timestamp + random) % 900000 + 100000
  }

  // 检查用户是否已在指定比赛中下注 / Check if user has already bet in specified match
  const checkUserAlreadyBet = async (matchId: number, userAddress: string): Promise<boolean> => {
    try {
      if (!isConnected || !window.ethereum) return false
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      const userBet = await contract.getUserBet(matchId, userAddress)
      // 如果amount > 0，说明用户已下注 / If amount > 0, user has already bet
      return Number(userBet[1]) > 0
    } catch (error) {
      console.error('Error checking user bet status:', error)
      return false
    }
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
    
    // 强制创建新的提供者实例，避免缓存问题 / Force create new provider instance to avoid cache issues
    const provider = new ethers.BrowserProvider(window.ethereum, 'any')
    
    // 强制重新请求账户，确保获取当前活跃钱包 / Force re-request accounts to ensure current active wallet
    await provider.send('eth_requestAccounts', [])
    
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()
    
    // 验证签名者地址与当前连接地址一致 / Verify signer address matches current connected address
    if (address && signerAddress.toLowerCase() !== address.toLowerCase()) {
      throw new Error(`Address mismatch: Expected ${address}, got ${signerAddress}. Please refresh and reconnect wallet.`)
    }
    
    console.log('✅ Contract created with signer:', signerAddress)
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }

  // 智能连接到比赛 / Smart connect to match
  const connectToMatch = async (teamA: string, teamB: string): Promise<number | null> => {
    try {
      setLoading(true)
      setError(null)
      
      // 获取当前用户地址 / Get current user address
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      // 检查当前用户是否为管理员 / Check if current user is admin
      const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'
      const isAdmin = userAddress.toLowerCase() === ADMIN_ADDRESS.toLowerCase()
      
      console.log(`🔍 ConnectToMatch Debug - User: ${userAddress}, IsAdmin: ${isAdmin}`)
      console.log(`🔍 Teams: ${teamA} vs ${teamB}`)
      
      // 生成确定性比赛ID / Generate deterministic match ID
      let matchId = generateMatchId(teamA, teamB)
      console.log(`🔍 Generated deterministic match ID: ${matchId}`)
      
      // 检查比赛是否已存在 / Check if match already exists
      let exists = await checkMatchExists(matchId)
      console.log(`🔍 Deterministic match ${matchId} exists: ${exists}`)
      
      // 如果确定性ID找不到比赛，尝试搜索可能的比赛ID / If deterministic ID doesn't find match, try searching possible match IDs
      if (!exists) {
        console.log(`🔍 Deterministic match not found, searching for existing matches...`)
        
        // 尝试搜索一系列可能的比赛ID / Try searching a range of possible match IDs
        const possibleMatchIds = await searchExistingMatches(teamA, teamB)
        
        if (possibleMatchIds.length > 0) {
          // 找到了现有比赛，使用第一个 / Found existing match, use the first one
          matchId = possibleMatchIds[0]
          exists = true
          console.log(`🔍 Found existing match: ${matchId}`)
        } else {
          console.log(`🔍 No existing matches found for these teams`)
        }
      }
      
      if (exists) {
        // 比赛已存在，检查用户是否已下注 / Match exists, check if user already bet
        const userAlreadyBet = await checkUserAlreadyBet(matchId, userAddress)
        console.log(`🔍 User already bet on match ${matchId}: ${userAlreadyBet}`)
        
        if (userAlreadyBet) {
          if (isAdmin) {
            // 管理员已下注，生成新的唯一ID创建新比赛 / Admin already bet, generate new unique ID for new match
            console.log(`Admin already bet on match ${matchId}, generating unique ID for new match`)
            matchId = generateUniqueMatchId(teamA, teamB)
            console.log(`Generated unique match ID ${matchId} for ${teamA} vs ${teamB}`)
            return await createMatch(teamA, teamB, matchId)
          } else {
            // 用户已下注，但仍然需要连接到比赛以加载状态 / User already bet, but still need to connect to match to load state
            console.log(`✅ User already bet on match ${matchId}, connecting to load state`)
            setCurrentMatchId(matchId)
            await refreshMatchInfo(matchId, teamA, teamB) // 传递队伍名称 / Pass team names
            await refreshUserBet(matchId)
            return matchId
          }
        } else {
          // 用户未下注，直接连接现有比赛 / User hasn't bet, connect to existing match
          console.log(`✅ Match ${matchId} exists, user hasn't bet yet, connecting directly`)
          setCurrentMatchId(matchId)
          await refreshMatchInfo(matchId, teamA, teamB) // 传递队伍名称 / Pass team names
          await refreshUserBet(matchId)
          return matchId
        }
      } else {
        if (isAdmin) {
          // 比赛不存在，管理员可以创建新比赛 / Match doesn't exist, admin can create new one
          console.log(`Match ${matchId} doesn't exist, admin creating new match`)
          return await createMatch(teamA, teamB, matchId)
        } else {
          // 比赛不存在，用户不能创建比赛，提示错误 / Match doesn't exist, user cannot create match, show error
          throw new Error('This match does not exist. Please contact admin to create this match first. / 此比赛不存在，请联系管理员先创建此比赛。')
        }
      }
      
    } catch (err: any) {
      console.error('❌ Connect to match failed:', err)
      setError(err.message || 'Failed to connect to match')
      // 确保失败时清理状态 / Ensure state cleanup on failure
      setCurrentMatchId(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  // 搜索现有比赛的函数 / Function to search existing matches
  const searchExistingMatches = async (teamA: string, teamB: string): Promise<number[]> => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      const foundMatches: number[] = []
      
      // 搜索策略1: 直接搜索用户提到的比赛ID / Search strategy 1: Direct search for user-mentioned match IDs
      const knownMatchIds = [865671, 118499] // 添加用户提到的具体比赛ID
      console.log(`🔍 Searching known match IDs: ${knownMatchIds.join(', ')}`)
      
      for (const testId of knownMatchIds) {
        try {
          const matchInfo = await contract.getMatch(testId)
          if (Number(matchInfo[0]) > 0) {
            console.log(`✅ Found known match ${testId}`)
            foundMatches.push(testId)
          }
        } catch (error) {
          console.log(`❌ Known match ${testId} not found`)
        }
      }
      
      // 如果找到了已知比赛，直接返回 / If found known matches, return directly
      if (foundMatches.length > 0) {
        return foundMatches
      }
      
      // 搜索策略2: 尝试不同的队伍名称格式 / Search strategy 2: Try different team name formats
      const teamVariations = [
        [teamA, teamB],
        [teamA.split('|')[0], teamB.split('|')[0]], // 只用英文名 / English name only
        [teamA.split('|')[0] || teamA, teamB.split('|')[0] || teamB], // 安全分割 / Safe split
        // 尝试自定义队伍的原始名称 / Try original names for custom teams
        [teamA.replace(/team_\d+/, ''), teamB.replace(/team_\d+/, '')],
      ]
      
      for (const [tA, tB] of teamVariations) {
        if (!tA || !tB) continue // 跳过空名称
        
        const testId = generateMatchId(tA, tB)
        console.log(`🔍 Testing match ID ${testId} for ${tA} vs ${tB}`)
        
        try {
          const matchInfo = await contract.getMatch(testId)
          if (Number(matchInfo[0]) > 0) {
            console.log(`✅ Found match ${testId}`)
            foundMatches.push(testId)
          }
        } catch (error) {
          // 忽略查询错误，继续搜索 / Ignore query errors, continue searching
        }
      }
      
      // 搜索策略3: 广泛搜索可能的比赛ID范围 / Search strategy 3: Wide search of possible match ID ranges
      if (foundMatches.length === 0) {
        console.log(`🔍 Performing wide range search...`)
        
        // 搜索常见的ID范围 / Search common ID ranges
        const searchRanges = [
          { start: 100000, end: 200000 }, // 6位数范围
          { start: 800000, end: 900000 }, // 用户提到的865671在这个范围
          { start: 500000, end: 600000 }, // 其他可能范围
        ]
        
        for (const range of searchRanges) {
          for (let testId = range.start; testId <= range.end; testId += 1000) { // 每1000个ID检查一次
            try {
              const matchInfo = await contract.getMatch(testId)
              if (Number(matchInfo[0]) > 0) {
                console.log(`✅ Found match in range search: ${testId}`)
                foundMatches.push(testId)
                if (foundMatches.length >= 5) break // 最多找5个就够了
              }
            } catch (error) {
              // 忽略查询错误 / Ignore query errors
            }
          }
          if (foundMatches.length > 0) break // 找到就停止
        }
      }
      
      return foundMatches
      
    } catch (error) {
      console.error('Error searching existing matches:', error)
      return []
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
      await refreshMatchInfo(matchId, teamA, teamB) // 传递队伍名称 / Pass team names
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
      
      // 下注前检查用户是否已下注 / Check if user already bet before placing bet
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
      
      const userAlreadyBet = await checkUserAlreadyBet(matchId, userAddress)
      if (userAlreadyBet) {
        throw new Error('You have already placed a bet on this match / 您已经在此比赛中下过注了')
      }
      
      const contract = await getContract()
      const betAmount = ethers.parseEther(amount)
      const tx = await contract.placeBet(matchId, team, betAmount, { value: betAmount })
      await tx.wait()
      
      await refreshMatchInfo(matchId)
      await refreshUserBet(matchId) // 刷新用户下注信息 / Refresh user bet info
      return true
      
    } catch (err: any) {
      console.error('Place bet failed:', err)
      
      // 特殊处理"Already bet"错误 / Special handling for "Already bet" error
      if (err.message && err.message.includes('Already bet')) {
        setError('You have already placed a bet on this match. Please refresh the page to create a new match. / 您已经在此比赛中下过注了，请刷新页面创建新比赛。')
      } else {
        setError(err.message || 'Failed to place bet')
      }
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

  // 领取奖励 / Claim reward
  const claimReward = async (matchId: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log(`🏆 ClaimReward Debug Info:`)
      console.log(`  Match ID: ${matchId}`)
      console.log(`  Current Match ID: ${currentMatchId}`)
      console.log(`  User Address: ${address}`)
      
      // 额外的安全检查 / Additional safety checks
      if (!isConnected || !window.ethereum || !address) {
        throw new Error('Wallet not connected / 钱包未连接')
      }
      
      // 验证 matchId 是否有效 / Verify matchId is valid
      if (!matchId || matchId === null || matchId === undefined) {
        console.error(`❌ Invalid matchId: ${matchId}`)
        throw new Error('Invalid match ID. Please refresh the page and try again. / 无效的比赛ID。请刷新页面后重试。')
      }
      
      // 确保不是管理员地址在调用 / Ensure admin address is not calling
      const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'
      if (address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
        throw new Error('Admin should not claim rewards, only users can claim / 管理员不应领取奖励，只有用户可以领取')
      }
      
      // 验证比赛状态 / Verify match state
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      
      console.log(`  Checking match ${matchId} state...`)
      const matchInfo = await contract.getMatch(matchId)
      console.log(`  Match Info:`, {
        matchId: Number(matchInfo[0]),
        totalA: ethers.formatEther(matchInfo[1]),
        totalB: ethers.formatEther(matchInfo[2]),
        rewardPool: ethers.formatEther(matchInfo[3]),
        result: Number(matchInfo[4]),
        settled: matchInfo[5],
        rewardInjected: matchInfo[6]
      })
      
      if (Number(matchInfo[0]) === 0) {
        throw new Error(`Match ${matchId} does not exist. Please check the match ID. / 比赛${matchId}不存在。请检查比赛ID。`)
      }
      
      if (!matchInfo[5]) { // settled
        throw new Error('Match not settled yet / 比赛尚未结算')
      }
      
      console.log(`  Checking user bet for ${address}...`)
      const userBetInfo = await contract.getUserBet(matchId, address)
      console.log(`  User Bet Info:`, {
        team: Number(userBetInfo[0]),
        amount: ethers.formatEther(userBetInfo[1]),
        claimed: userBetInfo[2]
      })
      if (Number(userBetInfo[1]) === 0) { // amount
        throw new Error('No bet found for this match / 此比赛中没有发现下注记录')
      }
      
      if (userBetInfo[2]) { // claimed
        throw new Error('Reward already claimed / 奖励已领取')
      }
      
      console.log('✅ All validations passed, calling claimReward...')
      console.log('  Calling claimReward for match:', matchId, 'user:', address)
      
      // 获取签名者并调用 claimReward / Get signer and call claimReward
      const signer = await provider.getSigner()
      const signerAddress = await signer.getAddress()
      console.log('  Signer address:', signerAddress)
      
      const contractWithSigner = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      
      // 明确调用 claimReward 函数 / Explicitly call claimReward function
      const tx = await contractWithSigner.claimReward(matchId)
      console.log('  ClaimReward transaction sent:', tx.hash)
      
      await tx.wait()
      console.log('  ClaimReward transaction confirmed')
      
      await refreshUserBet(matchId) // 刷新用户下注信息 / Refresh user bet info
      return true
      
    } catch (err: any) {
      console.error('❌ Claim reward failed:', err)
      
      // 特殊处理 "Only admin" 错误 / Special handling for "Only admin" error
      if (err.message && err.message.includes('Only admin')) {
        const detailedError = `❌ "Only admin" error detected!\n\n` +
                             `🔍 Debug Information:\n` +
                             `- Match ID: ${matchId}\n` +
                             `- Current Match ID: ${currentMatchId}\n` +
                             `- User Address: ${address}\n` +
                             `- Admin Address: 0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5\n\n` +
                             `💡 This usually means:\n` +
                             `1. Invalid or null match ID\n` +
                             `2. State synchronization issue\n` +
                             `3. Match was not properly connected\n\n` +
                             `🛠️ Solution: Please refresh the page and try again.\n\n` +
                             `❌ 检测到"Only admin"错误！\n\n` +
                             `🔍 调试信息：\n` +
                             `- 比赛ID: ${matchId}\n` +
                             `- 当前比赛ID: ${currentMatchId}\n` +
                             `- 用户地址: ${address}\n` +
                             `- 管理员地址: 0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5\n\n` +
                             `💡 这通常意味着：\n` +
                             `1. 无效或空的比赛ID\n` +
                             `2. 状态同步问题\n` +
                             `3. 比赛没有正确连接\n\n` +
                             `🛠️ 解决方案：请刷新页面后重试。`
        setError(detailedError)
      } else {
        setError(err.message || 'Failed to claim reward / 领取奖励失败')
      }
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
  const refreshMatchInfo = async (matchId: number, teamA?: string, teamB?: string): Promise<void> => {
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
        rewardInjected: info[6],
        teamA: teamA, // 添加队伍名称 / Add team names
        teamB: teamB
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