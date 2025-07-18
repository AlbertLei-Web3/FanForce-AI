// Ambassador Approved Applications API Route
// 大使已批准申请API路由
// This endpoint fetches approved event applications for ambassador dashboard
// 此端点获取大使仪表板的已批准赛事申请

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// GET - Retrieve approved applications for ambassador
// GET - 获取大使的已批准申请
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ambassador_id = searchParams.get('ambassador_id')
    const limit = parseInt(searchParams.get('limit') || '5')

    console.log('Fetching approved applications for ambassador... / 获取大使已批准申请...', { 
      ambassador_id,
      limit
    })

    // Validate required parameters / 验证必需参数
    if (!ambassador_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: ambassador_id',
        error_cn: '缺少必需参数：ambassador_id'
      }, { status: 400 })
    }

    // Get approved event applications / 获取已批准的赛事申请
    const approvedApplications = await query(`
      SELECT 
        id,
        event_title,
        event_description,
        event_start_time,
        venue_name,
        venue_capacity,
        estimated_participants,
        expected_revenue,
        status,
        created_at
      FROM event_applications 
      WHERE ambassador_id = $1 AND status = 'approved'
      ORDER BY created_at DESC
      LIMIT $2
    `, [ambassador_id, limit])

    // Safe JSON parsing function / 安全JSON解析函数
    const safeJsonParse = (value: any, defaultValue: any) => {
      try {
        if (!value) return defaultValue;
        if (typeof value === 'object') return value;
        return JSON.parse(value);
      } catch (error) {
        console.error('JSON parse error:', error, 'Value:', value);
        return defaultValue;
      }
    };

    // Process applications / 处理申请数据
    const processedApplications = approvedApplications.rows.map(app => ({
      id: app.id,
      title: app.event_title,
      titleCn: app.event_title,
      sport: 'General',
      status: 'approved',
      date: new Date(app.event_start_time).toLocaleDateString(),
      time: new Date(app.event_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      venue: {
        name: app.venue_name,
        nameCn: app.venue_name,
        capacity: app.venue_capacity,
        address: '',
        facilities: []
      },
      partyVenue: {
        name: app.venue_name,
        nameCn: app.venue_name,
        capacity: 0,
        address: '',
        facilities: []
      },
      teams: {
        teamA: { name: 'Team A', athletes: [] },
        teamB: { name: 'Team B', athletes: [] }
      },
      audience: {
        registered: app.estimated_participants || 0,
        tier1: Math.floor((app.estimated_participants || 0) * 0.2),
        tier2: Math.floor((app.estimated_participants || 0) * 0.3),
        tier3: Math.floor((app.estimated_participants || 0) * 0.5)
      },
      totalStake: app.expected_revenue || 0,
      inviteCode: `EVT${app.id.slice(0, 8).toUpperCase()}`,
      qrGenerated: false,
      partnersConfirmed: 0,
      revenueProjection: (app.expected_revenue || 0) * 0.01,
      preparation: {
        venueBooked: true,
        athletesSelected: true,
        qrCodeRequested: false,
        merchantsConfirmed: false,
        promotionComplete: false
      },
      createdAt: app.created_at
    }))

    return NextResponse.json({
      success: true,
      applications: processedApplications,
      total: processedApplications.length,
      message: 'Approved applications retrieved successfully',
      message_cn: '已批准申请获取成功'
    })

  } catch (error) {
    console.error('Error fetching approved applications: / 获取已批准申请时出错:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      error_cn: '服务器内部错误'
    }, { status: 500 })
  }
} 