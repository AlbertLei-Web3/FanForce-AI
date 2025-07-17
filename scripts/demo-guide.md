# FanForce AI MVP Demo Guide 🎮
# FanForce AI MVP演示指南 🎮

**7-Day Demo Ready! / 7天演示准备就绪！**

This guide will help you demonstrate the complete MVP flow from athlete recruitment to reward distribution.
此指南将帮助您演示从运动员招募到奖励分配的完整MVP流程。

---

## 🔑 Test User Accounts / 测试用户账户

### Admin (管理员)
- **Name**: Sarah Administrator
- **Wallet**: `0xADMIN1234567890123456789012345678901234`
- **Balance**: 10,000 CHZ
- **Role**: System administration

### Ambassadors (大使)
- **Mike Chen**: `0xAMB11234567890123456789012345678901234`
  - Balance: 1,500 CHZ
  - University: Tech University
- **Lisa Wang**: `0xAMB21234567890123456789012345678901234`
  - Balance: 1,200 CHZ  
  - University: Tech University

### Athletes (运动员) - Soccer
- **Alex Thunder Johnson** (Forward): `0xATH11234567890123456789012345678901234`
- **Maria Lightning Rodriguez** (Midfielder): `0xATH21234567890123456789012345678901234`
- **James Storm Wilson** (Defender): `0xATH31234567890123456789012345678901234`
- **Emma Fire Chen** (Goalkeeper): `0xATH41234567890123456789012345678901234`
- **David Bolt Kim** (Forward): `0xATH51234567890123456789012345678901234`
- **Sophie Rocket Davis** (Midfielder): `0xATH61234567890123456789012345678901234`

### Athletes (运动员) - Basketball
- **Marcus Beast Thompson** (Center): `0xATH71234567890123456789012345678901234`
- **Zoe Flash Parker** (Guard): `0xATH81234567890123456789012345678901234`

### Audience (观众)
- **Alice Fan Smith**: `0xAUD11234567890123456789012345678901234` (850 CHZ)
- **Bob Sports Brown**: `0xAUD21234567890123456789012345678901234` (650 CHZ)
- **Carol Match Lee**: `0xAUD31234567890123456789012345678901234` (450 CHZ)
- **Daniel Event Wilson**: `0xAUD41234567890123456789012345678901234` (300 CHZ)

---

## 📋 Demo Script - Pre-Match Stage / 演示脚本 - 赛前阶段

### Step 1: Ambassador - Team Recruitment / 步骤1：大使 - 队伍招募

1. **Login as Mike Chen** (Ambassador)
   - Connect wallet: `0xAMB11234567890123456789012345678901234`
   - Navigate to dashboard

2. **Create Team Draft**
   - Click "Recruit Athlete" button
   - Create a soccer match: "Thunder Wolves vs Lightning Hawks"
   - **Team A (Thunder Wolves)**:
     - Alex Thunder Johnson (Forward)
     - James Storm Wilson (Defender) 
     - Emma Fire Chen (Goalkeeper)
   - **Team B (Lightning Hawks)**:
     - Maria Lightning Rodriguez (Midfielder)
     - David Bolt Kim (Forward)
     - Sophie Rocket Davis (Midfielder)
   - Save as draft

3. **Submit Event Application**
   - Click "Event Application" button
   - Pre-populated team information from draft
   - **Event Details**:
     - Title: "Campus Soccer Championship Finals"
     - Date: 2024-01-25, Time: 15:00
     - Venue: Main Soccer Field (500 capacity)
     - Party Venue: Student Center Rooftop (80 capacity)
   - Submit for admin approval

### Step 2: Admin - Event Approval & Pool Injection / 步骤2：管理员 - 活动审批和奖池注入

1. **Login as Sarah Administrator** (Admin)
   - Connect wallet: `0xADMIN1234567890123456789012345678901234`
   - Navigate to admin dashboard

2. **Review Event Application**
   - View pending event: "Campus Soccer Championship Finals"
   - Review team compositions and venue details

3. **Inject CHZ Pool**
   - Pool Amount: 2,500 CHZ
   - Fee Percentage: 5%
   - Approve event
   - **Result**: Event status changes to "pre_match"

### Step 3: Athlete - Competition Status / 步骤3：运动员 - 比赛状态

1. **Login as Alex Thunder Johnson** (Athlete)
   - Connect wallet: `0xATH11234567890123456789012345678901234`
   - View Competition Status

2. **View Upcoming Match**
   - See selection for "Campus Soccer Championship Finals"
   - Team: Thunder Wolves
   - Position: Forward
   - Match date and venue information
   - Prize pool: 2,500 CHZ

### Step 4: Audience - 3-Tier Staking / 步骤4：观众 - 三档质押

1. **Login as Alice Fan Smith** (Audience)
   - Connect wallet: `0xAUD11234567890123456789012345678901234`
   - Navigate to Featured Championship

2. **Select Support Tier**
   - Event: "Campus Soccer Championship Finals"
   - **Tier 2 Selection** (70% multiplier + QR check-in):
     - Stake: 100 CHZ
     - Support: Team A (Thunder Wolves)
     - Expected reward: ~75 CHZ
   - Confirm stake & participation

3. **Login as Bob Sports Brown** (Audience)
   - Connect wallet: `0xAUD21234567890123456789012345678901234`
   - **Tier 1 Selection** (100% multiplier + party access):
     - Stake: 150 CHZ
     - Support: Team B (Lightning Hawks)
     - Expected reward: ~120 CHZ

---

## 🏆 Demo Script - Post-Match Stage / 演示脚本 - 赛后阶段

### Step 5: Ambassador - Result Input / 步骤5：大使 - 结果录入

1. **Login as Mike Chen** (Ambassador)
   - Navigate to "Manage Events"
   - Click on "Campus Soccer Championship Finals"

2. **Input Match Results**
   - **Final Score**: Thunder Wolves 2 - 1 Lightning Hawks
   - **Winner**: Team A (Thunder Wolves)
   - Mark as draft or publish immediately

3. **Publish Results**
   - Confirm result publication
   - **Automatic Process**:
     - Event status → "completed"
     - Reward calculation triggered
     - Balance updates for all participants

### Step 6: Verify Reward Distribution / 步骤6：验证奖励分配

1. **Check Athlete Rankings**
   - Alex Thunder Johnson: Updated match statistics
   - All participating athletes: Win/loss records updated

2. **Check Audience Rewards**
   - Alice (supported winners): Received rewards based on Tier 2 multiplier
   - Bob (supported losers): Still received participation rewards
   - **Formula Applied**: 
     ```
     个人奖励 = (admin奖池 ÷ 总人数 × 三档系数) - (admin奖池 ÷ 总人数 × 三档系数 × 平台手续费)
     ```

3. **Admin Dashboard**
   - View transaction logs
   - Monitor platform fees collected
   - Event completion statistics

---

## 🎯 Key Features to Highlight / 要突出的关键功能

### 1. Complete Role-Based Workflow / 完整的基于角色的工作流
- Ambassador: Event creation and team management
- Admin: Approval system and pool injection
- Athlete: Status tracking and match participation
- Audience: Multi-tier support system

### 2. Real-Time Data Flow / 实时数据流
- Team draft → Event application → Admin approval → Pre-match state
- Athlete selection → Competition status updates
- Audience staking → Live participation counting
- Result input → Automatic reward distribution

### 3. Financial System / 金融系统
- CHZ balance management
- 3-tier staking with different multipliers
- Automatic reward calculation and distribution
- Platform fee collection

### 4. User Experience / 用户体验
- Bilingual interface (English/Chinese)
- Real-time UI updates
- Clear status indicators
- Comprehensive error handling

---

## 🚀 Quick Test Commands / 快速测试命令

```bash
# Start the development server
npm run dev

# Initialize demo data (if needed)
node scripts/add-demo-users.js

# Check database status
node scripts/check-balance.js

# Test API endpoints
node test-phase2-apis.js
```

---

## 📱 Demo Flow Summary / 演示流程总结

1. **Ambassador** creates team draft and submits event application
2. **Admin** reviews, injects CHZ pool, and approves event  
3. **Athletes** see their competition status and upcoming matches
4. **Audience** stakes CHZ with tier selection and team support
5. **Ambassador** inputs match results after the game
6. **System** automatically calculates and distributes rewards
7. **All users** see updated balances, rankings, and statistics

**Total Demo Time**: ~15-20 minutes for complete flow
**演示总时长**: 完整流程约15-20分钟

---

## 🎉 Success Metrics / 成功指标

✅ **Technical**: All APIs working, database transactions successful
✅ **UX**: Smooth role transitions, clear status updates  
✅ **Business**: Complete event lifecycle from creation to reward distribution
✅ **Integration**: Real-time balance updates, automatic calculations

**Ready for 7-day demo deadline! / 7天演示截止日期准备就绪！** 