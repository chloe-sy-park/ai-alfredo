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
        <h2
          className="text-xl font-bold mb-2 heading-kr"
          style={{ color: 'var(--text-primary)' }}
        >
          알림을 받으실까요?
        </h2>
        <p className="body-text" style={{ color: 'var(--text-secondary)' }}>
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
          className="w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between"
          style={{
            backgroundColor: notificationsEnabled ? 'rgba(201, 162, 94, 0.08)' : 'var(--surface-default)',
            borderColor: notificationsEnabled ? 'var(--accent-primary)' : 'var(--border-default)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: notificationsEnabled ? 'var(--accent-primary)' : 'var(--border-default)'
              }}
            >
              {notificationsEnabled ? (
                <Bell className="w-6 h-6" style={{ color: 'var(--accent-on)' }} />
              ) : (
                <BellOff className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
              )}
            </div>
            <div className="text-left">
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                알림 {notificationsEnabled ? '켜기' : '끄기'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {notificationsEnabled ? '중요한 순간을 놓치지 마세요' : '직접 확인할 때까지 기다려요'}
              </p>
            </div>
          </div>
          <div
            className="w-12 h-6 rounded-full transition-colors relative"
            style={{
              backgroundColor: notificationsEnabled ? 'var(--accent-primary)' : 'var(--border-default)'
            }}
          >
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
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            언제 알려드릴까요?
          </p>
          {notificationOptions.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleToggleTime(option.id)}
              className="w-full p-4 rounded-xl border transition-all"
              style={{
                backgroundColor: selectedTimes.includes(option.id)
                  ? 'rgba(201, 162, 94, 0.08)'
                  : 'var(--surface-default)',
                borderColor: selectedTimes.includes(option.id)
                  ? 'var(--accent-primary)'
                  : 'var(--border-default)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <option.icon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                  <div className="text-left">
                    <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{option.title}</h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{option.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{option.time}</span>
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: selectedTimes.includes(option.id) ? 'var(--accent-primary)' : 'transparent',
                      borderColor: selectedTimes.includes(option.id) ? 'var(--accent-primary)' : 'var(--border-default)'
                    }}
                  >
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
      <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--surface-subtle)' }}>
        <p className="text-sm text-center flex items-center justify-center gap-2" style={{ color: 'var(--text-secondary)' }}>
          <Smartphone className="w-4 h-4" />
          설정에서 언제든 변경할 수 있어요
        </p>
      </div>

      {/* 버튼 */}
      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-2xl ui-button transition-colors"
        style={{
          backgroundColor: 'var(--text-primary)',
          color: 'var(--surface-default)'
        }}
      >
        설정 완료
      </button>
    </div>
  );
}
