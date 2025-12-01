/**
 * Gemini Image Generation Service
 * 
 * Service für die Bildgenerierung mit Gemini 3 Pro Image
 * Ermöglicht das Platzieren von Personen in Bildern
 */

import sharp from 'sharp';
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
 * Resized ein Base64 Bild auf das Ziel-Aspect-Ratio
 * Verwendet Center-Crop und dann Resize
 */
async function resizeImageToAspectRatio(
  imageBase64: string,
  targetWidth: number,
  targetHeight: number
): Promise<{ base64: string; mimeType: string }> {
  try {
    const inputBuffer = Buffer.from(imageBase64, 'base64');
    
    // Hole die Dimensionen des Input-Bildes
    const metadata = await sharp(inputBuffer).metadata();
    const inputWidth = metadata.width || 1024;
    const inputHeight = metadata.height || 1024;
    
    console.log(`Input image: ${inputWidth}x${inputHeight}`);
    console.log(`Target: ${targetWidth}x${targetHeight}`);
    
    const inputRatio = inputWidth / inputHeight;
    const targetRatio = targetWidth / targetHeight;
    
    let processedBuffer: Buffer;
    
    if (Math.abs(inputRatio - targetRatio) < 0.01) {
      // Aspect Ratios sind gleich - nur resizen
      processedBuffer = await sharp(inputBuffer)
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .jpeg({ quality: 95 })
        .toBuffer();
    } else {
      // Aspect Ratios unterschiedlich - erst croppen dann resizen
      let cropWidth: number, cropHeight: number;
      
      if (inputRatio > targetRatio) {
        // Input ist breiter als Target - von den Seiten croppen
        cropHeight = inputHeight;
        cropWidth = Math.round(inputHeight * targetRatio);
      } else {
        // Input ist höher als Target - von oben/unten croppen
        cropWidth = inputWidth;
        cropHeight = Math.round(inputWidth / targetRatio);
      }
      
      console.log(`Cropping to: ${cropWidth}x${cropHeight}`);
      
      // Center crop dann resize
      processedBuffer = await sharp(inputBuffer)
        .extract({
          left: Math.round((inputWidth - cropWidth) / 2),
          top: Math.round((inputHeight - cropHeight) / 2),
          width: cropWidth,
          height: cropHeight
        })
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .jpeg({ quality: 95 })
        .toBuffer();
    }
    
    console.log(`Output image resized to target aspect ratio`);
    
    return {
      base64: processedBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    };
  } catch (error) {
    console.error('Resize failed:', error);
    // Bei Fehler: Original zurückgeben
    return { base64: imageBase64, mimeType: 'image/jpeg' };
  }
}

/**
 * Führt einen Face-Swap durch
 * Nimmt ein generiertes Bild und ersetzt das Gesicht mit dem aus dem Referenzbild
 */
async function performFaceSwap(
  generatedImageBase64: string,
  originalFaceBase64: string,
  personIndex: number,
  apiKey: string,
  imageQuality: '2K' | '4K' = '2K'
): Promise<{ success: boolean; imageBase64?: string; mimeType?: string; error?: string }> {
  
  const faceSwapPrompt = `
###############################################################
############## FACE SWAP - CRITICAL INSTRUCTION ###############
###############################################################

You are performing a FACE SWAP operation.

Image 1: A photograph with a person in it (the scene to keep)
Image 2: A reference photo showing the EXACT face to use

MANDATORY - OUTPUT DIMENSIONS:
- Your output MUST have the EXACT SAME dimensions as Image 1
- DO NOT change the aspect ratio
- DO NOT crop or resize the image
- Keep the full scene from Image 1

YOUR TASK:
Replace the face of the person in Image 1 with the EXACT face from Image 2.

CRITICAL FACE REQUIREMENTS:
1. The face MUST be 100% IDENTICAL to Image 2
2. Copy EVERY facial detail: 
   - Exact eye shape, eye color, eyebrow shape
   - Exact nose shape (including any nose rings/piercings)
   - Exact lip shape and color
   - Exact jawline and chin shape
   - Exact skin texture, tone, and any imperfections
   - Any visible earrings, piercings, moles, freckles
3. DO NOT beautify, smooth, or idealize the face
4. DO NOT change ANY facial features
5. The person must be IMMEDIATELY RECOGNIZABLE as the person in Image 2

PRESERVE FROM IMAGE 1 (DO NOT CHANGE):
- The entire scene/background - KEEP EXACTLY
- The body pose and clothing - KEEP EXACTLY
- The image dimensions and aspect ratio - KEEP EXACTLY
- Adjust face lighting to match the scene

OUTPUT: Image 1 with ONLY the face replaced. Everything else stays identical.
`;

  const parts: GeminiRequestPart[] = [
    { text: faceSwapPrompt },
    { inline_data: { mime_type: 'image/png', data: generatedImageBase64 } },
    { inline_data: { mime_type: 'image/jpeg', data: originalFaceBase64 } }
  ];

  const apiUrl = `${API_BASE}/models/${IMAGE_MODEL_ID}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          response_modalities: ["image"],
          temperature: 1.0,
          imageConfig: { imageSize: imageQuality }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Face swap API error: ${errorText}` };
    }

    const data: GeminiResponse = await response.json();
    
    if (data.error) {
      return { success: false, error: `Face swap error: ${data.error.message}` };
    }

    const candidate = data.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find(
      (p) => p.inline_data || p.inlineData
    );

    if (!imagePart) {
      return { success: false, error: 'No image returned from face swap' };
    }

    const imageData = imagePart.inline_data || imagePart.inlineData;
    
    return {
      success: true,
      imageBase64: imageData?.data,
      mimeType: imageData?.mime_type || (imagePart.inlineData as { mimeType?: string })?.mimeType || 'image/png'
    };
  } catch (error) {
    return { success: false, error: `Face swap failed: ${error}` };
  }
}

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
 * Ermittelt das Aspect Ratio Format
 */
function getAspectRatioDescription(width?: number, height?: number): string {
  if (!width || !height) {
    return 'same aspect ratio as the background image';
  }
  
  const ratio = width / height;
  
  // Gängige Formate erkennen
  if (Math.abs(ratio - 16/9) < 0.1) return '16:9 landscape (widescreen)';
  if (Math.abs(ratio - 4/3) < 0.1) return '4:3 landscape';
  if (Math.abs(ratio - 3/2) < 0.1) return '3:2 landscape';
  if (Math.abs(ratio - 9/16) < 0.1) return '9:16 portrait (vertical)';
  if (Math.abs(ratio - 3/4) < 0.1) return '3:4 portrait';
  if (Math.abs(ratio - 2/3) < 0.1) return '2:3 portrait';
  if (Math.abs(ratio - 1) < 0.1) return '1:1 square';
  
  // Allgemein beschreiben
  if (ratio > 1.2) return `landscape format (${width}x${height}, ratio ~${ratio.toFixed(2)}:1)`;
  if (ratio < 0.8) return `portrait format (${width}x${height}, ratio ~1:${(1/ratio).toFixed(2)})`;
  return `near-square format (${width}x${height})`;
}

/**
 * Baut den Prompt für Schritt 1: Person im Raum platzieren
 * Fokus auf: Körper, Pose, Kleidung, Integration in die Szene
 * (Face wird später in Schritt 2 per Face-Swap ersetzt)
 */
function buildPersonPlacementPrompt(
  markers: PersonMarker[], 
  bgWidth?: number, 
  bgHeight?: number
): string {
  const totalPersons = markers.length;
  const aspectRatio = getAspectRatioDescription(bgWidth, bgHeight);
  
  // Explizite Dimensionen wenn verfügbar
  const dimensionInfo = bgWidth && bgHeight 
    ? `The background image is ${bgWidth}x${bgHeight} pixels (${aspectRatio}).`
    : '';
  
  // Detaillierte Beschreibung für jede Person
  const markerDescriptions = markers.map((marker, index) => {
    const imageNumber = index + 2;
    const centerX = Math.round((marker.x + marker.width / 2) * 100);
    const centerY = Math.round((marker.y + marker.height / 2) * 100);
    const widthPercent = Math.round(marker.width * 100);
    const heightPercent = Math.round(marker.height * 100);
    
    let framing = 'full body, head to feet visible';
    if (heightPercent < 30) {
      framing = 'head and shoulders only, portrait framing';
    } else if (heightPercent < 50) {
      framing = 'upper body, from head to waist';
    }
    
    // Custom Prompt für diese Person (z.B. "sitzend", "mit Kaffee", etc.)
    const customInstruction = marker.customPrompt 
      ? `- Special instructions: ${marker.customPrompt}`
      : '- Pose: Natural standing/sitting pose, relaxed and comfortable';
    
    return `
PERSON ${index + 1} (Reference: Image ${imageNumber}):
- Position: ${centerX}% from left, ${centerY}% from top (center point)
- Size: ~${widthPercent}% width, ~${heightPercent}% height of image
- Framing: ${framing}
- Use the person from Image ${imageNumber} as reference for body type and general appearance
${customInstruction}`;
  }).join('\n');

  // Berechne das Zielformat für den Prompt
  let targetDimensions = '';
  if (bgWidth && bgHeight) {
    // Skaliere auf ca. 1344px an der längsten Seite (Gemini's übliche Größe)
    const maxSize = 1344;
    let targetW, targetH;
    if (bgWidth > bgHeight) {
      targetW = maxSize;
      targetH = Math.round((bgHeight / bgWidth) * maxSize);
    } else {
      targetH = maxSize;
      targetW = Math.round((bgWidth / bgHeight) * maxSize);
    }
    targetDimensions = `Generate the output image at exactly ${targetW}x${targetH} pixels.`;
  }

  return `
You are a professional photo compositor. STEP 1: Place a person naturally into an existing photograph.
(Note: The face will be refined in a separate step, so focus on body, pose, and scene integration)

###############################################################
########### MANDATORY: OUTPUT IMAGE DIMENSIONS ################
###############################################################

${dimensionInfo}
${targetDimensions}

CRITICAL - READ CAREFULLY:
- The input background image (Image 1) is ${bgWidth || '?'}x${bgHeight || '?'} pixels
- Your output MUST match this aspect ratio EXACTLY
- ${bgWidth && bgHeight && bgWidth > bgHeight ? 'This is a LANDSCAPE image - output must be WIDER than tall' : ''}
- ${bgWidth && bgHeight && bgHeight > bgWidth ? 'This is a PORTRAIT image - output must be TALLER than wide' : ''}
- ${bgWidth && bgHeight && Math.abs(bgWidth - bgHeight) < 50 ? 'This is approximately SQUARE' : ''}

DO NOT generate a square (1:1) image unless the input is square!
The aspect ratio of your output MUST match the aspect ratio of Image 1.

###############################################################
################### FOCUS: BODY & SCENE INTEGRATION ###########
###############################################################

PRIMARY GOALS:
- Place the person NATURALLY in the scene at the specified position
- Generate appropriate BODY, CLOTHING, and POSE for the setting
- Match the LIGHTING and SHADOWS to the scene
- Correct PERSPECTIVE and SCALE for the room depth
- The person should look like they BELONG in this space

Use the reference image (Image 2, 3, etc.) to understand:
- The person's general body type and proportions
- Hair color and style
- Approximate age and gender

###############################################################

TASK: Composite ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} into the background scene

INPUT IMAGES:
- Image 1: Background scene (PRESERVE EXACTLY - dimensions: ${bgWidth || '?'}x${bgHeight || '?'})
${markers.map((_, i) => `- Image ${i + 2}: Reference for Person ${i + 1} (body type, hair, general appearance)`).join('\n')}

PLACEMENT:
${markerDescriptions}

TECHNICAL REQUIREMENTS:
- Output: SAME dimensions and aspect ratio as Image 1 (${aspectRatio})
- Preserve background exactly - only add person(s)
- Scale person correctly for room perspective
- Match scene lighting direction and intensity on person
- Cast realistic shadows on floor
- Natural, relaxed pose appropriate for the setting
- Clothing should match the environment (casual home setting)

OUTPUT: Single photorealistic image, ${aspectRatio}, with ${totalPersons} ${totalPersons === 1 ? 'person' : 'people'} naturally placed in the scene.
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

  const { imageQuality = '2K', backgroundWidth, backgroundHeight } = params;
  
  try {
    // Parts Array aufbauen - REIHENFOLGE IST WICHTIG!
    // 1. Prompt (Text)
    // 2. Hintergrundbild (Image 1 im Prompt)
    // 3. Person 1 Bild (Image 2 im Prompt)
    // 4. Person 2 Bild (Image 3 im Prompt)
    // usw.
    const parts: GeminiRequestPart[] = [];
    
    // 1. Prompt hinzufügen - beschreibt welches Bild was ist und das Aspect Ratio
    const prompt = params.prompt || buildPersonPlacementPrompt(
      params.personMarkers, 
      backgroundWidth, 
      backgroundHeight
    );
    parts.push({ text: prompt });
    
    console.log(`Building prompt with background size: ${backgroundWidth}x${backgroundHeight}`);
    
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

    console.log('Step 1 complete: Person placed in scene. Starting face swap...');

    // ============================================
    // SCHRITT 2: Face-Swap für jede Person
    // ============================================
    let currentImage = base64Image;
    let currentMimeType = mimeType;

    for (let i = 0; i < params.personMarkers.length; i++) {
      const marker = params.personMarkers[i];
      const personFace = marker.personImageBase64 || marker.personImageUrl;
      
      if (!personFace) {
        console.log(`Skipping face swap for person ${i + 1}: no face image`);
        continue;
      }

      console.log(`Performing face swap for person ${i + 1}...`);
      
      // Original-Gesicht zu Base64 konvertieren
      const faceBase64 = await urlToBase64(personFace);
      
      // Face-Swap durchführen
      const faceSwapResult = await performFaceSwap(
        currentImage,
        faceBase64,
        i,
        apiKey,
        imageQuality
      );

      if (!faceSwapResult.success) {
        console.error(`Face swap failed for person ${i + 1}:`, faceSwapResult.error);
        // Bei Fehler: Vorheriges Bild behalten und weitermachen
        continue;
      }

      if (faceSwapResult.imageBase64) {
        currentImage = faceSwapResult.imageBase64;
        currentMimeType = faceSwapResult.mimeType || currentMimeType;
        console.log(`Face swap complete for person ${i + 1}`);
      }
    }

    // ============================================
    // SCHRITT 3: Bild auf korrektes Aspect Ratio resizen
    // ============================================
    let finalImage = currentImage;
    let finalMimeType = currentMimeType;

    if (backgroundWidth && backgroundHeight) {
      console.log(`Resizing to target aspect ratio: ${backgroundWidth}x${backgroundHeight}`);
      
      // Skaliere auf max 2048px an der längsten Seite, behalte Aspect Ratio
      const maxSize = 2048;
      let targetW, targetH;
      
      if (backgroundWidth > backgroundHeight) {
        targetW = Math.min(backgroundWidth, maxSize);
        targetH = Math.round((backgroundHeight / backgroundWidth) * targetW);
      } else {
        targetH = Math.min(backgroundHeight, maxSize);
        targetW = Math.round((backgroundWidth / backgroundHeight) * targetH);
      }
      
      const resized = await resizeImageToAspectRatio(currentImage, targetW, targetH);
      finalImage = resized.base64;
      finalMimeType = resized.mimeType;
      
      console.log(`Image resized to ${targetW}x${targetH}`);
    }

    const processingTime = Date.now() - startTime;
    console.log(`Total processing time: ${processingTime}ms`);

    return {
      success: true,
      imageBase64: finalImage,
      mimeType: finalMimeType,
      debugInfo: {
        promptUsed: prompt.substring(0, 200) + '...',
        markersCount: params.personMarkers.length,
        processingTime,
        outputDimensions: backgroundWidth && backgroundHeight 
          ? `${backgroundWidth}x${backgroundHeight} (resized)`
          : 'original'
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

