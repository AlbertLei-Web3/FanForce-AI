// scripts/deploy.js
// 部署FanForcePredictionDemo合约脚本 / Deployment script for FanForcePredictionDemo
// 需先在.env中配置PRIVATE_KEY

async function main() {
  const hre = require("hardhat");
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  // CHZ测试网合约地址（如有变动请查阅官方文档）
  const chzToken = "0x3506424F91fC5e3eAfD2C7b5d7D31c564D5687c2";

  const Factory = await hre.ethers.getContractFactory("FanForcePredictionDemo");
  const contract = await Factory.deploy(chzToken);

  await contract.deployed();
  console.log("FanForcePredictionDemo deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 