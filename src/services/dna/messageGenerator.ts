import { DNAProfile, DNABasedSuggestion } from './types';

/**
 * DNA 기반 알프레도 메시지 생성기
 * 분석된 DNA 프로필을 기반으로 개인화된 메시지를 생성
 */
export class DNAMessageGenerator {
  private profile: DNAProfile;

  constructor(profile: DNAProfile) {
    this.profile = profile;
  }

  /**
   * 아침 브리핑 메시지 생성
   */
  generateMorningBriefing(todayEventCount: number, nextMeeting?: { title: string; time: string }): string {
    const hour = new Date().getHours();
    const chronotype = this.profile.chronotype.type;
    const stressLevel = this.profile.stressIndicators.level;
    const dayOfWeek = new Date().getDay();
    const busiestDay = this.profile.weekdayPatterns.busiestDay;

    let greeting = '';
    let mainMessage = '';
    let ending = '';

    // 크로노타입 기반 인사
    if (chronotype === 'morning') {
      if (hour < 8) {
        greeting = '오늘도 일찍 일어나셨네요! 역시 아침형 🌅';
      } else {
        greeting = '좋은 아침이에요!';
      }
    } else if (chronotype === 'evening') {
      if (hour < 9) {
        greeting = '아침은 천천히 시작해도 괜찮아요 ☕';
      } else {
        greeting = '좋은 아침이에요!';
      }
    } else {
      greeting = '좋은 아침이에요!';
    }

    // 스트레스 레벨 기반 메시지
    if (stressLevel === 'burnout') {
      mainMessage = '요즘 많이 바빴죠? 오늘은 무리하지 말고 ';
      if (todayEventCount === 0) {
        mainMessage += '여유롭게 보내세요 💜';
      } else if (todayEventCount <= 2) {
        mainMessage += `일정 ${todayEventCount}개만 처리해요.`;
      } else {
        mainMessage += '필수적인 것만 하고 쉬어가요.';
      }
    } else if (stressLevel === 'high') {
      mainMessage = `오늘 일정이 ${todayEventCount}개 있어요. `;
      if (nextMeeting) {
        mainMessage += `${nextMeeting.time}에 ${nextMeeting.title}부터 시작하고요. `;
      }
      mainMessage += '중간중간 휴식 잊지 마세요!';
    } else {
      // 일반 상태
      if (todayEventCount === 0) {
        mainMessage = '오늘은 일정이 없어요. 원하는 작업에 집중하기 좋은 날이에요!';
      } else if (todayEventCount <= 2) {
        mainMessage = `오늘 일정 ${todayEventCount}개가 있어요. `;
        if (nextMeeting) {
          mainMessage += `${nextMeeting.time}에 ${nextMeeting.title}이 있고요, 그 외엔 여유로워요.`;
        }
      } else if (todayEventCount <= 4) {
        mainMessage = `오늘 미팅이 좀 있네요(${todayEventCount}개). `;
        if (nextMeeting) {
          mainMessage += `${nextMeeting.time} ${nextMeeting.title}부터 시작이에요.`;
        }
      } else {
        mainMessage = `오늘 일정이 꽤 많아요(${todayEventCount}개). 체력 관리 잘 하셔야 해요!`;
      }
    }

    // 요일 패턴 기반 추가 메시지
    if (dayOfWeek === busiestDay) {
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      ending = ` ${dayNames[busiestDay]}요일은 보통 바쁘시잖아요. 컨디션 관리 잘 하세요!`;
    }

    // 피크 시간 안내
    const peakHours = this.profile.energyPattern.peakHours;
    if (peakHours.length > 0 && !ending) {
      const peakStart = Math.min(...peakHours);
      const peakEnd = Math.max(...peakHours);
      if (peakStart < 12) {
        ending = ` 오전 ${peakStart}시-${peakEnd}시가 집중하기 좋은 시간이에요!`;
      }
    }

    return `${greeting} ${mainMessage}${ending}`;
  }

  /**
   * 저녁 마무리 메시지 생성
   */
  generateEveningMessage(completedTasks: number, _totalTasks: number): string {
    const stressLevel = this.profile.stressIndicators.level;
    const workLifeBalance = this.profile.workLifeBalance.status;

    let message = '';

    if (stressLevel === 'burnout' || stressLevel === 'high') {
      message = '오늘도 고생 많으셨어요. ';
      if (completedTasks > 0) {
        message += `${completedTasks}개나 처리하셨네요! 대단해요. `;
      }
      message += '이제 푹 쉬세요 💜';
    } else if (workLifeBalance === 'poor') {
      message = '하루 마무리 시간이에요. ';
      if (completedTasks > 0) {
        message += `오늘 ${completedTasks}개 완료! `;
      }
      message += '일과 쉼의 균형도 중요해요. 오늘은 일찍 쉬어보는 건 어때요?';
    } else {
      if (completedTasks === 0) {
        message = '오늘 하루도 수고했어요. 완료한 태스크가 없어도 괜찮아요. 내일 또 화이팅!';
      } else if (completedTasks <= 3) {
        message = `오늘 ${completedTasks}개 완료! 잘하셨어요 👏 푹 쉬세요!`;
      } else {
        message = `와, 오늘 ${completedTasks}개나 완료하셨어요! 정말 대단해요 🎉 충분히 쉬세요!`;
      }
    }

    return message;
  }

  /**
   * 컨텍스트 기반 넛지 메시지 생성
   */
  generateContextualNudge(): DNABasedSuggestion | null {
    const hour = new Date().getHours();
    const peakHours = this.profile.energyPattern.peakHours;
    const lowHours = this.profile.energyPattern.lowHours;
    const stressLevel = this.profile.stressIndicators.level;

    // 피크 시간 알림
    if (peakHours.includes(hour)) {
      return {
        type: 'nudge',
        message: '지금이 집중하기 좋은 시간이에요! 중요한 일 하나 시작해볼까요?',
        basedOn: ['energy_pattern'],
        priority: 'medium',
        actionable: {
          label: '태스크 보기',
          action: 'open_tasks'
        }
      };
    }

    // 슬럼프 시간 케어
    if (lowHours.includes(hour)) {
      return {
        type: 'nudge',
        message: '이 시간대엔 에너지가 좀 낮으시잖아요. 가벼운 일 위주로 하거나 잠깐 스트레칭 어때요?',
        basedOn: ['energy_pattern'],
        priority: 'low',
        actionable: {
          label: '휴식 타이머',
          action: 'start_break'
        }
      };
    }

    // 스트레스 케어
    if (stressLevel === 'burnout') {
      return {
        type: 'warning',
        message: '요즘 너무 바쁘셨던 것 같아요. 오늘은 좀 쉬어도 괜찮아요 💜',
        basedOn: ['stress_level'],
        priority: 'high'
      };
    }

    return null;
  }

  /**
   * 집중 시간 추천
   */
  suggestFocusTime(): string | null {
    const bestSlots = this.profile.focusTime.bestSlots;
    const today = new Date().getDay();

    const todaySlots = bestSlots.filter(slot => slot.dayOfWeek === today);
    if (todaySlots.length === 0) return null;

    const bestSlot = todaySlots.sort((a, b) => {
      const qualityOrder = { excellent: 0, good: 1, fair: 2 };
      return qualityOrder[a.quality] - qualityOrder[b.quality];
    })[0];

    return `오늘 ${bestSlot.startHour}시-${bestSlot.endHour}시가 집중하기 좋아요 (${bestSlot.quality === 'excellent' ? '최고' : bestSlot.quality === 'good' ? '좋음' : '괜찮음'})`;
  }
}
