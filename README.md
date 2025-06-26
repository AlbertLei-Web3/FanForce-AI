# 🏆 FanForce AI | AI驱动的体育预测平台

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.0-blue" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.3-cyan" alt="Tailwind">
  <img src="https://img.shields.io/badge/Chiliz-SDK-green" alt="Chiliz SDK">
</p>

## 📖 项目简介 / Project Overview

**FanForce AI** 是一个结合 **Fan Token** 与 **AI** 的体育比赛预测互动工具。基于2022年世界杯八强球队数据，通过AI算法生成战斗力评分，让球迷参与智能化的比赛预测和投票。

**FanForce AI** is a sports match prediction platform that combines **Fan Tokens** with **AI**. Based on 2022 World Cup quarterfinals data, it generates combat power scores through AI algorithms, enabling fans to participate in intelligent match predictions and voting.

### 🎯 核心特性 / Core Features

- **🤖 AI战斗力评分**: 基于历史胜率、球员年龄、伤病情况的多维评估算法
- **🗳️ Fan Token投票**: 集成Chiliz生态，持有Fan Token用户可参与预测投票
- **📊 实时数据可视化**: 动态展示评分对比和投票结果统计
- **🏆 2022世界杯数据**: 使用真实的八强球队数据，增强代入感
- **🌐 双语支持**: 完整的中英文双语界面和解说

### 🔧 技术架构 / Technical Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js 14    │    │   AI Algorithm   │    │  Chiliz SDK     │
│   Frontend       │<-->│   战斗力评分      │<-->│  Fan Token      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Tailwind CSS   │    │   Mock Data      │    │  WalletConnect  │
│  响应式UI        │    │   球队数据        │    │  钱包连接        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  i18n Module    │
│  国际化模块      │
└─────────────────┘
```

## 🚀 快速开始 / Quick Start

### 1. 环境要求 / Prerequisites

- Node.js 18.17+ 
- npm 或 yarn
- 现代浏览器支持

### 2. 安装依赖 / Installation

```bash
# 克隆项目
git clone https://github.com/your-username/fanforce-ai.git
cd fanforce-ai

# 安装依赖
npm install
# 或者使用 yarn
yarn install
```

### 3. 启动开发服务器 / Start Development Server

```bash
npm run dev
# 或者
yarn dev
```

项目将在 `http://localhost:3000` 启动

### 4. 项目构建 / Build for Production

```bash
npm run build
npm start
```

## 📊 核心算法 / Core Algorithm

### 战斗力评分公式 / Combat Power Scoring Formula

```typescript
const calculateCombatPower = (team: Team): number => {
  // 加权评分公式：历史胜率60% + 年龄因子25% + 伤病影响15%
  const winRateScore = team.winRate * 0.6;
  const ageScore = (35 - team.avgAge) * 0.25 * 2;
  const injuryScore = (5 - team.injuryCount) * 0.15 * 20;
  
  const totalScore = winRateScore + ageScore + injuryScore;
  return Math.round(Math.max(0, Math.min(100, totalScore)));
};
```

### 评分权重分配 / Scoring Weight Distribution

| 维度 / Dimension | 权重 / Weight | 说明 / Description |
|------------------|---------------|-------------------|
| 历史胜率 / Win Rate | 60% | 球队在世界杯历史上的获胜概率 |
| 平均年龄 / Average Age | 25% | 年龄结构对体能和经验的影响 |
| 伤病情况 / Injury Status | 15% | 关键球员伤病对整体实力的影响 |

## 🏆 2022世界杯八强数据 / 2022 World Cup Quarterfinals Data

| 球队 / Team | 胜率 / Win Rate | 平均年龄 / Avg Age | 核心球员 / Star Player | 战斗力评分 / Combat Score |
|-------------|----------------|-------------------|----------------------|--------------------------|
| 🇧🇷 巴西 Brazil | 82% | 27.8岁 | Neymar Jr. | 88分 |
| 🇫🇷 法国 France | 78% | 26.2岁 | Kylian Mbappé | 85分 |
| 🇦🇷 阿根廷 Argentina | 75% | 28.5岁 | Lionel Messi | 82分 |
| 🇳🇱 荷兰 Netherlands | 72% | 27.2岁 | Virgil van Dijk | 79分 |
| 🇵🇹 葡萄牙 Portugal | 70% | 28.1岁 | Cristiano Ronaldo | 76分 |
| 🇬🇧 英格兰 England | 68% | 26.5岁 | Harry Kane | 75分 |
| 🇭🇷 克罗地亚 Croatia | 65% | 29.8岁 | Luka Modrić | 71分 |
| 🇲🇦 摩洛哥 Morocco | 58% | 26.8岁 | Achraf Hakimi | 67分 |

## 🎮 使用流程 / User Flow

### 1. 球队选择 / Team Selection
- 浏览2022世界杯八强球队卡片
- 点击选择对战双方
- 预览球队基础数据（胜率、年龄、FIFA排名）

### 2. AI分析 / AI Analysis  
- 系统自动计算双方战斗力评分
- AI生成专业的战术分析解说
- 可视化展示评分对比结果

### 3. 粉丝投票 / Fan Voting
- 连接Web3钱包（WalletConnect）
- 验证Fan Token持有情况
- 参与预测投票并查看实时结果

### 4. 智能合约下注系统 / Smart Contract Betting System
- **Web3钱包集成**: 支持MetaMask等钱包连接
- **Chiliz链支持**: 部署在Chiliz Spicy测试网 (ChainID: 88882)
- **原生CHZ支付**: 使用原生CHZ代币进行下注，无需ERC20代币
- **智能合约地址**: `0x0Aa8861bd3691F8dd92291Dd639d43ACb17aB5f5`

#### 下注机制 / Betting Mechanism
- **最低下注**: 1 CHZ起投
- **手续费**: 5%下注手续费 + 5%提取手续费
- **非零和游戏**: 用户可获得100%本金返还 + 奖励池分成
- **奖励分配**: 获胜方70%奖励池，失败方30%奖励池

### 5. 管理员功能 / Admin Features
- **管理员钱包验证** / Admin Wallet Verification
  - 管理员地址: `0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5`
  - 权限控制和身份验证 / Permission control and authentication

- **8支队伍灵活管理** / 8 Teams Flexible Management
  - 🇧🇷 巴西 Brazil | 🇫🇷 法国 France | 🇦🇷 阿根廷 Argentina | 🇳🇱 荷兰 Netherlands
  - 🇵🇹 葡萄牙 Portugal | 🇬🇧 英格兰 England | 🇭🇷 克罗地亚 Croatia | 🇲🇦 摩洛哥 Morocco
  - 任意队伍组合对战 / Any team combination matchups
  - 动态matchId生成 / Dynamic matchId generation

- **比赛管理功能** / Match Management Functions
  - 创建新比赛 (Create New Match) - 自动检测可用ID
  - 删除现有比赛 (Delete Existing Match) - 仅限无下注比赛
  - 比赛列表查看 (View Match List) - 实时状态监控
  - 智能合约集成 (Smart Contract Integration) - 无缝对接

- **智能合约管理** / Smart Contract Management
  - 注入比赛奖励池 (Inject Reward Pool) - 支持任意金额
  - 公布比赛结果 (Settle Match) - 队伍1或队伍2获胜
  - 重置比赛状态 (Reset Match) - 清空所有数据
  - 实时数据同步 (Real-time Data Sync) - 自动刷新状态

### 6. 结果统计 / Results Statistics
- 实时下注数据可视化
- 奖励池和下注总额展示
- 个人下注记录追踪
- 奖励领取状态监控

### 7. 智能重复下注解决方案 / Smart Duplicate Betting Solution

#### 问题背景 / Problem Background
当用户在重置和删除比赛后重新创建相同队伍的比赛时，可能遇到"Already bet"错误，这是因为智能合约中的用户下注映射没有被清空。

When users recreate matches with the same teams after resetting and deleting, they may encounter "Already bet" errors because user betting mappings in the smart contract are not cleared.

#### 前端解决方案 / Frontend Solution
我们实现了智能的前端解决方案，无需修改智能合约：

We implemented an intelligent frontend solution without modifying the smart contract:

**🔧 核心机制 / Core Mechanism:**
- **智能ID生成**: 结合确定性哈希和唯一时间戳
- **用户状态检查**: 实时检查用户在特定比赛中的下注状态
- **自动创建新比赛**: 当检测到用户已下注时，自动生成新的唯一比赛ID
- **错误处理优化**: 提供友好的错误提示和一键解决方案

**🛠️ 技术实现 / Technical Implementation:**
```typescript
// 智能连接到比赛 / Smart connect to match
const connectToMatch = async (teamA: string, teamB: string) => {
  const matchId = generateMatchId(teamA, teamB)
  const userAlreadyBet = await checkUserAlreadyBet(matchId, userAddress)
  
  if (userAlreadyBet) {
    // 生成唯一ID创建新比赛 / Generate unique ID for new match
    const uniqueId = generateUniqueMatchId(teamA, teamB)
    return await createMatch(teamA, teamB, uniqueId)
  }
  // 正常连接现有比赛 / Connect to existing match normally
}
```

**✨ 用户体验优化 / UX Optimization:**
- 自动检测和处理重复下注问题
- 提供"创建新比赛"按钮快速解决
- 双语错误提示和解决方案指引
- 无缝的用户体验，无需手动干预

## 🌐 国际化系统 / Internationalization System

应用采用独立的国际化模块设计，所有文本统一管理，支持完整的中英文切换：

The application uses an independent internationalization module design with unified text management, supporting complete Chinese-English switching:

### 架构特点 / Architecture Features
- **独立模块**: 所有翻译文本集中在 `app/utils/i18n.ts` 中管理
- **类型安全**: 使用TypeScript接口确保翻译完整性
- **上下文集成**: 通过React Context提供全局语言状态
- **双重函数**: `t()` 用于标准翻译，`tTeam()` 用于球队名称翻译

### 使用方式 / Usage
```typescript
// 标准翻译 / Standard translation
const title = t('2022 World Cup Quarterfinals')

// 球队名称翻译 / Team name translation  
const teamName = tTeam(team.nameEn, team.nameCn)
```

## 🎯 经典对战 / Classic Matchups

系统预设了四场经典对战组合，让球迷快速体验AI预测功能：

The system presets four classic matchup combinations for fans to quickly experience AI prediction features:

- **🇦🇷 阿根廷 vs 🇧🇷 巴西** - 南美双雄对决 / South American Rivalry
- **🇫🇷 法国 vs 🇬🇧 英格兰** - 欧洲豪门对话 / European Giants Dialogue  
- **🇵🇹 葡萄牙 vs 🇲🇦 摩洛哥** - 欧非之战 / Europe vs Africa Battle
- **🇳🇱 荷兰 vs 🇭🇷 克罗地亚** - 战术大师对决 / Tactical Masters Clash

### 页面导航优化 / Page Navigation Optimization
- **历史管理**: 使用HTML5 History API管理页面状态
- **后退优化**: 点击浏览器后退按钮返回到选择页面而非离开应用
- **状态保持**: 在页面切换时保持应用内部状态

## 🔌 集成说明 / Integration Guide

### Chiliz SDK 集成 / Chiliz SDK Integration

```typescript
// 示例：连接钱包和验证Fan Token
import { ChilizSDK } from '@chiliz/sdk';

const connectWallet = async () => {
  const chiliz = new ChilizSDK();
  const wallet = await chiliz.connect();
  const tokens = await chiliz.getFanTokens(wallet.address);
  return tokens.length > 0; // 验证是否持有任何Fan Token
};
```

### AI解说生成 / AI Commentary Generation

```typescript
// 示例：ChatGPT Prompt设计
const generateCommentary = async (teamA: Team, teamB: Team) => {
  const prompt = `
    作为专业体育解说员，分析以下比赛：
    ${teamA.name} vs ${teamB.name}
    ${teamA.name}: 胜率${teamA.winRate}%, 平均年龄${teamA.avgAge}岁
    ${teamB.name}: 胜率${teamB.winRate}%, 平均年龄${teamB.avgAge}岁
    请用激情且专业的语言预测比赛走向。
  `;
  // 调用ChatGPT API
};
```

## 📈 路线图 / Roadmap

### Phase 1: MVP核心功能 ✅
- [x] 基础UI界面搭建
- [x] 战斗力评分算法
- [x] 球队数据模型
- [x] 投票功能实现

### Phase 2: AI增强 🚧
- [ ] 集成ChatGPT API
- [ ] 智能解说生成
- [ ] 预测准确度分析
- [ ] 动态评分调整

### Phase 3: 区块链集成 📋
- [ ] Chiliz SDK完整集成
- [ ] Fan Token持有验证
- [ ] 链上投票记录
- [ ] NFT奖励机制

### Phase 4: 社区功能 📋
- [ ] 用户排行榜
- [ ] 预测历史追踪
- [ ] 社交分享功能
- [ ] 多语言支持扩展

## 🤝 贡献指南 / Contributing

欢迎提交Issue和Pull Request！请先阅读我们的贡献指南。

Welcome to submit Issues and Pull Requests! Please read our contribution guidelines first.

### 开发规范 / Development Standards

1. **代码注释**: 所有函数和组件必须包含中英文双语注释
2. **类型安全**: 使用TypeScript确保类型安全
3. **响应式设计**: 支持移动端和桌面端
4. **性能优化**: 使用React hooks和useMemo优化渲染

## 📄 开源协议 / License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🔗 相关链接 / Related Links

- [Chiliz 官方文档](https://docs.chiliz.com/)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## 📧 联系我们 / Contact

- 项目维护者: [Your Name]
- 邮箱: your.email@example.com
- Twitter: [@YourTwitter]

## 🔗 智能合约 / Smart Contract

### 合约地址 / Contract Address

- **测试网 / Testnet (Chiliz Spicy)**: `0x90C9D004cB071064Ba9B9f091Dc96D76b09E8aBC`
- **主网 / Mainnet**: 即将部署 / Coming soon

### 合约功能 / Contract Features

| 功能 / Feature | 说明 / Description | Gas消耗 / Gas Usage |
|---------------|-------------------|-------------------|
| 创建比赛 / Create Match | 管理员创建新比赛 / Admin creates new match | ~89,507 gas |
| 下注 / Place Bet | 用户使用原生CHZ下注 / Users bet with native CHZ | ~100,651 gas |
| 注入奖励 / Inject Reward | 管理员注入奖励池 / Admin injects reward pool | ~73,017 gas |
| 结算比赛 / Settle Match | 管理员公布结果 / Admin announces result | ~31,644 gas |
| 领取奖励 / Claim Reward | 用户领取奖励 / Users claim rewards | ~80,456 gas |
| 重置比赛 / Reset Match | 管理员重置比赛状态 / Admin resets match state | ~36,877 gas |

### 奖励分配 / Reward Distribution

- **胜方奖励 / Winner Reward**: 70% 奖励池 / 70% of reward pool
- **败方奖励 / Loser Reward**: 30% 奖励池 / 30% of reward pool
- **平台费用 / Platform Fee**: 5% 总奖励 / 5% of total rewards

### 使用方法 / Usage

1. **下注 / Place Bet**
```typescript
// 使用原生CHZ下注 / Bet with native CHZ
const BET_AMOUNT = ethers.parseEther("1.0"); // 1 CHZ
await contract.placeBet(matchId, teamId, BET_AMOUNT, { 
  value: BET_AMOUNT 
});
```

2. **领取奖励 / Claim Reward**
```typescript
// 比赛结束后领取奖励 / Claim reward after match settlement
await contract.claimReward(matchId);
```

3. **管理员功能 / Admin Functions**
```typescript
// 创建比赛 / Create match
await contract.createMatch(matchId);

// 注入奖励池 / Inject reward pool
const REWARD = ethers.parseEther("2.0"); // 2 CHZ
await contract.injectReward(matchId, REWARD, { value: REWARD });

// 结算比赛 / Settle match
await contract.settleMatch(matchId, winningTeamId);
```

### 测试网水龙头 / Testnet Faucets

1. **🥇 Tatum Faucet**
   - URL: https://tatum.io/faucets/chiliz
   - 每天10 CHZ / 10 CHZ per day
   - 需要注册 / Registration required

2. **🥈 Chiliz Official Faucet**
   - URL: https://faucet.chiliz.com
   - 每次5 CHZ / 5 CHZ per request
   - 24小时冷却 / 24h cooldown

## ✅ 流程验证系统 / Complete Flow Validation System

### 🔧 自动化测试 / Automated Testing

我们提供了完整的自动化测试脚本来验证所有功能：

We provide complete automated testing scripts to validate all functionality:

```bash
# 🔍 零Gas快速验证（推荐首选）| Zero-gas quick validation (recommended first)
npx hardhat run scripts/quick-validation.js --network chilizSpicy

# ⚡ Gas优化测试（推荐）| Gas optimized testing (recommended)
npx hardhat run scripts/gas-optimized-test.js --network chilizSpicyLowGas

# 📊 完整流程测试（Gas消耗较高）| Complete flow testing (higher gas usage)
npx hardhat run scripts/complete-flow-test.js --network chilizSpicy

# 💰 余额检查 | Balance check
npx hardhat run scripts/check-balance.js --network chilizSpicy

# 🏆 奖励池查看 | Reward pool check
npx hardhat run scripts/check-reward-pool.js --network chilizSpicy
```

### ⚡ Gas费用优化 | Gas Cost Optimization

为了降低测试成本，我们提供了多种优化方案：

To reduce testing costs, we provide multiple optimization solutions:

#### 优化策略 | Optimization Strategies

1. **智能操作检测** / Smart Operation Detection
   - 检查操作是否已完成，避免重复交易
   - Check if operations are already completed to avoid duplicate transactions

2. **降低测试金额** / Reduce Test Amounts
   - 下注金额：2 CHZ → 1 CHZ
   - 奖励池：10 CHZ → 5 CHZ
   - Bet amount: 2 CHZ → 1 CHZ
   - Reward pool: 10 CHZ → 5 CHZ

3. **优化Gas价格设置** / Optimize Gas Price Settings
   - 标准网络：1 gwei（低于自动定价）
   - 超低Gas网络：0.5 gwei（测试专用）
   - Standard network: 1 gwei (lower than auto pricing)
   - Ultra-low gas network: 0.5 gwei (testing only)

4. **批量检测现有状态** / Batch Check Existing State
   - 零Gas消耗的只读验证脚本
   - Zero-gas read-only validation script

#### Gas消耗对比 | Gas Usage Comparison

| 测试方式 / Test Method | Gas消耗 / Gas Usage | 推荐场景 / Recommended Use |
|----------------------|-------------------|--------------------------|
| 零Gas验证 / Zero-gas validation | 0 CHZ | 日常状态检查 / Daily status check |
| Gas优化测试 / Gas optimized test | ~2-4 CHZ | 功能验证 / Feature validation |
| 完整流程测试 / Complete flow test | ~8-15 CHZ | 全面测试 / Comprehensive testing |

### 📋 手动验证指南 / Manual Validation Guide

详细的手动测试指南请参考：**[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

For detailed manual testing guide, please refer to: **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

### 🧪 验证流程 / Validation Flow

#### 管理员流程 / Admin Flow
1. **创建比赛** / Create Match → 智能合约创建新比赛
2. **注入奖励** / Inject Reward → 向奖励池注入CHZ
3. **公布结果** / Settle Match → 宣布获胜队伍
4. **重置比赛** / Reset Match → 清空比赛数据

#### 用户流程 / User Flow
1. **连接钱包** / Connect Wallet → MetaMask钱包连接
2. **选择队伍** / Select Teams → 选择对战组合
3. **下注操作** / Place Bet → 使用CHZ下注
4. **领取奖励** / Claim Reward → 比赛结束后领取奖励

### 📊 测试覆盖范围 / Test Coverage

- ✅ **权限控制** / Permission Control：管理员权限验证
- ✅ **智能合约交互** / Smart Contract Interaction：创建、下注、结算、领取
- ✅ **状态管理** / State Management：按钮状态、用户数据同步
- ✅ **错误处理** / Error Handling：网络错误、余额不足、重复操作
- ✅ **UI/UX验证** / UI/UX Validation：响应式设计、通知系统、国际化

### 🎯 验证重点 / Key Validation Points

1. **按钮状态准确性** / Button State Accuracy
   - 未连接钱包：显示 "Connect Wallet"
   - 已连接未下注：显示 "Bet on [Team]"
   - 已下注未结算：显示 "Bet Placed" / "Already Bet"
   - 已结算可领取：显示 "Claim Reward"
   - 已领取奖励：显示 "Reward Claimed"

2. **跨页面状态持久化** / Cross-page State Persistence
   - 首次点击比赛：触发MetaMask创建交易
   - 再次点击相同比赛：直接连接，无需交易
   - 刷新页面后状态保持

3. **权限控制正确性** / Permission Control Accuracy
   - 管理员：可见"重新选择队伍"按钮和管理面板
   - 普通用户：隐藏管理员专用功能

## Testing Setup / 测试设置

### Environment Setup / 环境设置

1. Create a `.env` file in the root directory / 在根目录创建 `.env` 文件
2. Add your private key / 添加你的私钥:
```
PRIVATE_KEY=your_private_key_here
```

### Test Accounts / 测试账户

The following accounts are used in the tests / 测试中使用以下账户:

- Admin: `0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5`
- Team A Bettor: `0x0f583daF67db8B3287094F1871AD736A91B4A98a`
- Team B Bettor: `0xaeD5E239ACBBE496aAD809941C29444214Eb3e57`

### Running Tests / 运行测试

```bash
npx hardhat test
```

The test suite includes the following scenarios / 测试套件包含以下场景:

1. Contract Deployment / 合约部署
2. Match Creation / 创建比赛
3. Betting (Team A) / 投注（A队）
4. Reward Pool Injection / 注入奖励池
5. Match Settlement / 结算比赛
6. Reward Claims / 领取奖励
7. Match Reset / 重置比赛

### Test Matches / 测试比赛

World Cup 2022 Quarterfinals / 2022世界杯四分之一决赛:

1. Croatia vs Brazil (Match ID: 1)
2. Netherlands vs Argentina (Match ID: 2)
3. Morocco vs Portugal (Match ID: 3)
4. England vs France (Match ID: 4)

## Contract Addresses / 合约地址

- CHZ Token (Testnet): `0x4Bf7078D36F779Df3E98c24F51482C1002C2E23C` 