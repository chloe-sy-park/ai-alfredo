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
  color: string;
}

const lifeStatuses: LifeStatus[] = [
  { emoji: '🌟', label: '활기찬', color: 'bg-yellow-100' },
  { emoji: '😌', label: '평온한', color: 'bg-blue-100' },
  { emoji: '💪', label: '에너지 넘치는', color: 'bg-orange-100' },
  { emoji: '🌱', label: '성장하는', color: 'bg-green-100' },
  { emoji: '✨', label: '기대되는', color: 'bg-purple-100' }
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
          <Heart className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-600">Life Briefing</h2>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-lg text-gray-800 leading-relaxed mb-3">
            {userName}님, 최근 일에 집중하느라 개인 시간이 부족했어요.
          </p>
          <div className="inline-flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
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
          <Compass className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-600">Today's Life Focus</h2>
        </div>
        
        <div className="bg-pink-50 rounded-2xl p-5 border border-pink-100">
          <p className="text-lg font-medium text-gray-800">
            {todayFocus}
          </p>
          <p className="text-sm text-gray-600 mt-2">
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
          <Sparkles className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-600">What Might Help</h2>
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
                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-primary-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-gray-700">{suggestion.text}</p>
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
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
        >
          <span>Life 모드로 시작</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button
          onClick={handleNotNow}
          className="w-full py-4 text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          나중에 결정할게요
        </button>
      </motion.div>
    </EntryLayout>
  );
}