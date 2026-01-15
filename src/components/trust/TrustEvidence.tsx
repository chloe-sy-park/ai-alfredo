/**
 * Trust Evidence UI 컴포넌트
 * 신뢰가 쌓이는 증거를 보여주는 UI
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, Target, Flame, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import {
  TrustEvidence as TrustEvidenceType,
  TrustLevelInfo,
  Milestone,
  TrustSummary
} from '../../services/trust/types';
import {
  loadTrustEvidence,
  calculateTrustLevel,
  formatDaysTogether,
  getAchievedMilestones,
  getUncelebratedMilestones,
  celebrateMilestone,
  generateWeeklySummary,
  calculateTrustScore
} from '../../services/trust';

/**
 * 신뢰 배지 (간단한 표시)
 */
interface TrustBadgeProps {
  compact?: boolean;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ compact = false }) => {
  const [evidence, setEvidence] = useState<TrustEvidenceType | null>(null);
  const [level, setLevel] = useState<TrustLevelInfo | null>(null);

  useEffect(() => {
    const e = loadTrustEvidence();
    setEvidence(e);
    setLevel(calculateTrustLevel(e));
  }, []);

  if (!evidence || !level) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
        <Calendar className="w-4 h-4" />
        <span>{formatDaysTogether(evidence.accumulated.daysUsed)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
        <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{level.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatDaysTogether(evidence.accumulated.daysUsed)}
        </p>
      </div>
    </div>
  );
};

/**
 * 신뢰 점수 카드
 */
export const TrustScoreCard: React.FC = () => {
  const [evidence, setEvidence] = useState<TrustEvidenceType | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState<TrustLevelInfo | null>(null);

  useEffect(() => {
    const e = loadTrustEvidence();
    setEvidence(e);
    setScore(calculateTrustScore(e));
    setLevel(calculateTrustLevel(e));
  }, []);

  if (!evidence || !level) return null;

  const acceptancePercent = Math.round(evidence.accuracy.suggestionAcceptance * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">알프레도와의 신뢰</h3>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
          {level.name}
        </span>
      </div>

      {/* 점수 원형 */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-100 dark:text-gray-700"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={251.2}
              initial={{ strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-blue-500"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
          </div>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evidence.accumulated.daysUsed}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">함께한 일</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {acceptancePercent}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">제안 수락률</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {evidence.accumulated.currentStreak}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">연속 사용</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.floor(evidence.accumulated.focusMinutes / 60)}h
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">집중 시간</p>
        </div>
      </div>

      {/* 레벨 설명 */}
      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        {level.description}
      </p>
    </div>
  );
};

/**
 * 마일스톤 목록
 */
interface MilestoneListProps {
  showAll?: boolean;
  maxItems?: number;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  showAll = false,
  maxItems = 6
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const achieved = getAchievedMilestones();
    setMilestones(showAll ? achieved : achieved.slice(0, maxItems));
  }, [showAll, maxItems]);

  if (milestones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">아직 마일스톤이 없어요</p>
        <p className="text-xs">함께 사용하면서 달성해봐요!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {milestones.map((milestone) => (
        <motion.div
          key={milestone.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <span className="text-2xl mb-1">{milestone.icon}</span>
          <p className="text-xs font-medium text-gray-900 dark:text-white text-center">
            {milestone.title}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * 마일스톤 축하 팝업
 */
interface MilestoneCelebrationProps {
  onClose?: () => void;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ onClose }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const uncelebrated = getUncelebratedMilestones();
    setMilestones(uncelebrated);
  }, []);

  const handleCelebrate = () => {
    if (milestones[currentIndex]) {
      celebrateMilestone(milestones[currentIndex].id);

      if (currentIndex < milestones.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose?.();
      }
    }
  };

  if (milestones.length === 0) return null;

  const current = milestones[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-6xl block mb-4"
        >
          {current.icon}
        </motion.span>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {current.title}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {current.description}
        </p>

        <button
          onClick={handleCelebrate}
          className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium"
        >
          {currentIndex < milestones.length - 1 ? '다음' : '좋아요!'}
        </button>

        {milestones.length > 1 && (
          <p className="mt-3 text-xs text-gray-400">
            {currentIndex + 1} / {milestones.length}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * 주간 요약 카드
 */
export const WeeklySummaryCard: React.FC = () => {
  const [summary, setSummary] = useState<TrustSummary | null>(null);

  useEffect(() => {
    setSummary(generateWeeklySummary());
  }, []);

  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
      <h3 className="font-medium text-gray-900 dark:text-white mb-3">이번 주 함께한 시간</h3>

      {/* 통계 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {summary.stats.daysActive}
          </p>
          <p className="text-xs text-gray-500">일</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {summary.stats.suggestionsAccepted}
          </p>
          <p className="text-xs text-gray-500">수락</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.floor(summary.stats.focusMinutes / 60)}h
          </p>
          <p className="text-xs text-gray-500">집중</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {summary.stats.tasksCompleted}
          </p>
          <p className="text-xs text-gray-500">완료</p>
        </div>
      </div>

      {/* 하이라이트 */}
      {summary.highlights.length > 0 && (
        <div className="space-y-1 mb-3">
          {summary.highlights.slice(0, 2).map((highlight, index) => (
            <p key={index} className="text-sm text-gray-600 dark:text-gray-300">
              ✨ {highlight}
            </p>
          ))}
        </div>
      )}

      {/* 메시지 */}
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        "{summary.message}"
      </p>
    </div>
  );
};

/**
 * 간단한 신뢰 지표 (홈 화면용)
 */
export const TrustIndicator: React.FC = () => {
  const [evidence, setEvidence] = useState<TrustEvidenceType | null>(null);

  useEffect(() => {
    setEvidence(loadTrustEvidence());
  }, []);

  if (!evidence) return null;

  const acceptancePercent = Math.round(evidence.accuracy.suggestionAcceptance * 100);

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        <span>{evidence.accumulated.daysUsed}일</span>
      </div>
      <div className="flex items-center gap-1">
        <TrendingUp className="w-4 h-4" />
        <span>{acceptancePercent}%</span>
      </div>
      {evidence.accumulated.currentStreak >= 3 && (
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="w-4 h-4" />
          <span>{evidence.accumulated.currentStreak}일</span>
        </div>
      )}
    </div>
  );
};

export default TrustScoreCard;
