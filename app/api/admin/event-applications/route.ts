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

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection pool
// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
});

// GET /api/admin/event-applications
// Get all event applications for admin review
// 获取所有活动申请供管理员审核
export async function GET(request: NextRequest) {
  try {
    console.log('Admin: Fetching event applications for review');
    console.log('管理员: 获取待审核的活动申请');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query with filters
    // 构建带过滤器的查询
    let query;
    let countQuery;
    let queryParams;
    
    if (status === 'all') {
      // Get all applications regardless of status
      // 获取所有申请，不考虑状态
      query = `
        SELECT 
          ea.*,
          u.wallet_address as ambassador_wallet,
          u.student_id as ambassador_student_id,
          fr.rule_name as fee_rule_name,
          fr.staking_fee_percent,
          fr.distribution_fee_percent
        FROM event_applications ea
        LEFT JOIN users u ON ea.ambassador_id = u.id
        LEFT JOIN fee_rules fr ON fr.is_active = true
        ORDER BY ea.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      countQuery = `
        SELECT COUNT(*) as total 
        FROM event_applications
      `;
      
      queryParams = [limit, offset];
    } else {
      // Get applications with specific status
      // 获取特定状态的申请
      query = `
        SELECT 
          ea.*,
          u.wallet_address as ambassador_wallet,
          u.student_id as ambassador_student_id,
          fr.rule_name as fee_rule_name,
          fr.staking_fee_percent,
          fr.distribution_fee_percent
        FROM event_applications ea
        LEFT JOIN users u ON ea.ambassador_id = u.id
        LEFT JOIN fee_rules fr ON fr.is_active = true
        WHERE ea.status = $1
        ORDER BY ea.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      countQuery = `
        SELECT COUNT(*) as total 
        FROM event_applications 
        WHERE status = $1
      `;
      
      queryParams = [status, limit, offset];
    }

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    // 获取总数用于分页
    const countResult = await pool.query(countQuery, status === 'all' ? [] : [status]);
    const total = parseInt((countResult.rows[0] as any)?.total || '0');

    console.log(`Found ${result.rows.length} applications with status: ${status}`);
    console.log(`找到 ${result.rows.length} 个状态为 ${status} 的申请`);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching event applications:', error);
    console.error('获取活动申请时出错:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch event applications' },
      { status: 500 }
    );
  }
}

// POST /api/admin/event-applications
// Approve or reject event applications with pool injection
// 批准或拒绝活动申请并注入奖池
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      applicationId, 
      action, // 'approve' or 'reject'
      adminId,
      injectedChzAmount = 0,
      feeRuleId,
      supportOptions = {},
      adminNotes = ''
    } = body;

    console.log(`Admin: Processing application ${applicationId} with action: ${action}`);
    console.log(`管理员: 处理申请 ${applicationId}，操作: ${action}`);

    if (!applicationId || !action || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Start transaction
    // 开始事务
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get application details
      // 获取申请详情
      const appQuery = `
        SELECT * FROM event_applications 
        WHERE id = $1 AND status = 'pending'
      `;
      const appResult = await client.query(appQuery, [applicationId]);
      
      if (appResult.rows.length === 0) {
        throw new Error('Application not found or already processed');
      }

      const application = appResult.rows[0];

      let eventId = null;

      if (action === 'approve') {
        // Use the complete approval function
        // 使用完整的批准函数
        const approvalQuery = `
          SELECT complete_event_approval($1, $2, $3, $4, $5, $6)
        `;
        
        const teamACoefficient = supportOptions?.team_a_coefficient || 1.0;
        const teamBCoefficient = supportOptions?.team_b_coefficient || 1.0;
        
        const approvalResult = await client.query(approvalQuery, [
          applicationId,
          adminId,
          injectedChzAmount,
          teamACoefficient,
          teamBCoefficient,
          adminNotes
        ]);
        
        eventId = approvalResult.rows[0].complete_event_approval;
        
        console.log(`✅ Event created successfully with ID: ${eventId}`);
        console.log(`✅ 事件创建成功，ID: ${eventId}`);
      } else {
        // Use the rejection function
        // 使用拒绝函数
        const rejectionQuery = `
          SELECT reject_event_application($1, $2, $3)
        `;
        
        await client.query(rejectionQuery, [
          applicationId,
          adminId,
          adminNotes
        ]);
        
        console.log(`✅ Application rejected successfully`);
        console.log(`✅ 申请拒绝成功`);
      }

      await client.query('COMMIT');

      console.log(`✅ Application ${applicationId} ${action}d successfully`);
      console.log(`✅ 申请 ${applicationId} ${action === 'approve' ? '批准' : '拒绝'}成功`);

      return NextResponse.json({
        success: true,
        message: `Application ${action}d successfully`,
        data: {
          applicationId,
          eventId,
          action,
          injectedChzAmount
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error processing event application:', error);
    console.error('处理活动申请时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process application' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/event-applications/[id]
// Update specific event application
// 更新特定活动申请
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      applicationId, 
      adminId,
      action,
      injectedChzAmount,
      feeRuleId,
      supportOptions,
      adminNotes
    } = body;

    console.log(`Admin: Updating application ${applicationId}`);
    console.log(`管理员: 更新申请 ${applicationId}`);

    // This would handle updates to existing applications
    // 这将处理对现有申请的更新
    // For now, we'll redirect to POST for approval/rejection
    // 目前，我们将重定向到POST进行批准/拒绝
    
    return NextResponse.json({
      success: false,
      error: 'Use POST method for approval/rejection actions'
    }, { status: 405 });

  } catch (error) {
    console.error('Error updating event application:', error);
    console.error('更新活动申请时出错:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
} 