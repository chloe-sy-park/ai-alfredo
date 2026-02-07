/**
 * 6-Moment Onboarding Flow
 *
 * 1. Welcome - 알프레도 소개
 * 2. CalendarConnect - 구글 캘린더 연동
 * 3. Top3Explain - Top 3 시스템 설명
 * 4. SetFirstTop3 - 첫 Top 3 설정
 * 5. BriefingPreview - 브리핑 미리보기
 * 6. Ready - 시작 준비 완료
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ListChecks, Sparkles, ArrowRight, Check } from 'lucide-react';
import Button from '../../../components/common/Button';
import { OnboardingData } from '../index';

interface StepProps {
  data: OnboardingData;
  onNext: (data?: Partial<OnboardingData>) => void;
  onSkip: () => void;
}

// 애니메이션 variants
const pageVariants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

// === Step 1: Welcome ===
function WelcomeStep({ onNext }: StepProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div className="w-24 h-24 mb-6">
        <img
          src="/assets/alfredo/avatar/alfredo-avatar-80.png"
          alt="알프레도"
          className="w-full h-full object-contain"
          onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-6xl">🎩</span>'; }}
        />
      </div>
      <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        안녕하세요, 알프레도예요
      </h1>
      <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
        매일 가장 중요한 3가지에 집중할 수 있도록
      </p>
      <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
        도와드릴게요.
      </p>
      <Button onClick={() => onNext()} size="lg" fullWidth>
        시작하기
      </Button>
    </motion.div>
  );
}

// === Step 2: Calendar Connect ===
function CalendarConnectStep({ onNext, onSkip }: StepProps) {
  const [connecting, setConnecting] = useState(false);

  function handleConnect() {
    setConnecting(true);
    // Google OAuth 시작
    const redirectUri = `${window.location.origin}/auth/callback`;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (clientId) {
      const scope = [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events.readonly',
      ].join(' ');

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scope)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=onboarding`;

      window.location.href = authUrl;
    } else {
      // 개발 모드 - 스킵
      setConnecting(false);
      onNext({ calendarConnected: true });
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
      >
        <Calendar size={32} style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        캘린더를 연결하면
      </h2>
      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
        오늘 일정을 보고
      </p>
      <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
        적절한 Top 3를 추천해드려요
      </p>
      <p className="text-xs mt-2 mb-8" style={{ color: 'var(--text-tertiary)' }}>
        읽기 전용이라 일정을 수정하지 않아요
      </p>
      <div className="w-full space-y-3">
        <Button onClick={handleConnect} size="lg" fullWidth isLoading={connecting}>
          구글 캘린더 연결하기
        </Button>
        <button
          onClick={() => { onSkip(); onNext({ calendarConnected: false }); }}
          className="w-full text-sm py-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          나중에 할게요
        </button>
      </div>
    </motion.div>
  );
}

// === Step 3: Top 3 설명 ===
function Top3ExplainStep({ onNext }: StepProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
      >
        <ListChecks size={32} style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        매일 3가지만 정하세요
      </h2>
      <div className="space-y-4 mb-8 text-left max-w-[300px]">
        <div className="flex items-start gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--accent-on)' }}
          >
            1st
          </span>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              가장 중요한 일
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              오늘 이것만 해도 성공
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-tertiary)' }}
          >
            2nd
          </span>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              두 번째로 중요한 일
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              시간 되면 하기
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-tertiary)' }}
          >
            3rd
          </span>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              할 수 있으면 좋은 일
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              보너스!
            </p>
          </div>
        </div>
      </div>
      <Button onClick={() => onNext()} size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>
        이해했어요
      </Button>
    </motion.div>
  );
}

// === Step 4: 첫 Top 3 설정 ===
function SetFirstTop3Step({ onNext }: StepProps) {
  const [items, setItems] = useState(['', '', '']);
  const [focusIndex, setFocusIndex] = useState(0);

  function handleChange(idx: number, value: string) {
    const newItems = [...items];
    newItems[idx] = value;
    setItems(newItems);
  }

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Enter' && idx < 2) {
      setFocusIndex(idx + 1);
    }
  }

  function handleNext() {
    const filledItems = items.filter(item => item.trim());
    if (filledItems.length === 0) {
      onNext();
      return;
    }

    // localStorage에 Top 3 저장
    const today = new Date().toDateString();
    const top3Items = filledItems.map((title, idx) => ({
      id: `onboarding-${Date.now()}-${idx}`,
      title: title.trim(),
      type: 'task' as const,
      completed: false,
      category: 'work' as const,
      isPersonal: false,
      order: idx,
    }));

    localStorage.setItem('alfredo_top3', JSON.stringify({
      date: today,
      items: top3Items,
    }));

    onNext();
  }

  const hasAnyItem = items.some(item => item.trim());

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[60vh] px-6"
    >
      <h2 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
        오늘의 Top 3는?
      </h2>
      <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-tertiary)' }}>
        가장 중요한 순서대로 적어주세요
      </p>

      <div className="w-full max-w-[360px] space-y-3 mb-8">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: idx === 0 ? 'var(--accent-primary)' : 'var(--surface-subtle)',
                color: idx === 0 ? 'var(--accent-on)' : 'var(--text-tertiary)',
              }}
            >
              {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}
            </span>
            <input
              type="text"
              value={item}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onFocus={() => setFocusIndex(idx)}
              autoFocus={idx === focusIndex}
              placeholder={
                idx === 0 ? '가장 중요한 일' :
                idx === 1 ? '두 번째로 중요한 일' :
                '할 수 있으면 좋은 일'
              }
              className="flex-1 bg-transparent outline-none text-sm py-3 px-4 rounded-xl"
              style={{
                backgroundColor: 'var(--surface-default)',
                color: 'var(--text-primary)',
                border: `2px solid ${focusIndex === idx ? 'var(--accent-primary)' : 'var(--border-default)'}`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="w-full max-w-[360px] space-y-3">
        <Button onClick={handleNext} size="lg" fullWidth>
          {hasAnyItem ? '다음' : '나중에 정할게요'}
        </Button>
      </div>
    </motion.div>
  );
}

// === Step 5: 브리핑 미리보기 ===
function BriefingPreviewStep({ onNext }: StepProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'var(--surface-subtle)' }}
      >
        <Sparkles size={32} style={{ color: 'var(--accent-primary)' }} />
      </div>
      <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        매일 아침, 알프레도가
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        캘린더를 보고 Top 3에 대한 판단을 내려드려요
      </p>

      {/* 미리보기 카드 */}
      <div
        className="w-full max-w-[320px] rounded-2xl p-4 mb-8 text-left"
        style={{ backgroundColor: 'var(--surface-default)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          >
            <img
              src="/assets/alfredo/avatar/alfredo-avatar-48.png"
              alt="알프레도"
              className="w-6 h-6 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).outerHTML = '<span class="text-sm">🎩</span>'; }}
            />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              오전에 중요한 일 먼저 하세요
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              오후에 미팅 2개가 있어서, 오전이 집중 시간이에요
            </p>
          </div>
        </div>
        <div
          className="px-3 py-2 rounded-lg text-xs"
          style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
        >
          1st에 집중하면 오늘 하루가 성공이에요
        </div>
      </div>

      <Button onClick={() => onNext()} size="lg" fullWidth>
        좋아요!
      </Button>
    </motion.div>
  );
}

// === Step 6: Ready ===
function ReadyStep({ onNext }: StepProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}
      >
        <Check size={40} style={{ color: '#22C55E' }} />
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
        준비 완료!
      </h2>
      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
        이제 매일 Top 3를 정하고
      </p>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        알프레도의 판단을 받아보세요
      </p>
      <Button onClick={() => onNext()} size="lg" fullWidth>
        시작하기
      </Button>
    </motion.div>
  );
}

// === 6-Moment Onboarding 메인 ===

const SIX_STEPS = [
  WelcomeStep,
  CalendarConnectStep,
  Top3ExplainStep,
  SetFirstTop3Step,
  BriefingPreviewStep,
  ReadyStep,
];

export default function SixMomentOnboarding({ data, onNext, onSkip }: StepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState<OnboardingData>(data);

  const CurrentStep = SIX_STEPS[currentStep];

  function handleStepNext(newData?: Partial<OnboardingData>) {
    const mergedData = { ...stepData, ...newData };
    setStepData(mergedData);

    if (currentStep === SIX_STEPS.length - 1) {
      onNext(mergedData);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 프로그레스 바 */}
      <div className="px-6 pt-4">
        <div className="flex gap-1.5">
          {SIX_STEPS.map((_, idx) => (
            <div
              key={idx}
              className="h-1 rounded-full flex-1 transition-all duration-300"
              style={{
                backgroundColor: idx <= currentStep ? 'var(--accent-primary)' : 'var(--border-default)',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {currentStep + 1}/{SIX_STEPS.length}
          </span>
          {currentStep > 0 && currentStep < SIX_STEPS.length - 1 && (
            <button
              onClick={onSkip}
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              건너뛰기
            </button>
          )}
        </div>
      </div>

      {/* 스텝 콘텐츠 */}
      <AnimatePresence mode="wait">
        <CurrentStep
          key={currentStep}
          data={stepData}
          onNext={handleStepNext}
          onSkip={onSkip}
        />
      </AnimatePresence>
    </div>
  );
}
