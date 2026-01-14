import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, RefreshCw, Zap, Brain, Calendar, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTodayCondition, conditionConfig } from '../services/condition';
import { getTop3 } from '../services/top3';
import { getCurrentFocus } from '../services/focusNow';
import { getAlfredoSettings, getToneLabel } from '../services/alfredoSettings';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 컨텍스트 정보
  const condition = getTodayCondition();
  const top3 = getTop3();
  const currentFocus = getCurrentFocus();
  const settings = getAlfredoSettings();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 퀵 액션 정의
  const quickActions: QuickAction[] = [
    {
      id: 'braindump',
      icon: <Brain size={18} />,
      label: '브레인덤프',
      prompt: '머릿속이 복잡해. 생각 정리 좀 도와줘.'
    },
    {
      id: 'schedule',
      icon: <Calendar size={18} />,
      label: '일정 조율',
      prompt: '오늘 일정 어떻게 진행하면 좋을까?'
    },
    {
      id: 'energy',
      icon: <Zap size={18} />,
      label: '에너지 충전',
      prompt: '지금 좀 지쳤어. 기분 전환할 방법 추천해줘.'
    },
    {
      id: 'counsel',
      icon: <Heart size={18} />,
      label: '고민 상담',
      prompt: '요즘 고민이 있어. 얘기 좀 들어줄래?'
    }
  ];

  // 컨텍스트 빌드
  const buildContext = () => {
    const ctx: any = {
      tone: getToneLabel(settings.tone),
      motivation: settings.motivation
    };

    if (condition) {
      ctx.condition = {
        level: condition.level,
        label: conditionConfig[condition.level].label,
        energy: condition.energy
      };
    }

    if (top3.length > 0) {
      ctx.top3 = top3.map(t => ({
        title: t.title,
        completed: t.completed
      }));
    }

    if (currentFocus) {
      ctx.currentFocus = {
        title: currentFocus.title,
        startedAt: currentFocus.startedAt
      };
    }

    return ctx;
  };

  const sendToAPI = async (allMessages: Message[]) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          context: buildContext()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 호출 실패');
      }

      const data = await response.json();
      return data.text;
    } catch (err) {
      console.error('Chat API error:', err);
      throw err;
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    setShowQuickActions(false);

    try {
      const responseText = await sendToAPI(updatedMessages);
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답을 받지 못했어요');
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '죄송해요, 지금 응답하기 어려워요. 잠시 후 다시 시도해주세요. 🐧'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSend(action.prompt);
  };

  const handleRetry = async () => {
    const lastUserMsgIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserMsgIndex === -1) return;
    
    const messagesUpToLastUser = messages.slice(0, lastUserMsgIndex + 1);
    setMessages(messagesUpToLastUser);
    setIsLoading(true);
    setError(null);

    try {
      const responseText = await sendToAPI(messagesUpToLastUser);
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: responseText
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '응답을 받지 못했어요');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <span className="text-2xl">🐧</span>
        <div className="flex-1">
          <span className="font-semibold text-gray-800">알프레도</span>
          {condition && (
            <span className="ml-2 text-xs text-gray-400">
              {conditionConfig[condition.level].emoji} {conditionConfig[condition.level].label}
            </span>
          )}
        </div>
        {currentFocus && (
          <div className="flex items-center gap-1 text-xs bg-lavender-100 text-lavender-600 px-2 py-1 rounded-full">
            <Sparkles size={12} />
            <span>집중 중</span>
          </div>
        )}
      </div>

      {/* 컨텍스트 표시 (첫 화면에서만) */}
      {messages.length === 0 && top3.length > 0 && (
        <div className="px-4 py-2 bg-lavender-50 border-b border-lavender-100">
          <p className="text-xs text-gray-500 mb-1">오늘의 탑3</p>
          <div className="flex flex-wrap gap-1">
            {top3.map((item, idx) => (
              <span 
                key={item.id}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  item.completed 
                    ? 'bg-green-100 text-green-600 line-through' 
                    : 'bg-white text-gray-600'
                }`}
              >
                {idx + 1}. {item.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐧</div>
            <p className="text-gray-600 font-medium">안녕하세요! 알프레도예요</p>
            <p className="text-gray-400 text-sm mt-1">무엇이든 물어보세요</p>
            
            {/* 퀵 액션 */}
            {showQuickActions && (
              <div className="mt-8 grid grid-cols-2 gap-2 max-w-xs mx-auto">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                  >
                    <span className="text-lavender-500">{action.icon}</span>
                    <span className="text-sm text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
              <span className="text-gray-400 flex items-center gap-2">
                <span className="animate-pulse">생각 중</span>
                <span className="animate-bounce">...</span>
              </span>
            </div>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex justify-center">
            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <RefreshCw size={14} />
              다시 시도
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 bg-white border-t border-gray-100">
        {/* 퀵 액션 칩 (대화 중에도 표시) */}
        {messages.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-gray-200"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-3 rounded-full transition-colors ${
              input.trim() && !isLoading 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
