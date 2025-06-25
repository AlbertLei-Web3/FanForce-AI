// FanForcePredictionDemo.test.js
// Test file for FanForcePredictionDemo contract on Chiliz Spicy testnet
// Tests all main functions with actual CHZ token on testnet
// 使用较小的测试金额以节省gas费用

const { expect } = require("chai");
const { ethers } = require("hardhat");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

describe("FanForcePredictionDemo on Chiliz Spicy Testnet", function () {
  // Contract instance
  let predictionContract;
  
  // Contract addresses
  const PREDICTION_CONTRACT = "0x90C9D004cB071064Ba9B9f091Dc96D76b09E8aBC"; // Updated to use native CHZ contract / 更新为使用原生CHZ的合约
  
  // Account addresses from .env
  const ADMIN_ADDRESS = process.env.ADMIN_ADDRESS || "0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5";
  const USER_A_ADDRESS = process.env.USER_A_ADDRESS || "0x0f583daF67db8B3287094F1871AD736A91B4A98a";
  const USER_B_ADDRESS = process.env.USER_B_ADDRESS || "0xaeD5E239ACBBE496aAD809941C29444214Eb3e57";
  
  // Test constants
  const MATCHES = [
    { id: 1, name: "Croatia vs Brazil" },
    { id: 2, name: "Argentina vs France" },
    { id: 3, name: "Spain vs Germany" },
    { id: 4, name: "England vs Portugal" }
  ];
  const TEAM_A = 1;    // 每场比赛的第一支队伍
  const TEAM_B = 2;    // 每场比赛的第二支队伍
  const BET_AMOUNT = ethers.parseEther("1.0");  // 1 CHZ (合约最小下注额要求) / 1 CHZ (contract minimum bet requirement)
  const REWARD_POOL = ethers.parseEther("1.0"); // 1 CHZ 奖池 / 1 CHZ reward pool

  before(async function () {
    try {
      // 获取签名者
      const [deployer] = await ethers.getSigners();
      console.log("Deployer account:", deployer.address);

      // Debug: 打印环境变量信息
      console.log("\nChecking .env file loading:");
      console.log("PRIVATE_KEY exists:", !!process.env.PRIVATE_KEY);
      console.log("PRIVATE_KEY_A exists:", !!process.env.PRIVATE_KEY_A);
      console.log("PRIVATE_KEY_B exists:", !!process.env.PRIVATE_KEY_B);
      
      // 使用私钥创建签名者
      const adminPrivateKey = process.env.PRIVATE_KEY;
      const userAPrivateKey = process.env.PRIVATE_KEY_A;
      const userBPrivateKey = process.env.PRIVATE_KEY_B;

      console.log("\nPrivate key lengths:");
      console.log("Admin key length:", adminPrivateKey ? adminPrivateKey.length : 0);
      console.log("User A key length:", userAPrivateKey ? userAPrivateKey.length : 0);
      console.log("User B key length:", userBPrivateKey ? userBPrivateKey.length : 0);

      // 检查私钥是否存在
      if (!adminPrivateKey || !userAPrivateKey || !userBPrivateKey) {
        throw new Error("Missing private keys in .env file. Please check the .env file path and format.");
      }

      admin = new ethers.Wallet(adminPrivateKey, ethers.provider);
      userA = new ethers.Wallet(userAPrivateKey, ethers.provider);
      userB = new ethers.Wallet(userBPrivateKey, ethers.provider);
      
      console.log("\nTesting with accounts:");
      console.log("Admin:", admin.address);
      console.log("User A:", userA.address);
      console.log("User B:", userB.address);

      // Check network connection first
      console.log("\nChecking network connection...");
      const network = await ethers.provider.getNetwork();
      console.log("Connected to network:", network.name, "Chain ID:", network.chainId.toString());
      
      if (network.chainId !== 88882n) {
        throw new Error(`Wrong network! Expected Chiliz Spicy testnet (88882), got ${network.chainId}`);
      }

      // Get native CHZ balances with retry mechanism
      console.log("\nChecking native CHZ balances:");
      let adminBalance, userABalance, userBBalance;
      
      try {
        adminBalance = await ethers.provider.getBalance(admin.address);
        userABalance = await ethers.provider.getBalance(userA.address);
        userBBalance = await ethers.provider.getBalance(userB.address);
        
        console.log("Admin native CHZ:", ethers.formatEther(adminBalance));
        console.log("User A native CHZ:", ethers.formatEther(userABalance));
        console.log("User B native CHZ:", ethers.formatEther(userBBalance));
        
        // Verify balances are not zero
        if (adminBalance === 0n && userABalance === 0n && userBBalance === 0n) {
          console.log("\nWarning: All balances are showing as 0, this might be a network connectivity issue.");
          console.log("Please check:");
          console.log("1. Internet connection");
          console.log("2. Chiliz Spicy RPC endpoint: https://spicy-rpc.chiliz.com");
          console.log("3. Wallet addresses are correct");
        }
      } catch (error) {
        console.error("Error fetching balances:", error.message);
        throw new Error("Failed to fetch CHZ balances. Please check network connection and RPC endpoint.");
      }

      // Get prediction contract instance
      predictionContract = await ethers.getContractAt("FanForcePredictionDemo", PREDICTION_CONTRACT);
      console.log("\nPrediction contract connected at:", PREDICTION_CONTRACT);

      // Check if accounts have enough CHZ for testing (adjusted for actual requirements)
      const minRequiredAdmin = ethers.parseEther("2.5"); // Admin需要2.5 CHZ用于奖池注入和gas费用 / Admin needs 2.5 CHZ for reward pool and gas
      const minRequiredUser = ethers.parseEther("1.5");  // 用户需要1.5 CHZ用于下注和gas费用 / Users need 1.5 CHZ for betting and gas
      
      console.log("\nBalance requirements check:");
      console.log("余额要求检查:");
      console.log(`Admin required: ${ethers.formatEther(minRequiredAdmin)} CHZ, current: ${ethers.formatEther(adminBalance)} CHZ`);
      console.log(`User A required: ${ethers.formatEther(minRequiredUser)} CHZ, current: ${ethers.formatEther(userABalance)} CHZ`);
      console.log(`User B required: ${ethers.formatEther(minRequiredUser)} CHZ, current: ${ethers.formatEther(userBBalance)} CHZ`);
      
      if (adminBalance < minRequiredAdmin) {
        console.log("❌ Admin account insufficient CHZ balance.");
        throw new Error("Admin account insufficient CHZ balance.");
      }
      
      if (userABalance < minRequiredUser || userBBalance < minRequiredUser) {
        console.log("❌ User accounts insufficient CHZ balance.");
        console.log("Please get more test CHZ from Tatum faucet: https://tatum.io/faucets/chiliz");
        throw new Error("User accounts insufficient CHZ balance.");
      }
      
      console.log("✅ All accounts have sufficient CHZ for testing");
      console.log("✅ 所有账户都有足够的CHZ进行测试");

      // 检查所有比赛的状态
      console.log("\nChecking all matches status:");
      for (const match of MATCHES) {
        try {
          const matchInfo = await predictionContract.getMatch(match.id);
          console.log(`\nMatch ${match.id} (${match.name}):`);
          console.log("- Is Settled:", matchInfo[5]);
          console.log("- Winner:", matchInfo[4].toString());
          console.log("- Reward Pool:", ethers.formatEther(matchInfo[3]));
        } catch (error) {
          if (error.message.includes("Match not found")) {
            console.log(`\nMatch ${match.id} (${match.name}): Not created yet`);
          } else {
            console.error(`Error checking match ${match.id}:`, error);
          }
        }
      }

    } catch (error) {
      console.error("Error in before hook:", error);
      throw error;
    }
  });

  describe("完整比赛流程测试", function () {
    it("应该能完成一个完整的比赛周期", async function () {
      const matchId = MATCHES[0].id; // 使用第一场比赛进行测试
      
      // 1. 创建比赛（如果不存在）
      try {
        await predictionContract.getMatch(matchId);
        console.log("\n比赛已存在，继续测试");
      } catch (error) {
        if (error.message.includes("Match not found")) {
          console.log("\n创建新比赛...");
          const tx = await predictionContract.connect(admin).createMatch(matchId);
          await tx.wait();
          console.log("比赛创建成功");
        }
      }

      // 2. 用户下注
      console.log("\n用户下注阶段...");
      const betATx = await predictionContract.connect(userA).placeBet(matchId, TEAM_A, BET_AMOUNT, { value: BET_AMOUNT });
      await betATx.wait();
      console.log("用户A下注成功");

      const betBTx = await predictionContract.connect(userB).placeBet(matchId, TEAM_B, BET_AMOUNT, { value: BET_AMOUNT });
      await betBTx.wait();
      console.log("用户B下注成功");

      // 3. 注入奖池
      console.log("\n注入奖池...");
      const injectTx = await predictionContract.connect(admin).injectReward(matchId, REWARD_POOL, { value: REWARD_POOL });
      await injectTx.wait();
      console.log("奖池注入成功");

      // 4. 结算比赛
      console.log("\n结算比赛...");
      const settleTx = await predictionContract.connect(admin).settleMatch(matchId, TEAM_A);
      await settleTx.wait();
      console.log("比赛结算成功");

      // 5. 获取奖励
      console.log("\n获取奖励...");
      const claimTx = await predictionContract.connect(userA).claimReward(matchId);
      await claimTx.wait();
      console.log("奖励领取成功");

      // 6. 重置比赛
      console.log("\n重置比赛状态...");
      const resetTx = await predictionContract.connect(admin).resetMatch(matchId);
      await resetTx.wait();
      console.log("比赛重置成功");

      // 7. 验证重置后的状态
      const match = await predictionContract.getMatch(matchId);
      expect(match[3]).to.equal(0); // 奖池应该为0
      expect(match[5]).to.be.false;  // 不应该处于已结算状态
      console.log("\n比赛完整周期测试完成");
    });
  });
}); 