/**
 * Gemini Image Generation Types
 * Types für die Gemini 3 Pro Image API
 */

export interface PersonMarker {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  personImageBase64?: string;
  personImageUrl?: string;
  label: string;
  customPrompt?: string; // z.B. "sitzend", "lächelnd", "mit Laptop", etc.
}

export interface GenerateImageParams {
  backgroundImage: string; // Base64 oder URL
  backgroundWidth?: number; // Breite des Hintergrundbildes in Pixel
  backgroundHeight?: number; // Höhe des Hintergrundbildes in Pixel
  personMarkers: PersonMarker[];
  prompt?: string;
  imageQuality?: '2K' | '4K';
}

export interface GenerateImageResult {
  success: boolean;
  imageBase64?: string;
  mimeType?: string;
  error?: string;
  debugInfo?: {
    promptUsed: string;
    markersCount: number;
    processingTime: number;
  };
}

export interface GeminiRequestPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

export interface GeminiRequest {
  contents: [{
    parts: GeminiRequestPart[];
  }];
  generationConfig: {
    response_modalities: string[];
    temperature: number;
    imageConfig?: {
      imageSize: '2K' | '4K';
    };
  };
}

export interface GeminiResponse {
  candidates?: [{
    content: {
      parts: Array<{
        inline_data?: { mime_type: string; data: string };
        inlineData?: { mimeType: string; data: string };
        text?: string;
      }>;
    };
  }];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

