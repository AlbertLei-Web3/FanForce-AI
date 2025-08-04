// BTC数据API - 提供实时BTC市场信息
// BTC Data API - Provides real-time BTC market information

import { NextRequest, NextResponse } from 'next/server'
import { btcDataService } from '@/app/services/btcDataService'

export async function GET(request: NextRequest) {
  try {
    // 直接获取BTC数据，如果服务没有运行则启动它
    let btcData = btcDataService.getCurrentData()
    let serviceStatus = btcDataService.getStatus()
    
    console.log('🔍 BTC API Debug - Initial Check:', {
      hasData: !!btcData,
      isRunning: serviceStatus.isRunning,
      serviceHasData: serviceStatus.hasData
    })
    
    // 如果服务没有运行或没有数据，尝试启动服务并获取数据
    if (!serviceStatus.isRunning || !btcData) {
      console.log('🔄 Starting BTC Data Service from API...')
      try {
        await btcDataService.initialize()
        btcDataService.start()
        
        // 等待服务启动并获取数据
        let attempts = 0
        while (!btcData && attempts < 3) {
          console.log(`🔄 Attempt ${attempts + 1}: Waiting for BTC data...`)
          await new Promise(resolve => setTimeout(resolve, 2000)) // 等待2秒
          btcData = btcDataService.getCurrentData()
          serviceStatus = btcDataService.getStatus()
          attempts++
        }
      } catch (error) {
        console.error('❌ Error starting BTC service:', error)
      }
    }
    
    const marketHeat = btcDataService.getCurrentMarketHeat()
    
    console.log('🔍 BTC API Debug - Final Check:', {
      hasData: !!btcData,
      dataKeys: btcData ? Object.keys(btcData) : null,
      currentPrice: btcData?.currentPrice,
      marketHeat: marketHeat,
      serviceStatus: serviceStatus
    })
    
    if (!btcData) {
      console.log('🔄 Service data not available, trying direct API call...')
      
      // 如果服务数据不可用，直接调用OKX API
      try {
        const response = await fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.code === '0' && data.data && data.data[0]) {
            const btcDataFromAPI = data.data[0];
            
            // 计算24小时价格变化
            const currentPrice = parseFloat(btcDataFromAPI.last);
            const openPrice = parseFloat(btcDataFromAPI.open24h);
            const priceChange = ((currentPrice - openPrice) / openPrice) * 100;

            btcData = {
              currentPrice: currentPrice,
              high24h: parseFloat(btcDataFromAPI.high24h),
              low24h: parseFloat(btcDataFromAPI.low24h),
              volume24h: parseFloat(btcDataFromAPI.vol24h),
              volume24hUSD: parseFloat(btcDataFromAPI.volCcy24h),
              priceChange24h: priceChange,
              timestamp: parseInt(btcDataFromAPI.ts),
              lastUpdated: new Date(parseInt(btcDataFromAPI.ts)).toISOString()
            };
            
            console.log('✅ Direct API call successful:', btcData);
          }
        }
      } catch (error) {
        console.error('❌ Direct API call failed:', error);
      }
      
      if (!btcData) {
        // 返回服务状态而不是404错误
        return NextResponse.json({
          timestamp: new Date().toISOString(),
          error: 'No BTC data available yet',
          serviceStatus: serviceStatus,
          marketHeat: marketHeat,
          message: 'Service is starting up, please try again in a few seconds'
        }, { status: 200 })
      }
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      btc: btcData,
      marketHeat: marketHeat,
      serviceStatus: serviceStatus,
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