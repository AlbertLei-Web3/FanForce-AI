// Audience QR Code Scan API Route
// 观众QR码扫描API路由
// This endpoint handles QR code scanning and audience participation choices
// 此端点处理QR码扫描和观众参与选择
//
// Related files:
// - app/api/admin/event-applications/route.ts: Admin review API
// - lib/phase2-schema.sql: QR codes and participation database schema
// - app/dashboard/audience/page.tsx: Audience dashboard frontend
//
// 相关文件：
// - app/api/admin/event-applications/route.ts: 管理员审核API
// - lib/phase2-schema.sql: QR码和参与数据库架构
// - app/dashboard/audience/page.tsx: 观众仪表板前端

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// POST - Scan QR code and record participation choice
// POST - 扫描QR码并记录参与选择
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      user_id,
      verification_code,
      participation_type, // 'watch_only' or 'watch_and_party'
      scan_location,
      user_agent,
      device_info
    } = body

    console.log('Processing QR code scan...', { user_id, verification_code, participation_type })
    console.log('处理QR码扫描...', { user_id, verification_code, participation_type })

    // Validate required fields
    // 验证必填字段
    if (!user_id || !verification_code || !participation_type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: user_id, verification_code, participation_type',
        error_cn: '缺少必填字段：user_id, verification_code, participation_type'
      }, { status: 400 })
    }

    if (!['watch_only', 'watch_and_party'].includes(participation_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid participation_type. Must be "watch_only" or "watch_and_party"',
        error_cn: '无效的参与类型。必须是 "watch_only" 或 "watch_and_party"'
      }, { status: 400 })
    }

    // Validate user exists and is audience
    // 验证用户存在且是观众
    const userCheck = await query(`
      SELECT id, role, profile_data 
      FROM users 
      WHERE id = $1 AND role = 'audience'
    `, [user_id])

    if (userCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found or not an audience member',
        error_cn: '用户未找到或不是观众'
      }, { status: 404 })
    }

    // Get QR code information
    // 获取QR码信息
    const qrCodeQuery = `
      SELECT 
        eqr.*,
        ea.id as application_id,
        ea.event_title,
        ea.event_start_time,
        ea.venue_name,
        ea.venue_capacity,
        ea.party_venue_capacity,
        ea.ambassador_id,
        ea.team_a_info,
        ea.team_b_info,
        ea.status as application_status
      FROM event_qr_codes eqr
      JOIN event_applications ea ON eqr.application_id = ea.id
      WHERE eqr.verification_code = $1
    `

    const qrCodeResult = await query(qrCodeQuery, [verification_code])

    if (qrCodeResult.rows.length === 0) {
      // Log failed scan attempt
      // 记录失败的扫描尝试
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, error_message, user_agent, device_info)
        VALUES (NULL, $1, 'invalid', 'QR code not found', $2, $3)
      `, [user_id, user_agent, JSON.stringify(device_info || {})])

      return NextResponse.json({
        success: false,
        error: 'Invalid QR code',
        error_cn: '无效的QR码',
        scan_result: 'invalid'
      }, { status: 404 })
    }

    const qrCode = qrCodeResult.rows[0]
    const now = new Date()

    // Check if QR code is currently valid (time-based)
    // 检查QR码是否当前有效（基于时间）
    const validFrom = new Date(qrCode.valid_from)
    const validUntil = new Date(qrCode.valid_until)

    if (now < validFrom) {
      // QR code not yet valid
      // QR码尚未生效
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, error_message, user_agent, device_info)
        VALUES ($1, $2, 'expired', 'QR code not yet valid', $3, $4)
      `, [qrCode.id, user_id, user_agent, JSON.stringify(device_info || {})])

      const hoursUntilValid = Math.ceil((validFrom.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      return NextResponse.json({
        success: false,
        error: `QR code not yet valid. Available in ${hoursUntilValid} hours`,
        error_cn: `QR码尚未生效。还需等待${hoursUntilValid}小时`,
        scan_result: 'not_yet_valid',
        valid_from: validFrom.toISOString(),
        hours_until_valid: hoursUntilValid
      }, { status: 400 })
    }

    if (now > validUntil) {
      // QR code expired
      // QR码已过期
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, error_message, user_agent, device_info)
        VALUES ($1, $2, 'expired', 'QR code expired', $3, $4)
      `, [qrCode.id, user_id, user_agent, JSON.stringify(device_info || {})])

      return NextResponse.json({
        success: false,
        error: 'QR code has expired',
        error_cn: 'QR码已过期',
        scan_result: 'expired',
        valid_until: validUntil.toISOString()
      }, { status: 400 })
    }

    // Check if QR code is active
    // 检查QR码是否激活
    if (!qrCode.is_active || qrCode.current_status !== 'active') {
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, error_message, user_agent, device_info)
        VALUES ($1, $2, 'invalid', 'QR code not active', $3, $4)
      `, [qrCode.id, user_id, user_agent, JSON.stringify(device_info || {})])

      return NextResponse.json({
        success: false,
        error: 'QR code is not active',
        error_cn: 'QR码未激活',
        scan_result: 'inactive',
        qr_status: qrCode.current_status
      }, { status: 400 })
    }

    // Check if application is approved
    // 检查申请是否已批准
    if (qrCode.application_status !== 'approved') {
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, error_message, user_agent, device_info)
        VALUES ($1, $2, 'invalid', 'Event not approved', $3, $4)
      `, [qrCode.id, user_id, user_agent, JSON.stringify(device_info || {})])

      return NextResponse.json({
        success: false,
        error: 'Event has not been approved yet',
        error_cn: '活动尚未批准',
        scan_result: 'not_approved',
        application_status: qrCode.application_status
      }, { status: 400 })
    }

    // Check rate limiting for this user
    // 检查此用户的限制
    const recentScans = await query(`
      SELECT COUNT(*) as recent_scan_count
      FROM qr_scan_logs
      WHERE user_id = $1 AND qr_code_id = $2 
      AND scan_timestamp > NOW() - INTERVAL '1 hour'
    `, [user_id, qrCode.id])

    const maxScansPerHour = qrCode.rate_limit_per_user || 5
    if (parseInt(recentScans.rows[0].recent_scan_count) >= maxScansPerHour) {
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, error_message, user_agent, device_info, rate_limit_triggered)
        VALUES ($1, $2, 'rate_limited', 'Too many scan attempts', $3, $4, true)
      `, [qrCode.id, user_id, user_agent, JSON.stringify(device_info || {})])

      return NextResponse.json({
        success: false,
        error: 'Too many scan attempts. Please try again later',
        error_cn: '扫描尝试次数过多。请稍后再试',
        scan_result: 'rate_limited',
        max_scans_per_hour: maxScansPerHour
      }, { status: 429 })
    }

    // Check if user already participated in this event
    // 检查用户是否已参与此活动
    const existingParticipation = await query(`
      SELECT id, participation_type, party_allocation_status
      FROM event_participations
      WHERE user_id = $1 AND application_id = $2
    `, [user_id, qrCode.application_id])

    if (existingParticipation.rows.length > 0) {
      // User already participated - return existing participation
      // 用户已参与 - 返回现有参与记录
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, error_message, user_agent, device_info)
        VALUES ($1, $2, 'success', 'Duplicate scan - already participated', $3, $4)
      `, [qrCode.id, user_id, user_agent, JSON.stringify(device_info || {})])

      const existing = existingParticipation.rows[0]
      return NextResponse.json({
        success: true,
        already_participated: true,
        existing_participation: {
          id: existing.id,
          participation_type: existing.participation_type,
          party_allocation_status: existing.party_allocation_status
        },
        message: 'You have already participated in this event',
        message_cn: '您已经参与了这项活动',
        scan_result: 'duplicate'
      })
    }

    // Check party capacity if user wants to join party
    // 如果用户要参加聚会，检查聚会容量
    let partyAllocationStatus = 'not_applicable'
    let partyAllocationResult = {}

    if (participation_type === 'watch_and_party') {
      const partyCapacity = qrCode.party_venue_capacity || 0
      
      if (partyCapacity === 0) {
        return NextResponse.json({
          success: false,
          error: 'Party venue is not available for this event',
          error_cn: '此活动没有聚会场地',
          scan_result: 'no_party_venue'
        }, { status: 400 })
      }

      // Check current party allocations
      // 检查当前聚会分配
      const currentPartyCount = await query(`
        SELECT COUNT(*) as current_party_participants
        FROM event_participations
        WHERE application_id = $1 AND participation_type = 'watch_and_party'
        AND party_allocation_status = 'allocated'
      `, [qrCode.application_id])

      const currentCount = parseInt(currentPartyCount.rows[0].current_party_participants)
      
      if (currentCount >= partyCapacity) {
        // Party is full - put user on waitlist
        // 聚会已满 - 将用户放入等待列表
        partyAllocationStatus = 'waitlist'
        partyAllocationResult = {
          reason: 'Party venue is full',
          current_count: currentCount,
          capacity: partyCapacity,
          waitlist_position: currentCount - partyCapacity + 1
        }
      } else {
        // Party has space - allocate immediately
        // 聚会有空间 - 立即分配
        partyAllocationStatus = 'allocated'
        partyAllocationResult = {
          reason: 'Successfully allocated to party',
          current_count: currentCount + 1,
          capacity: partyCapacity,
          allocated_at: new Date().toISOString()
        }
      }
    }

    // Begin transaction to record participation
    // 开始事务记录参与
    await query('BEGIN')

    try {
      // Determine reward tier based on participation type
      // 根据参与类型确定奖励等级
      const rewardTier = participation_type === 'watch_only' ? 2 : 3 // 70% or 100%

      // Insert participation record
      // 插入参与记录
      const participationQuery = `
        INSERT INTO event_participations (
          user_id, application_id, qr_code_id, participation_type, reward_tier,
          scan_location, user_agent, ip_address, party_allocation_status, party_allocation_result
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING *
      `

      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      '127.0.0.1'

      const newParticipation = await query(participationQuery, [
        user_id,
        qrCode.application_id,
        qrCode.id,
        participation_type,
        rewardTier,
        JSON.stringify(scan_location || {}),
        user_agent,
        clientIP,
        partyAllocationStatus,
        JSON.stringify(partyAllocationResult)
      ])

      // Update QR code scan statistics
      // 更新QR码扫描统计
      await query(`
        UPDATE event_qr_codes 
        SET scans_count = scans_count + 1,
            successful_scans = successful_scans + 1,
            last_scan_time = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [qrCode.id])

      // Log successful scan
      // 记录成功扫描
      await query(`
        INSERT INTO qr_scan_logs (qr_code_id, user_id, scan_result, user_agent, device_info, geolocation)
        VALUES ($1, $2, 'success', $3, $4, $5)
      `, [qrCode.id, user_id, user_agent, JSON.stringify(device_info || {}), JSON.stringify(scan_location || {})])

      // Update party allocation table if needed
      // 如果需要更新聚会分配表
      if (participation_type === 'watch_and_party') {
        await query(`
          INSERT INTO party_allocations (event_id, application_id, total_capacity, allocated_spots, waitlist_count)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (application_id) DO UPDATE SET
            allocated_spots = CASE WHEN $6 = 'allocated' THEN party_allocations.allocated_spots + 1 ELSE party_allocations.allocated_spots END,
            waitlist_count = CASE WHEN $6 = 'waitlist' THEN party_allocations.waitlist_count + 1 ELSE party_allocations.waitlist_count END,
            updated_at = CURRENT_TIMESTAMP
        `, [qrCode.application_id, qrCode.application_id, qrCode.party_venue_capacity, 
            partyAllocationStatus === 'allocated' ? 1 : 0, 
            partyAllocationStatus === 'waitlist' ? 1 : 0, 
            partyAllocationStatus])
      }

      await query('COMMIT')

      const participation = newParticipation.rows[0]

      // Calculate rewards information
      // 计算奖励信息
      const rewardMultipliers = {
        1: 0.30, // Stake only: 30%
        2: 0.70, // Stake + scan: 70%
        3: 1.00  // Stake + scan + party: 100%
      }

      const baseReward = rewardMultipliers[rewardTier]
      const potentialReward = {
        tier: rewardTier,
        multiplier: baseReward,
        description: participation_type === 'watch_only' 
          ? 'Watch + Stake: 70% of potential reward'
          : 'Watch + Party + Stake: 100% of potential reward'
      }

      return NextResponse.json({
        success: true,
        participation: {
          id: participation.id,
          participation_type: participation.participation_type,
          reward_tier: participation.reward_tier,
          party_allocation_status: participation.party_allocation_status,
          party_allocation_result: JSON.parse(participation.party_allocation_result || '{}'),
          scan_timestamp: participation.scan_timestamp
        },
        event_info: {
          id: qrCode.application_id,
          title: qrCode.event_title,
          start_time: qrCode.event_start_time,
          venue: qrCode.venue_name,
          teams: {
            team_a: JSON.parse(qrCode.team_a_info),
            team_b: JSON.parse(qrCode.team_b_info)
          }
        },
        reward_info: potentialReward,
        next_steps: [
          'Your participation has been recorded',
          'You can now place stakes on your preferred team',
          participation_type === 'watch_and_party' && partyAllocationStatus === 'allocated' 
            ? 'You are confirmed for the post-event party' 
            : participation_type === 'watch_and_party' && partyAllocationStatus === 'waitlist'
            ? 'You are on the waitlist for the post-event party'
            : 'Enjoy watching the event'
        ].filter(Boolean),
        next_steps_cn: [
          '您的参与已记录',
          '您现在可以为您偏好的队伍下注',
          participation_type === 'watch_and_party' && partyAllocationStatus === 'allocated' 
            ? '您已确认参加赛后聚会' 
            : participation_type === 'watch_and_party' && partyAllocationStatus === 'waitlist'
            ? '您在赛后聚会等待列表中'
            : '享受观赛'
        ].filter(Boolean),
        message: 'QR code scanned successfully! Welcome to the event',
        message_cn: 'QR码扫描成功！欢迎参加活动',
        scan_result: 'success'
      })

    } catch (error) {
      await query('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Error processing QR code scan:', error)
    console.error('处理QR码扫描错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process QR code scan',
      error_cn: '处理QR码扫描失败',
      details: error instanceof Error ? error.message : 'Unknown error',
      scan_result: 'error'
    }, { status: 500 })
  }
}

// GET - Get QR code information (for preview before scanning)
// GET - 获取QR码信息（扫描前预览）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const verification_code = searchParams.get('verification_code')
    const user_id = searchParams.get('user_id')

    console.log('Getting QR code information...', { verification_code, user_id })
    console.log('获取QR码信息...', { verification_code, user_id })

    if (!verification_code) {
      return NextResponse.json({
        success: false,
        error: 'Missing verification_code parameter',
        error_cn: '缺少 verification_code 参数'
      }, { status: 400 })
    }

    // Get QR code and event information
    // 获取QR码和活动信息
    const qrInfoQuery = `
      SELECT 
        eqr.*,
        ea.id as application_id,
        ea.event_title,
        ea.event_description,
        ea.event_start_time,
        ea.event_end_time,
        ea.venue_name,
        ea.venue_address,
        ea.venue_capacity,
        ea.party_venue_capacity,
        ea.ambassador_id,
        ea.team_a_info,
        ea.team_b_info,
        ea.status as application_status,
        ea.estimated_participants,
        u.username as ambassador_username,
        u.profile_data as ambassador_profile
      FROM event_qr_codes eqr
      JOIN event_applications ea ON eqr.application_id = ea.id
      JOIN users u ON ea.ambassador_id = u.id
      WHERE eqr.verification_code = $1
    `

    const qrInfo = await query(qrInfoQuery, [verification_code])

    if (qrInfo.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'QR code not found',
        error_cn: '未找到QR码'
      }, { status: 404 })
    }

    const qr = qrInfo.rows[0]
    const now = new Date()
    const validFrom = new Date(qr.valid_from)
    const validUntil = new Date(qr.valid_until)

    // Check if user already participated (if user_id provided)
    // 检查用户是否已参与（如果提供了用户ID）
    let userParticipation = null
    if (user_id) {
      const participationCheck = await query(`
        SELECT * FROM event_participations
        WHERE user_id = $1 AND application_id = $2
      `, [user_id, qr.application_id])

      if (participationCheck.rows.length > 0) {
        userParticipation = {
          ...participationCheck.rows[0],
          party_allocation_result: JSON.parse(participationCheck.rows[0].party_allocation_result || '{}')
        }
      }
    }

    // Get current participation stats
    // 获取当前参与统计
    const participationStats = await query(`
      SELECT 
        COUNT(*) as total_participants,
        COUNT(CASE WHEN participation_type = 'watch_only' THEN 1 END) as watch_only_count,
        COUNT(CASE WHEN participation_type = 'watch_and_party' THEN 1 END) as watch_and_party_count,
        COUNT(CASE WHEN participation_type = 'watch_and_party' AND party_allocation_status = 'allocated' THEN 1 END) as party_allocated_count,
        COUNT(CASE WHEN participation_type = 'watch_and_party' AND party_allocation_status = 'waitlist' THEN 1 END) as party_waitlist_count
      FROM event_participations
      WHERE application_id = $1
    `, [qr.application_id])

    const stats = participationStats.rows[0]

    return NextResponse.json({
      success: true,
      qr_code: {
        id: qr.id,
        verification_code: qr.verification_code,
        valid_from: qr.valid_from,
        valid_until: qr.valid_until,
        is_active: qr.is_active,
        current_status: qr.current_status,
        scans_count: qr.scans_count,
        successful_scans: qr.successful_scans
      },
      event_info: {
        id: qr.application_id,
        title: qr.event_title,
        description: qr.event_description,
        start_time: qr.event_start_time,
        end_time: qr.event_end_time,
        venue: {
          name: qr.venue_name,
          address: qr.venue_address,
          capacity: qr.venue_capacity,
          party_capacity: qr.party_venue_capacity
        },
        teams: {
          team_a: JSON.parse(qr.team_a_info),
          team_b: JSON.parse(qr.team_b_info)
        },
        ambassador: {
          username: qr.ambassador_username,
          profile: JSON.parse(qr.ambassador_profile || '{}')
        },
        status: qr.application_status,
        estimated_participants: qr.estimated_participants
      },
      timing: {
        now: now.toISOString(),
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        is_currently_valid: now >= validFrom && now <= validUntil,
        hours_until_valid: validFrom > now ? Math.ceil((validFrom.getTime() - now.getTime()) / (1000 * 60 * 60)) : 0,
        hours_remaining: validUntil > now && validFrom <= now ? Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60)) : 0
      },
      participation_options: {
        watch_only: {
          reward_tier: 2,
          reward_multiplier: 0.70,
          description: 'Watch the event and earn 70% of potential rewards',
          description_cn: '观看活动并获得70%的潜在奖励'
        },
        watch_and_party: {
          reward_tier: 3,
          reward_multiplier: 1.00,
          description: 'Watch the event and join the party - earn 100% of potential rewards',
          description_cn: '观看活动并参加聚会 - 获得100%的潜在奖励',
          party_available: (qr.party_venue_capacity || 0) > 0,
          party_spots_remaining: Math.max(0, (qr.party_venue_capacity || 0) - parseInt(stats.party_allocated_count || '0'))
        }
      },
      current_stats: {
        total_participants: parseInt(stats.total_participants || '0'),
        watch_only: parseInt(stats.watch_only_count || '0'),
        watch_and_party: parseInt(stats.watch_and_party_count || '0'),
        party_allocated: parseInt(stats.party_allocated_count || '0'),
        party_waitlist: parseInt(stats.party_waitlist_count || '0'),
        venue_utilization: Math.round((parseInt(stats.total_participants || '0') / qr.venue_capacity) * 100)
      },
      user_participation: userParticipation,
      message: 'QR code information retrieved successfully',
      message_cn: 'QR码信息获取成功'
    })

  } catch (error) {
    console.error('Error getting QR code information:', error)
    console.error('获取QR码信息错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get QR code information',
      error_cn: '获取QR码信息失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 