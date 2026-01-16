// =============================================
// 알프레도 육성 시스템 UI 컴포넌트
// =============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Home,
  Brain,
  TrendingUp,
  Calendar,
  Sparkles,
  BookOpen,
  Clock,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { useAlfredoStore } from '../../stores/alfredoStore';
import type { AlfredoLearning, WeeklyReport } from '../../services/alfredo/types';

// =============================================
// 영역 전환 컴포넌트
// =============================================

export function DomainSwitcher() {
  const { preferences, switchDomain, getStyleDescription } = useAlfredoStore();

  if (!preferences) return null;

  const { currentDomain, autoDomainSwitch } = preferences;
  const styleDesc = getStyleDescription();

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      {/* 영역 토글 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => switchDomain('work')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            currentDomain === 'work'
              ? 'bg-[#A996FF] text-white'
              : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          <Briefcase size={18} />
          <span className="font-medium">Work</span>
        </button>
        <button
          onClick={() => switchDomain('life')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
            currentDomain === 'life'
              ? 'bg-[#4ECDC4] text-white'
              : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#E5E5E5]'
          }`}
        >
          <Home size={18} />
          <span className="font-medium">Life</span>
        </button>
      </div>

      {/* 현재 스타일 설명 */}
      {styleDesc && (
        <div className="text-sm text-[#666666] space-y-1">
          <p>🗣️ {styleDesc.tone} 말할게요</p>
          <p>🔔 {styleDesc.notification} 알려드릴게요</p>
          <p>📊 {styleDesc.detail} 설명해드릴게요</p>
          <p>💪 {styleDesc.motivation} 응원할게요</p>
        </div>
      )}

      {/* 자동 전환 상태 */}
      {autoDomainSwitch && (
        <p className="text-xs text-[#999999] mt-3 pt-3 border-t border-[#E5E5E5]">
          ⏰ 근무 시간에 맞춰 자동 전환돼요
        </p>
      )}
    </div>
  );
}

// =============================================
// 이해도 카드
// =============================================

export function UnderstandingCard() {
  const { understanding, refreshUnderstanding } = useAlfredoStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!understanding) return null;

  const {
    understandingScore,
    level,
    title,
    workUnderstanding,
    lifeUnderstanding,
    daysTogether,
    totalLearnings
  } = understanding;

  async function handleRefresh() {
    setIsRefreshing(true);
    await refreshUnderstanding();
    setIsRefreshing(false);
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-[#A996FF]" />
          <h3 className="font-semibold text-[#1A1A1A]">알프레도의 이해도</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 text-[#999999] hover:text-[#666666] hover:bg-[#F5F5F5] rounded-lg disabled:opacity-50"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 메인 점수 */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          {/* 원형 프로그레스 */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#E5E5E5"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="#A996FF"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - understandingScore / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[#1A1A1A]">{understandingScore}%</span>
            <span className="text-sm text-[#A996FF]">Lv.{level}</span>
          </div>
        </div>
        <p className="text-lg font-medium text-[#1A1A1A] mt-2">{title}</p>
        <p className="text-sm text-[#999999]">
          {daysTogether}일째 함께하고 있어요
        </p>
      </div>

      {/* 영역별 이해도 */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Briefcase size={14} className="text-[#A996FF]" />
            <span className="text-xs text-[#666666]">업무</span>
          </div>
          <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#A996FF] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${workUnderstanding}%` }}
            />
          </div>
          <span className="text-xs text-[#999999]">{workUnderstanding}%</span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Home size={14} className="text-[#4ECDC4]" />
            <span className="text-xs text-[#666666]">일상</span>
          </div>
          <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#4ECDC4] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${lifeUnderstanding}%` }}
            />
          </div>
          <span className="text-xs text-[#999999]">{lifeUnderstanding}%</span>
        </div>
      </div>

      {/* 통계 */}
      <div className="flex justify-around mt-4 pt-4 border-t border-[#E5E5E5]">
        <div className="text-center">
          <p className="text-lg font-bold text-[#A996FF]">{totalLearnings}</p>
          <p className="text-xs text-[#999999]">배운 것</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-[#1A1A1A]">{daysTogether}</p>
          <p className="text-xs text-[#999999]">함께한 날</p>
        </div>
      </div>
    </div>
  );
}

// =============================================
// 학습 항목 카드
// =============================================

interface LearningCardProps {
  learning: AlfredoLearning;
  onFeedback: (learningId: string, isPositive: boolean) => void;
}

export function LearningCard({ learning, onFeedback }: LearningCardProps) {
  const typeColors = {
    preference: '#A996FF',
    pattern: '#4ECDC4',
    feedback: '#FFD43B',
    correction: '#FF6B6B',
    context: '#60A5FA'
  };

  const typeLabels = {
    preference: '선호도',
    pattern: '패턴',
    feedback: '피드백',
    correction: '교정',
    context: '맥락'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-3 shadow-sm border border-[#E5E5E5]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 text-xs rounded-full text-white"
              style={{ backgroundColor: typeColors[learning.learningType] }}
            >
              {typeLabels[learning.learningType]}
            </span>
            <span className="text-xs text-[#999999]">
              신뢰도 {learning.confidence}%
            </span>
          </div>
          <p className="text-sm text-[#1A1A1A]">{learning.summary}</p>
          {learning.originalInput && (
            <p className="text-xs text-[#999999] mt-1 italic">
              "{learning.originalInput}"
            </p>
          )}
        </div>

        {/* 피드백 버튼 */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onFeedback(learning.id, true)}
            className="p-1.5 text-[#999999] hover:text-[#4ECDC4] hover:bg-[#E8FAF8] rounded transition-colors"
          >
            <ThumbsUp size={14} />
          </button>
          <button
            onClick={() => onFeedback(learning.id, false)}
            className="p-1.5 text-[#999999] hover:text-[#FF6B6B] hover:bg-[#FEF2F2] rounded transition-colors"
          >
            <ThumbsDown size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================
// 학습 목록
// =============================================

export function LearningsList() {
  const { learnings, feedbackLearning } = useAlfredoStore();

  if (learnings.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-card text-center">
        <BookOpen size={32} className="mx-auto text-[#E5E5E5] mb-2" />
        <p className="text-sm text-[#999999]">아직 배운 것이 없어요</p>
        <p className="text-xs text-[#CCCCCC] mt-1">대화하면서 알아갈게요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
          <BookOpen size={18} className="text-[#A996FF]" />
          알프레도가 배운 것들
        </h3>
        <span className="text-xs text-[#999999]">{learnings.length}개</span>
      </div>

      <AnimatePresence>
        {learnings.slice(0, 10).map(learning => (
          <LearningCard
            key={learning.id}
            learning={learning}
            onFeedback={feedbackLearning}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// =============================================
// 주간 리포트 카드
// =============================================

interface WeeklyReportCardProps {
  report?: WeeklyReport | null;
  onGenerateReport?: () => void;
}

export function WeeklyReportCard({ report, onGenerateReport }: WeeklyReportCardProps) {
  const { understanding, generateReport } = useAlfredoStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const currentReport = report || understanding?.lastWeeklyReport;

  async function handleGenerate() {
    setIsGenerating(true);
    await (onGenerateReport || generateReport)();
    setIsGenerating(false);
  }

  return (
    <div className="bg-gradient-to-br from-[#F5F3FF] to-[#E8FAF8] rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-[#A996FF]" />
          <h3 className="font-semibold text-[#1A1A1A]">주간 성장 리포트</h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-3 py-1.5 text-xs bg-white text-[#A996FF] rounded-lg hover:bg-[#F5F5F5] disabled:opacity-50 flex items-center gap-1"
        >
          {isGenerating ? (
            <RefreshCw size={12} className="animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          새 리포트
        </button>
      </div>

      {currentReport ? (
        <>
          {/* 하이라이트 메시지 */}
          <div className="bg-white/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-[#1A1A1A]">{currentReport.highlightMessage}</p>
          </div>

          {/* 이번 주 배운 것 */}
          {currentReport.learnedItems.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-[#666666] mb-2 flex items-center gap-1">
                <TrendingUp size={14} />
                이번 주 배운 것
              </h4>
              <div className="space-y-1">
                {currentReport.learnedItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-[#A996FF]">✓</span>
                    <span className="text-[#1A1A1A]">{item.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 파악 중인 것 */}
          {currentReport.pendingItems.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-[#666666] mb-2 flex items-center gap-1">
                <Clock size={14} />
                아직 파악 중인 것
              </h4>
              <div className="space-y-2">
                {currentReport.pendingItems.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#666666]">{item.topic}</span>
                      <span className="text-xs text-[#999999]">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#A996FF]/50 rounded-full transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#999999] mt-0.5">{item.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 리포트 기간 */}
          <p className="text-xs text-[#999999] mt-4 pt-3 border-t border-white/30">
            {currentReport.weekStart} ~ {currentReport.weekEnd}
          </p>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-[#666666]">아직 리포트가 없어요</p>
          <p className="text-xs text-[#999999] mt-1">버튼을 눌러 생성해보세요</p>
        </div>
      )}
    </div>
  );
}

// =============================================
// 파악 중인 것 목록
// =============================================

export function PendingLearningsList() {
  const { understanding } = useAlfredoStore();

  if (!understanding || understanding.pendingLearnings.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <h3 className="font-semibold text-[#1A1A1A] flex items-center gap-2 mb-3">
        <Clock size={18} className="text-[#FFD43B]" />
        아직 파악 중인 것
      </h3>

      <div className="space-y-3">
        {understanding.pendingLearnings.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-[#1A1A1A]">{item.topic}</span>
              <span className="text-xs text-[#999999]">{item.progress}%</span>
            </div>
            <div className="h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#FFD43B] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="text-xs text-[#999999] mt-1">{item.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
