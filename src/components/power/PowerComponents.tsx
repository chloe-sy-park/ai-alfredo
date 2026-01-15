/**
 * Power Balance UI 컴포넌트
 * 사용자와 AI 간의 권력 균형 시각화
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  User,
  Bot,
  RotateCcw,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import {
  ControlArea,
  ControlLevel,
  DelegationRequest,
  UndoOption,
  CONTROL_AREA_LABELS,
  CONTROL_AREA_DESCRIPTIONS,
  CONTROL_LEVEL_LABELS,
  CONTROL_LEVEL_DESCRIPTIONS
} from '../../services/power/types';
import {
  setControlLevel,
  getControlLevel,
  analyzePowerBalance,
  suggestPowerAdjustment,
  getPendingDelegations,
  respondToDelegation,
  getAvailableUndos,
  executeUndo,
  resetToDefaults,
  getUserPriorityMessage,
  getDelegationApprovedMessage,
  getDelegationDeniedMessage
} from '../../services/power/powerService';

/**
 * 컨트롤 레벨 슬라이더
 */
interface ControlSliderProps {
  area: ControlArea;
  onChange?: (level: ControlLevel) => void;
}

export function ControlSlider({ area, onChange }: ControlSliderProps) {
  const [level, setLevel] = useState<ControlLevel>(getControlLevel(area));

  const levels: ControlLevel[] = [
    'user_full',
    'user_primary',
    'balanced',
    'ai_suggest',
    'ai_auto'
  ];

  const currentIndex = levels.indexOf(level);

  const handleChange = (newLevel: ControlLevel) => {
    setLevel(newLevel);
    setControlLevel(area, newLevel);
    onChange?.(newLevel);
  };

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{CONTROL_AREA_LABELS[area]}</h4>
          <p className="text-xs text-gray-500">{CONTROL_AREA_DESCRIPTIONS[area]}</p>
        </div>
      </div>

      {/* 슬라이더 */}
      <div className="relative mb-3">
        <div className="flex justify-between mb-2">
          <User className="w-4 h-4 text-blue-500" />
          <Bot className="w-4 h-4 text-purple-500" />
        </div>

        <div className="relative h-2 bg-gradient-to-r from-blue-200 via-gray-200 to-purple-200 rounded-full">
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow cursor-pointer"
            style={{ left: `${(currentIndex / (levels.length - 1)) * 100}%` }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            whileHover={{ scale: 1.2 }}
          />
        </div>

        <div className="flex justify-between mt-1">
          {levels.map((l, i) => (
            <button
              key={l}
              onClick={() => handleChange(l)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 현재 레벨 표시 */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">
          {CONTROL_LEVEL_LABELS[level]}
        </p>
        <p className="text-xs text-gray-500">
          {CONTROL_LEVEL_DESCRIPTIONS[level]}
        </p>
      </div>
    </div>
  );
}

/**
 * 전체 컨트롤 설정 패널
 */
export function ControlSettingsPanel() {
  const areas: ControlArea[] = [
    'scheduling',
    'task_priority',
    'notifications',
    'suggestions',
    'automation',
    'data_usage'
  ];

  const handleReset = () => {
    if (confirm('기본 설정으로 되돌릴까요?')) {
      resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900">컨트롤 설정</h3>
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          기본값
        </button>
      </div>

      <p className="text-sm text-gray-600">
        각 영역에서 누가 더 주도할지 설정하세요
      </p>

      <div className="space-y-3">
        {areas.map(area => (
          <ControlSlider key={area} area={area} />
        ))}
      </div>
    </div>
  );
}

/**
 * 권한 균형 요약 카드
 */
export function PowerBalanceSummary() {
  const analysis = analyzePowerBalance();
  const total = analysis.userControlled + analysis.aiAssisted + analysis.balanced;

  const userPercent = Math.round((analysis.userControlled / total) * 100);
  const aiPercent = Math.round((analysis.aiAssisted / total) * 100);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <Sliders className="w-6 h-6 text-blue-500" />
        <h3 className="font-bold text-gray-900">현재 권한 균형</h3>
      </div>

      {/* 비주얼 바 */}
      <div className="h-4 rounded-full overflow-hidden flex mb-3">
        <div
          className="bg-blue-400"
          style={{ width: `${userPercent}%` }}
        />
        <div
          className="bg-gray-300"
          style={{ width: `${100 - userPercent - aiPercent}%` }}
        />
        <div
          className="bg-purple-400"
          style={{ width: `${aiPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4 text-blue-500" />
          <span className="text-gray-700">내가 {userPercent}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Bot className="w-4 h-4 text-purple-500" />
          <span className="text-gray-700">알프레도 {aiPercent}%</span>
        </div>
      </div>

      {analysis.overrideRate > 5 && (
        <p className="text-xs text-gray-500 mt-3">
          최근 30일간 {analysis.overrideRate}번 제 제안과 다른 결정을 하셨어요
        </p>
      )}
    </div>
  );
}

/**
 * 권한 조정 제안 카드
 */
export function PowerAdjustmentSuggestion() {
  const suggestion = suggestPowerAdjustment();

  if (!suggestion) return null;

  const handleAccept = () => {
    setControlLevel(suggestion.area, suggestion.suggestedLevel);
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-yellow-50 rounded-xl border border-yellow-200"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-gray-800 mb-2">{suggestion.reason}</p>
          <p className="text-xs text-gray-600 mb-3">
            "{CONTROL_AREA_LABELS[suggestion.area]}"을(를)
            "{CONTROL_LEVEL_LABELS[suggestion.currentLevel]}"에서
            "{CONTROL_LEVEL_LABELS[suggestion.suggestedLevel]}"(으)로 바꿔볼까요?
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
            >
              좋아요
            </button>
            <button className="px-3 py-1.5 text-gray-600 text-sm hover:text-gray-800">
              나중에
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 위임 요청 카드
 */
interface DelegationCardProps {
  request: DelegationRequest;
  onRespond: (approved: boolean) => void;
}

export function DelegationCard({ request, onRespond }: DelegationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-purple-50 rounded-xl border border-purple-200"
    >
      <div className="flex items-start gap-3">
        <Bot className="w-5 h-5 text-purple-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {request.action}
          </p>
          <p className="text-xs text-gray-600 mb-3">
            {request.reason}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => onRespond(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
            >
              <Check className="w-3 h-3" />
              맡길게요
            </button>
            <button
              onClick={() => onRespond(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-gray-600 text-sm hover:text-gray-800"
            >
              <X className="w-3 h-3" />
              직접 할게요
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * 펜딩 위임 요청 목록
 */
export function PendingDelegationsList() {
  const [delegations, setDelegations] = useState(getPendingDelegations());
  const [message, setMessage] = useState<string | null>(null);

  const handleRespond = (requestId: string, approved: boolean) => {
    respondToDelegation(requestId, approved);
    setDelegations(prev => prev.filter(d => d.id !== requestId));
    setMessage(approved ? getDelegationApprovedMessage() : getDelegationDeniedMessage());

    setTimeout(() => setMessage(null), 2000);
  };

  if (delegations.length === 0 && !message) return null;

  return (
    <div className="space-y-3">
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center"
        >
          {message}
        </motion.div>
      )}

      {delegations.map(delegation => (
        <DelegationCard
          key={delegation.id}
          request={delegation}
          onRespond={(approved) => handleRespond(delegation.id, approved)}
        />
      ))}
    </div>
  );
}

/**
 * 되돌리기 버튼
 */
interface UndoButtonProps {
  option: UndoOption;
  onUndo: () => void;
}

export function UndoButton({ option, onUndo }: UndoButtonProps) {
  const timeLeft = option.undoDeadline
    ? Math.max(0, Math.floor((new Date(option.undoDeadline).getTime() - Date.now()) / 1000))
    : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={onUndo}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800"
    >
      <RotateCcw className="w-4 h-4" />
      <span>되돌리기</span>
      {timeLeft !== null && (
        <span className="text-gray-400 text-sm">({timeLeft}초)</span>
      )}
    </motion.button>
  );
}

/**
 * 되돌리기 토스트
 */
export function UndoToast() {
  const [undos, setUndos] = useState(getAvailableUndos());

  const handleUndo = (optionId: string) => {
    const success = executeUndo(optionId);
    if (success) {
      setUndos(prev => prev.filter(u => u.id !== optionId));
    }
  };

  if (undos.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
      {undos.slice(0, 1).map(undo => (
        <UndoButton
          key={undo.id}
          option={undo}
          onUndo={() => handleUndo(undo.id)}
        />
      ))}
    </div>
  );
}

/**
 * 사용자 우선 메시지 배너
 */
export function UserPriorityBanner() {
  const message = getUserPriorityMessage();

  return (
    <div className="bg-blue-50 rounded-lg p-3 text-center">
      <p className="text-sm text-blue-700">{message}</p>
    </div>
  );
}

/**
 * 컨트롤 레벨 뱃지
 */
interface ControlBadgeProps {
  area: ControlArea;
  showLabel?: boolean;
}

export function ControlBadge({ area, showLabel = true }: ControlBadgeProps) {
  const level = getControlLevel(area);

  const levelColors: Record<ControlLevel, string> = {
    user_full: 'bg-blue-100 text-blue-700',
    user_primary: 'bg-blue-50 text-blue-600',
    balanced: 'bg-gray-100 text-gray-600',
    ai_suggest: 'bg-purple-50 text-purple-600',
    ai_auto: 'bg-purple-100 text-purple-700'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${levelColors[level]}`}>
      {level.includes('user') ? (
        <User className="w-3 h-3" />
      ) : level.includes('ai') ? (
        <Bot className="w-3 h-3" />
      ) : (
        <Sliders className="w-3 h-3" />
      )}
      {showLabel && CONTROL_LEVEL_LABELS[level]}
    </span>
  );
}

/**
 * Power Balance 전체 뷰
 */
export function PowerBalanceOverview() {
  return (
    <div className="space-y-6">
      <UserPriorityBanner />
      <PowerBalanceSummary />
      <PowerAdjustmentSuggestion />
      <PendingDelegationsList />
      <ControlSettingsPanel />
    </div>
  );
}
