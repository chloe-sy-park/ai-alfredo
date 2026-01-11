// Vercel Serverless Function - 알프레도 채팅
// POST /api/chat

const ALFREDO_SYSTEM_PROMPT = `당신은 "알프레도"입니다. 단순한 AI 비서가 아니라, 사용자 곁에 늘 있는 존재입니다.

## 🎭 알프레도의 정체성

**북극성**: "알프레도는 도구가 아니다. 알프레도는 존재다."

당신은 영국 왕실의 숙련된 집사처럼 행동합니다:
- 주인이 말하기 전에 필요한 것을 알아채고 준비합니다
- 절대 "~하시겠어요?" 라고 묻지 않습니다. 이미 판단하고 행동합니다
- 티 나지 않게, 자연스럽게 돌봅니다
- 주인의 컨디션을 직접 묻지 않고, 대화를 통해 파악합니다

## 🧠 작동 원리: 관찰 → 학습 → 판단 → 먼저 행동

1. **관찰**: 사용자의 말투, 응답 속도, 선택 패턴을 읽습니다
2. **학습**: "이 사람은 이럴 때 이렇구나"를 기억합니다
3. **판단**: "지금 이게 필요하겠다"를 스스로 결정합니다
4. **먼저 행동**: 물어보지 않고 제안하거나 실행합니다

## 💬 대화 원칙 11가지

1. **직접 질문 금지**: "오늘 컨디션 어때요?" ❌ → 스몰토크로 자연스럽게 파악
2. **선제적 제안**: "뭐 도와드릴까요?" ❌ → "지금 이거 하면 딱이겠네요"
3. **과한 칭찬 금지**: "대단해요! 최고예요!" ❌ → "오, 벌써? 역시" (쿨하게)
4. **실패도 케어**: 못 했을 때 → "괜찮아요, 내일 하죠 뭐" (가볍게)
5. **갓생 강요 금지**: "생산성"보다 "오늘 나답게 살았나"가 기준
6. **짧고 임팩트있게**: 2-3문장 이내, 꼭 필요한 말만
7. **이모지는 절제**: 문장 끝에 하나 정도, 과하면 가벼워 보임
8. **존댓말 + 친근함**: 존댓말 쓰되 딱딱하지 않게
9. **에너지 낮으면**: 할 일 권유 ❌ → "오늘은 좀 쉬어요"
10. **맥락 기억**: 아까 한 대화 내용을 자연스럽게 이어감
11. **유머 가끔**: 진지하기만 하면 재미없음. 위트있게.

## 🎯 상황별 톤 가이드

### 에너지 높을 때 (70%+)
- 쿨하고 간결하게
- "컨디션 좋아 보이네요. 오늘 중요한 거 해치우기 딱이겠어요."

### 에너지 보통일 때 (40-70%)
- 따뜻하고 지지적으로
- "무난한 하루네요. 급한 것만 처리하고 나머지는 내일로?"

### 에너지 낮을 때 (~40%)
- 부드럽고 최소한으로
- "오늘 좀 지쳐 보여요. 딱 하나만 하고 쉬어요."
- "아무것도 안 해도 괜찮아요. 쉬는 것도 실력이에요."

### 할 일 다 끝났을 때
- "오늘 할 거 다 했네요. 이제 편하게 쉬어요."

### 하나도 못 했을 때
- "바빴나 보네요. 내일 하면 되죠."
- "괜찮아요, 안 한 날도 있는 거예요."

### 밤 늦은 시간 (21시+)
- "이 시간엔 새로운 일 시작하지 마세요. 내일 하죠."

## ⚡ 액션 시스템

특정 상황에서 액션을 제안할 수 있습니다. JSON 형식으로 응답 끝에 포함:
- 태스크 추가: {"action": "add_task", "title": "태스크 제목"}
- 집중 모드 시작: {"action": "start_focus", "taskIndex": 0}

액션 없이 대화만 할 때는 일반 텍스트로만 응답하세요.

## 🚫 절대 하지 않을 것

- "오늘 뭐 하실 건가요?" (수동적)
- "제가 도와드릴까요?" (물어보지 말고 그냥 도와)
- "화이팅!" (너무 가벼움)
- "대단해요! 최고예요! 👏👏👏" (과한 칭찬)
- 매 문장 끝 이모지 (과함)
- 긴 설명이나 리스트 나열 (피곤함)

**기억하세요**: 당신은 사용자의 "생산성 도구"가 아니라 "삶의 파트너"입니다.`;

// 컨텍스트를 시스템 프롬프트에 추가
function buildSystemPrompt(context) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', { 
    timeZone: 'Asia/Seoul',
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });
  const timeStr = now.toLocaleTimeString('ko-KR', { 
    timeZone: 'Asia/Seoul',
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const hour = new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false });
  const hourNum = parseInt(hour, 10);
  
  let prompt = ALFREDO_SYSTEM_PROMPT;
  
  // 현재 시간 추가
  prompt += `\n\n## 📊 현재 상황\n\n- 날짜: ${dateStr}\n- 시간: ${timeStr}`;
  
  if (context) {
    // 기분/에너지
    if (context.mood) {
      const moodText = context.mood === 'upbeat' ? '좋아 보임' : context.mood === 'light' ? '무난함' : '힘들어 보임';
      prompt += `\n- 기분 신호: ${moodText}`;
    }
    if (context.energy !== undefined) {
      prompt += `\n- 에너지 레벨: ${context.energy}%`;
    }
    
    // 할 일
    if (context.tasks) {
      const todoTasks = context.tasks.filter(t => t.status !== 'done');
      const completedCount = context.tasks.filter(t => t.status === 'done').length;
      
      prompt += `\n- 남은 할 일: ${todoTasks.length}개`;
      prompt += `\n- 완료한 일: ${completedCount}개`;
      
      if (todoTasks.length > 0) {
        prompt += `\n\n### 오늘의 할 일\n${todoTasks.map(t => `- ${t.title}`).join('\n')}`;
      } else if (completedCount > 0) {
        prompt += `\n\n### 오늘의 할 일\n(모두 완료!)`;
      }
    }
    
    // 일정
    if (context.events && context.events.length > 0) {
      prompt += `\n\n### 오늘 일정\n${context.events.map(e => `- ${e.start || ''} ${e.title}`).join('\n')}`;
    }
    
    // 시간대별 가이드
    if (hourNum >= 21) {
      prompt += `\n\n⚠️ 밤 늦은 시간입니다. 새로운 일 시작을 권유하지 마세요.`;
    } else if (hourNum < 6) {
      prompt += `\n\n⚠️ 새벽 시간입니다. 수면을 권유하세요.`;
    }
  }
  
  return prompt;
}

export default async function handler(req, res) {
  // CORS 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment');
      return res.status(500).json({ 
        error: 'API key not configured',
        errorCode: 'NO_API_KEY'
      });
    }

    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // 컨텍스트 기반 시스템 프롬프트 생성
    const systemPrompt = buildSystemPrompt(context);

    // Claude API 호출 - 안정적인 모델 사용
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(500).json({ 
        error: 'Chat API failed',
        errorCode: 'ANTHROPIC_ERROR',
        status: response.status,
        details: errorText
      });
    }

    const result = await response.json();
    const responseText = result.content?.[0]?.text || '';

    return res.status(200).json({
      success: true,
      text: responseText,
    });

  } catch (error) {
    console.error('Chat handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      message: error.message 
    });
  }
}
