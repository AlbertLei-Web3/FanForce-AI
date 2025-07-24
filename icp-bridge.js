// FanForce AI - ICP Bridge Service / FanForce AI - ICP桥梁服务
// Simple bridge service to connect PostgreSQL with ICP canisters / 连接PostgreSQL与ICP容器的简单桥梁服务
// This service provides API endpoints for ICP integration without modifying existing code / 此服务为ICP集成提供API端点，不修改现有代码

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Middleware / 中间件
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:4943',  // Local ICP network / 本地ICP网络
    'https://*.ic0.app',      // ICP mainnet / ICP主网
    'https://*.ic1.app'       // ICP mainnet alternative / ICP主网替代
  ],
  credentials: true
}));
app.use(express.json());

// Database connection (your existing PostgreSQL) / 数据库连接（您现有的PostgreSQL）
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

// ========== ICP Status Endpoints / ICP状态端点 ==========

// Get ICP canister status / 获取ICP容器状态
app.get('/api/icp/status', async (req, res) => {
  try {
    console.log('ICP Bridge: Fetching ICP status');
    console.log('ICP桥梁: 获取ICP状态');
    
    // For MVP, return mock data that simulates ICP canister response
    // 对于MVP，返回模拟ICP容器响应的模拟数据
    const mockICPStatus = {
      success: true,
      status: {
        totalSeasons: 1,
        totalClaims: 3,
        totalDistributed: 15.5,
        canisterId: 'athlete-bonus-mvp',
        network: 'local',
        connected: true,
        lastUpdated: new Date().toISOString()
      }
    };
    
    res.json(mockICPStatus);
    
  } catch (error) {
    console.error('Error fetching ICP status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ICP status',
      details: error.message
    });
  }
});

// ========== Athlete Data Endpoints / 运动员数据端点 ==========

// Get athlete match count from PostgreSQL / 从PostgreSQL获取运动员比赛数量
app.get('/api/icp/athlete-matches/:athleteId', async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    console.log(`ICP Bridge: Fetching matches for athlete ${athleteId}`);
    console.log(`ICP桥梁: 获取运动员 ${athleteId} 的比赛数据`);
    
    // Query PostgreSQL for athlete's match participation / 查询PostgreSQL获取运动员的比赛参与
    const query = `
      SELECT 
        COUNT(*) as match_count,
        COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN e.status = 'cancelled' THEN 1 END) as cancelled_matches
      FROM event_participants ep
      JOIN events e ON ep.event_id = e.id
      WHERE ep.user_id = $1 
      AND e.event_type = 'match'
    `;
    
    const result = await pool.query(query, [athleteId]);
    const matchData = result.rows[0];
    
    const response = {
      success: true,
      athleteId,
      matchCount: parseInt(matchData.match_count),
      completedMatches: parseInt(matchData.completed_matches),
      cancelledMatches: parseInt(matchData.cancelled_matches),
      message: `Athlete has participated in ${matchData.match_count} matches (${matchData.completed_matches} completed)`
    };
    
    console.log(`Found ${matchData.match_count} matches for athlete ${athleteId}`);
    console.log(`为运动员 ${athleteId} 找到 ${matchData.match_count} 场比赛`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching athlete matches:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch athlete matches',
      details: error.message
    });
  }
});

// Check athlete eligibility for ICP bonus / 检查运动员ICP奖金资格
app.post('/api/icp/check-eligibility', async (req, res) => {
  try {
    const { athleteId, seasonId } = req.body;
    
    console.log(`ICP Bridge: Checking eligibility for athlete ${athleteId}, season ${seasonId}`);
    console.log(`ICP桥梁: 检查运动员 ${athleteId} 赛季 ${seasonId} 的资格`);
    
    // Get athlete match count / 获取运动员比赛数量
    const matchQuery = `
      SELECT COUNT(*) as match_count
      FROM event_participants ep
      JOIN events e ON ep.event_id = e.id
      WHERE ep.user_id = $1 
      AND e.event_type = 'match'
      AND e.status = 'completed'
    `;
    
    const matchResult = await pool.query(matchQuery, [athleteId]);
    const matchCount = parseInt(matchResult.rows[0].match_count);
    
    // For MVP, use fixed season requirements / 对于MVP，使用固定的赛季要求
    const requiredMatches = 10;
    const bonusAmount = 5.0; // 5 ICP / 5 ICP
    
    const eligible = matchCount >= requiredMatches;
    
    const response = {
      success: true,
      athleteId,
      seasonId,
      matchCount,
      requiredMatches,
      eligible,
      bonusAmount,
      reason: eligible 
        ? 'Eligible for bonus' 
        : `Not enough matches. Required: ${requiredMatches}, Have: ${matchCount}`,
      seasonInfo: {
        id: seasonId,
        name: 'Spring 2024 Season',
        isActive: true,
        requiredMatches,
        bonusAmount
      }
    };
    
    console.log(`Eligibility result: ${eligible} (${matchCount}/${requiredMatches} matches)`);
    console.log(`资格结果: ${eligible} (${matchCount}/${requiredMatches} 场比赛)`);
    
    res.json(response);
    
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check eligibility',
      details: error.message
    });
  }
});

// Claim ICP bonus / 领取ICP奖金
app.post('/api/icp/claim-bonus', async (req, res) => {
  try {
    const { athleteId, seasonId } = req.body;
    
    console.log(`ICP Bridge: Processing bonus claim for athlete ${athleteId}, season ${seasonId}`);
    console.log(`ICP桥梁: 处理运动员 ${athleteId} 赛季 ${seasonId} 的奖金领取`);
    
    // First check eligibility / 首先检查资格
    const eligibilityResponse = await fetch('http://localhost:3002/api/icp/check-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ athleteId, seasonId })
    });
    
    const eligibilityData = await eligibilityResponse.json();
    
    if (!eligibilityData.success || !eligibilityData.eligible) {
      return res.status(400).json({
        success: false,
        error: 'Not eligible for bonus',
        details: eligibilityData.reason
      });
    }
    
    // For MVP, simulate successful claim / 对于MVP，模拟成功领取
    const claimResult = {
      success: true,
      athleteId,
      seasonId,
      bonusAmount: eligibilityData.bonusAmount,
      claimTime: new Date().toISOString(),
      transactionId: `icp-claim-${Date.now()}`,
      message: `Successfully claimed ${eligibilityData.bonusAmount} ICP bonus`
    };
    
    console.log(`Bonus claimed successfully: ${eligibilityData.bonusAmount} ICP`);
    console.log(`奖金领取成功: ${eligibilityData.bonusAmount} ICP`);
    
    res.json(claimResult);
    
  } catch (error) {
    console.error('Error claiming bonus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim bonus',
      details: error.message
    });
  }
});

// ========== Season Management Endpoints / 赛季管理端点 ==========

// Get all seasons / 获取所有赛季
app.get('/api/icp/seasons', async (req, res) => {
  try {
    console.log('ICP Bridge: Fetching seasons');
    console.log('ICP桥梁: 获取赛季');
    
    // For MVP, return mock season data / 对于MVP，返回模拟赛季数据
    const mockSeasons = [
      {
        id: 'spring-2024',
        name: 'Spring 2024 Season',
        startDate: new Date('2024-03-01').getTime(),
        endDate: new Date('2024-06-30').getTime(),
        isActive: true,
        requiredMatches: 10,
        bonusAmount: 5.0,
        totalPool: 1000.0,
        distributedPool: 15.5
      }
    ];
    
    res.json({
      success: true,
      seasons: mockSeasons
    });
    
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seasons',
      details: error.message
    });
  }
});

// ========== Health Check / 健康检查 ==========

app.get('/api/icp/health', (req, res) => {
  res.json({
    success: true,
    service: 'ICP Bridge Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========== Error Handling / 错误处理 ==========

app.use((err, req, res, next) => {
  console.error('ICP Bridge error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: err.message
  });
});

// ========== Server Startup / 服务器启动 ==========

const PORT = process.env.ICP_BRIDGE_PORT || 3002;

app.listen(PORT, () => {
  console.log(`🚀 ICP Bridge service running on port ${PORT}`);
  console.log(`🚀 ICP桥梁服务运行在端口 ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/icp/health`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/icp/health`);
  console.log(`🔗 Status: http://localhost:${PORT}/api/icp/status`);
  console.log(`🔗 状态: http://localhost:${PORT}/api/icp/status`);
}); 