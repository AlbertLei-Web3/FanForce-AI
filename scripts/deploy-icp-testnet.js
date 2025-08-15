#!/usr/bin/env node

/**
 * FanForce AI - ICP Testnet Deployment Script / FanForce AI - ICP测试网部署脚本
 * Deploy FanForce Verifier Canister to ICP Testnet / 将FanForce验证器容器部署到ICP测试网
 * 
 * Usage / 使用方法:
 * 1. Install dfx: sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
 * 2. Start local network: dfx start --background
 * 3. Deploy locally: npm run icp-deploy-local
 * 4. Deploy to testnet: npm run icp-deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 FanForce AI - ICP Testnet Deployment / FanForce AI - ICP测试网部署');
console.log('==================================================');

// Check if dfx is installed / 检查dfx是否已安装
function checkDfx() {
    try {
        execSync('dfx --version', { stdio: 'pipe' });
        console.log('✅ DFX is installed / DFX已安装');
        return true;
    } catch (error) {
        console.log('❌ DFX is not installed / DFX未安装');
        console.log('📥 Please install DFX first: / 请先安装DFX:');
        console.log('   sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"');
        return false;
    }
}

// Check if dfx.json exists / 检查dfx.json是否存在
function checkDfxConfig() {
    const dfxPath = path.join(process.cwd(), 'dfx.json');
    if (fs.existsSync(dfxPath)) {
        console.log('✅ dfx.json configuration found / 找到dfx.json配置');
        return true;
    } else {
        console.log('❌ dfx.json not found / 未找到dfx.json');
        return false;
    }
}

// Check if canister source exists / 检查容器源代码是否存在
function checkCanisterSource() {
    const canisterPath = path.join(process.cwd(), 'src/fanforce_verifier/main.mo');
    if (fs.existsSync(canisterPath)) {
        console.log('✅ Canister source code found / 找到容器源代码');
        return true;
    } else {
        console.log('❌ Canister source code not found / 未找到容器源代码');
        return false;
    }
}

// Deploy to local network / 部署到本地网络
function deployLocal() {
    console.log('\n🏠 Deploying to local network... / 部署到本地网络...');
    try {
        // Start local network / 启动本地网络
        console.log('📡 Starting local ICP network... / 启动本地ICP网络...');
        execSync('dfx start --background', { stdio: 'inherit' });
        
        // Wait for network to start / 等待网络启动
        console.log('⏳ Waiting for local network to start... / 等待本地网络启动...');
        setTimeout(() => {
            try {
                // Deploy canister / 部署容器
                console.log('🚀 Deploying canister to local network... / 部署容器到本地网络...');
                execSync('dfx deploy fanforce_verifier', { stdio: 'inherit' });
                
                // Get canister ID / 获取容器ID
                console.log('🆔 Getting canister ID... / 获取容器ID...');
                const canisterId = execSync('dfx canister id fanforce_verifier', { encoding: 'utf8' }).trim();
                console.log(`✅ Canister deployed locally with ID: ${canisterId}`);
                
                // Save local deployment info / 保存本地部署信息
                const deploymentInfo = {
                    network: 'local',
                    canisterId: canisterId,
                    deployedAt: new Date().toISOString(),
                    dfxVersion: execSync('dfx --version', { encoding: 'utf8' }).trim()
                };
                
                fs.writeFileSync('deployment-info-local.json', JSON.stringify(deploymentInfo, null, 2));
                console.log('💾 Local deployment info saved to deployment-info-local.json');
                
            } catch (error) {
                console.error('❌ Failed to deploy locally:', error.message);
            }
        }, 5000);
        
    } catch (error) {
        console.error('❌ Failed to start local network:', error.message);
    }
}

// Deploy to testnet / 部署到测试网
function deployTestnet() {
    console.log('\n🌐 Deploying to ICP testnet... / 部署到ICP测试网...');
    try {
        // Check if identity is configured / 检查身份是否已配置
        console.log('🔐 Checking ICP identity... / 检查ICP身份...');
        const identities = execSync('dfx identity list', { encoding: 'utf8' });
        console.log('📋 Available identities:', identities);
        
        // Deploy to testnet / 部署到测试网
        console.log('🚀 Deploying canister to testnet... / 部署容器到测试网...');
        execSync('dfx deploy --network ic fanforce_verifier', { stdio: 'inherit' });
        
        // Get canister ID / 获取容器ID
        console.log('🆔 Getting testnet canister ID... / 获取测试网容器ID...');
        const canisterId = execSync('dfx canister --network ic id fanforce_verifier', { encoding: 'utf8' }).trim();
        console.log(`✅ Canister deployed to testnet with ID: ${canisterId}`);
        
        // Save testnet deployment info / 保存测试网部署信息
        const deploymentInfo = {
            network: 'testnet',
            canisterId: canisterId,
            deployedAt: new Date().toISOString(),
            dfxVersion: execSync('dfx --version', { encoding: 'utf8' }).trim()
        };
        
        fs.writeFileSync('deployment-info-testnet.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('💾 Testnet deployment info saved to deployment-info-testnet.json');
        
    } catch (error) {
        console.error('❌ Failed to deploy to testnet:', error.message);
        console.log('💡 Make sure you have: / 确保您有:');
        console.log('   1. Configured ICP identity / 配置了ICP身份');
        console.log('   2. Sufficient cycles for deployment / 足够的部署周期');
        console.log('   3. Internet connection / 网络连接');
    }
}

// Main deployment function / 主部署函数
function main() {
    console.log('🔍 Checking prerequisites... / 检查先决条件...');
    
    if (!checkDfx()) {
        process.exit(1);
    }
    
    if (!checkDfxConfig()) {
        process.exit(1);
    }
    
    if (!checkCanisterSource()) {
        process.exit(1);
    }
    
    console.log('\n✅ All prerequisites met / 满足所有先决条件');
    
    // Parse command line arguments / 解析命令行参数
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'local':
            deployLocal();
            break;
        case 'testnet':
            deployTestnet();
            break;
        default:
            console.log('\n📖 Usage / 使用方法:');
            console.log('   node scripts/deploy-icp-testnet.js local    - Deploy to local network / 部署到本地网络');
            console.log('   node scripts/deploy-icp-testnet.js testnet  - Deploy to testnet / 部署到测试网');
            console.log('\n💡 Or use npm scripts / 或使用npm脚本:');
            console.log('   npm run icp-deploy-local  - Deploy locally / 本地部署');
            console.log('   npm run icp-deploy        - Deploy to testnet / 部署到测试网');
            break;
    }
}

// Run main function / 运行主函数
if (require.main === module) {
    main();
}

module.exports = {
    checkDfx,
    checkDfxConfig,
    checkCanisterSource,
    deployLocal,
    deployTestnet
};
