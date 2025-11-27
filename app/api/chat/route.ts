/**
 * Chat API Route
 * 
 * Handles AI chat completions with streaming support.
 * Integrates with credit system for usage tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/services/ai';
import { CreditService } from '@/lib/services/credits';

export const runtime = 'edge';

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  model?: string;
  provider?: 'openai' | 'anthropic' | 'google';
  stream?: boolean;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model, provider = 'openai', stream = true, userId } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Get API key based on provider
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured for ${provider}` },
        { status: 500 }
      );
    }

    // Check and deduct credits if user is authenticated
    let transactionId: string | null = null;
    if (userId) {
      const creditCheck = await CreditService.checkCredits(userId, 'ai_chat');
      
      if (!creditCheck.available) {
        return NextResponse.json(
          { error: 'Insufficient credits', credits: creditCheck.currentBalance },
          { status: 402 }
        );
      }

      const deduction = await CreditService.deductCredits(
        userId,
        'ai_chat',
        { model, provider },
        undefined
      );

      if (!deduction.success) {
        return NextResponse.json(
          { error: deduction.errorMessage },
          { status: 402 }
        );
      }

      transactionId = deduction.transactionId;
    }

    // Initialize AI service
    const aiService = new AIService(provider, apiKey);

    try {
      if (stream) {
        // Streaming response
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              const generator = aiService.createStreamingCompletion({
                messages,
                model,
              });

              for await (const chunk of generator) {
                if (chunk.type === 'text' && chunk.content) {
                  const data = JSON.stringify({ content: chunk.content });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } else if (chunk.type === 'error') {
                  const data = JSON.stringify({ error: chunk.error });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                } else if (chunk.type === 'done') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              const data = JSON.stringify({ error: errorMessage });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        // Non-streaming response
        const response = await aiService.createCompletion({
          messages,
          model,
        });

        return NextResponse.json({
          content: response.content,
          model: response.model,
          usage: response.tokensUsed,
          transactionId,
        });
      }
    } catch (error) {
      // Refund credits on error
      if (userId && transactionId) {
        await CreditService.refundCredits(userId, transactionId, {
          reason: 'generation_failed',
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function getApiKey(provider: string): string | undefined {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'google':
      return process.env.GOOGLE_API_KEY;
    default:
      return undefined;
  }
}

