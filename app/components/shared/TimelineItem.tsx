// FanForce AI - TimelineItem Component / 时间线条目组件
// Displays a single timeline log with icon, text, timestamp.
// 显示带图标、文本、时间戳的时间线日志条目。

'use client'

interface TimelineItemProps {
  icon: string | React.ReactNode
  text: string
  time: string
}

export default function TimelineItem ({ icon, text, time }: TimelineItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="text-xl">
        {icon}
      </div>
      <div>
        <p className="text-white text-sm">{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  )
} 