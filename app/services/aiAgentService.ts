// AI 智能代理服务 - 动态资金配置策略
// AI Agent Service - Dynamic Fund Allocation Strategy

import { btcDataService, MarketHeatResult } from './btcDataService';

// 动态资金配置策略结果
// Dynamic Fund Allocation Strategy Result
export interface StrategyResult {
  marketState: string;
  buyBTC: number;
  stake: number;
  summary: string;
  riskLevel: string;
  recommendation: string;
  timestamp: number;
}

// 投资组合状态
// Portfolio Status
export interface PortfolioStatus {
  totalFunds: number;
  btcAllocation: number;
  stakeAllocation: number;
  btcPercentage: string;
  stakePercentage: string;
  lastUpdate: string;
}

// AI 智能代理服务类
// AI Agent Service Class
export class AIAgentService {
  private isRunning: boolean = false;
  private currentStrategy: StrategyResult | null = null;
  private strategyCallbacks: ((strategy: StrategyResult) => void)[] = [];
  private portfolioCallbacks: ((portfolio: PortfolioStatus) => void)[] = [];
  private totalFunds: number = 10000; // 默认资金池 / Default fund pool

  // 初始化服务
  // Initialize service
  async initialize(): Promise<boolean> {
    try {
      console.log('🧠 Initializing AI Agent Service...');
      
      // 监听BTC数据服务
      // Listen to BTC data service
      btcDataService.onMarketHeatUpdate((marketHeat: MarketHeatResult) => {
        this.updateStrategy(marketHeat);
      });
      
      // 获取初始策略
      // Get initial strategy
      const marketHeat = btcDataService.getCurrentMarketHeat();
      if (marketHeat) {
        this.updateStrategy(marketHeat);
      }
      
      console.log('✅ AI Agent Service initialized');
      return true;
    } catch (error) {
      console.error('❌ AI Agent Service initialization failed:', error);
      return false;
    }
  }

  // 启动服务
  // Start service
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ AI Agent Service is already running');
      return;
    }

    console.log('🔄 Starting AI Agent Service...');
    this.isRunning = true;

    // 启动BTC数据服务（如果还没启动）
    // Start BTC data service (if not already started)
    if (!btcDataService.getStatus().isRunning) {
      btcDataService.start();
    }

    console.log('✅ AI Agent Service started');
  }

  // 停止服务
  // Stop service
  stop(): void {
    if (!this.isRunning) {
      console.warn('⚠️ AI Agent Service is not running');
      return;
    }

    console.log('🛑 Stopping AI Agent Service...');
    this.isRunning = false;

    console.log('✅ AI Agent Service stopped');
  }

  // 更新策略
  // Update strategy
  private updateStrategy(marketHeat: MarketHeatResult): void {
    const strategy = this.getStrategyRefined(marketHeat.status);
    this.currentStrategy = strategy;
    
    console.log(`🧠 AI Agent Strategy Updated:`);
    console.log(`   Market State: ${strategy.marketState}`);
    console.log(`   Risk Level: ${strategy.riskLevel}`);
    console.log(`   Summary: ${strategy.summary}`);
    console.log(`   Allocation: ${(strategy.buyBTC * 100).toFixed(0)}% BTC, ${(strategy.stake * 100).toFixed(0)}% Stake`);

    // 通知策略回调
    // Notify strategy callbacks
    this.notifyStrategyCallbacks(strategy);
    
    // 更新投资组合状态
    // Update portfolio status
    this.updatePortfolioStatus();
  }

  // 获取动态资金配置策略
  // Get dynamic fund allocation strategy
  getStrategyRefined(marketState: string): StrategyResult {
    const refinedMap = {
      '🔥 火热': {
        buyBTC: 0.30,
        stake: 0.70,
        summary: '市场疯狂上涨，最大允许30%投机，其余用于锁仓稳健增长。',
        riskLevel: 'HIGH',
        recommendation: 'Market is in frenzy mode, max 30% for speculation, rest for stable staking growth.'
      },
      '🌤️ 正常偏热': {
        buyBTC: 0.20,
        stake: 0.80,
        summary: '市场偏热但尚未疯狂，继续偏保守，逐步获利。',
        riskLevel: 'MEDIUM-HIGH',
        recommendation: 'Market is moderately hot but not frenzied, remain conservative and take profits gradually.'
      },
      '🌥️ 平静期': {
        buyBTC: 0.10,
        stake: 0.90,
        summary: '无明显趋势，仅保留最小投机敞口，剩余全部质押稳健获取收益。',
        riskLevel: 'LOW',
        recommendation: 'No clear trend, maintain minimal speculation exposure, rest for stable staking returns.'
      },
      '😱 恐慌下跌': {
        buyBTC: 0.05,
        stake: 0.95,
        summary: '极端防守，仅留极少量博弈短期反弹，大部分进入防御状态。',
        riskLevel: 'VERY_LOW',
        recommendation: 'Extreme defense mode, minimal exposure for short-term bounce, majority in defensive position.'
      },
      '🧊 极冷': {
        buyBTC: 0.0,
        stake: 1.0,
        summary: '市场无交易活力，全体进入"冬眠模式"，等待拐点。',
        riskLevel: 'MINIMAL',
        recommendation: 'Market lacks trading activity, enter "hibernation mode" and wait for turning point.'
      },
      '❓ 未知': {
        buyBTC: 0.05,
        stake: 0.95,
        summary: '数据不可用，采用最保守策略。',
        riskLevel: 'UNKNOWN',
        recommendation: 'Data unavailable, adopt most conservative strategy.'
      }
    };

    const strategy = refinedMap[marketState] || refinedMap['❓ 未知'];
    
    return {
      marketState: marketState,
      buyBTC: strategy.buyBTC,
      stake: strategy.stake,
      summary: strategy.summary,
      riskLevel: strategy.riskLevel,
      recommendation: strategy.recommendation,
      timestamp: Date.now()
    };
  }

  // 更新投资组合状态
  // Update portfolio status
  private updatePortfolioStatus(): void {
    if (!this.currentStrategy) return;

    const btcAllocation = this.totalFunds * this.currentStrategy.buyBTC;
    const stakeAllocation = this.totalFunds * this.currentStrategy.stake;
    
    const portfolio: PortfolioStatus = {
      totalFunds: this.totalFunds,
      btcAllocation: btcAllocation,
      stakeAllocation: stakeAllocation,
      btcPercentage: (this.currentStrategy.buyBTC * 100).toFixed(1),
      stakePercentage: (this.currentStrategy.stake * 100).toFixed(1),
      lastUpdate: new Date().toISOString()
    };

    // 通知投资组合回调
    // Notify portfolio callbacks
    this.notifyPortfolioCallbacks(portfolio);
  }

  // 设置资金池大小
  // Set fund pool size
  setTotalFunds(totalFunds: number): void {
    this.totalFunds = totalFunds;
    if (this.currentStrategy) {
      this.updatePortfolioStatus();
    }
  }

  // 获取当前策略
  // Get current strategy
  getCurrentStrategy(): StrategyResult | null {
    return this.currentStrategy;
  }

  // 获取当前投资组合状态
  // Get current portfolio status
  getCurrentPortfolio(): PortfolioStatus | null {
    if (!this.currentStrategy) return null;

    const btcAllocation = this.totalFunds * this.currentStrategy.buyBTC;
    const stakeAllocation = this.totalFunds * this.currentStrategy.stake;
    
    return {
      totalFunds: this.totalFunds,
      btcAllocation: btcAllocation,
      stakeAllocation: stakeAllocation,
      btcPercentage: (this.currentStrategy.buyBTC * 100).toFixed(1),
      stakePercentage: (this.currentStrategy.stake * 100).toFixed(1),
      lastUpdate: new Date().toISOString()
    };
  }

  // 获取JSON格式的策略数据
  // Get strategy data in JSON format
  getStrategyAsJSON(): string {
    if (!this.currentStrategy) {
      return JSON.stringify({ error: 'No strategy available' }, null, 2);
    }
    
    const strategyWithPortfolio = {
      strategy: this.currentStrategy,
      portfolio: this.getCurrentPortfolio(),
      btcData: btcDataService.getCurrentData(),
      marketHeat: btcDataService.getCurrentMarketHeat()
    };
    
    return JSON.stringify(strategyWithPortfolio, null, 2);
  }

  // 注册策略更新回调
  // Register strategy update callback
  onStrategyUpdate(callback: (strategy: StrategyResult) => void): void {
    this.strategyCallbacks.push(callback);
  }

  // 注册投资组合更新回调
  // Register portfolio update callback
  onPortfolioUpdate(callback: (portfolio: PortfolioStatus) => void): void {
    this.portfolioCallbacks.push(callback);
  }

  // 移除策略更新回调
  // Remove strategy update callback
  removeStrategyCallback(callback: (strategy: StrategyResult) => void): void {
    const index = this.strategyCallbacks.indexOf(callback);
    if (index > -1) {
      this.strategyCallbacks.splice(index, 1);
    }
  }

  // 移除投资组合更新回调
  // Remove portfolio update callback
  removePortfolioCallback(callback: (portfolio: PortfolioStatus) => void): void {
    const index = this.portfolioCallbacks.indexOf(callback);
    if (index > -1) {
      this.portfolioCallbacks.splice(index, 1);
    }
  }

  // 通知所有策略回调函数
  // Notify all strategy callback functions
  private notifyStrategyCallbacks(strategy: StrategyResult): void {
    this.strategyCallbacks.forEach(callback => {
      try {
        callback(strategy);
      } catch (error) {
        console.error('❌ Error in strategy callback:', error);
      }
    });
  }

  // 通知所有投资组合回调函数
  // Notify all portfolio callback functions
  private notifyPortfolioCallbacks(portfolio: PortfolioStatus): void {
    this.portfolioCallbacks.forEach(callback => {
      try {
        callback(portfolio);
      } catch (error) {
        console.error('❌ Error in portfolio callback:', error);
      }
    });
  }

  // 获取服务状态
  // Get service status
  getStatus(): { isRunning: boolean; hasStrategy: boolean; lastUpdate: string | null } {
    return {
      isRunning: this.isRunning,
      hasStrategy: this.currentStrategy !== null,
      lastUpdate: this.currentStrategy?.timestamp ? new Date(this.currentStrategy.timestamp).toISOString() : null
    };
  }

  // 获取完整的系统状态
  // Get complete system status
  getSystemStatus(): any {
    return {
      aiAgent: this.getStatus(),
      btcDataService: btcDataService.getStatus(),
      currentStrategy: this.currentStrategy,
      currentPortfolio: this.getCurrentPortfolio(),
      marketHeat: btcDataService.getCurrentMarketHeat(),
      btcData: btcDataService.getCurrentData()
    };
  }
}

// 导出单例实例
// Export singleton instance
export const aiAgentService = new AIAgentService();
