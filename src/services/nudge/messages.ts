/**
 * 넛지 메시지 템플릿
 * 톤별 메시지 생성
 */

import type { NudgeType, Nudge } from './types';

// === 톤별 메시지 템플릿 ===
type TonePreset = 'friendly' | 'butler' | 'secretary' | 'coach' | 'trainer';

interface MessageTemplate {
  title: string;
  body: Record<string, string>;
}

type NudgeTemplates = Record<NudgeType, Record<TonePreset, MessageTemplate>>;

export const NUDGE_TEMPLATES: Partial<NudgeTemplates> = {
  morning_briefing: {
    friendly: {
      title: '좋은 아침이에요!',
      body: {
        light: '오늘은 여유로운 하루예요. {top_task}부터 시작해볼까요?',
        normal: '오늘 할 일 {task_count}개, 미팅 {meeting_count}개 있어요.',
        heavy: '오늘 좀 바빠요! 미팅 {meeting_count}개... 힘내세요 💪',
        very_heavy: '오늘 정말 빡빡해요 😅 천천히 하나씩 해봐요.'
      }
    },
    butler: {
      title: '좋은 아침입니다',
      body: {
        light: '오늘은 여유로운 하루입니다. {top_task}부터 시작하시겠습니까?',
        normal: '오늘 일정: 할 일 {task_count}개, 미팅 {meeting_count}개입니다.',
        heavy: '오늘 일정이 다소 빡빡합니다. 미팅 {meeting_count}개 예정이에요.',
        very_heavy: '오늘 일정이 매우 많습니다. 우선순위대로 진행하시죠.'
      }
    },
    secretary: {
      title: '아침 브리핑',
      body: {
        light: '할 일 {task_count}개, 미팅 {meeting_count}개. 여유로움.',
        normal: '할 일 {task_count}개, 미팅 {meeting_count}개.',
        heavy: '미팅 {meeting_count}개 주의. 시간 관리 필요.',
        very_heavy: '과부하 경고. 우선순위 재조정 권장.'
      }
    },
    coach: {
      title: '좋은 아침! 오늘도 화이팅!',
      body: {
        light: '오늘은 여유 있어요! {top_task} 끝내고 자기계발 시간도 가져봐요! 🌟',
        normal: '오늘도 할 일이 있네요! {task_count}개 해치우러 가볼까요? 💪',
        heavy: '오늘 바쁘지만 할 수 있어요! 하나씩 집중해서 해봐요! 🔥',
        very_heavy: '빡센 하루가 될 거예요! 하지만 당신은 해낼 수 있어요! 💯'
      }
    },
    trainer: {
      title: '기상. 오늘 일정 확인.',
      body: {
        light: '할 일 {task_count}개. 더 계획 세워.',
        normal: '할 일 {task_count}개, 미팅 {meeting_count}개. 바로 시작.',
        heavy: '미팅 {meeting_count}개. 집중력 유지해.',
        very_heavy: '과부하 상태. 핵심만 집중. 나머지 버려.'
      }
    }
  },

  meeting_reminder: {
    friendly: {
      title: '곧 미팅이에요',
      body: {
        '15min': '{meeting_title} 15분 전이에요! 준비되셨나요?',
        '5min': '{meeting_title} 5분 남았어요! 거의 다 왔어요 😊',
        'now': '{meeting_title} 시작 시간이에요!'
      }
    },
    butler: {
      title: '미팅 알림',
      body: {
        '15min': '{meeting_title} 15분 전입니다.',
        '5min': '{meeting_title} 5분 전입니다. 준비 부탁드립니다.',
        'now': '{meeting_title} 시작 시간입니다.'
      }
    },
    secretary: {
      title: '미팅',
      body: {
        '15min': '{meeting_title} -15분.',
        '5min': '{meeting_title} -5분.',
        'now': '{meeting_title} 시작.'
      }
    },
    coach: {
      title: '미팅 준비!',
      body: {
        '15min': '{meeting_title} 15분 전! 자료 한 번 더 체크! 📋',
        '5min': '{meeting_title} 5분 전! 최고의 모습으로! 💪',
        'now': '{meeting_title} 시작! 가즈아! 🚀'
      }
    },
    trainer: {
      title: '미팅',
      body: {
        '15min': '{meeting_title} 15분. 준비.',
        '5min': '{meeting_title} 5분. 이동.',
        'now': '{meeting_title} 지금. 바로 참석.'
      }
    }
  },

  rest_suggest: {
    friendly: {
      title: '잠깐 쉬어가요',
      body: {
        '1hour': '1시간 집중했어요! 5분만 쉬어갈까요? ☕',
        '2hour': '벌써 2시간째... 스트레칭 어때요? 💆',
        'post_meeting': '미팅 끝났어요! 잠깐 환기하고 오세요 🌿'
      }
    },
    butler: {
      title: '휴식 제안',
      body: {
        '1hour': '1시간 집중하셨습니다. 잠시 휴식을 권합니다.',
        '2hour': '2시간째 작업 중이십니다. 스트레칭을 추천드립니다.',
        'post_meeting': '미팅이 끝났습니다. 잠시 휴식하시겠습니까?'
      }
    },
    secretary: {
      title: '휴식',
      body: {
        '1hour': '집중 1시간. 5분 휴식 권장.',
        '2hour': '집중 2시간. 휴식 필요.',
        'post_meeting': '미팅 종료. 휴식 가능.'
      }
    },
    coach: {
      title: '잘하고 있어요!',
      body: {
        '1hour': '1시간 집중! 대단해요! 잠깐 쉬고 다시 불태워요! 🔥',
        '2hour': '2시간 연속! 몸도 쉬어야 해요! 스트레칭 고고! 💪',
        'post_meeting': '미팅 수고했어요! 잠깐 리프레시! ✨'
      }
    },
    trainer: {
      title: '휴식',
      body: {
        '1hour': '1시간 됐다. 5분 쉬고 와.',
        '2hour': '2시간째다. 지금 안 쉬면 효율 떨어진다.',
        'post_meeting': '미팅 끝. 물 마시고 와.'
      }
    }
  },

  late_warning: {
    friendly: {
      title: '퇴근 시간이에요',
      body: {
        first: '벌써 {time}이에요. 마무리할 시간! 🌙',
        second: '{time}... 진짜 가셔야 해요 😅'
      }
    },
    butler: {
      title: '퇴근 안내',
      body: {
        first: '{time}입니다. 하루 마무리를 시작하시겠습니까?',
        second: '{time}이 넘었습니다. 퇴근을 권장드립니다.'
      }
    },
    secretary: {
      title: '퇴근',
      body: {
        first: '{time}. 마무리 시작.',
        second: '{time}. 퇴근 필요.'
      }
    },
    coach: {
      title: '오늘도 수고했어요!',
      body: {
        first: '벌써 {time}! 오늘도 열심히 했어요! 이제 쉬어요! 🌙',
        second: '{time}... 진짜 가야 해요! 내일을 위해 충전! ⚡'
      }
    },
    trainer: {
      title: '퇴근',
      body: {
        first: '{time}. 오늘 끝. 퇴근해.',
        second: '{time}. 더 하면 내일 효율 떨어진다. 가.'
      }
    }
  },

  overload_warn: {
    friendly: {
      title: '오늘 좀 바빠요',
      body: {
        default: '미팅 {meeting_count}개에 할 일도 많아요. 천천히 해요!',
        consecutive: '미팅이 연속으로 있네요. 사이사이 숨 돌리세요.'
      }
    },
    butler: {
      title: '일정 과부하 알림',
      body: {
        default: '오늘 미팅 {meeting_count}건, 태스크 다수입니다. 우선순위를 정리해드릴까요?',
        consecutive: '연속 미팅이 예정되어 있습니다. 중간 휴식을 확보하시기 바랍니다.'
      }
    },
    secretary: {
      title: '과부하',
      body: {
        default: '미팅 {meeting_count}개. 일정 조정 검토.',
        consecutive: '연속 미팅. 휴식 확보 필요.'
      }
    },
    coach: {
      title: '오늘 빡세요!',
      body: {
        default: '미팅 {meeting_count}개에 할 일도 많아요! 하지만 할 수 있어요! 💪',
        consecutive: '미팅이 연속이에요! 틈틈이 물 마시고 스트레칭! 🏃'
      }
    },
    trainer: {
      title: '과부하',
      body: {
        default: '미팅 {meeting_count}개. 불필요한 거 빼.',
        consecutive: '연속 미팅. 효율 저하 예상. 일부 재조정 고려.'
      }
    }
  },

  task_nudge: {
    friendly: {
      title: '잊지 마세요',
      body: {
        deadline_today: '{task_title} 오늘까지예요!',
        deadline_tomorrow: '{task_title} 내일까지예요. 오늘 시작해볼까요?',
        neglected: '{task_title}... 잊고 계신 건 아니죠? 😊',
        waiting: '{waiting_for}님이 {task_title} 기다리고 있어요'
      }
    },
    butler: {
      title: '태스크 알림',
      body: {
        deadline_today: '{task_title} 마감이 오늘입니다.',
        deadline_tomorrow: '{task_title} 마감이 내일입니다. 미리 진행하시겠습니까?',
        neglected: '{task_title} 진행 상황을 확인해 주세요.',
        waiting: '{waiting_for}님이 {task_title} 완료를 기다리고 계십니다.'
      }
    },
    secretary: {
      title: '태스크',
      body: {
        deadline_today: '{task_title} D-day.',
        deadline_tomorrow: '{task_title} D-1.',
        neglected: '{task_title} 진행 확인 필요.',
        waiting: '{task_title} - {waiting_for} 대기중.'
      }
    },
    coach: {
      title: '할 일 체크!',
      body: {
        deadline_today: '{task_title} 오늘 마감! 끝내러 가볼까요? 💪',
        deadline_tomorrow: '{task_title} 내일까지! 오늘 조금 해두면 편해요! 🚀',
        neglected: '{task_title} 기억나시죠? 같이 끝내봐요! ✨',
        waiting: '{waiting_for}님이 기다려요! {task_title} 빨리 보내드려요! 💨'
      }
    },
    trainer: {
      title: '태스크',
      body: {
        deadline_today: '{task_title} 오늘까지. 지금 해.',
        deadline_tomorrow: '{task_title} 내일. 오늘 시작.',
        neglected: '{task_title} 방치 중. 처리해.',
        waiting: '{waiting_for} 기다림. {task_title} 우선 처리.'
      }
    }
  },

  focus_suggest: {
    friendly: {
      title: '집중하기 좋은 시간이에요',
      body: {
        default: '지금부터 {duration} 비어있어요. {top_task} 해볼까요?',
        peak_hour: '지금이 집중 잘 되는 시간이에요! 활용해볼까요? 🎯'
      }
    },
    butler: {
      title: '집중 시간 제안',
      body: {
        default: '현재부터 {duration} 동안 일정이 없습니다. {top_task}를 진행하시겠습니까?',
        peak_hour: '현재 시간대가 집중력이 높은 시간입니다. 활용하시겠습니까?'
      }
    },
    secretary: {
      title: '집중 시간',
      body: {
        default: '{duration} 가용. {top_task} 진행 가능.',
        peak_hour: '피크 시간. 딥워크 권장.'
      }
    },
    coach: {
      title: '기회에요!',
      body: {
        default: '{duration} 동안 비어있어요! {top_task} 끝내버려요! 🔥',
        peak_hour: '지금이 집중 피크 시간! 가장 어려운 일 해치워요! 💪'
      }
    },
    trainer: {
      title: '집중 시간',
      body: {
        default: '{duration} 비어있다. {top_task} 시작.',
        peak_hour: '피크 타임. 딥워크 해.'
      }
    }
  },

  streak_celebrate: {
    friendly: {
      title: '대단해요!',
      body: {
        '3days': '{habit_title} 3일 연속! 좋은 습관이 되고 있어요 ✨',
        '7days': '일주일 연속 {habit_title}! 🔥',
        '30days': '한 달 연속!! {habit_title} 이제 완전 습관이네요 🎉'
      }
    },
    butler: {
      title: '연속 달성',
      body: {
        '3days': '{habit_title} 3일 연속 달성입니다.',
        '7days': '{habit_title} 7일 연속 달성입니다. 훌륭합니다.',
        '30days': '{habit_title} 30일 연속 달성입니다. 대단한 성과입니다.'
      }
    },
    secretary: {
      title: '연속 기록',
      body: {
        '3days': '{habit_title} 3일.',
        '7days': '{habit_title} 7일.',
        '30days': '{habit_title} 30일.'
      }
    },
    coach: {
      title: '와아아!',
      body: {
        '3days': '{habit_title} 3일 연속!! 시작이 좋아요! 🌟',
        '7days': '일주일 연속 {habit_title}!! 진짜 대단해요! 🔥🔥',
        '30days': '한 달 연속!!! {habit_title} 완전 프로세요! 🏆'
      }
    },
    trainer: {
      title: '기록',
      body: {
        '3days': '{habit_title} 3일. 계속해.',
        '7days': '{habit_title} 7일. 좋다. 유지해.',
        '30days': '{habit_title} 30일. 습관 형성됨. 다음 목표 세워.'
      }
    }
  }
};

// === 메시지 템플릿 적용 ===
interface TemplateVariables {
  task_count?: number;
  meeting_count?: number;
  top_task?: string;
  task_title?: string;
  meeting_title?: string;
  waiting_for?: string;
  duration?: string;
  time?: string;
  habit_title?: string;
  [key: string]: string | number | undefined;
}

export function applyTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
  });

  return result;
}

// === 톤 적용된 넛지 생성 ===
export function applyToneToNudge(
  nudge: Omit<Nudge, 'id' | 'createdAt'>,
  tonePreset: TonePreset = 'butler',
  variables: TemplateVariables = {}
): Omit<Nudge, 'id' | 'createdAt'> {
  const templates = NUDGE_TEMPLATES[nudge.type];
  if (!templates) return nudge;

  const toneTemplate = templates[tonePreset] || templates.butler;
  if (!toneTemplate) return nudge;

  // 적절한 body 선택
  let bodyKey = 'default';
  if (nudge.body) {
    // 기존 body에서 힌트 찾기
    if (nudge.body.includes('15분')) bodyKey = '15min';
    else if (nudge.body.includes('5분')) bodyKey = '5min';
    else if (nudge.body.includes('시작')) bodyKey = 'now';
    else if (nudge.body.includes('1시간')) bodyKey = '1hour';
    else if (nudge.body.includes('2시간')) bodyKey = '2hour';
    else if (nudge.body.includes('마무리')) bodyKey = 'first';
    else if (nudge.body.includes('진짜')) bodyKey = 'second';
    else if (nudge.body.includes('연속')) bodyKey = 'consecutive';
  }

  const bodyTemplate = toneTemplate.body[bodyKey] || toneTemplate.body.default || nudge.body;

  return {
    ...nudge,
    title: applyTemplate(toneTemplate.title, variables),
    body: applyTemplate(bodyTemplate, variables),
    tonePreset
  };
}

// === 이모지 매핑 ===
export const NUDGE_EMOJIS: Record<NudgeType, string> = {
  morning_briefing: '🐧',
  evening_wrapup: '🌙',
  meeting_reminder: '📅',
  focus_suggest: '🎯',
  task_nudge: '📋',
  overload_warn: '😮‍💨',
  rest_suggest: '☕',
  late_warning: '🌙',
  streak_celebrate: '🎉',
  departure_alert: '🚗'
};
