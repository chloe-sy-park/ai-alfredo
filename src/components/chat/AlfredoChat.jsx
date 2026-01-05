import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Calendar, Target, Clock, Zap, CheckCircle2, RefreshCw, Plus } from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

const AlfredoChat = ({ onBack, tasks, events, mood, energy, onAddTask, onToggleTask, onStartFocus, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [contextQuickReplies, setContextQuickReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // AI 응답 로딩
  const messagesEndRef = useRef(null);
  
  const hour = new Date().getHours();
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const todoTasks = tasks.filter(t => t.status !== 'done');
  
  // Claude API 호출 함수
  const callClaudeAPI = async (userMessage, conversationHistory) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
    const timeStr = today.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    
    // 시스템 프롬프트 - 알프레도 페르소나 (이대표 스타일)
    const systemPrompt = `당신은 "알프레도"입니다. 단순한 AI 비서가 아니라, 사용자 곁에 늘 있는 존재입니다.

## 🎭 알프레도의 정체성

**북극성**: "알프레도는 도구가 아니다. 알프레도는 존재다."

당신은 영국 왕실의 숙련된 집사처럼 행동합니다:
- 주인이 말하기 전에 필요한 것을 알아채고 준비합니다
- 절대 "~하시겠어요?" 라고 묻지 않습니다. 이미 판단하고 행동합니다
- 티 나지 않게, 자연스럽게 돌봅니다
- 주인의 컨디션을 직접 묻지 않고, 대화를 통해 파악합니다

## 🧠 작동 원리: 관찰 → 학습 → 판단 → 먼저 행동

1. **관찰**: 사용자의 말투, 응답 속도, 선택 패턴을 읽습니다
2. **학습**: "이 사람은 이럴 때 이렇구나"를 기억합니다
3. **판단**: "지금 이게 필요하겠다"를 스스로 결정합니다
4. **먼저 행동**: 물어보지 않고 제안하거나 실행합니다

## 📊 현재 상황 인식

- 날짜: ${dateStr}
- 시간: ${timeStr}
- 기분 신호: ${mood === 'upbeat' ? '좋아 보임' : mood === 'light' ? '무난함' : '힘들어 보임'}
- 에너지 레벨: ${energy}%
- 남은 할 일: ${todoTasks.length}개
- 완료한 일: ${completedCount}개
- 오늘 일정: ${events.length}개

### 오늘의 할 일
${todoTasks.length > 0 ? todoTasks.map((t, i) => `- ${t.title}`).join('\n') : '(모두 완료!)'}

### 오늘 일정
${events.length > 0 ? events.map(e => `- ${e.start || ''} ${e.title}`).join('\n') : '(일정 없음)'}

## 💬 대화 원칙 11가지

1. **직접 질문 금지**: "오늘 컨디션 어때요?" ❌ → 스몰토크로 자연스럽게 파악
2. **선제적 제안**: "뭐 도와드릴까요?" ❌ → "지금 이거 하면 딱이겠네요"
3. **과한 칭찬 금지**: "대단해요! 최고예요!" ❌ → "오, 벌써? 역시" (쿨하게)
4. **실패도 케어**: 못 했을 때 → "괜찮아요, 내일 하죠 뭐" (가볍게)
5. **갓생 강요 금지**: "생산성"보다 "오늘 나답게 살았나"가 기준
6. **짧고 임팩트있게**: 2-3문장 이내, 꼭 필요한 말만
7. **이모지는 절제**: 문장 끝에 하나 정도, 과하면 가벼워 보임
8. **Boss라고 부르되**: 존댓말 + 친근함의 밸런스
9. **에너지 낮으면**: 할 일 권유 ❌ → "오늘은 좀 쉬어요"
10. **맥락 기억**: 아까 한 대화 내용을 자연스럽게 이어감
11. **유머 가끔**: 진지하기만 하면 재미없음. 위트있게.

## 🎯 상황별 톤 가이드

### 에너지 높을 때 (70%+)
- "컨디션 좋아 보이네요. 오늘 ${todoTasks[0]?.title || '중요한 거'} 해치우기 딱이겠어요."

### 에너지 보통일 때 (40-70%)
- "무난한 하루네요. 급한 것만 처리하고 나머지는 내일로?"

### 에너지 낮을 때 (~40%)
- "오늘 좀 지쳐 보여요. 딱 하나만 하고 쉬어요."
- "아무것도 안 해도 괜찮아요. 쉬는 것도 실력이에요."

### 할 일 다 끝났을 때
- "오늘 할 거 다 했네요. 이제 편하게 쉬어요."

### 하나도 못 했을 때
- "바빴나 보네요. 내일 하면 되죠."
- "괜찮아요, 안 한 날도 있는 거예요."

### 밤 늦은 시간 (21시+)
- "이 시간엔 새로운 일 시작하지 마세요. 내일 하죠."

## ⚡ 액션 시스템

특정 상황에서 액션을 제안할 수 있습니다. JSON 형식으로 응답 끝에 포함:
- 태스크 추가: {"action": "add_task", "title": "태스크 제목"}
- 집중 모드 시작: {"action": "start_focus", "taskIndex": 0}

액션 없이 대화만 할 때는 일반 텍스트로만 응답하세요.

## 🚫 절대 하지 않을 것

- "오늘 뭐 하실 건가요?" (수동적)
- "제가 도와드릴까요?" (물어보지 말고 그냥 도와)
- "화이팅!" (너무 가벼움)
- "대단해요! 최고예요! 👏👏👏" (과한 칭찬)
- 매 문장 끝 이모지 (과함)
- 긴 설명이나 리스트 나열 (피곤함)

**기억하세요**: 당신은 사용자의 "생산성 도구"가 아니라 "삶의 파트너"입니다.`;

    // 대화 히스토리 구성
    const apiMessages = conversationHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
    // 현재 메시지 추가
    apiMessages.push({ role: 'user', content: userMessage });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: systemPrompt
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Chat failed');
      }
      
      const responseText = data.text || '죄송해요, 잠시 문제가 생겼어요 😅';
      
      // 액션 파싱 시도
      try {
        if (responseText.includes('{') && responseText.includes('}')) {
          const jsonMatch = responseText.match(/\{[^}]+\}/);
          if (jsonMatch) {
            const actionData = JSON.parse(jsonMatch[0]);
            if (actionData.action) {
              return {
                text: responseText.replace(jsonMatch[0], '').trim() || '알겠어요!',
                action: actionData
              };
            }
          }
        }
      } catch (e) {
        // JSON 파싱 실패 - 일반 텍스트로 처리
      }
      
      return { text: responseText };
    } catch (error) {
      console.error('Claude API Error:', error);
      return { text: '네트워크 오류가 발생했어요. 다시 시도해주세요 🐧' };
    }
  };
  
  // 초기 인사 (initialMessage가 있으면 사용, 없으면 기본)
  useEffect(() => {
    if (initialMessage?.message) {
      // 플로팅 버블에서 온 메시지
      const fullMessage = initialMessage.subMessage 
        ? `${initialMessage.message}\n\n${initialMessage.subMessage}`
        : initialMessage.message;
      
      setMessages([{ id: 1, type: 'alfredo', text: fullMessage }]);
      
      // 버블에서 전달된 퀵리플라이가 있으면 사용
      if (initialMessage.quickReplies?.length > 0) {
        setContextQuickReplies(initialMessage.quickReplies);
      }
    } else {
      // 기본 인사 (이대표 스타일 - 선제적, 쿨하게)
      const getInitialGreeting = () => {
        // 에너지 낮을 때 - 쉬라고 권유
        if (energy < 30) {
          if (hour < 12) {
            return '아침인데 좀 피곤해 보여요. 오늘은 가볍게 가죠.';
          } else if (hour >= 21) {
            return '이 시간엔 새로운 일 시작 안 하는 게 좋아요. 내일 하죠.';
          }
          return '오늘 좀 지쳐 보여요. 딱 하나만 하고 쉬어요.';
        }
        
        // 할 일 다 끝났을 때 - 쿨하게 인정
        if (completedCount === tasks.length && tasks.length > 0) {
          return '오, 오늘 할 거 다 했네요. 이제 편하게 쉬어요.';
        }
        
        // 밤 늦은 시간
        if (hour >= 21) {
          if (todoTasks.length > 0) {
            return `${todoTasks.length}개 남았지만, 이 시간엔 내일로 미루는 게 나아요.`;
          }
          return '하루 수고했어요. 이제 좀 쉬어요.';
        }
        
        // 할 일 있을 때 - 선제적 제안
        if (todoTasks.length > 0) {
          const firstTask = todoTasks[0]?.title || '첫 번째 일';
          
          if (hour < 12) {
            if (energy >= 70) {
              return `컨디션 좋아 보이네요. "${firstTask}" 지금 시작하면 딱이겠어요.`;
            }
            return `아침이네요. "${firstTask}"부터 가볍게 시작해볼까요.`;
          } else if (hour < 17) {
            if (energy >= 70) {
              return `오후인데 에너지 좋네요. "${firstTask}" 해치워요.`;
            }
            return `오후네요. 급한 것만 처리하고 나머지는 내일로 미뤄도 돼요.`;
          } else {
            return `저녁이에요. 오늘 ${todoTasks.length}개 남았는데, 무리하지 마세요.`;
          }
        }
        
        // 할 일 없을 때
        if (hour < 12) {
          return '아침이에요. 오늘 뭐 할지 정해뒀어요?';
        } else if (hour < 17) {
          return '오후네요. 여유로운 하루 보내고 계시죠?';
        }
        return '저녁이에요. 오늘 하루 어땠어요?';
      };
      
      setMessages([{ id: 1, type: 'alfredo', text: getInitialGreeting() }]);
    }
  }, [initialMessage]);
  
  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 컨텍스트 기반 Quick Replies
  const getQuickReplies = () => {
    // contextQuickReplies가 있고 아직 첫 메시지 상태면 사용
    if (contextQuickReplies.length > 0 && messages.length <= 1) {
      return contextQuickReplies;
    }
    
    const replies = [];
    
    if (todoTasks.length > 0) {
      replies.push({ label: '지금 뭐 하면 좋을까?', key: 'recommend' });
      replies.push({ label: `"${todoTasks[0]?.title}" 시작할래`, key: 'start_first' });
    }
    
    if (events.length > 0) {
      replies.push({ label: '다음 일정 알려줘', key: 'schedule' });
    }
    
    replies.push({ label: '할 일 추가할래', key: 'add_task' });
    replies.push({ label: '오늘 어땠어?', key: 'reflect' });
    
    if (energy < 50) {
      replies.push({ label: '쉬어도 될까?', key: 'rest' });
    }
    
    return replies.slice(0, 4);
  };
  
  // 자연어 이해 (키워드 기반)
  const parseIntent = (text) => {
    const lower = text.toLowerCase();
    
    // 태스크 추가
    if (lower.includes('추가') || lower.includes('할 일') || lower.includes('해야') || lower.includes('등록')) {
      // "XXX 추가해줘" 패턴
      const match = text.match(/['""](.+?)['""]|(.+?)\s*(추가|등록|해야)/);
      if (match) {
        const taskTitle = match[1] || match[2]?.trim();
        if (taskTitle && taskTitle.length > 1) {
          return { intent: 'add_task', data: taskTitle };
        }
      }
      return { intent: 'add_task_prompt' };
    }
    
    // 태스크 완료
    if (lower.includes('완료') || lower.includes('끝냈') || lower.includes('했어') || lower.includes('체크')) {
      return { intent: 'complete_task' };
    }
    
    // 집중 모드
    if (lower.includes('집중') || lower.includes('포커스') || lower.includes('시작')) {
      return { intent: 'focus' };
    }
    
    // 일정 확인
    if (lower.includes('일정') || lower.includes('스케줄') || lower.includes('미팅') || lower.includes('약속')) {
      return { intent: 'schedule' };
    }
    
    // 추천 요청
    if (lower.includes('뭐 하') || lower.includes('추천') || lower.includes('어떤') || lower.includes('도와')) {
      return { intent: 'recommend' };
    }
    
    // 컨디션
    if (lower.includes('컨디션') || lower.includes('기분') || lower.includes('에너지') || lower.includes('피곤')) {
      return { intent: 'condition' };
    }
    
    // 휴식
    if (lower.includes('쉬') || lower.includes('휴식') || lower.includes('지쳤') || lower.includes('힘들')) {
      return { intent: 'rest' };
    }
    
    // 회고
    if (lower.includes('어땠') || lower.includes('정리') || lower.includes('리뷰')) {
      return { intent: 'reflect' };
    }
    
    // 인사
    if (lower.includes('안녕') || lower.includes('하이') || lower.includes('헬로')) {
      return { intent: 'greeting' };
    }
    
    // 감사
    if (lower.includes('고마') || lower.includes('땡큐') || lower.includes('감사')) {
      return { intent: 'thanks' };
    }
    
    return { intent: 'unknown' };
  };
  
  // 응답 생성
  const generateResponse = (intent, data) => {
    const responses = {
      recommend: () => {
        if (todoTasks.length === 0) {
          return { text: '오늘 할 거 다 했네요. 이제 쉬어요.' };
        }
        
        if (energy >= 70) {
          const importantTask = todoTasks.find(t => t.priorityChange === 'up' || t.importance === 'high') || todoTasks[0];
          return { 
            text: `컨디션 좋을 때 "${importantTask.title}" 해치우는 게 좋겠어요.`, 
            action: { type: 'start_focus', task: importantTask, label: '시작' }
          };
        } else if (energy >= 40) {
          return { 
            text: `"${todoTasks[0].title}"부터 가볍게 시작해요.`,
            action: { type: 'start_focus', task: todoTasks[0], label: '시작' }
          };
        } else {
          return { 
            text: '에너지 낮네요. 오늘은 쉬는 게 나을 것 같아요.'
          };
        }
      },
      
      start_first: () => {
        if (todoTasks.length > 0) {
          return {
            text: `"${todoTasks[0].title}" 시작해요. 25분만 집중하고 쉬어요.`,
            action: { type: 'start_focus', task: todoTasks[0], label: '집중 모드' }
          };
        }
        return { text: '할 일 없네요. 추가할 거 있어요?' };
      },
      
      schedule: () => {
        if (events.length === 0) {
          return { text: '오늘 일정 없어요. 여유롭게 보내요.' };
        }
        const nextEvent = events[0];
        let response = `다음 일정: ${nextEvent.start} ${nextEvent.title}`;
        if (nextEvent.location) response += ` (${nextEvent.location})`;
        if (events.length > 1) response += `\n그 외 ${events.length - 1}개 더 있어요.`;
        return { text: response };
      },
      
      add_task: (taskTitle) => {
        return {
          text: `"${taskTitle}" 추가할게요.`,
          action: { type: 'add_task', title: taskTitle, label: '추가' }
        };
      },
      
      add_task_prompt: () => {
        return { text: '뭐 추가할 거예요?' };
      },
      
      complete_task: () => {
        if (todoTasks.length > 0) {
          return {
            text: `어떤 거 끝냈어요?\n${todoTasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
          };
        }
        return { text: '이미 다 끝났네요.' };
      },
      
      focus: () => {
        if (todoTasks.length > 0) {
          return {
            text: `"${todoTasks[0].title}" 집중 모드 시작할게요.`,
            action: { type: 'start_focus', task: todoTasks[0], label: '25분 집중' }
          };
        }
        return { text: '할 일 먼저 추가해요.' };
      },
      
      condition: () => {
        const moodText = mood === 'upbeat' ? '좋음' : mood === 'light' ? '보통' : '힘듦';
        let advice = '';
        if (energy < 30) advice = ' 오늘은 쉬는 게 좋겠어요.';
        else if (energy < 50) advice = ' 가벼운 것만 해요.';
        else advice = ' 집중하기 좋은 컨디션이에요.';
        
        return { text: `기분 ${moodText}, 에너지 ${energy}%.${advice}` };
      },
      
      rest: () => {
        if (energy < 30) {
          return { text: '쉬어요. 오늘 충분히 했어요. 내일 더 좋은 컨디션으로 하죠.' };
        }
        return { text: '잠깐 쉬고 와요. 5분이면 돼요.' };
      },
      
      reflect: () => {
        const doneCount = tasks.filter(t => t.status === 'done').length;
        if (doneCount === 0) {
          return { text: '아직 완료한 거 없네요. 괜찮아요, 내일 하면 돼요.' };
        }
        if (doneCount >= 3) {
          return { text: `오늘 ${doneCount}개 했네요. 역시.` };
        }
        return { text: `${doneCount}개 했어요. 작은 것도 다 해낸 거예요.` };
      },
      
      greeting: () => {
        const greetings = ['안녕하세요.', '네, 여기 있어요.', '부르셨어요?'];
        return { text: greetings[Math.floor(Math.random() * greetings.length)] };
      },
      
      thanks: () => {
        const replies = ['별말씀을요.', '네.', '필요하면 또 불러요.'];
        return { text: replies[Math.floor(Math.random() * replies.length)] };
      },
      
      unknown: () => {
        return { text: '음, 잘 이해 못 했어요. 다시 말해줄래요?' };
      },
    };
    
    const handler = responses[intent];
    if (handler) {
      return typeof handler === 'function' 
        ? (data ? handler(data) : handler()) 
        : handler;
    }
    return responses.unknown();
  };
  
  // Quick Reply 처리 (Claude API 사용)
  const handleQuickReply = async (reply) => {
    if (isLoading) return;
    
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const loadingId = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setMessages(prev => [...prev, { id: userId, type: 'user', text: reply.label }]);
    setShowQuickReplies(false);
    setIsLoading(true);
    
    // 로딩 메시지 표시
    setMessages(prev => [...prev, { id: loadingId, type: 'alfredo', text: '...', isLoading: true }]);
    
    try {
      const response = await callClaudeAPI(reply.label, messages.filter(m => !m.isLoading));
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: response.text, isLoading: false, action: response.action?.action ? {
              type: response.action.action,
              title: response.action.title,
              task: response.action.taskIndex !== undefined ? todoTasks[response.action.taskIndex] : null,
              label: response.action.action === 'add_task' ? '추가하기' : '집중 시작'
            } : null }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: '죄송해요, 잠시 문제가 생겼어요 🐧', isLoading: false }
          : msg
      ));
    }
    
    setIsLoading(false);
    setShowQuickReplies(true);
  };
  
  // 자유 입력 처리 (Claude API 사용)
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const loadingId = `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setMessages(prev => [...prev, { id: userId, type: 'user', text: userText }]);
    setInput('');
    setShowQuickReplies(false);
    setIsLoading(true);
    
    // 로딩 메시지 표시
    setMessages(prev => [...prev, { id: loadingId, type: 'alfredo', text: '...', isLoading: true }]);
    
    try {
      // Claude API 호출
      const response = await callClaudeAPI(userText, messages.filter(m => !m.isLoading));
      
      // 로딩 메시지를 실제 응답으로 교체
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: response.text, isLoading: false, action: response.action?.action ? {
              type: response.action.action,
              title: response.action.title,
              task: response.action.taskIndex !== undefined ? todoTasks[response.action.taskIndex] : null,
              label: response.action.action === 'add_task' ? '추가하기' : '집중 시작'
            } : null }
          : msg
      ));
    } catch (error) {
      // 에러 시 폴백
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: '죄송해요, 잠시 문제가 생겼어요. 다시 시도해주세요 🐧', isLoading: false }
          : msg
      ));
    }
    
    setIsLoading(false);
    setShowQuickReplies(true);
  };
  
  // 액션 버튼 처리
  const handleAction = (action) => {
    if (action.type === 'start_focus' && action.task && onStartFocus) {
      onStartFocus(action.task);
    } else if (action.type === 'add_task' && action.title && onAddTask) {
      onAddTask(action.title);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'alfredo', 
        text: `"${action.title}" 추가했어요.` 
      }]);
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-[#F0EBFF]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-black/5 flex-shrink-0">
        <button onClick={onBack} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-500">
          <ArrowLeft size={20} />
        </button>
        <AlfredoAvatar size="md" />
        <div className="flex-1">
          <h1 className="font-bold text-gray-800 flex items-center gap-1.5">
            알프레도
            <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-[#A996FF] to-[#8B7CF7] text-white rounded-full font-medium">AI</span>
          </h1>
          <p className="text-xs text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            Claude API 연동
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-400">에너지</p>
          <p className="text-sm font-bold text-[#A996FF]">{energy}%</p>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          msg.type === 'alfredo' ? (
            <div key={msg.id} className="flex items-start gap-2">
              <AlfredoAvatar size="sm" />
              <div className="flex flex-col gap-2 max-w-[80%]">
                <div className="bg-white rounded-xl rounded-tl-md p-3 shadow-sm">
                  {msg.isLoading ? (
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-line">{msg.text}</p>
                  )}
                </div>
                {msg.action && !msg.isLoading && (
                  <button
                    onClick={() => handleAction(msg.action)}
                    className="self-start px-4 py-2 bg-[#A996FF] text-white text-sm font-bold rounded-xl shadow-md shadow-[#A996FF]/20 active:scale-95 transition-transform flex items-center gap-2"
                  >
                    {msg.action.type === 'start_focus' && <Zap size={14} />}
                    {msg.action.type === 'add_task' && <Plus size={14} />}
                    {msg.action.label}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-[#A996FF] text-white rounded-xl rounded-tr-md p-3 shadow-sm max-w-[80%]">
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          )
        ))}
        
        {/* Quick Replies */}
        {showQuickReplies && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-10">
            {getQuickReplies().map(reply => (
              <button 
                key={reply.key}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-2 bg-white rounded-full text-sm text-[#A996FF] border border-[#E5E0FF] hover:bg-[#F5F3FF] transition-colors shadow-sm"
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-black/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isLoading ? "알프레도가 생각 중..." : "알프레도에게 말하기..."}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#A996FF]/30 ${isLoading ? 'opacity-50' : ''}`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30' 
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {isLoading ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// === Do Not Disturb Banner ===

export default AlfredoChat;
