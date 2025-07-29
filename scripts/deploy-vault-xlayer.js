// scripts/deploy-vault-xlayer.js
// 部署FanForceVault合约到X Layer的脚本 / Deployment script for FanForceVault to X Layer
// 需先在.env中配置PRIVATE_KEY和USDC_TOKEN_ADDRESS

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const ADMIN_ADDRESS = deployer.address;
  
  // 从环境变量获取USDC代币地址 / Get USDC token address from environment
  const USDC_TOKEN_ADDRESS = process.env.USDC_TOKEN_ADDRESS;
  const FOUNDATION_ADDRESS = process.env.FOUNDATION_ADDRESS || ADMIN_ADDRESS;

  console.log("🚀 Deploying FanForceVault to X Layer...");
  console.log("Deployer address:", ADMIN_ADDRESS);
  console.log("USDC Token address:", USDC_TOKEN_ADDRESS);
  console.log("Foundation address:", FOUNDATION_ADDRESS);

  // 验证环境变量 / Validate environment variables
  if (!USDC_TOKEN_ADDRESS) {
    throw new Error("❌ USDC_TOKEN_ADDRESS not set in environment variables");
  }

  // 检查部署者余额 / Check deployer balance
  const balance = await ethers.provider.getBalance(ADMIN_ADDRESS);
  console.log("Deployer balance:", ethers.formatEther(balance), "OKB");

  if (balance < ethers.parseEther("0.01")) {
    throw new Error("❌ Insufficient OKB balance for deployment. Need at least 0.01 OKB");
  }

  // 部署FanForceVault合约 / Deploy FanForceVault contract
  console.log("\n📦 Deploying FanForceVault contract...");
  
  const FanForceVault = await ethers.getContractFactory("FanForceVault");
  const vault = await FanForceVault.deploy(
    USDC_TOKEN_ADDRESS,           // USDC代币地址 / USDC token address
    "FanForce AI Vault",          // 金库名称 / Vault name
    "FFVAULT",                    // 金库符号 / Vault symbol
    FOUNDATION_ADDRESS            // 基金会地址 / Foundation address
  );

  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ FanForceVault deployed to:", vaultAddress);

  // 验证部署 / Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  const deployedVault = await ethers.getContractAt("FanForceVault", vaultAddress);
  
  // 验证合约状态 / Verify contract state
  const assetAddress = await deployedVault.asset();
  const foundationAddress = await deployedVault.foundationAddress();
  const authorizedAgent = await deployedVault.authorizedAgent();
  const owner = await deployedVault.owner();

  console.log("Asset address:", assetAddress);
  console.log("Foundation address:", foundationAddress);
  console.log("Authorized agent:", authorizedAgent);
  console.log("Owner:", owner);

  // 验证配置是否正确 / Verify configuration is correct
  if (assetAddress !== USDC_TOKEN_ADDRESS) {
    throw new Error("❌ Asset address mismatch");
  }
  if (foundationAddress !== FOUNDATION_ADDRESS) {
    throw new Error("❌ Foundation address mismatch");
  }
  if (authorizedAgent !== ADMIN_ADDRESS) {
    throw new Error("❌ Authorized agent mismatch");
  }
  if (owner !== ADMIN_ADDRESS) {
    throw new Error("❌ Owner mismatch");
  }

  console.log("✅ Contract verification passed!");

  // 保存部署信息 / Save deployment information
  const fs = require("fs");
  const deploymentInfo = {
    contractName: "FanForceVault",
    contractAddress: vaultAddress,
    deployerAddress: ADMIN_ADDRESS,
    usdcTokenAddress: USDC_TOKEN_ADDRESS,
    foundationAddress: FOUNDATION_ADDRESS,
    network: "X Layer",
    chainId: (await ethers.provider.getNetwork()).chainId,
    deploymentTime: new Date().toISOString(),
    deploymentHash: vault.deploymentTransaction().hash,
    gasUsed: vault.deploymentTransaction().gasLimit.toString(),
    constructorArgs: [
      USDC_TOKEN_ADDRESS,
      "FanForce AI Vault",
      "FFVAULT", 
      FOUNDATION_ADDRESS
    ]
  };

  fs.writeFileSync(
    "deployment-info-xlayer.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📋 Deployment Information:");
  console.log("================================");
  console.log("Contract Name: FanForceVault");
  console.log("Contract Address:", vaultAddress);
  console.log("Deployer Address:", ADMIN_ADDRESS);
  console.log("USDC Token Address:", USDC_TOKEN_ADDRESS);
  console.log("Foundation Address:", FOUNDATION_ADDRESS);
  console.log("Network: X Layer");
  console.log("Chain ID:", deploymentInfo.chainId);
  console.log("Deployment Hash:", deploymentInfo.deploymentHash);
  console.log("Deployment Time:", deploymentInfo.deploymentTime);
  console.log("\n📄 Deployment info saved to deployment-info-xlayer.json");

  // 提供后续步骤指导 / Provide next steps guidance
  console.log("\n🎯 Next Steps:");
  console.log("1. Verify contract on X Layer explorer");
  console.log("2. Test deposit functionality");
  console.log("3. Configure AI Agent permissions");
  console.log("4. Test strategy execution");
  console.log("5. Monitor vault performance");

  return vaultAddress;
}

main()
  .then((address) => {
    console.log("\n🎉 Deployment completed successfully!");
    console.log("Contract address:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }); 