// 规则引擎策略API - 提供策略信息和策略更新
// Rule Engine Strategy API - Provides strategy information and updates

import { NextRequest, NextResponse } from 'next/server'
import { aiAgentService } from '@/app/services/aiAgentService'

export async function GET(request: NextRequest) {
  try {
    // 获取当前策略信息
    // Get current strategy information
    const strategy = aiAgentService.getCurrentStrategy()
    const portfolio = aiAgentService.getCurrentPortfolio()
    
    if (!strategy) {
      return NextResponse.json(
        { error: 'No strategy available' },
        { status: 404 }
      )
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      strategy: {
        ...strategy,
        portfolio: portfolio
      },
      analysis: {
        marketState: strategy.marketState,
        riskLevel: strategy.riskLevel,
        allocation: {
          btc: strategy.buyBTC,
          stake: strategy.stake,
          btcPercentage: `${(strategy.buyBTC * 100).toFixed(1)}%`,
          stakePercentage: `${(strategy.stake * 100).toFixed(1)}%`
        }
      },
      recommendations: {
        summary: strategy.summary,
        recommendation: strategy.recommendation,
        nextUpdate: new Date(Date.now() + 30000).toISOString() // 30 seconds from now
      }
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('❌ Error in strategy API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get strategy information',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, totalFunds } = body
    
    switch (action) {
      case 'setTotalFunds':
        if (typeof totalFunds === 'number' && totalFunds > 0) {
          aiAgentService.setTotalFunds(totalFunds)
          return NextResponse.json(
            { 
              success: true,
              message: 'Total funds updated successfully',
              newTotalFunds: totalFunds
            },
            { status: 200 }
          )
        } else {
          return NextResponse.json(
            { error: 'Invalid totalFunds value' },
            { status: 400 }
          )
        }
        
      case 'start':
        aiAgentService.start()
        return NextResponse.json(
          { 
            success: true,
            message: 'AI Agent Service started successfully'
          },
          { status: 200 }
        )
        
      case 'stop':
        aiAgentService.stop()
        return NextResponse.json(
          { 
            success: true,
            message: 'AI Agent Service stopped successfully'
          },
          { status: 200 }
        )
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('❌ Error in strategy API POST:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update strategy',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 