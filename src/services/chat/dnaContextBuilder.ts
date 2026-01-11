import { DNAProfile } from '@/services/dna/types';

/**
 * DNA 기반 채팅 컨텍스트 빌더
 * AI 채팅에 사용자의 DNA 프로필 정보를 자연스럽게 주입
 */

export interface DNAChatContext {
  systemPromptAddition: string;
  currentInsights: string[];
  conversationTips: string[];
}

/**
 * DNA 프로필에서 채팅 컨텍스트 생성
 */
export function buildDNAChatContext(profile: DNAProfile | null): DNAChatContext {
  if (!profile) {
    return {
      systemPromptAddition: '',
      currentInsights: [],
      conversationTips: []
    };
  }

  const systemPromptParts: string[] = [];
  const currentInsights: string[] = [];
  const conversationTips: string[] = [];

  // 1. 크로노타입 정보
  if (profile.chronotype.confidence >= 2) {
    const chronotypeInfo = profile.chronotype.type === 'morning'
      ? '이 사용자는 아침형 인간입니다. 아침에 중요한 일을 추천해주세요.'
      : profile.chronotype.type === 'evening'
        ? '이 사용자는 저녁형 인간입니다. 아침에 무리한 일정은 피해주세요.'
        : '이 사용자는 중립적인 생활 패턴을 가지고 있습니다.';
    
    systemPromptParts.push(chronotypeInfo);
    
    if (profile.chronotype.type === 'morning') {
      currentInsights.push('아침형이라 오전에 집중력이 좋아요');
    } else if (profile.chronotype.type === 'evening') {
      currentInsights.push('저녁형이라 오후에 에너지가 올라가요');
    }
  }

  // 2. 에너지 패턴
  if (profile.energyPattern.peakHours.length > 0) {
    const peakHoursStr = profile.energyPattern.peakHours.join(', ');
    systemPromptParts.push(
      `에너지가 높은 시간대: ${peakHoursStr}시. 이 시간에 중요한 작업을 추천해주세요.`
    );
    currentInsights.push(`피크 시간: ${peakHoursStr}시`);
  }

  if (profile.energyPattern.hasAfternoonSlump) {
    systemPromptParts.push(
      '이 사용자는 점심 후 에너지 저하(오후 슬럼프)가 있습니다. 오후 초반엔 가벼운 일을 추천해주세요.'
    );
    conversationTips.push('오후 초반엔 가벼운 일을 제안하세요');
  }

  // 3. 업무 스타일
  const workStyleInfo = profile.workStyle.type === 'collaborative'
    ? '이 사용자는 협업 중심으로 일합니다. 미팅이 많은 스타일이에요.'
    : profile.workStyle.type === 'independent'
      ? '이 사용자는 독립적으로 일하는 것을 선호합니다. 집중 시간을 보호해주세요.'
      : '이 사용자는 협업과 독립 작업의 균형을 맞추고 있습니다.';
  
  systemPromptParts.push(workStyleInfo);

  // 4. 스트레스 상태 (매우 중요)
  const stressLevel = profile.stressIndicators.level;
  if (stressLevel === 'burnout') {
    systemPromptParts.push(
      '🚨 주의: 이 사용자는 현재 번아웃 위험 상태입니다. 매우 부드럽고 지지적인 톤으로 대화하세요. ' +
      '무리한 일정이나 추가 작업을 추천하지 마세요. 휴식을 권장해주세요.'
    );
    conversationTips.push('부드럽고 지지적인 톤 사용');
    conversationTips.push('휴식과 자기 돌봄 권장');
    currentInsights.push('⚠️ 최근 많이 바빴어요 - 케어 모드');
  } else if (stressLevel === 'high') {
    systemPromptParts.push(
      '이 사용자는 현재 스트레스 수준이 높습니다. 이해하는 톤으로 대화하고, 작업량을 줄이는 방향을 제안해주세요.'
    );
    conversationTips.push('이해하는 톤 사용');
    currentInsights.push('스트레스 수준 높음');
  }

  // 5. 워라밸 상태
  if (profile.workLifeBalance.status === 'poor') {
    systemPromptParts.push(
      '이 사용자의 워라밸이 좋지 않습니다. 개인 시간과 휴식의 중요성을 상기시켜주세요.'
    );
    if (profile.workLifeBalance.hasAfterHoursWork) {
      currentInsights.push('퇴근 후에도 일하는 경향');
    }
  }

  if (profile.workLifeBalance.hasExerciseRoutine) {
    currentInsights.push('운동 루틴이 있어요 💪');
    conversationTips.push('운동 습관을 칭찬해주세요');
  }

  // 6. 요일 패턴
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  if (profile.weekdayPatterns.busiestDay !== -1) {
    const busiestDayName = dayNames[profile.weekdayPatterns.busiestDay];
    systemPromptParts.push(
      `${busiestDayName}요일이 보통 가장 바쁜 날입니다.`
    );
    currentInsights.push(`가장 바쁜 날: ${busiestDayName}요일`);
  }

  // 7. 집중 시간
  if (profile.focusTime.averageDeepWorkHours > 0) {
    systemPromptParts.push(
      `하루 평균 ${profile.focusTime.averageDeepWorkHours.toFixed(1)}시간의 딥워크 시간이 있습니다.`
    );
  }

  // 8. 현재 시간 기반 컨텍스트
  const currentHour = new Date().getHours();
  const isPeakTime = profile.energyPattern.peakHours.includes(currentHour);
  const isLowTime = profile.energyPattern.lowHours.includes(currentHour);

  if (isPeakTime) {
    systemPromptParts.push('현재 이 사용자의 피크 시간대입니다. 중요한 작업을 제안하기 좋은 때입니다.');
    currentInsights.push('🧠 지금 피크 시간!');
  } else if (isLowTime) {
    systemPromptParts.push('현재 이 사용자의 에너지가 낮은 시간대입니다. 가벼운 일이나 휴식을 권장해주세요.');
    currentInsights.push('😴 지금은 에너지 낮은 시간');
  }

  return {
    systemPromptAddition: systemPromptParts.join(' '),
    currentInsights,
    conversationTips
  };
}

/**
 * 시스템 프롬프트에 추가할 DNA 컨텍스트 생성
 */
export function buildDNASystemPrompt(profile: DNAProfile | null): string {
  if (!profile) {
    return '';
  }

  const context = buildDNAChatContext(profile);
  
  if (!context.systemPromptAddition) {
    return '';
  }

  return `

[사용자 DNA 프로필 - 캘린더 분석 기반]
${context.systemPromptAddition}

대화 가이드라인:
${context.conversationTips.map(tip => `- ${tip}`).join('\n')}
`;
}

/**
 * 채팅 UI에 표시할 현재 인사이트 배지들
 */
export function getDNAInsightBadges(profile: DNAProfile | null): Array<{
  label: string;
  type: 'positive' | 'warning' | 'info';
}> {
  if (!profile) return [];

  const badges: Array<{ label: string; type: 'positive' | 'warning' | 'info' }> = [];
  const currentHour = new Date().getHours();

  // 피크 시간 배지
  if (profile.energyPattern.peakHours.includes(currentHour)) {
    badges.push({ label: '🧠 피크 시간', type: 'positive' });
  }

  // 스트레스 배지
  if (profile.stressIndicators.level === 'burnout') {
    badges.push({ label: '💜 케어 모드', type: 'warning' });
  } else if (profile.stressIndicators.level === 'high') {
    badges.push({ label: '😮‍💨 바쁜 시기', type: 'warning' });
  }

  // 크로노타입 배지 (아침/저녁)
  if (currentHour < 12 && profile.chronotype.type === 'morning') {
    badges.push({ label: '☀️ 아침형 골든타임', type: 'positive' });
  } else if (currentHour >= 18 && profile.chronotype.type === 'evening') {
    badges.push({ label: '🌙 저녁형 활성화', type: 'positive' });
  }

  // 운동 루틴 배지
  if (profile.workLifeBalance.hasExerciseRoutine) {
    badges.push({ label: '💪 운동 루틴', type: 'info' });
  }

  return badges;
}
