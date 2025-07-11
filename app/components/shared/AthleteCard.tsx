// FanForce AI - Athlete Card Component / 运动员卡片组件
// Reusable component to display athlete information in a card format.
// 用于以卡片形式显示运动员信息的可复用组件。

'use client'

import { useLanguage } from '../../context/LanguageContext'
import Image from 'next/image'

interface AthleteCardProps {
  athlete: {
    name: string;
    imageUrl: string;
    height: string;
    weight: string;
    wins: number;
    losses: number;
  }
}

export default function AthleteCard({ athlete }: AthleteCardProps) {
  const { language } = useLanguage()

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm text-center transform hover:-translate-y-1 transition-transform duration-300 shadow-lg group">
      <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
        <Image
          src={athlete.imageUrl}
          alt={athlete.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <h4 className="text-md font-bold text-white truncate">{athlete.name}</h4>
      <div className="text-xs text-gray-300 mt-2 grid grid-cols-2 gap-1">
        <p>
          <strong>{language === 'en' ? 'H' : '身高'}:</strong> {athlete.height}
        </p>
        <p>
          <strong>{language === 'en' ? 'W' : '体重'}:</strong> {athlete.weight}
        </p>
        <p>
          <strong>{language === 'en' ? 'Wins' : '胜'}:</strong> {athlete.wins}
        </p>
        <p>
          <strong>{language === 'en' ? 'Losses' : '负'}:</strong> {athlete.losses}
        </p>
      </div>
    </div>
  )
} 