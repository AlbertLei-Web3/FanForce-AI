// FanForce AI - Profile页面验证配置
// Profile Page Validation Configuration

import * as yup from 'yup'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'

// 自定义验证规则 / Custom validation rules
yup.addMethod(yup.string, 'phone', function(message = '请输入有效的电话号码') {
  return this.test('phone', message, function(value) {
    if (!value) return true // 允许空值，由required规则处理
    
    try {
      // 尝试解析电话号码
      const phoneNumber = parsePhoneNumber(value)
      if (phoneNumber && isValidPhoneNumber(value)) {
        return true
      }
      return false
    } catch {
      return false
    }
  })
})

yup.addMethod(yup.string, 'phoneWithCountryCode', function(message = '请输入有效的国际电话号码（包含国家代码）') {
  return this.test('phoneWithCountryCode', message, function(value) {
    if (!value) return true
    
    try {
      const phoneNumber = parsePhoneNumber(value)
      if (phoneNumber && phoneNumber.country) {
        return true
      }
      return false
    } catch {
      return false
    }
  })
})

// 个人信息验证模式 / Personal information validation schema
export const personalInfoSchema = yup.object({
  username: yup
    .string()
    .required('用户名不能为空')
    .min(2, '用户名至少需要2个字符')
    .max(20, '用户名不能超过20个字符')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文')
    .trim(),
  
  email: yup
    .string()
    .required('邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .max(100, '邮箱地址不能超过100个字符')
    .trim()
    .lowercase(),
  
  phone: yup
    .string()
    .required('电话号码不能为空')
    .phone('请输入有效的电话号码格式')
    .phoneWithCountryCode('请输入包含国家代码的国际电话号码（如：+86 138 0013 8000）'),
  
  emergencyContact: yup
    .string()
    .required('紧急联系人不能为空')
    .min(2, '紧急联系人姓名至少需要2个字符')
    .max(50, '紧急联系人姓名不能超过50个字符')
    .trim(),
  
  regionalLocation: yup
    .string()
    .required('区域位置不能为空')
    .min(5, '请选择完整的区域位置信息')
    .trim()
})

// 运动员信息验证模式 / Athlete information validation schema
export const athleteInfoSchema = yup.object({
  primarySport: yup
    .string()
    .required('请选择主要运动项目'),
  
  experienceLevel: yup
    .string()
    .required('请选择经验水平'),
  
  positions: yup
    .array()
    .of(yup.string())
    .min(1, '请选择至少一个位置')
    .max(5, '最多只能选择5个位置'),
  
  height: yup
    .string()
    .matches(/^\d+(\.\d+)?\s*(cm|m|ft|in)$/i, '请输入有效的身高格式（如：180cm、1.8m、5ft 10in）'),
  
  weight: yup
    .string()
    .matches(/^\d+(\.\d+)?\s*(kg|lb|g|oz)$/i, '请输入有效的体重格式（如：75kg、165lb）'),
  
  achievements: yup
    .string()
    .max(500, '成就描述不能超过500个字符')
})

// 观众信息验证模式 / Audience information validation schema
export const audienceInfoSchema = yup.object({
  interestedSports: yup
    .string()
    .required('请选择感兴趣的运动项目'),
  
  favoriteTeams: yup
    .string()
    .max(200, '喜爱的球队不能超过200个字符')
    .matches(/^[a-zA-Z0-9\s\u4e00-\u9fa5,，]+$/, '球队名称只能包含字母、数字、空格、中文和逗号')
})

// 大使信息验证模式 / Ambassador information validation schema
export const ambassadorInfoSchema = yup.object({
  sportsAmbassadorType: yup
    .string()
    .required('请选择体育大使类型')
})

// 实时验证函数 / Real-time validation functions
export const validateField = async (
  schema: yup.ObjectSchema<any>,
  field: string,
  value: any
): Promise<string | undefined> => {
  try {
    await schema.validateAt(field, { [field]: value })
    return undefined
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return error.message
    }
    return '验证失败'
  }
}

// 电话号码格式化函数 / Phone number formatting function
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''
  
  try {
    const phoneNumber = parsePhoneNumber(phone)
    if (phoneNumber && phoneNumber.isValid()) {
      return phoneNumber.formatInternational()
    }
  } catch {
    // 如果解析失败，返回原始值
  }
  
  return phone
}

// 电话号码解析函数 / Phone number parsing function
export const parsePhoneNumberInput = (input: string): {
  countryCode: string
  nationalNumber: string
  isValid: boolean
  formatted: string
} => {
  try {
    const phoneNumber = parsePhoneNumber(input)
    if (phoneNumber && phoneNumber.isValid()) {
      return {
        countryCode: phoneNumber.country || '',
        nationalNumber: phoneNumber.nationalNumber || '',
        isValid: true,
        formatted: phoneNumber.formatInternational()
      }
    }
  } catch {
    // 解析失败
  }
  
  return {
    countryCode: '',
    nationalNumber: input,
    isValid: false,
    formatted: input
  }
}

// 邮箱验证增强函数 / Enhanced email validation function
export const validateEmailAdvanced = (email: string): {
  isValid: boolean
  suggestions: string[]
  error?: string
} => {
  const suggestions: string[] = []
  
  // 基本格式检查
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      isValid: false,
      suggestions: [],
      error: '邮箱格式不正确'
    }
  }
  
  // 常见错误检查和建议
  if (email.includes('gamil.com')) {
    suggestions.push('gamil.com → gmail.com')
  }
  if (email.includes('hotmai.com')) {
    suggestions.push('hotmai.com → hotmail.com')
  }
  if (email.includes('yaho.com')) {
    suggestions.push('yaho.com → yahoo.com')
  }
  if (email.includes('outloo.com')) {
    suggestions.push('outloo.com → outlook.com')
  }
  
  // 检查是否包含空格
  if (email.includes(' ')) {
    suggestions.push('移除邮箱中的空格')
  }
  
  // 检查域名是否合理
  const domain = email.split('@')[1]
  if (domain && domain.length < 3) {
    suggestions.push('检查邮箱域名是否正确')
  }
  
  return {
    isValid: suggestions.length === 0,
    suggestions
  }
}

// 导出所有验证模式 / Export all validation schemas
export const validationSchemas = {
  personal: personalInfoSchema,
  athlete: athleteInfoSchema,
  audience: audienceInfoSchema,
  ambassador: ambassadorInfoSchema
}

// 导出验证类型 / Export validation types
export type PersonalInfoValidation = yup.InferType<typeof personalInfoSchema>
export type AthleteInfoValidation = yup.InferType<typeof athleteInfoSchema>
export type AudienceInfoValidation = yup.InferType<typeof audienceInfoSchema>
export type AmbassadorInfoValidation = yup.InferType<typeof ambassadorInfoSchema>
