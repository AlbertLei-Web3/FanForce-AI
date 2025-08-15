// FanForce AI - Twitter OAuth API Route
// Twitter OAuth API Route - 重定向到Express服务器的Twitter OAuth端点
// Redirects to Express server Twitter OAuth endpoint

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 获取环境变量中的Express服务器URL / Get Express server URL from environment variables
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3001'
    
    // 构建Twitter OAuth URL / Build Twitter OAuth URL
    const twitterAuthUrl = `${expressServerUrl}/api/auth/twitter`
    
    console.log('🔐 重定向到Twitter OAuth:', twitterAuthUrl)
    
    // 重定向到Express服务器的Twitter OAuth端点 / Redirect to Express server Twitter OAuth endpoint
    return NextResponse.redirect(twitterAuthUrl)
  } catch (error) {
    console.error('❌ Twitter OAuth重定向失败:', error)
    
    // 返回错误响应 / Return error response
    return NextResponse.json(
      { error: 'Failed to redirect to Twitter OAuth' },
      { status: 500 }
    )
  }
}
