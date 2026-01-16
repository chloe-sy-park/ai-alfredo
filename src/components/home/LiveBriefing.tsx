// Live Briefing Component
// 지금 이 순간의 나를 알프레도가 어떻게 보고 있는지 요약
// Phase 6: 4개 Core Blocks - Understanding, Now Judgment, Improvement Forecast, Open Door

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Brain, Sparkles } from 'lucide-react';
import { useLiveBriefingStore } from '../../stores/liveBriefingStore';
import { useAlfredoStore } from '../../stores/alfredoStore';
import { useBriefingEvolutionStore } from '../../stores/briefingEvolutionStore';
import { STATUS_TAGS, LiveBriefingStatus } from '../../constants/liveBriefing';

interface LiveBriefingProps {
  className?: string;
  onMore?: () => void;
}

// Improvement Forecast 생성 (상태 기반 제안)
function generateImprovementForecast(status: LiveBriefingStatus): string | null {
  switch (status) {
    case 'focused':
      return '이 집중력을 30분 더 유지하면 핵심 작업을 끝낼 수 있어요';
    case 'nearOverload':
      return '지금 5분만 쉬면 오후 생산성이 20% 올라가요';
    case 'needsAdjust':
      return '다음 미팅 전 한 가지만 정리하면 여유가 생겨요';
    case 'recovery':
      return '내일 아침에 시작하면 더 좋은 결과가 나와요';
    case 'stable':
      return '지금 페이스 유지하면 오늘 목표를 달성할 수 있어요';
    default:
      return null;
  }
}

export default function LiveBriefing({ className = '', onMore }: LiveBriefingProps) {
  var { briefing, getTimeSinceUpdate, startAutoRefresh, stopAutoRefresh } = useLiveBriefingStore();
  var { understanding } = useAlfredoStore();
  var { updateDensityFromUnderstanding, getEffectiveDensity } = useBriefingEvolutionStore();
  var [isExpanded, setIsExpanded] = useState(false);
  var [isAnimating, setIsAnimating] = useState(false);
  var [displayedSentence, setDisplayedSentence] = useState(briefing.sentence);
  var [displayedStatus, setDisplayedStatus] = useState(briefing.status);
  var prevSentenceRef = useRef(briefing.sentence);

  // Phase 6: 이해도 변경 시 밀도 자동 조절
  useEffect(function() {
    if (understanding?.understandingScore !== undefined) {
      updateDensityFromUnderstanding(understanding.understandingScore);
    }
  }, [understanding?.understandingScore, updateDensityFromUnderstanding]);

  // 현재 밀도
  var density = getEffectiveDensity();

  // Improvement Forecast (밀도가 minimal이면 생략)
  var forecast = density !== 'minimal' ? generateImprovementForecast(displayedStatus) : null;

  // 자동 갱신 시작/정지
  useEffect(function() {
    startAutoRefresh();
    return function() {
      stopAutoRefresh();
    };
  }, [startAutoRefresh, stopAutoRefresh]);

  // 문장 변경 시 페이드 애니메이션 (200-300ms)
  useEffect(function() {
    if (prevSentenceRef.current !== briefing.sentence) {
      setIsAnimating(true);

      // 페이드 아웃 후 내용 변경
      var fadeOutTimer = setTimeout(function() {
        setDisplayedSentence(briefing.sentence);
        setDisplayedStatus(briefing.status);
      }, 150);

      // 페이드 인
      var fadeInTimer = setTimeout(function() {
        setIsAnimating(false);
      }, 300);

      prevSentenceRef.current = briefing.sentence;

      return function() {
        clearTimeout(fadeOutTimer);
        clearTimeout(fadeInTimer);
      };
    }
  }, [briefing.sentence, briefing.status]);

  var statusConfig = STATUS_TAGS[displayedStatus];
  var timeSinceUpdate = getTimeSinceUpdate();

  return (
    <div className={'bg-white rounded-2xl p-4 shadow-sm border border-[#E5E5E5] ' + className}>
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        {/* 펭귄 아바타 */}
        <div className="w-12 h-12 bg-[#F0F0FF] rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🐧</span>
        </div>

        {/* 브리핑 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-[#A996FF]">Live Briefing</span>
            <StatusTag status={displayedStatus} config={statusConfig} />
          </div>

          {/* 브리핑 문장 - 페이드 애니메이션 */}
          <p
            className={
              'text-[#1A1A1A] font-medium leading-snug transition-opacity duration-200 ' +
              (isAnimating ? 'opacity-0' : 'opacity-100')
            }
          >
            {displayedSentence}
          </p>

          {/* 확장 시 추가 정보 - Phase 6 Core Blocks (밀도에 따라 조절) */}
          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* Block 1: Understanding - 알프레도가 나를 이렇게 보고 있다 */}
              {understanding && (
                <div className="flex items-center gap-2 p-2 bg-[#F8F8FF] rounded-lg">
                  <Brain size={14} className="text-[#A996FF]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#666666]">알프레도 이해도</span>
                      <span className="text-xs font-medium text-[#A996FF]">
                        {understanding.title} ({understanding.understandingScore}%)
                      </span>
                    </div>
                    {/* minimal 밀도면 진행바 숨김 (이미 잘 알고 있으니) */}
                    {density !== 'minimal' && (
                      <div className="h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-[#A996FF] rounded-full transition-all duration-500"
                          style={{ width: understanding.understandingScore + '%' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Block 2: Status Description - detailed 밀도일 때만 표시 */}
              {density !== 'minimal' && (
                <p className="text-sm text-[#666666]">
                  {statusConfig.description}
                </p>
              )}

              {/* Block 3: Improvement Forecast - 이렇게 하면 나아진다 (minimal이면 이미 null) */}
              {forecast && (
                <div className="flex items-start gap-2 p-2 bg-[#FFFBEB] rounded-lg">
                  <Sparkles size={14} className="text-[#F59E0B] mt-0.5" />
                  <p className="text-xs text-[#92400E]">{forecast}</p>
                </div>
              )}

              {/* 밀도 레벨 표시 (디버그/개발용, 추후 제거 가능) */}
              {density === 'minimal' && (
                <p className="text-[10px] text-[#BBBBBB] text-center">
                  💜 알프레도가 이제 간결하게 전달해요
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단: 토글 + 갱신 시간 */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F0F0F0]">
        <button
          onClick={function() { setIsExpanded(!isExpanded); }}
          className="flex items-center gap-1 text-xs text-[#999999] hover:text-[#666666]"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={14} />
              접기
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              자세히
            </>
          )}
        </button>

        <div className="flex items-center gap-3">
          {/* 갱신 시간 (작게) */}
          <span className="text-xs text-[#BBBBBB]">{timeSinceUpdate}</span>

          {onMore && (
            <button
              onClick={onMore}
              className="text-xs text-[#A996FF] hover:text-[#8B7BE8]"
            >
              판단 근거
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 상태 태그 컴포넌트 (최대 1개만 노출, 파스텔/저채도 색상)
interface StatusTagProps {
  status: LiveBriefingStatus;
  config: typeof STATUS_TAGS[LiveBriefingStatus];
}

function StatusTag({ config }: StatusTagProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors duration-200"
      style={{
        backgroundColor: config.color,
        color: config.textColor,
      }}
      role="status"
      aria-label={'현재 상태: ' + config.label}
    >
      {config.label}
    </span>
  );
}

// 컴팩트 버전 (헤더나 작은 공간용)
export function LiveBriefingCompact({ className = '' }: { className?: string }) {
  var { briefing, getTimeSinceUpdate } = useLiveBriefingStore();
  var statusConfig = STATUS_TAGS[briefing.status];
  var timeSinceUpdate = getTimeSinceUpdate();

  return (
    <div className={'flex items-center gap-2 ' + className}>
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
        style={{
          backgroundColor: statusConfig.color,
          color: statusConfig.textColor,
        }}
      >
        {statusConfig.label}
      </span>
      <span className="text-xs text-gray-500 truncate max-w-[180px]">
        {briefing.sentence}
      </span>
      <span className="text-[10px] text-gray-400 flex-shrink-0">{timeSinceUpdate}</span>
    </div>
  );
}

// 미니 상태 태그만 표시 (아주 작은 공간용)
export function LiveBriefingMini() {
  var { briefing } = useLiveBriefingStore();
  var statusConfig = STATUS_TAGS[briefing.status];

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{
        backgroundColor: statusConfig.color,
        color: statusConfig.textColor,
      }}
      title={briefing.sentence}
    >
      {statusConfig.label}
    </span>
  );
}
