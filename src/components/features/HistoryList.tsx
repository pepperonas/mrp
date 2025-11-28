import React from 'react';
import { Card } from '../ui/Card';
import type { OptimizationHistory } from '../../types';

interface HistoryListProps {
  history: OptimizationHistory[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <Card>
        <p className="text-text-secondary text-center py-8">Keine Optimierungen vorhanden</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry) => (
        <Card key={entry.id}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {new Date(entry.timestamp).toLocaleString('de-DE')}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                entry.success ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
              }`}>
                {entry.success ? 'Erfolg' : 'Fehler'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">Original:</p>
              <p className="text-sm text-text-primary bg-bg-primary p-2 rounded">{entry.originalPrompt}</p>
            </div>
            {entry.success && entry.optimizedPrompt && (
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">Optimiert:</p>
                <p className="text-sm text-text-primary bg-bg-primary p-2 rounded">{entry.optimizedPrompt}</p>
              </div>
            )}
            {entry.error && (
              <div>
                <p className="text-sm font-medium text-red-400 mb-1">Fehler:</p>
                <p className="text-sm text-red-400 bg-red-500 bg-opacity-10 p-2 rounded">{entry.error}</p>
              </div>
            )}
            <div className="text-xs text-text-secondary">
              Provider: {entry.provider} | Modell: {entry.model}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

