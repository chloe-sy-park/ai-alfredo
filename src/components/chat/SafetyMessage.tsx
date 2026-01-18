/**
 * SafetyMessage 컴포넌트
 * 위기 상황 감지 시 표시되는 안전 메시지 및 전문 상담 기관 안내
 */

import { Phone, ExternalLink, Heart, AlertTriangle, Shield } from 'lucide-react';
import { SafetyLevel, CrisisResource } from '../../services/safety';

interface SafetyMessageProps {
  level: SafetyLevel;
  message: string;
  resources?: CrisisResource[];
  onDismiss?: () => void;
  showDismiss?: boolean;
}

/**
 * 위기 상황 전문 상담 기관 카드
 */
function CrisisResourceCard({ resource }: { resource: CrisisResource }) {
  const handleCall = () => {
    window.location.href = `tel:${resource.number}`;
  };

  return (
    <button
      onClick={handleCall}
      className="w-full bg-white rounded-xl p-4 border border-red-200
        hover:border-red-400 hover:shadow-md transition-all text-left
        active:scale-98"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Phone size={16} className="text-red-600" />
            <span className="font-bold text-lg text-red-600">{resource.number}</span>
          </div>
          <p className="text-sm font-medium text-neutral-800 mt-1">{resource.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{resource.available}</p>
          {resource.description && (
            <p className="text-xs text-neutral-400 mt-1">{resource.description}</p>
          )}
        </div>
        <div className="ml-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Phone size={18} className="text-red-600" />
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * 안전 메시지 헤더 (레벨별)
 */
function SafetyHeader({ level }: { level: SafetyLevel }) {
  if (level === 'crisis') {
    return (
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle size={18} className="text-red-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-red-700">도움이 필요하신가요?</p>
          <p className="text-xs text-red-600">전문 상담 기관에서 도움받으실 수 있어요</p>
        </div>
      </div>
    );
  }

  if (level === 'care') {
    return (
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <Heart size={18} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-700">알프레도가 걱정돼요</p>
          <p className="text-xs text-amber-600">요즘 많이 힘드신 것 같아요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <Shield size={18} className="text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-blue-700">알프레도가 함께해요</p>
      </div>
    </div>
  );
}

/**
 * 메인 SafetyMessage 컴포넌트
 */
export default function SafetyMessage({
  level,
  message,
  resources,
  onDismiss,
  showDismiss = false
}: SafetyMessageProps) {
  // 레벨별 스타일
  const containerStyles = {
    crisis: 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300',
    care: 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300',
    watch: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300',
    normal: 'bg-neutral-50 border-neutral-200'
  };

  return (
    <div className="animate-slide-up">
      <div className={`rounded-2xl border-2 p-4 ${containerStyles[level]}`}>
        {/* 헤더 */}
        <SafetyHeader level={level} />

        {/* 알프레도 메시지 */}
        <div className="bg-white/80 rounded-xl p-4 mb-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
              <img
                src="/assets/alfredo/avatar/alfredo-avatar-32.png"
                alt="알프레도"
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-xl">🎩</span>'; }}
              />
            </div>
            <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* 위기 상담 기관 목록 (crisis 레벨일 때만) */}
        {level === 'crisis' && resources && resources.length > 0 && (
          <div className="space-y-2 mb-3">
            <p className="text-xs font-medium text-red-700 px-1">
              24시간 전문 상담 연결
            </p>
            {resources.map((resource, index) => (
              <CrisisResourceCard key={index} resource={resource} />
            ))}
          </div>
        )}

        {/* 케어 레벨 추가 안내 */}
        {level === 'care' && (
          <div className="bg-white/60 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-700">
              💜 힘들 때 전문가와 이야기하는 것도 좋은 방법이에요.
            </p>
            <button
              onClick={() => window.open('tel:1577-0199')}
              className="mt-2 text-xs text-amber-600 underline flex items-center gap-1"
            >
              <Phone size={12} />
              정신건강 상담전화 1577-0199
              <ExternalLink size={10} />
            </button>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-neutral-500">
            저는 AI이며 전문 상담사가 아니에요. 전문 도움이 필요하시면 위 기관에 연락해주세요.
          </p>

          {showDismiss && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-neutral-500 hover:text-neutral-700 px-2 py-1"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 간단한 안전 배너 (Watch 레벨용)
 */
export function SafetyBanner({ message }: { message: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 animate-fade-in">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 flex-shrink-0 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-subtle)' }}>
          <img
            src="/assets/alfredo/avatar/alfredo-avatar-24.png"
            alt="알프레도"
            className="w-full h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-lg">🎩</span>'; }}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-blue-800">{message}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 경계 주제 안내 메시지
 */
export function BoundaryMessage({
  message,
  redirectTo
}: {
  message: string;
  redirectTo?: string;
}) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 animate-fade-in">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-neutral-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-neutral-700 mb-2">{message}</p>
          {redirectTo && (
            <p className="text-xs text-neutral-500">
              👉 이 부분은 <span className="font-medium">{redirectTo}</span>와 상담해보세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
