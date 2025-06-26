// Gas Optimized Test Script / Gas优化测试脚本
// 减少不必要操作，降低测试成本
// Reduce unnecessary operations to lower testing costs
// 使用方法 / Usage: npx hardhat run scripts/gas-optimized-test.js --network chilizSpicy

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("⚡ FanForce AI - Gas Optimized Test");
  console.log("⚡ FanForce AI - Gas优化测试\n");

  // Get contract info
  const deploymentInfo = require("../deployment-info.json");
  const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
  const ADMIN_ADDRESS = deploymentInfo.adminAddress;
  
  console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`👤 Admin Address: ${ADMIN_ADDRESS}\n`);

  try {
    // Get signers with optimized gas settings
    const [admin] = await ethers.getSigners();
    console.log(`🔑 Using admin account: ${admin.address}`);
    
    // Connect to contract
    const contract = await ethers.getContractAt("FanForcePredictionDemo", CONTRACT_ADDRESS);
    
    // Check initial balance
    const initialBalance = await ethers.provider.getBalance(admin.address);
    console.log(`💰 Initial Balance: ${ethers.formatEther(initialBalance)} CHZ\n`);

    // =============================================================================
    // 🎯 MINIMAL TEST FLOW / 最小化测试流程
    // =============================================================================
    console.log("🎯 Starting Minimal Test Flow");
    console.log("🎯 开始最小化测试流程\n");

    const testMatchId = 200001; // Use high ID to avoid conflicts
    
    // Step 1: Check if match exists, create only if needed
    console.log("Step 1: Smart Match Creation / 步骤1: 智能比赛创建");
    let matchExists = false;
    try {
      const existingMatch = await contract.getMatch(testMatchId);
      if (existingMatch[0] > 0) {
        console.log(`✅ Match ${testMatchId} already exists, skipping creation`);
        console.log(`✅ 比赛${testMatchId}已存在，跳过创建`);
        matchExists = true;
      }
    } catch (error) {
      // Match doesn't exist, need to create
    }

    if (!matchExists) {
      console.log(`Creating new match ${testMatchId}...`);
      const gasEstimate = await contract.createMatch.estimateGas(testMatchId);
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      
      const createTx = await contract.createMatch(testMatchId, {
        gasLimit: gasEstimate * 110n / 100n, // Add 10% buffer
        gasPrice: ethers.parseUnits("1", "gwei") // Set low gas price for testnet
      });
      await createTx.wait();
      console.log(`✅ Match ${testMatchId} created successfully`);
      console.log(`✅ 比赛${testMatchId}创建成功\n`);
    }

    // Step 2: Check if reward already injected
    console.log("Step 2: Smart Reward Injection / 步骤2: 智能奖励注入");
    const matchInfo = await contract.getMatch(testMatchId);
    if (!matchInfo[6]) { // rewardInjected is false
      const rewardAmount = ethers.parseEther("5.0"); // Reduced from 10 CHZ to 5 CHZ
      console.log(`Injecting ${ethers.formatEther(rewardAmount)} CHZ reward...`);
      
      const gasEstimate = await contract.injectReward.estimateGas(testMatchId, rewardAmount, { value: rewardAmount });
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      
      const injectTx = await contract.injectReward(testMatchId, rewardAmount, { 
        value: rewardAmount,
        gasLimit: gasEstimate * 110n / 100n,
        gasPrice: ethers.parseUnits("1", "gwei")
      });
      await injectTx.wait();
      console.log(`✅ Injected ${ethers.formatEther(rewardAmount)} CHZ reward`);
      console.log(`✅ 注入${ethers.formatEther(rewardAmount)} CHZ奖励\n`);
    } else {
      console.log(`ℹ️  Reward already injected for match ${testMatchId}`);
      console.log(`ℹ️  比赛${testMatchId}奖励已注入\n`);
    }

    // Step 3: Check if user already bet
    console.log("Step 3: Smart Betting / 步骤3: 智能下注");
    const userBet = await contract.getUserBet(testMatchId, admin.address);
    if (userBet[1] === 0n) { // No bet placed
      const betAmount = ethers.parseEther("1.0"); // Reduced from 2 CHZ to 1 CHZ
      const team = 1; // Always bet on team 1 for consistency
      
      console.log(`Placing ${ethers.formatEther(betAmount)} CHZ bet on team ${team}...`);
      
      const gasEstimate = await contract.placeBet.estimateGas(testMatchId, team, betAmount, { value: betAmount });
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      
      const betTx = await contract.placeBet(testMatchId, team, betAmount, { 
        value: betAmount,
        gasLimit: gasEstimate * 110n / 100n,
        gasPrice: ethers.parseUnits("1", "gwei")
      });
      await betTx.wait();
      console.log(`✅ Placed ${ethers.formatEther(betAmount)} CHZ bet on team ${team}`);
      console.log(`✅ 在队伍${team}下注${ethers.formatEther(betAmount)} CHZ\n`);
    } else {
      console.log(`ℹ️  User already bet ${ethers.formatEther(userBet[1])} CHZ on team ${userBet[0]}`);
      console.log(`ℹ️  用户已在队伍${userBet[0]}下注${ethers.formatEther(userBet[1])} CHZ\n`);
    }

    // Step 4: Check if match already settled
    console.log("Step 4: Smart Settlement / 步骤4: 智能结算");
    const currentMatchInfo = await contract.getMatch(testMatchId);
    if (!currentMatchInfo[5]) { // not settled
      const winningTeam = 1; // Make team 1 win for consistency
      
      console.log(`Settling match, team ${winningTeam} wins...`);
      
      const gasEstimate = await contract.settleMatch.estimateGas(testMatchId, winningTeam);
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      
      const settleTx = await contract.settleMatch(testMatchId, winningTeam, {
        gasLimit: gasEstimate * 110n / 100n,
        gasPrice: ethers.parseUnits("1", "gwei")
      });
      await settleTx.wait();
      console.log(`✅ Match settled, team ${winningTeam} wins!`);
      console.log(`✅ 比赛已结算，队伍${winningTeam}获胜！\n`);
    } else {
      console.log(`ℹ️  Match ${testMatchId} already settled`);
      console.log(`ℹ️  比赛${testMatchId}已结算\n`);
    }

    // Step 5: Check if reward already claimed
    console.log("Step 5: Smart Reward Claiming / 步骤5: 智能奖励领取");
    const finalUserBet = await contract.getUserBet(testMatchId, admin.address);
    if (finalUserBet[1] > 0 && !finalUserBet[2]) { // has bet and not claimed
      console.log(`Claiming reward...`);
      
      const gasEstimate = await contract.claimReward.estimateGas(testMatchId);
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      
      const claimTx = await contract.claimReward(testMatchId, {
        gasLimit: gasEstimate * 110n / 100n,
        gasPrice: ethers.parseUnits("1", "gwei")
      });
      await claimTx.wait();
      console.log(`✅ Reward claimed successfully!`);
      console.log(`✅ 奖励领取成功！\n`);
    } else if (finalUserBet[2]) {
      console.log(`ℹ️  Reward already claimed for match ${testMatchId}`);
      console.log(`ℹ️  比赛${testMatchId}奖励已领取\n`);
    }

    // Final balance check
    const finalBalance = await ethers.provider.getBalance(admin.address);
    const balanceChange = finalBalance - initialBalance;
    const gasUsed = initialBalance - finalBalance;
    
    console.log("💰 Gas Optimized Summary / Gas优化总结:");
    console.log(`  Initial Balance: ${ethers.formatEther(initialBalance)} CHZ`);
    console.log(`  Final Balance: ${ethers.formatEther(finalBalance)} CHZ`);
    console.log(`  Total Gas Used: ${ethers.formatEther(gasUsed)} CHZ`);
    console.log(`  Net Gain/Loss: ${ethers.formatEther(balanceChange)} CHZ (including rewards)`);
    
    // Display final match state
    console.log("\n📊 Final Match State / 最终比赛状态:");
    const finalMatch = await contract.getMatch(testMatchId);
    const finalUserBetInfo = await contract.getUserBet(testMatchId, admin.address);
    
    console.log(`  Match ID: ${finalMatch[0]}`);
    console.log(`  Team A Total: ${ethers.formatEther(finalMatch[1])} CHZ`);
    console.log(`  Team B Total: ${ethers.formatEther(finalMatch[2])} CHZ`);
    console.log(`  Reward Pool: ${ethers.formatEther(finalMatch[3])} CHZ`);
    console.log(`  Winner: Team ${finalMatch[4]} (0=pending, 1=Team A, 2=Team B)`);
    console.log(`  Settled: ${finalMatch[5]}`);
    console.log(`  Reward Injected: ${finalMatch[6]}`);
    console.log(`  User Bet: ${ethers.formatEther(finalUserBetInfo[1])} CHZ on team ${finalUserBetInfo[0]}`);
    console.log(`  User Claimed: ${finalUserBetInfo[2]}`);
    
    console.log("\n✅ Gas Optimized Test Finished!");
    console.log("✅ Gas优化测试完成!");
    console.log("\n📋 Optimization Summary / 优化总结:");
    console.log("- Smart operation detection (skip if already done) ✅");
    console.log("- Reduced bet and reward amounts ✅");
    console.log("- Low gas price settings ✅");
    console.log("- Gas estimation and optimization ✅");
    console.log("- Single match testing ✅");

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