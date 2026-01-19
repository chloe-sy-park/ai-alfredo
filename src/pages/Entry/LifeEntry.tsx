import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Compass, Sparkles, ArrowRight, Coffee, Activity, Users } from 'lucide-react';
import EntryLayout from './components/EntryLayout';
import { useAuthStore } from '../../stores/authStore';
import LoadingState from '../../components/common/LoadingState';

interface LifeStatus {
  emoji: string;
  label: string;
}

const lifeStatuses: LifeStatus[] = [
  { emoji: '🌟', label: '활기찬' },
  { emoji: '😌', label: '평온한' },
  { emoji: '💪', label: '에너지 넘치는' },
  { emoji: '🌱', label: '성장하는' },
  { emoji: '✨', label: '기대되는' }
];

interface Suggestion {
  icon: any;
  text: string;
  action: string;
}

export default function LifeEntry() {
  const navigate = useNavigate();
  const userName = useAuthStore(state => state.user?.name) || 'Boss';
  const [currentStatus, setCurrentStatus] = useState<LifeStatus>(lifeStatuses[0]);
  const [todayFocus, setTodayFocus] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제로는 API에서 데이터 가져오기
    setTimeout(() => {
      setCurrentStatus(lifeStatuses[Math.floor(Math.random() * lifeStatuses.length)]);
      setTodayFocus('오늘은 나를 위한 시간을 가져보세요');
      setSuggestions([
        { icon: Coffee, text: '10분 명상하기', action: 'meditation' },
        { icon: Activity, text: '가벼운 산책하기', action: 'walk' },
        { icon: Users, text: '친구에게 연락하기', action: 'social' }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEnter = () => {
    // Life 모드로 홈 진입
    navigate('/?mode=life');
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
      {/* Life Briefing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>Life Briefing</h2>
        </div>

        <div className="rounded-2xl p-5 shadow-card" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}>
          <p className="text-lg leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
            {userName}님, 최근 일에 집중하느라 개인 시간이 부족했어요.
          </p>
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}>
              {currentStatus.emoji} {currentStatus.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Today's Life Focus */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <Compass className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>Today's Life Focus</h2>
        </div>

        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {todayFocus}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
            작은 행동이 큰 변화를 만들어요
          </p>
        </div>
      </motion.div>

      {/* What Might Help */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-tertiary)' }}>What Might Help</h2>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <motion.div
                key={suggestion.action}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="rounded-xl p-4 transition-colors cursor-pointer"
                style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                    <Icon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{suggestion.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-3"
      >
        <button
          onClick={handleEnter}
          className="w-full py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2 group"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--surface-default)' }}
        >
          <span>Life 모드로 시작</span>
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