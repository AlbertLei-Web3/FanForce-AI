// FanForce AI - 注册流程常量配置
// Registration Flow Constants Configuration

// 路由配置 / Route Configuration
export const REGISTRATION_ROUTES = {
  DASHBOARD: '/dashboard',
  AUDIENCE: '/dashboard/audience',
  ATHLETE: '/dashboard/athlete',
  AMBASSADOR: '/dashboard/ambassador',
  HOME: '/'
}

// 存储键配置 / Storage Keys Configuration
export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  REGISTRATION_STATE: 'registrationState'
}

// 认证提供商配置 / Authentication Provider Configuration
export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  WEB3: 'web3',
  ICP: 'icp'
}

// 注册步骤配置 / Registration Steps Configuration
export const REGISTRATION_STEPS = {
  AUTH: 'auth' as const,
  IDENTITY: 'identity' as const
} as const

// 加载延迟配置 / Loading Delay Configuration
export const LOADING_DELAYS = {
  AUTH_CHECK: 500,
  SOCIAL_LOGIN: 1500
}

// 错误消息配置 / Error Messages Configuration
export const ERROR_MESSAGES = {
  METAMASK_NOT_INSTALLED: {
    en: 'Please install MetaMask to continue',
    cn: '请安装MetaMask以继续'
  },
  LOGIN_FAILED: {
    en: 'Login failed, please try again',
    cn: '登录失败，请重试'
  }
}
