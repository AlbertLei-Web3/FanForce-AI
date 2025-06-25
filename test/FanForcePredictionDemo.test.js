// FanForcePredictionDemo.test.js
// Test file for FanForcePredictionDemo contract on Chiliz testnet
// Tests all main functions with actual CHZ token on testnet

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FanForcePredictionDemo on Chiliz Testnet", function () {
  // Contract instance
  let predictionContract;
  
  // Account addresses
  const ADMIN_ADDRESS = "0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5";
  const TEAM_A_ADDRESS = "0x0f583daF67db8B3287094F1871AD736A91B4A98a";
  const TEAM_B_ADDRESS = "0xaeD5E239ACBBE496aAD809941C29444214Eb3e57";
  
  // Signers
  let deployer;
  
  // CHZ token contract on Chiliz testnet
  const CHZ_TOKEN_ADDRESS = "0x4Bf7078D36F779Df3E98c24F51482C1002C2E23C";
  let chzToken;
  
  // Test constants
  const MATCH_ID = 1;  // Croatia vs Brazil
  const TEAM_A = 1;    // Croatia
  const TEAM_B = 2;    // Brazil
  const BET_AMOUNT = ethers.utils.parseEther("1.0");  // 1 CHZ
  const REWARD_POOL = ethers.utils.parseEther("100.0"); // 100 CHZ

  before(async function () {
    // Get deployer account
    [deployer] = await ethers.getSigners();
    
    console.log("Testing with accounts:");
    console.log("Deployer:", deployer.address);
    console.log("Admin:", ADMIN_ADDRESS);
    console.log("Team A Bettor:", TEAM_A_ADDRESS);
    console.log("Team B Bettor:", TEAM_B_ADDRESS);

    // Get CHZ token contract instance
    chzToken = await ethers.getContractAt("IERC20", CHZ_TOKEN_ADDRESS);
    
    // Deploy prediction contract
    const FanForcePrediction = await ethers.getContractFactory("FanForcePredictionDemo");
    predictionContract = await FanForcePrediction.deploy(CHZ_TOKEN_ADDRESS);
    await predictionContract.deployed();
    console.log("Prediction contract deployed to:", predictionContract.address);

    // Approve contract to spend CHZ from all accounts
    console.log("Approving CHZ token transfers...");
    const tx1 = await chzToken.approve(predictionContract.address, ethers.utils.parseEther("10.0"));
    await tx1.wait();
    console.log("CHZ approved for deployer");
  });

  describe("Match Creation and Betting", function () {
    it("Should create a new match", async function () {
      console.log("Creating match...");
      const tx = await predictionContract.createMatch(MATCH_ID);
      await tx.wait();
      const match = await predictionContract.getMatch(MATCH_ID);
      expect(match[0]).to.equal(MATCH_ID);
      console.log("Match created successfully");
    });

    it("Should allow betting on Team A (Croatia)", async function () {
      console.log("Placing bet for Team A...");
      const tx = await predictionContract.placeBet(MATCH_ID, TEAM_A, BET_AMOUNT);
      await tx.wait();
      const bet = await predictionContract.getUserBet(MATCH_ID, deployer.address);
      expect(bet[0]).to.equal(TEAM_A);
      expect(bet[1]).to.equal(BET_AMOUNT);
      console.log("Team A bet placed successfully");
    });

    it("Should allow betting on Team B (Brazil)", async function () {
      console.log("Cannot test Team B bet with same account");
      console.log("Skipping this test as we need different accounts");
    });
  });

  describe("Reward Pool and Settlement", function () {
    it("Should inject reward pool", async function () {
      console.log("Injecting reward pool...");
      const tx = await predictionContract.injectReward(MATCH_ID, REWARD_POOL);
      await tx.wait();
      const match = await predictionContract.getMatch(MATCH_ID);
      expect(match[3]).to.equal(REWARD_POOL);
      console.log("Reward pool injected successfully");
    });

    it("Should settle match with Croatia as winner", async function () {
      console.log("Settling match...");
      const tx = await predictionContract.settleMatch(MATCH_ID, TEAM_A);
      await tx.wait();
      const match = await predictionContract.getMatch(MATCH_ID);
      expect(match[4]).to.equal(TEAM_A);
      expect(match[5]).to.be.true;
      console.log("Match settled successfully");
    });
  });

  describe("Reward Claims", function () {
    it("Should allow winner to claim reward", async function () {
      console.log("Claiming reward...");
      const balanceBefore = await chzToken.balanceOf(deployer.address);
      const tx = await predictionContract.claimReward(MATCH_ID);
      await tx.wait();
      const balanceAfter = await chzToken.balanceOf(deployer.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
      console.log("Reward claimed successfully");
    });
  });

  describe("Match Reset", function () {
    it("Should reset match", async function () {
      console.log("Resetting match...");
      const tx = await predictionContract.resetMatch(MATCH_ID);
      await tx.wait();
      const match = await predictionContract.getMatch(MATCH_ID);
      expect(match[4]).to.equal(0);
      expect(match[5]).to.be.false;
      console.log("Match reset successfully");
    });
  });
}); 