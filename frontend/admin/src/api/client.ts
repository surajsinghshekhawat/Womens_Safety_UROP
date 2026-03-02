const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/';
    throw new Error('Unauthorized');
  }
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data as T;
}

export const admin = {
  dashboard: () => api<{ dashboard: any }>('/admin/dashboard'),
  incidents: (params?: { status?: string; type?: string; limit?: number; offset?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.offset) q.set('offset', String(params.offset));
    return api<{ incidents: any[]; pagination: any }>(`/admin/incidents?${q}`);
  },
  verify: (incidentId: string, reason?: string) =>
    api<{ success: boolean }>(`/admin/incidents/${incidentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  reject: (incidentId: string, reason?: string) =>
    api<{ success: boolean }>(`/admin/incidents/${incidentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  heatmap: (lat: number, lng: number, radius?: number, grid_size?: number) => {
    const q = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (radius) q.set('radius', String(radius));
    if (grid_size) q.set('grid_size', String(grid_size));
    return api<{ heatmap: any }>(`/admin/heatmap?${q}`);
  },
  analytics: (period?: string) =>
    api<{ analytics: any }>(`/admin/analytics?period=${period || '7d'}`),
  audit: () => api<{ audit: any[] }>('/admin/audit'),
};
