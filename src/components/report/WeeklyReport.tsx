/**
 * WeeklyReport.tsx - 주간 리포트 컴포넌트
 * PRD Component Inventory 컴포넌트 활용
 */
import React from 'react';
import { LiftRecord } from '../../stores/liftStore';
import InsightChart, { TimePatternData } from './InsightChart';
import LiftSummary from './LiftSummary';
import LiftTimeline from './LiftTimeline';
import { SummaryNarrative, ObservationNarrative } from './ReportNarrative';
import NextWeekExperiment from './NextWeekExperiment';
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

// 시간대 패턴 데이터 생성
function generateTimePatternData(lifts: LiftRecord[]): TimePatternData {
  var timeSlots = [
    { hour: '6-9', label: '이른 아침', count: 0 },
    { hour: '9-12', label: '오전', count: 0 },
    { hour: '12-14', label: '점심', count: 0 },
    { hour: '14-18', label: '오후', count: 0 },
    { hour: '18-21', label: '저녁', count: 0 },
    { hour: '21-24', label: '밤', count: 0 },
  ];

  // 각 lift의 시간대 집계
  lifts.forEach(function(lift) {
    var date = new Date(lift.timestamp);
    var hour = date.getHours();

    if (hour >= 6 && hour < 9) timeSlots[0].count++;
    else if (hour >= 9 && hour < 12) timeSlots[1].count++;
    else if (hour >= 12 && hour < 14) timeSlots[2].count++;
    else if (hour >= 14 && hour < 18) timeSlots[3].count++;
    else if (hour >= 18 && hour < 21) timeSlots[4].count++;
    else if (hour >= 21 || hour < 6) timeSlots[5].count++;
  });

  // intensity 계산
  var maxCount = Math.max(...timeSlots.map(function(s) { return s.count; }), 1);

  var slots = timeSlots.map(function(slot) {
    var intensity: 'low' | 'medium' | 'high' = 'low';
    if (slot.count > maxCount * 0.66) intensity = 'high';
    else if (slot.count > maxCount * 0.33) intensity = 'medium';

    return {
      hour: slot.hour,
      label: slot.label,
      count: slot.count,
      intensity: intensity,
    };
  });

  // 피크 타임 찾기
  var peakSlot = slots.reduce(function(max, slot) {
    return slot.count > max.count ? slot : max;
  }, slots[0]);

  var peakTime = peakSlot && peakSlot.count > 0 ? peakSlot.label : undefined;

  return { slots: slots, peakTime: peakTime };
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

        <NextWeekExperiment lifts={lifts} />
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

      {/* Section 2.5: Time Pattern Chart - PRD Phase 3 패턴 우선순위 */}
      <InsightChart
        type="timePattern"
        title="시간대별 패턴"
        data={generateTimePatternData(lifts)}
        height={160}
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

      {/* Section 6: Next Week Experiment - PRD Phase 3 방향 제안 */}
      <NextWeekExperiment lifts={lifts} />
    </div>
  );
};

export default WeeklyReport;
