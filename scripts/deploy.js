// scripts/deploy.js
// 部署FanForcePredictionDemo合约脚本 / Deployment script for FanForcePredictionDemo
// 需先在.env中配置PRIVATE_KEY

const { ethers } = require("hardhat");

async function main() {
  const ADMIN_ADDRESS = "0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5";

  console.log("Deploying contracts with the account:", ADMIN_ADDRESS);
  console.log("Using native CHZ instead of ERC20 CHZ token");

  // Deploy the contract
  const FanForcePrediction = await ethers.getContractFactory("FanForcePredictionDemo");
  const prediction = await FanForcePrediction.deploy(); // 不再需要CHZ代币地址参数 / No longer need CHZ token address parameter
  await prediction.waitForDeployment();

  const contractAddress = await prediction.getAddress();
  console.log("Contract deployed to:", contractAddress);

  // Verify deployment
  const deployedContract = await ethers.getContractAt("FanForcePredictionDemo", contractAddress);
  
  // Log important information
  console.log("\nDeployment Information:");
  console.log("------------------------");
  console.log("Contract Address:", contractAddress);
  console.log("Admin Address:", ADMIN_ADDRESS);
  console.log("Payment Method: Native CHZ");

  // Save deployment info to a file
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress,
    adminAddress: ADMIN_ADDRESS,
    paymentMethod: "Native CHZ",
    network: network.name,
    chainId: network.chainId,
    deploymentTime: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 