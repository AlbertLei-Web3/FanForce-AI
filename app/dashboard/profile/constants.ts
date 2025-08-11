// FanForce AI - Profile页面常量数据
// Profile Page Constants

import { SportOption, RegionalLocationOptions } from './types'

// 运动项目选项 / Sports options (删除田径、武术、游泳、乒乓)
export const sportsOptions: SportOption[] = [
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball', note: 'Tournaments will be available soon, stay tuned' },
  { value: 'tennis', label: 'Tennis', note: 'Tournaments will be available soon, stay tuned' },
  { value: 'badminton', label: 'Badminton', note: 'Tournaments will be available soon, stay tuned' },
  { value: 'volleyball', label: 'Volleyball', note: 'Tournaments will be available soon, stay tuned' },
  { value: 'other', label: 'Other', note: 'Tournaments will be available soon, stay tuned' }
]

// 运动项目位置映射 / Sport position mapping
export const sportPositions: { [key: string]: string[] } = {
  'football': ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger', 'Striker', 'Defensive Midfielder', 'Attacking Midfielder'],
  'basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center', 'Sixth Man'],
  'tennis': ['Singles', 'Doubles', 'Mixed Doubles'],
  'badminton': ['Singles', 'Doubles', 'Mixed Doubles'],
  'volleyball': ['Outside Hitter', 'Middle Blocker', 'Setter', 'Opposite Hitter', 'Libero'],
  'other': ['TBD']
}

// 运动项目院系映射 / Sport department mapping
export const sportDepartments: { [key: string]: string[] } = {
  'football': ['School of Physical Education', 'School of Football', 'School of Sports Training'],
  'basketball': ['School of Physical Education', 'School of Basketball', 'School of Sports Training'],
  'tennis': ['School of Physical Education', 'School of Tennis', 'School of Sports Training'],
  'badminton': ['School of Physical Education', 'School of Badminton', 'School of Sports Training'],
  'volleyball': ['School of Physical Education', 'School of Volleyball', 'School of Sports Training'],
  'other': ['School of Physical Education', 'School of Sports Training']
}

// 经验水平选项 / Experience level options
export const experienceLevels = [
  'Beginner (0-1 years)',
  'Intermediate (1-3 years)',
  'Advanced (3-5 years)',
  'Expert (5+ years)',
  'Professional/Semi-professional'
]

// 区域位置选项 / Regional location options
export const regionalLocationOptions: RegionalLocationOptions = {
  'Europe': {
    'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
    'Malta': ['Valletta', 'Sliema', 'St. Julian\'s', 'Bugibba', 'Msida']
  },
  'Asia': {
    'Indonesia': {
      'Surabaya': ['Airlangga University', 'Sepuluh Nopember Institute of Technology (ITS)']
    }
  }
}
