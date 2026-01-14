import { motion } from 'framer-motion';
import { Bell, BellOff, Smartphone, Clock } from 'lucide-react';
import { useState } from 'react';

interface NotificationSetupProps {
  data: any;
  onNext: (data?: any) => void;
  onSkip: () => void;
}

export default function NotificationSetup({ onNext }: NotificationSetupProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedTimes, setSelectedTimes] = useState(['morning', 'important']);

  const notificationOptions = [
    {
      id: 'morning',
      icon: Clock,
      title: '아침 브리핑',
      description: '매일 아침 오늘의 일정과 우선순위',
      time: '오전 8:00'
    },
    {
      id: 'important',
      icon: Bell,
      title: '중요 알림',
      description: '미팅 전, 데드라인, 긴급 태스크',
      time: '실시간'
    },
    {
      id: 'evening',
      icon: Clock,
      title: '저녁 정리',
      description: '오늘 하루 정리와 내일 준비',
      time: '오후 9:00'
    }
  ];

  const handleToggleTime = (timeId: string) => {
    setSelectedTimes(prev => 
      prev.includes(timeId) 
        ? prev.filter(id => id !== timeId)
        : [...prev, timeId]
    );
  };

  const handleContinue = () => {
    onNext({ 
      notificationsEnabled,
      notificationTimes: selectedTimes 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          알림을 받으실까요?
        </h2>
        <p className="text-[#666666]">
          필요한 순간에만 조용히 알려드릴게요
        </p>
      </div>

      {/* 알림 토글 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
            notificationsEnabled 
              ? 'bg-[#F8F8FF] border-[#A996FF]' 
              : 'bg-white border-[#E5E5E5]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              notificationsEnabled ? 'bg-[#A996FF]' : 'bg-[#E5E5E5]'
            }`}>
              {notificationsEnabled ? (
                <Bell className="w-6 h-6 text-white" />
              ) : (
                <BellOff className="w-6 h-6 text-[#999999]" />
              )}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#1A1A1A]">
                알림 {notificationsEnabled ? '켜기' : '끄기'}
              </h3>
              <p className="text-sm text-[#666666]">
                {notificationsEnabled ? '중요한 순간을 놓치지 마세요' : '직접 확인할 때까지 기다려요'}
              </p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors relative ${
            notificationsEnabled ? 'bg-[#A996FF]' : 'bg-[#E5E5E5]'
          }`}>
            <motion.div 
              className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
              animate={{ x: notificationsEnabled ? 20 : 2 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>
        </button>
      </motion.div>

      {/* 알림 옵션 */}
      {notificationsEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex-1 space-y-3 mb-8"
        >
          <p className="text-sm font-semibold text-[#1A1A1A] mb-3">
            언제 알려드릴까요?
          </p>
          {notificationOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleToggleTime(option.id)}
              className={`w-full p-4 rounded-xl border transition-all ${
                selectedTimes.includes(option.id)
                  ? 'bg-[#F8F8FF] border-[#A996FF]'
                  : 'bg-white border-[#E5E5E5]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <option.icon className="w-5 h-5 text-[#666666]" />
                  <div className="text-left">
                    <h4 className="font-medium text-[#1A1A1A]">{option.title}</h4>
                    <p className="text-xs text-[#666666]">{option.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#999999]">{option.time}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedTimes.includes(option.id)
                      ? 'bg-[#A996FF] border-[#A996FF]'
                      : 'border-[#D0D0D0]'
                  }`}>
                    {selectedTimes.includes(option.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* 안내 메시지 */}
      <div className="mb-6 p-4 bg-[#F8F8FF] rounded-xl">
        <p className="text-sm text-[#666666] text-center flex items-center justify-center gap-2">
          <Smartphone className="w-4 h-4" />
          설정에서 언제든 변경할 수 있어요
        </p>
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-medium hover:bg-[#333333] transition-colors"
      >
        설정 완료
      </button>
    </div>
  );
}