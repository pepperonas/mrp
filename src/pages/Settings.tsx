import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useSettingsStore } from '../stores/useSettingsStore';

const Settings: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const [localSettings, setLocalSettings] = React.useState(settings);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!localSettings) {
    return (
      <div className="p-6">
        <p className="text-text-secondary">Lade Einstellungen...</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (localSettings) {
      await updateSettings(localSettings);
    }
  };

  const handleChange = (key: keyof typeof localSettings, value: any) => {
    if (localSettings) {
      setLocalSettings({ ...localSettings, [key]: value });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Einstellungen</h2>
        <p className="text-text-secondary">
          Konfiguriere das Verhalten der Anwendung
        </p>
      </div>

      <Card title="Allgemein">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">Beim Start minimieren</label>
              <p className="text-xs text-text-secondary">App startet im System Tray</p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.minimizeToTray}
              onChange={(e) => handleChange('minimizeToTray', e.target.checked)}
              className="w-4 h-4 text-brand bg-bg-secondary border-bg-primary rounded focus:ring-brand"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary">Benachrichtigungen anzeigen</label>
              <p className="text-xs text-text-secondary">System-Benachrichtigungen bei Optimierungen</p>
            </div>
            <input
              type="checkbox"
              checked={localSettings.showNotifications}
              onChange={(e) => handleChange('showNotifications', e.target.checked)}
              className="w-4 h-4 text-brand bg-bg-secondary border-bg-primary rounded focus:ring-brand"
            />
          </div>
        </div>
      </Card>

      <Card title="Shortcut">
        <div className="space-y-4">
          <Input
            label="Globaler Shortcut"
            value={localSettings.globalShortcut}
            onChange={(e) => handleChange('globalShortcut', e.target.value)}
            placeholder="CommandOrControl+Shift+M"
          />
          <p className="text-xs text-text-secondary">
            Format: CommandOrControl+Shift+M (für macOS/Windows kompatibel)
          </p>
        </div>
      </Card>

      <Card title="API-Verhalten">
        <div className="space-y-4">
          <Input
            type="number"
            label="Max Tokens"
            value={localSettings.maxTokens}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value) || 2048)}
            min={1}
            max={4096}
          />
          <Input
            type="number"
            label="Temperature"
            value={localSettings.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value) || 0.7)}
            min={0}
            max={1}
            step={0.1}
          />
        </div>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Einstellungen speichern
      </Button>
    </div>
  );
};

export default Settings;

