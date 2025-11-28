import React, { useEffect } from 'react';
import { ProviderSelector } from '../components/features/ProviderSelector';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useApiKeysStore } from '../stores/useApiKeysStore';
import { useMetapromptsStore } from '../stores/useMetapromptsStore';

const Dashboard: React.FC = () => {
  const { settings, loadSettings } = useSettingsStore();
  const { keys, statuses } = useApiKeysStore();
  const { metaprompts, loadMetaprompts } = useMetapromptsStore();

  useEffect(() => {
    loadSettings();
    loadMetaprompts();
  }, []);

  const activeMetaprompt = metaprompts.find(m => m.id === settings?.activeMetapromptId) ||
                           metaprompts.find(m => m.isDefault) ||
                           metaprompts[0];

  const handleOptimize = async () => {
    try {
      const clipboardText = await window.mrp.readClipboard();
      if (!clipboardText || clipboardText.trim().length === 0) {
        alert('Zwischenablage ist leer');
        return;
      }

      if (!settings) return;

      const result = await window.mrp.optimize({
        userPrompt: clipboardText,
        metaprompt: activeMetaprompt?.content || '',
        provider: settings.activeProvider,
        model: settings.defaultModel[settings.activeProvider],
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
      });

      if (result.success && result.optimizedPrompt) {
        await window.mrp.writeClipboard(result.optimizedPrompt);
        alert('Prompt erfolgreich optimiert und in Zwischenablage kopiert!');
      } else {
        alert(`Fehler: ${result.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      alert(`Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProviderSelector />
        
        <Card title="Aktiver Metaprompt">
          {activeMetaprompt ? (
            <div>
              <h4 className="font-semibold text-text-primary mb-2">{activeMetaprompt.name}</h4>
              {activeMetaprompt.description && (
                <p className="text-sm text-text-secondary mb-2">{activeMetaprompt.description}</p>
              )}
            </div>
          ) : (
            <p className="text-text-secondary">Kein Metaprompt ausgewählt</p>
          )}
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="space-y-4">
          <Button onClick={handleOptimize} className="w-full" size="lg">
            Prompt jetzt optimieren
          </Button>
          <p className="text-sm text-text-secondary">
            Kopiere einen Text in die Zwischenablage und klicke auf den Button, oder verwende den Shortcut: {settings?.globalShortcut}
          </p>
        </div>
      </Card>

      <Card title="Provider-Status">
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(statuses).map(([provider, status]) => (
            <div key={provider} className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
              <span className="font-medium capitalize">{provider}</span>
              <span className={`text-sm ${
                status.isValid ? 'text-green-400' : status.isConfigured ? 'text-red-400' : 'text-text-secondary'
              }`}>
                {status.isValid ? '✓' : status.isConfigured ? '✗' : '○'}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

