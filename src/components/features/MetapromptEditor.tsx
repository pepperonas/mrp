import React, { useState, useEffect } from 'react';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Metaprompt } from '../../types';

interface MetapromptEditorProps {
  metaprompt?: Metaprompt;
  onSave: (mp: Metaprompt) => Promise<void>;
  onCancel: () => void;
}

export const MetapromptEditor: React.FC<MetapromptEditorProps> = ({
  metaprompt,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (metaprompt) {
      setName(metaprompt.name);
      setDescription(metaprompt.description || '');
      setContent(metaprompt.content);
      setIsDefault(metaprompt.isDefault);
    }
  }, [metaprompt]);

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      return;
    }

    setLoading(true);
    try {
      // Stelle sicher, dass der Standard-Metaprompt immer isDefault bleibt
      const finalIsDefault = metaprompt?.isDefault ? true : isDefault;
      
      const mp: Metaprompt = {
        id: metaprompt?.id || '', // Wird in der Page-Komponente gesetzt wenn leer
        name: name.trim(),
        description: description.trim() || undefined,
        content: content.trim(),
        isDefault: finalIsDefault,
        createdAt: metaprompt?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      await onSave(mp);
    } catch (error) {
      console.error('Failed to save metaprompt:', error);
      alert('Fehler beim Speichern des Metaprompts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Metaprompt-Name..."
        />
        <Input
          label="Beschreibung (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kurze Beschreibung..."
        />
        <Textarea
          label="Inhalt"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Metaprompt-Inhalt... (Verwende {user_prompt} als Platzhalter)"
          rows={12}
          className="font-mono text-sm"
        />
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            disabled={metaprompt?.isDefault}
            className="w-4 h-4 text-brand bg-bg-secondary border-bg-primary rounded focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <label htmlFor="isDefault" className={`ml-2 text-sm ${metaprompt?.isDefault ? 'text-text-secondary opacity-50' : 'text-text-secondary'}`}>
            Als Standard markieren
            {metaprompt?.isDefault && ' (Standard-Metaprompt ist immer Standard)'}
          </label>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSave} disabled={loading || !name.trim() || !content.trim()}>
            {loading ? 'Speichern...' : 'Speichern'}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </div>
    </Card>
  );
};

