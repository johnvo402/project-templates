const API_BASE = '/api';
export const API_ROUTES = {
  auth: { login:`${API_BASE}/auth/login`, register:`${API_BASE}/auth/register`, refresh:`${API_BASE}/auth/refresh`, logout:`${API_BASE}/auth/logout`, me:`${API_BASE}/auth/me` },
  profile: { root:`${API_BASE}/profile`, avatar:`${API_BASE}/profile/avatar` },
  todos: { root:`${API_BASE}/todos`, complete:(id:string)=>`${API_BASE}/todos/${id}/complete` },
  users: { root:`${API_BASE}/users`, role:(id:string)=>`${API_BASE}/users/${id}/role` },
  ai: { generate:`${API_BASE}/ai/generate` },
} as const;
