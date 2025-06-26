# 🧪 FanForce AI - 完整流程验证指南 | Complete Flow Testing Guide

## 📋 验证概述 | Testing Overview

此指南帮助您验证 FanForce AI 预测平台的完整用户流程，包括管理员和普通用户的所有功能。

This guide helps you validate the complete user flows of the FanForce AI prediction platform, including all functionality for both admin and regular users.

## 🎯 测试目标 | Testing Objectives

- ✅ 验证权限控制正确性 | Verify permission controls
- ✅ 确保按钮状态准确显示 | Ensure button states display accurately  
- ✅ 测试完整的博彩流程 | Test complete betting flow
- ✅ 验证奖励分配机制 | Verify reward distribution mechanism
- ✅ 检查错误处理逻辑 | Check error handling logic

## 🔧 自动化测试 | Automated Testing

### 运行完整流程测试脚本 | Run Complete Flow Test Script

```bash
# 🔍 零Gas消耗快速验证 | Zero gas quick validation
npx hardhat run scripts/quick-validation.js --network chilizSpicy

# ⚡ Gas优化测试（推荐）| Gas optimized test (recommended)
npx hardhat run scripts/gas-optimized-test.js --network chilizSpicy

# 🔥 超低Gas价格测试 | Ultra low gas price test
npx hardhat run scripts/gas-optimized-test.js --network chilizSpicyLowGas

# 📊 完整流程测试（Gas消耗较高）| Complete flow test (higher gas usage)
npx hardhat run scripts/complete-flow-test.js --network chilizSpicy

# 💰 检查余额 | Check balance
npx hardhat run scripts/check-balance.js --network chilizSpicy

# 🏆 检查奖励池 | Check reward pool
npx hardhat run scripts/check-reward-pool.js --network chilizSpicy
```

### ⚡ Gas优化建议 | Gas Optimization Recommendations

**推荐测试顺序 | Recommended Testing Order:**

1. **先运行零Gas验证** | First run zero-gas validation:
   ```bash
   npx hardhat run scripts/quick-validation.js --network chilizSpicy
   ```

2. **再运行Gas优化测试** | Then run gas-optimized test:
   ```bash
   npx hardhat run scripts/gas-optimized-test.js --network chilizSpicyLowGas
   ```

3. **最后使用前端验证** | Finally validate with frontend:
   ```bash
   npm run dev
   # 访问 http://localhost:3000
   ```

## 👤 手动验证流程 | Manual Validation Process

### 阶段 1: 环境准备 | Phase 1: Environment Setup

1. **启动应用 | Start Application**
   ```bash
   npm run dev
   ```

2. **连接钱包 | Connect Wallet**
   - 打开 http://localhost:3000
   - 连接 MetaMask 钱包
   - 确保选择 Chiliz Spicy 测试网络
   - 验证钱包地址显示正确

3. **检查初始状态 | Check Initial State**
   - [ ] 页面正常加载
   - [ ] Navbar 显示钱包地址
   - [ ] 队伍选择界面正常显示
   - [ ] 所有按钮处于正确初始状态

### 阶段 2: 管理员流程验证 | Phase 2: Admin Flow Validation

**⚠️ 重要：需要使用管理员地址进行测试**
**Important: Must use admin address for testing**

管理员地址 | Admin Address: `0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5`

#### 2.1 管理员权限检查 | Admin Permission Check

- [ ] **检查 "重新选择队伍" 按钮可见性**
  - 管理员登录：按钮应该可见 ✅
  - 普通用户登录：按钮应该隐藏 ❌
  
- [ ] **检查管理员面板访问**
  - 页面底部应显示管理员面板
  - 面板包含：创建比赛、注入奖励、公布结果、重置比赛功能

#### 2.2 管理员操作流程 | Admin Operation Flow

**步骤 1: 创建比赛 | Step 1: Create Match**
```
操作：点击任意经典对战组合
预期：MetaMask 弹出交易确认
结果：[ ] 交易成功，比赛创建完成
```

**步骤 2: 注入奖励 | Step 2: Inject Reward**
```
操作：在管理员面板输入奖励金额，点击 "注入奖励"
预期：MetaMask 弹出交易确认
输入：10 CHZ（建议金额）
结果：[ ] 交易成功，奖励注入完成
```

**步骤 3: 公布结果 | Step 3: Settle Match**
```
操作：选择获胜队伍，点击 "公布结果"
预期：MetaMask 弹出交易确认
结果：[ ] 交易成功，比赛结算完成
```

**步骤 4: 重置比赛 | Step 4: Reset Match**
```
操作：点击 "重置比赛"
预期：MetaMask 弹出交易确认
结果：[ ] 交易成功，比赛重置完成
```

### 阶段 3: 用户流程验证 | Phase 3: User Flow Validation

#### 3.1 初次连接验证 | First Connection Validation

**场景：全新比赛，用户首次点击**

1. **选择队伍组合**
   ```
   操作：点击任意经典对战（如 France vs England）
   预期：MetaMask 弹出交易确认（创建比赛）
   结果：[ ] 比赛创建成功，进入对战界面
   ```

2. **下注按钮状态检查**
   ```
   预期状态：
   - "Bet on [Team A]" 按钮：[ ] 可点击（蓝色）
   - "Bet on [Team B]" 按钮：[ ] 可点击（蓝色）
   - 显示正确的按钮文字（非 "Loading..." 或 "Connect Wallet"）
   ```

#### 3.2 下注流程验证 | Betting Flow Validation

**步骤 1: 选择下注队伍**
```
操作：点击 "Bet on [Team A]" 或 "Bet on [Team B]"
预期：MetaMask 弹出交易确认
输入金额：2 CHZ（建议金额）
结果：[ ] 交易成功，下注完成
```

**步骤 2: 下注后状态检查**
```
预期状态：
- 用户已下注的队伍按钮：[ ] 显示为绿色，文字为 "Bet Placed"
- 另一队伍按钮：[ ] 禁用状态，文字为 "Already Bet"
- 显示当前下注信息
```

**步骤 3: 跨页面状态持久性**
```
操作：返回首页，再次点击相同比赛
预期：无需 MetaMask 交易，直接进入对战界面
结果：[ ] 按钮状态保持正确（下注状态持久化）
```

#### 3.3 奖励领取验证 | Reward Claiming Validation

**前提：管理员已结算比赛**

1. **检查领取奖励按钮**
   ```
   如果用户下注获胜队伍：
   - [ ] 显示 "Claim Reward" 按钮（绿色）
   
   如果用户下注失败队伍：
   - [ ] 显示 "Lost Bet" 状态（红色）
   ```

2. **执行奖励领取**
   ```
   操作：点击 "Claim Reward"
   预期：MetaMask 弹出交易确认
   结果：[ ] 交易成功，奖励领取完成
   ```

3. **领取后状态检查**
   ```
   预期：按钮文字变为 "Reward Claimed"，禁用状态
   ```

### 阶段 4: 错误场景测试 | Phase 4: Error Scenario Testing

#### 4.1 权限错误测试 | Permission Error Testing

- [ ] **非管理员尝试管理操作**
  - 切换到非管理员钱包
  - 尝试执行管理员操作
  - 预期：显示权限错误提示

#### 4.2 状态冲突测试 | State Conflict Testing

- [ ] **重复下注测试**
  - 已下注用户再次尝试下注
  - 预期：按钮正确禁用，无法执行

- [ ] **重复领取测试**
  - 已领取奖励用户再次尝试领取
  - 预期：按钮正确禁用，无法执行

#### 4.3 网络错误测试 | Network Error Testing

- [ ] **断网测试**
  - 暂时断开网络连接
  - 尝试执行操作
  - 预期：显示网络错误提示

- [ ] **交易失败测试**
  - 余额不足情况下尝试下注
  - 预期：显示余额不足错误

### 阶段 5: UI/UX 验证 | Phase 5: UI/UX Validation

#### 5.1 响应式设计测试 | Responsive Design Testing

- [ ] **桌面端显示**
  - 布局正常，按钮可点击
  - 文字清晰可读

- [ ] **移动端显示**
  - 使用浏览器开发者工具切换到移动端视图
  - 检查布局是否适配

#### 5.2 国际化测试 | Internationalization Testing

- [ ] **语言切换**
  - 检查中英文切换功能
  - 验证所有文字正确翻译

#### 5.3 通知系统测试 | Notification System Testing

- [ ] **成功通知**
  - 执行成功操作，检查绿色通知显示
  
- [ ] **错误通知**
  - 执行失败操作，检查红色通知显示

- [ ] **自动消失**
  - 通知是否在4秒后自动消失

## 📊 测试记录模板 | Test Record Template

### 测试环境信息 | Test Environment Info
```
测试日期 | Test Date: ___________
测试者 | Tester: ___________
钱包地址 | Wallet Address: ___________
网络 | Network: Chiliz Spicy Testnet
合约地址 | Contract Address: 0x0Aa8861bd3691F8dd92291Dd639d43ACb17aB5f5
```

### 测试结果记录 | Test Results Record
```
✅ 管理员权限控制：通过 | Pass
✅ 用户下注流程：通过 | Pass  
✅ 奖励领取流程：通过 | Pass
✅ 错误处理机制：通过 | Pass
✅ UI/UX 体验：通过 | Pass

问题记录 | Issues Found:
1. ___________
2. ___________
3. ___________
```

## 🚀 快速验证脚本 | Quick Validation Script

如果您希望快速验证主要功能，可以运行：

```bash
# 一键验证所有核心功能 | One-click validation of all core functions
npx hardhat run scripts/complete-flow-test.js --network chilizSpicy
```

## 📞 支持联系 | Support Contact

如果在测试过程中遇到问题，请提供：
- 测试步骤详情
- 错误信息截图  
- 钱包地址和交易哈希
- 浏览器控制台日志

If you encounter issues during testing, please provide:
- Detailed test steps
- Error message screenshots
- Wallet address and transaction hash
- Browser console logs 