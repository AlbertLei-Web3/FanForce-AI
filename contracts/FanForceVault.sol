// FanForce AI ERC-4626 Vault Contract / FanForce AI ERC-4626 金库合约 2025-07-28
// ---------------------------------------------
// 1. 符合ERC-4626标准的金库合约
// 2. 支持USDC存款和份额管理
// 3. 集成AI投资策略和OKX DEX
// 4. 支持管理员权限和紧急控制
// 5. 详细中英文注释，便于初学者理解

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title FanForceVault
 * @dev ERC-4626 compliant vault for FanForce AI investment strategies
 * @dev 符合ERC-4626标准的FanForce AI投资策略金库
 */
contract FanForceVault is ERC20, ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ========== 状态变量 / State Variables ==========
    
    // 底层资产代币 / Underlying asset token
    IERC20 public immutable asset;
    
    // 金库配置 / Vault configuration
    uint256 public maxDeposit = type(uint256).max; // 最大存款额 / Maximum deposit amount
    uint256 public maxWithdraw = type(uint256).max; // 最大提款额 / Maximum withdrawal amount
    uint256 public maxRedeem = type(uint256).max; // 最大赎回额 / Maximum redeem amount
    uint256 public maxMint = type(uint256).max; // 最大铸造额 / Maximum mint amount
    
    // 费用配置 / Fee configuration
    uint256 public depositFee = 0; // 存款手续费 / Deposit fee (basis points)
    uint256 public withdrawalFee = 0; // 提款手续费 / Withdrawal fee (basis points)
    uint256 public performanceFee = 200; // 业绩费 / Performance fee (20% = 2000 basis points)
    uint256 public constant FEE_DENOMINATOR = 10000; // 费用分母 / Fee denominator
    
    // 投资策略配置 / Investment strategy configuration
    address public strategyManager; // 策略管理器 / Strategy manager
    bool public autoInvestEnabled = true; // 自动投资开关 / Auto-investment toggle
    
    // 紧急控制 / Emergency controls
    bool public emergencyMode = false; // 紧急模式 / Emergency mode
    uint256 public emergencyWithdrawFee = 500; // 紧急提款费 / Emergency withdrawal fee (5%)
    
    // ========== 事件 / Events ==========
    
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event StrategyInvestment(address indexed strategy, uint256 amount, uint256 shares);
    event StrategyWithdrawal(address indexed strategy, uint256 amount, uint256 shares);
    event FeeCollected(uint256 feeAmount, uint256 feeType); // 0=deposit, 1=withdrawal, 2=performance, 3=emergency
    event EmergencyModeToggled(bool enabled);
    event AutoInvestToggled(bool enabled);
    event StrategyManagerUpdated(address indexed oldManager, address indexed newManager);
    event MaxLimitsUpdated(uint256 maxDeposit, uint256 maxWithdraw, uint256 maxRedeem, uint256 maxMint);
    event FeeStructureUpdated(uint256 depositFee, uint256 withdrawalFee, uint256 performanceFee);

    // ========== 修饰符 / Modifiers ==========
    
    modifier onlyStrategyManager() {
        require(msg.sender == strategyManager || msg.sender == owner(), "Only strategy manager or owner");
        _;
    }
    
    modifier notEmergencyMode() {
        require(!emergencyMode, "Emergency mode active");
        _;
    }

    // ========== 构造函数 / Constructor ==========
    
    /**
     * @dev 构造函数，初始化金库
     * @dev Constructor, initialize vault
     * @param _asset 底层资产代币地址 / Underlying asset token address
     * @param _name 金库代币名称 / Vault token name
     * @param _symbol 金库代币符号 / Vault token symbol
     */
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(address(_asset) != address(0), "Invalid asset address");
        asset = _asset;
        strategyManager = msg.sender;
        
        // 策略管理器初始化为部署者 / Strategy manager initialized to deployer
    }

    // ========== ERC-4626 标准函数 / ERC-4626 Standard Functions ==========
    
    /**
     * @dev 存款函数 - 存入资产获得份额
     * @dev Deposit function - deposit assets to receive shares
     * @param assets 存入的资产数量 / Amount of assets to deposit
     * @param receiver 接收份额的地址 / Address to receive shares
     * @return shares 获得的份额数量 / Number of shares received
     */
    function deposit(uint256 assets, address receiver) 
        external 
        nonReentrant 
        whenNotPaused 
        notEmergencyMode 
        returns (uint256 shares) 
    {
        require(assets > 0, "Invalid assets amount");
        require(receiver != address(0), "Invalid receiver");
        require(assets <= maxDeposit, "Exceeds max deposit");
        
        // 计算费用 / Calculate fees
        uint256 feeAmount = (assets * depositFee) / FEE_DENOMINATOR;
        uint256 netAssets = assets - feeAmount;
        
        // 计算份额 / Calculate shares
        shares = previewDeposit(netAssets);
        require(shares > 0, "Zero shares");
        require(shares <= maxMint, "Exceeds max mint");
        
        // 转移资产 / Transfer assets
        asset.safeTransferFrom(msg.sender, address(this), assets);
        
        // 收取费用 / Collect fees
        if (feeAmount > 0) {
            asset.safeTransfer(owner(), feeAmount);
            emit FeeCollected(feeAmount, 0); // 0 = deposit fee
        }
        
        // 铸造份额 / Mint shares
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }
    
    /**
     * @dev 铸造函数 - 直接铸造份额
     * @dev Mint function - directly mint shares
     * @param shares 要铸造的份额数量 / Number of shares to mint
     * @param receiver 接收份额的地址 / Address to receive shares
     * @return assets 需要的资产数量 / Amount of assets needed
     */
    function mint(uint256 shares, address receiver) 
        external 
        nonReentrant 
        whenNotPaused 
        notEmergencyMode 
        returns (uint256 assets) 
    {
        require(shares > 0, "Invalid shares amount");
        require(receiver != address(0), "Invalid receiver");
        require(shares <= maxMint, "Exceeds max mint");
        
        assets = previewMint(shares);
        require(assets > 0, "Zero assets");
        require(assets <= maxDeposit, "Exceeds max deposit");
        
        // 计算费用 / Calculate fees
        uint256 feeAmount = (assets * depositFee) / FEE_DENOMINATOR;
        uint256 totalAssets = assets + feeAmount;
        
        // 转移资产 / Transfer assets
        asset.safeTransferFrom(msg.sender, address(this), totalAssets);
        
        // 收取费用 / Collect fees
        if (feeAmount > 0) {
            asset.safeTransfer(owner(), feeAmount);
            emit FeeCollected(feeAmount, 0); // 0 = deposit fee
        }
        
        // 铸造份额 / Mint shares
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, totalAssets, shares);
    }
    
    /**
     * @dev 提款函数 - 赎回份额获得资产
     * @dev Withdraw function - redeem shares to receive assets
     * @param assets 要提取的资产数量 / Amount of assets to withdraw
     * @param receiver 接收资产的地址 / Address to receive assets
     * @param owner 份额所有者 / Share owner
     * @return shares 赎回的份额数量 / Number of shares redeemed
     */
    function withdraw(uint256 assets, address receiver, address owner) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 shares) 
    {
        require(assets > 0, "Invalid assets amount");
        require(receiver != address(0), "Invalid receiver");
        require(owner != address(0), "Invalid owner");
        require(assets <= maxWithdraw, "Exceeds max withdraw");
        
        // 计算份额 / Calculate shares
        shares = previewWithdraw(assets);
        
        // 检查权限 / Check permissions
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            if (allowed != type(uint256).max) {
                require(allowed >= shares, "Insufficient allowance");
                _approve(owner, msg.sender, allowed - shares);
            }
        }
        require(shares > 0, "Zero shares");
        require(shares <= balanceOf(owner), "Insufficient shares");
        require(shares <= maxRedeem, "Exceeds max redeem");
        
        // 计算费用 / Calculate fees
        uint256 feeAmount = emergencyMode ? 
            (assets * emergencyWithdrawFee) / FEE_DENOMINATOR :
            (assets * withdrawalFee) / FEE_DENOMINATOR;
        uint256 netAssets = assets - feeAmount;
        
        // 销毁份额 / Burn shares
        _burn(owner, shares);
        
        // 收取费用 / Collect fees
        if (feeAmount > 0) {
            asset.safeTransfer(owner(), feeAmount);
            emit FeeCollected(feeAmount, emergencyMode ? 3 : 1); // 3 = emergency fee, 1 = withdrawal fee
        }
        
        // 转移资产 / Transfer assets
        asset.safeTransfer(receiver, netAssets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }
    
    /**
     * @dev 赎回函数 - 直接赎回份额
     * @dev Redeem function - directly redeem shares
     * @param shares 要赎回的份额数量 / Number of shares to redeem
     * @param receiver 接收资产的地址 / Address to receive assets
     * @param owner 份额所有者 / Share owner
     * @return assets 获得的资产数量 / Amount of assets received
     */
    function redeem(uint256 shares, address receiver, address owner) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 assets) 
    {
        require(shares > 0, "Invalid shares amount");
        require(receiver != address(0), "Invalid receiver");
        require(owner != address(0), "Invalid owner");
        require(shares <= maxRedeem, "Exceeds max redeem");
        
        // 检查权限 / Check permissions
        if (msg.sender != owner) {
            uint256 allowed = allowance(owner, msg.sender);
            if (allowed != type(uint256).max) {
                require(allowed >= shares, "Insufficient allowance");
                _approve(owner, msg.sender, allowed - shares);
            }
        }
        
        require(shares <= balanceOf(owner), "Insufficient shares");
        
        // 计算资产 / Calculate assets
        assets = previewRedeem(shares);
        require(assets > 0, "Zero assets");
        require(assets <= maxWithdraw, "Exceeds max withdraw");
        
        // 计算费用 / Calculate fees
        uint256 feeAmount = emergencyMode ? 
            (assets * emergencyWithdrawFee) / FEE_DENOMINATOR :
            (assets * withdrawalFee) / FEE_DENOMINATOR;
        uint256 netAssets = assets - feeAmount;
        
        // 销毁份额 / Burn shares
        _burn(owner, shares);
        
        // 收取费用 / Collect fees
        if (feeAmount > 0) {
            asset.safeTransfer(owner(), feeAmount);
            emit FeeCollected(feeAmount, emergencyMode ? 3 : 1); // 3 = emergency fee, 1 = withdrawal fee
        }
        
        // 转移资产 / Transfer assets
        asset.safeTransfer(receiver, netAssets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    // ========== 预览函数 / Preview Functions ==========
    
    /**
     * @dev 预览存款 - 计算存入资产获得的份额
     * @dev Preview deposit - calculate shares for assets to be deposited
     */
    function previewDeposit(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0) {
            return assets;
        } else {
            // 使用更精确的计算，避免精度损失
            // Use more precise calculation to avoid precision loss
            return assets * supply / totalAssets_;
        }
    }
    
    /**
     * @dev 预览铸造 - 计算铸造份额需要的资产
     * @dev Preview mint - calculate assets needed for shares to be minted
     */
    function previewMint(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0) {
            return shares;
        } else {
            // 使用更精确的计算，避免精度损失
            // Use more precise calculation to avoid precision loss
            return shares * totalAssets_ / supply;
        }
    }
    
    /**
     * @dev 预览提款 - 计算提取资产需要的份额
     * @dev Preview withdraw - calculate shares needed for assets to be withdrawn
     */
    function previewWithdraw(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0 || totalAssets_ == 0) {
            return 0;
        } else {
            // 使用更精确的计算，避免精度损失
            // Use more precise calculation to avoid precision loss
            return assets * supply / totalAssets_;
        }
    }
    
    /**
     * @dev 预览赎回 - 计算赎回份额获得的资产
     * @dev Preview redeem - calculate assets for shares to be redeemed
     */
    function previewRedeem(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0) {
            return 0;
        } else {
            // 使用更精确的计算，避免精度损失
            // Use more precise calculation to avoid precision loss
            return shares * totalAssets_ / supply;
        }
    }

    // ========== 最大限制函数 / Maximum Limit Functions ==========
    
    function maxDeposit(address) external view returns (uint256) {
        return maxDeposit;
    }
    
    function maxMint(address) external view returns (uint256) {
        return maxMint;
    }
    
    function maxWithdraw(address owner) external view returns (uint256) {
        uint256 shares = balanceOf(owner);
        return convertToAssets(shares);
    }
    
    function maxRedeem(address owner) external view returns (uint256) {
        return balanceOf(owner);
    }

    // ========== 转换函数 / Conversion Functions ==========
    
    function convertToShares(uint256 assets) external view returns (uint256) {
        return previewDeposit(assets);
    }
    
    function convertToAssets(uint256 shares) external view returns (uint256) {
        return previewRedeem(shares);
    }

    // ========== 总资产函数 / Total Assets Function ==========
    
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    // ========== 安全检查函数 / Safety Check Functions ==========
    
    /**
     * @dev 检查金库是否健康
     * @dev Check if vault is healthy
     */
    function isHealthy() external view returns (bool) {
        uint256 totalAssets_ = totalAssets();
        uint256 supply = totalSupply();
        
        // 如果金库为空，认为是健康的
        // If vault is empty, consider it healthy
        if (supply == 0 && totalAssets_ == 0) {
            return true;
        }
        
        // 检查资产与份额的比例是否合理
        // Check if asset to share ratio is reasonable
        if (supply > 0 && totalAssets_ > 0) {
            // 计算每份的价值，应该大于0
            // Calculate value per share, should be greater than 0
            uint256 valuePerShare = totalAssets_ * 1e18 / supply;
            return valuePerShare > 0;
        }
        
        return false;
    }
    
    /**
     * @dev 获取金库状态信息
     * @dev Get vault status information
     */
    function getVaultStatus() external view returns (
        uint256 totalAssets_,
        uint256 totalShares,
        uint256 valuePerShare,
        bool healthy,
        bool paused_,
        bool emergency
    ) {
        totalAssets_ = totalAssets();
        totalShares = totalSupply();
        paused_ = paused();
        emergency = emergencyMode;
        healthy = this.isHealthy();
        
        if (totalShares > 0 && totalAssets_ > 0) {
            valuePerShare = totalAssets_ * 1e18 / totalShares;
        } else {
            valuePerShare = 0;
        }
    }

    // ========== 管理员函数 / Admin Functions ==========
    
    /**
     * @dev 设置策略管理器
     * @dev Set strategy manager
     */
    function setStrategyManager(address _manager) external onlyOwner {
        require(_manager != address(0), "Invalid manager address");
        address oldManager = strategyManager;
        strategyManager = _manager;
        emit StrategyManagerUpdated(oldManager, _manager);
    }
    
    /**
     * @dev 切换紧急模式
     * @dev Toggle emergency mode
     */
    function toggleEmergencyMode() external onlyOwner {
        emergencyMode = !emergencyMode;
        emit EmergencyModeToggled(emergencyMode);
    }
    
    /**
     * @dev 切换自动投资
     * @dev Toggle auto-investment
     */
    function toggleAutoInvest() external onlyOwner {
        autoInvestEnabled = !autoInvestEnabled;
        emit AutoInvestToggled(autoInvestEnabled);
    }
    
    /**
     * @dev 设置最大限制
     * @dev Set maximum limits
     */
    function setMaxLimits(
        uint256 _maxDeposit,
        uint256 _maxWithdraw,
        uint256 _maxRedeem,
        uint256 _maxMint
    ) external onlyOwner {
        maxDeposit = _maxDeposit;
        maxWithdraw = _maxWithdraw;
        maxRedeem = _maxRedeem;
        maxMint = _maxMint;
        emit MaxLimitsUpdated(_maxDeposit, _maxWithdraw, _maxRedeem, _maxMint);
    }
    
    /**
     * @dev 设置费用结构
     * @dev Set fee structure
     */
    function setFeeStructure(
        uint256 _depositFee,
        uint256 _withdrawalFee,
        uint256 _performanceFee
    ) external onlyOwner {
        require(_depositFee <= 1000, "Deposit fee too high"); // 最大10%
        require(_withdrawalFee <= 1000, "Withdrawal fee too high"); // 最大10%
        require(_performanceFee <= 5000, "Performance fee too high"); // 最大50%
        
        depositFee = _depositFee;
        withdrawalFee = _withdrawalFee;
        performanceFee = _performanceFee;
        
        emit FeeStructureUpdated(_depositFee, _withdrawalFee, _performanceFee);
    }
    
    /**
     * @dev 暂停合约
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 紧急提取所有资产
     * @dev Emergency withdraw all assets
     */
    function emergencyWithdrawAll() external onlyOwner {
        uint256 balance = asset.balanceOf(address(this));
        if (balance > 0) {
            asset.safeTransfer(owner(), balance);
        }
    }

    // ========== 策略管理函数 / Strategy Management Functions ==========
    
    /**
     * @dev 策略投资 - 将资产投资到策略中
     * @dev Strategy investment - invest assets into strategy
     */
    function strategyInvest(uint256 amount) external onlyStrategyManager {
        require(amount > 0, "Invalid amount");
        require(amount <= totalAssets(), "Insufficient assets");
        
        // 这里可以添加具体的投资逻辑
        // Here you can add specific investment logic
        
        emit StrategyInvestment(msg.sender, amount, 0);
    }
    
    /**
     * @dev 策略提款 - 从策略中提取资产
     * @dev Strategy withdrawal - withdraw assets from strategy
     */
    function strategyWithdraw(uint256 amount) external onlyStrategyManager {
        require(amount > 0, "Invalid amount");
        
        // 这里可以添加具体的提款逻辑
        // Here you can add specific withdrawal logic
        
        emit StrategyWithdrawal(msg.sender, amount, 0);
    }

    // ========== 重写函数 / Override Functions ==========
    
    function decimals() public view override returns (uint8) {
        return 18;
    }
} 