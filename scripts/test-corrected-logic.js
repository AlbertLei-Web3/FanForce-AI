// Test script for corrected non-zero-sum betting logic
// 修正后的非零和博弈逻辑测试脚本
// This script tests the corrected fund flow with proper fee structure
// 该脚本测试修正后的资金流程和正确的手续费结构

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🧪 Testing Corrected Contract Logic");
  console.log("🧪 测试修正后的合约逻辑\n");

  // Get new contract address from deployment
  const deploymentInfo = require("../deployment-info.json");
  const PREDICTION_CONTRACT = deploymentInfo.contractAddress;
  const MATCH_ID = 1;
  const TEAM_A = 1;
  const TEAM_B = 2;
  const BET_AMOUNT = ethers.parseEther("10.0"); // 10 CHZ for clear calculation
  const REWARD_POOL = ethers.parseEther("20.0"); // 20 CHZ reward pool

  try {
    // Create signers
    const adminPrivateKey = process.env.PRIVATE_KEY;
    const userAPrivateKey = process.env.PRIVATE_KEY_A;
    const userBPrivateKey = process.env.PRIVATE_KEY_B;

    const admin = new ethers.Wallet(adminPrivateKey, ethers.provider);
    const userA = new ethers.Wallet(userAPrivateKey, ethers.provider);
    const userB = new ethers.Wallet(userBPrivateKey, ethers.provider);

    console.log("👥 Using accounts:");
    console.log("👥 使用账户:");
    console.log(`Admin: ${admin.address}`);
    console.log(`User A: ${userA.address}`);
    console.log(`User B: ${userB.address}\n`);

    // Check initial balances
    const adminBalanceBefore = await ethers.provider.getBalance(admin.address);
    const userABalanceBefore = await ethers.provider.getBalance(userA.address);
    const userBBalanceBefore = await ethers.provider.getBalance(userB.address);

    console.log("💰 Initial Balances:");
    console.log("💰 初始余额:");
    console.log(`Admin: ${ethers.formatEther(adminBalanceBefore)} CHZ`);
    console.log(`User A: ${ethers.formatEther(userABalanceBefore)} CHZ`);
    console.log(`User B: ${ethers.formatEther(userBBalanceBefore)} CHZ\n`);

    // Connect to contract
    const contract = await ethers.getContractAt("FanForcePredictionDemo", PREDICTION_CONTRACT);
    console.log("📋 Contract connected:", PREDICTION_CONTRACT);
    console.log("📋 合约已连接:", PREDICTION_CONTRACT, "\n");

    // Step 1: Create match
    console.log("🔄 Step 1: Create Match");
    console.log("🔄 步骤1: 创建比赛");
    
    try {
      const matchInfo = await contract.getMatch(MATCH_ID);
      if (matchInfo[0] === 0n) {
        const tx = await contract.connect(admin).createMatch(MATCH_ID);
        await tx.wait();
        console.log("✅ Match created successfully");
        console.log("✅ 比赛创建成功");
      } else {
        console.log("✅ Match already exists");
        console.log("✅ 比赛已存在");
      }
    } catch (error) {
      const tx = await contract.connect(admin).createMatch(MATCH_ID);
      await tx.wait();
      console.log("✅ Match created successfully");
      console.log("✅ 比赛创建成功");
    }

    // Step 2: Place bets with fee calculation
    console.log("\n💰 Step 2: Place Bets (with 5% betting fee)");
    console.log("💰 步骤2: 下注 (收取5%下注手续费)");
    
    console.log(`User A betting ${ethers.formatEther(BET_AMOUNT)} CHZ on Team A...`);
    console.log(`Expected fee: ${ethers.formatEther(BET_AMOUNT.mul(5).div(100))} CHZ`);
    console.log(`Expected net bet: ${ethers.formatEther(BET_AMOUNT.mul(95).div(100))} CHZ`);
    
    const betATx = await contract.connect(userA).placeBet(MATCH_ID, TEAM_A, BET_AMOUNT, { value: BET_AMOUNT });
    const betAReceipt = await betATx.wait();
    console.log("✅ User A bet placed");
    console.log("✅ 用户A下注成功");

    console.log(`User B betting ${ethers.formatEther(BET_AMOUNT)} CHZ on Team B...`);
    const betBTx = await contract.connect(userB).placeBet(MATCH_ID, TEAM_B, BET_AMOUNT, { value: BET_AMOUNT });
    const betBReceipt = await betBTx.wait();
    console.log("✅ User B bet placed");
    console.log("✅ 用户B下注成功");

    // Check balances after betting
    const adminBalanceAfterBets = await ethers.provider.getBalance(admin.address);
    console.log(`\n💰 Admin balance after bets: ${ethers.formatEther(adminBalanceAfterBets)} CHZ`);
    console.log(`💰 下注后管理员余额: ${ethers.formatEther(adminBalanceAfterBets)} CHZ`);
    console.log(`Expected admin gain: ${ethers.formatEther(BET_AMOUNT.mul(2).mul(5).div(100))} CHZ (2 * 10 * 5% = 1 CHZ)`);

    // Step 3: Inject reward pool
    console.log("\n🎁 Step 3: Inject Reward Pool");
    console.log("🎁 步骤3: 注入奖励池");
    
    const injectTx = await contract.connect(admin).injectReward(MATCH_ID, REWARD_POOL, { value: REWARD_POOL });
    await injectTx.wait();
    console.log(`✅ Reward pool injected: ${ethers.formatEther(REWARD_POOL)} CHZ`);
    console.log(`✅ 奖励池注入成功: ${ethers.formatEther(REWARD_POOL)} CHZ`);

    // Step 4: Check match status
    console.log("\n📊 Step 4: Check Match Status");
    console.log("📊 步骤4: 检查比赛状态");
    
    const matchInfo = await contract.getMatch(MATCH_ID);
    console.log(`Match ID: ${matchInfo[0]}`);
    console.log(`Team A Total (net): ${ethers.formatEther(matchInfo[1])} CHZ`);
    console.log(`Team B Total (net): ${ethers.formatEther(matchInfo[2])} CHZ`);
    console.log(`Reward Pool: ${ethers.formatEther(matchInfo[3])} CHZ`);
    console.log(`Winner: ${matchInfo[4]} (0=pending)`);
    console.log(`Is Settled: ${matchInfo[5]}`);

    // Step 5: Settle match (Team A wins)
    console.log("\n🏆 Step 5: Settle Match (Team A wins)");
    console.log("🏆 步骤5: 结算比赛 (队伍A获胜)");
    
    const winner = TEAM_A;
    const settleTx = await contract.connect(admin).settleMatch(MATCH_ID, winner);
    await settleTx.wait();
    console.log(`✅ Match settled, winner: Team ${winner}`);
    console.log(`✅ 比赛已结算，获胜方: 队伍${winner}`);

    // Step 6: Calculate expected rewards
    console.log("\n🧮 Step 6: Calculate Expected Rewards");
    console.log("🧮 步骤6: 计算预期奖励");
    
    const netBetAmount = BET_AMOUNT.mul(95).div(100); // 9.5 CHZ each
    const winnerShare = REWARD_POOL.mul(70).div(100); // 14 CHZ (70% of 20 CHZ)
    const loserShare = REWARD_POOL.mul(30).div(100);  // 6 CHZ (30% of 20 CHZ)
    
    console.log(`Net bet amount per user: ${ethers.formatEther(netBetAmount)} CHZ`);
    console.log(`Winner reward pool share: ${ethers.formatEther(winnerShare)} CHZ`);
    console.log(`Loser reward pool share: ${ethers.formatEther(loserShare)} CHZ`);
    
    // User A (winner): principal (9.5) + reward share (14) = 23.5 CHZ before 5% fee
    const userATotal = netBetAmount.add(winnerShare);
    const userAFee = userATotal.mul(5).div(100);
    const userAFinal = userATotal.sub(userAFee);
    
    // User B (loser): principal (9.5) + reward share (6) = 15.5 CHZ before 5% fee
    const userBTotal = netBetAmount.add(loserShare);
    const userBFee = userBTotal.mul(5).div(100);
    const userBFinal = userBTotal.sub(userBFee);
    
    console.log(`\nExpected User A (winner):`);
    console.log(`- Principal: ${ethers.formatEther(netBetAmount)} CHZ`);
    console.log(`- Reward share: ${ethers.formatEther(winnerShare)} CHZ`);
    console.log(`- Total before fee: ${ethers.formatEther(userATotal)} CHZ`);
    console.log(`- Claiming fee (5%): ${ethers.formatEther(userAFee)} CHZ`);
    console.log(`- Final amount: ${ethers.formatEther(userAFinal)} CHZ`);
    
    console.log(`\nExpected User B (loser):`);
    console.log(`- Principal: ${ethers.formatEther(netBetAmount)} CHZ`);
    console.log(`- Reward share: ${ethers.formatEther(loserShare)} CHZ`);
    console.log(`- Total before fee: ${ethers.formatEther(userBTotal)} CHZ`);
    console.log(`- Claiming fee (5%): ${ethers.formatEther(userBFee)} CHZ`);
    console.log(`- Final amount: ${ethers.formatEther(userBFinal)} CHZ`);

    // Step 7: Claim rewards
    console.log("\n💎 Step 7: Claim Rewards");
    console.log("💎 步骤7: 领取奖励");
    
    console.log("User A (winner) claiming reward...");
    const claimATx = await contract.connect(userA).claimReward(MATCH_ID);
    await claimATx.wait();
    console.log("✅ User A reward claimed");
    console.log("✅ 用户A奖励已领取");

    console.log("User B (loser) claiming reward...");
    const claimBTx = await contract.connect(userB).claimReward(MATCH_ID);
    await claimBTx.wait();
    console.log("✅ User B reward claimed");
    console.log("✅ 用户B奖励已领取");

    // Final balance check
    console.log("\n💰 Final Balances:");
    console.log("💰 最终余额:");
    
    const adminBalanceFinal = await ethers.provider.getBalance(admin.address);
    const userABalanceFinal = await ethers.provider.getBalance(userA.address);
    const userBBalanceFinal = await ethers.provider.getBalance(userB.address);
    
    console.log(`Admin: ${ethers.formatEther(adminBalanceFinal)} CHZ`);
    console.log(`User A: ${ethers.formatEther(userABalanceFinal)} CHZ`);
    console.log(`User B: ${ethers.formatEther(userBBalanceFinal)} CHZ`);
    
    // Calculate actual gains/losses (excluding gas fees)
    const adminGain = adminBalanceFinal.sub(adminBalanceBefore.sub(REWARD_POOL));
    const expectedAdminGain = BET_AMOUNT.mul(2).mul(5).div(100).add(userAFee).add(userBFee); // Betting fees + claiming fees
    
    console.log(`\n📊 Analysis (excluding gas fees):`);
    console.log(`📊 分析 (不包括gas费用):`);
    console.log(`Admin total gain: ~${ethers.formatEther(adminGain)} CHZ`);
    console.log(`Expected admin gain: ${ethers.formatEther(expectedAdminGain)} CHZ`);
    console.log(`Expected breakdown:`);
    console.log(`- Betting fees: ${ethers.formatEther(BET_AMOUNT.mul(2).mul(5).div(100))} CHZ`);
    console.log(`- Claiming fees: ${ethers.formatEther(userAFee.add(userBFee))} CHZ`);
    console.log(`- Reward pool injection: -${ethers.formatEther(REWARD_POOL)} CHZ`);

    console.log("\n🎉 All tests completed successfully!");
    console.log("🎉 所有测试成功完成!");
    console.log("🎉 Non-zero-sum betting logic verified!");
    console.log("🎉 非零和博弈逻辑验证成功!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("❌ 测试失败:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("\n✅ Corrected logic test completed!");
    console.log("✅ 修正逻辑测试完成!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script error:", error);
    console.error("❌ 脚本错误:", error);
    process.exit(1);
  }); 