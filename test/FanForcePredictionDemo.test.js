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
  const PREDICTION_CONTRACT = "0x95A10134D621b7ad01310381AF42fd80910e1221";
  
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
  const BET_AMOUNT = ethers.parseEther("0.05");  // 0.05 CHZ for each bet
  const REWARD_POOL = ethers.parseEther("0.1"); // 0.1 CHZ reward pool

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

      // Get native CHZ balances first
      console.log("\nChecking native CHZ balances:");
      const adminBalance = await ethers.provider.getBalance(admin.address);
      const userABalance = await ethers.provider.getBalance(userA.address);
      const userBBalance = await ethers.provider.getBalance(userB.address);
      console.log("Admin native CHZ:", ethers.formatEther(adminBalance));
      console.log("User A native CHZ:", ethers.formatEther(userABalance));
      console.log("User B native CHZ:", ethers.formatEther(userBBalance));

      // Get prediction contract instance
      predictionContract = await ethers.getContractAt("FanForcePredictionDemo", PREDICTION_CONTRACT);
      console.log("\nPrediction contract connected at:", PREDICTION_CONTRACT);

      // Check if accounts have enough CHZ for testing
      const minRequired = ethers.parseEther("0.5"); // 至少需要0.5 CHZ用于测试和gas
      if (adminBalance < minRequired || userABalance < minRequired || userBBalance < minRequired) {
        throw new Error("Insufficient CHZ balance. Please make sure all accounts have at least 0.5 CHZ for testing.");
      }

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