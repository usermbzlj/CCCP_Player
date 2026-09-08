export type LLMMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type LLMRequest = {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: {
    type: 'json_object' | 'text';
  };
};

export type LLMResponse = {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
};

export type Tone =
  | 'cold'
  | 'panic'
  | 'propaganda'
  | 'diplomatic'
  | 'military'
  | 'terminal'
  | 'horror';

export type EffectType =
  | 'commandIntegrity'
  | 'strategicAdvantage'
  | 'nuclearEscalation'
  | 'diplomaticPressure'
  | 'intelReliability'
  | 'commsStability'
  | 'stavkaTrust'
  | 'publicPanic'
  | 'systemIntegrity';

export type SuggestedEffect = {
  type: EffectType;
  delta: number;
  reason: string;
};

export type LLMChoice = {
  id: string;
  label: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'extreme';
};

export type LLMEventResponse = {
  title: string;
  narrative: string;
  speaker?: string;
  tone: Tone;
  suggestedEffects: SuggestedEffect[];
  choices?: LLMChoice[];
};

export type LLMRole =
  | 'stavka'
  | 'frontline'
  | 'enemy'
  | 'diplomacy'
  | 'news'
  | 'terminal'
  | 'political';
