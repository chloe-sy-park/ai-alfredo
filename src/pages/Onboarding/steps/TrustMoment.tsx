import { motion } from 'framer-motion';
import { TrendingUp, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TrustMomentProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function TrustMoment({ onNext }: TrustMomentProps) {
  const [progress, setProgress] = useState(0);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 0에서 5까지 애니메이션
    const timer = setTimeout(() => {
      setProgress(5);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    // 닉네임 미입력 시 빈 문자열 전달 (표시할 때 처리)
    onNext({ userName: userName.trim() || '' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          정직하게 시작할게요
        </h2>
        <p className="text-[#666666]">
          알프레도는 아직 당신을 잘 몰라요
        </p>
      </div>

      {/* 성장 표시 */}
      <div className="flex-1">
        {/* 이해도 게이지 */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#1A1A1A]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">
                알프레도의 이해도
              </h3>
              <p className="text-sm text-[#666666]">
                당신에 대한 이해 수준
              </p>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#A996FF] font-semibold">현재 {progress}%</span>
              <span className="text-[#999999] text-xs">목표 100%</span>
            </div>
            <div className="h-3 bg-[#F0F0F0] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7ACC] rounded-full"
              />
            </div>
          </div>
        </div>

        {/* 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#F8F8FF] rounded-2xl p-4 mb-6"
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-[#A996FF] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[#1A1A1A] mb-2">
                <span className="font-semibold">함께 성장해요</span>
              </p>
              <p className="text-sm text-[#666666]">
                • 매일 조금씩 더 정확해져요<br />
                • 패턴을 발견하고 학습해요<br />
                • 3주 후엔 꽤 똑똑해질 거예요
              </p>
            </div>
          </div>
        </motion.div>

        {/* 이름 입력 (선택) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <label className="block text-sm text-[#666666] mb-2">
            뭐라고 부를까요? (선택)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="알프레도가 부를 이름 (예: 민지)"
            className="w-full px-4 py-3 bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#A996FF] transition-colors"
          />
          <p className="text-xs text-[#999999] mt-1">
            입력하지 않으면 "사용자님"으로 불러요
          </p>
        </motion.div>
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors"
      >
        알겠어요, 시작할게요
      </button>
    </div>
  );
}