// 合约配置文件
// Contract Configuration

export const NETWORKS = {
  SEPOLIA: {
    chainId: '0xaa36a7', // 11155111
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/your-project-id',
    explorer: 'https://sepolia.etherscan.io'
  },
  MAINNET: {
    chainId: '0x1', // 1
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/your-project-id',
    explorer: 'https://etherscan.io'
  }
};

// ERC-4626金库合约配置
export const VAULT_CONTRACT = {
  // Sepolia测试网合约地址（部署后更新）
  SEPOLIA_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: 部署后更新
  MAINNET_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: 部署后更新
  
  // ERC-4626标准ABI
  ABI: [
    // 标准ERC-4626函数
    'function deposit(uint256 assets, address receiver) external returns (uint256 shares)',
    'function withdraw(uint256 shares, address receiver, address owner) external returns (uint256 assets)',
    'function totalAssets() external view returns (uint256)',
    'function convertToShares(uint256 assets) external view returns (uint256)',
    'function convertToAssets(uint256 shares) external view returns (uint256)',
    'function maxDeposit(address) external view returns (uint256)',
    'function maxWithdraw(address owner) external view returns (uint256)',
    'function maxRedeem(address owner) external view returns (uint256)',
    'function previewDeposit(uint256 assets) external view returns (uint256)',
    'function previewWithdraw(uint256 assets) external view returns (uint256)',
    'function previewRedeem(uint256 shares) external view returns (uint256)',
    'function previewMint(uint256 shares) external view returns (uint256)',
    
    // 标准ERC-20函数
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)',
    'function totalSupply() external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
    
    // 事件
    'event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)',
    'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ]
};

// USDC代币配置
export const USDC_TOKEN = {
  SEPOLIA_ADDRESS: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  MAINNET_ADDRESS: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C', // 主网USDC
  
  ABI: [
    'function name() external view returns (string)',
    'function symbol() external view returns (string)',
    'function decimals() external view returns (uint8)',
    'function totalSupply() external view returns (uint256)',
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function transferFrom(address from, address to, uint256 amount) external returns (bool)'
  ]
};

// 获取当前网络的合约地址
export function getVaultContractAddress(chainId: string): string {
  switch (chainId) {
    case NETWORKS.SEPOLIA.chainId:
      return VAULT_CONTRACT.SEPOLIA_ADDRESS;
    case NETWORKS.MAINNET.chainId:
      return VAULT_CONTRACT.MAINNET_ADDRESS;
    default:
      return VAULT_CONTRACT.SEPOLIA_ADDRESS; // 默认使用Sepolia
  }
}

// 获取当前网络的USDC地址
export function getUSDCTokenAddress(chainId: string): string {
  switch (chainId) {
    case NETWORKS.SEPOLIA.chainId:
      return USDC_TOKEN.SEPOLIA_ADDRESS;
    case NETWORKS.MAINNET.chainId:
      return USDC_TOKEN.MAINNET_ADDRESS;
    default:
      return USDC_TOKEN.SEPOLIA_ADDRESS; // 默认使用Sepolia
  }
} 