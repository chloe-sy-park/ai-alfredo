/**
 * WeeklyReport.tsx - 주간 리포트 컴포넌트
 * PRD Component Inventory 컴포넌트 활용
 */
import React from 'react';
import { LiftRecord } from '../../stores/liftStore';
import InsightChart from './InsightChart';
import LiftSummary from './LiftSummary';
import LiftTimeline from './LiftTimeline';
import { SummaryNarrative, ObservationNarrative, SuggestionNarrative } from './ReportNarrative';
import EmptyState from '../common/EmptyState';

interface WeeklyReportProps {
  lifts: LiftRecord[];
}

// 주간 요약 텍스트 생성
function generateWeeklySummary(lifts: LiftRecord[]): string {
  var applyCount = lifts.filter(function(l) { return l.type === 'apply'; }).length;
  var total = lifts.length;

  if (total === 0) {
    return '이번 주는 기록된 판단 변화가 없어요. 평온한 한 주였나요?';
  }

  if (applyCount >= total * 0.7) {
    return '이번 주는 결단력 있게 변화를 적용했고, 흐름이 안정적이었어요.';
  }

  if (applyCount >= total * 0.4) {
    return '이번 주는 신중하게 판단을 조율했고, 균형을 유지했어요.';
  }

  return '이번 주는 많은 것을 고민했고, 그 과정 자체가 의미 있었어요.';
}

// 관찰 텍스트 생성
function generateObservation(lifts: LiftRecord[]): string[] {
  if (lifts.length === 0) {
    return ['아직 기록된 판단 변화가 없어요.', '채팅에서 우선순위를 조정하거나 할 일을 완료하면 기록이 쌓여요.'];
  }

  var highImpact = lifts.filter(function(l) { return l.impact === 'high'; }).length;
  var worklifeCount = lifts.filter(function(l) { return l.category === 'worklife'; }).length;
  var priorityCount = lifts.filter(function(l) { return l.category === 'priority'; }).length;

  var observations: string[] = [];

  observations.push('이번 주에는 ' + lifts.length + '번의 판단 재조정이 있었어요.');

  if (highImpact > 0) {
    observations.push('그 중 ' + highImpact + '번은 영향도가 높은 결정이었어요.');
  }

  if (worklifeCount > priorityCount) {
    observations.push('워라밸 관련 조정이 가장 많았어요. 균형을 찾으려 노력한 흔적이에요.');
  } else if (priorityCount > 0) {
    observations.push('우선순위 조정이 많았어요. 집중할 대상을 계속 다듬어 나갔네요.');
  }

  return observations;
}

// 제안 텍스트 생성
function generateSuggestions(lifts: LiftRecord[]): string[] {
  var categories = lifts.map(function(l) { return l.category; });
  var suggestions: string[] = [];

  if (categories.filter(function(c) { return c === 'schedule'; }).length > 2) {
    suggestions.push('일정 변경이 잦았어요. 버퍼 시간을 좀 더 확보해보세요.');
  }

  if (categories.filter(function(c) { return c === 'condition'; }).length > 2) {
    suggestions.push('컨디션 기반 조정이 많았어요. 에너지 패턴을 파악해보면 좋겠어요.');
  }

  // 기본 제안
  if (suggestions.length === 0) {
    suggestions.push('아침 시간대 판단은 전날 밤에 미리 해보기');
    suggestions.push('Work 시간이 길어질 때 15분 단위로 체크인하기');
  }

  suggestions.push('다음 주에도 알프레도와 함께 균형을 찾아가요');

  return suggestions;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ lifts }) => {
  // Work vs Life 비율 계산
  var worklifeLifts = lifts.filter(function(l) { return l.category === 'worklife'; });
  var workPercent = 65; // 기본값
  var lifePercent = 35;

  if (worklifeLifts.length > 0) {
    // 실제 데이터가 있으면 조정 방향으로 계산
    var towardLife = worklifeLifts.filter(function(l) {
      return l.newDecision.includes('life') || l.newDecision.includes('삶') || l.newDecision.includes('휴식');
    }).length;
    lifePercent = Math.min(30 + (towardLife * 5), 50);
    workPercent = 100 - lifePercent;
  }

  // 데이터 없을 때
  if (lifts.length === 0) {
    return (
      <div className="px-4 py-6 space-y-6">
        <SummaryNarrative content={generateWeeklySummary(lifts)} />

        <EmptyState
          variant="default"
          title="아직 기록이 없어요"
          description="채팅에서 우선순위를 조정하거나 할 일을 완료하면 여기에 기록이 쌓여요."
          action={{
            label: '채팅 시작하기',
            onClick: function() { window.location.href = '/chat'; }
          }}
        />

        <SuggestionNarrative content={generateSuggestions(lifts)} title="시작해볼까요?" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Section 1: One-line Summary */}
      <SummaryNarrative content={generateWeeklySummary(lifts)} />

      {/* Section 2: Balance Overview with InsightChart */}
      <InsightChart
        type="balance"
        title="균형 개요"
        data={{ work: workPercent, life: lifePercent }}
        height={140}
      />

      {/* Section 3: Judgement Lift Summary */}
      <LiftSummary
        lifts={lifts}
        period="week"
        showDescription={true}
      />

      {/* Section 4: Lift Timeline */}
      <LiftTimeline
        lifts={lifts}
        maxItems={5}
        showDate={true}
      />

      {/* Section 5: Alfredo's Observation */}
      <ObservationNarrative content={generateObservation(lifts)} />

      {/* Section 6: Suggestions */}
      <SuggestionNarrative content={generateSuggestions(lifts)} />
    </div>
  );
};

export default WeeklyReport;
