/**
 * 📦 MorePageEnhanced - 새 메뉴가 추가된 More 페이지
 * 
 * 기존 MorePage를 확장하여 새 기능들 접근점 제공
 */

import React from 'react';
import { 
  ChevronRight, Calendar, BarChart3, Sparkles, 
  Settings, Heart, Zap, Users, Bell
} from 'lucide-react';

export default function MorePageEnhanced({ 
  darkMode, 
  onOpenEnhancedView,
  onOpenSettings,
  onOpenWeeklyReview,
  streakData = {},
  ...props 
}) {
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-[#F0EBFF]';
  const cardBg = darkMode ? 'bg-gray-800/80' : 'bg-white/80';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  // 새 메뉴 섹션들
  const sections = [
    {
      title: '📊 인사이트',
      items: [
        {
          icon: '📅',
          iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
          title: 'Year in Pixels',
          subtitle: '연간 기분 시각화',
          onClick: () => onOpenEnhancedView?.('YEAR_IN_PIXELS')
        },
        {
          icon: '📊',
          iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
          title: '주간 리포트',
          subtitle: '패턴 분석 & 상관관계',
          onClick: () => onOpenEnhancedView?.('WEEKLY_REPORT_V2')
        },
        {
          icon: '⚡',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
          title: '에너지 리듬',
          subtitle: '시간대별 생산성',
          onClick: onOpenWeeklyReview
        }
      ]
    },
    {
      title: '✨ ADHD 도구',
      items: [
        {
          icon: '🪄',
          iconBg: 'bg-gradient-to-br from-violet-500 to-purple-500',
          title: 'Magic ToDo',
          subtitle: '작업 자동 분해',
          onClick: () => onOpenEnhancedView?.('MAGIC_TODO')
        }
      ]
    },
    {
      title: '🐧 알프레도',
      items: [
        {
          icon: '🐧',
          iconBg: 'bg-gradient-to-br from-[#A996FF] to-[#8B7CF7]',
          title: '알프레도 성격',
          subtitle: '말투 & 스타일 설정',
          onClick: () => onOpenEnhancedView?.('PERSONALITY_SETTINGS')
        },
        {
          icon: '🧠',
          iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-500',
          title: '알프레도 기억',
          subtitle: '내가 기억하는 것들',
          onClick: () => onOpenEnhancedView?.('MEMORY_VIEW')
        }
      ]
    },
    {
      title: '⚙️ 설정',
      items: [
        {
          icon: '⚙️',
          iconBg: 'bg-gradient-to-br from-gray-500 to-gray-600',
          title: '설정',
          subtitle: '계정 & 연동 관리',
          onClick: onOpenSettings
        }
      ]
    }
  ];
  
  return (
    <div className={`${bgColor} min-h-screen pb-24`}>
      {/* 헤더 */}
      <div className="px-5 pt-14 pb-4">
        <h1 className={`${textPrimary} text-2xl font-bold`}>더보기</h1>
      </div>
      
      {/* 스트릭 요약 카드 */}
      <div className="px-5 mb-6">
        <div className={`${cardBg} backdrop-blur-xl rounded-2xl p-5 border ${darkMode ? 'border-gray-700/50' : 'border-white/50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🔥</div>
              <div>
                <p className={`${textPrimary} text-2xl font-bold`}>
                  {streakData.currentStreak || 0}일 연속
                </p>
                <p className={textSecondary}>
                  최장 {streakData.longestStreak || 0}일 | 보호권 {streakData.protectionsLeft || 0}회
                </p>
              </div>
            </div>
            <div className="text-5xl">🐧</div>
          </div>
        </div>
      </div>
      
      {/* 메뉴 섹션들 */}
      <div className="px-5 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className={`${textSecondary} text-sm font-medium mb-3 px-1`}>
              {section.title}
            </h2>
            <div className={`${cardBg} backdrop-blur-xl rounded-2xl overflow-hidden border ${darkMode ? 'border-gray-700/50' : 'border-white/50'}`}>
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  onClick={item.onClick}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-black/5 transition-colors ${itemIdx < section.items.length - 1 ? (darkMode ? 'border-b border-gray-700/50' : 'border-b border-gray-100') : ''}`}
                >
                  <div className={`${item.iconBg} w-11 h-11 rounded-xl flex items-center justify-center text-xl`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`${textPrimary} font-medium`}>{item.title}</p>
                    <p className={`${textSecondary} text-sm`}>{item.subtitle}</p>
                  </div>
                  <ChevronRight className={textSecondary} size={20} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
