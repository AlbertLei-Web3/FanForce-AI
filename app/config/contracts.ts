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
  },
  XLAYER_TESTNET: {
    chainId: '0xC3', // 195
    name: 'X Layer Testnet',
    rpcUrl: 'https://testrpc.xlayer.tech',
    explorer: 'https://testnet.xlayer.tech'
  }
};

// ERC-4626金库合约配置
export const VAULT_CONTRACT = {
  // Sepolia测试网合约地址（部署后更新）
  SEPOLIA_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: 部署后更新
  MAINNET_ADDRESS: '0x0000000000000000000000000000000000000000', // TODO: 部署后更新
  XLAYER_TESTNET_ADDRESS: '0xA45Ace6f96703D6DA760088412F8df81226ef51c', // X Layer Testnet Vault
  
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
    'function foundationAddress() external view returns (address)',
    'function authorizedAgent() external view returns (address)',
    'function totalInvested() external view returns (uint256)',
    'function depositsEnabled() external view returns (bool)',
    
    // 运动员相关函数
    'function athleteDeposits(address) external view returns (uint256)',
    'function athleteShares(address) external view returns (uint256)',
    'function athleteProfits(address) external view returns (uint256)',
    
    // 策略执行函数
    'function executeStrategy(uint256 strategyId, uint256 amount, address targetToken, uint8 marketCondition) external',
    
    // 查询函数
    'function getVaultInfo(address athlete) external view returns (uint256 depositAmount, uint256 shareAmount, uint256 profitAmount, uint256 totalAssets_, uint256 totalInvested_, uint256 availableAmount)',
    'function getAthleteInfo(address athlete) external view returns (uint256 depositAmount, uint256 shares, uint256 profits, uint256 currentValue, uint256 sharePercentage)',
    'function getVaultStats() external view returns (uint256 totalAssets_, uint256 totalSupply_, uint256 totalInvested_)',
    'function calculateCurrentProfit() external view returns (uint256)',
    'function getTotalDeposits() external view returns (uint256)',
    'function calculateUserProfit(address athlete, uint256 totalVaultProfit) external view returns (uint256 userPortion, uint256 athleteShare, uint256 foundationShare, uint256 sharePercentage)',
    
    // 收益分配函数
    'function distributeProfitsToAthlete(address athlete, uint256 profitAmount) external',
    
    // 管理员函数
    'function owner() external view returns (address)',
    'function authorizeAgent(address agent) external',
    'function setFoundationAddress(address _foundation) external',
    'function toggleDeposits() external',
    'function emergencyWithdraw() external',
    
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
    'event AthleteDeposit(address indexed athlete, uint256 usdcAmount, uint256 shares, uint256 timestamp)',
    'event StrategyExecuted(uint256 indexed strategyId, address indexed executor, uint256 amount, bool success, uint256 timestamp)',
    'event ProfitDistributed(address indexed athlete, uint256 athleteShare, uint256 foundationShare, uint256 timestamp)',
    'event AgentAuthorized(address indexed oldAgent, address indexed newAgent)',
    'event FoundationAddressUpdated(address indexed oldFoundation, address indexed newFoundation)',
    'event DepositsToggled(bool enabled)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
  ]
};

// USDC代币配置
export const USDC_TOKEN = {
  SEPOLIA_ADDRESS: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  MAINNET_ADDRESS: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C', // 主网USDC
  XLAYER_TESTNET_ADDRESS: '0xe8926a7f935675e95c4881a0ffbb84ea320af6fd', // X Layer Testnet USDC
  
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
    case NETWORKS.XLAYER_TESTNET.chainId:
      return VAULT_CONTRACT.XLAYER_TESTNET_ADDRESS;
    default:
      return VAULT_CONTRACT.XLAYER_TESTNET_ADDRESS; // 默认使用X Layer Testnet
  }
}

// 获取当前网络的USDC地址
export function getUSDCTokenAddress(chainId: string): string {
  switch (chainId) {
    case NETWORKS.SEPOLIA.chainId:
      return USDC_TOKEN.SEPOLIA_ADDRESS;
    case NETWORKS.MAINNET.chainId:
      return USDC_TOKEN.MAINNET_ADDRESS;
    case NETWORKS.XLAYER_TESTNET.chainId:
      return USDC_TOKEN.XLAYER_TESTNET_ADDRESS;
    default:
      return USDC_TOKEN.XLAYER_TESTNET_ADDRESS; // 默认使用X Layer Testnet
  }
} 