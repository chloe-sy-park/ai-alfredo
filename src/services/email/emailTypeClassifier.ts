/**
 * Email Type Classifier
 *
 * 룰 기반 분류 (LLM 금지)
 * A: 미팅 초대 (iCal, zoom/meet/teams 링크)
 * B: Work-Context (캘린더 미팅과 연결)
 * C: Work-Standalone (독립적 업무 이메일)
 * D: Life Signal (병원, 배송, 결제 알림)
 * E: Life-Finance (금융/결제)
 */

import {
  EmailMetadata,
  EmailType,
  WorkLifeScore,
  SenderWeight,
  MEETING_INVITE_PATTERNS,
  LIFE_SIGNAL_KEYWORDS,
  FINANCE_KEYWORDS,
  WORK_KEYWORDS
} from './types';

// ============================================================
// Type A: 미팅 초대
// ============================================================

/**
 * iCal 첨부파일이 있는지 확인
 */
export function hasICalAttachment(email: EmailMetadata): boolean {
  if (!email.attachmentTypes || email.attachmentTypes.length === 0) {
    return false;
  }
  return email.attachmentTypes.includes('ical');
}

/**
 * 비디오 콜 링크가 있는지 확인 (제목 기준)
 */
export function hasVideoCallLink(email: EmailMetadata): boolean {
  const textToCheck = email.subject.toLowerCase();

  return MEETING_INVITE_PATTERNS.videoCallLinks.some(pattern =>
    pattern.test(textToCheck)
  );
}

/**
 * 미팅 초대 패턴인지 확인
 */
export function isMeetingInvite(email: EmailMetadata): boolean {
  // iCal 첨부파일
  if (hasICalAttachment(email)) return true;

  // 비디오 콜 링크
  if (hasVideoCallLink(email)) return true;

  // 초대 관련 제목
  return MEETING_INVITE_PATTERNS.inviteSubjects.some(pattern =>
    pattern.test(email.subject)
  );
}

// ============================================================
// Type B: Work-Context (캘린더 연결)
// ============================================================

/**
 * 캘린더 참석자와 매칭되는지 확인
 */
export function matchesCalendarParticipant(
  email: EmailMetadata,
  calendarParticipants: string[]
): boolean {
  const senderLower = email.from.toLowerCase();
  const domainLower = email.fromDomain.toLowerCase();

  return calendarParticipants.some(participant => {
    const participantLower = participant.toLowerCase();
    // 이메일 주소 직접 매칭
    if (participantLower === senderLower) return true;
    // 도메인 매칭
    if (participantLower.endsWith(`@${domainLower}`)) return true;
    return false;
  });
}

/**
 * 미팅 제목과 연관된 이메일인지 확인
 */
export function matchesMeetingTitle(
  email: EmailMetadata,
  meetingTitles: string[]
): boolean {
  const subjectLower = email.subject.toLowerCase();

  return meetingTitles.some(title => {
    const keywords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    // 2개 이상의 키워드가 매칭되면 연관으로 판단
    const matchCount = keywords.filter(kw => subjectLower.includes(kw)).length;
    return matchCount >= 2 || (keywords.length === 1 && subjectLower.includes(keywords[0]));
  });
}

// ============================================================
// Type D/E: Life Signal
// ============================================================

/**
 * Life Signal 키워드 매칭
 */
export function isLifeSignal(email: EmailMetadata): boolean {
  const textToCheck = `${email.subject} ${email.from}`.toLowerCase();

  return LIFE_SIGNAL_KEYWORDS.some(keyword =>
    textToCheck.includes(keyword.toLowerCase())
  );
}

/**
 * Finance 관련 키워드 매칭
 */
export function isFinanceRelated(email: EmailMetadata): boolean {
  const textToCheck = `${email.subject} ${email.from}`.toLowerCase();

  return FINANCE_KEYWORDS.some(keyword =>
    textToCheck.includes(keyword.toLowerCase())
  );
}

// ============================================================
// Work/Life Score Calculation
// ============================================================

/**
 * Work 키워드 매칭 점수
 */
function calculateWorkScore(email: EmailMetadata): number {
  const textToCheck = `${email.subject} ${email.from}`.toLowerCase();
  let score = 0.5;  // 기본값

  // Work 키워드 매칭
  const workMatches = WORK_KEYWORDS.filter(keyword =>
    textToCheck.includes(keyword.toLowerCase())
  ).length;

  score += workMatches * 0.1;

  // Life/Finance 키워드가 있으면 감점
  if (isLifeSignal(email)) score -= 0.3;
  if (isFinanceRelated(email)) score -= 0.3;

  return Math.max(0, Math.min(1, score));
}

/**
 * Work/Life 점수 계산
 */
export function calculateWorkLifeScore(
  email: EmailMetadata,
  senderWeight?: SenderWeight
): WorkLifeScore {
  let workScore = calculateWorkScore(email);
  let lifeScore = 1 - workScore;

  // 발신자 가중치 적용
  if (senderWeight && senderWeight.correctionCount > 0) {
    // 사용자 정정이 있으면 가중치 적용 (80% 반영)
    workScore = workScore * 0.2 + senderWeight.workScore * 0.8;
    lifeScore = lifeScore * 0.2 + senderWeight.lifeScore * 0.8;
  }

  return {
    work: Math.round(workScore * 100) / 100,
    life: Math.round(lifeScore * 100) / 100
  };
}

// ============================================================
// Main Classification
// ============================================================

export interface ClassificationContext {
  calendarParticipants: string[];
  todayMeetingTitles: string[];
  senderWeights: Map<string, SenderWeight>;
}

/**
 * 이메일 타입 분류 (룰 기반)
 */
export function classifyEmail(
  email: EmailMetadata,
  context: ClassificationContext
): { emailType: EmailType; workLifeScore: WorkLifeScore; relatedMeetingId?: string } {
  // Step 1: Type A - 미팅 초대
  if (isMeetingInvite(email)) {
    return {
      emailType: 'A',
      workLifeScore: { work: 1, life: 0 }
    };
  }

  // Step 2: Type B - Work-Context (캘린더 연결)
  if (matchesCalendarParticipant(email, context.calendarParticipants)) {
    return {
      emailType: 'B',
      workLifeScore: { work: 0.9, life: 0.1 }
    };
  }

  // 미팅 제목과 연관된 경우도 Type B
  if (matchesMeetingTitle(email, context.todayMeetingTitles)) {
    return {
      emailType: 'B',
      workLifeScore: { work: 0.9, life: 0.1 }
    };
  }

  // Step 3: Type E - Finance (D보다 먼저 체크)
  if (isFinanceRelated(email)) {
    return {
      emailType: 'E',
      workLifeScore: { work: 0.1, life: 0.9 }
    };
  }

  // Step 4: Type D - Life Signal
  if (isLifeSignal(email)) {
    return {
      emailType: 'D',
      workLifeScore: { work: 0.2, life: 0.8 }
    };
  }

  // Step 5: Type C - Work-Standalone (기본)
  const senderWeight = context.senderWeights.get(email.from.toLowerCase());
  const workLifeScore = calculateWorkLifeScore(email, senderWeight);

  return {
    emailType: 'C',
    workLifeScore
  };
}

/**
 * 여러 이메일 분류
 */
export function classifyEmails(
  emails: EmailMetadata[],
  context: ClassificationContext
): EmailMetadata[] {
  return emails.map(email => {
    const result = classifyEmail(email, context);
    return {
      ...email,
      emailType: result.emailType,
      workLifeScore: result.workLifeScore,
      relatedMeetingId: result.relatedMeetingId
    };
  });
}

// ============================================================
// Headline Generation (룰 기반)
// ============================================================

/**
 * 이메일 신호 헤드라인 생성 (LLM 금지)
 */
export function generateHeadline(
  email: EmailMetadata,
  relatedMeetingTitle?: string
): string {
  // Type A: 미팅 초대
  if (email.emailType === 'A') {
    return `${email.fromName || email.from}님이 미팅을 요청했어요`;
  }

  // Type B: Work-Context (미팅 연결)
  if (email.emailType === 'B' && relatedMeetingTitle) {
    return `"${truncate(relatedMeetingTitle, 20)}" 관련 이메일이에요`;
  }

  // 기본
  const senderName = email.fromName || email.from.split('@')[0];
  const timeAgo = getTimeAgo(new Date(email.receivedAt));

  return `${senderName}님이 메일을 보냈어요 (${timeAgo})`;
}

// ============================================================
// Helpers
// ============================================================

function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays === 1) return '어제';
  return `${diffDays}일 전`;
}

// ============================================================
// Silent Correction
// ============================================================

/**
 * 사용자 정정 반영
 */
export function applySilentCorrection(
  currentWeight: SenderWeight | undefined,
  isWork: boolean
): SenderWeight {
  const now = new Date().toISOString();

  if (!currentWeight) {
    // 새 가중치 생성
    return {
      id: crypto.randomUUID(),
      sender: '',  // 호출자가 설정
      domain: '',  // 호출자가 설정
      workScore: isWork ? 0.8 : 0.2,
      lifeScore: isWork ? 0.2 : 0.8,
      correctionCount: 1,
      lastCorrectionAt: now,
      createdAt: now,
      updatedAt: now
    };
  }

  // 기존 가중치 업데이트 (점진적 학습)
  const learningRate = 0.2;  // 20%씩 반영

  return {
    ...currentWeight,
    workScore: isWork
      ? Math.min(1, currentWeight.workScore + learningRate)
      : Math.max(0, currentWeight.workScore - learningRate),
    lifeScore: isWork
      ? Math.max(0, currentWeight.lifeScore - learningRate)
      : Math.min(1, currentWeight.lifeScore + learningRate),
    correctionCount: currentWeight.correctionCount + 1,
    lastCorrectionAt: now,
    updatedAt: now
  };
}
