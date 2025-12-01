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
 * Mit präzisen Koordinaten und Face Preservation
 */
function buildPersonPlacementPrompt(markers: PersonMarker[]): string {
  const totalPersons = markers.length;
  
  // Detaillierte Beschreibung für jede Person mit exakten Koordinaten
  const markerDescriptions = markers.map((marker, index) => {
    const imageNumber = index + 2; // +2 weil Bild 1 das Hintergrundbild ist
    const xPercent = Math.round(marker.x * 100);
    const yPercent = Math.round(marker.y * 100);
    const widthPercent = Math.round(marker.width * 100);
    const heightPercent = Math.round(marker.height * 100);
    
    return `
PERSON ${index + 1} (Reference: Image ${imageNumber} - the ${getOrdinal(imageNumber)} image provided):
- EXACT POSITION: Place person's center at ${xPercent}% from left edge, ${yPercent}% from top edge
- BOUNDING BOX: Person should fill approximately ${widthPercent}% width × ${heightPercent}% height of the image
- FACE: MUST be 100% IDENTICAL to Image ${imageNumber} - copy EXACT facial features`;
  }).join('\n');

  return `
###############################################################
###### CRITICAL INSTRUCTION - FACE PRESERVATION ######
###############################################################

THIS IS THE HIGHEST PRIORITY - VIOLATION IS NOT ACCEPTABLE:

For EACH person being placed:
- The face MUST be 100% IDENTICAL to their reference image
- COPY the EXACT face: eyes, nose, mouth, chin, jawline, cheekbones, skin texture, skin color
- The person MUST be IMMEDIATELY RECOGNIZABLE as the same person
- DO NOT modify, beautify, smooth, or alter ANY facial features
- DO NOT change: eye shape, eye color, nose shape, lip shape, face structure, skin tone
- Keep natural skin texture - no airbrushing or smoothing
- Expression may change slightly, but facial STRUCTURE must be IDENTICAL

###############################################################

TASK: Create a photorealistic composite image

INPUT IMAGES:
- Image 1 (FIRST image): Background/Scene - this is where people will be placed
${markers.map((_, i) => `- Image ${i + 2} (${getOrdinal(i + 2)} image): Reference photo for Person ${i + 1}`).join('\n')}

PLACEMENT INSTRUCTIONS:
${markerDescriptions}

COMPOSITION REQUIREMENTS:
1. KEEP the background scene (Image 1) EXACTLY as provided - do not alter it
2. Place ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} at their EXACT specified positions
3. Each person's face MUST match their reference image PERFECTLY
4. Scale each person to fit their designated bounding box naturally
5. Match lighting, shadows, and color temperature to the background scene
6. Ensure natural integration - people should look like they belong in the scene
7. Full body or appropriate crop based on the bounding box size

OUTPUT: Single photorealistic image with ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} naturally composited into the background.
Each person's identity must be preserved 100% - they must be recognizable.
Professional quality, seamless integration, natural lighting.
`;
}

/**
 * Gibt die Ordnungszahl zurück (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

/**
 * Beschreibt die Position eines Markers detailliert
 */
function getPositionDescription(marker: PersonMarker): string {
  const xPercent = Math.round(marker.x * 100);
  const yPercent = Math.round(marker.y * 100);
  const widthPercent = Math.round(marker.width * 100);
  const heightPercent = Math.round(marker.height * 100);
  
  let horizontal = 'center';
  if (xPercent < 33) horizontal = 'left side';
  else if (xPercent > 66) horizontal = 'right side';
  
  let vertical = 'middle';
  if (yPercent < 33) vertical = 'top';
  else if (yPercent > 66) vertical = 'bottom';
  
  return `${vertical} ${horizontal} (X: ${xPercent}%, Y: ${yPercent}%, Size: ${widthPercent}% × ${heightPercent}%)`;
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
    // Parts Array aufbauen - REIHENFOLGE IST WICHTIG!
    // 1. Prompt (Text)
    // 2. Hintergrundbild (Image 1 im Prompt)
    // 3. Person 1 Bild (Image 2 im Prompt)
    // 4. Person 2 Bild (Image 3 im Prompt)
    // usw.
    const parts: GeminiRequestPart[] = [];
    
    // 1. Prompt hinzufügen - beschreibt welches Bild was ist
    const prompt = params.prompt || buildPersonPlacementPrompt(params.personMarkers);
    parts.push({ text: prompt });
    
    // 2. Hintergrundbild hinzufügen (= Image 1 im Prompt)
    const backgroundBase64 = await urlToBase64(params.backgroundImage);
    const backgroundMimeType = detectMimeType(params.backgroundImage);
    parts.push({
      inline_data: {
        mime_type: backgroundMimeType,
        data: backgroundBase64
      }
    });
    
    // 3. Personenbilder hinzufügen (= Image 2, 3, 4... im Prompt)
    // Reihenfolge entspricht der Marker-Reihenfolge!
    for (let i = 0; i < params.personMarkers.length; i++) {
      const marker = params.personMarkers[i];
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
        console.log(`Added person ${i + 1} image as Image ${i + 2} at position (${Math.round(marker.x * 100)}%, ${Math.round(marker.y * 100)}%)`);
      }
    }
    
    console.log(`Total images: 1 background + ${params.personMarkers.length} persons = ${parts.length - 1} images`);

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

