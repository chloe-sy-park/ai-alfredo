import React from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, Clock, 
  CheckCircle, Target, Zap, Award, ChevronRight,
  BarChart3, Sparkles
} from 'lucide-react';
import { useBehaviorStore } from '../../stores/behaviorStore';
import { usePersonalityStore } from '../../stores/personalityStore';

/**
 * 📊 Weekly Report - Exist/RescueTime 스타일
 * 주간 인사이트 + 패턴 분석
 * "운동한 날 생산성 높음" 같은 상관관계 발견
 */

const DAYS_KR = ['일', '월', '화', '수', '목', '금', '토'];

const WeeklyReport = ({ weekData = {} }) => {
  const { inferredProfile, energyPatterns, getActiveInsights } = useBehaviorStore();
  const { getResponse, currentMode } = usePersonalityStore();
  const insights = getActiveInsights();

  // 모킹 데이터 (실제로는 props로 받거나 store에서)
  const mockData = {
    tasksCompleted: 24,
    tasksPlanned: 30,
    totalFocusMinutes: 420,
    avgMood: 3.8,
    streakDays: 5,
    bestDay: '화요일',
    bestHour: 10,
    comparedToLastWeek: {
      tasks: +12, // 퍼센트
      focus: -5,
      mood: +0.3,
    },
    dailyTasks: [3, 5, 6, 4, 3, 2, 1], // 일~토
    correlations: [
      { factor: '아침 운동', impact: 'positive', message: '운동한 날 완료율 32% 높음' },
      { factor: '밤 11시 이후 작업', impact: 'negative', message: '다음날 생산성 23% 하락' },
    ],
    ...weekData,
  };

  const completionRate = Math.round((mockData.tasksCompleted / mockData.tasksPlanned) * 100);
  const maxDailyTasks = Math.max(...mockData.dailyTasks);

  // 트렌드 아이콘
  const TrendIcon = ({ value }) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // 알프레도 코멘트
  const getAlfredoComment = () => {
    if (completionRate >= 80) {
      return '이번 주 정말 잘했어요! 🎉';
    } else if (completionRate >= 60) {
      return '꼭준히 해내고 있어요! 👍';
    } else {
      return '힘든 주였지만 괜찮아요. 다음 주는 다를 거예요 💜';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h2 className="font-bold">주간 리포트</h2>
          </div>
          <span className="text-sm text-indigo-100">
            {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 기준
          </span>
        </div>
        
        {/* 알프레도 코멘트 */}
        <div className="flex items-center gap-2 mt-3 p-2 bg-white/10 rounded-xl">
          <span className="text-2xl">🐧</span>
          <p className="text-sm">{getAlfredoComment()}</p>
        </div>
      </div>

      {/* 주요 지표 */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 완료율 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <TrendIcon value={mockData.comparedToLastWeek.tasks} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{completionRate}%</p>
            <p className="text-xs text-gray-500">완료율 ({mockData.tasksCompleted}/{mockData.tasksPlanned})</p>
          </div>

          {/* 집중 시간 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <TrendIcon value={mockData.comparedToLastWeek.focus} />
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {Math.round(mockData.totalFocusMinutes / 60)}h
            </p>
            <p className="text-xs text-gray-500">총 집중 시간</p>
          </div>

          {/* 평균 기분 */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <TrendIcon value={mockData.comparedToLastWeek.mood} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{mockData.avgMood.toFixed(1)}</p>
            <p className="text-xs text-gray-500">평균 기분</p>
          </div>

          {/* 스트릭 */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{mockData.streakDays}일</p>
            <p className="text-xs text-gray-500">연속 스트릭</p>
          </div>
        </div>

        {/* 요일별 완료 그래프 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">요일별 완료</h3>
          <div className="flex items-end gap-1 h-20">
            {mockData.dailyTasks.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div 
                  className={`w-full rounded-t ${
                    i === mockData.dailyTasks.indexOf(Math.max(...mockData.dailyTasks))
                      ? 'bg-purple-500'
                      : 'bg-purple-200'
                  }`}
                  style={{ 
                    height: `${maxDailyTasks > 0 ? (count / maxDailyTasks) * 100 : 0}%`,
                    minHeight: count > 0 ? '8px' : '0'
                  }}
                />
                <span className="text-xs text-gray-400 mt-1">{DAYS_KR[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 발견된 패턴 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Target className="w-4 h-4" />
            발견된 패턴
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <span className="text-lg">🏆</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">최고의 날</p>
                <p className="text-xs text-gray-500">{mockData.bestDay} - 가장 많이 완료했어요</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <span className="text-lg">⚡</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">피크 시간</p>
                <p className="text-xs text-gray-500">오전 {mockData.bestHour}시 - 집중력 최고</p>
              </div>
            </div>
          </div>
        </div>

        {/* 상관관계 (Exist 스타일) */}
        {mockData.correlations.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              알프레도가 발견한 것
            </h3>
            <div className="space-y-2">
              {mockData.correlations.map((corr, i) => (
                <div 
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    corr.impact === 'positive' ? 'bg-green-50' : 'bg-amber-50'
                  }`}
                >
                  <span className="text-lg">
                    {corr.impact === 'positive' ? '📈' : '📉'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{corr.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI 인사이트 */}
        {insights.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">더 알아본 것들</h3>
            <div className="space-y-2">
              {insights.slice(0, 3).map((insight) => (
                <div 
                  key={insight.id}
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl"
                >
                  <span className="text-lg">
                    {insight.type === 'chronotype' ? '⏰' :
                     insight.type === 'energy' ? '⚡' :
                     insight.type === 'pattern' ? '📊' : '💡'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{insight.message}</p>
                    {insight.detail && (
                      <p className="text-xs text-gray-500">{insight.detail}</p>
                    )}
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(insight.confidence)].map((_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 다음 주 추천 */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4">
          <h3 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            다음 주 추천
          </h3>
          <ul className="space-y-1 text-sm text-purple-600">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3" />
              {mockData.bestDay}에 중요한 작업 배치하기
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3" />
              오전 {mockData.bestHour}시 집중 시간 보호하기
            </li>
            {mockData.correlations[0]?.impact === 'positive' && (
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                {mockData.correlations[0].factor} 유지하기
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
