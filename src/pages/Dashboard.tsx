import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useApiKeysStore } from '../stores/useApiKeysStore';
import { useMetapromptsStore } from '../stores/useMetapromptsStore';
import type { Provider } from '../types';

const Dashboard: React.FC = () => {
  const { settings, loadSettings } = useSettingsStore();
  const { keys, statuses, loadApiKey, checkStatus } = useApiKeysStore();
  const { metaprompts, loadMetaprompts } = useMetapromptsStore();

  useEffect(() => {
    loadSettings();
    loadMetaprompts();
    
    // Lade alle API-Keys und prüfe deren Status
    (['openai', 'anthropic', 'grok', 'gemini'] as const).forEach(async (provider) => {
      await loadApiKey(provider);
      // Prüfe Status wenn Key vorhanden
      if (keys[provider]) {
        await checkStatus(provider);
      }
    });
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

  const handleProviderChange = async (provider: Provider) => {
    await useSettingsStore.getState().updateSettings({ activeProvider: provider });
  };

  const providerNames: Record<Provider, string> = {
    openai: 'OpenAI',
    anthropic: 'Claude',
    grok: 'Grok',
    gemini: 'Gemini',
  };

  return (
    <div className="p-6 space-y-6">
      <Card title="Aktive Metaprompt-Vorlage">
        {activeMetaprompt ? (
          <div>
            <h4 className="font-semibold text-text-primary mb-2">{activeMetaprompt.name}</h4>
            {activeMetaprompt.description && (
              <p className="text-sm text-text-secondary mb-2">{activeMetaprompt.description}</p>
            )}
            <p className="text-xs text-text-secondary mt-2">
              Diese Vorlage wird verwendet, um deine Prompts zu optimieren.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-text-secondary mb-2">Kein Metaprompt aktiviert</p>
            <p className="text-xs text-text-secondary">
              Gehe zu "Metaprompts", um eine Vorlage zu aktivieren.
            </p>
          </div>
        )}
      </Card>

      <Card title="Provider-Status & Auswahl">
        <div className="space-y-3">
          <p className="text-sm text-text-secondary mb-4">
            Wähle einen aktiven Provider. Nur Provider mit gültigem API-Key können ausgewählt werden.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(statuses).map(([provider, status]) => {
              const providerId = provider as Provider;
              const isValid = status.isValid;
              const isActive = settings?.activeProvider === providerId;
              const isClickable = isValid;

              return (
                <button
                  key={provider}
                  onClick={() => isClickable && handleProviderChange(providerId)}
                  disabled={!isClickable}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isActive && isValid
                      ? 'border-brand bg-brand bg-opacity-10 glow-brand'
                      : isValid
                      ? 'border-bg-secondary hover:border-brand hover:bg-opacity-5 cursor-pointer'
                      : 'border-bg-secondary opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isValid 
                          ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                          : status.isConfigured 
                          ? 'bg-red-500' 
                          : 'bg-gray-500'
                      }`}></div>
                      <span className="font-medium text-text-primary">{providerNames[providerId]}</span>
                    </div>
                    {isActive && isValid && (
                      <span className="text-brand text-lg">●</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${
                      isValid 
                        ? 'text-green-400' 
                        : status.isConfigured 
                        ? 'text-red-400' 
                        : 'text-text-secondary'
                    }`}>
                      {isValid ? 'Gültig' : status.isConfigured ? 'Ungültig' : 'Nicht konfiguriert'}
                    </span>
                    {isActive && (
                      <span className="text-xs text-brand font-medium">Aktiv</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card title="Quick Actions">
        <div className="space-y-4">
          <Button onClick={handleOptimize} className="w-full" size="lg">
            Prompt jetzt optimieren
          </Button>
          <p className="text-sm text-text-secondary">
            Kopiere einen normalen Prompt in die Zwischenablage und klicke auf den Button, oder verwende den Shortcut: {settings?.globalShortcut}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            Der aktive Metaprompt wird verwendet, um deinen Prompt zu optimieren.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

