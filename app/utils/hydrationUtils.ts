// FanForce AI - 水合警告处理工具
// Hydration Warning Utilities - 处理浏览器扩展引起的水合警告
// Handle browser extension hydration warnings and provide debugging tools
// 关联文件:
// - layout.tsx: 根布局使用suppressHydrationWarning
// - next.config.js: 配置水合警告抑制

/**
 * 常见的浏览器扩展属性列表
 * Common browser extension attributes list
 */
export const KNOWN_EXTENSION_ATTRIBUTES = [
  'data-atm-ext-installed',     // Password managers / 密码管理器
  'data-adblock-key',           // Ad blockers / 广告拦截器
  'data-bitwarden-watching',    // Bitwarden / Bitwarden密码管理器
  'data-lastpass-icon-root',    // LastPass / LastPass密码管理器
  'data-onepassword-watching',  // 1Password / 1Password密码管理器
  'data-dashlane-rid',          // Dashlane / Dashlane密码管理器
  'data-testid',                // Testing tools / 测试工具
  'data-gramm',                 // Grammarly / Grammarly语法检查器
  'cz-shortcut-listen',         // Other extensions / 其他扩展
]

/**
 * 检查元素是否有浏览器扩展属性
 * Check if element has browser extension attributes
 */
export function hasExtensionAttributes(element: HTMLElement): boolean {
  if (!element || !element.attributes) return false
  
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    if (KNOWN_EXTENSION_ATTRIBUTES.some(known => attr.name.includes(known))) {
      return true
    }
  }
  return false
}

/**
 * 获取所有浏览器扩展属性
 * Get all browser extension attributes
 */
export function getExtensionAttributes(element: HTMLElement): string[] {
  if (!element || !element.attributes) return []
  
  const extensionAttrs: string[] = []
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    if (KNOWN_EXTENSION_ATTRIBUTES.some(known => attr.name.includes(known))) {
      extensionAttrs.push(`${attr.name}="${attr.value}"`)
    }
  }
  return extensionAttrs
}

/**
 * 清理浏览器扩展属性（仅用于开发模式）
 * Clean browser extension attributes (development mode only)
 */
export function cleanExtensionAttributes(element: HTMLElement): void {
  if (process.env.NODE_ENV !== 'development') return
  
  const attrsToRemove: string[] = []
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]
    if (KNOWN_EXTENSION_ATTRIBUTES.some(known => attr.name.includes(known))) {
      attrsToRemove.push(attr.name)
    }
  }
  
  attrsToRemove.forEach(attrName => {
    element.removeAttribute(attrName)
  })
}

/**
 * 调试水合警告
 * Debug hydration warnings
 */
export function debugHydrationWarning(): void {
  if (process.env.NODE_ENV !== 'development') return
  
  const body = document.body
  if (!body) return
  
  const extensionAttrs = getExtensionAttributes(body)
  if (extensionAttrs.length > 0) {
    console.group('🔍 Browser Extension Attributes Detected / 检测到浏览器扩展属性')
    console.log('The following attributes are likely from browser extensions:')
    console.log('以下属性可能来自浏览器扩展：')
    extensionAttrs.forEach(attr => console.log(`  - ${attr}`))
    console.log('\n💡 This is normal and won\'t affect functionality.')
    console.log('💡 这是正常的，不会影响功能。')
    console.log('\n🛠️  To suppress warnings, use suppressHydrationWarning={true}')
    console.log('🛠️  要抑制警告，请使用 suppressHydrationWarning={true}')
    console.groupEnd()
  }
}

/**
 * 初始化水合警告处理
 * Initialize hydration warning handling
 */
export function initHydrationWarningHandler(): void {
  if (typeof window === 'undefined') return
  
  // 在开发模式下调试水合警告
  // Debug hydration warnings in development mode
  if (process.env.NODE_ENV === 'development') {
    // 等待DOM完全加载
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', debugHydrationWarning)
    } else {
      debugHydrationWarning()
    }
  }
}

/**
 * 检查是否是已知的浏览器扩展警告
 * Check if it's a known browser extension warning
 */
export function isKnownExtensionWarning(warning: string): boolean {
  return KNOWN_EXTENSION_ATTRIBUTES.some(attr => warning.includes(attr))
} 