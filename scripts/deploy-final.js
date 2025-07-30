// scripts/deploy-final.js
// 最终修正的部署脚本 / Final corrected deployment script

const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting FanForceVault deployment to X Layer...");

  try {
    // 获取部署者账户 / Get deployer account
    const [deployer] = await hre.ethers.getSigners();
    console.log("👤 Deployer address:", deployer.address);

    // 检查余额 / Check balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "OKB");

    // 从环境变量获取配置 / Get configuration from environment variables
    const USDC_TOKEN_ADDRESS = process.env.USDC_TOKEN_ADDRESS;
    const FOUNDATION_ADDRESS = process.env.FOUNDATION_ADDRESS;

    console.log("📋 Configuration:");
    console.log("USDC Token Address:", USDC_TOKEN_ADDRESS);
    console.log("Foundation Address:", FOUNDATION_ADDRESS);

    // 验证配置 / Validate configuration
    if (!USDC_TOKEN_ADDRESS) {
      throw new Error("USDC_TOKEN_ADDRESS not set in environment variables");
    }
    if (!FOUNDATION_ADDRESS) {
      throw new Error("FOUNDATION_ADDRESS not set in environment variables");
    }

    // 部署合约 / Deploy contract
    console.log("\n📦 Deploying FanForceVault contract...");
    
    const FanForceVault = await hre.ethers.getContractFactory("FanForceVault");
    const vault = await FanForceVault.deploy(
      USDC_TOKEN_ADDRESS,           // USDC代币地址 / USDC token address
      "FanForce AI Vault",          // 金库名称 / Vault name
      "FFVAULT",                    // 金库符号 / Vault symbol
      FOUNDATION_ADDRESS            // 基金会地址 / Foundation address
    );

    console.log("⏳ Waiting for deployment confirmation...");
    console.log("Transaction hash:", vault.deploymentTransaction().hash);
    
    await vault.waitForDeployment();

    const vaultAddress = await vault.getAddress();
    console.log("\n✅ FanForceVault deployed successfully!");
    console.log("Contract Address:", vaultAddress);

    // 保存部署信息 / Save deployment info
    const fs = require("fs");
    const deploymentInfo = {
      contractName: "FanForceVault",
      contractAddress: vaultAddress,
      deployerAddress: deployer.address,
      foundationAddress: FOUNDATION_ADDRESS,
      usdcTokenAddress: USDC_TOKEN_ADDRESS,
      vaultName: "FanForce AI Vault",
      vaultSymbol: "FFVAULT",
      network: "X Layer Testnet",
      chainId: 195,
      deploymentTime: new Date().toISOString(),
      deploymentTxHash: vault.deploymentTransaction().hash
    };

    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("✅ Deployment info saved to deployment-info.json");
    
    console.log("\n🎉 Deployment Summary:");
    console.log("=====================");
    console.log("✅ Contract: FanForceVault");
    console.log("✅ Address:", vaultAddress);
    console.log("✅ Network: X Layer Testnet");
    console.log("✅ Deployer:", deployer.address);
    console.log("✅ Foundation:", FOUNDATION_ADDRESS);
    console.log("✅ USDC Token:", USDC_TOKEN_ADDRESS);
    
    console.log("\n🔗 Explorer URL:");
    console.log(`https://www.oklink.com/xlayer-testnet/address/${vaultAddress}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

// 推荐使用这种模式来处理错误 / We recommend this pattern to be able to use async/await everywhere and properly handle errors
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
}); 