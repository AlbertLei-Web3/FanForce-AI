// Ambassador Event Applications API Route
// 大使赛事申请API路由
// This endpoint handles event application submission for ambassadors
// 此端点处理大使的赛事申请提交

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Event Application Interface
// 赛事申请接口
interface EventApplication {
  id?: string
  ambassador_id: string
  event_title: string
  event_description: string
  event_start_time: string
  event_end_time?: string
  venue_name: string
  venue_address?: string
  venue_capacity: number
  party_venue_capacity?: number
  team_a_info: any
  team_b_info: any
  estimated_participants: number
  expected_revenue?: number
  application_notes?: string
  external_sponsors?: any[]
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
}

// POST - Submit new event application
// POST - 提交新的赛事申请
export async function POST(request: NextRequest) {
  try {
    const body: EventApplication = await request.json()
    
    console.log('Submitting event application... / 提交赛事申请...', {
      ambassador_id: body.ambassador_id,
      event_title: body.event_title,
      venue_name: body.venue_name
    })

    // Validate required fields / 验证必需字段
    if (!body.ambassador_id || !body.event_title || !body.venue_name || !body.event_start_time) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        error_cn: '缺少必需字段'
      }, { status: 400 })
    }

    // Verify ambassador exists and has correct role / 验证大使存在且角色正确
    const ambassadorCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'ambassador'
    `, [body.ambassador_id])

    if (ambassadorCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Ambassador not found or invalid role',
        error_cn: '大使未找到或角色无效'
      }, { status: 404 })
    }

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

    // Insert event application / 插入赛事申请
    const insertQuery = `
      INSERT INTO event_applications (
        ambassador_id,
        event_title,
        event_description,
        event_start_time,
        event_end_time,
        venue_name,
        venue_address,
        venue_capacity,
        party_venue_capacity,
        team_a_info,
        team_b_info,
        estimated_participants,
        expected_revenue,
        application_notes,
        external_sponsors,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `

    const result = await query(insertQuery, [
      body.ambassador_id,
      body.event_title,
      body.event_description || '',
      body.event_start_time,
      body.event_end_time || null,
      body.venue_name,
      body.venue_address || '',
      body.venue_capacity || 100,
      body.party_venue_capacity || 0,
      JSON.stringify(safeJsonParse(body.team_a_info, {})),
      JSON.stringify(safeJsonParse(body.team_b_info, {})),
      body.estimated_participants || 100,
      body.expected_revenue || 0,
      body.application_notes || '',
      JSON.stringify(safeJsonParse(body.external_sponsors, [])),
      'pending'
    ])

    const application = result.rows[0]

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        team_a_info: safeJsonParse(application.team_a_info, {}),
        team_b_info: safeJsonParse(application.team_b_info, {}),
        external_sponsors: safeJsonParse(application.external_sponsors, [])
      },
      message: 'Event application submitted successfully',
      message_cn: '赛事申请提交成功'
    })

  } catch (error) {
    console.error('Error submitting event application: / 提交赛事申请时出错:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      error_cn: '服务器内部错误'
    }, { status: 500 })
  }
}

// GET - Retrieve ambassador's event applications
// GET - 获取大使的赛事申请
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ambassador_id = searchParams.get('ambassador_id')
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    console.log('Fetching ambassador event applications... / 获取大使赛事申请...', { 
      ambassador_id, 
      status, 
      page, 
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

    // Verify ambassador exists / 验证大使存在
    const ambassadorCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'ambassador'
    `, [ambassador_id])

    if (ambassadorCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Ambassador not found or invalid role',
        error_cn: '大使未找到或角色无效'
      }, { status: 404 })
    }

    // Build status filter / 构建状态过滤器
    let statusFilter = ''
    if (status !== 'all') {
      statusFilter = 'AND status = $3'
    }

    // Get applications with pagination / 获取分页的申请列表
    const applicationsQuery = `
      SELECT *
      FROM event_applications
      WHERE ambassador_id = $1 
      ${statusFilter}
      ORDER BY created_at DESC
      LIMIT $2 OFFSET ${status === 'all' ? '$3' : '$4'}
    `

    const queryParams = status === 'all' 
      ? [ambassador_id, limit, offset]
      : [ambassador_id, limit, status, offset]

    const applications = await query(applicationsQuery, queryParams)

    // Get total count for pagination / 获取分页总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM event_applications
      WHERE ambassador_id = $1 ${statusFilter}
    `

    const countParams = status === 'all' 
      ? [ambassador_id]
      : [ambassador_id, status]

    const countResult = await query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].total)

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
    const processedApplications = applications.rows.map(app => ({
      ...app,
      team_a_info: safeJsonParse(app.team_a_info, {}),
      team_b_info: safeJsonParse(app.team_b_info, {}),
      external_sponsors: safeJsonParse(app.external_sponsors, [])
    }))

    return NextResponse.json({
      success: true,
      applications: processedApplications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      message: 'Applications retrieved successfully',
      message_cn: '申请获取成功'
    })

  } catch (error) {
    console.error('Error fetching applications: / 获取申请时出错:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      error_cn: '服务器内部错误'
    }, { status: 500 })
  }
} 