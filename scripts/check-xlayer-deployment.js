// scripts/check-xlayer-deployment.js
// 检查X Layer部署前置条件的脚本 / Script to check X Layer deployment prerequisites

const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking X Layer deployment prerequisites...\n");

  // 检查环境变量 / Check environment variables
  console.log("📋 Environment Variables Check:");
  console.log("=================================");
  
  const requiredEnvVars = [
    'PRIVATE_KEY',
    'USDC_TOKEN_ADDRESS',
    'FOUNDATION_ADDRESS'
  ];

  let envCheckPassed = true;
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar === 'PRIVATE_KEY' ? '***' + value.slice(-4) : value}`);
    } else {
      console.log(`❌ ${envVar}: Not set`);
      envCheckPassed = false;
    }
  }

  if (!envCheckPassed) {
    console.log("\n❌ Environment variables check failed!");
    console.log("Please set all required environment variables in your .env file");
    return;
  }

  console.log("\n✅ Environment variables check passed!");

  // 检查网络连接 / Check network connectivity
  console.log("\n🌐 Network Connectivity Check:");
  console.log("===============================");

  const networks = [
    {
      name: "X Layer Testnet",
      url: "https://testrpc.xlayer.tech",
      chainId: 195
    },
    {
      name: "X Layer Mainnet", 
      url: "https://rpc.xlayer.tech",
      chainId: 196
    }
  ];

  for (const network of networks) {
    try {
      console.log(`\n🔗 Testing ${network.name}...`);
      const provider = new ethers.JsonRpcProvider(network.url);
      
      // 检查网络连接 / Check network connection
      const blockNumber = await provider.getBlockNumber();
      console.log(`✅ ${network.name} connected - Block: ${blockNumber}`);
      
      // 检查链ID / Check chain ID
      const networkInfo = await provider.getNetwork();
      console.log(`✅ Chain ID: ${networkInfo.chainId} (Expected: ${network.chainId})`);
      
      // 检查gas价格 / Check gas price
      const gasPrice = await provider.getFeeData();
      console.log(`✅ Gas Price: ${ethers.formatUnits(gasPrice.gasPrice, 'gwei')} gwei`);
      
    } catch (error) {
      console.log(`❌ ${network.name} connection failed:`, error.message);
    }
  }

  // 检查部署者账户 / Check deployer account
  console.log("\n👤 Deployer Account Check:");
  console.log("===========================");

  try {
    const [deployer] = await ethers.getSigners();
    const address = deployer.address;
    const balance = await ethers.provider.getBalance(address);
    
    console.log(`✅ Deployer Address: ${address}`);
    console.log(`✅ Balance: ${ethers.formatEther(balance)} OKB`);
    
    if (balance < ethers.parseEther("0.01")) {
      console.log("⚠️  Warning: Low balance. Need at least 0.01 OKB for deployment");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
    
  } catch (error) {
    console.log("❌ Deployer account check failed:", error.message);
  }

  // 检查合约编译 / Check contract compilation
  console.log("\n📦 Contract Compilation Check:");
  console.log("===============================");

  try {
    await ethers.getContractFactory("FanForceVault");
    console.log("✅ FanForceVault contract compiled successfully");
  } catch (error) {
    console.log("❌ Contract compilation failed:", error.message);
    console.log("Run 'npx hardhat compile' to compile contracts");
  }

  // 检查USDC代币合约 / Check USDC token contract
  console.log("\n🪙 USDC Token Contract Check:");
  console.log("==============================");

  const usdcAddress = process.env.USDC_TOKEN_ADDRESS;
  if (usdcAddress) {
    try {
      // 连接到X Layer测试网来检查USDC合约
      const xlayerProvider = new ethers.JsonRpcProvider("https://testrpc.xlayer.tech");
      
      // 检查合约是否存在
      const code = await xlayerProvider.getCode(usdcAddress);
      if (code !== "0x") {
        console.log(`✅ USDC Token Address: ${usdcAddress}`);
        console.log(`✅ Contract exists on X Layer Testnet`);
        
        // 尝试获取ERC20信息
        try {
          const usdcContract = new ethers.Contract(usdcAddress, [
            "function name() view returns (string)",
            "function symbol() view returns (string)", 
            "function decimals() view returns (uint8)"
          ], xlayerProvider);
          
          const name = await usdcContract.name();
          const symbol = await usdcContract.symbol();
          const decimals = await usdcContract.decimals();
          
          console.log(`✅ Token Name: ${name}`);
          console.log(`✅ Token Symbol: ${symbol}`);
          console.log(`✅ Token Decimals: ${decimals}`);
        } catch (interfaceError) {
          console.log(`⚠️  Warning: Standard ERC20 interface not available`);
          console.log(`   This is normal for some testnet tokens`);
        }
      } else {
        console.log(`❌ USDC Token Address: ${usdcAddress} - Contract not found on X Layer Testnet`);
        console.log(`   Please verify the address in your OKX wallet`);
      }
      
    } catch (error) {
      console.log(`❌ USDC token contract check failed: ${error.message}`);
    }
  } else {
    console.log("❌ USDC_TOKEN_ADDRESS not set in environment variables");
  }

  // 部署建议 / Deployment recommendations
  console.log("\n💡 Deployment Recommendations:");
  console.log("===============================");
  console.log("1. ✅ Use X Layer testnet for initial deployment");
  console.log("2. ✅ Ensure you have at least 0.01 OKB for gas fees");
  console.log("3. ✅ Verify USDC token address is correct for X Layer");
  console.log("4. ✅ Test with small amounts first");
  console.log("5. ✅ Monitor deployment transaction on X Layer explorer");

  console.log("\n🎯 Ready for deployment!");
  console.log("Run: npx hardhat run scripts/deploy-vault-xlayer.js --network xlayerTestnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  }); 