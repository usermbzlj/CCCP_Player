import { LLMEventResponse, LLMRequest, LLMResponse } from '../types/llm';

export function createTestRequest(model: string): LLMRequest {
  return {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a system test. Return only JSON.',
      },
      {
        role: 'user',
        content: 'Return this exact JSON: {"status":"online","system":"Krasny Kompleks"}',
      },
    ],
    temperature: 0,
    max_tokens: 256,
    response_format: { type: 'json_object' },
  };
}

export function parseTestResponse(response: LLMResponse): { status: string; system: string } | null {
  try {
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (parsed.status === 'online' && parsed.system === 'Krasny Kompleks') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function parseEventResponse(response: LLMResponse): LLMEventResponse | null {
  try {
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (parsed.title && parsed.narrative && parsed.tone && Array.isArray(parsed.suggestedEffects)) {
      return parsed as LLMEventResponse;
    }
    return null;
  } catch {
    return null;
  }
}

export function validateEffects(effects: LLMEventResponse['suggestedEffects'], isNuclear: boolean = false): LLMEventResponse['suggestedEffects'] {
  const maxDelta = isNuclear ? 35 : 15;
  return effects.map((e) => ({
    ...e,
    delta: Math.max(-maxDelta, Math.min(maxDelta, e.delta)),
  }));
}
