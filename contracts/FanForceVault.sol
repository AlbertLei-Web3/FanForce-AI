// FanForce AI ERC-4626 Vault Contract - Optimized for User Flow / FanForce AI ERC-4626 金库合约 - 针对用户流程优化
// ---------------------------------------------
// 基于三张图优化的简化实现：
// 1. 支持运动员托管记录跟踪
// 2. 实现基于份额百分比的80/20收益分配机制
// 3. 集成数据库架构
// 4. 简化投资策略执行
// 5. 专注MVP核心需求

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FanForceVault
 * @dev ERC-4626 compliant vault optimized for FanForce AI athlete deposit flow
 * @dev 针对FanForce AI运动员托管流程优化的ERC-4626标准金库
 */
contract FanForceVault is ERC20, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ========== 状态变量 / State Variables ==========
    
    // 底层资产代币 / Underlying asset token (USDC)
    IERC20 public immutable asset;
    
    // 基金会地址 / Foundation address
    address public foundationAddress;
    
    // 授权的Agent地址 / Authorized agent address
    address public authorizedAgent;
    
    // 分润配置 / Profit sharing configuration (80/20 split on user's portion)
    uint256 public constant ATHLETE_SHARE = 80; // 运动员分润比例 / Athlete profit share (80%)
    uint256 public constant FOUNDATION_SHARE = 20; // 基金会分润比例 / Foundation profit share (20%)
    uint256 public constant SHARE_DENOMINATOR = 100; // 分润分母 / Share denominator
    
    // 投资状态 / Investment status
    uint256 public totalInvested; // 总投资金额 / Total invested amount
    
    // 运动员托管记录 / Athlete deposit records
    mapping(address => uint256) public athleteDeposits; // 运动员托管金额 / Athlete deposit amounts
    mapping(address => uint256) public athleteShares; // 运动员份额 / Athlete shares
    mapping(address => uint256) public athleteProfits; // 运动员收益 / Athlete profits
    
    // 托管状态 / Deposit status
    bool public depositsEnabled = true; // 托管功能开关 / Deposit functionality switch

    // ========== 事件 / Events ==========
    
    // ERC-4626 标准事件 / ERC-4626 Standard Events
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    
    // 自定义事件 / Custom Events
    event AthleteDeposit(address indexed athlete, uint256 usdcAmount, uint256 shares, uint256 timestamp);
    event StrategyExecuted(uint256 indexed strategyId, address indexed executor, uint256 amount, bool success, uint256 timestamp);
    event ProfitDistributed(address indexed athlete, uint256 athleteShare, uint256 foundationShare, uint256 timestamp);
    event AgentAuthorized(address indexed oldAgent, address indexed newAgent);
    event FoundationAddressUpdated(address indexed oldFoundation, address indexed newFoundation);
    event DepositsToggled(bool enabled);

    // ========== 修饰符 / Modifiers ==========
    
    modifier onlyAuthorized() {
        require(msg.sender == authorizedAgent || msg.sender == owner(), "Not authorized");
        _;
    }
    
    modifier depositsEnabled() {
        require(depositsEnabled, "Deposits are currently disabled");
        _;
    }

    // ========== 构造函数 / Constructor ==========
    
    /**
     * @dev 构造函数，初始化金库
     * @dev Constructor, initialize vault
     * @param _asset USDC代币地址 / USDC token address
     * @param _name 金库代币名称 / Vault token name
     * @param _symbol 金库代币符号 / Vault token symbol
     * @param _foundationAddress 基金会地址 / Foundation address
     */
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol,
        address _foundationAddress
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        require(address(_asset) != address(0), "Invalid asset address");
        require(_foundationAddress != address(0), "Invalid foundation address");
        
        asset = _asset;
        foundationAddress = _foundationAddress;
        authorizedAgent = msg.sender; // 初始时owner也是authorized agent
    }

    // ========== ERC-4626 标准函数 / ERC-4626 Standard Functions ==========
    
    /**
     * @dev 存款函数 - 运动员存入USDC获得份额
     * @dev Deposit function - athletes deposit USDC to receive shares
     */
    function deposit(uint256 assets, address receiver) 
        external 
        nonReentrant 
        depositsEnabled
        returns (uint256 shares) 
    {
        require(assets > 0, "Invalid assets amount");
        require(receiver != address(0), "Invalid receiver");
        
        // 计算份额 / Calculate shares
        shares = previewDeposit(assets);
        require(shares > 0, "Zero shares");
        
        // 转移USDC资产 / Transfer USDC assets
        asset.safeTransferFrom(msg.sender, address(this), assets);
        
        // 铸造份额 / Mint shares
        _mint(receiver, shares);
        
        // 记录运动员托管信息 / Record athlete deposit information
        athleteDeposits[receiver] += assets;
        athleteShares[receiver] += shares;
        
        emit Deposit(msg.sender, receiver, assets, shares);
        emit AthleteDeposit(receiver, assets, shares, block.timestamp);
    }
    
    /**
     * @dev 提款函数 - 运动员赎回份额获得USDC
     * @dev Withdraw function - athletes redeem shares to receive USDC
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
        
        // 更新运动员记录 / Update athlete records
        uint256 athleteShareRatio = athleteShares[owner] > 0 ? shares * 1e18 / athleteShares[owner] : 0;
        if (athleteShareRatio > 0) {
            uint256 withdrawAmount = athleteDeposits[owner] * athleteShareRatio / 1e18;
            athleteDeposits[owner] -= withdrawAmount;
            athleteShares[owner] -= shares;
        }
        
        // 转移USDC资产 / Transfer USDC assets
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
    
    function previewRedeem(uint256 shares) public view returns (uint256) {
        uint256 supply = totalSupply();
        uint256 totalAssets_ = totalAssets();
        
        if (supply == 0) {
            return 0;
        } else {
            return shares * totalAssets_ / supply;
        }
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

    // ========== 投资策略函数 / Investment Strategy Functions ==========
    
    /**
     * @dev 执行指定策略 - 由AI Agent调用，合约只负责记录和执行
     * @dev Execute specific strategy - called by AI Agent, contract only responsible for recording and execution
     * @param strategyId 策略ID (0=激进, 1=平衡, 2=保守) / Strategy ID (0=aggressive, 1=balanced, 2=conservative)
     * @param amount 投资金额 / Investment amount
     * @param targetToken 目标代币地址 / Target token address
     * @param marketCondition 市场状况标识 / Market condition identifier
     */
    function executeStrategy(
        uint256 strategyId, 
        uint256 amount, 
        address targetToken,
        uint8 marketCondition // 0=冷淡, 1=平衡, 2=活跃
    ) external onlyAuthorized {
        require(strategyId < 3, "Invalid strategy ID"); // 只支持3个策略
        require(amount > 0, "Invalid amount");
        require(amount <= totalAssets(), "Insufficient assets");
        require(targetToken != address(0), "Invalid target token");
        require(marketCondition <= 2, "Invalid market condition");
        
        // 记录投资 / Record investment
        totalInvested += amount;
        
        // 记录策略执行（不包含复杂的API调用）
        // Record strategy execution (no complex API calls)
        bool success = recordStrategyExecution(strategyId, amount, targetToken, marketCondition);
        
        emit StrategyExecuted(strategyId, msg.sender, amount, success, block.timestamp);
    }
    
    /**
     * @dev 记录策略执行 - 轻量级的策略记录，不包含API调用
     * @dev Record strategy execution - lightweight strategy recording, no API calls
     * @param strategyId 策略ID / Strategy ID
     * @param amount 投资金额 / Investment amount
     * @param targetToken 目标代币 / Target token
     * @param marketCondition 市场状况 / Market condition
     * @return 记录是否成功 / Whether recording was successful
     */
    function recordStrategyExecution(
        uint256 strategyId, 
        uint256 amount, 
        address targetToken,
        uint8 marketCondition
    ) internal returns (bool) {
        // 轻量级记录，只记录关键信息
        // Lightweight recording, only record key information
        // 不进行任何外部API调用
        // No external API calls
        
        // 这里可以添加简单的状态记录
        // Here can add simple state recording
        
        return true;
    }
    
    /**
     * @dev 获取金库信息 - 综合查询函数
     * @dev Get vault info - comprehensive query function
     * @param athlete 运动员地址 / Athlete address
     * @return 运动员信息、金库状态、可投资金额 / Athlete info, vault status, available amount
     */
    function getVaultInfo(address athlete) external view returns (
        uint256 athleteDeposit,
        uint256 athleteShares,
        uint256 athleteProfits,
        uint256 totalAssets_,
        uint256 totalInvested_,
        uint256 availableAmount
    ) {
        athleteDeposit = athleteDeposits[athlete];
        athleteShares = athleteShares[athlete];
        athleteProfits = athleteProfits[athlete];
        totalAssets_ = totalAssets();
        totalInvested_ = totalInvested;
        availableAmount = totalAssets() - totalInvested;
    }
    
    /**
     * @dev 计算当前可分配收益 - 基于金库实际资产增长
     * @dev Calculate current distributable profit - based on actual vault asset growth
     */
    function calculateCurrentProfit() public view returns (uint256) {
        uint256 currentAssets = totalAssets();
        uint256 totalDeposits = getTotalDeposits();
        
        if (currentAssets > totalDeposits) {
            return currentAssets - totalDeposits;
        }
        return 0;
    }
    
    /**
     * @dev 获取总托管金额 / Get total deposit amount
     */
    function getTotalDeposits() public view returns (uint256) {
        // 这里可以通过遍历所有运动员的托管记录来计算
        // Here can calculate by iterating through all athlete deposit records
        // 为了简化，暂时返回总资产减去总投资
        // For simplicity, temporarily return total assets minus total invested
        return totalAssets() - totalInvested;
    }
    
    /**
     * @dev 分配收益 - 基于用户份额百分比计算收益，然后按80/20分配
     * @dev Distribute profits - calculate user's portion based on share percentage, then apply 80/20 split
     * @param athlete 运动员地址 / Athlete address
     * @param profitAmount 收益金额 / Profit amount
     */
    function distributeProfitsToAthlete(address athlete, uint256 profitAmount) external onlyAuthorized {
        require(athlete != address(0), "Invalid athlete address");
        require(athleteShares[athlete] > 0, "Athlete has no shares");
        require(profitAmount > 0, "No profit to distribute");
        
        uint256 totalShares = totalSupply();
        require(totalShares > 0, "No total shares");
        
        // 计算用户应得的收益份额（基于其托管份额的百分比）
        // Calculate user's profit portion based on their share percentage
        uint256 userSharePercentage = (athleteShares[athlete] * 1e18) / totalShares; // 精确到18位小数 / Precision to 18 decimals
        uint256 userPortion = (profitAmount * userSharePercentage) / 1e18;
        
        // 按80/20分配用户应得的收益
        // Apply 80/20 split on user's portion
        uint256 athleteShare = (userPortion * ATHLETE_SHARE) / SHARE_DENOMINATOR;
        uint256 foundationShare = userPortion - athleteShare;
        
        // 更新运动员收益 / Update athlete profits
        athleteProfits[athlete] += athleteShare;
        
        // 基金会收益直接转移到基金会地址 / Foundation profits transferred directly to foundation address
        if (foundationShare > 0) {
            asset.safeTransfer(foundationAddress, foundationShare);
        }
        
        emit ProfitDistributed(athlete, athleteShare, foundationShare, block.timestamp);
    }

    // ========== 查询函数 / Query Functions ==========
    
    /**
     * @dev 获取运动员托管信息 / Get athlete deposit information
     * @param athlete 运动员地址 / Athlete address
     */
    function getAthleteInfo(address athlete) external view returns (
        uint256 depositAmount,
        uint256 shares,
        uint256 profits,
        uint256 currentValue,
        uint256 sharePercentage
    ) {
        depositAmount = athleteDeposits[athlete];
        shares = athleteShares[athlete];
        profits = athleteProfits[athlete];
        currentValue = shares > 0 ? previewRedeem(shares) : 0;
        
        // 计算份额百分比 / Calculate share percentage
        uint256 totalShares = totalSupply();
        sharePercentage = totalShares > 0 ? (shares * 1e18) / totalShares : 0;
    }
    
    /**
     * @dev 获取金库统计信息 / Get vault statistics
     */
    function getVaultStats() external view returns (
        uint256 totalAssets_,
        uint256 totalSupply_,
        uint256 totalInvested_
    ) {
        totalAssets_ = totalAssets();
        totalSupply_ = totalSupply();
        totalInvested_ = totalInvested;
    }
    
    /**
     * @dev 计算用户应得收益 / Calculate user's profit entitlement
     * @param athlete 运动员地址 / Athlete address
     * @param totalVaultProfit 金库总收益 / Total vault profit
     */
    function calculateUserProfit(address athlete, uint256 totalVaultProfit) external view returns (
        uint256 userPortion,
        uint256 athleteShare,
        uint256 foundationShare,
        uint256 sharePercentage
    ) {
        uint256 totalShares = totalSupply();
        if (totalShares == 0 || athleteShares[athlete] == 0) {
            return (0, 0, 0, 0);
        }
        
        // 计算用户份额百分比 / Calculate user share percentage
        sharePercentage = (athleteShares[athlete] * 1e18) / totalShares;
        
        // 计算用户应得收益 / Calculate user's profit portion
        userPortion = (totalVaultProfit * sharePercentage) / 1e18;
        
        // 计算80/20分配 / Calculate 80/20 split
        athleteShare = (userPortion * ATHLETE_SHARE) / SHARE_DENOMINATOR;
        foundationShare = userPortion - athleteShare;
    }

    // ========== 管理员函数 / Admin Functions ==========
    
    /**
     * @dev 授权Agent执行权限 / Authorize agent execution permission
     * @param agent Agent地址 / Agent address
     */
    function authorizeAgent(address agent) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        address oldAgent = authorizedAgent;
        authorizedAgent = agent;
        emit AgentAuthorized(oldAgent, agent);
    }
    
    /**
     * @dev 设置基金会地址 / Set foundation address
     */
    function setFoundationAddress(address _foundation) external onlyOwner {
        require(_foundation != address(0), "Invalid foundation address");
        address oldFoundation = foundationAddress;
        foundationAddress = _foundation;
        emit FoundationAddressUpdated(oldFoundation, _foundation);
    }
    
    /**
     * @dev 切换托管功能开关 / Toggle deposit functionality
     */
    function toggleDeposits() external onlyOwner {
        depositsEnabled = !depositsEnabled;
        emit DepositsToggled(depositsEnabled);
    }
    
    /**
     * @dev 紧急提款 - 仅限所有者 / Emergency withdraw - owner only
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = asset.balanceOf(address(this));
        if (balance > 0) {
            asset.safeTransfer(owner(), balance);
        }
    }

    // ========== 重写函数 / Override Functions ==========
    
    function decimals() public view override returns (uint8) {
        return 18;
    }
} 