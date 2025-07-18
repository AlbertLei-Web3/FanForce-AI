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
    let query = `
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

    const result = await pool.query(query, [status, limit, offset]);

    // Get total count for pagination
    // 获取总数用于分页
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM event_applications 
      WHERE status = $1
    `;
    const countResult = await pool.query(countQuery, [status]);
    const total = parseInt(countResult.rows[0].total);

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

      // Update application status
      // 更新申请状态
      const updateAppQuery = `
        UPDATE event_applications 
        SET status = $1, 
            reviewed_by = $2, 
            reviewed_at = CURRENT_TIMESTAMP,
            admin_review = $3
        WHERE id = $4
      `;
      
      const adminReview = {
        decision: action,
        admin_notes: adminNotes,
        support_options: supportOptions,
        injected_chz_amount: injectedChzAmount,
        fee_rule_id: feeRuleId
      };

      await client.query(updateAppQuery, [
        action === 'approve' ? 'approved' : 'rejected',
        adminId,
        JSON.stringify(adminReview),
        applicationId
      ]);

      // Log the approval action
      // 记录审批操作
      const logQuery = `
        INSERT INTO event_approval_log (
          application_id, admin_id, action_type, decision,
          injected_chz_amount, fee_rule_applied, support_options,
          admin_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      
      await client.query(logQuery, [
        applicationId,
        adminId,
        action === 'approve' ? 'approve' : 'reject',
        action === 'approve' ? 'approved' : 'rejected',
        injectedChzAmount,
        feeRuleId,
        JSON.stringify(supportOptions),
        adminNotes
      ]);

      let eventId = null;

      if (action === 'approve') {
        // Create event from approved application
        // 从已批准的申请创建活动
        const createEventQuery = `
          SELECT create_event_from_application($1)
        `;
        const eventResult = await client.query(createEventQuery, [applicationId]);
        eventId = eventResult.rows[0].create_event_from_application;

        // Inject CHZ pool if amount specified
        // 如果指定了金额则注入CHZ池
        if (injectedChzAmount > 0) {
          const injectPoolQuery = `
            SELECT inject_chz_pool($1, $2, $3, $4)
          `;
          await client.query(injectPoolQuery, [
            eventId,
            injectedChzAmount,
            adminId,
            feeRuleId
          ]);

          // Update total pool amount
          // 更新总池金额
          const updatePoolQuery = `
            UPDATE events 
            SET total_pool_amount = pool_injected_chz,
                support_options = $1
            WHERE id = $2
          `;
          await client.query(updatePoolQuery, [
            JSON.stringify(supportOptions),
            eventId
          ]);
        }

        // Create default support options if specified
        // 如果指定了则创建默认支持选项
        if (supportOptions && Object.keys(supportOptions).length > 0) {
          for (const [teamKey, coefficient] of Object.entries(supportOptions)) {
            const teamName = teamKey === 'team_a_coefficient' ? 'Team A' : 'Team B';
            const teamAssociation = teamKey === 'team_a_coefficient' ? 'team_a' : 'team_b';
            
            const supportOptionQuery = `
              INSERT INTO support_options (
                event_id, option_name, option_description, 
                coefficient, team_association, is_active
              ) VALUES ($1, $2, $3, $4, $5, true)
            `;
            
            await client.query(supportOptionQuery, [
              eventId,
              `Support ${teamName}`,
              `Support ${teamName} with ${coefficient}x coefficient`,
              coefficient,
              teamAssociation
            ]);
          }
        }
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