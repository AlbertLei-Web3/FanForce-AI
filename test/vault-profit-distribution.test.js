// Test Vault Profit Distribution Logic
// 测试金库收益分配逻辑
// This test verifies the corrected 80/20 profit distribution based on user share percentage
// 此测试验证基于用户份额百分比的修正80/20收益分配逻辑

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FanForceVault Profit Distribution", function () {
  let vault, usdc, athlete1, athlete2, foundation, owner;

  beforeEach(async function () {
    // 获取签名者 / Get signers
    [owner, athlete1, athlete2, foundation] = await ethers.getSigners();

    // 部署测试USDC代币 / Deploy test USDC token
    const TestUSDC = await ethers.getContractFactory("TestUSDC");
    usdc = await TestUSDC.deploy();

    // 部署FanForceVault / Deploy FanForceVault
    const FanForceVault = await ethers.getContractFactory("FanForceVault");
    vault = await FanForceVault.deploy(
      usdc.address,
      "FanForce AI Vault",
      "FFVAULT",
      foundation.address
    );

    // 给运动员分配USDC / Allocate USDC to athletes
    await usdc.mint(athlete1.address, ethers.parseEther("10"));
    await usdc.mint(athlete2.address, ethers.parseEther("10"));
    await usdc.mint(foundation.address, ethers.parseEther("10"));

    // 运动员授权金库使用USDC / Athletes approve vault to use USDC
    await usdc.connect(athlete1).approve(vault.address, ethers.parseEther("10"));
    await usdc.connect(athlete2).approve(vault.address, ethers.parseEther("10"));
  });

  it("应该正确计算基于份额百分比的收益分配 / Should correctly calculate profit distribution based on share percentage", async function () {
    // 运动员1托管5 USDC / Athlete1 deposits 5 USDC
    await vault.connect(athlete1).deposit(ethers.parseEther("5"), athlete1.address);
    
    // 运动员2托管3 USDC / Athlete2 deposits 3 USDC
    await vault.connect(athlete2).deposit(ethers.parseEther("3"), athlete2.address);

    // 验证份额 / Verify shares
    const athlete1Info = await vault.getAthleteInfo(athlete1.address);
    const athlete2Info = await vault.getAthleteInfo(athlete2.address);

    console.log("运动员1份额百分比 / Athlete1 share percentage:", ethers.formatEther(athlete1Info.sharePercentage));
    console.log("运动员2份额百分比 / Athlete2 share percentage:", ethers.formatEther(athlete2Info.sharePercentage));

    // 模拟金库获得收益 / Simulate vault profit
    await usdc.mint(vault.address, ethers.parseEther("10"));

    // 计算收益分配 / Calculate profit distribution
    const totalVaultProfit = ethers.parseEther("10");

    // 计算运动员1的收益分配 / Calculate athlete1's profit distribution
    const athlete1ProfitPreview = await vault.calculateUserProfit(athlete1.address, totalVaultProfit);
    const athlete1Portion = athlete1ProfitPreview.userPortion;
    const athlete1Share = athlete1ProfitPreview.athleteShare;
    const athlete1FoundationShare = athlete1ProfitPreview.foundationShare;

    // 计算运动员2的收益分配 / Calculate athlete2's profit distribution
    const athlete2ProfitPreview = await vault.calculateUserProfit(athlete2.address, totalVaultProfit);
    const athlete2Portion = athlete2ProfitPreview.userPortion;
    const athlete2Share = athlete2ProfitPreview.athleteShare;
    const athlete2FoundationShare = athlete2ProfitPreview.foundationShare;

    console.log("\n收益分配结果 / Profit Distribution Results:");
    console.log("运动员1应得收益 / Athlete1 portion:", ethers.formatEther(athlete1Portion), "USDC");
    console.log("运动员1获得 / Athlete1 gets:", ethers.formatEther(athlete1Share), "USDC (80%)");
    console.log("基金会获得 / Foundation gets:", ethers.formatEther(athlete1FoundationShare), "USDC (20%)");
    console.log("运动员2应得收益 / Athlete2 portion:", ethers.formatEther(athlete2Portion), "USDC");
    console.log("运动员2获得 / Athlete2 gets:", ethers.formatEther(athlete2Share), "USDC (80%)");
    console.log("基金会获得 / Foundation gets:", ethers.formatEther(athlete2FoundationShare), "USDC (20%)");

    // 执行收益分配 / Execute profit distribution
    await vault.connect(owner).distributeProfitsToAthlete(athlete1.address, athlete1Portion);
    await vault.connect(owner).distributeProfitsToAthlete(athlete2.address, athlete2Portion);

    // 验证最终结果 / Verify final results
    const athlete1FinalInfo = await vault.getAthleteInfo(athlete1.address);
    const athlete2FinalInfo = await vault.getAthleteInfo(athlete2.address);
    const foundationBalance = await usdc.balanceOf(foundation.address);

    console.log("\n最终结果 / Final Results:");
    console.log("运动员1实际收益 / Athlete1 actual profits:", ethers.formatEther(athlete1FinalInfo.profits), "USDC");
    console.log("运动员2实际收益 / Athlete2 actual profits:", ethers.formatEther(athlete2FinalInfo.profits), "USDC");
    console.log("基金会余额 / Foundation balance:", ethers.formatEther(foundationBalance), "USDC");

    // 验证80/20分配 / Verify 80/20 split
    expect(athlete1FinalInfo.profits).to.equal(athlete1Share);
    expect(athlete2FinalInfo.profits).to.equal(athlete2Share);
    expect(foundationBalance).to.be.gt(ethers.parseEther("10")); // 原始余额 + 收益
  });

  it("应该正确处理不同份额比例的收益分配 / Should correctly handle profit distribution with different share ratios", async function () {
    // 运动员1托管6 USDC / Athlete1 deposits 6 USDC
    await vault.connect(athlete1).deposit(ethers.parseEther("6"), athlete1.address);
    // 运动员2托管4 USDC / Athlete2 deposits 4 USDC
    await vault.connect(athlete2).deposit(ethers.parseEther("4"), athlete2.address);

    const totalVaultProfit = ethers.parseEther("10");

    // 计算运动员1的收益预览 / Calculate athlete1's profit preview
    const athlete1ProfitPreview = await vault.calculateUserProfit(athlete1.address, totalVaultProfit);

    console.log("份额百分比 / Share percentage:", ethers.formatEther(athlete1ProfitPreview.sharePercentage));
    console.log("应得收益 / User portion:", ethers.formatEther(athlete1ProfitPreview.userPortion), "USDC");
    console.log("运动员获得 / Athlete share:", ethers.formatEther(athlete1ProfitPreview.athleteShare), "USDC");
    console.log("基金会获得 / Foundation share:", ethers.formatEther(athlete1ProfitPreview.foundationShare), "USDC");

    // 验证60%份额的收益分配 / Verify 60% share profit distribution
    expect(athlete1ProfitPreview.sharePercentage).to.equal(ethers.parseEther("0.6"));
    expect(athlete1ProfitPreview.userPortion).to.equal(ethers.parseEther("6"));
    expect(athlete1ProfitPreview.athleteShare).to.equal(ethers.parseEther("4.8"));
    expect(athlete1ProfitPreview.foundationShare).to.equal(ethers.parseEther("1.2"));
  });

  it("应该正确处理零收益情况 / Should correctly handle zero profit scenario", async function () {
    await vault.connect(athlete1).deposit(ethers.parseEther("1"), athlete1.address);

    const totalVaultProfit = ethers.parseEther("0");

    const athlete1ProfitPreview = await vault.calculateUserProfit(athlete1.address, totalVaultProfit);

    expect(athlete1ProfitPreview.userPortion).to.equal(0);
    expect(athlete1ProfitPreview.athleteShare).to.equal(0);
    expect(athlete1ProfitPreview.foundationShare).to.equal(0);
  });
}); 