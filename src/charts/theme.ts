/**
 * Chart Theme Configuration
 *
 * CSS 변수를 참조하는 차트 테마 매핑 객체
 * Recharts, Chart.js 등에서 공통으로 사용
 *
 * 사용 예:
 *   import { chartTheme } from '@/charts/theme';
 *   <CartesianGrid stroke={chartTheme.gridMajor} />
 *   <Bar fill={chartTheme.seriesWork} />
 */

export const chartTheme = {
  // Canvas & Panel
  canvas: "var(--chart-canvas)",
  panel: "var(--chart-panel)",

  // Grid
  gridMajor: "var(--chart-grid-major)",
  gridMinor: "var(--chart-grid-minor)",

  // Axis
  axisLine: "var(--chart-axis-line)",
  axisTick: "var(--chart-axis-tick)",
  axisLabel: "var(--chart-axis-label)",

  // Labels
  labelTitle: "var(--chart-label-title)",
  labelSubtitle: "var(--chart-label-subtitle)",
  labelValue: "var(--chart-label-value)",
  labelMuted: "var(--chart-label-muted)",

  // Series Colors
  seriesNeutral: "var(--chart-series-neutral)",
  seriesWork: "var(--chart-series-work)",
  seriesLife: "var(--chart-series-life)",
  seriesFinance: "var(--chart-series-finance)",

  // Emphasis
  emphasisToday: "var(--chart-emphasis-today)",
  emphasisRecommended: "var(--chart-emphasis-recommended)",
  emphasisSelectionRing: "var(--chart-emphasis-selection-ring)",

  // Reference Lines
  baseline: "var(--chart-reference-baseline)",
  threshold: "var(--chart-reference-threshold)",

  // State Colors (from global tokens)
  stateSuccess: "var(--state-success)",
  stateWarning: "var(--state-warning)",
  stateDanger: "var(--state-danger)",
  stateInfo: "var(--state-info)",
} as const;

// Type for chart theme keys
export type ChartThemeKey = keyof typeof chartTheme;

/**
 * 시리즈 색상 프리셋
 *
 * 운영 규칙:
 * - 한 그래프에서 OS 컬러는 1개만 사용, 나머지는 neutral로 비교
 * - Gold(accent)는 today/recommended/marker에만 사용
 */
export const seriesPresets = {
  // 기본: neutral 베이스
  default: [chartTheme.seriesNeutral],

  // OS 모드별 (강조 1개 + neutral)
  work: [chartTheme.seriesWork, chartTheme.seriesNeutral],
  life: [chartTheme.seriesLife, chartTheme.seriesNeutral],
  finance: [chartTheme.seriesFinance, chartTheme.seriesNeutral],

  // 비교 차트 (3가지 OS)
  osComparison: [
    chartTheme.seriesWork,
    chartTheme.seriesLife,
    chartTheme.seriesFinance,
  ],

  // 상태 표시
  status: [
    chartTheme.stateSuccess,
    chartTheme.stateWarning,
    chartTheme.stateDanger,
  ],
} as const;

/**
 * 차트 컴포넌트 스타일 토큰 (component.chart.json 기반)
 */
export const chartStyles = {
  line: {
    strokeWidth: 2,
    strokeWidthEmphasis: 3,
    dot: { radius: 3, radiusEmphasis: 5 },
    area: { opacity: 0.12 },
  },
  bar: {
    radius: 10,
    gap: 8,
  },
  stacked: {
    opacity: 0.85,
  },
  donut: {
    strokeWidth: 14,
  },
  heatmap: {
    cell: { radius: 6, gap: 4 },
  },
} as const;

/**
 * Recharts Tooltip 기본 스타일
 */
export const tooltipStyle = {
  backgroundColor: chartTheme.panel,
  border: `1px solid var(--border-default)`,
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

/**
 * CSS 변수에서 실제 계산된 값 가져오기
 * (Recharts가 CSS 변수를 직접 지원하지 않는 경우 사용)
 */
export function getComputedColor(cssVar: string): string {
  if (typeof window === 'undefined') return '';
  const varName = cssVar.replace('var(', '').replace(')', '');
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/**
 * 모든 차트 색상의 계산된 값을 객체로 반환
 */
export function getComputedChartColors() {
  return {
    seriesNeutral: getComputedColor(chartTheme.seriesNeutral),
    seriesWork: getComputedColor(chartTheme.seriesWork),
    seriesLife: getComputedColor(chartTheme.seriesLife),
    seriesFinance: getComputedColor(chartTheme.seriesFinance),
    emphasisToday: getComputedColor(chartTheme.emphasisToday),
    gridMajor: getComputedColor(chartTheme.gridMajor),
    axisLabel: getComputedColor(chartTheme.axisLabel),
  };
}
