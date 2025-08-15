// FanForce AI - Google OAuth API Route
// Google OAuth API Route - 重定向到Express服务器的Google OAuth端点
// Redirects to Express server Google OAuth endpoint

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 获取环境变量中的Express服务器URL / Get Express server URL from environment variables
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3001'
    
    // 构建Google OAuth URL / Build Google OAuth URL
    const googleAuthUrl = `${expressServerUrl}/api/auth/google`
    
    console.log('🔐 重定向到Google OAuth:', googleAuthUrl)
    
    // 重定向到Express服务器的Google OAuth端点 / Redirect to Express server Google OAuth endpoint
    return NextResponse.redirect(googleAuthUrl)
  } catch (error) {
    console.error('❌ Google OAuth重定向失败:', error)
    
    // 返回错误响应 / Return error response
    return NextResponse.json(
      { error: 'Failed to redirect to Google OAuth' },
      { status: 500 }
    )
  }
}
