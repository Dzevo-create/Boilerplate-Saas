/**
 * AI Service Types
 * 
 * Type definitions for AI provider abstraction.
 */

// Supported AI providers
export type AIProvider = 'openai' | 'anthropic' | 'google';

// Message format for AI requests
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// AI completion request
export interface AICompletionRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

// AI completion response
export interface AICompletionResponse {
  content: string;
  model: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason?: string;
}

// Streaming chunk
export interface AIStreamChunk {
  type: 'text' | 'error' | 'done';
  content?: string;
  error?: string;
}

// Provider configuration
export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

// Available models per provider
export const AI_PROVIDER_MODELS: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
};

// Default models per provider
export const DEFAULT_MODELS: Record<AIProvider, string> = {
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-flash',
};

