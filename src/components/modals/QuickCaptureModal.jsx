import React, { useState } from 'react';
import { X, Plus, Inbox, FileAudio, Mic, Send } from 'lucide-react';

const QuickCaptureModal = ({ onClose, onAddTask, onAddToInbox, onOpenMeetingUploader }) => {
  const [captureType, setCaptureType] = useState(null); // 'task', 'memo', 'idea'
  const [text, setText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [repeatType, setRepeatType] = useState('none'); // 'none', 'daily', 'weekly', 'monthly'
  
  const handleSubmit = () => {
    if (!text.trim()) return;
    
    if (captureType === 'task') {
      onAddTask({
        id: `task-quick-${Date.now()}`,
        title: text,
        project: 'Quick',
        importance: priority,
        status: 'todo',
        priorityChange: 'new',
        priorityScore: priority === 'high' ? 80 : priority === 'medium' ? 60 : 40,
        sparkline: [0, 0, 0, 0, priority === 'high' ? 80 : 60],
        repeat: repeatType !== 'none' ? repeatType : null,
        repeatLabel: repeatType === 'daily' ? '매일' : repeatType === 'weekly' ? '매주' : repeatType === 'monthly' ? '매월' : null,
      });
    } else {
      onAddToInbox({
        id: `inbox-quick-${Date.now()}`,
        type: captureType === 'idea' ? 'idea' : 'memo',
        subject: text,
        preview: captureType === 'idea' ? '💡 아이디어' : '📝 메모',
        time: '방금',
      });
    }
    
    onClose();
  };
  
  // 타입 선택 화면
  if (!captureType) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      >
        <div 
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-10 animate-in slide-in-from-bottom-10 duration-300"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
          
          <h2 className="text-lg font-bold text-gray-800 text-center mb-6">빠른 기록</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => setCaptureType('task')}
              className="w-full flex items-center gap-4 p-4 bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-[#F5F3FF]0 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">할 일 추가</p>
                <p className="text-xs text-gray-500">바로 태스크로 등록</p>
              </div>
            </button>
            
            <button
              onClick={() => setCaptureType('memo')}
              className="w-full flex items-center gap-4 p-4 bg-gray-100 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-gray-1000 rounded-xl flex items-center justify-center">
                <FileText size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">빠른 메모</p>
                <p className="text-xs text-gray-500">인박스에 저장</p>
              </div>
            </button>
            
            <button
              onClick={() => setCaptureType('idea')}
              className="w-full flex items-center gap-4 p-4 bg-[#F5F3FF] hover:bg-[#EDE9FE] rounded-xl transition-all"
            >
              <div className="w-12 h-12 bg-[#F5F3FF]0 rounded-xl flex items-center justify-center">
                <Lightbulb size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">아이디어</p>
                <p className="text-xs text-gray-500">나중에 정리</p>
              </div>
            </button>
            
            {/* 회의록 정리 버튼 */}
            <button
              onClick={() => { onClose(); onOpenMeetingUploader?.(); }}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#A996FF]/10 to-[#8B7CF7]/10 hover:from-[#A996FF]/20 hover:to-[#8B7CF7]/20 rounded-xl transition-all border border-[#A996FF]/30"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#A996FF] to-[#8B7CF7] rounded-xl flex items-center justify-center">
                <Mic size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">회의록 정리</p>
                <p className="text-xs text-gray-500">녹음 파일 → 요약 & 액션</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // 입력 화면
  const typeConfig = {
    task: { title: '할 일 추가', icon: CheckCircle2, color: 'lavender', placeholder: '무엇을 해야 하나요?' },
    memo: { title: '빠른 메모', icon: FileText, color: 'blue', placeholder: '메모할 내용을 입력하세요' },
    idea: { title: '아이디어', icon: Lightbulb, color: 'lavender', placeholder: '떠오른 아이디어를 적어보세요' },
  };
  
  const config = typeConfig[captureType];
  const IconComponent = config.icon;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl p-6 pb-10 animate-in slide-in-from-bottom-10 duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCaptureType(null)} className="p-2 -ml-2 text-gray-400">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{config.title}</h2>
          <div className="w-8" />
        </div>
        
        <div className={`bg-${config.color}-50 rounded-xl p-4 mb-4`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={config.placeholder}
            className={`w-full bg-transparent text-gray-800 placeholder-${config.color}-300 resize-none focus:outline-none text-base`}
            rows={3}
            autoFocus
          />
        </div>
        
        {captureType === 'task' && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">우선순위</p>
            <div className="flex gap-2">
              {[
                { value: 'high', label: '높음', color: 'bg-red-100 text-red-600 border-red-200' },
                { value: 'medium', label: '보통', color: 'bg-gray-100 text-gray-600 border-gray-200' },
                { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-600 border-gray-200' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                    priority === opt.value 
                      ? opt.color + ' border-current' 
                      : 'bg-gray-50 text-gray-400 border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 반복 설정 */}
        {captureType === 'task' && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">🔄 반복 설정</p>
            <div className="flex gap-2">
              {[
                { value: 'none', label: '없음' },
                { value: 'daily', label: '매일' },
                { value: 'weekly', label: '매주' },
                { value: 'monthly', label: '매월' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRepeatType(opt.value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    repeatType === opt.value 
                      ? 'bg-[#EDE9FE] text-[#8B7CF7] border-2 border-[#C4B5FD]' 
                      : 'bg-gray-50 text-gray-400 border-2 border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {repeatType !== 'none' && (
              <p className="text-[11px] text-[#F5F3FF]0 mt-2 flex items-center gap-1">
                <RefreshCw size={10} />
                완료해도 {repeatType === 'daily' ? '다음 날' : repeatType === 'weekly' ? '다음 주' : '다음 달'} 다시 생성돼요
              </p>
            )}
          </div>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`w-full py-3.5 bg-${config.color}-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          저장하기
        </button>
      </div>
    </div>
  );
};

// === Task Modal ===

export default QuickCaptureModal;
