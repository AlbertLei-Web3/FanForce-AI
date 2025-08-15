# FanForce AI - OAuth社交媒体登录设置指南
# FanForce AI - OAuth Social Media Login Setup Guide

## 概述 / Overview

本指南将帮助您设置和配置FanForce AI项目的OAuth社交媒体登录功能。
This guide will help you set up and configure OAuth social media login functionality for the FanForce AI project.

## 功能特性 / Features

✅ **Google OAuth2登录** / Google OAuth2 Login  
✅ **Twitter OAuth登录** / Twitter OAuth Login  
✅ **Web3钱包登录** / Web3 Wallet Login  
✅ **ICP身份认证** / ICP Identity Authentication  
✅ **JWT Token管理** / JWT Token Management  
✅ **用户会话管理** / User Session Management  

## 前置要求 / Prerequisites

1. **Node.js环境** / Node.js Environment (v16+)
2. **PostgreSQL数据库** / PostgreSQL Database
3. **Google OAuth2应用** / Google OAuth2 Application
4. **Twitter API应用** / Twitter API Application
5. **Express服务器运行** / Express Server Running

## 环境配置 / Environment Configuration

### 1. 复制环境变量文件 / Copy Environment File

```bash
cp env.example .env
```

### 2. 配置OAuth应用 / Configure OAuth Applications

#### Google OAuth2配置 / Google OAuth2 Configuration

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建OAuth 2.0客户端ID
5. 设置授权重定向URI: `http://localhost:3001/api/auth/google/callback`

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

#### Twitter OAuth配置 / Twitter OAuth Configuration

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/)
2. 创建新应用
3. 获取API密钥和密钥
4. 设置回调URL: `http://localhost:3001/api/auth/twitter/callback`

```env
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3001/api/auth/twitter/callback
```

### 3. 数据库配置 / Database Configuration

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/fanforce_ai
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fanforce_ai
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4. JWT配置 / JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### 5. 服务器配置 / Server Configuration

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
EXPRESS_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_EXPRESS_SERVER_URL=http://localhost:3001
```

## 启动服务 / Starting Services

### 1. 启动Express服务器 / Start Express Server

```bash
npm run server
```

### 2. 启动Next.js前端 / Start Next.js Frontend

```bash
npm run dev
```

### 3. 启动所有服务 / Start All Services

```bash
npm run dev-all
```

## 测试OAuth功能 / Testing OAuth Functionality

### 1. 访问注册页面 / Visit Registration Page

```
http://localhost:3000/register
```

### 2. 测试Google登录 / Test Google Login

1. 点击"使用Google继续"按钮
2. 重定向到Google OAuth页面
3. 授权应用访问
4. 重定向回FanForce AI
5. 完成身份选择

### 3. 测试Twitter登录 / Test Twitter Login

1. 点击"使用X继续"按钮
2. 重定向到Twitter OAuth页面
3. 授权应用访问
4. 重定向回FanForce AI
5. 完成身份选择

### 4. 测试钱包登录 / Test Wallet Login

1. 确保安装了MetaMask
2. 点击"连接Web3钱包"按钮
3. 连接钱包地址
4. 完成身份选择

## 架构说明 / Architecture Overview

```
Frontend (Next.js) → API Routes → Express Server → OAuth Providers
     ↓                    ↓              ↓              ↓
  QuickAuth.tsx    /api/auth/*    Passport.js    Google/Twitter
     ↓                    ↓              ↓              ↓
  OAuth Callback   Token Verify   JWT Generate   User Profile
```

### 组件说明 / Component Description

- **QuickAuth.tsx**: 前端登录组件，处理OAuth重定向
- **API Routes**: Next.js API路由，代理到Express服务器
- **Express Server**: 后端服务器，处理OAuth认证和JWT生成
- **OAuth Callback**: 处理OAuth成功后的回调

## 故障排除 / Troubleshooting

### 常见问题 / Common Issues

#### 1. OAuth重定向失败 / OAuth Redirect Failed

**症状**: 点击OAuth按钮后没有反应
**解决方案**: 检查环境变量配置和Express服务器状态

#### 2. Token验证失败 / Token Verification Failed

**症状**: OAuth成功后显示"Token验证失败"
**解决方案**: 检查JWT_SECRET配置和Express服务器状态

#### 3. 数据库连接失败 / Database Connection Failed

**症状**: 用户创建失败
**解决方案**: 检查数据库连接配置和状态

### 调试模式 / Debug Mode

启用详细日志记录：

```env
DEBUG_MODE=true
VERBOSE_LOGGING=true
LOG_LEVEL=debug
```

## 安全注意事项 / Security Considerations

1. **JWT密钥**: 使用强随机密钥，定期轮换
2. **HTTPS**: 生产环境必须使用HTTPS
3. **环境变量**: 不要将.env文件提交到版本控制
4. **OAuth密钥**: 保护OAuth客户端密钥和密钥
5. **数据库**: 使用强密码和适当的访问控制

## 生产部署 / Production Deployment

### 1. 环境变量 / Environment Variables

```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
EXPRESS_SERVER_URL=https://api.yourdomain.com
```

### 2. OAuth回调URL / OAuth Callback URLs

```
Google: https://api.yourdomain.com/api/auth/google/callback
Twitter: https://api.yourdomain.com/api/auth/twitter/callback
```

### 3. SSL/TLS配置 / SSL/TLS Configuration

```env
SSL_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## 支持 / Support

如果遇到问题，请检查：

1. 环境变量配置
2. 数据库连接状态
3. Express服务器日志
4. 浏览器控制台错误
5. 网络请求状态

## 更新日志 / Changelog

- **v1.0.0**: 初始OAuth实现
- **v1.1.0**: 添加Twitter OAuth支持
- **v1.2.0**: 改进错误处理和用户体验
