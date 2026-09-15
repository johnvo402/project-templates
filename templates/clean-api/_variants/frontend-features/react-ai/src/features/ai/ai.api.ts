import { API_ROUTES } from '../../core/api/api-routes';
import type { ApiResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';

export type GenerateAiResponse = { text: string };

export async function generateText(prompt: string): Promise<string> {
  const response = await customFetch<ApiResponse<GenerateAiResponse>>(API_ROUTES.ai.generate, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  return response.results.text;
}
