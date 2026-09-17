const API_BASE = '/api';

export const API_ROUTES = {
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    refresh: `${API_BASE}/auth/refresh`,
    logout: `${API_BASE}/auth/logout`,
    me: `${API_BASE}/auth/me`,
  },
  profile: {
    root: `${API_BASE}/profile`,
    avatar: `${API_BASE}/profile/avatar`,
  },
  dashboard: `${API_BASE}/dashboard`,
  products: { root: `${API_BASE}/products`, byId: (id: string) => `${API_BASE}/products/${id}` },
  orders: { root: `${API_BASE}/orders`, byId: (id: string) => `${API_BASE}/orders/${id}` },
  employees: { root: `${API_BASE}/employees`, byId: (id: string) => `${API_BASE}/employees/${id}` },
  reports: {
    revenue: `${API_BASE}/reports/revenue`,
    ordersByStatus: `${API_BASE}/reports/orders-by-status`,
    topProducts: `${API_BASE}/reports/top-products`,
  },
  settings: `${API_BASE}/settings`,
  ai: { generate: `${API_BASE}/ai/generate` },
} as const;
