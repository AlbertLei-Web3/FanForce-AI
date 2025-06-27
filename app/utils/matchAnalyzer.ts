// FanForce AI - 智能对战分析引擎 / Intelligent Match Analysis Engine
// 基于真实球队数据生成个性化AI解说 / Generate personalized AI commentary based on real team data
// 关联文件：与 data/teams.ts 中的球队数据配合使用 / Associated with team data in data/teams.ts

import { Team } from '../../data/teams'

// 数据分析结果接口 / Data Analysis Result Interface
export interface MatchAnalysis {
  winRate: {
    teamA: number
    teamB: number
    difference: number
    advantage: 'A' | 'B' | 'EVEN'
    gap: 'SIGNIFICANT' | 'MODERATE' | 'SLIGHT' | 'EVEN'
  }
  age: {
    teamA: number
    teamB: number
    difference: number
    younger: 'A' | 'B' | 'EVEN'
    gap: 'GENERATION_GAP' | 'NOTICEABLE' | 'MINOR' | 'SIMILAR'
  }
  injury: {
    teamA: number
    teamB: number
    difference: number
    healthier: 'A' | 'B' | 'EVEN'
    impact: 'BOTH_HEALTHY' | 'CLEAR_ADVANTAGE' | 'SLIGHT_ADVANTAGE' | 'SIMILAR_CONCERNS'
  }
  starPlayer: {
    teamA: string
    teamB: string
    hasComparison: boolean
    scenario: 'BOTH_HAVE_STARS' | 'ONLY_A_HAS_STAR' | 'ONLY_B_HAS_STAR' | 'NO_STAR_DATA'
  }
}

// 分析两支队伍的对战数据 / Analyze matchup data between two teams
export const analyzeMatchup = (teamA: Team, teamB: Team): MatchAnalysis => {
  return {
    winRate: {
      teamA: teamA.winRate,
      teamB: teamB.winRate,
      difference: Math.abs(teamA.winRate - teamB.winRate),
      advantage: teamA.winRate > teamB.winRate ? 'A' : (teamA.winRate < teamB.winRate ? 'B' : 'EVEN'),
      gap: categorizeWinRateGap(Math.abs(teamA.winRate - teamB.winRate))
    },
    age: {
      teamA: teamA.avgAge,
      teamB: teamB.avgAge,
      difference: Math.abs(teamA.avgAge - teamB.avgAge),
      younger: teamA.avgAge < teamB.avgAge ? 'A' : (teamA.avgAge > teamB.avgAge ? 'B' : 'EVEN'),
      gap: categorizeAgeGap(Math.abs(teamA.avgAge - teamB.avgAge))
    },
    injury: {
      teamA: teamA.injuryCount,
      teamB: teamB.injuryCount,
      difference: Math.abs(teamA.injuryCount - teamB.injuryCount),
      healthier: teamA.injuryCount < teamB.injuryCount ? 'A' : (teamA.injuryCount > teamB.injuryCount ? 'B' : 'EVEN'),
      impact: categorizeInjuryImpact(teamA.injuryCount, teamB.injuryCount)
    },
    starPlayer: {
      teamA: teamA.starPlayer || '',
      teamB: teamB.starPlayer || '',
      hasComparison: !!(teamA.starPlayer && teamB.starPlayer),
      scenario: determineStarPlayerScenario(teamA.starPlayer, teamB.starPlayer)
    }
  }
}

// 胜率差异分类 / Categorize win rate gap
const categorizeWinRateGap = (diff: number): 'SIGNIFICANT' | 'MODERATE' | 'SLIGHT' | 'EVEN' => {
  if (diff >= 15) return 'SIGNIFICANT'
  if (diff >= 8) return 'MODERATE'
  if (diff >= 3) return 'SLIGHT'
  return 'EVEN'
}

// 年龄差异分类 / Categorize age gap
const categorizeAgeGap = (diff: number): 'GENERATION_GAP' | 'NOTICEABLE' | 'MINOR' | 'SIMILAR' => {
  if (diff >= 3) return 'GENERATION_GAP'
  if (diff >= 1.5) return 'NOTICEABLE'
  if (diff >= 0.8) return 'MINOR'
  return 'SIMILAR'
}

// 伤病影响分类 / Categorize injury impact
const categorizeInjuryImpact = (injuryA: number, injuryB: number): 'BOTH_HEALTHY' | 'CLEAR_ADVANTAGE' | 'SLIGHT_ADVANTAGE' | 'SIMILAR_CONCERNS' => {
  const total = injuryA + injuryB
  if (total === 0) return 'BOTH_HEALTHY'
  if (Math.abs(injuryA - injuryB) >= 2) return 'CLEAR_ADVANTAGE'
  if (Math.abs(injuryA - injuryB) === 1) return 'SLIGHT_ADVANTAGE'
  return 'SIMILAR_CONCERNS'
}

// 确定核心球员对比场景 / Determine star player comparison scenario
const determineStarPlayerScenario = (playerA: string, playerB: string): 'BOTH_HAVE_STARS' | 'ONLY_A_HAS_STAR' | 'ONLY_B_HAS_STAR' | 'NO_STAR_DATA' => {
  if (playerA && playerB) return 'BOTH_HAVE_STARS'
  if (playerA && !playerB) return 'ONLY_A_HAS_STAR'
  if (!playerA && playerB) return 'ONLY_B_HAS_STAR'
  return 'NO_STAR_DATA'
}

// 生成个性化解说 / Generate personalized commentary
export const generatePersonalizedCommentary = (teamA: Team, teamB: Team): string => {
  const analysis = analyzeMatchup(teamA, teamB)
  
  // 构建解说内容 / Build commentary content
  const winRateSection = generateWinRateSection(analysis, teamA, teamB)
  const ageSection = generateAgeSection(analysis, teamA, teamB)
  const injurySection = generateInjurySection(analysis, teamA, teamB)
  const starPlayerSection = generateStarPlayerSection(analysis, teamA, teamB)
  
  return `${winRateSection} ${ageSection} ${injurySection} ${starPlayerSection}`
}

// 生成胜率分析部分 / Generate win rate analysis section
const generateWinRateSection = (analysis: MatchAnalysis, teamA: Team, teamB: Team): string => {
  const { winRate } = analysis
  const stronger = winRate.advantage === 'A' ? teamA.nameEn : teamB.nameEn
  const weaker = winRate.advantage === 'A' ? teamB.nameEn : teamA.nameEn
  
  switch (winRate.gap) {
    case 'SIGNIFICANT':
      return `Historical analysis shows ${stronger} significantly leads with ${winRate.advantage === 'A' ? winRate.teamA : winRate.teamB}% win rate versus ${winRate.advantage === 'A' ? winRate.teamB : winRate.teamA}%, indicating substantial experience advantage.`
    
    case 'MODERATE':
      return `${stronger}'s ${winRate.advantage === 'A' ? winRate.teamA : winRate.teamB}% win rate moderately exceeds ${weaker}'s ${winRate.advantage === 'A' ? winRate.teamB : winRate.teamA}%, suggesting meaningful historical superiority.`
    
    case 'SLIGHT':
      return `Win rates are closely matched with ${stronger} at ${winRate.advantage === 'A' ? winRate.teamA : winRate.teamB}% slightly ahead of ${weaker}'s ${winRate.advantage === 'A' ? winRate.teamB : winRate.teamA}%.`
    
    case 'EVEN':
      return `Both teams show similar historical performance with ${teamA.nameEn} at ${winRate.teamA}% and ${teamB.nameEn} at ${winRate.teamB}%, indicating evenly matched experience levels.`
  }
}

// 生成年龄分析部分 / Generate age analysis section
const generateAgeSection = (analysis: MatchAnalysis, teamA: Team, teamB: Team): string => {
  const { age } = analysis
  const younger = age.younger === 'A' ? teamA.nameEn : teamB.nameEn
  const older = age.younger === 'A' ? teamB.nameEn : teamA.nameEn
  
  switch (age.gap) {
    case 'GENERATION_GAP':
      return `Age structure reveals stark contrast with ${younger} averaging ${age.younger === 'A' ? age.teamA : age.teamB} years versus ${older}'s ${age.younger === 'A' ? age.teamB : age.teamA} years, creating an intriguing stamina-versus-experience dynamic.`
    
    case 'NOTICEABLE':
      return `${younger} holds age advantage at ${age.younger === 'A' ? age.teamA : age.teamB} years compared to ${older}'s ${age.younger === 'A' ? age.teamB : age.teamA} years, potentially benefiting from superior fitness in later stages.`
    
    case 'MINOR':
      return `Age structures are relatively balanced with ${younger} slightly younger at ${age.younger === 'A' ? age.teamA : age.teamB} years, though the gap is minimal.`
    
    case 'SIMILAR':
      return `Both squads maintain similar age profiles with ${teamA.nameEn} at ${age.teamA} and ${teamB.nameEn} at ${age.teamB} years, suggesting comparable stamina and experience levels.`
  }
}

// 生成伤病分析部分 / Generate injury analysis section
const generateInjurySection = (analysis: MatchAnalysis, teamA: Team, teamB: Team): string => {
  const { injury } = analysis
  const healthier = injury.healthier === 'A' ? teamA.nameEn : teamB.nameEn
  const moreInjured = injury.healthier === 'A' ? teamB.nameEn : teamA.nameEn
  
  switch (injury.impact) {
    case 'BOTH_HEALTHY':
      return `Both squads enjoy full fitness with no significant injury concerns, promising optimal tactical execution.`
    
    case 'CLEAR_ADVANTAGE':
      return `${healthier} maintains squad advantage with only ${injury.healthier === 'A' ? injury.teamA : injury.teamB} injury concern versus ${moreInjured}'s ${injury.healthier === 'A' ? injury.teamB : injury.teamA} absences affecting tactical options.`
    
    case 'SLIGHT_ADVANTAGE':
      return `${healthier} holds marginal fitness edge with one fewer injury concern than ${moreInjured}, potentially influencing squad depth.`
    
    case 'SIMILAR_CONCERNS':
      return `Both teams face comparable injury challenges with ${teamA.nameEn} missing ${injury.teamA} and ${teamB.nameEn} missing ${injury.teamB} players, requiring tactical adjustments.`
  }
}

// 生成核心球员分析部分 / Generate star player analysis section
const generateStarPlayerSection = (analysis: MatchAnalysis, teamA: Team, teamB: Team): string => {
  const { starPlayer } = analysis
  
  switch (starPlayer.scenario) {
    case 'BOTH_HAVE_STARS':
      return `Key individual battle features ${starPlayer.teamA} versus ${starPlayer.teamB}, with both superstars capable of decisive moments.`
    
    case 'ONLY_A_HAS_STAR':
      return `${starPlayer.teamA} provides ${teamA.nameEn} with world-class individual quality that ${teamB.nameEn} must collectively neutralize.`
    
    case 'ONLY_B_HAS_STAR':
      return `${starPlayer.teamB} gives ${teamB.nameEn} superstar advantage that ${teamA.nameEn} will need tactical discipline to contain.`
    
    case 'NO_STAR_DATA':
      return `Despite limited individual player data, the tactical and collective strengths suggest a compelling strategic battle.`
  }
} 