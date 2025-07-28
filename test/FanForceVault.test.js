// FanForce Vault Test Suite / FanForce 金库测试套件
// ---------------------------------------------
// 1. 测试ERC-4626标准功能
// 2. 测试存款、提款、铸造、赎回功能
// 3. 测试费用计算和权限控制
// 4. 测试紧急模式和策略管理

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FanForceVault", function () {
    let vault;
    let usdc;
    let owner;
    let user1;
    let user2;
    let strategyManager;
    
    // 测试常量 / Test constants
    const VAULT_NAME = "FanForce AI Vault";
    const VAULT_SYMBOL = "ffVAULT";
    const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDC
    const DEPOSIT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDC
    const MINT_AMOUNT = ethers.parseUnits("1000", 18); // 1000 shares

    beforeEach(async function () {
        // 获取账户 / Get accounts
        [owner, user1, user2, strategyManager] = await ethers.getSigners();

        // 部署模拟USDC代币 / Deploy mock USDC token
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        usdc = await MockUSDC.deploy("USD Coin", "USDC", 6);
        await usdc.waitForDeployment();

        // 部署FanForceVault / Deploy FanForceVault
        const FanForceVault = await ethers.getContractFactory("FanForceVault");
        vault = await FanForceVault.deploy(await usdc.getAddress(), VAULT_NAME, VAULT_SYMBOL);
        await vault.waitForDeployment();

        // 铸造USDC给测试账户 / Mint USDC to test accounts
        await usdc.mint(owner.address, INITIAL_SUPPLY);
        await usdc.mint(user1.address, INITIAL_SUPPLY);
        await usdc.mint(user2.address, INITIAL_SUPPLY);

        // 设置策略管理器 / Set strategy manager
        await vault.setStrategyManager(strategyManager.address);
    });

    describe("Deployment", function () {
        it("Should deploy with correct parameters", async function () {
            // 验证合约参数 / Verify contract parameters
            expect(await vault.name()).to.equal(VAULT_NAME);
            expect(await vault.symbol()).to.equal(VAULT_SYMBOL);
            expect(await vault.decimals()).to.equal(18);
            expect(await vault.asset()).to.equal(await usdc.getAddress());
            expect(await vault.owner()).to.equal(owner.address);
            expect(await vault.strategyManager()).to.equal(strategyManager.address);
        });

        it("Should have correct initial state", async function () {
            // 验证初始状态 / Verify initial state
            expect(await vault.totalAssets()).to.equal(0);
            expect(await vault.totalSupply()).to.equal(0);
            expect(await vault.autoInvestEnabled()).to.equal(true);
            expect(await vault.emergencyMode()).to.equal(false);
        });
    });

    describe("ERC-4626 Standard Functions", function () {
        describe("Deposit", function () {
            beforeEach(async function () {
                // 授权USDC给金库 / Approve USDC to vault
                await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            });

            it("Should deposit assets and mint shares", async function () {
                const initialBalance = await usdc.balanceOf(user1.address);
                const initialShares = await vault.balanceOf(user1.address);

                // 执行存款 / Execute deposit
                const tx = await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
                const receipt = await tx.wait();

                // 验证结果 / Verify results
                expect(await usdc.balanceOf(user1.address)).to.equal(initialBalance - DEPOSIT_AMOUNT);
                expect(await vault.balanceOf(user1.address)).to.be.gt(initialShares);
                expect(await vault.totalAssets()).to.equal(DEPOSIT_AMOUNT);
                expect(await vault.totalSupply()).to.be.gt(0);

                // 验证事件 / Verify events
                const depositEvent = receipt.logs.find(log => 
                    log.fragment && log.fragment.name === "Deposit"
                );
                expect(depositEvent).to.not.be.undefined;
            });

            it("Should calculate shares correctly on first deposit", async function () {
                const shares = await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
                expect(shares).to.equal(DEPOSIT_AMOUNT); // 首次存款1:1比例 / First deposit 1:1 ratio
            });

            it("Should revert with zero amount", async function () {
                await expect(
                    vault.connect(user1).deposit(0, user1.address)
                ).to.be.revertedWith("Invalid assets amount");
            });

            it("Should revert with invalid receiver", async function () {
                await expect(
                    vault.connect(user1).deposit(DEPOSIT_AMOUNT, ethers.ZeroAddress)
                ).to.be.revertedWith("Invalid receiver");
            });
        });

        describe("Mint", function () {
            beforeEach(async function () {
                // 先存款一些资产 / Deposit some assets first
                await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
                await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            });

            it("Should mint shares for assets", async function () {
                const mintAmount = ethers.parseUnits("500", 18); // 500 shares
                const requiredAssets = await vault.previewMint(mintAmount);
                
                await usdc.connect(user2).approve(await vault.getAddress(), requiredAssets);
                
                const tx = await vault.connect(user2).mint(mintAmount, user2.address);
                const receipt = await tx.wait();

                expect(await vault.balanceOf(user2.address)).to.equal(mintAmount);
                expect(await vault.totalSupply()).to.be.gt(mintAmount);

                // 验证事件 / Verify events
                const depositEvent = receipt.logs.find(log => 
                    log.fragment && log.fragment.name === "Deposit"
                );
                expect(depositEvent).to.not.be.undefined;
            });
        });

        describe("Withdraw", function () {
            beforeEach(async function () {
                // 存款资产 / Deposit assets
                await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
                await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            });

            it("Should withdraw assets for shares", async function () {
                const withdrawAmount = ethers.parseUnits("500", 6); // 500 USDC
                const initialBalance = await usdc.balanceOf(user1.address);
                const initialShares = await vault.balanceOf(user1.address);

                const tx = await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);
                const receipt = await tx.wait();

                expect(await usdc.balanceOf(user1.address)).to.be.gt(initialBalance);
                expect(await vault.balanceOf(user1.address)).to.be.lt(initialShares);

                // 验证事件 / Verify events
                const withdrawEvent = receipt.logs.find(log => 
                    log.fragment && log.fragment.name === "Withdraw"
                );
                expect(withdrawEvent).to.not.be.undefined;
            });

            it("Should revert with insufficient shares", async function () {
                const largeAmount = ethers.parseUnits("10000", 6); // 10K USDC
                await expect(
                    vault.connect(user1).withdraw(largeAmount, user1.address, user1.address)
                ).to.be.revertedWith("Insufficient shares");
            });
        });

        describe("Redeem", function () {
            beforeEach(async function () {
                // 存款资产 / Deposit assets
                await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
                await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            });

            it("Should redeem shares for assets", async function () {
                const redeemShares = ethers.parseUnits("500", 18); // 500 shares
                const initialBalance = await usdc.balanceOf(user1.address);
                const initialShares = await vault.balanceOf(user1.address);

                const tx = await vault.connect(user1).redeem(redeemShares, user1.address, user1.address);
                const receipt = await tx.wait();

                expect(await usdc.balanceOf(user1.address)).to.be.gt(initialBalance);
                expect(await vault.balanceOf(user1.address)).to.equal(initialShares - redeemShares);

                // 验证事件 / Verify events
                const withdrawEvent = receipt.logs.find(log => 
                    log.fragment && log.fragment.name === "Withdraw"
                );
                expect(withdrawEvent).to.not.be.undefined;
            });
        });
    });

    describe("Preview Functions", function () {
        beforeEach(async function () {
            // 存款资产 / Deposit assets
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
        });

        it("Should calculate previewDeposit correctly", async function () {
            const assets = ethers.parseUnits("100", 6);
            const shares = await vault.previewDeposit(assets);
            expect(shares).to.be.gt(0);
        });

        it("Should calculate previewMint correctly", async function () {
            const shares = ethers.parseUnits("100", 18);
            const assets = await vault.previewMint(shares);
            expect(assets).to.be.gt(0);
        });

        it("Should calculate previewWithdraw correctly", async function () {
            const assets = ethers.parseUnits("100", 6);
            const shares = await vault.previewWithdraw(assets);
            expect(shares).to.be.gt(0);
        });

        it("Should calculate previewRedeem correctly", async function () {
            const shares = ethers.parseUnits("100", 18);
            const assets = await vault.previewRedeem(shares);
            expect(assets).to.be.gt(0);
        });
    });

    describe("Fee System", function () {
        beforeEach(async function () {
            // 设置费用 / Set fees
            await vault.setFeeStructure(100, 50, 2000); // 1% deposit, 0.5% withdrawal, 20% performance
        });

        it("Should collect deposit fees", async function () {
            const depositAmount = ethers.parseUnits("1000", 6);
            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            
            const initialOwnerBalance = await usdc.balanceOf(owner.address);
            await vault.connect(user1).deposit(depositAmount, user1.address);
            
            const finalOwnerBalance = await usdc.balanceOf(owner.address);
            expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
        });

        it("Should collect withdrawal fees", async function () {
            // 先存款 / Deposit first
            const depositAmount = ethers.parseUnits("1000", 6);
            await usdc.connect(user1).approve(await vault.getAddress(), depositAmount);
            await vault.connect(user1).deposit(depositAmount, user1.address);
            
            // 再提款 / Then withdraw
            const withdrawAmount = ethers.parseUnits("500", 6);
            const initialOwnerBalance = await usdc.balanceOf(owner.address);
            await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);
            
            const finalOwnerBalance = await usdc.balanceOf(owner.address);
            expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
        });
    });

    describe("Emergency Mode", function () {
        beforeEach(async function () {
            // 存款资产 / Deposit assets
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
        });

        it("Should enable emergency mode", async function () {
            await vault.toggleEmergencyMode();
            expect(await vault.emergencyMode()).to.equal(true);
        });

        it("Should prevent deposits in emergency mode", async function () {
            await vault.toggleEmergencyMode();
            
            await usdc.connect(user2).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await expect(
                vault.connect(user2).deposit(DEPOSIT_AMOUNT, user2.address)
            ).to.be.revertedWith("Emergency mode active");
        });

        it("Should allow withdrawals with emergency fee", async function () {
            await vault.toggleEmergencyMode();
            
            const withdrawAmount = ethers.parseUnits("500", 6);
            const initialOwnerBalance = await usdc.balanceOf(owner.address);
            await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);
            
            const finalOwnerBalance = await usdc.balanceOf(owner.address);
            expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
        });
    });

    describe("Strategy Management", function () {
        it("Should allow strategy manager to invest", async function () {
            // 存款资产 / Deposit assets
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            
            const investAmount = ethers.parseUnits("500", 6);
            const tx = await vault.connect(strategyManager).strategyInvest(investAmount);
            const receipt = await tx.wait();
            
            // 验证事件 / Verify events
            const investEvent = receipt.logs.find(log => 
                log.fragment && log.fragment.name === "StrategyInvestment"
            );
            expect(investEvent).to.not.be.undefined;
        });

        it("Should prevent non-strategy manager from investing", async function () {
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            
            const investAmount = ethers.parseUnits("500", 6);
            await expect(
                vault.connect(user1).strategyInvest(investAmount)
            ).to.be.revertedWith("Only strategy manager or owner");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set strategy manager", async function () {
            await vault.setStrategyManager(user1.address);
            expect(await vault.strategyManager()).to.equal(user1.address);
        });

        it("Should prevent non-owner from setting strategy manager", async function () {
            await expect(
                vault.connect(user1).setStrategyManager(user2.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow owner to toggle auto-invest", async function () {
            await vault.toggleAutoInvest();
            expect(await vault.autoInvestEnabled()).to.equal(false);
            
            await vault.toggleAutoInvest();
            expect(await vault.autoInvestEnabled()).to.equal(true);
        });

        it("Should allow owner to set fee structure", async function () {
            await vault.setFeeStructure(200, 100, 3000);
            expect(await vault.depositFee()).to.equal(200);
            expect(await vault.withdrawalFee()).to.equal(100);
            expect(await vault.performanceFee()).to.equal(3000);
        });

        it("Should prevent setting fees too high", async function () {
            await expect(
                vault.setFeeStructure(1500, 100, 3000) // 15% deposit fee
            ).to.be.revertedWith("Deposit fee too high");
        });
    });

    describe("Pausable", function () {
        it("Should pause and unpause", async function () {
            await vault.pause();
            expect(await vault.paused()).to.equal(true);
            
            await vault.unpause();
            expect(await vault.paused()).to.equal(false);
        });

        it("Should prevent deposits when paused", async function () {
            await vault.pause();
            
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await expect(
                vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address)
            ).to.be.revertedWith("Pausable: paused");
        });
    });

    describe("Safety Functions", function () {
        it("Should check vault health correctly", async function () {
            // 初始状态应该是健康的 / Initial state should be healthy
            expect(await vault.isHealthy()).to.equal(true);
            
            // 存款后应该保持健康 / Should remain healthy after deposit
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            expect(await vault.isHealthy()).to.equal(true);
        });

        it("Should get vault status correctly", async function () {
            const status = await vault.getVaultStatus();
            
            expect(status.totalAssets_).to.equal(0);
            expect(status.totalShares).to.equal(0);
            expect(status.valuePerShare).to.equal(0);
            expect(status.healthy).to.equal(true);
            expect(status.paused_).to.equal(false);
            expect(status.emergency).to.equal(false);
        });

        it("Should calculate value per share correctly after deposit", async function () {
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            
            const status = await vault.getVaultStatus();
            expect(status.totalAssets_).to.equal(DEPOSIT_AMOUNT);
            expect(status.totalShares).to.equal(DEPOSIT_AMOUNT);
            expect(status.valuePerShare).to.equal(ethers.parseUnits("1", 18)); // 1:1 ratio
            expect(status.healthy).to.equal(true);
        });
    });

    describe("Precision and Edge Cases", function () {
        it("Should handle small amounts correctly", async function () {
            const smallAmount = ethers.parseUnits("1", 6); // 1 USDC
            await usdc.connect(user1).approve(await vault.getAddress(), smallAmount);
            
            const shares = await vault.connect(user1).deposit(smallAmount, user1.address);
            expect(shares).to.equal(smallAmount);
        });

        it("Should handle multiple deposits correctly", async function () {
            const amount1 = ethers.parseUnits("100", 6);
            const amount2 = ethers.parseUnits("200", 6);
            
            await usdc.connect(user1).approve(await vault.getAddress(), amount1 + amount2);
            
            await vault.connect(user1).deposit(amount1, user1.address);
            await vault.connect(user1).deposit(amount2, user1.address);
            
            const totalShares = await vault.balanceOf(user1.address);
            expect(totalShares).to.equal(amount1 + amount2);
        });

        it("Should handle withdrawal with fees correctly", async function () {
            // 设置提款费 / Set withdrawal fee
            await vault.setFeeStructure(0, 100, 2000); // 1% withdrawal fee
            
            // 存款 / Deposit
            await usdc.connect(user1).approve(await vault.getAddress(), DEPOSIT_AMOUNT);
            await vault.connect(user1).deposit(DEPOSIT_AMOUNT, user1.address);
            
            // 提款 / Withdraw
            const withdrawAmount = ethers.parseUnits("500", 6);
            const initialBalance = await usdc.balanceOf(user1.address);
            await vault.connect(user1).withdraw(withdrawAmount, user1.address, user1.address);
            
            const finalBalance = await usdc.balanceOf(user1.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });
    });
}); 