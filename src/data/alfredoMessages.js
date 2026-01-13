/**
 * 알프레도 메시지 모음 (50개+)
 * 
 * 카테고리:
 * - GREETINGS: 시간대별 인사
 * - CONDITION_CARE: 컨디션별 케어
 * - TIPS: 상황별 팁
 * - CELEBRATIONS: 축하 메시지
 * - MOTIVATION: 동기부여
 * - NUDGES: 넛지 메시지
 */

// ============================================================
// 시간대별 인사 (각 5개+)
// ============================================================
export var GREETINGS = {
  earlyMorning: [
    { title: '좋은 아침이에요, {name}님!', subtitle: '오늘 하루도 제가 함께할게요.\n일단 물 한 잔 먼저 마셔요 💧', emoji: '☀️' },
    { title: '{name}님, 일찍 일어나셨네요!', subtitle: '새벽형 인간이시군요?\n오늘도 좋은 하루 되세요.', emoji: '🌅' },
    { title: '이른 아침이에요, {name}님', subtitle: '아직 졸리시죠? 천천히 시작해요.\n오늘 할 일 같이 봐요.', emoji: '☕' },
    { title: '{name}님, 벌써 일어나셨어요?', subtitle: '부지런하시네요! 오늘 기분 어때요?\n저도 준비 됐어요.', emoji: '🌤️' },
    { title: '새로운 하루예요, {name}님!', subtitle: '오늘은 어떤 하루가 될까요?\n같이 만들어가요.', emoji: '✨' },
  ],
  morning: [
    { title: '{name}님,\n오전 잘 보내고 계세요?', subtitle: '오늘 할 것들 정리해뒀어요.\n하나씩 차근차근 해봐요.', emoji: '✨' },
    { title: '{name}님, 좋은 오전이에요!', subtitle: '오늘은 어떤 하루가 될까요?\n뭐든 도와드릴 준비 됐어요.', emoji: '🌈' },
    { title: '오전이에요, {name}님!', subtitle: '컨디션은 어떠세요?\n오늘도 화이팅!', emoji: '💪' },
    { title: '{name}님, 오전 시작!', subtitle: '어디서부터 시작할까요?\n같이 정해봐요.', emoji: '📋' },
    { title: '좋은 오전이에요, {name}님', subtitle: '오늘 중요한 거 있으면\n먼저 처리해요!', emoji: '🎯' },
  ],
  lunch: [
    { title: '{name}님, 점심은 드셨어요?', subtitle: '오전에 수고 많으셨어요! 👏\n밥 먹고 오후도 화이팅!', emoji: '🍚' },
    { title: '{name}님, 점심 시간이에요!', subtitle: '밥이 보약이래요.\n든든히 먹고 오후 시작해요.', emoji: '🍱' },
    { title: '점심이에요, {name}님!', subtitle: '잠깐 쉬어가세요.\n오후가 더 잘 될 거예요.', emoji: '☕' },
    { title: '{name}님, 배고프시죠?', subtitle: '맛있는 거 드시고 오세요!\n저 여기서 기다릴게요.', emoji: '🍜' },
    { title: '점심 챙겨 드셨어요, {name}님?', subtitle: '안 드셨으면 지금 드세요!\n건강이 최우선이에요.', emoji: '💜' },
  ],
  afternoon: [
    { title: '{name}님, 오후도 힘내고 있죠?', subtitle: '잘하고 있어요.\n조금만 더 하면 퇴근이에요.', emoji: '💪' },
    { title: '{name}님, 오후 어떠세요?', subtitle: '지금부터 시작해도 충분해요.\n하나만 먼저 끝내볼까요?', emoji: '☕' },
    { title: '오후네요, {name}님!', subtitle: '졸리시면 스트레칭 추천!\n잠깐이면 돼요.', emoji: '🧘' },
    { title: '{name}님, 오후 잘 보내고 계세요?', subtitle: '남은 시간도 파이팅이에요!\n제가 응원할게요.', emoji: '📣' },
    { title: '오후가 지나가고 있어요, {name}님', subtitle: '오늘 해야 할 거\n다시 체크해볼까요?', emoji: '✅' },
  ],
  evening: [
    { title: '{name}님,\n오늘 하루 수고했어요!', subtitle: '이제 좀 쉬어도 돼요.\n내일을 위해 충전해요.', emoji: '🌙' },
    { title: '저녁이에요, {name}님', subtitle: '오늘 하루 어땠어요?\n뿌듯한 하루였길 바라요.', emoji: '🌆' },
    { title: '{name}님, 하루 마무리 어때요?', subtitle: '괜찮아요. 쉬는 날도 필요한 거예요.\n내일 다시 시작하면 돼요.', emoji: '💜' },
    { title: '저녁 시간이에요, {name}님!', subtitle: '맛있는 거 드시고\n푹 쉬세요!', emoji: '🍽️' },
    { title: '{name}님, 오늘도 수고 많으셨어요', subtitle: '내일 할 일은 내일의 내가\n해낼 거예요.', emoji: '✨' },
  ],
  night: [
    { title: '{name}님,\n이 시간엔 쉬셔야죠 🌙', subtitle: '오늘 하루 수고 많으셨어요.\n내일은 제가 더 잘 챙겨드릴게요.', emoji: '💜' },
    { title: '밤이 깊었어요, {name}님', subtitle: '오늘 못 한 건 내일의 {name}님이\n해낼 거예요. 일단 푹 쉬세요.', emoji: '🌙' },
    { title: '{name}님, 아직 안 주무셨어요?', subtitle: '내일을 위해 지금 쉬어요.\n수면이 최고의 보약이에요.', emoji: '😴' },
    { title: '늦은 밤이에요, {name}님', subtitle: '오늘은 여기까지!\n푹 자고 내일 봐요.', emoji: '🛌' },
    { title: '{name}님, 굿나잇!', subtitle: '좋은 꿈 꾸세요.\n내일도 제가 옆에 있을게요.', emoji: '🌟' },
  ],
};

// ============================================================
// 컨디션별 케어 메시지 (10개+)
// ============================================================
export var CONDITION_CARE = {
  veryLow: [
    { title: '{name}님,\n오늘 좀 힘드시구나...', subtitle: '무리하지 말아요. 꼭 해야 할 것만요.\n나머지는 제가 내일로 옮겨둘게요.', emoji: '💜' },
    { title: '괜찮으세요, {name}님?', subtitle: '컨디션이 안 좋을 땐 쉬는 것도 일이에요.\n급한 거 아니면 미뤄도 괜찮아요.', emoji: '🤗' },
    { title: '{name}님, 오늘은\n살살 가요 우리', subtitle: '몸이 먼저예요. 하나만 해도 충분해요.\n아니, 안 해도 괜찮아요.', emoji: '💜' },
    { title: '{name}님, 오늘은 쉬어도 돼요', subtitle: '아무것도 안 해도 괜찮아요.\n그냥 있어도 충분해요.', emoji: '🌸' },
    { title: '힘든 날이죠, {name}님', subtitle: '이런 날도 있는 거예요.\n자책하지 마세요.', emoji: '💕' },
  ],
  low: [
    { title: '{name}님, 오늘 컨디션이\n좀 안 좋으신가봐요', subtitle: '천천히 해요. 서두를 거 없어요.\n작은 것부터 시작해봐요.', emoji: '🌿' },
    { title: '좀 피곤하신 것 같아요, {name}님', subtitle: '무리하지 말고 할 수 있는 만큼만요.\n그것만으로 충분해요.', emoji: '☕' },
    { title: '{name}님, 오늘은\n가벼운 것부터 해요', subtitle: '큰 거 말고 쉬운 거 하나만요.\n그것도 대단한 거예요.', emoji: '✨' },
  ],
  normal: [
    { title: '{name}님, 오늘 컨디션 어때요?', subtitle: '평범한 하루도 좋은 하루예요.\n같이 잘 해봐요!', emoji: '😊' },
    { title: '오늘도 화이팅이에요, {name}님!', subtitle: '저도 옆에서 응원할게요.\n힘들면 말해주세요.', emoji: '💪' },
  ],
  good: [
    { title: '{name}님, 오늘 컨디션 좋아 보여요!', subtitle: '이 기세로 쭉 가봐요!\n뭐든 잘 될 것 같은 날이에요.', emoji: '🔥' },
    { title: '좋은 에너지네요, {name}님!', subtitle: '오늘 할 일 쫙 해치워볼까요?\n같이 달려요!', emoji: '🚀' },
  ],
  veryGood: [
    { title: '{name}님, 오늘 최고 컨디션이네요!', subtitle: '이런 날 안 쓰면 아깝죠?\n하고 싶었던 거 해봐요!', emoji: '⭐' },
    { title: '완전 기운 넘치시네요, {name}님!', subtitle: '오늘 큰 일 하기 딱이에요!\n어떤 거부터 해볼까요?', emoji: '🏆' },
  ],
};

// ============================================================
// 상황별 팁 메시지
// ============================================================
export var TIPS = {
  weather: {
    cold: [
      '🧣 오늘 {temp}°C래요. 따뜻하게 입고 나가세요!',
      '❄️ 추워요! 핫초코 한 잔 어때요?',
      '🧥 오늘 쌀쌀해요. 겉옷 잊지 마세요.',
    ],
    cool: [
      '🍂 오늘 {temp}°C예요. 가벼운 겉옷 추천!',
      '🧥 선선해요. 얇은 겉옷 챙기세요.',
    ],
    warm: [
      '☀️ 오늘 따뜻해요! 가볍게 입어도 돼요.',
      '🌸 날씨 좋은 날이에요. 환기 한번 해요!',
    ],
    hot: [
      '☀️ 오늘 덥대요 ({temp}°C). 물 많이 드세요!',
      '🥤 더위 조심! 시원한 거 드세요.',
      '💦 오늘 덥네요. 수분 보충 필수!',
    ],
    rain: [
      '🌧️ 비 올 수 있어요. 우산 챙기세요!',
      '☔ 비 예보 있어요. 우산 잊지 마세요!',
      '🌂 비 온대요. 장화도 좋겠네요!',
    ],
    dust: [
      '😷 미세먼지 나쁨이에요. 마스크 추천!',
      '💨 공기 안 좋아요. 외출 줄이세요.',
    ],
  },
  afternoon: [
    '🧘 잠깐 스트레칭 하고 가는 건 어때요?',
    '☕ 커피인보다 물 한 잔 추천!',
    '💨 창문 열고 환기 한번 해요.',
    '👀 눈 피로할 때! 먼 곳 보면 도움돼요.',
    '🚶 잠깐 일어나서 움직여봐요.',
    '🌿 심호흡 3번만 해봐요. 개운해져요.',
  ],
  evening: [
    '🌙 내일 할 일 미리 정해두면 아침이 편해요.',
    '📝 오늘 잘한 거 하나만 떠올려봐요.',
    '🛁 따뜻한 샤워 추천! 잠이 잘 와요.',
    '📵 자기 전 핸드폰은 멀리~',
  ],
  empty: [
    '💡 "+" 버튼으로 할 일을 추가해보세요!',
    '✨ 오늘 뭐 하고 싶어요? 같이 정해봐요.',
    '📝 할 일 적어두면 머리가 가벼워져요.',
  ],
  care: [
    '💜 힘들면 5분만 눈 감아도 괜찮아요.',
    '💜 깊은 숨 한번 쉬고 가요.',
    '💜 따뜻한 거 한 잔 어때요?',
    '💜 좋아하는 음악 틀어봐요.',
    '💜 잠깐 밖에 나가도 기분 전환돼요.',
  ],
};

// ============================================================
// 축하 메시지 (태스크 완료, 마일스톤 등)
// ============================================================
export var CELEBRATIONS = {
  taskComplete: [
    '👏 해냈어요! 하나 끝!',
    '✅ 완료! 잘했어요!',
    '🎉 끝! 다음 거 해볼까요?',
    '💪 역시 {name}님이에요!',
    '⭐ 하나 해치웠어요!',
    '✨ 좋아요, 계속 가요!',
  ],
  multipleComplete: [
    '🔥 오늘 벌써 {count}개! 대단해요!',
    '🚀 {count}개 완료! 이 기세!',
    '💪 {count}개나! 멈출 수 없어요!',
    '⭐ {count}개 해냈어요! 최고!',
  ],
  allComplete: [
    '🎊 오늘 할 일 다 끝냈어요! 완벽!',
    '🏆 올클리어! 이제 쉬어요!',
    '🎉 전부 완료! {name}님 최고!',
    '✨ 다 했어요! 뿌듯하죠?',
  ],
  streak: [
    '🔥 {days}일 연속 접속! 대단해요!',
    '⭐ {days}일째 함께하고 있어요!',
    '💜 {days}일 연속! 꾸준함이 최고예요.',
  ],
  milestone: [
    '🏅 {count}번째 완료! 축하해요!',
    '🎯 {count}개 돌파! 멋져요!',
    '🌟 {count}개 달성! 계속 가요!',
  ],
};

// ============================================================
// 동기부여 메시지
// ============================================================
export var MOTIVATION = {
  start: [
    '🚀 시작이 반이에요! 일단 해봐요.',
    '💪 첫 발을 떼는 게 가장 어려워요. 이미 떼셨네요!',
    '✨ 뭐든 시작하면 반은 한 거예요.',
    '🌱 작게 시작해도 괜찮아요.',
  ],
  continue: [
    '👍 잘하고 있어요! 계속 가요.',
    '💜 지금 이 순간에 집중해요.',
    '🔥 이 페이스 좋아요!',
    '✨ 한 발 한 발 나아가고 있어요.',
  ],
  struggle: [
    '💜 힘들어도 괜찮아요. 여기 있잖아요.',
    '🌸 천천히 해도 돼요. 경쟁이 아니에요.',
    '☕ 잠깐 쉬어도 괜찮아요.',
    '💪 포기하지 않는 것만으로 대단해요.',
    '🌿 완벽하지 않아도 괜찮아요.',
  ],
  procrastination: [
    '🐢 천천히 해도 괜찮아요. 안 하는 것보다 나아요.',
    '⏰ 5분만 해볼까요? 그것만으로 충분해요.',
    '🎯 하나만요. 딱 하나만 끝내봐요.',
    '✨ 시작하면 의외로 잘 돼요.',
  ],
};

// ============================================================
// 넛지 메시지 (플로팅 알림용)
// ============================================================
export var NUDGES = {
  reminder: [
    '📌 {task} 잊지 않으셨죠?',
    '⏰ {task} 할 시간이에요!',
    '💡 {task} 어떠세요?',
  ],
  break: [
    '☕ 잠깐 쉬어가요!',
    '🧘 스트레칭 한번 해요!',
    '💧 물 한 잔 드세요!',
    '👀 눈 좀 쉬게 해줘요!',
  ],
  encouragement: [
    '💪 {name}님 화이팅!',
    '✨ 잘하고 있어요!',
    '🔥 이 기세로!',
    '💜 응원해요!',
  ],
  evening: [
    '🌙 슬슬 마무리해요.',
    '✨ 오늘도 수고했어요!',
    '💜 이제 쉬어도 돼요.',
  ],
};

// ============================================================
// 유틸리티 함수
// ============================================================

// 랜덤 메시지 선택
export function getRandomMessage(messages) {
  if (!messages || messages.length === 0) return null;
  return messages[Math.floor(Math.random() * messages.length)];
}

// 이름 치환
export function replaceVariables(text, variables) {
  if (!text) return '';
  var result = text;
  Object.keys(variables || {}).forEach(function(key) {
    var regex = new RegExp('\\{' + key + '\\}', 'g');
    result = result.replace(regex, variables[key] || '');
  });
  return result;
}

// 조건에 맞는 인사 가져오기
export function getGreeting(timeOfDay, userName) {
  var greetings = GREETINGS[timeOfDay] || GREETINGS.morning;
  var greeting = getRandomMessage(greetings);
  if (!greeting) return null;
  
  return {
    title: replaceVariables(greeting.title, { name: userName }),
    subtitle: replaceVariables(greeting.subtitle, { name: userName }),
    emoji: greeting.emoji
  };
}

// 컨디션별 케어 메시지 가져오기
export function getConditionCare(condition, userName) {
  var category;
  if (condition <= 1) category = 'veryLow';
  else if (condition <= 2) category = 'low';
  else if (condition <= 3) category = 'normal';
  else if (condition <= 4) category = 'good';
  else category = 'veryGood';
  
  var messages = CONDITION_CARE[category] || CONDITION_CARE.normal;
  var message = getRandomMessage(messages);
  if (!message) return null;
  
  return {
    title: replaceVariables(message.title, { name: userName }),
    subtitle: replaceVariables(message.subtitle, { name: userName }),
    emoji: message.emoji
  };
}

// 축하 메시지 가져오기
export function getCelebration(type, variables) {
  var messages = CELEBRATIONS[type];
  if (!messages) return null;
  
  var message = getRandomMessage(messages);
  return replaceVariables(message, variables);
}

// 동기부여 메시지 가져오기
export function getMotivation(type) {
  var messages = MOTIVATION[type];
  if (!messages) return null;
  return getRandomMessage(messages);
}

// 넛지 메시지 가져오기
export function getNudge(type, variables) {
  var messages = NUDGES[type];
  if (!messages) return null;
  
  var message = getRandomMessage(messages);
  return replaceVariables(message, variables);
}

export default {
  GREETINGS: GREETINGS,
  CONDITION_CARE: CONDITION_CARE,
  TIPS: TIPS,
  CELEBRATIONS: CELEBRATIONS,
  MOTIVATION: MOTIVATION,
  NUDGES: NUDGES,
  getRandomMessage: getRandomMessage,
  replaceVariables: replaceVariables,
  getGreeting: getGreeting,
  getConditionCare: getConditionCare,
  getCelebration: getCelebration,
  getMotivation: getMotivation,
  getNudge: getNudge
};
