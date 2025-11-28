import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MetapromptEditor } from '../components/features/MetapromptEditor';
import { useMetapromptsStore } from '../stores/useMetapromptsStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { v4 as uuidv4 } from 'uuid';
import type { Metaprompt } from '../types';

const Metaprompts: React.FC = () => {
  const { metaprompts, loadMetaprompts, saveMetaprompt, deleteMetaprompt, createMetaprompt, setDefault } = useMetapromptsStore();
  const { settings, updateSettings } = useSettingsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadMetaprompts();
  }, []);

  const editingMetaprompt = editingId ? metaprompts.find(m => m.id === editingId) : undefined;

  const handleSave = async (mp: Metaprompt) => {
    // Wenn neuer Metaprompt, ID generieren
    if (!mp.id) {
      mp.id = uuidv4();
      mp.createdAt = new Date();
    }
    mp.updatedAt = new Date();
    
    await saveMetaprompt(mp);
    if (mp.isDefault) {
      await setDefault(mp.id);
      await updateSettings({ activeMetapromptId: mp.id });
    }
    setShowEditor(false);
    setEditingId(null);
    await loadMetaprompts(); // Reload to get updated list
  };

  const handleCreate = () => {
    setEditingId(null);
    setShowEditor(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Metaprompt wirklich löschen?')) {
      await deleteMetaprompt(id);
    }
  };

  const handleSetActive = async (id: string) => {
    await setDefault(id);
    await updateSettings({ activeMetapromptId: id });
  };

  if (showEditor) {
    return (
      <div className="p-6">
        <MetapromptEditor
          metaprompt={editingMetaprompt}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingId(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Metaprompts</h2>
          <p className="text-text-secondary">
            Verwalte deine Metaprompts für die Prompt-Optimierung
          </p>
        </div>
        <Button onClick={handleCreate}>Neuer Metaprompt</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {metaprompts.length === 0 ? (
          <Card>
            <p className="text-text-secondary text-center py-8">Keine Metaprompts vorhanden</p>
          </Card>
        ) : (
          metaprompts.map((mp) => (
            <Card key={mp.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-text-primary">{mp.name}</h3>
                    {mp.isDefault && (
                      <span className="text-xs px-2 py-1 bg-brand bg-opacity-20 text-brand rounded">
                        Standard
                      </span>
                    )}
                    {settings?.activeMetapromptId === mp.id && (
                      <span className="text-xs px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded">
                        Aktiv
                      </span>
                    )}
                  </div>
                  {mp.description && (
                    <p className="text-sm text-text-secondary mb-2">{mp.description}</p>
                  )}
                  <p className="text-xs text-text-secondary">
                    Erstellt: {new Date(mp.createdAt).toLocaleDateString('de-DE')} | 
                    Aktualisiert: {new Date(mp.updatedAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetActive(mp.id)}
                    disabled={settings?.activeMetapromptId === mp.id}
                  >
                    Aktivieren
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(mp.id)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(mp.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Metaprompts;

