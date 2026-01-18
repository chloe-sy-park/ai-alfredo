/**
 * DailyCheckInModal.tsx
 * 컨디션, 감정, 건강 상태를 한 번에 입력하는 통합 체크인 모달
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Brain, Activity, Check } from 'lucide-react';
import {
  ConditionLevel,
  conditionConfig,
  getTodayCondition,
  setTodayCondition
} from '../../services/condition';

// 감정 옵션
const EMOTION_OPTIONS = [
  { id: 'happy', emoji: '😊', label: '행복해요' },
  { id: 'calm', emoji: '😌', label: '평온해요' },
  { id: 'excited', emoji: '🤩', label: '설레요' },
  { id: 'tired', emoji: '😴', label: '피곤해요' },
  { id: 'stressed', emoji: '😰', label: '스트레스' },
  { id: 'sad', emoji: '😢', label: '우울해요' },
  { id: 'anxious', emoji: '😟', label: '불안해요' },
  { id: 'neutral', emoji: '😐', label: '그냥 그래요' },
];

// 건강 체크 항목
const HEALTH_CHECKS = [
  { id: 'sleep', icon: '😴', label: '잠을 잘 잤어요', question: '어젯밤 잠은?' },
  { id: 'water', icon: '💧', label: '물을 마셨어요', question: '수분 섭취는?' },
  { id: 'exercise', icon: '🏃', label: '운동했어요', question: '운동은?' },
  { id: 'meal', icon: '🍽️', label: '식사했어요', question: '식사는?' },
];

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: CheckInData) => void;
  initialCondition?: ConditionLevel | null;
}

export interface CheckInData {
  condition: ConditionLevel;
  emotion: string | null;
  healthChecks: string[];
  timestamp: string;
}

type Step = 'condition' | 'emotion' | 'health' | 'complete';

export default function DailyCheckInModal({
  isOpen,
  onClose,
  onComplete,
  initialCondition
}: DailyCheckInModalProps) {
  const [step, setStep] = useState<Step>('condition');
  const [condition, setCondition] = useState<ConditionLevel | null>(initialCondition || null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [healthChecks, setHealthChecks] = useState<string[]>([]);

  // 초기화
  useEffect(() => {
    if (isOpen) {
      const saved = getTodayCondition();
      if (saved?.level) {
        setCondition(saved.level);
      }
      // localStorage에서 오늘 감정/건강 데이터 복원
      const today = new Date().toDateString();
      const savedEmotion = localStorage.getItem(`alfredo_emotion_${today}`);
      const savedHealth = localStorage.getItem(`alfredo_health_${today}`);
      if (savedEmotion) setEmotion(savedEmotion);
      if (savedHealth) setHealthChecks(JSON.parse(savedHealth));
    }
  }, [isOpen]);

  const handleConditionSelect = (level: ConditionLevel) => {
    setCondition(level);
    setTodayCondition(level);
    // 다음 단계로 자동 이동
    setTimeout(() => setStep('emotion'), 300);
  };

  const handleEmotionSelect = (emotionId: string) => {
    setEmotion(emotionId);
    const today = new Date().toDateString();
    localStorage.setItem(`alfredo_emotion_${today}`, emotionId);
    // 다음 단계로 자동 이동
    setTimeout(() => setStep('health'), 300);
  };

  const toggleHealthCheck = (checkId: string) => {
    setHealthChecks(prev => {
      const newChecks = prev.includes(checkId)
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId];
      const today = new Date().toDateString();
      localStorage.setItem(`alfredo_health_${today}`, JSON.stringify(newChecks));
      return newChecks;
    });
  };

  const handleComplete = () => {
    if (!condition) return;

    const data: CheckInData = {
      condition,
      emotion,
      healthChecks,
      timestamp: new Date().toISOString()
    };

    onComplete?.(data);
    setStep('complete');

    // 잠시 후 닫기
    setTimeout(() => {
      onClose();
      setStep('condition');
    }, 1500);
  };

  const handleSkip = () => {
    if (step === 'emotion') {
      setStep('health');
    } else if (step === 'health') {
      handleComplete();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'condition': return '오늘 컨디션은?';
      case 'emotion': return '지금 기분은?';
      case 'health': return '오늘의 건강 체크';
      case 'complete': return '체크인 완료!';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'condition': return <Activity size={20} />;
      case 'emotion': return <Brain size={20} />;
      case 'health': return <Heart size={20} />;
      case 'complete': return <Check size={20} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-t-2xl p-5 pb-8 safe-area-bottom"
            style={{ backgroundColor: 'var(--surface-default)' }}
          >
            {/* 핸들 바 */}
            <div
              className="w-10 h-1 rounded-full mx-auto mb-4"
              style={{ backgroundColor: 'var(--border-default)' }}
            />

            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
                {getStepIcon()}
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {getStepTitle()}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* 진행 표시 */}
            {step !== 'complete' && (
              <div className="flex gap-1 mb-5">
                {['condition', 'emotion', 'health'].map((s, idx) => (
                  <div
                    key={s}
                    className="flex-1 h-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        idx <= ['condition', 'emotion', 'health'].indexOf(step)
                          ? 'var(--accent-primary)'
                          : 'var(--border-default)'
                    }}
                  />
                ))}
              </div>
            )}

            {/* 컨텐츠 */}
            <AnimatePresence mode="wait">
              {/* Step 1: 컨디션 */}
              {step === 'condition' && (
                <motion.div
                  key="condition"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-4 gap-3"
                >
                  {(['great', 'good', 'normal', 'bad'] as ConditionLevel[]).map((level) => {
                    const info = conditionConfig[level];
                    const isSelected = level === condition;
                    return (
                      <button
                        key={level}
                        onClick={() => handleConditionSelect(level)}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-default)',
                          backgroundColor: isSelected ? 'rgba(201, 162, 94, 0.1)' : 'transparent'
                        }}
                      >
                        <span className="text-3xl">{info.emoji}</span>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {info.label}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}

              {/* Step 2: 감정 */}
              {step === 'emotion' && (
                <motion.div
                  key="emotion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {EMOTION_OPTIONS.map((opt) => {
                      const isSelected = emotion === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleEmotionSelect(opt.id)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-default)',
                            backgroundColor: isSelected ? 'rgba(201, 162, 94, 0.1)' : 'transparent'
                          }}
                        >
                          <span className="text-2xl">{opt.emoji}</span>
                          <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleSkip}
                    className="w-full py-2 text-sm"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    건너뛰기
                  </button>
                </motion.div>
              )}

              {/* Step 3: 건강 체크 */}
              {step === 'health' && (
                <motion.div
                  key="health"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="space-y-2 mb-4">
                    {HEALTH_CHECKS.map((check) => {
                      const isChecked = healthChecks.includes(check.id);
                      return (
                        <button
                          key={check.id}
                          onClick={() => toggleHealthCheck(check.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
                          style={{
                            borderColor: isChecked ? 'var(--state-success)' : 'var(--border-default)',
                            backgroundColor: isChecked ? 'rgba(78, 172, 91, 0.1)' : 'transparent'
                          }}
                        >
                          <span className="text-xl">{check.icon}</span>
                          <span className="flex-1 text-left text-sm" style={{ color: 'var(--text-primary)' }}>
                            {check.label}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isChecked ? 'border-green-500 bg-green-500' : ''
                            }`}
                            style={{
                              borderColor: isChecked ? 'var(--state-success)' : 'var(--border-default)'
                            }}
                          >
                            {isChecked && <Check size={12} className="text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleComplete}
                    className="w-full py-3 rounded-xl font-medium text-white transition-colors"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  >
                    체크인 완료
                  </button>
                </motion.div>
              )}

              {/* Complete */}
              {step === 'complete' && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(78, 172, 91, 0.15)' }}
                  >
                    <Check size={32} style={{ color: 'var(--state-success)' }} />
                  </motion.div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    오늘 하루도 화이팅!
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    알프레도가 맞춤 추천을 준비할게요
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 선택된 컨디션 표시 (감정/건강 단계에서) */}
            {condition && (step === 'emotion' || step === 'health') && (
              <div
                className="mt-4 pt-4 flex items-center gap-2"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <span className="text-lg">{conditionConfig[condition].emoji}</span>
                <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  오늘 컨디션: {conditionConfig[condition].label}
                </span>
                {emotion && (
                  <>
                    <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                    <span className="text-lg">
                      {EMOTION_OPTIONS.find(e => e.id === emotion)?.emoji}
                    </span>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
