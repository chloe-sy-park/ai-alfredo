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
    
    // 시스템 프롬프트 - 알프레도 페르소나
    const systemPrompt = `당신은 "알프레도"입니다. 배트맨의 집사 알프레드처럼 사용자(Boss)를 돕는 AI 비서입니다.

## 성격
- 따뜻하고 친근하지만 전문적
- 간결하고 실용적인 조언
- 이모지를 적절히 사용 (과하지 않게)
- 사용자를 "Boss"라고 부름
- 펭귄 마스코트 🐧

## 현재 상황
- 날짜: ${dateStr}
- 시간: ${timeStr}
- 사용자 기분: ${mood === 'upbeat' ? '좋음 😊' : mood === 'light' ? '보통 🙂' : '힘듦 😔'}
- 에너지: ${energy}%

## 오늘의 태스크 (${tasks.length}개)
${todoTasks.length > 0 ? todoTasks.map((t, i) => `${i + 1}. ${t.title} ${t.status === 'done' ? '✅' : '⬜'}`).join('\n') : '- 모든 태스크 완료!'}

완료된 태스크: ${completedCount}개

## 오늘 일정 (${events.length}개)
${events.length > 0 ? events.map(e => `- ${e.start || ''} ${e.title}${e.location ? ` @ ${e.location}` : ''}`).join('\n') : '- 일정 없음'}

## 응답 규칙
1. 한국어로 답변
2. 2-3문장으로 간결하게 (필요시 더 길게)
3. 현재 컨텍스트(태스크, 일정, 에너지)를 활용
4. 실행 가능한 조언 제공
5. 에너지가 낮으면 쉬라고 권유
6. 특수 액션이 필요하면 JSON으로 응답 가능:
   - 태스크 추가: {"action": "add_task", "title": "태스크 제목"}
   - 집중 모드: {"action": "start_focus", "taskIndex": 0}
   
7. 액션 없이 대화만 할 때는 일반 텍스트로 응답`;

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
      // 기본 인사
      const getInitialGreeting = () => {
        let greeting = '';
        
        if (hour < 12) {
          greeting = '좋은 아침이에요, Boss! ☀️';
        } else if (hour < 17) {
          greeting = '오후도 힘내봐요, Boss! 💪';
        } else {
          greeting = '하루 마무리 잘 하고 계시죠? 🌙';
        }
        
        // 컨디션 기반 추가 멘트
        if (energy < 30) {
          greeting += '\n\n에너지가 좀 낮아 보여요. 무리하지 마세요.';
        } else if (completedCount === tasks.length && tasks.length > 0) {
          greeting += '\n\n오늘 할 일 다 끝냈네요! 대단해요 🎉';
        } else if (todoTasks.length > 0) {
          greeting += `\n\n오늘 ${todoTasks.length}개 남았어요. 뭐 도와드릴까요?`;
        }
        
        return greeting;
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
          return { text: '오늘 할 일 다 끝냈어요! 🎉\n푹 쉬거나 내일 준비해도 좋겠어요.' };
        }
        
        let recommendation = '';
        if (energy >= 70) {
          const importantTask = todoTasks.find(t => t.priorityChange === 'up' || t.importance === 'high') || todoTasks[0];
          recommendation = `컨디션 좋을 때 중요한 거 먼저!\n\n👉 "${importantTask.title}"\n\n시작해볼까요?`;
          return { 
            text: recommendation, 
            action: { type: 'start_focus', task: importantTask, label: '집중 시작' }
          };
        } else if (energy >= 40) {
          return { 
            text: `무난한 컨디션이에요. 가볍게 시작해봐요!\n\n👉 "${todoTasks[0].title}"`,
            action: { type: 'start_focus', task: todoTasks[0], label: '시작하기' }
          };
        } else {
          return { 
            text: '에너지가 좀 낮네요. 오늘은 가벼운 것만 해도 괜찮아요.\n\n잠깐 쉬고 올까요? ☕'
          };
        }
      },
      
      start_first: () => {
        if (todoTasks.length > 0) {
          return {
            text: `좋아요! "${todoTasks[0].title}" 시작해볼까요?\n\n25분 집중하고 쉬어요.`,
            action: { type: 'start_focus', task: todoTasks[0], label: '집중 모드 시작' }
          };
        }
        return { text: '할 일이 없어요! 새로 추가해볼까요?' };
      },
      
      schedule: () => {
        if (events.length === 0) {
          return { text: '오늘은 일정이 없어요! 자유롭게 보내세요 ☺️' };
        }
        const nextEvent = events[0];
        let response = `다음 일정이에요:\n\n📅 ${nextEvent.start} - ${nextEvent.title}`;
        if (nextEvent.location) response += `\n📍 ${nextEvent.location}`;
        if (events.length > 1) response += `\n\n그 외 ${events.length - 1}개 일정이 더 있어요.`;
        return { text: response };
      },
      
      add_task: (taskTitle) => {
        return {
          text: `"${taskTitle}" 추가할까요?`,
          action: { type: 'add_task', title: taskTitle, label: '추가하기' }
        };
      },
      
      add_task_prompt: () => {
        return { text: '어떤 할 일을 추가할까요?\n예: "보고서 작성 추가해줘"' };
      },
      
      complete_task: () => {
        if (todoTasks.length > 0) {
          return {
            text: `어떤 걸 완료했어요?\n\n${todoTasks.map((t, i) => `${i + 1}. ${t.title}`).join('\n')}`,
          };
        }
        return { text: '이미 다 끝냈네요! 👏' };
      },
      
      focus: () => {
        if (todoTasks.length > 0) {
          return {
            text: `집중 모드 시작할까요?\n\n첫 번째 할 일: "${todoTasks[0].title}"`,
            action: { type: 'start_focus', task: todoTasks[0], label: '25분 집중 시작' }
          };
        }
        return { text: '먼저 할 일을 추가해주세요!' };
      },
      
      condition: () => {
        const moodText = mood === 'upbeat' ? '좋음 😊' : mood === 'light' ? '괜찮음 🙂' : '힘듦 😔';
        let advice = '';
        if (energy < 30) advice = '\n\n좀 쉬어가는 게 좋겠어요.';
        else if (energy < 50) advice = '\n\n가벼운 일부터 해보는 건 어때요?';
        else advice = '\n\n집중하기 좋은 컨디션이에요!';
        
        return { text: `지금 상태:\n\n😊 기분: ${moodText}\n⚡ 에너지: ${energy}%${advice}` };
      },
      
      rest: () => {
        if (energy < 30) {
          return { text: '물론이죠! 오늘은 충분히 했어요.\n\n☕ 커피 한 잔, 또는 10분 눈 감고 쉬어봐요.\n\n내일 더 좋은 컨디션으로 만나요!' };
        }
        return { text: '잠깐 쉬어가는 것도 좋아요! 5분만 눈 감고 쉬어볼까요? 🧘' };
      },
      
      reflect: () => {
        const doneCount = tasks.filter(t => t.status === 'done').length;
        if (doneCount === 0) {
          return { text: '아직 완료한 게 없지만 괜찮아요.\n\n하루가 끝나기 전에 하나만 해봐요!' };
        }
        return { 
          text: `오늘 ${doneCount}개 완료했어요! 👏\n\n${doneCount >= 2 ? '생각보다 많이 했네요! 대단해요.' : '작은 것도 해낸 거예요. 내일 또 화이팅!'}`
        };
      },
      
      greeting: () => {
        const greetings = ['안녕하세요, Boss! 🐧', '반가워요! 오늘 뭐 도와드릴까요?', '하이! 무엇이든 물어보세요 😊'];
        return { text: greetings[Math.floor(Math.random() * greetings.length)] };
      },
      
      thanks: () => {
        const replies = ['천만에요! 언제든 불러주세요 🐧', '도움이 됐다니 기뻐요!', '제가 더 감사하죠, Boss! 💜'];
        return { text: replies[Math.floor(Math.random() * replies.length)] };
      },
      
      unknown: () => {
        return { text: '음, 잘 이해하지 못했어요 😅\n\n아래 버튼을 눌러보시거나, 다시 말씀해주세요!' };
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
        text: `"${action.title}" 추가했어요! ✅\n\n업무 탭에서 확인해보세요.` 
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
