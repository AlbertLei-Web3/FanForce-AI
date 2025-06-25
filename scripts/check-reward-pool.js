// Check Reward Pool Display Script / 检查奖励池显示脚本
// 只读取合约状态，不进行任何交易，节省Gas费用
// Read-only contract state check, no transactions to save gas fees
// 验证getMatch函数返回值解析是否正确 / Verify getMatch function return value parsing

const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Check Reward Pool Display");
  console.log("🔍 检查奖励池显示\n");

  // Get contract address
  const deploymentInfo = require("../deployment-info.json");
  const CONTRACT_ADDRESS = deploymentInfo.contractAddress;
  
  console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}`);
  console.log(`📋 合约地址: ${CONTRACT_ADDRESS}\n`);

  try {
    // Get provider (read-only, no signer needed)
    const provider = ethers.provider;
    
    // Contract ABI with correct return types
    const CONTRACT_ABI = [
      "function getMatch(uint256 matchId) external view returns (uint256, uint256, uint256, uint256, uint8, bool, bool)"
    ];
    
    // Connect to contract (read-only)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    console.log("📊 Checking existing matches (read-only):");
    console.log("📊 检查现有比赛（只读）:");
    
    // Check matches 1-5
    for (let i = 1; i <= 5; i++) {
      try {
        const matchInfo = await contract.getMatch(i);
        
        if (matchInfo[0] > 0) { // matchId > 0 means match exists
          console.log(`\n🎯 Match ${i} Details:`);
          console.log(`  - Match ID: ${matchInfo[0]}`);
          console.log(`  - Team A Total: ${ethers.formatEther(matchInfo[1])} CHZ`);
          console.log(`  - Team B Total: ${ethers.formatEther(matchInfo[2])} CHZ`);
          console.log(`  - Reward Pool: ${ethers.formatEther(matchInfo[3])} CHZ`);
          console.log(`  - Result: ${matchInfo[4]} (0=pending, 1=Team A wins, 2=Team B wins)`);
          console.log(`  - Settled: ${matchInfo[5]}`);
          console.log(`  - Reward Injected: ${matchInfo[6]}`);
          
          // Analysis
          const hasReward = Number(matchInfo[3]) > 0;
          const isInjected = matchInfo[6];
          const readyForBetting = hasReward && isInjected && !matchInfo[5];
          
          console.log(`  - Status Analysis:`);
          console.log(`    * Has Reward Pool: ${hasReward ? '✅' : '❌'}`);
          console.log(`    * Reward Injected: ${isInjected ? '✅' : '❌'}`);
          console.log(`    * Ready for Betting: ${readyForBetting ? '✅' : '❌'}`);
          
          if (hasReward && !isInjected) {
            console.log(`    ⚠️  Warning: Reward pool shows ${ethers.formatEther(matchInfo[3])} CHZ but injection flag is false`);
            console.log(`    ⚠️  警告: 奖励池显示${ethers.formatEther(matchInfo[3])} CHZ但注入标志为false`);
          }
        }
      } catch (error) {
        // Match doesn't exist or other error, continue
        if (error.message.includes("Match not exist")) {
          console.log(`📝 Match ${i}: Not created yet`);
        }
      }
    }
    
    console.log("\n✅ Read-only check complete - No gas fees used!");
    console.log("✅ 只读检查完成 - 未消耗Gas费用!");
    
  } catch (error) {
    console.error("❌ Check failed:", error);
    console.error("❌ 检查失败:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 