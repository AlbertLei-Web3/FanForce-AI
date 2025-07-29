// Test Vault Profit Distribution Logic
// 测试金库收益分配逻辑
// This test verifies the corrected 80/20 profit distribution based on user share percentage
// 此测试验证基于用户份额百分比的修正80/20收益分配逻辑

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FanForceVault - Profit Distribution", function () {
  let vault;
  let usdc;
  let owner;
  let athlete1;
  let athlete2;
  let foundation;
  let strategyManager;

  beforeEach(async function () {
    // 获取账户 / Get accounts
    [owner, athlete1, athlete2, foundation, strategyManager] = await ethers.getSigners();

    // 部署模拟USDC / Deploy mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy("Mock USDC", "USDC");

    // 部署金库合约 / Deploy vault contract
    const FanForceVault = await ethers.getContractFactory("FanForceVault");
    vault = await FanForceVault.deploy(
      usdc.address,
      "FanForce AI Vault",
      "FFV",
      foundation.address
    );

    // 设置策略管理器 / Set strategy manager
    await vault.setStrategyManager(strategyManager.address);

    // 给运动员分配USDC / Allocate USDC to athletes
    await usdc.mint(athlete1.address, ethers.utils.parseEther("1000"));
    await usdc.mint(athlete2.address, ethers.utils.parseEther("1000"));
    await usdc.mint(foundation.address, ethers.utils.parseEther("1000"));

    // 运动员授权金库使用USDC / Athletes approve vault to use USDC
    await usdc.connect(athlete1).approve(vault.address, ethers.utils.parseEther("1000"));
    await usdc.connect(athlete2).approve(vault.address, ethers.utils.parseEther("1000"));
  });

  describe("Profit Distribution Logic", function () {
    it("应该正确计算基于份额百分比的收益分配 / Should correctly calculate profit distribution based on share percentage", async function () {
      // 运动员1托管500 USDC / Athlete1 deposits 500 USDC
      await vault.connect(athlete1).deposit(ethers.utils.parseEther("500"), athlete1.address);
      
      // 运动员2托管300 USDC / Athlete2 deposits 300 USDC
      await vault.connect(athlete2).deposit(ethers.utils.parseEther("300"), athlete2.address);

      // 验证份额 / Verify shares
      const athlete1Info = await vault.getAthleteInfo(athlete1.address);
      const athlete2Info = await vault.getAthleteInfo(athlete2.address);
      
      console.log("运动员1份额百分比 / Athlete1 share percentage:", 
        ethers.utils.formatEther(athlete1Info.sharePercentage));
      console.log("运动员2份额百分比 / Athlete2 share percentage:", 
        ethers.utils.formatEther(athlete2Info.sharePercentage));

      // 模拟金库获得1000 USDC收益 / Simulate vault earning 1000 USDC profit
      await usdc.mint(vault.address, ethers.utils.parseEther("1000"));
      
      // 计算预期收益分配 / Calculate expected profit distribution
      const totalVaultProfit = ethers.utils.parseEther("1000");
      
      // 运动员1应得收益（500/800 * 1000 = 625 USDC）
      // Athlete1's portion (500/800 * 1000 = 625 USDC)
      const athlete1Portion = totalVaultProfit.mul(500).div(800); // 625 USDC
      const athlete1Share = athlete1Portion.mul(80).div(100); // 500 USDC (80%)
      const athlete1FoundationShare = athlete1Portion.sub(athlete1Share); // 125 USDC (20%)
      
      // 运动员2应得收益（300/800 * 1000 = 375 USDC）
      // Athlete2's portion (300/800 * 1000 = 375 USDC)
      const athlete2Portion = totalVaultProfit.mul(300).div(800); // 375 USDC
      const athlete2Share = athlete2Portion.mul(80).div(100); // 300 USDC (80%)
      const athlete2FoundationShare = athlete2Portion.sub(athlete2Share); // 75 USDC (20%)

      console.log("\n预期收益分配 / Expected profit distribution:");
      console.log("运动员1应得收益 / Athlete1 portion:", ethers.utils.formatEther(athlete1Portion), "USDC");
      console.log("运动员1获得 / Athlete1 gets:", ethers.utils.formatEther(athlete1Share), "USDC (80%)");
      console.log("基金会获得 / Foundation gets:", ethers.utils.formatEther(athlete1FoundationShare), "USDC (20%)");
      console.log("运动员2应得收益 / Athlete2 portion:", ethers.utils.formatEther(athlete2Portion), "USDC");
      console.log("运动员2获得 / Athlete2 gets:", ethers.utils.formatEther(athlete2Share), "USDC (80%)");
      console.log("基金会获得 / Foundation gets:", ethers.utils.formatEther(athlete2FoundationShare), "USDC (20%)");

      // 执行收益分配 / Execute profit distribution
      await vault.connect(strategyManager).distributeProfitsToAthlete(athlete1.address, totalVaultProfit);
      await vault.connect(strategyManager).distributeProfitsToAthlete(athlete2.address, totalVaultProfit);

      // 验证实际分配结果 / Verify actual distribution results
      const athlete1FinalInfo = await vault.getAthleteInfo(athlete1.address);
      const athlete2FinalInfo = await vault.getAthleteInfo(athlete2.address);
      const foundationBalance = await usdc.balanceOf(foundation.address);

      console.log("\n实际分配结果 / Actual distribution results:");
      console.log("运动员1实际收益 / Athlete1 actual profits:", ethers.utils.formatEther(athlete1FinalInfo.profits), "USDC");
      console.log("运动员2实际收益 / Athlete2 actual profits:", ethers.utils.formatEther(athlete2FinalInfo.profits), "USDC");
      console.log("基金会余额 / Foundation balance:", ethers.utils.formatEther(foundationBalance), "USDC");

      // 验证结果 / Verify results
      expect(athlete1FinalInfo.profits).to.equal(athlete1Share);
      expect(athlete2FinalInfo.profits).to.equal(athlete2Share);
      
      // 基金会应该获得两个运动员的20%部分 / Foundation should get 20% from both athletes
      const expectedFoundationProfit = athlete1FoundationShare.add(athlete2FoundationShare);
      expect(foundationBalance).to.be.gt(ethers.utils.parseEther("1000")); // 原始余额 + 收益
    });

    it("应该正确计算用户收益预览 / Should correctly calculate user profit preview", async function () {
      // 运动员托管不同金额 / Athletes deposit different amounts
      await vault.connect(athlete1).deposit(ethers.utils.parseEther("600"), athlete1.address);
      await vault.connect(athlete2).deposit(ethers.utils.parseEther("400"), athlete2.address);

      const totalVaultProfit = ethers.utils.parseEther("1000");
      
      // 计算运动员1的收益预览 / Calculate athlete1's profit preview
      const athlete1ProfitPreview = await vault.calculateUserProfit(athlete1.address, totalVaultProfit);
      
      console.log("\n运动员1收益预览 / Athlete1 profit preview:");
      console.log("份额百分比 / Share percentage:", ethers.utils.formatEther(athlete1ProfitPreview.sharePercentage));
      console.log("应得收益 / User portion:", ethers.utils.formatEther(athlete1ProfitPreview.userPortion), "USDC");
      console.log("运动员获得 / Athlete share:", ethers.utils.formatEther(athlete1ProfitPreview.athleteShare), "USDC");
      console.log("基金会获得 / Foundation share:", ethers.utils.formatEther(athlete1ProfitPreview.foundationShare), "USDC");

      // 验证计算 / Verify calculation
      // 运动员1份额：600/1000 = 60%
      // Athlete1 share: 600/1000 = 60%
      expect(athlete1ProfitPreview.sharePercentage).to.equal(ethers.utils.parseEther("0.6"));
      
      // 应得收益：1000 * 60% = 600 USDC
      // User portion: 1000 * 60% = 600 USDC
      expect(athlete1ProfitPreview.userPortion).to.equal(ethers.utils.parseEther("600"));
      
      // 运动员获得：600 * 80% = 480 USDC
      // Athlete share: 600 * 80% = 480 USDC
      expect(athlete1ProfitPreview.athleteShare).to.equal(ethers.utils.parseEther("480"));
      
      // 基金会获得：600 * 20% = 120 USDC
      // Foundation share: 600 * 20% = 120 USDC
      expect(athlete1ProfitPreview.foundationShare).to.equal(ethers.utils.formatEther("120"));
    });

    it("应该处理零份额的情况 / Should handle zero shares case", async function () {
      const totalVaultProfit = ethers.utils.parseEther("1000");
      
      // 没有托管的情况下计算收益 / Calculate profit without any deposits
      const profitPreview = await vault.calculateUserProfit(athlete1.address, totalVaultProfit);
      
      expect(profitPreview.userPortion).to.equal(0);
      expect(profitPreview.athleteShare).to.equal(0);
      expect(profitPreview.foundationShare).to.equal(0);
      expect(profitPreview.sharePercentage).to.equal(0);
    });
  });
}); 