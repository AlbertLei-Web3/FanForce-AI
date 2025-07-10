/*
 * Database Connection Test API Route
 * 数据库连接测试API路由
 * 
 * This API route tests the PostgreSQL database connection and provides
 * basic database health information for debugging and monitoring.
 * 
 * 此API路由测试PostgreSQL数据库连接，并提供基本的
 * 数据库健康信息用于调试和监控。
 * 
 * Route: GET /api/database/test
 * 路由: GET /api/database/test
 * 
 * Related files:
 * - lib/database.ts (database connection utilities)
 * - lib/schema.sql (database schema definition)
 * 
 * 相关文件：
 * - lib/database.ts (数据库连接工具)
 * - lib/schema.sql (数据库架构定义)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, testConnection } from '@/lib/database';

// Interface for database test response
// 数据库测试响应接口
interface DatabaseTestResponse {
  success: boolean;
  message: string;
  message_cn: string;
  data?: {
    currentTime: string;
    tables: string[];
    userCount: number;
    eventCount: number;
    version: string;
  };
  error?: string;
}

// Test database connection and return health information
// 测试数据库连接并返回健康信息
export async function GET(request: NextRequest): Promise<NextResponse<DatabaseTestResponse>> {
  try {
    // Step 1: Test basic database connection
    // 步骤1：测试基本数据库连接
    const connectionSuccess = await testConnection();
    
    if (!connectionSuccess) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        message_cn: '数据库连接失败',
        error: 'Unable to establish connection to PostgreSQL database',
      }, { status: 500 });
    }

    // Step 2: Get current database time
    // 步骤2：获取当前数据库时间
    const timeResult = await query('SELECT NOW() as current_time');
    const currentTime = timeResult.rows[0].current_time;

    // Step 3: Get list of tables
    // 步骤3：获取表列表
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    const tables = tablesResult.rows.map(row => row.table_name);

    // Step 4: Get user count
    // 步骤4：获取用户数量
    const userCountResult = await query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userCountResult.rows[0].count);

    // Step 5: Get event count
    // 步骤5：获取活动数量
    const eventCountResult = await query('SELECT COUNT(*) as count FROM events');
    const eventCount = parseInt(eventCountResult.rows[0].count);

    // Step 6: Get PostgreSQL version
    // 步骤6：获取PostgreSQL版本
    const versionResult = await query('SELECT version()');
    const version = versionResult.rows[0].version;

    // Return success response with database health information
    // 返回成功响应和数据库健康信息
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      message_cn: '数据库连接成功',
      data: {
        currentTime: currentTime.toISOString(),
        tables,
        userCount,
        eventCount,
        version: version.split(' ')[0] + ' ' + version.split(' ')[1], // Extract version number - 提取版本号
      },
    }, { status: 200 });

  } catch (error) {
    // Log error for debugging
    // 记录错误用于调试
    console.error('Database test API error:', error);
    console.error('数据库测试API错误:', error);

    // Return error response
    // 返回错误响应
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      message_cn: '数据库测试失败',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// Health check endpoint specifically for database
// 专门用于数据库的健康检查端点
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick connection test without detailed data
    // 快速连接测试，无详细数据
    const connectionSuccess = await testConnection();
    
    if (connectionSuccess) {
      return new NextResponse(null, { status: 200 });
    } else {
      return new NextResponse(null, { status: 503 }); // Service Unavailable - 服务不可用
    }
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
} 