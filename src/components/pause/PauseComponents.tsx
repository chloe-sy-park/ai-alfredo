/**
 * Exit & Pause UI 컴포넌트
 * 떠나도 괜찮아요 - 사용자가 쉬거나 떠날 때의 UI
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Calendar, Moon, Plane, Heart, ArrowRight } from 'lucide-react';
import {
  PauseReason,
  PauseDuration,
  ExitType,
  PAUSE_REASON_LABELS,
  PAUSE_DURATION_LABELS,
  WelcomeBackMessage
} from '../../services/pause/types';
import {
  processExitExperience,
  endPause,
  getPauseSummary,
  generateGoodbyeMessage
} from '../../services/pause/pauseService';

/**
 * 일시정지 이유 선택 버튼
 */
interface ReasonButtonProps {
  reason: PauseReason;
  selected: boolean;
  onClick: () => void;
}

function ReasonButton({ reason, selected, onClick }: ReasonButtonProps) {
  const icons: Record<PauseReason, React.ReactNode> = {
    vacation: <Plane className="w-5 h-5" />,
    busy_period: <Calendar className="w-5 h-5" />,
    mental_break: <Coffee className="w-5 h-5" />,
    trying_other: <ArrowRight className="w-5 h-5" />,
    not_needed: <Moon className="w-5 h-5" />,
    other: <Heart className="w-5 h-5" />
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all w-full text-left ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className={selected ? 'text-blue-500' : 'text-gray-400'}>
        {icons[reason]}
      </span>
      <span className="font-medium">{PAUSE_REASON_LABELS[reason]}</span>
    </button>
  );
}

/**
 * 기간 선택 버튼
 */
interface DurationButtonProps {
  duration: PauseDuration;
  selected: boolean;
  onClick: () => void;
}

function DurationButton({ duration, selected, onClick }: DurationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full border transition-all ${
        selected
          ? 'border-blue-500 bg-blue-500 text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
      }`}
    >
      {PAUSE_DURATION_LABELS[duration]}
    </button>
  );
}

/**
 * 일시정지 플로우 모달
 */
interface PauseFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (goodbyeMessage: string) => void;
}

export function PauseFlowModal({ isOpen, onClose, onComplete }: PauseFlowModalProps) {
  const [step, setStep] = useState<'type' | 'reason' | 'duration' | 'confirm'>('type');
  const [exitType, setExitType] = useState<ExitType>('pause');
  const [reason, setReason] = useState<PauseReason>('mental_break');
  const [duration, setDuration] = useState<PauseDuration>('week');
  const [feedback, setFeedback] = useState('');
  const [wantReminder, setWantReminder] = useState(true);

  if (!isOpen) return null;

  const handleComplete = () => {
    const { goodbyeMessage } = processExitExperience({
      type: exitType,
      reason,
      duration,
      feedback,
      keepData: true,
      wantReminder,
      reminderDate: wantReminder ? calculateReminderDate(duration) : undefined
    });

    onComplete(goodbyeMessage);
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              잠시 떠나시나요?
            </h2>
            <p className="text-gray-600">
              괜찮아요. 언제든 돌아오면 반갑게 맞이할게요.
            </p>

            <div className="space-y-3 mt-6">
              <button
                onClick={() => { setExitType('pause'); setStep('reason'); }}
                className="w-full p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <div className="font-medium text-gray-900">잠시 쉴게요</div>
                <div className="text-sm text-gray-500">곧 돌아올 거예요</div>
              </button>

              <button
                onClick={() => { setExitType('break'); setStep('reason'); }}
                className="w-full p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
              >
                <div className="font-medium text-gray-900">당분간 안 쓸 것 같아요</div>
                <div className="text-sm text-gray-500">언제 돌아올지 모르겠어요</div>
              </button>

              <button
                onClick={() => { setExitType('goodbye'); setStep('confirm'); }}
                className="w-full p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all text-left"
              >
                <div className="font-medium text-gray-900">작별할게요</div>
                <div className="text-sm text-gray-500">더 이상 쓰지 않을 거예요</div>
              </button>
            </div>
          </div>
        );

      case 'reason':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              이유가 있다면 알려주세요
            </h2>
            <p className="text-gray-600">
              더 나아지는 데 도움이 돼요
            </p>

            <div className="space-y-2 mt-6">
              {(Object.keys(PAUSE_REASON_LABELS) as PauseReason[]).map((r) => (
                <ReasonButton
                  key={r}
                  reason={r}
                  selected={reason === r}
                  onClick={() => setReason(r)}
                />
              ))}
            </div>

            <button
              onClick={() => setStep(exitType === 'pause' ? 'duration' : 'confirm')}
              className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              다음
            </button>
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              얼마나 쉴 예정이에요?
            </h2>
            <p className="text-gray-600">
              대략적으로 알려주세요
            </p>

            <div className="flex flex-wrap gap-2 mt-6">
              {(Object.keys(PAUSE_DURATION_LABELS) as PauseDuration[]).map((d) => (
                <DurationButton
                  key={d}
                  duration={d}
                  selected={duration === d}
                  onClick={() => setDuration(d)}
                />
              ))}
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantReminder}
                  onChange={(e) => setWantReminder(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">돌아올 때 알려줘요</span>
              </label>
            </div>

            <button
              onClick={() => setStep('confirm')}
              className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              다음
            </button>
          </div>
        );

      case 'confirm':
        const previewMessage = generateGoodbyeMessage(reason);

        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {exitType === 'goodbye' ? '정말 떠나시나요?' : '그럼 잠시 후에 봐요'}
            </h2>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mt-6">
              <p className="text-gray-700 italic">"{previewMessage}"</p>
            </div>

            {exitType !== 'goodbye' && (
              <div className="mt-4">
                <label className="text-sm text-gray-600 mb-2 block">
                  나에게 남기는 메모 (선택)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="돌아왔을 때 기억하고 싶은 것이 있다면..."
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleComplete}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  exitType === 'goodbye'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {exitType === 'goodbye' ? '작별하기' : '쉬러 가기'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-md w-full p-6"
      >
        {step !== 'type' && (
          <button
            onClick={() => {
              if (step === 'reason') setStep('type');
              else if (step === 'duration') setStep('reason');
              else if (step === 'confirm') setStep(exitType === 'pause' ? 'duration' : 'reason');
            }}
            className="text-gray-400 hover:text-gray-600 mb-4"
          >
            ← 뒤로
          </button>
        )}

        {renderStep()}
      </motion.div>
    </div>
  );
}

/**
 * 복귀 환영 모달
 */
interface WelcomeBackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeBackModal({ isOpen, onClose }: WelcomeBackModalProps) {
  const [message, setMessage] = useState<WelcomeBackMessage | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      const welcomeMessage = endPause();
      setMessage(welcomeMessage);
    }
  }, [isOpen]);

  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-md w-full p-6 text-center"
      >
        <div className="text-5xl mb-4">
          {message.tone === 'excited' ? '🎉' : message.tone === 'warm' ? '☺️' : '👋'}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {message.headline}
        </h2>

        <p className="text-gray-600 mb-4">
          {message.subtext}
        </p>

        {message.stats?.daysPaused && message.stats.daysPaused > 0 && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">
              {message.stats.daysPaused}일만에 돌아왔어요
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          시작할게요!
        </button>
      </motion.div>
    </div>
  );
}

/**
 * 일시정지 상태 배너
 */
export function PauseStatusBanner() {
  const summary = getPauseSummary();

  if (!summary.isPaused) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4"
    >
      <div className="flex items-center gap-3">
        <Coffee className="w-5 h-5 text-orange-500" />
        <div>
          <p className="font-medium text-gray-900">
            쉬는 중이에요
          </p>
          <p className="text-sm text-gray-600">
            {summary.daysPaused}일째 쉬고 있어요
            {summary.daysUntilReturn != null && summary.daysUntilReturn > 0 && (
              <> · {summary.daysUntilReturn}일 뒤 돌아올 예정</>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 작별 인사 화면
 */
interface GoodbyeScreenProps {
  message: string;
  onDismiss: () => void;
}

export function GoodbyeScreen({ message, onDismiss }: GoodbyeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50"
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">👋</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          그동안 함께해서 좋았어요
        </h2>

        <p className="text-gray-600 mb-8">
          {message}
        </p>

        <button
          onClick={onDismiss}
          className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
        >
          닫기
        </button>
      </div>
    </motion.div>
  );
}

/**
 * 일시정지 버튼 (설정에서 사용)
 */
interface PauseButtonProps {
  onPause: () => void;
}

export function PauseButton({ onPause }: PauseButtonProps) {
  return (
    <button
      onClick={onPause}
      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Coffee className="w-4 h-4" />
      <span>잠시 쉬기</span>
    </button>
  );
}

// ========== 유틸리티 함수 ==========

function calculateReminderDate(duration: PauseDuration): string {
  const now = new Date();

  switch (duration) {
    case 'few_days':
      now.setDate(now.getDate() + 3);
      break;
    case 'week':
      now.setDate(now.getDate() + 7);
      break;
    case 'two_weeks':
      now.setDate(now.getDate() + 14);
      break;
    case 'month':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'indefinite':
      now.setDate(now.getDate() + 30); // 기본 30일
      break;
  }

  return now.toISOString();
}
