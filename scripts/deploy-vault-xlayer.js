// scripts/deploy-vault-xlayer.js
// 部署FanForceVault合约到X Layer测试网 / Deploy FanForceVault contract to X Layer testnet
// 基于X Layer官方文档: https://web3.okx.com/zh-hans/xlayer/docs/developer/deploy-a-smart-contract/deploy-with-hardhat

const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting FanForceVault deployment to X Layer Testnet...\n");

  // 获取部署者账户 / Get deployer account
  const [deployer] = await ethers.getSigners();
  const ADMIN_ADDRESS = deployer.address;
  
  console.log("👤 Deployer Address:", ADMIN_ADDRESS);
  console.log("💰 Deployer Balance:", ethers.formatEther(await ethers.provider.getBalance(ADMIN_ADDRESS)), "OKB");

  // 从环境变量获取配置 / Get configuration from environment variables
  const USDC_TOKEN_ADDRESS = process.env.USDC_TOKEN_ADDRESS;
  const FOUNDATION_ADDRESS = process.env.FOUNDATION_ADDRESS;
  
  console.log("\n📋 Deployment Configuration:");
  console.log("=============================");
  console.log("USDC Token Address:", USDC_TOKEN_ADDRESS);
  console.log("Foundation Address:", FOUNDATION_ADDRESS);
  console.log("Vault Name: FanForce AI Vault");
  console.log("Vault Symbol: FFVAULT");

  // 验证配置 / Validate configuration
  if (!USDC_TOKEN_ADDRESS) {
    throw new Error("❌ USDC_TOKEN_ADDRESS not set in environment variables");
  }

  if (!FOUNDATION_ADDRESS) {
    throw new Error("❌ FOUNDATION_ADDRESS not set in environment variables");
  }

  // 验证地址分离 / Validate address separation
  if (FOUNDATION_ADDRESS === ADMIN_ADDRESS) {
    console.log("⚠️  Warning: FOUNDATION_ADDRESS and ADMIN_ADDRESS are the same");
    console.log("This is acceptable for testing but not recommended for production");
  }

  // 检查USDC合约是否存在 / Check if USDC contract exists
  try {
    const usdcContract = await ethers.getContractAt("IERC20", USDC_TOKEN_ADDRESS);
    const usdcName = await usdcContract.name();
    const usdcSymbol = await usdcContract.symbol();
    const usdcDecimals = await usdcContract.decimals();
    
    console.log("\n✅ USDC Contract Verification:");
    console.log("Name:", usdcName);
    console.log("Symbol:", usdcSymbol);
    console.log("Decimals:", usdcDecimals);
  } catch (error) {
    console.log("⚠️  Warning: Could not verify USDC contract at", USDC_TOKEN_ADDRESS);
    console.log("This might be expected for testnet deployments");
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

  console.log("⏳ Waiting for deployment confirmation...");
  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();
  console.log("\n✅ FanForceVault deployed successfully!");
  console.log("Contract Address:", vaultAddress);

  // 验证部署 / Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  try {
    const deployedVault = await ethers.getContractAt("FanForceVault", vaultAddress);
    
    // 验证合约参数 / Verify contract parameters
    const assetAddress = await deployedVault.asset();
    const foundationAddress = await deployedVault.foundationAddress();
    const name = await deployedVault.name();
    const symbol = await deployedVault.symbol();
    const owner = await deployedVault.owner();
    
    console.log("\n📋 Contract Verification:");
    console.log("=========================");
    console.log("✅ Asset Address:", assetAddress);
    console.log("✅ Foundation Address:", foundationAddress);
    console.log("✅ Vault Name:", name);
    console.log("✅ Vault Symbol:", symbol);
    console.log("✅ Owner:", owner);
    
    // 验证参数是否正确 / Verify parameters are correct
    if (assetAddress !== USDC_TOKEN_ADDRESS) {
      throw new Error("❌ Asset address mismatch");
    }
    if (foundationAddress !== FOUNDATION_ADDRESS) {
      throw new Error("❌ Foundation address mismatch");
    }
    if (owner !== ADMIN_ADDRESS) {
      throw new Error("❌ Owner address mismatch");
    }
    
    console.log("\n✅ All contract parameters verified correctly!");
    
  } catch (error) {
    console.log("❌ Contract verification failed:", error.message);
    throw error;
  }

  // 保存部署信息 / Save deployment information
  const fs = require("fs");
  const deploymentInfo = {
    contractName: "FanForceVault",
    contractAddress: vaultAddress,
    deployerAddress: ADMIN_ADDRESS,
    foundationAddress: FOUNDATION_ADDRESS,
    usdcTokenAddress: USDC_TOKEN_ADDRESS,
    vaultName: "FanForce AI Vault",
    vaultSymbol: "FFVAULT",
    network: "X Layer Testnet",
    chainId: 195,
    deploymentTime: new Date().toISOString(),
    deploymentTxHash: vault.deploymentTransaction().hash
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment information saved to deployment-info.json");
  
  console.log("\n🎉 Deployment Summary:");
  console.log("=====================");
  console.log("✅ Contract: FanForceVault");
  console.log("✅ Address:", vaultAddress);
  console.log("✅ Network: X Layer Testnet");
  console.log("✅ Deployer:", ADMIN_ADDRESS);
  console.log("✅ Foundation:", FOUNDATION_ADDRESS);
  console.log("✅ USDC Token:", USDC_TOKEN_ADDRESS);
  
  console.log("\n🔗 Explorer URL:");
  console.log(`https://www.oklink.com/xlayer-testnet/address/${vaultAddress}`);
  
  console.log("\n🚀 Next Steps:");
  console.log("1. Verify contract on OKLink");
  console.log("2. Test deposit functionality");
  console.log("3. Test strategy execution");
  console.log("4. Test profit distribution");
}

// 错误处理 / Error handling
main().catch((error) => {
  console.error("\n❌ Deployment failed:", error);
  process.exitCode = 1;
}); 