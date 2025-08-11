// FanForce AI - Profile表单状态管理Hook
// Profile Form State Management Hook

import { useState, useCallback, useEffect } from 'react'
import { PersonalInfo, RoleSpecificInfo, ValidationErrors, FormState, SaveState } from '../types'
import { 
  validatePersonalInfo, 
  validateRoleSpecificInfo, 
  createFormState, 
  updateFormField,
  formStateToData,
  dataToFormState,
  hasUnsavedChanges
} from '../utils'
import { 
  validationSchemas, 
  validateField as validateFieldYup 
} from '../validation'

export const useProfileForm = (initialData: any) => {
  // 表单状态 / Form state
  const [personalFormState, setPersonalFormState] = useState<FormState>(createFormState(initialData.personalInfo || {}))
  const [roleFormState, setRoleFormState] = useState<FormState>(createFormState(initialData.roleSpecificInfo || {}))
  
  // 编辑状态 / Edit states
  const [editStates, setEditStates] = useState({
    personal: false,
    athlete: false,
    audience: false,
    ambassador: false
  })
  
  // 保存状态 / Save state
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    hasUnsavedChanges: false
  })
  
  // 原始数据 / Original data
  const [originalData, setOriginalData] = useState(initialData)
  
  // 验证错误 / Validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // 更新个人信息字段 / Update personal info field
  const updatePersonalField = useCallback((field: string, value: string) => {
    setPersonalFormState(prev => updateFormField(prev, field, value))
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }))
    
    // 清除该字段的验证错误
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  // 更新角色信息字段 / Update role-specific info field
  const updateRoleField = useCallback((field: string, value: any) => {
    setRoleFormState(prev => updateFormField(prev, field, value))
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }))
    
    // 清除该字段的验证错误
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  // 开始编辑 / Start editing
  const startEditing = useCallback((section: keyof typeof editStates) => {
    setEditStates(prev => ({ ...prev, [section]: true }))
    // 清除验证错误
    setValidationErrors({})
  }, [])

  // 取消编辑 / Cancel editing
  const cancelEditing = useCallback((section: keyof typeof editStates) => {
    setEditStates(prev => ({ ...prev, [section]: false }))
    
    // 重置表单状态 / Reset form state
    if (section === 'personal') {
      setPersonalFormState(dataToFormState(originalData.personalInfo || {}))
    } else {
      setRoleFormState(dataToFormState(originalData.roleSpecificInfo || {}))
    }
    
    setValidationErrors({})
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: false }))
  }, [originalData])

  // 验证表单（使用yup） / Validate form using yup
  const validateForm = useCallback(async (section: string) => {
    let errors: ValidationErrors = {}
    
    try {
      if (section === 'personal') {
        const personalData = formStateToData(personalFormState)
        await validationSchemas.personal.validate(personalData, { abortEarly: false })
      } else if (section === 'athlete') {
        const roleData = formStateToData(roleFormState)
        await validationSchemas.athlete.validate(roleData, { abortEarly: false })
      } else if (section === 'audience') {
        const roleData = formStateToData(roleFormState)
        await validationSchemas.audience.validate(roleData, { abortEarly: false })
      } else if (section === 'ambassador') {
        const roleData = formStateToData(roleFormState)
        await validationSchemas.ambassador.validate(roleData, { abortEarly: false })
      }
    } catch (validationError: any) {
      if (validationError.inner) {
        validationError.inner.forEach((err: any) => {
          errors[err.path] = err.message
        })
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [personalFormState, roleFormState])

  // 保存个人信息 / Save personal info
  const savePersonalInfo = useCallback(async () => {
    const isValid = await validateForm('personal')
    if (!isValid) {
      return false
    }
    
    setSaveState(prev => ({ ...prev, isSaving: true }))
    
    try {
      // 模拟API调用 / Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const personalData = formStateToData(personalFormState)
      setOriginalData(prev => ({ ...prev, personalInfo: personalData }))
      setEditStates(prev => ({ ...prev, personal: false }))
      setSaveState(prev => ({ 
        ...prev, 
        isSaving: false, 
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      }))
      
      return true
    } catch (error) {
      setSaveState(prev => ({ ...prev, isSaving: false }))
      return false
    }
  }, [personalFormState, validateForm])

  // 保存角色信息 / Save role-specific info
  const saveRoleInfo = useCallback(async (section: string) => {
    const isValid = await validateForm(section)
    if (!isValid) {
      return false
    }
    
    setSaveState(prev => ({ ...prev, isSaving: true }))
    
    try {
      // 模拟API调用 / Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const roleData = formStateToData(roleFormState)
      setOriginalData(prev => ({ ...prev, roleSpecificInfo: roleData }))
      setEditStates(prev => ({ ...prev, [section]: false }))
      setSaveState(prev => ({ 
        ...prev, 
        isSaving: false, 
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      }))
      
      return true
    } catch (error) {
      setSaveState(prev => ({ ...prev, isSaving: false }))
      return false
    }
  }, [roleFormState, validateForm])

  // 实时验证单个字段 / Real-time validation for single field
  const validateSingleField = useCallback(async (
    section: string, 
    field: string, 
    value: any
  ) => {
    try {
      let schema
      if (section === 'personal') {
        schema = validationSchemas.personal
      } else if (section === 'athlete') {
        schema = validationSchemas.athlete
      } else if (section === 'audience') {
        schema = validationSchemas.audience
      } else if (section === 'ambassador') {
        schema = validationSchemas.ambassador
      } else {
        return
      }

      const error = await validateFieldYup(schema, field, value)
      
      setValidationErrors(prev => ({
        ...prev,
        [field]: error || undefined
      }))
      
      return error
    } catch (error) {
      console.error('Field validation error:', error)
    }
  }, [])

  // 检查是否有未保存的更改 / Check for unsaved changes
  useEffect(() => {
    const personalChanged = hasUnsavedChanges(
      originalData.personalInfo || {}, 
      formStateToData(personalFormState)
    )
    const roleChanged = hasUnsavedChanges(
      originalData.roleSpecificInfo || {}, 
      formStateToData(roleFormState)
    )
    
    setSaveState(prev => ({ 
      ...prev, 
      hasUnsavedChanges: personalChanged || roleChanged 
    }))
  }, [personalFormState, roleFormState, originalData])

  // 获取当前表单数据 / Get current form data
  const getCurrentData = useCallback(() => ({
    personalInfo: formStateToData(personalFormState),
    roleSpecificInfo: formStateToData(roleFormState)
  }), [personalFormState, roleFormState])

  // 重置表单 / Reset form
  const resetForm = useCallback(() => {
    setPersonalFormState(dataToFormState(originalData.personalInfo || {}))
    setRoleFormState(dataToFormState(originalData.roleSpecificInfo || {}))
    setEditStates({
      personal: false,
      athlete: false,
      audience: false,
      ambassador: false
    })
    setValidationErrors({})
    setSaveState(prev => ({ ...prev, hasUnsavedChanges: false }))
  }, [originalData])

  return {
    // 状态 / State
    personalFormState,
    roleFormState,
    editStates,
    saveState,
    validationErrors,
    
    // 方法 / Methods
    updatePersonalField,
    updateRoleField,
    startEditing,
    cancelEditing,
    savePersonalInfo,
    saveRoleInfo,
    validateForm,
    validateSingleField,
    getCurrentData,
    resetForm
  }
}
