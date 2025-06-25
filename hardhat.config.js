require('dotenv').config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    chilizTestnet: {
      url: "https://rpc.testnet.chiliz.com",
      chainId: 88882,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
}; 