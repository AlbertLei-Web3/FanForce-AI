// Admin Event Applications Review API Route
// 管理员活动申请审核API路由
// This endpoint handles admin review of event applications and QR code generation
// 此端点处理管理员对活动申请的审核和QR码生成
//
// Related files:
// - app/api/ambassador/applications/route.ts: Ambassador application API
// - lib/phase2-schema.sql: Event applications database schema
// - app/dashboard/admin/page.tsx: Admin dashboard frontend
//
// 相关文件：
// - app/api/ambassador/applications/route.ts: 大使申请API
// - lib/phase2-schema.sql: 活动申请数据库架构
// - app/dashboard/admin/page.tsx: 管理员仪表板前端

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'
import { v4 as uuidv4 } from 'uuid'

// QR Code Generation Function
// QR码生成函数
function generateQRCode(applicationId: string, eventTitle: string): { qr_content: string, verification_code: string } {
  const verification_code = uuidv4().split('-').join('').substring(0, 12).toLowerCase()
  const qr_content = `https://fanforce.ai/event/scan/${verification_code}`
  
  return {
    qr_content,
    verification_code
  }
}

// GET - Retrieve all event applications for admin review
// GET - 获取所有活动申请供管理员审核
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const admin_id = searchParams.get('admin_id')
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    const priority = searchParams.get('priority') || 'all'
    const sort = searchParams.get('sort') || 'created_at_desc'

    console.log('Fetching event applications for admin review...', { admin_id, status, page, limit, priority, sort })
    console.log('获取活动申请供管理员审核...', { admin_id, status, page, limit, priority, sort })

    // Validate admin
    // 验证管理员
    if (!admin_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: admin_id',
        error_cn: '缺少必需参数：admin_id'
      }, { status: 400 })
    }

    const adminCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'admin'
    `, [admin_id])

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found or invalid role',
        error_cn: '管理员未找到或角色无效'
      }, { status: 404 })
    }

    // Build filters
    // 构建过滤器
    let statusFilter = ''
    let priorityFilter = ''
    let queryParams = []
    let paramCounter = 1

    if (status !== 'all') {
      statusFilter = `AND status = $${paramCounter}`
      queryParams.push(status)
      paramCounter++
    }

    if (priority !== 'all') {
      priorityFilter = `AND priority_level = $${paramCounter}`
      queryParams.push(parseInt(priority))
      paramCounter++
    }

    // Build sort clause
    // 构建排序子句
    let sortClause = ''
    switch (sort) {
      case 'created_at_desc':
        sortClause = 'ORDER BY ea.created_at DESC'
        break
      case 'created_at_asc':
        sortClause = 'ORDER BY ea.created_at ASC'
        break
      case 'event_start_desc':
        sortClause = 'ORDER BY ea.event_start_time DESC'
        break
      case 'event_start_asc':
        sortClause = 'ORDER BY ea.event_start_time ASC'
        break
      case 'priority_desc':
        sortClause = 'ORDER BY ea.priority_level DESC, ea.created_at DESC'
        break
      default:
        sortClause = 'ORDER BY ea.created_at DESC'
    }

    // Get applications with ambassador info
    // 获取带有大使信息的申请
    const applicationsQuery = `
      SELECT 
        ea.*,
        u.profile_data as ambassador_profile,
        u.username as ambassador_username,
        u.wallet_address as ambassador_wallet,
        (ea.qr_valid_from <= NOW() AND ea.qr_valid_until >= NOW()) as qr_currently_valid,
        CASE 
          WHEN ea.qr_valid_from > NOW() THEN 'pending'
          WHEN ea.qr_valid_from <= NOW() AND ea.qr_valid_until >= NOW() THEN 'active'
          WHEN ea.qr_valid_until < NOW() THEN 'expired'
          ELSE 'unknown'
        END as qr_status,
        (
          SELECT json_build_object(
            'id', eqr.id,
            'qr_content', eqr.qr_content,
            'verification_code', eqr.verification_code,
            'current_status', eqr.current_status,
            'scans_count', eqr.scans_count,
            'successful_scans', eqr.successful_scans,
            'failed_scans', eqr.failed_scans,
            'last_scan_time', eqr.last_scan_time
          )
          FROM event_qr_codes eqr 
          WHERE eqr.application_id = ea.id
          LIMIT 1
        ) as qr_code_info,
        (
          SELECT COUNT(*)
          FROM event_participations ep
          WHERE ep.application_id = ea.id
        ) as participations_count,
        (
          SELECT COUNT(*)
          FROM audience_stakes_extended ase
          WHERE ase.event_id = ea.id
        ) as stakes_count
      FROM event_applications ea
      JOIN users u ON ea.ambassador_id = u.id
      WHERE 1=1 ${statusFilter} ${priorityFilter}
      ${sortClause}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `

    queryParams.push(limit, offset)
    const applications = await query(applicationsQuery, queryParams)

    // Get total count
    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM event_applications ea
      WHERE 1=1 ${statusFilter} ${priorityFilter}
    `
    const countParams = queryParams.slice(0, -2) // Remove limit and offset
    const totalCount = await query(countQuery, countParams)

    // Get status summary
    // 获取状态汇总
    const statusSummary = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(priority_level) as avg_priority
      FROM event_applications
      GROUP BY status
      ORDER BY count DESC
    `)

    // Get priority summary
    // 获取优先级汇总
    const prioritySummary = await query(`
      SELECT 
        priority_level,
        COUNT(*) as count,
        status
      FROM event_applications
      GROUP BY priority_level, status
      ORDER BY priority_level DESC
    `)

    // Get recent review activity
    // 获取最近的审核活动
    const recentActivity = await query(`
      SELECT 
        al.id,
        al.admin_id,
        al.action_type,
        al.action_details,
        al.created_at,
        u.username as admin_username
      FROM admin_activity_log al
      JOIN users u ON al.admin_id = u.id
      WHERE al.action_type IN ('event_application_approved', 'event_application_rejected', 'qr_code_generated')
      ORDER BY al.created_at DESC
      LIMIT 10
    `)

    // Process applications data
    // 处理申请数据
    const processedApplications = applications.rows.map(app => ({
      ...app,
      team_a_info: JSON.parse(app.team_a_info),
      team_b_info: JSON.parse(app.team_b_info),
      external_sponsors: JSON.parse(app.external_sponsors || '[]'),
      admin_review: JSON.parse(app.admin_review || '{}'),
      ambassador_profile: JSON.parse(app.ambassador_profile || '{}'),
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
      metrics: {
        participations_count: parseInt(app.participations_count || '0'),
        stakes_count: parseInt(app.stakes_count || '0'),
        qr_scans: app.qr_code_info?.scans_count || 0,
        successful_scans: app.qr_code_info?.successful_scans || 0
      }
    }))

    return NextResponse.json({
      success: true,
      applications: processedApplications,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount.rows[0].total),
        totalPages: Math.ceil(parseInt(totalCount.rows[0].total) / limit)
      },
      summary: {
        status_breakdown: statusSummary.rows,
        priority_breakdown: prioritySummary.rows,
        total_applications: parseInt(totalCount.rows[0].total),
        pending_review: statusSummary.rows.find(s => s.status === 'pending')?.count || 0,
        approved_today: 0, // Could be calculated with date filters
        rejected_today: 0   // Could be calculated with date filters
      },
      recent_activity: recentActivity.rows.map(activity => ({
        ...activity,
        action_details: JSON.parse(activity.action_details || '{}')
      })),
      filters: {
        available_statuses: ['pending', 'approved', 'rejected', 'cancelled'],
        available_priorities: [1, 2, 3],
        available_sorts: ['created_at_desc', 'created_at_asc', 'event_start_desc', 'event_start_asc', 'priority_desc']
      },
      message: 'Event applications retrieved successfully for admin review',
      message_cn: '活动申请获取成功供管理员审核'
    })

  } catch (error) {
    console.error('Error fetching applications for admin review:', error)
    console.error('获取管理员审核申请错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch event applications for review',
      error_cn: '获取活动申请审核失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Review event application (approve/reject) and generate QR code
// POST - 审核活动申请（批准/拒绝）并生成QR码
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      admin_id,
      application_id,
      action, // 'approve' or 'reject'
      decision_reason,
      admin_notes,
      suggestions,
      generate_qr = true
    } = body

    console.log('Processing event application review:', { admin_id, application_id, action })
    console.log('处理活动申请审核:', { admin_id, application_id, action })

    // Validate required fields
    // 验证必填字段
    if (!admin_id || !application_id || !action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: admin_id, application_id, action',
        error_cn: '缺少必填字段：admin_id, application_id, action'
      }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be "approve" or "reject"',
        error_cn: '无效操作。必须是 "approve" 或 "reject"'
      }, { status: 400 })
    }

    // Validate admin
    // 验证管理员
    const adminCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'admin'
    `, [admin_id])

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found or invalid role',
        error_cn: '管理员未找到或角色无效'
      }, { status: 404 })
    }

    // Get application details
    // 获取申请详情
    const applicationCheck = await query(`
      SELECT ea.*, u.username as ambassador_username, u.profile_data as ambassador_profile
      FROM event_applications ea
      JOIN users u ON ea.ambassador_id = u.id
      WHERE ea.id = $1
    `, [application_id])

    if (applicationCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Application not found',
        error_cn: '申请未找到'
      }, { status: 404 })
    }

    const application = applicationCheck.rows[0]

    // Check if application is still reviewable
    // 检查申请是否仍可审核
    if (application.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: `Application has already been ${application.status}`,
        error_cn: `申请已经${application.status}`,
        current_status: application.status
      }, { status: 400 })
    }

    // Check if event is still in the future
    // 检查活动是否仍在未来
    const eventStart = new Date(application.event_start_time)
    const now = new Date()
    if (eventStart <= now) {
      return NextResponse.json({
        success: false,
        error: 'Cannot review past events',
        error_cn: '无法审核过去的活动',
        event_start_time: application.event_start_time
      }, { status: 400 })
    }

    // Begin transaction
    // 开始事务
    await query('BEGIN')

    try {
      // Build admin review object
      // 构建管理员审核对象
      const adminReview = {
        decision: action,
        decision_reason: decision_reason || `Application ${action}ed by admin`,
        admin_notes: admin_notes || '',
        suggestions: suggestions || '',
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin_id
      }

      // Update application status
      // 更新申请状态
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      
      const updateQuery = `
        UPDATE event_applications 
        SET status = $1, 
            admin_review = $2, 
            reviewed_by = $3, 
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `

      const updatedApplication = await query(updateQuery, [
        newStatus,
        JSON.stringify(adminReview),
        admin_id,
        application_id
      ])

      let qrCodeInfo = null

      // Generate QR code if approved
      // 如果批准则生成QR码
      if (action === 'approve' && generate_qr) {
        console.log('Generating QR code for approved application...')
        console.log('为批准的申请生成QR码...')

        const { qr_content, verification_code } = generateQRCode(application_id, application.event_title)

        // Insert QR code record
        // 插入QR码记录
        const qrInsertQuery = `
          INSERT INTO event_qr_codes (
            application_id, qr_content, verification_code, 
            valid_from, valid_until, current_status, is_active
          ) VALUES (
            $1, $2, $3, $4, $5, 'pending', true
          ) RETURNING *
        `

        const qrCode = await query(qrInsertQuery, [
          application_id,
          qr_content,
          verification_code,
          application.qr_valid_from,
          application.qr_valid_until
        ])

        qrCodeInfo = qrCode.rows[0]

        // Update application with QR code generated flag
        // 更新申请的QR码生成标志
        await query(`
          UPDATE event_applications 
          SET qr_code_generated = true, qr_generation_time = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [application_id])

        // Log QR code generation
        // 记录QR码生成
        await query(`
          INSERT INTO admin_activity_log (admin_id, action_type, action_details, affected_user_id, success)
          VALUES ($1, 'qr_code_generated', $2, $3, true)
        `, [
          admin_id,
          JSON.stringify({
            application_id: application_id,
            qr_code_id: qrCodeInfo.id,
            verification_code: verification_code,
            event_title: application.event_title,
            valid_from: application.qr_valid_from,
            valid_until: application.qr_valid_until
          }),
          application.ambassador_id
        ])
      }

      // Log the review activity
      // 记录审核活动
      await query(`
        INSERT INTO admin_activity_log (admin_id, action_type, action_details, affected_user_id, success)
        VALUES ($1, $2, $3, $4, true)
      `, [
        admin_id,
        `event_application_${action}ed`,
        JSON.stringify({
          application_id: application_id,
          event_title: application.event_title,
          ambassador_username: application.ambassador_username,
          decision_reason: decision_reason,
          admin_notes: admin_notes,
          event_start_time: application.event_start_time
        }),
        application.ambassador_id
      ])

      // Commit transaction
      // 提交事务
      await query('COMMIT')

      const finalApplication = updatedApplication.rows[0]

      return NextResponse.json({
        success: true,
        application: {
          ...finalApplication,
          team_a_info: JSON.parse(finalApplication.team_a_info),
          team_b_info: JSON.parse(finalApplication.team_b_info),
          external_sponsors: JSON.parse(finalApplication.external_sponsors || '[]'),
          admin_review: JSON.parse(finalApplication.admin_review)
        },
        qr_code: qrCodeInfo ? {
          id: qrCodeInfo.id,
          qr_content: qrCodeInfo.qr_content,
          verification_code: qrCodeInfo.verification_code,
          valid_from: qrCodeInfo.valid_from,
          valid_until: qrCodeInfo.valid_until,
          current_status: qrCodeInfo.current_status
        } : null,
        message: `Event application ${action}ed successfully`,
        message_cn: `活动申请${action === 'approve' ? '批准' : '拒绝'}成功`,
        next_steps: action === 'approve' ? [
          'QR code has been generated',
          'Ambassador will be notified',
          'Event is now available for audience participation'
        ] : [
          'Ambassador will be notified of rejection',
          'Feedback provided for future applications'
        ],
        next_steps_cn: action === 'approve' ? [
          'QR码已生成',
          '大使将收到通知',
          '活动现在可供观众参与'
        ] : [
          '大使将收到拒绝通知',
          '已提供反馈供未来申请参考'
        ]
      })

    } catch (error) {
      // Rollback transaction on error
      // 出错时回滚事务
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error processing application review:', error)
    console.error('处理申请审核错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process application review',
      error_cn: '处理申请审核失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update application priority or batch operations
// PUT - 更新申请优先级或批量操作
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      admin_id,
      operation, // 'update_priority', 'batch_approve', 'batch_reject'
      application_ids,
      priority_level,
      batch_reason
    } = body

    console.log('Processing admin batch operation:', { admin_id, operation, application_ids })
    console.log('处理管理员批量操作:', { admin_id, operation, application_ids })

    // Validate admin
    // 验证管理员
    const adminCheck = await query(`
      SELECT id, role 
      FROM users 
      WHERE id = $1 AND role = 'admin'
    `, [admin_id])

    if (adminCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found or invalid role',
        error_cn: '管理员未找到或角色无效'
      }, { status: 404 })
    }

    if (operation === 'update_priority') {
      // Update priority for single application
      // 更新单个申请的优先级
      const [application_id] = application_ids
      
      if (!application_id || !priority_level) {
        return NextResponse.json({
          success: false,
          error: 'Missing application_id or priority_level',
          error_cn: '缺少 application_id 或 priority_level'
        }, { status: 400 })
      }

      const updateResult = await query(`
        UPDATE event_applications 
        SET priority_level = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND status = 'pending'
        RETURNING *
      `, [priority_level, application_id])

      if (updateResult.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Application not found or not in pending status',
          error_cn: '申请未找到或不在待审核状态'
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        updated_application: updateResult.rows[0],
        message: 'Application priority updated successfully',
        message_cn: '申请优先级更新成功'
      })

    } else if (operation === 'batch_approve' || operation === 'batch_reject') {
      // Batch approve or reject applications
      // 批量批准或拒绝申请
      if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Missing or invalid application_ids array',
          error_cn: '缺少或无效的 application_ids 数组'
        }, { status: 400 })
      }

      const action = operation === 'batch_approve' ? 'approve' : 'reject'
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      
      await query('BEGIN')

      try {
        const results = []
        
        for (const application_id of application_ids) {
          // Get application details
          // 获取申请详情
          const app = await query(`
            SELECT * FROM event_applications WHERE id = $1 AND status = 'pending'
          `, [application_id])

          if (app.rows.length === 0) {
            continue // Skip if not found or not pending
          }

          const application = app.rows[0]

          // Update status
          // 更新状态
          const adminReview = {
            decision: action,
            decision_reason: batch_reason || `Batch ${action} by admin`,
            admin_notes: `Batch operation: ${operation}`,
            suggestions: '',
            reviewed_at: new Date().toISOString(),
            reviewed_by: admin_id
          }

          await query(`
            UPDATE event_applications 
            SET status = $1, admin_review = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP
            WHERE id = $4
          `, [newStatus, JSON.stringify(adminReview), admin_id, application_id])

          // Generate QR code if approved
          // 如果批准则生成QR码
          if (action === 'approve') {
            const { qr_content, verification_code } = generateQRCode(application_id, application.event_title)

            await query(`
              INSERT INTO event_qr_codes (
                application_id, qr_content, verification_code, 
                valid_from, valid_until, current_status, is_active
              ) VALUES ($1, $2, $3, $4, $5, 'pending', true)
            `, [
              application_id,
              qr_content,
              verification_code,
              application.qr_valid_from,
              application.qr_valid_until
            ])

            await query(`
              UPDATE event_applications 
              SET qr_code_generated = true, qr_generation_time = CURRENT_TIMESTAMP
              WHERE id = $1
            `, [application_id])
          }

          results.push({
            application_id,
            action,
            success: true
          })
        }

        // Log batch operation
        // 记录批量操作
        await query(`
          INSERT INTO admin_activity_log (admin_id, action_type, action_details, success)
          VALUES ($1, $2, $3, true)
        `, [
          admin_id,
          `batch_${action}`,
          JSON.stringify({
            operation: operation,
            application_ids: application_ids,
            processed_count: results.length,
            batch_reason: batch_reason
          })
        ])

        await query('COMMIT')

        return NextResponse.json({
          success: true,
          results,
          processed_count: results.length,
          message: `Batch ${action} completed successfully`,
          message_cn: `批量${action === 'approve' ? '批准' : '拒绝'}完成成功`
        })

      } catch (error) {
        await query('ROLLBACK')
        throw error
      }

    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid operation. Must be "update_priority", "batch_approve", or "batch_reject"',
        error_cn: '无效操作。必须是 "update_priority", "batch_approve", 或 "batch_reject"'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error processing admin batch operation:', error)
    console.error('处理管理员批量操作错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process admin batch operation',
      error_cn: '处理管理员批量操作失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 