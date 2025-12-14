import React, { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

// === Time Alert Toast Component ===
export const TimeAlertToast = ({ alert, onAction, onDismiss, darkMode = false }) => {
  if (!alert) return null;
  
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const borderColor = alert.urgency === 'high' 
    ? 'border-red-400' 
    : alert.type === 'break' || alert.type === 'meal'
      ? 'border-emerald-400'
      : 'border-[#A996FF]';
  
  const handleAction = (action) => {
    if (action === 'dismiss' || action === 'continue' || action === 'later') {
      onDismiss(alert.id);
    } else {
      onAction(action, alert);
    }
  };
  
  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className={`${bgColor} rounded-xl shadow-2xl border-l-4 ${borderColor} p-4 mx-auto max-w-md`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#F5F3FF] rounded-xl flex items-center justify-center text-xl shrink-0">
            {alert.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`font-bold ${textColor}`}>{alert.title}</p>
              <button 
                onClick={() => onDismiss(alert.id)}
                className={`${subTextColor} hover:text-gray-700 p-1`}
              >
                <X size={16} />
              </button>
            </div>
            <p className={`text-sm ${textColor} mt-1`}>{alert.message}</p>
            {alert.subMessage && (
              <p className={`text-xs ${subTextColor} mt-1`}>{alert.subMessage}</p>
            )}
            
            {alert.actions && (
              <div className="flex gap-2 mt-3">
                {alert.actions.map((action, idx) => (
                  <button
                    key={action.action}
                    onClick={() => handleAction(action.action)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      idx === 0
                        ? 'bg-[#A996FF] text-white hover:bg-[#8B7CF7]'
                        : darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === Alfredo Feedback Toast (실시간 피드백) ===
export const AlfredoFeedback = ({ visible, message, type, icon, darkMode }) => {
  if (!visible) return null;
  
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  
  const borderColors = {
    praise: 'border-[#A996FF]',
    celebrate: 'border-yellow-400',
    streak: 'border-orange-400',
    milestone: 'border-green-400',
  };
  
  const borderColor = borderColors[type] || borderColors.praise;
  
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`${bgColor} ${textColor} px-5 py-3 rounded-2xl shadow-2xl border-2 ${borderColor} flex items-center gap-3`}>
        <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md">
          🐧
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

// === Alfredo Status Bar (항상 보이는 상태바) ===
export const AlfredoStatusBar = ({ 
  completedTasks = 0, 
  totalTasks = 0, 
  currentTask = null,
  nextEvent = null,
  urgentTask = null,
  streak = 0,
  lastActivityMinutes = 0,
  mood = null,
  energy = null,
  taskElapsedMinutes = 0,
  taskEstimatedMinutes = 0,
  sessionMinutes = 0,
  onOpenChat,
  darkMode = false
}) => {
  const hour = new Date().getHours();
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const formatTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}분`;
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hrs}시간 ${mins}분` : `${hrs}시간`;
  };
  
  const messagePools = {
    celebrate: [
      "오늘 할 일 끝! 고생했어요 🎉",
      "완벽해요! 오늘 정말 잘했어요 ✨",
      "다 끝났네요! 이제 푹 쉬어요 🌟",
    ],
    working: (task) => [
      `"${task}" 응원 중!`,
      `"${task}" 같이 보고 있어요 👀`,
      `"${task}" 파이팅! 💪`,
    ],
    workingWithTime: (task, elapsed) => [
      `"${task}" ${formatTime(elapsed)}째 👀`,
      `${formatTime(elapsed)}째 "${task}" 진행 중!`,
      `"${task}" 열심히 하는 중 (${formatTime(elapsed)})`,
    ],
    overtime: (task, estimated, elapsed) => [
      `"${task}" ${formatTime(estimated)} 예상인데 ${formatTime(elapsed)} 됐어요. 괜찮아요, 천천히!`,
      `${formatTime(elapsed)}째예요. 계속해도 되고, 쉬어도 괜찮아요.`,
      `열심히 하고 있네요! ${formatTime(elapsed)} 지났어요.`,
    ],
    eventVeryClose: (event, mins) => [
      `⚠️ "${event}" ${mins}분 뒤! 준비하세요!`,
      `곧 "${event}"! 마무리하고 이동할 시간이에요.`,
      `"${event}" ${mins}분 전이에요! 🔔`,
    ],
    needBreak: (sessionMins) => [
      `${formatTime(sessionMins)}째 작업 중! 물 한 잔 어때요? ☕`,
      `열심히 하네요! ${formatTime(sessionMins)} 됐어요. 잠깐 쉬어도 괜찮아요.`,
      `${formatTime(sessionMins)} 연속! 스트레칭 한번 해볼까요? 🧘`,
    ],
    almostDone: [
      "거의 다 왔어요! 마지막 스퍼트 💪",
      "조금만 더! 끝이 보여요 🏁",
      "마지막 하나! 할 수 있어요 ✨",
    ],
    progress: (count) => [
      `${count}개 완료! 잘하고 있어요.`,
      `${count}개 끝! 이 페이스 좋아요 👍`,
      `벌써 ${count}개! 순조로워요.`,
    ],
    streak: (count) => [
      `${count}개 연속 완료! 대단해요 🔥`,
      `연속 ${count}개! 흐름 좋아요 💫`,
      `${count}연속! 멈추지 마요 🚀`,
    ],
    nextEventSoon: (event, mins) => [
      `${mins}분 뒤 "${event}" 있어요!`,
      `곧 "${event}"! 준비됐나요?`,
      `"${event}" ${mins}분 전이에요 ⏰`,
    ],
    urgentDeadline: (task) => [
      `"${task}" 마감이 다가와요!`,
      `오늘까지 "${task}" 잊지 마세요!`,
      `"${task}" 오늘 마감! 🔔`,
    ],
    longBreak: [
      "좀 쉬고 있네요. 괜찮아요, 천천히 해요.",
      "휴식도 중요해요. 준비되면 다시 시작해요.",
      "잠깐 쉬어도 괜찮아요. 여기 있을게요.",
    ],
    lowEnergy: [
      "오늘은 무리하지 말아요. 중요한 것만!",
      "에너지 낮을 땐 쉬운 것부터 해요.",
      "컨디션 안 좋은 날도 있어요. 괜찮아요.",
    ],
    morningStart: [
      "좋은 아침! 첫 번째 할 일부터 시작해볼까요?",
      "새로운 하루예요! 뭐부터 할까요?",
      "아침이에요! 오늘도 함께해요 ☀️",
    ],
    afternoonStart: [
      "아직 시작 전이에요. 가벼운 것부터 해볼까요?",
      "오후인데 아직 시작 안 했네요. 괜찮아요!",
      "지금 시작해도 충분해요. 같이 해요!",
    ],
    eveningStart: [
      "저녁이에요. 오늘 못 한 건 내일로 미뤄도 괜찮아요.",
      "오늘 바쁜 하루였나요? 내일 하면 돼요.",
      "저녁이네요. 꼭 필요한 것만 해요.",
    ],
    morningDefault: [
      "좋은 아침이에요! 오늘도 함께해요.",
      "상쾌한 아침! 좋은 하루 될 거예요.",
      "오늘 하루도 파이팅! ☀️",
    ],
    afternoonDefault: [
      "오후도 파이팅! 옆에 있을게요.",
      "오후예요. 잘하고 있어요!",
      "점심 먹었어요? 오후도 화이팅!",
    ],
    eveningDefault: [
      "저녁이에요. 오늘 하루 어땠어요?",
      "하루 마무리 시간이에요.",
      "저녁이네요. 수고했어요!",
    ],
    nightDefault: [
      "늦은 시간이네요. 푹 쉬어요!",
      "오늘도 고생했어요. 굿나잇! 🌙",
      "이제 쉴 시간이에요. 내일 봐요!",
    ],
  };
  
  const pickMessage = (pool) => {
    if (Array.isArray(pool)) {
      const index = Math.floor(Date.now() / (1000 * 60 * 5)) % pool.length;
      return pool[index];
    }
    return pool;
  };
  
  const getMessage = () => {
    if (completedTasks === totalTasks && totalTasks > 0) {
      return { text: pickMessage(messagePools.celebrate), mood: "celebrate", icon: "🎉" };
    }
    if (nextEvent && nextEvent.minutesUntil <= 10) {
      const msgs = messagePools.eventVeryClose(nextEvent.title, nextEvent.minutesUntil);
      return { text: pickMessage(msgs), mood: "urgent", icon: "⚠️" };
    }
    if (nextEvent && nextEvent.minutesUntil <= 30) {
      const msgs = messagePools.nextEventSoon(nextEvent.title, nextEvent.minutesUntil);
      return { text: pickMessage(msgs), mood: "alert", icon: "⏰" };
    }
    if (urgentTask) {
      const msgs = messagePools.urgentDeadline(urgentTask.title);
      return { text: pickMessage(msgs), mood: "urgent", icon: "🔔" };
    }
    if (sessionMinutes >= 120) {
      const msgs = messagePools.needBreak(sessionMinutes);
      return { text: pickMessage(msgs), mood: "break", icon: "☕" };
    }
    if (currentTask && taskEstimatedMinutes > 0 && taskElapsedMinutes >= taskEstimatedMinutes * 1.5) {
      const msgs = messagePools.overtime(currentTask, taskEstimatedMinutes, taskElapsedMinutes);
      return { text: pickMessage(msgs), mood: "overtime", icon: "⏰" };
    }
    if (streak >= 3) {
      const msgs = messagePools.streak(streak);
      return { text: pickMessage(msgs), mood: "streak", icon: "🔥" };
    }
    if (currentTask) {
      if (taskElapsedMinutes >= 5) {
        const msgs = messagePools.workingWithTime(currentTask, taskElapsedMinutes);
        return { text: pickMessage(msgs), mood: "working", icon: "💪" };
      }
      const msgs = messagePools.working(currentTask);
      return { text: pickMessage(msgs), mood: "working", icon: "💪" };
    }
    if (lastActivityMinutes >= 30 && completedTasks > 0 && completedTasks < totalTasks) {
      return { text: pickMessage(messagePools.longBreak), mood: "rest", icon: "☕" };
    }
    if (energy !== null && energy < 30) {
      return { text: pickMessage(messagePools.lowEnergy), mood: "lowEnergy", icon: "🌿" };
    }
    if (completedTasks >= totalTasks - 1 && totalTasks > 1) {
      return { text: pickMessage(messagePools.almostDone), mood: "almost", icon: "🏁" };
    }
    if (completedTasks >= 1) {
      const msgs = messagePools.progress(completedTasks);
      return { text: pickMessage(msgs), mood: "progress", icon: "✨" };
    }
    if (completedTasks === 0 && totalTasks > 0) {
      if (hour < 12) return { text: pickMessage(messagePools.morningStart), mood: "morning", icon: "☀️" };
      if (hour < 17) return { text: pickMessage(messagePools.afternoonStart), mood: "afternoon", icon: "🌤️" };
      return { text: pickMessage(messagePools.eveningStart), mood: "evening", icon: "🌅" };
    }
    if (hour < 12) return { text: pickMessage(messagePools.morningDefault), mood: "morning", icon: "☀️" };
    if (hour < 17) return { text: pickMessage(messagePools.afternoonDefault), mood: "afternoon", icon: "🌤️" };
    if (hour < 21) return { text: pickMessage(messagePools.eveningDefault), mood: "evening", icon: "🌅" };
    return { text: pickMessage(messagePools.nightDefault), mood: "night", icon: "🌙" };
  };
  
  const { text: message, icon } = getMessage();
  
  const bgColor = darkMode ? 'bg-gray-800/95' : 'bg-white/95';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-700';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  const progressBg = darkMode ? 'bg-gray-700' : 'bg-gray-200';
  
  return (
    <div 
      onClick={onOpenChat}
      className={`fixed bottom-20 left-0 right-0 z-40 ${bgColor} backdrop-blur-xl border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer hover:bg-opacity-100 transition-all active:scale-[0.99]`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="w-9 h-9 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm">
          🐧
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${textColor} truncate`}>
            {message}
          </p>
          
          {totalTasks > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex-1 h-1.5 ${progressBg} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className={`text-xs ${subTextColor} shrink-0`}>
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}
        </div>
        
        <MessageCircle size={18} className={`${subTextColor} shrink-0`} />
      </div>
    </div>
  );
};

// === Alfredo Floating Bubble (플로팅 말풍선) ===
export const AlfredoFloatingBubble = ({ message, subMessage, isVisible, onOpenChat, darkMode, quickReplies }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  
  useEffect(() => {
    if (isVisible && isExpanded && !hasBeenSeen) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setHasBeenSeen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isExpanded, hasBeenSeen]);
  
  useEffect(() => {
    if (message) {
      setIsExpanded(true);
      setHasBeenSeen(false);
    }
  }, [message]);
  
  if (!isVisible || !message) return null;
  
  const bgColor = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const subTextColor = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const handleOpenChat = () => {
    if (onOpenChat) {
      onOpenChat({
        message,
        subMessage,
        quickReplies: quickReplies || []
      });
    }
  };
  
  return (
    <div className="fixed bottom-44 right-4 z-50 flex flex-col items-end gap-2">
      {isExpanded && (
        <div 
          onClick={handleOpenChat}
          className={`${bgColor} rounded-xl shadow-2xl p-4 max-w-[280px] animate-in slide-in-from-bottom-4 duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-100'} cursor-pointer hover:shadow-xl transition-shadow`}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md">
              🐧
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${textColor} leading-relaxed`}>
                {message}
              </p>
              {subMessage && (
                <p className={`text-xs ${subTextColor} mt-1`}>
                  {subMessage}
                </p>
              )}
              <p className={`text-[11px] ${subTextColor} mt-2 flex items-center gap-1`}>
                <MessageCircle size={10} />
                탭해서 대화하기
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className={`${subTextColor} hover:text-gray-700 p-1`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
