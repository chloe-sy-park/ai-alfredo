import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';

/**
 * Weekly Report - 주간 리포트 페이지
 * 
 * 스펙 기반 구현:
 * - R1. Proof over Motivation (동기부여가 아닌 증명)
 * - R2. Story with Evidence (문장 + 차트 + 숫자)
 */
export default function Report() {
  const navigate = useNavigate();
  const { tasks } = useTaskStore();
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  
  // 날짜 계산
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`;
  
  // 통계 계산 (샘플)
  const stats = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    const workTasks = tasks.filter(t => t.category !== 'personal').length;
    const lifeTasks = tasks.filter(t => t.category === 'personal').length;
    
    return {
      completed: completedTasks,
      total: totalTasks,
      workRatio: totalTasks > 0 ? Math.round((workTasks / totalTasks) * 100) : 50,
      lifeRatio: totalTasks > 0 ? Math.round((lifeTasks / totalTasks) * 100) : 50,
      liftCount: 3, // 샘플: 판단 변화 횟수
    };
  }, [tasks]);
  
  // Lift 타임라인 샘플 데이터
  const liftTimeline = [
    { day: '월', intensity: 'low' as const },
    { day: '화', intensity: 'mid' as const },
    { day: '수', intensity: 'high' as const },
    { day: '목', intensity: 'low' as const },
    { day: '금', intensity: 'mid' as const },
    { day: '토', intensity: 'low' as const },
    { day: '일', intensity: 'low' as const },
  ];
  
  // 제안 샘플
  const suggestions = [
    '화요일 오전에 집중 시간 블록을 잡아보는 건 어떨까요?',
    '점심 후 15분 산책이 오후 집중력에 도움이 될 수 있어요',
    '주말 하루는 완전히 비워두는 것도 방법이에요',
  ];
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold text-neutral-800">주간 리포트</h1>
          </div>
          
          {/* 기간 토글 */}
          <div className="flex bg-neutral-100 rounded-full p-1">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                period === 'weekly' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'
              }`}
            >
              주간
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                period === 'monthly' ? 'bg-white text-neutral-800 shadow-sm' : 'text-neutral-500'
              }`}
            >
              월간
            </button>
          </div>
        </div>
        
        <p className="text-sm text-neutral-500 mt-2 ml-13">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </p>
      </header>
      
      <main className="px-4 pt-4 space-y-4">
        {/* Section 1: One-line Summary */}
        <section className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🐧</span>
            <div>
              <p className="text-lg font-medium text-neutral-800 leading-relaxed">
                이번 주는<br/>
                <span className="text-primary">삶이 일을 두 번 밀어냈고,</span><br/>
                그 선택은 대체로 옳았어요.
              </p>
            </div>
          </div>
        </section>
        
        {/* Section 2: Balance Overview */}
        <section className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">Work-Life 밸런스</h3>
          
          {/* Progress bar */}
          <div className="h-4 bg-neutral-100 rounded-full overflow-hidden flex mb-3">
            <div
              className="h-full bg-blue-400 transition-all duration-500"
              style={{ width: `${stats.workRatio}%` }}
            />
            <div
              className="h-full bg-green-400 transition-all duration-500"
              style={{ width: `${stats.lifeRatio}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-blue-500 font-medium">WORK {stats.workRatio}%</span>
            <span className="text-green-500 font-medium">LIFE {stats.lifeRatio}%</span>
          </div>
          
          <p className="text-sm text-neutral-600 mt-3">
            지난주보다 LIFE 비중이 10% 늘었어요. 균형이 좋아지고 있어요.
          </p>
        </section>
        
        {/* Section 3: Judgement Lift Summary */}
        <section className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">판단 변화 (Lift)</h3>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{stats.liftCount}</span>
            </div>
            <div>
              <p className="font-medium text-neutral-800">이번 주 {stats.liftCount}번의 판단 변화</p>
              <p className="text-sm text-neutral-500">우선순위를 함께 조정했어요</p>
            </div>
          </div>
        </section>
        
        {/* Section 4: Lift Timeline */}
        <section className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">Lift 타임라인</h3>
          
          <div className="flex justify-between items-end h-20">
            {liftTimeline.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div 
                  className={`rounded-full transition-all ${
                    item.intensity === 'high' ? 'w-4 h-4 bg-primary' :
                    item.intensity === 'mid' ? 'w-3 h-3 bg-primary/60' :
                    'w-2 h-2 bg-primary/30'
                  }`}
                />
                <span className="text-xs text-neutral-400">{item.day}</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-neutral-600 mt-4">
            수요일에 가장 큰 조정이 있었어요. 급한 미팅이 들어왔죠.
          </p>
        </section>
        
        {/* Section 5: Alfredo's Take */}
        <section className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
          <h3 className="text-sm font-medium text-primary mb-3">알프레도의 관찰</h3>
          
          <div className="space-y-3">
            <p className="text-neutral-700">
              이번 주에는 결정을 미루지 않았어요.<br/>
              그래서 흐름이 흔들리지 않았습니다.
            </p>
            <p className="text-neutral-700">
              목요일 저녁 약속을 지킨 게 좋은 선택이었어요.
              금요일 컨디션이 눈에 띄게 좋았거든요.
            </p>
          </div>
        </section>
        
        {/* Section 6: Suggestions */}
        <section className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">다음 주 시도해볼 것</h3>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl">
                <span className="text-primary font-medium">{idx + 1}</span>
                <p className="text-sm text-neutral-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* 완료 태스크 요약 */}
        <section className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500">완료한 일</h3>
            <span className="text-2xl font-bold text-primary">{stats.completed}</span>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm text-neutral-600">지난주 대비 +2개</span>
          </div>
        </section>
      </main>
    </div>
  );
}
