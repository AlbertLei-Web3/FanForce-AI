// FanForce AI - Profile页面常量数据
// Profile Page Constants

import { SportOption, RegionalLocationOptions } from './types'

// 运动项目选项 / Sports options (删除田径、武术、游泳、乒乓)
export const sportsOptions: SportOption[] = [
  { value: '足球', label: '足球' },
  { value: '篮球', label: '篮球', note: '后续开放组织比赛，敬请期待' },
  { value: '网球', label: '网球', note: '后续开放组织比赛，敬请期待' },
  { value: '羽毛球', label: '羽毛球', note: '后续开放组织比赛，敬请期待' },
  { value: '排球', label: '排球', note: '后续开放组织比赛，敬请期待' },
  { value: '其他', label: '其他', note: '后续开放组织比赛，敬请期待' }
]

// 运动项目位置映射 / Sport position mapping
export const sportPositions: { [key: string]: string[] } = {
  '足球': ['前锋', '中场', '后卫', '守门员', '边锋', '中锋', '后腰', '前腰'],
  '篮球': ['控球后卫', '得分后卫', '小前锋', '大前锋', '中锋', '第六人'],
  '网球': ['单打', '双打', '混双'],
  '羽毛球': ['单打', '双打', '混双'],
  '排球': ['主攻手', '副攻手', '二传手', '接应', '自由人'],
  '其他': ['待定']
}

// 运动项目院系映射 / Sport department mapping
export const sportDepartments: { [key: string]: string[] } = {
  '足球': ['体育学院', '足球学院', '运动训练学院'],
  '篮球': ['体育学院', '篮球学院', '运动训练学院'],
  '网球': ['体育学院', '网球学院', '运动训练学院'],
  '羽毛球': ['体育学院', '羽毛球学院', '运动训练学院'],
  '排球': ['体育学院', '排球学院', '运动训练学院'],
  '其他': ['体育学院', '运动训练学院']
}

// 经验水平选项 / Experience level options
export const experienceLevels = [
  '初学者 (0-1年)',
  '中级 (1-3年)',
  '高级 (3-5年)',
  '专家 (5年以上)',
  '职业/半职业'
]

// 区域位置选项 / Regional location options
export const regionalLocationOptions: RegionalLocationOptions = {
  '欧洲': {
    '法国': ['巴黎', '里昂', '马赛', '图卢兹', '尼斯'],
    '马耳他': ['瓦莱塔', '斯利马', '圣朱利安', '布吉巴', '姆西达']
  },
  '东南亚': {
    '印度尼西亚': {
      '泗水': ['Airlangga University', 'Sepuluh Nopember Institute of Technology (ITS)']
    }
  }
}
