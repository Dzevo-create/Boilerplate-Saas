/**
 * Editor Component Types
 */

export interface CanvasMarker {
  id: string;
  x: number;  // 0-1 relative position
  y: number;  // 0-1 relative position
  width: number;  // 0-1 relative size
  height: number; // 0-1 relative size
  personImage?: string; // Base64 or URL
  label: string;
  color: string;
  customPrompt?: string; // z.B. "sitzend", "lächelnd", "mit Laptop"
}

export interface EditorState {
  backgroundImage: string | null;
  backgroundPreview: string | null;
  markers: CanvasMarker[];
  selectedMarkerId: string | null;
  isDrawing: boolean;
  drawStart: { x: number; y: number } | null;
}

export interface PersonUpload {
  id: string;
  image: string;
  preview: string;
  name: string;
}

export const MARKER_COLORS = [
  '#FF6B6B', // Rot
  '#4ECDC4', // Türkis
  '#FFE66D', // Gelb
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Lila
  '#FCBAD3', // Pink
  '#A8D8EA', // Hellblau
];

export function getMarkerColor(index: number): string {
  return MARKER_COLORS[index % MARKER_COLORS.length];
}

