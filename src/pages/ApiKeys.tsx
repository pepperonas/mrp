import React from 'react';
import { ApiKeyForm } from '../components/features/ApiKeyForm';
import { Tabs } from '../components/ui/Tabs';
import type { Provider } from '../types';

const ApiKeys: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<Provider>('openai');

  const tabs = [
    { id: 'openai', label: 'OpenAI' },
    { id: 'anthropic', label: 'Claude' },
    { id: 'grok', label: 'Grok' },
    { id: 'gemini', label: 'Gemini' },
  ];

  const providerNames: Record<Provider, string> = {
    openai: 'OpenAI (GPT-4o, GPT-4-Turbo)',
    anthropic: 'Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)',
    grok: 'xAI (Grok-2)',
    gemini: 'Google (Gemini 1.5 Pro, Gemini 1.5 Flash)',
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">API-Key-Verwaltung</h2>
        <p className="text-text-secondary">
          Konfiguriere deine API-Keys für die verschiedenen Anbieter. Die Keys werden verschlüsselt gespeichert.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as Provider)} />

      <ApiKeyForm provider={activeTab} providerName={providerNames[activeTab]} />
    </div>
  );
};

export default ApiKeys;

