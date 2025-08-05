// Foundation自动化服务 - 黑客松演示版本
// Foundation Automation Service - Hackathon Demo Version

import { ethers } from 'ethers';
import { aiAgentService } from './aiAgentService';
import { btcDataService } from './btcDataService';
import { vaultService } from './vaultService';
import { VAULT_CONTRACT, getVaultContractAddress } from '../config/contracts';

// Foundation策略执行结果
// Foundation Strategy Execution Result
export interface FoundationExecutionResult {
  success: boolean;
  strategyId: number;
  amount: string;
  targetToken: string;
  marketCondition: number;
  timestamp: number;
  transactionHash?: string;
  error?: string;
}

// Foundation自动化服务类
// Foundation Automation Service Class
export class FoundationAutomationService {
  private provider: ethers.JsonRpcProvider | null = null;
  private foundationSigner: ethers.Wallet | null = null;
  private vaultContract: ethers.Contract | null = null;
  private isRunning: boolean = false;
  private executionInterval: NodeJS.Timeout | null = null;
  private executionHistory: FoundationExecutionResult[] = [];

  // 初始化Foundation服务
  // Initialize Foundation service
  async initialize(): Promise<boolean> {
    try {
      console.log('🏛️ Initializing Foundation Automation Service...');
      
      // 连接X Layer Testnet
      this.provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
      
      // 使用Foundation私钥创建签名者
      const foundationPrivateKey = process.env.FOUNDATION_PRIVATE_KEY;
      if (!foundationPrivateKey) {
        throw new Error('Foundation private key not configured');
      }
      
      this.foundationSigner = new ethers.Wallet(foundationPrivateKey, this.provider);
      console.log('Foundation address:', await this.foundationSigner.getAddress());
      
      // 初始化金库合约
      const vaultAddress = getVaultContractAddress('0xC3'); // X Layer Testnet
      this.vaultContract = new ethers.Contract(vaultAddress, VAULT_CONTRACT.ABI, this.foundationSigner);
      
      console.log('✅ Foundation Automation Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Foundation Automation Service initialization failed:', error);
      return false;
    }
  }

  // 启动Foundation自动执行
  // Start Foundation automated execution
  startAutoExecution(intervalMinutes: number = 30): void {
    if (this.isRunning) {
      console.warn('⚠️ Foundation Automation Service is already running');
      return;
    }

    console.log('🔄 Starting Foundation Automated Strategy Execution...');
    this.isRunning = true;

    // 立即执行一次
    this.executeFoundationStrategy();

    // 设置定时执行
    this.executionInterval = setInterval(() => {
      this.executeFoundationStrategy();
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ Foundation Automated Strategy Execution started - executing every ${intervalMinutes} minutes`);
  }

  // 停止Foundation自动执行
  // Stop Foundation automated execution
  stopAutoExecution(): void {
    if (!this.isRunning) {
      console.warn('⚠️ Foundation Automation Service is not running');
      return;
    }

    console.log('🛑 Stopping Foundation Automated Strategy Execution...');
    this.isRunning = false;

    if (this.executionInterval) {
      clearInterval(this.executionInterval);
      this.executionInterval = null;
    }

    console.log('✅ Foundation Automated Strategy Execution stopped');
  }

  // Foundation执行策略的核心逻辑
  // Core logic for Foundation strategy execution
  private async executeFoundationStrategy(): Promise<void> {
    try {
      console.log('🧠 Foundation: Analyzing market and executing strategy...');
      
      // 1. 获取当前市场数据
      const marketData = btcDataService.getCurrentData();
      const marketHeat = btcDataService.getCurrentMarketHeat();
      
      if (!marketData || !marketHeat) {
        console.warn('⚠️ Foundation: No market data available, skipping execution');
        return;
      }

      // 2. 获取AI Agent策略决策
      const strategy = aiAgentService.getCurrentStrategy();
      if (!strategy) {
        console.warn('⚠️ Foundation: No strategy available, skipping execution');
        return;
      }

      console.log('📊 Foundation: Market Analysis:');
      console.log(`   Current BTC Price: $${marketData.currentPrice.toLocaleString()}`);
      console.log(`   Market State: ${marketHeat.status}`);
      console.log(`   AI Agent Strategy: ${(strategy.buyBTC * 100).toFixed(0)}% BTC, ${(strategy.stake * 100).toFixed(0)}% Stake`);

      // 3. 获取金库当前状态
      const vaultInfo = await this.getVaultInfo();
      if (!vaultInfo) {
        console.warn('⚠️ Foundation: Unable to get vault info, skipping execution');
        return;
      }

      console.log('💰 Foundation: Vault Status:');
      console.log(`   Total Assets: ${vaultInfo.totalAssets} USDC`);
      console.log(`   Available for Investment: ${vaultInfo.availableAmount} USDC`);

      // 4. 计算投资金额
      const investmentAmount = this.calculateInvestmentAmount(strategy, vaultInfo.availableAmount);
      if (investmentAmount <= 0) {
        console.log('💤 Foundation: No funds available for investment, skipping execution');
        return;
      }

      // 5. 映射策略参数
      const strategyParams = this.mapStrategyToContractParams(strategy, investmentAmount, marketHeat);

      // 6. 执行策略（演示版本 - 不实际调用合约）
      const executionResult = await this.simulateStrategyExecution(strategyParams);

      // 7. 记录执行结果
      this.recordExecutionResult(executionResult);

      console.log('✅ Foundation: Strategy execution completed successfully');
      console.log(`   Strategy ID: ${executionResult.strategyId}`);
      console.log(`   Investment Amount: ${executionResult.amount} USDC`);
      console.log(`   Market Condition: ${executionResult.marketCondition}`);

    } catch (error) {
      console.error('❌ Foundation: Strategy execution failed:', error);
      this.recordExecutionResult({
        success: false,
        strategyId: 0,
        amount: '0',
        targetToken: '',
        marketCondition: 0,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // 获取金库信息
  // Get vault information
  private async getVaultInfo(): Promise<{
    totalAssets: string;
    totalInvested: string;
    availableAmount: string;
  } | null> {
    try {
      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const totalAssets = await this.vaultContract.totalAssets();
      const totalInvested = await this.vaultContract.totalInvested();
      const availableAmount = totalAssets - totalInvested;

      return {
        totalAssets: ethers.formatUnits(totalAssets, 6), // USDC有6位小数
        totalInvested: ethers.formatUnits(totalInvested, 6),
        availableAmount: ethers.formatUnits(availableAmount, 6)
      };
    } catch (error) {
      console.error('Failed to get vault info:', error);
      return null;
    }
  }

  // 计算投资金额
  // Calculate investment amount
  private calculateInvestmentAmount(strategy: any, availableAmount: string): number {
    const available = parseFloat(availableAmount);
    const btcAllocation = strategy.buyBTC;
    
    // 计算BTC投资金额（策略中BTC比例 * 可用资金）
    const btcInvestment = available * btcAllocation;
    
    // 设置最小投资阈值
    const minInvestment = 10; // 最小10 USDC
    const maxInvestment = available * 0.8; // 最大80%可用资金
    
    return Math.min(Math.max(btcInvestment, minInvestment), maxInvestment);
  }

  // 映射策略到合约参数
  // Map strategy to contract parameters
  private mapStrategyToContractParams(strategy: any, amount: number, marketHeat: any): {
    strategyId: number;
    amount: string;
    targetToken: string;
    marketCondition: number;
  } {
    // 策略ID映射
    const strategyIdMap: { [key: string]: number } = {
      '🔥 火热': 2,        // 激进策略
      '🌤️ 正常偏热': 1,    // 平衡策略
      '🌥️ 平静期': 1,      // 平衡策略
      '😱 恐慌下跌': 0,    // 保守策略
      '🧊 极冷': 0,        // 保守策略
      '❓ 未知': 0         // 保守策略
    };

    // 市场状况映射
    const marketConditionMap: { [key: string]: number } = {
      '🔥 火热': 2,        // 活跃
      '🌤️ 正常偏热': 1,    // 平衡
      '🌥️ 平静期': 1,      // 平衡
      '😱 恐慌下跌': 0,    // 冷淡
      '🧊 极冷': 0,        // 冷淡
      '❓ 未知': 0         // 冷淡
    };

    const strategyId = strategyIdMap[marketHeat.status] || 0;
    const marketCondition = marketConditionMap[marketHeat.status] || 0;
    
    // BTC代币地址（X Layer Testnet上的模拟BTC地址）
    const targetToken = '0x0000000000000000000000000000000000000000'; // 演示用地址

    return {
      strategyId,
      amount: amount.toString(),
      targetToken,
      marketCondition
    };
  }

  // 模拟策略执行（演示版本）
  // Simulate strategy execution (demo version)
  private async simulateStrategyExecution(params: {
    strategyId: number;
    amount: string;
    targetToken: string;
    marketCondition: number;
  }): Promise<FoundationExecutionResult> {
    console.log('🎭 Foundation: Simulating strategy execution (Demo Mode)...');
    
    // 模拟交易延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟交易哈希
    const mockTransactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substring(2, 10)}`;
    
    return {
      success: true,
      strategyId: params.strategyId,
      amount: params.amount,
      targetToken: params.targetToken,
      marketCondition: params.marketCondition,
      timestamp: Date.now(),
      transactionHash: mockTransactionHash
    };
  }

  // 记录执行结果
  // Record execution result
  private recordExecutionResult(result: FoundationExecutionResult): void {
    this.executionHistory.push(result);
    
    // 保持最近100条记录
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100);
    }
    
    console.log('📝 Foundation: Execution result recorded');
  }

  // 获取执行历史
  // Get execution history
  getExecutionHistory(): FoundationExecutionResult[] {
    return [...this.executionHistory];
  }

  // 获取服务状态
  // Get service status
  getStatus(): {
    isRunning: boolean;
    foundationAddress: string | null;
    lastExecution: FoundationExecutionResult | null;
    totalExecutions: number;
  } {
    return {
      isRunning: this.isRunning,
      foundationAddress: this.foundationSigner ? this.foundationSigner.address : null,
      lastExecution: this.executionHistory.length > 0 ? this.executionHistory[this.executionHistory.length - 1] : null,
      totalExecutions: this.executionHistory.length
    };
  }

  // 手动执行策略（用于演示）
  // Manually execute strategy (for demo)
  async manualExecuteStrategy(): Promise<FoundationExecutionResult> {
    console.log('🎯 Foundation: Manual strategy execution triggered...');
    await this.executeFoundationStrategy();
    
    const lastExecution = this.executionHistory[this.executionHistory.length - 1];
    return lastExecution || {
      success: false,
      strategyId: 0,
      amount: '0',
      targetToken: '',
      marketCondition: 0,
      timestamp: Date.now(),
      error: 'No execution result available'
    };
  }
}

// 导出单例实例
// Export singleton instance
export const foundationAutomationService = new FoundationAutomationService(); 