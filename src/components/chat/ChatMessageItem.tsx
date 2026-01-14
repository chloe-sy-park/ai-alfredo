import { ChatMessage } from '../../types/chat';
import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  var isAlfredo = message.role === 'alfredo';
  
  // 타임스탬프 포맷 (간단하게)
  var timeString = new Date(message.timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className={`flex gap-3 ${isAlfredo ? '' : 'flex-row-reverse'} animate-slide-up`}>
      {/* 아바타 */}
      <div className="flex-shrink-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isAlfredo ? 'bg-primary/10' : 'bg-neutral-100'
        }`}>
          {isAlfredo ? (
            <span className="text-lg">🐧</span>
          ) : (
            <span className="text-sm font-medium text-neutral-600">나</span>
          )}
        </div>
      </div>
      
      {/* 메시지 내용 */}
      <div className={`flex-1 max-w-[80%] space-y-2`}>
        {/* 일반 메시지 */}
        {!isAlfredo && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{message.content}</p>
          </div>
        )}
        
        {/* 알프레도 3단 구조 응답 */}
        {isAlfredo && (
          <div className="space-y-2">
            {/* R1: 이해 선언 */}
            {message.understanding && (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                <p className="text-sm text-[#666666]">{message.understanding}</p>
              </div>
            )}
            
            {/* R2: 구조화 요약 */}
            {message.summary && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-sm text-[#1A1A1A] font-medium">{message.summary}</p>
              </div>
            )}
            
            {/* R3: 판단 반영 */}
            {message.judgement && (
              <div className={`rounded-xl p-3 flex items-start gap-2 ${
                message.judgement.type === 'apply' 
                  ? 'bg-green-50 border border-green-200' 
                  : message.judgement.type === 'consider'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-neutral-50 border border-neutral-200'
              }`}>
                {message.judgement.type === 'apply' && <CheckCircle2 size={16} className="text-green-600 mt-0.5" />}
                {message.judgement.type === 'consider' && <AlertCircle size={16} className="text-yellow-600 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">{message.judgement.message}</p>
                  {message.judgement.changes && (
                    <ul className="mt-1 space-y-0.5">
                      {message.judgement.changes.map((change, idx) => (
                        <li key={idx} className="text-xs text-[#666666]">• {change}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            {/* DNA 인사이트 (있을 경우) */}
            {message.dnaInsights && message.dnaInsights.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={14} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-800">발견한 패턴</span>
                </div>
                <div className="space-y-1">
                  {message.dnaInsights.map((insight, idx) => (
                    <p key={idx} className="text-xs text-purple-700">
                      {insight.inference} ({insight.signal})
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 타임스탬프 */}
        <p className="text-xs text-[#999999] px-1">
          {timeString}
        </p>
      </div>
    </div>
  );
}