// FanForce AI - ICP Integration Component / FanForce AI - ICP集成组件
// Component for displaying ICP network integration status and information / 用于显示ICP网络集成状态和信息的组件
// This component shows the connection to Internet Computer and canister details / 此组件显示与互联网计算机的连接和容器详情

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/app/context/LanguageContext'
import { icpService } from '@/app/utils/icpService'
import { 
  FaNetworkWired, 
  FaServer, 
  FaDatabase, 
  FaShieldAlt, 
  FaRocket,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaExternalLinkAlt,
  FaCog,
  FaChartLine,
  FaCoins
} from 'react-icons/fa'

interface ICPNetworkStatus {
  isConnected: boolean;
  canisterId: string;
  network: string;
  latency: number;
}

export default function ICPIntegration() {
  const { language } = useLanguage()
  const [networkStatus, setNetworkStatus] = useState<ICPNetworkStatus | null>(null)
  const [canisterStats, setCanisterStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Load ICP network status and canister stats / 加载ICP网络状态和容器统计
  useEffect(() => {
    const loadICPData = async () => {
      try {
        setIsLoading(true)
        
        // Get network status / 获取网络状态
        const status = await icpService.getNetworkStatus()
        setNetworkStatus(status)
        
        // Get canister statistics / 获取容器统计
        const stats = await icpService.getCanisterStats()
        setCanisterStats(stats)
        
        setLastUpdate(new Date())
      } catch (error) {
        console.error('Error loading ICP data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadICPData()
    
    // Refresh data every 30 seconds / 每30秒刷新数据
    const interval = setInterval(loadICPData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Format latency display / 格式化延迟显示
  const formatLatency = (latency: number) => {
    if (latency < 100) return `${latency}ms`
    return `${(latency / 1000).toFixed(1)}s`
  }

  // Get status color / 获取状态颜色
  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? 'text-green-400' : 'text-red-400'
  }

  // Get status icon / 获取状态图标
  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? <FaCheckCircle /> : <FaExclamationTriangle />
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      {/* Header / 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <FaNetworkWired className="text-blue-400 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {language === 'en' ? 'ICP Network Integration' : 'ICP网络集成'}
            </h3>
            <p className="text-sm text-gray-400">
              {language === 'en' ? 'Internet Computer Connection' : '互联网计算机连接'}
            </p>
          </div>
        </div>
        
        {/* Refresh Button / 刷新按钮 */}
        <button
          onClick={() => window.location.reload()}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          title={language === 'en' ? 'Refresh' : '刷新'}
        >
          <FaCog className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <FaSpinner className="animate-spin text-blue-400 text-2xl mr-3" />
          <span className="text-gray-400">
            {language === 'en' ? 'Connecting to ICP...' : '正在连接ICP...'}
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Network Status / 网络状态 */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white flex items-center">
                <FaServer className="mr-2 text-blue-400" />
                {language === 'en' ? 'Network Status' : '网络状态'}
              </h4>
              <div className={`flex items-center space-x-2 ${getStatusColor(networkStatus?.isConnected || false)}`}>
                {getStatusIcon(networkStatus?.isConnected || false)}
                <span className="text-sm font-medium">
                  {networkStatus?.isConnected 
                    ? (language === 'en' ? 'Connected' : '已连接')
                    : (language === 'en' ? 'Disconnected' : '未连接')
                  }
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">{language === 'en' ? 'Network:' : '网络：'}</span>
                <span className="text-white ml-2">{networkStatus?.network}</span>
              </div>
              <div>
                <span className="text-gray-400">{language === 'en' ? 'Latency:' : '延迟：'}</span>
                <span className="text-white ml-2">{formatLatency(networkStatus?.latency || 0)}</span>
              </div>
            </div>
          </div>

          {/* Canister Information / 容器信息 */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <FaDatabase className="mr-2 text-green-400" />
              {language === 'en' ? 'Canister Information' : '容器信息'}
            </h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">{language === 'en' ? 'Canister ID:' : '容器ID：'}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-mono text-xs">{networkStatus?.canisterId}</span>
                  <a 
                    href={icpService.generateCanisterUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
              
              {canisterStats && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Total Athletes:' : '总运动员：'}</span>
                    <span className="text-white">{canisterStats.totalAthletes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Total Bonuses:' : '总奖金：'}</span>
                    <span className="text-white">{canisterStats.totalBonuses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Total Seasons:' : '总赛季：'}</span>
                    <span className="text-white">{canisterStats.totalSeasons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{language === 'en' ? 'Distributed:' : '已分配：'}</span>
                    <span className="text-white">{canisterStats.totalDistributed.toFixed(2)} ICP</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ICP Benefits / ICP优势 */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <FaRocket className="mr-2 text-purple-400" />
              {language === 'en' ? 'ICP Benefits' : 'ICP优势'}
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <FaShieldAlt className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-white font-medium">
                    {language === 'en' ? 'Decentralized Storage' : '去中心化存储'}
                  </span>
                  <p className="text-gray-400">
                    {language === 'en' 
                      ? 'Data stored on Internet Computer network, immune to censorship'
                      : '数据存储在互联网计算机网络上，抗审查'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaChartLine className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-white font-medium">
                    {language === 'en' ? 'Ultra-Low Costs' : '超低成本'}
                  </span>
                  <p className="text-gray-400">
                    {language === 'en' 
                      ? '$5/GB/year storage, $0.000000000000536 per instruction'
                      : '$5/GB/年存储，每条指令$0.000000000000536'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FaCoins className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-white font-medium">
                    {language === 'en' ? 'Native Token Integration' : '原生代币集成'}
                  </span>
                  <p className="text-gray-400">
                    {language === 'en' 
                      ? 'Direct ICP token transactions for season bonuses'
                      : '直接ICP代币交易用于赛季奖金'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Update / 最后更新 */}
          <div className="text-center text-xs text-gray-500">
            {language === 'en' ? 'Last updated:' : '最后更新：'} {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  )
} 