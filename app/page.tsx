/**
 * Persona IMG - Landing Page
 * 
 * Hauptseite für die KI-Bildplatzierungs-Plattform
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Sparkles, 
  ImagePlus, 
  Users, 
  Wand2, 
  ArrowRight,
  Check,
  Zap,
  Shield,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';

const features = [
  {
    icon: ImagePlus,
    title: 'Hintergrundbild hochladen',
    description: 'Lade ein beliebiges Bild hoch - Wohnung, Landschaft, Büro oder jede andere Szene.'
  },
  {
    icon: Users,
    title: 'Mehrere Personen',
    description: 'Platziere bis zu 5 Personen gleichzeitig an verschiedenen Positionen im Bild.'
  },
  {
    icon: Wand2,
    title: 'KI-Generierung',
    description: 'Gemini 3 Pro integriert die Personen nahtlos und photorealistisch ins Bild.'
  },
  {
    icon: Shield,
    title: 'Gesichtstreue',
    description: 'Spezielle Face-Preservation-Technologie erhält die originalen Gesichtszüge.'
  }
];

const steps = [
  { number: '1', title: 'Hintergrund wählen', description: 'Lade dein Wunschbild hoch' },
  { number: '2', title: 'Positionen markieren', description: 'Zeichne Bereiche für Personen' },
  { number: '3', title: 'Fotos hochladen', description: 'Lade Bilder der Personen hoch' },
  { number: '4', title: 'Generieren', description: 'KI erstellt das finale Bild' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Persona IMG</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/editor">
              <Button variant="outline" className="border-white/20 hover:bg-white/10">
                Zum Editor
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8"
            >
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">Powered by Gemini 3 Pro</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Platziere{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 text-transparent bg-clip-text">
                dich selbst
              </span>
              <br />
              in jedes Bild
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Mit KI-Technologie kannst du Personen photorealistisch in beliebige Szenen einfügen. 
              Markiere einfach die Position und lade ein Foto hoch.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/editor">
                <Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-xl shadow-purple-500/30">
                  Jetzt starten
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/10">
                Demo ansehen
              </Button>
            </div>
          </motion.div>

          {/* Preview Image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 max-w-5xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/20">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <Layers className="w-12 h-12 text-purple-400" />
                  </div>
                  <p className="text-white/40 text-lg">Editor Preview</p>
                  <p className="text-white/20 text-sm mt-2">Interaktiver Canvas mit Markierungsfunktion</p>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-sm">
                🖼️ Hintergrund
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-purple-500/50 backdrop-blur-sm border border-white/10 text-sm">
                👤 Person 1
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-pink-500/50 backdrop-blur-sm border border-white/10 text-sm">
                👤 Person 2
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Leistungsstarke Features</h2>
            <p className="text-xl text-white/60">Alles was du brauchst für perfekte Bildkompositionen</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">So funktioniert's</h2>
            <p className="text-xl text-white/60">In nur 4 einfachen Schritten zum fertigen Bild</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg shadow-purple-500/30">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent -z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 border-t border-white/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10"
          >
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bereit für dein erstes KI-Bild?
            </h2>
            <p className="text-xl text-white/60 mb-8">
              Starte jetzt kostenlos und platziere dich in jede Szene deiner Wahl.
            </p>
            <Link href="/editor">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-slate-900 hover:bg-white/90 shadow-xl">
                Zum Editor
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-white/40 text-sm">
          <p>© 2025 Persona IMG. Powered by Gemini 3 Pro.</p>
        </div>
      </footer>
    </div>
  );
}
