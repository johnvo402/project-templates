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

function toError(value: unknown): Error {
  const problem = value as ProblemDetails | undefined;
  return new Error(problem?.title ?? problem?.detail ?? 'Business AI request failed.');
}

export async function getBusinessChatHistory(): Promise<BusinessChatMessage[]> {
  try {
    const response = await customFetch<ApiResponse<BusinessChatMessage[]>>(API_ROUTES.ai.businessChatHistory);
    return response.results;
  } catch (value) {
    throw toError(value);
  }
}

export async function askBusinessQuestion(question: string): Promise<BusinessChatResponse> {
  try {
    const response = await customFetch<ApiResponse<BusinessChatResponse>>(API_ROUTES.ai.businessChat, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    return response.results;
  } catch (value) {
    throw toError(value);
  }
}
