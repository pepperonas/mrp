import { create } from 'zustand';
import type { Settings } from '../types';

interface SettingsStore {
  settings: Settings | null;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  
  loadSettings: async () => {
    set({ loading: true });
    try {
      const settings = await window.mrp.getSettings();
      set({ settings, loading: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ loading: false });
    }
  },
  
  updateSettings: async (updates: Partial<Settings>) => {
    try {
      await window.mrp.setSettings(updates);
      const current = get().settings;
      if (current) {
        set({ settings: { ...current, ...updates } });
      } else {
        await get().loadSettings();
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
}));

