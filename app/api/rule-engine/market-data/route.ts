// 规则引擎市场数据API - 提供实时BTC市场数据和市场热度分析
// Rule Engine Market Data API - Provides real-time BTC market data and market heat analysis

import { NextRequest, NextResponse } from 'next/server'
import { btcDataService } from '@/app/services/btcDataService'

export async function GET(request: NextRequest) {
  try {
    // 获取当前BTC数据
    // Get current BTC data
    const btcData = btcDataService.getCurrentData()
    const marketHeat = btcDataService.getCurrentMarketHeat()
    
    if (!btcData) {
      return NextResponse.json(
        { error: 'No BTC data available' },
        { status: 404 }
      )
    }
    
    // 构建市场分析
    // Build market analysis
    const marketAnalysis = {
      currentPrice: btcData.currentPrice,
      priceChange: {
        percentage: btcData.priceChange24h,
        absolute: btcData.currentPrice - (btcData.currentPrice / (1 + btcData.priceChange24h / 100)),
        direction: btcData.priceChange24h >= 0 ? 'up' : 'down'
      },
      volume: {
        btc: btcData.volume24h,
        usd: btcData.volume24hUSD,
        formatted: {
          btc: btcData.volume24h.toLocaleString(),
          usd: btcData.volume24hUSD.toLocaleString()
        }
      },
      range: {
        high24h: btcData.high24h,
        low24h: btcData.low24h,
        spread: ((btcData.high24h - btcData.low24h) / btcData.low24h * 100).toFixed(2)
      }
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      data: btcData,
      marketHeat: marketHeat,
      analysis: marketAnalysis,
      updateInfo: {
        lastUpdated: btcData.lastUpdated,
        nextUpdate: new Date(Date.now() + 30000).toISOString(), // 30 seconds from now
        updateFrequency: '30 seconds'
      }
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('❌ Error in market data API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get market data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    switch (action) {
      case 'start':
        btcDataService.start()
        return NextResponse.json(
          { 
            success: true,
            message: 'BTC Data Service started successfully'
          },
          { status: 200 }
        )
        
      case 'stop':
        btcDataService.stop()
        return NextResponse.json(
          { 
            success: true,
            message: 'BTC Data Service stopped successfully'
          },
          { status: 200 }
        )
        
      case 'refresh':
        // 手动触发数据刷新
        // Manually trigger data refresh
        await btcDataService.initialize()
        return NextResponse.json(
          { 
            success: true,
            message: 'Data refresh triggered successfully'
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
    console.error('❌ Error in market data API POST:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update market data service',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 