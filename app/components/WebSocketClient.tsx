/**
 * WebSocket Real-time Client Component
 * WebSocket实时客户端组件
 * 
 * This component demonstrates how to integrate WebSocket functionality in React
 * 此组件演示如何在React中集成WebSocket功能
 * 
 * Features / 功能:
 * - JWT-based authentication / 基于JWT的认证
 * - Real-time event participation / 实时事件参与
 * - Live match result updates / 实时比赛结果更新
 * - QR code scanning notifications / 二维码扫描通知
 * - Connection health monitoring / 连接健康监控
 * - Role-based message handling / 基于角色的消息处理
 * 
 * Related files / 相关文件:
 * - server.js: WebSocket server implementation / WebSocket服务器实现
 * - test-websocket.js: WebSocket testing client / WebSocket测试客户端
 * - app/context/Web3Context.tsx: Web3 authentication context / Web3认证上下文
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// WebSocket event types for type safety
// WebSocket事件类型，确保类型安全
interface WebSocketEvents {
  // Connection events / 连接事件
  connected: (data: { message: string; message_cn: string; userId: string; role: string; timestamp: string }) => void;
  error: (error: { message: string; error?: string }) => void;
  
  // User events / 用户事件
  user_status_update: (data: { userId: string; role: string; status: string; timestamp: string }) => void;
  
  // Event participation / 事件参与
  event_joined: (data: { message: string; message_cn: string; eventId: string }) => void;
  participant_joined: (data: { userId: string; role: string; eventId: string; timestamp: string }) => void;
  participant_disconnected: (data: { userId: string; role: string; timestamp: string }) => void;
  
  // Match results / 比赛结果
  match_result_update: (data: { eventId: string; teamAScore: number; teamBScore: number; winningTeam: string; timestamp: string; updatedBy: string }) => void;
  match_completed: (data: { message: string; message_cn: string; eventId: string; result: string }) => void;
  
  // Rewards / 奖励
  reward_received: (data: { message: string; message_cn: string; amount: number; eventId: string; timestamp: string }) => void;
  
  // QR scanning / 二维码扫描
  qr_scan_update: (data: { userId: string; eventId: string; scanResult: string; timestamp: string }) => void;
  
  // Health check / 健康检查
  pong: (data: { timestamp: string }) => void;
}

// Message types for UI display
// 用于UI显示的消息类型
interface RealtimeMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  content: string;
  timestamp: string;
  eventId?: string;
}

// Component props interface
// 组件属性接口
interface WebSocketClientProps {
  jwtToken?: string;
  userRole?: 'admin' | 'ambassador' | 'athlete' | 'audience';
  userId?: string;
  onConnectionChange?: (connected: boolean) => void;
  onMessageReceived?: (message: RealtimeMessage) => void;
}

export default function WebSocketClient({ 
  jwtToken, 
  userRole = 'audience', 
  userId,
  onConnectionChange,
  onMessageReceived 
}: WebSocketClientProps) {
  // WebSocket connection state
  // WebSocket连接状态
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [userStatus, setUserStatus] = useState<'online' | 'offline' | 'active'>('offline');
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [latestPing, setLatestPing] = useState<string | null>(null);
  
  // WebSocket instance ref
  // WebSocket实例引用
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Add new message to the list
  // 添加新消息到列表
  const addMessage = useCallback((message: Omit<RealtimeMessage, 'id'>) => {
    const newMessage: RealtimeMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    setMessages(prev => [newMessage, ...prev.slice(0, 49)]); // Keep last 50 messages / 保留最后50条消息
    onMessageReceived?.(newMessage);
  }, [onMessageReceived]);

  // Initialize WebSocket connection
  // 初始化WebSocket连接
  const initializeWebSocket = useCallback(() => {
    if (!jwtToken) {
      setConnectionError('No JWT token provided / 未提供JWT令牌');
      return;
    }

    try {
      // Create WebSocket connection
      // 创建WebSocket连接
      const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001', {
        auth: {
          token: jwtToken
        },
        transports: ['websocket'],
        autoConnect: false
      });

      socketRef.current = socket;

      // Connection event handlers
      // 连接事件处理器
      socket.on('connect', () => {
        setIsConnected(true);
        setConnectionError(null);
        onConnectionChange?.(true);
        
        addMessage({
          type: 'success',
          title: 'Connected / 已连接',
          content: 'WebSocket connection established / WebSocket连接已建立',
          timestamp: new Date().toISOString()
        });

        // Start ping interval for health check
        // 开始ping间隔进行健康检查
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          socket.emit('ping');
        }, 30000); // Every 30 seconds / 每30秒
      });

      socket.on('connect_error', (error) => {
        setIsConnected(false);
        setConnectionError(error.message);
        onConnectionChange?.(false);
        
        addMessage({
          type: 'error',
          title: 'Connection Error / 连接错误',
          content: `Failed to connect: ${error.message} / 连接失败: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        onConnectionChange?.(false);
        
        addMessage({
          type: 'warning',
          title: 'Disconnected / 已断开连接',
          content: `WebSocket disconnected: ${reason} / WebSocket断开连接: ${reason}`,
          timestamp: new Date().toISOString()
        });

        // Clear ping interval
        // 清除ping间隔
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
      });

      // Welcome message handler
      // 欢迎消息处理器
      socket.on('connected', (data) => {
        addMessage({
          type: 'info',
          title: 'Welcome / 欢迎',
          content: `${data.message} / ${data.message_cn}`,
          timestamp: data.timestamp
        });
      });

      // User status update handler
      // 用户状态更新处理器
      socket.on('user_status_update', (data) => {
        addMessage({
          type: 'info',
          title: 'User Status Update / 用户状态更新',
          content: `User ${data.userId} is now ${data.status} / 用户 ${data.userId} 现在状态为 ${data.status}`,
          timestamp: data.timestamp
        });
      });

      // Event participation handlers
      // 事件参与处理器
      socket.on('event_joined', (data) => {
        setJoinedEvents(prev => [...prev, data.eventId]);
        addMessage({
          type: 'success',
          title: 'Event Joined / 加入事件',
          content: `${data.message} / ${data.message_cn}`,
          timestamp: new Date().toISOString(),
          eventId: data.eventId
        });
      });

      socket.on('participant_joined', (data) => {
        addMessage({
          type: 'info',
          title: 'New Participant / 新参与者',
          content: `User ${data.userId} (${data.role}) joined event ${data.eventId} / 用户 ${data.userId} (${data.role}) 加入了事件 ${data.eventId}`,
          timestamp: data.timestamp,
          eventId: data.eventId
        });
      });

      socket.on('participant_disconnected', (data) => {
        addMessage({
          type: 'warning',
          title: 'Participant Left / 参与者离开',
          content: `User ${data.userId} (${data.role}) left / 用户 ${data.userId} (${data.role}) 离开了`,
          timestamp: data.timestamp
        });
      });

      // Match result handlers
      // 比赛结果处理器
      socket.on('match_result_update', (data) => {
        addMessage({
          type: 'success',
          title: 'Match Result / 比赛结果',
          content: `Event ${data.eventId}: Team A ${data.teamAScore} - ${data.teamBScore} Team B. Winner: Team ${data.winningTeam} / 事件 ${data.eventId}: A队 ${data.teamAScore} - ${data.teamBScore} B队. 获胜者: ${data.winningTeam}队`,
          timestamp: data.timestamp,
          eventId: data.eventId
        });
      });

      socket.on('match_completed', (data) => {
        addMessage({
          type: 'success',
          title: 'Match Completed / 比赛完成',
          content: `${data.message} - ${data.result} / ${data.message_cn} - ${data.result}`,
          timestamp: new Date().toISOString(),
          eventId: data.eventId
        });
      });

      // Reward handlers
      // 奖励处理器
      socket.on('reward_received', (data) => {
        addMessage({
          type: 'success',
          title: 'Reward Received / 获得奖励',
          content: `${data.message} / ${data.message_cn}`,
          timestamp: data.timestamp,
          eventId: data.eventId
        });
      });

      // QR scan handler (for admin/ambassador)
      // 二维码扫描处理器（管理员/大使）
      socket.on('qr_scan_update', (data) => {
        if (userRole === 'admin' || userRole === 'ambassador') {
          addMessage({
            type: 'info',
            title: 'QR Code Scanned / 二维码已扫描',
            content: `User ${data.userId} scanned QR for event ${data.eventId} / 用户 ${data.userId} 为事件 ${data.eventId} 扫描了二维码`,
            timestamp: data.timestamp,
            eventId: data.eventId
          });
        }
      });

      // Health check handler
      // 健康检查处理器
      socket.on('pong', (data) => {
        setLatestPing(data.timestamp);
      });

      // Error handler
      // 错误处理器
      socket.on('error', (error) => {
        addMessage({
          type: 'error',
          title: 'WebSocket Error / WebSocket错误',
          content: `${error.message} / ${error.message}`,
          timestamp: new Date().toISOString()
        });
      });

      // Connect to WebSocket
      // 连接到WebSocket
      socket.connect();

    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [jwtToken, userRole, addMessage, onConnectionChange]);

  // Disconnect WebSocket
  // 断开WebSocket连接
  const disconnectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
    setUserStatus('offline');
    setJoinedEvents([]);
    setLatestPing(null);
  }, []);

  // Update user status
  // 更新用户状态
  const updateUserStatus = useCallback((status: 'online' | 'active') => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('update_status', { status });
      setUserStatus(status);
      
      addMessage({
        type: 'info',
        title: 'Status Updated / 状态已更新',
        content: `Your status is now ${status} / 您的状态现在是 ${status}`,
        timestamp: new Date().toISOString()
      });
    }
  }, [isConnected, addMessage]);

  // Join event
  // 加入事件
  const joinEvent = useCallback((eventId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_event', { eventId });
    }
  }, [isConnected]);

  // Simulate QR code scan (for audience)
  // 模拟二维码扫描（观众）
  const simulateQRScan = useCallback((eventId: string) => {
    if (socketRef.current && isConnected && userRole === 'audience') {
      socketRef.current.emit('qr_scan', {
        eventId,
        scanResult: `mock_qr_token_${Date.now()}`
      });
      
      addMessage({
        type: 'info',
        title: 'QR Code Scanned / 二维码已扫描',
        content: `Scanned QR for event ${eventId} / 为事件 ${eventId} 扫描了二维码`,
        timestamp: new Date().toISOString(),
        eventId
      });
    }
  }, [isConnected, userRole, addMessage]);

  // Submit match result (admin/ambassador only)
  // 提交比赛结果（仅管理员/大使）
  const submitMatchResult = useCallback((eventId: string, teamAScore: number, teamBScore: number) => {
    if (socketRef.current && isConnected && (userRole === 'admin' || userRole === 'ambassador')) {
      const winningTeam = teamAScore > teamBScore ? 'A' : teamBScore > teamAScore ? 'B' : 'Draw';
      
      socketRef.current.emit('match_result', {
        eventId,
        teamAScore,
        teamBScore,
        winningTeam
      });
      
      addMessage({
        type: 'info',
        title: 'Match Result Submitted / 比赛结果已提交',
        content: `Submitted result for event ${eventId}: ${teamAScore}-${teamBScore} / 为事件 ${eventId} 提交结果: ${teamAScore}-${teamBScore}`,
        timestamp: new Date().toISOString(),
        eventId
      });
    }
  }, [isConnected, userRole, addMessage]);

  // Clear messages
  // 清除消息
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Effect to initialize WebSocket when component mounts
  // 组件挂载时初始化WebSocket的效果
  useEffect(() => {
    if (jwtToken) {
      initializeWebSocket();
    }
    
    return () => {
      disconnectWebSocket();
    };
  }, [jwtToken, initializeWebSocket, disconnectWebSocket]);

  // Effect to handle reconnection
  // 处理重连的效果
  useEffect(() => {
    if (!isConnected && jwtToken && !connectionError) {
      reconnectTimeoutRef.current = setTimeout(() => {
        initializeWebSocket();
      }, 5000); // Retry after 5 seconds / 5秒后重试
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isConnected, jwtToken, connectionError, initializeWebSocket]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            WebSocket Client / WebSocket客户端
          </h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected / 已连接' : 'Disconnected / 已断开'}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={userStatus}
            onChange={(e) => updateUserStatus(e.target.value as 'online' | 'active')}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={!isConnected}
          >
            <option value="online">Online / 在线</option>
            <option value="active">Active / 活跃</option>
          </select>
          
          <button
            onClick={clearMessages}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Clear / 清除
          </button>
        </div>
      </div>

      {/* Connection error display */}
      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Connection Error / 连接错误:</strong> {connectionError}
        </div>
      )}

      {/* User info and controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">User Role / 用户角色</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{userRole}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Status / 状态</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{userStatus}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Events Joined / 已加入事件</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{joinedEvents.length}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Last Ping / 最后Ping</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {latestPing ? new Date(latestPing).toLocaleTimeString() : 'None / 无'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => joinEvent(`event_${Date.now()}`)}
          disabled={!isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Join Test Event / 加入测试事件
        </button>
        
        {userRole === 'audience' && (
          <button
            onClick={() => simulateQRScan(`event_${Date.now()}`)}
            disabled={!isConnected}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Simulate QR Scan / 模拟二维码扫描
          </button>
        )}
        
        {(userRole === 'admin' || userRole === 'ambassador') && (
          <button
            onClick={() => submitMatchResult(`event_${Date.now()}`, 3, 1)}
            disabled={!isConnected}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Submit Match Result / 提交比赛结果
          </button>
        )}
      </div>

      {/* Messages feed */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg">
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Real-time Messages / 实时消息 ({messages.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No messages yet / 暂无消息
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  message.type === 'error' 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : message.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20'
                    : message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className={`font-medium ${
                        message.type === 'error' 
                          ? 'text-red-900 dark:text-red-200' 
                          : message.type === 'warning'
                          ? 'text-yellow-900 dark:text-yellow-200'
                          : message.type === 'success'
                          ? 'text-green-900 dark:text-green-200'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {message.title}
                      </h4>
                      {message.eventId && (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {message.eventId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 