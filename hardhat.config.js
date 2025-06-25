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
      gasPrice: 'auto'
    }
  },
  mocha: {
    timeout: 100000
  }
}; 