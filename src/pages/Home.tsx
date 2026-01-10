import Card from '@/components/common/Card';
import { Calendar, CheckCircle2, Clock, Sparkles, Sun, CloudSun } from 'lucide-react';

export default function Home() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-fade-in">
      {/* 알프레도 브리핑 */}
      <Card variant="glass" className="relative overflow-hidden">
        <div className="flex gap-3">
          <div className="text-4xl">🐧</div>
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed">
              오늘 오전에 회의 2개가 있어요. 
              <span className="text-lavender-500 font-medium">10시 팀 스탠드업</span>부터 시작하고,
              점심 전엔 여유 시간이 있어요 ☕
            </p>
            <button className="mt-2 text-sm text-lavender-500 font-medium hover:text-lavender-600">
              더 들어볼래 →
            </button>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">
          🐧
        </div>
      </Card>

      {/* 날씨 + 컨디션 */}
      <div className="flex gap-3">
        <Card className="flex-1 flex items-center gap-3">
          <CloudSun className="text-amber-400" size={28} />
          <div>
            <p className="text-2xl font-semibold">12°</p>
            <p className="text-xs text-gray-500">말음</p>
          </div>
        </Card>
        <Card className="flex-1">
          <p className="text-xs text-gray-500 mb-1">오늘 컨디션</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">😊</span>
            <span className="font-medium">보통</span>
          </div>
        </Card>
      </div>

      {/* 오늘의 Top 3 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="text-lavender-400" size={18} />
            오늘의 Top 3
          </h2>
          <button className="text-sm text-lavender-500">수정</button>
        </div>
        <div className="space-y-2">
          {[
            { title: 'Q1 보고서 마무리', time: '~2시간', done: false },
            { title: '디자인 피드백 정리', time: '~30분', done: true },
            { title: '팀 미팅 준비', time: '~1시간', done: false }
          ].map((task, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                task.done ? 'bg-gray-50' : 'bg-lavender-50'
              }`}
            >
              <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                task.done
                  ? 'bg-lavender-400 border-lavender-400 text-white'
                  : 'border-lavender-300 hover:border-lavender-400'
              }`}>
                {task.done && <CheckCircle2 size={14} />}
              </button>
              <div className="flex-1">
                <p className={task.done ? 'line-through text-gray-400' : 'text-gray-800'}>
                  {task.title}
                </p>
              </div>
              <span className="text-xs text-gray-400">{task.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 지금 집중할 것 */}
      <Card className="bg-gradient-to-r from-lavender-400 to-lavender-500 text-white">
        <p className="text-sm opacity-80 mb-1">지금 집중할 것</p>
        <p className="text-lg font-semibold">Q1 보고서 마무리</p>
        <div className="flex items-center gap-2 mt-2">
          <Clock size={14} />
          <span className="text-sm">25:00 남음</span>
        </div>
      </Card>

      {/* 오늘 타임라인 */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="text-lavender-400" size={18} />
            오늘 타임라인
          </h2>
        </div>
        <div className="space-y-3">
          {[
            { time: '10:00', title: '팀 스탠드업', duration: '30분', type: 'meeting' },
            { time: '11:00', title: '디자인 리뷰', duration: '1시간', type: 'meeting' },
            { time: '14:00', title: '집중 작업 시간', duration: '2시간', type: 'focus' },
            { time: '16:00', title: '1:1 미팅', duration: '30분', type: 'meeting' }
          ].map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-14 text-sm text-gray-500">{event.time}</div>
              <div className={`w-1 h-12 rounded-full ${
                event.type === 'focus' ? 'bg-green-400' : 'bg-lavender-300'
              }`} />
              <div>
                <p className="font-medium text-gray-800">{event.title}</p>
                <p className="text-xs text-gray-400">{event.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 기억해야 할 것 */}
      <Card variant="outlined">
        <h2 className="font-semibold mb-2">📌 기억해야 할 것</h2>
        <ul className="space-y-1 text-sm text-gray-600">
          <li>• 오후 3시 약 먹기</li>
          <li>• 톤으로 세금계산서 체크</li>
        </ul>
      </Card>
    </div>
  );
}
