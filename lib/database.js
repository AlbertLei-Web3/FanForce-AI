/*
 * Database Connection and Configuration (JavaScript Version)
 * 数据库连接和配置（JavaScript版本）
 * 
 * This file handles PostgreSQL database connections for the FanForce AI platform.
 * It provides connection pooling, query execution, and error handling.
 * 
 * 此文件处理FanForce AI平台的PostgreSQL数据库连接。
 * 它提供连接池、查询执行和错误处理功能。
 * 
 * Related files: 
 * - lib/schema.sql (database schema definition)
 * - scripts/* (Node.js scripts that use these database functions)
 * - .env.local (environment variables for database credentials)
 * 
 * 相关文件：
 * - lib/schema.sql (数据库schema定义)
 * - scripts/* (使用这些数据库函数的Node.js脚本)
 * - .env.local (数据库凭据的环境变量)
 */

const { Pool } = require('pg');

// Create PostgreSQL connection pool
// 创建PostgreSQL连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fanforce_ai',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'LYQ20000',
  max: 20, // Maximum number of connections in pool - 连接池中最大连接数
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds - 30秒后关闭空闲连接
  connectionTimeoutMillis: 2000, // Connection timeout 2 seconds - 连接超时2秒
});

// Database connection error handler
// 数据库连接错误处理器
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  console.error('空闲客户端发生意外错误', err);
  process.exit(-1);
});

// Execute a database query with error handling
// 执行数据库查询并处理错误
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query execution time for performance monitoring
    // 记录查询执行时间以进行性能监控
    console.log('Executed query', { text, duration, rows: result.rowCount });
    console.log('执行查询', { text, duration, rows: result.rowCount });
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Database query error', { text, duration, error });
    console.error('数据库查询错误', { text, duration, error });
    throw error;
  }
}

// Get a database client from the pool for transactions
// 从连接池获取数据库客户端用于事务
async function getClient() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error getting database client', error);
    console.error('获取数据库客户端错误', error);
    throw error;
  }
}

// Execute a transaction with automatic rollback on error
// 执行事务，错误时自动回滚
async function transaction(callback) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction rolled back', error);
    console.error('事务回滚', error);
    throw error;
  } finally {
    client.release();
  }
}

// Test database connection
// 测试数据库连接
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0]);
    console.log('数据库连接成功:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('数据库连接失败:', error);
    return false;
  }
}

// Close all database connections
// 关闭所有数据库连接
async function closePool() {
  try {
    await pool.end();
    console.log('Database pool closed');
    console.log('数据库连接池已关闭');
  } catch (error) {
    console.error('Error closing database pool', error);
    console.error('关闭数据库连接池错误', error);
  }
}

// Export functions for use in scripts
// 导出函数供脚本使用
module.exports = {
  query,
  getClient,
  transaction,
  testConnection,
  closePool,
  pool
}; 