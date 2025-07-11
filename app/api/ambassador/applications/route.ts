// Ambassador Event Applications API Route
// 大使活动申请API路由
// This endpoint handles event application creation and management for ambassadors
// 此端点处理大使的活动申请创建和管理
//
// Related files:
// - lib/phase2-schema.sql: Event applications database schema
// - app/dashboard/ambassador/page.tsx: Ambassador dashboard frontend
// - app/api/admin/event-review/route.ts: Admin review API
//
// 相关文件：
// - lib/phase2-schema.sql: 活动申请数据库架构
// - app/dashboard/ambassador/page.tsx: 大使仪表板前端
// - app/api/admin/event-review/route.ts: 管理员审核API

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Event Application Interface
// 活动申请接口
interface EventApplication {
  id?: string
  ambassador_id: string
  event_title: string
  event_description?: string
  event_start_time: string
  event_end_time?: string
  venue_name: string
  venue_address?: string
  venue_capacity: number
  party_venue_capacity: number
  team_a_info: any
  team_b_info: any
  estimated_participants: number
  application_notes?: string
  external_sponsors?: any[]
}

// GET - Retrieve ambassador's event applications
// GET - 获取大使的活动申请
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ambassador_id = searchParams.get('ambassador_id')
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    console.log('Fetching ambassador event applications...', { ambassador_id, status, page, limit })
    console.log('获取大使活动申请...', { ambassador_id, status, page, limit })

    // Validate required parameters
    // 验证必需参数
    if (!ambassador_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: ambassador_id',
        error_cn: '缺少必需参数：ambassador_id'
      }, { status: 400 })
    }

    // Verify ambassador exists and has correct role
    // 验证大使存在且角色正确
    const ambassadorCheck = await query(`
      SELECT id, role, profile_data 
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

    // Build status filter
    // 构建状态过滤器
    let statusFilter = ''
    if (status !== 'all') {
      statusFilter = 'AND status = $3'
    }

    // Get applications with pagination
    // 获取分页的申请列表
    const applicationsQuery = `
      SELECT 
        ea.*,
        (ea.qr_valid_from <= NOW() AND ea.qr_valid_until >= NOW()) as qr_currently_valid,
        CASE 
          WHEN ea.qr_valid_from > NOW() THEN 'pending'
          WHEN ea.qr_valid_from <= NOW() AND ea.qr_valid_until >= NOW() THEN 'active'
          WHEN ea.qr_valid_until < NOW() THEN 'expired'
          ELSE 'unknown'
        END as qr_status,
        (
          SELECT json_build_object(
            'qr_content', eqr.qr_content,
            'verification_code', eqr.verification_code,
            'current_status', eqr.current_status,
            'scans_count', eqr.scans_count,
            'successful_scans', eqr.successful_scans
          )
          FROM event_qr_codes eqr 
          WHERE eqr.application_id = ea.id
          LIMIT 1
        ) as qr_code_info
      FROM event_applications ea
      WHERE ea.ambassador_id = $1 
      ${statusFilter}
      ORDER BY ea.created_at DESC
      LIMIT $2 OFFSET ${status === 'all' ? '$3' : '$4'}
    `

    const queryParams = status === 'all' 
      ? [ambassador_id, limit, offset]
      : [ambassador_id, limit, status, offset]

    const applications = await query(applicationsQuery, queryParams)

    // Get total count for pagination
    // 获取分页总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM event_applications
      WHERE ambassador_id = $1 ${statusFilter}
    `
    const countParams = status === 'all' ? [ambassador_id] : [ambassador_id, status]
    const totalCount = await query(countQuery, countParams)

    // Get status summary
    // 获取状态汇总
    const statusSummary = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM event_applications
      WHERE ambassador_id = $1
      GROUP BY status
    `, [ambassador_id])

    // Calculate QR timing for each application
    // 为每个申请计算QR时效
    const enhancedApplications = applications.rows.map(app => ({
      ...app,
      qr_timing: {
        event_start: app.event_start_time,
        qr_valid_from: app.qr_valid_from,
        qr_valid_until: app.qr_valid_until,
        currently_valid: app.qr_currently_valid,
        status: app.qr_status,
        hours_until_valid: app.qr_valid_from > new Date() 
          ? Math.ceil((new Date(app.qr_valid_from).getTime() - new Date().getTime()) / (1000 * 60 * 60))
          : 0,
        hours_remaining: app.qr_valid_until > new Date() && app.qr_valid_from <= new Date()
          ? Math.ceil((new Date(app.qr_valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60))
          : 0
      },
      team_info: {
        team_a: app.team_a_info,
        team_b: app.team_b_info
      },
      venue_info: {
        name: app.venue_name,
        address: app.venue_address,
        capacity: app.venue_capacity,
        party_capacity: app.party_venue_capacity
      }
    }))

    return NextResponse.json({
      success: true,
      applications: enhancedApplications,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount.rows[0].total),
        totalPages: Math.ceil(parseInt(totalCount.rows[0].total) / limit)
      },
      status_summary: statusSummary.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count)
        return acc
      }, {} as Record<string, number>),
      ambassador_info: {
        id: ambassadorCheck.rows[0].id,
        profile: ambassadorCheck.rows[0].profile_data
      },
      message: 'Event applications retrieved successfully',
      message_cn: '活动申请获取成功'
    })

  } catch (error) {
    console.error('Error fetching ambassador applications:', error)
    console.error('获取大使申请错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch event applications',
      error_cn: '获取活动申请失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create new event application
// POST - 创建新的活动申请
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ambassador_id,
      event_title,
      event_description,
      event_start_time,
      event_end_time,
      venue_name,
      venue_address,
      venue_capacity,
      party_venue_capacity = 0,
      team_a_info,
      team_b_info,
      estimated_participants,
      application_notes,
      external_sponsors = []
    } = body

    console.log('Creating new event application:', { ambassador_id, event_title, event_start_time })
    console.log('创建新活动申请:', { ambassador_id, event_title, event_start_time })

    // Validate required fields
    // 验证必填字段
    const requiredFields = {
      ambassador_id: 'Ambassador ID',
      event_title: 'Event title',
      event_start_time: 'Event start time',
      venue_name: 'Venue name',
      venue_capacity: 'Venue capacity',
      team_a_info: 'Team A information',
      team_b_info: 'Team B information'
    }

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${label}`,
          error_cn: `缺少必填字段: ${label}`,
          field: field
        }, { status: 400 })
      }
    }

    // Validate ambassador exists and role
    // 验证大使存在且角色正确
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

    // Validate event timing (must be in future)
    // 验证活动时间（必须是未来时间）
    const eventStart = new Date(event_start_time)
    const now = new Date()
    const minStartTime = new Date(now.getTime() + (24 * 60 * 60 * 1000)) // 24 hours from now

    if (eventStart <= minStartTime) {
      return NextResponse.json({
        success: false,
        error: 'Event must be scheduled at least 24 hours in advance',
        error_cn: '活动必须提前至少24小时安排',
        minimum_start_time: minStartTime.toISOString()
      }, { status: 400 })
    }

    // Check concurrent events limit for ambassador
    // 检查大使的并发活动限制
    const concurrentEventsCheck = await query(`
      SELECT COUNT(*) as active_events
      FROM event_applications
      WHERE ambassador_id = $1 
      AND status IN ('pending', 'approved')
      AND event_start_time > NOW()
    `, [ambassador_id])

    const maxEventsConfig = await query(`
      SELECT config_value 
      FROM system_config 
      WHERE config_key = 'max_events_per_ambassador' AND is_active = true
    `)

    const maxEvents = parseInt(maxEventsConfig.rows[0]?.config_value || '5')
    const currentActiveEvents = parseInt(concurrentEventsCheck.rows[0].active_events)

    if (currentActiveEvents >= maxEvents) {
      return NextResponse.json({
        success: false,
        error: `Maximum concurrent events limit reached (${maxEvents})`,
        error_cn: `已达到最大并发活动限制 (${maxEvents})`,
        current_active_events: currentActiveEvents,
        max_allowed: maxEvents
      }, { status: 400 })
    }

    // Validate venue capacity
    // 验证场馆容量
    if (venue_capacity < 10) {
      return NextResponse.json({
        success: false,
        error: 'Venue capacity must be at least 10',
        error_cn: '场馆容量至少为10人'
      }, { status: 400 })
    }

    if (party_venue_capacity > venue_capacity) {
      return NextResponse.json({
        success: false,
        error: 'Party venue capacity cannot exceed main venue capacity',
        error_cn: '聚会场馆容量不能超过主场馆容量'
      }, { status: 400 })
    }

    // Validate team information
    // 验证队伍信息
    if (!team_a_info.name || !team_b_info.name) {
      return NextResponse.json({
        success: false,
        error: 'Both teams must have names',
        error_cn: '两支队伍都必须有名称'
      }, { status: 400 })
    }

    // Create the event application
    // 创建活动申请
    const insertQuery = `
      INSERT INTO event_applications (
        ambassador_id, event_title, event_description, event_start_time, event_end_time,
        venue_name, venue_address, venue_capacity, party_venue_capacity,
        team_a_info, team_b_info, estimated_participants, application_notes, external_sponsors
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *
    `

    const newApplication = await query(insertQuery, [
      ambassador_id, event_title, event_description, event_start_time, event_end_time,
      venue_name, venue_address, venue_capacity, party_venue_capacity,
      JSON.stringify(team_a_info), JSON.stringify(team_b_info), 
      estimated_participants, application_notes, JSON.stringify(external_sponsors)
    ])

    const application = newApplication.rows[0]

    // Log the application creation in admin activity
    // 在管理员活动中记录申请创建
    await query(`
      INSERT INTO admin_activity_log (admin_id, action_type, action_details, affected_user_id, success)
      VALUES ($1, 'event_application_created', $2, $1, true)
    `, [
      ambassador_id,
      JSON.stringify({
        application_id: application.id,
        event_title: event_title,
        event_start_time: event_start_time,
        venue_name: venue_name,
        estimated_participants: estimated_participants
      })
    ])

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        team_a_info: JSON.parse(application.team_a_info),
        team_b_info: JSON.parse(application.team_b_info),
        external_sponsors: JSON.parse(application.external_sponsors || '[]'),
        qr_timing: {
          event_start: application.event_start_time,
          qr_valid_from: application.qr_valid_from,
          qr_valid_until: application.qr_valid_until,
          total_valid_hours: 4
        }
      },
      message: 'Event application created successfully',
      message_cn: '活动申请创建成功',
      next_steps: [
        'Wait for admin review',
        'QR code will be generated upon approval',
        'Check application status regularly'
      ],
      next_steps_cn: [
        '等待管理员审核',
        '批准后将生成QR码',
        '定期检查申请状态'
      ]
    })

  } catch (error) {
    console.error('Error creating event application:', error)
    console.error('创建活动申请错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create event application',
      error_cn: '创建活动申请失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update event application (only if pending)
// PUT - 更新活动申请（仅限待审核状态）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { application_id, ambassador_id, ...updateFields } = body

    console.log('Updating event application:', { application_id, ambassador_id })
    console.log('更新活动申请:', { application_id, ambassador_id })

    // Validate required parameters
    // 验证必需参数
    if (!application_id || !ambassador_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: application_id and ambassador_id',
        error_cn: '缺少必需参数：application_id 和 ambassador_id'
      }, { status: 400 })
    }

    // Check if application exists and belongs to ambassador
    // 检查申请是否存在且属于该大使
    const applicationCheck = await query(`
      SELECT * FROM event_applications
      WHERE id = $1 AND ambassador_id = $2
    `, [application_id, ambassador_id])

    if (applicationCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Application not found or access denied',
        error_cn: '申请未找到或访问被拒绝'
      }, { status: 404 })
    }

    const currentApplication = applicationCheck.rows[0]

    // Check if application is still editable (only pending applications)
    // 检查申请是否仍可编辑（仅限待审核申请）
    if (currentApplication.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: `Cannot edit application with status: ${currentApplication.status}`,
        error_cn: `无法编辑状态为 ${currentApplication.status} 的申请`,
        current_status: currentApplication.status,
        editable_statuses: ['pending']
      }, { status: 400 })
    }

    // Build update query dynamically
    // 动态构建更新查询
    const allowedFields = [
      'event_title', 'event_description', 'event_start_time', 'event_end_time',
      'venue_name', 'venue_address', 'venue_capacity', 'party_venue_capacity',
      'team_a_info', 'team_b_info', 'estimated_participants', 'application_notes', 'external_sponsors'
    ]

    const updateParams = []
    const updateSetClauses = []
    let paramCounter = 1

    for (const [field, value] of Object.entries(updateFields)) {
      if (allowedFields.includes(field) && value !== undefined) {
        if (field.includes('_info') || field === 'external_sponsors') {
          updateSetClauses.push(`${field} = $${paramCounter}`)
          updateParams.push(JSON.stringify(value))
        } else {
          updateSetClauses.push(`${field} = $${paramCounter}`)
          updateParams.push(value)
        }
        paramCounter++
      }
    }

    if (updateSetClauses.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid fields to update',
        error_cn: '没有有效的字段可更新',
        allowed_fields: allowedFields
      }, { status: 400 })
    }

    // Add updated_at
    updateSetClauses.push(`updated_at = CURRENT_TIMESTAMP`)

    // Add WHERE clause parameters
    updateParams.push(application_id, ambassador_id)

    const updateQuery = `
      UPDATE event_applications 
      SET ${updateSetClauses.join(', ')}
      WHERE id = $${paramCounter} AND ambassador_id = $${paramCounter + 1}
      RETURNING *
    `

    const updatedApplication = await query(updateQuery, updateParams)

    // Log the update activity
    // 记录更新活动
    await query(`
      INSERT INTO admin_activity_log (admin_id, action_type, action_details, affected_user_id, success)
      VALUES ($1, 'event_application_updated', $2, $1, true)
    `, [
      ambassador_id,
      JSON.stringify({
        application_id: application_id,
        updated_fields: Object.keys(updateFields),
        update_time: new Date().toISOString()
      })
    ])

    const application = updatedApplication.rows[0]

    return NextResponse.json({
      success: true,
      application: {
        ...application,
        team_a_info: JSON.parse(application.team_a_info),
        team_b_info: JSON.parse(application.team_b_info),
        external_sponsors: JSON.parse(application.external_sponsors || '[]'),
        qr_timing: {
          event_start: application.event_start_time,
          qr_valid_from: application.qr_valid_from,
          qr_valid_until: application.qr_valid_until,
          total_valid_hours: 4
        }
      },
      message: 'Event application updated successfully',
      message_cn: '活动申请更新成功'
    })

  } catch (error) {
    console.error('Error updating event application:', error)
    console.error('更新活动申请错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update event application',
      error_cn: '更新活动申请失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 