'use client';

/**
 * ImageCanvas Component
 * 
 * Canvas zum Anzeigen des Hintergrundbildes und Markieren von Positionen
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Move } from 'lucide-react';
import { CanvasMarker, getMarkerColor } from './types';

interface ImageCanvasProps {
  backgroundImage: string | null;
  markers: CanvasMarker[];
  onAddMarker: (marker: Omit<CanvasMarker, 'id' | 'label' | 'color'>) => void;
  onUpdateMarker: (id: string, updates: Partial<CanvasMarker>) => void;
  onDeleteMarker: (id: string) => void;
  selectedMarkerId: string | null;
  onSelectMarker: (id: string | null) => void;
}

export function ImageCanvas({
  backgroundImage,
  markers,
  onAddMarker,
  onUpdateMarker,
  onDeleteMarker,
  selectedMarkerId,
  onSelectMarker
}: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getRelativePosition = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Nur linke Maustaste
    
    // Prüfen ob auf einem Marker geklickt wurde
    const target = e.target as HTMLElement;
    if (target.closest('[data-marker]')) return;

    const pos = getRelativePosition(e);
    setIsDrawing(true);
    setDrawStart(pos);
    setCurrentDraw({ x: pos.x, y: pos.y, width: 0, height: 0 });
    onSelectMarker(null);
  }, [getRelativePosition, onSelectMarker]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !drawStart) return;
    
    const pos = getRelativePosition(e);
    setCurrentDraw({
      x: Math.min(drawStart.x, pos.x),
      y: Math.min(drawStart.y, pos.y),
      width: Math.abs(pos.x - drawStart.x),
      height: Math.abs(pos.y - drawStart.y)
    });
  }, [isDrawing, drawStart, getRelativePosition]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing && currentDraw && currentDraw.width > 0.02 && currentDraw.height > 0.02) {
      onAddMarker({
        x: currentDraw.x,
        y: currentDraw.y,
        width: currentDraw.width,
        height: currentDraw.height
      });
    }
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
  }, [isDrawing, currentDraw, onAddMarker]);

  // Marker Dragging
  const handleMarkerMouseDown = useCallback((e: React.MouseEvent, markerId: string) => {
    e.stopPropagation();
    const marker = markers.find(m => m.id === markerId);
    if (!marker) return;

    const pos = getRelativePosition(e);
    setDragOffset({
      x: pos.x - marker.x,
      y: pos.y - marker.y
    });
    setIsDragging(true);
    onSelectMarker(markerId);
  }, [markers, getRelativePosition, onSelectMarker]);

  useEffect(() => {
    if (!isDragging || !selectedMarkerId) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pos = {
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      };
      
      onUpdateMarker(selectedMarkerId, {
        x: Math.max(0, Math.min(1, pos.x - dragOffset.x)),
        y: Math.max(0, Math.min(1, pos.y - dragOffset.y))
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, selectedMarkerId, dragOffset, onUpdateMarker]);

  if (!backgroundImage) {
    return (
      <div className="relative aspect-video bg-muted rounded-2xl border-2 border-dashed border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground p-8">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-lg font-medium">Lade ein Hintergrundbild hoch</p>
          <p className="text-sm mt-2">Ziehe ein Bild hierher oder klicke auf "Hintergrund wählen"</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-muted rounded-2xl overflow-hidden cursor-crosshair select-none shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Image */}
      <img
        src={backgroundImage}
        alt="Background"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* Existing Markers */}
      <AnimatePresence>
        {markers.map((marker, index) => (
          <motion.div
            key={marker.id}
            data-marker
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute border-2 rounded-lg cursor-move transition-all ${
              selectedMarkerId === marker.id ? 'ring-2 ring-white ring-offset-2' : ''
            }`}
            style={{
              left: `${marker.x * 100}%`,
              top: `${marker.y * 100}%`,
              width: `${marker.width * 100}%`,
              height: `${marker.height * 100}%`,
              borderColor: marker.color,
              backgroundColor: `${marker.color}20`
            }}
            onMouseDown={(e) => handleMarkerMouseDown(e, marker.id)}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Marker Label */}
            <div
              className="absolute -top-7 left-0 px-2 py-0.5 rounded-md text-xs font-bold text-white whitespace-nowrap flex items-center gap-1"
              style={{ backgroundColor: marker.color }}
            >
              <Move className="w-3 h-3" />
              {marker.label}
              {marker.personImage && (
                <span className="ml-1">✓</span>
              )}
            </div>

            {/* Delete Button */}
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMarker(marker.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>

            {/* Person Preview */}
            {marker.personImage && (
              <div className="absolute inset-0 rounded-lg overflow-hidden opacity-60">
                <img
                  src={marker.personImage}
                  alt={marker.label}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Drawing Preview */}
      {isDrawing && currentDraw && (
        <div
          className="absolute border-2 border-dashed border-primary bg-primary/20 rounded-lg pointer-events-none"
          style={{
            left: `${currentDraw.x * 100}%`,
            top: `${currentDraw.y * 100}%`,
            width: `${currentDraw.width * 100}%`,
            height: `${currentDraw.height * 100}%`
          }}
        />
      )}

      {/* Instructions Overlay */}
      {markers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="bg-black/70 text-white px-6 py-4 rounded-xl text-center backdrop-blur-sm">
            <p className="font-semibold">Zeichne ein Rechteck</p>
            <p className="text-sm text-white/70 mt-1">Markiere wo die Person platziert werden soll</p>
          </div>
        </div>
      )}
    </div>
  );
}

