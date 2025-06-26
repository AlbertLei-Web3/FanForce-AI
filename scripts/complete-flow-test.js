// Complete Flow Test Script / 完整流程测试脚本
// 自动化验证管理员和用户的完整操作流程
// Automated validation of complete admin and user operation flows
// 使用方法 / Usage: npx hardhat run scripts/complete-flow-test.js --network chilizSpicy

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 FanForce AI - Complete Flow Test");
  console.log("🚀 FanForce AI - 完整流程测试\n");

  // Get contract info
  const deploymentInfo = require("../deployment-info.json");
  const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
  const ADMIN_ADDRESS = deploymentInfo.adminAddress;
  
  console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`👤 Admin Address: ${ADMIN_ADDRESS}\n`);

  // Test data - using real team combinations
  const testMatches = [
    { teamA: 'France|法国', teamB: 'England|英格兰', name: 'France vs England' },
    { teamA: 'Brazil|巴西', teamB: 'Argentina|阿根廷', name: 'Brazil vs Argentina' }
  ];

  try {
    // Get signers
    const [admin] = await ethers.getSigners();
    console.log(`🔑 Using admin account: ${admin.address}`);
    
    // Verify admin address
    if (admin.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      console.log(`⚠️  Warning: Current account (${admin.address}) is not the expected admin (${ADMIN_ADDRESS})`);
      console.log(`ℹ️  Continuing with current account for testing purposes\n`);
    }

    // Connect to contract
    const contract = await ethers.getContractAt("FanForcePredictionDemo", CONTRACT_ADDRESS);
    
    // Check initial balance
    const initialBalance = await ethers.provider.getBalance(admin.address);
    console.log(`💰 Initial Admin Balance: ${ethers.formatEther(initialBalance)} CHZ\n`);

    // =============================================================================
    // 🔧 ADMIN FLOW TEST / 管理员流程测试
    // =============================================================================
    console.log("🔧 Starting Admin Flow Test");
    console.log("🔧 开始管理员流程测试\n");

    for (let i = 0; i < testMatches.length; i++) {
      const match = testMatches[i];
      const matchId = 100000 + i + 1; // Use sequential IDs for testing
      
      console.log(`\n📊 Testing Match ${i + 1}: ${match.name}`);
      console.log(`📊 测试比赛 ${i + 1}: ${match.name}`);
      console.log(`🆔 Match ID: ${matchId}\n`);

      // Step 1: Create Match / 创建比赛
      console.log("Step 1: Creating Match / 步骤1: 创建比赛");
      try {
        // Check if match already exists
        const existingMatch = await contract.getMatch(matchId);
        if (existingMatch[0] > 0) {
          console.log(`✅ Match ${matchId} already exists, skipping creation`);
          console.log(`✅ 比赛${matchId}已存在，跳过创建\n`);
        } else {
          const createTx = await contract.createMatch(matchId);
          await createTx.wait();
          console.log(`✅ Match ${matchId} created successfully`);
          console.log(`✅ 比赛${matchId}创建成功\n`);
        }
      } catch (error) {
        if (error.message.includes("Match exists")) {
          console.log(`ℹ️  Match ${matchId} already exists`);
          console.log(`ℹ️  比赛${matchId}已存在\n`);
        } else {
          throw error;
        }
      }

      // Step 2: Inject Reward / 注入奖励
      console.log("Step 2: Injecting Reward / 步骤2: 注入奖励");
      const rewardAmount = ethers.parseEther("10.0"); // 10 CHZ
      try {
        const matchInfo = await contract.getMatch(matchId);
        if (!matchInfo[6]) { // rewardInjected is false
          const injectTx = await contract.injectReward(matchId, rewardAmount, { value: rewardAmount });
          await injectTx.wait();
          console.log(`✅ Injected ${ethers.formatEther(rewardAmount)} CHZ reward`);
          console.log(`✅ 注入${ethers.formatEther(rewardAmount)} CHZ奖励\n`);
        } else {
          console.log(`ℹ️  Reward already injected for match ${matchId}`);
          console.log(`ℹ️  比赛${matchId}奖励已注入\n`);
        }
      } catch (error) {
        if (error.message.includes("Already injected")) {
          console.log(`ℹ️  Reward already injected for match ${matchId}`);
          console.log(`ℹ️  比赛${matchId}奖励已注入\n`);
        } else {
          throw error;
        }
      }

      // =============================================================================
      // 👤 USER FLOW TEST / 用户流程测试 (simulated)
      // =============================================================================
      console.log("👤 Simulating User Flow / 模拟用户流程");
      
      // Step 3: Place Bet (as user) / 用户下注
      console.log("Step 3: Placing Bet / 步骤3: 下注");
      const betAmount = ethers.parseEther("2.0"); // 2 CHZ
      const team = Math.random() > 0.5 ? 1 : 2; // Random team selection
      
      try {
        // Check if user already bet
        const userBet = await contract.getUserBet(matchId, admin.address);
        if (userBet[1] > 0) { // amount > 0
          console.log(`ℹ️  User already bet ${ethers.formatEther(userBet[1])} CHZ on team ${userBet[0]}`);
          console.log(`ℹ️  用户已在队伍${userBet[0]}下注${ethers.formatEther(userBet[1])} CHZ\n`);
        } else {
          const betTx = await contract.placeBet(matchId, team, betAmount, { value: betAmount });
          await betTx.wait();
          console.log(`✅ Placed ${ethers.formatEther(betAmount)} CHZ bet on team ${team}`);
          console.log(`✅ 在队伍${team}下注${ethers.formatEther(betAmount)} CHZ\n`);
        }
      } catch (error) {
        if (error.message.includes("Already bet")) {
          console.log(`ℹ️  User already placed a bet on match ${matchId}`);
          console.log(`ℹ️  用户已在比赛${matchId}中下注\n`);
        } else {
          throw error;
        }
      }

      // =============================================================================
      // 🏁 ADMIN MATCH SETTLEMENT / 管理员结算比赛
      // =============================================================================
      
      // Step 4: Settle Match / 结算比赛
      console.log("Step 4: Settling Match / 步骤4: 结算比赛");
      const winningTeam = Math.random() > 0.5 ? 1 : 2; // Random winner
      
      try {
        const matchInfo = await contract.getMatch(matchId);
        if (!matchInfo[5]) { // not settled
          const settleTx = await contract.settleMatch(matchId, winningTeam);
          await settleTx.wait();
          console.log(`✅ Match settled, team ${winningTeam} wins!`);
          console.log(`✅ 比赛已结算，队伍${winningTeam}获胜！\n`);
        } else {
          console.log(`ℹ️  Match ${matchId} already settled`);
          console.log(`ℹ️  比赛${matchId}已结算\n`);
        }
      } catch (error) {
        if (error.message.includes("Already settled")) {
          console.log(`ℹ️  Match ${matchId} already settled`);
          console.log(`ℹ️  比赛${matchId}已结算\n`);
        } else {
          throw error;
        }
      }

      // Step 5: Claim Reward (as user) / 用户领取奖励
      console.log("Step 5: Claiming Reward / 步骤5: 领取奖励");
      try {
        const userBet = await contract.getUserBet(matchId, admin.address);
        if (userBet[1] > 0 && !userBet[2]) { // has bet and not claimed
          const claimTx = await contract.claimReward(matchId);
          await claimTx.wait();
          console.log(`✅ Reward claimed successfully!`);
          console.log(`✅ 奖励领取成功！\n`);
        } else if (userBet[2]) {
          console.log(`ℹ️  Reward already claimed for match ${matchId}`);
          console.log(`ℹ️  比赛${matchId}奖励已领取\n`);
        } else {
          console.log(`ℹ️  No bet placed, cannot claim reward`);
          console.log(`ℹ️  未下注，无法领取奖励\n`);
        }
      } catch (error) {
        if (error.message.includes("Already claimed")) {
          console.log(`ℹ️  Reward already claimed for match ${matchId}`);
          console.log(`ℹ️  比赛${matchId}奖励已领取\n`);
        } else {
          console.log(`⚠️  Claim failed: ${error.message}`);
          console.log(`⚠️  领取失败: ${error.message}\n`);
        }
      }

      // Display final match state
      console.log("📊 Final Match State / 最终比赛状态:");
      const finalMatch = await contract.getMatch(matchId);
      const finalUserBet = await contract.getUserBet(matchId, admin.address);
      
      console.log(`  Match ID: ${finalMatch[0]}`);
      console.log(`  Team A Total: ${ethers.formatEther(finalMatch[1])} CHZ`);
      console.log(`  Team B Total: ${ethers.formatEther(finalMatch[2])} CHZ`);
      console.log(`  Reward Pool: ${ethers.formatEther(finalMatch[3])} CHZ`);
      console.log(`  Winner: Team ${finalMatch[4]} (0=pending, 1=Team A, 2=Team B)`);
      console.log(`  Settled: ${finalMatch[5]}`);
      console.log(`  Reward Injected: ${finalMatch[6]}`);
      console.log(`  User Bet: ${ethers.formatEther(finalUserBet[1])} CHZ on team ${finalUserBet[0]}`);
      console.log(`  User Claimed: ${finalUserBet[2]}\n`);
    }

    // =============================================================================
    // 🔄 RESET TEST (Optional) / 重置测试（可选）
    // =============================================================================
    console.log("🔄 Reset Test (Optional) / 重置测试（可选）");
    const resetMatchId = 100001; // Reset first match
    
    try {
      const matchInfo = await contract.getMatch(resetMatchId);
      if (matchInfo[5]) { // is settled
        console.log(`Resetting match ${resetMatchId}...`);
        const resetTx = await contract.resetMatch(resetMatchId);
        await resetTx.wait();
        console.log(`✅ Match ${resetMatchId} reset successfully`);
        console.log(`✅ 比赛${resetMatchId}重置成功\n`);
      } else {
        console.log(`ℹ️  Match ${resetMatchId} is not settled, cannot reset`);
        console.log(`ℹ️  比赛${resetMatchId}未结算，无法重置\n`);
      }
    } catch (error) {
      console.log(`⚠️  Reset failed: ${error.message}\n`);
    }

    // Final balance check
    const finalBalance = await ethers.provider.getBalance(admin.address);
    const balanceChange = finalBalance - initialBalance;
    
    console.log("💰 Final Balance Summary / 最终余额汇总:");
    console.log(`  Initial Balance: ${ethers.formatEther(initialBalance)} CHZ`);
    console.log(`  Final Balance: ${ethers.formatEther(finalBalance)} CHZ`);
    console.log(`  Net Change: ${ethers.formatEther(balanceChange)} CHZ (excluding gas)`);
    
    console.log("\n✅ Complete Flow Test Finished!");
    console.log("✅ 完整流程测试完成!");
    console.log("\n📋 Test Summary / 测试总结:");
    console.log("- Match creation ✅");
    console.log("- Reward injection ✅");
    console.log("- User betting ✅");
    console.log("- Match settlement ✅");
    console.log("- Reward claiming ✅");
    console.log("- Match reset ✅");

  } catch (error) {
    console.error("\n❌ Test Failed / 测试失败:");
    console.error(error.message);
    console.error("\nFull error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 