import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, X, Send, Sparkles, RefreshCw } from 'lucide-react';

// 🐧 알프레도 메시지 생성 (상황 인식형)
var getAlfredoMessage = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 0;
  var userName = props.userName || 'Boss';
  var urgentEvent = props.urgentEvent;
  
  var now = new Date();
  var hour = now.getHours();
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var total = tasks.length;
  var remaining = total - completed;
  
  // 하루 진행률 계산 (6시~23시 기준)
  var dayStart = 6;
  var dayEnd = 23;
  var dayProgress = Math.min(100, Math.max(0, 
    ((hour - dayStart) / (dayEnd - dayStart)) * 100
  ));
  
  // 완료율 계산
  var completionRate = total > 0 ? (completed / total) * 100 : 100;
  
  // 0. 컨디션 아직 안 물어봤을 때
  if (condition === 0) {
    return {
      line1: '안녕하세요, ' + userName + '!',
      line2: '오늘 컨디션은 어때요? 💜',
      urgent: false,
      askCondition: true
    };
  }
  
  // 1. 긴급 일정 (30분 이내)
  if (urgentEvent) {
    var title = urgentEvent.event.title || urgentEvent.event.summary || '일정';
    return {
      line1: '⚡ ' + urgentEvent.diffMin + '분 뒤 일정!',
      line2: '\"' + title.slice(0, 12) + '\" 준비하세요',
      urgent: true
    };
  }
  
  // 2. 컨디션 낮을 때 (우선 처리)
  if (condition <= 2) {
    return {
      line1: '오늘은 무리하지 말아요, ' + userName,
      line2: '꼭 필요한 것만 천천히 💜',
      urgent: false,
      lowEnergy: true
    };
  }
  
  // 3. 🎯 성취도 + 시간대 복합 분석
  if (total > 0) {
    // 3-1. 모두 완료! 🎉
    if (remaining === 0) {
      return {
        line1: '오늘 다 해냈어요! 🎉',
        line2: '정말 대단해요, ' + userName,
        urgent: false
      };
    }
    
    // 3-2. 위기 상황: 하루 80% 이상 지났는데 완료 0개
    if (dayProgress >= 80 && completed === 0) {
      if (hour >= 21) {
        return {
          line1: '오늘 좀 바빴나봐요 🌙',
          line2: '괜찮아요, 내일 다시 해봐요',
          urgent: false
        };
      }
      return {
        line1: '오늘 좀 바빴나봐요',
        line2: '딱 하나만 해볼까요? ✨',
        urgent: false
      };
    }
    
    // 3-3. 위기 상황: 저녁인데 많이 남음 (50% 이상 미완료)
    if (hour >= 17 && hour < 21 && completionRate < 50) {
      return {
        line1: remaining + '개 남았어요',
        line2: '가장 쉬운 것부터 해볼까요? 💪',
        urgent: false
      };
    }
    
    // 3-4. 진행 중: 일부 완료
    if (completed > 0 && remaining > 0) {
      // 절반 이상 했으면 칭찬
      if (completionRate >= 50) {
        return {
          line1: '벌써 절반 넘었어요! 👏',
          line2: remaining + '개만 더 하면 끝!',
          urgent: false
        };
      }
      return {
        line1: completed + '개 완료! 잘하고 있어요 👏',
        line2: remaining + '개 남았어요',
        urgent: false
      };
    }
    
    // 3-5. 아직 시작 안 함 (낮 시간)
    if (completed === 0 && hour < 17) {
      return {
        line1: '오늘 할 일이 ' + total + '개 있어요',
        line2: '첫 번째부터 시작해볼까요? ✨',
        urgent: false
      };
    }
  }
  
  // 4. 시간대별 기본 메시지 (할 일 없거나 모두 완료 시)
  var greeting = '';
  var subtext = '';
  
  if (hour >= 5 && hour < 9) {
    greeting = '좋은 아침이에요, ' + userName;
    subtext = '오늘 하루도 함께할게요 ☀️';
  } else if (hour >= 9 && hour < 12) {
    greeting = '좋은 오전이에요, ' + userName;
    subtext = '오늘도 화이팅! ✨';
  } else if (hour >= 12 && hour < 14) {
    greeting = '점심은 드셨어요? 🍚';
    subtext = '배고프면 집중력이 떨어져요';
  } else if (hour >= 14 && hour < 17) {
    greeting = '좋은 오후예요, ' + userName;
    subtext = '오늘도 잘하고 있어요 💪';
  } else if (hour >= 17 && hour < 21) {
    // 할 일 남아있으면 이 분기 안 탐 (위에서 처리됨)
    greeting = '오늘 하루 수고했어요 💜';
    subtext = '이제 좀 쉬어도 돼요';
  } else {
    greeting = '이 시간엔 쉬셔야죠 🌙';
    subtext = '내일도 함께할게요';
  }
  
  return { line1: greeting, line2: subtext, urgent: false };
};

// 📜 초기 대화 히스토리 생성
var generateInitialHistory = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var userName = props.userName || 'Boss';
  var condition = props.condition || 3;
  
  var history = [];
  var now = new Date();
  var hour = now.getHours();
  
  // 아침 인사 (9시 이후면 추가)
  if (hour >= 9) {
    history.push({
      id: 'init-1',
      time: '09:00',
      type: 'alfredo',
      text: '좋은 아침이에요, ' + userName + '! 물 한 잔 먼저 마셔요 💧'
    });
  }
  
  // 컨디션 기록
  if (condition > 0) {
    var conditionEmoji = ['😫', '😔', '😐', '😊', '🔥'][condition - 1];
    var conditionText = condition <= 2 
      ? '오늘은 좀 힘드시군요. 무리하지 마세요 💜'
      : condition >= 4
        ? '컨디션 좋으시네요! 오늘 잘 될 거예요 ✨'
        : '알겠어요! 차근차근 해봐요';
    
    history.push({
      id: 'init-2',
      time: '오늘',
      type: 'action',
      text: userName + '의 컨디션: ' + conditionEmoji
    });
    history.push({
      id: 'init-3',
      time: '',
      type: 'alfredo',
      text: conditionText
    });
  }
  
  // 완료된 태스크들
  var completed = tasks.filter(function(t) { return t.completed; });
  completed.forEach(function(task, index) {
    var taskHour = 10 + index;
    if (taskHour <= hour) {
      history.push({
        id: 'task-' + index,
        time: (taskHour < 10 ? '0' : '') + taskHour + ':00',
        type: 'action',
        text: '✅ \"' + task.title + '\" 완료!'
      });
      
      // 칭찬 메시지
      var praises = ['잘했어요! 👏', '대단해요!', '하나 끝! ✨', '좋아요!'];
      history.push({
        id: 'praise-' + index,
        time: '',
        type: 'alfredo',
        text: praises[index % praises.length]
      });
    }
  });
  
  // 빈 히스토리면 기본 메시지
  if (history.length === 0) {
    history.push({
      id: 'init-default',
      time: '지금',
      type: 'alfredo',
      text: '안녕하세요 ' + userName + '! 무엇을 도와드릴까요? 💜'
    });
  }
  
  return history;
};

// 🐧 알프레도 아일랜드 (미니멀)
export var AlfredoIslandMinimal = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var condition = props.condition || 0;
  var userName = props.userName || 'Boss';
  var urgentEvent = props.urgentEvent;
  var onOpenChat = props.onOpenChat; // 전체 채팅 페이지로 이동
  
  var expandedState = useState(false);
  var isExpanded = expandedState[0];
  var setExpanded = expandedState[1];
  
  var inputState = useState('');
  var inputText = inputState[0];
  var setInputText = inputState[1];
  
  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];
  
  // 대화 메시지 (초기 히스토리 + 실제 대화)
  var messagesState = useState([]);
  var messages = messagesState[0];
  var setMessages = messagesState[1];
  
  var chatEndRef = useRef(null);
  
  // 메시지 생성
  var message = useMemo(function() {
    return getAlfredoMessage({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName,
      urgentEvent: urgentEvent
    });
  }, [tasks, events, condition, userName, urgentEvent]);
  
  // 초기 히스토리 (한 번만 생성)
  var initialHistory = useMemo(function() {
    return generateInitialHistory({
      tasks: tasks,
      events: events,
      userName: userName,
      condition: condition
    });
  }, []); // 의존성 비움 - 처음 한 번만
  
  // 확장 시 초기 히스토리 로드
  useEffect(function() {
    if (isExpanded && messages.length === 0) {
      setMessages(initialHistory);
    }
  }, [isExpanded]);
  
  // 스크롤 to bottom
  useEffect(function() {
    if (isExpanded && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isExpanded, messages]);
  
  // Claude API 호출
  var callClaudeAPI = async function(userMessage) {
    var today = new Date();
    var dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
    var timeStr = today.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    
    var todoTasks = tasks.filter(function(t) { return !t.completed; });
    var completedCount = tasks.filter(function(t) { return t.completed; }).length;
    
    var systemPrompt = '당신은 \"알프레도\"입니다. 배트맨의 집사 알프레드처럼 사용자(Boss)를 돕는 AI 비서입니다.\\n\\n' +
      '## 성격\\n' +
      '- 따뜻하고 친근하지만 전문적\\n' +
      '- 간결하고 실용적인 조언 (2-3문장)\\n' +
      '- 이모지를 적절히 사용 (과하지 않게)\\n' +
      '- 사용자를 \"Boss\"라고 부름\\n' +
      '- 펭귄 마스코트 🐧\\n\\n' +
      '## 현재 상황\\n' +
      '- 날짜: ' + dateStr + '\\n' +
      '- 시간: ' + timeStr + '\\n' +
      '- 사용자 컨디션: ' + condition + '/5\\n\\n' +
      '## 오늘의 태스크\\n' +
      (todoTasks.length > 0 
        ? todoTasks.map(function(t, i) { return (i + 1) + '. ' + t.title; }).join('\\n')
        : '- 할 일 없음') + '\\n\\n' +
      '완료: ' + completedCount + '개\\n\\n' +
      '## 응답 규칙\\n' +
      '1. 한국어로 답변\\n' +
      '2. 2-3문장으로 간결하게\\n' +
      '3. 현재 컨텍스트 활용\\n' +
      '4. 실행 가능한 조언';
    
    // 대화 히스토리에서 user/alfredo 메시지만 추출
    var conversationMessages = messages
      .filter(function(m) { return m.type === 'user' || m.type === 'alfredo'; })
      .slice(-6) // 최근 6개만
      .map(function(m) {
        return {
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.text
        };
      });
    
    conversationMessages.push({ role: 'user', content: userMessage });
    
    try {
      var response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages,
          systemPrompt: systemPrompt
        })
      });
      
      var data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Chat failed');
      }
      
      return data.text || '죄송해요, 잠시 문제가 생겼어요 😅';
    } catch (error) {
      console.error('Claude API Error:', error);
      return '네트워크 오류가 발생했어요. 다시 시도해주세요 🐧';
    }
  };
  
  // 메시지 전송
  var handleSend = async function() {
    if (!inputText.trim() || isLoading) return;
    
    var userText = inputText.trim();
    var userId = 'user-' + Date.now();
    var loadingId = 'loading-' + Date.now();
    
    // 사용자 메시지 추가
    setMessages(function(prev) {
      return prev.concat([{
        id: userId,
        time: '지금',
        type: 'user',
        text: userText
      }]);
    });
    
    setInputText('');
    setIsLoading(true);
    
    // 로딩 메시지 추가
    setMessages(function(prev) {
      return prev.concat([{
        id: loadingId,
        time: '',
        type: 'alfredo',
        text: '...',
        isLoading: true
      }]);
    });
    
    // Claude API 호출
    var responseText = await callClaudeAPI(userText);
    
    // 로딩 메시지를 실제 응답으로 교체
    setMessages(function(prev) {
      return prev.map(function(msg) {
        if (msg.id === loadingId) {
          return {
            id: loadingId,
            time: '',
            type: 'alfredo',
            text: responseText,
            isLoading: false
          };
        }
        return msg;
      });
    });
    
    setIsLoading(false);
  };
  
  var handleKeyPress = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  // 스타일
  var bgColor = message.urgent 
    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
    : message.lowEnergy
      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
      : message.askCondition
        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
        : 'bg-white border-gray-100';
  
  var textColor = message.urgent ? 'text-orange-800' : 'text-gray-800';
  
  return React.createElement(React.Fragment, null,
    // 축소 상태 (2줄)
    React.createElement('div', {
      className: 'mx-4 mt-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ' + bgColor,
      onClick: function() { setExpanded(true); }
    },
      React.createElement('div', { className: 'p-4 flex items-center gap-3' },
        // 펭귄 (긴급시 애니메이션)
        React.createElement('div', { 
          className: 'text-2xl ' + (message.urgent ? 'animate-bounce' : '')
        }, '🐧'),
        
        // 텍스트
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { 
            className: 'font-medium truncate ' + textColor 
          }, message.line1),
          React.createElement('p', { 
            className: 'text-sm truncate ' + (message.urgent ? 'text-orange-600' : 'text-gray-500')
          }, message.line2)
        ),
        
        // 화살표 또는 AI 배지
        message.askCondition
          ? React.createElement('span', {
              className: 'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600'
            },
              React.createElement(Sparkles, { size: 12 }),
              '체크'
            )
          : React.createElement(ChevronRight, { 
              size: 20, 
              className: 'text-gray-400 flex-shrink-0' 
            })
      )
    ),
    
    // 확장 상태 (플로팅 대화창)
    isExpanded && React.createElement('div', {
      className: 'fixed inset-0 z-[60] flex flex-col justify-end'
    },
      // 배경 딤
      React.createElement('div', {
        className: 'absolute inset-0 bg-black/40',
        onClick: function() { setExpanded(false); }
      }),
      
      // 대화창 컨테이너 (하단 여백 확보)
      React.createElement('div', {
        className: 'relative w-full max-w-lg mx-auto px-4 pb-24'
      },
        // 대화창
        React.createElement('div', {
          className: 'bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col',
          style: { maxHeight: '60vh' }
        },
          // 헤더
          React.createElement('div', {
            className: 'flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-white flex-shrink-0'
          },
            React.createElement('div', { className: 'flex items-center gap-2' },
              React.createElement('span', { className: 'text-xl' }, '🐧'),
              React.createElement('span', { className: 'font-semibold text-gray-800' }, '알프레도'),
              React.createElement('span', { 
                className: 'text-xs text-white bg-gradient-to-r from-purple-500 to-indigo-500 px-2 py-0.5 rounded-full'
              }, 'AI')
            ),
            React.createElement('div', { className: 'flex items-center gap-2' },
              // 전체 채팅으로 이동 버튼
              onOpenChat && React.createElement('button', {
                className: 'text-xs text-purple-500 hover:text-purple-600 transition-colors',
                onClick: function(e) { 
                  e.stopPropagation();
                  setExpanded(false);
                  onOpenChat();
                }
              }, '전체 화면 →'),
              React.createElement('button', {
                className: 'p-1 rounded-full hover:bg-gray-200 transition-colors',
                onClick: function() { setExpanded(false); }
              },
                React.createElement(X, { size: 20, className: 'text-gray-500' })
              )
            )
          ),
          
          // 대화 내용
          React.createElement('div', {
            className: 'flex-1 p-4 overflow-y-auto'
          },
            messages.map(function(item, index) {
              var isAction = item.type === 'action';
              var isNotification = item.type === 'notification';
              var isAlfredo = item.type === 'alfredo';
              var isUser = item.type === 'user';
              
              return React.createElement('div', {
                key: item.id || index,
                className: 'mb-3 ' + (isUser ? 'text-right' : '')
              },
                // 시간 (있을 때만)
                item.time && React.createElement('div', {
                  className: 'text-xs text-gray-400 mb-1'
                }, item.time),
                
                // 메시지
                item.isLoading
                  ? React.createElement('div', {
                      className: 'inline-flex items-center gap-1 bg-gray-50 rounded-lg px-3 py-2'
                    },
                      React.createElement('span', { className: 'w-2 h-2 bg-purple-400 rounded-full animate-bounce', style: { animationDelay: '0ms' } }),
                      React.createElement('span', { className: 'w-2 h-2 bg-purple-400 rounded-full animate-bounce', style: { animationDelay: '150ms' } }),
                      React.createElement('span', { className: 'w-2 h-2 bg-purple-400 rounded-full animate-bounce', style: { animationDelay: '300ms' } })
                    )
                  : React.createElement('div', {
                      className: isUser
                        ? 'inline-block text-sm text-white bg-purple-500 rounded-2xl rounded-tr-md px-4 py-2'
                        : isAction 
                          ? 'text-sm text-purple-600 bg-purple-50 rounded-lg px-3 py-2 inline-block'
                          : isNotification
                            ? 'text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200'
                            : isAlfredo
                              ? 'inline-block text-sm text-gray-700 bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2'
                              : 'text-gray-800'
                    }, 
                      isAlfredo && !isUser && React.createElement('span', { className: 'mr-1' }, '🐧'),
                      item.text
                    )
              );
            }),
            
            React.createElement('div', { ref: chatEndRef })
          ),
          
          // 입력창
          React.createElement('div', {
            className: 'p-3 border-t bg-gray-50 flex-shrink-0'
          },
            React.createElement('div', {
              className: 'flex items-center gap-2 bg-white rounded-full border px-4 py-2 ' + (isLoading ? 'opacity-70' : '')
            },
              React.createElement('input', {
                type: 'text',
                placeholder: isLoading ? '알프레도가 생각 중...' : '알프레도에게 말하기...',
                className: 'flex-1 outline-none text-sm',
                value: inputText,
                onChange: function(e) { setInputText(e.target.value); },
                onKeyPress: handleKeyPress,
                disabled: isLoading
              }),
              React.createElement('button', {
                className: 'p-1.5 rounded-full transition-all ' + 
                  (inputText.trim() && !isLoading 
                    ? 'text-white bg-purple-500 hover:bg-purple-600' 
                    : 'text-gray-300'),
                onClick: handleSend,
                disabled: !inputText.trim() || isLoading
              },
                isLoading
                  ? React.createElement(RefreshCw, { size: 16, className: 'animate-spin' })
                  : React.createElement(Send, { size: 16 })
              )
            )
          )
        )
      )
    )
  );
};

export default AlfredoIslandMinimal;
