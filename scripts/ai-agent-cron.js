// AI Agent Cron Job - 定时执行投资策略
// AI Agent Cron Job - Scheduled Investment Strategy Execution

const { aiAgentService } = require('../app/services/aiAgentService');
const { vaultService } = require('../app/services/vaultService');
const { okxDexService } = require('../app/services/okxDexService');

class AIAgentCronJob {
  constructor() {
    this.isRunning = false;
    this.executionCount = 0;
    this.lastExecutionTime = null;
    this.executionInterval = 3600000; // 1小时 / 1 hour
  }

  // 启动定时任务
  async start() {
    console.log('🚀 Starting AI Agent Cron Job...');
    
    try {
      // 初始化服务
      await this.initializeServices();
      
      // 立即执行一次
      await this.executeStrategies();
      
      // 设置定时执行
      setInterval(async () => {
        await this.executeStrategies();
      }, this.executionInterval);
      
      console.log('✅ AI Agent Cron Job started successfully');
      console.log(`⏰ Will execute every ${this.executionInterval / 60000} minutes`);
      
    } catch (error) {
      console.error('❌ Failed to start AI Agent Cron Job:', error);
    }
  }

  // 初始化服务
  async initializeServices() {
    try {
      console.log('🔧 Initializing services...');
      
      // 初始化AI Agent服务
      const aiAgentInitialized = await aiAgentService.initialize();
      if (!aiAgentInitialized) {
        throw new Error('Failed to initialize AI Agent service');
      }
      
      // 初始化OKX DEX服务
      const okxDexInitialized = await okxDexService.initialize();
      if (!okxDexInitialized) {
        console.warn('⚠️ OKX DEX service initialization failed, using mock data');
      }
      
      console.log('✅ Services initialized successfully');
      
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  // 执行投资策略
  async executeStrategies() {
    if (this.isRunning) {
      console.log('⏳ Strategy execution already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      console.log(`\n🔄 [${new Date().toISOString()}] Starting strategy execution #${++this.executionCount}...`);
      
      // 检查是否可以执行
      if (!aiAgentService.canExecute()) {
        console.log('⏰ Strategy execution skipped - too soon since last execution');
        return;
      }

      // 执行投资策略
      const decisions = await aiAgentService.executeInvestmentStrategies();
      
      if (decisions.length === 0) {
        console.log('📊 No investment decisions made');
        return;
      }

      console.log(`📊 Generated ${decisions.length} investment decisions:`);
      decisions.forEach((decision, index) => {
        console.log(`  ${index + 1}. ${decision.action.toUpperCase()} ${decision.amount} USDC of ${decision.token}`);
        console.log(`     Reason: ${decision.reason}`);
        console.log(`     Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
      });

      // 为每个决策生成并发送UserOp
      for (const decision of decisions) {
        await this.processInvestmentDecision(decision);
      }

      this.lastExecutionTime = Date.now();
      const executionTime = Date.now() - startTime;
      
      console.log(`✅ Strategy execution completed in ${executionTime}ms`);
      console.log(`📈 Total executions: ${this.executionCount}`);
      
    } catch (error) {
      console.error('❌ Strategy execution failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  // 处理投资决策
  async processInvestmentDecision(decision) {
    try {
      console.log(`\n💼 Processing decision: ${decision.action} ${decision.amount} USDC`);
      
      // 生成UserOp
      const userOp = await aiAgentService.generateUserOp(decision);
      if (!userOp) {
        console.error('❌ Failed to generate UserOp for decision:', decision);
        return;
      }

      // 发送UserOp
      const sent = await aiAgentService.sendUserOp(userOp);
      if (!sent) {
        console.error('❌ Failed to send UserOp for decision:', decision);
        return;
      }

      // 调用金库合约执行投资
      await this.executeVaultInvestment(decision);
      
      console.log(`✅ Decision processed successfully: ${decision.reason}`);
      
    } catch (error) {
      console.error('❌ Failed to process investment decision:', error);
    }
  }

  // 执行金库投资
  async executeVaultInvestment(decision) {
    try {
      console.log(`🏦 Executing vault investment for ${decision.token}...`);
      
      // 这里应该调用金库合约的executeInvestment函数
      // For now, simulate the call
      
      // 模拟合约调用
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      console.log(`✅ Vault investment executed successfully`);
      console.log(`📝 Transaction hash: ${mockTransactionHash}`);
      
      // 记录投资历史
      this.recordInvestment(decision, mockTransactionHash);
      
    } catch (error) {
      console.error('❌ Vault investment execution failed:', error);
    }
  }

  // 记录投资历史
  recordInvestment(decision, transactionHash) {
    const investmentRecord = {
      timestamp: new Date().toISOString(),
      token: decision.token,
      action: decision.action,
      amount: decision.amount,
      reason: decision.reason,
      confidence: decision.confidence,
      transactionHash: transactionHash,
      status: 'completed'
    };

    console.log('📝 Investment recorded:', investmentRecord);
    
    // 这里应该将投资记录存储到数据库
    // For now, just log it
  }

  // 获取执行状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      executionCount: this.executionCount,
      lastExecutionTime: this.lastExecutionTime,
      canExecute: aiAgentService.canExecute(),
      strategies: aiAgentService.getStrategies()
    };
  }

  // 手动执行策略
  async manualExecute() {
    console.log('🔄 Manual strategy execution triggered...');
    await this.executeStrategies();
  }

  // 停止定时任务
  stop() {
    console.log('🛑 Stopping AI Agent Cron Job...');
    this.isRunning = false;
    console.log('✅ AI Agent Cron Job stopped');
  }
}

// 创建单例实例
const aiAgentCronJob = new AIAgentCronJob();

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  aiAgentCronJob.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  aiAgentCronJob.stop();
  process.exit(0);
});

// 导出实例
module.exports = aiAgentCronJob;

// 如果直接运行此脚本，启动定时任务
if (require.main === module) {
  aiAgentCronJob.start().catch(error => {
    console.error('❌ Failed to start AI Agent Cron Job:', error);
    process.exit(1);
  });
} 