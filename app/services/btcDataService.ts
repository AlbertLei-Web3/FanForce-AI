// BTC 数据服务 - 使用OKX现货交易API
// BTC Data Service - Using OKX Spot Trading API

// BTC 市场数据结构
// BTC Market Data Structure
export interface BTCData {
  currentPrice: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  volume24hUSD: number;
  priceChange24h: number;
  timestamp: number;
  lastUpdated: string;
}

// 市场热度判断结果
// Market Heat Judgment Result
export interface MarketHeatResult {
  status: string;
  changePercent: number;
  volume24h: number;
  description: string;
}

// BTC 数据服务类
// BTC Data Service Class
export class BTCDataService {
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private currentData: BTCData | null = null;
  private dataCallbacks: ((data: BTCData) => void)[] = [];

  // 初始化服务
  // Initialize service
  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 Initializing BTC Data Service...');
      
      // 获取初始数据
      // Get initial data
      await this.fetchBTCData();
      
      console.log('✅ BTC Data Service initialized');
      return true;
    } catch (error) {
      console.error('❌ BTC Data Service initialization failed:', error);
      return false;
    }
  }

  // 启动服务
  // Start service
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ BTC Data Service is already running');
      return;
    }

    console.log('🔄 Starting BTC Data Service...');
    this.isRunning = true;

    // 每30秒更新一次数据
    // Update data every 30 seconds
    this.updateInterval = setInterval(async () => {
      await this.fetchBTCData();
    }, 30000);

    console.log('✅ BTC Data Service started - updating every 30 seconds');
  }

  // 停止服务
  // Stop service
  stop(): void {
    if (!this.isRunning) {
      console.warn('⚠️ BTC Data Service is not running');
      return;
    }

    console.log('🛑 Stopping BTC Data Service...');
    this.isRunning = false;

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    console.log('✅ BTC Data Service stopped');
  }

  // 获取BTC数据
  // Fetch BTC data
  private async fetchBTCData(): Promise<void> {
    try {
      console.log('📊 Fetching BTC market data...');
      
      // 使用OKX现货交易API获取BTC价格
      // Use OKX spot trading API to get BTC price
      let response: any;
      
      if (typeof window !== 'undefined') {
        // 浏览器环境
        // Browser environment
        response = await fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        response = { data };
      } else {
        // Node.js环境
        // Node.js environment
        const axios = require('axios');
        const { HttpsProxyAgent } = require('https-proxy-agent');
        
        // 创建代理代理
        // Create proxy agent
        const agent = new HttpsProxyAgent('http://127.0.0.1:10808');
        
        response = await axios.get('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT', {
          httpAgent: agent,
          httpsAgent: agent,
          timeout: 15000
        });
      }

      const data = response.data;
      
      if (data.code === '0' && data.data && data.data[0]) {
        const btcData = data.data[0];
        
        // 计算24小时价格变化
        // Calculate 24h price change
        const currentPrice = parseFloat(btcData.last);
        const openPrice = parseFloat(btcData.open24h);
        const priceChange = ((currentPrice - openPrice) / openPrice) * 100;

        this.currentData = {
          currentPrice: currentPrice,
          high24h: parseFloat(btcData.high24h),
          low24h: parseFloat(btcData.low24h),
          volume24h: parseFloat(btcData.vol24h),
          volume24hUSD: parseFloat(btcData.volCcy24h),
          priceChange24h: priceChange,
          timestamp: parseInt(btcData.ts),
          lastUpdated: new Date(parseInt(btcData.ts)).toISOString()
        };

        console.log(`📈 BTC Data Updated:`);
        console.log(`   Current Price: $${this.currentData.currentPrice.toLocaleString()}`);
        console.log(`   24h High: $${this.currentData.high24h.toLocaleString()}`);
        console.log(`   24h Low: $${this.currentData.low24h.toLocaleString()}`);
        console.log(`   24h Volume: ${this.currentData.volume24h.toLocaleString()} BTC`);
        console.log(`   24h Volume (USD): $${this.currentData.volume24hUSD.toLocaleString()}`);
        console.log(`   24h Change: ${this.currentData.priceChange24h.toFixed(2)}%`);

        // 获取市场热度判断
        // Get market heat judgment
        const marketHeat = this.judgeMarketHeat();
        console.log(`   Market Heat: ${marketHeat.status} (${marketHeat.description})`);

        // 通知所有回调函数
        // Notify all callback functions
        this.notifyDataCallbacks();
      } else {
        console.warn('⚠️ Failed to fetch BTC data');
      }
    } catch (error) {
      console.error('❌ Error fetching BTC data:', error);
    }
  }

  // 判断市场热度
  // Judge market heat
  judgeMarketHeat(): MarketHeatResult {
    if (!this.currentData) {
      return {
        status: "❓ 未知",
        changePercent: 0,
        volume24h: 0,
        description: "No data available / 无数据"
      };
    }

    const { currentPrice, volume24h, priceChange24h } = this.currentData;
    
    // 计算24小时开盘价（基于当前价格和变化百分比反推）
    // Calculate 24h open price (reverse calculate from current price and change percentage)
    const open24h = currentPrice / (1 + priceChange24h / 100);
    const changePercent = priceChange24h;

    // 市场热度判断逻辑
    // Market heat judgment logic
    if (changePercent >= 2 && volume24h >= 5000) {
      return {
        status: "🔥 火热",
        changePercent: changePercent,
        volume24h: volume24h,
        description: "Strong bullish momentum with high volume / 强势上涨，交易量活跃"
      };
    }
    
    if (changePercent >= 0.5 && volume24h >= 3000) {
      return {
        status: "🌤️ 正常偏热",
        changePercent: changePercent,
        volume24h: volume24h,
        description: "Moderate bullish with good volume / 温和上涨，交易量良好"
      };
    }
    
    if (changePercent <= -2 && volume24h >= 4000) {
      return {
        status: "😱 恐慌下跌",
        changePercent: changePercent,
        volume24h: volume24h,
        description: "Sharp decline with panic selling / 恐慌性下跌，抛售压力大"
      };
    }
    
    if (Math.abs(changePercent) < 0.3 && volume24h <= 2000) {
      return {
        status: "🧊 极冷",
        changePercent: changePercent,
        volume24h: volume24h,
        description: "Very low volatility and volume / 极低波动性和交易量"
      };
    }
    
    return {
      status: "🌥️ 平静期",
      changePercent: changePercent,
      volume24h: volume24h,
      description: "Normal market conditions / 正常市场状况"
    };
  }

  // 获取当前数据
  // Get current data
  getCurrentData(): BTCData | null {
    return this.currentData;
  }

  // 获取JSON格式的数据
  // Get data in JSON format
  getDataAsJSON(): string {
    if (!this.currentData) {
      return JSON.stringify({ error: 'No data available' }, null, 2);
    }
    
    const dataWithHeat = {
      ...this.currentData,
      marketHeat: this.judgeMarketHeat()
    };
    
    return JSON.stringify(dataWithHeat, null, 2);
  }

  // 注册数据更新回调
  // Register data update callback
  onDataUpdate(callback: (data: BTCData) => void): void {
    this.dataCallbacks.push(callback);
  }

  // 移除数据更新回调
  // Remove data update callback
  removeDataCallback(callback: (data: BTCData) => void): void {
    const index = this.dataCallbacks.indexOf(callback);
    if (index > -1) {
      this.dataCallbacks.splice(index, 1);
    }
  }

  // 通知所有回调函数
  // Notify all callback functions
  private notifyDataCallbacks(): void {
    if (this.currentData) {
      this.dataCallbacks.forEach(callback => {
        try {
          callback(this.currentData!);
        } catch (error) {
          console.error('❌ Error in data callback:', error);
        }
      });
    }
  }

  // 获取服务状态
  // Get service status
  getStatus(): { isRunning: boolean; hasData: boolean; lastUpdate: string | null } {
    return {
      isRunning: this.isRunning,
      hasData: this.currentData !== null,
      lastUpdate: this.currentData?.lastUpdated || null
    };
  }
}

// 导出单例实例
// Export singleton instance
export const btcDataService = new BTCDataService(); 