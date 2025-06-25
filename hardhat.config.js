// hardhat.config.js
// Hardhat配置文件 / Hardhat configuration file
// 此文件配置Hardhat开发环境，包括Solidity编译器版本、网络设置和插件加载
// This file configures the Hardhat development environment including Solidity compiler version, network settings and plugin loading
// 与智能合约编译、部署和测试相关 / Related to smart contract compilation, deployment and testing

require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    chilizTestnet: {
      url: "https://rpc.testnet.chiliz.com",
      chainId: 88882,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}; 