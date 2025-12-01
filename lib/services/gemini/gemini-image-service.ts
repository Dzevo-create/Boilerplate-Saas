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
 * - Hintergrundbild EXAKT beibehalten (Aspect Ratio, Inhalt)
 * - Person natürlich und perspektivisch korrekt einfügen
 * - Gesicht 1:1 aus Referenzbild
 */
function buildPersonPlacementPrompt(markers: PersonMarker[]): string {
  const totalPersons = markers.length;
  
  // Detaillierte Beschreibung für jede Person
  const markerDescriptions = markers.map((marker, index) => {
    const imageNumber = index + 2;
    // Position ist die obere linke Ecke des Rechtecks + halbe Breite/Höhe für Zentrum
    const centerX = Math.round((marker.x + marker.width / 2) * 100);
    const centerY = Math.round((marker.y + marker.height / 2) * 100);
    const widthPercent = Math.round(marker.width * 100);
    const heightPercent = Math.round(marker.height * 100);
    
    // Bestimme Framing basierend auf Rechteck-Größe
    let framing = 'full body, head to feet visible';
    if (heightPercent < 30) {
      framing = 'head and shoulders only, portrait framing';
    } else if (heightPercent < 50) {
      framing = 'upper body, from head to waist';
    }
    
    return `
PERSON ${index + 1} (Face from Image ${imageNumber}):
- Place at: ${centerX}% from left edge, ${centerY}% from top edge (this is the CENTER of the person)
- Size: The person should occupy roughly ${widthPercent}% of image width and ${heightPercent}% of image height
- Framing: ${framing}
- Face: Must be IDENTICAL to the face in Image ${imageNumber}`;
  }).join('\n');

  return `
You are a professional photo compositor. Your task is to seamlessly place a person into an existing photograph.

###############################################################
################### CRITICAL REQUIREMENTS #####################
###############################################################

1. PRESERVE THE BACKGROUND IMAGE EXACTLY
   - The output image must have the EXACT SAME dimensions and aspect ratio as Image 1
   - Do NOT stretch, crop, or distort the background
   - Keep ALL elements of the background scene intact
   - The room/scene must look IDENTICAL to Image 1

2. FACE PRESERVATION - NON-NEGOTIABLE
   - The person's face MUST be 100% IDENTICAL to the reference (Image 2, 3, etc.)
   - Copy the EXACT facial features: eyes, nose, mouth, jawline, skin texture
   - The person must be IMMEDIATELY RECOGNIZABLE
   - Do NOT beautify, smooth, or alter the face in ANY way

3. NATURAL INTEGRATION
   - The person must look like they ACTUALLY EXIST in this space
   - Match the lighting direction and intensity from the scene
   - Correct perspective - person must be properly scaled for the room depth
   - Natural shadows on the floor/ground
   - Person should look comfortable and natural, not "pasted in"

###############################################################

TASK: Composite ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} into the background scene

INPUT:
- Image 1: Background photograph (KEEP THIS EXACTLY - same dimensions, same content)
${markers.map((_, i) => `- Image ${i + 2}: Reference photo showing the face of Person ${i + 1}`).join('\n')}

PLACEMENT DETAILS:
${markerDescriptions}

TECHNICAL REQUIREMENTS:
- Output dimensions: EXACTLY the same as Image 1 (DO NOT change aspect ratio)
- The background must remain pixel-perfect - only add the person(s)
- Person scale must match the room's perspective (further = smaller, closer = larger)
- Lighting on person must match the scene's light sources
- Cast appropriate shadows based on light direction
- Natural standing/sitting pose appropriate for the setting
- Clothing should be casual/smart casual, fitting the environment

QUALITY STANDARDS:
- Photorealistic result - should look like a real photograph
- No distortion or stretching of any kind
- Person looks naturally present, as if they live there
- Professional compositing quality

OUTPUT: One photograph with the exact same framing as Image 1, with ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} naturally integrated.
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

