import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Calendar, Target, Clock, Zap, CheckCircle2, RefreshCw, Plus } from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

const AlfredoChat = ({ onBack, tasks, events, mood, energy, onAddTask, onToggleTask, onStartFocus, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [contextQuickReplies, setContextQuickReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const hour = new Date().getHours();
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const todoTasks = tasks.filter(t => t.status !== 'done');
  
  // Claude API 호출 함수 (시스템 프롬프트는 서버에서 관리)
  const callClaudeAPI = async (userMessage, conversationHistory) => {
    // 컨텍스트 객체 구성 (서버로 전달)
    const context = {
      mood,
      energy,
      tasks: tasks.map(t => ({ title: t.title, status: t.status })),
      events: events.map(e => ({ title: e.title, start: e.start })),
    };

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
          context: context
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
      // 기본 인사 (선제적, 쿨하게)
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

export default AlfredoChat;
