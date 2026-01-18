/**
 * Wrapped 스타일 공유 카드
 * Spotify Wrapped 스타일로 통계를 시각적으로 표시
 */

import { forwardRef } from 'react';

export interface WrappedCardData {
  // 기본 정보
  userName?: string;
  period: string; // 예: "2025년 1월 2주차"

  // 통계
  totalLifts: number;
  appliedLifts: number;
  workLifeRatio: { work: number; life: number };

  // 하이라이트
  topDecision?: string;
  bestDay?: string;
  insight?: string;

  // 알프레도 이해도
  understandingLevel?: number; // 1-100
  understandingTitle?: string; // 예: "눈치 빠른 알프레도"
}

interface WrappedCardProps {
  data: WrappedCardData;
  variant?: 'default' | 'minimal' | 'colorful';
  className?: string;
}

export const WrappedCard = forwardRef<HTMLDivElement, WrappedCardProps>(
  ({ data, variant = 'default', className = '' }, ref) => {
    const { bgGradient } = getVariantStyles(variant);

    return (
      <div
        ref={ref}
        className={`w-[360px] min-h-[640px] rounded-3xl overflow-hidden ${className}`}
        style={{ background: bgGradient }}
      >
        {/* 헤더 */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-white/20">
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-64.png"
              alt="알프레도"
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-4xl">🎩</span>'; }}
            />
          </div>
          <h1 className="text-white text-xl font-bold mb-1">
            {data.userName ? `${data.userName}의` : '나의'} 알프레도
          </h1>
          <p className="text-white/70 text-sm">{data.period}</p>
        </div>

        {/* 메인 통계 */}
        <div className="px-6 pb-6">
          {/* 판단 변화 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-1">
                {data.totalLifts}
              </div>
              <p className="text-white/70 text-sm">번의 판단 변화</p>
            </div>

            <div className="flex justify-center gap-8 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{data.appliedLifts}</div>
                <p className="text-white/60 text-xs">적용</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {data.totalLifts - data.appliedLifts}
                </div>
                <p className="text-white/60 text-xs">유지</p>
              </div>
            </div>
          </div>

          {/* Work/Life 균형 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
            <p className="text-white/70 text-xs mb-3 text-center">일과 삶의 균형</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${data.workLifeRatio.work}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-white font-medium">일 {data.workLifeRatio.work}%</span>
                  <span className="text-white/60">삶 {data.workLifeRatio.life}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 하이라이트 */}
          {data.topDecision && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
              <p className="text-white/70 text-xs mb-2">이번 주 최고의 선택</p>
              <p className="text-white text-sm font-medium leading-relaxed">
                "{data.topDecision}"
              </p>
              {data.bestDay && (
                <p className="text-white/50 text-xs mt-2">{data.bestDay}</p>
              )}
            </div>
          )}

          {/* 알프레도 이해도 */}
          {data.understandingLevel !== undefined && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs mb-1">알프레도 이해도</p>
                  <p className="text-white font-bold">
                    {data.understandingTitle || `Lv.${Math.floor(data.understandingLevel / 20) + 1}`}
                  </p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(data.understandingLevel / 100) * 176} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    {data.understandingLevel}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 인사이트 */}
          {data.insight && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
              <p className="text-white/70 text-xs mb-2">알프레도의 한마디</p>
              <p className="text-white text-sm leading-relaxed">{data.insight}</p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 text-center">
          <p className="text-white/50 text-xs">
            #알프레도 #나의판단일지
          </p>
        </div>
      </div>
    );
  }
);

WrappedCard.displayName = 'WrappedCard';

// 변형별 스타일
function getVariantStyles(variant: string) {
  switch (variant) {
    case 'minimal':
      return {
        colorScheme: 'monochrome',
        bgGradient: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
      };
    case 'colorful':
      return {
        colorScheme: 'rainbow',
        bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      };
    default:
      return {
        colorScheme: 'purple',
        bgGradient: 'linear-gradient(135deg, #A996FF 0%, #7B68EE 50%, #6B5B95 100%)',
      };
  }
}

export default WrappedCard;
