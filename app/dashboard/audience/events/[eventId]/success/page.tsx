// FanForce AI - Audience Support Success Page / 支持成功页面
// Static congratulation page shown after user supports a team.
// 静态恭喜页面，在用户支持队伍后显示。

'use client'

import { useLanguage } from '../../../../../context/LanguageContext'
import DashboardLayout from '../../../../../components/shared/DashboardLayout'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PageProps {
  params: { eventId: string }
}

export default function AudienceSupportSuccessPage({ params }: PageProps) {
  const { language } = useLanguage()
  const router = useRouter()

  return (
    <DashboardLayout
      title={language === 'en' ? 'Support Successful' : '支持成功'}
      subtitle={language === 'en' ? 'Thank you for supporting your team!' : '感谢您支持您选择的队伍！'}
      actions={
        <button onClick={() => router.push(`/dashboard/audience/events/${params.eventId}`)} className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
          {language === 'en' ? 'Back to Event' : '返回赛事'}
        </button>
      }
    >
      <div className="max-w-xl mx-auto bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">
          {language === 'en' ? 'Congratulations!' : '恭喜！'}
        </h2>
        <p className="text-gray-300 text-lg">
          {language === 'en'
            ? 'Your support has been recorded. Good luck!'
            : '您的支持已被记录。祝您好运！'}
        </p>
        <div className="text-6xl animate-bounce">🎉</div>
        <Link href="/dashboard/audience" className="inline-block bg-fanforce-primary hover:bg-fanforce-secondary text-white px-6 py-3 rounded-lg transition-colors">
          {language === 'en' ? 'Return to Dashboard' : '返回仪表板'}
        </Link>
      </div>
    </DashboardLayout>
  )
} 