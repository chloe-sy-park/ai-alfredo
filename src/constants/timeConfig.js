// === Phase 2: Time Management System ===
// 시간 관리 설정

export const TIME_CONFIG = {
  // 예상 시간 초과 알림 임계값 (배수)
  overtimeThreshold: 1.5, // 예상 시간의 1.5배 초과 시 알림
  // 다음 일정 알림 시간 (분)
  eventAlertTimes: [30, 10], // 30분, 10분 전
  // 휴식 권유 시간 (분)
  breakReminderTime: 120, // 2시간 연속 작업 시
  // 식사 시간대 (시작 시간)
  mealTimes: {
    lunch: { start: 11, end: 13, label: '점심' },
    dinner: { start: 17, end: 19, label: '저녁' },
  },
  // 알림 쿨다운 (분) - 같은 알림 반복 방지
  alertCooldown: 5,
};
