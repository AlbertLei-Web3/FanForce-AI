// Admin Dashboard API Route
// 管理员仪表板API路由
// This endpoint provides comprehensive dashboard statistics for administrators
// 此端点为管理员提供综合的仪表板统计信息
//
// Related files:
// - lib/enhanced-admin-schema.sql: Database schema for admin dashboard
// - app/dashboard/admin/page.tsx: Admin dashboard frontend
// - lib/database.ts: Database connection utilities
// - app/api/admin/config/route.ts: System configuration API
// - app/api/admin/fee-rules/route.ts: Fee rules API
// - app/api/admin/users/route.ts: User management API
// - app/api/admin/chz-pool/route.ts: CHZ pool monitoring API
//
// 相关文件：
// - lib/enhanced-admin-schema.sql: 管理员仪表板的数据库架构
// - app/dashboard/admin/page.tsx: 管理员仪表板前端
// - lib/database.ts: 数据库连接工具
// - app/api/admin/config/route.ts: 系统配置API
// - app/api/admin/fee-rules/route.ts: 手续费规则API
// - app/api/admin/users/route.ts: 用户管理API
// - app/api/admin/chz-pool/route.ts: CHZ池监控API

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Dashboard Statistics Interface
// 仪表板统计接口
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalEvents: number
  activeEvents: number
  totalRevenue: number
  totalStaked: number
  platformFees: number
  adminCount: number
  ambassadorCount: number
  athleteCount: number
  audienceCount: number
  todayUsers: number
  todayEvents: number
  todayRevenue: number
  todayStaked: number
  chzPoolHealth: number
  pendingTransactions: number
  systemStatus: string
}

// Recent Activity Interface
// 最近活动接口
interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  amount?: number
  user?: string
  details?: any
}

// GET - Retrieve comprehensive dashboard statistics
// GET - 检索综合仪表板统计信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const admin_id = searchParams.get('admin_id')
    
    console.log('Fetching admin dashboard statistics...')
    console.log('获取管理员仪表板统计信息...')

    // Get user statistics
    // 获取用户统计
    const userStatsQuery = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN COALESCE((profile_data->>'is_active')::boolean, true) = true THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
        COUNT(CASE WHEN role = 'ambassador' THEN 1 END) as ambassador_count,
        COUNT(CASE WHEN role = 'athlete' THEN 1 END) as athlete_count,
        COUNT(CASE WHEN role = 'audience' THEN 1 END) as audience_count,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_users
      FROM users
    `)

    // Get event statistics
    // 获取活动统计
    const eventStatsQuery = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_events,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_events
      FROM events
    `)

    // Get transaction statistics
    // 获取交易统计
    const transactionStatsQuery = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN transaction_type = 'stake' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_staked,
        COALESCE(SUM(CASE WHEN transaction_type = 'payout' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN transaction_type = 'fee' AND status = 'completed' THEN amount ELSE 0 END), 0) as platform_fees,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE AND transaction_type = 'stake' AND status = 'completed' THEN amount ELSE 0 END), 0) as today_staked,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE AND transaction_type = 'payout' AND status = 'completed' THEN amount ELSE 0 END), 0) as today_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions
      FROM transactions
    `)

    // Get CHZ pool health
    // 获取CHZ池健康状态
    const chzPoolQuery = await query(`
      SELECT 
        COALESCE(AVG(pool_health_score), 100) as avg_health_score,
        COUNT(*) as pool_count
      FROM chz_pool_monitor
      WHERE monitoring_status = 'active'
    `)

    // Get system status
    // 获取系统状态
    const systemStatusQuery = await query(`
      SELECT 
        config_value as maintenance_mode
      FROM system_config
      WHERE config_key = 'maintenance_mode' AND is_active = true
    `)

    // Get recent activities
    // 获取最近活动
    const recentActivitiesQuery = await query(`
      SELECT 
        'user_action' as type,
        action_type as description,
        created_at as timestamp,
        action_details as details,
        (SELECT wallet_address FROM users WHERE id = uml.user_id) as user_address
      FROM user_management_log uml
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      
      UNION ALL
      
      SELECT 
        'transaction' as type,
        transaction_type || ' - ' || currency as description,
        created_at as timestamp,
        json_build_object('amount', amount, 'status', status) as details,
        (SELECT wallet_address FROM users WHERE id = t.user_id) as user_address
      FROM transactions t
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      
      UNION ALL
      
      SELECT 
        'event' as type,
        'Event: ' || title as description,
        created_at as timestamp,
        json_build_object('status', status, 'participants', current_participants) as details,
        (SELECT wallet_address FROM users WHERE id = e.ambassador_id) as user_address
      FROM events e
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      
      ORDER BY timestamp DESC
      LIMIT 20
    `)

    // Get admin activity log
    // 获取管理员活动日志
    const adminActivitiesQuery = await query(`
      SELECT 
        action_type,
        action_details,
        created_at,
        success,
        (SELECT wallet_address FROM users WHERE id = aal.admin_id) as admin_address
      FROM admin_activity_log aal
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10
    `)

    // Execute all queries
    // 执行所有查询
    const [
      userStats,
      eventStats,
      transactionStats,
      chzPoolStats,
      systemStatus,
      recentActivities,
      adminActivities
    ] = await Promise.all([
      userStatsQuery,
      eventStatsQuery,
      transactionStatsQuery,
      chzPoolQuery,
      systemStatusQuery,
      recentActivitiesQuery,
      adminActivitiesQuery
    ])

    // Compile dashboard statistics
    // 编译仪表板统计信息
    const dashboardStats: DashboardStats = {
      totalUsers: parseInt(userStats.rows[0].total_users) || 0,
      activeUsers: parseInt(userStats.rows[0].active_users) || 0,
      totalEvents: parseInt(eventStats.rows[0].total_events) || 0,
      activeEvents: parseInt(eventStats.rows[0].active_events) || 0,
      totalRevenue: parseFloat(transactionStats.rows[0].total_revenue) || 0,
      totalStaked: parseFloat(transactionStats.rows[0].total_staked) || 0,
      platformFees: parseFloat(transactionStats.rows[0].platform_fees) || 0,
      adminCount: parseInt(userStats.rows[0].admin_count) || 0,
      ambassadorCount: parseInt(userStats.rows[0].ambassador_count) || 0,
      athleteCount: parseInt(userStats.rows[0].athlete_count) || 0,
      audienceCount: parseInt(userStats.rows[0].audience_count) || 0,
      todayUsers: parseInt(userStats.rows[0].today_users) || 0,
      todayEvents: parseInt(eventStats.rows[0].today_events) || 0,
      todayRevenue: parseFloat(transactionStats.rows[0].today_revenue) || 0,
      todayStaked: parseFloat(transactionStats.rows[0].today_staked) || 0,
      chzPoolHealth: parseInt(chzPoolStats.rows[0]?.avg_health_score) || 100,
      pendingTransactions: parseInt(transactionStats.rows[0].pending_transactions) || 0,
      systemStatus: systemStatus.rows[0]?.maintenance_mode === 'true' ? 'maintenance' : 'active'
    }

    // Format recent activities
    // 格式化最近活动
    const formattedActivities: RecentActivity[] = recentActivities.rows.map(activity => ({
      id: `${activity.type}-${activity.timestamp}`,
      type: activity.type,
      description: activity.description,
      timestamp: activity.timestamp,
      user: activity.user_address,
      details: activity.details
    }))

    // Log admin dashboard access
    // 记录管理员仪表板访问
    if (admin_id) {
      await query(`
        SELECT log_admin_action(
          $1::UUID, 
          'dashboard_access', 
          $2::JSONB, 
          NULL, 
          NULL, 
          NULL, 
          NULL, 
          true, 
          NULL
        )
      `, [admin_id, JSON.stringify({ timestamp: new Date().toISOString() })])
    }

    // Update dashboard stats cache
    // 更新仪表板统计缓存
    await query(`
      INSERT INTO admin_dashboard_stats (stat_type, stat_value, stat_metadata, period, stat_date)
      VALUES 
        ('total_users', $1, '{}', 'real_time', CURRENT_DATE),
        ('active_users', $2, '{}', 'real_time', CURRENT_DATE),
        ('total_events', $3, '{}', 'real_time', CURRENT_DATE),
        ('total_staked', $4, '{}', 'real_time', CURRENT_DATE),
        ('platform_fees', $5, '{}', 'real_time', CURRENT_DATE),
        ('chz_pool_health', $6, '{}', 'real_time', CURRENT_DATE)
      ON CONFLICT (stat_type, stat_date, period) DO UPDATE SET
        stat_value = EXCLUDED.stat_value,
        updated_at = CURRENT_TIMESTAMP
    `, [
      dashboardStats.totalUsers,
      dashboardStats.activeUsers,
      dashboardStats.totalEvents,
      dashboardStats.totalStaked,
      dashboardStats.platformFees,
      dashboardStats.chzPoolHealth
    ])

    return NextResponse.json({
      success: true,
      stats: dashboardStats,
      recentActivities: formattedActivities,
      adminActivities: adminActivities.rows,
      message: 'Admin dashboard statistics retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching admin dashboard statistics:', error)
    console.error('获取管理员仪表板统计信息错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch admin dashboard statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update dashboard settings
// POST - 更新仪表板设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { admin_id, settings } = body

    console.log('Updating admin dashboard settings:', { admin_id, settings })
    console.log('更新管理员仪表板设置:', { admin_id, settings })

    // Validate required fields
    // 验证必填字段
    if (!admin_id || !settings) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: admin_id and settings'
      }, { status: 400 })
    }

    // Update system configuration with dashboard settings
    // 用仪表板设置更新系统配置
    await query(`
      INSERT INTO system_config (config_key, config_value, description, created_by, is_active)
      VALUES ('admin_dashboard_settings', $1, 'Admin dashboard configuration settings', $2, true)
      ON CONFLICT (config_key) 
      DO UPDATE SET 
        config_value = EXCLUDED.config_value,
        updated_at = CURRENT_TIMESTAMP
    `, [JSON.stringify(settings), admin_id])

    // Log admin action
    // 记录管理员操作
    await query(`
      SELECT log_admin_action(
        $1::UUID, 
        'dashboard_settings_update', 
        $2::JSONB, 
        NULL, 
        NULL, 
        NULL, 
        NULL, 
        true, 
        NULL
      )
    `, [admin_id, JSON.stringify(settings)])

    return NextResponse.json({
      success: true,
      message: 'Dashboard settings updated successfully'
    })

  } catch (error) {
    console.error('Error updating dashboard settings:', error)
    console.error('更新仪表板设置错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update dashboard settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 