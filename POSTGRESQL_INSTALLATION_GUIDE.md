# PostgreSQL Installation Guide for FanForce AI / FanForce AI PostgreSQL 安装指南

## Overview / 概述

This guide will walk you through installing PostgreSQL 17.5 on Windows for the FanForce AI project. We'll set up a complete database environment with enhanced contingency handling capabilities.

本指南将指导您在Windows上为FanForce AI项目安装PostgreSQL 17.5。我们将建立一个具有增强应急处理能力的完整数据库环境。

## Step 1: Download PostgreSQL / 第1步：下载PostgreSQL

### Download Link / 下载链接
- **Official Site:** https://www.postgresql.org/download/windows/
- **Version:** PostgreSQL 17.5
- **Platform:** Windows x86-64
- **Size:** ~300MB

### What's Included / 包含内容
- PostgreSQL server / PostgreSQL服务器
- pgAdmin 4 (graphical database management tool) / pgAdmin 4（图形化数据库管理工具）
- StackBuilder (additional tools installer) / StackBuilder（附加工具安装程序）
- Command line tools / 命令行工具

## Step 2: Installation Process / 第2步：安装过程

### 2.1 Run the Installer / 运行安装程序

1. **Right-click the downloaded installer and select "Run as administrator"**
   **右键单击下载的安装程序，选择"以管理员身份运行"**

2. **Follow the installation wizard steps:**
   **按照安装向导步骤操作：**

### 2.2 Installation Settings / 安装设置

```
Installation Directory / 安装目录:
C:\Program Files\PostgreSQL\17

Data Directory / 数据目录:
C:\Program Files\PostgreSQL\17\data

Port / 端口:
5432 (default / 默认)

Superuser Account / 超级用户账户:
postgres

Password / 密码:
[Choose a strong password - REMEMBER THIS!]
[选择一个强密码 - 请记住这个密码！]

Locale / 区域设置:
Default locale / 默认区域设置
```

### 2.3 Components to Install / 要安装的组件

✅ **PostgreSQL Server** - Core database engine / 核心数据库引擎
✅ **pgAdmin 4** - Web-based database management / 基于Web的数据库管理
✅ **Stack Builder** - Additional tools / 附加工具
✅ **Command Line Tools** - psql, pg_dump, etc. / 命令行工具

## Step 3: Verify Installation / 第3步：验证安装

### 3.1 Check PostgreSQL Service / 检查PostgreSQL服务

```cmd
# Open Command Prompt as Administrator
# 以管理员身份打开命令提示符

# Check if PostgreSQL service is running
# 检查PostgreSQL服务是否正在运行
sc query postgresql-x64-17
```

### 3.2 Test Database Connection / 测试数据库连接

```cmd
# Connect to PostgreSQL using psql
# 使用psql连接到PostgreSQL
psql -U postgres -h localhost -p 5432

# You should see the PostgreSQL prompt:
# 你应该看到PostgreSQL提示符：
postgres=#
```

### 3.3 Create FanForce Database / 创建FanForce数据库

```sql
-- Create the FanForce AI database
-- 创建FanForce AI数据库
CREATE DATABASE fanforce_ai;

-- Switch to the new database
-- 切换到新数据库
\c fanforce_ai

-- Check database creation
-- 检查数据库创建
SELECT current_database();
```

## Step 4: Configure Environment Variables / 第4步：配置环境变量

### 4.1 Add PostgreSQL to PATH / 将PostgreSQL添加到PATH

1. **Open System Properties** / **打开系统属性**
   - Right-click "This PC" → Properties → Advanced system settings
   - 右键单击"此电脑"→属性→高级系统设置

2. **Edit Environment Variables** / **编辑环境变量**
   - Click "Environment Variables" button
   - 点击"环境变量"按钮

3. **Add PostgreSQL bin directory to PATH** / **将PostgreSQL bin目录添加到PATH**
   ```
   C:\Program Files\PostgreSQL\17\bin
   ```

### 4.2 Create .env File / 创建.env文件

Create a `.env` file in your project root:
在项目根目录创建`.env`文件：

```env
# PostgreSQL Database Configuration
# PostgreSQL数据库配置
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/fanforce_ai
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fanforce_ai
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
# 应用配置
NODE_ENV=development
PORT=3001
```

## Step 5: Initialize Database Schema / 第5步：初始化数据库架构

### 5.1 Run Database Initialization Script / 运行数据库初始化脚本

```cmd
# Navigate to project directory
# 导航到项目目录
cd "D:\web3codework\FanForce AI"

# Run the database initialization script
# 运行数据库初始化脚本
node scripts/init-database.js
```

### 5.2 Apply Enhanced Schema / 应用增强架构

```cmd
# Apply the enhanced schema with contingency handling
# 应用具有应急处理功能的增强架构
node scripts/update-database-schema.js
```

## Step 6: Verify Database Setup / 第6步：验证数据库设置

### 6.1 Check Tables Created / 检查创建的表

```sql
-- Connect to fanforce_ai database
-- 连接到fanforce_ai数据库
psql -U postgres -d fanforce_ai

-- List all tables
-- 列出所有表
\dt

-- You should see 20 tables:
-- 你应该看到20个表：
-- Core tables (11): users, venues, events, athletes, etc.
-- 核心表（11个）：用户、场馆、活动、运动员等
-- Contingency tables (9): substitute_players, weather_conditions, etc.
-- 应急表（9个）：替补运动员、天气条件等
```

### 6.2 Test Database Connection from Node.js / 从Node.js测试数据库连接

```cmd
# Test the database connection
# 测试数据库连接
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:your_password@localhost:5432/fanforce_ai'
});

pool.query('SELECT NOW() as current_time, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = \\'public\\'')
  .then(result => {
    console.log('✅ Database connection successful!');
    console.log('✅ 数据库连接成功！');
    console.log('Current time:', result.rows[0].current_time);
    console.log('Tables count:', result.rows[0].table_count);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
    console.error('❌ 数据库连接失败：', err);
  })
  .finally(() => pool.end());
"
```

## Step 7: Optional - Install pgAdmin 4 / 第7步：可选 - 安装pgAdmin 4

### 7.1 Access pgAdmin 4 / 访问pgAdmin 4

1. **Open your web browser** / **打开网络浏览器**
2. **Navigate to:** http://localhost:5050
3. **Default credentials:** Check installation notes / **默认凭据：** 查看安装说明

### 7.2 Connect to Database / 连接到数据库

```
Server Name: FanForce AI Database
Host: localhost
Port: 5432
Database: fanforce_ai
Username: postgres
Password: [your chosen password]
```

## Troubleshooting / 故障排除

### Common Issues / 常见问题

1. **Port 5432 already in use** / **端口5432已被占用**
   - Change the port during installation / 在安装过程中更改端口
   - Or stop conflicting services / 或停止冲突的服务

2. **Service won't start** / **服务无法启动**
   - Check Windows Event Viewer / 检查Windows事件查看器
   - Verify installation permissions / 验证安装权限

3. **Connection refused** / **连接被拒绝**
   - Ensure PostgreSQL service is running / 确保PostgreSQL服务正在运行
   - Check firewall settings / 检查防火墙设置

### Service Management / 服务管理

```cmd
# Start PostgreSQL service
# 启动PostgreSQL服务
net start postgresql-x64-17

# Stop PostgreSQL service
# 停止PostgreSQL服务
net stop postgresql-x64-17

# Check service status
# 检查服务状态
sc query postgresql-x64-17
```

## Next Steps / 下一步

After successful PostgreSQL installation, you can proceed to:
PostgreSQL安装成功后，您可以继续：

1. **Build Express.js API** / **构建Express.js API**
2. **Set up authentication middleware** / **设置身份认证中间件**
3. **Create database ORM layer** / **创建数据库ORM层**
4. **Implement WebSocket server** / **实现WebSocket服务器**

## Security Recommendations / 安全建议

1. **Use strong passwords** / **使用强密码**
2. **Enable SSL/TLS connections** / **启用SSL/TLS连接**
3. **Configure proper user permissions** / **配置适当的用户权限**
4. **Regular database backups** / **定期数据库备份**
5. **Monitor database logs** / **监控数据库日志**

## Support / 支持

If you encounter any issues during installation:
如果在安装过程中遇到任何问题：

- **Official Documentation:** https://www.postgresql.org/docs/
- **Community Support:** https://www.postgresql.org/support/
- **Stack Overflow:** Search for "PostgreSQL Windows installation"

---

**Installation completed successfully? Let's proceed to Express.js API development!**
**安装成功完成？让我们继续进行Express.js API开发！** 