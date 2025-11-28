import { create } from 'zustand';
import type { Provider, ApiKeyStatus } from '../types';

interface ApiKeysStore {
  keys: Record<Provider, string | null>;
  statuses: Record<Provider, ApiKeyStatus>;
  loading: boolean;
  loadApiKey: (provider: Provider) => Promise<void>;
  setApiKey: (provider: Provider, key: string) => Promise<void>;
  validateApiKey: (provider: Provider, key: string) => Promise<boolean>;
  checkStatus: (provider: Provider) => Promise<void>;
}

export const useApiKeysStore = create<ApiKeysStore>((set, get) => ({
  keys: {
    openai: null,
    anthropic: null,
    grok: null,
    gemini: null,
  },
  statuses: {
    openai: { provider: 'openai', isValid: false, isConfigured: false },
    anthropic: { provider: 'anthropic', isValid: false, isConfigured: false },
    grok: { provider: 'grok', isValid: false, isConfigured: false },
    gemini: { provider: 'gemini', isValid: false, isConfigured: false },
  },
  loading: false,
  
  loadApiKey: async (provider: Provider) => {
    try {
      const key = await window.mrp.getApiKey(provider);
      set((state) => ({
        keys: { ...state.keys, [provider]: key },
        statuses: {
          ...state.statuses,
          [provider]: {
            provider,
            isValid: !!key,
            isConfigured: !!key,
          },
        },
      }));
    } catch (error) {
      console.error(`Failed to load API key for ${provider}:`, error);
    }
  },
  
  setApiKey: async (provider: Provider, key: string) => {
    try {
      await window.mrp.setApiKey(provider, key);
      set((state) => ({
        keys: { ...state.keys, [provider]: key },
        statuses: {
          ...state.statuses,
          [provider]: {
            provider,
            isValid: true,
            isConfigured: true,
          },
        },
      }));
    } catch (error) {
      console.error(`Failed to set API key for ${provider}:`, error);
      throw error;
    }
  },
  
  validateApiKey: async (provider: Provider, key: string) => {
    try {
      const isValid = await window.mrp.validateApiKey(provider, key);
      set((state) => ({
        statuses: {
          ...state.statuses,
          [provider]: {
            ...state.statuses[provider],
            isValid,
          },
        },
      }));
      return isValid;
    } catch (error) {
      console.error(`Failed to validate API key for ${provider}:`, error);
      return false;
    }
  },
  
  checkStatus: async (provider: Provider) => {
    const key = get().keys[provider];
    if (key) {
      await get().validateApiKey(provider, key);
    }
  },
}));

