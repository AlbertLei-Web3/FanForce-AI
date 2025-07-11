// Admin User Management API Route
// 管理员用户管理API路由
// This endpoint handles user management for administrators
// 此端点处理管理员的用户管理
//
// Related files:
// - lib/enhanced-admin-schema.sql: Database schema for user management
// - app/dashboard/admin/page.tsx: Admin dashboard frontend
// - lib/database.ts: Database connection utilities
//
// 相关文件：
// - lib/enhanced-admin-schema.sql: 用户管理的数据库架构
// - app/dashboard/admin/page.tsx: 管理员仪表板前端
// - lib/database.ts: 数据库连接工具

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// User Management Interface
// 用户管理接口
interface UserManagement {
  id: string
  wallet_address: string
  role: string
  student_id?: string
  profile_data: any
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET - Retrieve user list with management information
// GET - 检索带管理信息的用户列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role') || 'all'
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    console.log('Fetching user management data...')
    console.log('获取用户管理数据...')

    // Calculate offset for pagination
    // 计算分页偏移量
    const offset = (page - 1) * limit

    // Build dynamic query based on filters
    // 基于过滤器构建动态查询
    let baseQuery = `
      SELECT 
        u.id, u.wallet_address, u.role, u.student_id, u.profile_data,
        (u.profile_data->>'is_active')::boolean as is_active,
        u.created_at, u.updated_at,
        COUNT(uml.id) as action_count,
        MAX(uml.created_at) as last_action_date
      FROM users u
      LEFT JOIN user_management_log uml ON u.id = uml.user_id
      WHERE 1=1
    `

    const queryParams: any[] = []
    let paramCount = 0

    // Add role filter
    // 添加角色过滤器
    if (role !== 'all') {
      paramCount++
      baseQuery += ` AND u.role = $${paramCount}`
      queryParams.push(role)
    }

    // Add status filter (active/inactive)
    // 添加状态过滤器（激活/停用）
    if (status !== 'all') {
      paramCount++
      const isActive = status === 'active'
      baseQuery += ` AND COALESCE((u.profile_data->>'is_active')::boolean, true) = $${paramCount}`
      queryParams.push(isActive)
    }

    // Add search filter
    // 添加搜索过滤器
    if (search) {
      paramCount++
      baseQuery += ` AND (u.wallet_address ILIKE $${paramCount} OR u.student_id ILIKE $${paramCount})`
      queryParams.push(`%${search}%`)
    }

    // Complete the query with GROUP BY and pagination
    // 完成查询，添加GROUP BY和分页
    baseQuery += `
      GROUP BY u.id, u.wallet_address, u.role, u.student_id, u.profile_data, u.created_at, u.updated_at
      ORDER BY u.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `
    queryParams.push(limit, offset)

    const result = await query(baseQuery, queryParams)

    // Get total count for pagination
    // 获取总数用于分页
    let countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM users u
      WHERE 1=1
    `
    const countParams: any[] = []
    let countParamCount = 0

    if (role !== 'all') {
      countParamCount++
      countQuery += ` AND u.role = $${countParamCount}`
      countParams.push(role)
    }

    if (status !== 'all') {
      countParamCount++
      const isActive = status === 'active'
      countQuery += ` AND COALESCE((u.profile_data->>'is_active')::boolean, true) = $${countParamCount}`
      countParams.push(isActive)
    }

    if (search) {
      countParamCount++
      countQuery += ` AND (u.wallet_address ILIKE $${countParamCount} OR u.student_id ILIKE $${countParamCount})`
      countParams.push(`%${search}%`)
    }

    const countResult = await query(countQuery, countParams)
    const totalUsers = parseInt(countResult.rows[0].total)

    // Get user statistics
    // 获取用户统计信息
    const statsResult = await query(`
      SELECT 
        role,
        COUNT(*) as count,
        COUNT(CASE WHEN COALESCE((profile_data->>'is_active')::boolean, true) = true THEN 1 END) as active_count,
        COUNT(CASE WHEN COALESCE((profile_data->>'is_active')::boolean, true) = false THEN 1 END) as inactive_count
      FROM users
      GROUP BY role
    `)

    const userStats = statsResult.rows.reduce((acc, row) => {
      acc[row.role] = {
        total: parseInt(row.count),
        active: parseInt(row.active_count),
        inactive: parseInt(row.inactive_count)
      }
      return acc
    }, {} as any)

    return NextResponse.json({
      success: true,
      users: result.rows,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      },
      stats: userStats,
      message: 'User management data retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching user management data:', error)
    console.error('获取用户管理数据错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user management data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update user status (enable/disable)
// POST - 更新用户状态（启用/停用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, action, admin_id, reason } = body

    console.log('Updating user status:', { user_id, action, admin_id })
    console.log('更新用户状态:', { user_id, action, admin_id })

    // Validate required fields
    // 验证必填字段
    if (!user_id || !action || !admin_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: user_id, action, and admin_id'
      }, { status: 400 })
    }

    // Validate action
    // 验证操作
    if (!['enable', 'disable', 'approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be: enable, disable, approve, or reject'
      }, { status: 400 })
    }

    // Get current user data
    // 获取当前用户数据
    const userResult = await query(`
      SELECT id, wallet_address, role, profile_data
      FROM users
      WHERE id = $1
    `, [user_id])

    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    const user = userResult.rows[0]
    const currentProfileData = user.profile_data || {}

    // Update user status based on action
    // 根据操作更新用户状态
    let newProfileData = { ...currentProfileData }
    let actionType = action

    switch (action) {
      case 'enable':
        newProfileData.is_active = true
        newProfileData.disabled_reason = null
        break
      case 'disable':
        newProfileData.is_active = false
        newProfileData.disabled_reason = reason || 'Manual disable by admin'
        newProfileData.disabled_at = new Date().toISOString()
        break
      case 'approve':
        newProfileData.is_approved = true
        newProfileData.approved_at = new Date().toISOString()
        break
      case 'reject':
        newProfileData.is_approved = false
        newProfileData.rejected_reason = reason || 'Manual reject by admin'
        newProfileData.rejected_at = new Date().toISOString()
        break
    }

    // Update user profile data
    // 更新用户资料数据
    const updateResult = await query(`
      UPDATE users 
      SET profile_data = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, wallet_address, role, profile_data, updated_at
    `, [JSON.stringify(newProfileData), user_id])

    // Log the admin action
    // 记录管理员操作
    await query(`
      INSERT INTO user_management_log (
        user_id, action_type, action_details, admin_id, reason
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      user_id, 
      actionType, 
      JSON.stringify({ 
        action, 
        previous_status: currentProfileData.is_active,
        new_status: newProfileData.is_active,
        wallet_address: user.wallet_address
      }),
      admin_id,
      reason
    ])

    // Log admin action in activity log
    // 在活动日志中记录管理员操作
    await query(`
      SELECT log_admin_action(
        $1::UUID, 
        'user_management', 
        $2::JSONB, 
        $3::UUID, 
        NULL, 
        NULL, 
        NULL, 
        true, 
        NULL
      )
    `, [admin_id, JSON.stringify({ action, user_id, reason }), user_id])

    return NextResponse.json({
      success: true,
      user: updateResult.rows[0],
      message: `User ${action} successfully`
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    console.error('更新用户状态错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update user status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Batch user operations
// PUT - 批量用户操作
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_ids, action, admin_id, reason } = body

    console.log('Batch user operation:', { user_ids, action, admin_id })
    console.log('批量用户操作:', { user_ids, action, admin_id })

    // Validate required fields
    // 验证必填字段
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !action || !admin_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: user_ids (array), action, and admin_id'
      }, { status: 400 })
    }

    if (!['enable', 'disable'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid action for batch operation. Must be: enable or disable'
      }, { status: 400 })
    }

    const results = []
    const errors = []

    // Process each user
    // 处理每个用户
    for (const user_id of user_ids) {
      try {
        // Simulate single user operation
        // 模拟单个用户操作
        const singleResult = await query(`
          UPDATE users 
          SET profile_data = profile_data || $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, wallet_address, role
        `, [
          JSON.stringify({
            is_active: action === 'enable',
            ...(action === 'disable' ? { 
              disabled_reason: reason || 'Batch disable by admin',
              disabled_at: new Date().toISOString() 
            } : {})
          }),
          user_id
        ])

        if (singleResult.rows.length > 0) {
          results.push(singleResult.rows[0])
          
          // Log individual action
          // 记录单个操作
          await query(`
            INSERT INTO user_management_log (
              user_id, action_type, action_details, admin_id, reason
            ) VALUES ($1, $2, $3, $4, $5)
          `, [
            user_id,
            action,
            JSON.stringify({ batch_operation: true, action }),
            admin_id,
            reason
          ])
        }
      } catch (userError) {
        errors.push({ user_id, error: userError instanceof Error ? userError.message : 'Unknown error' })
      }
    }

    // Log batch admin action
    // 记录批量管理员操作
    await query(`
      SELECT log_admin_action(
        $1::UUID, 
        'batch_user_management', 
        $2::JSONB, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        true, 
        NULL
      )
    `, [admin_id, JSON.stringify({ action, user_ids, results_count: results.length, errors_count: errors.length })])

    return NextResponse.json({
      success: true,
      results,
      errors,
      message: `Batch ${action} completed. ${results.length} successful, ${errors.length} errors.`
    })

  } catch (error) {
    console.error('Error in batch user operation:', error)
    console.error('批量用户操作错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to perform batch user operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 