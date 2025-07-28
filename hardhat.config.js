require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// 从.env文件获取私钥
const ADMIN_PRIVATE_KEY = process.env.PRIVATE_KEY;
const USER_A_PRIVATE_KEY = process.env.PRIVATE_KEY_A;
const USER_B_PRIVATE_KEY = process.env.PRIVATE_KEY_B;

module.exports = {
  solidity: "0.8.20",
  networks: {
    chilizSpicy: {
      url: "https://spicy-rpc.chiliz.com",
      chainId: 88882,
      accounts: [ADMIN_PRIVATE_KEY, USER_A_PRIVATE_KEY, USER_B_PRIVATE_KEY].filter(Boolean),
      timeout: 60000,
      gasPrice: 1000000000, // 1 gwei - much lower than auto pricing
      gas: 8000000 // Set reasonable gas limit
    },
    chilizSpicyLowGas: {
      url: "https://spicy-rpc.chiliz.com",
      chainId: 88882,
      accounts: [ADMIN_PRIVATE_KEY, USER_A_PRIVATE_KEY, USER_B_PRIVATE_KEY].filter(Boolean),
      timeout: 60000,
      gasPrice: 500000000, // 0.5 gwei - ultra low for testing
      gas: 8000000
    },
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL || "https://sepolia.infura.io/v3/your-project-id",
      chainId: 11155111,
      accounts: [ADMIN_PRIVATE_KEY].filter(Boolean),
      timeout: 60000,
      gasPrice: "auto"
    },
    hardhat: {
      chainId: 31337
    }
  },
  mocha: {
    timeout: 100000
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  }
}; 