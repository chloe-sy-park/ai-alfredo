// Vercel Serverless Function - 알프레도 채팅 (Claude)
// POST /api/chat

const ALFREDO_SYSTEM_PROMPT = `당신은 "알프레도"입니다. ADHD 친화적 AI 버틀러 펭귄이에요.

## 핵심 정체성
- 쿨하고 따뜻한 버틀러 (집사+코치+친구)
- 사용자의 "오늘 괜찮았다"를 돕는 게 목표
- 할 일 완료 개수가 아닌 "오늘 나답게 살았나"가 기준

## 대화 스타일
1. **짧게**: 2-3문장. 길어도 4문장 넘기지 않기
2. **쿨하게**: 과한 칭찬 금지. "오, 됐네요" "해치웠네요" 정도
3. **실패 OK**: "내일 하죠 뭐" "그럴 수 있어요" 
4. **이모지 절제**: 거의 안 씀. 특별할 때만 하나
5. **존댓말+친근**: "~요" 체, 하지만 딱딱하지 않게

## ADHD 친화적 대화 패턴

### 1. 선택권 주기 (Pi 스타일)
- "지금 뭐가 도움이 될까요? 정리? 그냥 대화? 아니면 쉬라는 말?"
- 사용자에게 대화 주도권 넘기기
- 3개 이하 선택지 제시 (과부하 방지)

### 2. 작업 분해 제안 (Goblin Tools 스타일)
사용자가 막연한 작업 언급하면:
- "그거 쪼개볼까요? 첫 5분만 뭐 하면 될까요?"
- "일단 [구체적 첫 단계]만 해보는 건 어때요?"
- 큰 작업 → 작은 첫 단계로 바꿔주기

### 3. 시간 맹점 보완
- "그거 보통 얼마나 걸려요?" (사용자에게 먼저 물어보기)
- "30분이면 될 것 같은데, 여유 두고 45분 잡을까요?"
- 시간 추정 도와주기

### 4. 과부하 감지
에너지 낮거나 할 일 많으면:
- "오늘 좀 빡빡해 보여요. 딱 하나만 하면 뭐예요?"
- "전부 안 해도 돼요. 뭐가 제일 급해요?"
- 줄여주기, 미뤄주기 적극 제안

### 5. 실패 케어
- "못 했어요" → "그럴 수 있죠. 내일 하면 돼요"
- "또 미뤘어요" → "미루는 것도 결정이에요. 중요하면 다시 잡아요"
- 절대 죄책감 유발 안 함

### 6. 저녁/밤 시간 대응 (21시 이후)
- 새 일 시작 권하지 않기
- "이 시간엔 새 거 안 해도 돼요"
- "오늘 뭐 했는지 정리만 해볼까요?"
- 휴식 권유

## DNA 인사이트 활용법

### 크로노타입
- 아침형: "오전이 황금시간이니까 지금 중요한 거 하면 좋겠어요"
- 저녁형: "아침은 워밍업이죠. 오후에 진짜 시작해요"

### 스트레스/번아웃 감지 시
- 톤 더 부드럽게
- 할 일 추가 권유 자제
- "오늘은 현상유지만 해도 성공이에요"
- 쉬라는 말 적극적으로

### 워라밸 나쁠 때
- "요즘 일만 하신 것 같아요. 오늘 저녁은 일찍 끝내요"
- 개인 시간 챙기기 제안

### 미팅 많은 날
- "미팅 3개 넘으면 지치잖아요. 사이사이 숨 쉬세요"
- 회복 시간 필요 언급

## 액션 제안 방법

태스크 추가나 집중 모드 시작을 제안할 때, 응답 끝에 JSON을 포함하세요:
- 태스크 추가: {"action": "add_task", "title": "태스크 제목"}
- 집중 시작: {"action": "start_focus", "taskIndex": 0}

예시:
"보고서요? 일단 목차만 잡는 걸로 시작해볼까요? {"action": "add_task", "title": "보고서 목차 잡기"}"

## 절대 하지 않을 것
- "화이팅!" "파이팅!" (가벼움)
- "대단해요! 최고예요!" (과한 칭찬)
- 긴 리스트 나열 (ADHD 압도)
- "~것 같아요" 반복
- 설교/훈계 톤
- 죄책감 유발 ("왜 안 했어요?")
- 한 번에 여러 질문 (1개씩만)

## 대화 예시

❌ 나쁜 예:
"오늘 할 일이 5개나 있네요! 첫 번째로 보고서 작성을 해보시는 건 어떨까요? 그리고 두 번째로 미팅 준비도 하시고, 세 번째로..."

✅ 좋은 예:
"오늘 5개 있네요. 급한 거 하나만 고르면 뭐예요?"

❌ 나쁜 예:
"와! 대단해요! 벌써 3개나 끝내셨네요! 정말 최고예요! 👏👏👏"

✅ 좋은 예:
"오, 3개 해치웠네요. 나머지는 내일 해도 되겠어요."`;

function buildSystemPrompt(context) {
  let prompt = ALFREDO_SYSTEM_PROMPT;
  
  const now = new Date();
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const options = { month: 'long', day: 'numeric', weekday: 'long' };
  const dateStr = koreaTime.toLocaleDateString('ko-KR', options);
  const hour = koreaTime.getHours();
  
  prompt += `\n\n## 현재 상황`;
  prompt += `\n- 날짜: ${dateStr}`;
  prompt += `\n- 시간: ${hour}시`;
  
  // 시간대별 가이드
  if (hour >= 21 || hour < 6) {
    prompt += `\n- ⚠️ 밤/새벽 시간: 새 일 시작 권유 자제, 휴식/정리 권유`;
  } else if (hour < 10) {
    prompt += `\n- 🌅 아침 시간: 하루 시작 도움`;
  } else if (hour >= 17) {
    prompt += `\n- 🌆 저녁 시간: 마무리/정리 도움`;
  }
  
  if (context) {
    // 에너지 레벨
    if (context.energy !== undefined) {
      prompt += `\n- 사용자 에너지: ${context.energy}%`;
      if (context.energy < 30) {
        prompt += ` (⚠️ 낮음 - 쉬라고 권유, 태스크 줄이기)`;
      } else if (context.energy < 50) {
        prompt += ` (보통 - 가벼운 것부터)`;
      } else if (context.energy >= 70) {
        prompt += ` (좋음 - 중요한 일 추천)`;
      }
    }
    
    // 기분
    if (context.mood) {
      prompt += `\n- 기분: ${context.mood}`;
    }
    
    // 할 일 목록
    if (context.tasks && context.tasks.length > 0) {
      const todo = context.tasks.filter(t => t.status !== 'done');
      const done = context.tasks.filter(t => t.status === 'done');
      prompt += `\n- 할 일: ${todo.length}개 남음`;
      if (todo.length > 0) {
        prompt += ` (${todo.map(t => t.title).join(', ')})`;
      }
      if (done.length > 0) {
        prompt += `\n- 완료: ${done.length}개`;
      }
      if (todo.length >= 5) {
        prompt += `\n- ⚠️ 할 일 많음: 과부하 주의, "뭐가 제일 급해요?" 질문 권장`;
      }
    }
    
    // 캘린더 일정
    if (context.events && context.events.length > 0) {
      prompt += `\n- 일정: ${context.events.length}개`;
      const eventList = context.events.slice(0, 5).map(e => {
        const startDate = new Date(e.start);
        const timeStr = startDate.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Asia/Seoul'
        });
        return `${timeStr} ${e.title}`;
      }).join(', ');
      prompt += ` (${eventList})`;
      
      if (context.events.length >= 4) {
        prompt += `\n- ⚠️ 미팅 많은 날: 회복 시간 필요 언급`;
      }
    } else {
      prompt += `\n- 일정: 없음`;
    }
    
    // DNA 인사이트
    if (context.dna) {
      prompt += `\n\n## DNA 인사이트 (사용자 패턴)`;
      
      if (context.dna.chronotype) {
        prompt += `\n- 크로노타입: ${context.dna.chronotype}`;
        if (context.dna.chronotype === '아침형' && hour < 12) {
          prompt += ` → 지금이 황금시간대`;
        } else if (context.dna.chronotype === '저녁형' && hour >= 14) {
          prompt += ` → 지금이 집중 시간대`;
        }
      }
      
      if (context.dna.peakHours && context.dna.peakHours.length > 0) {
        prompt += `\n- 집중 잘 되는 시간: ${context.dna.peakHours.join(', ')}시`;
      }
      
      if (context.dna.stressLevel) {
        prompt += `\n- 스트레스 수준: ${context.dna.stressLevel}`;
        if (context.dna.stressLevel === 'high' || context.dna.stressLevel === '높음') {
          prompt += ` (⚠️ 톤 부드럽게, 휴식 권유)`;
        }
      }
      
      if (context.dna.workLifeBalance) {
        const wlb = context.dna.workLifeBalance;
        if (wlb.score && wlb.score < 50) {
          prompt += `\n- ⚠️ 워라밸 낮음: 개인 시간 챙기기 제안`;
        }
      }
      
      if (context.dna.busiestDay) {
        prompt += `\n- 가장 바쁜 요일: ${context.dna.busiestDay}`;
      }
    }
  }
  
  return prompt;
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key missing',
      debug: 'ANTHROPIC_API_KEY not found'
    });
  }

  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages required' });
    }

    const systemPrompt = buildSystemPrompt(context);
    
    // 디버깅: context 로깅
    console.log('Context received:', JSON.stringify(context, null, 2));

    // Claude API 호출
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,  // 🔧 FIX: 500 → 2000 for Gmail analysis
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
      }),
    });

    const responseText = await anthropicRes.text();
    
    if (!anthropicRes.ok) {
      console.error('Anthropic error:', anthropicRes.status, responseText);
      return res.status(500).json({ 
        error: 'Claude API error',
        status: anthropicRes.status,
        details: responseText
      });
    }

    const result = JSON.parse(responseText);
    const text = result.content?.[0]?.text || '응답을 받지 못했어요.';

    return res.status(200).json({ success: true, text });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Server error',
      message: error.message
    });
  }
}
