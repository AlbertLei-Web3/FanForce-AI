// Deploy Optimized FanForce Vault Contract
// 部署优化的FanForce金库合约
// This script deploys the vault contract optimized for the user flow
// 此脚本部署针对用户流程优化的金库合约

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署优化的FanForce金库合约... / Starting deployment of optimized FanForce vault contract...");

  // 获取部署账户 / Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户 / Deployer account:", deployer.address);
  console.log("💰 账户余额 / Account balance:", (await deployer.getBalance()).toString());

  // 部署参数 / Deployment parameters
  const USDC_ADDRESS = "0xA0b86a33E6441b8c4C8B8C8C8C8C8C8C8C8C8C8C"; // 测试网USDC地址 / Testnet USDC address
  const VAULT_NAME = "FanForce AI Vault";
  const VAULT_SYMBOL = "FFV";
  const FOUNDATION_ADDRESS = deployer.address; // 临时使用部署者地址作为基金会地址 / Temporarily use deployer as foundation

  console.log("📋 部署参数 / Deployment parameters:");
  console.log("  USDC地址 / USDC Address:", USDC_ADDRESS);
  console.log("  金库名称 / Vault Name:", VAULT_NAME);
  console.log("  金库符号 / Vault Symbol:", VAULT_SYMBOL);
  console.log("  基金会地址 / Foundation Address:", FOUNDATION_ADDRESS);

  try {
    // 部署FanForceVault合约 / Deploy FanForceVault contract
    console.log("\n🔧 部署FanForceVault合约... / Deploying FanForceVault contract...");
    
    const FanForceVault = await ethers.getContractFactory("FanForceVault");
    const vault = await FanForceVault.deploy(
      USDC_ADDRESS,
      VAULT_NAME,
      VAULT_SYMBOL,
      FOUNDATION_ADDRESS
    );

    await vault.deployed();
    console.log("✅ FanForceVault合约部署成功 / FanForceVault contract deployed successfully");
    console.log("📍 合约地址 / Contract address:", vault.address);

    // 验证合约部署 / Verify contract deployment
    console.log("\n🔍 验证合约部署... / Verifying contract deployment...");
    
    const asset = await vault.asset();
    const name = await vault.name();
    const symbol = await vault.symbol();
    const foundation = await vault.foundationAddress();
    const strategyManager = await vault.strategyManager();
    const depositsEnabled = await vault.depositsEnabled();

    console.log("✅ 合约验证成功 / Contract verification successful:");
    console.log("  底层资产 / Asset:", asset);
    console.log("  金库名称 / Name:", name);
    console.log("  金库符号 / Symbol:", symbol);
    console.log("  基金会地址 / Foundation:", foundation);
    console.log("  策略管理器 / Strategy Manager:", strategyManager);
    console.log("  托管功能启用 / Deposits Enabled:", depositsEnabled);

    // 测试基本功能 / Test basic functionality
    console.log("\n🧪 测试基本功能... / Testing basic functionality...");
    
    // 测试查询函数 / Test query functions
    const vaultStats = await vault.getVaultStats();
    console.log("📊 金库统计 / Vault stats:");
    console.log("  总资产 / Total Assets:", vaultStats.totalAssets_.toString());
    console.log("  总供应量 / Total Supply:", vaultStats.totalSupply_.toString());
    console.log("  总投资 / Total Invested:", vaultStats.totalInvested_.toString());
    console.log("  总收益 / Total Profits:", vaultStats.totalProfits_.toString());
    console.log("  上次分配时间 / Last Distribution:", vaultStats.lastDistribution_.toString());

    // 测试运动员信息查询 / Test athlete info query
    const athleteInfo = await vault.getAthleteInfo(deployer.address);
    console.log("🏃 运动员信息 / Athlete info:");
    console.log("  托管金额 / Deposit Amount:", athleteInfo.depositAmount.toString());
    console.log("  份额 / Shares:", athleteInfo.shares.toString());
    console.log("  收益 / Profits:", athleteInfo.profits.toString());
    console.log("  当前价值 / Current Value:", athleteInfo.currentValue.toString());

    // 保存部署信息 / Save deployment info
    const deploymentInfo = {
      network: (await ethers.provider.getNetwork()).name,
      deployer: deployer.address,
      contractAddress: vault.address,
      usdcAddress: USDC_ADDRESS,
      vaultName: VAULT_NAME,
      vaultSymbol: VAULT_SYMBOL,
      foundationAddress: FOUNDATION_ADDRESS,
      deploymentTime: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber(),
      gasUsed: vault.deployTransaction.gasLimit.toString()
    };

    const fs = require('fs');
    fs.writeFileSync(
      'deployment-info-optimized.json',
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 部署信息已保存到 deployment-info-optimized.json");
    console.log("💾 Deployment info saved to deployment-info-optimized.json");

    console.log("\n🎉 部署完成！/ Deployment completed!");
    console.log("📋 下一步 / Next steps:");
    console.log("  1. 验证合约代码 / Verify contract code");
    console.log("  2. 测试存款功能 / Test deposit functionality");
    console.log("  3. 测试收益分配 / Test profit distribution");
    console.log("  4. 集成前端API / Integrate with frontend APIs");

  } catch (error) {
    console.error("❌ 部署失败 / Deployment failed:", error);
    process.exit(1);
  }
}

// 执行部署 / Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署脚本执行失败 / Deployment script execution failed:", error);
    process.exit(1);
  }); 