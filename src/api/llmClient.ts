import { LLMRequest, LLMResponse } from '../types/llm';

export type LLMClientConfig = {
  baseUrl: string;
  apiKey: string;
  modelId: string;
};

export class LLMClient {
  private config: LLMClientConfig;

  constructor(config: LLMClientConfig) {
    this.config = config;
  }

  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.config.modelId,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 1024,
    };

    if (request.response_format) {
      body.response_format = request.response_format;
    }

    // Try to disable thinking modes for various providers
    const thinkingVariants = [
      { thinking: { type: 'disabled' } },
      { reasoning_effort: 'none' },
      { disable_thinking: true },
      { enable_thinking: false },
    ];

    let lastError: Error | undefined;

    for (const variant of thinkingVariants) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({ ...body, ...variant }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          // If it's a parameter error, try next variant
          if (text.toLowerCase().includes('thinking') || text.toLowerCase().includes('reasoning') || res.status === 422) {
            lastError = new Error(`HTTP ${res.status}: ${text}`);
            continue;
          }
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = (await res.json()) as LLMResponse;
        return data;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Only continue if it seems like a parameter error
        if (String(err).toLowerCase().includes('thinking') || String(err).toLowerCase().includes('reasoning')) {
          continue;
        }
        throw err;
      }
    }

    // If all variants failed with thinking-related errors, try without any thinking parameter
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    return (await res.json()) as LLMResponse;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const { createTestRequest, parseTestResponse } = await import('./schemas');
      const req = createTestRequest(this.config.modelId);
      const res = await this.sendRequest(req);
      const parsed = parseTestResponse(res);
      if (parsed) {
        return { success: true };
      }
      return { success: false, error: '模型返回格式不正确' };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Mask API key in error messages
      const safeMessage = message.replace(new RegExp(this.config.apiKey, 'g'), '***');
      return { success: false, error: safeMessage };
    }
  }
}
