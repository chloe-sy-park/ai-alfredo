/**
 * Human Imperfection UI 컴포넌트
 * 인간의 불완전함을 허용하는 UX
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  RefreshCw,
  Calendar,
  ThumbsUp,
  Meh,
  ThumbsDown,
  Settings,
  Sparkles
} from 'lucide-react';
import {
  ComfortResponse,
  FlexibilitySettings,
  IMPERFECTION_LABELS
} from '../../services/imperfection/types';
import {
  getEncouragementMessage,
  getGentleReminder,
  loadFlexibilitySettings,
  saveFlexibilitySettings,
  recordFeedback,
  needsEncouragement,
  analyzeImperfectionPatterns,
  requestGracePeriod
} from '../../services/imperfection/imperfectionService';

/**
 * 위로 메시지 카드
 */
interface ComfortCardProps {
  response: ComfortResponse;
  momentId?: string;
  onFeedback?: (feeling: 'better' | 'same' | 'worse') => void;
}

export function ComfortCard({ response, momentId, onFeedback }: ComfortCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(false);

  const handleFeedback = (feeling: 'better' | 'same' | 'worse') => {
    if (momentId) {
      recordFeedback(momentId, feeling);
    }
    setFeedbackGiven(true);
    onFeedback?.(feeling);
  };

  const toneColors: Record<string, string> = {
    understanding: 'from-blue-50 to-purple-50 border-blue-200',
    normalizing: 'from-green-50 to-teal-50 border-green-200',
    encouraging: 'from-yellow-50 to-orange-50 border-yellow-200',
    gentle: 'from-pink-50 to-rose-50 border-pink-200',
    practical: 'from-gray-50 to-slate-50 border-gray-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`p-5 rounded-2xl border bg-gradient-to-br ${toneColors[response.tone]}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <Heart className="w-6 h-6 text-pink-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-lg text-gray-800 font-medium">
            {response.message}
          </p>
          {response.followUp && (
            <p className="text-sm text-gray-600 mt-2">
              {response.followUp}
            </p>
          )}
        </div>
      </div>

      {response.actionSuggestion && (
        <div className="bg-white/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">{response.actionSuggestion}</p>
        </div>
      )}

      {/* 피드백 */}
      {!feedbackGiven && momentId && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <p className="text-xs text-gray-500 mb-2">이 말이 도움이 됐나요?</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleFeedback('better')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              네
            </button>
            <button
              onClick={() => handleFeedback('same')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Meh className="w-4 h-4" />
              그저 그래요
            </button>
            <button
              onClick={() => handleFeedback('worse')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              아니요
            </button>
          </div>
        </div>
      )}

      {feedbackGiven && (
        <p className="text-xs text-gray-500 text-center pt-3 border-t border-gray-200 mt-3">
          피드백 감사해요 💝
        </p>
      )}
    </motion.div>
  );
}

/**
 * 격려 배너
 */
export function EncouragementBanner() {
  const message = getEncouragementMessage();
  const showEncouragement = needsEncouragement();

  if (!showEncouragement) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-yellow-500" />
        <p className="text-gray-700">{message}</p>
      </div>
    </motion.div>
  );
}

/**
 * 부드러운 리마인더
 */
interface GentleReminderProps {
  taskTitle: string;
  deadline?: string;
}

export function GentleReminder({ taskTitle, deadline }: GentleReminderProps) {
  const reminder = getGentleReminder();

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <p className="text-sm text-gray-700 mb-1">{taskTitle}</p>
      {deadline && (
        <p className="text-xs text-gray-500 mb-2">
          {new Date(deadline).toLocaleDateString('ko-KR')}까지
        </p>
      )}
      <p className="text-xs text-gray-400 italic">{reminder}</p>
    </div>
  );
}

/**
 * 유예 기간 요청 버튼
 */
interface GracePeriodButtonProps {
  taskId: string;
  taskTitle: string;
  originalDeadline: string;
  onGraceGranted?: () => void;
}

export function GracePeriodButton({
  taskId,
  taskTitle: _taskTitle,
  originalDeadline,
  onGraceGranted
}: GracePeriodButtonProps) {
  const [granted, setGranted] = useState(false);

  const handleRequest = () => {
    requestGracePeriod(taskId, originalDeadline, 1, '좀 더 시간이 필요해요');
    setGranted(true);
    onGraceGranted?.();
  };

  if (granted) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <RefreshCw className="w-4 h-4" />
        <span>하루 더 여유가 생겼어요</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleRequest}
      className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-sm transition-colors"
    >
      <Calendar className="w-4 h-4" />
      <span>하루만 더 여유를 주세요</span>
    </button>
  );
}

/**
 * 유연성 설정 패널
 */
export function FlexibilitySettingsPanel() {
  const [settings, setSettings] = useState<FlexibilitySettings>(loadFlexibilitySettings());

  const handleToggle = (key: keyof FlexibilitySettings) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);
    saveFlexibilitySettings({ [key]: newValue });
  };

  const settingItems: {
    key: keyof FlexibilitySettings;
    label: string;
    description: string;
  }[] = [
    {
      key: 'allowTaskPostpone',
      label: '할 일 미루기 허용',
      description: '마감을 쉽게 늦출 수 있어요'
    },
    {
      key: 'allowStreakBreak',
      label: '연속 기록 압박 줄이기',
      description: '기록이 끊겨도 크게 표시하지 않아요'
    },
    {
      key: 'showGentleReminders',
      label: '부드러운 리마인더',
      description: '압박 없이 친절하게 알려줘요'
    },
    {
      key: 'hideStrictMetrics',
      label: '엄격한 지표 숨기기',
      description: '완료율, 지각률 등을 숨겨요'
    },
    {
      key: 'celebrateSmallWins',
      label: '작은 성과도 축하',
      description: '작은 완료도 인정해줘요'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-gray-500" />
        <h3 className="font-bold text-gray-900">유연성 설정</h3>
      </div>

      <p className="text-sm text-gray-600">
        스스로에게 얼마나 관대할지 설정하세요
      </p>

      <div className="space-y-3">
        {settingItems.map(item => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings[item.key] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full shadow"
                animate={{ x: settings[item.key] ? 26 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 불완전함 통계 카드
 */
export function ImperfectionStats() {
  const analysis = analyzeImperfectionPatterns();

  if (analysis.totalCount === 0) {
    return null;
  }

  return (
    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-purple-500" />
        당신을 이해하고 있어요
      </h4>

      {analysis.mostCommon && (
        <p className="text-sm text-gray-700 mb-2">
          가끔 "{IMPERFECTION_LABELS[analysis.mostCommon]}"라고 느끼시는 것 같아요.
          괜찮아요, 누구나 그래요.
        </p>
      )}

      {analysis.responseEffectiveness > 0 && (
        <p className="text-xs text-gray-500">
          제 위로가 {Math.round(analysis.responseEffectiveness)}% 정도 도움이 된 것 같아요
        </p>
      )}
    </div>
  );
}

/**
 * 자기 자비 메시지
 */
export function SelfCompassionMessage() {
  const messages = [
    '당신은 이미 잘하고 있어요',
    '완벽하지 않아도 충분해요',
    '오늘 하루도 수고했어요',
    '쉬어가도 괜찮아요',
    '스스로에게 친절하세요'
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-4"
    >
      <p className="text-lg text-gray-600 font-light italic">"{message}"</p>
    </motion.div>
  );
}

/**
 * 계획 변경 확인 모달
 */
interface PlanChangeConfirmProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  changeDescription: string;
}

export function PlanChangeConfirm({
  isOpen,
  onConfirm,
  onCancel,
  changeDescription
}: PlanChangeConfirmProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-sm w-full p-6"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          계획을 바꿀까요?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {changeDescription}
        </p>
        <p className="text-xs text-gray-500 mb-4 italic">
          계획은 언제든 바꿀 수 있어요. 그게 더 현실적인 선택일 수 있어요.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            유지할게요
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            바꿀게요
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * 불완전함 수용 전체 뷰
 */
export function ImperfectionOverview() {
  return (
    <div className="space-y-6">
      <SelfCompassionMessage />
      <EncouragementBanner />
      <ImperfectionStats />
      <FlexibilitySettingsPanel />
    </div>
  );
}
