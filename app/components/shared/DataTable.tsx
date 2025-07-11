// FanForce AI - DataTable Component / 通用数据表格组件
// Renders a simple table given columns and rows.
// 根据列定义和行数据渲染简单表格。

'use client'

import React from 'react'
import Link from 'next/link'

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
  // A helper function to render different types of cell data.
  // 一个辅助函数，用于渲染不同类型的单元格数据。
  const renderCell = (cellData: any) => {
    // If the data is an object, handle it based on its 'type' property.
    // 如果数据是对象，则根据其 'type' 属性进行处理。
    if (typeof cellData === 'object' && cellData !== null && cellData.type) {
      switch (cellData.type) {
        case 'link':
          // Render a clickable link. 渲染一个可点击的链接。
          return (
            <Link href={cellData.href || '#'} className="text-blue-400 hover:underline font-semibold transition-colors">
              {cellData.text}
            </Link>
          );
        case 'win':
          // Render green text for wins. 为胜利渲染绿色文本。
          return <span className="font-bold text-green-400">{cellData.text}</span>;
        case 'loss':
           // Render red text for losses. 为失败渲染红色文本。
          return <span className="text-red-500">{cellData.text}</span>;
        case 'pending':
          // Render gray text for pending status. 为待定状态渲染灰色文本。
          return <span className="text-gray-400">{cellData.text}</span>;
        default:
          // For unknown object types, display nothing to avoid errors. 对于未知对象类型，不显示任何内容以避免错误。
          return '-';
      }
    }
    
    // For primitive types (string, number), render them directly.
    // 对于原始类型（字符串、数字），直接渲染它们。
    return cellData ?? '-';
  };

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
                  {renderCell(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 