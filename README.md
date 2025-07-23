# 🏆 FanForce - ICP-Powered Community Sports Platform | FanForce - ICP驱动的社区体育平台

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.0-blue" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.3-cyan" alt="Tailwind">
  <img src="https://img.shields.io/badge/PostgreSQL-17.5-blue" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Chiliz-CHZ-green" alt="Chiliz">
  <img src="https://img.shields.io/badge/ICP-Internet_Computer-purple" alt="ICP">
</p>

## 🎯 Core Philosophy | 核心理念

### Community Sports Platform with Cross-Chain Architecture
### 采用跨链架构的社区体育平台

**FanForce** is an experimental community sports platform that explores how **Internet Computer (ICP)** blockchain can enable decentralized, incentive-driven sports communities. The system combines traditional web technologies with blockchain for seamless user experience, using PostgreSQL for business logic, Chiliz for match betting, and ICP for community governance and season bonus management.

**FanForce** 是一个实验性社区体育平台，探索**互联网计算机(ICP)**区块链如何实现去中心化、激励驱动的体育社区。系统结合传统网络技术与区块链，提供无缝用户体验，使用PostgreSQL处理业务逻辑，Chiliz处理比赛下注，ICP处理社区治理和赛季奖金管理。

## 📖 Project Overview | 项目概述

### 🏫 Campus Pilot with Universal Vision | 具有通用愿景的校园试点

The system is designed as a **campus pilot** with a **cross-chain architecture** where:
- **PostgreSQL database** handles business logic and user management
- **Chiliz Chain** manages match betting and real-time sports engagement  
- **ICP Network** handles community governance and season bonus management
- **Seamless user experience** through familiar web interfaces
- **Experimental exploration** of decentralized community sports

系统设计为**校园试点**，采用**跨链架构**：
- **PostgreSQL数据库**处理业务逻辑和用户管理
- **Chiliz链**管理比赛下注和实时体育参与
- **ICP网络**处理社区治理和赛季奖金管理
- 通过熟悉的网络界面提供**无缝用户体验**
- **实验性探索**去中心化社区体育

### 🌍 Universal Community Sports Ecosystem | 通用社区体育生态系统

Our platform is designed to serve **any community** where amateur sports events naturally occur:
我们的平台旨在服务于**任何**业余体育赛事自然发生的社区：

Campus Communities | 校园社区
- University sports leagues
- Student clubs and organizations
- Inter-department competitions
- Alumni engagement programs

Neighborhood Communities | 邻里社区
- Local sports clubs
- Community centers
- Park leagues and tournaments
- Family sports events

Corporate Communities | 企业社区
- Company sports teams
- Industry leagues
- Corporate wellness programs
- Professional networking through sports

Cultural Communities | 文化社区
- Ethnic sports associations
- Cultural center programs
- Heritage sports preservation
- Cross-cultural sports exchange

Commercial Communities | 商业社区
- Gym and fitness communities
- Sports facility memberships
- Retail sports leagues
- Brand-sponsored events

### 🎭 Four-Role System | 四角色系统

#### 🔧 System Admin | 系统管理员
**Database-driven system management | 数据库驱动的系统管理**
- Deploy PostgreSQL database with all tables | 部署包含所有表的PostgreSQL数据库
- Deploy smart contracts on Chiliz and ICP networks | 在Chiliz和ICP网络上部署智能合约
- Configure ICP season bonus pool tracking | 配置ICP赛季奖金池追踪
- Set fee rules: 5% stake + 2% withdraw + 3% distribution | 设置手续费规则：5%质押 + 2%提取 + 3%分配
- Generate JWT QR codes with 4-hour expiry timers | 生成4小时过期的JWT二维码
- Monitor real-time check-ins via WebSocket | 通过WebSocket监控实时签到

#### 🧑‍💼 Campus Ambassador | 校园大使
**Event orchestration and athlete recruitment | 活动协调和运动员招募**
- Recruit student athletes and store profiles in database | 招募学生运动员并在数据库中存储档案
- Partner with local merchants for sponsorship | 与本地商户合作赞助
- Create events with unique invite codes | 创建具有唯一邀请码的活动
- Organize matches using ranking-based algorithm suggestions | 使用基于排名的算法建议组织比赛
- Host limited capacity after-parties with algorithm-based selection | 举办基于算法选择的限量聚会
- Receive 1% fee share tracked in database balance | 获得在数据库余额中追踪的1%手续费分成

#### 🏃‍♂️ Student Athlete | 学生运动员
**Competition participation and career progression | 比赛参与和职业发展**
- Register via web form with wallet signature | 通过网络表单注册并进行钱包签名
- Receive ICP season bonus pool credits tracked in database | 获得在数据库中追踪的ICP赛季奖金池积分
- Enter competition cycle with entry fees deducted from virtual balance | 进入比赛循环，从虚拟余额中扣除参赛费
- Participate in matches with ranking updates | 参与比赛并更新排名
- Complete season requirements: 10+ matches + social media posts | 完成赛季要求：10+场比赛 + 社交媒体帖子
- Claim ICP season bonuses after season completion | 赛季完成后领取ICP赛季奖金
- View real-time ICP network status and canister statistics | 查看实时ICP网络状态和容器统计

#### 🙋‍♂️ Audience Supporter | 观众支持者
**Three-tier participation system | 三层参与系统**
- **Tier 3 (Stake Only)**: 30% reward multiplier | **第三层（仅质押）**：30%奖励倍数
- **Tier 2 (Stake + Match)**: 70% reward multiplier with physical attendance | **第二层（质押+比赛）**：需要现场参与的70%奖励倍数
- **Tier 1 (Stake + Match + Party)**: 100%+ reward multiplier with party access | **第一层（质押+比赛+聚会）**：100%+奖励倍数并可参加聚会

## 🏗️ Technical Architecture | 技术架构

### Cross-Chain Architecture | 跨链架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                           │
│  Next.js 14 + TypeScript + Tailwind CSS + React Context    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                       │
│        PostgreSQL Database + Express.js API Server         │
│   • User Management  • Event Management  • Analytics       │
│   • ICP Bonus Pool   • Ranking System   • JWT Auth        │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Blockchain Layer                          │
│           Chiliz Chain (Match Betting) + ICP Network       │
│  (Community Governance & Season Bonus Management)          │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema | 数据库架构

**Core Tables (11) | 核心表（11个）**
- `users` - User profiles and roles | 用户档案和角色
- `venues` - Campus venues with capacity limits | 校园场馆及容量限制
- `events` - Sports events and matches | 体育赛事和比赛
- `athletes` - Student athlete profiles and rankings | 学生运动员档案和排名
- `event_participants` - Event participation tracking | 活动参与追踪
- `qr_codes` - JWT QR codes with expiry | 带过期时间的JWT二维码
- `qr_scans` - QR code scanning records | 二维码扫描记录
- `transactions` - ICP bonus transaction history | ICP奖金交易历史
- `rewards` - Reward distribution records | 奖励分配记录
- `analytics` - System analytics and metrics | 系统分析和指标
- `invite_codes` - Event invitation codes | 活动邀请码

**Enhanced Tables (9) | 增强表（9个）**
- `substitute_players` - Backup athlete system | 候补运动员系统
- `event_contingencies` - Emergency event handling | 紧急事件处理
- `refund_transactions` - Automated refund processing | 自动退款处理
- `emergency_notifications` - Multi-channel notifications | 多渠道通知
- `weather_conditions` - Weather monitoring integration | 天气监控集成
- `venue_availability` - Real-time venue availability | 实时场馆可用性
- `system_alerts` - System monitoring and alerts | 系统监控和警报
- `compensation_records` - Compensation tracking | 补偿追踪
- `schema_backup` - Database schema backup | 数据库架构备份

## 🌐 ICP Integration | ICP集成

### ICP Season Bonus Pool | ICP赛季奖金池

**Replacing Virtual CHZ with ICP-based Season Bonuses | 用基于ICP的赛季奖金替换虚拟CHZ**

```motoko
// ICP Season Bonus Canister
actor class FanForceSeasonBonus() = {
    // Athlete profile management
    type AthleteProfile = {
        id: Text;
        name: Text;
        studentId: Text;
        sport: Text;
        position: Text;
        team: Text;
        rank: Text;
        rankPoints: Nat;
        status: Text;
    };
    
    // Season bonus calculation
    public func assignSeasonBonus(
        athleteId: Text,
        seasonId: Text,
        baseSalary: Float,
        seasonMatches: Nat,
        socialPosts: Nat
    ) : async Result.Result<Text, Text> {
        // Immutable bonus assignment on ICP
    };
}
```

### ICP Service Layer | ICP服务层

```typescript
// ICP Service for frontend integration
class ICPService {
    async getAthleteProfile(athleteId: string): Promise<AthleteProfile | null>
    async getSeasonBonus(athleteId: string, seasonId: string): Promise<SeasonBonus | null>
    async claimSeasonBonus(athleteId: string, seasonId: string): Promise<boolean>
    async getNetworkStatus(): Promise<ICPNetworkStatus>
}
```

## 🚀 Quick Start | 快速开始

### 1. Prerequisites | 环境要求

- Node.js 18.17+
- PostgreSQL 12+
- Web3 wallet (MetaMask recommended) | Web3钱包（推荐MetaMask）
- DFX (for ICP development) | DFX（用于ICP开发）

### 2. Database Setup | 数据库设置

```bash
# Install PostgreSQL | 安装PostgreSQL
# Windows (using Chocolatey)
choco install postgresql

# macOS (using Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Create database user | 创建数据库用户
psql -U postgres
CREATE USER fanforce_user WITH PASSWORD 'your_password';
ALTER USER fanforce_user CREATEDB;

# Initialize database | 初始化数据库
node scripts/init-database.js
```

### 3. ICP Development Setup | ICP开发设置

```bash
# Install DFX | 安装DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Start local ICP network | 启动本地ICP网络
dfx start --background

# Deploy ICP canisters | 部署ICP容器
dfx deploy
```

### 4. Installation | 安装

```bash
# Clone repository | 克隆仓库
git clone https://github.com/your-username/fanforce.git
cd fanforce

# Install dependencies | 安装依赖
npm install

# Configure environment | 配置环境变量
cp .env.example .env.local
# Edit .env.local with your database and ICP credentials
```

### 5. Start Development | 启动开发

```bash
# Start backend API server (port 3001) | 启动后端API服务器（端口3001）
npm run server

# Start frontend development server (port 3000) | 启动前端开发服务器（端口3000）
npm run dev

# Or start both simultaneously | 或同时启动两者
npm run dev-all
```

### 6. Access Dashboards | 访问仪表板

- **Admin Dashboard**: `http://localhost:3000/dashboard/admin` | 管理员仪表板
- **Ambassador Dashboard**: `http://localhost:3000/dashboard/ambassador` | 大使仪表板
- **Athlete Dashboard**: `http://localhost:3000/dashboard/athlete` | 运动员仪表板
- **Audience Dashboard**: `http://localhost:3000/dashboard/audience` | 观众仪表板

## 🎮 Dashboard Features | 仪表板功能

### 🔧 Admin Dashboard | 管理员仪表板
**Complete system oversight and management | 完整的系统监督和管理**
- **Real-time Analytics**: User metrics, event statistics, revenue tracking | 实时分析：用户指标、活动统计、收入追踪
- **ICP Network Status**: Live connection status and canister statistics | ICP网络状态：实时连接状态和容器统计
- **Ambassador Approval**: Review and approve ambassador applications | 大使审批：审查和批准大使申请
- **Venue Management**: Configure venues and QR code generation | 场馆管理：配置场馆和二维码生成
- **User Management**: Role assignments and user oversight | 用户管理：角色分配和用户监督
- **System Configuration**: Fee rules, reward distribution settings | 系统配置：手续费规则、奖励分配设置

### 🧑‍💼 Ambassador Dashboard | 大使仪表板
**Event orchestration and athlete management | 活动协调和运动员管理**
- **Event Creation**: Create events with unique invite codes | 活动创建：创建具有唯一邀请码的活动
- **Athlete Recruitment**: Recruit and manage student athletes | 运动员招募：招募和管理学生运动员
- **Application Center**: Submit applications for events and sponsorships | 申请中心：提交活动和赞助申请
- **Performance Metrics**: Track recruitment success and event performance | 绩效指标：追踪招募成功率和活动表现
- **Match Organization**: Organize matches using ranking algorithms | 比赛组织：使用排名算法组织比赛

### 🏃‍♂️ Athlete Dashboard | 运动员仪表板
**Competition participation and career tracking | 比赛参与和职业追踪**
- **Competition Center**: View available competitions and rankings | 比赛中心：查看可用比赛和排名
- **ICP Season Bonus Pool**: Track ICP earnings and season progress | ICP赛季奖金池：追踪ICP收入和赛季进度
- **Match History**: Complete match history and performance analytics | 比赛历史：完整的比赛历史和表现分析
- **Season Progress**: Track requirements for ICP bonus eligibility | 赛季进度：追踪ICP奖金资格要求
- **Social Media Integration**: Post verification and engagement tracking | 社交媒体集成：帖子验证和参与度追踪

### 🙋‍♂️ Audience Dashboard | 观众仪表板
**Three-tier event participation system | 三层活动参与系统**
- **Event Selection**: Browse and select events to support | 活动选择：浏览和选择支持的活动
- **Three-tier Staking**: Choose participation level (Stake/Match/Party) | 三层质押：选择参与级别（质押/比赛/聚会）
- **QR Check-in**: Scan QR codes for physical attendance verification | 二维码签到：扫描二维码进行现场参与验证
- **Reward Tracking**: Monitor staking rewards and tier benefits | 奖励追踪：监控质押奖励和层级福利
- **Community Features**: Connect with other supporters and athletes | 社区功能：与其他支持者和运动员连接

## 🔄 Real-time Engine | 实时引擎

### WebSocket Integration | WebSocket集成

**Comprehensive real-time communication system | 综合实时通信系统**

```bash
# Start WebSocket server | 启动WebSocket服务器
npm run server

# Test WebSocket connections | 测试WebSocket连接
npm run test-websocket

# Access WebSocket demo | 访问WebSocket演示
http://localhost:3000/websocket-demo
```

**Real-time Features | 实时功能**
- **Role-based Authentication**: JWT token authentication for all roles | 基于角色的认证：所有角色的JWT令牌认证
- **Event Participation**: Real-time event joining and status updates | 活动参与：实时活动加入和状态更新
- **Match Results**: Live match result broadcasting | 比赛结果：实时比赛结果广播
- **QR Code Integration**: Real-time QR scanning notifications | 二维码集成：实时二维码扫描通知
- **ICP Network Status**: Real-time ICP connection monitoring | ICP网络状态：实时ICP连接监控
- **Health Monitoring**: Connection health and auto-reconnection | 健康监控：连接健康和自动重连

## 💰 Smart Contract Integration | 智能合约集成

### Cross-Chain Contract Design | 跨链合约设计

**Chiliz Chain Contract - Match Betting | Chiliz链合约 - 比赛下注**

```solidity
contract FanForcePredictionDemo {
    function receive() external payable;              // Accept CHZ deposits | 接受CHZ存款
    function withdraw(uint256 amount) external;       // Auto-deduct 2% fee | 自动扣除2%手续费
    function batchTransfer(address[] recipients, uint256[] amounts) external; // Batch payouts | 批量支付
    function getFeeBalance() external view returns (uint256); // Check collected fees | 查看收集的手续费
    function emergency() external;                    // Admin emergency functions | 管理员紧急功能
}
```

**ICP Network Canister - Community Governance | ICP网络容器 - 社区治理**

```motoko
actor class FanForceCommunitySports() = {
    // Community-agnostic profile management
    // 社区无关的档案管理
    type CommunityProfile = {
        id: Text;
        communityType: Text; // campus, neighborhood, corporate, etc.
        name: Text;
        location: Text;
        memberCount: Nat;
        seasonBonuses: [SeasonBonus];
    };
    
    // Universal bonus calculation
    // 通用奖金计算
    public func assignCommunityBonus(
        communityId: Text,
        memberId: Text,
        baseSalary: Float,
        participationBonus: Float,
        contributionBonus: Float
    ) : async Result.Result<Text, Text> {
        // Immutable bonus assignment on ICP
        // 在ICP上进行不可变奖金分配
    };
}
```

### Contract Addresses | 合约地址

- **Chiliz Testnet (Spicy)**: `0x90C9D004cB071064Ba9B9f091Dc96D76b09E8aBC`
- **ICP Canister ID**: `bkyz2-fmaaa-aaaaa-aaaqa-cai` (Mock for demo)
- **Mainnet**: Coming soon | 即将推出

### Fee Structure | 手续费结构

- **Staking Fee**: 5% of stake amount | 质押手续费：质押金额的5%
- **Withdrawal Fee**: 2% of withdrawal amount | 提取手续费：提取金额的2%
- **Distribution Fee**: 3% of total rewards | 分配手续费：总奖励的3%
- **Fee Distribution**: 1% each to Ambassador/Athletes/Community Fund | 手续费分配：各1%给大使/运动员/社区基金

## 🧪 Testing & Validation | 测试与验证

### Automated Testing | 自动化测试

```bash
# Zero-gas quick validation (recommended) | 零Gas快速验证（推荐）
npx hardhat run scripts/quick-validation.js --network chilizSpicy

# Gas optimized testing | Gas优化测试
npx hardhat run scripts/gas-optimized-test.js --network chilizSpicyLowGas

# Complete flow testing | 完整流程测试
npx hardhat run scripts/complete-flow-test.js --network chilizSpicy

# Database testing | 数据库测试
npm run test-api

# WebSocket testing | WebSocket测试
npm run test-websocket

# ICP integration testing | ICP集成测试
npm run test-icp
```

### Test Coverage | 测试覆盖范围

- ✅ **Database Operations**: User management, event creation, analytics | 数据库操作：用户管理、活动创建、分析
- ✅ **Smart Contract**: CHZ transfers, fee deduction, batch operations | 智能合约：CHZ转账、手续费扣除、批量操作
- ✅ **WebSocket**: Real-time communication, role-based permissions | WebSocket：实时通信、基于角色的权限
- ✅ **Authentication**: JWT tokens, wallet signatures, role verification | 认证：JWT令牌、钱包签名、角色验证
- ✅ **ICP Integration**: Canister communication, bonus management | ICP集成：容器通信、奖金管理
- ✅ **UI/UX**: Responsive design, dashboard functionality, error handling | UI/UX：响应式设计、仪表板功能、错误处理

## 🛡️ Contingency Handling | 突发情况处理

### Real-World Scenario Management | 现实场景管理

**Comprehensive contingency system for community sports events | 社区体育赛事的综合突发情况系统**

- **🏃‍♂️ Substitute Player System**: 4-tier priority with automatic activation | 候补球员系统：4级优先级自动激活
- **🌦️ Weather Monitoring**: Real-time weather API integration with safety assessment | 天气监控：实时天气API集成及安全评估
- **🏢 Venue Management**: Availability tracking, capacity adjustment, alternative venues | 场馆管理：可用性追踪、容量调整、备选场馆
- **💸 Emergency Refunds**: Automated refund processing with blockchain execution | 紧急退款：自动退款处理及区块链执行
- **📱 Multi-channel Notifications**: SMS/Email/Push with delivery tracking | 多渠道通知：SMS/邮件/推送及送达追踪
- **🔧 System Monitoring**: Real-time alerts with automatic recovery | 系统监控：实时警报及自动恢复

## 🌐 Internationalization | 国际化

**Complete bilingual support (English/Chinese) | 完整的双语支持（英文/中文）**

- **Unified Text Management**: All translations in `app/utils/i18n.ts` | 统一文本管理：所有翻译在`app/utils/i18n.ts`中
- **Type Safety**: TypeScript interfaces ensure translation completeness | 类型安全：TypeScript接口确保翻译完整性
- **Context Integration**: Global language state via React Context | 上下文集成：通过React Context的全局语言状态
- **Dynamic Switching**: Real-time language switching without page reload | 动态切换：无需页面重载的实时语言切换

## 📈 Roadmap | 路线图

### Phase 1: Campus Pilot (Current) ✅
- [x] ICP Community Sports Platform MVP | ICP社区体育平台MVP
- [x] Cross-chain integration exploration | 跨链集成探索
- [x] Real-time network monitoring | 实时网络监控
- [x] Decentralized community profiles | 去中心化社区档案
- [x] Four-role dashboard system | 四角色仪表板系统
- [x] PostgreSQL database integration | PostgreSQL数据库集成
- [x] Chiliz smart contract integration | Chiliz智能合约集成
- [x] WebSocket real-time engine | WebSocket实时引擎

### Phase 2: Community Expansion (Planned) 🔄
- [ ] Neighborhood sports communities | 邻里体育社区
- [ ] Corporate wellness programs | 企业健康计划
- [ ] Cultural sports associations | 文化体育协会
- [ ] Commercial sports organizations | 商业体育组织
- [ ] Multi-tenant architecture | 多租户架构
- [ ] Advanced analytics dashboard | 高级分析仪表板

### Phase 3: Global Ecosystem (Vision) 🔮
- [ ] International community partnerships | 国际社区合作
- [ ] Multi-language platform support | 多语言平台支持
- [ ] Advanced cross-chain bridges | 高级跨链桥接
- [ ] Community analytics and insights | 社区分析和洞察
- [ ] Mobile app development | 移动应用开发
- [ ] Professional sports integration | 职业体育集成

## 🎯 Why This Matters | 为什么这很重要

### For the ICP Ecosystem | 对ICP生态系统
- **Real-world Adoption Potential**: Could bring ICP to community sports worldwide | 真实世界采用潜力：可能将ICP带入全球社区体育
- **User Onboarding**: Could convert traditional users to Web3 | 用户引导：可能将传统用户转换为Web3
- **Use Case Validation**: Could prove ICP's value in social applications | 用例验证：可能证明ICP在社交应用中的价值
- **Cultural Diversity**: Could support diverse community types globally | 文化多样性：可能支持全球多样化的社区类型

### For the Sports Industry | 对体育行业
- **Transparency Potential**: Could provide immutable records of achievements and rewards | 透明度潜力：可能提供成就和奖励的不可变记录
- **Efficiency Potential**: Could enable automated reward distribution and governance | 效率潜力：可能实现自动奖励分配和治理
- **Community Building**: Could enable decentralized ownership and participation | 社区建设：可能实现去中心化所有权和参与
- **Universal Access**: Could break down geographic and cultural barriers | 通用访问：可能打破地理和文化障碍

### For Community Members | 对社区成员
- **Ownership Potential**: Could provide true ownership of achievements and rewards | 所有权潜力：可能提供对成就和奖励的真正所有权
- **Transparency Potential**: Could provide clear visibility into reward calculations | 透明度潜力：可能提供对奖励计算的清晰可见性
- **Community**: Could enable belonging to a global, decentralized sports community | 社区：可能实现属于全球去中心化体育社区
- **Cultural Preservation**: Could help maintain local traditions through technology | 文化保护：可能通过技术帮助维护当地传统

## 🤝 Contributing | 贡献

**Welcome to contribute to the FanForce ecosystem! | 欢迎为FanForce生态系统做出贡献！**

### Development Standards | 开发标准

1. **Bilingual Comments**: All functions must include English/Chinese comments | 双语注释：所有函数必须包含英文/中文注释
2. **Type Safety**: Use TypeScript for all components | 类型安全：所有组件使用TypeScript
3. **Responsive Design**: Support mobile and desktop | 响应式设计：支持移动端和桌面端
4. **Performance**: Optimize for production deployment | 性能：针对生产部署优化
5. **ICP Integration**: Follow ICP development best practices | ICP集成：遵循ICP开发最佳实践

### Git Commit Standards | Git提交标准

```bash
# Feature addition | 功能添加
feat(dashboard): add real-time analytics to admin dashboard
功能(仪表板): 为管理员仪表板添加实时分析功能

# Bug fix | 错误修复
fix(websocket): resolve connection timeout issues
修复(websocket): 解决连接超时问题

# ICP integration | ICP集成
feat(icp): integrate season bonus management on Internet Computer
功能(icp): 在互联网计算机上集成赛季奖金管理

# Documentation | 文档
docs(readme): update installation instructions
文档(readme): 更新安装说明
```

## 📄 License | 许可证

MIT License - See [LICENSE](LICENSE) file for details | MIT许可证 - 详见[LICENSE](LICENSE)文件

## 🔗 Links | 相关链接

- [Internet Computer Documentation](https://internetcomputer.org/docs/) | 互联网计算机文档
- [Chiliz Documentation](https://docs.chiliz.com/) | Chiliz文档
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) | PostgreSQL文档
- [Next.js Documentation](https://nextjs.org/docs) | Next.js文档
- [WebSocket Documentation](https://socket.io/docs/) | WebSocket文档

## 📧 Contact | 联系方式

- **Project Maintainer**: FanForce Team | 项目维护者：FanForce团队
- **Email**: albert.lei1975@gmail.com | 邮箱：calbert.lei1975@gmail.com
- **GitHub**: [FanForce Repository](https://github.com/AlbertLei-Web3/FanForce-AI) | GitHub仓库

---

**Built with ❤️ for community sports worldwide | 为全球社区体育用心打造**