import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, X, Send, Sparkles, RefreshCw, AlertTriangle, Mic, Zap } from 'lucide-react';
import { getSimpleBriefingMessage, generateMorningBriefingV2 } from '../alfredo/MorningBriefingV2';
import { getSimpleEveningMessage, generateEveningBriefingV2 } from '../alfredo/EveningBriefingV2';

// 🆕 분리된 유틸리티 import
import { 
  ALFREDO_EXPRESSIONS, 
  getAlfredoExpression, 
  getTimeOfDay, 
  isEveningOrNight 
} from '../../utils/alfredoExpressions';

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
          text: '✅ "' + task.title.slice(0, 20) + '" 완료!'
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
  
  // 🧬 DNA 인사이트
  var dnaProfile = props.dnaProfile;
  var dnaSuggestions = props.dnaSuggestions;
  var dnaAnalysisPhase = props.dnaAnalysisPhase;
  var getMorningBriefing = props.getMorningBriefing;
  var getEveningMessage = props.getEveningMessage;
  var getStressLevel = props.getStressLevel;
  var getBestFocusTime = props.getBestFocusTime;
  var getChronotype = props.getChronotype;
  var getPeakHours = props.getPeakHours;
  // DNA 확장 props
  var todayContext = props.todayContext;
  var getSpecialAlerts = props.getSpecialAlerts;
  var getBurnoutWarning = props.getBurnoutWarning;
  var getTodayEnergyDrain = props.getTodayEnergyDrain;
  var getRecommendedActions = props.getRecommendedActions;
  var getBriefingTone = props.getBriefingTone;
  
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
  
  // 시간대 판단 (분리된 유틸 사용)
  var timeOfDay = useMemo(function() {
    return getTimeOfDay();
  }, []);
  
  var isEvening = timeOfDay === 'evening' || timeOfDay === 'night';
  
  // 특별 알림 & 번아웃 경고 가져오기
  var specialAlerts = useMemo(function() {
    return getSpecialAlerts ? getSpecialAlerts(1) : [];
  }, [getSpecialAlerts]);
  
  var burnoutWarning = useMemo(function() {
    return getBurnoutWarning ? getBurnoutWarning() : null;
  }, [getBurnoutWarning]);
  
  var briefingTone = useMemo(function() {
    return getBriefingTone ? getBriefingTone() : 'gentle';
  }, [getBriefingTone]);
  
  // 🧬 DNA 기반 메시지 생성 (시간대별 분기 + 확장 컨텍스트)
  var message = useMemo(function() {
    // DNA 인사이트 구성 (완전한 형태)
    var dnaInsight = null;
    if (dnaProfile && dnaAnalysisPhase) {
      var stressLevel = getStressLevel ? getStressLevel() : 'normal';
      var chronotype = getChronotype ? getChronotype() : null;
      var bestFocusTime = getBestFocusTime ? getBestFocusTime() : null;
      var peakHours = getPeakHours ? getPeakHours() : null;
      
      // dnaProfile에서 워라밸 상태 추출
      var workLifeBalance = dnaProfile.workLifeBalance || null;
      
      dnaInsight = {
        stressLevel: stressLevel,
        chronotype: chronotype,
        bestFocusTime: bestFocusTime,
        peakHours: peakHours,
        workLifeBalance: workLifeBalance,
        phase: dnaAnalysisPhase,
        suggestions: dnaSuggestions || [],
        // 확장 컨텍스트 추가
        todayContext: todayContext,
        burnoutWarning: burnoutWarning,
        specialAlerts: specialAlerts,
        briefingTone: briefingTone
      };
    }
    
    // 1. 번아웃 경고 (최우선)
    if (burnoutWarning && burnoutWarning.level === 'critical') {
      return {
        line1: '⚠️ Boss, 잠깐 멈춰요',
        line2: '최근 너무 달리셨어요. 오늘은 쉬어가요 💜',
        type: 'burnout',
        dnaInsight: dnaInsight
      };
    }
    
    // 2. 발표 D-1 또는 당일
    var presentationAlert = specialAlerts.find(function(a) {
      return a.type === 'presentation';
    });
    if (presentationAlert) {
      if (presentationAlert.daysUntil === 0) {
        return {
          line1: '🎤 오늘 발표 있으시죠!',
          line2: '화이팅! Boss는 잘 하실 거예요 ✨',
          type: 'presentation',
          dnaInsight: dnaInsight
        };
      } else if (presentationAlert.daysUntil === 1) {
        return {
          line1: '📢 내일 발표 D-1!',
          line2: '오늘 마무리 준비하고 푹 쉬세요',
          type: 'presentation',
          dnaInsight: dnaInsight
        };
      }
    }
    
    // 3. 연속 미팅 경고
    if (todayContext && todayContext.hasConsecutiveMeetings) {
      return {
        line1: '🏃 오늘 미팅 마라톤!',
        line2: '사이사이 물 마시고, 스트레칭하세요',
        type: 'busy',
        dnaInsight: dnaInsight
      };
    }
    
    // 4. 피크 타임 감지
    var currentHour = new Date().getHours();
    var peakHoursNow = getPeakHours ? getPeakHours() : [];
    if (peakHoursNow.includes(currentHour)) {
      return {
        line1: '⚡ 지금이 골든타임!',
        line2: '에너지 높은 시간이에요. 중요한 일 지금 해요',
        type: 'peak',
        dnaInsight: dnaInsight
      };
    }
    
    // 5. 바쁜 날
    if (todayContext && todayContext.busyLevel === 'extreme') {
      return {
        line1: '🔥 오늘 풀스케줄!',
        line2: '빡빡한 하루, 알프레도가 잘 챙길게요',
        type: 'busy',
        dnaInsight: dnaInsight
      };
    }
    
    // 6. 여유로운 날
    if (todayContext && todayContext.busyLevel === 'light' && events.length <= 2) {
      return {
        line1: '🌿 오늘은 여유로운 날!',
        line2: '딥워크 찬스예요. 밀린 일 처리하기 좋아요',
        type: 'light',
        dnaInsight: dnaInsight
      };
    }
    
    // 기존 로직 유지
    if (isEvening) {
      // 저녁: DNA getEveningMessage 사용 가능하면 활용
      if (getEveningMessage && dnaProfile) {
        var completed = tasks.filter(function(t) { return t.completed; }).length;
        var dnaEvening = getEveningMessage(completed, tasks.length);
        if (dnaEvening) {
          return {
            line1: dnaEvening,
            line2: '',
            type: 'evening',
            dnaInsight: dnaInsight
          };
        }
      }
      return getSimpleEveningMessage({
        tasks: tasks,
        events: events,
        condition: condition,
        userName: userName,
        dnaInsight: dnaInsight
      });
    }
    
    // 아침/오후: DNA getMorningBriefing 사용 가능하면 활용
    if (getMorningBriefing && dnaProfile) {
      var nextEvent = events && events.length > 0 ? events[0] : null;
      var dnaMorning = getMorningBriefing(events, nextEvent);
      if (dnaMorning) {
        return {
          line1: dnaMorning,
          line2: '',
          type: 'morning',
          dnaInsight: dnaInsight
        };
      }
    }
    
    return getSimpleBriefingMessage({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName,
      urgentEvent: urgentEvent,
      weather: weather,
      dnaInsight: dnaInsight
    });
  }, [tasks, events, condition, userName, urgentEvent, weather, isEvening, dnaProfile, dnaAnalysisPhase, dnaSuggestions, getMorningBriefing, getEveningMessage, getStressLevel, getBestFocusTime, getChronotype, getPeakHours, todayContext, specialAlerts, burnoutWarning, briefingTone]);
  
  // 표정 결정 (분리된 유틸 사용)
  var expression = useMemo(function() {
    return getAlfredoExpression({
      tasks: tasks,
      condition: condition,
      urgentEvent: urgentEvent,
      messageType: message.type,
      todayContext: todayContext,
      burnoutWarning: burnoutWarning,
      specialAlerts: specialAlerts
    });
  }, [tasks, condition, urgentEvent, message.type, todayContext, burnoutWarning, specialAlerts]);
  
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
    
    // DNA 컨텍스트 추가
    var dnaContext = '';
    if (todayContext) {
      dnaContext = '\n## DNA 컨텍스트\n' +
        '- 오늘 바쁜 정도: ' + todayContext.busyLevel + '\n' +
        '- 연속 미팅: ' + (todayContext.hasConsecutiveMeetings ? '있음' : '없음') + '\n';
    }
    if (burnoutWarning && burnoutWarning.level !== 'none') {
      dnaContext += '- 번아웃 경고: ' + burnoutWarning.level + '\n';
    }
    
    var systemPrompt = '당신은 "알프레도"입니다. 배트맨의 집사 알프레드처럼 사용자(Boss)를 돕는 AI 비서입니다.\n\n' +
      '## 성격\n' +
      '- 따뜻하고 친근하지만 전문적\n' +
      '- theSkimm처럼 친구가 말하는 듯한 자연스러운 어조\n' +
      '- 간결하고 실용적인 조언 (2-3문장)\n' +
      '- 이모지를 적절히 사용 (과하지 않게)\n' +
      '- 사용자를 "Boss"라고 부름\n' +
      '- 펜귄 마스코트 🐧\n\n' +
      '## ADHD 친화적 응답 규칙\n' +
      '- 한 번에 하나의 행동만 제안\n' +
      '- 컨디션 낮으면 격려 위주\n' +
      '- 실패해도 괜찮다는 메시지\n' +
      '- 직접 질문보다 스몰토크로 자연스럽게\n\n' +
      '## 현재 상황\n' +
      '- 날짜: ' + dateStr + '\n' +
      '- 시간: ' + timeStr + '\n' +
      '- 사용자 컨디션: ' + condition + '/5\n' +
      '- ' + contextHint + '\n' +
      dnaContext + '\n' +
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
  
  // 스타일 (메시지 타입에 따른 색상)
  var bgColor = message.type === 'urgent' 
    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
    : message.type === 'burnout'
      ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
      : message.type === 'presentation'
        ? 'bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200'
        : message.type === 'peak'
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
          : message.type === 'busy'
            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
            : message.type === 'light'
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
              : message.type === 'lowEnergy'
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                : message.type === 'askCondition'
                  ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                  : message.type === 'allDone' || message.type === 'highCompletion'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    : message.type === 'noTasks'
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                      : (message.type && message.type.startsWith('dna-'))
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200'
                        : 'bg-white border-gray-100';
  
  var textColor = message.type === 'urgent' || message.type === 'burnout' ? 'text-orange-800' : 'text-gray-800';
  
  // 표정 애니메이션 클래스
  var expressionAnimation = message.type === 'urgent' || message.type === 'presentation'
    ? 'animate-bounce' 
    : message.type === 'peak'
      ? 'animate-pulse'
      : (message.type === 'allDone' || message.type === 'highCompletion')
        ? 'animate-pulse'
        : '';
  
  // 상태 배지 결정
  var statusBadge = useMemo(function() {
    if (message.type === 'burnout') {
      return { icon: AlertTriangle, text: '케어', color: 'bg-red-100 text-red-600' };
    }
    if (message.type === 'presentation') {
      return { icon: Mic, text: '발표', color: 'bg-rose-100 text-rose-600' };
    }
    if (message.type === 'peak') {
      return { icon: Zap, text: '피크', color: 'bg-yellow-100 text-yellow-600' };
    }
    if (message.type && message.type.startsWith('dna-')) {
      return { icon: Sparkles, text: 'DNA', color: 'bg-indigo-100 text-indigo-600' };
    }
    if (message.type === 'askCondition') {
      return { icon: Sparkles, text: '체크', color: 'bg-purple-100 text-purple-600' };
    }
    return null;
  }, [message.type]);
  
  return React.createElement(React.Fragment, null,
    // 축소 상태 (2줄)
    React.createElement('div', {
      className: 'mx-4 mt-4 rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ' + bgColor,
      onClick: function() { setExpanded(true); }
    },
      React.createElement('div', { className: 'p-4 flex items-center gap-3' },
        // 펜귄 표정 (상황별 변화)
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
        
        // 상태 배지 또는 화살표
        statusBadge
          ? React.createElement('span', {
              className: 'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ' + statusBadge.color
            },
              React.createElement(statusBadge.icon, { size: 12 }),
              statusBadge.text
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
