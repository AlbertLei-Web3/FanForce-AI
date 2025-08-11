// FanForce AI - 多选组件
// Multi-Select Component

import React, { useState, useRef, useEffect } from 'react'
import { FaChevronDown, FaTimes } from 'react-icons/fa'

interface MultiSelectProps {
  label: string
  options: { value: string; label: string }[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = '请选择...',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉框 / Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 过滤选项 / Filter options
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedValues.includes(option.value)
  )

  // 切换选择状态 / Toggle selection
  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  // 移除选中项 / Remove selected item
  const removeOption = (value: string) => {
    onChange(selectedValues.filter(v => v !== value))
  }

  // 获取选中项的标签 / Get selected item labels
  const getSelectedLabels = () => {
    return selectedValues.map(value => 
      options.find(option => option.value === value)?.label || value
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      <div className="relative" ref={dropdownRef}>
        {/* 选择框 / Select box */}
        <div
          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white cursor-pointer transition-all duration-200 ${
            isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2 min-h-[24px]">
              {selectedValues.length > 0 ? (
                getSelectedLabels().map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded-lg"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeOption(selectedValues[index])
                      }}
                      className="hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400">{placeholder}</span>
              )}
            </div>
            <FaChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </div>

        {/* 下拉选项 / Dropdown options */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-h-60 overflow-hidden">
            {/* 搜索框 / Search input */}
            <div className="p-3 border-b border-gray-600">
              <input
                type="text"
                placeholder="搜索选项..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* 选项列表 / Options list */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => toggleOption(option.value)}
                  >
                    <span className="text-white">{option.label}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-400 text-center">
                  {searchTerm ? '没有找到匹配的选项' : '没有更多选项'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MultiSelect
