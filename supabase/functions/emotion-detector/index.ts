/**
 * Emotion Detector Edge Function
 *
 * 대화 내용을 분석하여 감정/건강 신호를 감지
 * - JSON만 출력, 사용자에게 노출하지 않음
 * - 금지: "감지/분석" 표현
 *
 * Output:
 * - emotional_load: low | medium | high (confidence)
 * - cognitive_overload: low | medium | high (confidence)
 * - physical_constraint: low | medium | high (confidence)
 * - people_friction: none | possible | clear (confidence)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, getCorsHeaders } from '../_shared/cors.ts';
import { getUserFromAuth } from '../_shared/supabase.ts';
import { successResponse, errorResponse, ErrorCodes } from '../_shared/response.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')!;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Detector System Prompt
const DETECTOR_SYSTEM_PROMPT = `You are an internal signal detector for a productivity assistant.
Your job is to analyze conversation content and detect emotional/cognitive/physical signals.

IMPORTANT: You are NOT user-facing. Output JSON only. Never mention "detection", "analysis", "AI analyzed", etc.

OUTPUT FORMAT (strict JSON):
{
  "signals": {
    "emotional_load": {
      "level": "low" | "medium" | "high",
      "confidence": 0.0-1.0,
      "evidence": ["string", "string"] // max 3 items, 12 words each
    },
    "cognitive_overload": {
      "level": "low" | "medium" | "high",
      "confidence": 0.0-1.0,
      "evidence": ["string", "string"]
    },
    "physical_constraint": {
      "level": "low" | "medium" | "high",
      "confidence": 0.0-1.0,
      "evidence": ["string", "string"]
    },
    "people_friction": {
      "level": "none" | "possible" | "clear",
      "confidence": 0.0-1.0,
      "evidence": ["string", "string"]
    }
  },
  "notes": {
    "should_confirm_state_question": true | false,
    "confirm_reason": "string or empty",
    "safety_flags": ["string"] // empty array if none
  }
}

SIGNAL DETECTION RULES:

EMOTIONAL_LOAD:
- low: Neutral, calm, focused
- medium: Frustration hints, overwhelm mentions, stress signals
- high (confidence >= 0.75 required): Explicit distress, anxiety expression, burnout mentions

COGNITIVE_OVERLOAD:
- low: Clear thinking, organized
- medium: Confusion, forgetting, difficulty deciding
- high: Brain fog, can't process, overwhelmed by options

PHYSICAL_CONSTRAINT:
- low: Normal, fine
- medium: Tiredness, minor discomfort mentioned
- high: Sleep deprivation, illness, significant physical complaint

PEOPLE_FRICTION:
- none: No interpersonal mentions
- possible: Hints of interpersonal tension
- clear: Explicit conflict, difficult conversations, relationship stress

CONFIDENCE RULES:
- Only use confidence >= 0.75 for "high" levels
- If unsure, default to lower level with higher confidence
- Evidence must be specific phrases or context from conversation

CONFIRM QUESTION RULES:
- should_confirm_state_question: true only when:
  - Signals are borderline (e.g., medium with 0.5-0.7 confidence)
  - User's words contradict their apparent state
  - Significant change from previous signals detected

SAFETY FLAGS:
- Add safety flag if: self-harm mentions, severe distress, crisis indicators
- Example: ["potential_crisis_escalate"]

OUTPUT ONLY VALID JSON. No markdown, no explanation.`;

interface DetectorRequest {
  conversation_id?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  previous_signals?: {
    emotional_level?: string;
    cognitive_level?: string;
  };
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    const { user, error: authError } = await getUserFromAuth(authHeader);

    if (authError || !user) {
      return errorResponse(ErrorCodes.UNAUTHORIZED, 'Not authenticated', 401);
    }

    if (req.method !== 'POST') {
      return errorResponse(ErrorCodes.INVALID_REQUEST, 'Method not allowed', 405);
    }

    const body: DetectorRequest = await req.json();

    if (!body.messages || body.messages.length === 0) {
      return errorResponse(ErrorCodes.MISSING_FIELD, 'Messages are required', 400);
    }

    // Build context for detector
    const recentMessages = body.messages.slice(-10); // Last 10 messages
    const conversationText = recentMessages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const previousContext = body.previous_signals
      ? `\nPrevious signals: emotional=${body.previous_signals.emotional_level || 'low'}, cognitive=${body.previous_signals.cognitive_level || 'low'}`
      : '';

    // Call Claude API for detection
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: DETECTOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Analyze the following conversation and output signal JSON:\n\n${conversationText}${previousContext}`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return errorResponse(ErrorCodes.SERVICE_UNAVAILABLE, 'Detection service unavailable', 503);
    }

    const claudeData = await claudeResponse.json();
    const responseText = claudeData.content?.[0]?.text || '';

    // Parse JSON response
    let detectorOutput;
    try {
      // Extract JSON from response (in case of markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        detectorOutput = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse detector output:', responseText);
      // Return default safe signals
      detectorOutput = {
        signals: {
          emotional_load: { level: 'low', confidence: 0.5, evidence: [] },
          cognitive_overload: { level: 'low', confidence: 0.5, evidence: [] },
          physical_constraint: { level: 'low', confidence: 0.5, evidence: [] },
          people_friction: { level: 'none', confidence: 0.5, evidence: [] },
        },
        notes: {
          should_confirm_state_question: false,
          confirm_reason: '',
          safety_flags: [],
        },
      };
    }

    return successResponse(detectorOutput);
  } catch (error) {
    console.error('Emotion Detector Error:', error);
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
  }
});
