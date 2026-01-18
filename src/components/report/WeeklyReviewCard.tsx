/**
 * WeeklyReviewCard.tsx
 * 주간 리뷰 요약 카드 (홈 화면용)
 */

import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWeeklyReviewStore, WeeklyReviewData } from '../../services/weeklyReview';
import { useEffect } from 'react';

interface WeeklyReviewCardProps {
  compact?: boolean;
}

export function WeeklyReviewCard({ compact = false }: WeeklyReviewCardProps) {
  const navigate = useNavigate();
  const { getLatestReview, hasUnreadReview, markAsRead, generateWeeklyReview } =
    useWeeklyReviewStore();

  // 주간 리뷰 자동 생성 체크
  useEffect(() => {
    const review = getLatestReview();
    if (!review) {
      // 첫 리뷰 생성
      generateWeeklyReview();
    }
  }, [getLatestReview, generateWeeklyReview]);

  const review = getLatestReview();

  if (!review) {
    return null;
  }

  const weekStartDate = new Date(review.weekStart);
  const weekEndDate = new Date(review.weekEnd);
  const dateRange = `${weekStartDate.getMonth() + 1}/${weekStartDate.getDate()} - ${weekEndDate.getMonth() + 1}/${weekEndDate.getDate()}`;

  const handleClick = () => {
    markAsRead();
    navigate('/report');
  };

  if (compact) {
    return (
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="w-full flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 rounded-xl shadow-sm relative"
      >
        {hasUnreadReview && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
        )}
        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            주간 리뷰
          </p>
          <p className="text-xs text-neutral-500">{dateRange}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-purple-600">
            {review.taskStats.completionRate}%
          </p>
          <p className="text-xs text-neutral-400">완료율</p>
        </div>
        <ChevronRight size={16} className="text-neutral-400" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm relative"
    >
      {hasUnreadReview && (
        <span className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-purple-600" />
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            주간 리뷰
          </h3>
        </div>
        <span className="text-xs text-neutral-500">{dateRange}</span>
      </div>

      {/* 통계 그리드 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <CheckCircle2 size={16} className="mx-auto mb-1 text-purple-600" />
          <p className="text-lg font-bold text-purple-600">
            {review.taskStats.completed}
          </p>
          <p className="text-xs text-neutral-500">완료</p>
        </div>
        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Trophy size={16} className="mx-auto mb-1 text-yellow-600" />
          <p className="text-lg font-bold text-yellow-600">
            {review.achievementStats.unlockedThisWeek.length}
          </p>
          <p className="text-xs text-neutral-500">업적</p>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <TrendingUp size={16} className="mx-auto mb-1 text-green-600" />
          <p className="text-lg font-bold text-green-600">
            {review.gamificationStats.streakDays}일
          </p>
          <p className="text-xs text-neutral-500">연속</p>
        </div>
      </div>

      {/* 인사이트 */}
      <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg mb-3">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {review.insight}
        </p>
      </div>

      {/* 격려 메시지 */}
      <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
        {review.encouragement}
      </p>

      {/* 자세히 보기 버튼 */}
      <button
        onClick={handleClick}
        className="w-full py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
      >
        자세히 보기
      </button>
    </motion.div>
  );
}

export default WeeklyReviewCard;
