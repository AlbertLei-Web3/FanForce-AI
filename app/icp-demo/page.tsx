// FanForce AI - ICP Integration Demo Page / FanForce AI - ICP集成演示页面
// Demo page showcasing ICP canister integration / 展示ICP容器集成的演示页面

'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import ICPBonusWidget from '../components/ICPBonusWidget'
import { 
  FaNetworkWired, 
  FaServer, 
  FaDatabase, 
  FaCode, 
  FaRocket,
  FaShieldAlt,
  FaCoins,
  FaTrophy
} from 'react-icons/fa'

// ICP Canister info interface / ICP容器信息接口
interface ICPCanisterInfo {
  canisterId: string
  network: string
  status: string
  functions: string[]
  features: string[]
}

export default function ICPDemoPage() {
  const { language } = useLanguage()
  const [canisterInfo, setCanisterInfo] = useState<ICPCanisterInfo>({
    canisterId: 'athlete-bonus-mvp',
    network: 'local',
    status: 'active',
    functions: [
      'createSeason',
      'checkEligibility', 
      'claimBonus',
      'getSeason',
      'getAllSeasons',
      'getAthleteClaim',
      'getCanisterStats'
    ],
    features: [
      'Season Management',
      'Eligibility Verification',
      'Bonus Distribution',
      'Real-time Data Sync',
      'Decentralized Storage',
      'Immutable Records'
    ]
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header / 标题 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <FaNetworkWired className="text-blue-400" />
            {language === 'en' ? 'ICP Integration' : 'ICP集成'}
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {language === 'en' 
              ? 'FanForce AI now integrates with Internet Computer Protocol for decentralized athlete bonuses and transparent season management.'
              : 'FanForce AI现在与互联网计算机协议集成，实现去中心化运动员奖金和透明赛季管理。'}
          </p>
        </div>

        {/* ICP Architecture Overview / ICP架构概览 */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Architecture / 左列 - 架构 */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FaServer className="text-green-400" />
                {language === 'en' ? 'ICP Canister' : 'ICP容器'}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">{language === 'en' ? 'Canister ID' : '容器ID'}:</span>
                  <span className="text-blue-400 font-mono">{canisterInfo.canisterId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">{language === 'en' ? 'Network' : '网络'}:</span>
                  <span className="text-green-400">{canisterInfo.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">{language === 'en' ? 'Status' : '状态'}:</span>
                  <span className="text-green-400">{canisterInfo.status}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaCode className="text-purple-400" />
                {language === 'en' ? 'Available Functions' : '可用功能'}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {canisterInfo.functions.map((func, index) => (
                  <div key={index} className="text-sm text-gray-300 font-mono bg-gray-800/50 px-3 py-1 rounded">
                    {func}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Features / 右列 - 功能 */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaShieldAlt className="text-yellow-400" />
                {language === 'en' ? 'Key Features' : '关键功能'}
              </h3>
              <div className="space-y-3">
                {canisterInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <FaRocket className="text-blue-400 text-sm" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaDatabase className="text-green-400" />
                {language === 'en' ? 'Data Flow' : '数据流'}
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>{language === 'en' ? 'PostgreSQL → ICP Bridge → ICP Canister' : 'PostgreSQL → ICP桥梁 → ICP容器'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{language === 'en' ? 'Real-time match data verification' : '实时比赛数据验证'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>{language === 'en' ? 'Decentralized bonus distribution' : '去中心化奖金分配'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ICP Bonus Widget Demo / ICP奖金组件演示 */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <FaTrophy className="text-yellow-400" />
              {language === 'en' ? 'Live Demo' : '实时演示'}
            </h2>
            <p className="text-gray-300">
              {language === 'en' 
                ? 'Try the ICP season bonus system with real PostgreSQL data'
                : '使用真实PostgreSQL数据试用ICP赛季奖金系统'}
            </p>
          </div>
          
          <ICPBonusWidget />
        </div>

        {/* Technical Details / 技术细节 */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <FaCoins className="text-yellow-400" />
            {language === 'en' ? 'Technical Implementation' : '技术实现'}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-blue-400 mb-2">
                {language === 'en' ? 'Motoko Canister' : 'Motoko容器'}
              </h4>
              <p className="text-gray-300 text-sm">
                {language === 'en' 
                  ? 'Smart contract written in Motoko language, deployed on ICP blockchain for decentralized season bonus management.'
                  : '用Motoko语言编写的智能合约，部署在ICP区块链上，用于去中心化赛季奖金管理。'}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-green-400 mb-2">
                {language === 'en' ? 'Bridge Service' : '桥梁服务'}
              </h4>
              <p className="text-gray-300 text-sm">
                {language === 'en' 
                  ? 'Express.js service that connects PostgreSQL database with ICP canister, providing REST API endpoints.'
                  : 'Express.js服务，连接PostgreSQL数据库与ICP容器，提供REST API端点。'}
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-purple-400 mb-2">
                {language === 'en' ? 'Frontend Widget' : '前端组件'}
              </h4>
              <p className="text-gray-300 text-sm">
                {language === 'en' 
                  ? 'React component that can be integrated into existing dashboards to provide ICP bonus functionality.'
                  : 'React组件，可以集成到现有仪表板中，提供ICP奖金功能。'}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits / 优势 */}
        <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 border border-blue-500/20">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            {language === 'en' ? 'Why ICP Integration?' : '为什么选择ICP集成？'}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-green-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">
                    {language === 'en' ? 'Decentralized & Secure' : '去中心化且安全'}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {language === 'en' 
                      ? 'No single point of failure, tamper-proof bonus distribution'
                      : '无单点故障，防篡改奖金分配'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaNetworkWired className="text-blue-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">
                    {language === 'en' ? 'Global Access' : '全球访问'}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {language === 'en' 
                      ? 'Anyone can verify bonus claims and season data'
                      : '任何人都可以验证奖金领取和赛季数据'}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FaCoins className="text-yellow-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">
                    {language === 'en' ? 'Transparent Rewards' : '透明奖励'}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {language === 'en' 
                      ? 'All bonus distributions are publicly verifiable'
                      : '所有奖金分配都是公开可验证的'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaRocket className="text-purple-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">
                    {language === 'en' ? 'Future-Proof' : '面向未来'}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {language === 'en' 
                      ? 'Scalable architecture for growing athlete communities'
                      : '可扩展架构，适用于不断增长的运动员社区'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 