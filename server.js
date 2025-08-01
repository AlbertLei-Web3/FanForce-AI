// FanForce AI Backend API Server
// FanForce AI 后端API服务器
// This file sets up the Express server with all necessary middleware and routes
// 此文件使用所有必要的中间件和路由设置Express服务器

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const { body, validationResult } = require('express-validator');
const http = require('http'); // HTTP server for Socket.io / 用于Socket.io的HTTP服务器
const { Server } = require('socket.io'); // Socket.io server / Socket.io服务器
require('dotenv').config(); // Load environment variables / 加载环境变量

// Create Express app
// 创建Express应用
const app = express();

// Create HTTP server for Socket.io integration
// 为Socket.io集成创建HTTP服务器
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
// 使用CORS配置初始化Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Environment configuration
// 环境配置
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Winston logger configuration
// Winston日志记录器配置
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

// Create logs directory if it doesn't exist
// 如果logs目录不存在，则创建它
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Database connection pool
// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD, // Read from environment variables / 从环境变量读取
  max: 10, // Maximum number of connections in the pool / 连接池中的最大连接数
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle / 客户端允许保持空闲的时间
  connectionTimeoutMillis: 5000, // How long to wait for a connection / 等待连接的时间
});

// Test database connection on startup
// 启动时测试数据库连接
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed:', err);
    logger.error('数据库连接失败:', err);
    process.exit(1);
  } else {
    logger.info('Database connected successfully');
    logger.info('数据库连接成功');
  }
});

// Security middleware
// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development / 开发时禁用CSP
  crossOriginEmbedderPolicy: false
}));

// Rate limiting middleware
// 速率限制中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes / 15分钟
  max: 100, // Limit each IP to 100 requests per windowMs / 每个IP在windowMs内限制100个请求
  message: {
    error: 'Too many requests from this IP, please try again later.',
    message: '来自此IP的请求过多，请稍后再试。'
  }
});
app.use('/api/', limiter);

// CORS configuration
// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Request logging middleware
// 请求日志中间件
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Body parsing middleware
// 请求体解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT authentication middleware
// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required', 
      message: '需要访问令牌' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fanforce-ai-super-secret-jwt-key-2024', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token', 
        message: '无效令牌' 
      });
    }
    req.user = user;
    next();
  });
};

// WebSocket JWT authentication middleware
// WebSocket JWT认证中间件
const authenticateSocketToken = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fanforce-ai-super-secret-jwt-key-2024', (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.userId = decoded.userId;
    socket.walletAddress = decoded.walletAddress;
    socket.userRole = decoded.role;
    next();
  });
};

// WebSocket connection handling
// WebSocket连接处理
io.use(authenticateSocketToken);

io.on('connection', (socket) => {
  logger.info(`🔗 User connected: ${socket.userId} (${socket.userRole})`);
  logger.info(`🔗 用户连接: ${socket.userId} (${socket.userRole})`);
  
  // Join user to role-based rooms
  // 将用户加入基于角色的房间
  socket.join(`user_${socket.userId}`);
  socket.join(`role_${socket.userRole}`);
  
  // Join general notifications room
  // 加入通用通知房间
  socket.join('general_notifications');
  
  // Send welcome message with user info
  // 发送欢迎消息和用户信息
  socket.emit('connected', {
    message: 'Connected to FanForce AI real-time server',
    message_cn: '已连接到FanForce AI实时服务器',
    userId: socket.userId,
    role: socket.userRole,
    timestamp: new Date().toISOString()
  });
  
  // Handle user status updates
  // 处理用户状态更新
  socket.on('update_status', async (data) => {
    try {
      logger.info(`📊 Status update from user ${socket.userId}: ${JSON.stringify(data)}`);
      
      // Broadcast to role-specific rooms
      // 广播到特定角色房间
      io.to(`role_${socket.userRole}`).emit('user_status_update', {
        userId: socket.userId,
        role: socket.userRole,
        status: data.status,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('Status update error:', error);
      socket.emit('error', { message: 'Status update failed', error: error.message });
    }
  });
  
  // Handle event participation updates
  // 处理活动参与更新
  socket.on('join_event', async (data) => {
    try {
      const { eventId } = data;
      logger.info(`🎯 User ${socket.userId} joining event ${eventId}`);
      
      // Join event-specific room
      // 加入特定活动房间
      socket.join(`event_${eventId}`);
      
      // Notify other participants
      // 通知其他参与者
      socket.to(`event_${eventId}`).emit('participant_joined', {
        userId: socket.userId,
        role: socket.userRole,
        eventId: eventId,
        timestamp: new Date().toISOString()
      });
      
      // Send confirmation to user
      // 向用户发送确认
      socket.emit('event_joined', {
        message: `Successfully joined event ${eventId}`,
        message_cn: `成功加入活动 ${eventId}`,
        eventId: eventId
      });
      
    } catch (error) {
      logger.error('Join event error:', error);
      socket.emit('error', { message: 'Failed to join event', error: error.message });
    }
  });
  
  // Handle QR code scanning events
  // 处理二维码扫描事件
  socket.on('qr_scan', async (data) => {
    try {
      const { eventId, scanResult } = data;
      logger.info(`📱 QR scan from user ${socket.userId} for event ${eventId}: ${scanResult}`);
      
      // Notify admins and ambassadors
      // 通知管理员和大使
      io.to('role_admin').to('role_ambassador').emit('qr_scan_update', {
        userId: socket.userId,
        eventId: eventId,
        scanResult: scanResult,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.error('QR scan error:', error);
      socket.emit('error', { message: 'QR scan processing failed', error: error.message });
    }
  });
  
  // Handle match result updates (admin/ambassador only)
  // 处理比赛结果更新（仅管理员/大使）
  socket.on('match_result', async (data) => {
    try {
      if (socket.userRole !== 'admin' && socket.userRole !== 'ambassador') {
        socket.emit('error', { message: 'Unauthorized to update match results' });
        return;
      }
      
      const { eventId, teamAScore, teamBScore, winningTeam } = data;
      logger.info(`🏆 Match result update: Event ${eventId}, Team A: ${teamAScore}, Team B: ${teamBScore}, Winner: ${winningTeam}`);
      
      // Broadcast to all event participants
      // 广播给所有活动参与者
      io.to(`event_${eventId}`).emit('match_result_update', {
        eventId: eventId,
        teamAScore: teamAScore,
        teamBScore: teamBScore,
        winningTeam: winningTeam,
        timestamp: new Date().toISOString(),
        updatedBy: socket.userId
      });
      
      // Broadcast to general notifications
      // 广播到通用通知
      io.to('general_notifications').emit('match_completed', {
        message: `Match completed for event ${eventId}`,
        message_cn: `活动 ${eventId} 的比赛已完成`,
        eventId: eventId,
        result: `Team ${winningTeam} wins!`
      });
      
    } catch (error) {
      logger.error('Match result error:', error);
      socket.emit('error', { message: 'Failed to update match result', error: error.message });
    }
  });
  
  // Handle reward distribution notifications
  // 处理奖励分配通知
  socket.on('reward_distribution', async (data) => {
    try {
      if (socket.userRole !== 'admin') {
        socket.emit('error', { message: 'Unauthorized to distribute rewards' });
        return;
      }
      
      const { eventId, recipients } = data;
      logger.info(`💰 Reward distribution for event ${eventId} to ${recipients.length} recipients`);
      
      // Notify each recipient individually
      // 单独通知每个接收者
      recipients.forEach(recipient => {
        io.to(`user_${recipient.userId}`).emit('reward_received', {
          message: `You received ${recipient.amount} CHZ reward!`,
          message_cn: `您获得了 ${recipient.amount} CHZ奖励！`,
          amount: recipient.amount,
          eventId: eventId,
          timestamp: new Date().toISOString()
        });
      });
      
    } catch (error) {
      logger.error('Reward distribution error:', error);
      socket.emit('error', { message: 'Failed to distribute rewards', error: error.message });
    }
  });
  
  // Handle disconnection
  // 处理断开连接
  socket.on('disconnect', (reason) => {
    logger.info(`🔌 User disconnected: ${socket.userId} (${socket.userRole}) - Reason: ${reason}`);
    logger.info(`🔌 用户断开连接: ${socket.userId} (${socket.userRole}) - 原因: ${reason}`);
    
    // Notify user's event rooms about disconnection
    // 通知用户的活动房间关于断开连接
    socket.rooms.forEach(room => {
      if (room.startsWith('event_')) {
        socket.to(room).emit('participant_disconnected', {
          userId: socket.userId,
          role: socket.userRole,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  // Handle ping/pong for connection health
  // 处理ping/pong以检测连接健康状况
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });
});

// Health check endpoint
// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW() as current_time');
    res.json({
      status: 'healthy',
      message: 'FanForce AI API is running',
      timestamp: dbResult.rows[0].current_time,
      database: 'connected',
      environment: NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// API Routes
// API路由

// Authentication routes
// 认证路由
app.post('/api/auth/login', [
  body('walletAddress').isEthereumAddress().withMessage('Invalid wallet address'),
  body('signature').isLength({ min: 1 }).withMessage('Signature is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, signature } = req.body;
    
    // Verify signature (simplified for demo)
    // 验证签名（演示版本简化）
    // In production, you would verify the signature properly
    // 在生产环境中，你需要正确验证签名
    
    // Find or create user
    // 查找或创建用户
    let user = await pool.query('SELECT * FROM users WHERE wallet_address = $1', [walletAddress]);
    
    if (user.rows.length === 0) {
      // Create new user
      // 创建新用户
      const newUser = await pool.query(
        'INSERT INTO users (wallet_address, role) VALUES ($1, $2) RETURNING *',
        [walletAddress, 'audience']
      );
      user = newUser;
    }
    
    // Generate JWT token
    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: user.rows[0].id, 
        walletAddress: user.rows[0].wallet_address,
        role: user.rows[0].role 
      },
      process.env.JWT_SECRET || 'fanforce-ai-super-secret-jwt-key-2024',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.rows[0].id,
        walletAddress: user.rows[0].wallet_address,
        role: user.rows[0].role
      }
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User routes
// 用户路由
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, wallet_address, role, student_id, profile_data, virtual_chz_balance, real_chz_balance, reliability_score, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: user.rows[0]
    });
    
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Events routes
// 活动路由
app.get('/api/events', async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM events';
    let params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));
    
    const events = await pool.query(query, params);
    
    res.json({
      success: true,
      events: events.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: events.rows.length
      }
    });
    
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Athletes routes
// 运动员路由
app.get('/api/athletes', async (req, res) => {
  try {
    const { status, limit = 10, offset = 0 } = req.query;
    
    let query = `
      SELECT a.*, u.wallet_address, u.student_id, u.profile_data 
      FROM athletes a 
      JOIN users u ON a.user_id = u.id
    `;
    let params = [];
    
    if (status) {
      query += ' WHERE a.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY a.ranking DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));
    
    const athletes = await pool.query(query, params);
    
    res.json({
      success: true,
      athletes: athletes.rows,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: athletes.rows.length
      }
    });
    
  } catch (error) {
    logger.error('Get athletes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Venues routes
// 场馆路由
app.get('/api/venues', async (req, res) => {
  try {
    const venues = await pool.query('SELECT * FROM venues WHERE status = $1 ORDER BY name', ['active']);
    
    res.json({
      success: true,
      venues: venues.rows
    });
    
  } catch (error) {
    logger.error('Get venues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
// 错误处理中间件
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Something went wrong!',
    message: '出现了问题！'
  });
});

// 404 handler
// 404处理器
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: '路由未找到'
  });
});

// Start server with Socket.io support
// 启动支持Socket.io的服务器
server.listen(PORT, () => {
  logger.info(`🚀 FanForce AI API server running on port ${PORT}`);
  logger.info(`🚀 FanForce AI API服务器运行在端口 ${PORT}`);
  logger.info(`🌐 Environment: ${NODE_ENV}`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 WebSocket server: ws://localhost:${PORT}`);
  logger.info(`🔗 WebSocket服务器: ws://localhost:${PORT}`);
});

// Graceful shutdown
// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  logger.info('收到SIGTERM，正在优雅关闭');
  pool.end(() => {
    logger.info('Database pool closed');
    logger.info('数据库连接池已关闭');
    process.exit(0);
  });
});

module.exports = app; 