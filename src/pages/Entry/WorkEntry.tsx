import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Target, Layers, ArrowRight } from 'lucide-react';
import EntryLayout from './components/EntryLayout';
import { useAuthStore } from '../../stores/authStore';

interface WorkStatus {
  emoji: string;
  label: string;
  color: string;
}

const workStatuses: WorkStatus[] = [
  { emoji: '🚀', label: '집중 모드', color: 'bg-blue-100' },
  { emoji: '🎯', label: '목표 달성', color: 'bg-green-100' },
  { emoji: '🔥', label: '바쁜 하루', color: 'bg-orange-100' },
  { emoji: '💪', label: '도전적인', color: 'bg-purple-100' },
  { emoji: '⚡', label: '생산적인', color: 'bg-yellow-100' }
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-400">알프레도가 준비 중...</div>
        </div>
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
          <Briefcase className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-600">Work Briefing</h2>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-lg text-gray-800 leading-relaxed mb-3">
            {userName}님, 오늘은 중요한 마감이 2개 있어요.
          </p>
          <div className="inline-flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
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
          <Target className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-600">Today's Work Focus</h2>
        </div>
        
        <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
          <p className="text-lg font-medium text-gray-800">
            {todayFocus}
          </p>
          <p className="text-sm text-gray-600 mt-2">
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
          <Layers className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-semibold text-gray-600">On Your Plate</h2>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-800">{plateCount}</p>
              <p className="text-sm text-gray-600">할 일이 있어요</p>
            </div>
            <div className="text-5xl opacity-20">📋</div>
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
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
        >
          <span>Work 모드로 시작</span>
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