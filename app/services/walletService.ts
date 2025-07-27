// 钱包服务 - 支持MetaMask和OKX钱包
// Wallet Service - Support MetaMask and OKX Wallet

export interface WalletInfo {
  address: string;
  chainId: string;
  isConnected: boolean;
  walletType: 'metamask' | 'okx' | 'unknown';
}

export interface WalletConnectionResult {
  success: boolean;
  walletInfo?: WalletInfo;
  error?: string;
}

class WalletService {
  private walletInfo: WalletInfo | null = null;

  // 检测可用的钱包
  async detectWallets(): Promise<{ metamask: boolean; okx: boolean }> {
    const { ethereum } = window as any;
    
    return {
      metamask: !!ethereum?.isMetaMask,
      okx: !!ethereum?.isOKXWallet
    };
  }

  // 连接MetaMask钱包
  async connectMetaMask(): Promise<WalletConnectionResult> {
    try {
      const { ethereum } = window as any;
      
      if (!ethereum?.isMetaMask) {
        return {
          success: false,
          error: 'MetaMask not installed'
        };
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      const walletInfo: WalletInfo = {
        address: accounts[0],
        chainId,
        isConnected: true,
        walletType: 'metamask'
      };

      this.walletInfo = walletInfo;
      
      return {
        success: true,
        walletInfo
      };
    } catch (error) {
      console.error('MetaMask connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 连接OKX钱包
  async connectOKXWallet(): Promise<WalletConnectionResult> {
    try {
      const { ethereum } = window as any;
      
      if (!ethereum?.isOKXWallet) {
        return {
          success: false,
          error: 'OKX Wallet not installed'
        };
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      const walletInfo: WalletInfo = {
        address: accounts[0],
        chainId,
        isConnected: true,
        walletType: 'okx'
      };

      this.walletInfo = walletInfo;
      
      return {
        success: true,
        walletInfo
      };
    } catch (error) {
      console.error('OKX Wallet connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 自动连接钱包（优先OKX，其次MetaMask）
  async autoConnect(): Promise<WalletConnectionResult> {
    const wallets = await this.detectWallets();
    
    if (wallets.okx) {
      return this.connectOKXWallet();
    } else if (wallets.metamask) {
      return this.connectMetaMask();
    } else {
      return {
        success: false,
        error: 'No supported wallet found'
      };
    }
  }

  // 断开钱包连接
  disconnect(): void {
    this.walletInfo = null;
  }

  // 获取当前钱包信息
  getWalletInfo(): WalletInfo | null {
    return this.walletInfo;
  }

  // 检查是否已连接
  isConnected(): boolean {
    return this.walletInfo?.isConnected || false;
  }

  // 获取钱包地址
  getAddress(): string {
    return this.walletInfo?.address || '';
  }

  // 获取钱包类型
  getWalletType(): string {
    return this.walletInfo?.walletType || 'unknown';
  }

  // 切换网络
  async switchNetwork(chainId: string): Promise<boolean> {
    try {
      const { ethereum } = window as any;
      
      if (!ethereum) {
        return false;
      }

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });

      return true;
    } catch (error) {
      console.error('Network switch failed:', error);
      return false;
    }
  }

  // 监听钱包事件
  setupEventListeners(onAccountChange: (address: string) => void, onChainChange: (chainId: string) => void): void {
    const { ethereum } = window as any;
    
    if (!ethereum) {
      return;
    }

    ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        onAccountChange(accounts[0]);
        this.walletInfo = this.walletInfo ? { ...this.walletInfo, address: accounts[0] } : null;
      } else {
        this.disconnect();
      }
    });

    ethereum.on('chainChanged', (chainId: string) => {
      onChainChange(chainId);
      this.walletInfo = this.walletInfo ? { ...this.walletInfo, chainId } : null;
    });
  }
}

// 导出单例实例
export const walletService = new WalletService(); 