// Mock USDC Token for Testing / 测试用模拟USDC代币
// ---------------------------------------------
// 1. 模拟USDC代币功能
// 2. 支持铸造功能用于测试
// 3. 符合ERC-20标准
// 4. 6位小数精度

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing purposes
 * @dev 用于测试的模拟USDC代币
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private _decimals;

    /**
     * @dev 构造函数
     * @dev Constructor
     * @param name 代币名称 / Token name
     * @param symbol 代币符号 / Token symbol
     * @param decimals_ 小数位数 / Decimal places
     */
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _decimals = decimals_;
    }

    /**
     * @dev 铸造代币（仅所有者）
     * @dev Mint tokens (owner only)
     * @param to 接收地址 / Recipient address
     * @param amount 铸造数量 / Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev 销毁代币
     * @dev Burn tokens
     * @param amount 销毁数量 / Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev 重写小数位数
     * @dev Override decimals
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
} 