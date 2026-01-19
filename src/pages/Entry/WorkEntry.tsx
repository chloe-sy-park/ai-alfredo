import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Target, Layers, ArrowRight } from 'lucide-react';
import EntryLayout from './components/EntryLayout';
import { useAuthStore } from '../../stores/authStore';
import LoadingState from '../../components/common/LoadingState';

interface WorkStatus {
  emoji: string;
  label: string;
}

const workStatuses: WorkStatus[] = [
  { emoji: '🚀', label: '집중 모드' },
  { emoji: '🎯', label: '목표 달성' },
  { emoji: '🔥', label: '바쁜 하루' },
  { emoji: '💪', label: '도전적인' },
  { emoji: '⚡', label: '생산적인' }
];

export default function WorkEntry() {
  const navigate = useNavigate();
  const userName = useAuthStore(state => state.user?.name) || 'Boss';
  const [currentStatus, setCurrentStatus] = useState<WorkStatus>(workStatuses[0]);
  const [todayFocus, setTodayFocus] = useState('');
  const [plateCount, setPlateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제로는 API에서 데이터 가져오기
    setTimeout(() => {
      setCurrentStatus(workStatuses[Math.floor(Math.random() * workStatuses.length)]);
      setTodayFocus('Q4 프로젝트 제안서 마무리');
      setPlateCount(7);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEnter = () => {
    // Work 모드로 홈 진입
    navigate('/?mode=work');
  };

  const handleNotNow = () => {
    // 나중에 결정
    navigate('/');
  };

  if (isLoading) {
    return (
      <EntryLayout>
        <LoadingState variant="spinner" message="알프레도가 준비 중..." />
      </EntryLayout>
    );
  }

  return (
    <EntryLayout>
      {/* Work Briefing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Briefcase className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>Work Briefing</h2>
        </div>

        <div className="rounded-2xl p-5 shadow-card" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}>
          <p className="text-lg leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
            {userName}님, 오늘은 중요한 마감이 2개 있어요.
          </p>
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
              {currentStatus.emoji} {currentStatus.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Today's Work Focus */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>Today's Work Focus</h2>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {todayFocus}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            오후 2-4시가 집중하기 좋은 시간이에요
          </p>
        </div>
      </motion.div>

      {/* On Your Plate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-3">
          <Layers className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>On Your Plate</h2>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--surface-subtle)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{plateCount}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>할 일이 있어요</p>
            </div>
            <div className="text-5xl opacity-10">📋</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <button
          onClick={handleEnter}
          className="w-full py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2 group"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--surface-default)' }}
        >
          <span>Work 모드로 시작</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={handleNotNow}
          className="w-full py-4 font-medium transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          나중에 결정할게요
        </button>
      </motion.div>
    </EntryLayout>
  );
}