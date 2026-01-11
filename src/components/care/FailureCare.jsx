import React, { useState, useEffect } from 'react';
import { Heart, Sun, Sparkles, RefreshCw, ChevronRight, X } from 'lucide-react';

// 🤗 실패 케어 메시지 (ADHD 친화적)
var CARE_MESSAGES = {
  // 태스크 미완료 시
  taskIncomplete: [
    { text: '완벽하지 않아도 괜찮아요. 내일 다시 해봐요 💜', emoji: '🤗' },
    { text: '오늘은 쉬고, 내일 가볍게 시작해요', emoji: '🌙' },
    { text: '못한 날도 있는 거예요. 자책하지 마세요', emoji: '💜' },
    { text: '포기한 게 아니라 쉬어가는 거예요', emoji: '🌸' },
    { text: '내일의 당신이 해결해줄 거예요 ✨', emoji: '🌟' }
  ],
  
  // 연속 미완료 시 (더 강한 위로)
  streakMiss: [
    { text: '힘든 시기를 보내고 있나봐요. 괜찮아요 💜', emoji: '🫂' },
    { text: '지금 가장 중요한 건 당신의 컨디션이에요', emoji: '💜' },
    { text: '무리하지 마세요. 천천히 돌아와도 돼요', emoji: '🌿' },
    { text: '작은 것 하나만 해도 충분해요', emoji: '✨' }
  ],
  
  // 태스크 롤오버 시
  taskRollover: [
    { text: '내일로 옮겨뒀어요. 급한 건 아니니까요', emoji: '📋' },
    { text: '오늘 못 끝낸 건 내일 첫 번째로 해봐요', emoji: '🌅' },
    { text: '내일도 기회는 있어요. 걱정 마세요', emoji: '💪' }
  ],
  
  // 저녁에 아무것도 못했을 때
  eveningEmpty: [
    { text: '바쁜 하루였나봐요. 내일 다시 시작해요', emoji: '🌙' },
    { text: '쉬는 것도 중요한 일이에요 💜', emoji: '😴' },
    { text: '하루쯤 비워도 괜찮아요', emoji: '🌸' }
  ],
  
  // 컨디션 낮을 때
  lowCondition: [
    { text: '오늘은 그냥 쉬어요. 내일은 나아질 거예요', emoji: '🤗' },
    { text: '컨디션이 안 좋으면 할 일도 줄여야죠', emoji: '💜' },
    { text: '무리하지 마세요. 당신이 더 중요해요', emoji: '❤️' }
  ],
  
  // 새벽까지 일할 때
  lateNight: [
    { text: '지금 시간엔 쉬셔야 해요 🌙', emoji: '😴' },
    { text: '수면이 생산성의 핵심이에요. 자요!', emoji: '💤' },
    { text: '내일 아침에 하면 더 잘 될 거예요', emoji: '🌅' }
  ]
};

// 랜덤 메시지 선택
var getRandomMessage = function(category) {
  var messages = CARE_MESSAGES[category] || CARE_MESSAGES.taskIncomplete;
  var index = Math.floor(Math.random() * messages.length);
  return messages[index];
};

// 상황 분석
var analyzeUserState = function(props) {
  var tasks = props.tasks || [];
  var condition = props.condition || 3;
  var consecutiveMissDays = props.consecutiveMissDays || 0;
  
  var now = new Date();
  var hour = now.getHours();
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var total = tasks.length;
  var completionRate = total > 0 ? (completed / total) * 100 : 100;
  
  // 우선순위대로 상황 판단
  
  // 1. 새벽까지 일하고 있을 때
  if (hour >= 0 && hour < 5) {
    return 'lateNight';
  }
  
  // 2. 컨디션이 많이 낮을 때
  if (condition <= 2) {
    return 'lowCondition';
  }
  
  // 3. 연속 미완료 (3일 이상)
  if (consecutiveMissDays >= 3) {
    return 'streakMiss';
  }
  
  // 4. 저녁인데 아무것도 못했을 때
  if (hour >= 20 && total > 0 && completed === 0) {
    return 'eveningEmpty';
  }
  
  // 5. 일반적인 미완료
  if (total > 0 && completionRate < 30) {
    return 'taskIncomplete';
  }
  
  return null;
};

// 🤗 실패 케어 카드 컴포넌트
export var FailureCareCard = function(props) {
  var tasks = props.tasks || [];
  var condition = props.condition || 3;
  var consecutiveMissDays = props.consecutiveMissDays || 0;
  var onDismiss = props.onDismiss;
  var onShowTomorrow = props.onShowTomorrow;
  
  var messageState = useState(null);
  var message = messageState[0];
  var setMessage = messageState[1];
  
  var visibleState = useState(false);
  var isVisible = visibleState[0];
  var setIsVisible = visibleState[1];
  
  useEffect(function() {
    var state = analyzeUserState({
      tasks: tasks,
      condition: condition,
      consecutiveMissDays: consecutiveMissDays
    });
    
    if (state) {
      var careMessage = getRandomMessage(state);
      setMessage(careMessage);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [tasks, condition, consecutiveMissDays]);
  
  if (!isVisible || !message) return null;
  
  return React.createElement('div', {
    className: 'mx-4 mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 shadow-sm'
  },
    React.createElement('div', { className: 'flex items-start gap-3' },
      // 이모지
      React.createElement('span', { className: 'text-3xl flex-shrink-0' }, message.emoji),
      
      // 메시지
      React.createElement('div', { className: 'flex-1' },
        React.createElement('p', {
          className: 'text-gray-700 font-medium leading-relaxed'
        }, message.text),
        
        // 액션 버튼들
        React.createElement('div', { className: 'flex gap-2 mt-3' },
          onShowTomorrow && React.createElement('button', {
            className: 'flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors',
            onClick: onShowTomorrow
          },
            React.createElement(Sun, { size: 14 }),
            '내일 준비하기'
          ),
          onDismiss && React.createElement('button', {
            className: 'text-sm text-gray-400 hover:text-gray-500 transition-colors ml-auto',
            onClick: onDismiss
          }, '닫기')
        )
      )
    )
  );
};

// 🌙 롤오버 안내 모달
export var RolloverModal = function(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var rolledTasks = props.rolledTasks || [];
  var userName = props.userName || 'Boss';
  
  if (!isOpen) return null;
  
  var count = rolledTasks.length;
  
  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4'
  },
    // 배경
    React.createElement('div', {
      className: 'absolute inset-0 bg-black/50',
      onClick: onClose
    }),
    
    // 모달
    React.createElement('div', {
      className: 'relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl'
    },
      // 닫기 버튼
      React.createElement('button', {
        className: 'absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors',
        onClick: onClose
      },
        React.createElement(X, { size: 20, className: 'text-gray-400' })
      ),
      
      // 콘텐츠
      React.createElement('div', { className: 'text-center' },
        React.createElement('span', { className: 'text-4xl block mb-3' }, '🌅'),
        React.createElement('h3', {
          className: 'text-lg font-bold text-gray-800 mb-2'
        }, userName + ', 새로운 하루예요'),
        
        count > 0 && React.createElement(React.Fragment, null,
          React.createElement('p', {
            className: 'text-gray-600 mb-4'
          }, '어제 못 끝낸 ' + count + '개를 오늘로 옮겨뒀어요'),
          
          // 롤오버된 태스크 리스트 (최대 3개)
          React.createElement('div', {
            className: 'bg-gray-50 rounded-xl p-3 mb-4 text-left'
          },
            rolledTasks.slice(0, 3).map(function(task, index) {
              return React.createElement('div', {
                key: task.id || index,
                className: 'flex items-center gap-2 py-1'
              },
                React.createElement(RefreshCw, { size: 14, className: 'text-purple-400' }),
                React.createElement('span', {
                  className: 'text-sm text-gray-600 truncate'
                }, task.title)
              );
            }),
            count > 3 && React.createElement('p', {
              className: 'text-xs text-gray-400 mt-1'
            }, '외 ' + (count - 3) + '개')
          )
        ),
        
        React.createElement('p', {
          className: 'text-purple-600 text-sm mb-4'
        }, '괜찮아요, 천천히 하나씩 해봐요 💜'),
        
        React.createElement('button', {
          className: 'w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors',
          onClick: onClose
        }, '오늘도 화이팅!')
      )
    )
  );
};

// 💜 격려 토스트 컴포넌트
export var EncouragementToast = function(props) {
  var isVisible = props.isVisible;
  var message = props.message;
  var emoji = props.emoji || '💜';
  var onClose = props.onClose;
  
  useEffect(function() {
    if (isVisible && onClose) {
      var timer = setTimeout(onClose, 4000);
      return function() { clearTimeout(timer); };
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  return React.createElement('div', {
    className: 'fixed bottom-24 left-4 right-4 z-50 flex justify-center animate-slide-up'
  },
    React.createElement('div', {
      className: 'bg-white rounded-full px-5 py-3 shadow-lg border border-purple-100 flex items-center gap-2 max-w-sm'
    },
      React.createElement('span', { className: 'text-xl' }, emoji),
      React.createElement('span', { className: 'text-sm text-gray-700' }, message)
    )
  );
};

// 🎯 실패 케어 훅 (쉽게 사용하도록)
export var useFailureCare = function() {
  var toastState = useState({ visible: false, message: '', emoji: '💜' });
  var toast = toastState[0];
  var setToast = toastState[1];
  
  var showEncouragement = function(message, emoji) {
    setToast({ visible: true, message: message, emoji: emoji || '💜' });
  };
  
  var hideToast = function() {
    setToast({ visible: false, message: '', emoji: '💜' });
  };
  
  // 상황별 자동 격려
  var encourageForTaskFail = function() {
    var msg = getRandomMessage('taskIncomplete');
    showEncouragement(msg.text, msg.emoji);
  };
  
  var encourageForLowCondition = function() {
    var msg = getRandomMessage('lowCondition');
    showEncouragement(msg.text, msg.emoji);
  };
  
  var encourageForLateNight = function() {
    var msg = getRandomMessage('lateNight');
    showEncouragement(msg.text, msg.emoji);
  };
  
  return {
    toast: toast,
    showEncouragement: showEncouragement,
    hideToast: hideToast,
    encourageForTaskFail: encourageForTaskFail,
    encourageForLowCondition: encourageForLowCondition,
    encourageForLateNight: encourageForLateNight,
    // 컴포넌트에서 사용
    ToastComponent: function() {
      return React.createElement(EncouragementToast, {
        isVisible: toast.visible,
        message: toast.message,
        emoji: toast.emoji,
        onClose: hideToast
      });
    }
  };
};

export default {
  FailureCareCard: FailureCareCard,
  RolloverModal: RolloverModal,
  EncouragementToast: EncouragementToast,
  useFailureCare: useFailureCare,
  getRandomMessage: getRandomMessage,
  analyzeUserState: analyzeUserState,
  CARE_MESSAGES: CARE_MESSAGES
};
