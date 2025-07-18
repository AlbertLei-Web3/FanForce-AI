// Admin Fee Rules API Route
// 管理员手续费规则API路由
// This endpoint handles fee rules configuration for administrators
// 此端点处理管理员的手续费规则配置
//
// Related files:
// - lib/enhanced-admin-schema.sql: Database schema for fee rules
// - app/dashboard/admin/page.tsx: Admin dashboard frontend
// - lib/database.ts: Database connection utilities
//
// 相关文件：
// - lib/enhanced-admin-schema.sql: 手续费规则的数据库架构
// - app/dashboard/admin/page.tsx: 管理员仪表板前端
// - lib/database.ts: 数据库连接工具

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

// GET /api/admin/fee-rules
// Get all fee rules for admin selection
// 获取所有手续费规则供管理员选择
export async function GET(request: NextRequest) {
  try {
    console.log('Admin: Fetching fee rules');
    console.log('管理员: 获取手续费规则');

    const query = `
      SELECT 
        id,
        rule_name,
        staking_fee_percent,
        withdrawal_fee_percent,
        distribution_fee_percent,
        ambassador_share_percent,
        athlete_share_percent,
        community_fund_percent,
        is_active,
        effective_date,
        created_at
      FROM fee_rules 
      WHERE is_active = true
      ORDER BY effective_date DESC
    `;

    const result = await pool.query(query);

    console.log(`Found ${result.rows.length} active fee rules`);
    console.log(`找到 ${result.rows.length} 个活跃的手续费规则`);

    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching fee rules:', error);
    console.error('获取手续费规则时出错:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fee rules' },
      { status: 500 }
    );
  }
}

// POST /api/admin/fee-rules
// Create a new fee rule
// 创建新的手续费规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ruleName,
      stakingFeePercent,
      withdrawalFeePercent,
      distributionFeePercent,
      ambassadorSharePercent,
      athleteSharePercent,
      communityFundPercent,
      adminId
    } = body;

    console.log('Admin: Creating new fee rule:', ruleName);
    console.log('管理员: 创建新的手续费规则:', ruleName);

    if (!ruleName || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO fee_rules (
        rule_name,
        staking_fee_percent,
        withdrawal_fee_percent,
        distribution_fee_percent,
        ambassador_share_percent,
        athlete_share_percent,
        community_fund_percent,
        is_active,
        effective_date,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP, $8)
      RETURNING id
    `;

    const result = await pool.query(query, [
      ruleName,
      stakingFeePercent || 5.00,
      withdrawalFeePercent || 2.00,
      distributionFeePercent || 3.00,
      ambassadorSharePercent || 1.00,
      athleteSharePercent || 1.00,
      communityFundPercent || 1.00,
      adminId
    ]);

    console.log(`✅ Fee rule created with ID: ${result.rows[0].id}`);
    console.log(`✅ 手续费规则创建成功，ID: ${result.rows[0].id}`);

    return NextResponse.json({
      success: true,
      message: 'Fee rule created successfully',
      data: {
        id: result.rows[0].id,
        ruleName
      }
    });

  } catch (error) {
    console.error('Error creating fee rule:', error);
    console.error('创建手续费规则时出错:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create fee rule' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/fee-rules/[id]
// Update an existing fee rule
// 更新现有的手续费规则
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ruleId,
      ruleName,
      stakingFeePercent,
      withdrawalFeePercent,
      distributionFeePercent,
      ambassadorSharePercent,
      athleteSharePercent,
      communityFundPercent,
      isActive,
      adminId
    } = body;

    console.log('Admin: Updating fee rule:', ruleId);
    console.log('管理员: 更新手续费规则:', ruleId);

    if (!ruleId || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const query = `
      UPDATE fee_rules 
      SET 
        rule_name = COALESCE($1, rule_name),
        staking_fee_percent = COALESCE($2, staking_fee_percent),
        withdrawal_fee_percent = COALESCE($3, withdrawal_fee_percent),
        distribution_fee_percent = COALESCE($4, distribution_fee_percent),
        ambassador_share_percent = COALESCE($5, ambassador_share_percent),
        athlete_share_percent = COALESCE($6, athlete_share_percent),
        community_fund_percent = COALESCE($7, community_fund_percent),
        is_active = COALESCE($8, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING id
    `;

    const result = await pool.query(query, [
      ruleName,
      stakingFeePercent,
      withdrawalFeePercent,
      distributionFeePercent,
      ambassadorSharePercent,
      athleteSharePercent,
      communityFundPercent,
      isActive,
      ruleId
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Fee rule not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Fee rule updated successfully`);
    console.log(`✅ 手续费规则更新成功`);

    return NextResponse.json({
      success: true,
      message: 'Fee rule updated successfully'
    });

  } catch (error) {
    console.error('Error updating fee rule:', error);
    console.error('更新手续费规则时出错:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update fee rule' },
      { status: 500 }
    );
  }
}

// GET - Retrieve fee rules history
// GET - 检索手续费规则历史
export async function GET_HISTORY(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('Fetching fee rules history...')
    console.log('获取手续费规则历史...')

    const result = await query(`
      SELECT 
        id, rule_name, staking_fee_percent, withdrawal_fee_percent, 
        distribution_fee_percent, ambassador_share_percent, 
        athlete_share_percent, community_fund_percent, 
        is_active, effective_date, created_at, updated_at
      FROM fee_rules 
      ORDER BY effective_date DESC
      LIMIT $1
    `, [limit])

    return NextResponse.json({
      success: true,
      fee_rules_history: result.rows,
      message: 'Fee rules history retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching fee rules history:', error)
    console.error('获取手续费规则历史错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fee rules history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 