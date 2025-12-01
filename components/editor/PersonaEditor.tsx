'use client';

/**
 * PersonaEditor Component
 * 
 * Hauptkomponente für den Bildeditor
 * Kombiniert Canvas, Uploader und Result Viewer
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ImagePlus, 
  Wand2, 
  Trash2, 
  Settings2,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageCanvas } from './ImageCanvas';
import { PersonUploader } from './PersonUploader';
import { ResultViewer } from './ResultViewer';
import { CanvasMarker, getMarkerColor } from './types';

interface GeneratedResult {
  imageBase64: string;
  mimeType: string;
}

export function PersonaEditor() {
  // State
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [markers, setMarkers] = useState<CanvasMarker[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<'2K' | '4K'>('2K');

  // Background Image Handler
  const handleBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackgroundImage(event.target?.result as string);
      setMarkers([]);
      setResult(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // Marker Handlers
  const handleAddMarker = useCallback((markerData: Omit<CanvasMarker, 'id' | 'label' | 'color'>) => {
    const newMarker: CanvasMarker = {
      ...markerData,
      id: `marker-${Date.now()}`,
      label: `Person ${markers.length + 1}`,
      color: getMarkerColor(markers.length)
    };
    setMarkers(prev => [...prev, newMarker]);
    setSelectedMarkerId(newMarker.id);
  }, [markers.length]);

  const handleUpdateMarker = useCallback((id: string, updates: Partial<CanvasMarker>) => {
    setMarkers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const handleDeleteMarker = useCallback((id: string) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
    if (selectedMarkerId === id) setSelectedMarkerId(null);
  }, [selectedMarkerId]);

  const handleAssignPerson = useCallback((markerId: string, imageData: string) => {
    handleUpdateMarker(markerId, { personImage: imageData });
  }, [handleUpdateMarker]);

  const handleRemovePersonImage = useCallback((markerId: string) => {
    handleUpdateMarker(markerId, { personImage: undefined });
  }, [handleUpdateMarker]);

  // Clear All
  const handleClearAll = useCallback(() => {
    setBackgroundImage(null);
    setMarkers([]);
    setSelectedMarkerId(null);
    setResult(null);
    setError(null);
  }, []);

  // Generate Image
  const handleGenerate = useCallback(async () => {
    if (!backgroundImage || markers.length === 0) return;

    // Check if all markers have person images
    const unassignedMarkers = markers.filter(m => !m.personImage);
    if (unassignedMarkers.length > 0) {
      setError(`Bitte lade Fotos für alle ${unassignedMarkers.length} markierten Positionen hoch.`);
      return;
    }

    setError(null);
    setIsGenerating(true);
    setShowResult(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backgroundImage,
          personMarkers: markers.map(m => ({
            id: m.id,
            x: m.x,
            y: m.y,
            width: m.width,
            height: m.height,
            personImageBase64: m.personImage,
            label: m.label
          })),
          imageQuality
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult({
        imageBase64: data.imageBase64,
        mimeType: data.mimeType || 'image/png'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      setError(`Generierung fehlgeschlagen: ${message}`);
      setShowResult(false);
    } finally {
      setIsGenerating(false);
    }
  }, [backgroundImage, markers, imageQuality]);

  const canGenerate = backgroundImage && markers.length > 0 && markers.every(m => m.personImage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Persona IMG</h1>
              <p className="text-xs text-muted-foreground">KI-Bildplatzierung</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quality Toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  imageQuality === '2K' 
                    ? 'bg-card shadow text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setImageQuality('2K')}
              >
                2K
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  imageQuality === '4K' 
                    ? 'bg-card shadow text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setImageQuality('4K')}
              >
                4K
              </button>
            </div>

            {backgroundImage && (
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Canvas Area (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload / Canvas */}
            <div className="relative">
              {!backgroundImage ? (
                <label className="block cursor-pointer">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="aspect-video bg-card rounded-2xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-4"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      <ImagePlus className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">Hintergrundbild hochladen</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Klicke oder ziehe ein Bild hierher
                      </p>
                    </div>
                  </motion.div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBackgroundUpload}
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium">Hintergrundbild</span>
                      <span className="text-xs text-muted-foreground">
                        • {markers.length} Markierung{markers.length !== 1 ? 'en' : ''}
                      </span>
                    </div>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <ImagePlus className="w-4 h-4 mr-2" />
                          Ändern
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleBackgroundUpload}
                      />
                    </label>
                  </div>

                  <ImageCanvas
                    backgroundImage={backgroundImage}
                    markers={markers}
                    onAddMarker={handleAddMarker}
                    onUpdateMarker={handleUpdateMarker}
                    onDeleteMarker={handleDeleteMarker}
                    selectedMarkerId={selectedMarkerId}
                    onSelectMarker={setSelectedMarkerId}
                  />

                  <p className="text-sm text-muted-foreground text-center">
                    💡 Zeichne Rechtecke auf dem Bild um Positionen für Personen zu markieren
                  </p>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4"
              >
                <p className="font-medium">Fehler</p>
                <p className="text-sm mt-1">{error}</p>
              </motion.div>
            )}

            {/* Generate Button */}
            {backgroundImage && (
              <Button
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 shadow-xl shadow-primary/25"
                disabled={!canGenerate || isGenerating}
                onClick={handleGenerate}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generiere...' : 'Bild generieren'}
              </Button>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6">
            <PersonUploader
              markers={markers}
              onAssignPerson={handleAssignPerson}
              onRemovePersonImage={handleRemovePersonImage}
            />

            {/* Instructions */}
            <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl p-6 border border-primary/20">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Settings2 className="w-5 h-5" />
                So funktioniert's
              </h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>Lade ein Hintergrundbild hoch (Wohnung, Landschaft, etc.)</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>Zeichne Rechtecke wo Personen erscheinen sollen</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>Lade für jede Position ein Personenfoto hoch</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>Klicke auf "Bild generieren" und warte auf das Ergebnis</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Result Viewer */}
      {showResult && (
        <ResultViewer
          imageBase64={result?.imageBase64 || null}
          mimeType={result?.mimeType || 'image/png'}
          isLoading={isGenerating}
          onClose={() => setShowResult(false)}
          onRegenerate={handleGenerate}
        />
      )}
    </div>
  );
}

