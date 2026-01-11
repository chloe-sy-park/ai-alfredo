/**
 * 📊 InsightsSection - 인사이트 섹션 컴포넌트
 * 
 * 홈 페이지나 More 페이지에서 사용
 */

import React from 'react';
import { BarChart3, Calendar, TrendingUp, ChevronRight } from 'lucide-react';

export default function InsightsSection({ darkMode, onOpenYearInPixels, onOpenWeeklyReport }) {
  const cardBg = darkMode ? 'bg-gray-800/80' : 'bg-white/80';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const insightCards = [
    {
      id: 'year-in-pixels',
      icon: Calendar,
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      title: 'Year in Pixels',
      subtitle: '연간 기분 시각화',
      onClick: onOpenYearInPixels
    },
    {
      id: 'weekly-report',
      icon: BarChart3,
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      title: '주간 리포트',
      subtitle: '지난 주 패턴 분석',
      onClick: onOpenWeeklyReport
    },
    {
      id: 'patterns',
      icon: TrendingUp,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
      title: '패턴 발견',
      subtitle: '상관관계 인사이트',
      badge: '곧 출시'
    }
  ];
  
  return (
    <div className="space-y-3">
      <h3 className={`${textPrimary} font-bold text-lg px-1`}>📊 나의 인사이트</h3>
      
      <div className="grid gap-3">
        {insightCards.map(card => (
          <button
            key={card.id}
            onClick={card.onClick}
            disabled={!card.onClick}
            className={`${cardBg} backdrop-blur-xl rounded-2xl p-4 border ${darkMode ? 'border-gray-700/50' : 'border-white/50'} w-full flex items-center gap-4 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:hover:scale-100`}
          >
            <div className={`${card.iconBg} w-12 h-12 rounded-xl flex items-center justify-center`}>
              <card.icon className="text-white" size={24} />
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className={`${textPrimary} font-medium`}>{card.title}</span>
                {card.badge && (
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className={`${textSecondary} text-sm`}>{card.subtitle}</p>
            </div>
            
            <ChevronRight className={textSecondary} size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}
