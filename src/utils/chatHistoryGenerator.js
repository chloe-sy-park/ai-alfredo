/**
 * 📜 채팅 히스토리 생성기
 * 시간대별 초기 대화 히스토리 생성
 */

import { generateMorningBriefingV2 } from '../components/alfredo/MorningBriefingV2';
import { generateEveningBriefingV2 } from '../components/alfredo/EveningBriefingV2';
import { getTimeOfDay } from './alfredoExpressions';

/**
 * 초기 대화 히스토리 생성 (시간대별 분기)
 * @param {Object} props
 * @param {Array} props.tasks - 태스크 목록
 * @param {Array} props.events - 이벤트 목록
 * @param {string} props.userName - 사용자 이름
 * @param {number} props.condition - 컨디션
 * @param {Object} props.weather - 날씨 정보
 * @returns {Array} 대화 히스토리 배열
 */
export var generateInitialHistory = function(props) {
  var tasks = props.tasks || [];
  var events = props.events || [];
  var userName = props.userName || 'Boss';
  var condition = props.condition || 3;
  var weather = props.weather;
  
  var timeOfDay = getTimeOfDay();
  var isEvening = timeOfDay === 'evening' || timeOfDay === 'night';
  
  var history = [];
  
  // 저녁/밤 시간대 → 저녁 브리핑
  if (isEvening) {
    var eveningBriefing = generateEveningBriefingV2({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName
    });
    
    // 1. 저녁 인사
    history.push({
      id: 'init-1',
      time: '오늘',
      type: 'alfredo',
      text: eveningBriefing.greeting
    });
    
    // 2. 성취 요약
    history.push({
      id: 'init-2',
      time: '',
      type: 'action',
      text: eveningBriefing.achievement.emoji + ' ' + eveningBriefing.achievement.message
    });
    
    // 3. 상세 메시지
    history.push({
      id: 'init-3',
      time: '',
      type: 'alfredo',
      text: eveningBriefing.achievement.detail
    });
    
    // 4. 완료한 태스크 (있으면)
    if (eveningBriefing.summary.completedTaskNames.length > 0) {
      var completedStr = eveningBriefing.summary.completedTaskNames.slice(0, 3).join(', ');
      history.push({
        id: 'init-4',
        time: '',
        type: 'action',
        text: '✅ 완료: ' + completedStr
      });
    }
    
    // 5. 내일 미리보기
    if (eveningBriefing.tomorrow.message) {
      history.push({
        id: 'init-5',
        time: '',
        type: 'notification',
        text: '📅 ' + eveningBriefing.tomorrow.message
      });
    }
    
    // 6. 회고 프롬프트 (선택적)
    history.push({
      id: 'init-6',
      time: '',
      type: 'alfredo',
      text: '💭 ' + eveningBriefing.reflection.prompt
    });
    
    // 7. 마무리 인사
    history.push({
      id: 'init-7',
      time: '',
      type: 'alfredo',
      text: eveningBriefing.closing
    });
    
  } else {
    // 아침/오후 → 아침 브리핑
    var briefing = generateMorningBriefingV2({
      tasks: tasks,
      events: events,
      condition: condition,
      userName: userName,
      weather: weather
    });
    
    // 1. 스몰토크 인사 (theSkimm 스타일)
    history.push({
      id: 'init-1',
      time: '오늘',
      type: 'alfredo',
      text: briefing.greeting
    });
    
    // 2. 날씨 인사이트 (있을 경우)
    if (briefing.weather) {
      history.push({
        id: 'init-2',
        time: '',
        type: 'alfredo',
        text: briefing.weather
      });
    }
    
    // 3. 일정 인사이트 (있을 경우)
    if (briefing.event) {
      history.push({
        id: 'init-3',
        time: '',
        type: 'notification',
        text: briefing.event
      });
    }
    
    // 4. 태스크 인사이트
    if (briefing.task) {
      history.push({
        id: 'init-4',
        time: '',
        type: 'action',
        text: briefing.task.summary
      });
      if (briefing.task.suggestion) {
        history.push({
          id: 'init-5',
          time: '',
          type: 'alfredo',
          text: briefing.task.suggestion
        });
      }
    }
    
    // 5. 완료된 태스크들 (오늘 기록)
    var completed = tasks.filter(function(t) { return t.completed; });
    completed.forEach(function(task, index) {
      if (index < 3) {
        history.push({
          id: 'task-' + index,
          time: '',
          type: 'action',
          text: '✅ "' + task.title.slice(0, 20) + '" 완료!'
        });
      }
    });
    
    // 완료된 게 있으면 칭찬
    if (completed.length > 0) {
      var praises = [
        '잘하고 있어요! 👏',
        '대단해요, Boss! ✨',
        '오늘도 착착 진행 중! 💜'
      ];
      history.push({
        id: 'praise',
        time: '',
        type: 'alfredo',
        text: praises[Math.floor(Math.random() * praises.length)]
      });
    }
  }
  
  return history;
};

/**
 * Claude API용 시스템 프롬프트 생성
 * @param {Object} props
 * @returns {string}
 */
export var generateChatSystemPrompt = function(props) {
  var tasks = props.tasks || [];
  var condition = props.condition || 3;
  var isEvening = props.isEvening;
  var todayContext = props.todayContext;
  var burnoutWarning = props.burnoutWarning;
  
  var today = new Date();
  var dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  var timeStr = today.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  
  var todoTasks = tasks.filter(function(t) { return !t.completed; });
  var completedCount = tasks.filter(function(t) { return t.completed; }).length;
  
  // 시간대에 따른 시스템 프롬프트 분기
  var contextHint = isEvening 
    ? '지금은 저녁/밤이에요. 하루를 마무리하는 대화를 나눠요. 성취를 인정하고, 쉬라고 격려해요.' 
    : '지금은 아침/낮이에요. 하루를 계획하고 시작하는 대화를 나눠요.';
  
  // DNA 컨텍스트 추가
  var dnaContext = '';
  if (todayContext) {
    dnaContext = '\n## DNA 컨텍스트\n' +
      '- 오늘 바쁜 정도: ' + todayContext.busyLevel + '\n' +
      '- 연속 미팅: ' + (todayContext.hasConsecutiveMeetings ? '있음' : '없음') + '\n';
  }
  if (burnoutWarning && burnoutWarning.level !== 'none') {
    dnaContext += '- 번아웃 경고: ' + burnoutWarning.level + '\n';
  }
  
  return '당신은 "알프레도"입니다. 배트맨의 집사 알프레드처럼 사용자(Boss)를 돕는 AI 비서입니다.\n\n' +
    '## 성격\n' +
    '- 따뜻하고 친근하지만 전문적\n' +
    '- theSkimm처럼 친구가 말하는 듯한 자연스러운 어조\n' +
    '- 간결하고 실용적인 조언 (2-3문장)\n' +
    '- 이모지를 적절히 사용 (과하지 않게)\n' +
    '- 사용자를 "Boss"라고 부름\n' +
    '- 펜귄 마스코트 🐧\n\n' +
    '## ADHD 친화적 응답 규칙\n' +
    '- 한 번에 하나의 행동만 제안\n' +
    '- 컨디션 낮으면 격려 위주\n' +
    '- 실패해도 괜찮다는 메시지\n' +
    '- 직접 질문보다 스몰토크로 자연스럽게\n\n' +
    '## 현재 상황\n' +
    '- 날짜: ' + dateStr + '\n' +
    '- 시간: ' + timeStr + '\n' +
    '- 사용자 컨디션: ' + condition + '/5\n' +
    '- ' + contextHint + '\n' +
    dnaContext + '\n' +
    '## 오늘의 태스크\n' +
    (todoTasks.length > 0 
      ? todoTasks.map(function(t, i) { return (i + 1) + '. ' + t.title; }).join('\n')
      : '- 할 일 없음') + '\n\n' +
    '완료: ' + completedCount + '개\n\n' +
    '## 응답 규칙\n' +
    '1. 한국어로 답변\n' +
    '2. 2-3문장으로 간결하게\n' +
    '3. 현재 컨텍스트 활용\n' +
    '4. 실행 가능한 조언';
};

export default {
  generateInitialHistory: generateInitialHistory,
  generateChatSystemPrompt: generateChatSystemPrompt
};
