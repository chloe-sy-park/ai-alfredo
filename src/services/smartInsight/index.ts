/**
 * Smart Insight Service
 *
 * Low-Integration Smartness UX
 * 연동 0~1개에서도 "알프레도가 똑똑하다"를 체감하게 하는 인사이트 시스템
 */

// Types
export * from './types';

// Integration State
export { detectIntegrationState, hasCalendarIntegration, hasNotionIntegration, getIntegrationStateDescription, getIntegrationCTALabel } from './integrationStateDetector';

// Day Type Classification
export { calculateDayMetrics, classifyDayType, classifyDayTypeNoCalendar, classifyDay } from './dayTypeClassifier';

// Moment Insight
export { generateMomentInsight, shouldShowMomentInsight } from './momentInsightGenerator';

// Avoid One
export { generateAvoidOneInsight, shouldShowAvoidOneInsight, getAvoidOneHint } from './avoidOneGenerator';

// Insight Picker
export { pickInsights, sortInsightsByPriority, shouldRegenerateInsights } from './insightPicker';
