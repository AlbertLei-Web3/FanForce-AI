// 规则引擎状态API - 提供实时系统状态信息
// Rule Engine Status API - Provides real-time system status information

import { NextRequest, NextResponse } from 'next/server'
import { btcDataService } from '@/app/services/btcDataService'
import { aiAgentService } from '@/app/services/aiAgentService'

export async function GET(request: NextRequest) {
  try {
    // 获取系统状态
    // Get system status
    const btcStatus = btcDataService.getStatus()
    const aiAgentStatus = aiAgentService.getStatus()
    
    // 获取当前数据
    // Get current data
    const btcData = btcDataService.getCurrentData()
    const marketHeat = btcDataService.getCurrentMarketHeat()
    const strategy = aiAgentService.getCurrentStrategy()
    const portfolio = aiAgentService.getCurrentPortfolio()
    
    // 构建响应数据
    // Build response data
    const response = {
      timestamp: new Date().toISOString(),
      system: {
        btcDataService: btcStatus,
        aiAgentService: aiAgentStatus,
        overall: {
          isRunning: btcStatus.isRunning && aiAgentStatus.isRunning,
          lastUpdate: btcStatus.lastUpdate || aiAgentStatus.lastUpdate,
          status: 'operational'
        }
      },
      data: {
        btc: btcData,
        marketHeat: marketHeat,
        strategy: strategy,
        portfolio: portfolio
      },
      summary: {
        currentPrice: btcData?.currentPrice || 0,
        marketState: marketHeat?.status || 'Unknown',
        riskLevel: strategy?.riskLevel || 'Unknown',
        btcAllocation: portfolio?.btcPercentage || '0%',
        stakeAllocation: portfolio?.stakePercentage || '100%'
      }
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('❌ Error in rule engine status API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get rule engine status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 