'use client';

/**
 * PersonUploader Component
 * 
 * Upload-Bereich für Personenbilder mit Drag & Drop
 */

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, User, Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CanvasMarker, getMarkerColor } from './types';

interface PersonUploaderProps {
  markers: CanvasMarker[];
  onAssignPerson: (markerId: string, imageData: string) => void;
  onRemovePersonImage: (markerId: string) => void;
}

export function PersonUploader({
  markers,
  onAssignPerson,
  onRemovePersonImage
}: PersonUploaderProps) {
  const [dragOverMarkerId, setDragOverMarkerId] = useState<string | null>(null);

  const handleFileSelect = useCallback((markerId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onAssignPerson(markerId, result);
    };
    reader.readAsDataURL(file);
  }, [onAssignPerson]);

  const handleDrop = useCallback((markerId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverMarkerId(null);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(markerId, file);
    }
  }, [handleFileSelect]);

  if (markers.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Personen</h3>
            <p className="text-sm text-muted-foreground">Markiere zuerst Bereiche im Bild</p>
          </div>
        </div>
        
        <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
          <div className="text-4xl mb-2">👆</div>
          <p className="text-muted-foreground text-sm">
            Zeichne ein Rechteck auf dem Bild,<br />
            um eine Position zu markieren
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Personen ({markers.length})</h3>
          <p className="text-sm text-muted-foreground">Lade Fotos für jede Position hoch</p>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {markers.map((marker, index) => (
            <motion.div
              key={marker.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`relative border-2 rounded-xl overflow-hidden transition-all ${
                dragOverMarkerId === marker.id 
                  ? 'border-primary bg-primary/5 scale-[1.02]' 
                  : 'border-border'
              }`}
              style={{ borderColor: dragOverMarkerId === marker.id ? undefined : marker.color }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverMarkerId(marker.id);
              }}
              onDragLeave={() => setDragOverMarkerId(null)}
              onDrop={(e) => handleDrop(marker.id, e)}
            >
              {/* Header */}
              <div 
                className="px-3 py-2 flex items-center gap-2"
                style={{ backgroundColor: `${marker.color}20` }}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: marker.color }}
                />
                <span className="font-medium text-sm">{marker.label}</span>
                {marker.personImage && (
                  <span className="ml-auto text-xs text-success font-medium">✓ Zugewiesen</span>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                {marker.personImage ? (
                  <div className="relative group">
                    <img
                      src={marker.personImage}
                      alt={marker.label}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onRemovePersonImage(marker.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Entfernen
                      </Button>
                      <label className="cursor-pointer">
                        <Button size="sm" variant="secondary" asChild>
                          <span>
                            <ImageIcon className="w-4 h-4 mr-1" />
                            Ändern
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(marker.id, file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary hover:bg-primary/5 transition-all">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Foto hochladen</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Klicken oder hierher ziehen
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(marker.id, file);
                      }}
                    />
                  </label>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hint */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tipp:</strong> Für beste Ergebnisse verwende Fotos mit klarem Gesicht und guter Beleuchtung.
        </p>
      </div>
    </div>
  );
}

