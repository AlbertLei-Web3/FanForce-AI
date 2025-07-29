// FanForce AI ERC-4626 Vault Contract - MVP Version / FanForce AI ERC-4626 金库合约 - MVP版本
// ---------------------------------------------
// 1. 符合ERC-4626标准的金库合约
// 2. 支持USDC存款和份额管理
// 3. 集成OKX DEX进行swap操作
// 4. 实现分润机制
// 5. 简化功能，专注MVP核心需求

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanForceVault
 * @dev ERC-4626 compliant vault for FanForce AI investment strategies
 * @dev 符合ERC-4626标准的FanForce AI投资策略金库
 */
contract FanForceVault is ERC20, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ========== 状态变量 / State Variables ==========
    
    // 底层资产代币 / Underlying asset token
    IERC20 public immutable asset;
    
    // 投资策略配置 / Investment strategy configuration
    address public strategyManager; // 策略管理器 / Strategy manager
    
    // 分润配置 / Profit sharing configuration
    uint256 public constant ATHLETE_SHARE = 80; // 运动员分润比例 / Athlete profit share (80%)
    uint256 public constant FOUNDATION_SHARE = 20; // 基金会分润比例 / Foundation profit share (20%)
    uint256 public constant SHARE_DENOMINATOR = 100; // 分润分母 / Share denominator
    
    // 投资状态 / Investment status
    uint256 public totalInvested; // 总投资金额 / Total invested amount
    uint256 public totalProfits; // 总收益 / Total profits
    uint256 public lastProfitDistribution; // 上次分润时间 / Last profit distribution time
    
    // ========== 事件 / Events ==========
    
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    event InvestmentExecuted(address indexed token, uint256 amount, uint256 shares);
    event ProfitDistributed(uint256 totalProfit, uint256 athleteShare, uint256 foundationShare);
    event StrategyManagerUpdated(address indexed oldManager, address indexed newManager);

    // ========== 修饰符 / Modifiers ==========
    
    modifier onlyStrategyManager() {
        require(msg.sender == strategyManager || msg.sender == owner(), "Only strategy manager or owner");
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
    }

    // ========== ERC-4626 标准函数 / ERC-4626 Standard Functions ==========
    
    /**
     * @dev 存款函数 - 存入资产获得份额
     * @dev Deposit function - deposit assets to receive shares
     */
    function deposit(uint256 assets, address receiver) 
        external 
        nonReentrant 
        returns (uint256 shares) 
    {
        require(assets > 0, "Invalid assets amount");
        require(receiver != address(0), "Invalid receiver");
        
        // 计算份额 / Calculate shares
        shares = previewDeposit(assets);
        require(shares > 0, "Zero shares");
        
        // 转移资产 / Transfer assets
        asset.safeTransferFrom(msg.sender, address(this), assets);
        
        // 铸造份额 / Mint shares
        _mint(receiver, shares);
        
        emit Deposit(msg.sender, receiver, assets, shares);
    }
    
    /**
     * @dev 提款函数 - 赎回份额获得资产
     * @dev Withdraw function - redeem shares to receive assets
     */
    function withdraw(uint256 assets, address receiver, address owner) 
        external 
        nonReentrant 
        returns (uint256 shares) 
    {
        require(assets > 0, "Invalid assets amount");
        require(receiver != address(0), "Invalid receiver");
        require(owner != address(0), "Invalid owner");
        
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
        
        // 销毁份额 / Burn shares
        _burn(owner, shares);
        
        // 转移资产 / Transfer assets
        asset.safeTransfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    // ========== 预览函数 / Preview Functions ==========
    
    function previewDeposit(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0) {
            return assets;
        } else {
            return assets * supply / totalAssets_;
        }
    }
    
    function previewWithdraw(uint256 assets) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0 || totalAssets_ == 0) {
            return 0;
        } else {
            return assets * supply / totalAssets_;
        }
    }

    // ========== 转换函数 / Conversion Functions ==========
    
    function convertToShares(uint256 assets) external view returns (uint256) {
        return previewDeposit(assets);
    }
    
    function convertToAssets(uint256 shares) external view returns (uint256) {
        return previewRedeem(shares);
    }
    
    function previewRedeem(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0) {
            return 0;
        } else {
            return shares * totalAssets_ / supply;
        }
    }

    // ========== 总资产函数 / Total Assets Function ==========
    
    function totalAssets() public view returns (uint256) {
        return asset.balanceOf(address(this));
    }

    // ========== 投资策略函数 / Investment Strategy Functions ==========
    
    /**
     * @dev 执行投资策略 - 通过AI Agent调用
     * @dev Execute investment strategy - called by AI Agent
     */
    function executeInvestment(address token, uint256 amount) external onlyStrategyManager {
        require(amount > 0, "Invalid amount");
        require(amount <= totalAssets(), "Insufficient assets");
        
        // 这里将集成OKX DEX进行实际swap
        // Here will integrate OKX DEX for actual swap
        
        totalInvested += amount;
        
        emit InvestmentExecuted(token, amount, 0);
    }
    
    /**
     * @dev 分配收益 - 按份额比例分配给运动员和基金会
     * @dev Distribute profits - distribute to athletes and foundation by share ratio
     */
    function distributeProfits() external onlyStrategyManager {
        uint256 currentAssets = totalAssets();
        uint256 totalSupply_ = totalSupply();
        
        if (totalSupply_ == 0) {
            return;
        }
        
        // 计算收益 / Calculate profits
        uint256 profit = currentAssets > totalInvested ? currentAssets - totalInvested : 0;
        
        if (profit > 0) {
            totalProfits += profit;
            lastProfitDistribution = block.timestamp;
            
            // 计算分润 / Calculate profit sharing
            uint256 athleteShare = (profit * ATHLETE_SHARE) / SHARE_DENOMINATOR;
            uint256 foundationShare = profit - athleteShare;
            
            emit ProfitDistributed(profit, athleteShare, foundationShare);
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

    // ========== 重写函数 / Override Functions ==========
    
    function decimals() public view override returns (uint8) {
        return 18;
    }
} 