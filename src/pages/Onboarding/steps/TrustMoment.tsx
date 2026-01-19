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
        <h2
          className="text-xl font-bold mb-2 heading-kr"
          style={{ color: 'var(--text-primary)' }}
        >
          정직하게 시작할게요
        </h2>
        <p className="body-text" style={{ color: 'var(--text-secondary)' }}>
          알프레도는 아직 당신을 잘 몰라요
        </p>
      </div>

      {/* 성장 표시 */}
      <div className="flex-1">
        {/* 이해도 게이지 */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            backgroundColor: 'var(--surface-default)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(201, 162, 94, 0.15)' }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                알프레도의 이해도
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                당신에 대한 이해 수준
              </p>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>현재 {progress}%</span>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>목표 100%</span>
            </div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            >
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            </div>
          </div>
        </div>

        {/* 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-4 mb-6"
          style={{ backgroundColor: 'rgba(201, 162, 94, 0.08)' }}
        >
          <div className="flex gap-3">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                <span className="font-semibold">함께 성장해요</span>
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
          <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            뭐라고 부를까요? (선택)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="알프레도가 부를 이름 (예: 민지)"
            className="w-full px-4 py-3 rounded-xl transition-colors"
            style={{
              backgroundColor: 'var(--surface-default)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-default)';
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            입력하지 않으면 "사용자님"으로 불러요
          </p>
        </motion.div>
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-2xl ui-button transition-colors"
        style={{
          backgroundColor: 'var(--text-primary)',
          color: 'var(--surface-default)'
        }}
      >
        알겠어요, 시작할게요
      </button>
    </div>
  );
}
