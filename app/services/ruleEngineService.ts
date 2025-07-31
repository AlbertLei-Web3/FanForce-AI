// 规则引擎前端服务 - 与规则引擎API交互
// Rule Engine Frontend Service - Interacts with Rule Engine APIs

// 系统状态接口
// System Status Interface
export interface SystemStatus {
  timestamp: string;
  system: {
    btcDataService: {
      isRunning: boolean;
      hasData: boolean;
      lastUpdate: string | null;
    };
    aiAgentService: {
      isRunning: boolean;
      hasStrategy: boolean;
      lastUpdate: string | null;
    };
    overall: {
      isRunning: boolean;
      lastUpdate: string | null;
      status: string;
    };
  };
  data: {
    btc: any;
    marketHeat: any;
    strategy: any;
    portfolio: any;
  };
  summary: {
    currentPrice: number;
    marketState: string;
    riskLevel: string;
    btcAllocation: string;
    stakeAllocation: string;
  };
}

// 策略信息接口
// Strategy Information Interface
export interface StrategyInfo {
  timestamp: string;
  strategy: {
    marketState: string;
    buyBTC: number;
    stake: number;
    summary: string;
    riskLevel: string;
    recommendation: string;
    timestamp: number;
    portfolio: any;
  };
  analysis: {
    marketState: string;
    riskLevel: string;
    allocation: {
      btc: number;
      stake: number;
      btcPercentage: string;
      stakePercentage: string;
    };
  };
  recommendations: {
    summary: string;
    recommendation: string;
    nextUpdate: string;
  };
}

// 市场数据接口
// Market Data Interface
export interface MarketData {
  timestamp: string;
  data: any;
  marketHeat: any;
  analysis: {
    currentPrice: number;
    priceChange: {
      percentage: number;
      absolute: number;
      direction: string;
    };
    volume: {
      btc: number;
      usd: number;
      formatted: {
        btc: string;
        usd: string;
      };
    };
    range: {
      high24h: number;
      low24h: number;
      spread: string;
    };
  };
  updateInfo: {
    lastUpdated: string;
    nextUpdate: string;
    updateFrequency: string;
  };
}

// 规则引擎服务类
// Rule Engine Service Class
export class RuleEngineService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/rule-engine';
  }

  // 获取系统状态
  // Get system status
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching system status:', error);
      throw error;
    }
  }

  // 获取策略信息
  // Get strategy information
  async getStrategyInfo(): Promise<StrategyInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/strategy`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching strategy info:', error);
      throw error;
    }
  }

  // 获取市场数据
  // Get market data
  async getMarketData(): Promise<MarketData> {
    try {
      const response = await fetch(`${this.baseUrl}/market-data`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching market data:', error);
      throw error;
    }
  }

  // 更新策略
  // Update strategy
  async updateStrategy(action: string, data?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...data }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating strategy:', error);
      throw error;
    }
  }

  // 更新市场数据服务
  // Update market data service
  async updateMarketDataService(action: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/market-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error updating market data service:', error);
      throw error;
    }
  }

  // 设置资金池大小
  // Set fund pool size
  async setTotalFunds(totalFunds: number): Promise<any> {
    return this.updateStrategy('setTotalFunds', { totalFunds });
  }

  // 启动AI代理服务
  // Start AI agent service
  async startAIAgent(): Promise<any> {
    return this.updateStrategy('start');
  }

  // 停止AI代理服务
  // Stop AI agent service
  async stopAIAgent(): Promise<any> {
    return this.updateStrategy('stop');
  }

  // 启动BTC数据服务
  // Start BTC data service
  async startBTCData(): Promise<any> {
    return this.updateMarketDataService('start');
  }

  // 停止BTC数据服务
  // Stop BTC data service
  async stopBTCData(): Promise<any> {
    return this.updateMarketDataService('stop');
  }

  // 刷新数据
  // Refresh data
  async refreshData(): Promise<any> {
    return this.updateMarketDataService('refresh');
  }

  // 获取实时数据（轮询）
  // Get real-time data (polling)
  async getRealTimeData(): Promise<{
    systemStatus: SystemStatus;
    strategyInfo: StrategyInfo;
    marketData: MarketData;
  }> {
    try {
      const [systemStatus, strategyInfo, marketData] = await Promise.all([
        this.getSystemStatus(),
        this.getStrategyInfo(),
        this.getMarketData(),
      ]);

      return {
        systemStatus,
        strategyInfo,
        marketData,
      };
    } catch (error) {
      console.error('❌ Error fetching real-time data:', error);
      throw error;
    }
  }
}

// 导出单例实例
// Export singleton instance
export const ruleEngineService = new RuleEngineService(); 