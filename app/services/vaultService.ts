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
      const vaultAddress = getVaultContractAddress(`0x${parseInt(chainId).toString(16)}`);
      const usdcAddress = getUSDCTokenAddress(`0x${parseInt(chainId).toString(16)}`);

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
      if (!this.vaultContract || !this.usdcContract || !this.signer) {
        await this.initialize();
      }

      if (!this.vaultContract || !this.usdcContract) {
        throw new Error('Contracts not initialized');
      }

      const address = await this.signer!.getAddress();
      const amountWei = ethers.parseUnits(amount.toString(), 6); // USDC有6位小数

      // 检查USDC余额
      const balance = await this.usdcContract.balanceOf(address);
      if (balance < amountWei) {
        throw new Error('Insufficient USDC balance');
      }

      // 检查授权
      const allowance = await this.usdcContract.allowance(address, this.vaultContract.target);
      if (allowance < amountWei) {
        // 需要授权
        const approveTx = await this.usdcContract.approve(this.vaultContract.target, amountWei);
        await approveTx.wait();
      }

      // 执行存款
      const tx = await this.vaultContract.deposit(amountWei, address);
      const receipt = await tx.wait();

      // 获取获得的份额
      const shares = await this.vaultContract.convertToShares(amountWei);

      return {
        success: true,
        transactionHash: receipt?.hash,
        shares: ethers.formatEther(shares)
      };
    } catch (error) {
      console.error('Deposit failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 从金库提款
  async withdraw(shares: number): Promise<WithdrawResult> {
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

      // 执行提款
      const tx = await this.vaultContract.withdraw(sharesWei, address, address);
      const receipt = await tx.wait();

      // 获取获得的资产
      const assets = await this.vaultContract.convertToAssets(sharesWei);

      return {
        success: true,
        transactionHash: receipt?.hash,
        assets: ethers.formatUnits(assets, 6) // USDC有6位小数
      };
    } catch (error) {
      console.error('Withdraw failed:', error);
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
      const balance = await this.usdcContract.balanceOf(address);
      return ethers.formatUnits(balance, 6);
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

  // 预览提款
  async previewWithdraw(shares: number): Promise<string> {
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
      console.error('Failed to preview withdraw:', error);
      return '0';
    }
  }
}

// 导出单例实例
export const vaultService = new VaultService(); 