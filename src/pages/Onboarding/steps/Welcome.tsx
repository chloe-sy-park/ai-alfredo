import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function Welcome({ onNext, onSkip }: WelcomeProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      {/* 알프레도 아바타 */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: 0.2
        }}
        className="mb-12"
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden shadow-lg"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          {!imageError ? (
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-256.png"
              alt="알프레도"
              className="w-24 h-24 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="text-5xl">🎩</span>
          )}
        </div>
      </motion.div>

      {/* 메인 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h1
          className="text-2xl font-bold mb-4 heading-kr"
          style={{ color: 'var(--text-primary)' }}
        >
          안녕하세요, 저는 알프레도예요
        </h1>
        <p
          className="text-lg px-8 body-text"
          style={{ color: 'var(--text-secondary)' }}
        >
          당신만의 AI 버틀러가 되어<br />
          함께 성장하고 싶어요
        </p>
      </motion.div>

      {/* 서브 메시지 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mb-16 px-8"
      >
        <div
          className="flex items-center justify-center gap-2 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span>도구가 아닌, 관계를 시작해요</span>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
        </div>
      </motion.div>

      {/* 버튼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="w-full px-8 space-y-3"
      >
        <button
          onClick={() => onNext()}
          className="w-full py-4 rounded-2xl ui-button transition-colors"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--accent-on)'
          }}
        >
          시작하기
        </button>

        <button
          onClick={onSkip}
          className="w-full py-4 ui-button transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          나중에 하기
        </button>
      </motion.div>
    </div>
  );
}