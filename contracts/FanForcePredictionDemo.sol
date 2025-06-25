// FanForce AI Demo Prediction Contract / FanForce AI 预测Demo合约
// ---------------------------------------------
// 1. 适用于Chiliz链EVM环境
// 2. 管理员地址写死，便于演示
// 3. 支持多场比赛、下注、奖励池注入、结算、领奖、重置、紧急提取
// 4. 详细中英文注释，便于初学者理解
// 5. 事件日志、状态变量、nonReentrant防护

// 关联前端：placeBet、settleMatch、claimReward、resetMatch等按钮

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FanForcePredictionDemo is ReentrancyGuard {
    // ========== 配置参数 / Config Parameters ==========
    address public constant ADMIN = 0x0d87d8E1def9cA4A5f1BE181dc37c9ed9622c8d5; // 管理员地址 / Admin address
    IERC20 public immutable CHZ; // CHZ代币合约地址 / CHZ token contract
    uint256 public constant WINNER_RATIO = 70; // 胜方奖励比例 / Winner reward ratio (70%)
    uint256 public constant LOSER_RATIO = 30;  // 败方奖励比例 / Loser reward ratio (30%)
    uint256 public constant RATIO_BASE = 100;  // 比例基数 / Ratio base
    uint256 public constant MIN_BET = 1e18;    // 最小下注额（1 CHZ）/ Min bet (1 CHZ)
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 平台手续费 / Platform fee (5%)

    // ========== 数据结构 / Data Structures ==========
    struct Bet {
        uint8 team;         // 下注队伍 / Bet team (1 or 2)
        uint256 amount;     // 下注金额 / Bet amount
        bool claimed;       // 是否已领取奖励 / Claimed flag
    }

    struct Match {
        uint256 matchId;                // 比赛ID / Match ID
        uint256 totalA;                 // A队总下注 / Total bet on Team A
        uint256 totalB;                 // B队总下注 / Total bet on Team B
        uint256 rewardPool;             // 平台奖励池 / Platform reward pool
        uint8 result;                   // 0:未定, 1:A胜, 2:B胜 / 0:pending, 1:A win, 2:B win
        bool settled;                   // 是否已结算 / Settled flag
        bool rewardInjected;            // 奖励池是否注入 / Reward pool injected
        mapping(address => Bet) bets;   // 用户下注详情 / User bets
    }

    mapping(uint256 => Match) private matches; // 所有比赛 / All matches
    uint256[] public matchIds; // 比赛ID列表 / List of match IDs

    // ========== 事件日志 / Events ==========
    event MatchCreated(uint256 indexed matchId);
    event BetPlaced(uint256 indexed matchId, address indexed user, uint8 team, uint256 amount);
    event RewardInjected(uint256 indexed matchId, uint256 amount);
    event MatchSettled(uint256 indexed matchId, uint8 result);
    event RewardClaimed(uint256 indexed matchId, address indexed user, uint256 amount);
    event MatchReset(uint256 indexed matchId);
    event EmergencyWithdraw(address indexed admin, uint256 amount);

    // ========== 构造函数 / Constructor ==========
    constructor(address chzToken) {
        CHZ = IERC20(chzToken);
    }

    // ========== 修饰符 / Modifiers ==========
    modifier onlyAdmin() {
        require(msg.sender == ADMIN, "Only admin");
        _;
    }

    // ========== 主要函数 / Main Functions ==========

    // 创建新比赛 / Create a new match
    function createMatch(uint256 matchId) external onlyAdmin {
        require(matches[matchId].matchId == 0, "Match exists");
        Match storage m = matches[matchId];
        m.matchId = matchId;
        matchIds.push(matchId);
        emit MatchCreated(matchId);
    }

    // 用户下注 / Place a bet
    function placeBet(uint256 matchId, uint8 team, uint256 amount) external nonReentrant {
        require(team == 1 || team == 2, "Invalid team");
        require(amount >= MIN_BET, "Bet too small");
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(!m.settled, "Match settled");
        Bet storage b = m.bets[msg.sender];
        require(b.amount == 0, "Already bet");
        // 转账 / Transfer CHZ
        require(CHZ.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        // 记录下注 / Record bet
        b.team = team;
        b.amount = amount;
        b.claimed = false;
        if (team == 1) {
            m.totalA += amount;
        } else {
            m.totalB += amount;
        }
        emit BetPlaced(matchId, msg.sender, team, amount);
    }

    // 平台注入奖励池 / Inject platform reward pool
    function injectReward(uint256 matchId, uint256 amount) external onlyAdmin nonReentrant {
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(!m.rewardInjected, "Already injected");
        require(!m.settled, "Match settled");
        require(amount > 0, "Zero amount");
        require(CHZ.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        m.rewardPool = amount;
        m.rewardInjected = true;
        emit RewardInjected(matchId, amount);
    }

    // 管理员结算比赛 / Settle match and distribute rewards
    function settleMatch(uint256 matchId, uint8 result) external onlyAdmin {
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(!m.settled, "Already settled");
        require(m.rewardInjected, "Reward not injected");
        require(result == 1 || result == 2, "Invalid result");
        m.result = result;
        m.settled = true;
        emit MatchSettled(matchId, result);
    }

    // 用户领取奖励 / Claim reward
    function claimReward(uint256 matchId) external nonReentrant {
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(m.settled, "Not settled");
        Bet storage b = m.bets[msg.sender];
        require(b.amount > 0, "No bet");
        require(!b.claimed, "Already claimed");
        b.claimed = true;

        // 计算总奖励 / Calculate total reward
        uint256 totalReward = b.amount;
        if (b.team == m.result) {
            // 胜方 / Winner
            uint256 winShare = (m.rewardPool * WINNER_RATIO) / RATIO_BASE;
            uint256 totalWin = m.result == 1 ? m.totalA : m.totalB;
            if (totalWin > 0) { // 避免除以零 / Avoid division by zero
                totalReward += (winShare * b.amount) / totalWin;
            }
        } else {
            // 败方 / Loser
            uint256 loseShare = (m.rewardPool * LOSER_RATIO) / RATIO_BASE;
            uint256 totalLose = m.result == 1 ? m.totalB : m.totalA;
            if (totalLose > 0) { // 避免除以零 / Avoid division by zero
                totalReward += (loseShare * b.amount) / totalLose;
            }
        }

        // 计算并转账平台手续费 / Calculate and transfer platform fee
        uint256 platformFee = (totalReward * PLATFORM_FEE_PERCENT) / RATIO_BASE;
        uint256 userReward = totalReward - platformFee;

        // 转账手续费给平台 / Transfer fee to platform (ADMIN)
        if (platformFee > 0) {
            require(CHZ.transfer(ADMIN, platformFee), "Fee transfer failed");
        }

        // 转账净奖励给用户 / Transfer net reward to user
        require(CHZ.transfer(msg.sender, userReward), "Reward transfer failed");
        
        emit RewardClaimed(matchId, msg.sender, userReward);
    }

    // 管理员重置比赛 / Reset match
    function resetMatch(uint256 matchId) external onlyAdmin {
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(m.settled, "Not settled");
        // 清空主要字段 / Reset main fields
        m.totalA = 0;
        m.totalB = 0;
        m.rewardPool = 0;
        m.result = 0;
        m.settled = false;
        m.rewardInjected = false;
        // 用户下注数据不清空，便于演示（如需清空可遍历）
        emit MatchReset(matchId);
    }

    // 紧急提取合约残余资金 / Emergency withdraw
    function emergencyWithdraw() external onlyAdmin nonReentrant {
        uint256 bal = CHZ.balanceOf(address(this));
        require(bal > 0, "No funds");
        require(CHZ.transfer(ADMIN, bal), "Transfer failed");
        emit EmergencyWithdraw(ADMIN, bal);
    }

    // ========== 只读函数 / View Functions ==========
    function getMatch(uint256 matchId) external view returns (
        uint256, uint256, uint256, uint256, uint8, bool, bool
    ) {
        Match storage m = matches[matchId];
        return (
            m.matchId,
            m.totalA,
            m.totalB,
            m.rewardPool,
            m.result,
            m.settled,
            m.rewardInjected
        );
    }

    function getUserBet(uint256 matchId, address user) external view returns (
        uint8, uint256, bool
    ) {
        Bet storage b = matches[matchId].bets[user];
        return (b.team, b.amount, b.claimed);
    }
} 