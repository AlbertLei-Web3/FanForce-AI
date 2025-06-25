require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.20",
  networks: {
    chilizTestnet: {
      url: "https://rpc.testnet.chiliz.com",
      chainId: 88882,
      accounts: [PRIVATE_KEY]
    }
  },
  mocha: {
    timeout: 100000
  }
}; 