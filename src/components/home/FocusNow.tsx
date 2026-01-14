import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X, Clock, Calendar } from 'lucide-react';
import { FocusItem, getCurrentFocus, clearFocus, startFocus, pauseFocus, resumeFocus } from '../../services/focusNow';
import { formatRemainingTime } from '../../services/tasks';
import Card from '../common/Card';
import Button from '../common/Button';
import { useChatStore } from '../../stores/chatStore';

interface FocusNowProps {
  externalFocus?: FocusItem | null;
  onFocusChange?: (focus: FocusItem | null) => void;
}

export default function FocusNow({ externalFocus, onFocusChange }: FocusNowProps) {
  var navigate = useNavigate();
  var { openChat } = useChatStore();
  var [focus, setFocus] = useState<FocusItem | null>(null);
  var [remainingTime, setRemainingTime] = useState<string>('');
  var [elapsedMinutes, setElapsedMinutes] = useState<number>(0);

  // 외부에서 포커스 변경시
  useEffect(function() {
    if (externalFocus !== undefined) {
      setFocus(externalFocus);
    } else {
      // 외부 포커스가 없으면 현재 포커스 로드
      var currentFocus = getCurrentFocus();
      setFocus(currentFocus);
    }
  }, [externalFocus]);

  // 타이머 업데이트
  useEffect(function() {
    if (!focus || !focus.startTime) return;

    var interval = setInterval(function() {
      var now = new Date();
      var elapsed = Math.floor((now.getTime() - new Date(focus.startTime!).getTime()) / 1000);
      setElapsedMinutes(Math.floor(elapsed / 60));
      
      if (focus.estimatedMinutes) {
        var remaining = Math.max(0, focus.estimatedMinutes * 60 - elapsed);
        setRemainingTime(formatRemainingTime(remaining));
      }
    }, 1000);

    return function() { clearInterval(interval); };
  }, [focus]);

  function handleClear() {
    clearFocus();
    setFocus(null);
    if (onFocusChange) {
      onFocusChange(null);
    }
  }

  function handlePause() {
    if (!focus) return;
    pauseFocus();
    var updatedFocus = getCurrentFocus();
    setFocus(updatedFocus);
  }

  function handleResume() {
    if (!focus) return;
    resumeFocus();
    var updatedFocus = getCurrentFocus();
    setFocus(updatedFocus);
  }
  
  function handleChatClick() {
    openChat({
      entry: 'priority',
      triggerData: { currentFocus: focus },
      currentState: {
        intensity: 'normal', // 실제로는 계산된 값 사용
        condition: 'normal',
        top3Count: 0,
        calendarEvents: 0
      }
    });
    navigate('/chat');
  }

  // 비어있는 상태
  if (!focus) {
    return (
      <Card className="bg-gradient-to-r from-[#F5F5F5] to-[#FAFAFA]">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Play size={24} className="text-[#D4D4D4]" />
          </div>
          <p className="text-sm text-[#999999] mb-1">지금 집중할 것이 없어요</p>
          <p className="text-xs text-[#AAAAAA]">오늘의 Top 3나 업무 목록에서 선택해주세요</p>
          <button
            onClick={handleChatClick}
            className="mt-3 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            알프레도와 우선순위 정하기 →
          </button>
        </div>
      </Card>
    );
  }

  var isPaused = focus.pausedAt !== undefined;
  var hasStarted = focus.startTime !== undefined;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/30">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-primary">지금 집중</span>
        </div>
        <button
          onClick={handleClear}
          className="p-1 hover:bg-white/50 rounded transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <X size={16} className="text-[#666666]" />
        </button>
      </div>

      {/* 제목 */}
      <h3 className="font-bold text-lg text-[#1A1A1A] mb-3">{focus.title}</h3>

      {/* 시간 정보 */}
      {hasStarted && (
        <div className="flex items-center gap-4 text-sm text-[#666666] mb-4">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{elapsedMinutes}분 경과</span>
          </div>
          {remainingTime && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{remainingTime}</span>
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        {!hasStarted && (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={function() { startFocus(focus.id); }}
              className="flex-1"
            >
              시작하기
            </Button>
            <button
              onClick={handleChatClick}
              className="text-xs text-[#666666] hover:text-primary transition-colors px-2"
            >
              이게 맞나?
            </button>
          </>
        )}
        {hasStarted && !isPaused && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePause}
            className="flex-1"
          >
            일시정지
          </Button>
        )}
        {hasStarted && isPaused && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleResume}
            className="flex-1"
          >
            다시 시작
          </Button>
        )}
      </div>
    </Card>
  );
}