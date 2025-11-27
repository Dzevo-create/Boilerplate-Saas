/**
 * Chat System Types
 * 
 * Type definitions for the chat/conversation system.
 */

// Attachment types
export interface ChatAttachment {
  type: 'image' | 'pdf' | 'file';
  url: string;
  name: string;
  base64?: string;
  metadata?: Record<string, unknown>;
}

// Message types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: ChatAttachment[];
  replyTo?: {
    messageId: string;
    content: string;
  };
  metadata?: {
    model?: string;
    tokensUsed?: number;
    generationType?: 'text' | 'image' | 'code';
    isStreaming?: boolean;
  };
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
  metadata?: Record<string, unknown>;
}

// Chat settings
export interface ChatSettings {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Chat error types
export interface ChatError {
  message: string;
  code?: string;
  retryable?: boolean;
}

// AI Provider types
export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  displayName: string;
  maxTokens: number;
  costPerToken?: number;
}

// Available AI models
export const AI_MODELS: AIModelConfig[] = [
  {
    provider: 'openai',
    model: 'gpt-4o',
    displayName: 'GPT-4o',
    maxTokens: 128000,
  },
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    maxTokens: 128000,
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet',
    maxTokens: 200000,
  },
  {
    provider: 'google',
    model: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    maxTokens: 2000000,
  },
];

// Stream chunk types
export interface StreamChunk {
  type: 'text' | 'error' | 'done';
  content?: string;
  error?: string;
}

