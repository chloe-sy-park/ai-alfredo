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
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      {/* 영역 토글 */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => switchDomain('work')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
          style={currentDomain === 'work'
            ? { backgroundColor: 'var(--os-work)', color: 'var(--accent-on)' }
            : { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }
          }
        >
          <Briefcase size={18} />
          <span className="font-medium">Work</span>
        </button>
        <button
          onClick={() => switchDomain('life')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all"
          style={currentDomain === 'life'
            ? { backgroundColor: 'var(--os-life)', color: 'var(--accent-on)' }
            : { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }
          }
        >
          <Home size={18} />
          <span className="font-medium">Life</span>
        </button>
      </div>

      {/* 현재 스타일 설명 */}
      {styleDesc && (
        <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <p>🗣️ {styleDesc.tone} 말할게요</p>
          <p>🔔 {styleDesc.notification} 알려드릴게요</p>
          <p>📊 {styleDesc.detail} 설명해드릴게요</p>
          <p>💪 {styleDesc.motivation} 응원할게요</p>
        </div>
      )}

      {/* 자동 전환 상태 */}
      {autoDomainSwitch && (
        <p className="text-xs mt-3 pt-3" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-default)' }}>
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
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} style={{ color: 'var(--os-work)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>알프레도의 이해도</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="이해도 새로고침"
          className="p-2 rounded-lg disabled:opacity-50 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
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
              stroke="var(--border-default)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="var(--os-work)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - understandingScore / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{understandingScore}%</span>
            <span className="text-sm" style={{ color: 'var(--os-work)' }}>Lv.{level}</span>
          </div>
        </div>
        <p className="text-lg font-medium mt-2" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          {daysTogether}일째 함께하고 있어요
        </p>
      </div>

      {/* 영역별 이해도 */}
      <div className="grid grid-cols-2 gap-3 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Briefcase size={14} style={{ color: 'var(--os-work)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>업무</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-default)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--os-work)' }}
              initial={{ width: 0 }}
              animate={{ width: `${workUnderstanding}%` }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{workUnderstanding}%</span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Home size={14} style={{ color: 'var(--os-life)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>일상</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-default)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: 'var(--os-life)' }}
              initial={{ width: 0 }}
              animate={{ width: `${lifeUnderstanding}%` }}
            />
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{lifeUnderstanding}%</span>
        </div>
      </div>

      {/* 통계 */}
      <div className="flex justify-around mt-4 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: 'var(--os-work)' }}>{totalLearnings}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>배운 것</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{daysTogether}</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>함께한 날</p>
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
  const typeColors: Record<string, string> = {
    preference: 'var(--os-work)',
    pattern: 'var(--os-life)',
    feedback: 'var(--state-warning)',
    correction: 'var(--state-danger)',
    context: 'var(--state-info)'
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
      className="rounded-lg p-3 shadow-sm"
      style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{ backgroundColor: typeColors[learning.learningType], color: 'var(--accent-on)' }}
            >
              {typeLabels[learning.learningType]}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              신뢰도 {learning.confidence}%
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{learning.summary}</p>
          {learning.originalInput && (
            <p className="text-xs mt-1 italic" style={{ color: 'var(--text-tertiary)' }}>
              "{learning.originalInput}"
            </p>
          )}
        </div>

        {/* 피드백 버튼 */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => onFeedback(learning.id, true)}
            aria-label="도움됨"
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ThumbsUp size={14} />
          </button>
          <button
            onClick={() => onFeedback(learning.id, false)}
            aria-label="도움안됨"
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <ThumbsDown size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =============================================
// 학습 목록 (카테고리 필터 포함)
// =============================================

type LearningType = 'all' | 'preference' | 'pattern' | 'feedback' | 'correction' | 'context';

const LEARNING_TYPE_LABELS: Record<LearningType, string> = {
  all: '전체',
  preference: '선호도',
  pattern: '패턴',
  feedback: '피드백',
  correction: '교정',
  context: '맥락'
};

export function LearningsList() {
  const { learnings, feedbackLearning } = useAlfredoStore();
  const [selectedType, setSelectedType] = useState<LearningType>('all');

  const filteredLearnings = selectedType === 'all'
    ? learnings
    : learnings.filter(l => l.learningType === selectedType);

  if (learnings.length === 0) {
    return (
      <div className="rounded-xl p-6 shadow-card text-center" style={{ backgroundColor: 'var(--surface-default)' }}>
        <BookOpen size={32} className="mx-auto mb-2" style={{ color: 'var(--border-default)' }} />
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>아직 배운 것이 없어요</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}>대화하면서 알아갈게요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BookOpen size={18} style={{ color: 'var(--os-work)' }} />
          알프레도가 배운 것들
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{learnings.length}개</span>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1">
        {(Object.keys(LEARNING_TYPE_LABELS) as LearningType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className="px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
            style={selectedType === type
              ? { backgroundColor: 'var(--os-work)', color: 'var(--accent-on)' }
              : { backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }
            }
          >
            {LEARNING_TYPE_LABELS[type]}
            {type !== 'all' && (
              <span className="ml-1 opacity-70">
                ({learnings.filter(l => l.learningType === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {filteredLearnings.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              이 카테고리의 학습 내용이 없어요
            </p>
          </div>
        ) : (
          filteredLearnings.slice(0, 10).map(learning => (
            <LearningCard
              key={learning.id}
              learning={learning}
              onFeedback={feedbackLearning}
            />
          ))
        )}
      </AnimatePresence>

      {filteredLearnings.length > 10 && (
        <p className="text-xs text-center pt-2" style={{ color: 'var(--text-tertiary)' }}>
          +{filteredLearnings.length - 10}개 더 있어요
        </p>
      )}
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
    <div className="rounded-xl p-4 shadow-card" style={{ background: 'linear-gradient(to bottom right, rgba(169, 150, 255, 0.1), rgba(78, 205, 196, 0.1))' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} style={{ color: 'var(--os-work)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>주간 성장 리포트</h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          aria-label="새 리포트 생성"
          className="px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 flex items-center gap-1 transition-colors"
          style={{ backgroundColor: 'var(--surface-default)', color: 'var(--os-work)' }}
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
          <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{currentReport.highlightMessage}</p>
          </div>

          {/* 이번 주 배운 것 */}
          {currentReport.learnedItems.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <TrendingUp size={14} />
                이번 주 배운 것
              </h4>
              <div className="space-y-1">
                {currentReport.learnedItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span style={{ color: 'var(--os-work)' }}>✓</span>
                    <span style={{ color: 'var(--text-primary)' }}>{item.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 파악 중인 것 */}
          {currentReport.pendingItems.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <Clock size={14} />
                아직 파악 중인 것
              </h4>
              <div className="space-y-2">
                {currentReport.pendingItems.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>{item.topic}</span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.progress}%`, backgroundColor: 'rgba(169, 150, 255, 0.5)' }}
                      />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 리포트 기간 */}
          <p className="text-xs mt-4 pt-3" style={{ color: 'var(--text-tertiary)', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
            {currentReport.weekStart} ~ {currentReport.weekEnd}
          </p>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>아직 리포트가 없어요</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>버튼을 눌러 생성해보세요</p>
        </div>
      )}
    </div>
  );
}

// =============================================
// 미니 이해도 위젯 (Home 페이지용)
// =============================================

export function MiniUnderstandingWidget() {
  const { understanding, preferences } = useAlfredoStore();

  if (!understanding) return null;

  const { understandingScore, level, title, daysTogether } = understanding;
  const currentDomain = preferences?.currentDomain || 'work';
  const domainColor = currentDomain === 'work' ? 'var(--os-work)' : 'var(--os-life)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 shadow-card"
      style={{ backgroundColor: 'var(--surface-default)', borderLeft: `4px solid ${domainColor}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 작은 원형 프로그레스 */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="var(--border-default)"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke={domainColor}
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - understandingScore / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{understandingScore}%</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Lv.{level} · {daysTogether}일째 함께
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-subtle)' }}>
          {currentDomain === 'work' ? (
            <Briefcase size={12} style={{ color: 'var(--os-work)' }} />
          ) : (
            <Home size={12} style={{ color: 'var(--os-life)' }} />
          )}
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {currentDomain === 'work' ? 'Work' : 'Life'}
          </span>
        </div>
      </div>
    </motion.div>
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
    <div className="rounded-xl p-4 shadow-card" style={{ backgroundColor: 'var(--surface-default)' }}>
      <h3 className="font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}>
        <Clock size={18} style={{ color: 'var(--state-warning)' }} />
        아직 파악 중인 것
      </h3>

      <div className="space-y-3">
        {understanding.pendingLearnings.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-primary)' }}>{item.topic}</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{item.progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-default)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--state-warning)' }}
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{item.hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
