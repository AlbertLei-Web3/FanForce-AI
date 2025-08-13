// FanForce AI - 角色配置数据
// Role Configuration Data - 定义所有可选择的用户角色

import { UserRole } from '../../../context/UserContext'
import { RoleOption } from './types'

// 角色选项配置 / Role Options Configuration  
// 排序：观众(左) → 运动员(中) → 大使(右) / Order: Audience(left) → Athlete(center) → Ambassador(right)
export const roleOptions: RoleOption[] = [
  {
    role: UserRole.AUDIENCE,
    icon: '🙋‍♂️',
    title: { en: 'Audience Supporter', cn: '观众支持者' },
    description: { 
      en: 'Support teams through staking and tier rewards',
      cn: '通过质押和层级奖励支持队伍'
    },
    features: [
      { en: 'Stake on match outcomes', cn: '对比赛结果质押' },
      { en: 'Attend exclusive events', cn: '参加专属活动' },
      { en: 'Three-tier rewards', cn: '三层奖励系统' },
      { en: 'QR check-ins', cn: '二维码签到' }
    ],
    gradient: 'from-blue-500 to-indigo-600',
    popular: true
  },
  {
    role: UserRole.ATHLETE,
    icon: '🏃‍♂️',
    title: { en: 'Community Athlete', cn: '社区运动员' },
    description: { 
      en: 'Compete in matches and earn season bonuses',
      cn: '参与比赛，获得排名，领取赛季奖金'
    },
    features: [
      { en: 'Join competitions', cn: '参与比赛' },
      { en: 'Build athletic profile', cn: '建立运动档案' },
      { en: 'Earn season bonuses', cn: '获得赛季奖金' },
      { en: 'Track performance', cn: '追踪表现' }
    ],
    gradient: 'from-green-500 to-emerald-600',
    popular: true
  },
  {
    role: UserRole.AMBASSADOR,
    icon: '🧑‍💼',
    title: { en: 'Ambassador', cn: '大使' },
    description: { 
      en: 'Organize events and earn commission fees',
      cn: '组织活动，招募运动员，获得佣金费用'
    },
    features: [
      { en: 'Create events', cn: '创建活动' },
      { en: 'Recruit athletes', cn: '招募运动员' },
      { en: 'Earn 1% commission', cn: '获得1%佣金' },
      { en: 'Partner with merchants', cn: '与商户合作' }
    ],
    gradient: 'from-yellow-500 to-orange-600',
    popular: false,
    requiresInvite: true // 需要邀请码 / Requires invitation code
  }
]
