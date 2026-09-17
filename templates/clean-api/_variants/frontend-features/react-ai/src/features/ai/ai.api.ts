import { API_ROUTES } from '../../core/api/api-routes';
import type { ApiResponse } from '../../core/api/api-types';
import { customFetch } from '../../core/api/custom-fetch';

export type BusinessChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type BusinessChatResponse = {
  answer: string;
  topic: string;
  suggestedQuestions: string[];
};

type ProblemDetails = {
  title?: string;
  detail?: string;
  errorCode?: string;
};

export async function askBusinessQuestion(
  question: string,
  history: BusinessChatMessage[],
): Promise<BusinessChatResponse> {
  try {
    const response = await customFetch<ApiResponse<BusinessChatResponse>>(API_ROUTES.ai.businessChat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
    });
    return response.results;
  } catch (value) {
    const problem = value as ProblemDetails | undefined;
    throw new Error(problem?.title ?? problem?.detail ?? 'Business AI request failed.');
  }
}
