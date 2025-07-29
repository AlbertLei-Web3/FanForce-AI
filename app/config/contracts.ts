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
    'function mint(uint256 shares, address receiver) external returns (uint256 assets)',
    'function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares)',
    'function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets)',
    'function totalAssets() external view returns (uint256)',
    'function convertToShares(uint256 assets) external view returns (uint256)',
    'function convertToAssets(uint256 shares) external view returns (uint256)',
    'function maxDeposit(address) external view returns (uint256)',
    'function maxMint(address) external view returns (uint256)',
    'function maxWithdraw(address owner) external view returns (uint256)',
    'function maxRedeem(address owner) external view returns (uint256)',
    'function previewDeposit(uint256 assets) external view returns (uint256)',
    'function previewMint(uint256 shares) external view returns (uint256)',
    'function previewWithdraw(uint256 assets) external view returns (uint256)',
    'function previewRedeem(uint256 shares) external view returns (uint256)',
    
    // 状态变量访问函数
    'function asset() external view returns (address)',
    'function depositFee() external view returns (uint256)',
    'function withdrawalFee() external view returns (uint256)',
    'function performanceFee() external view returns (uint256)',
    'function strategyManager() external view returns (address)',
    'function autoInvestEnabled() external view returns (bool)',
    'function emergencyMode() external view returns (bool)',
    'function FEE_DENOMINATOR() external view returns (uint256)',
    'function emergencyWithdrawFee() external view returns (uint256)',
    
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
    
    // 安全检查函数
    'function isHealthy() external view returns (bool)',
    'function getVaultStatus() external view returns (uint256 totalAssets_, uint256 totalShares, uint256 valuePerShare, bool healthy, bool paused_, bool emergency)',
    
    // 策略管理函数
    'function strategyInvest(uint256 amount) external',
    'function strategyWithdraw(uint256 amount) external',
    'function setStrategyManager(address _manager) external',
    'function toggleEmergencyMode() external',
    'function toggleAutoInvest() external',
    
    // 费用管理函数
    'function setFeeStructure(uint256 _depositFee, uint256 _withdrawalFee, uint256 _performanceFee) external',
    
    // 管理员函数
    'function owner() external view returns (address)',
    'function pause() external',
    'function unpause() external',
    'function paused() external view returns (bool)',
    'function emergencyWithdrawAll() external',
    'function setMaxLimits(uint256 _maxDeposit, uint256 _maxWithdraw, uint256 _maxRedeem, uint256 _maxMint) external',
    
    // 事件
    'event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)',
    'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
    'event StrategyInvestment(address indexed strategy, uint256 amount, uint256 shares)',
    'event StrategyWithdrawal(address indexed strategy, uint256 amount, uint256 shares)',
    'event FeeCollected(uint256 feeAmount, uint256 feeType)',
    'event EmergencyModeToggled(bool enabled)',
    'event AutoInvestToggled(bool enabled)',
    'event StrategyManagerUpdated(address indexed oldManager, address indexed newManager)',
    'event MaxLimitsUpdated(uint256 maxDeposit, uint256 maxWithdraw, uint256 maxRedeem, uint256 maxMint)',
    'event FeeStructureUpdated(uint256 depositFee, uint256 withdrawalFee, uint256 performanceFee)',
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