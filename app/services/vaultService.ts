// 金库服务 - ERC-4626合约交互
// Vault Service - ERC-4626 Contract Interaction

import { ethers } from 'ethers';
import { VAULT_CONTRACT, getVaultContractAddress, USDC_TOKEN, getUSDCTokenAddress } from '../config/contracts';
import { walletService } from './walletService';

export interface VaultInfo {
  totalAssets: string;
  totalShares: string;
  userShares: string;
  userAssets: string;
  apy: string;
}

export interface DepositResult {
  success: boolean;
  transactionHash?: string;
  shares?: string;
  error?: string;
}

export interface WithdrawResult {
  success: boolean;
  transactionHash?: string;
  assets?: string;
  error?: string;
}

class VaultService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private vaultContract: ethers.Contract | null = null;
  private usdcContract: ethers.Contract | null = null;

  // 初始化服务
  async initialize(): Promise<boolean> {
    try {
      const walletInfo = walletService.getWalletInfo();
      if (!walletInfo?.isConnected) {
        throw new Error('Wallet not connected');
      }

      const { ethereum } = window as any;
      this.provider = new ethers.BrowserProvider(ethereum);
      this.signer = await this.provider.getSigner();

      const network = await this.provider.getNetwork();
      const chainId = network.chainId.toString();
      console.log('Current network chainId:', chainId);
      console.log('ChainId in hex:', `0x${parseInt(chainId).toString(16)}`);
      
      const vaultAddress = getVaultContractAddress(`0x${parseInt(chainId).toString(16)}`);
      const usdcAddress = getUSDCTokenAddress(`0x${parseInt(chainId).toString(16)}`);
      
      console.log('Vault address:', vaultAddress);
      console.log('USDC address:', usdcAddress);

      this.vaultContract = new ethers.Contract(vaultAddress, VAULT_CONTRACT.ABI, this.signer);
      this.usdcContract = new ethers.Contract(usdcAddress, USDC_TOKEN.ABI, this.signer);

      return true;
    } catch (error) {
      console.error('Vault service initialization failed:', error);
      return false;
    }
  }

  // 获取金库信息
  async getVaultInfo(): Promise<VaultInfo | null> {
    try {
      if (!this.vaultContract || !this.signer) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const address = await this.signer!.getAddress();
      const totalAssets = await this.vaultContract.totalAssets();
      const totalShares = await this.vaultContract.totalSupply();
      const userShares = await this.vaultContract.balanceOf(address);
      const userAssets = await this.vaultContract.convertToAssets(userShares);

      return {
        totalAssets: ethers.formatEther(totalAssets),
        totalShares: ethers.formatEther(totalShares),
        userShares: ethers.formatEther(userShares),
        userAssets: ethers.formatEther(userAssets),
        apy: '12.5' // 模拟APY，实际应该从合约或API获取
      };
    } catch (error) {
      console.error('Failed to get vault info:', error);
      return null;
    }
  }

  // 存款到金库
  async deposit(amount: number): Promise<DepositResult> {
    try {
      console.log('🚀 Starting deposit process...');
      console.log('Amount to deposit:', amount);
      
      if (!this.vaultContract || !this.usdcContract || !this.signer) {
        console.log('📡 Initializing vault service...');
        await this.initialize();
      }

      if (!this.vaultContract || !this.usdcContract) {
        throw new Error('Contracts not initialized');
      }

      const address = await this.signer!.getAddress();
      console.log('User address:', address);
      
      const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC有6位小数
      console.log('Amount in Wei:', amountWei.toString());

      // 检查USDC余额
      console.log('🔍 Checking USDC balance...');
      const balance = await this.usdcContract.balanceOf(address);
      console.log('USDC balance:', ethers.formatUnits(balance, 6));
      
      if (balance < amountWei) {
        throw new Error(`Insufficient USDC balance. Available: ${ethers.formatUnits(balance, 6)}, Required: ${amount}`);
      }

      // 检查授权
      console.log('🔍 Checking USDC allowance...');
      const allowance = await this.usdcContract.allowance(address, this.vaultContract.target);
      console.log('Current allowance:', ethers.formatUnits(allowance, 6));
      
      if (allowance < amountWei) {
        console.log('📝 Approving USDC transfer...');
        // 需要授权
        const approveTx = await this.usdcContract.approve(this.vaultContract.target, amountWei);
        console.log('Approval transaction hash:', approveTx.hash);
        await approveTx.wait();
        console.log('✅ USDC approval confirmed');
      }

      // 执行存款
      console.log('💰 Executing deposit...');
      const tx = await this.vaultContract.deposit(amountWei, address);
      console.log('Deposit transaction hash:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Deposit transaction confirmed');

      // 获取获得的份额
      const shares = await this.vaultContract.convertToShares(amountWei);
      console.log('Shares received:', ethers.formatEther(shares));

      return {
        success: true,
        transactionHash: receipt?.hash,
        shares: ethers.formatEther(shares)
      };
    } catch (error) {
      console.error('❌ Deposit failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 从金库提款（按资产数量）
  async withdraw(assets: number): Promise<WithdrawResult> {
    try {
      if (!this.vaultContract || !this.signer) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const address = await this.signer!.getAddress();
      const assetsWei = ethers.parseUnits(assets.toString(), 6); // USDC有6位小数

      // 检查用户份额是否足够
      const userShares = await this.vaultContract.balanceOf(address);
      const requiredShares = await this.vaultContract.previewWithdraw(assetsWei);
      if (userShares < requiredShares) {
        throw new Error('Insufficient shares');
      }

      // 执行提款
      const tx = await this.vaultContract.withdraw(assetsWei, address, address);
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt?.hash,
        assets: assets.toString()
      };
    } catch (error) {
      console.error('Withdraw failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 从金库赎回（按份额数量）
  async redeem(shares: number): Promise<WithdrawResult> {
    try {
      if (!this.vaultContract || !this.signer) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const address = await this.signer!.getAddress();
      const sharesWei = ethers.parseEther(shares.toString());

      // 检查用户份额
      const userShares = await this.vaultContract.balanceOf(address);
      if (userShares < sharesWei) {
        throw new Error('Insufficient shares');
      }

      // 执行赎回
      const tx = await this.vaultContract.redeem(sharesWei, address, address);
      const receipt = await tx.wait();

      // 获取获得的资产
      const assets = await this.vaultContract.convertToAssets(sharesWei);

      return {
        success: true,
        transactionHash: receipt?.hash,
        assets: ethers.formatUnits(assets, 6) // USDC有6位小数
      };
    } catch (error) {
      console.error('Redeem failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 获取USDC余额
  async getUSDCBalance(): Promise<string> {
    try {
      if (!this.usdcContract || !this.signer) {
        await this.initialize();
      }

      if (!this.usdcContract) {
        throw new Error('USDC contract not initialized');
      }

      const address = await this.signer!.getAddress();
      console.log('Checking USDC balance for address:', address);
      
      const balance = await this.usdcContract.balanceOf(address);
      console.log('Raw USDC balance:', balance.toString());
      
      const formattedBalance = ethers.formatUnits(balance, 6);
      console.log('Formatted USDC balance:', formattedBalance);
      
      return formattedBalance;
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
      return '0';
    }
  }

  // 预览存款
  async previewDeposit(amount: number): Promise<string> {
    try {
      if (!this.vaultContract) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const amountWei = ethers.parseUnits(amount.toString(), 6);
      const shares = await this.vaultContract.previewDeposit(amountWei);
      return ethers.formatEther(shares);
    } catch (error) {
      console.error('Failed to preview deposit:', error);
      return '0';
    }
  }

  // 预览提款（按资产数量）
  async previewWithdraw(assets: number): Promise<string> {
    try {
      if (!this.vaultContract) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const assetsWei = ethers.parseUnits(assets.toString(), 6);
      const shares = await this.vaultContract.previewWithdraw(assetsWei);
      return ethers.formatEther(shares);
    } catch (error) {
      console.error('Failed to preview withdraw:', error);
      return '0';
    }
  }

  // 预览赎回（按份额数量）
  async previewRedeem(shares: number): Promise<string> {
    try {
      if (!this.vaultContract) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const sharesWei = ethers.parseEther(shares.toString());
      const assets = await this.vaultContract.previewRedeem(sharesWei);
      return ethers.formatUnits(assets, 6);
    } catch (error) {
      console.error('Failed to preview redeem:', error);
      return '0';
    }
  }

  // 检查金库健康状态 - 简化版本，不调用不存在的函数
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.vaultContract) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      // 简化检查：只要能获取到总资产就认为健康
      const totalAssets = await this.vaultContract.totalAssets();
      console.log('Vault total assets:', ethers.formatUnits(totalAssets, 6));
      
      return true; // 简化版本，只要能调用就认为健康
    } catch (error) {
      console.error('Failed to check vault health:', error);
      return false;
    }
  }

  // 获取金库状态信息 - 简化版本
  async getVaultStatus(): Promise<{
    totalAssets: string;
    totalShares: string;
    valuePerShare: string;
    healthy: boolean;
    paused: boolean;
    emergency: boolean;
  } | null> {
    try {
      if (!this.vaultContract) {
        await this.initialize();
      }

      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const totalAssets = await this.vaultContract.totalAssets();
      const totalShares = await this.vaultContract.totalSupply();
      
      // 计算每股价值
      const valuePerShare = totalShares > 0 ? totalAssets * ethers.parseEther('1') / totalShares : ethers.parseEther('0');
      
      return {
        totalAssets: ethers.formatUnits(totalAssets, 6),
        totalShares: ethers.formatEther(totalShares),
        valuePerShare: ethers.formatEther(valuePerShare),
        healthy: true, // 简化版本
        paused: false, // 简化版本
        emergency: false // 简化版本
      };
    } catch (error) {
      console.error('Failed to get vault status:', error);
      return null;
    }
  }

  // 获取费用信息 - 简化版本
  async getFeeInfo(): Promise<{
    depositFee: string;
    withdrawalFee: string;
    performanceFee: string;
  } | null> {
    try {
      // 简化版本，返回固定费用
      return {
        depositFee: '0%',
        withdrawalFee: '0%',
        performanceFee: '0%'
      };
    } catch (error) {
      console.error('Failed to get fee info:', error);
      return null;
    }
  }
}

// 导出单例实例
export const vaultService = new VaultService(); 