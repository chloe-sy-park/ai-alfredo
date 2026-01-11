import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, X, Send, Sparkles, RefreshCw } from 'lucide-react';
import { getSimpleBriefingMessage, generateMorningBriefingV2 } from '../alfredo/MorningBriefingV2';
import { getSimpleEveningMessage, generateEveningBriefingV2 } from '../alfredo/EveningBriefingV2';

// 🐧 알프레도 표정 시스템
var ALFREDO_EXPRESSIONS = {
  default: { emoji: '🐧', label: '기본' },
  happy: { emoji: '😊🐧', label: '기쁨' },
  excited: { emoji: '🎉🐧', label: '신남' },
  cheer: { emoji: '💪🐧', label: '응원' },
  comfort: { emoji: '🤗🐧', label: '위로' },
  worried: { emoji: '😰🐧', label: '걱정' },
  sleepy: { emoji: '😴🐧', label: '졸림' },
  thinking: { emoji: '🤔🐧', label: '생각' },
  love: { emoji: '💜🐧', label: '애정' },
  proud: { emoji: '🌟🐧', label: '자랑' } // 저녁 성취용 추가
};

// 상황에 따른 표정 결정
var getAlfredoExpression = function(props) {
  var tasks = props.tasks || [];
  var condition = props.condition || 0;
  var urgentEvent = props.urgentEvent;
  var messageType = props.messageType || '';
  
  var now = new Date();
  var hour = now.getHours();
  var completed = tasks.filter(function(t) { return t.completed; }).length;
  var total = tasks.length;
  var completionRate = total > 0 ? (completed / total) * 100 : 0;
  
  // 1. 긴급 상황 - 걱정 표정
  if (urgentEvent || messageType === 'urgent') {
    return ALFREDO_EXPRESSIONS.worried;
  }
  
  // 2. 밤 시간 (21시~5시) - 졸림 표정
  if (hour >= 21 || hour < 5) {
    return ALFREDO_EXPRESSIONS.sleepy;
  }
  
  // 3. 컨디션 낮음 (1-2) - 위로 표정
  if (condition > 0 && condition <= 2) {
    return ALFREDO_EXPRESSIONS.comfort;
  }
  
  // 4. 모든 태스크 완료 - 신남 표정
  if (total > 0 && completed === total) {
    return ALFREDO_EXPRESSIONS.excited;
  }
  
  // 5. 저녁 + 높은 완료율 - 자랑 표정 (저녁 브리핑용)
  if (hour >= 18 && completionRate >= 70) {
    return ALFREDO_EXPRESSIONS.proud;
  }
  
  // 6. 절반 이상 완료 - 기쁨 표정
  if (completionRate >= 50 && completed > 0) {
    return ALFREDO_EXPRESSIONS.happy;
  }
  
  // 7. 컨디션 물어볼 때 - 애정 표정
  if (condition === 0 || messageType === 'askCondition') {
    return ALFREDO_EXPRESSIONS.love;
  }
  
  // 8. 할 일 많이 남음 + 저녁 - 응원 표정
  if (hour >= 17 && total > 0 && completionRate < 50) {
    return ALFREDO_EXPRESSIONS.cheer;
  }
  
  // 9. 컨디션 좋음 (4-5) - 기쁨 표정
  if (condition >= 4) {
    return ALFREDO_EXPRESSIONS.happy;
  }
  
  // 기본 표정
  return ALFREDO_EXPRESSIONS.default;
};

// 📜 시간대 판단 함수
var getTimeOfDay = function() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

// 📜 초기 대화 히스토리 생성 (시간대별 분기)
var generateInitialHistory = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var userName = props.userName || 'Boss';
  var condition = props.condition || 3;
  var weather = props.weather;
  
  var timeOfDay = getTimeOfDay();
  var isEvening = timeOfDay === 'evening' || timeOfDay === 'night';
  
  var history = [];
  
  // 저녁/밤 시간대 → 저녁 브리핑
  if (isEvening) {
    var eveningBriefing = generateEveningBriefingV2({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName
    });
    
    // 1. 저녁 인사
    history.push({
      id: 'init-1',
      time: '오늘',
      type: 'alfredo',
      text: eveningBriefing.greeting
    });
    
    // 2. 성취 요약
    history.push({
      id: 'init-2',
      time: '',
      type: 'action',
      text: eveningBriefing.achievement.emoji + ' ' + eveningBriefing.achievement.message
    });
    
    // 3. 상세 메시지
    history.push({
      id: 'init-3',
      time: '',
      type: 'alfredo',
      text: eveningBriefing.achievement.detail
    });
    
    // 4. 완료한 태스크 (있으면)
    if (eveningBriefing.summary.completedTaskNames.length > 0) {
      var completedStr = eveningBriefing.summary.completedTaskNames.slice(0, 3).join(', ');
      history.push({
        id: 'init-4',
        time: '',
        type: 'action',
        text: '✅ 완료: ' + completedStr
      });
    }
    
    // 5. 내일 미리보기
    if (eveningBriefing.tomorrow.message) {
      history.push({
        id: 'init-5',
        time: '',
        type: 'notification',
        text: '📅 ' + eveningBriefing.tomorrow.message
      });
    }
    
    // 6. 회고 프롬프트 (선택적)
    history.push({
      id: 'init-6',
      time: '',
      type: 'alfredo',
      text: '💭 ' + eveningBriefing.reflection.prompt
    });
    
    // 7. 마무리 인사
    history.push({
      id: 'init-7',
      time: '',
      type: 'alfredo',
      text: eveningBriefing.closing
    });
    
  } else {
    // 아침/오후 → 아침 브리핑
    var briefing = generateMorningBriefingV2({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName,
      weather: weather
    });
    
    // 1. 스몰토크 인사 (theSkimm 스타일)
    history.push({
      id: 'init-1',
      time: '오늘',
      type: 'alfredo',
      text: briefing.greeting
    });
    
    // 2. 날씨 인사이트 (있을 경우)
    if (briefing.weather) {
      history.push({
        id: 'init-2',
        time: '',
        type: 'alfredo',
        text: briefing.weather
      });
    }
    
    // 3. 일정 인사이트 (있을 경우)
    if (briefing.event) {
      history.push({
        id: 'init-3',
        time: '',
        type: 'notification',
        text: briefing.event
      });
    }
    
    // 4. 태스크 인사이트
    if (briefing.task) {
      history.push({
        id: 'init-4',
        time: '',
        type: 'action',
        text: briefing.task.summary
      });
      if (briefing.task.suggestion) {
        history.push({
          id: 'init-5',
          time: '',
          type: 'alfredo',
          text: briefing.task.suggestion
        });
      }
    }
    
    // 5. 완료된 태스크들 (오늘 기록)
    var completed = tasks.filter(function(t) { return t.completed; });
    completed.forEach(function(task, index) {
      if (index < 3) {
        history.push({
          id: 'task-' + index,
          time: '',
          type: 'action',
          text: '✅ \"' + task.title.slice(0, 20) + '\" 완료!'
        });
      }
    });
    
    // 완료된 게 있으면 칭찬
    if (completed.length > 0) {
      var praises = [
        '잘하고 있어요! 👏',
        '대단해요, Boss! ✨',
        '오늘도 착착 진행 중! 💜'
      ];
      history.push({
        id: 'praise',
        time: '',
        type: 'alfredo',
        text: praises[Math.floor(Math.random() * praises.length)]
      });
    }
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
  var weather = props.weather;
  var onOpenChat = props.onOpenChat;
  
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
  
  // 시간대 판단
  var timeOfDay = useMemo(function() {
    return getTimeOfDay();
  }, []);
  
  var isEvening = timeOfDay === 'evening' || timeOfDay === 'night';
  
  // 메시지 생성 (시간대별 분기)
  var message = useMemo(function() {
    if (isEvening) {
      return getSimpleEveningMessage({
        tasks: tasks,
        condition: condition,
        userName: userName
      });
    }
    return getSimpleBriefingMessage({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName,
      urgentEvent: urgentEvent,
      weather: weather
    });
  }, [tasks, events, condition, userName, urgentEvent, weather, isEvening]);
  
  // 표정 결정
  var expression = useMemo(function() {
    return getAlfredoExpression({
      tasks: tasks,
      condition: condition,
      urgentEvent: urgentEvent,
      messageType: message.type
    });
  }, [tasks, condition, urgentEvent, message.type]);
  
  // 초기 히스토리 (한 번만 생성)
  var initialHistory = useMemo(function() {
    return generateInitialHistory({
      tasks: tasks,
      events: events,
      userName: userName,
      condition: condition,
      weather: weather
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
    
    // 시간대에 따른 시스템 프롬프트 분기
    var contextHint = isEvening 
      ? '지금은 저녁/밤이에요. 하루를 마무리하는 대화를 나눠요. 성취를 인정하고, 쉬라고 격려해요.' 
      : '지금은 아침/낮이에요. 하루를 계획하고 시작하는 대화를 나눠요.';
    
    var systemPrompt = '당신은 \"알프레도\"입니다. 배트맨의 집사 알프레드처럼 사용자(Boss)를 돕는 AI 비서입니다.\n\n' +
      '## 성격\n' +
      '- 따뜻하고 친근하지만 전문적\n' +
      '- theSkimm처럼 친구가 말하는 듯한 자연스러운 어조\n' +
      '- 간결하고 실용적인 조언 (2-3문장)\n' +
      '- 이모지를 적절히 사용 (과하지 않게)\n' +
      '- 사용자를 \"Boss\"라고 부름\n' +
      '- 펭귄 마스코트 🐧\n\n' +
      '## ADHD 친화적 응답 규칙\n' +
      '- 한 번에 하나의 행동만 제안\n' +
      '- 컨디션 낮으면 격려 위주\n' +
      '- 실패해도 괜찮다는 메시지\n' +
      '- 직접 질문보다 스몰토크로 자연스럽게\n\n' +
      '## 현재 상황\n' +
      '- 날짜: ' + dateStr + '\n' +
      '- 시간: ' + timeStr + '\n' +
      '- 사용자 컨디션: ' + condition + '/5\n' +
      '- ' + contextHint + '\n\n' +
      '## 오늘의 태스크\n' +
      (todoTasks.length > 0 
        ? todoTasks.map(function(t, i) { return (i + 1) + '. ' + t.title; }).join('\n')
        : '- 할 일 없음') + '\n\n' +
      '완료: ' + completedCount + '개\n\n' +
      '## 응답 규칙\n' +
      '1. 한국어로 답변\n' +
      '2. 2-3문장으로 간결하게\n' +
      '3. 현재 컨텍스트 활용\n' +
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
  
  // 스타일 (메시지 타입에 따른 색상 + 저녁 타입 추가)
  var bgColor = message.type === 'urgent' 
    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
    : message.type === 'lowEnergy'
      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
      : message.type === 'askCondition'
        ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
        : message.type === 'allDone' || message.type === 'highCompletion'
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
          : message.type === 'noTasks'
            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
            : 'bg-white border-gray-100';
  
  var textColor = message.type === 'urgent' ? 'text-orange-800' : 'text-gray-800';
  
  // 표정 애니메이션 클래스
  var expressionAnimation = message.type === 'urgent' 
    ? 'animate-bounce' 
    : (message.type === 'allDone' || message.type === 'highCompletion')
      ? 'animate-pulse'
      : '';
  
  return React.createElement(React.Fragment, null,
    // 축소 상태 (2줄)
    React.createElement('div', {
      className: 'mx-4 mt-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ' + bgColor,
      onClick: function() { setExpanded(true); }
    },
      React.createElement('div', { className: 'p-4 flex items-center gap-3' },
        // 펭귄 표정 (상황별 변화)
        React.createElement('div', { 
          className: 'text-2xl flex-shrink-0 ' + expressionAnimation
        }, expression.emoji),
        
        // 텍스트
        React.createElement('div', { className: 'flex-1 min-w-0' },
          React.createElement('p', { 
            className: 'font-medium truncate ' + textColor 
          }, message.line1),
          React.createElement('p', { 
            className: 'text-sm truncate ' + (message.type === 'urgent' ? 'text-orange-600' : 'text-gray-500')
          }, message.line2)
        ),
        
        // 화살표 또는 AI 배지
        message.type === 'askCondition'
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
              // 헤더에서도 현재 표정 표시
              React.createElement('span', { className: 'text-xl' }, expression.emoji),
              React.createElement('span', { className: 'font-semibold text-gray-800' }, '알프레도'),
              React.createElement('span', { 
                className: 'text-xs text-white bg-gradient-to-r from-purple-500 to-indigo-500 px-2 py-0.5 rounded-full'
              }, isEvening ? '마무리' : 'AI')
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
                      // 알프레도 메시지에 현재 표정 표시
                      isAlfredo && !isUser && React.createElement('span', { className: 'mr-1' }, expression.emoji.charAt(0) === '🐧' ? '🐧' : expression.emoji.slice(0, 2)),
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
                placeholder: isLoading ? '알프레도가 생각 중...' : (isEvening ? '오늘 하루 어땠어요?' : '알프레도에게 말하기...'),
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
