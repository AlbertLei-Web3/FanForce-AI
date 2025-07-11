# FanForce AI API使用手册
# FanForce AI API Usage Manual

## 📋 目录 / Table of Contents

1. [基础信息 / Basic Information](#基础信息--basic-information)
2. [认证与授权 / Authentication & Authorization](#认证与授权--authentication--authorization)
3. [管理员API / Admin APIs](#管理员api--admin-apis)
4. [数据库API / Database APIs](#数据库api--database-apis)
5. [错误处理 / Error Handling](#错误处理--error-handling)
6. [示例代码 / Example Code](#示例代码--example-code)

---

## 基础信息 / Basic Information

### 服务器配置 / Server Configuration
- **Base URL**: `http://localhost:3000`
- **API版本**: `v1`
- **内容类型**: `application/json`
- **字符编码**: `UTF-8`

### 架构特点 / Architecture Features
- **Web2优先**: 所有业务逻辑在PostgreSQL和Express.js中
- **最小区块链交互**: 仅用于CHZ转账和质押
- **实时更新**: 支持WebSocket实时数据推送
- **双语支持**: 英文和中文响应

---

## 认证与授权 / Authentication & Authorization

### 钱包签名认证 / Wallet Signature Authentication
```http
Authorization: Bearer <jwt_token>
```

### 角色权限 / Role Permissions
- **Admin**: 系统管理员，完全访问权限
- **Ambassador**: 校园大使，活动管理权限
- **Athlete**: 学生运动员，个人档案权限
- **Audience**: 观众用户，基础功能权限

---

## 管理员API / Admin APIs

### 1. 仪表板统计 / Dashboard Statistics

#### GET `/api/admin/dashboard`
获取管理员仪表板的综合统计数据

**请求参数 / Request Parameters:**
```http
GET /api/admin/dashboard?admin_id=<uuid>
```

**响应示例 / Response Example:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 7,
    "activeUsers": 7,
    "totalEvents": 0,
    "activeEvents": 0,
    "totalRevenue": 0,
    "totalStaked": 0,
    "platformFees": 0,
    "adminCount": 1,
    "ambassadorCount": 1,
    "athleteCount": 1,
    "audienceCount": 4,
    "todayUsers": 0,
    "todayEvents": 0,
    "todayRevenue": 0,
    "todayStaked": 0,
    "chzPoolHealth": 100,
    "pendingTransactions": 0,
    "systemStatus": "active"
  },
  "recentActivities": [],
  "adminActivities": [],
  "message": "Admin dashboard statistics retrieved successfully"
}
```

#### POST `/api/admin/dashboard`
更新仪表板设置

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "settings": {
    "refresh_interval": 30,
    "notifications_enabled": true,
    "default_view": "overview"
  }
}
```

---

### 2. 系统配置 / System Configuration

#### GET `/api/admin/config`
获取所有系统配置

**响应示例 / Response Example:**
```json
{
  "success": true,
  "configs": {
    "platform_name": {
      "value": "FanForce AI",
      "description": "Platform name configuration",
      "id": "uuid",
      "updated_at": "2025-07-11T01:39:20.750Z"
    },
    "maintenance_mode": {
      "value": false,
      "description": "Global maintenance mode toggle",
      "id": "uuid",
      "updated_at": "2025-07-11T01:39:20.750Z"
    },
    "websocket_enabled": {
      "value": true,
      "description": "Enable WebSocket real-time features",
      "id": "uuid",
      "updated_at": "2025-07-11T01:39:20.750Z"
    }
  },
  "message": "System configuration retrieved successfully"
}
```

#### POST `/api/admin/config`
更新系统配置

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "config_key": "maintenance_mode",
  "config_value": true,
  "description": "Enable maintenance mode"
}
```

#### DELETE `/api/admin/config`
删除系统配置项

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "config_key": "obsolete_setting"
}
```

---

### 3. 费用规则 / Fee Rules

#### GET `/api/admin/fee-rules`
获取当前费用规则配置

**响应示例 / Response Example:**
```json
{
  "success": true,
  "fee_rules": {
    "id": "uuid",
    "rule_name": "Default Fee Structure",
    "staking_fee_percent": "5.00",
    "withdrawal_fee_percent": "2.00",
    "distribution_fee_percent": "3.00",
    "ambassador_share_percent": "1.00",
    "athlete_share_percent": "1.00",
    "community_fund_percent": "1.00",
    "is_active": true,
    "effective_date": "2025-07-11T01:39:20.750Z",
    "created_at": "2025-07-11T01:39:20.750Z",
    "updated_at": "2025-07-11T01:39:20.750Z"
  },
  "message": "Fee rules retrieved successfully"
}
```

#### POST `/api/admin/fee-rules`
创建或更新费用规则

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "rule_name": "New Fee Structure",
  "staking_fee_percent": 5.0,
  "withdrawal_fee_percent": 2.0,
  "distribution_fee_percent": 3.0,
  "ambassador_share_percent": 1.0,
  "athlete_share_percent": 1.0,
  "community_fund_percent": 1.0,
  "effective_date": "2025-08-01T00:00:00Z"
}
```

**验证规则 / Validation Rules:**
- 所有百分比必须大于0
- 分配费用百分比之和必须等于总分配费用百分比
- 费用百分比不能超过100%

---

### 4. 用户管理 / User Management

#### GET `/api/admin/users`
获取用户列表和统计信息

**查询参数 / Query Parameters:**
```http
GET /api/admin/users?page=1&limit=20&role=athlete&status=active&search=wallet_address
```

**响应示例 / Response Example:**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "wallet_address": "0x1234567890123456789012345678901234567890",
      "role": "athlete",
      "student_id": "ATH001",
      "profile_data": {},
      "is_active": true,
      "created_at": "2025-07-10T02:24:05.653Z",
      "updated_at": "2025-07-10T02:24:05.653Z",
      "action_count": "0",
      "last_action_date": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 7,
    "totalPages": 1
  },
  "stats": {
    "athlete": {"total": 1, "active": 1, "inactive": 0},
    "audience": {"total": 4, "active": 4, "inactive": 0},
    "admin": {"total": 1, "active": 1, "inactive": 0},
    "ambassador": {"total": 1, "active": 1, "inactive": 0}
  },
  "message": "User management data retrieved successfully"
}
```

#### POST `/api/admin/users`
创建新用户

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "wallet_address": "0xNewWalletAddress",
  "role": "athlete",
  "student_id": "ATH002",
  "profile_data": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "auto_approve": true
}
```

#### PUT `/api/admin/users`
更新用户信息或状态

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "user_id": "uuid",
  "action": "disable",
  "reason": "Violation of terms",
  "profile_updates": {
    "name": "Updated Name"
  }
}
```

**支持的操作 / Supported Actions:**
- `enable`: 启用用户
- `disable`: 禁用用户
- `approve`: 批准用户
- `reject`: 拒绝用户
- `update_profile`: 更新用户档案

---

### 5. CHZ池监控 / CHZ Pool Monitoring

#### GET `/api/admin/chz-pool`
获取CHZ池状态和统计信息

**响应示例 / Response Example:**
```json
{
  "success": true,
  "pool_status": {
    "id": "uuid",
    "contract_address": "0x0000000000000000000000000000000000000000",
    "total_staked_chz": "0.00000000",
    "total_fees_collected": "0.00000000",
    "available_for_withdrawal": "0.00000000",
    "total_rewards_distributed": "0.00000000",
    "pool_health_score": 100,
    "last_contract_sync": "2025-07-11T01:40:42.756Z",
    "monitoring_status": "active",
    "alert_threshold": "1000.00000000",
    "metadata": {
      "last_health_check": "2025-07-11T01:40:42.756Z",
      "transaction_counts": {
        "stakes": 0,
        "payouts": 0,
        "pending": 0
      }
    },
    "created_at": "2025-07-11T01:40:42.756Z",
    "updated_at": "2025-07-11T01:40:42.756Z"
  },
  "transaction_stats": {
    "total_staked": "0",
    "total_paid_out": "0",
    "total_fees": "0",
    "stake_count": "0",
    "payout_count": "0",
    "pending_count": "0"
  },
  "recent_activity": [],
  "calculated_metrics": {
    "total_staked": 0,
    "total_paid_out": 0,
    "total_fees": 0,
    "available_for_withdrawal": 0,
    "pool_health_score": 100
  },
  "message": "CHZ pool status retrieved successfully"
}
```

#### POST `/api/admin/chz-pool`
更新CHZ池配置

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "contract_address": "0xNewContractAddress",
  "alert_threshold": 1000.0,
  "monitoring_status": "active",
  "metadata": {
    "description": "Main CHZ pool for staking"
  }
}
```

#### DELETE `/api/admin/chz-pool`
删除CHZ池监控记录

**请求体 / Request Body:**
```json
{
  "admin_id": "uuid",
  "pool_id": "uuid",
  "reason": "Pool decommissioned"
}
```

---

## 数据库API / Database APIs

### 1. 数据库连接测试 / Database Connection Test

#### GET `/api/database/test`
测试数据库连接状态

**响应示例 / Response Example:**
```json
{
  "success": true,
  "connection_status": "healthy",
  "database_info": {
    "name": "fanforce_ai",
    "version": "17.0",
    "current_time": "2025-07-11T01:45:00.000Z"
  },
  "table_counts": {
    "users": 7,
    "events": 0,
    "transactions": 0,
    "system_config": 5,
    "fee_rules": 1,
    "chz_pool_monitor": 1
  },
  "message": "Database connection test successful"
}
```

---

## 错误处理 / Error Handling

### 标准错误格式 / Standard Error Format

```json
{
  "success": false,
  "error": "Error message in English",
  "error_cn": "中文错误信息",
  "details": "Detailed error information",
  "code": "ERROR_CODE",
  "timestamp": "2025-07-11T01:45:00.000Z"
}
```

### 常见错误代码 / Common Error Codes

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| `INVALID_REQUEST` | 400 | 请求格式错误 |
| `UNAUTHORIZED` | 401 | 认证失败 |
| `FORBIDDEN` | 403 | 权限不足 |
| `NOT_FOUND` | 404 | 资源不存在 |
| `VALIDATION_ERROR` | 422 | 数据验证失败 |
| `DATABASE_ERROR` | 500 | 数据库错误 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

---

## 示例代码 / Example Code

### JavaScript/Node.js

```javascript
const API_BASE_URL = 'http://localhost:3000';

// 获取仪表板统计
async function getDashboardStats(adminId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard?admin_id=${adminId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt_token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Dashboard stats:', data.stats);
      return data.stats;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

// 更新费用规则
async function updateFeeRules(adminId, feeRules) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/fee-rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt_token}`
      },
      body: JSON.stringify({
        admin_id: adminId,
        ...feeRules
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating fee rules:', error);
    return null;
  }
}

// 获取用户列表
async function getUserList(page = 1, limit = 20, filters = {}) {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/api/admin/users?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt_token}`
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return null;
  }
}
```

### Python

```python
import requests
import json

class FanForceAPI:
    def __init__(self, base_url="http://localhost:3000", token=None):
        self.base_url = base_url
        self.token = token
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}' if token else None
        }
    
    def get_dashboard_stats(self, admin_id):
        """获取仪表板统计数据"""
        url = f"{self.base_url}/api/admin/dashboard"
        params = {'admin_id': admin_id}
        
        response = requests.get(url, params=params, headers=self.headers)
        return response.json()
    
    def update_fee_rules(self, admin_id, fee_rules):
        """更新费用规则"""
        url = f"{self.base_url}/api/admin/fee-rules"
        data = {
            'admin_id': admin_id,
            **fee_rules
        }
        
        response = requests.post(url, json=data, headers=self.headers)
        return response.json()
    
    def get_users(self, page=1, limit=20, **filters):
        """获取用户列表"""
        url = f"{self.base_url}/api/admin/users"
        params = {
            'page': page,
            'limit': limit,
            **filters
        }
        
        response = requests.get(url, params=params, headers=self.headers)
        return response.json()

# 使用示例
api = FanForceAPI(token="your_jwt_token")

# 获取仪表板数据
stats = api.get_dashboard_stats("admin_uuid")
print(f"总用户数: {stats['stats']['totalUsers']}")

# 更新费用规则
result = api.update_fee_rules("admin_uuid", {
    "rule_name": "Updated Fee Structure",
    "staking_fee_percent": 5.0,
    "withdrawal_fee_percent": 2.0,
    "distribution_fee_percent": 3.0
})
print(f"更新结果: {result['success']}")
```

### cURL

```bash
# 获取仪表板统计
curl -X GET "http://localhost:3000/api/admin/dashboard?admin_id=uuid" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token"

# 更新系统配置
curl -X POST "http://localhost:3000/api/admin/config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "admin_id": "uuid",
    "config_key": "maintenance_mode",
    "config_value": true,
    "description": "Enable maintenance mode"
  }'

# 获取用户列表（带过滤器）
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=20&role=athlete&status=active" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token"

# 测试数据库连接
curl -X GET "http://localhost:3000/api/database/test" \
  -H "Content-Type: application/json"
```

---

## 最佳实践 / Best Practices

### 1. 错误处理 / Error Handling
- 始终检查响应中的`success`字段
- 实现重试机制处理网络错误
- 记录错误日志以便调试

### 2. 性能优化 / Performance Optimization
- 使用分页获取大量数据
- 缓存不经常变化的配置数据
- 合理设置请求超时时间

### 3. 安全考虑 / Security Considerations
- 妥善保管JWT令牌
- 使用HTTPS加密传输
- 验证所有输入数据
- 实施访问权限控制

### 4. 监控和日志 / Monitoring and Logging
- 监控API响应时间
- 记录所有管理员操作
- 设置异常告警机制

---

## 支持与联系 / Support & Contact

- **文档版本**: v1.0.0
- **最后更新**: 2025-07-11
- **技术支持**: support@fanforce.ai
- **GitHub仓库**: https://github.com/your-org/fanforce-ai

---

## 更新日志 / Changelog

### v1.0.0 (2025-07-11)
- 初始版本发布
- 完整的管理员API套件
- 数据库连接测试API
- 支持Web2优先架构
- 双语文档支持 