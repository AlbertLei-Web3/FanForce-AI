// FanForce AI Demo Prediction Contract / FanForce AI 预测Demo合约 2025-06-27
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
    event MatchDeleted(uint256 indexed matchId);
    event BetPlaced(uint256 indexed matchId, address indexed user, uint8 team, uint256 netAmount, uint256 fee);
    event RewardInjected(uint256 indexed matchId, uint256 amount);
    event MatchSettled(uint256 indexed matchId, uint8 result);
    event RewardClaimed(uint256 indexed matchId, address indexed user, uint256 principal, uint256 rewardShare, uint256 fee, uint256 finalAmount);
    event MatchReset(uint256 indexed matchId);
    event EmergencyWithdraw(address indexed admin, uint256 amount);

    // ========== 构造函数 / Constructor ==========
    constructor() {
        // 使用原生CHZ，无需代币地址参数 / Using native CHZ, no token address parameter needed
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

    // 删除比赛 / Delete a match
    function deleteMatch(uint256 matchId) external onlyAdmin {
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(m.totalA == 0 && m.totalB == 0, "Match has bets"); // 只能删除没有下注的比赛 / Can only delete matches without bets
        require(!m.settled, "Match already settled"); // 不能删除已结算的比赛 / Cannot delete settled matches
        
        // 从数组中移除 / Remove from array
        for (uint i = 0; i < matchIds.length; i++) {
            if (matchIds[i] == matchId) {
                matchIds[i] = matchIds[matchIds.length - 1];
                matchIds.pop();
                break;
            }
        }
        
        delete matches[matchId];
        emit MatchDeleted(matchId);
    }

    // 用户下注 / Place a bet
    function placeBet(uint256 matchId, uint8 team, uint256 amount) external payable nonReentrant {
        require(team == 1 || team == 2, "Invalid team");
        require(amount >= MIN_BET, "Bet too small");
        require(msg.value == amount, "Value mismatch"); // 确保发送的原生CHZ与amount匹配 / Ensure sent native CHZ matches amount
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(!m.settled, "Match settled");
        Bet storage b = m.bets[msg.sender];
        require(b.amount == 0, "Already bet");
        
        // 计算下注手续费 / Calculate betting fee
        uint256 betFee = (amount * PLATFORM_FEE_PERCENT) / 100;
        uint256 netAmount = amount - betFee;
        
        // 立即转账手续费给Admin / Immediately transfer fee to Admin
        if (betFee > 0) {
            (bool feeSuccess, ) = payable(ADMIN).call{value: betFee}("");
            require(feeSuccess, "Fee transfer failed");
        }
        
        // 记录净下注额 / Record net bet amount
        b.team = team;
        b.amount = netAmount; // 存储净下注额，不包含手续费 / Store net amount, excluding fee
        b.claimed = false;
        
        if (team == 1) {
            m.totalA += netAmount; // 统计净下注额 / Count net bet amount
        } else {
            m.totalB += netAmount;
        }
        
        emit BetPlaced(matchId, msg.sender, team, netAmount, betFee);
    }

    // 平台注入奖励池 / Inject platform reward pool
    function injectReward(uint256 matchId, uint256 amount) external payable onlyAdmin nonReentrant {
        Match storage m = matches[matchId];
        require(m.matchId != 0, "Match not exist");
        require(!m.rewardInjected, "Already injected");
        require(!m.settled, "Match settled");
        require(amount > 0, "Zero amount");
        require(msg.value == amount, "Value mismatch"); // 确保发送的原生CHZ与amount匹配 / Ensure sent native CHZ matches amount
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

        // 本金全额退还 / Principal fully returned
        uint256 principal = b.amount;
        uint256 rewardShare = 0;

        // 计算奖励池分配 / Calculate reward pool distribution
        if (b.team == m.result) {
            // 胜方分配70%奖励池 / Winner gets 70% of reward pool
            uint256 winShare = (m.rewardPool * WINNER_RATIO) / RATIO_BASE;
            uint256 totalWin = m.result == 1 ? m.totalA : m.totalB;
            if (totalWin > 0) { // 避免除以零 / Avoid division by zero
                rewardShare = (winShare * b.amount) / totalWin;
            }
        } else {
            // 败方分配30%奖励池 / Loser gets 30% of reward pool
            uint256 loseShare = (m.rewardPool * LOSER_RATIO) / RATIO_BASE;
            uint256 totalLose = m.result == 1 ? m.totalB : m.totalA;
            if (totalLose > 0) { // 避免除以零 / Avoid division by zero
                rewardShare = (loseShare * b.amount) / totalLose;
            }
        }

        // 计算领取前总额 / Calculate total before claiming fee
        uint256 totalBeforeFee = principal + rewardShare;
        
        // 计算领取手续费 / Calculate claiming fee
        uint256 claimFee = (totalBeforeFee * PLATFORM_FEE_PERCENT) / 100;
        uint256 finalAmount = totalBeforeFee - claimFee;

        // 转账手续费给Admin / Transfer fee to Admin
        if (claimFee > 0) {
            (bool feeSuccess, ) = payable(ADMIN).call{value: claimFee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        // 转账最终金额给用户 / Transfer final amount to user
        (bool rewardSuccess, ) = payable(msg.sender).call{value: finalAmount}("");
        require(rewardSuccess, "Reward transfer failed");
        
        emit RewardClaimed(matchId, msg.sender, principal, rewardShare, claimFee, finalAmount);
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
        uint256 bal = address(this).balance;
        require(bal > 0, "No funds");
        (bool success, ) = payable(ADMIN).call{value: bal}("");
        require(success, "Transfer failed");
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