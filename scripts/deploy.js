// scripts/deploy.js
// 部署FanForcePredictionDemo合约脚本 / Deployment script for FanForcePredictionDemo
// 此脚本用于在Chiliz测试网络上部署智能合约 / This script deploys the smart contract on Chiliz testnet
// 需先在.env中配置PRIVATE_KEY / Requires PRIVATE_KEY configuration in .env file
// 与hardhat.config.js和contracts/FanForcePredictionDemo.sol相关 / Related to hardhat.config.js and contracts/FanForcePredictionDemo.sol

async function main() {
  const hre = require("hardhat");
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contract with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // CHZ测试网合约地址（校验和格式正确）/ CHZ testnet contract address (correct checksum format)
  // 如地址有变动请查阅Chiliz官方文档 / Check Chiliz official docs if address changes
  const chzToken = "0x3506424F91fC5e3eAfD2C7b5d7D31c564D5687C2";

  console.log("Using CHZ token address:", chzToken);

  try {
    const Factory = await hre.ethers.getContractFactory("FanForcePredictionDemo");
    console.log("Contract factory created successfully");
    
    const contract = await Factory.deploy(chzToken);
    console.log("Contract deployment transaction sent");
    
    // 等待部署完成 / Wait for deployment to complete
    await contract.waitForDeployment ? 
      await contract.waitForDeployment() : 
      await contract.deployed();
    
    const deployedAddress = contract.target || contract.address;
    console.log("FanForcePredictionDemo deployed to:", deployedAddress);
    console.log("Transaction hash:", contract.deploymentTransaction?.hash);
    
  } catch (error) {
    console.error("Deployment failed:", error.message);
    throw error;
  }
}

main().catch((error) => {
  console.error("Script execution failed:", error);
  process.exitCode = 1;
}); 