'use client';

/**
 * ResultViewer Component
 * 
 * Zeigt das generierte Bild an mit Download-Option
 */

import { motion } from 'framer-motion';
import { Download, RefreshCw, Share2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultViewerProps {
  imageBase64: string | null;
  mimeType: string;
  isLoading: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

export function ResultViewer({
  imageBase64,
  mimeType,
  isLoading,
  onClose,
  onRegenerate
}: ResultViewerProps) {
  const handleDownload = () => {
    if (!imageBase64) return;
    
    const link = document.createElement('a');
    link.href = `data:${mimeType};base64,${imageBase64}`;
    link.download = `persona-img-${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!imageBase64) return;
    
    try {
      const response = await fetch(`data:${mimeType};base64,${imageBase64}`);
      const blob = await response.blob();
      const file = new File([blob], 'persona-img.png', { type: mimeType });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Persona IMG',
          text: 'Erstellt mit Persona IMG'
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <div className="bg-card rounded-2xl p-8 max-w-md mx-4 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">KI generiert dein Bild...</h3>
          <p className="text-muted-foreground">
            Das kann 10-30 Sekunden dauern.<br />
            Bitte warte einen Moment.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!imageBase64) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-card rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Ergebnis</h3>
              <p className="text-sm text-muted-foreground">KI-generiertes Bild</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto p-4 bg-muted/50">
          <img
            src={`data:${mimeType};base64,${imageBase64}`}
            alt="Generated result"
            className="w-full h-auto rounded-xl shadow-2xl"
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex flex-wrap gap-3 justify-between">
          <Button variant="outline" onClick={onRegenerate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Neu generieren
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Teilen
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Herunterladen
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

