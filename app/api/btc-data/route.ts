// BTC数据API - 提供实时BTC市场信息
// BTC Data API - Provides real-time BTC market information

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
    
    const response = {
      timestamp: new Date().toISOString(),
      btc: btcData,
      marketHeat: marketHeat,
      formatted: {
        price: `$${btcData.currentPrice.toLocaleString()}`,
        change: `${btcData.priceChange24h >= 0 ? '+' : ''}${btcData.priceChange24h.toFixed(2)}%`,
        volume: `${btcData.volume24h.toLocaleString()} BTC`,
        volumeUSD: `$${btcData.volume24hUSD.toLocaleString()}`,
        high24h: `$${btcData.high24h.toLocaleString()}`,
        low24h: `$${btcData.low24h.toLocaleString()}`
      }
    }
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('❌ Error in BTC data API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get BTC data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 