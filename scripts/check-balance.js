const { ethers } = require("hardhat");

async function main() {
  const ADMIN_ADDRESS = "0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5";
  
  // Get the admin signer
  const [signer] = await ethers.getSigners();
  console.log("Checking balances for admin address:", ADMIN_ADDRESS);

  // Check native CHZ balance
  const balance = await ethers.provider.getBalance(ADMIN_ADDRESS);
  console.log("Native CHZ balance:", ethers.formatEther(balance), "CHZ");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("Connected to network:", {
    name: network.name,
    chainId: network.chainId
  });

  // Get block number to confirm connection
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("Current block number:", blockNumber);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 