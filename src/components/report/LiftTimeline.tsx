/**
 * LiftTimeline
 * PRD Component Inventory: 판단 변화 타임라인 컴포넌트
 * 시간 순서대로 Lift 이벤트를 표시
 */

import { Check, Pause, HelpCircle, ChevronRight } from 'lucide-react';
import { LiftRecord } from '../../stores/liftStore';

interface LiftTimelineProps {
  lifts: LiftRecord[];
  maxItems?: number;
  showDate?: boolean;
  onItemClick?: (lift: LiftRecord) => void;
  onMore?: () => void;
}

function formatTime(date: Date): string {
  var d = new Date(date);
  var hours = d.getHours();
  var minutes = d.getMinutes();
  var ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12;
  var minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return ampm + ' ' + hours + ':' + minutesStr;
}

function formatDate(date: Date): string {
  var d = new Date(date);
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  var weekday = weekdays[d.getDay()];
  return month + '/' + day + ' (' + weekday + ')';
}

function getTypeConfig(type: 'apply' | 'maintain' | 'consider') {
  switch (type) {
    case 'apply':
      return {
        icon: Check,
        label: '적용',
        bgColor: 'bg-[#A996FF]',
        textColor: 'text-white',
        borderColor: 'border-[#A996FF]'
      };
    case 'maintain':
      return {
        icon: Pause,
        label: '유지',
        bgColor: 'bg-[#E5E5E5]',
        textColor: 'text-[#666666]',
        borderColor: 'border-[#E5E5E5]'
      };
    case 'consider':
      return {
        icon: HelpCircle,
        label: '검토',
        bgColor: 'bg-[#FEF3C7]',
        textColor: 'text-[#F97316]',
        borderColor: 'border-[#F97316]'
      };
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case 'priority':
      return '우선순위';
    case 'schedule':
      return '일정';
    case 'worklife':
      return '워라밸';
    case 'condition':
      return '컨디션';
    default:
      return category;
  }
}

function getImpactLabel(impact: string) {
  switch (impact) {
    case 'high':
      return '높음';
    case 'medium':
      return '중간';
    case 'low':
      return '낮음';
    default:
      return impact;
  }
}

function getImpactColor(impact: string) {
  switch (impact) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}

// Group lifts by date
function groupByDate(lifts: LiftRecord[]): Record<string, LiftRecord[]> {
  var groups: Record<string, LiftRecord[]> = {};

  lifts.forEach(function(lift) {
    var date = new Date(lift.timestamp);
    var dateKey = date.toISOString().split('T')[0];

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(lift);
  });

  return groups;
}

export default function LiftTimeline({
  lifts,
  maxItems = 10,
  showDate = true,
  onItemClick,
  onMore
}: LiftTimelineProps) {
  // Sort by timestamp descending (newest first)
  var sortedLifts = [...lifts].sort(function(a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  var displayLifts = sortedLifts.slice(0, maxItems);
  var hasMore = sortedLifts.length > maxItems;

  if (lifts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-4">변화 타임라인</h3>
        <p className="text-sm text-[#999999] dark:text-gray-400 text-center py-6">
          아직 기록된 판단 변화가 없어요
        </p>
      </div>
    );
  }

  if (showDate) {
    var grouped = groupByDate(displayLifts);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-4">변화 타임라인</h3>

        <div className="space-y-6">
          {Object.entries(grouped).map(function([dateKey, dateLifts]) {
            return (
              <div key={dateKey}>
                {/* 날짜 헤더 */}
                <p className="text-xs text-[#999999] dark:text-gray-400 mb-3">
                  {formatDate(new Date(dateKey))}
                </p>

                {/* 해당 날짜의 Lift 아이템들 */}
                <div className="relative pl-6">
                  {/* 세로 라인 */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#E5E5E5] dark:bg-gray-700" />

                  <div className="space-y-4">
                    {dateLifts.map(function(lift) {
                      var config = getTypeConfig(lift.type);
                      var IconComponent = config.icon;

                      return (
                        <div
                          key={lift.id}
                          className={`relative ${onItemClick ? 'cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-gray-700 -mx-2 px-2 py-2 rounded-lg transition-colors' : ''}`}
                          onClick={function() { onItemClick && onItemClick(lift); }}
                        >
                          {/* 타임라인 도트 */}
                          <div
                            className={`absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center ${config.bgColor}`}
                          >
                            <IconComponent size={10} className={config.textColor} />
                          </div>

                          {/* 콘텐츠 */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bgColor} ${config.textColor}`}>
                                  {config.label}
                                </span>
                                <span className="text-xs text-[#999999] dark:text-gray-400">
                                  {getCategoryLabel(lift.category)}
                                </span>
                                <span className={`text-xs ${getImpactColor(lift.impact)}`}>
                                  {getImpactLabel(lift.impact)}
                                </span>
                              </div>
                              <p className="text-sm text-[#1A1A1A] dark:text-white mb-1">
                                {lift.reason}
                              </p>
                              <p className="text-xs text-[#999999] dark:text-gray-400">
                                <span className="line-through">{lift.previousDecision}</span>
                                <span className="mx-2">→</span>
                                <span className="text-[#1A1A1A] dark:text-white">{lift.newDecision}</span>
                              </p>
                            </div>

                            <span className="text-xs text-[#999999] dark:text-gray-400 flex-shrink-0">
                              {formatTime(lift.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 더 보기 */}
        {hasMore && onMore && (
          <button
            onClick={onMore}
            className="w-full mt-4 py-3 text-sm text-[#A996FF] hover:bg-[#F5F5F5] dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            더 보기
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    );
  }

  // Simple list without date grouping
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
      <h3 className="font-semibold text-[#1A1A1A] dark:text-white mb-4">변화 타임라인</h3>

      <div className="relative pl-6">
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#E5E5E5] dark:bg-gray-700" />

        <div className="space-y-4">
          {displayLifts.map(function(lift) {
            var config = getTypeConfig(lift.type);
            var IconComponent = config.icon;

            return (
              <div
                key={lift.id}
                className={`relative ${onItemClick ? 'cursor-pointer hover:bg-[#F5F5F5] dark:hover:bg-gray-700 -mx-2 px-2 py-2 rounded-lg transition-colors' : ''}`}
                onClick={function() { onItemClick && onItemClick(lift); }}
              >
                <div
                  className={`absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center ${config.bgColor}`}
                >
                  <IconComponent size={10} className={config.textColor} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1A1A1A] dark:text-white">
                      {lift.reason}
                    </p>
                    <p className="text-xs text-[#999999] dark:text-gray-400 mt-1">
                      {getCategoryLabel(lift.category)} · {getImpactLabel(lift.impact)}
                    </p>
                  </div>

                  <span className="text-xs text-[#999999] dark:text-gray-400 flex-shrink-0">
                    {formatTime(lift.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasMore && onMore && (
        <button
          onClick={onMore}
          className="w-full mt-4 py-3 text-sm text-[#A996FF] hover:bg-[#F5F5F5] dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          더 보기
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
