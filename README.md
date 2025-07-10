# 🏆 FanForce AI - Win-Win Prediction Platform | AI驱动的双赢预测平台

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.0-blue" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.3-cyan" alt="Tailwind">
  <img src="https://img.shields.io/badge/Chiliz-SDK-green" alt="Chiliz SDK">
  <img src="https://img.shields.io/badge/Non--Zero--Sum-Win--Win-gold" alt="Non-Zero-Sum">
</p>

## 🎯 核心理念 / Core Philosophy

### AI-Powered Non-Zero-Sum Betting - Everyone Profits from Predictions
### AI驱动的非零和投注 - 让预测变成人人获利

**革命性非零和设计** 确保所有参与者都能从预测中获得奖励：
- 🎯 **获胜者**: 70%奖励池分成 + 100%本金返还
- 💡 **失败者**: 30%奖励池分成 + 100%本金返还  
- 💰 **结果**: 无论输赢，人人都有收益

**Revolutionary non-zero-sum design** ensures all participants earn rewards from their predictions:
- 🎯 **Winners**: 70% reward pool + 100% principal return
- 💡 **Losers**: 30% reward pool + 100% principal return
- 💰 **Result**: Everyone profits regardless of outcome

## 📖 项目简介 / Project Overview

**FanForce AI** 是一个突破传统零和博弈的 **AI驱动体育预测平台**。通过革命性的非零和设计，让所有参与者都能从智能预测中获利，真正实现了"预测即收益"的创新理念。

**FanForce AI** is a revolutionary **AI-powered sports prediction platform** that breaks traditional zero-sum gaming. Through innovative non-zero-sum design, all participants can profit from intelligent predictions, truly realizing the concept of "predict to profit".

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
- **PostgreSQL 12+** (新增 / New)
- **Web3钱包** (MetaMask等)

### 2. 数据库设置 / Database Setup

**Step 1: 安装PostgreSQL / Install PostgreSQL**
```bash
# Windows (使用Chocolatey)
choco install postgresql

# macOS (使用Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
```

**Step 2: 创建数据库用户 / Create Database User**
```sql
-- 连接到PostgreSQL / Connect to PostgreSQL
psql -U postgres

-- 创建数据库用户 / Create database user
CREATE USER fanforce_user WITH PASSWORD 'your_password';

-- 赋予权限 / Grant permissions
ALTER USER fanforce_user CREATEDB;
```

**Step 3: 配置环境变量 / Configure Environment Variables**
```bash
# 复制环境变量模板 / Copy environment template
cp .env.example .env.local

# 编辑 .env.local 文件，配置数据库连接
# Edit .env.local file to configure database connection
```

**Step 4: 初始化数据库 / Initialize Database**
```bash
# 自动创建数据库和表结构 / Automatically create database and tables
node scripts/init-database.js
```

### 3. 安装依赖 / Installation

```bash
# 克隆项目
git clone https://github.com/your-username/fanforce-ai.git
cd fanforce-ai

# 安装依赖 (已包含PostgreSQL驱动)
npm install
# 或者使用 yarn
yarn install
```

### 4. 启动开发服务器 / Start Development Server

```bash
npm run dev
# 或者
yarn dev
```

项目将在 `http://localhost:3000` 启动

### 5. 项目构建 / Build for Production

```bash
npm run build
npm start
```

### 6. 数据库管理 / Database Management

**测试数据库连接 / Test Database Connection**
```bash
# 验证数据库连接状态 / Verify database connection status
node test-db-connection.js
```

### 7. 后端API服务器 / Backend API Server 🆕

**FanForce AI now includes a comprehensive Express.js backend API system:**
**FanForce AI现在包含一个全面的Express.js后端API系统：**

**启动API服务器 / Start API Server**
```bash
# 编辑server.js文件，输入你的PostgreSQL密码
# Edit server.js file with your PostgreSQL password
npm run server

# 或者同时启动前端和后端 / Or start both frontend and backend
npm run dev-all
```

**API端点测试 / API Endpoints Testing**
```bash
# 编辑test-api.js文件，输入你的PostgreSQL密码
# Edit test-api.js file with your PostgreSQL password
node test-api.js
```

**核心API功能 / Core API Features**
- 🔐 **JWT认证系统** / JWT Authentication System
- 👥 **用户管理** / User Management (profiles, roles, balances)
- 🎯 **活动管理** / Event Management (CRUD operations)
- 🏃‍♂️ **运动员管理** / Athlete Management (rankings, status)
- 🏟️ **场馆管理** / Venue Management (capacity, availability)
- 📊 **分析系统** / Analytics System (metrics, reports)
- 🔔 **实时通知** / Real-time Notifications (WebSocket ready)
- 🛡️ **安全中间件** / Security Middleware (CORS, rate limiting)

**API端点列表 / API Endpoints List**
```
Public Endpoints / 公共端点:
├── GET  /health              # 健康检查 / Health check
├── POST /api/auth/login      # 用户登录 / User login
├── GET  /api/events          # 活动列表 / Events list
├── GET  /api/athletes        # 运动员列表 / Athletes list
└── GET  /api/venues          # 场馆列表 / Venues list

Protected Endpoints / 受保护端点:
└── GET  /api/users/profile   # 用户档案 / User profile
```

**技术栈 / Technology Stack**
- **Backend**: Node.js 22.9.0 + Express.js
- **Database**: PostgreSQL 17.5 with connection pooling
- **Authentication**: JWT + Wallet signature verification
- **Security**: Helmet, CORS, Rate limiting (100 req/15min)
- **Logging**: Winston (console + file)
- **WebSocket**: Socket.io for real-time communication

## 🔗 WebSocket Real-time Engine / WebSocket实时引擎 🆕

**FanForce AI now features a comprehensive WebSocket real-time system for live campus sports engagement:**
**FanForce AI现在具备全面的WebSocket实时系统，用于实时校园体育参与：**

### 连接 & 认证 / Connection & Authentication
- **WebSocket端点**: `ws://localhost:3001` (开发环境)
- **认证方式**: JWT token required in handshake (`auth.token`)
- **自动重连**: 5秒间隔的内置重连机制

### 用户角色 & 权限 / User Roles & Permissions
- **🔧 Admin**: 全权访问所有事件，更新比赛结果，分发奖励
- **🧑‍💼 Ambassador**: 创建事件，更新比赛结果，接收QR扫描通知
- **🏃‍♂️ Athlete**: 参与事件，接收状态更新
- **🙋‍♂️ Audience**: 加入事件，扫描QR码，接收通知

### 实时事件 / Real-time Events

#### 连接事件 / Connection Events
- `connected` - 欢迎消息和用户信息
- `error` - 错误通知
- `disconnect` - 断开连接通知

#### 用户状态更新 / User Status Updates
- `update_status` - 更新用户状态 (online/active)
- `user_status_update` - 广播用户状态变化

#### 事件参与 / Event Participation
- `join_event` - 加入事件房间
- `event_joined` - 事件加入确认
- `participant_joined` - 新参与者通知
- `participant_disconnected` - 参与者离开通知

#### 比赛结果 / Match Results
- `match_result` - 提交比赛结果 (仅admin/ambassador)
- `match_result_update` - 向参与者广播比赛结果
- `match_completed` - 通用比赛完成通知

#### 二维码系统 / QR Code System
- `qr_scan` - 报告QR码扫描 (仅audience)
- `qr_scan_update` - 向admin/ambassador发送QR扫描通知

#### 奖励分配 / Reward Distribution
- `reward_distribution` - 分配奖励 (仅admin)
- `reward_received` - 个人奖励通知

#### 健康监控 / Health Monitoring
- `ping` - 发送ping检查连接健康
- `pong` - 接收pong响应和时间戳

### 房间结构 / Room Structure
- `user_{userId}` - 个人用户房间
- `role_{role}` - 基于角色的房间 (admin, ambassador, athlete, audience)
- `event_{eventId}` - 事件特定房间
- `general_notifications` - 全局通知

### 使用示例 / Usage Example

```javascript
// 连接WebSocket / Connect to WebSocket
const socket = io('ws://localhost:3001', {
  auth: { token: jwtToken }
});

// 监听连接 / Listen for connection
socket.on('connected', (data) => {
  console.log('Connected:', data.message);
});

// 加入事件 / Join an event
socket.emit('join_event', { eventId: 'event_123' });

// 提交比赛结果 (admin/ambassador) / Submit match result
socket.emit('match_result', {
  eventId: 'event_123',
  teamAScore: 3,
  teamBScore: 1,
  winningTeam: 'A'
});

// 扫描QR码 (audience) / Scan QR code
socket.emit('qr_scan', {
  eventId: 'event_123',
  scanResult: 'jwt_token_from_qr'
});
```

### WebSocket测试 / WebSocket Testing

```bash
# 启动WebSocket服务器 / Start WebSocket server
npm run server

# 运行WebSocket测试 / Run WebSocket tests
npm run test-websocket

# 演示页面 / Demo page
# 访问 http://localhost:3000/websocket-demo
```

### 实时功能特性 / Real-time Features
- ✅ **角色认证** / Role-based authentication
- ✅ **事件房间** / Event rooms
- ✅ **实时广播** / Real-time broadcasting
- ✅ **QR码集成** / QR code integration
- ✅ **比赛结果** / Match results
- ✅ **奖励通知** / Reward notifications
- ✅ **健康检查** / Health monitoring
- ✅ **自动重连** / Auto-reconnection
- **Testing**: Comprehensive test suite with colored output
- **Error Handling**: Graceful error responses with bilingual messages

**数据库架构 / Database Schema**
- **核心表（11个）/ Core Tables (11)**
  - users (用户表)
  - venues (场馆表)
  - events (活动表)
  - athletes (运动员表)
  - event_participants (活动参与者表)
  - qr_codes (二维码表)
  - qr_scans (二维码扫描表)
  - transactions (交易表)
  - rewards (奖励表)
  - analytics (分析表)
  - invite_codes (邀请码表)

- **增强表（9个）/ Enhanced Tables (9)** 🆕
  - substitute_players (候补球员表)
  - event_contingencies (活动突发情况表)
  - refund_transactions (退款交易表)
  - emergency_notifications (紧急通知表)
  - weather_conditions (天气条件表)
  - venue_availability (场馆可用性表)
  - system_alerts (系统警报表)
  - compensation_records (补偿记录表)
  - schema_backup (架构备份表)

**现实突发情况处理 / Real-World Contingency Handling** 🚨
- 🏃‍♂️ **候补球员系统**: 4级优先级，自动激活，可靠性评分
- 🌦️ **天气监控**: 实时天气API，安全评估，自动取消
- 🏢 **场馆管理**: 可用性追踪，容量调整，备选场馆
- 💸 **紧急退款**: 自动退款处理，批量操作，区块链执行
- 📱 **多渠道通知**: SMS/Email/Push，紧急级别，送达追踪
- 🔧 **系统监控**: 实时警报，自动修复，性能追踪
- 💰 **补偿处理**: 多种补偿类型，审批流程，支付追踪

**Web2优先架构 / Web2-First Architecture**
- 🏗️ **PostgreSQL**: 处理所有业务逻辑和数据存储
- ⚡ **超简化智能合约**: 仅处理CHZ转账（5个函数）
- 🔐 **JWT认证**: 基于钱包签名的身份验证
- 📊 **实时数据**: WebSocket推送更新
- 💰 **虚拟余额**: 数据库追踪用户资产
- 🛡️ **容错设计**: 全面突发情况处理和恢复机制

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
我们实现了智能的前端解决方案，通过权限分离来解决问题：

We implemented an intelligent frontend solution through permission separation:

**🔧 核心机制 / Core Mechanism:**
- **权限分离**: 用户无法创建比赛，只能由管理员创建
- **管理员智能创建**: 管理员可以强制创建唯一ID的比赛
- **用户友好提示**: 当用户遇到重复下注错误时，提示联系管理员
- **自动重试机制**: 管理员创建失败时自动尝试唯一ID

**🛠️ 技术实现 / Technical Implementation:**

*用户端 / User Side:*
```typescript
// 用户遇到Already bet错误时的处理 / Handle Already bet error for users
const handleContactAdmin = () => {
  alert('Please contact the administrator to create a new match for these teams.')
}
```

*管理员端 / Admin Side:*
```typescript
// 管理员智能创建比赛 / Admin smart match creation
const handleCreateMatch = async () => {
  try {
    // 直接创建新比赛，避免连接现有比赛
    const contractMatchId = await createMatch(teamA, teamB)
  } catch (error) {
    if (error.message.includes('Match exists')) {
      // 自动重试创建唯一ID比赛
      const uniqueMatchId = await createMatch(teamA, teamB)
    }
  }
}
```

**✨ 用户体验优化 / UX Optimization:**
- 用户遇到错误时提供清晰的解决指引
- 管理员获得更强大的比赛管理工具
- 双语错误提示和操作指导
- 权限分离确保系统安全性

### 8. 奖励领取权限问题解决方案 / Reward Claiming Permission Issue Solution

#### 问题描述 / Problem Description
用户在管理员结算比赛后尝试领取奖励时，可能遇到"Only admin"错误。这通常由以下原因引起：

Users may encounter "Only admin" error when trying to claim rewards after admin settles the match. This is usually caused by:

**🔍 常见原因 / Common Causes:**
- **钱包切换状态混乱**: 从管理员钱包切换到用户钱包后，前端状态未正确更新
- **缓存问题**: 浏览器缓存了错误的权限状态
- **函数调用混淆**: 在某些情况下可能调用了错误的合约函数
- **状态同步延迟**: 合约状态与前端状态不同步

**Common Causes:**
- **Wallet switching state confusion**: Frontend state not properly updated after switching from admin to user wallet
- **Caching issues**: Browser cached incorrect permission state  
- **Function call confusion**: Wrong contract function might be called in some cases
- **State sync delay**: Contract state and frontend state out of sync

#### 解决方案 / Solutions

**🛠️ 技术修复 / Technical Fixes:**
```typescript
// 1. 增强的权限检查 / Enhanced permission check
const claimReward = async (matchId: number): Promise<boolean> => {
  // 确保不是管理员地址在调用 / Ensure admin address is not calling
  const ADMIN_ADDRESS = '0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5'
  if (address.toLowerCase() === ADMIN_ADDRESS.toLowerCase()) {
    throw new Error('Admin should not claim rewards, only users can claim')
  }
  
  // 验证比赛状态和用户下注 / Verify match state and user bet
  const matchInfo = await contract.getMatch(matchId)
  const userBetInfo = await contract.getUserBet(matchId, address)
  // ... additional validations
}

// 2. 钱包切换时状态清理 / State cleanup on wallet switch
useEffect(() => {
  setError(null)
  setUserBet(null)
  if (currentMatchId && address && isConnected) {
    refreshUserBet(currentMatchId)
  }
}, [address, isConnected])
```

**👤 用户操作指南 / User Operation Guide:**
1. **刷新页面** / Refresh page - 清理所有缓存状态
2. **重新连接钱包** / Reconnect wallet - 确保权限状态正确
3. **确认钱包地址** / Confirm wallet address - 使用用户钱包而非管理员钱包
4. **清理浏览器缓存** / Clear browser cache - 如问题持续存在

**🔧 调试工具 / Debugging Tools:**
- **开发模式调试信息**: 显示当前地址、管理员状态、比赛信息等
- **详细错误提示**: 针对不同错误类型提供具体解决方案
- **一键刷新功能**: 快速重置页面状态

**Development Mode Debug Info**: Shows current address, admin status, match info, etc.
**Detailed Error Messages**: Specific solutions for different error types  
**One-click Refresh**: Quick page state reset

### 9. Next.js 水合错误修复 / Next.js Hydration Error Fix

#### 问题描述 / Problem Description
在开发过程中遇到 React 水合错误，表现为服务器端渲染的 HTML 与客户端渲染的 HTML 不匹配。

During development, encountered React hydration errors where server-side rendered HTML doesn't match client-side rendered HTML.

**🔍 错误表现 / Error Symptoms:**
```
Warning: Expected server HTML to contain a matching <button> in <div>.
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**🎯 根本原因 / Root Causes:**
- **localStorage 依赖**: `getClassicMatchups()` 在服务器端返回默认值，客户端从 localStorage 读取
- **条件渲染**: 基于钱包连接状态的管理员权限检查
- **浏览器 API**: 服务器端无法访问 `window`、`localStorage` 等浏览器 API

**Root Causes:**
- **localStorage dependency**: `getClassicMatchups()` returns defaults on server, reads from localStorage on client
- **Conditional rendering**: Admin permission checks based on wallet connection state
- **Browser APIs**: Server-side cannot access `window`, `localStorage`, etc.

#### 解决方案 / Solutions

**🛠️ 技术修复 / Technical Fixes:**
```typescript
// 1. 延迟加载客户端数据 / Delayed loading of client data
const [isMounted, setIsMounted] = useState(false)
const [matchups, setMatchups] = useState<any[]>([])
const [matchupsLoaded, setMatchupsLoaded] = useState(false)

useEffect(() => {
  setIsMounted(true)
  setMatchups(getClassicMatchups()) // 只在客户端加载 / Load only on client
  setMatchupsLoaded(true)
}, [])

// 2. 条件渲染防护 / Conditional rendering protection
{isMounted && isAdmin && (
  <button>Admin Button</button>
)}

// 3. 数据加载完成后渲染 / Render after data loading
{matchupsLoaded && (
  <div>Classic Matchups Content</div>
)}
```

**📋 修复清单 / Fix Checklist:**
- ✅ 管理员状态延迟初始化 / Delayed admin state initialization
- ✅ 对战数据客户端加载 / Client-side matchups loading  
- ✅ 条件渲染增加挂载检查 / Added mount check to conditional rendering
- ✅ localStorage 访问保护 / Protected localStorage access
- ✅ 调试信息延迟显示 / Delayed debug info display

**🎯 效果 / Results:**
- 消除所有水合错误 / Eliminated all hydration errors
- 保持服务器端渲染性能 / Maintained SSR performance  
- 确保客户端状态一致性 / Ensured client state consistency
- 改善开发体验 / Improved development experience

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

## 🎯 经典对战与自定义队伍 / Classic Matchups and Custom Teams

### 经典对战 / Classic Matchups
系统预设了四场经典对战组合，让球迷快速体验AI预测功能：

The system presets four classic matchup combinations for fans to quickly experience AI prediction features:

### 自定义队伍显示优化 / Custom Team Display Optimization

**🎨 视觉标识系统 / Visual Identity System:**
- **自定义队伍标识**: 使用 ⚡ 图标替代国旗
- **条件渲染**: 根据队伍类型智能显示不同UI元素
- **双语标识**: 显示"自定义队伍 / Custom Team"标签
- **统一设计语言**: 保持与官方队伍一致的视觉风格

**🔧 技术实现 / Technical Implementation:**
```typescript
// 自定义队伍识别函数 / Custom team identification function
export const isCustomTeam = (teamId: string): boolean => {
  return teamId.startsWith('team_') && /^team_\d+$/.test(teamId);
};

// 条件渲染示例 / Conditional rendering example
{!isCustomTeam(team.id) && (
  <img src={`https://flagsapi.com/${team.countryCode}/flat/64.png`} />
)}
{isCustomTeam(team.id) && (
  <div className="bg-gray-700 rounded flex items-center justify-center">
    <span className="text-4xl">⚡</span>
  </div>
)}
```

**📱 界面适配 / Interface Adaptation:**
- **对战卡片**: 自定义队伍不显示国旗，只显示队伍名称
- **选择界面**: 自定义队伍使用特殊图标和标签
- **对战页面**: 自定义队伍使用一致的视觉风格
- **投票界面**: 队伍名称智能显示逻辑

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

### Phase 2: AI增强 ✅
- [x] 智能解说生成系统
- [x] 基于真实数据的个性化分析
- [x] 多维度战术解说
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

## 🚀 动态队伍管理系统 / Dynamic Team Management System

### 🎯 解决方案概述 / Solution Overview
**新增功能**: 管理员可以动态添加自定义队伍，使用时间戳确保唯一性，完美解决用户重复押注问题。

**New Feature**: Administrators can dynamically add custom teams using timestamps to ensure uniqueness, perfectly solving duplicate betting issues.

### 🔧 核心特性 / Core Features

**1. 时间戳唯一ID生成 / Timestamp-based Unique ID Generation**
```typescript
// 使用时间戳生成唯一队伍ID / Generate unique team ID using timestamp
const uniqueTeamId = `team_${Date.now()}`;
// 示例: team_1672531200000
```

**2. 极简队伍添加流程 / Ultra-Simple Team Addition Process**
- **步骤1**: 管理员点击Admin按钮 → 进入管理面板
- **步骤2**: 点击"添加队伍"按钮 → 打开添加表单
- **步骤3**: 填写基础信息 → 4个必填字段
- **步骤4**: 提交保存 → 立即可用于创建比赛

**3. 必填队伍信息 / Required Team Information**
```
队伍名称 / Team Name: "某代号" (可自定义任意名称)
Historical Win Rate: 75% (历史胜率)
Average Age: 28.5 years old (平均年龄)
Injury Count: 1 people (伤病数量)
```

**4. 智能队伍分类显示 / Smart Team Category Display**
- **📊 官方队伍 / Official Teams**: 原有8支世界杯队伍
- **⚡ 自定义队伍 / Custom Teams**: 管理员添加的队伍(带⏰标识)

### 🚀 技术实现 / Technical Implementation

**数据存储机制 / Data Storage Mechanism:**
```typescript
// localStorage结构 / localStorage Structure
const dynamicTeamsStorage = {
  teams: [
    {
      id: 'team_1672531200000',        // 时间戳唯一ID
      name: '某代号',                   // 自定义名称
      winRate: 75,                     // 胜率
      avgAge: 28.5,                    // 平均年龄
      injuryCount: 1,                  // 伤病数量
      timestamp: 1672531200000,        // 创建时间戳
      createdBy: 'admin'               // 创建者标识
    }
  ]
};
```

**队伍获取逻辑 / Team Retrieval Logic:**
```typescript
// 获取所有队伍（静态+动态） / Get all teams (static + dynamic)
export const getAllTeams = (): Team[] => {
  const staticTeams = teams;           // 原有8支队伍
  const dynamicTeams = getDynamicTeams(); // 动态添加的队伍
  return [...staticTeams, ...dynamicTeams];
};
```

### ✅ 问题完美解决 / Problem Perfectly Solved

**❌ 之前的问题 / Previous Issues:**
- 重复队伍组合导致"Already bet"错误
- 用户无法正常下注
- 需要修改智能合约

**✅ 现在的解决方案 / Current Solution:**
- 每个队伍都有唯一时间戳ID
- 永远不会出现重复队伍组合
- 无需修改智能合约
- 用户体验完美流畅

### 📱 管理员界面预览 / Admin Interface Preview

```
┌─────────────────────────────────────┐
│  🏆 比赛管理 / Match Management     │
├─────────────────────────────────────┤
│  [➕ 添加队伍 / Add Team]           │
├─────────────────────────────────────┤
│  📋 创建新比赛 / Create New Match   │
│  ┌───────────────┬─────────────────┐ │
│  │ Team A        │ Team B          │ │
│  │ [选择...    ▼]│ [选择...      ▼]│ │
│  │ 📊 官方队伍   │ 📊 官方队伍     │ │
│  │ • 阿根廷      │ • 巴西          │ │
│  │ • 法国        │ • 英格兰        │ │
│  │ ⚡ 自定义队伍  │ ⚡ 自定义队伍   │ │
│  │ • 某代号 ⏰   │ • 队伍X ⏰     │ │
│  └───────────────┴─────────────────┘ │
│  [创建比赛 / Create Match]          │
└─────────────────────────────────────┘
```

### 🎮 使用演示 / Usage Demo

**管理员操作流程 / Admin Operation Flow:**
1. 点击右下角Admin按钮 → 进入管理面板
2. 点击"➕ 添加队伍"按钮 → 打开添加表单
3. 填写信息：
   - 队伍名称：某代号
   - Historical Win Rate: 75
   - Average Age: 28.5
   - Injury Count: 1
4. 点击"添加"按钮 → 队伍保存成功
5. 在Select选项中看到新队伍："某代号 ⏰"
6. 选择"某代号 VS 法国" → 创建比赛成功
7. 用户可正常下注，无重复问题 ✅

### 📊 核心优势总结 / Core Advantages Summary

| 方面 / Aspect | 传统方案 / Traditional | 动态方案 / Dynamic |
|---------------|----------------------|-------------------|
| 队伍数量 / Team Count | 固定8支 / Fixed 8 | 无限制 / Unlimited |
| 重复押注问题 / Duplicate Betting | 存在 / Exists | 完全解决 / Fully Solved |
| 合约修改 / Contract Changes | 需要 / Required | 不需要 / Not Required |
| 开发周期 / Development Time | 长 / Long | 短 / Short |
| 用户体验 / User Experience | 有问题 / Problematic | 完美 / Perfect |

## 🔧 Troubleshooting WebSocket Demo / WebSocket演示故障排除

### Common Issues / 常见问题

**1. 404 Error on /api/auth/login / 登录API 404错误**
```
ERROR: POST http://localhost:3000/api/auth/login 404 (Not Found)
```
**Solution / 解决方案:** 
- Make sure backend server is running on port 3001 / 确保后端服务器运行在端口3001
- Run `npm run server` to start the backend / 运行 `npm run server` 启动后端
- The frontend (Next.js) runs on port 3000, API server on port 3001 / 前端(Next.js)运行在端口3000，API服务器在端口3001

**2. WebSocket Connection Failed / WebSocket连接失败**
```
ERROR: WebSocket connection failed
```
**Solution / 解决方案:**
- Verify both servers are running / 确认两个服务器都在运行:
  - Backend: `npm run server` (port 3001)
  - Frontend: `npm run dev` (port 3000)
- Check WebSocket URL configuration / 检查WebSocket URL配置
- Run `npm run test-websocket` to verify connection / 运行 `npm run test-websocket` 验证连接

**3. Environment Variables / 环境变量**
```
Create .env file in root directory with:
在根目录创建 .env 文件，包含:

NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**4. Testing WebSocket Functionality / 测试WebSocket功能**
```bash
# Test all WebSocket connections / 测试所有WebSocket连接
npm run test-websocket

# Test API endpoints / 测试API端点
npm run test-api

# Run all tests / 运行所有测试
npm run test-all
```

### Server Startup Commands / 服务器启动命令

```bash
# Start backend server with WebSocket support / 启动支持WebSocket的后端服务器
npm run server

# Start frontend development server / 启动前端开发服务器
npm run dev

# Access WebSocket demo / 访问WebSocket演示
http://localhost:3000/websocket-demo
```

### WebSocket Demo Features / WebSocket演示功能

**Real-time Events / 实时事件:**
- ✅ User authentication / 用户认证
- ✅ Role-based permissions / 基于角色的权限
- ✅ Live status updates / 实时状态更新
- ✅ Event participation / 事件参与
- ✅ Match results broadcasting / 比赛结果广播
- ✅ QR code scanning / 二维码扫描
- ✅ Reward notifications / 奖励通知
- ✅ Health monitoring / 健康监控

**User Roles / 用户角色:**
- 🔧 Admin: System management / 系统管理
- 🧑‍💼 Ambassador: Event coordination / 活动协调
- 🏃‍♂️ Athlete: Competition participation / 比赛参与
- 🙋‍♂️ Audience: Event spectating / 观看活动

## Contract Addresses / 合约地址

- CHZ Token (Testnet): `0x4Bf7078D36F779Df3E98c24F51482C1002C2E23C` 