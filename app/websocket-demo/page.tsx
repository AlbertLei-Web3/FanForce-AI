/**
 * WebSocket Demo Page
 * WebSocket演示页面
 * 
 * This page demonstrates the real-time WebSocket functionality
 * 此页面演示实时WebSocket功能
 * 
 * Features / 功能:
 * - Live authentication with JWT tokens / 使用JWT令牌进行实时认证
 * - Real-time message broadcasting / 实时消息广播
 * - Role-based functionality testing / 基于角色的功能测试
 * - Connection health monitoring / 连接健康监控
 * 
 * Related files / 相关文件:
 * - app/components/WebSocketClient.tsx: WebSocket client component / WebSocket客户端组件
 * - server.js: WebSocket server implementation / WebSocket服务器实现
 * - app/context/Web3Context.tsx: Web3 authentication context / Web3认证上下文
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WebSocketClient from '../components/WebSocketClient';
import axios from 'axios';

// Demo user configurations for testing
// 用于测试的演示用户配置
const demoUsers = {
  admin: {
    walletAddress: '0x1234567890123456789012345678901234567890',
    signature: 'admin_signature_mock',
    role: 'admin' as const,
    displayName: 'System Admin / 系统管理员'
  },
  ambassador: {
    walletAddress: '0x2234567890123456789012345678901234567890',
    signature: 'ambassador_signature_mock',
    role: 'ambassador' as const,
    displayName: 'Campus Ambassador / 校园大使'
  },
  athlete: {
    walletAddress: '0x3234567890123456789012345678901234567890',
    signature: 'athlete_signature_mock',
    role: 'athlete' as const,
    displayName: 'Student Athlete / 学生运动员'
  },
  audience: {
    walletAddress: '0x4234567890123456789012345678901234567890',
    signature: 'audience_signature_mock',
    role: 'audience' as const,
    displayName: 'Audience Supporter / 观众支持者'
  }
};

type UserRole = keyof typeof demoUsers;

export default function WebSocketDemoPage() {
  // State management
  // 状态管理
  const [selectedRole, setSelectedRole] = useState<UserRole>('audience');
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [messageCount, setMessageCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  // Get JWT token for demo user
  // 获取演示用户的JWT令牌
  const authenticateUser = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = demoUsers[role];
      const response = await axios.post('/api/auth/login', {
        walletAddress: user.walletAddress,
        signature: user.signature,
        message: 'Login to FanForce AI WebSocket Demo'
      });
      
      if (response.data.success) {
        setJwtToken(response.data.token);
        setSelectedRole(role);
        
        // Update user role in the database if needed
        // 如果需要，在数据库中更新用户角色
        if (response.data.user.role !== role) {
          console.log(`Role mismatch: expected ${role}, got ${response.data.user.role}`);
        }
      } else {
        setError('Authentication failed / 认证失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error / 未知错误');
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle connection status changes
  // 处理连接状态变化
  const handleConnectionChange = (connected: boolean) => {
    setConnectionStatus(connected);
  };

  // Handle message received
  // 处理收到的消息
  const handleMessageReceived = () => {
    setMessageCount(prev => prev + 1);
  };

  // Logout function
  // 退出登录功能
  const logout = () => {
    setJwtToken(null);
    setSelectedRole('audience');
    setConnectionStatus(false);
    setMessageCount(0);
    setError(null);
  };

  // Auto-authenticate on component mount
  // 组件挂载时自动认证
  useEffect(() => {
    if (!jwtToken) {
      authenticateUser('audience');
    }
  }, [jwtToken]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                ← Back to Home / 返回首页
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                WebSocket Demo / WebSocket演示
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection indicator */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span>{connectionStatus ? 'Live / 实时' : 'Offline / 离线'}</span>
              </div>
              
              {/* Message counter */}
              <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {messageCount} Messages / 消息
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User role selection */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Select User Role / 选择用户角色
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(demoUsers).map(([role, user]) => (
                <button
                  key={role}
                  onClick={() => authenticateUser(role as UserRole)}
                  disabled={isLoading}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-center">
                    <h3 className="font-semibold capitalize">{role}</h3>
                    <p className="text-sm mt-1">{user.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            {isLoading && (
              <div className="mt-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Authenticating... / 认证中...
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <strong>Error / 错误:</strong> {error}
              </div>
            )}
            
            {jwtToken && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Authenticated as: <span className="font-medium">{demoUsers[selectedRole].displayName}</span>
                  <br />
                  认证身份: <span className="font-medium">{demoUsers[selectedRole].displayName}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800"
                >
                  Logout / 退出
                </button>
              </div>
            )}
          </div>
        </div>

        {/* WebSocket Client */}
        {jwtToken && (
          <WebSocketClient
            jwtToken={jwtToken}
            userRole={selectedRole}
            userId={`demo_${selectedRole}`}
            onConnectionChange={handleConnectionChange}
            onMessageReceived={handleMessageReceived}
          />
        )}

        {/* Instructions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            How to Use / 如何使用
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Testing Features / 测试功能
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Switch between user roles to test different permissions</li>
                <li>• 切换用户角色以测试不同权限</li>
                <li>• Join events to see real-time participant updates</li>
                <li>• 加入事件以查看实时参与者更新</li>
                <li>• Use QR scan simulation as audience member</li>
                <li>• 作为观众使用二维码扫描模拟</li>
                <li>• Submit match results as admin/ambassador</li>
                <li>• 作为管理员/大使提交比赛结果</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Real-time Features / 实时功能
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Live connection status monitoring</li>
                <li>• 实时连接状态监控</li>
                <li>• Role-based message broadcasting</li>
                <li>• 基于角色的消息广播</li>
                <li>• Event participation notifications</li>
                <li>• 事件参与通知</li>
                <li>• Match result live updates</li>
                <li>• 比赛结果实时更新</li>
                <li>• Health check with ping/pong</li>
                <li>• 使用ping/pong进行健康检查</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 