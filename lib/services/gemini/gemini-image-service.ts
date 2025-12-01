/**
 * Gemini Image Generation Service
 * 
 * Service für die Bildgenerierung mit Gemini 3 Pro Image
 * Ermöglicht das Platzieren von Personen in Bildern
 */

import {
  GenerateImageParams,
  GenerateImageResult,
  PersonMarker,
  GeminiRequestPart,
  GeminiResponse
} from './types';

const IMAGE_MODEL_ID = 'gemini-3-pro-image-preview';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Konvertiert eine URL oder Data URL zu Base64
 */
async function urlToBase64(url: string): Promise<string> {
  // Wenn bereits Base64 Data URL
  if (url.startsWith('data:')) {
    return url.split(',')[1];
  }
  
  // HTTP(S) URL fetchen
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${url}`);
  }
  
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

/**
 * Erkennt den MIME-Type aus Base64 oder URL
 */
function detectMimeType(base64OrUrl: string): string {
  if (base64OrUrl.startsWith('data:image/png')) return 'image/png';
  if (base64OrUrl.startsWith('data:image/jpeg') || base64OrUrl.startsWith('data:image/jpg')) return 'image/jpeg';
  if (base64OrUrl.startsWith('data:image/webp')) return 'image/webp';
  if (base64OrUrl.includes('.png')) return 'image/png';
  if (base64OrUrl.includes('.webp')) return 'image/webp';
  return 'image/jpeg'; // Default
}

/**
 * Baut den Prompt für die Personenplatzierung
 */
function buildPersonPlacementPrompt(markers: PersonMarker[]): string {
  const markerDescriptions = markers.map((marker, index) => {
    const positionDesc = getPositionDescription(marker);
    return `Person ${index + 1} (${marker.label}): Place at ${positionDesc}`;
  }).join('\n');

  return `
####### ABSOLUTE PRIORITY - FACE PRESERVATION #######
THIS IS THE MOST IMPORTANT REQUIREMENT - DO NOT IGNORE:
- Each person's face MUST be 100% IDENTICAL to their reference image
- COPY the EXACT face from each reference: eyes, nose, mouth, chin, cheekbones, skin texture
- Each person MUST be RECOGNIZABLE as the SAME PERSON from their reference
- DO NOT modify, beautify, or alter ANY facial features
- DO NOT change eye shape, eye color, nose shape, mouth shape, or face structure
- ONLY the expression can change slightly - NOT the actual facial features
################################################

TASK: Place the following people into the background scene image:

${markerDescriptions}

REQUIREMENTS:
1. PRESERVE the exact background scene - do not alter the environment
2. Place each person naturally at their designated position
3. Match lighting and shadows to the scene
4. Ensure proper scale relative to the environment
5. Create natural poses that fit the scene context
6. Each person should look like they belong in the scene

OUTPUT: A photorealistic image with all persons naturally integrated into the background scene.
High fidelity, natural lighting, seamless integration, professional quality.
`;
}

/**
 * Beschreibt die Position eines Markers
 */
function getPositionDescription(marker: PersonMarker): string {
  const xPercent = Math.round(marker.x * 100);
  const yPercent = Math.round(marker.y * 100);
  
  let horizontal = 'center';
  if (xPercent < 33) horizontal = 'left side';
  else if (xPercent > 66) horizontal = 'right side';
  
  let vertical = 'middle';
  if (yPercent < 33) vertical = 'top';
  else if (yPercent > 66) vertical = 'bottom';
  
  return `${vertical} ${horizontal} of the image (approximately ${xPercent}% from left, ${yPercent}% from top)`;
}

/**
 * Hauptfunktion: Generiert ein Bild mit platzierten Personen
 */
export async function generateImageWithPersons(
  params: GenerateImageParams,
  apiKey: string
): Promise<GenerateImageResult> {
  const startTime = Date.now();
  
  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  if (!params.backgroundImage) {
    return { success: false, error: 'Background image is required' };
  }

  if (!params.personMarkers || params.personMarkers.length === 0) {
    return { success: false, error: 'At least one person marker is required' };
  }

  const { imageQuality = '2K' } = params;
  
  try {
    // Parts Array aufbauen
    const parts: GeminiRequestPart[] = [];
    
    // 1. Prompt hinzufügen
    const prompt = params.prompt || buildPersonPlacementPrompt(params.personMarkers);
    parts.push({ text: prompt });
    
    // 2. Hintergrundbild hinzufügen
    const backgroundBase64 = await urlToBase64(params.backgroundImage);
    const backgroundMimeType = detectMimeType(params.backgroundImage);
    parts.push({
      inline_data: {
        mime_type: backgroundMimeType,
        data: backgroundBase64
      }
    });
    
    // 3. Personenbilder hinzufügen
    for (const marker of params.personMarkers) {
      const personImage = marker.personImageBase64 || marker.personImageUrl;
      if (personImage) {
        const personBase64 = await urlToBase64(personImage);
        const personMimeType = detectMimeType(personImage);
        parts.push({
          inline_data: {
            mime_type: personMimeType,
            data: personBase64
          }
        });
      }
    }

    // API Request
    const apiUrl = `${API_BASE}/models/${IMAGE_MODEL_ID}:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          response_modalities: ["image"],
          temperature: 1.0,
          imageConfig: {
            imageSize: imageQuality
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return { 
        success: false, 
        error: `API Error ${response.status}: ${errorText}` 
      };
    }

    const data: GeminiResponse = await response.json();
    
    // Fehler prüfen
    if (data.error) {
      return { 
        success: false, 
        error: `Gemini Error: ${data.error.message}` 
      };
    }

    // Bild extrahieren
    const candidate = data.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(
      (p) => p.inline_data || p.inlineData
    );

    if (!imagePart) {
      // Vielleicht nur Text zurückgegeben?
      const textPart = candidate?.content?.parts?.find(p => p.text);
      if (textPart?.text) {
        console.log('Gemini returned text instead of image:', textPart.text);
      }
      return { 
        success: false, 
        error: 'No image in response - the model may have returned text only' 
      };
    }

    // Daten extrahieren (beide Varianten prüfen)
    const imageData = imagePart.inline_data || imagePart.inlineData;
    const base64Image = imageData?.data;
    const mimeType = imageData?.mime_type || (imagePart.inlineData as { mimeType?: string })?.mimeType || 'image/png';

    if (!base64Image) {
      return { success: false, error: 'Empty image data in response' };
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      imageBase64: base64Image,
      mimeType,
      debugInfo: {
        promptUsed: prompt.substring(0, 200) + '...',
        markersCount: params.personMarkers.length,
        processingTime
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Generate image error:', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Einfache Bildgenerierung nur mit Prompt
 */
export async function generateImageFromPrompt(
  prompt: string,
  referenceImages: string[],
  apiKey: string,
  imageQuality: '2K' | '4K' = '2K'
): Promise<GenerateImageResult> {
  if (!apiKey) {
    return { success: false, error: 'API key not configured' };
  }

  try {
    const parts: GeminiRequestPart[] = [{ text: prompt }];
    
    // Referenzbilder hinzufügen
    for (const img of referenceImages) {
      const base64 = await urlToBase64(img);
      const mimeType = detectMimeType(img);
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64
        }
      });
    }

    const apiUrl = `${API_BASE}/models/${IMAGE_MODEL_ID}:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          response_modalities: ["image"],
          temperature: 1.0,
          imageConfig: {
            imageSize: imageQuality
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `API Error ${response.status}: ${errorText}` };
    }

    const data: GeminiResponse = await response.json();
    
    const candidate = data.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(
      (p) => p.inline_data || p.inlineData
    );

    if (!imagePart) {
      return { success: false, error: 'No image in response' };
    }

    const imageData = imagePart.inline_data || imagePart.inlineData;
    
    return {
      success: true,
      imageBase64: imageData?.data,
      mimeType: imageData?.mime_type || (imagePart.inlineData as { mimeType?: string })?.mimeType || 'image/png'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export { urlToBase64, detectMimeType, buildPersonPlacementPrompt };

