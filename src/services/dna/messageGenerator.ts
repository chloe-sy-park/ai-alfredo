import { DNAProfile, DNABasedSuggestion, InsightType } from './types';

/**
 * DNA 프로필 기반 메시지 생성기
 * "어떻게 알았어?" 경험을 만드는 핵심
 */
export class DNAMessageGenerator {
  private profile: DNAProfile;
  private confidenceTexts: Record<number, string> = {
    1: '인 것 같아요',
    2: '인 편이시네요',
    3: '이시잖아요'
  };

  constructor(profile: DNAProfile) {
    this.profile = profile;
  }

  /**
   * Day 1 메시지 (연동 직후)
   */
  generateDay1Messages(): DNABasedSuggestion[] {
    const messages: DNABasedSuggestion[] = [];
    const p = this.profile;

    // 오늘 일정 수
    messages.push({
      type: 'briefing',
      message: `캘린더 연동 완료! 오늘 일정 ${p.analyzedEventsCount}개 확인했어요.`,
      basedOn: [],
      priority: 'high'
    });

    // 첫 일정 시간
    if (p.chronotype.firstEventAvgTime) {
      messages.push({
        type: 'nudge',
        message: `첫 일정이 ${p.chronotype.firstEventAvgTime}네요. 아침에 여유 있으시겠어요!`,
        basedOn: ['chronotype'],
        priority: 'medium'
      });
    }

    // 가장 바쁜 요일
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    messages.push({
      type: 'nudge',
      message: `${dayNames[p.weekdayPatterns.busiestDay]}요일이 보통 제일 바쁜 날이네요.`,
      basedOn: ['busy_day'],
      priority: 'low'
    });

    return messages;
  }

  /**
   * Week 1 메시지 (1주 후)
   */
  generateWeek1Messages(): DNABasedSuggestion[] {
    const messages: DNABasedSuggestion[] = [];
    const p = this.profile;

    // 크로노타입
    const chronoText = p.chronotype.type === 'morning' 
      ? '아침형' 
      : p.chronotype.type === 'evening' 
        ? '저녁형' 
        : '중간형';
    
    messages.push({
      type: 'briefing',
      message: `${chronoText}${this.confidenceTexts[p.chronotype.confidence]} 첫 일정이 보통 ${p.chronotype.firstEventAvgTime}이더라고요.`,
      basedOn: ['chronotype'],
      priority: 'medium'
    });

    // 업무 스타일
    const styleText = p.workStyle.type === 'collaborative' 
      ? '협업 중심' 
      : p.workStyle.type === 'independent' 
        ? '독립 작업 중심' 
        : '균형 잡힌';
    
    messages.push({
      type: 'nudge',
      message: `미팅 비율이 ${p.workStyle.meetingRatio}%네요. ${styleText} 스타일이시군요!`,
      basedOn: ['work_style'],
      priority: 'low'
    });

    // 반복 일정 선호
    if (p.workStyle.prefersRoutine) {
      messages.push({
        type: 'nudge',
        message: '반복 일정이 많으시네요. 루틴을 좋아하시는 것 같아요!',
        basedOn: ['work_style'],
        priority: 'low'
      });
    }

    return messages;
  }

  /**
   * Week 2+ 메시지 (2주 후)
   */
  generateWeek2Messages(): DNABasedSuggestion[] {
    const messages: DNABasedSuggestion[] = [];
    const p = this.profile;

    // 에너지 패턴
    const peakHoursText = p.energyPattern.peakHours
      .map(h => `${h}시`)
      .join(', ');
    
    messages.push({
      type: 'briefing',
      message: `${peakHoursText}가 집중하기 좋은 시간인 것 같아요. 중요한 작업은 이때 추천드려요.`,
      basedOn: ['energy_pattern'],
      priority: 'high'
    });

    // 집중 시간
    if (p.focusTime.bestSlots.length > 0) {
      const bestSlot = p.focusTime.bestSlots[0];
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      messages.push({
        type: 'nudge',
        message: `${dayNames[bestSlot.dayOfWeek]}요일 ${bestSlot.startHour}시-${bestSlot.endHour}시가 딥워크하기 좋은 시간이에요!`,
        basedOn: ['focus_time'],
        priority: 'medium',
        actionable: {
          label: 'Focus Time 보호하기',
          action: 'protect_focus_time'
        }
      });
    }

    // 슬럼프 시간 경고
    if (p.energyPattern.lowHours.length > 0) {
      const lowHour = p.energyPattern.lowHours[0];
      messages.push({
        type: 'nudge',
        message: `오후 ${lowHour}시엔 에너지가 떨어지는 것 같아요. 가벼운 작업을 배치해드릴까요?`,
        basedOn: ['energy_pattern'],
        priority: 'low'
      });
    }

    return messages;
  }

  /**
   * 스트레스 감지 메시지
   */
  generateStressMessages(): DNABasedSuggestion[] {
    const messages: DNABasedSuggestion[] = [];
    const p = this.profile;

    if (p.stressIndicators.level === 'burnout') {
      messages.push({
        type: 'warning',
        message: '요즘 많이 힘드신 것 같아요. 주말에도 일정이 있고, 취소도 많아졌네요. 쉬어도 괜찮아요.',
        basedOn: ['stress_level'],
        priority: 'high',
        actionable: {
          label: '오늘 빈 시간 찾기',
          action: 'find_free_time'
        }
      });
    } else if (p.stressIndicators.level === 'high') {
      messages.push({
        type: 'warning',
        message: `일정 변경이 잦아졌네요. 괜찮으세요?`,
        basedOn: ['stress_level'],
        priority: 'medium'
      });
    }

    if (p.stressIndicators.weekendWorkDays > 0) {
      messages.push({
        type: 'nudge',
        message: `지난 주 주말에 ${p.stressIndicators.weekendWorkDays}일 일하셨네요. 이번 주말은 쉬세요!`,
        basedOn: ['stress_level', 'work_life_balance'],
        priority: 'medium'
      });
    }

    return messages;
  }

  /**
   * 워라밸 메시지
   */
  generateWorkLifeBalanceMessages(): DNABasedSuggestion[] {
    const messages: DNABasedSuggestion[] = [];
    const p = this.profile;

    if (p.workLifeBalance.status === 'poor') {
      messages.push({
        type: 'warning',
        message: '업무 일정이 많아요. 개인 시간도 중요해요!',
        basedOn: ['work_life_balance'],
        priority: 'medium',
        actionable: {
          label: '라이프 탭 보기',
          action: 'open_life_tab'
        }
      });
    }

    if (p.workLifeBalance.hasExerciseRoutine) {
      messages.push({
        type: 'celebration',
        message: '운동 루틴이 있으시네요! 대단해요 💪',
        basedOn: ['work_life_balance'],
        priority: 'low'
      });
    } else if (p.workLifeBalance.status === 'good') {
      messages.push({
        type: 'nudge',
        message: '워라밸이 좋으시네요! 간단한 운동 루틴을 추가해보는 건 어떨까요?',
        basedOn: ['work_life_balance'],
        priority: 'low'
      });
    }

    return messages;
  }

  /**
   * 아침 브리핑용 메시지 생성
   */
  generateMorningBriefing(todayEvents: number, nextMeeting?: { title: string; time: string }): string {
    const p = this.profile;
    const parts: string[] = [];

    // 인사
    const greetings = [
      '좋은 아침이에요!',
      '오늘도 힘내요!',
      '오늘 하루도 함께해요!'
    ];
    parts.push(greetings[Math.floor(Math.random() * greetings.length)]);

    // 오늘 일정
    if (todayEvents === 0) {
      parts.push('오늘은 일정이 없어요. 여유로운 하루 되세요!');
    } else {
      parts.push(`오늘 일정 ${todayEvents}개 있어요.`);
    }

    // 다음 미팅
    if (nextMeeting) {
      parts.push(`첫 미팅은 ${nextMeeting.time}에 "${nextMeeting.title}"이에요.`);
    }

    // 스트레스 기반 톤 조절
    if (p.stressIndicators.level === 'burnout' || p.stressIndicators.level === 'high') {
      parts.push('오늘은 무리하지 마세요 ❤️');
    }

    return parts.join(' ');
  }

  /**
   * 저녁 마무리 메시지 생성
   */
  generateEveningMessage(completedTasks: number, totalTasks: number): string {
    const p = this.profile;
    const parts: string[] = [];

    // 고생 메시지
    if (completedTasks > 0) {
      parts.push(`오늘 ${completedTasks}개 해냈어요. 고생했어요!`);
    } else {
      parts.push('오늘 하루 수고했어요.');
    }

    // 번아웃 위험 시 특별 메시지
    if (p.stressIndicators.level === 'burnout') {
      parts.push('오늘은 일찍 쉬세요. 내일을 위해서요.');
    }

    // 운동 루틴 없으면 가볍게 제안
    if (!p.workLifeBalance.hasExerciseRoutine && p.workLifeBalance.status !== 'poor') {
      parts.push('간단한 스트레칭 어때요?');
    }

    return parts.join(' ');
  }
}
