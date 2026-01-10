import Card from '@/components/common/Card';
import { Heart, Droplets, Moon, Footprints, Apple, Smile } from 'lucide-react';

export default function Life() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">라이프</h1>
        <button className="text-lavender-500 text-sm font-medium">습관 관리</button>
      </div>

      {/* 오늘의 셀프케어 */}
      <Card>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Heart className="text-pink-400" size={18} />
          오늘의 셀프케어
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <HabitItem icon={<Droplets />} label="물 8잔" progress={5} total={8} color="blue" />
          <HabitItem icon={<Moon />} label="7시간 수면" progress={1} total={1} color="purple" done />
          <HabitItem icon={<Footprints />} label="10,000보" progress={6234} total={10000} color="green" />
          <HabitItem icon={<Apple />} label="비타민" progress={0} total={1} color="orange" />
        </div>
      </Card>

      {/* 기분 트래커 */}
      <Card>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Smile className="text-amber-400" size={18} />
          오늘 기분은 어때요?
        </h2>
        <div className="flex justify-around">
          {[
            { emoji: '😄', label: '좋아요' },
            { emoji: '😊', label: '보통이에요' },
            { emoji: '😐', label: '그냥 그래요' },
            { emoji: '😞', label: '안 좋아요' },
            { emoji: '😩', label: '힘들어요' }
          ].map((mood) => (
            <button
              key={mood.label}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-lavender-50 transition-colors"
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs text-gray-500">{mood.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* 주간 습관 현황 */}
      <Card>
        <h2 className="font-semibold mb-3">이번 주 습관 현황</h2>
        <div className="flex justify-between">
          {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{day}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                i < 5
                  ? i % 2 === 0
                    ? 'bg-lavender-400 text-white'
                    : 'bg-lavender-200 text-lavender-700'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {i < 5 ? (i % 2 === 0 ? '✓' : '·') : ''}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 알프레도 팀 */}
      <Card variant="glass">
        <div className="flex gap-3">
          <span className="text-3xl">🐧</span>
          <div>
            <p className="text-gray-700">
              오늘 물 5잔 마셨네요! 한 잔 더 마시면 목표 달성이에요 💧
            </p>
          </div>
        </div>
      </Card>

      {/* 개인 일정 */}
      <Card>
        <h2 className="font-semibold mb-3">개인 일정</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-pink-50 rounded-xl">
            <span className="text-xl">🏋️</span>
            <div>
              <p className="font-medium text-gray-800">헬스장</p>
              <p className="text-xs text-gray-500">오후 7:00</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-xl">
            <span className="text-xl">🍽️</span>
            <div>
              <p className="font-medium text-gray-800">친구 저녁 약속</p>
              <p className="text-xs text-gray-500">오후 7:30 · 강남역</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface HabitItemProps {
  icon: React.ReactNode;
  label: string;
  progress: number;
  total: number;
  color: 'blue' | 'purple' | 'green' | 'orange';
  done?: boolean;
}

function HabitItem({ icon, label, progress, total, color, done }: HabitItemProps) {
  const percentage = Math.min((progress / total) * 100, 100);
  
  const colors = {
    blue: 'bg-blue-100 text-blue-500',
    purple: 'bg-purple-100 text-purple-500',
    green: 'bg-green-100 text-green-500',
    orange: 'bg-orange-100 text-orange-500'
  };

  const progressColors = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-green-400',
    orange: 'bg-orange-400'
  };

  return (
    <div className={`p-3 rounded-xl ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
        {done && <span className="ml-auto text-xs">✓</span>}
      </div>
      <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${progressColors[color]} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs mt-1 opacity-70">
        {progress.toLocaleString()} / {total.toLocaleString()}
      </p>
    </div>
  );
}
