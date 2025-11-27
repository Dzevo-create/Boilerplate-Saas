/**
 * AI Service
 * 
 * Abstract AI provider service supporting multiple providers.
 * Handles streaming and non-streaming completions.
 */

import {
  AIProvider,
  AIMessage,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  DEFAULT_MODELS,
} from './types';

export class AIService {
  private provider: AIProvider;
  private apiKey: string;
  private baseUrl?: string;

  constructor(provider: AIProvider, apiKey: string, baseUrl?: string) {
    this.provider = provider;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * Create completion (non-streaming)
   */
  async createCompletion(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = request.model || DEFAULT_MODELS[this.provider];

    switch (this.provider) {
      case 'openai':
        return this.openAICompletion(model, request);
      case 'anthropic':
        return this.anthropicCompletion(model, request);
      case 'google':
        return this.googleCompletion(model, request);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * Create streaming completion
   */
  async *createStreamingCompletion(
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk> {
    const model = request.model || DEFAULT_MODELS[this.provider];

    switch (this.provider) {
      case 'openai':
        yield* this.openAIStream(model, request);
        break;
      case 'anthropic':
        yield* this.anthropicStream(model, request);
        break;
      case 'google':
        yield* this.googleStream(model, request);
        break;
      default:
        yield { type: 'error', error: `Unsupported provider: ${this.provider}` };
    }
  }

  // OpenAI Implementation
  private async openAICompletion(
    model: string,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const response = await fetch(this.baseUrl || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model,
      tokensUsed: data.usage ? {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens,
      } : undefined,
      finishReason: data.choices[0]?.finish_reason,
    };
  }

  private async *openAIStream(
    model: string,
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk> {
    const response = await fetch(this.baseUrl || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      yield { type: 'error', error: `OpenAI API error: ${response.status}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', error: 'No response body' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done' };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield { type: 'text', content };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    yield { type: 'done' };
  }

  // Anthropic Implementation
  private async anthropicCompletion(
    model: string,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages.filter(m => m.role !== 'system');

    const response = await fetch(this.baseUrl || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        system: systemMessage?.content,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || '',
      model: data.model,
      tokensUsed: {
        prompt: data.usage?.input_tokens || 0,
        completion: data.usage?.output_tokens || 0,
        total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
      finishReason: data.stop_reason,
    };
  }

  private async *anthropicStream(
    model: string,
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk> {
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages.filter(m => m.role !== 'system');

    const response = await fetch(this.baseUrl || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        system: systemMessage?.content,
        max_tokens: request.maxTokens || 4096,
        temperature: request.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      yield { type: 'error', error: `Anthropic API error: ${response.status}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', error: 'No response body' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta' && data.delta?.text) {
              yield { type: 'text', content: data.delta.text };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    yield { type: 'done' };
  }

  // Google Gemini Implementation
  private async googleCompletion(
    model: string,
    request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    const contents = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model,
      finishReason: data.candidates?.[0]?.finishReason,
    };
  }

  private async *googleStream(
    model: string,
    request: AICompletionRequest
  ): AsyncGenerator<AIStreamChunk> {
    // Google streaming uses different endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
    
    const contents = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      yield { type: 'error', error: `Google API error: ${response.status}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', error: 'No response body' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield { type: 'text', content: text };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    yield { type: 'done' };
  }
}

