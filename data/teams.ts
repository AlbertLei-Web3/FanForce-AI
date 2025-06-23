// FanForce AI - 2022年世界杯八强球队数据
// 2022 FIFA World Cup Quarterfinals Teams Data
// 此文件包含八强球队的核心数据，用于战斗力评分算法
// This file contains core data for quarterfinal teams, used for combat power scoring algorithm

export interface Team {
  id: string;
  name: string;
  nameEn: string;
  nameCn: string;
  winRate: number;        // 世界杯历史胜率 / Historical World Cup win rate
  avgAge: number;         // 球队平均年龄 / Team average age
  injuryCount: number;    // 主力伤病数量 / Key player injury count
  countryCode: string;    // 国家代码用于国旗显示 / Country code for flag display
  starPlayer: string;     // 核心球员 / Star player
  coachName: string;      // 主教练 / Head coach
  fifaRanking: number;    // FIFA排名 / FIFA ranking
  description: string;    // 球队描述 / Team description
  keyStrengths: string[]; // 关键优势 / Key strengths
  keyWeaknesses: string[]; // 关键劣势 / Key weaknesses
}

export const teams: Team[] = [
  {
    id: 'argentina',
    name: 'Argentina',
    nameEn: 'Argentina',
    nameCn: '阿根廷',
    winRate: 75,
    avgAge: 28.5,
    injuryCount: 1,
    countryCode: 'AR',
    starPlayer: 'Lionel Messi',
    coachName: 'Lionel Scaloni',
    fifaRanking: 3,
    description: '梅西最后一舞，潘帕斯雄鹰志在必得 / Messi\'s final dance, Pampas Eagles determined to win',
    keyStrengths: ['梅西魔法 / Messi Magic', '中场控制 / Midfield Control', '防守稳固 / Solid Defense'],
    keyWeaknesses: ['过度依赖梅西 / Over-reliance on Messi', '年龄偏大 / Aging Squad']
  },
  {
    id: 'france',
    name: 'France',
    nameEn: 'France',
    nameCn: '法国',
    winRate: 78,
    avgAge: 26.2,
    injuryCount: 2,
    countryCode: 'FR',
    starPlayer: 'Kylian Mbappé',
    coachName: 'Didier Deschamps',
    fifaRanking: 4,
    description: '卫冕冠军，高卢雄鸡王者风范 / Defending champions, Gallic Roosters with royal demeanor',
    keyStrengths: ['速度优势 / Speed Advantage', '经验丰富 / Rich Experience', '战术多样 / Tactical Diversity'],
    keyWeaknesses: ['伤病困扰 / Injury Concerns', '内部矛盾 / Internal Conflicts']
  },
  {
    id: 'brazil',
    name: 'Brazil',
    nameEn: 'Brazil',
    nameCn: '巴西',
    winRate: 82,
    avgAge: 27.8,
    injuryCount: 0,
    countryCode: 'BR',
    starPlayer: 'Neymar Jr.',
    coachName: 'Tite',
    fifaRanking: 1,
    description: '桑巴军团，足球王国的荣耀回归 / Samba Army, the return of football kingdom\'s glory',
    keyStrengths: ['技术精湛 / Exquisite Technique', '阵容豪华 / Luxurious Squad', '攻击犀利 / Sharp Attack'],
    keyWeaknesses: ['心理包袱 / Mental Burden', '关键时刻紧张 / Tension in crucial moments']
  },
  {
    id: 'england',
    name: 'England',
    nameEn: 'England',
    nameCn: '英格兰',
    winRate: 68,
    avgAge: 26.5,
    injuryCount: 1,
    countryCode: 'GB',
    starPlayer: 'Harry Kane',
    coachName: 'Gareth Southgate',
    fifaRanking: 5,
    description: '三狮军团，足球发源地的荣耀之战 / Three Lions, the birthplace of football\'s battle for glory',
    keyStrengths: ['年轻有活力 / Young and Energetic', '定位球威胁 / Set-piece Threat', '团队合作 / Team Cooperation'],
    keyWeaknesses: ['缺乏大赛经验 / Lack of Tournament Experience', '关键球员状态 / Key Player Form']
  },
  {
    id: 'netherlands',
    name: 'Netherlands',
    nameEn: 'Netherlands',
    nameCn: '荷兰',
    winRate: 72,
    avgAge: 27.2,
    injuryCount: 1,
    countryCode: 'NL',
    starPlayer: 'Virgil van Dijk',
    coachName: 'Louis van Gaal',
    fifaRanking: 8,
    description: '橙色军团，全攻全守足球的传承者 / Orange Army, inheritors of total football',
    keyStrengths: ['战术素养 / Tactical Literacy', '身体对抗 / Physical Confrontation', '经验丰富 / Rich Experience'],
    keyWeaknesses: ['创造力不足 / Lack of Creativity', '依赖老将 / Reliance on Veterans']
  },
  {
    id: 'croatia',
    name: 'Croatia',
    nameEn: 'Croatia',
    nameCn: '克罗地亚',
    winRate: 65,
    avgAge: 29.8,
    injuryCount: 2,
    countryCode: 'HR',
    starPlayer: 'Luka Modrić',
    coachName: 'Zlatko Dalić',
    fifaRanking: 12,
    description: '格子军团，上届亚军的王者之心 / Checkered Army, runner-up\'s champion heart',
    keyStrengths: ['中场大师 / Midfield Masters', '意志坚强 / Strong Will', '经验丰富 / Rich Experience'],
    keyWeaknesses: ['年龄偏大 / Aging Squad', '体能下降 / Declining Fitness']
  },
  {
    id: 'morocco',
    name: 'Morocco',
    nameEn: 'Morocco',
    nameCn: '摩洛哥',
    winRate: 58,
    avgAge: 26.8,
    injuryCount: 0,
    countryCode: 'MA',
    starPlayer: 'Achraf Hakimi',
    coachName: 'Walid Regragui',
    fifaRanking: 22,
    description: '非洲之鹰，黑马奇迹的续写者 / African Eagles, the continuation of dark horse miracle',
    keyStrengths: ['防守稳固 / Solid Defense', '团结一致 / United Team', '速度优势 / Speed Advantage'],
    keyWeaknesses: ['攻击力不足 / Lack of Attack Power', '经验不足 / Lack of Experience']
  },
  {
    id: 'portugal',
    name: 'Portugal',
    nameEn: 'Portugal',
    nameCn: '葡萄牙',
    winRate: 70,
    avgAge: 28.1,
    injuryCount: 1,
    countryCode: 'PT',
    starPlayer: 'Cristiano Ronaldo',
    coachName: 'Fernando Santos',
    fifaRanking: 9,
    description: 'C罗传奇，欧洲冠军的最后冲刺 / Ronaldo\'s legend, European champions\' final sprint',
    keyStrengths: ['个人能力 / Individual Ability', '经验丰富 / Rich Experience', '战术灵活 / Tactical Flexibility'],
    keyWeaknesses: ['年龄结构 / Age Structure', '内部竞争 / Internal Competition']
  }
];

// 战斗力评分算法 / Combat Power Scoring Algorithm
export const calculateCombatPower = (team: Team): number => {
  // 加权评分公式：历史胜率60% + 年龄因子25% + 伤病影响15%
  // Weighted scoring formula: Win rate 60% + Age factor 25% + Injury impact 15%
  const winRateScore = team.winRate * 0.6;
  const ageScore = (35 - team.avgAge) * 0.25 * 2; // 年龄越小得分越高 / Younger age gets higher score
  const injuryScore = (5 - team.injuryCount) * 0.15 * 20; // 伤病越少得分越高 / Fewer injuries get higher score
  
  const totalScore = winRateScore + ageScore + injuryScore;
  return Math.round(Math.max(0, Math.min(100, totalScore))); // 确保分数在0-100之间 / Ensure score is between 0-100
};

// 预设的经典对战组合 / Preset classic match combinations
export const classicMatchups = [
  { teamA: 'argentina', teamB: 'brazil', title: '南美双雄对决 / South American Rivalry' },
  { teamA: 'france', teamB: 'england', title: '欧洲豪门对话 / European Giants Dialogue' },
  { teamA: 'portugal', teamB: 'morocco', title: '欧非之战 / Europe vs Africa Battle' },
  { teamA: 'netherlands', teamB: 'croatia', title: '战术大师对决 / Tactical Masters Clash' }
];

export default teams; 