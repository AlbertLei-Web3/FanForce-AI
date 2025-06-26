// Quick Validation Script / 快速验证脚本
// 只读取状态，不执行交易，零gas消耗
// Read-only state checks, no transactions, zero gas consumption
// 使用方法 / Usage: npx hardhat run scripts/quick-validation.js --network chilizSpicy

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 FanForce AI - Quick Validation (Read-Only)");
  console.log("🔍 FanForce AI - 快速验证（只读模式）\n");

  // Get contract info
  const deploymentInfo = require("../deployment-info.json");
  const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
  const ADMIN_ADDRESS = deploymentInfo.adminAddress;
  
  console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`👤 Admin Address: ${ADMIN_ADDRESS}\n`);

  try {
    // Get signers
    const [admin] = await ethers.getSigners();
    console.log(`🔑 Current account: ${admin.address}`);
    
    // Check if current account is admin
    const isAdmin = admin.address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
    console.log(`👑 Admin status: ${isAdmin ? '✅ Admin' : '❌ Regular User'}\n`);
    
    // Connect to contract
    const contract = await ethers.getContractAt("FanForcePredictionDemo", CONTRACT_ADDRESS);
    
    // Check current balance
    const currentBalance = await ethers.provider.getBalance(admin.address);
    console.log(`💰 Current Balance: ${ethers.formatEther(currentBalance)} CHZ\n`);

    // =============================================================================
    // 📊 READ-ONLY STATE VALIDATION / 只读状态验证
    // =============================================================================
    console.log("📊 Validating Contract State (Read-Only)");
    console.log("📊 验证合约状态（只读模式）\n");

    // Check multiple match IDs to find existing matches
    const testMatchIds = [100001, 100002, 200001, 1, 2, 3, 4];
    const existingMatches = [];

    console.log("🔍 Scanning for existing matches...");
    console.log("🔍 扫描现有比赛...\n");

    for (const matchId of testMatchIds) {
      try {
        const matchInfo = await contract.getMatch(matchId);
        if (matchInfo[0] > 0) { // Match exists
          const userBet = await contract.getUserBet(matchId, admin.address);
          
          existingMatches.push({
            id: matchId,
            teamATotal: matchInfo[1],
            teamBTotal: matchInfo[2],
            rewardPool: matchInfo[3],
            winner: matchInfo[4],
            settled: matchInfo[5],
            rewardInjected: matchInfo[6],
            userBetTeam: userBet[0],
            userBetAmount: userBet[1],
            userClaimed: userBet[2]
          });

          console.log(`📊 Match ${matchId} Found:`);
          console.log(`  Team A Total: ${ethers.formatEther(matchInfo[1])} CHZ`);
          console.log(`  Team B Total: ${ethers.formatEther(matchInfo[2])} CHZ`);
          console.log(`  Reward Pool: ${ethers.formatEther(matchInfo[3])} CHZ`);
          console.log(`  Winner: ${matchInfo[4] === 0n ? 'Pending' : `Team ${matchInfo[4]}`}`);
          console.log(`  Status: ${matchInfo[5] ? 'Settled' : 'Active'}`);
          console.log(`  Reward Injected: ${matchInfo[6] ? 'Yes' : 'No'}`);
          
          if (userBet[1] > 0) {
            console.log(`  👤 Your Bet: ${ethers.formatEther(userBet[1])} CHZ on Team ${userBet[0]}`);
            console.log(`  💰 Claimed: ${userBet[2] ? 'Yes' : 'No'}`);
          } else {
            console.log(`  👤 Your Bet: None`);
          }
          console.log();
        }
      } catch (error) {
        // Match doesn't exist, continue
      }
    }

    // =============================================================================
    // 📈 VALIDATION SUMMARY / 验证总结
    // =============================================================================
    console.log("📈 Validation Summary / 验证总结");
    console.log("=" * 50);
    
    if (existingMatches.length === 0) {
      console.log("⚠️  No existing matches found");
      console.log("⚠️  未找到现有比赛");
      console.log("\n💡 Suggestion: Run gas-optimized-test.js to create a test match");
      console.log("💡 建议：运行 gas-optimized-test.js 创建测试比赛");
    } else {
      console.log(`✅ Found ${existingMatches.length} existing matches`);
      console.log(`✅ 找到${existingMatches.length}个现有比赛\n`);
      
      // Analyze matches
      const activeMatches = existingMatches.filter(m => !m.settled);
      const settledMatches = existingMatches.filter(m => m.settled);
      const userBets = existingMatches.filter(m => m.userBetAmount > 0);
      const claimedRewards = existingMatches.filter(m => m.userClaimed);
      
      console.log("📊 Match Analysis / 比赛分析:");
      console.log(`  Active Matches: ${activeMatches.length}`);
      console.log(`  Settled Matches: ${settledMatches.length}`);
      console.log(`  Your Bets: ${userBets.length}`);
      console.log(`  Claimed Rewards: ${claimedRewards.length}\n`);
      
      // Calculate potential rewards
      let totalBetAmount = 0n;
      let totalPotentialReward = 0n;
      let totalClaimedReward = 0n;
      
      for (const match of existingMatches) {
        if (match.userBetAmount > 0) {
          totalBetAmount += match.userBetAmount;
          
          if (match.settled && match.winner > 0) {
            // Calculate potential reward (simplified)
            const isWinner = match.userBetTeam === match.winner;
            if (isWinner) {
              // Winner gets their bet back plus share of reward pool
              const winnerPool = match.userBetTeam === 1n ? match.teamATotal : match.teamBTotal;
              const userShare = winnerPool > 0n ? (match.userBetAmount * match.rewardPool * 70n / 100n) / winnerPool : 0n;
              totalPotentialReward += match.userBetAmount + userShare;
            } else {
              // Loser gets share of 30% reward pool
              const loserPool = match.userBetTeam === 1n ? match.teamATotal : match.teamBTotal;
              const userShare = loserPool > 0n ? (match.userBetAmount * match.rewardPool * 30n / 100n) / loserPool : 0n;
              totalPotentialReward += userShare;
            }
          }
        }
      }
      
      console.log("💰 Financial Summary / 财务总结:");
      console.log(`  Total Bet Amount: ${ethers.formatEther(totalBetAmount)} CHZ`);
      console.log(`  Potential Rewards: ${ethers.formatEther(totalPotentialReward)} CHZ`);
      console.log(`  Current Balance: ${ethers.formatEther(currentBalance)} CHZ\n`);
      
      // Provide actionable recommendations
      console.log("💡 Recommendations / 建议:");
      
      if (activeMatches.length > 0) {
        console.log(`  - ${activeMatches.length} matches need settlement (admin only)`);
        console.log(`  - ${activeMatches.length}个比赛需要结算（仅管理员）`);
      }
      
      const unclaimedRewards = settledMatches.filter(m => m.userBetAmount > 0 && !m.userClaimed);
      if (unclaimedRewards.length > 0) {
        console.log(`  - ${unclaimedRewards.length} rewards ready to claim`);
        console.log(`  - ${unclaimedRewards.length}个奖励可以领取`);
      }
      
      if (isAdmin && activeMatches.length > 0) {
        console.log(`  - As admin, you can settle matches using the frontend`);
        console.log(`  - 作为管理员，您可以使用前端界面结算比赛`);
      }
    }
    
    console.log("\n✅ Quick Validation Completed (Zero Gas Used)!");
    console.log("✅ 快速验证完成（零Gas消耗）!");
    console.log("\n🔗 Next Steps / 下一步:");
    console.log("  1. Use frontend at http://localhost:3000 for full testing");
    console.log("  2. Run gas-optimized-test.js for minimal contract testing");
    console.log("  3. Check TESTING_GUIDE.md for manual validation steps");

  } catch (error) {
    console.error("\n❌ Validation Failed / 验证失败:");
    console.error(error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 