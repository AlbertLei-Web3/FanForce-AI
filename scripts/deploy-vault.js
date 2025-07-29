// FanForce Vault Deployment Script / FanForce 金库部署脚本
// ---------------------------------------------
// 1. 部署ERC-4626金库合约到Sepolia测试网
// 2. 配置USDC代币地址和网络参数
// 3. 验证合约部署和初始化
// 4. 保存部署信息到文件

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting FanForce Vault deployment...");
    console.log("🚀 开始部署FanForce金库合约...");

    // 获取部署账户 / Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Deploying contracts with account: ${deployer.address}`);
    console.log(`📝 使用账户部署合约: ${deployer.address}`);

    // 检查账户余额 / Check account balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
    console.log(`💰 账户余额: ${ethers.formatEther(balance)} ETH`);

    if (balance < ethers.parseEther("0.01")) {
        throw new Error("Insufficient balance for deployment");
    }

    // 网络配置 / Network configuration
    const network = await ethers.provider.getNetwork();
    const chainId = network.chainId;
    console.log(`🌐 Network Chain ID: ${chainId}`);
    console.log(`🌐 网络链ID: ${chainId}`);

    // USDC代币地址配置 / USDC token address configuration
    const USDC_ADDRESSES = {
        11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia
        1: "0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C", // Mainnet (placeholder)
        137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon
        42161: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8" // Arbitrum
    };

    const usdcAddress = USDC_ADDRESSES[chainId];
    if (!usdcAddress) {
        throw new Error(`Unsupported network: ${chainId}`);
    }

    console.log(`💎 USDC Address: ${usdcAddress}`);
    console.log(`💎 USDC地址: ${usdcAddress}`);

    // 验证USDC合约 / Verify USDC contract
    try {
        const usdcContract = await ethers.getContractAt("IERC20", usdcAddress);
        const usdcName = await usdcContract.name();
        const usdcSymbol = await usdcContract.symbol();
        const usdcDecimals = await usdcContract.decimals();
        
        console.log(`✅ USDC Contract verified:`);
        console.log(`✅ USDC合约验证成功:`);
        console.log(`   Name: ${usdcName}`);
        console.log(`   Symbol: ${usdcSymbol}`);
        console.log(`   Decimals: ${usdcDecimals}`);
        
        // 验证代币精度 / Verify token decimals
        if (usdcDecimals !== 6) {
            console.warn(`⚠️ Warning: USDC decimals (${usdcDecimals}) is not 6`);
            console.warn(`⚠️ 警告: USDC精度 (${usdcDecimals}) 不是6`);
        }
    } catch (error) {
        console.error(`❌ Failed to verify USDC contract: ${error.message}`);
        console.error(`❌ USDC合约验证失败: ${error.message}`);
        
        // 对于测试网络，我们可以继续部署 / For test networks, we can continue deployment
        if (chainId === 11155111) {
            console.log(`⚠️ Continuing deployment for test network...`);
            console.log(`⚠️ 继续为测试网络部署...`);
        } else {
            throw error;
        }
    }

    // 部署FanForceVault合约 / Deploy FanForceVault contract
    console.log("\n📦 Deploying FanForceVault contract...");
    console.log("📦 部署FanForceVault合约...");

    const FanForceVault = await ethers.getContractFactory("FanForceVault");
    
    // 合约参数 / Contract parameters
    const vaultName = "FanForce AI Vault";
    const vaultSymbol = "ffVAULT";
    
    console.log(`📋 Contract parameters:`);
    console.log(`📋 合约参数:`);
    console.log(`   Asset: ${usdcAddress}`);
    console.log(`   Name: ${vaultName}`);
    console.log(`   Symbol: ${vaultSymbol}`);

    const vault = await FanForceVault.deploy(usdcAddress, vaultName, vaultSymbol);
    
    console.log(`⏳ Waiting for deployment confirmation...`);
    console.log(`⏳ 等待部署确认...`);
    
    await vault.waitForDeployment();
    
    const vaultAddress = await vault.getAddress();
    console.log(`✅ FanForceVault deployed to: ${vaultAddress}`);
    console.log(`✅ FanForceVault已部署到: ${vaultAddress}`);

    // 验证合约部署 / Verify contract deployment
    console.log("\n🔍 Verifying contract deployment...");
    console.log("🔍 验证合约部署...");

    try {
        const deployedVault = await ethers.getContractAt("FanForceVault", vaultAddress);
        
        // 验证合约状态 / Verify contract state
        const asset = await deployedVault.asset();
        const name = await deployedVault.name();
        const symbol = await deployedVault.symbol();
        const owner = await deployedVault.owner();
        const strategyManager = await deployedVault.strategyManager();
        
        console.log(`✅ Contract verification successful:`);
        console.log(`✅ 合约验证成功:`);
        console.log(`   Asset: ${asset}`);
        console.log(`   Name: ${name}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Owner: ${owner}`);
        console.log(`   Strategy Manager: ${strategyManager}`);
        
        // 验证所有者权限 / Verify owner permissions
        if (owner !== deployer.address) {
            throw new Error("Owner verification failed");
        }
        
        if (strategyManager !== deployer.address) {
            throw new Error("Strategy manager verification failed");
        }
        
        console.log(`✅ Owner and strategy manager verification passed`);
        console.log(`✅ 所有者和策略管理器验证通过`);
        
    } catch (error) {
        console.error(`❌ Contract verification failed: ${error.message}`);
        console.error(`❌ 合约验证失败: ${error.message}`);
        throw error;
    }

    // 保存部署信息 / Save deployment information
    const deploymentInfo = {
        network: {
            chainId: chainId,
            name: network.name || "unknown"
        },
        contracts: {
            FanForceVault: {
                address: vaultAddress,
                constructorArgs: [usdcAddress, vaultName, vaultSymbol],
                deployedAt: new Date().toISOString(),
                deployer: deployer.address
            }
        },
        configuration: {
            usdcAddress: usdcAddress,
            vaultName: vaultName,
            vaultSymbol: vaultSymbol
        }
    };

    // 创建部署信息文件 / Create deployment info file
    const deploymentPath = path.join(__dirname, "..", "deployment-info.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);
    console.log(`💾 部署信息已保存到: ${deploymentPath}`);

    // 更新合约配置文件 / Update contract configuration
    console.log("\n📝 Updating contract configuration...");
    console.log("📝 更新合约配置...");

    const contractsConfigPath = path.join(__dirname, "..", "app", "config", "contracts.ts");
    
    if (fs.existsSync(contractsConfigPath)) {
        let configContent = fs.readFileSync(contractsConfigPath, "utf8");
        
        // 更新Sepolia地址 / Update Sepolia address
        if (chainId === 11155111) {
            configContent = configContent.replace(
                /SEPOLIA_ADDRESS: '0x0000000000000000000000000000000000000000'/,
                `SEPOLIA_ADDRESS: '${vaultAddress}'`
            );
        }
        
        fs.writeFileSync(contractsConfigPath, configContent);
        console.log(`✅ Contract configuration updated`);
        console.log(`✅ 合约配置已更新`);
    }

    // 部署完成总结 / Deployment summary
    console.log("\n🎉 Deployment completed successfully!");
    console.log("🎉 部署成功完成！");
    console.log("\n📊 Deployment Summary:");
    console.log("📊 部署总结:");
    console.log(`   Network: ${network.name || chainId}`);
    console.log(`   Vault Address: ${vaultAddress}`);
    console.log(`   USDC Address: ${usdcAddress}`);
    console.log(`   Deployer: ${deployer.address}`);
    console.log(`   Gas Used: ${await vault.deploymentTransaction().gasLimit}`);
    
    console.log("\n🔗 Next steps:");
    console.log("🔗 下一步:");
    console.log("   1. Verify contract on Etherscan");
    console.log("   1. 在Etherscan上验证合约");
    console.log("   2. Test deposit/withdraw functions");
    console.log("   2. 测试存款/提款功能");
    console.log("   3. Configure frontend integration");
    console.log("   3. 配置前端集成");
    console.log("   4. Set up OKX DEX integration");
    console.log("   4. 设置OKX DEX集成");

    return {
        vaultAddress,
        usdcAddress,
        deployer: deployer.address,
        network: network.name || chainId
    };
}

// 错误处理 / Error handling
main()
    .then((result) => {
        console.log("\n✅ Deployment script completed successfully");
        console.log("✅ 部署脚本成功完成");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error("❌ 部署失败:");
        console.error(error);
        process.exit(1);
    }); 