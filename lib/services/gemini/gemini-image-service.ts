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
 * - Gesicht 1:1 aus Referenzbild übernehmen
 * - Körper passend zur Szene generieren
 * - Präzise Positionierung
 */
function buildPersonPlacementPrompt(markers: PersonMarker[]): string {
  const totalPersons = markers.length;
  
  // Detaillierte Beschreibung für jede Person
  const markerDescriptions = markers.map((marker, index) => {
    const imageNumber = index + 2; // +2 weil Bild 1 das Hintergrundbild ist
    const xPercent = Math.round(marker.x * 100);
    const yPercent = Math.round(marker.y * 100);
    const widthPercent = Math.round(marker.width * 100);
    const heightPercent = Math.round(marker.height * 100);
    
    // Bestimme ob ganzer Körper oder nur Oberkörper basierend auf Bounding Box
    const bodyType = heightPercent > 50 ? 'full body standing' : 
                     heightPercent > 30 ? 'three-quarter body (waist up)' : 
                     'upper body (chest up)';
    
    return `
PERSON ${index + 1}:
- FACE SOURCE: Use the EXACT face from Image ${imageNumber} (the ${getOrdinal(imageNumber)} image)
- POSITION: Center of person at X=${xPercent}% from left, Y=${yPercent}% from top of the image
- SIZE: Person fills area of ${widthPercent}% width × ${heightPercent}% height
- BODY: Generate ${bodyType} - the reference may only show face/portrait, but GENERATE appropriate body
- The person should be naturally posed, fitting the scene context`;
  }).join('\n');

  return `
###############################################################
########## ABSOLUTE PRIORITY - FACE IDENTITY ##########
###############################################################

CRITICAL - THIS MUST NOT BE IGNORED:

The reference images (Image 2, 3, etc.) show the FACES to use.
- EXTRACT the EXACT face from each reference image
- The generated person MUST have the IDENTICAL face - 100% recognizable
- Copy EXACTLY: eyes, nose, mouth, chin, jawline, cheekbones, skin texture, skin color
- DO NOT modify, beautify, or alter ANY facial features whatsoever
- The person in the output MUST look like the SAME PERSON as in the reference

IMPORTANT: The reference image might only be a portrait/headshot.
You must GENERATE an appropriate body for the scene - but the FACE stays identical.

###############################################################

TASK: Generate a new image with people placed into a background scene

CONCEPT:
- Take the background scene (Image 1) 
- Generate ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} INTO the scene at specific positions
- Each person's FACE comes from their reference image
- Each person's BODY is generated to fit naturally in the scene
- This is NOT a copy-paste - generate the person naturally standing/sitting in the scene

INPUT IMAGES:
- Image 1 (FIRST image): The background scene - PRESERVE this exactly, same aspect ratio
${markers.map((_, i) => `- Image ${i + 2}: Face reference for Person ${i + 1} - use this EXACT face`).join('\n')}

PERSON PLACEMENT:
${markerDescriptions}

GENERATION RULES:
1. OUTPUT must have the SAME ASPECT RATIO as the background image (Image 1)
2. PRESERVE the background scene exactly - do not alter the environment
3. GENERATE each person naturally positioned at their specified location
4. Each person's FACE must be 100% IDENTICAL to their reference - this is non-negotiable
5. GENERATE appropriate body, clothing, and pose that fits the scene
6. If reference only shows face/portrait → generate full/partial body as needed
7. Match lighting, shadows, perspective to the background scene
8. People should look like they naturally belong in the scene
9. Proper scale - people should be realistically sized for the environment

OUTPUT: A single photorealistic image.
- Same aspect ratio as background
- ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} naturally integrated into the scene
- Each person is 100% recognizable from their reference face
- Professional quality, seamless integration
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

