import { create } from 'zustand';
import type { Metaprompt } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface MetapromptsStore {
  metaprompts: Metaprompt[];
  loading: boolean;
  loadMetaprompts: () => Promise<void>;
  saveMetaprompt: (mp: Metaprompt) => Promise<void>;
  deleteMetaprompt: (id: string) => Promise<void>;
  createMetaprompt: (name: string, content: string, description?: string) => Promise<Metaprompt>;
  setDefault: (id: string) => Promise<void>;
}

export const useMetapromptsStore = create<MetapromptsStore>((set, get) => ({
  metaprompts: [],
  loading: false,
  
  loadMetaprompts: async () => {
    set({ loading: true });
    try {
      const metaprompts = await window.mrp.getMetaprompts();
      set({ metaprompts, loading: false });
    } catch (error) {
      console.error('Failed to load metaprompts:', error);
      set({ loading: false });
    }
  },
  
  saveMetaprompt: async (mp: Metaprompt) => {
    try {
      await window.mrp.saveMetaprompt(mp);
      const metaprompts = get().metaprompts;
      const index = metaprompts.findIndex(m => m.id === mp.id);
      
      if (index >= 0) {
        set({
          metaprompts: metaprompts.map(m => m.id === mp.id ? mp : m),
        });
      } else {
        set({ metaprompts: [...metaprompts, mp] });
      }
    } catch (error) {
      console.error('Failed to save metaprompt:', error);
      throw error;
    }
  },
  
  deleteMetaprompt: async (id: string) => {
    try {
      await window.mrp.deleteMetaprompt(id);
      set((state) => ({
        metaprompts: state.metaprompts.filter(m => m.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete metaprompt:', error);
      throw error;
    }
  },
  
  createMetaprompt: async (name: string, content: string, description?: string) => {
    const newMetaprompt: Metaprompt = {
      id: uuidv4(),
      name,
      content,
      description,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await get().saveMetaprompt(newMetaprompt);
    return newMetaprompt;
  },
  
  setDefault: async (id: string) => {
    const metaprompts = get().metaprompts;
    
    // Stelle sicher, dass der Standard-Metaprompt immer existiert
    const currentDefault = metaprompts.find(m => m.isDefault);
    const newDefault = metaprompts.find(m => m.id === id);
    
    if (!newDefault) {
      throw new Error('Metaprompt nicht gefunden');
    }
    
    // Wenn ein anderer Metaprompt als Standard gesetzt wird, behalte den alten Standard
    // aber entferne das isDefault-Flag von anderen
    const updated = metaprompts.map(m => ({
      ...m,
      isDefault: m.id === id,
      updatedAt: m.id === id ? new Date() : m.updatedAt,
    }));
    
    // Stelle sicher, dass mindestens ein Metaprompt als Standard markiert ist
    const hasDefault = updated.some(m => m.isDefault);
    if (!hasDefault && currentDefault) {
      // Falls kein Standard mehr existiert, behalte den aktuellen Standard
      updated.forEach(m => {
        if (m.id === currentDefault.id) {
          m.isDefault = true;
        }
      });
    }
    
    for (const mp of updated) {
      await get().saveMetaprompt(mp);
    }
    
    set({ metaprompts: updated });
  },
}));

