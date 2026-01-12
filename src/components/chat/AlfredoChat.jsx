import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Calendar, Target, Clock, Zap, CheckCircle2, RefreshCw, Plus, ThumbsUp, ThumbsDown, X } from 'lucide-react';

// Common Components
import { AlfredoAvatar } from '../common';

// Learning Utilities
import { saveFeedback, detectTeachingIntent, saveLearning } from '../../utils/alfredoLearning';

const AlfredoChat = ({ onBack, tasks, events, mood, energy, onAddTask, onToggleTask, onStartFocus, initialMessage, dnaProfile }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [contextQuickReplies, setContextQuickReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({}); // messageId -> 'positive' | 'negative'
  const [showNegativeModal, setShowNegativeModal] = useState(null); // messageId
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const hour = new Date().getHours();
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const todoTasks = tasks.filter(t => t.status !== 'done');
  
  // 부정 피드백 이유 옵션
  const negativeFeedbackReasons = [
    { id: 'wrong_tone', label: '톤이 안 맞아요', icon: '😕' },
    { id: 'not_helpful', label: '도움이 안 돼요', icon: '🤷' },
    { id: 'too_long', label: '너무 길어요', icon: '📜' },
    { id: 'bad_timing', label: '타이밍이 안 좋아요', icon: '⏰' },
    { id: 'other', label: '기타', icon: '💭' }
  ];
  
  // Claude API 호출 함수
  const callClaudeAPI = async (userMessage, conversationHistory) => {
    const context = {
      mood,
      energy,
      tasks: tasks.map(t => ({ title: t.title, status: t.status })),
      events: events.map(e => ({ title: e.title, start: e.start })),
      dna: dnaProfile ? {
        chronotype: dnaProfile.chronotype,
        peakHours: dnaProfile.peakProductivityHours,
        stressLevel: dnaProfile.stressIndicators?.level,
        workLifeBalance: dnaProfile.workLifeBalance,
        busiestDay: dnaProfile.busiestDay
      } : null
    };

    const apiMessages = conversationHistory.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));
    
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
      } catch (e) {}
      
      return { text: responseText };
    } catch (error) {
      console.error('Claude API Error:', error);
      return { text: '네트워크 오류가 발생했어요. 다시 시도해주세요 🐧' };
    }
  };
  
  // 피드백 처리
  const handleFeedback = (messageId, messageText, type) => {
    if (feedbackGiven[messageId]) return;
    
    if (type === 'negative') {
      setShowNegativeModal(messageId);
    } else {
      saveFeedback(messageId, messageText, 'positive', { energy, mood });
      setFeedbackGiven(prev => ({ ...prev, [messageId]: 'positive' }));
    }
  };
  
  // 부정 피드백 상세 선택
  const handleNegativeFeedbackReason = (messageId, messageText, reason) => {
    saveFeedback(messageId, messageText, 'negative', { 
      energy, 
      mood, 
      reason: reason.id,
      reasonLabel: reason.label 
    });
    setFeedbackGiven(prev => ({ ...prev, [messageId]: 'negative' }));
    setShowNegativeModal(null);
  };
  
  // 대화로 가르치기 감지
  const checkTeachingIntent = (userMessage) => {
    const teaching = detectTeachingIntent(userMessage);
    if (teaching.detected) {
      saveLearning({
        category: teaching.category,
        content: teaching.content,
        source: 'chat',
        confidence: 50
      });
      return true;
    }
    return false;
  };
  
  // 초기 인사
  useEffect(() => {
    if (initialMessage?.message) {
      const fullMessage = initialMessage.subMessage 
        ? `${initialMessage.message}\n\n${initialMessage.subMessage}`
        : initialMessage.message;
      
      setMessages([{ id: 'init-1', type: 'alfredo', text: fullMessage }]);
      
      if (initialMessage.quickReplies?.length > 0) {
        setContextQuickReplies(initialMessage.quickReplies);
      }
    } else {
      const getInitialGreeting = () => {
        if (energy < 30) {
          if (hour < 12) return '아침인데 좀 피곤해 보여요. 오늘은 가볍게 가죠.';
          if (hour >= 21) return '이 시간엔 새로운 일 시작 안 하는 게 좋아요. 내일 하죠.';
          return '오늘 좀 지쳐 보여요. 딱 하나만 하고 쉬어요.';
        }
        
        if (completedCount === tasks.length && tasks.length > 0) {
          return '오, 오늘 할 거 다 했네요. 이제 편하게 쉬어요.';
        }
        
        if (hour >= 21) {
          if (todoTasks.length > 0) return `${todoTasks.length}개 남았지만, 이 시간엔 내일로 미루는 게 나아요.`;
          return '하루 수고했어요. 이제 좀 쉬어요.';
        }
        
        if (todoTasks.length > 0) {
          const firstTask = todoTasks[0]?.title || '첫 번째 일';
          if (hour < 12) {
            if (energy >= 70) return `컨디션 좋아 보이네요. "${firstTask}" 지금 시작하면 딱이겠어요.`;
            return `아침이네요. "${firstTask}"부터 가볍게 시작해볼까요.`;
          } else if (hour < 17) {
            if (energy >= 70) return `오후인데 에너지 좋네요. "${firstTask}" 해치워요.`;
            return '급한 것만 처리하고 나머지는 내일로 미뤄도 돼요.';
          }
          return `저녁이에요. 오늘 ${todoTasks.length}개 남았는데, 무리하지 마세요.`;
        }
        
        if (hour < 12) return '아침이에요. 오늘 뭐 할지 정해뒀어요?';
        if (hour < 17) return '오후네요. 여유로운 하루 보내고 계시죠?';
        return '저녁이에요. 오늘 하루 어땠어요?';
      };
      
      setMessages([{ id: 'init-1', type: 'alfredo', text: getInitialGreeting() }]);
    }
  }, [initialMessage]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const getQuickReplies = () => {
    if (contextQuickReplies.length > 0 && messages.length <= 1) {
      return contextQuickReplies;
    }
    
    const replies = [];
    
    if (todoTasks.length > 0) {
      replies.push({ label: '지금 뭐 하면 좋을까?', key: 'recommend' });
      replies.push({ label: `"${todoTasks[0]?.title?.slice(0, 8)}${todoTasks[0]?.title?.length > 8 ? '...' : ''}" 시작`, key: 'start_first' });
    }
    
    if (events.length > 0) replies.push({ label: '다음 일정', key: 'schedule' });
    replies.push({ label: '할 일 추가', key: 'add_task' });
    if (energy < 50) replies.push({ label: '쉬어도 될까?', key: 'rest' });
    
    return replies.slice(0, 4);
  };
  
  const handleQuickReply = async (reply) => {
    if (isLoading) return;
    
    const userId = `user-${Date.now()}`;
    const loadingId = `loading-${Date.now()}`;
    
    setMessages(prev => [...prev, { id: userId, type: 'user', text: reply.label }]);
    setShowQuickReplies(false);
    setIsLoading(true);
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
        msg.id === loadingId ? { ...msg, text: '죄송해요, 잠시 문제가 생겼어요 🐧', isLoading: false } : msg
      ));
    }
    
    setIsLoading(false);
    setShowQuickReplies(true);
  };
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    const userId = `user-${Date.now()}`;
    const loadingId = `loading-${Date.now()}`;
    
    // 대화로 가르치기 감지
    const isTeaching = checkTeachingIntent(userText);
    
    setMessages(prev => [...prev, { id: userId, type: 'user', text: userText }]);
    setInput('');
    setShowQuickReplies(false);
    setIsLoading(true);
    inputRef.current?.blur();
    setMessages(prev => [...prev, { id: loadingId, type: 'alfredo', text: '...', isLoading: true }]);
    
    try {
      const response = await callClaudeAPI(userText, messages.filter(m => !m.isLoading));
      
      // 가르치기 감지됐으면 응답에 "기억해둘게요" 추가
      let responseText = response.text;
      if (isTeaching && !responseText.includes('기억')) {
        responseText = '📝 기억해둘게요!\n\n' + responseText;
      }
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId 
          ? { ...msg, text: responseText, isLoading: false, action: response.action?.action ? {
              type: response.action.action,
              title: response.action.title,
              task: response.action.taskIndex !== undefined ? todoTasks[response.action.taskIndex] : null,
              label: response.action.action === 'add_task' ? '추가하기' : '집중 시작'
            } : null }
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingId ? { ...msg, text: '죄송해요, 잠시 문제가 생겼어요. 다시 시도해주세요 🐧', isLoading: false } : msg
      ));
    }
    
    setIsLoading(false);
    setShowQuickReplies(true);
  };
  
  const handleAction = (action) => {
    if (action.type === 'start_focus' && action.task && onStartFocus) {
      onStartFocus(action.task);
    } else if (action.type === 'add_task' && action.title && onAddTask) {
      onAddTask(action.title);
      setMessages(prev => [...prev, { id: `add-${Date.now()}`, type: 'alfredo', text: `"${action.title}" 추가했어요.` }]);
    }
  };
  
  // 부정 피드백 모달
  const NegativeFeedbackModal = () => {
    if (!showNegativeModal) return null;
    const msg = messages.find(m => m.id === showNegativeModal);
    if (!msg) return null;
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
        onClick={() => setShowNegativeModal(null)}
      >
        <div 
          className="bg-white rounded-t-2xl w-full max-w-md p-4 pb-8"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">무엇이 아쉬웠나요?</h3>
            <button onClick={() => setShowNegativeModal(null)} className="p-1">
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">알프레도가 더 잘할 수 있도록 알려주세요</p>
          <div className="space-y-2">
            {negativeFeedbackReasons.map(reason => (
              <button
                key={reason.id}
                onClick={() => handleNegativeFeedbackReason(msg.id, msg.text, reason)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-left transition-colors"
              >
                <span className="text-xl">{reason.icon}</span>
                <span className="text-gray-700">{reason.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div 
      className="h-full flex flex-col bg-[#F0EBFF]"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-black/5 flex-shrink-0">
        <button 
          onClick={onBack} 
          className="min-w-[44px] min-h-[44px] rounded-full hover:bg-black/5 active:bg-black/10 flex items-center justify-center text-gray-500 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <AlfredoAvatar size="md" />
        <div className="flex-1 min-w-0">
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
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {messages.map(msg => (
          msg.type === 'alfredo' ? (
            <div key={msg.id} className="flex items-start gap-2">
              <AlfredoAvatar size="sm" />
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div className="bg-white rounded-2xl rounded-tl-md p-4 shadow-sm">
                  {msg.isLoading ? (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-[#A996FF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  ) : (
                    <>
                      <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-line">{msg.text}</p>
                      {/* 피드백 버튼 */}
                      {!msg.id.startsWith('init-') && (
                        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleFeedback(msg.id, msg.text, 'positive')}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1.5 rounded-full transition-all ${
                              feedbackGiven[msg.id] === 'positive' 
                                ? 'bg-emerald-100 text-emerald-600' 
                                : feedbackGiven[msg.id] 
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-500'
                            }`}
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, msg.text, 'negative')}
                            disabled={!!feedbackGiven[msg.id]}
                            className={`p-1.5 rounded-full transition-all ${
                              feedbackGiven[msg.id] === 'negative' 
                                ? 'bg-red-100 text-red-500' 
                                : feedbackGiven[msg.id] 
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:bg-red-50 hover:text-red-400'
                            }`}
                          >
                            <ThumbsDown size={14} />
                          </button>
                          {feedbackGiven[msg.id] && (
                            <span className="text-[11px] text-gray-400 ml-1">
                              {feedbackGiven[msg.id] === 'positive' ? '고마워요!' : '알겠어요'}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {msg.action && !msg.isLoading && (
                  <button
                    onClick={() => handleAction(msg.action)}
                    className="self-start min-h-[44px] px-5 py-2.5 bg-[#A996FF] text-white text-sm font-bold rounded-xl shadow-md shadow-[#A996FF]/20 active:scale-95 transition-transform flex items-center gap-2"
                  >
                    {msg.action.type === 'start_focus' && <Zap size={16} />}
                    {msg.action.type === 'add_task' && <Plus size={16} />}
                    {msg.action.label}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex justify-end">
              <div className="bg-[#A996FF] text-white rounded-2xl rounded-tr-md p-4 shadow-sm max-w-[85%]">
                <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          )
        ))}
        
        {/* Quick Replies */}
        {showQuickReplies && !isLoading && (
          <div className="flex flex-wrap gap-2 pl-10 pb-2">
            {getQuickReplies().map(reply => (
              <button 
                key={reply.key}
                onClick={() => handleQuickReply(reply)}
                className="min-h-[40px] px-4 py-2 bg-white rounded-full text-sm text-[#A996FF] border border-[#E5E0FF] hover:bg-[#F5F3FF] active:bg-[#EDE8FF] transition-colors shadow-sm"
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
            ref={inputRef}
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isLoading ? "알프레도가 생각 중..." : "알프레도에게 말하기..."}
            disabled={isLoading}
            className={`flex-1 min-h-[48px] px-5 py-3 rounded-full bg-gray-100 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A996FF]/30 ${isLoading ? 'opacity-50' : ''}`}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? 'bg-[#A996FF] text-white shadow-lg shadow-[#A996FF]/30 active:scale-95' 
                : 'bg-gray-100 text-gray-300'
            }`}
          >
            {isLoading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
      
      {/* 부정 피드백 모달 */}
      <NegativeFeedbackModal />
    </div>
  );
};

export default AlfredoChat;
