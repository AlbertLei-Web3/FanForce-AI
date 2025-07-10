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
require('dotenv').config(); // Load environment variables / 加载环境变量

// Create Express app
// 创建Express应用
const app = express();

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

// Start server
// 启动服务器
app.listen(PORT, () => {
  logger.info(`🚀 FanForce AI API server running on port ${PORT}`);
  logger.info(`🚀 FanForce AI API服务器运行在端口 ${PORT}`);
  logger.info(`🌐 Environment: ${NODE_ENV}`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
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