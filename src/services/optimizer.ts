import type { OptimizationRequest } from '../types';
import { optimizeOpenAI } from './api/openai';
import { optimizeAnthropic } from './api/anthropic';
import { optimizeGrok } from './api/grok';
import { optimizeGemini } from './api/gemini';

export const optimize = async (request: OptimizationRequest, apiKey: string): Promise<string> => {
  switch (request.provider) {
    case 'openai':
      return optimizeOpenAI(request.metaprompt, apiKey, request.model, request.maxTokens, request.temperature);
    case 'anthropic':
      return optimizeAnthropic(request.metaprompt, apiKey, request.model, request.maxTokens, request.temperature);
    case 'grok':
      return optimizeGrok(request.metaprompt, apiKey, request.model, request.maxTokens, request.temperature);
    case 'gemini':
      return optimizeGemini(request.metaprompt, apiKey, request.model, request.maxTokens, request.temperature);
    default:
      throw new Error(`Unbekannter Provider: ${request.provider}`);
  }
};

