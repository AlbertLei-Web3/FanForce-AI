// Admin Configuration API Route
// 管理员配置API路由
// This endpoint handles system configuration management for administrators
// 此端点处理管理员的系统配置管理
//
// Related files:
// - lib/enhanced-admin-schema.sql: Database schema for admin configuration
// - app/dashboard/admin/page.tsx: Admin dashboard frontend
// - lib/database.ts: Database connection utilities
//
// 相关文件：
// - lib/enhanced-admin-schema.sql: 管理员配置的数据库架构
// - app/dashboard/admin/page.tsx: 管理员仪表板前端
// - lib/database.ts: 数据库连接工具

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// System Configuration Interface
// 系统配置接口
interface SystemConfig {
  id: string
  config_key: string
  config_value: any
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// GET - Retrieve system configuration
// GET - 检索系统配置
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching system configuration...')
    console.log('获取系统配置...')

    // Get all active system configurations
    // 获取所有活跃的系统配置
    const configResult = await query(`
      SELECT 
        id, config_key, config_value, description, is_active,
        created_at, updated_at
      FROM system_config 
      WHERE is_active = true
      ORDER BY config_key
    `)

    // Transform the result into a key-value object for easier frontend usage
    // 将结果转换为键值对象，方便前端使用
    const configs: { [key: string]: any } = {}
    configResult.rows.forEach(row => {
      configs[row.config_key] = {
        value: row.config_value,
        description: row.description,
        id: row.id,
        updated_at: row.updated_at
      }
    })

    return NextResponse.json({
      success: true,
      configs: configs,
      message: 'System configuration retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching system configuration:', error)
    console.error('获取系统配置错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch system configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Update system configuration
// POST - 更新系统配置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config_key, config_value, description, admin_id } = body

    console.log('Updating system configuration:', { config_key, config_value })
    console.log('更新系统配置:', { config_key, config_value })

    // Validate required fields
    // 验证必填字段
    if (!config_key || config_value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: config_key and config_value'
      }, { status: 400 })
    }

    // Update or insert configuration
    // 更新或插入配置
    const result = await query(`
      INSERT INTO system_config (config_key, config_value, description, created_by, is_active)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (config_key) 
      DO UPDATE SET 
        config_value = EXCLUDED.config_value,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, config_key, config_value, description
    `, [config_key, JSON.stringify(config_value), description, admin_id])

    // Log admin action
    // 记录管理员操作
    if (admin_id) {
      await query(`
        SELECT log_admin_action(
          $1::UUID, 
          'config_update', 
          $2::JSONB, 
          NULL, 
          NULL, 
          NULL, 
          NULL, 
          true, 
          NULL
        )
      `, [admin_id, JSON.stringify({ config_key, config_value, description })])
    }

    return NextResponse.json({
      success: true,
      config: result.rows[0],
      message: 'System configuration updated successfully'
    })

  } catch (error) {
    console.error('Error updating system configuration:', error)
    console.error('更新系统配置错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update system configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove system configuration
// DELETE - 删除系统配置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const config_key = searchParams.get('config_key')
    const admin_id = searchParams.get('admin_id')

    if (!config_key) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameter: config_key'
      }, { status: 400 })
    }

    console.log('Deactivating system configuration:', config_key)
    console.log('停用系统配置:', config_key)

    // Deactivate configuration instead of deleting
    // 停用配置而不是删除
    const result = await query(`
      UPDATE system_config 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE config_key = $1
      RETURNING id, config_key
    `, [config_key])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      }, { status: 404 })
    }

    // Log admin action
    // 记录管理员操作
    if (admin_id) {
      await query(`
        SELECT log_admin_action(
          $1::UUID, 
          'config_deactivate', 
          $2::JSONB, 
          NULL, 
          NULL, 
          NULL, 
          NULL, 
          true, 
          NULL
        )
      `, [admin_id, JSON.stringify({ config_key })])
    }

    return NextResponse.json({
      success: true,
      message: 'System configuration deactivated successfully'
    })

  } catch (error) {
    console.error('Error deactivating system configuration:', error)
    console.error('停用系统配置错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate system configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 