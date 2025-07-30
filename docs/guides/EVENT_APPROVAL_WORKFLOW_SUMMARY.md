# Event Application Approval Workflow Implementation
# 活动申请审批工作流实现

## Overview / 概述

This document summarizes the complete Event Application approval workflow that has been implemented to support the FanForce AI platform's match lifecycle management.

本文档总结了已实现的完整活动申请审批工作流，以支持FanForce AI平台的比赛生命周期管理。

## Database Schema Updates / 数据库架构更新

### New Tables Created / 创建的新表

1. **event_approval_log** - Tracks admin approval actions
   - 跟踪管理员审批操作

2. **match_status_transitions** - Records all status changes for audit
   - 记录所有状态变更用于审计

3. **chz_pool_management** - Manages CHZ pool injections and distributions
   - 管理CHZ池注入和分配

4. **support_options** - Defines coefficient options for audience support
   - 定义观众支持的系数选项

5. **audience_support_records** - Tracks audience support choices and rewards
   - 跟踪观众支持选择和奖励

### Enhanced Tables / 增强的表

1. **events** - Added fields for match lifecycle management:
   - 添加了比赛生命周期管理字段：
   - `application_id` - Links to original application
   - `match_status` - Current match status (draft, pre_match, active, completed)
   - `pool_injected_chz` - Amount of CHZ injected by admin
   - `fee_rule_id` - Applied fee rule
   - `support_options` - JSON configuration for support coefficients
   - `match_result` - Final match result
   - `total_pool_amount` - Total pool amount
   - `total_stakes_amount` - Total stakes from audience
   - `total_rewards_distributed` - Total rewards distributed

## Workflow Steps / 工作流步骤

### 1. Event Application Submission / 活动申请提交
- Ambassador creates event application via Team Draft Manager
- 大使通过团队草稿管理器创建活动申请
- Application stored in `event_applications` table with status 'pending'
- 申请存储在 `event_applications` 表中，状态为 'pending'

### 2. Admin Review / 管理员审核
- Admin accesses `/dashboard/admin/event-applications`
- 管理员访问 `/dashboard/admin/event-applications`
- Views pending applications with team information and venue details
- 查看待处理申请，包含团队信息和场馆详情
- Can approve or reject with comments
- 可以批准或拒绝并添加评论

### 3. Approval Process / 审批流程
When admin approves an application:
当管理员批准申请时：

1. **Application Status Update** - Status changed to 'approved'
   - 申请状态更新 - 状态更改为 'approved'

2. **Event Creation** - New event created from application data
   - 活动创建 - 从申请数据创建新活动

3. **CHZ Pool Injection** - Admin injects CHZ into event pool
   - CHZ池注入 - 管理员向活动池注入CHZ

4. **Fee Rule Application** - Admin selects fee rule for the event
   - 手续费规则应用 - 管理员为活动选择手续费规则

5. **Support Options Configuration** - Admin sets support coefficients
   - 支持选项配置 - 管理员设置支持系数

6. **Status Transition** - Event status set to 'pre_match'
   - 状态转换 - 活动状态设置为 'pre_match'

### 4. Match Lifecycle / 比赛生命周期

#### Pre-Match Status / 赛前状态
- Event is visible to ambassadors in Recent Events
- 活动在大使的最近活动中可见
- Audience can view event details and support options
- 观众可以查看活动详情和支持选项
- Support options available for audience participation
- 支持选项可供观众参与

#### Active Status / 进行中状态
- Event is currently happening
- 活动正在进行中
- Real-time updates and monitoring
- 实时更新和监控

#### Completed Status / 已完成状态
- Match results announced
- 比赛结果公布
- Rewards distributed based on support coefficients
- 根据支持系数分配奖励

## API Endpoints / API端点

### Admin APIs / 管理员API
- `GET /api/admin/event-applications` - List pending applications
- `POST /api/admin/event-applications` - Approve/reject applications
- `GET /api/admin/fee-rules` - Get available fee rules
- `POST /api/admin/fee-rules` - Create new fee rules

### Ambassador APIs / 大使API
- `GET /api/ambassador/recent-events` - Get ambassador's recent events

## Frontend Pages / 前端页面

### Admin Dashboard / 管理员仪表板
- `/dashboard/admin/event-applications` - Event application management
- `/dashboard/admin/fee-rules` - Fee rules management

### Ambassador Dashboard / 大使仪表板
- `/dashboard/ambassador/recent-events` - View approved events
- `/dashboard/ambassador/event-applications` - View own applications

## Database Functions / 数据库函数

### Core Functions / 核心函数
1. `create_event_from_application(application_id)` - Creates event from approved application
2. `update_match_status(event_id, new_status)` - Updates match status with logging
3. `inject_chz_pool(event_id, amount, admin_id)` - Injects CHZ into event pool

### Views / 视图
1. `ambassador_recent_events` - View for ambassador's recent events with statistics

## Support Options System / 支持选项系统

### Coefficient-Based Rewards / 基于系数的奖励
- Audience can support teams with different coefficients
- 观众可以以不同系数支持队伍
- Higher coefficients = higher potential rewards
- 更高系数 = 更高潜在奖励
- Example: Team A (1.5x), Team B (1.2x)
- 示例：队伍A (1.5x)，队伍B (1.2x)

### Reward Distribution / 奖励分配
- Winners share the pool based on their support coefficients
- 获胜者根据支持系数分享奖池
- Formula: `reward = stake_amount * coefficient * (pool_total / total_stakes)`
- 公式：`奖励 = 质押金额 * 系数 * (奖池总额 / 总质押)`

## Testing / 测试

### Test Script / 测试脚本
- `scripts/test-event-approval-workflow.js` - Complete workflow verification
- 完整工作流验证

### Test Results / 测试结果
✅ Application approval process working
✅ Event creation from application working
✅ CHZ pool injection working
✅ Support options creation working
✅ Ambassador recent events view working

## Security Features / 安全功能

### Audit Trail / 审计跟踪
- All admin actions logged in `event_approval_log`
- 所有管理员操作记录在 `event_approval_log` 中
- Status transitions tracked in `match_status_transitions`
- 状态转换跟踪在 `match_status_transitions` 中
- Pool operations logged in `chz_pool_management`
- 池操作记录在 `chz_pool_management` 中

### Data Integrity / 数据完整性
- Foreign key constraints ensure data consistency
- 外键约束确保数据一致性
- Transaction-based operations prevent partial updates
- 基于事务的操作防止部分更新
- Validation checks on all user inputs
- 对所有用户输入进行验证检查

## Future Enhancements / 未来增强

### Planned Features / 计划功能
1. **Real-time Notifications** - WebSocket updates for status changes
2. **Advanced Analytics** - Detailed event performance metrics
3. **Automated Pool Management** - Smart pool distribution algorithms
4. **Multi-language Support** - Internationalization for all interfaces
5. **Mobile App Integration** - Native mobile app for event management

### Scalability Considerations / 可扩展性考虑
- Database indexing for performance optimization
- 数据库索引用于性能优化
- Caching layer for frequently accessed data
- 缓存层用于频繁访问的数据
- Microservices architecture for API scalability
- 微服务架构用于API可扩展性

## Conclusion / 结论

The Event Application approval workflow provides a complete solution for managing the match lifecycle from application submission to completion. The system supports admin oversight, automated event creation, CHZ pool management, and audience participation with coefficient-based rewards.

活动申请审批工作流为管理从申请提交到完成的比赛生命周期提供了完整解决方案。该系统支持管理员监督、自动活动创建、CHZ池管理和基于系数奖励的观众参与。

The implementation includes comprehensive database schema, API endpoints, frontend interfaces, and testing capabilities to ensure reliable operation of the FanForce AI platform.

该实现包括全面的数据库架构、API端点、前端界面和测试功能，以确保FanForce AI平台的可靠运行。 