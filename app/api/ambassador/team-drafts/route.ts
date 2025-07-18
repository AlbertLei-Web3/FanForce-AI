// Ambassador Team Drafts API Route
// 大使队伍草稿API路由
// This endpoint handles team draft creation and management for ambassadors
// 此端点处理大使的队伍草稿创建和管理

import { NextRequest, NextResponse } from 'next/server'
import { query } from '../../../../lib/database'

// Team Draft Interface
// 队伍草稿接口
interface TeamDraft {
  id?: string
  ambassador_id: string
  draft_name: string
  sport_type: string
  team_a_name: string
  team_a_athletes: string[] // Array of athlete IDs
  team_a_metadata: any
  team_b_name: string
  team_b_athletes: string[] // Array of athlete IDs
  team_b_metadata: any
  status: 'draft' | 'submitted' | 'approved' | 'cancelled'
  estimated_duration?: number
  match_notes?: string
}

// GET - Retrieve ambassador's team drafts
// GET - 获取大使的队伍草稿
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ambassador_id = searchParams.get('ambassador_id')
    const draft_id = searchParams.get('draft_id')
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    console.log('Fetching ambassador team drafts...', { ambassador_id, draft_id, status, page, limit })
    console.log('获取大使队伍草稿...', { ambassador_id, draft_id, status, page, limit })

    // If draft_id is provided, return single draft
    // 如果提供了draft_id，返回单个草稿
    if (draft_id) {
      const draftQuery = `
        SELECT 
          td.*,
          (
            SELECT json_agg(
              json_build_object(
                'id', u.id,
                'profile_data', u.profile_data,
                'virtual_chz_balance', u.virtual_chz_balance
              )
            )
            FROM users u 
            WHERE u.id = ANY(
              SELECT jsonb_array_elements_text(td.team_a_athletes)::uuid
            ) AND u.role = 'athlete'
          ) as team_a_athlete_details,
          (
            SELECT json_agg(
              json_build_object(
                'id', u.id,
                'profile_data', u.profile_data,
                'virtual_chz_balance', u.virtual_chz_balance
              )
            )
            FROM users u 
            WHERE u.id = ANY(
              SELECT jsonb_array_elements_text(td.team_b_athletes)::uuid
            ) AND u.role = 'athlete'
          ) as team_b_athlete_details
        FROM team_drafts td
        WHERE td.id = $1
      `

      const draft = await query(draftQuery, [draft_id])

      if (draft.rows.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Draft not found',
          error_cn: '草稿未找到'
        }, { status: 404 })
      }

      const draftData = draft.rows[0]

      // Safe JSON parsing function
      const safeJsonParse = (value, defaultValue) => {
        try {
          if (!value) return defaultValue;
          if (typeof value === 'object') return value;
          return JSON.parse(value);
        } catch (error) {
          console.error('JSON parse error:', error, 'Value:', value);
          return defaultValue;
        }
      };

      return NextResponse.json({
        success: true,
        draft: {
          ...draftData,
          team_a_athletes: safeJsonParse(draftData.team_a_athletes, []),
          team_b_athletes: safeJsonParse(draftData.team_b_athletes, []),
          team_a_metadata: safeJsonParse(draftData.team_a_metadata, {}),
          team_b_metadata: safeJsonParse(draftData.team_b_metadata, {}),
          team_a_athlete_details: draftData.team_a_athlete_details || [],
          team_b_athlete_details: draftData.team_b_athlete_details || []
        },
        message: 'Draft retrieved successfully',
        message_cn: '草稿获取成功'
      })
    }

    // Validate required parameters for list query
    // 验证列表查询的必需参数
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

    // Get team drafts with pagination
    // 获取分页的队伍草稿列表
    const draftsQuery = `
      SELECT 
        td.*,
        (
          SELECT json_agg(
            json_build_object(
              'id', u.id,
              'profile_data', u.profile_data,
              'virtual_chz_balance', u.virtual_chz_balance
            )
          )
          FROM users u 
          WHERE u.id = ANY(
            SELECT jsonb_array_elements_text(td.team_a_athletes)::uuid
          ) AND u.role = 'athlete'
        ) as team_a_athlete_details,
        (
          SELECT json_agg(
            json_build_object(
              'id', u.id,
              'profile_data', u.profile_data,
              'virtual_chz_balance', u.virtual_chz_balance
            )
          )
          FROM users u 
          WHERE u.id = ANY(
            SELECT jsonb_array_elements_text(td.team_b_athletes)::uuid
          ) AND u.role = 'athlete'
        ) as team_b_athlete_details
      FROM team_drafts td
      WHERE td.ambassador_id = $1 
      ${statusFilter}
      ORDER BY td.updated_at DESC
      LIMIT $2 OFFSET ${status === 'all' ? '$3' : '$4'}
    `

    const queryParams = status === 'all' 
      ? [ambassador_id, limit, offset]
      : [ambassador_id, limit, status, offset]

    const drafts = await query(draftsQuery, queryParams)

    // Get total count for pagination
    // 获取分页总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM team_drafts
      WHERE ambassador_id = $1 ${statusFilter}
    `
    const countParams = status === 'all' ? [ambassador_id] : [ambassador_id, status]
    const totalCount = await query(countQuery, countParams)

    // Get available athletes for team selection
    // 获取可用于队伍选择的运动员
    const availableAthletes = await query(`
      SELECT 
        u.id,
        u.profile_data,
        u.virtual_chz_balance,
        a.ranking,
        a.tier,
        a.status,
        a.matches_played,
        a.matches_won,
        a.availability_status,
        a.performance_stats
      FROM users u
      JOIN athletes a ON u.id = a.user_id
      WHERE u.role = 'athlete' 
        AND a.availability_status = 'available'
        AND a.status IN ('active', 'resting')
      ORDER BY a.ranking DESC, a.tier DESC
      LIMIT 50
    `)

    // Safe JSON parsing function
    const safeJsonParse = (value, defaultValue) => {
      try {
        if (!value) return defaultValue;
        if (typeof value === 'object') return value;
        return JSON.parse(value);
      } catch (error) {
        console.error('JSON parse error:', error, 'Value:', value);
        return defaultValue;
      }
    };

    return NextResponse.json({
      success: true,
      drafts: drafts.rows.map(draft => ({
        ...draft,
        team_a_athletes: safeJsonParse(draft.team_a_athletes, []),
        team_b_athletes: safeJsonParse(draft.team_b_athletes, []),
        team_a_metadata: safeJsonParse(draft.team_a_metadata, {}),
        team_b_metadata: safeJsonParse(draft.team_b_metadata, {}),
        team_a_athlete_details: draft.team_a_athlete_details || [],
        team_b_athlete_details: draft.team_b_athlete_details || []
      })),
      available_athletes: availableAthletes.rows.map(athlete => ({
        ...athlete,
        profile_data: athlete.profile_data || {},
        performance_stats: athlete.performance_stats || {}
      })),
      pagination: {
        page,
        limit,
        total: parseInt(totalCount.rows[0].total),
        totalPages: Math.ceil(parseInt(totalCount.rows[0].total) / limit)
      },
      message: 'Team drafts retrieved successfully',
      message_cn: '队伍草稿获取成功'
    })

  } catch (error) {
    console.error('Error fetching team drafts:', error)
    console.error('获取队伍草稿错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch team drafts',
      error_cn: '获取队伍草稿失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create new team draft
// POST - 创建新的队伍草稿
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ambassador_id,
      draft_name,
      sport_type = 'soccer',
      team_a_name,
      team_a_athletes = [],
      team_a_metadata = {},
      team_b_name,
      team_b_athletes = [],
      team_b_metadata = {},
      estimated_duration = 90,
      match_notes = ''
    } = body

    console.log('Creating new team draft:', { ambassador_id, draft_name, sport_type })
    console.log('创建新队伍草稿:', { ambassador_id, draft_name, sport_type })

    // Validate required fields
    // 验证必填字段
    const requiredFields = {
      ambassador_id: 'Ambassador ID',
      draft_name: 'Draft name',
      team_a_name: 'Team A name',
      team_b_name: 'Team B name'
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

    // Validate team names are different
    // 验证队伍名称不同
    if (team_a_name.toLowerCase() === team_b_name.toLowerCase()) {
      return NextResponse.json({
        success: false,
        error: 'Team names must be different',
        error_cn: '队伍名称必须不同'
      }, { status: 400 })
    }

    // Validate athlete selections
    // 验证运动员选择
    if (team_a_athletes.length > 0) {
      const teamACheck = await query(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN athletes a ON u.id = a.user_id
        WHERE u.id = ANY($1) AND u.role = 'athlete' AND a.availability_status = 'available'
      `, [team_a_athletes])

      if (parseInt(teamACheck.rows[0].count) !== team_a_athletes.length) {
        return NextResponse.json({
          success: false,
          error: 'Some selected Team A athletes are not available',
          error_cn: '某些选择的队伍A运动员不可用'
        }, { status: 400 })
      }
    }

    if (team_b_athletes.length > 0) {
      const teamBCheck = await query(`
        SELECT COUNT(*) as count
        FROM users u
        JOIN athletes a ON u.id = a.user_id
        WHERE u.id = ANY($1) AND u.role = 'athlete' AND a.availability_status = 'available'
      `, [team_b_athletes])

      if (parseInt(teamBCheck.rows[0].count) !== team_b_athletes.length) {
        return NextResponse.json({
          success: false,
          error: 'Some selected Team B athletes are not available',
          error_cn: '某些选择的队伍B运动员不可用'
        }, { status: 400 })
      }
    }

    // Check for athlete conflicts (same athlete on both teams)
    // 检查运动员冲突（同一运动员在两支队伍）
    const conflictAthletes = team_a_athletes.filter(id => team_b_athletes.includes(id))
    if (conflictAthletes.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Athletes cannot be on both teams',
        error_cn: '运动员不能同时在两支队伍',
        conflict_athletes: conflictAthletes
      }, { status: 400 })
    }

    // Create the team draft
    // 创建队伍草稿
    const insertQuery = `
      INSERT INTO team_drafts (
        ambassador_id, draft_name, sport_type, team_a_name, team_a_athletes, team_a_metadata,
        team_b_name, team_b_athletes, team_b_metadata, estimated_duration, match_notes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `

    const newDraft = await query(insertQuery, [
      ambassador_id, draft_name, sport_type, team_a_name, 
      JSON.stringify(team_a_athletes), JSON.stringify(team_a_metadata),
      team_b_name, JSON.stringify(team_b_athletes), JSON.stringify(team_b_metadata),
      estimated_duration, match_notes
    ])

    const draft = newDraft.rows[0]

    // 防御性解析，避免 JSON.parse 报错
    const safeJsonParse = (value, defaultValue) => {
      try {
        if (!value) return defaultValue;
        if (typeof value === 'object') return value;
        return JSON.parse(value);
      } catch (error) {
        console.error('JSON parse error:', error, 'Value:', value);
        return defaultValue;
      }
    };

    return NextResponse.json({
      success: true,
      draft: {
        ...draft,
        team_a_athletes: safeJsonParse(draft.team_a_athletes, []),
        team_b_athletes: safeJsonParse(draft.team_b_athletes, []),
        team_a_metadata: safeJsonParse(draft.team_a_metadata, {}),
        team_b_metadata: safeJsonParse(draft.team_b_metadata, {})
      },
      message: 'Team draft created successfully',
      message_cn: '队伍草稿创建成功'
    })

  } catch (error) {
    console.error('Error creating team draft:', error)
    console.error('创建队伍草稿错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create team draft',
      error_cn: '创建队伍草稿失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update existing team draft
// PUT - 更新现有队伍草稿
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      draft_id,
      ambassador_id,
      draft_name,
      team_a_name,
      team_a_athletes,
      team_a_metadata,
      team_b_name,
      team_b_athletes,
      team_b_metadata,
      estimated_duration,
      match_notes,
      status
    } = body

    console.log('Updating team draft:', { draft_id, ambassador_id })
    console.log('更新队伍草稿:', { draft_id, ambassador_id })

    // Validate required fields
    // 验证必填字段
    if (!draft_id || !ambassador_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: draft_id and ambassador_id',
        error_cn: '缺少必填字段：draft_id和ambassador_id'
      }, { status: 400 })
    }

    // Check if draft exists and belongs to ambassador
    // 检查草稿是否存在且属于该大使
    const draftCheck = await query(`
      SELECT id, status
      FROM team_drafts
      WHERE id = $1 AND ambassador_id = $2
    `, [draft_id, ambassador_id])

    if (draftCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Team draft not found or does not belong to ambassador',
        error_cn: '队伍草稿未找到或不属于该大使'
      }, { status: 404 })
    }

    // Check if draft can be modified
    // 检查草稿是否可以修改
    const currentStatus = draftCheck.rows[0].status
    if (currentStatus === 'approved' || currentStatus === 'submitted') {
      return NextResponse.json({
        success: false,
        error: `Cannot modify draft with status: ${currentStatus}`,
        error_cn: `无法修改状态为${currentStatus}的草稿`
      }, { status: 400 })
    }

    // Build update query dynamically
    // 动态构建更新查询
    const updateFields = []
    const updateValues = []
    let paramCounter = 1

    if (draft_name) {
      updateFields.push(`draft_name = $${paramCounter}`)
      updateValues.push(draft_name)
      paramCounter++
    }

    if (team_a_name) {
      updateFields.push(`team_a_name = $${paramCounter}`)
      updateValues.push(team_a_name)
      paramCounter++
    }

    if (team_a_athletes !== undefined) {
      updateFields.push(`team_a_athletes = $${paramCounter}`)
      updateValues.push(JSON.stringify(team_a_athletes))
      paramCounter++
    }

    if (team_a_metadata !== undefined) {
      updateFields.push(`team_a_metadata = $${paramCounter}`)
      updateValues.push(JSON.stringify(team_a_metadata))
      paramCounter++
    }

    if (team_b_name) {
      updateFields.push(`team_b_name = $${paramCounter}`)
      updateValues.push(team_b_name)
      paramCounter++
    }

    if (team_b_athletes !== undefined) {
      updateFields.push(`team_b_athletes = $${paramCounter}`)
      updateValues.push(JSON.stringify(team_b_athletes))
      paramCounter++
    }

    if (team_b_metadata !== undefined) {
      updateFields.push(`team_b_metadata = $${paramCounter}`)
      updateValues.push(JSON.stringify(team_b_metadata))
      paramCounter++
    }

    if (estimated_duration) {
      updateFields.push(`estimated_duration = $${paramCounter}`)
      updateValues.push(estimated_duration)
      paramCounter++
    }

    if (match_notes !== undefined) {
      updateFields.push(`match_notes = $${paramCounter}`)
      updateValues.push(match_notes)
      paramCounter++
    }

    if (status) {
      updateFields.push(`status = $${paramCounter}`)
      updateValues.push(status)
      paramCounter++
    }

    if (updateFields.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update',
        error_cn: '没有要更新的字段'
      }, { status: 400 })
    }

    // Add updated_at
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`)

    // Add WHERE clause parameters
    updateValues.push(draft_id, ambassador_id)

    const updateQuery = `
      UPDATE team_drafts 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter} AND ambassador_id = $${paramCounter + 1}
      RETURNING *
    `

    const updatedDraft = await query(updateQuery, updateValues)

    const draft = updatedDraft.rows[0]

    // 防御性解析，避免 JSON.parse 报错
    const safeJsonParse = (value, defaultValue) => {
      try {
        if (!value) return defaultValue;
        if (typeof value === 'object') return value;
        return JSON.parse(value);
      } catch (error) {
        console.error('JSON parse error:', error, 'Value:', value);
        return defaultValue;
      }
    };

    return NextResponse.json({
      success: true,
      draft: {
        ...draft,
        team_a_athletes: safeJsonParse(draft.team_a_athletes, []),
        team_b_athletes: safeJsonParse(draft.team_b_athletes, []),
        team_a_metadata: safeJsonParse(draft.team_a_metadata, {}),
        team_b_metadata: safeJsonParse(draft.team_b_metadata, {})
      },
      message: 'Team draft updated successfully',
      message_cn: '队伍草稿更新成功'
    })

  } catch (error) {
    console.error('Error updating team draft:', error)
    console.error('更新队伍草稿错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update team draft',
      error_cn: '更新队伍草稿失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete team draft
// DELETE - 删除队伍草稿
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const draft_id = searchParams.get('draft_id')
    const ambassador_id = searchParams.get('ambassador_id')

    if (!draft_id || !ambassador_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: draft_id and ambassador_id',
        error_cn: '缺少必需参数：draft_id和ambassador_id'
      }, { status: 400 })
    }

    console.log('Deleting team draft:', { draft_id, ambassador_id })
    console.log('删除队伍草稿:', { draft_id, ambassador_id })

    // Check if draft exists and can be deleted
    // 检查草稿是否存在且可以删除
    const draftCheck = await query(`
      SELECT id, status
      FROM team_drafts
      WHERE id = $1 AND ambassador_id = $2
    `, [draft_id, ambassador_id])

    if (draftCheck.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Team draft not found or does not belong to ambassador',
        error_cn: '队伍草稿未找到或不属于该大使'
      }, { status: 404 })
    }

    const currentStatus = draftCheck.rows[0].status
    if (currentStatus === 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete approved draft',
        error_cn: '无法删除已批准的草稿'
      }, { status: 400 })
    }

    // Delete the draft
    // 删除草稿
    await query(`
      DELETE FROM team_drafts
      WHERE id = $1 AND ambassador_id = $2
    `, [draft_id, ambassador_id])

    return NextResponse.json({
      success: true,
      message: 'Team draft deleted successfully',
      message_cn: '队伍草稿删除成功'
    })

  } catch (error) {
    console.error('Error deleting team draft:', error)
    console.error('删除队伍草稿错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete team draft',
      error_cn: '删除队伍草稿失败',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 