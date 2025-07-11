// FanForce AI - DataTable Component / 通用数据表格组件
// Renders a simple table given columns and rows.
// 根据列定义和行数据渲染简单表格。

'use client'

import React from 'react'

interface Column {
  key: string
  headerEn: string
  headerCn: string
}

interface DataTableProps {
  columns: Column[]
  rows: Record<string, any>[]
  /** Current language code / 当前语言 */
  language?: 'en' | 'zh'
}

export default function DataTable ({ columns, rows, language = 'en' }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700 text-sm">
        <thead className="bg-gray-800">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-4 py-2 text-left text-gray-300 whitespace-nowrap">
                {language === 'en' ? col.headerEn : col.headerCn}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gray-400">
                {language === 'en' ? 'No data' : '暂无数据'}
              </td>
            </tr>
          )}
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-700/30">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-2 text-white whitespace-nowrap">
                  {row[col.key] ?? '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 