import { getSettings, getMetaprompts } from './store';
import { getApiKey } from './store';
import type { OptimizationRequest, Provider } from '../src/types';
import { optimizeOpenAI } from '../src/services/api/openai';
import { optimizeAnthropic } from '../src/services/api/anthropic';
import { optimizeGrok } from '../src/services/api/grok';
import { optimizeGemini } from '../src/services/api/gemini';

export interface OptimizationResult {
  success: boolean;
  optimizedPrompt?: string;
  error?: string;
}

export const optimizePrompt = async (request: OptimizationRequest): Promise<OptimizationResult> => {
  try {
    const settings = getSettings();
    const metaprompts = getMetaprompts();
    
    // Aktive Metaprompt-Vorlage laden und mit dem normalen Prompt kombinieren
    let metapromptContent = request.metaprompt;
    
    // Wenn metaprompt gleich userPrompt ist, handelt es sich um einen direkten Call (z.B. für Metaprompt-Generierung)
    if (metapromptContent === request.userPrompt) {
      // Direkter Prompt ohne Metaprompt-Vorlage verwenden
      metapromptContent = request.userPrompt;
    } else if (!metapromptContent) {
      const activeMetaprompt = metaprompts.find(m => m.id === settings.activeMetapromptId) ||
                               metaprompts.find(m => m.isDefault) ||
                               metaprompts[0];
      
      if (activeMetaprompt) {
        // Metaprompt-Vorlage verwenden: {user_prompt} wird durch den zu optimierenden Prompt ersetzt
        metapromptContent = activeMetaprompt.content.replace('{user_prompt}', request.userPrompt);
      } else {
        // Fallback auf Standard-Metaprompt-Vorlage
        metapromptContent = `Du bist ein Experte für Prompt Engineering. Deine Aufgabe ist es, den folgenden Prompt zu optimieren.

## Optimierungsrichtlinien:
1. Formuliere klar und präzise
2. Füge relevanten Kontext hinzu
3. Definiere das gewünschte Ausgabeformat
4. Entferne Mehrdeutigkeiten
5. Strukturiere komplexe Anfragen in Schritte

## Zu optimierender Prompt:
${request.userPrompt}

## Aufgabe:
Gib NUR den optimierten Prompt zurück, ohne Erklärungen oder Kommentare.`;
      }
    }

    const apiKey = getApiKey(request.provider);
    if (!apiKey) {
      return {
        success: false,
        error: `Kein API-Key für ${request.provider} konfiguriert`,
      };
    }

    // Je nach Provider die entsprechende API aufrufen
    let result: string;
    switch (request.provider) {
      case 'openai':
        result = await optimizeOpenAI(metapromptContent, apiKey, request.model, request.maxTokens, request.temperature);
        break;
      case 'anthropic':
        result = await optimizeAnthropic(metapromptContent, apiKey, request.model, request.maxTokens, request.temperature);
        break;
      case 'grok':
        result = await optimizeGrok(metapromptContent, apiKey, request.model, request.maxTokens, request.temperature);
        break;
      case 'gemini':
        result = await optimizeGemini(metapromptContent, apiKey, request.model, request.maxTokens, request.temperature);
        break;
      default:
        return {
          success: false,
          error: `Unbekannter Provider: ${request.provider}`,
        };
    }

    return {
      success: true,
      optimizedPrompt: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
    };
  }
};

