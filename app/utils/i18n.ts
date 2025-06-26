// FanForce AI - 国际化模块 / Internationalization Module
// 独立的翻译文本管理系统 / Independent translation text management system
// 所有应用中的文本都在此统一管理 / All application texts are managed here

export type Language = 'en' | 'zh'

// 翻译文本定义接口 / Translation text definition interface
export interface TranslationKeys {
  // 通用文本 / Common texts
  'Select Teams to Compare': string
  'Reselect Teams': string
  'Win Rate': string
  'Avg Age': string
  'FIFA Ranking': string
  'y': string // 年龄单位 / Age unit
  'Combat Power': string
  'Classic Matchups': string
  
  // 页面标题 / Page titles
  '2022 World Cup Quarterfinals': string
  'AI-powered combat analysis system based on historical data, player age, injury status and more': string
  
  // AI解说相关 / AI Commentary related
  'AI Tactical Analyst Commentary': string
  'AI is analyzing match data...': string
  
  // 投票相关 / Voting related
  'Fan Prediction Vote': string
  'Support': string
  'Live Voting Results': string
  'votes': string
  
  // 下注相关 / Betting related
  'Place Your Bet': string
  'Bet on': string
  'Match Statistics': string
  'Team A Bets': string
  'Team B Bets': string
  'Reward Pool': string
  'Your Bet': string
  'Claimed': string
  
  // 球队数据显示 / Team data display
  'Historical Win Rate': string
  'Average Age': string
  'Injury Count': string
  'Core Player': string
  'people': string
  'years old': string
  
  // 经典对战标题 / Classic matchup titles
  'South American Rivalry': string
  'European Giants Dialogue': string
  'Europe vs Africa Battle': string
  'Tactical Masters Clash': string
  
  // Web3钱包相关 / Web3 wallet related
  'Connect Wallet': string
  'Connecting': string
  'Switch to Chiliz': string
  'Disconnect Wallet': string

  // 管理员面板相关 / Admin panel related
  'Admin': string
  'Match Management': string
  'Create New Match': string
  'Team A': string
  'Team B': string
  'Select Team A': string
  'Select Team B': string
  'Create Match': string
  'Existing Matches': string
  'Please select both teams': string
  'Delete Match': string
  'Custom Match': string
  'Match already exists': string
  'Match created successfully': string
  'Please select different teams': string

  // 下注状态相关 / Betting status related
  'Processing...': string
  'Creating match...': string
  'Loading match info...': string
  'Match is already settled': string
  'You have already bet on this match': string
  'Match deleted successfully': string
}

// 英文翻译 / English translations
const enTranslations: TranslationKeys = {
  'Select Teams to Compare': 'Select Teams to Compare',
  'Reselect Teams': 'Reselect Teams',
  'Win Rate': 'Win Rate',
  'Avg Age': 'Avg Age',
  'FIFA Ranking': 'FIFA Ranking',
  'y': 'y',
  'Combat Power': 'Combat Power',
  'Classic Matchups': 'Classic Matchups',
  
  '2022 World Cup Quarterfinals': '2022 World Cup Quarterfinals',
  'AI-powered combat analysis system based on historical data, player age, injury status and more': 'AI-powered combat analysis system based on historical data, player age, injury status and more',
  
  'AI Tactical Analyst Commentary': 'AI Tactical Analyst Commentary',
  'AI is analyzing match data...': 'AI is analyzing match data...',
  
  'Fan Prediction Vote': 'Fan Prediction Vote',
  'Support': 'Support',
  'Live Voting Results': 'Live Voting Results',
  'votes': 'votes',
  
  'Place Your Bet': 'Place Your Bet',
  'Bet on': 'Bet on',
  'Match Statistics': 'Match Statistics',
  'Team A Bets': 'Team A Bets',
  'Team B Bets': 'Team B Bets',
  'Reward Pool': 'Reward Pool',
  'Your Bet': 'Your Bet',
  'Claimed': 'Claimed',
  
  'Historical Win Rate': 'Historical Win Rate',
  'Average Age': 'Average Age',
  'Injury Count': 'Injury Count',
  'Core Player': 'Core Player',
  'people': 'people',
  'years old': 'years old',
  
  'South American Rivalry': 'South American Rivalry',
  'European Giants Dialogue': 'European Giants Dialogue',
  'Europe vs Africa Battle': 'Europe vs Africa Battle',
  'Tactical Masters Clash': 'Tactical Masters Clash',
  
  'Connect Wallet': 'Connect Wallet',
  'Connecting': 'Connecting',
  'Switch to Chiliz': 'Switch to Chiliz',
  'Disconnect Wallet': 'Disconnect Wallet',

  // Admin panel translations
  'Admin': 'Admin',
  'Match Management': 'Match Management',
  'Create New Match': 'Create New Match',
  'Team A': 'Team A',
  'Team B': 'Team B',
  'Select Team A': 'Select Team A',
  'Select Team B': 'Select Team B',
  'Create Match': 'Create Match',
  'Existing Matches': 'Existing Matches',
  'Please select both teams': 'Please select both teams',
  'Delete Match': 'Delete Match',
  'Custom Match': 'Custom Match',
  'Match already exists': 'Match already exists',
  'Match created successfully': 'Match created successfully',
  'Please select different teams': 'Please select different teams',

  // Betting status translations
  'Processing...': 'Processing...',
  'Creating match...': 'Creating match...',
  'Loading match info...': 'Loading match info...',
  'Match is already settled': 'Match is already settled',
  'You have already bet on this match': 'You have already bet on this match',
  'Match deleted successfully': 'Match deleted successfully'
}

// 中文翻译 / Chinese translations
const zhTranslations: TranslationKeys = {
  'Select Teams to Compare': '选择对战球队',
  'Reselect Teams': '重新选择',
  'Win Rate': '胜率',
  'Avg Age': '平均年龄',
  'FIFA Ranking': 'FIFA排名',
  'y': '岁',
  'Combat Power': '战斗力评分',
  'Classic Matchups': '经典对战推荐',
  
  '2022 World Cup Quarterfinals': '2022世界杯八强对决',
  'AI-powered combat analysis system based on historical data, player age, injury status and more': 'AI驱动的战斗力分析系统，基于历史数据、球员年龄、伤病情况等多维度评估球队实力',
  
  'AI Tactical Analyst Commentary': 'AI战术分析师解说',
  'AI is analyzing match data...': 'AI正在分析比赛数据...',
  
  'Fan Prediction Vote': '粉丝预测投票',
  'Support': '支持',
  'Live Voting Results': '实时投票结果',
  'votes': '票',
  
  'Place Your Bet': '下注预测',
  'Bet on': '下注支持',
  'Match Statistics': '比赛统计',
  'Team A Bets': '球队A下注',
  'Team B Bets': '球队B下注',
  'Reward Pool': '奖励池',
  'Your Bet': '您的下注',
  'Claimed': '已领取',
  
  'Historical Win Rate': '历史胜率',
  'Average Age': '平均年龄',
  'Injury Count': '伤病数量',
  'Core Player': '核心球员',
  'people': '人',
  'years old': '岁',
  
  'South American Rivalry': '南美双雄对决',
  'European Giants Dialogue': '欧洲豪门对话',
  'Europe vs Africa Battle': '欧非之战',
  'Tactical Masters Clash': '战术大师对决',
  
  'Connect Wallet': '连接钱包',
  'Connecting': '连接中',
  'Switch to Chiliz': '切换到Chiliz',
  'Disconnect Wallet': '断开钱包',

  // Admin panel translations
  'Admin': '管理员',
  'Match Management': '比赛管理',
  'Create New Match': '创建新比赛',
  'Team A': '球队A',
  'Team B': '球队B',
  'Select Team A': '选择球队A',
  'Select Team B': '选择球队B',
  'Create Match': '创建比赛',
  'Existing Matches': '现有比赛',
  'Please select both teams': '请选择两支球队',
  'Delete Match': '删除比赛',
  'Custom Match': '自定义比赛',
  'Match already exists': '比赛已存在',
  'Match created successfully': '比赛创建成功',
  'Please select different teams': '请选择不同的球队',

  // Betting status translations
  'Processing...': '处理中...',
  'Creating match...': '创建比赛中...',
  'Loading match info...': '加载比赛信息中...',
  'Match is already settled': '比赛已结算',
  'You have already bet on this match': '您已经在此比赛中下注了',
  'Match deleted successfully': '比赛删除成功'
}

// 翻译函数 / Translation function
export function translate(key: keyof TranslationKeys, language: Language): string {
  const translations = language === 'en' ? enTranslations : zhTranslations
  return translations[key] || key
}

// 导出翻译对象 / Export translation objects
export const translations = {
  en: enTranslations,
  zh: zhTranslations,
}

export default translate 