import { getApiKey } from './store';
import type { Provider } from '../src/types';
import { optimizeAnthropic } from '../src/services/api/anthropic';
import { optimizeOpenAI } from '../src/services/api/openai';
import { optimizeGrok } from '../src/services/api/grok';
import { optimizeGemini } from '../src/services/api/gemini';
import type { ApiResponse } from '../src/services/api/openai';

export const validateApiKeyDirect = async (provider: Provider, apiKey: string): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Minimaler Test-Request je nach Provider
    let result: ApiResponse;
    
    switch (provider) {
      case 'anthropic': {
        // Für Anthropic: Versuche mit verschiedenen Modellen
        const models = ['claude-3-5-sonnet-20241022', 'claude-3-5-sonnet-20240229', 'claude-3-opus-20240229'];
        let lastError: Error | null = null;
        
        for (const model of models) {
          try {
            result = await optimizeAnthropic('Hi', apiKey.trim(), model, 10, 0.1);
            return { valid: true };
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            // Wenn es ein Authentifizierungsfehler ist, breche ab
            if (error instanceof Error && (error.message.includes('401') || error.message.includes('authentication') || error.message.includes('invalid'))) {
              break;
            }
            // Bei anderen Fehlern, versuche nächstes Modell
            continue;
          }
        }
        
        if (lastError) {
          return { valid: false, error: lastError.message };
        }
        return { valid: false, error: 'Kein Modell funktionierte' };
      }
      
      case 'openai': {
        result = await optimizeOpenAI('Hi', apiKey.trim(), 'gpt-3.5-turbo', 10, 0.1);
        return { valid: true };
      }
      
      case 'grok': {
        result = await optimizeGrok('Hi', apiKey.trim(), 'grok-beta', 10, 0.1);
        return { valid: true };
      }
      
      case 'gemini': {
        result = await optimizeGemini('Hi', apiKey.trim(), 'gemini-pro', 10, 0.1);
        return { valid: true };
      }
      
      default:
        return { valid: false, error: 'Unbekannter Provider' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return { valid: false, error: errorMessage };
  }
};

