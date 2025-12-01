/**
 * API Route: Generate Image with Persons
 * 
 * POST /api/generate-image
 * Platziert Personen in einem Hintergrundbild mit Gemini 3 Pro
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithPersons, generateImageFromPrompt } from '@/lib/services/gemini';
import type { PersonMarker } from '@/lib/services/gemini';

export const maxDuration = 60; // 60 Sekunden Timeout für Vercel

interface RequestBody {
  backgroundImage: string;
  personMarkers?: PersonMarker[];
  prompt?: string;
  referenceImages?: string[];
  imageQuality?: '2K' | '4K';
  mode?: 'placement' | 'prompt';
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key not configured on server' },
        { status: 500 }
      );
    }

    const { mode = 'placement' } = body;

    // Mode: Prompt-basierte Generierung
    if (mode === 'prompt') {
      if (!body.prompt) {
        return NextResponse.json(
          { success: false, error: 'Prompt is required for prompt mode' },
          { status: 400 }
        );
      }

      const result = await generateImageFromPrompt(
        body.prompt,
        body.referenceImages || [],
        apiKey,
        body.imageQuality || '2K'
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        imageBase64: result.imageBase64,
        mimeType: result.mimeType
      });
    }

    // Mode: Person Placement (Standard)
    if (!body.backgroundImage) {
      return NextResponse.json(
        { success: false, error: 'Background image is required' },
        { status: 400 }
      );
    }

    if (!body.personMarkers || body.personMarkers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one person marker is required' },
        { status: 400 }
      );
    }

    const result = await generateImageWithPersons(
      {
        backgroundImage: body.backgroundImage,
        personMarkers: body.personMarkers,
        prompt: body.prompt,
        imageQuality: body.imageQuality || '2K'
      },
      apiKey
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
      debugInfo: result.debugInfo
    });

  } catch (error) {
    console.error('Generate image API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

