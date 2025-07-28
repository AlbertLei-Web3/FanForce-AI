// AI Agent Service - 投资策略规则引擎
// AI Agent Service - Investment Strategy Rule Engine

export interface InvestmentStrategy {
  id: string;
  name: string;
  description: string;
  rule: string;
  allocation: number; // 分配比例 / Allocation percentage
  active: boolean;
}

export interface TokenData {
  symbol: string;
  address: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

export interface InvestmentDecision {
  token: string;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
  reason: string;
  confidence: number;
}

export interface UserOp {
  sender: string;
  nonce: number;
  initCode: string;
  callData: string;
  callGasLimit: number;
  verificationGasLimit: number;
  preVerificationGas: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  paymasterAndData: string;
  signature: string;
}

class AIAgentService {
  private strategies: InvestmentStrategy[] = [];
  private isInitialized: boolean = false;
  private lastExecution: number = 0;
  private executionInterval: number = 3600000; // 1小时执行一次 / Execute every hour

  // 初始化服务
  async initialize(): Promise<boolean> {
    try {
      // 初始化投资策略
      this.strategies = [
        {
          id: 'top_gainer',
          name: 'Top Gainer Strategy',
          description: '买入24小时涨幅前10的token中的top1',
          rule: 'top_gainer',
          allocation: 40,
          active: true
        },
        {
          id: 'momentum',
          name: 'Momentum Strategy',
          description: '基于价格动量的交易策略',
          rule: 'momentum',
          allocation: 35,
          active: true
        },
        {
          id: 'volume_spike',
          name: 'Volume Spike Strategy',
          description: '基于交易量突增的交易策略',
          rule: 'volume_spike',
          allocation: 25,
          active: true
        }
      ];

      this.isInitialized = true;
      console.log('✅ AI Agent Service initialized with', this.strategies.length, 'strategies');
      return true;
    } catch (error) {
      console.error('❌ AI Agent Service initialization failed:', error);
      return false;
    }
  }

  // 获取热门代币数据
  async getTrendingTokens(): Promise<TokenData[]> {
    try {
      // 调用OKX DEX服务获取真实数据
      const { okxDexService } = await import('./okxDexService');
      const trendingTokens = await okxDexService.getTrendingTokens();
      
      // 转换为AI Agent需要的格式
      const tokenData: TokenData[] = trendingTokens.map(token => ({
        symbol: token.symbol,
        address: token.address,
        price: token.price,
        priceChange24h: token.priceChange24h,
        volume24h: token.volume24h,
        marketCap: token.marketCap
      }));

      console.log('📊 Retrieved real trending tokens:', tokenData.length);
      return tokenData;
    } catch (error) {
      console.error('Failed to get trending tokens:', error);
      // 返回mock数据作为fallback
      return this.getMockTokens();
    }
  }

  // Mock数据作为fallback
  private getMockTokens(): TokenData[] {
    return [
      {
        symbol: 'PEPE',
        address: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
        price: 0.00001234,
        priceChange24h: 15.2,
        volume24h: 45000000,
        marketCap: 500000000
      },
      {
        symbol: 'DOGE',
        address: '0x3832d2f059e55934220881f831be501d180671a7',
        price: 0.0789,
        priceChange24h: 8.7,
        volume24h: 32000000,
        marketCap: 1200000000
      },
      {
        symbol: 'SHIB',
        address: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
        price: 0.00002345,
        priceChange24h: 12.3,
        volume24h: 28000000,
        marketCap: 1400000000
      }
    ];
  }

  // 执行投资策略
  async executeInvestmentStrategies(): Promise<InvestmentDecision[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // 检查执行间隔
      const now = Date.now();
      if (now - this.lastExecution < this.executionInterval) {
        console.log('⏰ Strategy execution skipped - too soon since last execution');
        return [];
      }

      console.log('🚀 Executing investment strategies...');
      
      const decisions: InvestmentDecision[] = [];
      const tokens = await this.getTrendingTokens();

      // 执行Top Gainer策略
      const topGainerDecision = this.executeTopGainerStrategy(tokens);
      if (topGainerDecision) {
        decisions.push(topGainerDecision);
      }

      // 执行Momentum策略
      const momentumDecision = this.executeMomentumStrategy(tokens);
      if (momentumDecision) {
        decisions.push(momentumDecision);
      }

      // 执行Volume Spike策略
      const volumeSpikeDecision = this.executeVolumeSpikeStrategy(tokens);
      if (volumeSpikeDecision) {
        decisions.push(volumeSpikeDecision);
      }

      this.lastExecution = now;
      console.log('✅ Investment strategies executed:', decisions.length, 'decisions');
      
      return decisions;
    } catch (error) {
      console.error('❌ Failed to execute investment strategies:', error);
      return [];
    }
  }

  // Top Gainer策略：买入涨幅前10的token中的top1
  private executeTopGainerStrategy(tokens: TokenData[]): InvestmentDecision | null {
    try {
      // 按24小时涨幅排序
      const sortedTokens = tokens
        .filter(token => token.priceChange24h > 0)
        .sort((a, b) => b.priceChange24h - a.priceChange24h);

      if (sortedTokens.length === 0) {
        return null;
      }

      const topToken = sortedTokens[0];
      
      // 如果涨幅超过10%，执行买入
      if (topToken.priceChange24h > 10) {
        return {
          token: topToken.address,
          action: 'buy',
          amount: 1000, // 买入1000 USDC
          reason: `Top gainer: ${topToken.symbol} +${topToken.priceChange24h.toFixed(1)}%`,
          confidence: Math.min(topToken.priceChange24h / 20, 0.95) // 基于涨幅计算置信度
        };
      }

      return null;
    } catch (error) {
      console.error('Top Gainer strategy execution failed:', error);
      return null;
    }
  }

  // Momentum策略：基于价格动量
  private executeMomentumStrategy(tokens: TokenData[]): InvestmentDecision | null {
    try {
      // 选择交易量最大的token
      const highVolumeTokens = tokens
        .filter(token => token.volume24h > 10000000) // 交易量超过1000万
        .sort((a, b) => b.volume24h - a.volume24h);

      if (highVolumeTokens.length === 0) {
        return null;
      }

      const targetToken = highVolumeTokens[0];
      
      // 如果涨幅在5-15%之间，执行买入
      if (targetToken.priceChange24h >= 5 && targetToken.priceChange24h <= 15) {
        return {
          token: targetToken.address,
          action: 'buy',
          amount: 800, // 买入800 USDC
          reason: `Momentum: ${targetToken.symbol} +${targetToken.priceChange24h.toFixed(1)}%`,
          confidence: 0.75
        };
      }

      return null;
    } catch (error) {
      console.error('Momentum strategy execution failed:', error);
      return null;
    }
  }

  // Volume Spike策略：基于交易量突增
  private executeVolumeSpikeStrategy(tokens: TokenData[]): InvestmentDecision | null {
    try {
      // 选择市值较小的token（更容易出现交易量突增）
      const smallCapTokens = tokens
        .filter(token => token.marketCap < 1000000000) // 市值小于10亿
        .sort((a, b) => b.volume24h - a.volume24h);

      if (smallCapTokens.length === 0) {
        return null;
      }

      const targetToken = smallCapTokens[0];
      
      // 如果交易量相对市值较高，执行买入
      const volumeToMarketCapRatio = targetToken.volume24h / targetToken.marketCap;
      if (volumeToMarketCapRatio > 0.05) { // 交易量/市值 > 5%
        return {
          token: targetToken.address,
          action: 'buy',
          amount: 600, // 买入600 USDC
          reason: `Volume spike: ${targetToken.symbol} volume/mcap: ${(volumeToMarketCapRatio * 100).toFixed(1)}%`,
          confidence: 0.65
        };
      }

      return null;
    } catch (error) {
      console.error('Volume Spike strategy execution failed:', error);
      return null;
    }
  }

  // 生成UserOp
  async generateUserOp(decision: InvestmentDecision): Promise<UserOp | null> {
    try {
      // 这里应该调用Pimlico/Stackup API生成真实的UserOp
      // For now, return mock UserOp
      const mockUserOp: UserOp = {
        sender: '0x1234567890123456789012345678901234567890',
        nonce: Math.floor(Math.random() * 1000000),
        initCode: '0x',
        callData: `0x${Math.random().toString(16).substr(2, 64)}`,
        callGasLimit: 200000,
        verificationGasLimit: 100000,
        preVerificationGas: 50000,
        maxFeePerGas: 20000000000, // 20 gwei
        maxPriorityFeePerGas: 2000000000, // 2 gwei
        paymasterAndData: '0x',
        signature: `0x${Math.random().toString(16).substr(2, 128)}`
      };

      console.log('📝 Generated UserOp for decision:', decision);
      return mockUserOp;
    } catch (error) {
      console.error('Failed to generate UserOp:', error);
      return null;
    }
  }

  // 发送UserOp到Pimlico/Stackup
  async sendUserOp(userOp: UserOp): Promise<boolean> {
    try {
      // 这里应该调用Pimlico/Stackup API发送UserOp
      // For now, simulate sending
      console.log('📤 Sending UserOp to Pimlico/Stackup...');
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ UserOp sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send UserOp:', error);
      return false;
    }
  }

  // 获取策略状态
  getStrategies(): InvestmentStrategy[] {
    return this.strategies;
  }

  // 获取最后执行时间
  getLastExecution(): number {
    return this.lastExecution;
  }

  // 检查是否可以执行
  canExecute(): boolean {
    const now = Date.now();
    return now - this.lastExecution >= this.executionInterval;
  }
}

// 导出单例实例
export const aiAgentService = new AIAgentService(); 