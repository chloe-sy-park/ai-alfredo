import React from 'react';
import { Clock, TrendingUp, AlertCircle, CheckCircle, BarChart3, Timer } from 'lucide-react';

/**
 * 시간 추정 코치 카드
 * 홈 또는 태스크 완료 후 표시
 */
export const TimeEstimateInsightCard = ({ insight, recentEntries, darkMode, onDismiss }) => {
  if (!insight) return null;
  
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const typeColors = {
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
  };
  
  return (
    <div className={`${cardBg} rounded-2xl p-4 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-[#A996FF]" />
          <span className={`font-bold ${textPrimary}`}>시간 추정 코치</span>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className={`text-xs ${textSecondary}`}>
            닫기
          </button>
        )}
      </div>
      
      {/* 인사이트 메시지 */}
      <div className={`p-3 rounded-xl border ${typeColors[insight.type]} mb-3`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{insight.emoji}</span>
          <span className="font-semibold">{insight.message}</span>
        </div>
        <p className={`text-sm ${textSecondary} ml-7`}>{insight.suggestion}</p>
      </div>
      
      {/* 최근 기록 */}
      {recentEntries && recentEntries.length > 0 && (
        <div>
          <p className={`text-xs ${textSecondary} mb-2`}>최근 기록</p>
          <div className="space-y-2">
            {recentEntries.slice(0, 3).map((entry, i) => (
              <div key={i} className={`flex items-center justify-between text-sm ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg px-3 py-2`}>
                <span className={`${textPrimary} truncate flex-1`}>{entry.taskName}</span>
                <div className="flex items-center gap-2 ml-2">
                  <span className={textSecondary}>{entry.estimated}분</span>
                  <span className={textSecondary}>→</span>
                  <span className={entry.actual > entry.estimated ? 'text-amber-500' : 'text-emerald-500'}>
                    {entry.actual}분
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 태스크 완료 후 시간 결과 모달
 */
export const TimeResultToast = ({ taskName, estimated, actual, onClose, darkMode }) => {
  const diff = actual - estimated;
  const ratio = estimated > 0 ? actual / estimated : 1;
  
  const isOver = diff > 0;
  const bgColor = isOver 
    ? (darkMode ? 'bg-amber-900/30' : 'bg-amber-50')
    : (darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50');
  const borderColor = isOver ? 'border-amber-500/30' : 'border-emerald-500/30';
  const textColor = isOver ? 'text-amber-600' : 'text-emerald-600';
  
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4 mb-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer size={18} className={textColor} />
          <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            시간 기록 완료
          </span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
          ✕
        </button>
      </div>
      
      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
        "{taskName}"
      </p>
      
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>예상</p>
          <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{estimated}분</p>
        </div>
        <div className={textColor}>→</div>
        <div className="text-center">
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>실제</p>
          <p className={`font-bold ${textColor}`}>{actual}분</p>
        </div>
        <div className="flex-1 text-right">
          <span className={`text-sm ${textColor} font-semibold`}>
            {isOver ? `+${diff}분 더 걸림` : diff === 0 ? '정확!' : `${Math.abs(diff)}분 빨리 끝남`}
          </span>
        </div>
      </div>
      
      {/* 학습 메시지 */}
      {Math.abs(diff) > 5 && (
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          🐧 {isOver 
            ? `이런 작업은 예상의 ${Math.round(ratio * 100)}% 정도로 잡으면 좋겠어요`
            : '시간 추정을 잘 하셨네요!'
          }
        </p>
      )}
    </div>
  );
};

/**
 * 시간 추정 입력 도우미
 * 태스크 생성/편집 시 사용
 */
export const TimeEstimateHelper = ({ suggestedTime, originalTime, category, darkMode, onAccept }) => {
  if (!suggestedTime || suggestedTime === originalTime) return null;
  
  const diff = suggestedTime - originalTime;
  
  return (
    <div className={`flex items-center gap-2 text-sm ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-lg px-3 py-2 mt-2`}>
      <TrendingUp size={14} className="text-blue-500" />
      <span className={darkMode ? 'text-blue-300' : 'text-blue-600'}>
        이전 기록상 {suggestedTime}분 정도 걸릴 것 같아요 (+{diff}분)
      </span>
      {onAccept && (
        <button 
          onClick={() => onAccept(suggestedTime)}
          className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-xs rounded-md"
        >
          적용
        </button>
      )}
    </div>
  );
};

/**
 * 카테고리별 시간 통계 뷰
 */
export const CategoryTimeStats = ({ stats, darkMode }) => {
  const textPrimary = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-500';
  
  const categories = Object.entries(stats);
  if (categories.length === 0) return null;
  
  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={18} className="text-[#A996FF]" />
        <span className={`font-bold ${textPrimary}`}>카테고리별 시간 패턴</span>
      </div>
      
      <div className="space-y-2">
        {categories.map(([category, data]) => (
          <div key={category} className={`flex items-center justify-between ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg px-3 py-2`}>
            <span className={`${textPrimary} capitalize`}>{category}</span>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${textSecondary}`}>{data.count}개</span>
              <span className={`text-sm font-semibold ${
                data.factor > 1.2 ? 'text-amber-500' : 
                data.factor < 0.9 ? 'text-emerald-500' : 
                textSecondary
              }`}>
                ×{data.factor}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  TimeEstimateInsightCard,
  TimeResultToast,
  TimeEstimateHelper,
  CategoryTimeStats,
};
