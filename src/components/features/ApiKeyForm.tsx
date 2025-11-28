import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useApiKeysStore } from '../../stores/useApiKeysStore';
import type { Provider } from '../../types';

interface ApiKeyFormProps {
  provider: Provider;
  providerName: string;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ provider, providerName }) => {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { keys, setApiKey, validateApiKey, loadApiKey } = useApiKeysStore();

  React.useEffect(() => {
    loadApiKey(provider);
  }, [provider]);

  React.useEffect(() => {
    if (keys[provider]) {
      setKey(keys[provider] || '');
    }
  }, [keys, provider]);

  const handleSave = async () => {
    if (!key.trim()) {
      setError('API-Key darf nicht leer sein');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validieren
      const isValid = await validateApiKey(provider, key);
      if (!isValid) {
        setError('API-Key ist ungültig');
        setLoading(false);
        return;
      }

      // Speichern
      await setApiKey(provider, key);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  const status = keys[provider] ? '✓ Konfiguriert' : '○ Nicht konfiguriert';

  return (
    <Card title={providerName}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Status: {status}</span>
        </div>
        <Input
          type="password"
          label="API-Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={`${providerName} API-Key eingeben...`}
          error={error}
        />
        <Button
          onClick={handleSave}
          disabled={loading || !key.trim()}
          className="w-full"
        >
          {loading ? 'Speichern...' : 'Speichern & Validieren'}
        </Button>
      </div>
    </Card>
  );
};

