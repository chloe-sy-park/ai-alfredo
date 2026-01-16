/**
 * MonthlyReport.tsx - 월간 리포트 컴포넌트
 * PRD Component Inventory 컴포넌트 활용
 */
import React from 'react';
import { LiftRecord } from '../../stores/liftStore';
import InsightChart from './InsightChart';
import LiftSummary from './LiftSummary';
import { SummaryNarrative, ObservationNarrative, SuggestionNarrative } from './ReportNarrative';
import EmptyState from '../common/EmptyState';

interface MonthlyReportProps {
  lifts: LiftRecord[];
}

// 월간 요약 텍스트 생성
function generateMonthlySummary(lifts: LiftRecord[]): string {
  var total = lifts.length;

  if (total === 0) {
    return '이번 달은 기록된 판단 변화가 없어요. 다음 달에는 함께 기록해봐요.';
  }

  if (total >= 30) {
    return '이번 달은 많은 결정을 내렸고, 경험이 쌓여가고 있어요.';
  }

  if (total >= 15) {
    return '이번 달은 균형점을 찾아가는 과정이었고, 패턴이 안정되기 시작했어요.';
  }

  return '이번 달은 천천히 시작했고, 조금씩 리듬을 만들어가고 있어요.';
}

// 카테고리별 분포 계산
function getCategoryDistribution(lifts: LiftRecord[]) {
  var distribution: Record<string, number> = {
    priority: 0,
    schedule: 0,
    worklife: 0,
    condition: 0
  };

  lifts.forEach(function(lift) {
    distribution[lift.category]++;
  });

  return distribution;
}

// 주차별 트렌드 계산
function getWeeklyTrend(lifts: LiftRecord[]): Array<{ label: string; value: number; change: number }> {
  var now = new Date();
  var weeks: Array<{ label: string; value: number; change: number }> = [];

  for (var i = 3; i >= 0; i--) {
    var weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
    var weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    var weekLifts = lifts.filter(function(lift) {
      var liftDate = new Date(lift.timestamp);
      return liftDate >= weekStart && liftDate < weekEnd;
    });

    var prevWeekLifts = i < 3 ? (weeks[weeks.length - 1]?.value || 0) : 0;
    var change = prevWeekLifts > 0 ? Math.round(((weekLifts.length - prevWeekLifts) / prevWeekLifts) * 100) : 0;

    weeks.push({
      label: (4 - i) + '주차',
      value: weekLifts.length,
      change: change
    });
  }

  return weeks;
}

// 반복 패턴 분석
function getRepeatedPatterns(lifts: LiftRecord[]): Array<{ label: string; value: number; color: string }> {
  var categoryCount = getCategoryDistribution(lifts);
  var colors: Record<string, string> = {
    priority: '#A996FF',
    schedule: '#60A5FA',
    worklife: '#F97316',
    condition: '#4ADE80'
  };
  var labels: Record<string, string> = {
    priority: '우선순위 조정',
    schedule: '일정 변경',
    worklife: '워라밸 선택',
    condition: '컨디션 기반 결정'
  };

  return Object.entries(categoryCount)
    .filter(function(entry) { return entry[1] > 0; })
    .sort(function(a, b) { return b[1] - a[1]; })
    .map(function(entry) {
      return {
        label: labels[entry[0]] || entry[0],
        value: entry[1],
        color: colors[entry[0]] || '#999999'
      };
    });
}

// 관찰 텍스트 생성
function generateObservation(lifts: LiftRecord[]): string[] {
  if (lifts.length === 0) {
    return ['아직 월간 기록이 없어요.', '매일 조금씩 기록하면 한 달 뒤에 의미 있는 패턴이 보여요.'];
  }

  var observations: string[] = [];
  var weeklyTrend = getWeeklyTrend(lifts);
  var patterns = getRepeatedPatterns(lifts);

  observations.push('한 달 동안 총 ' + lifts.length + '번의 판단 조정이 있었어요.');

  // 추세 분석
  var firstWeek = weeklyTrend[0]?.value || 0;
  var lastWeek = weeklyTrend[3]?.value || 0;

  if (firstWeek > lastWeek) {
    observations.push('초반에는 조정이 많았지만, 후반으로 갈수록 안정되었어요.');
  } else if (lastWeek > firstWeek) {
    observations.push('시간이 지나면서 적극적으로 조율하게 되었어요.');
  }

  // 가장 많은 패턴
  if (patterns.length > 0) {
    observations.push('\'' + patterns[0].label + '\' 관련 결정이 가장 많았어요.');
  }

  return observations;
}

// 제안 텍스트 생성
function generateSuggestions(lifts: LiftRecord[]): string[] {
  var suggestions: string[] = [];
  var patterns = getRepeatedPatterns(lifts);

  if (patterns.length > 0 && patterns[0].value > lifts.length * 0.4) {
    suggestions.push('\'' + patterns[0].label + '\'에 대한 기준을 미리 정해두면 결정이 쉬워져요.');
  }

  var applyRate = lifts.filter(function(l) { return l.type === 'apply'; }).length / Math.max(lifts.length, 1);
  if (applyRate < 0.3) {
    suggestions.push('더 과감하게 변화를 적용해보세요. 작은 실험이 큰 발견으로 이어져요.');
  } else if (applyRate > 0.8) {
    suggestions.push('변화를 잘 받아들이고 있어요. 가끔은 현재 결정을 유지하는 것도 좋아요.');
  }

  suggestions.push('다음 달에도 알프레도와 함께 성장해요.');

  return suggestions;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ lifts }) => {
  // 데이터 없을 때
  if (lifts.length === 0) {
    return (
      <div className="px-4 py-6 space-y-6">
        <SummaryNarrative content={generateMonthlySummary(lifts)} />

        <EmptyState
          variant="default"
          title="월간 기록이 없어요"
          description="매일 조금씩 기록하면 한 달 뒤에 의미 있는 인사이트를 받을 수 있어요."
          action={{
            label: '기록 시작하기',
            onClick: function() { window.location.href = '/chat'; }
          }}
        />

        <SuggestionNarrative content={generateSuggestions(lifts)} title="시작해볼까요?" />
      </div>
    );
  }

  var weeklyTrend = getWeeklyTrend(lifts);
  var patterns = getRepeatedPatterns(lifts);

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Section 1: Month Summary */}
      <SummaryNarrative content={generateMonthlySummary(lifts)} />

      {/* Section 2: Weekly Trend */}
      <InsightChart
        type="trend"
        title="주차별 변화"
        data={weeklyTrend}
        height={160}
      />

      {/* Section 3: Category Distribution */}
      {patterns.length > 0 && (
        <InsightChart
          type="comparison"
          title="반복된 트레이드오프"
          data={{ items: patterns, maxValue: Math.max(...patterns.map(function(p) { return p.value; })) }}
          height={140}
        />
      )}

      {/* Section 4: Lift Summary */}
      <LiftSummary
        lifts={lifts}
        period="month"
        showDescription={true}
      />

      {/* Section 5: Alfredo's Long-term Observation */}
      <ObservationNarrative
        title="알프레도의 장기 관찰"
        content={generateObservation(lifts)}
      />

      {/* Section 6: Suggestions */}
      <SuggestionNarrative content={generateSuggestions(lifts)} />
    </div>
  );
};

export default MonthlyReport;
