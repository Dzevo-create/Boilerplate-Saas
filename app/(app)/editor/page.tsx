/**
 * Editor Page
 * 
 * Hauptseite für den Persona IMG Editor
 */

import { PersonaEditor } from '@/components/editor';

export const metadata = {
  title: 'Editor | Persona IMG',
  description: 'Platziere Personen in Bildern mit KI'
};

export default function EditorPage() {
  return <PersonaEditor />;
}

