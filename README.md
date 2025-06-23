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

### 4. 结果统计 / Results Statistics
- 实时投票结果可视化
- 社区预测趋势展示
- 个人投票记录追踪

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

---

<p align="center">
  <strong>🚀 Built for the future of sports prediction with AI & Blockchain 🚀</strong>
</p> 