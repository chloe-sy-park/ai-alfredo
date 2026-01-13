import { useAuthStore } from '../stores/authStore';

export default function Home() {
  const { user } = useAuthStore();
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const day = dayNames[now.getDay()];

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{month}월 {date}일</h1>
          <p className="text-gray-500">{day}</p>
        </div>
      </div>

      {/* 브리핑 카드 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🐧</span>
          <span className="font-medium">좋은 아침이에요, {user?.name || 'Boss'}</span>
        </div>
        <p className="text-sm text-lavender-600">더 들어볼래 &gt;</p>
      </div>

      {/* 오늘의 우선순위 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-3">오늘의 우선순위</p>
        <div className="space-y-3">
          {[
            { num: 1, title: '알프레도 시작하기', tag: 'LIFE' },
            { num: 2, title: '오늘의 Top 3 설정하기', tag: 'WORK' },
            { num: 3, title: '운동 30분', tag: 'LIFE' }
          ].map((task) => (
            <div key={task.num} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                task.num === 1 ? 'bg-lavender-100 text-lavender-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {task.num}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{task.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  task.tag === 'WORK' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>{task.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
