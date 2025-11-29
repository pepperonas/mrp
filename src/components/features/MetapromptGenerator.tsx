import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useApiKeysStore } from '../../stores/useApiKeysStore';

interface MetapromptGeneratorProps {
  onGenerated: (name: string, description: string, content: string) => void;
  onCancel: () => void;
}

export const MetapromptGenerator: React.FC<MetapromptGeneratorProps> = ({
  onGenerated,
  onCancel,
}) => {
  const [useCase, setUseCase] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const { settings } = useSettingsStore();
  const { keys } = useApiKeysStore();

  const generateMetaprompt = async () => {
    if (!useCase.trim()) {
      alert('Bitte gib einen Anwendungsfall ein');
      return;
    }

    if (!settings) {
      alert('Einstellungen nicht geladen');
      return;
    }

    const apiKey = keys[settings.activeProvider];
    if (!apiKey) {
      alert(`Kein API-Key für ${settings.activeProvider} konfiguriert`);
      return;
    }

    setLoading(true);

    try {
      const prompt = `Erstelle einen Metaprompt (eine Vorlage für Prompt-Optimierung) für folgenden Anwendungsfall:

**Anwendungsfall:** ${useCase}
${requirements ? `\n**Anforderungen:** ${requirements}` : ''}

Der Metaprompt soll:
1. Klar definieren, wie Prompts für diesen Anwendungsfall optimiert werden sollen
2. Den Platzhalter {user_prompt} enthalten, wo der zu optimierende Prompt eingefügt wird
3. Spezifische Anweisungen geben, wie der Prompt verbessert werden soll
4. Am Ende anweisen, NUR den optimierten Prompt zurückzugeben, ohne Erklärungen

Gib den Metaprompt direkt zurück, ohne zusätzliche Erklärungen.`;

      // Direkter API-Call - verwende den Prompt direkt ohne Metaprompt-Vorlage
      const result = await window.mrp.optimize({
        userPrompt: prompt,
        metaprompt: prompt, // Gleicher Wert wie userPrompt signalisiert direkten Call
        provider: settings.activeProvider,
        model: settings.defaultModel[settings.activeProvider],
        maxTokens: 1500,
        temperature: 0.7,
      });

      if (result.success && result.optimizedPrompt) {
        const generatedContent = result.optimizedPrompt;
        const name = useCase.trim();
        const description = requirements.trim() || `KI-generierter Metaprompt für: ${useCase}`;
        
        onGenerated(name, description, generatedContent);
      } else {
        alert(`Fehler beim Generieren: ${result.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      alert(`Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Metaprompt mit KI generieren">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Beschreibe den Anwendungsfall, für den ein Metaprompt erstellt werden soll. 
          Die KI wird eine passende Vorlage für die Prompt-Optimierung generieren.
        </p>
        
        <Input
          label="Anwendungsfall"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="z.B. Code-Generierung, Kreatives Schreiben, Datenanalyse..."
        />
        
        <Textarea
          label="Anforderungen (optional)"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Spezifische Anforderungen oder Wünsche für den Metaprompt..."
          rows={4}
        />
        
        <div className="flex space-x-2">
          <Button
            onClick={generateMetaprompt}
            disabled={loading || !useCase.trim()}
            className="flex-1"
          >
            {loading ? 'Generiere...' : 'Metaprompt generieren'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </div>
    </Card>
  );
};

