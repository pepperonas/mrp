import React from 'react';
import { Card } from '../ui/Card';
import { useSettingsStore } from '../../stores/useSettingsStore';
import type { Provider } from '../../types';

const providers: { id: Provider; name: string }[] = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Claude' },
  { id: 'grok', name: 'Grok' },
  { id: 'gemini', name: 'Gemini' },
];

export const ProviderSelector: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();

  const handleProviderChange = async (provider: Provider) => {
    await updateSettings({ activeProvider: provider });
  };

  if (!settings) return null;

  return (
    <Card title="Aktiver Anbieter">
      <div className="grid grid-cols-2 gap-4">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderChange(provider.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.activeProvider === provider.id
                ? 'border-brand bg-brand bg-opacity-10 glow-brand'
                : 'border-bg-primary hover:border-brand hover:bg-opacity-5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{provider.name}</span>
              {settings.activeProvider === provider.id && (
                <span className="text-brand">●</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

