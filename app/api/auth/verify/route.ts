// FanForce AI - OAuth Token验证API
// OAuth Token Verification API - 验证OAuth token并获取用户信息
// Verifies OAuth token and retrieves user information

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token, authType } = await request.json()

    console.log('🔐 验证OAuth token:', { token, authType })

    if (!token || !authType) {
      return NextResponse.json(
        { error: 'Missing token or authType' },
        { status: 400 }
      )
    }

    // 获取环境变量中的Express服务器URL / Get Express server URL from environment variables
    const expressServerUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:3001'
    
    // 调用Express服务器验证token / Call Express server to verify token
    const verifyResponse = await fetch(`${expressServerUrl}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ authType })
    })

    if (!verifyResponse.ok) {
      console.error('❌ Express服务器token验证失败:', verifyResponse.status)
      return NextResponse.json(
        { error: 'Token verification failed' },
        { status: 401 }
      )
    }

    const userData = await verifyResponse.json()
    console.log('✅ Token验证成功，用户数据:', userData)

    return NextResponse.json({
      success: true,
      user: userData.user,
      isNewUser: userData.isNewUser
    })

  } catch (error) {
    console.error('❌ OAuth token验证失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
